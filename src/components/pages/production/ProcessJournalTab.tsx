import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Shift, WORK_LABELS, shiftTotalProduced, shiftTotalRaw, today, yesterday } from "../cutting/cutting.types";
import { WORK_ICON, daysAgo } from "./process.utils";

type JournalFilter = {
  period: "today" | "yesterday" | "7d" | "30d" | "custom";
  from: string;
  to: string;
  employee: string;
  place: string;
  workType: string;
  search: string;
};

export default function JournalTab({ shifts }: { shifts: Shift[] }) {
  const [f, setF] = useState<JournalFilter>({
    period: "7d", from: "", to: "", employee: "", place: "", workType: "", search: "",
  });

  const employees = useMemo(() => [...new Set(shifts.map(s => s.employeeName).filter(Boolean))], [shifts]);
  const places    = useMemo(() => [...new Set(shifts.map(s => s.placeName).filter(Boolean))], [shifts]);

  const inRange = (iso: string): boolean => {
    if (f.period === "today")     return iso === today;
    if (f.period === "yesterday") return iso === yesterday;
    if (f.period === "7d")        return iso >= daysAgo(7);
    if (f.period === "30d")       return iso >= daysAgo(30);
    if (f.period === "custom") {
      if (f.from && iso < f.from) return false;
      if (f.to   && iso > f.to)   return false;
    }
    return true;
  };

  const filtered = useMemo(() => shifts.filter(s => {
    if (!inRange(s.date)) return false;
    if (f.employee && s.employeeName !== f.employee) return false;
    if (f.place    && s.placeName    !== f.place)    return false;
    if (f.workType && s.workType     !== f.workType) return false;
    if (f.search) {
      const q = f.search.toLowerCase();
      const orders = s.results.map(r => r.orderId ?? "").join(" ");
      return (
        (s.employeeName ?? "").toLowerCase().includes(q) ||
        (s.placeName    ?? "").toLowerCase().includes(q) ||
        orders.toLowerCase().includes(q) ||
        s.results.some(r => (r.blankName ?? "").toLowerCase().includes(q))
      );
    }
    return true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [shifts, f]);

  const sel = (k: keyof JournalFilter) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    setF(prev => ({ ...prev, [k]: e.target.value }));

  const inputCls = "bg-white border border-[#e8e8e8] rounded-[8px] px-3 py-1.5 text-[12px] text-[#4b4b4b] outline-none focus:border-[#c0c0c0] transition-colors";
  const PERIODS = [
    { key: "today",     label: "Сегодня" },
    { key: "yesterday", label: "Вчера" },
    { key: "7d",        label: "7 дней" },
    { key: "30d",       label: "30 дней" },
    { key: "custom",    label: "Диапазон" },
  ];

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Фильтры */}
      <div className="shrink-0 px-7 py-3 border-b border-[#f0f0f0] flex flex-wrap items-center gap-2 bg-white">
        {/* Период — переключатель */}
        <div className="flex gap-0.5 bg-[#f0f0f0] rounded-[8px] p-0.5">
          {PERIODS.map(p => (
            <button key={p.key}
              onClick={() => setF(prev => ({ ...prev, period: p.key as JournalFilter["period"] }))}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all ${
                f.period === p.key ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"
              }`}
            >{p.label}</button>
          ))}
        </div>

        {f.period === "custom" && (
          <>
            <input type="date" value={f.from} onChange={sel("from")} className={inputCls} />
            <span className="text-[12px] text-[#9b9b9b]">—</span>
            <input type="date" value={f.to}   onChange={sel("to")}   className={inputCls} />
          </>
        )}

        <div className="w-px h-5 bg-[#e8e8e8]" />

        <select value={f.employee} onChange={sel("employee")} className={inputCls}>
          <option value="">Все сотрудники</option>
          {employees.map(e => <option key={e} value={e}>{e}</option>)}
        </select>

        <select value={f.place} onChange={sel("place")} className={inputCls}>
          <option value="">Все станки</option>
          {places.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select value={f.workType} onChange={sel("workType")} className={inputCls}>
          <option value="">Все типы работ</option>
          {Object.entries(WORK_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        <div className="relative">
          <Icon name="Search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#b5b5b5]" />
          <input
            value={f.search} onChange={sel("search")}
            placeholder="Заказ, изделие, сотрудник..."
            className={`${inputCls} pl-8 min-w-[200px]`}
          />
        </div>

        {(f.employee || f.place || f.workType || f.search) && (
          <button
            onClick={() => setF(prev => ({ ...prev, employee: "", place: "", workType: "", search: "" }))}
            className="flex items-center gap-1 text-[12px] text-[#9b9b9b] hover:text-[#4b4b4b]"
          >
            <Icon name="X" size={12} />Сброс
          </button>
        )}

        <span className="ml-auto text-[12px] text-[#9b9b9b]">
          {filtered.length} {filtered.length === 1 ? "запись" : "записей"}
        </span>
      </div>

      {/* Таблица */}
      <div className="flex-1 overflow-y-auto px-7 py-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Icon name="SearchX" size={28} className="text-[#c0c0c0] mb-3" />
            <p className="text-[14px] text-[#9b9b9b]">Нет записей по выбранным фильтрам</p>
          </div>
        ) : (
          <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0f0f0] bg-[#fafafa]">
                  {["Дата", "Станок / Место", "Сотрудник", "Тип работы", "Изделия", "Заказы", "Произведено", "Сырьё", "Время", "Статус"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const totalP = shiftTotalProduced(s);
                  const totalR = shiftTotalRaw(s);
                  const orders = [...new Set(s.results.map(r => r.orderId).filter(Boolean))];
                  const blanks = [...new Set(s.results.map(r => r.blankName).filter(Boolean))];
                  return (
                    <tr key={s.id} className={`border-b border-[#f8f8f8] hover:bg-[#fafafa] transition-colors ${
                      s.status === "active" ? "bg-green-50/30" : ""
                    }`}>
                      <td className="px-4 py-2.5 text-[12px] text-[#6b6b6b] whitespace-nowrap">
                        {new Date(s.date + "T12:00:00").toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-[#1a1a1a] font-medium max-w-[140px]">
                        <span className="truncate block">{s.placeName ?? s.placeId}</span>
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-[#1a1a1a]">{s.employeeName ?? "—"}</td>
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-1.5 text-[12px] text-[#4b4b4b]">
                          <Icon name={WORK_ICON[s.workType] as never ?? "Hammer"} size={12} className="text-[#9b9b9b]" />
                          {WORK_LABELS[s.workType]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-[#4b4b4b] max-w-[140px]">
                        <span className="truncate block">{blanks.join(", ") || "—"}</span>
                      </td>
                      <td className="px-4 py-2.5 text-[12px] font-mono text-[#6b6b6b]">
                        {orders.length > 0 ? orders.join(", ") : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-[13px] font-bold text-[#1a1a1a] whitespace-nowrap">
                        {totalP > 0 ? `${totalP} шт.` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-[13px] font-bold text-[#f59e0b] whitespace-nowrap">
                        {totalR > 0 ? `${totalR} м²` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-[#6b6b6b] whitespace-nowrap">
                        {s.startedAt}{s.finishedAt ? `–${s.finishedAt}` : ""}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                          s.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-[#f0f0f0] text-[#6b6b6b]"
                        }`}>
                          {s.status === "active" ? "В работе" : "Завершена"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
