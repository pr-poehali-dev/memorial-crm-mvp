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

export const orders: Order[] = [
  {
    id: "МП-0041", client: "Смирнова А.В.", phone: "+7 912 345-67-89",
    stone: "Гранит чёрный", size: "100×50×8",
    inscription: "Иванов Пётр Семёнович\n1945–2021", design: "Портрет + орнамент",
    status: "Производство", statusColor: "#f59e0b",
    amount: 38500, paid: 15000,
    date: "12.04.2026", deadline: "28.04.2026",
    manager: "Олег К.", comment: "Клиент просил сделать надпись крупнее",
    deadlineState: "soon", payStatus: "partial",
  },
  {
    id: "МП-0040", client: "Козлов И.Д.", phone: "+7 903 211-44-55",
    stone: "Мрамор белый", size: "80×40×6",
    inscription: "Козлова Мария\n1950–2023", design: "Крест + розы",
    status: "Эскиз", statusColor: "#6366f1",
    amount: 22000, paid: 0,
    date: "10.04.2026", deadline: "20.04.2026",
    manager: "Анна М.", comment: "Ожидает согласования эскиза",
    deadlineState: "overdue", payStatus: "unpaid",
  },
  {
    id: "МП-0039", client: "Петрова О.Н.", phone: "+7 965 888-11-22",
    stone: "Гранит серый", size: "120×60×10",
    inscription: "Петров Алексей\n1938–2020", design: "Фото + берёзы",
    status: "Готов", statusColor: "#22c55e",
    amount: 54000, paid: 54000,
    date: "05.04.2026", deadline: "25.04.2026",
    manager: "Олег К.", comment: "Готов к выдаче, клиент не приехал",
    deadlineState: "ok", payStatus: "paid",
  },
  {
    id: "МП-0038", client: "Фёдоров С.С.", phone: "+7 999 777-33-44",
    stone: "Гранит красный", size: "90×45×7",
    inscription: "Фёдорова Нина\n1960–2024", design: "Лилии",
    status: "Доставка", statusColor: "#3b82f6",
    amount: 31000, paid: 31000,
    date: "01.04.2026", deadline: "22.04.2026",
    manager: "Игорь В.", comment: "Доставка на кладбище Митино",
    deadlineState: "overdue", payStatus: "paid",
  },
  {
    id: "МП-0037", client: "Иванов П.К.", phone: "+7 900 123-00-00",
    stone: "Гранит чёрный", size: "100×50×8",
    inscription: "Иванов Константин\n1955–2022", design: "Портрет",
    status: "Выдан", statusColor: "#9b9b9b",
    amount: 41000, paid: 41000,
    date: "28.03.2026", deadline: "15.04.2026",
    manager: "Анна М.", comment: "",
    deadlineState: "done", payStatus: "paid",
  },
  {
    id: "МП-0036", client: "Морозова Т.И.", phone: "+7 921 456-78-90",
    stone: "Гранит габбро", size: "110×55×8",
    inscription: "Морозов Виктор\n1942–2021", design: "Звезда + надпись",
    status: "Производство", statusColor: "#f59e0b",
    amount: 46000, paid: 20000,
    date: "25.03.2026", deadline: "30.04.2026",
    manager: "Игорь В.", comment: "Гравировка звезды по шаблону МВД",
    deadlineState: "ok", payStatus: "partial",
  },
  {
    id: "МП-0035", client: "Лебедев К.А.", phone: "+7 916 700-22-11",
    stone: "Гранит серый", size: "100×50×8",
    inscription: "Лебедева Ирина\n1963–2023", design: "Цветы + орнамент",
    status: "Производство", statusColor: "#f59e0b",
    amount: 35000, paid: 0,
    date: "20.03.2026", deadline: "10.04.2026",
    manager: "Олег К.", comment: "Ждём предоплату, работы не начаты",
    deadlineState: "overdue", payStatus: "unpaid",
  },
];

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

export const miniStats = [
  { label: "Всего заказов", value: String(orders.length), icon: "FileText", color: "#6b6b6b" },
  { label: "В работе",      value: String(orders.filter(o => ["Эскиз","Производство","Доставка"].includes(o.status)).length), icon: "Hammer",        color: "#f59e0b" },
  { label: "Просрочено",    value: String(orders.filter(o => o.deadlineState === "overdue").length),                          icon: "AlertTriangle", color: "#ef4444" },
  { label: "Долг клиентов", value: orders.filter(o => o.payStatus !== "paid").reduce((s,o) => s + (o.amount - o.paid), 0).toLocaleString("ru") + " ₽", icon: "CreditCard", color: "#6366f1" },
];
