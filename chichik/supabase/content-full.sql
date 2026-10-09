-- Чичик: полный учебный контент + админ. Выполните целиком в Supabase SQL Editor.
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

-- Русский язык

with t as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values ('russian', 'ege', 'Орфограммы в корне', '## Орфограммы в корне

- Проверяемая гласная: подберите однокоренное слово с ударением (гора → горы).
- Чередующиеся корни: -кас-/-кос-, -раст-/-рос-, -гар-/-гор- и др.
- Непроверяемые гласные запоминаем по словарю (вагон, корова).', 1)
  returning id
)
insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select t.id, v.task_type, v.stem, v.options_json::jsonb, v.answer_key, v.solution_md, v.difficulty, v.sort_order
from t, (values
  ('single', 'В каком слове пропущена безударная проверяемая гласная корня?', '["з..рница","г..ра","к..снуться","пл..вец"]', 'г..ра', 'Гора — горы: гласная проверяется ударением.', 1, 1),
  ('single', 'В каком слове пишется буква А?', '["к..саться","прик..снуться","прик..сновение","к..снуться"]', 'к..саться', '-кас- пишется, если после корня суффикс -а-: касаться.', 1, 2),
  ('short', 'Вставьте пропущенную букву: р..стение. Ответ — одна буква.', null, 'а', 'Перед -ст- пишется А: растение.', 1, 3),
  ('short', 'Вставьте пропущенную букву: заг..рать. Ответ — одна буква.', null, 'о', 'Без ударения в корне -гар-/-гор- пишется О: загорать.', 2, 4),
  ('single', 'Укажите слово с непроверяемой гласной в корне.', '["в..гон","л..сной","х..лмы","м..сной"]', 'в..гон', 'Вагон — словарное слово, остальные проверяются: лес, холм, мясо.', 1, 5)
) as v(task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order);

with t as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values ('russian', 'ege', 'Н и НН в разных частях речи', '## Н и НН

- В прилагательных с суффиксами -ан-/-ян-/-ин- пишется Н (кожаный, гусиный); исключения: стеклянный, оловянный, деревянный.
- Суффиксы -енн-/-онн- и корень на Н + суффикс -н- дают НН (картинный, лимонный).
- Причастие с приставкой или зависимым словом — НН.', 2)
  returning id
)
insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select t.id, v.task_type, v.stem, v.options_json::jsonb, v.answer_key, v.solution_md, v.difficulty, v.sort_order
from t, (values
  ('single', 'В каком слове пишется НН?', '["кожа..ый","серебря..ый","ветре..ый","деревя..ый"]', 'деревя..ый', 'Деревянный — исключение, пишется НН.', 1, 1),
  ('single', 'В каком слове пишется одна Н?', '["стекля..ый","гуси..ый","карти..ый","лимо..ый"]', 'гуси..ый', 'Суффикс -ин- в прилагательном: гусиный.', 1, 2),
  ('single', 'В каком сочетании пишется НН?', '["жаре..ый карп","кова..ый меч","жаре..ый на костре карп","стира..ое бельё"]', 'жаре..ый на костре карп', 'Есть зависимое слово «на костре» — это причастие, пишется НН.', 2, 3),
  ('numeric', 'Сколько Н пишется в слове: прочита..ая книга? Ответ — число.', null, '2', 'Полное причастие с суффиксом -нн-: прочитанная.', 1, 4),
  ('numeric', 'Сколько Н пишется в слове: ветре..ый день? Ответ — число.', null, '1', 'Ветреный — исключение, пишется одна Н.', 2, 5)
) as v(task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order);

