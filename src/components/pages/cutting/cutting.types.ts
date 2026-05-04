/* ─── Типы ─── */
export type WorkType = "cutting" | "engraving" | "polishing";

/* ─── Задача на нарезку (создаётся со Склада) ─── */
export type CuttingTaskStatus = "pending" | "active" | "done";

export type CuttingTask = {
  id: string;
  blankTypeId: string;
  blankName?: string;
  blankSize?: string;
  materialName: string;
  totalQty: number;
  doneQty: number;
  inProgressQty: number;
  status: CuttingTaskStatus;
  createdAt: string;
  deadline?: string;
};

export type Place = {
  id: string;
  name: string;
  machine: string;
  workTypes: WorkType[];
};

export type Employee = { id: string; name: string };

export type BlankType = {
  id: string;
  name: string;
  size: string;
  material: string;
  rawPerUnit: number;
};

export type ShiftResult = {
  blankTypeId: string;
  produced: number;
  rawAuto: boolean;
  rawUsed: number;
  orderId?: string;
};

export type Shift = {
  id: string;
  placeId: string;
  employeeId: string;
  workType: WorkType;
  date: string;
  status: "active" | "done";
  results: ShiftResult[];
  startedAt: string;
  finishedAt?: string;
  taskId?: string;
  taskQtyAssigned?: number;
};

/* ─── Данные ─── */
export const PLACES: Place[] = [
  { id: "p1", name: "Место 1 — Ленточная пила",  machine: "Ленточная пила",  workTypes: ["cutting"] },
  { id: "p2", name: "Место 2 — Дисковая пила",   machine: "Дисковая пила",   workTypes: ["cutting"] },
  { id: "p3", name: "Место 3 — ЧПУ гравировка",  machine: "ЧПУ станок",      workTypes: ["engraving"] },
  { id: "p4", name: "Место 4 — Полировка",        machine: "Полировальная",   workTypes: ["polishing"] },
];

export const EMPLOYEES: Employee[] = [
  { id: "e1", name: "Игорь В." },
  { id: "e2", name: "Павел Н." },
  { id: "e3", name: "Дмитрий С." },
];

export const BLANK_TYPES: BlankType[] = [
  { id: "bt1", name: "Плита стандарт",     size: "100×50×8",  material: "Гранит чёрный",  rawPerUnit: 0.50 },
  { id: "bt2", name: "Плита большая",      size: "120×60×10", material: "Гранит серый",   rawPerUnit: 0.72 },
  { id: "bt3", name: "Плита малая",        size: "80×40×6",   material: "Мрамор белый",   rawPerUnit: 0.32 },
  { id: "bt4", name: "Плита красн. гран.", size: "90×45×7",   material: "Гранит красный", rawPerUnit: 0.41 },
  { id: "bt5", name: "Тумба",              size: "60×30×80",  material: "Гранит чёрный",  rawPerUnit: 1.44 },
];

export const ORDERS = ["МП-0038", "МП-0040", "МП-0042", "МП-0045", "На склад"];

export const WORK_LABELS: Record<WorkType, string> = {
  cutting:   "Распил",
  engraving: "Гравировка",
  polishing: "Полировка",
};

export const today = new Date().toLocaleDateString("ru-RU").replace(/\//g, ".");

/* вычисляем вчера */
const _d   = new Date();
_d.setDate(_d.getDate() - 1);
export const yesterday = _d.toLocaleDateString("ru-RU").replace(/\//g, ".");

export const initShifts: Shift[] = [
  {
    id: "s1", placeId: "p1", employeeId: "e1", workType: "cutting",
    date: today, status: "active", startedAt: "08:00",
    results: [],
  },
  {
    id: "s2", placeId: "p2", employeeId: "e2", workType: "cutting",
    date: today, status: "done", startedAt: "08:00", finishedAt: "14:30",
    results: [
      { blankTypeId: "bt1", produced: 4, rawAuto: true, rawUsed: 2.0,  orderId: "МП-0040" },
      { blankTypeId: "bt5", produced: 2, rawAuto: true, rawUsed: 2.88, orderId: "На склад" },
    ],
  },
  /* вчера */
  {
    id: "s3", placeId: "p1", employeeId: "e1", workType: "cutting",
    date: yesterday, status: "done", startedAt: "08:00", finishedAt: "16:30",
    results: [
      { blankTypeId: "bt2", produced: 3, rawAuto: true, rawUsed: 2.16, orderId: "МП-0038" },
      { blankTypeId: "bt3", produced: 5, rawAuto: true, rawUsed: 1.60, orderId: "МП-0042" },
    ],
  },
  {
    id: "s4", placeId: "p2", employeeId: "e2", workType: "cutting",
    date: yesterday, status: "done", startedAt: "08:00", finishedAt: "17:00",
    results: [
      { blankTypeId: "bt4", produced: 2, rawAuto: true, rawUsed: 0.82, orderId: "На склад" },
    ],
  },
  {
    id: "s5", placeId: "p1", employeeId: "e3", workType: "cutting",
    date: yesterday, status: "done", startedAt: "09:00", finishedAt: "15:00",
    results: [
      { blankTypeId: "bt1", produced: 6, rawAuto: true, rawUsed: 3.0, orderId: "МП-0045" },
    ],
  },
  /* позавчера */
  {
    id: "s6", placeId: "p2", employeeId: "e1", workType: "cutting",
    date: "28.04.2026", status: "done", startedAt: "08:00", finishedAt: "17:00",
    results: [
      { blankTypeId: "bt2", produced: 4, rawAuto: true, rawUsed: 2.88, orderId: "МП-0038" },
    ],
  },
];

/* ─── Стили ─── */
export const selectCls = "w-full bg-white border border-[#e0e0e0] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1a1a1a] outline-none focus:border-[#b0b0b0] transition-colors";
export const inputCls  = "w-full bg-white border border-[#e0e0e0] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1a1a1a] outline-none focus:border-[#b0b0b0] transition-colors placeholder:text-[#c0c0c0]";
export const labelCls  = "block mb-1.5 text-[13px] font-medium text-[#4b4b4b]";

/* ─── Хелперы ─── */
export function shiftTotalRaw(s: Shift) {
  return +s.results.reduce((a, r) => a + r.rawUsed, 0).toFixed(2);
}
export function shiftTotalProduced(s: Shift) {
  return s.results.reduce((a, r) => a + r.produced, 0);
}
export function efficiency(s: Shift): "good" | "medium" | "low" {
  const total = shiftTotalProduced(s);
  if (total >= 5) return "good";
  if (total >= 2) return "medium";
  return "low";
}
export const EFF_COLOR: Record<string, string> = {
  good:   "#16a34a",
  medium: "#d97706",
  low:    "#dc2626",
};
export const EFF_BG: Record<string, string> = {
  good:   "#f0fdf4",
  medium: "#fffbeb",
  low:    "#fef2f2",
};
export const EFF_LABEL: Record<string, string> = {
  good:   "Норм",
  medium: "Средне",
  low:    "Мало",
};

export function emptyResult(): ShiftResult {
  const bt = BLANK_TYPES[0];
  return { blankTypeId: bt.id, produced: 1, rawAuto: true, rawUsed: bt.rawPerUnit };
}

export function emptyResultFromBt(bt: BlankType): ShiftResult {
  return { blankTypeId: bt.id, produced: 1, rawAuto: true, rawUsed: bt.rawPerUnit };
}