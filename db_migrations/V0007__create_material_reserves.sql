CREATE TABLE IF NOT EXISTS t_p9542363_memorial_crm_mvp.material_reserves (
  id            SERIAL PRIMARY KEY,
  company_id    INTEGER NOT NULL,
  material_id   INTEGER NOT NULL,
  task_id       INTEGER,
  qty           NUMERIC(10,2) NOT NULL DEFAULT 0,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at   TIMESTAMPTZ,
  active        BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_material_reserves_company
  ON t_p9542363_memorial_crm_mvp.material_reserves(company_id, active);
CREATE INDEX IF NOT EXISTS idx_material_reserves_task
  ON t_p9542363_memorial_crm_mvp.material_reserves(task_id);
