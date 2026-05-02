import { useState } from "react";
import Icon from "@/components/ui/icon";
import StoneCalculator from "./StoneCalculator";
import { LineItem, uid } from "./estimate.types";

/* ── Категории расчётов ── */
const CATEGORIES = [
  { id: "stela",    label: "Стелы",                icon: "Monument",      color: "#1a1a1a", bg: "#f4f4f4" },
  { id: "slab",     label: "Надгробные плиты",     icon: "Square",        color: "#6366f1", bg: "#eef2ff" },
  { id: "pedestal", label: "Тумбы",                icon: "Box",           color: "#d97706", bg: "#fffbeb" },
  { id: "socle",    label: "Цоколи",               icon: "Layers",        color: "#0891b2", bg: "#ecfeff" },
  { id: "tile",     label: "Плитка",               icon: "Grid3x3",       color: "#16a34a", bg: "#f0fdf4" },
  { id: "deco",     label: "Вазы / столы / скамейки", icon: "Armchair",  color: "#9333ea", bg: "#faf5ff" },
  { id: "engrave",  label: "Гравировка",           icon: "Pen",           color: "#ef4444", bg: "#fef2f2" },
  { id: "portrait", label: "Портрет",              icon: "UserSquare",    color: "#ec4899", bg: "#fdf2f8" },
  { id: "polish",   label: "Полировка",            icon: "Sparkles",      color: "#14b8a6", bg: "#f0fdfa" },
  { id: "delivery", label: "Доставка",             icon: "Truck",         color: "#64748b", bg: "#f8fafc" },
  { id: "install",  label: "Установка",            icon: "Wrench",        color: "#78716c", bg: "#fafaf9" },
];

/* ── Список сохранённых расчётов (моковые) ── */
type SavedCalc = {
  id: string;
  name: string;
  category: string;
  price: number;
  date: string;
  note?: string;
};

const INIT_SAVED: SavedCalc[] = [
  { id: "sc1", name: "Стела Иванов 100×50×8",    category: "stela",    price: 32000, date: "18 апр." },
  { id: "sc2", name: "Плита Смирнова 80×40×6",   category: "slab",     price: 18500, date: "15 апр." },
  { id: "sc3", name: "Гравировка + портрет",     category: "portrait", price: 11500, date: "10 апр." },
];

