/* ══════════════════════════════════════
   Единая система учёта смен
   Используется в CuttingPage и ProductionPage
══════════════════════════════════════ */

export type WorkType = "cutting" | "engraving" | "polishing" | "other";

/* ─── Место (Место 1 — Ленточная пила) ─── */
export type Place = {
  id: string;
  name: string;        // "Место 1 — Ленточная пила"
  machineType: string; // "Ленточная пила"
  workType: WorkType;
  color: string;
  icon: string;
};

/* ─── Сотрудник ─── */
export type ShiftEmployee = {
  id: string;
  name: string;
  role: string;
};

/* ─── Тип заготовки ─── */
export type BlankType = {
  id: string;
  name: string;
  size: string;          // "100×50"
  rawPerUnit: number;    // расход сырья м² на 1 шт
  material?: string;
};

/* ─── Строка результата смены ─── */
export type ShiftResult = {
  blankTypeId: string;
  qty: number;
  rawAuto: number;       // м² авто
  rawManual?: number;    // м² вручную (если переключено)
  forOrder?: string;     // "МП-0040" или "склад"
};

/* ─── Статус смены ─── */
export type ShiftStatus = "active" | "done";

/* ─── Смена ─── */
export type Shift = {
  id: string;
  placeId: string;
  employeeId: string;
  workType: WorkType;
  date: string;
  status: ShiftStatus;
  results?: ShiftResult[];
  note?: string;
};

/* ══════════════════════════════════════
   ДАННЫЕ
══════════════════════════════════════ */

export const PLACES: Place[] = [
  { id: "p1", name: "Место 1 — Ленточная пила",  machineType: "Ленточная пила", workType: "cutting",   color: "#f59e0b", icon: "Scissors" },
  { id: "p2", name: "Место 2 — Дисковая пила",   machineType: "Дисковая пила",  workType: "cutting",   color: "#f97316", icon: "Scissors" },
  { id: "p3", name: "Место 3 — Гравёр ЧПУ №1",  machineType: "ЧПУ-гравировка", workType: "engraving", color: "#ec4899", icon: "PenTool"  },
  { id: "p4", name: "Место 4 — Гравёр ЧПУ №2",  machineType: "ЧПУ-гравировка", workType: "engraving", color: "#ec4899", icon: "PenTool"  },
  { id: "p5", name: "Место 5 — Полировщик №1",   machineType: "Дисковая полировка", workType: "polishing", color: "#14b8a6", icon: "Sparkles" },
  { id: "p6", name: "Место 6 — Полировщик №2",   machineType: "Ленточная полировка", workType: "polishing", color: "#14b8a6", icon: "Sparkles" },
];

export const SHIFT_EMPLOYEES: ShiftEmployee[] = [
  { id: "e1", name: "Олег К.",    role: "Оператор ЧПУ" },
  { id: "e2", name: "Игорь В.",   role: "Распиловщик" },
  { id: "e4", name: "Дмитрий Л.", role: "Полировщик" },
  { id: "e5", name: "Сергей П.",  role: "Гравировщик" },
  { id: "e6", name: "Павел Н.",   role: "Распиловщик" },
];

export const BLANK_TYPES: BlankType[] = [
  { id: "bt1", name: "Плита стандарт",     size: "100×50×8",  rawPerUnit: 0.50, material: "Гранит чёрный" },
  { id: "bt2", name: "Плита большая",      size: "120×60×10", rawPerUnit: 0.72, material: "Гранит серый"  },
  { id: "bt3", name: "Плита малая",        size: "80×40×6",   rawPerUnit: 0.32, material: "Мрамор белый" },
  { id: "bt4", name: "Плита красный гран", size: "90×45×7",   rawPerUnit: 0.41, material: "Гранит красный" },
  { id: "bt5", name: "Тумба",              size: "60×30×80",  rawPerUnit: 1.44, material: "Гранит чёрный" },
];

export const SAMPLE_ORDERS = [
  "МП-0040", "МП-0041", "МП-0042", "МП-0043", "МП-0044",
];

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  cutting:   "Распил",
  engraving: "Гравировка",
  polishing: "Полировка",
  other:     "Прочее",
};

export const WORK_TYPE_COLOR: Record<WorkType, string> = {
  cutting:   "#f59e0b",
  engraving: "#ec4899",
  polishing: "#14b8a6",
  other:     "#9b9b9b",
};

/* ─── Тестовые смены ─── */
export const INIT_SHIFTS: Shift[] = [
  {
    id: "sh1", placeId: "p1", employeeId: "e2", workType: "cutting",
    date: "28.04.2026", status: "active",
  },
  {
    id: "sh2", placeId: "p3", employeeId: "e1", workType: "engraving",
    date: "28.04.2026", status: "active",
  },
  {
    id: "sh3", placeId: "p5", employeeId: "e4", workType: "polishing",
    date: "28.04.2026", status: "active",
  },
  {
    id: "sh4", placeId: "p1", employeeId: "e2", workType: "cutting",
    date: "27.04.2026", status: "done",
    results: [
      { blankTypeId: "bt1", qty: 4, rawAuto: 2.0, forOrder: "склад" },
      { blankTypeId: "bt5", qty: 2, rawAuto: 2.88, forOrder: "МП-0040" },
    ],
  },
  {
    id: "sh5", placeId: "p2", employeeId: "e6", workType: "cutting",
    date: "27.04.2026", status: "done",
    results: [
      { blankTypeId: "bt2", qty: 3, rawAuto: 2.16, forOrder: "склад" },
    ],
  },
  {
    id: "sh6", placeId: "p3", employeeId: "e5", workType: "engraving",
    date: "26.04.2026", status: "done",
    results: [
      { blankTypeId: "bt1", qty: 2, rawAuto: 1.0, forOrder: "МП-0042" },
    ],
  },
];

/* ─── Хелперы ─── */
export function calcShiftRaw(shift: Shift): number {
  if (!shift.results) return 0;
  return shift.results.reduce((sum, r) => {
    const raw = r.rawManual !== undefined ? r.rawManual : r.rawAuto;
    return sum + raw;
  }, 0);
}

export function calcShiftQty(shift: Shift): number {
  if (!shift.results) return 0;
  return shift.results.reduce((s, r) => s + r.qty, 0);
}

export function efficiencyColor(rawUsed: number): { dot: string; label: string; bg: string } {
  if (rawUsed >= 3)   return { dot: "#22c55e", label: "норм",   bg: "#f0fdf4" };
  if (rawUsed >= 1.5) return { dot: "#f59e0b", label: "средне", bg: "#fffbeb" };
  return                     { dot: "#ef4444", label: "мало",   bg: "#fef2f2" };
}

export const TODAY = "28.04.2026";
