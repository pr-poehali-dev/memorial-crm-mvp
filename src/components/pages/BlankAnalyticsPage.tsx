import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import {
  initShifts, PLACES, EMPLOYEES, BLANK_TYPES,
  Shift, ShiftResult,
} from "./cutting/cutting.types";

/* ─── Разворачиваем смены в строки ─── */
type Row = {
  shiftId: string;
  date: string;
  placeId: string;
  placeName: string;
  machine: string;
  employeeId: string;
  employeeName: string;
  blankTypeId: string;
  blankName: string;
  blankSize: string;
  produced: number;
  rawUsed: number;
  rawPerUnit: number;   // норма
  actualPerUnit: number;
  deviation: number;   // % от нормы (+ перерасход, - экономия)
};

function buildRows(shifts: Shift[]): Row[] {
  const rows: Row[] = [];
  for (const s of shifts) {
    if (s.status !== "done") continue;
    const place    = PLACES.find(p => p.id === s.placeId)!;
    const employee = EMPLOYEES.find(e => e.id === s.employeeId)!;
    for (const r of s.results) {
      const bt            = BLANK_TYPES.find(b => b.id === r.blankTypeId)!;
      const actualPerUnit = r.produced > 0 ? +(r.rawUsed / r.produced).toFixed(3) : 0;
      const deviation     = bt.rawPerUnit > 0
        ? +((actualPerUnit - bt.rawPerUnit) / bt.rawPerUnit * 100).toFixed(1)
        : 0;
      rows.push({
        shiftId:      s.id,
        date:         s.date,
        placeId:      s.placeId,
        placeName:    place.name,
        machine:      place.machine,
        employeeId:   s.employeeId,
        employeeName: employee.name,
        blankTypeId:  r.blankTypeId,
        blankName:    bt.name,
        blankSize:    bt.size,
        produced:     r.produced,
        rawUsed:      r.rawUsed,
        rawPerUnit:   bt.rawPerUnit,
        actualPerUnit,
        deviation,
      });
    }
  }
  return rows;
}

/* ─── Цвет отклонения ─── */
function deviationColor(dev: number) {
  if (dev <= 2)  return { color: "#16a34a", bg: "#f0fdf4" };
  if (dev <= 10) return { color: "#d97706", bg: "#fffbeb" };
  return             { color: "#dc2626",  bg: "#fef2f2" };
}

/* ─── Цвет эффективности по % (инвертировано — меньше расход = лучше) ─── */
function effColor(pct: number) {
  if (pct <= 2)  return "#16a34a";
  if (pct <= 8)  return "#d97706";
  return             "#dc2626";
}

const selectCls = "bg-white border border-[#e0e0e0] rounded-[8px] px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-[#b0b0b0] transition-colors";