with t as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values ('russian', 'ege', 'Приставки пре-/при-', '## ПРЕ- и ПРИ-

- **ПРИ-**: приближение (приехать), присоединение (пришить), близость (приморский), неполнота (приоткрыть).
- **ПРЕ-**: высокая степень (прекрасный), значение «пере-» (прервать).
- Есть словарные слова: пренебрегать, привередливый.', 3)
  returning id
)
insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select t.id, v.task_type, v.stem, v.options_json::jsonb, v.answer_key, v.solution_md, v.difficulty, v.sort_order
from t, (values
  ('single', 'В каком слове пишется ПРИ-?', '["пр..красный","пр..морский","пр..одолеть","пр..следовать"]', 'пр..морский', 'Приморский — близость к морю.', 1, 1),
  ('single', 'В каком слове пишется ПРЕ-?', '["пр..вокзальный","пр..школьный","пр..небрегать","пр..строить"]', 'пр..небрегать', 'Пренебрегать — словарное слово.', 1, 2),
  ('short', 'Вставьте букву: пр..ехать (прибыть). Ответ — одна буква.', null, 'и', 'Значение приближения — ПРИ-.', 1, 3),
  ('short', 'Вставьте букву: пр..рвать разговор. Ответ — одна буква.', null, 'е', 'ПРЕ- в значении «пере-»: прервать = перервать.', 2, 4),
  ('single', 'Какое значение у приставки в слове «пришить»?', '["присоединение","неполнота действия","высокая степень","близость к чему-либо"]', 'присоединение', 'Пришить — присоединить.', 1, 5)
) as v(task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order);

with t as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values ('russian', 'oge', 'Пунктуация в сложном предложении', '## Сложное предложение

- Сложное предложение имеет две и более грамматические основы.
- Перед И между частями ставится запятая, если нет общего второстепенного члена.
- В бессоюзном предложении: двоеточие — пояснение/причина, тире — противопоставление/следствие.', 4)
  returning id
)
insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select t.id, v.task_type, v.stem, v.options_json::jsonb, v.answer_key, v.solution_md, v.difficulty, v.sort_order
from t, (values
  ('single', 'Какое предложение сложное?', '["Солнце село и стало прохладно.","Мы гуляли и пели песни.","Дождь шёл весь день.","Утром и вечером было тихо."]', 'Солнце село и стало прохладно.', 'Две основы: «солнце село», «стало прохладно».', 1, 1),
  ('single', 'Нужна ли запятая: «Наступила весна (?) и прилетели птицы»?', '["да","нет"]', 'да', 'Две грамматические основы без общего члена — запятая нужна.', 1, 2),
  ('single', 'Запятая перед И между частями НЕ ставится, если…', '["есть общий второстепенный член","части — простые предложения","предложение длинное","предложение восклицательное"]', 'есть общий второстепенный член', 'Пример: «Утром взошло солнце и запели птицы».', 1, 3),
  ('numeric', 'Сколько грамматических основ: «Когда стемнело, мы вернулись домой, и мама накрыла на стол»?', null, '3', 'Стемнело; мы вернулись; мама накрыла.', 2, 4),
  ('single', 'Какой знак нужен: «Я знаю ( ) ты придёшь»?', '["двоеточие","тире","точка с запятой","запятая не нужна"]', 'двоеточие', 'Вторая часть раскрывает содержание первой.', 2, 5)
) as v(task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order);

with t as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values ('russian', 'oge', 'Слитное и раздельное НЕ', '## НЕ с разными частями речи

- С глаголами и деепричастиями — раздельно (не был, не решив), кроме слов без НЕ не употребляющихся (ненавидеть).
- С существительными и прилагательными — слитно, если можно заменить синонимом без НЕ; раздельно при противопоставлении с «а».', 5)
  returning id
)
insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select t.id, v.task_type, v.stem, v.options_json::jsonb, v.answer_key, v.solution_md, v.difficulty, v.sort_order
from t, (values
  ('single', 'В каком слове НЕ пишется слитно?', '["(не)навидеть","(не)был","(не)мой","(не)решив"]', '(не)навидеть', 'Без НЕ не употребляется.', 1, 1),
  ('single', 'Где НЕ пишется раздельно?', '["(не)брежный","(не)правда, а ложь","(не)вежда","(не)годовать"]', '(не)правда, а ложь', 'Противопоставление с союзом «а» — раздельно.', 1, 2),
  ('single', 'НЕ с деепричастиями пишется…', '["раздельно, кроме слов без НЕ не употребляющихся","всегда слитно","слитно при зависимых словах","через дефис"]', 'раздельно, кроме слов без НЕ не употребляющихся', 'Не зная, но: негодуя.', 1, 3),
  ('short', '(не)высокий, а низкий дом — слитно или раздельно? Ответ одним словом.', null, 'раздельно', 'Противопоставление с «а».', 1, 4),
  ('short', '(не)смотря на дождь (предлог) — слитно или раздельно? Ответ одним словом.', null, 'слитно', 'Производный предлог «несмотря на» пишется слитно.', 2, 5)
) as v(task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order);

