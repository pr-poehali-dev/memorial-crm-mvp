
-- Заказы
INSERT INTO t_p9542363_memorial_crm_mvp.orders
  (id, company_id, client_id, client_name, phone, stone, size, inscription, design, status, status_color, amount, paid, order_date, deadline, manager, comment, current_stage)
VALUES
  ('МП-0041',2,1,'Смирнова А.В.','+7 912 345-67-89','Гранит чёрный','100×50×8',
   'Иванов Пётр Семёнович'||chr(10)||'1945–2021','Портрет + орнамент',
   'Производство','#f59e0b',38500,15000,DATE '2026-04-12',DATE '2026-04-28','Олег К.','Клиент просил сделать надпись крупнее',2),

  ('МП-0040',2,2,'Козлов И.Д.','+7 903 211-44-55','Мрамор белый','80×40×6',
   'Козлова Мария'||chr(10)||'1950–2023','Крест + розы',
   'Эскиз','#6366f1',22000,0,DATE '2026-04-10',DATE '2026-04-20','Анна М.','Ожидает согласования эскиза',1),

  ('МП-0039',2,3,'Петрова О.Н.','+7 965 888-11-22','Гранит серый','120×60×10',
   'Петров Алексей'||chr(10)||'1938–2020','Фото + берёзы',
   'Готов','#22c55e',54000,54000,DATE '2026-04-05',DATE '2026-04-25','Олег К.','Готов к выдаче',4),

  ('МП-0038',2,4,'Фёдоров С.С.','+7 999 777-33-44','Гранит красный','90×45×7',
   'Фёдорова Нина'||chr(10)||'1960–2024','Лилии',
   'Доставка','#3b82f6',31000,31000,DATE '2026-04-01',DATE '2026-04-22','Игорь В.','Доставка на кладбище Митино',5),

  ('МП-0037',2,5,'Иванов П.К.','+7 900 123-00-00','Гранит чёрный','100×50×8',
   'Иванов Константин'||chr(10)||'1955–2022','Портрет',
   'Выдан','#9b9b9b',41000,41000,DATE '2026-03-28',DATE '2026-04-15','Анна М.','',5),

  ('МП-0036',2,6,'Морозова Т.И.','+7 921 456-78-90','Серый гранит','80×40×6',
   'Морозов Виктор'||chr(10)||'1942–2026','Звезда МВД',
   'Производство','#f59e0b',44000,25000,DATE '2026-03-25',DATE '2026-05-01','Игорь В.','',2),

  ('МП-0035',2,7,'Белова Е.С.','+7 916 200-10-30','Мрамор белый','90×45×7',
   'Белов Андрей'||chr(10)||'1971–2025','Ангел',
   'Эскиз','#6366f1',35000,15000,DATE '2026-04-15',DATE '2026-05-10','Олег К.','',1);

-- Позиции заказов
INSERT INTO t_p9542363_memorial_crm_mvp.order_items
  (order_id, name, qty, unit, price, approved, has_calc, sort_order)
VALUES
  ('МП-0041','Изготовление памятника',1,'шт.',22000,TRUE, TRUE, 1),
  ('МП-0041','Гравировка надписи',    1,'шт.', 6500,TRUE, TRUE, 2),
  ('МП-0041','Портретное фото',       1,'шт.', 5000,NULL, FALSE,3),
  ('МП-0041','Доставка и установка',  1,'шт.', 5000,FALSE,FALSE,4),
  ('МП-0040','Изготовление памятника',1,'шт.',16000,TRUE, TRUE, 1),
  ('МП-0040','Гравировка надписи',    1,'шт.', 4500,TRUE, TRUE, 2),
  ('МП-0040','Доставка',             1,'шт.', 1500,NULL, FALSE,3),
  ('МП-0039','Изготовление памятника',1,'шт.',38000,TRUE, TRUE, 1),
  ('МП-0039','Гравировка + фото',    1,'шт.',12000,TRUE, TRUE, 2),
  ('МП-0039','Доставка и установка',  1,'шт.', 4000,TRUE, FALSE,3);

