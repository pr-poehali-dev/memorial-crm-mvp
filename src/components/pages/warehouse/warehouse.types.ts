import type { Order } from "../orders/orders.types";

/* ─── Типы ─── */
export type RawMaterial = {
  id: string;
  name: string;
  unit: string;
  qty: number;
  min: number;
  price: number;
  imageUrl?: string;
};

export type Blank = {
  id: string;
  name: string;
  size: string;
  materialId: string;
  qty: number;
  min: number;
};

export type MovementType = "in" | "cut" | "use" | "adjust";

export type Movement = {
  id: string;
  date: string;
  type: MovementType;
  materialId?: string;
  blankId?: string;
  qty: number;
  pricePerUnit?: number;
  totalSum?: number;
  note: string;
  receiptId?: string;
  order?: string;
  remainAfter?: number;
};

export type ModalType = "in" | "cut" | "use" | null;

/* ─── Резерв по материалу ─── */
export type MaterialReserve = {
  materialId: string;
  totalReserved: number;
  orders: { orderId: string; qty: number }[];
};

/* ─── Резерв по заготовке ─── */
export type BlankReserve = {
  blankId: string;
  totalReserved: number;
  orders: { orderId: string; qty: number }[];
};

/* ─── Маппинг: stone → rawMaterial ─── */
const STONE_TO_RAW_ID: Record<string, string> = {
  "Гранит чёрный":           "r1",
  "Гранит чёрный (габбро)":  "r1",
  "Гранит габбро":           "r1",
  "Габбро-диабаз":           "r1",
  "Гранит серый":            "r6",
  "Серый гранит":            "r6",
  "Гранит красный":          "r7",
  "Курдай":                  "r7",
  "Мрамор":                  "r8",
  "Мрамор белый":            "r8",
  "Мрамор серый":            "r8",
  "Шонгуй":                  "r2",
  "Шонгуй гранит":           "r2",
  "Дымовский гранит":        "r3",
  "Гранатовый амфиболит":    "r4",
  "Балтик грин":             "r5",
  "Калгуваара":              "r9",
};

/* ─── Площадь изделия из размера ─── */
function calcAreaFromSize(size: string): number {
  const parts = size.split("×").map(s => parseFloat(s.trim()));
  if (parts.length < 2 || parts.some(isNaN)) return 0;
  const [w, h] = parts;
  return +(w / 100 * h / 100).toFixed(2);
}

/* ─── Активные статусы (сырьё ещё расходуется) ─── */
const ACTIVE_STATUSES = ["Эскиз", "Производство", "Готов", "Доставка"];

/* ─── Расчёт резервов из заказов ─── */
export function calcReserves(orders: Order[]): MaterialReserve[] {
  const map: Record<string, { totalReserved: number; orders: { orderId: string; qty: number }[] }> = {};

  for (const o of orders) {
    if (!ACTIVE_STATUSES.includes(o.status)) continue;
    const rawId = STONE_TO_RAW_ID[o.stone];
    if (!rawId) continue;
    const qty = calcAreaFromSize(o.size);
    if (qty <= 0) continue;
    if (!map[rawId]) map[rawId] = { totalReserved: 0, orders: [] };
    map[rawId].totalReserved = +(map[rawId].totalReserved + qty).toFixed(2);
    map[rawId].orders.push({ orderId: o.id, qty });
  }

  return Object.entries(map).map(([materialId, v]) => ({ materialId, ...v }));
}

/* ─── Маппинг: stone → blankId (по размеру) ─── */
const SIZE_TO_BLANK_ID: Record<string, string> = {
  "100×50×8":  "b1",
  "120×60×10": "b2",
  "80×40×6":   "b3",
  "90×45×7":   "b4",
};

/* ─── Расчёт резервов заготовок из заказов ─── */
export function calcBlankReserves(orders: Order[]): BlankReserve[] {
  const map: Record<string, { totalReserved: number; orders: { orderId: string; qty: number }[] }> = {};

  for (const o of orders) {
    if (!ACTIVE_STATUSES.includes(o.status)) continue;
    const blankId = SIZE_TO_BLANK_ID[o.size];
    if (!blankId) continue;
    if (!map[blankId]) map[blankId] = { totalReserved: 0, orders: [] };
    map[blankId].totalReserved += 1;
    map[blankId].orders.push({ orderId: o.id, qty: 1 });
  }

  return Object.entries(map).map(([blankId, v]) => ({ blankId, ...v }));
}

/* ─── Доступно заготовок ─── */
export function getAvailableBlank(b: Blank, reserved: number): number {
  return b.qty - reserved;
}

