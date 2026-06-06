-- Пересчитываем cost_price для всех заготовок:
-- cost_price = raw_per_unit (из blank_types) × price (из materials)
UPDATE t_p9542363_memorial_crm_mvp.blanks b
SET cost_price = ROUND(bt.raw_per_unit * m.price, 2),
    updated_at = NOW()
FROM t_p9542363_memorial_crm_mvp.blank_types bt,
     t_p9542363_memorial_crm_mvp.materials m
WHERE bt.name = b.name
  AND bt.company_id = b.company_id
  AND m.id = b.material_id
  AND bt.raw_per_unit > 0
  AND m.price > 0;
