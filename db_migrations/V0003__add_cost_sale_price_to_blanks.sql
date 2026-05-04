ALTER TABLE t_p9542363_memorial_crm_mvp.blanks
  ADD COLUMN IF NOT EXISTS cost_price numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sale_price numeric(12,2) NOT NULL DEFAULT 0;