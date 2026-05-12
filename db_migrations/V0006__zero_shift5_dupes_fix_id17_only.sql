-- Обнуляем все дублирующие записи кроме последней (id=17) для смены 5
UPDATE t_p9542363_memorial_crm_mvp.shift_results
SET produced = 0, raw_used = 0
WHERE shift_id = 5 AND id != 17;

-- Пересчёт задачи 4
UPDATE t_p9542363_memorial_crm_mvp.cutting_tasks t4
SET done_qty = LEAST(t4.total_qty,
    (SELECT COALESCE(SUM(sr.produced), 0)
     FROM t_p9542363_memorial_crm_mvp.shift_results sr
     JOIN t_p9542363_memorial_crm_mvp.shifts sh ON sh.id = sr.shift_id
     WHERE sh.task_id = 4 AND sh.status = 'done')
),
in_progress_qty = 0,
updated_at = NOW()
WHERE t4.id = 4;

UPDATE t_p9542363_memorial_crm_mvp.cutting_tasks
SET status = CASE WHEN done_qty >= total_qty THEN 'done' ELSE 'pending' END,
    updated_at = NOW()
WHERE id = 4;
