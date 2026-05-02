
-- ══════════════════════════════════════════════
-- MEMORIAL CRM — Полная схема БД
-- ══════════════════════════════════════════════

-- 1. Компании (мультиарендность)
CREATE TABLE companies (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Пользователи / авторизация
CREATE TABLE users (
    id           SERIAL PRIMARY KEY,
    company_id   INTEGER NOT NULL REFERENCES companies(id),
    login        VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(200) NOT NULL,
    display_name VARCHAR(100),
    role         VARCHAR(30) NOT NULL DEFAULT 'manager',
    active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Сотрудники
CREATE TABLE employees (
    id          SERIAL PRIMARY KEY,
    company_id  INTEGER NOT NULL REFERENCES companies(id),
    name        VARCHAR(100) NOT NULL,
    role        VARCHAR(50),
    phone       VARCHAR(30),
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Клиенты
CREATE TABLE clients (
    id          SERIAL PRIMARY KEY,
    company_id  INTEGER NOT NULL REFERENCES companies(id),
    name        VARCHAR(200) NOT NULL,
    phone       VARCHAR(30),
    city        VARCHAR(100),
    address     TEXT,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    comment     TEXT,
    manager     VARCHAR(100),
    since_label VARCHAR(20),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Заказы
CREATE TABLE orders (
    id             VARCHAR(20) PRIMARY KEY,
    company_id     INTEGER NOT NULL REFERENCES companies(id),
    client_id      INTEGER REFERENCES clients(id),
    client_name    VARCHAR(200) NOT NULL,
    phone          VARCHAR(30),
    stone          VARCHAR(100),
    size           VARCHAR(50),
    inscription    TEXT,
    design         TEXT,
    status         VARCHAR(50) NOT NULL DEFAULT 'Эскиз',
    status_color   VARCHAR(10) NOT NULL DEFAULT '#6366f1',
    amount         NUMERIC(12,2) NOT NULL DEFAULT 0,
    paid           NUMERIC(12,2) NOT NULL DEFAULT 0,
    order_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    deadline       DATE,
    manager        VARCHAR(100),
    comment        TEXT,
    current_stage  INTEGER NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Позиции заказа
CREATE TABLE order_items (
    id          SERIAL PRIMARY KEY,
    order_id    VARCHAR(20) NOT NULL REFERENCES orders(id),
    name        VARCHAR(200) NOT NULL,
    qty         NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit        VARCHAR(30) NOT NULL DEFAULT 'шт.',
    price       NUMERIC(12,2) NOT NULL DEFAULT 0,
    approved    BOOLEAN,
    has_calc    BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order  INTEGER NOT NULL DEFAULT 0
);

-- 7. Оплаты
CREATE TABLE payments (
    id          SERIAL PRIMARY KEY,
    order_id    VARCHAR(20) NOT NULL REFERENCES orders(id),
    company_id  INTEGER NOT NULL REFERENCES companies(id),
    amount      NUMERIC(12,2) NOT NULL,
    paid_at     DATE NOT NULL DEFAULT CURRENT_DATE,
    note        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Комментарии
CREATE TABLE comments (
    id          SERIAL PRIMARY KEY,
    company_id  INTEGER NOT NULL REFERENCES companies(id),
    order_id    VARCHAR(20) REFERENCES orders(id),
    client_id   INTEGER REFERENCES clients(id),
    author      VARCHAR(100) NOT NULL,
    text        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Каталог товаров
CREATE TABLE catalog_items (
    id             VARCHAR(20) PRIMARY KEY,
    company_id     INTEGER NOT NULL REFERENCES companies(id),
    name           VARCHAR(200) NOT NULL,
    category       VARCHAR(50) NOT NULL,
    unit           VARCHAR(30) NOT NULL DEFAULT 'шт.',
    price          NUMERIC(12,2) NOT NULL DEFAULT 0,
    cost           NUMERIC(12,2) NOT NULL DEFAULT 0,
    calc_type      VARCHAR(20) NOT NULL DEFAULT 'fixed',
    active         BOOLEAN NOT NULL DEFAULT TRUE,
    comment        TEXT,
    used_in_orders INTEGER NOT NULL DEFAULT 0,
    created_by     VARCHAR(100),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Рабочие места / станки
CREATE TABLE places (
    id          SERIAL PRIMARY KEY,
    company_id  INTEGER NOT NULL REFERENCES companies(id),
    name        VARCHAR(150) NOT NULL,
    machine     VARCHAR(100) NOT NULL,
    work_types  TEXT[] NOT NULL DEFAULT '{}',
    active      BOOLEAN NOT NULL DEFAULT TRUE
);

-- 11. Типы заготовок
CREATE TABLE blank_types (
    id           SERIAL PRIMARY KEY,
    company_id   INTEGER NOT NULL REFERENCES companies(id),
    name         VARCHAR(150) NOT NULL,
    size         VARCHAR(50) NOT NULL,
    material     VARCHAR(100) NOT NULL,
    raw_per_unit NUMERIC(8,3) NOT NULL DEFAULT 0,
    active       BOOLEAN NOT NULL DEFAULT TRUE
);

-- 12. Сырьё (материалы на складе)
CREATE TABLE materials (
    id          SERIAL PRIMARY KEY,
    company_id  INTEGER NOT NULL REFERENCES companies(id),
    name        VARCHAR(150) NOT NULL,
    unit        VARCHAR(20) NOT NULL DEFAULT 'м²',
    qty         NUMERIC(10,3) NOT NULL DEFAULT 0,
    min_qty     NUMERIC(10,3) NOT NULL DEFAULT 0,
    price       NUMERIC(12,2) NOT NULL DEFAULT 0,
    image_url   TEXT,
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Заготовки
CREATE TABLE blanks (
    id          SERIAL PRIMARY KEY,
    company_id  INTEGER NOT NULL REFERENCES companies(id),
    material_id INTEGER REFERENCES materials(id),
    name        VARCHAR(150) NOT NULL,
    size        VARCHAR(50),
    qty         NUMERIC(10,2) NOT NULL DEFAULT 0,
    min_qty     NUMERIC(10,2) NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Движения материалов
CREATE TABLE warehouse_movements (
    id             SERIAL PRIMARY KEY,
    company_id     INTEGER NOT NULL REFERENCES companies(id),
    move_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    move_type      VARCHAR(20) NOT NULL,
    material_id    INTEGER REFERENCES materials(id),
    blank_id       INTEGER REFERENCES blanks(id),
    qty            NUMERIC(10,3) NOT NULL DEFAULT 0,
    price_per_unit NUMERIC(12,2),
    total_sum      NUMERIC(12,2),
    note           TEXT NOT NULL DEFAULT '',
    receipt_id     VARCHAR(50),
    order_ref      VARCHAR(20),
    remain_after   NUMERIC(10,3),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Задачи на нарезку
CREATE TABLE cutting_tasks (
    id              SERIAL PRIMARY KEY,
    company_id      INTEGER NOT NULL REFERENCES companies(id),
    blank_type_id   INTEGER REFERENCES blank_types(id),
    material_name   VARCHAR(150),
    total_qty       INTEGER NOT NULL DEFAULT 0,
    done_qty        INTEGER NOT NULL DEFAULT 0,
    in_progress_qty INTEGER NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    deadline        DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Смены
CREATE TABLE shifts (
    id                SERIAL PRIMARY KEY,
    company_id        INTEGER NOT NULL REFERENCES companies(id),
    place_id          INTEGER REFERENCES places(id),
    employee_id       INTEGER REFERENCES employees(id),
    work_type         VARCHAR(30) NOT NULL,
    shift_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    status            VARCHAR(20) NOT NULL DEFAULT 'active',
    started_at        TIME,
    finished_at       TIME,
    task_id           INTEGER REFERENCES cutting_tasks(id),
    task_qty_assigned INTEGER,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Результаты смены
CREATE TABLE shift_results (
    id            SERIAL PRIMARY KEY,
    shift_id      INTEGER NOT NULL REFERENCES shifts(id),
    blank_type_id INTEGER REFERENCES blank_types(id),
    produced      INTEGER NOT NULL DEFAULT 0,
    raw_auto      BOOLEAN NOT NULL DEFAULT TRUE,
    raw_used      NUMERIC(10,3) NOT NULL DEFAULT 0,
    order_ref     VARCHAR(20),
    sort_order    INTEGER NOT NULL DEFAULT 0
);

-- 18. Готовые изделия на складе
CREATE TABLE stock_items (
    id          SERIAL PRIMARY KEY,
    company_id  INTEGER NOT NULL REFERENCES companies(id),
    catalog_id  VARCHAR(20) REFERENCES catalog_items(id),
    name        VARCHAR(200) NOT NULL,
    category    VARCHAR(50) NOT NULL,
    qty         INTEGER NOT NULL DEFAULT 0,
    price       NUMERIC(12,2) NOT NULL DEFAULT 0,
    note        TEXT,
    added_at    DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX idx_orders_company     ON orders(company_id);
CREATE INDEX idx_orders_client      ON orders(client_id);
CREATE INDEX idx_orders_status      ON orders(status);
CREATE INDEX idx_orders_deadline    ON orders(deadline);
CREATE INDEX idx_clients_company    ON clients(company_id);
CREATE INDEX idx_materials_company  ON materials(company_id);
CREATE INDEX idx_blanks_material    ON blanks(material_id);
CREATE INDEX idx_wh_movements_mat   ON warehouse_movements(material_id);
CREATE INDEX idx_wh_movements_date  ON warehouse_movements(move_date);
CREATE INDEX idx_shifts_date        ON shifts(shift_date);
CREATE INDEX idx_shifts_company     ON shifts(company_id);
CREATE INDEX idx_cut_tasks_company  ON cutting_tasks(company_id);
CREATE INDEX idx_comments_order     ON comments(order_id);
CREATE INDEX idx_payments_order     ON payments(order_id);
