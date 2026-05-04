import { useState } from "react";
import Icon from "@/components/ui/icon";
import StoneCalculator from "./StoneCalculator";
import { LineItem } from "./estimate.types";

/* ── Категории расчётов ── */
const CATEGORIES = [
  { id: "stela",    label: "Стелы",                   icon: "Monument",   color: "#1a1a1a", bg: "#f4f4f4", active: true },
  { id: "slab",     label: "Надгробные плиты",         icon: "Square",     color: "#6366f1", bg: "#eef2ff", active: false },
  { id: "pedestal", label: "Тумбы",                   icon: "Box",        color: "#d97706", bg: "#fffbeb", active: false },
  { id: "socle",    label: "Цоколи",                  icon: "Layers",     color: "#0891b2", bg: "#ecfeff", active: false },
  { id: "tile",     label: "Плитка",                  icon: "Grid3x3",    color: "#16a34a", bg: "#f0fdf4", active: false },
  { id: "deco",     label: "Вазы / столы / скамейки", icon: "Armchair",   color: "#9333ea", bg: "#faf5ff", active: false },
  { id: "engrave",  label: "Гравировка",              icon: "Pen",        color: "#ef4444", bg: "#fef2f2", active: false },
  { id: "portrait", label: "Портрет",                 icon: "UserSquare", color: "#ec4899", bg: "#fdf2f8", active: false },
  { id: "polish",   label: "Полировка",               icon: "Sparkles",   color: "#14b8a6", bg: "#f0fdfa", active: false },
  { id: "delivery", label: "Доставка",                icon: "Truck",      color: "#64748b", bg: "#f8fafc", active: false },
  { id: "install",  label: "Установка",               icon: "Wrench",     color: "#78716c", bg: "#fafaf9", active: false },
];

export default function EstimatePage({ onBack: _onBack }: { onBack?: () => void }) {
  const [showCalc, setShowCalc] = useState(false);

  const handleAddFromCalc = (_item: LineItem) => {
    setShowCalc(false);
  };

  return (
    <div className="h-full overflow-y-auto bg-[#fafafa]">

      {showCalc && (
        <StoneCalculator
          onClose={() => setShowCalc(false)}
          onAdd={handleAddFromCalc}
        />
      )}

      <div className="max-w-[960px] mx-auto px-7 py-6 space-y-6">

        {/* Шапка */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold text-[#1a1a1a] tracking-tight">Калькулятор</h1>
            <p className="text-[13px] text-[#9b9b9b] mt-0.5">Расчёт стоимости изделий</p>
          </div>
        </div>

        {/* Памятка */}
        <div className="flex items-start gap-3 bg-[#f0fdf4] border border-green-200 rounded-xl px-4 py-3.5">
          <Icon name="BookOpen" size={15} className="text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold text-green-800">Расчёты сохраняются в каталог</p>
            <p className="text-[12px] text-green-700 mt-0.5">
              После расчёта нажмите «Добавить в смету» — позиция появится в каталоге и будет доступна при создании нового заказа.
            </p>
          </div>
        </div>

        {/* Категории */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-3">Выберите категорию</p>
          <div className="grid grid-cols-4 gap-2.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => cat.active && setShowCalc(true)}
                disabled={!cat.active}
                className={`relative flex items-center gap-3 px-4 py-3 bg-white border rounded-xl text-left transition-all
                  ${cat.active
                    ? "border-[#ebebeb] hover:border-[#c5c5c5] hover:shadow-sm cursor-pointer group"
                    : "border-[#ebebeb] opacity-45 cursor-not-allowed"
                  }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: cat.bg }}
                >
                  <Icon name={cat.icon as never} size={15} style={{ color: cat.color }} />
                </div>
                <span className="text-[12px] font-medium text-[#1a1a1a] leading-tight">{cat.label}</span>
                {!cat.active && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] font-bold text-[#b5b5b5] bg-[#f5f5f5] px-1.5 py-0.5 rounded-full">
                    скоро
                  </span>
                )}
                {cat.active && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                    доступен
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
