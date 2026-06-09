import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import DateRangePicker from "@/components/ui/DateRangePicker";
import { useNav } from "@/store/navStore";
import {
  Shift,
  shiftTotalProduced, shiftTotalRaw, today,
} from "./cutting.types";

type Props = { doneShifts: Shift[] };

function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

const SEL = "w-full bg-white border border-[#e8e8e8] rounded-[10px] px-3 py-2 text-[12px] text-[#4b4b4b] outline-none focus:border-[#b0b0b0] transition-colors";

export default function CuttingJournal({ doneShifts }: Props) {
  const { openCuttingTask } = useNav();

  const [filterEmp,   setFilterEmp]   = useState("all");
  const [filterPlace, setFilterPlace] = useState("all");
  const [filterBlank, setFilterBlank] = useState("all");
  const [filterStone, setFilterStone] = useState("all");
  const [rangeFrom,   setRangeFrom]   = useState("");
  const [rangeTo,     setRangeTo]     = useState("");

  /* Уникальные значения фильтров */
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

  const blanks = useMemo(() => {
    const set = new Set<string>();
    doneShifts.forEach(s => s.results.forEach(r => {
      const name = r.blankName ?? r.blankTypeId;
      if (name) set.add(String(name));
    }));
    return [...set].sort();
  }, [doneShifts]);

  const stones = useMemo(() => {
    const set = new Set<string>();
    doneShifts.forEach(s => s.results.forEach(r => {
      if (r.material) set.add(r.material);
    }));
    return [...set].sort();
  }, [doneShifts]);

  /* Фильтрация: смены + результаты внутри */
  const filtered = useMemo(() => {
    return doneShifts
      .filter(s => {
        if (filterEmp   !== "all" && s.employeeId !== filterEmp)  return false;
        if (filterPlace !== "all" && s.placeId    !== filterPlace) return false;
        if (rangeFrom && s.date < rangeFrom) return false;
        if (rangeTo   && s.date > rangeTo)   return false;
        /* Если фильтр по изделию или камню — проверяем хотя бы один result */
        if (filterBlank !== "all" || filterStone !== "all") {
          const hasMatch = s.results.some(r => {
            const blankOk = filterBlank === "all" || String(r.blankName ?? r.blankTypeId) === filterBlank;
            const stoneOk = filterStone === "all" || r.material === filterStone;
            return blankOk && stoneOk;
          });
          if (!hasMatch) return false;
        }
        return true;
      });
  }, [doneShifts, filterEmp, filterPlace, rangeFrom, rangeTo, filterBlank, filterStone]);

  /* Группировка по датам desc */
  const dates = useMemo(() =>
    [...new Set(filtered.map(s => s.date))].sort((a, b) => b.localeCompare(a)),
  [filtered]);

  const totalP = filtered.reduce((a, s) => a + shiftTotalProduced(s), 0);
  const totalR = +filtered.reduce((a, s) => a + shiftTotalRaw(s), 0).toFixed(2);

  const byBlank: Record<string, number> = {};
  const byStone: Record<string, number> = {};
  filtered.forEach(s => s.results.forEach(r => {
    const name = String(r.blankName ?? r.blankTypeId);
    const mat  = r.material ?? "—";
    byBlank[name] = (byBlank[name] ?? 0) + r.produced;
    byStone[mat]  = (byStone[mat]  ?? 0) + r.rawUsed;
  }));

  const hasFilters = filterEmp !== "all" || filterPlace !== "all" || filterBlank !== "all" || filterStone !== "all";

  return (
    <div className="flex gap-5 min-h-0 h-full">

      {/* ── Левая панель ── */}
      <div className="shrink-0 w-[260px] space-y-3 overflow-y-auto pb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#b0b0b0]">Период</p>
        <DateRangePicker
          from={rangeFrom} to={rangeTo}
          onChange={(f, t) => { setRangeFrom(f); setRangeTo(t); }}
        />

        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#b0b0b0]">Фильтры</p>

          <select value={filterEmp} onChange={e => setFilterEmp(e.target.value)} className={SEL}>
            <option value="all">Все сотрудники</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>

          <select value={filterPlace} onChange={e => setFilterPlace(e.target.value)} className={SEL}>
            <option value="all">Все станки</option>
            {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <select value={filterBlank} onChange={e => setFilterBlank(e.target.value)} className={SEL}>
            <option value="all">Все изделия</option>
            {blanks.map(b => <option key={b} value={b}>{b}</option>)}
          </select>

          <select value={filterStone} onChange={e => setFilterStone(e.target.value)} className={SEL}>
            <option value="all">Все камни</option>
            {stones.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {hasFilters && (
            <button
              onClick={() => { setFilterEmp("all"); setFilterPlace("all"); setFilterBlank("all"); setFilterStone("all"); }}
              className="flex items-center gap-1.5 text-[12px] text-[#9b9b9b] hover:text-[#ef4444] transition-colors"
            >
              <Icon name="X" size={12} />Сбросить фильтры
            </button>
          )}
        </div>

        {/* Итоги */}
        {filtered.length > 0 && (
          <div className="bg-[#f4f4f5] rounded-xl p-3 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#b0b0b0]">Итого</p>
            <div className="space-y-1">
              {[
                { label: "Смен",    value: String(filtered.length) },
                { label: "Изделий", value: `${totalP} шт.` },
                { label: "Сырьё",   value: `${totalR} м²`, color: "#6366f1" },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-[12px]">
                  <span className="text-[#6b6b6b]">{r.label}</span>
                  <span className="font-bold" style={{ color: r.color ?? "#1a1a1a" }}>{r.value}</span>
                </div>
              ))}
            </div>

            {Object.keys(byBlank).length > 0 && (
              <>
                <div className="h-px bg-[#e8e8e8]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#b0b0b0]">По изделиям</p>
                {Object.entries(byBlank).map(([name, cnt]) => (
                  <div key={name} className="flex justify-between text-[11px]">
                    <span className="text-[#4b4b4b] truncate mr-2">{name}</span>
                    <span className="font-semibold text-[#1a1a1a] shrink-0">{cnt} шт.</span>
                  </div>
                ))}
              </>
            )}

            {Object.keys(byStone).length > 0 && (
              <>
                <div className="h-px bg-[#e8e8e8]" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#b0b0b0]">По камню</p>
                {Object.entries(byStone).map(([mat, m2]) => (
                  <div key={mat} className="flex justify-between text-[11px]">
                    <span className="text-[#4b4b4b] truncate mr-2">{mat}</span>
                    <span className="font-semibold text-[#6366f1] shrink-0">{(m2 as number).toFixed(2)} м²</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Правая часть: таблица ── */}
      <div className="flex-1 min-w-0 overflow-y-auto space-y-4">

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#f4f4f4] flex items-center justify-center mb-3">
              <Icon name="CalendarSearch" size={20} className="text-[#c0c0c0]" />
            </div>
            <p className="text-[14px] text-[#b0b0b0] font-medium">Нет смен в выбранном периоде</p>
            <p className="text-[12px] text-[#c5c5c5] mt-1">
              {rangeFrom ? "Попробуйте изменить даты или фильтры" : "Выберите даты в календаре слева"}
            </p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
            {dates.map((date, di) => {
              const dayShifts = filtered.filter(s => s.date === date);
              const dayP = dayShifts.reduce((a, s) => a + shiftTotalProduced(s), 0);
              const dayR = +dayShifts.reduce((a, s) => a + shiftTotalRaw(s), 0).toFixed(2);
              const isToday   = date === today;
              const dateLabel = isToday ? `Сегодня, ${isoToDisplay(date)}` : isoToDisplay(date);

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
                        {["Задача", "Станок", "Сотрудник", "Изделие", "Камень", "Кол-во", "Сырьё"].map(h => (
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

                        /* Фильтруем результаты по изделию/камню если нужно */
                        const visibleResults = s.results.filter(r => {
                          const blankOk = filterBlank === "all" || String(r.blankName ?? r.blankTypeId) === filterBlank;
                          const stoneOk = filterStone === "all" || r.material === filterStone;
                          return blankOk && stoneOk;
                        });

                        if (visibleResults.length === 0) {
                          return (
                            <tr key={s.id} className="border-b border-[#f8f8f8] last:border-0">
                              <td className="px-4 py-2">
                                {s.taskId ? (
                                  <button
                                    onClick={() => openCuttingTask(s.taskId!)}
                                    className="text-[11px] font-bold font-mono text-[#6366f1] hover:underline"
                                  >
                                    #{s.taskId}
                                  </button>
                                ) : <span className="text-[11px] text-[#c0c0c0]">—</span>}
                              </td>
                              <td className="px-4 py-2 text-[12px] text-[#6b6b6b]">{placeName}</td>
                              <td className="px-4 py-2 text-[12px] text-[#4b4b4b]">{employeeName}</td>
                              <td colSpan={4} className="px-4 py-2 text-[12px] text-[#c0c0c0]">Результаты не указаны</td>
                            </tr>
                          );
                        }

                        return visibleResults.map((r, ri) => {
                          const blankName = String(r.blankName ?? r.blankTypeId);
                          const material  = r.material ?? "—";
                          return (
                            <tr key={`${s.id}-${ri}`} className="border-b border-[#f8f8f8] last:border-0 hover:bg-[#fafafa] transition-colors">
                              <td className="px-4 py-2">
                                {ri === 0 ? (
                                  s.taskId ? (
                                    <button
                                      onClick={() => openCuttingTask(s.taskId!)}
                                      className="text-[11px] font-bold font-mono text-[#6366f1] hover:underline underline-offset-2"
                                      title="Открыть задачу"
                                    >
                                      #{s.taskId}
                                    </button>
                                  ) : <span className="text-[11px] text-[#c0c0c0]">—</span>
                                ) : ""}
                              </td>
                              <td className="px-4 py-2 text-[12px] text-[#6b6b6b]">{ri === 0 ? placeName : ""}</td>
                              <td className="px-4 py-2 text-[12px] text-[#4b4b4b]">{ri === 0 ? employeeName : ""}</td>
                              <td className="px-4 py-2 text-[12px] text-[#1a1a1a] font-medium">{blankName}</td>
                              <td className="px-4 py-2">
                                <span className="text-[11px] bg-[#f5f5f5] text-[#6b6b6b] px-2 py-0.5 rounded-md">{material}</span>
                              </td>
                              <td className="px-4 py-2">
                                <span className="text-[13px] font-bold text-[#1a1a1a]">{r.produced}</span>
                                <span className="text-[11px] text-[#9b9b9b] ml-1">шт.</span>
                              </td>
                              <td className="px-4 py-2 pr-5">
                                <span className="text-[12px] font-semibold text-[#6366f1]">{Number(r.rawUsed).toFixed(2)}</span>
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
        )}
      </div>
    </div>
  );
}
