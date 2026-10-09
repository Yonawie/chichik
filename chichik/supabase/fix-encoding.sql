-- Fix mojibake from bad encoding. Run once in SQL Editor.

update public.site_content set value_text = 'Чичик', updated_at = now() where key = 'landing.hero_title';
update public.site_content set value_text = 'Подготовка к ОГЭ и ЕГЭ: теория, практика, диагностика и пробники.', updated_at = now() where key = 'landing.hero_subtitle';
update public.site_content set value_text = 'Начать подготовку', updated_at = now() where key = 'landing.cta_primary';

update public.subjects set title = 'Русский язык', short_description = 'Орфография, пунктуация, текст', emoji = '📘' where code = 'russian';
update public.subjects set title = 'Математика (база)', short_description = 'Числа, уравнения, задачи', emoji = '🔢' where code = 'math_basic';
update public.subjects set title = 'Обществознание', short_description = 'Человек, право, экономика', emoji = '🏛' where code = 'social';
update public.subjects set title = 'Химия', short_description = 'Атом, связи, расчёты', emoji = '🧪' where code = 'chemistry';

update public.topics
set title = 'Орфограммы в корне',
    theory_md = E'## Орфограммы в корне\n\nПроверяемые гласные: подберите однокоренное слово с ударной гласной.\n\nПримеры: леса → лес.'
where subject_code = 'russian' and sort_order = 1;

update public.topics
set title = 'Н и НН в разных частях речи',
    theory_md = E'## Н и НН\n\nВ прилагательных и причастиях число Н зависит от суффикса и наличия зависимых слов/приставки.'
where subject_code = 'russian' and sort_order = 2;

update public.exams set title = 'Пробник: русский (мини)' where subject_code = 'russian';

-- Fix task stems that were corrupted (by answer_key match from seed)
update public.tasks set
  stem = 'В каком слове пишется буква А в корне?',
  options_json = '["к..саться", "прик..снуться", "к..сательная", "прик..сновение"]'::jsonb,
  answer_key = 'к..саться',
  solution_md = 'В словах с корнем -кас-/-кос- буква А пишется, если есть суффикс -а-.'
where answer_key in ('к..саться', 'Рє..СЃР°С‚СЊСЃСЏ') or stem like '%Р%корне%' or stem like '%букв%';

update public.tasks set
  stem = 'Вставьте пропущенную букву: пр..кратить (остановить). Ответ — одна буква.',
  answer_key = 'е',
  solution_md = 'Приставка пре- со значением «прекратить, прервать».'
where task_type = 'short' and topic_id in (select id from public.topics where subject_code = 'russian' and sort_order = 1);

update public.tasks set
  stem = 'Укажите слово с проверяемой гласной в корне.',
  options_json = '["посвящение", "посёлок", "плавать", "росток"]'::jsonb,
  answer_key = 'посёлок',
  solution_md = 'Посёлок — проверить: селить / сёла.'
where answer_key in ('посёлок', 'РїРѕСЃС‘Р»РѕРє')
   or (topic_id in (select id from public.topics where subject_code = 'russian' and sort_order = 1) and difficulty = 2);

update public.tasks set
  stem = 'В каком варианте пишется НН?',
  options_json = '["жаре(н,нн)ый карп", "жаре(н,нн)ый на костре карп", "кова(н,нн)ый меч", "стира(н,нн)ый бельё"]'::jsonb,
  answer_key = 'жаре(н,нн)ый на костре карп',
  solution_md = 'Причастие с зависимыми словами → НН.'
where topic_id in (select id from public.topics where subject_code = 'russian' and sort_order = 2);
