import type { Order } from "../orders/orders.types";

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
  costPrice: number;
  salePrice: number;
  blankTypeId?: number;
};

export type MovementType = "in" | "cut" | "use" | "adjust";

export type Movement = {
  id: string;
  date: string;
  isoDate?: string;
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

export type MaterialReserve = {
  materialId: string;
  totalReserved: number;
  orders: { orderId: string; qty: number; clientName?: string; stage?: string }[];
};

export type BlankReserve = {
  blankId: string;
  totalReserved: number;
  orders: { orderId: string; qty: number; clientName?: string; stage?: string }[];
};

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

function calcAreaFromSize(size: string): number {
  const parts = size.split("×").map(s => parseFloat(s.trim()));
  if (parts.length < 2 || parts.some(isNaN)) return 0;
  const [w, h] = parts;
  return +(w / 100 * h / 100).toFixed(2);
}

const ACTIVE_STATUSES = ["Эскиз", "Производство", "Готов", "Доставка"];

export function calcReserves(orders: Order[]): MaterialReserve[] {
  const map: Record<string, { totalReserved: number; orders: { orderId: string; qty: number; clientName?: string; stage?: string }[] }> = {};

  for (const o of orders) {
    if (!ACTIVE_STATUSES.includes(o.status)) continue;
    const rawId = STONE_TO_RAW_ID[o.stone];
    if (!rawId) continue;
    const qty = calcAreaFromSize(o.size);
    if (qty <= 0) continue;
    if (!map[rawId]) map[rawId] = { totalReserved: 0, orders: [] };
    map[rawId].totalReserved = +(map[rawId].totalReserved + qty).toFixed(2);
    map[rawId].orders.push({ orderId: o.id, qty, clientName: o.client, stage: o.status });
  }

  return Object.entries(map).map(([materialId, v]) => ({ materialId, ...v }));
}

const SIZE_TO_BLANK_ID: Record<string, string> = {
  "100×50×8":  "b1",
  "120×60×10": "b2",
  "80×40×6":   "b3",
  "90×45×7":   "b4",
};

export function calcBlankReserves(orders: Order[]): BlankReserve[] {
  const map: Record<string, { totalReserved: number; orders: { orderId: string; qty: number; clientName?: string; stage?: string }[] }> = {};

  for (const o of orders) {
    if (!ACTIVE_STATUSES.includes(o.status)) continue;
    const blankId = SIZE_TO_BLANK_ID[o.size];
    if (!blankId) continue;
    if (!map[blankId]) map[blankId] = { totalReserved: 0, orders: [] };
    map[blankId].totalReserved += 1;
    map[blankId].orders.push({ orderId: o.id, qty: 1, clientName: o.client, stage: o.status });
  }

  return Object.entries(map).map(([blankId, v]) => ({ blankId, ...v }));
}

export function getAvailableBlank(b: Blank, reserved: number): number {
  return b.qty - reserved;
}

export function getLevelBlankReserved(b: Blank, reserved: number): "critical" | "low" | "ok" {
  const avail = getAvailableBlank(b, reserved);
  if (avail < 0) return "critical";
  if (avail < b.min * 0.5) return "critical";
  if (avail <= b.min) return "low";
  return "ok";
}

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

export function calcRawPerUnit(size: string): number | null {
  const parts = size.split("×").map(s => parseFloat(s.trim()));
  if (parts.length < 2 || parts.some(isNaN)) return null;
  const [w, h] = parts;
  return +(w / 100 * h / 100).toFixed(2);
}

export const LEVEL_STYLE = {
  critical: { dot: "bg-red-400",   badge: "bg-red-100 text-red-600",    row: "bg-red-50",      bar: "#ef4444" },
  low:      { dot: "bg-amber-400", badge: "bg-amber-100 text-amber-600",row: "bg-amber-50/60", bar: "#f59e0b" },
  ok:       { dot: "bg-green-400", badge: "bg-green-100 text-green-700",row: "",               bar: "#22c55e" },
};

export const MOVE_TYPE: Record<MovementType, { label: string; color: string; icon: string; rowBg: string }> = {
  in:     { label: "Приход",        color: "#16a34a", icon: "ArrowDownToLine",   rowBg: "#f0fdf4" },
  cut:    { label: "Нарезка",       color: "#6366f1", icon: "Scissors",          rowBg: "#f5f3ff" },
  use:    { label: "Списание",      color: "#ef4444", icon: "ArrowUpFromLine",   rowBg: "#fef2f2" },
  adjust: { label: "Корректировка", color: "#f59e0b", icon: "SlidersHorizontal", rowBg: "#fffbeb" },
};

export const selectCls = "w-full bg-white border border-[#ebebeb] rounded-[8px] px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-[#c0c0c0] transition-colors";
export const inputCls  = "w-full bg-white border border-[#ebebeb] rounded-[8px] px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-[#c0c0c0] transition-colors placeholder:text-[#c5c5c5]";

export type StockItem = {
  id: string;
  catalogId: string;
  name: string;
  category: string;
  qty: number;
  price: number;
  addedAt: string;
  note?: string;
};