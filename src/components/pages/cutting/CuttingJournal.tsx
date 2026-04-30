import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import {
  Shift, PLACES, EMPLOYEES, BLANK_TYPES,
  shiftTotalProduced, shiftTotalRaw, today, yesterday,
} from "./cutting.types";

type Props = { doneShifts: Shift[] };

type QuickPeriod = "today" | "yesterday" | "week" | "month" | "year" | "custom";

/* ── Парсинг даты из строки "DD.MM.YYYY" ── */
function parseDate(d: string): Date | null {
  const parts = d.split(".");
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts.map(Number);
  return new Date(yyyy, mm - 1, dd);
}

function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

/* ── Границы "быстрого" периода ── */
function quickBounds(p: QuickPeriod): { from: string; to: string } | null {
  if (p === "custom") return null;
  const now  = new Date();
  const fmt  = (d: Date) => d.toLocaleDateString("ru-RU").replace(/\//g, ".");
  if (p === "today")     return { from: fmt(now), to: fmt(now) };
  if (p === "yesterday") {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    return { from: fmt(y), to: fmt(y) };
  }
  if (p === "week") {
    const w = new Date(now); w.setDate(w.getDate() - 6);
    return { from: fmt(w), to: fmt(now) };
  }
  if (p === "month") {
    const m = new Date(now); m.setDate(m.getDate() - 29);
    return { from: fmt(m), to: fmt(now) };
  }
  if (p === "year") {
    const yr = new Date(now); yr.setFullYear(yr.getFullYear() - 1);
    return { from: fmt(yr), to: fmt(now) };
  }
  return null;
}

export default function CuttingJournal({ doneShifts }: Props) {
  const [filterEmp,   setFilterEmp]   = useState("all");
  const [filterPlace, setFilterPlace] = useState("all");
  const [quick,       setQuick]       = useState<QuickPeriod>("month");
  const [customFrom,  setCustomFrom]  = useState("");
  const [customTo,    setCustomTo]    = useState("");

  /* Диапазон дат */
  const bounds = quick !== "custom" ? quickBounds(quick) : {
    from: customFrom ? isoToDisplay(customFrom) : "",
    to:   customTo   ? isoToDisplay(customTo)   : "",
  };

  const filtered = useMemo(() => doneShifts.filter(s => {
    if (filterEmp   !== "all" && s.employeeId !== filterEmp)  return false;
    if (filterPlace !== "all" && s.placeId    !== filterPlace) return false;
    if (bounds?.from || bounds?.to) {
      const sd = parseDate(s.date);
      if (!sd) return false;
      if (bounds.from) { const fd = parseDate(bounds.from); if (fd && sd < fd) return false; }
      if (bounds.to)   { const td = parseDate(bounds.to);   if (td && sd > td) return false; }
    }
    return true;
  }), [doneShifts, filterEmp, filterPlace, bounds]);

  /* Группировка по датам */
  const dates = useMemo(() => {
    const all = [...new Set(filtered.map(s => s.date))].sort((a, b) => {
      const parse = (d: string) => d.split(".").reverse().join("-");
      return parse(b).localeCompare(parse(a));
    });
    return all;
  }, [filtered]);

  /* Итоги за период */
  const totalP = filtered.reduce((a, s) => a + shiftTotalProduced(s), 0);
  const totalR = +filtered.reduce((a, s) => a + shiftTotalRaw(s), 0).toFixed(2);

  /* Разбивка по изделиям за период */
  const byBlank: Record<string, number> = {};
  const byStone: Record<string, number> = {};
  filtered.forEach(s => s.results.forEach(r => {
    const bt = BLANK_TYPES.find(b => b.id === r.blankTypeId);
    if (!bt) return;
    byBlank[bt.name]     = (byBlank[bt.name]     ?? 0) + r.produced;
    byStone[bt.material] = (byStone[bt.material]  ?? 0) + r.rawUsed;
  }));

  const QUICK_BTNS: { key: QuickPeriod; label: string }[] = [
    { key: "today",     label: "Сегодня"  },
    { key: "yesterday", label: "Вчера"    },
    { key: "week",      label: "Неделя"   },
    { key: "month",     label: "Месяц"    },
    { key: "year",      label: "Год"      },
    { key: "custom",    label: "Период"   },
  ];

  return (
    <div className="space-y-4">

      {/* ── Строка 1: быстрые кнопки периода ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1 bg-[#f0f0f0] rounded-[8px] p-0.5">
          {QUICK_BTNS.map(b => (
            <button
              key={b.key}
              onClick={() => setQuick(b.key)}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
                ${quick === b.key ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Свой период — поля дат */}
        {quick === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
              className="bg-white border border-[#e0e0e0] rounded-[8px] px-3 py-1.5 text-[12px] outline-none focus:border-[#b0b0b0]"
            />
            <span className="text-[#c0c0c0] text-[12px]">—</span>
            <input
              type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
              className="bg-white border border-[#e0e0e0] rounded-[8px] px-3 py-1.5 text-[12px] outline-none focus:border-[#b0b0b0]"
            />
          </div>
        )}
      </div>

      {/* ── Строка 2: фильтры сотрудника и станка ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={filterEmp} onChange={e => setFilterEmp(e.target.value)}
          className="bg-white border border-[#e0e0e0] rounded-[8px] px-3 py-2 text-[12px] text-[#4b4b4b] outline-none focus:border-[#b0b0b0]"
        >
          <option value="all">Все сотрудники</option>
          {EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>

        <select
          value={filterPlace} onChange={e => setFilterPlace(e.target.value)}
          className="bg-white border border-[#e0e0e0] rounded-[8px] px-3 py-2 text-[12px] text-[#4b4b4b] outline-none focus:border-[#b0b0b0]"
        >
          <option value="all">Все станки</option>
          {PLACES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>

        {(filterEmp !== "all" || filterPlace !== "all") && (
          <button
            onClick={() => { setFilterEmp("all"); setFilterPlace("all"); }}
            className="flex items-center gap-1 text-[12px] text-[#9b9b9b] hover:text-[#4b4b4b] transition-colors"
          >
            <Icon name="X" size={12} />Сбросить
          </button>
        )}
      </div>

      {/* ── Пусто ── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-10 h-10 rounded-2xl bg-[#f4f4f4] flex items-center justify-center mb-2">
            <Icon name="FileSearch" size={18} className="text-[#c0c0c0]" />
          </div>
          <p className="text-[13px] text-[#b0b0b0]">Нет смен по выбранному фильтру</p>
        </div>
      )}

      {filtered.length > 0 && (
        <>
          {/* ── Итог + разбивка ── */}
          <div className="grid grid-cols-3 gap-3">
            {/* Общий итог */}
            <div className="bg-[#f4f4f4] rounded-xl px-4 py-3 flex items-center gap-3">
              <div>
                <p className="text-[11px] text-[#9b9b9b] mb-0.5">За период</p>
                <p className="text-[13px] text-[#6b6b6b]">
                  <b className="text-[18px] text-[#1a1a1a]">{filtered.length}</b> смен ·{" "}
                  <b className="text-[#1a1a1a]">{totalP} шт.</b> ·{" "}
                  <b className="text-[#6366f1]">{totalR} м²</b>
                </p>
              </div>
            </div>

            {/* Изделия */}
            <div className="bg-[#f4f4f4] rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-1.5">По изделиям</p>
              <div className="space-y-0.5">
                {Object.entries(byBlank).map(([name, cnt]) => (
                  <div key={name} className="flex justify-between text-[11px]">
                    <span className="text-[#4b4b4b]">{name}</span>
                    <span className="font-bold text-[#1a1a1a]">{cnt} шт.</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Камень */}
            <div className="bg-[#f4f4f4] rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-1.5">По камню</p>
              <div className="space-y-0.5">
                {Object.entries(byStone).map(([mat, m2]) => (
                  <div key={mat} className="flex justify-between text-[11px]">
                    <span className="text-[#4b4b4b]">{mat}</span>
                    <span className="font-semibold text-[#6366f1]">{m2.toFixed(2)} м²</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Таблица ── */}
          <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
            {dates.map((date, di) => {
              const dayShifts = filtered.filter(s => s.date === date);
              const dayP = dayShifts.reduce((a, s) => a + shiftTotalProduced(s), 0);
              const dayR = +dayShifts.reduce((a, s) => a + shiftTotalRaw(s), 0).toFixed(2);
              const isToday     = date === today;
              const isYesterday = date === yesterday;
              const dateLabel   = isToday ? `Сегодня, ${date}` : isYesterday ? `Вчера, ${date}` : date;

              return (
                <div key={date} className={di > 0 ? "border-t border-[#f0f0f0]" : ""}>
                  {/* Заголовок дня */}
                  <div className="px-5 py-2 bg-[#f8f8f8] flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-[#4b4b4b]">{dateLabel}</span>
                    <span className="text-[11px] text-[#9b9b9b]">
                      {dayShifts.length} смен ·{" "}
                      <b className="text-[#1a1a1a]">{dayP} шт.</b>{" · "}
                      <b className="text-[#6366f1]">{dayR} м²</b>
                    </span>
                  </div>

                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#f5f5f5]">
                        {["Станок", "Сотрудник", "Изделие", "Камень", "Размер", "Кол-во", "Сырьё"].map(h => (
                          <th key={h} className="px-4 py-2 text-left text-[10px] font-semibold text-[#c0c0c0] uppercase tracking-wide whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dayShifts.map(s => {
                        const place    = PLACES.find(p => p.id === s.placeId)!;
                        const employee = EMPLOYEES.find(e => e.id === s.employeeId)!;
                        return s.results.map((r, ri) => {
                          const bt = BLANK_TYPES.find(b => b.id === r.blankTypeId)!;
                          return (
                            <tr key={`${s.id}-${ri}`} className="border-b border-[#f8f8f8] last:border-0 hover:bg-[#fafafa] transition-colors">
                              <td className="px-4 py-2 text-[12px] text-[#6b6b6b]">{place.name}</td>
                              <td className="px-4 py-2 text-[12px] text-[#4b4b4b]">{employee.name}</td>
                              <td className="px-4 py-2 text-[12px] text-[#1a1a1a] font-medium">{bt.name}</td>
                              <td className="px-4 py-2">
                                <span className="text-[11px] bg-[#f5f5f5] text-[#6b6b6b] px-2 py-0.5 rounded-md">{bt.material}</span>
                              </td>
                              <td className="px-4 py-2 text-[11px] font-mono text-[#c0c0c0]">{bt.size}</td>
                              <td className="px-4 py-2">
                                <span className="text-[13px] font-bold text-[#1a1a1a]">{r.produced}</span>
                                <span className="text-[11px] text-[#9b9b9b] ml-1">шт.</span>
                              </td>
                              <td className="px-4 py-2 pr-5">
                                <span className="text-[12px] font-semibold text-[#6366f1]">{r.rawUsed}</span>
                                <span className="text-[11px] text-[#9b9b9b] ml-1">м²</span>
                              </td>
                            </tr>
                          );
                        });
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
