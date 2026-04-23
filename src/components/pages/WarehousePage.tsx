import { useState } from "react";
import Icon from "@/components/ui/icon";

type Category = "stone" | "consumable" | "hardware";
type FilterKey = "all" | Category;

type Item = {
  name: string;
  unit: string;
  qty: number;
  reserved: number;
  min: number;
  price: number;
  category: Category;
};

type Movement = {
  date: string;
  type: "in" | "out";
  qty: number;
  unit: string;
  reason: string;
  order?: string;
  user: string;
};

const ITEMS: Item[] = [
  { name: "Гранит чёрный (габбро)",     unit: "м²", qty: 14.5, reserved: 8,  min: 5,  price: 4200, category: "stone" },
  { name: "Гранит серый",               unit: "м²", qty: 7.2,  reserved: 4,  min: 5,  price: 3800, category: "stone" },
  { name: "Гранит красный (карелия)",   unit: "м²", qty: 3.1,  reserved: 3,  min: 5,  price: 5100, category: "stone" },
  { name: "Мрамор белый",               unit: "м²", qty: 2.4,  reserved: 2,  min: 4,  price: 6500, category: "stone" },
  { name: "Мрамор серый",               unit: "м²", qty: 5.8,  reserved: 1,  min: 3,  price: 5800, category: "stone" },
  { name: "Гранит габбро (полированный)",unit: "м²", qty: 9.0, reserved: 5,  min: 4,  price: 4700, category: "stone" },
  { name: "Бронза (для букв)",          unit: "кг", qty: 12.0, reserved: 3,  min: 10, price: 1800, category: "hardware" },
  { name: "Абразивный диск 230мм",      unit: "шт", qty: 45,   reserved: 0,  min: 20, price: 320,  category: "consumable" },
  { name: "Алмазная фреза 6мм",         unit: "шт", qty: 8,    reserved: 0,  min: 10, price: 850,  category: "consumable" },
  { name: "Полировальная паста",        unit: "кг", qty: 3.5,  reserved: 0,  min: 5,  price: 1200, category: "consumable" },
  { name: "Крепёжный анкер М12",        unit: "шт", qty: 120,  reserved: 20, min: 50, price: 45,   category: "hardware" },
  { name: "Цемент М400",                unit: "кг", qty: 85,   reserved: 30, min: 100,price: 18,   category: "consumable" },
];

const HISTORY: Record<string, Movement[]> = {
  "Гранит чёрный (габбро)": [
    { date: "20 апр.", type: "out", qty: 0.42, unit: "м²", reason: "Списание на заказ", order: "МП-0041", user: "Игорь В." },
    { date: "15 апр.", type: "in",  qty: 5.0,  unit: "м²", reason: "Приход от поставщика", user: "Олег К." },
    { date: "10 апр.", type: "out", qty: 1.1,  unit: "м²", reason: "Списание на заказ", order: "МП-0036", user: "Игорь В." },
  ],
  "Гранит красный (карелия)": [
    { date: "18 апр.", type: "out", qty: 0.9,  unit: "м²", reason: "Списание на заказ", order: "МП-0038", user: "Олег К." },
    { date: "01 апр.", type: "in",  qty: 2.0,  unit: "м²", reason: "Приход от поставщика", user: "Анна М." },
  ],
};

const CATEGORY_LABELS: Record<FilterKey, string> = {
  all:        "Все",
  stone:      "Камень",
  consumable: "Расходники",
  hardware:   "Фурнитура",
};

const FILTERS: FilterKey[] = ["all", "stone", "consumable", "hardware"];

function getStatus(item: Item): "critical" | "low" | "ok" {
  const free = item.qty - item.reserved;
  if (free <= 0 || free < item.min * 0.5) return "critical";
  if (free <= item.min) return "low";
  return "ok";
}

const STATUS_STYLE = {
  critical: { bar: "#ef4444", row: "bg-red-50",     badge: "bg-red-100 text-red-600",    text: "text-red-600" },
  low:      { bar: "#f59e0b", row: "bg-amber-50/60", badge: "bg-amber-100 text-amber-600", text: "text-amber-600" },
  ok:       { bar: "#22c55e", row: "",               badge: "",                             text: "text-[#1a1a1a]" },
};

