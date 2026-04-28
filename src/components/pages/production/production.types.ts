/* ─── Базовые типы ─── */
export type DeadlineState = "overdue" | "soon" | "ok";
export type FilterKey = "all" | "mine" | "overdue" | "urgent";
export type ZoneType = "production" | "storage";

/* ─── Зона ─── */
export type Zone = {
  id: string;
  name: string;
  type: ZoneType;
  color: string;
  icon: string;
};

/* ─── Станок ─── */
export type Machine = {
  id: string;
  name: string;
  zoneId: string;
  type: string;
};

/* ─── Сотрудник ─── */
export type Employee = {
  id: string;
  name: string;
  role: string;
};

/* ─── Смена ─── */
export type Shift = {
  id: string;
  zoneId: string;
  machineId: string;
  employeeId: string;
  date: string;
  note?: string;
};

/* ─── Карточка заказа (канбан) ─── */
export type Card = {
  id: string;
  client: string;
  stone: string;
  size: string;
  daysInStage: number;
  deadline: string;
  deadlineState: DeadlineState;
  manager: string;
  urgent?: boolean;
  phone: string;
  zoneId?: string;
  machineId?: string;
};

/* ─── Колонка канбана ─── */
export type Column = {
  id: string;
  label: string;
  color: string;
  zoneId: string;
  cards: Card[];
};

/* ══════════════ ДАННЫЕ ══════════════ */

export const ZONES: Zone[] = [
  { id: "z2", name: "Гравировка",       type: "production", color: "#ec4899", icon: "PenTool" },
  { id: "z3", name: "Полировка",        type: "production", color: "#14b8a6", icon: "Sparkles" },
  { id: "z4", name: "Склад сырья",      type: "storage",    color: "#6b7280", icon: "Package" },
  { id: "z5", name: "Склад заготовок",  type: "storage",    color: "#8b5cf6", icon: "Layers" },
];

export const MACHINES: Machine[] = [
  { id: "m3", name: "Гравёр ЧПУ №1",    zoneId: "z2", type: "ЧПУ-гравировка" },
  { id: "m4", name: "Гравёр ЧПУ №2",    zoneId: "z2", type: "ЧПУ-гравировка" },
  { id: "m5", name: "Лазер",            zoneId: "z2", type: "Лазерная гравировка" },
  { id: "m6", name: "Полировщик №1",    zoneId: "z3", type: "Дисковая полировка" },
  { id: "m7", name: "Полировщик №2",    zoneId: "z3", type: "Ленточная полировка" },
];

export const EMPLOYEES: Employee[] = [
  { id: "e1", name: "Олег К.",   role: "Оператор ЧПУ" },
  { id: "e2", name: "Игорь В.",  role: "Распиловщик" },
  { id: "e3", name: "Анна М.",   role: "Менеджер" },
  { id: "e4", name: "Дмитрий Л.", role: "Полировщик" },
  { id: "e5", name: "Сергей П.", role: "Гравировщик" },
];

export const initShifts: Shift[] = [
  { id: "s2", zoneId: "z2", machineId: "m3", employeeId: "e1", date: "28.04.2026" },
  { id: "s3", zoneId: "z3", machineId: "m6", employeeId: "e4", date: "28.04.2026" },
];

export const COLUMNS: Column[] = [
  {
    id: "sketch", label: "Эскиз", color: "#6366f1", zoneId: "",
    cards: [
      { id: "МП-0040", client: "Козлов И.Д.",   stone: "Мрамор белый",  size: "80×40×6",  daysInStage: 2, deadline: "20.04", deadlineState: "overdue", manager: "Анна М.",  phone: "+7 903 211-44-55" },
      { id: "МП-0042", client: "Белова Е.С.",   stone: "Гранит чёрный", size: "90×45×7",  daysInStage: 1, deadline: "02.05", deadlineState: "ok",      manager: "Олег К.",  phone: "+7 916 200-10-30" },
      { id: "МП-0041", client: "Смирнова А.В.", stone: "Гранит чёрный", size: "100×50×8", daysInStage: 2, deadline: "28.04", deadlineState: "soon",    manager: "Олег К.",  urgent: true, phone: "+7 912 345-67-89" },
      { id: "МП-0036", client: "Морозова Т.И.", stone: "Гранит габбро",  size: "110×55×8", daysInStage: 1, deadline: "30.04", deadlineState: "ok",      manager: "Игорь В.", phone: "+7 921 456-78-90" },
    ],
  },
  {
    id: "engraving", label: "Гравировка", color: "#ec4899", zoneId: "z2",
    cards: [
      { id: "МП-0035", client: "Лебедев К.А.",  stone: "Гранит серый",  size: "100×50×8", daysInStage: 7, deadline: "10.04", deadlineState: "overdue", manager: "Игорь В.", urgent: true, phone: "+7 916 700-22-11", zoneId: "z2", machineId: "m3" },
    ],
  },
  {
    id: "polishing", label: "Полировка", color: "#14b8a6", zoneId: "z3",
    cards: [
      { id: "МП-0034", client: "Новикова П.В.", stone: "Мрамор серый",   size: "80×40×6",   daysInStage: 9, deadline: "26.04", deadlineState: "soon",    manager: "Анна М.",  phone: "+7 977 300-55-66", zoneId: "z3", machineId: "m6" },
      { id: "МП-0033", client: "Семёнов Д.О.",  stone: "Гранит красный", size: "90×45×7",   daysInStage: 8, deadline: "24.04", deadlineState: "overdue", manager: "Олег К.",  phone: "+7 925 100-77-88", zoneId: "z3", machineId: "m7" },
    ],
  },
  {
    id: "ready", label: "Готов", color: "#22c55e", zoneId: "",
    cards: [
      { id: "МП-0039", client: "Петрова О.Н.",  stone: "Гранит серый",  size: "120×60×10", daysInStage: 14, deadline: "25.04", deadlineState: "ok", manager: "Олег К.",  phone: "+7 965 888-11-22" },
      { id: "МП-0037", client: "Иванов П.К.",   stone: "Гранит чёрный", size: "100×50×8",  daysInStage: 12, deadline: "15.04", deadlineState: "ok", manager: "Анна М.",  phone: "+7 900 123-00-00" },
    ],
  },
];

export const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",     label: "Все" },
  { key: "mine",    label: "Мои" },
  { key: "overdue", label: "Просроченные" },
  { key: "urgent",  label: "Срочные" },
];

export const DEADLINE_CARD: Record<DeadlineState, { border: string; bg: string }> = {
  overdue: { border: "border-red-200",   bg: "bg-red-50" },
  soon:    { border: "border-amber-200", bg: "bg-amber-50/50" },
  ok:      { border: "border-[#ebebeb]", bg: "bg-white" },
};

export const DEADLINE_BADGE: Record<DeadlineState, { label: string; color: string; bg: string }> = {
  overdue: { label: "просрочен", color: "#ef4444", bg: "#fef2f2" },
  soon:    { label: "скоро",     color: "#d97706", bg: "#fffbeb" },
  ok:      { label: "",          color: "",         bg: "" },
};