insert into public.exams (subject_code, exam_type, title, duration_min)
values ('russian', 'oge', 'Пробник ОГЭ: русский язык', 30);

insert into public.exam_tasks (exam_id, task_id, sort_order)
select e.id, tk.id, row_number() over (order by tp.sort_order, tk.sort_order)
from public.exams e
join public.topics tp on tp.subject_code = e.subject_code and tp.exam_type = e.exam_type
join public.tasks tk on tk.topic_id = tp.id
where e.subject_code = 'russian' and e.exam_type = 'oge';

insert into public.exams (subject_code, exam_type, title, duration_min)
values ('russian', 'ege', 'Пробник ЕГЭ: русский язык', 30);

insert into public.exam_tasks (exam_id, task_id, sort_order)
select e.id, tk.id, row_number() over (order by tp.sort_order, tk.sort_order)
from public.exams e
join public.topics tp on tp.subject_code = e.subject_code and tp.exam_type = e.exam_type
join public.tasks tk on tk.topic_id = tp.id
where e.subject_code = 'russian' and e.exam_type = 'ege';

-- Математика (база)

with t as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values ('math_basic', 'ege', 'Дроби и проценты', '## Дроби и проценты

- 1% = 0,01 от числа.
- Чтобы найти p% от числа a: a · p / 100.
- Снижение на p%: новая цена = a · (1 − p/100).', 1)
  returning id
)
insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select t.id, v.task_type, v.stem, v.options_json::jsonb, v.answer_key, v.solution_md, v.difficulty, v.sort_order
from t, (values
  ('numeric', 'Найдите 15% от 240.', null, '36', '240 · 0,15 = 36.', 1, 1),
  ('numeric', 'Товар стоил 800 ₽ и подешевел на 25%. Сколько он стоит теперь (в рублях)?', null, '600', '800 · 0,75 = 600.', 1, 2),
  ('numeric', 'Вычислите 3/4 + 1/8. Ответ запишите десятичной дробью.', null, '0.875', '6/8 + 1/8 = 7/8 = 0,875.', 1, 3),
  ('numeric', 'Сколько процентов составляет 18 от 72?', null, '25', '18 / 72 = 0,25 = 25%.', 1, 4),
  ('numeric', 'Вычислите 2,5 · 1,6.', null, '4', '2,5 · 1,6 = 4.', 1, 5)
) as v(task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order);

with t as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values ('math_basic', 'ege', 'Линейные уравнения', '## Линейные уравнения

- Переносим слагаемые с x в одну сторону, числа — в другую, меняя знак.
- Делим обе части на коэффициент при x.
- Если x сокращается и получается неверное равенство — корней нет.', 2)
  returning id
)
insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select t.id, v.task_type, v.stem, v.options_json::jsonb, v.answer_key, v.solution_md, v.difficulty, v.sort_order
from t, (values
  ('numeric', 'Решите уравнение 3x + 7 = 22.', null, '5', '3x = 15, x = 5.', 1, 1),
  ('numeric', 'Решите уравнение 5 − 2x = 11.', null, '-3', '−2x = 6, x = −3.', 1, 2),
  ('numeric', 'Решите уравнение 4(x − 1) = 2x + 6.', null, '5', '4x − 4 = 2x + 6, 2x = 10, x = 5.', 2, 3),
  ('numeric', 'Решите уравнение x/3 + 2 = 6.', null, '12', 'x/3 = 4, x = 12.', 1, 4),
  ('single', 'Сколько корней у уравнения 2x + 3 = 2x + 5?', '["нет корней","один","два","бесконечно много"]', 'нет корней', 'Получаем 3 = 5 — неверно.', 2, 5)
) as v(task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order);

