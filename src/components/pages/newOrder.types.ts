export type ItemStatus = "approved" | "needs_calc" | "by_manager";

export type OrderItem = {
  id: string;
  name: string;
  qty: number;
  unit: string;
  price: number | null;
  status: ItemStatus;
  note: string;
};

export type Deceased = {
  id: string;
  lastName: string;
  firstName: string;
  middleName: string;
  birthYear: string;
  deathYear: string;
  epitaph: string;
  photoRequired: boolean;
};

export const ITEM_STATUS_META: Record<ItemStatus, { label: string; color: string; bg: string; border: string; icon: string; hint: string }> = {
  approved:   { label: "Утверждено",         color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: "BadgeCheck", hint: "Пересчёту не подлежит" },
  needs_calc: { label: "Нужен расчёт",       color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "Calculator", hint: "Сметчик рассчитает" },
  by_manager: { label: "Внесено менеджером", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe", icon: "Pencil",     hint: "Предварительная цена" },
};

export const CATALOG_ITEMS = [
  "Изготовление памятника (базовый)",
  "Гравировка надписи",
  "Портретное фото",
  "Цветная гравировка",
  "Доставка и установка",
  "Бронзовые буквы",
  "Эпитафия (текст)",
  "Орнамент / декор",
];

export const MANAGERS   = ["Олег Краснов", "Анна Морозова", "Игорь Верещагин"];
export const ESTIMATORS = ["Дмитрий Соколов", "Анна Морозова"];
export const STONE_TYPES = [
  "Гранит чёрный (габбро)",
  "Гранит серый",
  "Гранит красный",
  "Мрамор белый",
  "Мрамор серый",
  "Гранит габбро (полированный)",
];

export function uid() { return Math.random().toString(36).slice(2, 8); }
