-- Исправляем задачу 5: done_qty не должен превышать total_qty
UPDATE t_p9542363_memorial_crm_mvp.cutting_tasks
SET done_qty = LEAST(done_qty, total_qty),
    status = CASE
        WHEN done_qty >= total_qty THEN 'done'
        WHEN in_progress_qty > 0   THEN 'active'
        ELSE status
    END,
    updated_at = NOW()
WHERE id = 5;

-- Исправляем смену 5: проставляем task_qty_assigned из задачи (remaining = total_qty - done_qty - in_progress_qty)
UPDATE t_p9542363_memorial_crm_mvp.shifts s
SET task_qty_assigned = (
    SELECT total_qty - done_qty - in_progress_qty
    FROM t_p9542363_memorial_crm_mvp.cutting_tasks ct
    WHERE ct.id = s.task_id
),
updated_at = NOW()
WHERE s.id = 5 AND s.task_qty_assigned IS NULL AND s.task_id IS NOT NULL;