with t as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values ('math_basic', 'ege', 'Геометрия: углы и площадь', '## Углы и площади

- Сумма углов треугольника — 180°.
- Площадь прямоугольника: a · b; треугольника: ½ · a · h; круга: πr².
- Теорема Пифагора: c² = a² + b².', 3)
  returning id
)
insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select t.id, v.task_type, v.stem, v.options_json::jsonb, v.answer_key, v.solution_md, v.difficulty, v.sort_order
from t, (values
  ('numeric', 'Найдите площадь прямоугольника со сторонами 6 см и 9 см (в см²).', null, '54', '6 · 9 = 54.', 1, 1),
  ('numeric', 'Два угла треугольника равны 50° и 60°. Найдите третий угол (в градусах).', null, '70', '180 − 50 − 60 = 70.', 1, 2),
  ('numeric', 'Основание треугольника 10, высота 7. Найдите площадь.', null, '35', '½ · 10 · 7 = 35.', 1, 3),
  ('numeric', 'Катеты прямоугольного треугольника 6 и 8. Найдите гипотенузу.', null, '10', '√(36 + 64) = 10.', 2, 4),
  ('numeric', 'Площадь круга радиуса 3 равна S. Найдите S/π.', null, '9', 'S = π · 9.', 2, 5)
) as v(task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order);

with t as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values ('math_basic', 'oge', 'Степени и корни', '## Степени и корни

- aᵐ · aⁿ = aᵐ⁺ⁿ; aᵐ : aⁿ = aᵐ⁻ⁿ.
- √(ab) = √a · √b.
- Отрицательное число в нечётной степени — отрицательно.', 4)
  returning id
)
insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select t.id, v.task_type, v.stem, v.options_json::jsonb, v.answer_key, v.solution_md, v.difficulty, v.sort_order
from t, (values
  ('numeric', 'Вычислите 2⁵.', null, '32', '2·2·2·2·2 = 32.', 1, 1),
  ('numeric', 'Вычислите √144.', null, '12', '12² = 144.', 1, 2),
  ('numeric', 'Вычислите 3² · 3³ : 3⁴.', null, '3', '3^(2+3−4) = 3¹ = 3.', 2, 3),
  ('numeric', 'Вычислите √(49 · 4).', null, '14', '7 · 2 = 14.', 1, 4),
  ('numeric', 'Вычислите (−2)³.', null, '-8', 'Нечётная степень отрицательного числа — отрицательна.', 1, 5)
) as v(task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order);

with t as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values ('math_basic', 'oge', 'Вероятность', '## Классическая вероятность

- P = число благоприятных исходов / число всех исходов.
- 0 ≤ P ≤ 1; невозможное событие — 0, достоверное — 1.
- P(не A) = 1 − P(A).', 5)
  returning id
)
insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select t.id, v.task_type, v.stem, v.options_json::jsonb, v.answer_key, v.solution_md, v.difficulty, v.sort_order
from t, (values
  ('numeric', 'Из 20 билетов 5 выигрышных. Найдите вероятность выигрыша.', null, '0.25', '5 / 20 = 0,25.', 1, 1),
  ('numeric', 'Монету бросают дважды. Найдите вероятность того, что оба раза выпадет орёл.', null, '0.25', 'Исходы: ОО, ОР, РО, РР — благоприятный один.', 2, 2),
  ('numeric', 'В классе 25 учеников, из них 10 мальчиков. Найдите вероятность, что случайно выбранный ученик — девочка.', null, '0.6', '15 / 25 = 0,6.', 1, 3),
  ('numeric', 'Из 50 батареек 2 бракованные. Найдите вероятность, что случайная батарейка исправна.', null, '0.96', '48 / 50 = 0,96.', 1, 4),
  ('single', 'Чему равна вероятность невозможного события?', '["0","1","0,5","−1"]', '0', 'Невозможное событие никогда не наступает.', 1, 5)
) as v(task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order);

insert into public.exams (subject_code, exam_type, title, duration_min)
values ('math_basic', 'oge', 'Пробник ОГЭ: математика (база)', 30);

insert into public.exam_tasks (exam_id, task_id, sort_order)
select e.id, tk.id, row_number() over (order by tp.sort_order, tk.sort_order)
from public.exams e
join public.topics tp on tp.subject_code = e.subject_code and tp.exam_type = e.exam_type
join public.tasks tk on tk.topic_id = tp.id
where e.subject_code = 'math_basic' and e.exam_type = 'oge';

insert into public.exams (subject_code, exam_type, title, duration_min)
values ('math_basic', 'ege', 'Пробник ЕГЭ: математика (база)', 30);

