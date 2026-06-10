/**
 * Типы данных из базы данных (DB → API).
 * Импортируй отсюда, а не из client.ts.
 */

export type UserInfo = {
  id: number;
  login: string;
  displayName: string;
  role: string;
  companyId: number;
  companyName?: string;
};

/* ── Orders ───────────────────────────────────── */
export type DbOrder = {
  id: string;
  company_id: number;
  client_id?: number;
  client_name: string;
  phone?: string;
  stone?: string;
  size?: string;
  inscription?: string;
  design?: string;
  status: string;
  status_color: string;
  amount: number;
  paid: number;
  order_date: string;
  deadline?: string;
  manager?: string;
  comment?: string;
  current_stage: number;
  deadline_state?: string;
  pay_status?: string;
  items?: DbOrderItem[];
  comments?: DbComment[];
};

export type DbOrderItem = {
  id: number;
  order_id: string;
  name: string;
  qty: number;
  unit: string;
  price: number;
  approved?: boolean | null;
  has_calc: boolean;
  sort_order: number;
};

export type DbComment = {
  id: number;
  author: string;
  text: string;
  created_at: string;
};

export type DbOrderStats = {
  chart: { label: string; revenue: number; orders_count: number }[];
  totals: {
    total_orders: number;
    total_revenue: number;
    total_debt: number;
    avg_check: number;
    overdue_count: number;
    partial_count: number;
    unpaid_count: number;
  };
  topClients: { name: string; total: number; orders: number }[];
  stones: { name: string; count: number; pct: number }[];
  deficit: { name: string; free: number; min: number; unit: string }[];
  inProduction: number;
};

export type DbProductionOrder = {
  id: string;
  client_name: string;
  phone?: string;
  stone?: string;
  size?: string;
  status: string;
  current_stage: number;
  deadline?: string;
  manager?: string;
  amount: number;
  paid: number;
  comment?: string;
  deadline_state: "overdue" | "soon" | "ok";
  payment_label: string;
};

/* ── Clients ──────────────────────────────────── */
export type DbClient = {
  id: number;
  company_id: number;
  name: string;
  phone?: string;
  city?: string;
  address?: string;
  active: boolean;
  comment?: string;
  manager?: string;
  since_label?: string;
  orders_count?: number;
  total_amount?: number;
  total_paid?: number;
  last_order_date?: string;
  orders?: DbOrder[];
  comments?: DbComment[];
};

/* ── Warehouse ────────────────────────────────── */
export type DbMaterial = {
  id: number;
  name: string;
  unit: string;
  qty: number;
  min_qty: number;
  price: number;
  image_url?: string;
};

export type DbBlank = {
  id: number;
  material_id: number;
  material_name?: string;
  name: string;
  size?: string;
  qty: number;
  min_qty: number;
  cost_price?: number;
  sale_price?: number;
  blank_type_id?: number;
  raw_per_unit?: number;
  material_price?: number;
};

export type DbMovement = {
  id: number;
  move_date: string;
  move_type: string;
  material_id?: number;
  material_name?: string;
  blank_id?: number;
  blank_name?: string;
  qty: number;
  price_per_unit?: number;
  total_sum?: number;
  note: string;
  receipt_id?: string;
  order_ref?: string;
  remain_after?: number;
};

export type DbStockItem = {
  id: number;
  catalog_id?: string;
  name: string;
  category: string;
  qty: number;
  price: number;
  cost_price?: number;
  note?: string;
  added_at: string;
};

export type DbMaterialReserve = {
  id: number;
  material_id: number;
  task_id?: number;
  qty: number;
  note?: string;
  material_name?: string;
  task_status?: string;
  blank_name?: string;
  blank_size?: string;
  done_qty?: number;
  total_qty?: number;
};

/* ── Cutting ──────────────────────────────────── */
export type DbCuttingTask = {
  id: number;
  blank_type_id?: number;
  blank_name?: string;
  blank_size?: string;
  material_name?: string;
  total_qty: number;
  done_qty: number;
  in_progress_qty: number;
  status: string;
  deadline?: string;
  created_at: string;
  updated_at?: string;
};

export type DbShift = {
  id: number;
  place_id: number;
  place_name?: string;
  machine?: string;
  employee_id: number;
  employee_name?: string;
  work_type: string;
  shift_date: string;
  status: string;
  started_at?: string;
  finished_at?: string;
  task_id?: number;
  task_qty_assigned?: number;
  results: DbShiftResult[];
};

export type DbShiftResult = {
  id: number;
  blank_type_id?: number;
  blank_name?: string;
  material?: string;
  produced: number;
  raw_used: number;
  order_ref?: string;
};

export type DbPlace = {
  id: number;
  name: string;
  machine: string;
  work_types: string[];
};

export type DbEmployee = {
  id: number;
  name: string;
  role?: string;
};

export type DbBlankType = {
  id: number;
  name: string;
  size: string;
  material: string;
  raw_per_unit: number;
};

/* ── Settings ─────────────────────────────────── */
export type DbStage = {
  id: number;
  label: string;
  color: string;
  days: number;
  sort_order: number;
  active: boolean;
};

export type DbEstimateTemplate = {
  id: number;
  name: string;
  price: number;
  unit: string;
  active: boolean;
  sort_order: number;
};

/* ── Catalog ──────────────────────────────────── */
export type DbCatalogItem = {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  cost: number;
  calc_type: string;
  active: boolean;
  comment?: string;
  used_in_orders: number;
  created_by?: string;
  stock_qty?: number;
};