/* ════════════════════════════════════ */
export default function BlankAnalyticsPage() {
  const allRows = useMemo(() => buildRows(initShifts), []);

  /* Фильтры */
  const [fPlace,    setFPlace]    = useState("all");
  const [fEmployee, setFEmployee] = useState("all");
  const [fBlank,    setFBlank]    = useState("all");
  const [fMode,     setFMode]     = useState<"all" | "overrun">("all");

  const rows = useMemo(() => {
    let r = allRows;
    if (fPlace    !== "all") r = r.filter(x => x.placeId    === fPlace);
    if (fEmployee !== "all") r = r.filter(x => x.employeeId === fEmployee);
    if (fBlank    !== "all") r = r.filter(x => x.blankTypeId === fBlank);
    if (fMode === "overrun")  r = r.filter(x => x.deviation > 2);
    return r;
  }, [allRows, fPlace, fEmployee, fBlank, fMode]);

  /* ── Сводные метрики ── */
  const totalProduced = rows.reduce((a, r) => a + r.produced, 0);
  const totalRaw      = +rows.reduce((a, r) => a + r.rawUsed, 0).toFixed(2);
  const doneShifts    = [...new Set(rows.map(r => r.shiftId))].length;
  const avgPerShift   = doneShifts > 0 ? +(totalProduced / doneShifts).toFixed(1) : 0;
  const avgRawPerUnit = totalProduced > 0 ? +(totalRaw / totalProduced).toFixed(3) : 0;

  /* ── Лучшее / проблемное место ── */
  const placeStats = PLACES.map(p => {
    const pr = rows.filter(r => r.placeId === p.id);
    const totalP  = pr.reduce((a, r) => a + r.produced, 0);
    const avgDev  = pr.length > 0 ? +(pr.reduce((a, r) => a + r.deviation, 0) / pr.length).toFixed(1) : 0;
    return { ...p, totalP, avgDev, rowCount: pr.length };
  }).filter(p => p.rowCount > 0);

  const bestPlace    = [...placeStats].sort((a, b) => a.avgDev - b.avgDev)[0];
  const worstPlace   = [...placeStats].sort((a, b) => b.avgDev - a.avgDev)[0];

  /* ── Эффективность по местам ── */
  const placeEff = placeStats.map(p => ({
    ...p,
    pct: p.avgDev,
  }));

  /* ── Плановый vs Фактический расход ── */
  const planRaw   = +rows.reduce((a, r) => a + r.rawPerUnit * r.produced, 0).toFixed(2);
  const overrun   = +(totalRaw - planRaw).toFixed(2);
  const overrunPct = planRaw > 0 ? +((overrun / planRaw) * 100).toFixed(1) : 0;

  /* ── ТОП сотрудников (по среднему отклонению) ── */
  const empStats = EMPLOYEES.map(e => {
    const er = rows.filter(r => r.employeeId === e.id);
    if (er.length === 0) return null;
    const avgDev = +(er.reduce((a, r) => a + r.deviation, 0) / er.length).toFixed(1);
    const totalP = er.reduce((a, r) => a + r.produced, 0);
    return { ...e, avgDev, totalP };
  }).filter(Boolean) as { id: string; name: string; avgDev: number; totalP: number }[];

  const topEmployees     = [...empStats].sort((a, b) => a.avgDev - b.avgDev);
  const overrunEmployees = empStats.filter(e => e.avgDev > 5);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto">
      <div className="p-7 max-w-[1100px] mx-auto w-full space-y-6">

        {/* ── Шапка ── */}
        <div>
          <h1 className="text-[21px] font-semibold text-[#1a1a1a] tracking-tight">Анализ заготовок</h1>
          <p className="text-[13px] text-[#9b9b9b] mt-0.5">Производительность смен, расход сырья и отклонения</p>
        </div>

        {/* ── Фильтры ── */}
        <div className="flex flex-wrap gap-2 items-center">
          <select value={fPlace} onChange={e => setFPlace(e.target.value)} className={selectCls}>
            <option value="all">Все места</option>
            {PLACES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={fEmployee} onChange={e => setFEmployee(e.target.value)} className={selectCls}>
            <option value="all">Все сотрудники</option>
            {EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <select value={fBlank} onChange={e => setFBlank(e.target.value)} className={selectCls}>
            <option value="all">Все заготовки</option>
            {BLANK_TYPES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <div className="flex gap-1 bg-white border border-[#e0e0e0] rounded-[8px] p-0.5 ml-auto">
            {([["all", "Все"], ["overrun", "Только отклонения"]] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFMode(val)}
                className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
                  ${fMode === val ? "bg-[#1a1a1a] text-white" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 6 карточек метрик ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Произведено заготовок",  value: `${totalProduced} шт.`,       icon: "Layers",       color: "#f59e0b" },
            { label: "Расход сырья",            value: `${totalRaw} м²`,             icon: "Package",      color: "#6366f1" },
            { label: "Средняя выработка/смену", value: `${avgPerShift} шт.`,         icon: "TrendingUp",   color: "#22c55e" },
            { label: "Расход на 1 шт.",         value: `${avgRawPerUnit} м²`,        icon: "Gauge",        color: "#3b82f6" },
            { label: "Лучшее место",            value: bestPlace?.name.split("—")[0].trim() ?? "—", icon: "Star",   color: "#16a34a" },
            { label: "Проблемное место",        value: worstPlace?.name.split("—")[0].trim() ?? "—", icon: "AlertTriangle", color: "#dc2626" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#ebebeb] rounded-xl px-4 py-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + "18" }}>
                <Icon name={s.icon as never} size={16} style={{ color: s.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-[18px] font-semibold text-[#1a1a1a] leading-tight truncate">{s.value}</p>
                <p className="text-[11px] text-[#9b9b9b] mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Строка: эффективность мест + перерасход ── */}
        <div className="grid grid-cols-2 gap-4">

          {/* Эффективность по местам */}
          <div className="bg-white border border-[#ebebeb] rounded-xl p-4">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-3">Эффективность мест</p>
            <div className="space-y-2.5">
              {placeEff.length === 0 && (
                <p className="text-[13px] text-[#9b9b9b]">Нет данных</p>
              )}
              {placeEff.map(p => {
                const c = effColor(Math.abs(p.pct));
                const label = Math.abs(p.pct) <= 2 ? "Норм" : Math.abs(p.pct) <= 8 ? "Средне" : "Перерасход";
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-[#1a1a1a] truncate">{p.name}</p>
                      <p className="text-[10px] text-[#b5b5b5]">{p.totalP} шт. · {p.rowCount} записей</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-24 h-1.5 rounded-full bg-[#f0f0f0] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.abs(p.pct) * 10)}%`, backgroundColor: c }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold w-14 text-right" style={{ color: c }}>
                        {p.pct > 0 ? "+" : ""}{p.pct}%
                      </span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: c, backgroundColor: c + "18" }}
                      >
                        {label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Перерасход */}
          <div className="bg-white border border-[#ebebeb] rounded-xl p-4">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-3">Плановый vs Фактический расход</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-[#f5f5f5]">
                <span className="text-[13px] text-[#6b6b6b]">По норме</span>
                <span className="text-[15px] font-semibold text-[#1a1a1a]">{planRaw} м²</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#f5f5f5]">
                <span className="text-[13px] text-[#6b6b6b]">Фактически</span>
                <span className="text-[15px] font-semibold text-[#1a1a1a]">{totalRaw} м²</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[13px] text-[#6b6b6b]">Отклонение</span>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[15px] font-bold"
                    style={{ color: overrun > 0 ? "#dc2626" : "#16a34a" }}
                  >
                    {overrun > 0 ? "+" : ""}{overrun} м²
                  </span>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      color:           overrun > 0 ? "#dc2626" : "#16a34a",
                      backgroundColor: overrun > 0 ? "#fef2f2" : "#f0fdf4",
                    }}
                  >
                    {overrunPct > 0 ? "+" : ""}{overrunPct}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ТОП / ПРОБЛЕМЫ ── */}
        <div className="grid grid-cols-2 gap-4">

          {/* Лучшие сотрудники */}
          <div className="bg-white border border-[#ebebeb] rounded-xl p-4">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-3">Лучшие сотрудники</p>
            {topEmployees.length === 0
              ? <p className="text-[13px] text-[#9b9b9b]">Нет данных</p>
              : topEmployees.map((e, i) => {
                const c = effColor(Math.abs(e.avgDev));
                return (
                  <div key={e.id} className={`flex items-center gap-3 py-2 ${i < topEmployees.length - 1 ? "border-b border-[#f5f5f5]" : ""}`}>
                    <span className="text-[12px] font-bold text-[#c0c0c0] w-4">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-[13px] font-medium text-[#1a1a1a]">{e.name}</p>
                      <p className="text-[11px] text-[#9b9b9b]">{e.totalP} шт. произведено</p>
                    </div>
                    <span className="text-[12px] font-semibold" style={{ color: c }}>
                      {e.avgDev > 0 ? "+" : ""}{e.avgDev}% расход
                    </span>
                  </div>
                );
              })
            }
          </div>

          {/* Перерасход по местам */}
          <div className="bg-white border border-[#ebebeb] rounded-xl p-4">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-3">Где перерасход</p>
            {overrunEmployees.length === 0
              ? (
                <div className="flex items-center gap-2 text-[13px] text-[#16a34a]">
                  <Icon name="CheckCircle" size={15} />
                  Перерасхода не обнаружено
                </div>
              )
              : overrunEmployees.map((e, i) => (
                <div key={e.id} className={`flex items-center gap-3 py-2 ${i < overrunEmployees.length - 1 ? "border-b border-[#f5f5f5]" : ""}`}>
                  <Icon name="AlertTriangle" size={14} className="text-[#dc2626] shrink-0" />
                  <div className="flex-1">
                    <p className="text-[13px] font-medium text-[#1a1a1a]">{e.name}</p>
                    <p className="text-[11px] text-[#9b9b9b]">{e.totalP} шт.</p>
                  </div>
                  <span className="text-[12px] font-semibold text-[#dc2626]">+{e.avgDev}%</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* ── Таблица строк ── */}
        <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#f0f0f0] flex items-center gap-2">
            <Icon name="Table" size={13} className="text-[#9b9b9b]" />
            <span className="text-[12px] font-semibold text-[#4b4b4b]">Детализация</span>
            <span className="ml-auto text-[11px] text-[#b5b5b5]">{rows.length} записей</span>
          </div>
          {rows.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px] text-[#b5b5b5]">Нет данных по заданным фильтрам</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f0f0f0]">
                    {["Дата", "Место", "Станок", "Сотрудник", "Тип заготовки", "Размер", "Кол-во", "Расход", "На 1 шт.", "Откл."].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const dc      = deviationColor(r.deviation);
                    const isLast  = i === rows.length - 1;
                    return (
                      <tr key={`${r.shiftId}-${i}`} className={`hover:bg-[#fafafa] transition-colors ${!isLast ? "border-b border-[#f8f8f8]" : ""}`}>
                        <td className="px-3 py-2.5 text-[11px] font-mono text-[#9b9b9b] whitespace-nowrap">{r.date}</td>
                        <td className="px-3 py-2.5 text-[12px] text-[#4b4b4b] whitespace-nowrap max-w-[160px] truncate">{r.placeName}</td>
                        <td className="px-3 py-2.5 text-[11px] text-[#9b9b9b] whitespace-nowrap">{r.machine}</td>
                        <td className="px-3 py-2.5">
                          <span className="text-[11px] bg-[#f5f5f5] text-[#4b4b4b] px-2 py-0.5 rounded-md whitespace-nowrap">{r.employeeName}</span>
                        </td>
                        <td className="px-3 py-2.5 text-[12px] font-medium text-[#1a1a1a] whitespace-nowrap">{r.blankName}</td>
                        <td className="px-3 py-2.5 text-[11px] font-mono text-[#9b9b9b] whitespace-nowrap">{r.blankSize}</td>
                        <td className="px-3 py-2.5 text-[13px] font-semibold text-[#1a1a1a] whitespace-nowrap">{r.produced} шт.</td>
                        <td className="px-3 py-2.5 text-[12px] font-semibold text-[#f59e0b] whitespace-nowrap">{r.rawUsed} м²</td>
                        <td className="px-3 py-2.5 text-[12px] text-[#6b6b6b] whitespace-nowrap">{r.actualPerUnit} м²</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ color: dc.color, backgroundColor: dc.bg }}
                          >
                            {r.deviation > 0 ? "+" : ""}{r.deviation}%
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
    </div>
  );
}
