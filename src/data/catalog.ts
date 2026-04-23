export type CatalogCategory =
  | "monument" | "pedestal" | "flowerbed" | "fence"
  | "coffin" | "cross" | "art" | "service" | "other";

export type CalcType = "fixed" | "manual" | "formula" | "template";

export type CatalogItem = {
  id: string;
  name: string;
  category: CatalogCategory;
  unit: string;
  price: number;
  cost: number;
  calcType: CalcType;
  active: boolean;
  comment: string;
  usedInOrders: number;
  createdBy: string;
  updatedAt: string;
};

export const CATEGORY_META: Record<CatalogCategory, { label: string; icon: string; color: string; bg: string }> = {
  monument:  { label: "Памятники",            icon: "Monument",      color: "#1a1a1a", bg: "#f5f5f5" },
  pedestal:  { label: "Тумбы",                icon: "Box",           color: "#6366f1", bg: "#eef2ff" },
  flowerbed: { label: "Цветники",             icon: "Flower2",       color: "#16a34a", bg: "#f0fdf4" },
  fence:     { label: "Ограды",               icon: "LayoutList",    color: "#d97706", bg: "#fffbeb" },
  coffin:    { label: "Гробы",                icon: "Package",       color: "#64748b", bg: "#f8fafc" },
  cross:     { label: "Кресты",               icon: "Plus",          color: "#9333ea", bg: "#faf5ff" },
  art:       { label: "Художественные работы",icon: "Paintbrush2",   color: "#ec4899", bg: "#fdf2f8" },
  service:   { label: "Услуги",               icon: "Wrench",        color: "#0891b2", bg: "#ecfeff" },
  other:     { label: "Прочее",               icon: "MoreHorizontal",color: "#9b9b9b", bg: "#fafafa" },
};

export const CALC_TYPE_META: Record<CalcType, { label: string; color: string; hint: string }> = {
  fixed:    { label: "Фикс. цена",    color: "#16a34a", hint: "Цена задана, расчёт не нужен" },
  manual:   { label: "Ручной расчёт", color: "#d97706", hint: "Сметчик вводит цену вручную" },
  formula:  { label: "По формуле",    color: "#6366f1", hint: "Цена рассчитывается автоматически" },
  template: { label: "По шаблону",    color: "#0891b2", hint: "Используется шаблон позиции" },
};

