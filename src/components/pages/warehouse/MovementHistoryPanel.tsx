import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import Icon from "@/components/ui/icon";
import { RawMaterial, Blank, Movement, MOVE_TYPE } from "./warehouse.types";

type Props = {
  movements: Movement[];
  rawMat: RawMaterial[];
  blanks: Blank[];
  onClose: () => void;
};

const DATE_PRESETS = [
  { key: "all",   label: "Всё время" },
  { key: "today", label: "Сегодня" },
  { key: "7d",    label: "7 дней" },
  { key: "30d",   label: "30 дней" },
];

function isoToday(): string {
  return new Date().toISOString().substring(0, 10);
}
function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().substring(0, 10);
}

export default function MovementHistoryPanel({ movements, rawMat, blanks, onClose }: Props) {
  const [filterType, setFilterType] = useState<string>("all");
  const [datePreset, setDatePreset] = useState<string>("all");
  const [dateFrom,   setDateFrom]   = useState<string>("");
  const [dateTo,     setDateTo]     = useState<string>("");
  const [search,     setSearch]     = useState<string>("");

  const nameOf = (m: Movement): string => {
    if (m.materialId) return rawMat.find(r => r.id === m.materialId)?.name ?? "Сырьё";
    if (m.blankId)    return blanks.find(b => b.id === m.blankId)?.name ?? "Заготовка";
    return m.note?.split(":")[1]?.split("·")[0]?.trim() || "—";
  };

  /* Диапазон дат от пресета */
  const range = useMemo(() => {
    if (dateFrom || dateTo) return { from: dateFrom || "0000", to: dateTo || "9999" };
    if (datePreset === "today") return { from: isoToday(), to: "9999" };
    if (datePreset === "7d")    return { from: isoDaysAgo(7), to: "9999" };
    if (datePreset === "30d")   return { from: isoDaysAgo(30), to: "9999" };
    return null;
  }, [datePreset, dateFrom, dateTo]);

  const filtered = useMemo(() => movements.filter(m => {
    if (filterType !== "all" && m.type !== filterType) return false;
    if (range && m.isoDate) {
      if (m.isoDate < range.from || m.isoDate > range.to) return false;
    }
    if (search) {
      const hay = `${nameOf(m)} ${m.note} ${m.receiptId ?? ""} ${m.order ?? ""}`.toLowerCase();
      if (!hay.includes(search.toLowerCase())) return false;
    }
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [movements, filterType, range, search, rawMat, blanks]);

  /* Аналитика */
  const stats = useMemo(() => {
    const inCount  = filtered.filter(m => m.type === "in").length;
    const cutCount = filtered.filter(m => m.type === "cut").length;
    const useCount = filtered.filter(m => m.type === "use").length;
    const inSum    = filtered.filter(m => m.type === "in").reduce((a, m) => a + (m.totalSum ?? 0), 0);
    const inQty    = filtered.filter(m => m.type === "in").reduce((a, m) => a + m.qty, 0);
    const outQty   = filtered.filter(m => m.type !== "in").reduce((a, m) => a + m.qty, 0);
    return { inCount, cutCount, useCount, inSum, inQty, outQty, total: filtered.length };
  }, [filtered]);

  const hasFilters = filterType !== "all" || datePreset !== "all" || dateFrom || dateTo || search;
  const resetAll = () => { setFilterType("all"); setDatePreset("all"); setDateFrom(""); setDateTo(""); setSearch(""); };

  /* Блокируем прокрутку страницы под панелью */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-200">

      {/* Шапка */}
      <div className="shrink-0 border-b border-[#ebebeb] px-7 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#f0f0f0] flex items-center justify-center">
            <Icon name="History" size={17} className="text-[#4b4b4b]" />
          </div>
          <div>
            <h2 className="text-[17px] font-semibold text-[#1a1a1a]">История движений</h2>
            <p className="text-[12px] text-[#9b9b9b]">Все операции прихода, нарезки и списания</p>
          </div>
        </div>
        <button onClick={onClose} className="flex items-center gap-1.5 text-[13px] text-[#6b6b6b] hover:text-[#1a1a1a] border border-[#ebebeb] rounded-[8px] px-3 py-2 hover:bg-[#f5f5f5] transition-colors">
          <Icon name="X" size={15} />Закрыть
        </button>
      </div>

      {/* Аналитика */}
      <div className="shrink-0 px-7 py-4 grid grid-cols-5 gap-3 border-b border-[#f5f5f5]">
        {[
          { label: "Всего операций", value: String(stats.total),                        icon: "Activity",        color: "#6b6b6b" },
          { label: "Приходов",       value: String(stats.inCount),                       icon: "ArrowDownToLine", color: "#16a34a" },
          { label: "Нарезок",        value: String(stats.cutCount),                      icon: "Scissors",        color: "#6366f1" },
          { label: "Списаний",       value: String(stats.useCount),                      icon: "ArrowUpFromLine", color: "#ef4444" },
          { label: "Сумма закупок",  value: `${(stats.inSum / 1000).toFixed(1)} тыс. ₽`, icon: "Banknote",        color: "#0ea5e9" },
        ].map(s => (
          <div key={s.label} className="bg-[#f8f8f8] rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + "18" }}>
              <Icon name={s.icon as never} size={15} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[16px] font-semibold text-[#1a1a1a] leading-none mb-0.5">{s.value}</p>
              <p className="text-[11px] text-[#9b9b9b]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Фильтры */}
      <div className="shrink-0 px-7 py-3 flex flex-wrap items-center gap-2 border-b border-[#f5f5f5]">
        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5b5]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по названию, заказу, комментарию..."
            className="bg-white border border-[#e8e8e8] rounded-[8px] pl-9 pr-3 py-2 text-[13px] outline-none focus:border-[#c0c0c0] placeholder:text-[#c5c5c5] w-[300px]"
          />
        </div>

        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-white border border-[#e8e8e8] rounded-[8px] px-3 py-2 text-[13px] text-[#4b4b4b] outline-none">
          <option value="all">Все операции</option>
          <option value="in">Приход</option>
          <option value="cut">Нарезка</option>
          <option value="use">Списание</option>
          <option value="adjust">Корректировка</option>
        </select>

        <div className="flex gap-0.5 bg-[#f0f0f0] rounded-[8px] p-0.5">
          {DATE_PRESETS.map(p => (
            <button key={p.key}
              onClick={() => { setDatePreset(p.key); setDateFrom(""); setDateTo(""); }}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
                ${datePreset === p.key && !dateFrom && !dateTo ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[12px] text-[#9b9b9b]">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="bg-white border border-[#e8e8e8] rounded-[8px] px-2 py-1.5 text-[12px] outline-none focus:border-[#c0c0c0]" />
          <span>—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="bg-white border border-[#e8e8e8] rounded-[8px] px-2 py-1.5 text-[12px] outline-none focus:border-[#c0c0c0]" />
        </div>

        {hasFilters && (
          <button onClick={resetAll} className="flex items-center gap-1 text-[12px] text-[#9b9b9b] hover:text-[#4b4b4b] ml-1">
            <Icon name="X" size={12} />Сбросить
          </button>
        )}
      </div>

      {/* Таблица */}
      <div className="flex-1 overflow-y-auto px-7 py-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#f4f4f4] flex items-center justify-center mb-3">
              <Icon name="SearchX" size={20} className="text-[#c0c0c0]" />
            </div>
            <p className="text-[14px] text-[#9b9b9b]">Ничего не найдено</p>
            <p className="text-[12px] text-[#c5c5c5] mt-0.5">Измените фильтры или период</p>
          </div>
        ) : (
          <div className="border border-[#ebebeb] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-[#f0f0f0]">
                  {["Дата", "Операция", "Позиция", "ID / Заказ", "Кол-во", "Цена", "Сумма", "Остаток", "Комментарий"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => {
                  const mt = MOVE_TYPE[m.type];
                  return (
                    <tr key={m.id} className={i < filtered.length - 1 ? "border-b border-[#f8f8f8]" : ""} style={{ backgroundColor: mt.rowBg }}>
                      <td className="px-4 py-2.5 text-[12px] text-[#6b6b6b] whitespace-nowrap">{m.date}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <Icon name={mt.icon as never} size={12} style={{ color: mt.color }} />
                          <span className="text-[12px] font-semibold" style={{ color: mt.color }}>{mt.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-[#1a1a1a] max-w-[160px]">
                        <span className="truncate block">{nameOf(m)}</span>
                      </td>
                      <td className="px-4 py-2.5 text-[11px] font-mono text-[#6b6b6b]">{m.receiptId ?? m.order ?? "—"}</td>
                      <td className="px-4 py-2.5 text-[12px] font-semibold whitespace-nowrap" style={{ color: m.type === "in" ? "#16a34a" : "#ef4444" }}>
                        {m.type === "in" ? "+" : "−"}{m.qty}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-[#6b6b6b]">{m.pricePerUnit ? `${m.pricePerUnit.toLocaleString("ru")} ₽` : "—"}</td>
                      <td className="px-4 py-2.5 text-[12px] text-[#6b6b6b]">{m.totalSum ? `${m.totalSum.toLocaleString("ru")} ₽` : "—"}</td>
                      <td className="px-4 py-2.5 text-[12px] text-[#9b9b9b]">{m.remainAfter !== undefined ? m.remainAfter : "—"}</td>
                      <td className="px-4 py-2.5 text-[12px] text-[#6b6b6b] max-w-[200px]">
                        <span className="truncate block">{m.note}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}