-- Оплаты
INSERT INTO t_p9542363_memorial_crm_mvp.payments
  (order_id, company_id, amount, paid_at, note)
VALUES
  ('МП-0041',2,15000,DATE '2026-04-12','Предоплата при оформлении'),
  ('МП-0039',2,54000,DATE '2026-04-05','Полная оплата'),
  ('МП-0038',2,31000,DATE '2026-04-01','Полная оплата'),
  ('МП-0037',2,41000,DATE '2026-03-28','Полная оплата'),
  ('МП-0036',2,25000,DATE '2026-03-25','Аванс'),
  ('МП-0035',2,15000,DATE '2026-04-15','Предоплата');

-- Комментарии к заказам
INSERT INTO t_p9542363_memorial_crm_mvp.comments
  (company_id, order_id, author, text, created_at)
VALUES
  (2,'МП-0041','Анна М.', 'Эскиз согласован с клиентом, приступаем к распилу.',        '2026-04-12 14:32:00+03'),
  (2,'МП-0041','Игорь В.','Материал заготовлен, начали обработку. Срок — 3 дня.',      '2026-04-15 09:10:00+03'),
  (2,'МП-0041','Олег К.', 'Клиент звонил, просит успеть к 25 апреля.',                '2026-04-18 17:45:00+03'),
  (2,'МП-0040','Анна М.', 'Эскиз отправлен клиенту, ждём подтверждения.',              '2026-04-10 11:00:00+03'),
  (2,'МП-0039','Олег К.', 'Готов к выдаче. Клиент перенёс визит на следующую неделю.','2026-04-25 10:00:00+03');

-- Каталог
INSERT INTO t_p9542363_memorial_crm_mvp.catalog_items
  (id, company_id, name, category, unit, price, cost, calc_type, active, comment, used_in_orders, created_by)
