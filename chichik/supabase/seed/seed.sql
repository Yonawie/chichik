-- Минимальный seed для проверки админки и практики
-- Выполните после миграции в SQL Editor Supabase (или supabase db seed)

insert into public.subjects (code, title, short_description, emoji, sort_order, exam_types)
values
  ('russian', 'Русский язык', 'Орфография, пунктуация, текст', '📘', 1, array['oge','ege']),
  ('math_basic', 'Математика (база)', 'Числа, уравнения, задачи', '🔢', 2, array['oge','ege']),
  ('social', 'Обществознание', 'Человек, право, экономика', '🏛', 3, array['oge','ege']),
  ('chemistry', 'Химия', 'Атом, связи, расчёты', '🧪', 4, array['oge','ege'])
on conflict (code) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  emoji = excluded.emoji,
  sort_order = excluded.sort_order,
  exam_types = excluded.exam_types;

insert into public.site_content (key, value_text)
values
  ('landing.hero_title', 'Чичик'),
  ('landing.hero_subtitle', 'Подготовка к ОГЭ и ЕГЭ: теория, практика, диагностика и пробники.'),
  ('landing.cta_primary', 'Начать подготовку')
on conflict (key) do nothing;

-- Тема + задания (русский / ЕГЭ)
with topic_ins as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values (
    'russian',
    'ege',
    'Орфограммы в корне',
    E'## Орфограммы в корне\n\nПроверяемые гласные: подберите однокоренное слово с ударной гласной.\n\nПримеры: *леса́* → *лес*, *полоскать* / *поласкать* — различайте по смыслу.',
    1
  )
  returning id
),
t1 as (
  insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
  select id, 'single',
    'В каком слове пишется буква А в корне?',
    '["к..саться", "прик..снуться", "к..сательная", "прик..сновение"]'::jsonb,
    'к..саться',
    'В словах с корнем -кас-/-кос- буква А пишется, если есть суффикс -а-.',
    1, 1
  from topic_ins
  returning id
),
t2 as (
  insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
  select id, 'short',
    'Вставьте пропущенную букву: пр..кратить (остановить). Ответ — одна буква.',
    null,
    'е',
    'Приставка пре- со значением «прекратить, прервать».',
    1, 2
  from topic_ins
  returning id
),
t3 as (
  insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
  select id, 'single',
    'Укажите слово с проверяемой гласной в корне.',
    '["посвящение", "посёлок", "плавать", "росток"]'::jsonb,
    'посёлок',
    'Посёлок — проверить: селить / сёла.',
    2, 3
  from topic_ins
  returning id, topic_id
)
insert into public.exams (subject_code, exam_type, title, duration_min)
values ('russian', 'ege', 'Пробник: русский (мини)', 20);

-- Вторая тема для покрытия диагностики
insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
values (
  'russian',
  'ege',
  'Н и НН в разных частях речи',
  E'## Н и НН\n\nВ прилагательных и причастиях число Н зависит от суффикса и наличия зависимых слов/приставки.',
  2
);

insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select id, 'single',
  'В каком варианте пишется НН?',
  '["жаре(н,нн)ый карп", "жаре(н,нн)ый на костре карп", "кова(н,нн)ый меч", "стира(н,нн)ый бельё"]'::jsonb,
  'жаре(н,нн)ый на костре карп',
  'Причастие с зависимыми словами → НН.',
  2, 1
from public.topics
where subject_code = 'russian' and title = 'Н и НН в разных частях речи'
limit 1;

-- Привязка заданий к мини-пробнику
insert into public.exam_tasks (exam_id, task_id, sort_order)
select e.id, t.id, row_number() over (order by t.sort_order)
from public.exams e
join public.topics tp on tp.subject_code = e.subject_code and tp.exam_type = e.exam_type
join public.tasks t on t.topic_id = tp.id
where e.title = 'Пробник: русский (мини)'
on conflict do nothing;