/* ─── Уровень заготовки с учётом резерва ─── */
export function getLevelBlankReserved(b: Blank, reserved: number): "critical" | "low" | "ok" {
  const avail = getAvailableBlank(b, reserved);
  if (avail < 0) return "critical";
  if (avail < b.min * 0.5) return "critical";
  if (avail <= b.min) return "low";
  return "ok";
}

/* ─── Данные: сырьё ─── */
export const initRaw: RawMaterial[] = [
  { id: "r1", name: "Габбро-диабаз",         unit: "м²", qty: 14.5, min: 5,  price: 4200, imageUrl: "https://cdn.poehali.dev/projects/4e0e07db-0b5c-4868-8b3d-3bd655c50b19/files/52f21ceb-e82f-4f4e-9491-681a2d1d464e.jpg" },
  { id: "r2", name: "Шонгуй",                unit: "м²", qty: 7.2,  min: 5,  price: 3800, imageUrl: "https://cdn.poehali.dev/projects/4e0e07db-0b5c-4868-8b3d-3bd655c50b19/files/dd33d480-24c9-4770-9424-d8bc0e1dbe09.jpg" },
  { id: "r3", name: "Дымовский гранит",      unit: "м²", qty: 0.5,  min: 5,  price: 5100, imageUrl: "https://cdn.poehali.dev/projects/4e0e07db-0b5c-4868-8b3d-3bd655c50b19/files/9c28763e-2124-4e43-993e-00e81bdbdc83.jpg" },
  { id: "r4", name: "Гранатовый амфиболит",  unit: "м²", qty: 2.4,  min: 4,  price: 6500, imageUrl: "https://cdn.poehali.dev/projects/4e0e07db-0b5c-4868-8b3d-3bd655c50b19/files/392d6678-b602-4bcd-86b7-bc68d4d29cc5.jpg" },
  { id: "r5", name: "Балтик грин",           unit: "м²", qty: 5.8,  min: 3,  price: 5800, imageUrl: "https://cdn.poehali.dev/projects/4e0e07db-0b5c-4868-8b3d-3bd655c50b19/files/3020b092-f3d3-43f1-8c74-ed1003758496.jpg" },
  { id: "r6", name: "Серый гранит",          unit: "м²", qty: 6.0,  min: 4,  price: 3600, imageUrl: "https://cdn.poehali.dev/projects/4e0e07db-0b5c-4868-8b3d-3bd655c50b19/files/972d57f4-7fc6-4f6c-bb2d-26104b7ec2b2.jpg" },
  { id: "r7", name: "Курдай",                unit: "м²", qty: 3.2,  min: 3,  price: 4800, imageUrl: "https://cdn.poehali.dev/projects/4e0e07db-0b5c-4868-8b3d-3bd655c50b19/files/ee527fda-57fd-434a-acd0-2debddf42b05.jpg" },
  { id: "r8", name: "Мрамор",                unit: "м²", qty: 2.1,  min: 4,  price: 6800, imageUrl: "https://cdn.poehali.dev/projects/4e0e07db-0b5c-4868-8b3d-3bd655c50b19/files/194d6710-d482-426e-9403-4bae2f110311.jpg" },
  { id: "r9", name: "Калгуваара",            unit: "м²", qty: 4.5,  min: 3,  price: 5200, imageUrl: "https://cdn.poehali.dev/projects/4e0e07db-0b5c-4868-8b3d-3bd655c50b19/files/b0217f0d-4283-4bc0-8489-60f35337d747.jpg" },
];

/* ─── Данные: заготовки ─── */
export const initBlanks: Blank[] = [
  { id: "b1", name: "Плита стандарт",     size: "100×50×8",  materialId: "r1", qty: 4, min: 2 },
  { id: "b2", name: "Плита большая",      size: "120×60×10", materialId: "r2", qty: 2, min: 1 },
  { id: "b3", name: "Плита малая",        size: "80×40×6",   materialId: "r4", qty: 1, min: 2 },
  { id: "b4", name: "Плита красный гран", size: "90×45×7",   materialId: "r3", qty: 0, min: 1 },
  { id: "b5", name: "Тумба",              size: "60×30×80",  materialId: "r1", qty: 3, min: 1 },
];