VALUES
  ('c01',2,'Памятник стандартный 100×50×8',  'monument', 'шт.',   22000,11000,'fixed',   TRUE, 'Базовый размер, гранит чёрный',48,'Дмитрий С.'),
  ('c02',2,'Памятник премиум 120×60×10',     'monument', 'шт.',   38000,19000,'fixed',   TRUE, 'Полировка с двух сторон',      21,'Дмитрий С.'),
  ('c03',2,'Памятник индивидуальный',        'monument', 'шт.',       0,    0,'manual',  TRUE, 'Цена рассчитывается по размеру',14,'Дмитрий С.'),
  ('c04',2,'Памятник мраморный белый',       'monument', 'шт.',   45000,24000,'fixed',   TRUE, 'Мрамор итальянский',            7,'Дмитрий С.'),
  ('c05',2,'Тумба гранитная стандартная',    'pedestal', 'шт.',    8500, 4200,'fixed',   TRUE, '',                             19,'Дмитрий С.'),
  ('c06',2,'Тумба с вазой',                  'pedestal', 'шт.',   11000, 5500,'fixed',   TRUE, 'С отверстием под цветы',       12,'Дмитрий С.'),
  ('c07',2,'Цветник гранитный 60×40',        'flowerbed','шт.',    7000, 3500,'fixed',   TRUE, '',                             11,'Дмитрий С.'),
  ('c08',2,'Цветник мраморный с бортиком',   'flowerbed','шт.',    9500, 5000,'fixed',   TRUE, '',                              5,'Дмитрий С.'),
  ('c09',2,'Ограда металлическая 2×3 м',     'fence',   'компл.', 18000, 8500,'template',TRUE, 'Покраска порошком',             8,'Дмитрий С.'),
  ('c10',2,'Ограда кованая индивидуальная',  'fence',   'м.п.',       0,    0,'manual',  TRUE, 'Цена по погонному метру',       3,'Дмитрий С.'),
  ('c11',2,'Гроб сосновый стандарт',         'coffin',  'шт.',    5500, 2800,'fixed',   TRUE, '',                             16,'Дмитрий С.'),
  ('c12',2,'Гроб дубовый премиум',           'coffin',  'шт.',   18000, 9500,'fixed',   TRUE, '',                              6,'Дмитрий С.'),
  ('c13',2,'Крест металлический стандарт',   'cross',   'шт.',    3500, 1500,'fixed',   TRUE, '',                             22,'Дмитрий С.'),
  ('c14',2,'Крест гранитный',                'cross',   'шт.',   12000, 6000,'fixed',   TRUE, '',                              9,'Дмитрий С.'),
  ('c15',2,'Портретная гравировка',          'art',     'шт.',    7000, 2500,'manual',  TRUE, 'Цена зависит от сложности',    31,'Дмитрий С.'),
  ('c16',2,'Цветная гравировка',             'art',     'шт.',    9500, 3500,'manual',  TRUE, '',                             14,'Дмитрий С.'),
  ('c17',2,'Надпись (гравировка текста)',     'art',     'шт.',    4500, 1800,'fixed',   TRUE, 'До 100 символов',              52,'Дмитрий С.'),
  ('c18',2,'Орнамент / декор',               'art',     'шт.',    3800, 1500,'fixed',   FALSE,'Временно приостановлено',       8,'Дмитрий С.'),
  ('c19',2,'Доставка по Москве',             'service', 'поезд.', 3500, 1800,'fixed',   TRUE, '',                             38,'Дмитрий С.'),
  ('c20',2,'Установка памятника',            'service', 'шт.',    5000, 2500,'fixed',   TRUE, 'Включает выравнивание',        29,'Дмитрий С.'),
  ('c21',2,'Доставка за МКАД (за км)',        'service', 'км',       50,   25,'formula', TRUE, 'Считается от МКАД',            15,'Дмитрий С.'),
  ('c22',2,'Демонтаж старого памятника',     'service', 'шт.',    4000, 1800,'fixed',   TRUE, '',                              7,'Дмитрий С.'),
  ('c23',2,'Уборка захоронения',             'service', 'шт.',    2500, 1000,'fixed',   FALSE,'',                              4,'Дмитрий С.');

-- Склад готовых изделий
INSERT INTO t_p9542363_memorial_crm_mvp.stock_items
  (company_id, catalog_id, name, category, qty, price, added_at)
VALUES
  (2,'c01','Памятник стандартный 100×50×8','monument', 3,22000,DATE '2026-04-15'),
  (2,'c05','Тумба гранитная стандартная',  'pedestal', 5, 8500,DATE '2026-04-18'),
  (2,'c07','Цветник гранитный 60×40',      'flowerbed',2, 7000,DATE '2026-04-20'),
  (2,'c13','Крест металлический стандарт', 'cross',    8, 3500,DATE '2026-04-22'),
  (2,'c02','Памятник премиум 120×60×10',   'monument', 1,38000,DATE '2026-04-25');

-- Задачи на нарезку
INSERT INTO t_p9542363_memorial_crm_mvp.cutting_tasks
  (company_id, blank_type_id, material_name, total_qty, done_qty, in_progress_qty, status, deadline)
SELECT 2, bt.id, bt.material, 10, 4, 0, 'active', DATE '2026-05-05'
FROM t_p9542363_memorial_crm_mvp.blank_types bt
WHERE bt.company_id=2 AND bt.name='Плита стандарт';

INSERT INTO t_p9542363_memorial_crm_mvp.cutting_tasks
  (company_id, blank_type_id, material_name, total_qty, done_qty, in_progress_qty, status)
SELECT 2, bt.id, bt.material, 6, 0, 0, 'pending'
FROM t_p9542363_memorial_crm_mvp.blank_types bt
WHERE bt.company_id=2 AND bt.name='Плита большая';