insert into public.exam_tasks (exam_id, task_id, sort_order)
select e.id, tk.id, row_number() over (order by tp.sort_order, tk.sort_order)
from public.exams e
join public.topics tp on tp.subject_code = e.subject_code and tp.exam_type = e.exam_type
join public.tasks tk on tk.topic_id = tp.id
where e.subject_code = 'math_basic' and e.exam_type = 'ege';

-- Обществознание

with t as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values ('social', 'ege', 'Человек и общество', '## Человек и общество

- Человек — биосоциальное существо.
- Основные сферы общества: экономическая, политическая, социальная, духовная.
- Социализация — усвоение норм и ценностей общества.', 1)
  returning id
)
insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select t.id, v.task_type, v.stem, v.options_json::jsonb, v.answer_key, v.solution_md, v.difficulty, v.sort_order
from t, (values
  ('single', 'Что отличает человека от животного?', '["сознательная деятельность","потребность в пище","инстинкты","забота о потомстве"]', 'сознательная деятельность', 'Только человек ставит цели и осознаёт деятельность.', 1, 1),
  ('single', 'Какая сфера НЕ относится к основным сферам общества?', '["бытовая","экономическая","политическая","социальная"]', 'бытовая', 'Основные сферы: экономическая, политическая, социальная, духовная.', 1, 2),
  ('single', 'Индивидуальность — это…', '["неповторимое своеобразие человека","человек как представитель рода","участник общественных отношений","новорождённый человек"]', 'неповторимое своеобразие человека', 'Индивид — представитель рода, личность — социальные качества.', 1, 3),
  ('single', 'Процесс усвоения норм и ценностей общества называется…', '["социализация","эволюция","модернизация","глобализация"]', 'социализация', 'Социализация идёт всю жизнь.', 1, 4),
  ('short', 'Как называется направление развития от менее совершенного к более совершенному? Одно слово.', null, 'прогресс', 'Противоположность — регресс.', 2, 5)
) as v(task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order);

with t as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values ('social', 'ege', 'Экономика: основы', '## Основы экономики

- Факторы производства: труд, земля, капитал, предпринимательство.
- Закон спроса: при росте цены величина спроса снижается.
- Инфляция — устойчивый рост общего уровня цен.', 2)
  returning id
)
insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select t.id, v.task_type, v.stem, v.options_json::jsonb, v.answer_key, v.solution_md, v.difficulty, v.sort_order
from t, (values
  ('single', 'Что относится к факторам производства?', '["труд","налоги","цены","инфляция"]', 'труд', 'Труд, земля, капитал, предпринимательство.', 1, 1),
  ('single', 'При росте цены величина спроса обычно…', '["снижается","растёт","не меняется","удваивается"]', 'снижается', 'Закон спроса.', 1, 2),
  ('single', 'Инфляция — это…', '["устойчивый рост общего уровня цен","снижение цен","рост производства","укрепление национальной валюты"]', 'устойчивый рост общего уровня цен', 'Деньги обесцениваются.', 1, 3),
  ('short', 'Как называется доход собственника земли? Одно слово.', null, 'рента', 'Труд — зарплата, капитал — процент, земля — рента.', 2, 4),
  ('single', 'Какой налог является прямым?', '["НДФЛ","НДС","акциз","таможенная пошлина"]', 'НДФЛ', 'Прямые налоги взимаются с дохода или имущества.', 1, 5)
) as v(task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order);

with t as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values ('social', 'ege', 'Право: основы', '## Основы права

- Конституция РФ обладает высшей юридической силой.
- Правоспособность — с рождения, полная дееспособность — с 18 лет.
- Виды ответственности: уголовная, административная, гражданская, дисциплинарная.', 3)
  returning id
)
insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select t.id, v.task_type, v.stem, v.options_json::jsonb, v.answer_key, v.solution_md, v.difficulty, v.sort_order
from t, (values
  ('single', 'Какой акт обладает высшей юридической силой в РФ?', '["Конституция РФ","Гражданский кодекс","указ Президента","закон субъекта РФ"]', 'Конституция РФ', 'Все законы должны соответствовать Конституции.', 1, 1),
  ('numeric', 'С какого возраста по общему правилу наступает полная дееспособность в РФ?', null, '18', 'Совершеннолетие — 18 лет.', 1, 2),
  ('single', 'Какой вид ответственности — штраф за безбилетный проезд?', '["административная","уголовная","дисциплинарная","гражданско-правовая"]', 'административная', 'Регулируется КоАП.', 1, 3),
  ('numeric', 'С какого возраста наступает общая уголовная ответственность?', null, '16', 'За тяжкие преступления — с 14 лет.', 2, 4),
  ('single', 'Правоспособность гражданина возникает…', '["с рождения","с 14 лет","с 18 лет","с получения паспорта"]', 'с рождения', 'И прекращается со смертью.', 1, 5)
) as v(task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order);

