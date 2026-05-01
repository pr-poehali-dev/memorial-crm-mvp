/* ─── Базовые типы ─── */
export type DeadlineState = "overdue" | "soon" | "ok";
export type FilterKey = "all" | "mine" | "overdue" | "urgent";
export type ZoneType = "production" | "storage";
export type ItemStatus = "done" | "in_progress" | "pending";

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

/* ─── Изделие внутри заказа ─── */
export type OrderItem = {
  id: string;          // уникальный ключ: "МП-0040-1"
  orderId: string;     // "МП-0040"
  type: string;        // "Плита", "Стела", "Ваза" и т.д.
  status: ItemStatus;  // статус этого конкретного изделия
  colId: string;       // в какой колонке канбана находится
  progress: number;    // 0–100
};

/* ─── Карточка заказа ─── */
export type Card = {
  id: string;
  client: string;
  stone: string;
  size: string;
  product: string;
  daysInStage: number;
  deadline: string;
  deadlineState: DeadlineState;
  manager: string;
  urgent?: boolean;
  phone: string;
  payment?: string;
  problem?: string;
  zoneId?: string;
  machineId?: string;
  items: OrderItem[];   // изделия заказа
};

/* ─── Колонка канбана ─── */
export type Column = {
  id: string;
  label: string;
  color: string;
  zoneId: string;
  cards: Card[];
};

/* ─── Плоская карточка изделия для канбана ─── */
export type FlatItem = {
  itemId: string;
  itemType: string;
  itemStatus: ItemStatus;
  itemProgress: number;
  orderId: string;
  colId: string;
  colLabel: string;
  colColor: string;
  /* поля из Card */
  client: string;
  stone: string;
  size: string;
  deadline: string;
  deadlineState: DeadlineState;
  manager: string;
  urgent?: boolean;
  phone: string;
  payment?: string;
  problem?: string;
  machineId?: string;
  zoneId?: string;
  /* все изделия заказа */
  allItems: OrderItem[];
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
  { id: "e1", name: "Олег К.",    role: "Оператор ЧПУ" },
  { id: "e2", name: "Игорь В.",   role: "Распиловщик" },
  { id: "e3", name: "Анна М.",    role: "Менеджер" },
  { id: "e4", name: "Дмитрий Л.", role: "Полировщик" },
  { id: "e5", name: "Сергей П.",  role: "Гравировщик" },
];

export const initShifts: Shift[] = [
  { id: "s2", zoneId: "z2", machineId: "m3", employeeId: "e1", date: "28.04.2026" },
  { id: "s3", zoneId: "z3", machineId: "m6", employeeId: "e4", date: "28.04.2026" },
];

