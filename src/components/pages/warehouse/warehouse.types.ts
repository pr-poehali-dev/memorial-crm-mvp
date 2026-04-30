/* ─── Типы ─── */
export type RawMaterial = {
  id: string;
  name: string;
  unit: string;
  qty: number;
  min: number;
  price: number;
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

/* ─── Данные: сырьё ─── */
export const initRaw: RawMaterial[] = [
  { id: "r1", name: "Гранит чёрный (габбро)", unit: "м²", qty: 14.5, min: 5,  price: 4200 },
  { id: "r2", name: "Гранит серый",           unit: "м²", qty: 7.2,  min: 5,  price: 3800 },
  { id: "r3", name: "Гранит красный",         unit: "м²", qty: 3.1,  min: 5,  price: 5100 },
  { id: "r4", name: "Мрамор белый",           unit: "м²", qty: 2.4,  min: 4,  price: 6500 },
  { id: "r5", name: "Мрамор серый",           unit: "м²", qty: 5.8,  min: 3,  price: 5800 },
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
export function getLevelRaw(r: RawMaterial): "critical" | "low" | "ok" {
  if (r.qty <= 0 || r.qty < r.min * 0.5) return "critical";
  if (r.qty <= r.min) return "low";
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
