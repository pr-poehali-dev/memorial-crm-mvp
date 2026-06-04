const URLS = {
  auth:      "https://functions.poehali.dev/0e06719c-34f7-4c26-8b70-560def4ad283",
  orders:    "https://functions.poehali.dev/9a0900f9-bce7-4297-8845-9ae158944320",
  clients:   "https://functions.poehali.dev/5c7d2169-a671-4e0a-91a1-c3d2ad0c7d35",
  warehouse: "https://functions.poehali.dev/394b9d79-d492-44cc-8a4b-d92916ad4d0b",
  cutting:   "https://functions.poehali.dev/a191e962-1806-4049-bba4-51aa5384f467",
};

function getToken(): string {
  return localStorage.getItem("crm_token") || "";
}

async function request<T>(
  fn: keyof typeof URLS,
  method: string,
  params: Record<string, string> = {},
  body?: unknown
): Promise<T> {
  const url = new URL(URLS[fn]);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Session-Token": getToken(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data: unknown;
  try {
    // Бэкенд возвращает JSON как строку (двойная сериализация) — распаковываем
    data = JSON.parse(text);
    if (typeof data === "string") data = JSON.parse(data);
  } catch {
    data = text;
  }

  if (!res.ok) {
    const err = (data as { error?: string })?.error || `HTTP ${res.status}`;
    throw new Error(err);
  }
  return data as T;
}

// ── Auth ──
export const authApi = {
  login: (login: string, password: string) =>
    request<{ token: string; user: UserInfo }>("auth", "POST", { section: "login" }, { login, password }),
  me: () =>
    request<{ user: UserInfo }>("auth", "GET", { section: "me" }),
};

// ── Orders ──
export const ordersApi = {
  list:  () => request<DbOrder[]>("orders", "GET"),
  get:   (id: string) => request<DbOrder>("orders", "GET", { id }),
  stats:      (period: "week" | "month" | "year") => request<DbOrderStats>("orders", "GET", { section: "stats", period }),
  production: () => request<DbProductionOrder[]>("orders", "GET", { section: "production" }),
  create: (data: Partial<DbOrder>) => request<{ id: string }>("orders", "POST", {}, data),
  update: (id: string, data: Partial<DbOrder>) => request<{ ok: boolean }>("orders", "PUT", { id }, data),
};

// ── Clients ──
export const clientsApi = {
  list:   () => request<DbClient[]>("clients", "GET"),
  get:    (id: string) => request<DbClient>("clients", "GET", { id }),
  create: (data: Partial<DbClient>) => request<{ id: number }>("clients", "POST", {}, data),
  update: (id: string, data: Partial<DbClient>) => request<{ ok: boolean }>("clients", "PUT", { id }, data),
};

// ── Settings (employees, stages, estimate_templates) ──
export const settingsApi = {
  employees:         () => request<DbEmployee[]>("clients", "GET", { section: "employees" }),
  stages:            () => request<DbStage[]>("clients", "GET", { section: "stages" }),
  estimateTemplates: () => request<DbEstimateTemplate[]>("clients", "GET", { section: "estimate_templates" }),
  createEmployee:    (data: Record<string, unknown>) => request<{ id: number }>("clients", "POST", { section: "employees" }, data),
  updateEmployee:    (id: number, data: Record<string, unknown>) => request<{ ok: boolean }>("clients", "PUT", { section: "employees", id: String(id) }, data),
  createStage:       (data: Record<string, unknown>) => request<{ id: number }>("clients", "POST", { section: "stages" }, data),
  updateStage:       (id: number, data: Record<string, unknown>) => request<{ ok: boolean }>("clients", "PUT", { section: "stages", id: String(id) }, data),
  createTemplate:    (data: Record<string, unknown>) => request<{ id: number }>("clients", "POST", { section: "estimate_templates" }, data),
  updateTemplate:    (id: number, data: Record<string, unknown>) => request<{ ok: boolean }>("clients", "PUT", { section: "estimate_templates", id: String(id) }, data),
};