/* ─── История движений ─── */
export const initMovements: Movement[] = [
  { id: "m1", date: "20 апр.", type: "use",  materialId: "r1", blankId: "b1", qty: 1,   note: "Списание на заказ",       order: "МП-0041",  remainAfter: 14.5 },
  { id: "m2", date: "18 апр.", type: "cut",  materialId: "r2", blankId: "b2", qty: 2,   note: "Нарезка: Плита большая",  remainAfter: 7.2  },
  { id: "m3", date: "15 апр.", type: "in",   materialId: "r1", qty: 5.0, pricePerUnit: 4200, totalSum: 21000, note: "Приход от поставщика", receiptId: "КР-0041", remainAfter: 19.5 },
  { id: "m4", date: "10 апр.", type: "use",  materialId: "r4", blankId: "b3", qty: 1,   note: "Списание на заказ",       order: "МП-0038",  remainAfter: 2.4  },
  { id: "m5", date: "05 апр.", type: "cut",  materialId: "r1", blankId: "b1", qty: 3,   note: "Нарезка: Плита стандарт", remainAfter: 14.5 },
  { id: "m6", date: "01 апр.", type: "in",   materialId: "r3", qty: 3.1, pricePerUnit: 5100, totalSum: 15810, note: "Приход от поставщика", receiptId: "КР-0039", remainAfter: 3.1  },
];

/* ─── Вспомогалки ─── */
export function getAvailable(r: RawMaterial, reserved: number): number {
  return +(r.qty - reserved).toFixed(2);
}

export function getLevelRaw(r: RawMaterial, reserved = 0): "critical" | "low" | "ok" {
  const avail = getAvailable(r, reserved);
  if (avail < 0) return "critical";
  if (avail < r.min * 0.5) return "critical";
  if (avail <= r.min) return "low";
  return "ok";
}

export function getLevelBlank(b: Blank): "critical" | "low" | "ok" {
  if (b.qty <= 0 || b.qty < b.min * 0.5) return "critical";
  if (b.qty <= b.min) return "low";
  return "ok";
}

/* ─── Авторасчёт расхода по размеру ─── */
export function calcRawPerUnit(size: string): number | null {
  const parts = size.split("×").map(s => parseFloat(s.trim()));
  if (parts.length < 2 || parts.some(isNaN)) return null;
  const [w, h] = parts;
  return +(w / 100 * h / 100).toFixed(2);
}

/* ─── Стили уровней ─── */
export const LEVEL_STYLE = {
  critical: { dot: "bg-red-400",   badge: "bg-red-100 text-red-600",    row: "bg-red-50",      bar: "#ef4444" },
  low:      { dot: "bg-amber-400", badge: "bg-amber-100 text-amber-600",row: "bg-amber-50/60", bar: "#f59e0b" },
  ok:       { dot: "bg-green-400", badge: "bg-green-100 text-green-700",row: "",               bar: "#22c55e" },
};

/* ─── Типы движений ─── */
export const MOVE_TYPE: Record<MovementType, { label: string; color: string; icon: string; rowBg: string }> = {
  in:     { label: "Приход",       color: "#16a34a", icon: "ArrowDownToLine", rowBg: "#f0fdf4" },
  cut:    { label: "Нарезка",      color: "#6366f1", icon: "Scissors",        rowBg: "#f5f3ff" },
  use:    { label: "Списание",     color: "#ef4444", icon: "ArrowUpFromLine", rowBg: "#fef2f2" },
  adjust: { label: "Корректировка",color: "#f59e0b", icon: "SlidersHorizontal",rowBg: "#fffbeb" },
};

/* ─── Общие CSS-классы ─── */
export const selectCls = "w-full bg-white border border-[#ebebeb] rounded-[8px] px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-[#c0c0c0] transition-colors";
export const inputCls  = "w-full bg-white border border-[#ebebeb] rounded-[8px] px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-[#c0c0c0] transition-colors placeholder:text-[#c5c5c5]";

/* ─── Готовые изделия на складе ─── */
export type StockItem = {
  id: string;
  catalogId: string;   // ссылка на CatalogItem.id
  name: string;        // название изделия
  category: string;    // категория (из каталога)
  qty: number;         // кол-во на складе (шт.)
  price: number;       // розничная цена
  addedAt: string;     // дата поступления
  note?: string;       // примечание
};

export const initStock: StockItem[] = [
  { id: "st1", catalogId: "c01", name: "Памятник стандартный 100×50×8",  category: "monument",  qty: 3, price: 22000, addedAt: "15 апр.", note: "Гранит чёрный, без гравировки" },
  { id: "st2", catalogId: "c05", name: "Тумба гранитная стандартная",   category: "pedestal",  qty: 5, price: 8500,  addedAt: "18 апр." },
  { id: "st3", catalogId: "c07", name: "Цветник гранитный 60×40",       category: "flowerbed", qty: 2, price: 7000,  addedAt: "20 апр." },
  { id: "st4", catalogId: "c13", name: "Крест металлический стандарт",  category: "cross",     qty: 8, price: 3500,  addedAt: "22 апр." },
  { id: "st5", catalogId: "c02", name: "Памятник премиум 120×60×10",    category: "monument",  qty: 1, price: 38000, addedAt: "25 апр.", note: "Полировка с двух сторон" },
];