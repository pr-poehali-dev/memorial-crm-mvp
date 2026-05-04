/* ─── Базовые типы ─── */
export type DeadlineState = "overdue" | "soon" | "ok";
export type FilterKey = "all" | "mine" | "overdue" | "urgent";
export type ItemStatus = "done" | "in_progress" | "pending";

/* ─── Карточка заказа в канбане ─── */
export type Card = {
  id: string;
  client: string;
  stone: string;
  size: string;
  status: string;
  deadline: string;
  deadlineState: DeadlineState;
  manager: string;
  phone: string;
  payment: string;
  comment?: string;
  urgent?: boolean;
};

/* ─── Колонка канбана ─── */
export type Column = {
  id: string;
  label: string;
  color: string;
  cards: Card[];
};

/* ─── Плоская карточка для списка ─── */
export type FlatItem = {
  itemId: string;
  orderId: string;
  colId: string;
  colLabel: string;
  colColor: string;
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
  allItems: { id: string; type: string; status: ItemStatus; progress: number }[];
};

/* ─── Статичные конфиги колонок ─── */
export const COL_CONFIG: { id: string; label: string; color: string; statuses: string[] }[] = [
  { id: "sketch",    label: "Эскиз",      color: "#6366f1", statuses: ["Эскиз"] },
  { id: "production",label: "Производство",color: "#f59e0b", statuses: ["Производство"] },
  { id: "engraving", label: "Гравировка", color: "#ec4899", statuses: ["Гравировка"] },
  { id: "polishing",  label: "Полировка",  color: "#14b8a6", statuses: ["Полировка"] },
  { id: "ready",     label: "Готов",      color: "#22c55e", statuses: ["Готов"] },
  { id: "delivery",  label: "Доставка",   color: "#6b7280", statuses: ["Доставка"] },
];

export const COL_NEXT_STATUS: Record<string, string> = {
  sketch:     "Производство",
  production: "Гравировка",
  engraving:  "Полировка",
  polishing:  "Готов",
  ready:      "Доставка",
  delivery:   "",
};

export const COL_NEXT_LABEL: Record<string, string> = {
  sketch:     "Производство",
  production: "Гравировка",
  engraving:  "Полировка",
  polishing:  "Готов",
  ready:      "Доставка",
  delivery:   "",
};

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
  done:        { label: "Готово",    color: "#16a34a", bg: "#f0fdf4", dot: "bg-green-400" },
  in_progress: { label: "В работе", color: "#d97706", bg: "#fffbeb", dot: "bg-amber-400" },
  pending:     { label: "Не начато",color: "#9b9b9b", bg: "#f5f5f5", dot: "bg-gray-300"  },
};
