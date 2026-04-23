import { CATEGORY_META } from "@/data/catalog";

export type ItemStatus = "by_manager" | "needs_calc" | "calculated" | "approved";
export type Category = string;

export type LineItem = {
  id: string;
  name: string;
  category: Category;
  qty: number;
  unit: string;
  price: number;
  cost: number;
  status: ItemStatus;
  author: string;
  locked: boolean;
  note: string;
};

export const STATUS_META: Record<ItemStatus, { label: string; color: string; bg: string; border: string; icon: string }> = {
  by_manager: { label: "Менеджер",      color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe", icon: "Pencil"       },
  needs_calc: { label: "Нужен расчёт", color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "Calculator"   },
  calculated: { label: "Посчитано",    color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc", icon: "CheckCircle2" },
  approved:   { label: "Утверждено",   color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: "BadgeCheck"   },
};

export const CAT_META = (cat: string) =>
  CATEGORY_META[cat as keyof typeof CATEGORY_META] ?? { label: cat, color: "#9b9b9b" };

export const INIT_ITEMS: LineItem[] = [
  { id: "1", name: "Изготовление памятника (базовый)", category: "stone",    qty: 1, unit: "шт.",    price: 22000, cost: 12000, status: "approved",   author: "Олег К.", locked: true,  note: "" },
  { id: "2", name: "Гравировка надписи",               category: "engraving",qty: 1, unit: "шт.",    price: 6500,  cost: 2800,  status: "approved",   author: "Олег К.", locked: true,  note: "" },
  { id: "3", name: "Портретное фото",                  category: "engraving",qty: 1, unit: "шт.",    price: 0,     cost: 0,     status: "needs_calc", author: "Олег К.", locked: false, note: "Уточнить: цветное или ч/б" },
  { id: "4", name: "Доставка до кладбища",             category: "delivery", qty: 1, unit: "поезд.", price: 3500,  cost: 1800,  status: "by_manager", author: "Анна М.", locked: false, note: "" },
  { id: "5", name: "Установка памятника",              category: "delivery", qty: 1, unit: "шт.",    price: 0,     cost: 0,     status: "needs_calc", author: "Анна М.", locked: false, note: "Зависит от расстояния" },
];

export function uid() { return Math.random().toString(36).slice(2, 8); }