-- Смены
INSERT INTO t_p9542363_memorial_crm_mvp.shifts
  (company_id, place_id, employee_id, work_type, shift_date, status, started_at)
SELECT 2, p.id, e.id, 'cutting', CURRENT_DATE, 'active', '08:00'::time
FROM t_p9542363_memorial_crm_mvp.places p,
     t_p9542363_memorial_crm_mvp.employees e
WHERE p.company_id=2 AND p.name LIKE 'Место 1%'
  AND e.company_id=2 AND e.name='Игорь В.';

INSERT INTO t_p9542363_memorial_crm_mvp.shifts
  (company_id, place_id, employee_id, work_type, shift_date, status, started_at, finished_at)
SELECT 2, p.id, e.id, 'cutting', CURRENT_DATE, 'done', '08:00'::time, '14:30'::time
FROM t_p9542363_memorial_crm_mvp.places p,
     t_p9542363_memorial_crm_mvp.employees e
WHERE p.company_id=2 AND p.name LIKE 'Место 2%'
  AND e.company_id=2 AND e.name='Павел Н.';

-- Результаты смены
INSERT INTO t_p9542363_memorial_crm_mvp.shift_results
  (shift_id, blank_type_id, produced, raw_auto, raw_used, order_ref, sort_order)
SELECT s.id, bt.id, 4, TRUE, 2.0, 'МП-0040', 1
FROM t_p9542363_memorial_crm_mvp.shifts s
JOIN t_p9542363_memorial_crm_mvp.blank_types bt ON bt.company_id=2 AND bt.name='Плита стандарт'
WHERE s.company_id=2 AND s.status='done';

INSERT INTO t_p9542363_memorial_crm_mvp.shift_results
  (shift_id, blank_type_id, produced, raw_auto, raw_used, order_ref, sort_order)
SELECT s.id, bt.id, 2, TRUE, 2.88, 'На склад', 2
FROM t_p9542363_memorial_crm_mvp.shifts s
JOIN t_p9542363_memorial_crm_mvp.blank_types bt ON bt.company_id=2 AND bt.name='Тумба'
WHERE s.company_id=2 AND s.status='done';

-- Движения склада
INSERT INTO t_p9542363_memorial_crm_mvp.warehouse_movements
  (company_id, move_date, move_type, material_id, qty, price_per_unit, total_sum, note, receipt_id, order_ref, remain_after)
SELECT 2, mv.mdate, mv.mtype, m.id, mv.qty, mv.ppu, mv.total, mv.note, mv.receipt, mv.oref, mv.remain
FROM t_p9542363_memorial_crm_mvp.materials m,
(VALUES
  (DATE '2026-04-20','use','Габбро-диабаз',   1.0::numeric,NULL::numeric,NULL::numeric,'Списание на заказ МП-0041',NULL::varchar,'МП-0041',13.5::numeric),
  (DATE '2026-04-18','cut','Шонгуй',           2.0,NULL,NULL,'Нарезка: Плита большая',NULL,NULL,5.2),
  (DATE '2026-04-15','in', 'Габбро-диабаз',   5.0,4200.00,21000.00,'Приход от поставщика','КР-0041',NULL,19.5),
  (DATE '2026-04-10','use','Мрамор',           0.32,NULL,NULL,'Списание на заказ МП-0040',NULL,'МП-0040',1.78),
  (DATE '2026-04-05','in', 'Дымовский гранит',3.1,5100.00,15810.00,'Приход от поставщика','КР-0039',NULL,3.6),
  (DATE '2026-04-01','adjust','Серый гранит', 0.5,NULL,NULL,'Корректировка инвентаризации',NULL,NULL,5.5)
) AS mv(mdate,mtype,mat_name,qty,ppu,total,note,receipt,oref,remain)
WHERE m.company_id=2 AND m.name=mv.mat_name;