export const COLUMNS: Column[] = [
  {
    id: "sketch", label: "Эскиз", color: "#6366f1", zoneId: "",
    cards: [
      {
        id: "МП-0040", client: "Козлов И.Д.", stone: "Мрамор белый", size: "80×40×6",
        product: "Комплект", daysInStage: 2, deadline: "20.04", deadlineState: "overdue",
        manager: "Анна М.", phone: "+7 903 211-44-55", payment: "Оплачено",
        problem: "Клиент не согласовал эскиз",
        items: [
          { id: "МП-0040-1", orderId: "МП-0040", type: "Плита",  status: "in_progress", colId: "sketch",   progress: 40 },
          { id: "МП-0040-2", orderId: "МП-0040", type: "Стела",  status: "pending",     colId: "sketch",   progress: 0  },
          { id: "МП-0040-3", orderId: "МП-0040", type: "Ваза",   status: "pending",     colId: "sketch",   progress: 0  },
        ],
      },
      {
        id: "МП-0042", client: "Белова Е.С.", stone: "Гранит чёрный", size: "90×45×7",
        product: "Стела", daysInStage: 1, deadline: "02.05", deadlineState: "ok",
        manager: "Олег К.", phone: "+7 916 200-10-30", payment: "Предоплата 50%",
        items: [
          { id: "МП-0042-1", orderId: "МП-0042", type: "Стела", status: "in_progress", colId: "sketch", progress: 20 },
        ],
      },
      {
        id: "МП-0041", client: "Смирнова А.В.", stone: "Гранит чёрный", size: "100×50×8",
        product: "Памятник двойной", daysInStage: 2, deadline: "28.04", deadlineState: "soon",
        manager: "Олег К.", urgent: true, phone: "+7 912 345-67-89", payment: "Оплачено",
        problem: "Ждём фото для гравировки",
        items: [
          { id: "МП-0041-1", orderId: "МП-0041", type: "Плита 1", status: "in_progress", colId: "sketch",    progress: 60 },
          { id: "МП-0041-2", orderId: "МП-0041", type: "Плита 2", status: "pending",     colId: "sketch",    progress: 0  },
        ],
      },
      {
        id: "МП-0036", client: "Морозова Т.И.", stone: "Гранит габбро", size: "110×55×8",
        product: "Плита горизонт.", daysInStage: 1, deadline: "30.04", deadlineState: "ok",
        manager: "Игорь В.", phone: "+7 921 456-78-90", payment: "Не оплачено",
        items: [
          { id: "МП-0036-1", orderId: "МП-0036", type: "Плита", status: "in_progress", colId: "sketch", progress: 15 },
        ],
      },
    ],
  },
  {
    id: "engraving", label: "Гравировка", color: "#ec4899", zoneId: "z2",
    cards: [
      {
        id: "МП-0035", client: "Лебедев К.А.", stone: "Гранит серый", size: "100×50×8",
        product: "Надгробие с портр.", daysInStage: 7, deadline: "10.04", deadlineState: "overdue",
        manager: "Игорь В.", urgent: true, phone: "+7 916 700-22-11",
        zoneId: "z2", machineId: "m3", payment: "Оплачено",
        problem: "Сломалась фреза, простой 2 дня",
        items: [
          { id: "МП-0035-1", orderId: "МП-0035", type: "Плита",    status: "done",        colId: "engraving", progress: 100 },
          { id: "МП-0035-2", orderId: "МП-0035", type: "Портрет",  status: "in_progress", colId: "engraving", progress: 55  },
          { id: "МП-0035-3", orderId: "МП-0035", type: "Цоколь",   status: "pending",     colId: "engraving", progress: 0   },
        ],
      },
    ],
  },
  {
    id: "polishing", label: "Полировка", color: "#14b8a6", zoneId: "z3",
    cards: [
      {
        id: "МП-0034", client: "Новикова П.В.", stone: "Мрамор серый", size: "80×40×6",
        product: "Плита стандарт", daysInStage: 9, deadline: "26.04", deadlineState: "soon",
        manager: "Анна М.", phone: "+7 977 300-55-66",
        zoneId: "z3", machineId: "m6", payment: "Предоплата 50%",
        items: [
          { id: "МП-0034-1", orderId: "МП-0034", type: "Плита", status: "in_progress", colId: "polishing", progress: 75 },
        ],
      },
      {
        id: "МП-0033", client: "Семёнов Д.О.", stone: "Гранит красный", size: "90×45×7",
        product: "Стела вертикальн.", daysInStage: 8, deadline: "24.04", deadlineState: "overdue",
        manager: "Олег К.", phone: "+7 925 100-77-88",
        zoneId: "z3", machineId: "m7", payment: "Оплачено",
        items: [
          { id: "МП-0033-1", orderId: "МП-0033", type: "Стела",  status: "in_progress", colId: "polishing", progress: 80 },
          { id: "МП-0033-2", orderId: "МП-0033", type: "Тумба",  status: "pending",     colId: "polishing", progress: 10 },
        ],
      },
    ],
  },
  {
    id: "ready", label: "Готов", color: "#22c55e", zoneId: "",
    cards: [
      {
        id: "МП-0039", client: "Петрова О.Н.", stone: "Гранит серый", size: "120×60×10",
        product: "Памятник семейный", daysInStage: 14, deadline: "25.04", deadlineState: "ok",
        manager: "Олег К.", phone: "+7 965 888-11-22", payment: "Оплачено",
        items: [
          { id: "МП-0039-1", orderId: "МП-0039", type: "Плита",  status: "done", colId: "ready", progress: 100 },
          { id: "МП-0039-2", orderId: "МП-0039", type: "Стела",  status: "done", colId: "ready", progress: 100 },
        ],
      },
      {
        id: "МП-0037", client: "Иванов П.К.", stone: "Гранит чёрный", size: "100×50×8",
        product: "Плита надгробная", daysInStage: 12, deadline: "15.04", deadlineState: "ok",
        manager: "Анна М.", phone: "+7 900 123-00-00", payment: "Оплачено",
        items: [
          { id: "МП-0037-1", orderId: "МП-0037", type: "Плита", status: "done", colId: "ready", progress: 100 },
        ],
      },
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

export const ITEM_STATUS_LABEL: Record<ItemStatus, { label: string; color: string; bg: string; dot: string }> = {
  done:        { label: "Готово",     color: "#16a34a", bg: "#f0fdf4", dot: "bg-green-400" },
  in_progress: { label: "В работе",   color: "#d97706", bg: "#fffbeb", dot: "bg-amber-400" },
  pending:     { label: "Не начато",  color: "#9b9b9b", bg: "#f5f5f5", dot: "bg-gray-300"  },
};

/* ─── Вспомогалка: расположить изделия по колонкам ─── */
export function flattenItems(columns: Column[]): FlatItem[] {
  const result: FlatItem[] = [];
  for (const col of columns) {
    for (const card of col.cards) {
      for (const item of card.items) {
        if (item.colId === col.id) {
          result.push({
            itemId: item.id,
            itemType: item.type,
            itemStatus: item.status,
            itemProgress: item.progress,
            orderId: card.id,
            colId: col.id,
            colLabel: col.label,
            colColor: col.color,
            client: card.client,
            stone: card.stone,
            size: card.size,
            deadline: card.deadline,
            deadlineState: card.deadlineState,
            manager: card.manager,
            urgent: card.urgent,
            phone: card.phone,
            payment: card.payment,
            problem: card.problem,
            machineId: card.machineId,
            zoneId: card.zoneId,
            allItems: card.items,
          });
        }
      }
    }
  }
  return result;
}

export const MACHINE_PLACE: Record<string, string> = {
  m3: "Гравёр ЧПУ №1",
  m4: "Гравёр ЧПУ №2",
  m5: "Лазер",
  m6: "Полировщик №1",
  m7: "Полировщик №2",
};

export const COL_NEXT: Record<string, string> = {
  sketch:    "engraving",
  engraving: "polishing",
  polishing: "ready",
  ready:     "",
};

export const COL_NEXT_LABEL: Record<string, string> = {
  sketch:    "Гравировка",
  engraving: "Полировка",
  polishing: "Готов",
  ready:     "",
};
