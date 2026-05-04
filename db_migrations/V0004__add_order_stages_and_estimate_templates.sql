CREATE TABLE t_p9542363_memorial_crm_mvp.order_stages (
  id         serial PRIMARY KEY,
  company_id integer NOT NULL REFERENCES t_p9542363_memorial_crm_mvp.companies(id),
  label      varchar(100) NOT NULL,
  color      varchar(20)  NOT NULL DEFAULT '#6366f1',
  days       integer      NOT NULL DEFAULT 0,
  sort_order integer      NOT NULL DEFAULT 0,
  active     boolean      NOT NULL DEFAULT true
);

CREATE TABLE t_p9542363_memorial_crm_mvp.estimate_templates (
  id         serial PRIMARY KEY,
  company_id integer      NOT NULL REFERENCES t_p9542363_memorial_crm_mvp.companies(id),
  name       varchar(200) NOT NULL,
  price      numeric(12,2) NOT NULL DEFAULT 0,
  unit       varchar(30)  NOT NULL DEFAULT 'шт.',
  active     boolean      NOT NULL DEFAULT true,
  sort_order integer      NOT NULL DEFAULT 0
);

INSERT INTO t_p9542363_memorial_crm_mvp.order_stages (company_id, label, color, days, sort_order) VALUES
(1, 'Эскиз',      '#6366f1', 2, 1),
(1, 'Распил',     '#f59e0b', 3, 2),
(1, 'Гравировка', '#ec4899', 4, 3),
(1, 'Полировка',  '#14b8a6', 2, 4),
(1, 'Готов',      '#22c55e', 0, 5),
(1, 'Выдан',      '#9b9b9b', 0, 6),
(2, 'Эскиз',      '#6366f1', 2, 1),
(2, 'Распил',     '#f59e0b', 3, 2),
(2, 'Гравировка', '#ec4899', 4, 3),
(2, 'Полировка',  '#14b8a6', 2, 4),
(2, 'Готов',      '#22c55e', 0, 5),
(2, 'Выдан',      '#9b9b9b', 0, 6);

INSERT INTO t_p9542363_memorial_crm_mvp.estimate_templates (company_id, name, price, unit, sort_order) VALUES
(1, 'Изготовление памятника (базовый)', 22000, 'шт.', 1),
(1, 'Гравировка надписи',               6500,  'шт.', 2),
(1, 'Портретное фото',                  5000,  'шт.', 3),
(1, 'Доставка базовая',                 2500,  'км',  4),
(1, 'Установка на кладбище',            5000,  'шт.', 5),
(2, 'Изготовление памятника (базовый)', 22000, 'шт.', 1),
(2, 'Гравировка надписи',               6500,  'шт.', 2),
(2, 'Портретное фото',                  5000,  'шт.', 3),
(2, 'Доставка базовая',                 2500,  'км',  4),
(2, 'Установка на кладбище',            5000,  'шт.', 5);