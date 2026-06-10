/**
 * API-клиент. Типы данных — в ./types.ts
 */
export type {
  UserInfo,
  DbOrder, DbOrderItem, DbComment, DbOrderStats, DbProductionOrder,
  DbClient,
  DbMaterial, DbBlank, DbMovement, DbStockItem, DbMaterialReserve,
  DbCuttingTask, DbShift, DbShiftResult, DbPlace, DbEmployee, DbBlankType,
  DbStage, DbEstimateTemplate,
  DbCatalogItem,
} from "./types";

import type {
  UserInfo,
  DbOrder, DbOrderStats, DbProductionOrder,
  DbClient,
  DbMaterial, DbBlank, DbMovement, DbStockItem, DbMaterialReserve,
  DbCuttingTask, DbShift, DbPlace, DbEmployee, DbBlankType,
  DbStage, DbEstimateTemplate,
  DbCatalogItem,
} from "./types";

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

/* ── In-memory GET-кэш (TTL 45 сек) ── */
const REQ_CACHE = new Map<string, { data: unknown; ts: number }>();
const REQ_TTL = 45_000;

function getCacheKey(fn: string, params: Record<string, string>): string {
  return fn + ":" + JSON.stringify(params);
}

async function request<T>(
  fn: keyof typeof URLS,
  method: string,
  params: Record<string, string> = {},
  body?: unknown
): Promise<T> {
  const url = new URL(URLS[fn]);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  if (method === "GET") {
    const key = getCacheKey(fn, params);
    const hit = REQ_CACHE.get(key);
    if (hit && Date.now() - hit.ts < REQ_TTL) return hit.data as T;
  }

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
    data = JSON.parse(text);
    if (typeof data === "string") data = JSON.parse(data);
  } catch {
    data = text;
  }

  if (!res.ok) {
    const err = (data as { error?: string })?.error || `HTTP ${res.status}`;
    throw new Error(err);
  }

  if (method === "GET") {
    REQ_CACHE.set(getCacheKey(fn, params), { data, ts: Date.now() });
  }

  return data as T;
}

/* Сбросить кэш (вызывать после POST/PUT/DELETE) */
export function clearRequestCache(fn?: keyof typeof URLS) {
  if (fn) {
    for (const key of REQ_CACHE.keys()) {
      if (key.startsWith(fn + ":")) REQ_CACHE.delete(key);
    }
  } else {
    REQ_CACHE.clear();
  }
}

// ── Auth ──────────────────────────────────────────────────────────
export const authApi = {
  login: (login: string, password: string) =>
    request<{ token: string; user: UserInfo }>("auth", "POST", { section: "login" }, { login, password }),
  me: () =>
    request<{ user: UserInfo }>("auth", "GET", { section: "me" }),
  // Вход по slug компании
  getCompanyBySlug: (slug: string) =>
    request<{ id: number; name: string }>("auth", "GET", { section: "slug_entry", slug }),
  getCompanyRoles: (slug: string) =>
    request<{ id: number; name: string; role: string }[]>("auth", "GET", { section: "slug_roles", slug }),
  enterRole: (memberId: number) =>
    request<{ token: string; user: UserInfo }>("auth", "POST", { section: "enter_role" }, { memberId }),
  // Admin
  adminCompanies: () =>
    request<{ id: number; name: string; slug: string; active: boolean; created_at: string; members_count: number }[]>("auth", "GET", { section: "admin_companies" }),
  adminCreateCompany: (name: string) =>
    request<{ id: number; slug: string }>("auth", "POST", { section: "admin_companies" }, { name }),
  adminMembers: (companyId: number) =>
    request<{ id: number; name: string; role: string; active: boolean }[]>("auth", "GET", { section: "admin_members", company_id: String(companyId) }),
  adminAddMember: (companyId: number, name: string, role: string) =>
    request<{ id: number }>("auth", "POST", { section: "admin_members" }, { companyId, name, role }),
  adminUpdateMember: (memberId: number, data: { name?: string; role?: string; active?: boolean }) =>
    request<{ ok: boolean }>("auth", "PUT", { section: "admin_members", id: String(memberId) }, data),
};

// ── Orders ────────────────────────────────────────────────────────
export const ordersApi = {
  list:       () => request<DbOrder[]>("orders", "GET"),
  get:        (id: string) => request<DbOrder>("orders", "GET", { id }),
  stats: (period: "week" | "month" | "year" | "custom", dateFrom?: string, dateTo?: string) => {
    const p: Record<string, string> = { section: "stats", period };
    if (period === "custom" && dateFrom && dateTo) { p.date_from = dateFrom; p.date_to = dateTo; }
    return request<DbOrderStats>("orders", "GET", p);
  },
  production: () => request<DbProductionOrder[]>("orders", "GET", { section: "production" }),
  create:     (data: Partial<DbOrder>) => request<{ id: string }>("orders", "POST", {}, data),
  update:     (id: string, data: Partial<DbOrder>) => request<{ ok: boolean }>("orders", "PUT", { id }, data),
};

