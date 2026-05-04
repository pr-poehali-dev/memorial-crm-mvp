export type PayStatus = "paid" | "partial" | "unpaid";
export type DeadlineState = "overdue" | "soon" | "ok" | "done";

export type Order = {
  id: string;
  client: string;
  phone: string;
  stone: string;
  size: string;
  inscription: string;
  design: string;
  status: string;
  statusColor: string;
  amount: number;
  paid: number;
  date: string;
  deadline: string;
  manager: string;
  comment: string;
  deadlineState: DeadlineState;
  payStatus: PayStatus;
};

export type FilterKey = "all" | "mine" | "overdue" | "unpaid" | "inwork";

export const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",     label: "Все" },
  { key: "mine",    label: "Мои" },
  { key: "overdue", label: "Просроченные" },
  { key: "unpaid",  label: "Без оплаты" },
  { key: "inwork",  label: "В работе" },
];

export const PAY_LABELS: Record<PayStatus, { label: string; color: string; bg: string }> = {
  paid:    { label: "Оплачен",    color: "#16a34a", bg: "#f0fdf4" },
  partial: { label: "Частично",   color: "#d97706", bg: "#fffbeb" },
  unpaid:  { label: "Не оплачен", color: "#dc2626", bg: "#fef2f2" },
};

export const DEADLINE_ROW: Record<DeadlineState, string> = {
  overdue: "bg-red-50 hover:bg-red-100/60",
  soon:    "bg-amber-50/60 hover:bg-amber-100/40",
  ok:      "hover:bg-[#fafafa]",
  done:    "hover:bg-[#fafafa] opacity-70",
};