with t as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values ('social', 'oge', 'Политика и государство', '## Государство

- Форма правления РФ — республика, устройство — федерация.
- Ветви власти: законодательная (Федеральное Собрание), исполнительная (Правительство), судебная.
- Президент избирается на 6 лет.', 4)
  returning id
)
insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select t.id, v.task_type, v.stem, v.options_json::jsonb, v.answer_key, v.solution_md, v.difficulty, v.sort_order
from t, (values
  ('single', 'Какова форма правления в РФ?', '["республика","монархия","федерация","конфедерация"]', 'республика', 'Власть выборная.', 1, 1),
  ('single', 'Какова форма государственного устройства РФ?', '["федерация","унитарное государство","конфедерация","империя"]', 'федерация', 'РФ состоит из субъектов.', 1, 2),
  ('single', 'Кто осуществляет законодательную власть в РФ?', '["Федеральное Собрание","Правительство РФ","Верховный Суд","Президент РФ"]', 'Федеральное Собрание', 'Состоит из Совета Федерации и Государственной Думы.', 1, 3),
  ('numeric', 'На сколько лет избирается Президент РФ?', null, '6', 'Срок полномочий — 6 лет.', 1, 4),
  ('short', 'Как называется режим, при котором источником власти признаётся народ? Одно слово.', null, 'демократия', 'От греч. «власть народа».', 2, 5)
) as v(task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order);

with t as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values ('social', 'oge', 'Конституция РФ', '## Конституция РФ

- Принята всенародным голосованием 12 декабря 1993 года.
- Человек, его права и свободы — высшая ценность.
- Носитель суверенитета — многонациональный народ.', 5)
  returning id
)
insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select t.id, v.task_type, v.stem, v.options_json::jsonb, v.answer_key, v.solution_md, v.difficulty, v.sort_order
from t, (values
  ('numeric', 'В каком году принята действующая Конституция РФ?', null, '1993', '12 декабря 1993 года.', 1, 1),
  ('single', 'Кто является носителем суверенитета и единственным источником власти в РФ?', '["многонациональный народ","Президент РФ","Государственная Дума","Правительство РФ"]', 'многонациональный народ', 'Статья 3 Конституции.', 1, 2),
  ('single', 'Кто является главой государства в РФ?', '["Президент РФ","Председатель Правительства","Председатель Государственной Думы","Председатель Совета Федерации"]', 'Президент РФ', 'Статья 80 Конституции.', 1, 3),
  ('numeric', 'С какого возраста гражданин РФ имеет право избирать?', null, '18', 'Активное избирательное право — с 18 лет.', 1, 4),
  ('single', 'Что Конституция РФ называет высшей ценностью?', '["человек, его права и свободы","государство","закон","собственность"]', 'человек, его права и свободы', 'Статья 2 Конституции.', 2, 5)
) as v(task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order);

insert into public.exams (subject_code, exam_type, title, duration_min)
values ('social', 'oge', 'Пробник ОГЭ: обществознание', 30);

insert into public.exam_tasks (exam_id, task_id, sort_order)
select e.id, tk.id, row_number() over (order by tp.sort_order, tk.sort_order)
from public.exams e
join public.topics tp on tp.subject_code = e.subject_code and tp.exam_type = e.exam_type
join public.tasks tk on tk.topic_id = tp.id
where e.subject_code = 'social' and e.exam_type = 'oge';

insert into public.exams (subject_code, exam_type, title, duration_min)
values ('social', 'ege', 'Пробник ЕГЭ: обществознание', 30);

