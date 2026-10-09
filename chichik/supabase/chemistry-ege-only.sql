-- Химия только для ЕГЭ. Для базы, где content-full.sql уже выполнен. Прогресс сохраняется.

begin;

update public.subjects set exam_types = array['ege'] where code = 'chemistry';

update public.topics set exam_type = 'ege' where subject_code = 'chemistry' and exam_type = 'oge';

delete from public.exams where subject_code = 'chemistry' and exam_type = 'oge';

-- Задания бывших тем ОГЭ добавляем в пробник ЕГЭ по химии
insert into public.exam_tasks (exam_id, task_id, sort_order)
select e.id, tk.id, row_number() over (order by tp.sort_order, tk.sort_order)
from public.exams e
join public.topics tp on tp.subject_code = e.subject_code and tp.exam_type = e.exam_type
join public.tasks tk on tk.topic_id = tp.id
where e.subject_code = 'chemistry' and e.exam_type = 'ege'
on conflict (exam_id, task_id) do update set sort_order = excluded.sort_order;

commit;
