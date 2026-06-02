import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Shift, WORK_LABELS, shiftTotalProduced, shiftTotalRaw } from "../cutting/cutting.types";
import { WORK_ICON, daysAgo, countBy, topEntry, StatCard } from "./process.utils";

export default function AnalyticsTab({ shifts }: { shifts: Shift[] }) {
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("30d");
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterPlace,    setFilterPlace]    = useState("");
  const [filterWorkType, setFilterWorkType] = useState("");

  const employees = useMemo(() => [...new Set(shifts.map(s => s.employeeName).filter(Boolean))], [shifts]);
  const places    = useMemo(() => [...new Set(shifts.map(s => s.placeName).filter(Boolean))], [shifts]);

  const filtered = useMemo(() => shifts.filter(s => {
    if (period === "7d"  && s.date < daysAgo(7))  return false;
    if (period === "30d" && s.date < daysAgo(30)) return false;
    if (filterEmployee && s.employeeName !== filterEmployee) return false;
    if (filterPlace    && s.placeName    !== filterPlace)    return false;
    if (filterWorkType && s.workType     !== filterWorkType) return false;
    return true;
  }), [shifts, period, filterEmployee, filterPlace, filterWorkType]);

  const done   = filtered.filter(s => s.status === "done");
  const active = filtered.filter(s => s.status === "active");

  /* Длительности */
  const durations = done
    .filter(s => s.finishedAt)
    .map(s => {
      const [sh, sm] = s.startedAt.split(":").map(Number);
      const [fh, fm] = (s.finishedAt!).split(":").map(Number);
      return (fh * 60 + fm) - (sh * 60 + sm);
    })
    .filter(d => d > 0);
  const avgMinutes = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

  /* Топы */
  const byPlace    = countBy(filtered, s => s.placeName ?? "");
  const byEmployee = countBy(filtered, s => s.employeeName ?? "");
  const byWorkType = countBy(filtered, s => s.workType);

  const topPlace    = topEntry(byPlace);
  const topEmployee = topEntry(byEmployee);
  const topWorkType = topEntry(byWorkType);

  const totalProduced = done.reduce((a, s) => a + shiftTotalProduced(s), 0);
  const totalRaw      = +done.reduce((a, s) => a + shiftTotalRaw(s), 0).toFixed(2);

  /* Для распила */
  const cutting       = done.filter(s => s.workType === "cutting");
  const cuttingBlankQ = cutting.reduce((a, s) => a + shiftTotalProduced(s), 0);
  const cuttingRaw    = +cutting.reduce((a, s) => a + shiftTotalRaw(s), 0).toFixed(2);
  const avgPerBlank   = cuttingBlankQ > 0 ? +(cuttingRaw / cuttingBlankQ).toFixed(3) : 0;

  /* Для производства — по типам */
  const byWt = countBy(done, s => s.workType);

  const inputCls = "bg-white border border-[#e8e8e8] rounded-[8px] px-3 py-1.5 text-[12px] text-[#4b4b4b] outline-none";

  return (
    <div className="flex-1 overflow-y-auto px-7 py-5 space-y-6">

      {/* Фильтры периода */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-0.5 bg-[#f0f0f0] rounded-[8px] p-0.5">
          {([["7d", "7 дней"], ["30d", "30 дней"], ["all", "Всё время"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setPeriod(k)}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all ${
                period === k ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"
              }`}
            >{l}</button>
          ))}
        </div>
        <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)} className={inputCls}>
          <option value="">Все сотрудники</option>
          {employees.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={filterPlace} onChange={e => setFilterPlace(e.target.value)} className={inputCls}>
          <option value="">Все станки</option>
          {places.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterWorkType} onChange={e => setFilterWorkType(e.target.value)} className={inputCls}>
          <option value="">Все типы работ</option>
          {Object.entries(WORK_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {(filterEmployee || filterPlace || filterWorkType) && (
          <button onClick={() => { setFilterEmployee(""); setFilterPlace(""); setFilterWorkType(""); }}
            className="flex items-center gap-1 text-[12px] text-[#9b9b9b] hover:text-[#4b4b4b]">
            <Icon name="X" size={12} />Сброс
          </button>
        )}
      </div>

      {/* Основные показатели */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-3">Общие показатели</h3>
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Всего смен",      value: String(filtered.length), icon: "CalendarDays", color: "#6b6b6b" },
            { label: "Активных",        value: String(active.length),   icon: "Play",         color: "#16a34a" },
            { label: "Завершено",       value: String(done.length),     icon: "CheckCheck",   color: "#9b9b9b" },
            { label: "Произведено",     value: `${totalProduced} шт.`,  icon: "Boxes",        color: "#6366f1" },
            { label: "Сырьё потрачено", value: `${totalRaw} м²`,        icon: "Layers",       color: "#f59e0b" },
          ].map(s => (
            <StatCard key={s.label} {...s} />
          ))}
          {[
            { label: "Среднее время смены", value: avgMinutes > 0 ? `${Math.floor(avgMinutes/60)}ч ${avgMinutes%60}м` : "—", icon: "Clock",  color: "#0ea5e9" },
            { label: "Топ станок",          value: topPlace || "—",         icon: "Hammer",   color: "#8b5cf6" },
            { label: "Топ сотрудник",       value: topEmployee || "—",      icon: "User",     color: "#ec4899" },
            { label: "Топ тип работы",      value: WORK_LABELS[topWorkType ?? ""] ?? "—", icon: "Tag", color: "#14b8a6" },
          ].map(s => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </div>

      {/* Распил */}
      {(cutting.length > 0 || !filterWorkType) && (
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-3">Распил / Заготовки</h3>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Смен по распилу"      value={String(cutting.length)}  icon="Scissors"   color="#6366f1" />
            <StatCard label="Заготовок нарезано"   value={`${cuttingBlankQ} шт.`} icon="Boxes"      color="#8b5cf6" />
            <StatCard label="Сырья потрачено"      value={`${cuttingRaw} м²`}     icon="Layers"     color="#f59e0b" />
            <StatCard label="Ср. расход на загот." value={`${avgPerBlank} м²`}    icon="Calculator" color="#0ea5e9" />
          </div>
        </div>
      )}

      {/* По типам работ */}
      {Object.keys(byWt).length > 1 && (
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-3">По типам работ</h3>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(byWt).map(([wt, cnt]) => (
              <div key={wt} className="bg-white border border-[#ebebeb] rounded-xl px-4 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#f5f5f5] flex items-center justify-center">
                  <Icon name={WORK_ICON[wt] as never ?? "Hammer"} size={16} className="text-[#6b6b6b]" />
                </div>
                <div>
                  <p className="text-[20px] font-bold text-[#1a1a1a]">{cnt}</p>
                  <p className="text-[11px] text-[#9b9b9b]">{WORK_LABELS[wt]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* По сотрудникам */}
      {Object.keys(byEmployee).length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-3">По сотрудникам</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(byEmployee).sort((a, b) => b[1] - a[1]).map(([name, cnt]) => {
              const empShifts = done.filter(s => s.employeeName === name);
              const empP = empShifts.reduce((a, s) => a + shiftTotalProduced(s), 0);
              const empR = +empShifts.reduce((a, s) => a + shiftTotalRaw(s), 0).toFixed(2);
              return (
                <div key={name} className="bg-white border border-[#ebebeb] rounded-xl px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center">
                      <Icon name="User" size={16} className="text-[#9b9b9b]" />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-[#1a1a1a]">{name}</p>
                      <p className="text-[11px] text-[#9b9b9b]">{cnt} смен завершено</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {empP > 0 && <p className="text-[14px] font-bold text-[#6366f1]">{empP} шт.</p>}
                    {empR > 0 && <p className="text-[12px] text-[#f59e0b]">{empR} м²</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
