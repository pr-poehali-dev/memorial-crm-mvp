import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import {
  Shift,
  shiftTotalProduced, shiftTotalRaw, today, yesterday,
} from "./cutting.types";

type Props = { doneShifts: Shift[] };

type QuickPeriod = "today" | "yesterday" | "week" | "month" | "year" | "custom";

/* ── ISO "YYYY-MM-DD" → отображение "DD.MM.YYYY" ── */
function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

/* ── Границы "быстрого" периода (ISO строки) ── */
function quickBounds(p: QuickPeriod): { from: string; to: string } | null {
  if (p === "custom") return null;
  const now = new Date();
  const iso = (d: Date) => d.toISOString().substring(0, 10);
  if (p === "today")     return { from: iso(now), to: iso(now) };
  if (p === "yesterday") {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    return { from: iso(y), to: iso(y) };
  }
  if (p === "week") {
    const w = new Date(now); w.setDate(w.getDate() - 6);
    return { from: iso(w), to: iso(now) };
  }
  if (p === "month") {
    const m = new Date(now); m.setDate(m.getDate() - 29);
    return { from: iso(m), to: iso(now) };
  }
  if (p === "year") {
    const yr = new Date(now); yr.setFullYear(yr.getFullYear() - 1);
    return { from: iso(yr), to: iso(now) };
  }
  return null;
}

export default function CuttingJournal({ doneShifts }: Props) {
  const [filterEmp,   setFilterEmp]   = useState("all");
  const [filterPlace, setFilterPlace] = useState("all");
  const [quick,       setQuick]       = useState<QuickPeriod>("month");
  const [customFrom,  setCustomFrom]  = useState("");
  const [customTo,    setCustomTo]    = useState("");

  /* Уникальные сотрудники и места из реальных данных */
  const employees = useMemo(() => {
    const map = new Map<string, string>();
    doneShifts.forEach(s => map.set(s.employeeId, s.employeeName ?? s.employeeId));
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [doneShifts]);

  const places = useMemo(() => {
    const map = new Map<string, string>();
    doneShifts.forEach(s => map.set(s.placeId, s.placeName ?? s.placeId));
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [doneShifts]);

  /* Диапазон дат */
  const bounds = quick !== "custom"
    ? quickBounds(quick)
    : { from: customFrom || "", to: customTo || "" };

  const filtered = useMemo(() => doneShifts.filter(s => {
    if (filterEmp   !== "all" && s.employeeId !== filterEmp)  return false;
    if (filterPlace !== "all" && s.placeId    !== filterPlace) return false;
    if (bounds?.from || bounds?.to) {
      if (bounds.from && s.date < bounds.from) return false;
      if (bounds.to   && s.date > bounds.to)   return false;
    }
    return true;
  }), [doneShifts, filterEmp, filterPlace, bounds]);

  /* Группировка по датам (ISO, desc) */
  const dates = useMemo(() => (
    [...new Set(filtered.map(s => s.date))].sort((a, b) => b.localeCompare(a))
  ), [filtered]);

  /* Итоги за период */
  const totalP = filtered.reduce((a, s) => a + shiftTotalProduced(s), 0);
  const totalR = +filtered.reduce((a, s) => a + shiftTotalRaw(s), 0).toFixed(2);

  /* Разбивка по изделиям и камню */
  const byBlank: Record<string, number> = {};
  const byStone: Record<string, number> = {};
  filtered.forEach(s => s.results.forEach(r => {
    const name = r.blankName ?? r.blankTypeId;
    const mat  = r.material  ?? "—";
    byBlank[name] = (byBlank[name] ?? 0) + r.produced;
    byStone[mat]  = (byStone[mat]  ?? 0) + r.rawUsed;
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

      {/* ── Строка 2: фильтры ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={filterEmp} onChange={e => setFilterEmp(e.target.value)}
          className="bg-white border border-[#e0e0e0] rounded-[8px] px-3 py-2 text-[12px] text-[#4b4b4b] outline-none focus:border-[#b0b0b0]"
        >
          <option value="all">Все сотрудники</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>

        <select
          value={filterPlace} onChange={e => setFilterPlace(e.target.value)}
          className="bg-white border border-[#e0e0e0] rounded-[8px] px-3 py-2 text-[12px] text-[#4b4b4b] outline-none focus:border-[#b0b0b0]"
        >
          <option value="all">Все станки</option>
          {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
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
              const displayDate = isoToDisplay(date);
              const dateLabel   = isToday ? `Сегодня, ${displayDate}` : isYesterday ? `Вчера, ${displayDate}` : displayDate;

              return (
                <div key={date} className={di > 0 ? "border-t border-[#f0f0f0]" : ""}>
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
                        {["Станок", "Сотрудник", "Изделие", "Камень", "Кол-во", "Сырьё", "Заказ"].map(h => (
                          <th key={h} className="px-4 py-2 text-left text-[10px] font-semibold text-[#c0c0c0] uppercase tracking-wide whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dayShifts.map(s => {
                        const placeName    = s.placeName    ?? s.placeId;
                        const employeeName = s.employeeName ?? s.employeeId;

                        if (s.results.length === 0) {
                          return (
                            <tr key={s.id} className="border-b border-[#f8f8f8] last:border-0">
                              <td className="px-4 py-2 text-[12px] text-[#6b6b6b]">{placeName}</td>
                              <td className="px-4 py-2 text-[12px] text-[#4b4b4b]">{employeeName}</td>
                              <td colSpan={5} className="px-4 py-2 text-[12px] text-[#c0c0c0]">Результаты не указаны</td>
                            </tr>
                          );
                        }

                        return s.results.map((r, ri) => {
                          const blankName = r.blankName ?? r.blankTypeId;
                          const material  = r.material  ?? "—";
                          return (
                            <tr key={`${s.id}-${ri}`} className="border-b border-[#f8f8f8] last:border-0 hover:bg-[#fafafa] transition-colors">
                              <td className="px-4 py-2 text-[12px] text-[#6b6b6b]">
                                {ri === 0 ? placeName : ""}
                              </td>
                              <td className="px-4 py-2 text-[12px] text-[#4b4b4b]">
                                {ri === 0 ? employeeName : ""}
                              </td>
                              <td className="px-4 py-2 text-[12px] text-[#1a1a1a] font-medium">{blankName}</td>
                              <td className="px-4 py-2">
                                <span className="text-[11px] bg-[#f5f5f5] text-[#6b6b6b] px-2 py-0.5 rounded-md">{material}</span>
                              </td>
                              <td className="px-4 py-2">
                                <span className="text-[13px] font-bold text-[#1a1a1a]">{r.produced}</span>
                                <span className="text-[11px] text-[#9b9b9b] ml-1">шт.</span>
                              </td>
                              <td className="px-4 py-2">
                                <span className="text-[12px] font-semibold text-[#6366f1]">{Number(r.rawUsed).toFixed(2)}</span>
                                <span className="text-[11px] text-[#9b9b9b] ml-1">м²</span>
                              </td>
                              <td className="px-4 py-2 pr-5">
                                {r.orderId ? (
                                  <span className="text-[11px] font-mono text-[#9b9b9b]">{r.orderId}</span>
                                ) : (
                                  <span className="text-[11px] text-[#c5c5c5]">—</span>
                                )}
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