export default function WarehousePage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [historyItem, setHistoryItem] = useState<string | null>(null);

  const filtered = ITEMS.filter((item) => {
    const matchCat = filter === "all" || item.category === filter;
    const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const critical = ITEMS.filter((i) => getStatus(i) !== "ok");
  const totalValue = ITEMS.reduce((s, i) => s + i.qty * i.price, 0);
  const criticalCount = ITEMS.filter((i) => getStatus(i) === "critical").length;

  const historyData = historyItem ? (HISTORY[historyItem] ?? []) : [];

  return (
    <div className="p-7 max-w-[1100px] mx-auto w-full space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[21px] font-semibold text-[#1a1a1a] tracking-tight">Склад</h1>
          <p className="text-[13px] text-[#9b9b9b] mt-0.5">{ITEMS.length} позиций</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[13px] px-4 py-2 rounded-[8px] hover:bg-[#333] transition-colors">
          <Icon name="Plus" size={14} />
          Приход
        </button>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon="Layers" color="#6b6b6b"
          label="Позиций на складе" value={String(ITEMS.length)} sub={`${filtered.length} в текущем фильтре`} />
        <StatCard icon="Banknote" color="#6366f1"
          label="Стоимость склада" value={`${(totalValue / 1000).toFixed(0)} тыс. ₽`} sub="по текущим ценам" />
        <StatCard icon="AlertTriangle" color="#ef4444"
          label="Критичных позиций" value={String(criticalCount)} sub="требуют пополнения" alert={criticalCount > 0} />
      </div>

      {/* Critical block */}
      {critical.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="AlertOctagon" size={14} className="text-red-500" />
            <span className="text-[13px] font-semibold text-red-700">Требуют пополнения</span>
            <span className="text-[11px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold ml-1">{critical.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {critical.map((item) => {
              const free = item.qty - item.reserved;
              const st = getStatus(item);
              return (
                <div key={item.name}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[12px]
                    ${st === "critical" ? "bg-white border-red-200" : "bg-white border-amber-200"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st === "critical" ? "bg-red-400" : "bg-amber-400"}`} />
                  <span className="font-medium text-[#1a1a1a]">{item.name}</span>
                  <span className={`font-mono font-bold ${st === "critical" ? "text-red-500" : "text-amber-600"}`}>
                    {free.toFixed(1)} {item.unit}
                  </span>
                  <span className="text-[#b5b5b5]">/ мин. {item.min}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters + Search */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1 bg-white border border-[#ebebeb] rounded-[8px] p-1">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
                ${filter === f ? "bg-[#1a1a1a] text-white shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}>
              {CATEGORY_LABELS[f]}
            </button>
          ))}
        </div>
        <div className="relative max-w-[260px] flex-1">
          <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5b5]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск материала..."
            className="w-full bg-white border border-[#ebebeb] rounded-[8px] pl-8 pr-3 py-2 text-[13px] placeholder:text-[#c5c5c5] outline-none focus:border-[#c0c0c0] transition-colors" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f0f0f0]">
              {["Материал", "Ед.", "На складе", "В резерве", "Свободно", "Мин. остаток", "Цена/ед.", "Стоимость", "Действия"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-[13px] text-[#b5b5b5]">Ничего не найдено</td></tr>
            )}
            {filtered.map((item, i) => {
              const free = item.qty - item.reserved;
              const st = getStatus(item);
              const sty = STATUS_STYLE[st];
              const fillPct = Math.min(100, (free / (item.min * 2)) * 100);
              const isLast = i === filtered.length - 1;

              return (
                <tr key={item.name}
                  className={`transition-colors hover:brightness-[0.98] ${sty.row} ${!isLast ? "border-b border-[#f5f5f5]" : ""}`}>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: sty.bar }} />
                      <div>
                        <p className="text-[13px] font-medium text-[#1a1a1a] leading-snug">{item.name}</p>
                        <span className={`text-[10px] font-semibold px-1.5 py-px rounded-md
                          ${item.category === "stone" ? "bg-slate-100 text-slate-500"
                          : item.category === "consumable" ? "bg-orange-50 text-orange-500"
                          : "bg-blue-50 text-blue-500"}`}>
                          {CATEGORY_LABELS[item.category]}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-[12px] text-[#9b9b9b]">{item.unit}</td>

                  <td className="px-4 py-3.5 text-[13px] font-mono font-semibold text-[#1a1a1a]">{item.qty}</td>

                  <td className="px-4 py-3.5">
                    <span className="text-[13px] font-mono text-[#f59e0b] font-medium">{item.reserved}</span>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${fillPct}%`, backgroundColor: sty.bar }} />
                      </div>
                      <span className={`text-[13px] font-mono font-semibold ${sty.text}`}>
                        {free % 1 === 0 ? free : free.toFixed(1)}
                      </span>
                      {st !== "ok" && (
                        <span className={`text-[10px] font-bold px-1.5 py-px rounded-md ${sty.badge}`}>
                          {st === "critical" ? "критично" : "мало"}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-[12px] font-mono text-[#9b9b9b]">{item.min}</td>

                  <td className="px-4 py-3.5 text-[12px] text-[#6b6b6b]">{item.price.toLocaleString("ru")} ₽</td>

                  <td className="px-4 py-3.5 text-[12px] font-semibold text-[#1a1a1a]">
                    {(item.qty * item.price).toLocaleString("ru")} ₽
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <ActionBtn icon="ArrowDown" title="Приход" color="text-[#22c55e]" />
                      <ActionBtn icon="ArrowUp" title="Списание" color="text-[#f59e0b]" />
                      <ActionBtn icon="Clock" title="История"
                        color="text-[#6b6b6b]"
                        onClick={() => setHistoryItem(historyItem === item.name ? null : item.name)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* History panel */}
      {historyItem && (
        <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden animate-fade-in">
          <div className="px-5 py-4 border-b border-[#f0f0f0] flex items-center justify-between">
            <div>
              <h3 className="text-[14px] font-semibold text-[#1a1a1a]">История движений</h3>
              <p className="text-[12px] text-[#9b9b9b] mt-0.5">{historyItem}</p>
            </div>
            <button onClick={() => setHistoryItem(null)} className="text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors">
              <Icon name="X" size={15} />
            </button>
          </div>

          {historyData.length === 0 ? (
            <div className="px-5 py-8 text-center text-[13px] text-[#b5b5b5]">История движений пуста</div>
          ) : (
            <div className="divide-y divide-[#f5f5f5]">
              {historyData.map((m, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#fafafa] transition-colors">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0
                    ${m.type === "in" ? "bg-green-50" : "bg-amber-50"}`}>
                    <Icon name={m.type === "in" ? "ArrowDown" : "ArrowUp"} size={13}
                      className={m.type === "in" ? "text-green-500" : "text-amber-500"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[#1a1a1a]">{m.reason}</span>
                      {m.order && (
                        <span className="text-[11px] font-mono bg-[#f5f5f5] text-[#6b6b6b] px-1.5 py-0.5 rounded-md">{m.order}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#b5b5b5] mt-0.5">{m.user} · {m.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[14px] font-bold font-mono ${m.type === "in" ? "text-green-600" : "text-amber-600"}`}>
                      {m.type === "in" ? "+" : "−"}{m.qty} {m.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, color, label, value, sub, alert }: {
  icon: string; color: string; label: string; value: string; sub: string; alert?: boolean;
}) {
  return (
    <div className={`bg-white border rounded-xl px-5 py-4 flex items-center gap-4
      ${alert ? "border-red-200" : "border-[#ebebeb]"}`}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + "18" }}>
        <Icon name={icon as never} size={16} style={{ color }} />
      </div>
      <div>
        <p className="text-[22px] font-bold text-[#1a1a1a] leading-none mb-1">{value}</p>
        <p className="text-[12px] font-medium text-[#6b6b6b]">{label}</p>
        <p className="text-[11px] text-[#b5b5b5]">{sub}</p>
      </div>
    </div>
  );
}

function ActionBtn({ icon, title, color, onClick }: {
  icon: string; title: string; color: string; onClick?: () => void;
}) {
  return (
    <button title={title} onClick={onClick}
      className={`w-7 h-7 flex items-center justify-center rounded-[6px] bg-white border border-[#e8e8e8]
        hover:border-[#c5c5c5] hover:bg-[#fafafa] transition-all ${color}`}>
      <Icon name={icon as never} size={12} />
    </button>
  );
}
