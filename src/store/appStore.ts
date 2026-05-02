import { createContext, useContext } from "react";
import type { Order, PayStatus, DeadlineState } from "@/components/pages/orders/orders.types";
import type { Client } from "@/components/pages/ClientsPage";
import type { RawMaterial, Blank, Movement, StockItem } from "@/components/pages/warehouse/warehouse.types";
import type { CuttingTask, Shift } from "@/components/pages/cutting/cutting.types";

/* ═══════════════════════════════════════════
   АККАУНТЫ
═══════════════════════════════════════════ */
export type Account = {
  login: string;
  password: string;
  role: "owner" | "manager" | "production" | "estimator" | "accountant";
  name: string;
  companyId: string;
};

export const ACCOUNTS: Account[] = [
  { login: "1", password: "1", role: "owner", name: "Тестовый пользователь", companyId: "c1" },
  { login: "2", password: "2", role: "owner", name: "Олег Краснов",          companyId: "c2" },
];

/* ═══════════════════════════════════════════
   ДЕМО-ДАННЫЕ — Аккаунт 1 (пустой)
═══════════════════════════════════════════ */
const EMPTY_RAW: RawMaterial[] = [
  { id: "r1", name: "Гранит чёрный", unit: "м²", qty: 0, min: 5, price: 4200 },
  { id: "r2", name: "Гранит серый",  unit: "м²", qty: 0, min: 5, price: 3800 },
  { id: "r3", name: "Гранит красный",unit: "м²", qty: 0, min: 5, price: 5100 },
  { id: "r4", name: "Мрамор белый",  unit: "м²", qty: 0, min: 4, price: 6500 },
  { id: "r5", name: "Мрамор серый",  unit: "м²", qty: 0, min: 3, price: 5800 },
];

/* ═══════════════════════════════════════════
   ДЕМО-ДАННЫЕ — Аккаунт 2 (demo)
═══════════════════════════════════════════ */
const DEMO_ORDERS: Order[] = [
  {
    id: "МП-0041", client: "Смирнова А.В.", phone: "+7 912 345-67-89",
    stone: "Гранит чёрный", size: "100×50×8",
    inscription: "Иванов Пётр Семёнович\n1945–2021", design: "Портрет + орнамент",
    status: "Производство", statusColor: "#f59e0b",
    amount: 38500, paid: 15000,
    date: "12.04.2026", deadline: "28.05.2026",
    manager: "Олег К.", comment: "Клиент просил надпись крупнее",
    deadlineState: "soon" as DeadlineState, payStatus: "partial" as PayStatus,
  },
  {
    id: "МП-0040", client: "Козлов И.Д.", phone: "+7 903 211-44-55",
    stone: "Мрамор белый", size: "80×40×6",
    inscription: "Козлова Мария\n1950–2023", design: "Крест + розы",
    status: "Эскиз", statusColor: "#6366f1",
    amount: 22000, paid: 0,
    date: "10.04.2026", deadline: "05.05.2026",
    manager: "Анна М.", comment: "Ожидает согласования эскиза",
    deadlineState: "ok" as DeadlineState, payStatus: "unpaid" as PayStatus,
  },
  {
    id: "МП-0039", client: "Петрова О.Н.", phone: "+7 965 888-11-22",
    stone: "Гранит серый", size: "120×60×10",
    inscription: "Петров Алексей\n1938–2020", design: "Фото + берёзы",
    status: "Готов", statusColor: "#22c55e",
    amount: 54000, paid: 54000,
    date: "05.04.2026", deadline: "20.04.2026",
    manager: "Олег К.", comment: "",
    deadlineState: "done" as DeadlineState, payStatus: "paid" as PayStatus,
  },
  {
    id: "МП-0038", client: "Фёдоров С.С.", phone: "+7 999 777-33-44",
    stone: "Гранит красный", size: "90×45×7",
    inscription: "Фёдорова Нина\n1955–2024", design: "Простая полировка",
    status: "Гравировка", statusColor: "#8b5cf6",
    amount: 31000, paid: 20000,
    date: "28.03.2026", deadline: "15.05.2026",
    manager: "Игорь В.", comment: "VIP-клиент",
    deadlineState: "ok" as DeadlineState, payStatus: "partial" as PayStatus,
  },
  {
    id: "МП-0037", client: "Белова Е.С.", phone: "+7 916 200-10-30",
    stone: "Мрамор серый", size: "100×50×8",
    inscription: "Белов Игорь\n1960–2023", design: "Стандарт",
    status: "Эскиз", statusColor: "#6366f1",
    amount: 29000, paid: 0,
    date: "01.04.2026", deadline: "25.04.2026",
    manager: "Анна М.", comment: "",
    deadlineState: "overdue" as DeadlineState, payStatus: "unpaid" as PayStatus,
  },
];