insert into public.exam_tasks (exam_id, task_id, sort_order)
select e.id, tk.id, row_number() over (order by tp.sort_order, tk.sort_order)
from public.exams e
join public.topics tp on tp.subject_code = e.subject_code and tp.exam_type = e.exam_type
join public.tasks tk on tk.topic_id = tp.id
where e.subject_code = 'social' and e.exam_type = 'ege';

-- Химия

with t as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values ('chemistry', 'ege', 'Строение атома', '## Строение атома

- Число протонов = порядковый номер = заряд ядра.
- Число электронов в атоме = числу протонов.
- Нейтроны = массовое число − протоны.', 1)
  returning id
)
insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select t.id, v.task_type, v.stem, v.options_json::jsonb, v.answer_key, v.solution_md, v.difficulty, v.sort_order
from t, (values
  ('numeric', 'Сколько протонов в атоме кислорода?', null, '8', 'Порядковый номер O — 8.', 1, 1),
  ('numeric', 'Сколько электронов в атоме натрия?', null, '11', 'Na — № 11.', 1, 2),
  ('numeric', 'Сколько нейтронов в атоме углерода-12?', null, '6', '12 − 6 = 6.', 1, 3),
  ('numeric', 'Сколько электронов на внешнем уровне у атома хлора?', null, '7', 'Cl — VIIA группа.', 2, 4),
  ('single', 'Заряд ядра атома определяется числом…', '["протонов","нейтронов","электронов","энергетических уровней"]', 'протонов', 'Каждый протон несёт заряд +1.', 1, 5)
) as v(task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order);

with t as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values ('chemistry', 'ege', 'Химическая связь', '## Виды связи

- Ионная: металл + неметалл (NaCl).
- Ковалентная неполярная: одинаковые неметаллы (O2); полярная: разные неметаллы (HCl).
- Металлическая — в металлах; водородная — между молекулами воды, спиртов.', 2)
  returning id
)
insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select t.id, v.task_type, v.stem, v.options_json::jsonb, v.answer_key, v.solution_md, v.difficulty, v.sort_order
from t, (values
  ('single', 'В каком веществе ионная связь?', '["NaCl","H2O","Cl2","CH4"]', 'NaCl', 'Металл + неметалл.', 1, 1),
  ('single', 'В каком веществе ковалентная неполярная связь?', '["O2","HCl","KBr","NH3"]', 'O2', 'Одинаковые атомы неметалла.', 1, 2),
  ('single', 'В каком веществе металлическая связь?', '["Fe","NaCl","CO2","H2"]', 'Fe', 'Железо — металл.', 1, 3),
  ('single', 'В каком веществе ковалентная полярная связь?', '["HCl","Cl2","NaF","Cu"]', 'HCl', 'Разные неметаллы.', 1, 4),
  ('single', 'Водородная связь образуется между молекулами…', '["воды","метана","водорода","азота"]', 'воды', 'Нужен H, связанный с O, N или F.', 2, 5)
) as v(task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order);

with t as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values ('chemistry', 'ege', 'Классы соединений', '## Классы неорганических веществ

- Оксиды: элемент + O (CO2).
- Кислоты: H + кислотный остаток (H2SO4).
- Основания: металл + OH (KOH).
- Соли: металл + кислотный остаток (Na2SO4).', 3)
  returning id
)
insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select t.id, v.task_type, v.stem, v.options_json::jsonb, v.answer_key, v.solution_md, v.difficulty, v.sort_order
from t, (values
  ('single', 'Какое вещество является кислотой?', '["H2SO4","NaOH","CaO","KCl"]', 'H2SO4', 'Серная кислота.', 1, 1),
  ('single', 'Какое вещество является основанием?', '["KOH","HNO3","SO3","NaCl"]', 'KOH', 'Гидроксид калия.', 1, 2),
  ('single', 'Какое вещество является оксидом?', '["CO2","HCl","NaOH","CaCO3"]', 'CO2', 'Углерод + кислород.', 1, 3),
  ('single', 'Какое вещество является солью?', '["Na2SO4","H2S","Ba(OH)2","P2O5"]', 'Na2SO4', 'Металл + кислотный остаток.', 1, 4),
  ('single', 'Какой оксид амфотерный?', '["Al2O3","Na2O","SO2","CaO"]', 'Al2O3', 'Реагирует и с кислотами, и со щелочами.', 2, 5)
) as v(task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order);

