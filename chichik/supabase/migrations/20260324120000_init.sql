-- Чичик MVP: profiles, content, progress, RLS

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'student' check (role in ('student', 'admin')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'student'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Назначение admin по списку email из приложения (ADMIN_EMAILS), без эскалации через UPDATE
create or replace function public.ensure_admin_role(allowed_emails text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  mail text;
begin
  if uid is null then
    return;
  end if;
  select lower(u.email) into mail from auth.users u where u.id = uid;
  if mail is null then
    return;
  end if;
  if exists (
    select 1
    from unnest(allowed_emails) as e(email)
    where lower(trim(e.email)) = mail
  ) then
    update public.profiles set role = 'admin' where id = uid;
  end if;
end;
$$;

grant execute on function public.ensure_admin_role(text[]) to authenticated;

-- ---------------------------------------------------------------------------
-- User preferences
-- ---------------------------------------------------------------------------
create table public.user_exam_profiles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  exam_type text not null check (exam_type in ('oge', 'ege')),
  enabled boolean not null default true,
  primary key (user_id, exam_type)
);

create table public.user_subjects (
  user_id uuid not null references public.profiles (id) on delete cascade,
  exam_type text not null check (exam_type in ('oge', 'ege')),
  subject_code text not null,
  enabled boolean not null default true,
  primary key (user_id, exam_type, subject_code)
);

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------
create table public.subjects (
  code text primary key,
  title text not null,
  short_description text not null default '',
  emoji text not null default '📘',
  sort_order int not null default 0,
  exam_types text[] not null default array['oge', 'ege']::text[]
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  subject_code text not null references public.subjects (code) on delete cascade,
  exam_type text not null check (exam_type in ('oge', 'ege')),
  title text not null,
  theory_md text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.topics (id) on delete cascade,
  task_type text not null check (task_type in ('single', 'multi', 'short', 'numeric')),
  stem text not null,
  options_json jsonb,
  answer_key text not null,
  solution_md text not null default '',
  difficulty int not null default 1 check (difficulty between 1 and 3),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  subject_code text not null references public.subjects (code) on delete cascade,
  exam_type text not null check (exam_type in ('oge', 'ege')),
  title text not null,
  duration_min int not null default 40,
  created_at timestamptz not null default now()
);

create table public.exam_tasks (
  exam_id uuid not null references public.exams (id) on delete cascade,
  task_id uuid not null references public.tasks (id) on delete cascade,
  sort_order int not null default 0,
  primary key (exam_id, task_id)
);

create table public.site_content (
  key text primary key,
  value_text text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id) on delete set null
);

-- ---------------------------------------------------------------------------
-- Progress
-- ---------------------------------------------------------------------------
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  task_id uuid not null references public.tasks (id) on delete cascade,
  exam_attempt_id uuid,
  user_answer text not null default '',
  is_correct boolean not null default false,
  time_spent_sec int not null default 0,
  created_at timestamptz not null default now()
);

create table public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  exam_id uuid not null references public.exams (id) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  score_raw int not null default 0,
  score_max int not null default 0,
  weak_topics_json jsonb
);

alter table public.attempts
  add constraint attempts_exam_attempt_fk
  foreign key (exam_attempt_id) references public.exam_attempts (id) on delete set null;

create table public.topic_mastery (
  user_id uuid not null references public.profiles (id) on delete cascade,
  topic_id uuid not null references public.topics (id) on delete cascade,
  mastery int not null default 0 check (mastery between 0 and 100),
  last_diagnosed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create table public.error_bank (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  task_id uuid not null references public.tasks (id) on delete cascade,
  times_wrong int not null default 1,
  resolved boolean not null default false,
  next_review_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, task_id)
);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_exam_profiles enable row level security;
alter table public.user_subjects enable row level security;
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.tasks enable row level security;
alter table public.exams enable row level security;
alter table public.exam_tasks enable row level security;
alter table public.site_content enable row level security;
alter table public.attempts enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.topic_mastery enable row level security;
alter table public.error_bank enable row level security;

-- profiles
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

-- Ученик может менять имя/онбординг, но не role
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- user prefs
create policy "user_exam_profiles_own"
  on public.user_exam_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_subjects_own"
  on public.user_subjects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- content read for authenticated; write admin
create policy "subjects_select_auth"
  on public.subjects for select to authenticated
  using (true);

create policy "subjects_write_admin"
  on public.subjects for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "topics_select_auth"
  on public.topics for select to authenticated
  using (true);

create policy "topics_write_admin"
  on public.topics for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "tasks_select_auth"
  on public.tasks for select to authenticated
  using (true);

create policy "tasks_write_admin"
  on public.tasks for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "exams_select_auth"
  on public.exams for select to authenticated
  using (true);

create policy "exams_write_admin"
  on public.exams for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "exam_tasks_select_auth"
  on public.exam_tasks for select to authenticated
  using (true);

create policy "exam_tasks_write_admin"
  on public.exam_tasks for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- landing texts: public read, admin write
create policy "site_content_select_all"
  on public.site_content for select
  using (true);

create policy "site_content_write_admin"
  on public.site_content for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- progress own
create policy "attempts_own"
  on public.attempts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "exam_attempts_own"
  on public.exam_attempts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "topic_mastery_own"
  on public.topic_mastery for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "error_bank_own"
  on public.error_bank for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
