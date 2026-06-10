ALTER TABLE t_p9542363_memorial_crm_mvp.companies
  ADD COLUMN IF NOT EXISTS slug VARCHAR(80) UNIQUE,
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE t_p9542363_memorial_crm_mvp.companies SET slug = 'company-' || id WHERE slug IS NULL;

CREATE TABLE IF NOT EXISTS t_p9542363_memorial_crm_mvp.company_members (
  id          SERIAL PRIMARY KEY,
  company_id  INTEGER NOT NULL REFERENCES t_p9542363_memorial_crm_mvp.companies(id),
  name        VARCHAR(100) NOT NULL,
  role        VARCHAR(30)  NOT NULL DEFAULT 'manager',
  active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO t_p9542363_memorial_crm_mvp.company_members (company_id, name, role)
SELECT 2, 'Владелец', 'owner'
WHERE NOT EXISTS (
  SELECT 1 FROM t_p9542363_memorial_crm_mvp.company_members WHERE company_id = 2
);

INSERT INTO t_p9542363_memorial_crm_mvp.company_members (company_id, name, role)
SELECT 2, 'Менеджер', 'manager'
WHERE NOT EXISTS (
  SELECT 1 FROM t_p9542363_memorial_crm_mvp.company_members WHERE company_id = 2 AND role = 'manager'
);
