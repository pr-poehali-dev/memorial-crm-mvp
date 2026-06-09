import { useState, useMemo, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import DateRangePicker from "@/components/ui/DateRangePicker";
import { TaskModal } from "./CuttingTaskBlock";
import {
  Shift, CuttingTask,
  shiftTotalProduced, shiftTotalRaw, today,
} from "./cutting.types";

type Props = { doneShifts: Shift[]; allTasks?: CuttingTask[] };

function isoToDisplay(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}.${m}.${y}`;
}

/* ── Мультиселект с тегами ── */
function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: { id: string; name: string }[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    onChange(next);
  };

  const activeOptions = options.filter(o => selected.has(o.id));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between gap-2 bg-white border rounded-[10px] px-3 py-2 text-[12px] text-left transition-colors ${
          open ? "border-[#2563eb]" : "border-[#e8e8e8]"
        }`}
      >
        <span className={selected.size > 0 ? "text-[#1a1a1a] font-medium" : "text-[#9b9b9b]"}>
          {selected.size > 0 ? `${label}: ${selected.size}` : label}
        </span>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={12} className="text-[#9b9b9b] shrink-0" />
      </button>

      {/* Теги выбранных */}
      {activeOptions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {activeOptions.map(o => (
            <span
              key={o.id}
              className="flex items-center gap-1 bg-[#dbeafe] text-[#2563eb] text-[11px] font-medium px-2 py-0.5 rounded-full"
            >
              {o.name}
              <button
                onClick={() => toggle(o.id)}
                className="hover:text-red-500 transition-colors leading-none"
              >
                <Icon name="X" size={9} />
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="absolute z-20 top-full left-0 mt-1 w-full bg-white border border-[#e8e8e8] rounded-xl shadow-lg py-1 max-h-48 overflow-y-auto">
          {options.length === 0 && (
            <p className="px-3 py-2 text-[12px] text-[#c0c0c0]">Нет вариантов</p>
          )}
          {options.map(o => (
            <button
              key={o.id}
              onClick={() => toggle(o.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left transition-colors ${
                selected.has(o.id)
                  ? "bg-[#eff6ff] text-[#2563eb] font-medium"
                  : "text-[#4b4b4b] hover:bg-[#fafafa]"
              }`}
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                selected.has(o.id) ? "bg-[#2563eb] border-[#2563eb]" : "border-[#d0d0d0]"
              }`}>
                {selected.has(o.id) && <Icon name="Check" size={9} className="text-white" />}
              </div>
              {o.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CuttingJournal({ doneShifts, allTasks = [] }: Props) {
  const [filterEmps,   setFilterEmps]   = useState<Set<string>>(new Set());
  const [filterPlaces, setFilterPlaces] = useState<Set<string>>(new Set());
  const [filterBlanks, setFilterBlanks] = useState<Set<string>>(new Set());
  const [filterStones, setFilterStones] = useState<Set<string>>(new Set());
  const [rangeFrom,    setRangeFrom]    = useState("");
  const [rangeTo,      setRangeTo]      = useState("");

  /* Модал задачи прямо в журнале */
  const [modalTask, setModalTask] = useState<CuttingTask | null>(null);

  const openTask = (taskId: string) => {
    const t = allTasks.find(t => t.id === taskId);
    if (t) setModalTask(t);
  };

  /* Уникальные значения */
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
    return [...set].sort().map(b => ({ id: b, name: b }));
  }, [doneShifts]);

  const stones = useMemo(() => {
    const set = new Set<string>();
    doneShifts.forEach(s => s.results.forEach(r => { if (r.material) set.add(r.material); }));
    return [...set].sort().map(s => ({ id: s, name: s }));
  }, [doneShifts]);

  /* Фильтрация */
  const filtered = useMemo(() => doneShifts.filter(s => {
    if (filterEmps.size   > 0 && !filterEmps.has(s.employeeId))  return false;
    if (filterPlaces.size > 0 && !filterPlaces.has(s.placeId))   return false;
    if (rangeFrom && s.date < rangeFrom) return false;
    if (rangeTo   && s.date > rangeTo)   return false;
    if (filterBlanks.size > 0 || filterStones.size > 0) {
      const hasMatch = s.results.some(r => {
        const blankOk = filterBlanks.size === 0 || filterBlanks.has(String(r.blankName ?? r.blankTypeId));
        const stoneOk = filterStones.size === 0 || filterStones.has(r.material ?? "");
        return blankOk && stoneOk;
      });
      if (!hasMatch) return false;
    }
    return true;
  }), [doneShifts, filterEmps, filterPlaces, rangeFrom, rangeTo, filterBlanks, filterStones]);

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

  const hasFilters = filterEmps.size > 0 || filterPlaces.size > 0 || filterBlanks.size > 0 || filterStones.size > 0;

  const resetAll = () => {
    setFilterEmps(new Set()); setFilterPlaces(new Set());
    setFilterBlanks(new Set()); setFilterStones(new Set());
  };

  return (
    <>
      {modalTask && (
        <TaskModal
          task={modalTask}
          onClose={() => setModalTask(null)}
          allShifts={doneShifts}
        />
      )}

      <div className="flex gap-5 min-h-0 h-full">

        {/* ── Левая панель ── */}
        <div className="shrink-0 w-[270px] space-y-3 overflow-y-auto pb-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#b0b0b0]">Период</p>
          <DateRangePicker
            from={rangeFrom} to={rangeTo}
            onChange={(f, t) => { setRangeFrom(f); setRangeTo(t); }}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#b0b0b0]">Фильтры</p>
              {hasFilters && (
                <button
                  onClick={resetAll}
                  className="flex items-center gap-1 text-[11px] text-[#9b9b9b] hover:text-[#ef4444] transition-colors"
                >
                  <Icon name="X" size={10} />Сбросить
                </button>
              )}
            </div>

            <MultiSelect label="Сотрудники"  options={employees} selected={filterEmps}   onChange={setFilterEmps} />
            <MultiSelect label="Станки"      options={places}    selected={filterPlaces} onChange={setFilterPlaces} />
            <MultiSelect label="Изделия"     options={blanks}    selected={filterBlanks} onChange={setFilterBlanks} />
            <MultiSelect label="Камни"       options={stones}    selected={filterStones} onChange={setFilterStones} />
          </div>

          {/* Итоги */}
          {filtered.length > 0 && (
            <div className="bg-[#f4f4f5] rounded-xl p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#b0b0b0]">Итого за период</p>
              <div className="space-y-1">
                {[
                  { label: "Смен",    value: String(filtered.length) },
                  { label: "Изделий", value: `${totalP} шт.` },
                  { label: "Сырьё",   value: `${totalR} м²`, color: "#2563eb" },
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
                      <span className="font-semibold text-[#2563eb] shrink-0">{(m2 as number).toFixed(2)} м²</span>
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
                        <b className="text-[#2563eb]">{dayR} м²</b>
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

                          const visibleResults = s.results.filter(r => {
                            const blankOk = filterBlanks.size === 0 || filterBlanks.has(String(r.blankName ?? r.blankTypeId));
                            const stoneOk = filterStones.size === 0 || filterStones.has(r.material ?? "");
                            return blankOk && stoneOk;
                          });

                          if (visibleResults.length === 0) {
                            return (
                              <tr key={s.id} className="border-b border-[#f8f8f8] last:border-0">
                                <td className="px-4 py-2">
                                  {s.taskId ? (
                                    <button
                                      onClick={() => openTask(s.taskId!)}
                                      className="text-[11px] font-bold font-mono text-[#2563eb] hover:underline"
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
                                        onClick={() => openTask(s.taskId!)}
                                        className="text-[11px] font-bold font-mono text-[#2563eb] hover:underline underline-offset-2"
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
                                  <span className="text-[12px] font-semibold text-[#2563eb]">{Number(r.rawUsed).toFixed(2)}</span>
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
    </>
  );
}