export const CATALOG: CatalogItem[] = [
  // Памятники
  { id: "c01", name: "Памятник стандартный 100×50×8",   category: "monument",  unit: "шт.", price: 22000, cost: 11000, calcType: "fixed",    active: true,  comment: "Базовый размер, гранит чёрный", usedInOrders: 48, createdBy: "Дмитрий С.", updatedAt: "10 апр." },
  { id: "c02", name: "Памятник премиум 120×60×10",      category: "monument",  unit: "шт.", price: 38000, cost: 19000, calcType: "fixed",    active: true,  comment: "Полировка с двух сторон", usedInOrders: 21, createdBy: "Дмитрий С.", updatedAt: "05 апр." },
  { id: "c03", name: "Памятник индивидуальный",         category: "monument",  unit: "шт.", price: 0,     cost: 0,     calcType: "manual",   active: true,  comment: "Цена рассчитывается по размеру", usedInOrders: 14, createdBy: "Дмитрий С.", updatedAt: "01 апр." },
  { id: "c04", name: "Памятник мраморный белый",        category: "monument",  unit: "шт.", price: 45000, cost: 24000, calcType: "fixed",    active: true,  comment: "Мрамор итальянский", usedInOrders: 7, createdBy: "Дмитрий С.", updatedAt: "28 мар." },
  // Тумбы
  { id: "c05", name: "Тумба гранитная стандартная",    category: "pedestal",  unit: "шт.", price: 8500,  cost: 4200,  calcType: "fixed",    active: true,  comment: "", usedInOrders: 19, createdBy: "Дмитрий С.", updatedAt: "12 апр." },
  { id: "c06", name: "Тумба с вазой",                  category: "pedestal",  unit: "шт.", price: 11000, cost: 5500,  calcType: "fixed",    active: true,  comment: "С отверстием под цветы", usedInOrders: 12, createdBy: "Дмитрий С.", updatedAt: "08 апр." },
  // Цветники
  { id: "c07", name: "Цветник гранитный 60×40",        category: "flowerbed", unit: "шт.", price: 7000,  cost: 3500,  calcType: "fixed",    active: true,  comment: "", usedInOrders: 11, createdBy: "Дмитрий С.", updatedAt: "15 апр." },
  { id: "c08", name: "Цветник мраморный с бортиком",   category: "flowerbed", unit: "шт.", price: 9500,  cost: 5000,  calcType: "fixed",    active: true,  comment: "", usedInOrders: 5,  createdBy: "Дмитрий С.", updatedAt: "10 апр." },
  // Ограды
  { id: "c09", name: "Ограда металлическая 2×3 м",     category: "fence",     unit: "компл.", price: 18000, cost: 8500, calcType: "template", active: true,  comment: "Покраска порошком", usedInOrders: 8, createdBy: "Дмитрий С.", updatedAt: "03 апр." },
  { id: "c10", name: "Ограда кованая индивидуальная",  category: "fence",     unit: "м.п.", price: 0,     cost: 0,    calcType: "manual",   active: true,  comment: "Цена по погонному метру", usedInOrders: 3, createdBy: "Дмитрий С.", updatedAt: "20 мар." },
  // Гробы
  { id: "c11", name: "Гроб сосновый стандарт",         category: "coffin",    unit: "шт.", price: 5500,  cost: 2800,  calcType: "fixed",    active: true,  comment: "", usedInOrders: 16, createdBy: "Дмитрий С.", updatedAt: "11 апр." },
  { id: "c12", name: "Гроб дубовый премиум",           category: "coffin",    unit: "шт.", price: 18000, cost: 9500,  calcType: "fixed",    active: true,  comment: "", usedInOrders: 6,  createdBy: "Дмитрий С.", updatedAt: "07 апр." },
  // Кресты
  { id: "c13", name: "Крест металлический стандарт",   category: "cross",     unit: "шт.", price: 3500,  cost: 1500,  calcType: "fixed",    active: true,  comment: "", usedInOrders: 22, createdBy: "Дмитрий С.", updatedAt: "14 апр." },
  { id: "c14", name: "Крест гранитный",                category: "cross",     unit: "шт.", price: 12000, cost: 6000,  calcType: "fixed",    active: true,  comment: "", usedInOrders: 9,  createdBy: "Дмитрий С.", updatedAt: "09 апр." },
  // Художественные работы
  { id: "c15", name: "Портретная гравировка",          category: "art",       unit: "шт.", price: 7000,  cost: 2500,  calcType: "manual",   active: true,  comment: "Цена зависит от сложности", usedInOrders: 31, createdBy: "Дмитрий С.", updatedAt: "16 апр." },
  { id: "c16", name: "Цветная гравировка",             category: "art",       unit: "шт.", price: 9500,  cost: 3500,  calcType: "manual",   active: true,  comment: "", usedInOrders: 14, createdBy: "Дмитрий С.", updatedAt: "06 апр." },
  { id: "c17", name: "Надпись (гравировка текста)",    category: "art",       unit: "шт.", price: 4500,  cost: 1800,  calcType: "fixed",    active: true,  comment: "До 100 символов", usedInOrders: 52, createdBy: "Дмитрий С.", updatedAt: "17 апр." },
  { id: "c18", name: "Орнамент / декор",               category: "art",       unit: "шт.", price: 3800,  cost: 1500,  calcType: "fixed",    active: false, comment: "Временно приостановлено", usedInOrders: 8, createdBy: "Дмитрий С.", updatedAt: "01 мар." },
  // Услуги
  { id: "c19", name: "Доставка по Москве",             category: "service",   unit: "поезд.", price: 3500, cost: 1800, calcType: "fixed",   active: true,  comment: "", usedInOrders: 38, createdBy: "Дмитрий С.", updatedAt: "18 апр." },
  { id: "c20", name: "Установка памятника",            category: "service",   unit: "шт.", price: 5000,  cost: 2500,  calcType: "fixed",    active: true,  comment: "Включает выравнивание", usedInOrders: 29, createdBy: "Дмитрий С.", updatedAt: "18 апр." },
  { id: "c21", name: "Доставка за МКАД (за км)",       category: "service",   unit: "км",  price: 50,    cost: 25,    calcType: "formula",  active: true,  comment: "Считается от МКАД", usedInOrders: 15, createdBy: "Дмитрий С.", updatedAt: "15 апр." },
  { id: "c22", name: "Демонтаж старого памятника",     category: "service",   unit: "шт.", price: 4000,  cost: 1800,  calcType: "fixed",    active: true,  comment: "", usedInOrders: 7,  createdBy: "Дмитрий С.", updatedAt: "02 апр." },
  { id: "c23", name: "Уборка захоронения",             category: "service",   unit: "шт.", price: 2500,  cost: 1000,  calcType: "fixed",    active: false, comment: "", usedInOrders: 4,  createdBy: "Дмитрий С.", updatedAt: "15 фев." },
];