with t as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values ('chemistry', 'ege', 'Признаки реакций', '## Признаки химических реакций

- Выделение газа, выпадение осадка, изменение цвета, запах, выделение тепла и света.
- Физические явления (таяние, кипение) — новых веществ не образуется.
- Качественная реакция на Cl⁻ — AgNO3 (белый осадок).', 4)
  returning id
)
insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select t.id, v.task_type, v.stem, v.options_json::jsonb, v.answer_key, v.solution_md, v.difficulty, v.sort_order
from t, (values
  ('single', 'Что является признаком химической реакции?', '["выделение газа","измельчение","испарение воды","плавление льда"]', 'выделение газа', 'Образуется новое вещество.', 1, 1),
  ('single', 'Какое явление химическое?', '["горение свечи","таяние льда","кипение воды","растворение сахара"]', 'горение свечи', 'Образуются CO2 и вода.', 1, 2),
  ('single', 'Реакция Na2CO3 с соляной кислотой сопровождается…', '["выделением газа","выпадением осадка","отсутствием признаков","запахом аммиака"]', 'выделением газа', 'Выделяется CO2.', 1, 3),
  ('single', 'Какой реактив используют для обнаружения хлорид-ионов?', '["AgNO3","NaOH","BaCl2","фенолфталеин"]', 'AgNO3', 'Выпадает белый осадок AgCl.', 2, 4),
  ('single', 'Какого цвета фенолфталеин в растворе щёлочи?', '["малиновый","бесцветный","синий","жёлтый"]', 'малиновый', 'В кислой и нейтральной среде — бесцветный.', 1, 5)
) as v(task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order);

with t as (
  insert into public.topics (subject_code, exam_type, title, theory_md, sort_order)
  values ('chemistry', 'ege', 'Расчёты по формулам', '## Расчёты

- n = m / M (моль).
- M — сумма атомных масс: H = 1, C = 12, O = 16.
- Массовая доля: ω = m(вещества) / m(раствора) · 100%.', 5)
  returning id
)
insert into public.tasks (topic_id, task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order)
select t.id, v.task_type, v.stem, v.options_json::jsonb, v.answer_key, v.solution_md, v.difficulty, v.sort_order
from t, (values
  ('numeric', 'Найдите молярную массу H2O (г/моль).', null, '18', '2 · 1 + 16 = 18.', 1, 1),
  ('numeric', 'Найдите молярную массу CO2 (г/моль).', null, '44', '12 + 2 · 16 = 44.', 1, 2),
  ('numeric', 'Сколько моль составляют 36 г воды?', null, '2', '36 / 18 = 2.', 1, 3),
  ('numeric', 'В 200 г раствора содержится 20 г соли. Найдите массовую долю соли (%).', null, '10', '20 / 200 · 100% = 10%.', 1, 4),
  ('numeric', 'Найдите массу 0,5 моль NaCl (M = 58,5 г/моль), г.', null, '29.25', '0,5 · 58,5 = 29,25.', 2, 5)
) as v(task_type, stem, options_json, answer_key, solution_md, difficulty, sort_order);

insert into public.exams (subject_code, exam_type, title, duration_min)
values ('chemistry', 'ege', 'Пробник ЕГЭ: химия', 30);

insert into public.exam_tasks (exam_id, task_id, sort_order)
select e.id, tk.id, row_number() over (order by tp.sort_order, tk.sort_order)
from public.exams e
join public.topics tp on tp.subject_code = e.subject_code and tp.exam_type = e.exam_type
join public.tasks tk on tk.topic_id = tp.id
where e.subject_code = 'chemistry' and e.exam_type = 'ege';

-- Админ: taisiaryzkova24@gmail.com
insert into public.profiles (id, display_name, role)
select u.id, split_part(u.email, '@', 1), 'admin'
from auth.users u
where lower(u.email) = 'taisiaryzkova24@gmail.com'
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
    case when lower(new.email) = 'taisiaryzkova24@gmail.com' then 'admin' else 'student' end
  );
  return new;
end;
$$;

commit;

select u.email, p.role from auth.users u join public.profiles p on p.id = u.id where p.role = 'admin';
