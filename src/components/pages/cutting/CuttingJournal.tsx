import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import {
  Shift, PLACES, EMPLOYEES, BLANK_TYPES,
  shiftTotalProduced, shiftTotalRaw,
} from "./cutting.types";

type Props = { doneShifts: Shift[] };

type ViewMode = "table" | "list";

export default function CuttingJournal({ doneShifts }: Props) {
  const [viewMode,      setViewMode]      = useState<ViewMode>("table");
  const [filterDate,    setFilterDate]    = useState("");
  const [filterEmp,     setFilterEmp]     = useState("all");
  const [filterPlace,   setFilterPlace]   = useState("all");

  /* Применяем фильтры */
  const filtered = useMemo(() => doneShifts.filter(s => {
    if (filterEmp   !== "all" && s.employeeId !== filterEmp)   return false;
    if (filterPlace !== "all" && s.placeId    !== filterPlace)  return false;
    if (filterDate && !s.date.includes(filterDate))             return false;
    return true;
  }), [doneShifts, filterEmp, filterPlace, filterDate]);

  /* Группируем по датам (новые сверху) */
  const dates = useMemo(() => {
    const allDates = [...new Set(filtered.map(s => s.date))].sort((a, b) => {
      const parse = (d: string) => d.split(".").reverse().join("-");
      return parse(b).localeCompare(parse(a));
    });
    return allDates;
  }, [filtered]);

  /* Итоги за период */
  const totalP = filtered.reduce((a, s) => a + shiftTotalProduced(s), 0);
  const totalR = +filtered.reduce((a, s) => a + shiftTotalRaw(s), 0).toFixed(2);

  const hasFilters = filterEmp !== "all" || filterPlace !== "all" || filterDate !== "";

  return (
    <div className="space-y-4">

      {/* ── Фильтры + переключатель вида ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* По сотруднику */}
        <select
          value={filterEmp}
          onChange={e => setFilterEmp(e.target.value)}
          className="bg-white border border-[#e0e0e0] rounded-[8px] px-3 py-2 text-[13px] text-[#4b4b4b] outline-none focus:border-[#b0b0b0] transition-colors"
        >
          <option value="all">Все сотрудники</option>
          {EMPLOYEES.map(e => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>

        {/* По месту */}
        <select
          value={filterPlace}
          onChange={e => setFilterPlace(e.target.value)}
          className="bg-white border border-[#e0e0e0] rounded-[8px] px-3 py-2 text-[13px] text-[#4b4b4b] outline-none focus:border-[#b0b0b0] transition-colors"
        >
          <option value="all">Все станки</option>
          {PLACES.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {/* По дате */}
        <div className="relative">
          <Icon name="Calendar" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5b5]" />
          <input
            type="text"
            placeholder="Дата (напр. 04.2026)"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="bg-white border border-[#e0e0e0] rounded-[8px] pl-8 pr-3 py-2 text-[13px] outline-none focus:border-[#b0b0b0] transition-colors placeholder:text-[#c0c0c0] w-[180px]"
          />
        </div>

        {hasFilters && (
          <button
            onClick={() => { setFilterEmp("all"); setFilterPlace("all"); setFilterDate(""); }}
            className="flex items-center gap-1.5 text-[12px] text-[#9b9b9b] hover:text-[#4b4b4b] transition-colors"
          >
            <Icon name="X" size={12} />Сбросить
          </button>
        )}

        {/* Переключатель вида (справа) */}
        <div className="ml-auto flex gap-0.5 bg-[#f0f0f0] rounded-[8px] p-0.5">
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
              ${viewMode === "table" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
          >
            <Icon name="Table" size={12} />Таблица
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
              ${viewMode === "list" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
          >
            <Icon name="List" size={12} />Список
          </button>
        </div>
      </div>

      {/* ── Итог за период ── */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-4 bg-[#f4f4f4] rounded-xl px-4 py-3 text-[13px] text-[#6b6b6b]">
          <span>За период:</span>
          <span className="font-semibold text-[#1a1a1a]">{filtered.length} смен</span>
          <span className="text-[#d0d0d0]">·</span>
          <span><b className="text-[#1a1a1a]">{totalP} шт.</b> изделий</span>
          <span className="text-[#d0d0d0]">·</span>
          <span><b className="text-[#1a1a1a]">{totalR} м²</b> сырья</span>
        </div>
      )}

      {/* ── Пусто ── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14">
          <div className="w-12 h-12 rounded-2xl bg-[#f4f4f4] flex items-center justify-center mb-3">
            <Icon name="FileSearch" size={22} className="text-[#c0c0c0]" />
          </div>
          <p className="text-[14px] text-[#b0b0b0]">Нет смен по выбранному фильтру</p>
        </div>
      )}

      {/* ════ Таблица ════ */}
      {viewMode === "table" && filtered.length > 0 && (
        <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
          {dates.map((date, di) => {
            const dayShifts = filtered.filter(s => s.date === date);
            const dayP = dayShifts.reduce((a, s) => a + shiftTotalProduced(s), 0);
            const dayR = +dayShifts.reduce((a, s) => a + shiftTotalRaw(s), 0).toFixed(2);

            return (
              <div key={date} className={di > 0 ? "border-t border-[#f0f0f0]" : ""}>
                {/* Заголовок дня */}
                <div className="px-5 py-2.5 bg-[#f8f8f8] flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-[#4b4b4b]">{date}</span>
                  <span className="text-[11px] text-[#9b9b9b]">
                    {dayShifts.length} смен · {dayP} шт. · {dayR} м²
                  </span>
                </div>

                {/* Строки */}
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#f8f8f8]">
                      {["Станок", "Сотрудник", "Изделие", "Размер", "Кол-во", "Сырьё"].map(h => (
                        <th key={h} className="px-4 py-2 text-left text-[10px] font-semibold text-[#c0c0c0] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dayShifts.map((s) => {
                      const place    = PLACES.find(p => p.id === s.placeId)!;
                      const employee = EMPLOYEES.find(e => e.id === s.employeeId)!;
                      return s.results.map((r, ri) => {
                        const bt = BLANK_TYPES.find(b => b.id === r.blankTypeId)!;
                        return (
                          <tr key={`${s.id}-${ri}`} className="border-b border-[#f8f8f8] last:border-0 hover:bg-[#fafafa] transition-colors">
                            <td className="px-4 py-2.5 text-[12px] text-[#6b6b6b]">{place.name}</td>
                            <td className="px-4 py-2.5 text-[12px] text-[#4b4b4b]">{employee.name}</td>
                            <td className="px-4 py-2.5 text-[12px] text-[#1a1a1a] font-medium">{bt.name}</td>
                            <td className="px-4 py-2.5 text-[11px] font-mono text-[#9b9b9b]">{bt.size}</td>
                            <td className="px-4 py-2.5 text-[13px] font-semibold text-[#1a1a1a]">{r.produced} шт.</td>
                            <td className="px-4 py-2.5 text-[12px] text-[#6b6b6b] pr-5">{r.rawUsed} м²</td>
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
      )}

      {/* ════ Список ════ */}
      {viewMode === "list" && filtered.length > 0 && (
        <div className="space-y-5">
          {dates.map(date => {
            const dayShifts = filtered.filter(s => s.date === date);
            const dayP = dayShifts.reduce((a, s) => a + shiftTotalProduced(s), 0);
            const dayR = +dayShifts.reduce((a, s) => a + shiftTotalRaw(s), 0).toFixed(2);

            return (
              <div key={date}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[13px] font-semibold text-[#4b4b4b]">{date}</span>
                  <span className="text-[11px] text-[#9b9b9b]">{dayP} шт. · {dayR} м²</span>
                </div>
                <div className="space-y-2">
                  {dayShifts.map(s => {
                    const place    = PLACES.find(p => p.id === s.placeId)!;
                    const employee = EMPLOYEES.find(e => e.id === s.employeeId)!;
                    const totalP   = shiftTotalProduced(s);
                    const totalR   = shiftTotalRaw(s);
                    return (
                      <div key={s.id} className="bg-white border border-[#ebebeb] rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-[13px] font-semibold text-[#1a1a1a] flex-1">{place.name}</p>
                          <span className="text-[12px] text-[#6b6b6b]">{employee.name}</span>
                          <span className="text-[12px] text-[#9b9b9b]">{s.startedAt}–{s.finishedAt}</span>
                        </div>
                        <div className="space-y-1 mb-2">
                          {s.results.map((r, ri) => {
                            const bt = BLANK_TYPES.find(b => b.id === r.blankTypeId)!;
                            return (
                              <div key={ri} className="flex items-center justify-between text-[12px]">
                                <span className="text-[#6b6b6b]">{bt.name} <span className="text-[#c0c0c0]">{bt.size}</span></span>
                                <div className="flex items-center gap-3">
                                  <span className="font-semibold text-[#1a1a1a]">{r.produced} шт.</span>
                                  <span className="text-[#9b9b9b]">{r.rawUsed} м²</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex gap-4 pt-2 border-t border-[#f5f5f5] text-[12px] text-[#9b9b9b]">
                          <span>Итого: <b className="text-[#1a1a1a]">{totalP} шт.</b></span>
                          <span>Сырьё: <b className="text-[#1a1a1a]">{totalR} м²</b></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