// ── Warehouse ──
export type DbMaterialReserve = {
  id: number;
  material_id: number;
  task_id?: number;
  qty: number;
  note?: string;
  material_name?: string;
  task_status?: string;
};

export const warehouseApi = {
  materials: () => request<DbMaterial[]>("warehouse", "GET", { section: "materials" }),
  blanks:    () => request<DbBlank[]>("warehouse", "GET", { section: "blanks" }),
  movements: () => request<DbMovement[]>("warehouse", "GET", { section: "movements" }),
  stock:     () => request<DbStockItem[]>("warehouse", "GET", { section: "stock" }),
  reserves:  () => request<DbMaterialReserve[]>("warehouse", "GET", { section: "reserves" }),
  addMaterial: (data: Partial<DbMaterial>) =>
    request<{ id: number }>("warehouse", "POST", { action: "add_material" }, data),
  movement: (action: "in"|"cut"|"use"|"adjust", data: Record<string, unknown>) =>
    request<{ ok: boolean }>("warehouse", "POST", { action }, data),
  useBlank: (data: Record<string, unknown>) =>
    request<{ ok: boolean }>("warehouse", "POST", { action: "use_blank" }, data),
  useAny: (data: { itemType: "raw"|"blank"|"stock"; itemId: number; qty: number; note?: string; orderRef?: string }) =>
    request<{ ok: boolean }>("warehouse", "POST", { action: "use_any" }, data),
  addStock: (data: Record<string, unknown>) =>
    request<{ id: number }>("warehouse", "POST", { action: "add_stock" }, data),
  updateStockQty: (id: number, delta: number) =>
    request<{ ok: boolean; qty: number }>("warehouse", "POST", { action: "update_stock_qty" }, { id, delta }),
  removeStock: (id: number) =>
    request<{ ok: boolean }>("warehouse", "POST", { action: "remove_stock" }, { id }),
};

// ── Cutting ──
export const cuttingApi = {
  tasks:      () => request<DbCuttingTask[]>("cutting", "GET", { section: "tasks" }),
  shifts:     (date?: string) => request<DbShift[]>("cutting", "GET", date ? { section: "shifts", date } : { section: "shifts" }),
  places:     () => request<DbPlace[]>("cutting", "GET", { section: "places" }),
  employees:  () => request<DbEmployee[]>("cutting", "GET", { section: "employees" }),
  blankTypes: () => request<DbBlankType[]>("cutting", "GET", { section: "blank_types" }),
  createTask: (data: Record<string, unknown>) =>
    request<{ id: number }>("cutting", "POST", { action: "create_task" }, data),
  assignShift: (data: Record<string, unknown>) =>
    request<{ id: number }>("cutting", "POST", { action: "assign_shift" }, data),
  finishShift: (data: Record<string, unknown>) =>
    request<{ ok: boolean }>("cutting", "POST", { action: "finish_shift" }, data),
  updateTask:  (data: Record<string, unknown>) =>
    request<{ ok: boolean }>("cutting", "POST", { action: "update_task" }, data),
  cancelTask:  (taskId: number) =>
    request<{ ok: boolean }>("cutting", "POST", { action: "cancel_task" }, { taskId }),
};

// ── Catalog ──
export const catalogApi = {
  list: () => request<DbCatalogItem[]>("auth", "GET", { section: "catalog" }),
  create: (data: Record<string, unknown>) =>
    request<{ id: string }>("auth", "POST", { section: "catalog" }, data),
  update: (id: string, data: Record<string, unknown>) =>
    request<{ ok: boolean }>("auth", "PUT", { section: "catalog", id }, data),
};

// ── Типы ──
export type UserInfo = {
  id: number;
  login: string;
  displayName: string;
  role: string;
  companyId: number;
  companyName?: string;
};

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
  note?: string;
  added_at: string;
};

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