const DEMO_CLIENTS: Client[] = [
  { id: "CL-001", name: "Смирнова Алла Васильевна",    phone: "+7 912 345-67-89", city: "Москва",   address: "ул. Ленина, 14, кв. 7",    orders: 2, total: 60500,  paid: 54000,  last: "12.04.2026", active: true,  comment: "Постоянный клиент",            manager: "Олег К.",  since: "авг 2025" },
  { id: "CL-002", name: "Козлов Игорь Дмитриевич",     phone: "+7 903 211-44-55", city: "Москва",   address: "пр. Мира, 88, кв. 12",     orders: 1, total: 22000,  paid: 0,      last: "10.04.2026", active: true,  comment: "Ожидает согласования эскиза",  manager: "Анна М.",  since: "апр 2026" },
  { id: "CL-003", name: "Петрова Ольга Николаевна",     phone: "+7 965 888-11-22", city: "Балашиха", address: "ул. Советская, 5",         orders: 1, total: 54000,  paid: 54000,  last: "05.04.2026", active: false, comment: "Заказ закрыт",                 manager: "Олег К.",  since: "апр 2026" },
  { id: "CL-004", name: "Фёдоров Сергей Семёнович",    phone: "+7 999 777-33-44", city: "Подольск", address: "ул. Парковая, 3",          orders: 1, total: 31000,  paid: 20000,  last: "28.03.2026", active: true,  comment: "VIP-клиент",                   manager: "Игорь В.", since: "мар 2026" },
  { id: "CL-005", name: "Белова Елена Сергеевна",      phone: "+7 916 200-10-30", city: "Москва",   address: "ул. Садовая, 9, кв. 3",   orders: 1, total: 29000,  paid: 0,      last: "01.04.2026", active: true,  comment: "Ждёт эскиза",                 manager: "Анна М.",  since: "апр 2026" },
];

const DEMO_RAW: RawMaterial[] = [
  { id: "r1", name: "Гранит чёрный", unit: "м²", qty: 14.5, min: 5,  price: 4200 },
  { id: "r2", name: "Гранит серый",  unit: "м²", qty: 7.2,  min: 5,  price: 3800 },
  { id: "r3", name: "Гранит красный",unit: "м²", qty: 0.5,  min: 5,  price: 5100 },
  { id: "r4", name: "Мрамор белый",  unit: "м²", qty: 2.4,  min: 4,  price: 6500 },
  { id: "r5", name: "Мрамор серый",  unit: "м²", qty: 5.8,  min: 3,  price: 5800 },
];

const DEMO_BLANKS: Blank[] = [
  { id: "b1", name: "Плита стандарт",  size: "100×50×8",  materialId: "r1", qty: 4, min: 2 },
  { id: "b2", name: "Плита большая",   size: "120×60×10", materialId: "r2", qty: 2, min: 1 },
  { id: "b3", name: "Тумба",           size: "60×30×80",  materialId: "r1", qty: 3, min: 1 },
];

const DEMO_MOVEMENTS: Movement[] = [
  { id: "m1", date: "20 апр.", type: "use",  materialId: "r1", blankId: "b1", qty: 1, note: "Списание на заказ МП-0041",  order: "МП-0041",  remainAfter: 14.5 },
  { id: "m2", date: "18 апр.", type: "cut",  materialId: "r2", blankId: "b2", qty: 2, note: "Нарезка: Плита большая",      remainAfter: 7.2  },
  { id: "m3", date: "15 апр.", type: "in",   materialId: "r1", qty: 5.0, pricePerUnit: 4200, totalSum: 21000, note: "Приход от поставщика", receiptId: "КР-0041", remainAfter: 19.5 },
  { id: "m4", date: "10 апр.", type: "use",  materialId: "r4", blankId: "b1", qty: 1, note: "Списание на заказ МП-0040",  order: "МП-0040",  remainAfter: 2.4  },
];