/* ── Новый расчёт — модалка выбора ── */
function NewCalcModal({ onClose, onStart }: { onClose: () => void; onStart: (cat: string) => void }) {
  const [name, setName]       = useState("");
  const [selCat, setSelCat]   = useState("stela");

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden animate-slide-in-right" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#f5f5f5] rounded-lg flex items-center justify-center">
                <Icon name="Plus" size={13} className="text-[#6b6b6b]" />
              </div>
              <span className="text-[14px] font-semibold text-[#1a1a1a]">Новый расчёт</span>
            </div>
            <button onClick={onClose} className="text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors">
              <Icon name="X" size={15} />
            </button>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div>
              <label className="block text-[11px] text-[#6b6b6b] mb-1.5">Название (необязательно)</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Например: Стела Иванов 100×50"
                className="w-full border border-[#ebebeb] rounded-[8px] px-3 py-2 text-[13px] outline-none focus:border-[#c0c0c0] transition-colors placeholder:text-[#c5c5c5]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#6b6b6b] mb-2">Категория</label>
              <div className="grid grid-cols-3 gap-1.5">
                {CATEGORIES.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelCat(c.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-2 rounded-[9px] border text-left transition-all
                      ${selCat === c.id
                        ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
                        : "border-[#ebebeb] hover:border-[#c0c0c0]"}`}
                  >
                    <Icon name={c.icon as never} size={11} style={{ color: selCat === c.id ? "white" : c.color }} />
                    <span className="text-[11px] font-medium truncate">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="px-5 pb-5 flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-[9px] border border-[#ebebeb] text-[12px] text-[#6b6b6b] hover:border-[#c5c5c5] transition-colors">
              Отмена
            </button>
            <button
              onClick={() => { onStart(selCat); onClose(); }}
              className="flex-1 py-2.5 rounded-[9px] bg-[#1a1a1a] text-white text-[12px] font-semibold hover:bg-[#333] transition-colors"
            >
              Открыть калькулятор
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════
   ГЛАВНАЯ СТРАНИЦА
════════════════════════════════════════ */
export default function EstimatePage({ onBack: _onBack }: { onBack?: () => void }) {
  const [showNewModal,  setShowNewModal]  = useState(false);
  const [showCalc,      setShowCalc]      = useState(false);
  const [savedCalcs,    setSavedCalcs]    = useState<SavedCalc[]>(INIT_SAVED);
  const [search,        setSearch]        = useState("");

  const handleStart = (_cat: string) => {
    setShowCalc(true);
  };

  const handleAddFromCalc = (item: LineItem) => {
    setSavedCalcs(prev => [{
      id: uid(),
      name:     item.note || item.name,
      category: item.category || "stela",
      price:    item.price,
      date:     new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
    }, ...prev]);
    setShowCalc(false);
  };

  const filteredSaved = savedCalcs.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto bg-[#fafafa]">

      {/* Калькулятор (overlay) */}
      {showCalc && (
        <StoneCalculator
          onClose={() => setShowCalc(false)}
          onAdd={handleAddFromCalc}
        />
      )}

      {/* Модалка выбора типа */}
      {showNewModal && (
        <NewCalcModal
          onClose={() => setShowNewModal(false)}
          onStart={handleStart}
        />
      )}

      <div className="max-w-[960px] mx-auto px-7 py-6 space-y-6">

        {/* Шапка */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold text-[#1a1a1a] tracking-tight">Калькулятор</h1>
            <p className="text-[13px] text-[#9b9b9b] mt-0.5">Расчёт стоимости изделий</p>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[13px] font-semibold px-4 py-2.5 rounded-[10px] hover:bg-[#333] transition-colors"
          >
            <Icon name="Plus" size={14} />
            Новый расчёт
          </button>
        </div>

        {/* Категории — быстрый запуск */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-3">Категории</p>
          <div className="grid grid-cols-4 gap-2.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setShowCalc(true)}
                className="flex items-center gap-3 px-4 py-3 bg-white border border-[#ebebeb] rounded-xl hover:border-[#c5c5c5] hover:shadow-sm transition-all text-left group"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors group-hover:opacity-90"
                  style={{ backgroundColor: cat.bg }}
                >
                  <Icon name={cat.icon as never} size={15} style={{ color: cat.color }} />
                </div>
                <span className="text-[12px] font-medium text-[#1a1a1a] leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Сохранённые расчёты */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#b5b5b5]">Сохранённые расчёты</p>
            <div className="relative">
              <Icon name="Search" size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5b5]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск..."
                className="bg-white border border-[#ebebeb] rounded-[8px] pl-8 pr-3 py-1.5 text-[12px] placeholder:text-[#c5c5c5] outline-none focus:border-[#c0c0c0] transition-colors w-[200px]"
              />
            </div>
          </div>

          {filteredSaved.length === 0 ? (
            <div className="bg-white border border-[#ebebeb] rounded-xl px-5 py-10 text-center">
              <div className="w-10 h-10 rounded-2xl bg-[#f4f4f4] flex items-center justify-center mx-auto mb-2">
                <Icon name="Calculator" size={18} className="text-[#c0c0c0]" />
              </div>
              <p className="text-[13px] text-[#b5b5b5]">Расчётов пока нет</p>
            </div>
          ) : (
            <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
              {filteredSaved.map((c, i) => {
                const cat = CATEGORIES.find(k => k.id === c.category);
                const isLast = i === filteredSaved.length - 1;
                return (
                  <div
                    key={c.id}
                    onClick={() => setShowCalc(true)}
                    className={`flex items-center gap-4 px-5 py-3.5 hover:bg-[#fafafa] cursor-pointer transition-colors ${!isLast ? "border-b border-[#f5f5f5]" : ""}`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat?.bg ?? "#f4f4f4" }}
                    >
                      <Icon name={(cat?.icon ?? "Calculator") as never} size={14} style={{ color: cat?.color ?? "#9b9b9b" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1a1a1a] truncate">{c.name}</p>
                      <p className="text-[11px] text-[#9b9b9b]">{cat?.label ?? c.category} · {c.date}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[14px] font-bold text-[#1a1a1a]">{c.price.toLocaleString("ru")} ₽</p>
                    </div>
                    <Icon name="ChevronRight" size={13} className="text-[#c0c0c0] shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
