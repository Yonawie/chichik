import fs from "fs";
import { content } from "./content-data.mjs";

const ADMIN_EMAIL = "taisiaryzkova24@gmail.com";

const q = (v) => (v == null ? "null" : `'${String(v).replace(/'/g, "''")}'`);

const subjectTitles = {
  russian: "Русский язык",
  math_basic: "Математика (база)",
  social: "Обществознание",
  chemistry: "Химия",
};

const examLabel = { oge: "ОГЭ", ege: "ЕГЭ" };

let sql = `-- Чичик: полный учебный контент + админ. Выполните целиком в Supabase SQL Editor.
-- Пересоздаёт темы, задания и пробники 4 предметов MVP (прогресс по старым заданиям удалится).

begin;

update public.site_content set value_text = 'Чичик', updated_at = now() where key = 'landing.hero_title';
update public.site_content set value_text = 'Подготовка к ОГЭ и ЕГЭ: теория, практика, диагностика и пробники.', updated_at = now() where key = 'landing.hero_subtitle';
update public.site_content set value_text = 'Начать подготовку', updated_at = now() where key = 'landing.cta_primary';

update public.subjects set title = 'Русский язык', short_description = 'Орфография, пунктуация, текст', emoji = '📘' where code = 'russian';
update public.subjects set title = 'Математика (база)', short_description = 'Числа, уравнения, задачи', emoji = '🔢' where code = 'math_basic';
update public.subjects set title = 'Обществознание', short_description = 'Человек, право, экономика', emoji = '🏛' where code = 'social';
update public.subjects set title = 'Химия', short_description = 'Атом, связи, расчёты', emoji = '🧪', exam_types = array['ege'] where code = 'chemistry';

delete from public.exams where subject_code in ('russian', 'math_basic', 'social', 'chemistry');
delete from public.topics where subject_code in ('russian', 'math_basic', 'social', 'chemistry');
`;

for (const [subject, topics] of Object.entries(content)) {
  sql += `\n-- ${subjectTitles[subject]}\n`;
  topics.forEach((topic, ti) => {
    sql += `\nwith t as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values (${q(subject)}, ${q(topic.exam)}, ${q(topic.title)}, ${q(topic.theory)}, ${ti + 1})
  returning id
)
insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select t.id, v.task_type, v.stem, v.options_json::jsonb, v.answer_key, v.solution_md, v.difficulty, v.sort_order
from t, (values
`;
    sql += topic.tasks
      .map(
        (task, i) =>
          `  (${q(task.type)}, ${q(task.stem)}, ${task.options ? q(JSON.stringify(task.options)) : "null"}, ${q(task.answer)}, ${q(task.solution)}, ${task.difficulty}, ${i + 1})`,
      )
      .join(",\n");
    sql += `\n) as v(task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order);\n`;
  });

  for (const exam of ["oge", "ege"]) {
    if (!topics.some((t) => t.exam === exam)) continue;
    const title = `Пробник ${examLabel[exam]}: ${subjectTitles[subject].toLowerCase()}`;
    sql += `
insert into public.exams (subject_code, exam_type, title, duration_min)
values (${q(subject)}, ${q(exam)}, ${q(title)}, 30);

insert into public.exam_tasks (exam_id, task_id, sort_order)
select e.id, tk.id, row_number() over (order by tp.sort_order, tk.sort_order)
from public.exams e
join public.topics tp on tp.subject_code = e.subject_code and tp.exam_type = e.exam_type
join public.tasks tk on tk.topic_id = tp.id
where e.subject_code = ${q(subject)} and e.exam_type = ${q(exam)};
`;
  }
}

sql += `
-- Админ: ${ADMIN_EMAIL}
insert into public.profiles (id, display_name, role)
select u.id, split_part(u.email, '@', 1), 'admin'
from auth.users u
where lower(u.email) = ${q(ADMIN_EMAIL)}
on conflict (id) do update set role = 'admin';

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
    case when lower(new.email) = ${q(ADMIN_EMAIL)} then 'admin' else 'student' end
  );
  return new;
end;
$$;

commit;

select u.email, p.role from auth.users u join public.profiles p on p.id = u.id where p.role = 'admin';
`;

fs.writeFileSync("supabase/content-full.sql", sql, "utf8");

const totalTopics = Object.values(content).reduce((n, t) => n + t.length, 0);
const totalTasks = Object.values(content).reduce(
  (n, t) => n + t.reduce((m, topic) => m + topic.tasks.length, 0),
  0,
);
console.log(`OK supabase/content-full.sql: ${totalTopics} topics, ${totalTasks} tasks`);