// ── Clients ───────────────────────────────────────────────────────
export const clientsApi = {
  list:   () => request<DbClient[]>("clients", "GET"),
  get:    (id: string) => request<DbClient>("clients", "GET", { id }),
  create: (data: Partial<DbClient>) => request<{ id: number }>("clients", "POST", {}, data),
  update: (id: string, data: Partial<DbClient>) => request<{ ok: boolean }>("clients", "PUT", { id }, data),
};

// ── Settings ──────────────────────────────────────────────────────
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

// ── Warehouse ─────────────────────────────────────────────────────
export const warehouseApi = {
  materials: () => request<DbMaterial[]>("warehouse", "GET", { section: "materials" }),
  blanks:    () => request<DbBlank[]>("warehouse", "GET", { section: "blanks" }),
  movements: () => request<DbMovement[]>("warehouse", "GET", { section: "movements" }),
  stock:     () => request<DbStockItem[]>("warehouse", "GET", { section: "stock" }),
  reserves:  () => request<DbMaterialReserve[]>("warehouse", "GET", { section: "reserves" }),
  addMaterial: (data: Partial<DbMaterial>) =>
    request<{ id: number }>("warehouse", "POST", { action: "add_material" }, data),
  addBlank: (data: Record<string, unknown>) =>
    request<{ id: number }>("warehouse", "POST", { action: "add_blank" }, data),
  movement: (action: "in" | "cut" | "use" | "adjust", data: Record<string, unknown>) =>
    request<{ ok: boolean }>("warehouse", "POST", { action }, data),
  useBlank: (data: Record<string, unknown>) =>
    request<{ ok: boolean }>("warehouse", "POST", { action: "use_blank" }, data),
  useAny: (data: { itemType: "raw" | "blank" | "stock"; itemId: number; qty: number; note?: string; orderRef?: string }) =>
    request<{ ok: boolean }>("warehouse", "POST", { action: "use_any" }, data),
  addStock:       (data: Record<string, unknown>) => request<{ id: number }>("warehouse", "POST", { action: "add_stock" }, data),
  updateStockQty:  (id: number, delta: number) => request<{ ok: boolean; qty: number }>("warehouse", "POST", { action: "update_stock_qty" }, { id, delta }),
  updateStockCost: (id: number, costPrice: number) => request<{ ok: boolean }>("warehouse", "POST", { action: "update_stock_cost" }, { id, costPrice }),
  removeStock:     (id: number) => request<{ ok: boolean }>("warehouse", "POST", { action: "remove_stock" }, { id }),
};

// ── Cutting ───────────────────────────────────────────────────────
export const cuttingApi = {
  tasks:      () => request<DbCuttingTask[]>("cutting", "GET", { section: "tasks" }),
  shifts:     (date?: string) => request<DbShift[]>("cutting", "GET", date ? { section: "shifts", date } : { section: "shifts" }),
  places:     () => request<DbPlace[]>("cutting", "GET", { section: "places" }),
  employees:  () => request<DbEmployee[]>("cutting", "GET", { section: "employees" }),
  blankTypes: () => request<DbBlankType[]>("cutting", "GET", { section: "blank_types" }),
  createTask:  (data: Record<string, unknown>) => request<{ id: number }>("cutting", "POST", { action: "create_task" }, data),
  assignShift: (data: Record<string, unknown>) => request<{ id: number }>("cutting", "POST", { action: "assign_shift" }, data),
  finishShift: (data: Record<string, unknown>) => request<{ ok: boolean }>("cutting", "POST", { action: "finish_shift" }, data),
  updateTask:  (data: Record<string, unknown>) => request<{ ok: boolean }>("cutting", "POST", { action: "update_task" }, data),
  cancelTask:  (taskId: number) => request<{ ok: boolean }>("cutting", "POST", { action: "cancel_task" }, { taskId }),
};

// ── Catalog ───────────────────────────────────────────────────────
export const catalogApi = {
  list:   () => request<DbCatalogItem[]>("auth", "GET", { section: "catalog" }),
  create: (data: Record<string, unknown>) => request<{ id: string }>("auth", "POST", { section: "catalog" }, data),
  update: (id: string, data: Record<string, unknown>) => request<{ ok: boolean }>("auth", "PUT", { section: "catalog", id }, data),
};