const DEMO_STOCK: StockItem[] = [
  { id: "st1", catalogId: "c01", name: "Памятник стандартный 100×50×8", category: "monument", qty: 2, price: 22000, addedAt: "15 апр." },
  { id: "st2", catalogId: "c05", name: "Тумба гранитная стандартная",  category: "pedestal", qty: 3, price: 8500,  addedAt: "18 апр." },
];

const DEMO_TASKS: CuttingTask[] = [
  { id: "t1", blankTypeId: "bt1", materialName: "Гранит чёрный", totalQty: 10, doneQty: 4, inProgressQty: 2, status: "active",  createdAt: "28.04.2026", deadline: "10.05.2026" },
  { id: "t2", blankTypeId: "bt2", materialName: "Гранит серый",  totalQty: 6,  doneQty: 0, inProgressQty: 0, status: "pending", createdAt: "29.04.2026" },
];

const DEMO_SHIFTS: Shift[] = [
  {
    id: "s1", placeId: "p1", employeeId: "e1", workType: "cutting",
    date: new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }),
    status: "active", startedAt: "08:00", results: [], taskId: "t1", taskQtyAssigned: 4,
  },
  {
    id: "s2", placeId: "p2", employeeId: "e2", workType: "cutting",
    date: new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }),
    status: "done", startedAt: "08:00", finishedAt: "14:30",
    results: [
      { blankTypeId: "bt1", produced: 4, rawAuto: true, rawUsed: 2.0, orderId: "МП-0041" },
      { blankTypeId: "bt3", produced: 2, rawAuto: true, rawUsed: 2.88, orderId: "На склад" },
    ],
  },
];

/* ═══════════════════════════════════════════
   ТИП ДАННЫХ АККАУНТА
═══════════════════════════════════════════ */
export type AccountData = {
  orders: Order[];
  clients: Client[];
  rawMat: RawMaterial[];
  blanks: Blank[];
  movements: Movement[];
  stock: StockItem[];
  cuttingTasks: CuttingTask[];
  shifts: Shift[];
};

export function getInitialData(companyId: string): AccountData {
  if (companyId === "c1") {
    return {
      orders: [],
      clients: [],
      rawMat: EMPTY_RAW,
      blanks: [],
      movements: [],
      stock: [],
      cuttingTasks: [],
      shifts: [],
    };
  }
  return {
    orders:       DEMO_ORDERS,
    clients:      DEMO_CLIENTS,
    rawMat:       DEMO_RAW,
    blanks:       DEMO_BLANKS,
    movements:    DEMO_MOVEMENTS,
    stock:        DEMO_STOCK,
    cuttingTasks: DEMO_TASKS,
    shifts:       DEMO_SHIFTS,
  };
}

/* ═══════════════════════════════════════════
   APP CONTEXT
═══════════════════════════════════════════ */
export type AppContextValue = {
  account: Account | null;
  data: AccountData;

  /* Заказы */
  addOrder:    (o: Order) => void;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  removeOrder: (id: string) => void;

  /* Клиенты */
  addClient:    (c: Client) => void;
  updateClient: (id: string, patch: Partial<Client>) => void;

  /* Склад — сырьё */
  addRaw:       (r: RawMaterial) => void;
  updateRaw:    (id: string, patch: Partial<RawMaterial>) => void;
  addMovement:  (m: Movement) => void;

  /* Склад — заготовки */
  updateBlank:  (id: string, patch: Partial<Blank>) => void;

  /* Склад — изделия */
  addStockItem:    (i: StockItem) => void;
  updateStockQty:  (id: string, delta: number) => void;
  removeStockItem: (id: string) => void;

  /* Заготовки */
  addCuttingTask:    (t: CuttingTask) => void;
  updateCuttingTask: (id: string, patch: Partial<CuttingTask>) => void;

  /* Смены */
  addShift:    (s: Shift) => void;
  updateShift: (id: string, patch: Partial<Shift>) => void;
};

export const AppContext = createContext<AppContextValue>({
  account: null,
  data: getInitialData(""),
  addOrder: () => {}, updateOrder: () => {}, removeOrder: () => {},
  addClient: () => {}, updateClient: () => {},
  addRaw: () => {}, updateRaw: () => {}, addMovement: () => {},
  updateBlank: () => {},
  addStockItem: () => {}, updateStockQty: () => {}, removeStockItem: () => {},
  addCuttingTask: () => {}, updateCuttingTask: () => {},
  addShift: () => {}, updateShift: () => {},
});

export const useApp = () => useContext(AppContext);
