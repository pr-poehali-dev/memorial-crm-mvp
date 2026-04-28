import { useState } from "react";
import Icon from "@/components/ui/icon";

/* ─── Типы ─── */
type WorkType = "cutting" | "engraving" | "polishing";

type Place = {
  id: string;
  name: string;       // "Место 1 — Ленточная пила"
  machine: string;    // тип станка
  workTypes: WorkType[];
};

type Employee = { id: string; name: string };

type BlankType = {
  id: string;
  name: string;
  size: string;
  material: string;
  rawPerUnit: number; // м² на 1 шт
};

type ShiftResult = {
  blankTypeId: string;
  produced: number;
  rawAuto: boolean;
  rawUsed: number;
  orderId?: string; // "МП-0001" | "stock"
};

type Shift = {
  id: string;
  placeId: string;
  employeeId: string;
  workType: WorkType;
  date: string;
  status: "active" | "done";
  results: ShiftResult[];
  startedAt: string;
  finishedAt?: string;
};

/* ─── Данные ─── */
const PLACES: Place[] = [
  { id: "p1", name: "Место 1 — Ленточная пила",  machine: "Ленточная пила",  workTypes: ["cutting"] },
  { id: "p2", name: "Место 2 — Дисковая пила",   machine: "Дисковая пила",   workTypes: ["cutting"] },
  { id: "p3", name: "Место 3 — ЧПУ гравировка",  machine: "ЧПУ станок",      workTypes: ["engraving"] },
  { id: "p4", name: "Место 4 — Полировка",        machine: "Полировальная",   workTypes: ["polishing"] },
];

const EMPLOYEES: Employee[] = [
  { id: "e1", name: "Игорь В." },
  { id: "e2", name: "Павел Н." },
  { id: "e3", name: "Дмитрий С." },
];

const BLANK_TYPES: BlankType[] = [
  { id: "bt1", name: "Плита стандарт",     size: "100×50×8",  material: "Гранит чёрный",  rawPerUnit: 0.50 },
  { id: "bt2", name: "Плита большая",      size: "120×60×10", material: "Гранит серый",   rawPerUnit: 0.72 },
  { id: "bt3", name: "Плита малая",        size: "80×40×6",   material: "Мрамор белый",   rawPerUnit: 0.32 },
  { id: "bt4", name: "Плита красн. гран.", size: "90×45×7",   material: "Гранит красный", rawPerUnit: 0.41 },
  { id: "bt5", name: "Тумба",              size: "60×30×80",  material: "Гранит чёрный",  rawPerUnit: 1.44 },
];

const ORDERS = ["МП-0038", "МП-0040", "МП-0042", "МП-0045", "На склад"];

const WORK_LABELS: Record<WorkType, string> = {
  cutting:   "Распил",
  engraving: "Гравировка",
  polishing: "Полировка",
};

const today = new Date().toLocaleDateString("ru-RU").replace(/\//g, ".");

const initShifts: Shift[] = [
  {
    id: "s1", placeId: "p1", employeeId: "e1", workType: "cutting",
    date: today, status: "active", startedAt: "08:00",
    results: [],
  },
  {
    id: "s2", placeId: "p2", employeeId: "e2", workType: "cutting",
    date: today, status: "done", startedAt: "08:00", finishedAt: "17:00",
    results: [
      { blankTypeId: "bt1", produced: 4, rawAuto: true, rawUsed: 2.0,  orderId: "МП-0040" },
      { blankTypeId: "bt5", produced: 2, rawAuto: true, rawUsed: 2.88, orderId: "На склад" },
    ],
  },
  {
    id: "s3", placeId: "p1", employeeId: "e1", workType: "cutting",
    date: "27.04.2026", status: "done", startedAt: "08:00", finishedAt: "16:30",
    results: [
      { blankTypeId: "bt2", produced: 3, rawAuto: true, rawUsed: 2.16, orderId: "МП-0038" },
    ],
  },
  {
    id: "s4", placeId: "p2", employeeId: "e2", workType: "cutting",
    date: "26.04.2026", status: "done", startedAt: "08:00", finishedAt: "17:00",
    results: [
      { blankTypeId: "bt4", produced: 2, rawAuto: true, rawUsed: 0.82, orderId: "На склад" },
    ],
  },
];

/* ─── Стили ─── */
const selectCls = "w-full bg-white border border-[#e0e0e0] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1a1a1a] outline-none focus:border-[#b0b0b0] transition-colors";
const inputCls  = "w-full bg-white border border-[#e0e0e0] rounded-[10px] px-3 py-2.5 text-[14px] text-[#1a1a1a] outline-none focus:border-[#b0b0b0] transition-colors placeholder:text-[#c0c0c0]";
const labelCls  = "block mb-1.5 text-[13px] font-medium text-[#4b4b4b]";

/* ─── Вспомогалки ─── */
function shiftTotalRaw(s: Shift) {
  return +s.results.reduce((a, r) => a + r.rawUsed, 0).toFixed(2);
}
function shiftTotalProduced(s: Shift) {
  return s.results.reduce((a, r) => a + r.produced, 0);
}
function efficiency(s: Shift): "good" | "medium" | "low" {
  const total = shiftTotalProduced(s);
  if (total >= 5) return "good";
  if (total >= 2) return "medium";
  return "low";
}
const EFF_COLOR: Record<string, string> = {
  good:   "#16a34a",
  medium: "#d97706",
  low:    "#dc2626",
};
const EFF_BG: Record<string, string> = {
  good:   "#f0fdf4",
  medium: "#fffbeb",
  low:    "#fef2f2",
};
const EFF_LABEL: Record<string, string> = {
  good:   "Норм",
  medium: "Средне",
  low:    "Мало",
};

/* ─── Пустая строка результата ─── */
function emptyResult(): ShiftResult {
  const bt = BLANK_TYPES[0];
  return { blankTypeId: bt.id, produced: 1, rawAuto: true, rawUsed: bt.rawPerUnit };
}

/* ═══════════════════════════════════════════════ */
export default function CuttingPage() {
  const [shifts, setShifts] = useState<Shift[]>(initShifts);

  /* Модалки */
  const [assignModal, setAssignModal] = useState(false);
  const [finishShiftId, setFinishShiftId] = useState<string | null>(null);

  /* Форма назначения */
  const [fPlace,    setFPlace]    = useState(PLACES[0].id);
  const [fEmployee, setFEmployee] = useState(EMPLOYEES[0].id);
  const [fWorkType, setFWorkType] = useState<WorkType>("cutting");
  const [fDate,     setFDate]     = useState(today);

  /* Форма завершения */
  const [fResults, setFResults] = useState<ShiftResult[]>([emptyResult()]);

  /* ── Назначить смену ── */
  const handleAssign = () => {
    const newShift: Shift = {
      id: "s" + Date.now(),
      placeId: fPlace,
      employeeId: fEmployee,
      workType: fWorkType,
      date: fDate,
      status: "active",
      startedAt: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      results: [],
    };
    setShifts(prev => [newShift, ...prev]);
    setAssignModal(false);
    setFPlace(PLACES[0].id);
    setFEmployee(EMPLOYEES[0].id);
    setFWorkType("cutting");
    setFDate(today);
  };

  /* ── Завершить смену ── */
  const handleFinish = () => {
    if (!finishShiftId) return;
    setShifts(prev => prev.map(s => s.id === finishShiftId ? {
      ...s,
      status: "done",
      finishedAt: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      results: fResults,
    } : s));
    setFinishShiftId(null);
    setFResults([emptyResult()]);
  };

  /* ── Изменить строку результата ── */
  const updateResult = (idx: number, patch: Partial<ShiftResult>) => {
    setFResults(prev => prev.map((r, i) => {
      if (i !== idx) return r;
      const merged = { ...r, ...patch };
      if (("blankTypeId" in patch || "produced" in patch) && merged.rawAuto) {
        const bt = BLANK_TYPES.find(b => b.id === merged.blankTypeId)!;
        merged.rawUsed = +(bt.rawPerUnit * merged.produced).toFixed(2);
      }
      return merged;
    }));
  };

  const activeShifts = shifts.filter(s => s.status === "active");
  const doneShifts   = shifts.filter(s => s.status === "done");

  const todayDone  = doneShifts.filter(s => s.date === today);
  const totalToday = todayDone.reduce((a, s) => a + shiftTotalProduced(s), 0);
  const rawToday   = todayDone.reduce((a, s) => a + shiftTotalRaw(s), 0);

  /* группировка журнала по датам */
  const allDates = [...new Set(doneShifts.map(s => s.date))].sort((a, b) => {
    const parse = (d: string) => d.split(".").reverse().join("-");
    return parse(b).localeCompare(parse(a));
  });

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto">
      <div className="p-7 max-w-[1100px] mx-auto w-full space-y-6">

        {/* ── Шапка ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[21px] font-semibold text-[#1a1a1a] tracking-tight">Заготовки / Распил</h1>
            <p className="text-[13px] text-[#9b9b9b] mt-0.5">Учёт смен, производства заготовок и расхода сырья</p>
          </div>
          <button
            onClick={() => setAssignModal(true)}
            className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[14px] font-semibold px-5 py-2.5 rounded-[10px] hover:bg-[#333] active:scale-[0.98] transition-all shrink-0 shadow-sm"
          >
            <Icon name="Plus" size={16} />
            Назначить смену
          </button>
        </div>

        {/* ── Статистика за сегодня ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Активных смен",      value: String(activeShifts.length), icon: "Play",        color: "#22c55e" },
            { label: "Заготовок сегодня",  value: String(totalToday),          icon: "Layers",      color: "#f59e0b" },
            { label: "Сырья сегодня (м²)", value: rawToday.toFixed(1),         icon: "Package",     color: "#6366f1" },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#ebebeb] rounded-xl px-4 py-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + "18" }}>
                <Icon name={s.icon as never} size={15} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-[19px] font-semibold text-[#1a1a1a] leading-none mb-0.5">{s.value}</p>
                <p className="text-[11px] text-[#9b9b9b]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Активные смены ── */}
        {activeShifts.length > 0 && (
          <div>
            <p className="text-[12px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-3">Активные смены сегодня</p>
            <div className="grid grid-cols-2 gap-3">
              {activeShifts.map(s => {
                const place    = PLACES.find(p => p.id === s.placeId)!;
                const employee = EMPLOYEES.find(e => e.id === s.employeeId)!;
                return (
                  <div key={s.id} className="bg-white border border-[#e0e0e0] rounded-xl p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#22c55e18] flex items-center justify-center shrink-0">
                      <Icon name="Play" size={18} style={{ color: "#22c55e" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#1a1a1a] truncate">{place.name}</p>
                      <p className="text-[12px] text-[#6b6b6b]">{employee.name} · {WORK_LABELS[s.workType]} · с {s.startedAt}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-semibold text-[#22c55e] bg-[#f0fdf4] border border-[#bbf7d0] px-2 py-1 rounded-full">
                        В работе
                      </span>
                      <button
                        onClick={() => { setFinishShiftId(s.id); setFResults([emptyResult()]); }}
                        className="text-[13px] font-semibold bg-[#1a1a1a] text-white px-3 py-1.5 rounded-[8px] hover:bg-[#333] transition-colors"
                      >
                        Завершить
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Завершённые смены (сегодня) ── */}
        {todayDone.length > 0 && (
          <div>
            <p className="text-[12px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-3">Завершено сегодня</p>
            <div className="grid grid-cols-2 gap-3">
              {todayDone.map(s => {
                const place    = PLACES.find(p => p.id === s.placeId)!;
                const employee = EMPLOYEES.find(e => e.id === s.employeeId)!;
                const eff      = efficiency(s);
                const totalP   = shiftTotalProduced(s);
                const totalR   = shiftTotalRaw(s);
                return (
                  <div key={s.id} className="bg-white border border-[#ebebeb] rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-[#1a1a1a] truncate">{place.name}</p>
                        <p className="text-[12px] text-[#6b6b6b]">{employee.name} · {s.startedAt}–{s.finishedAt}</p>
                      </div>
                      <span
                        className="text-[11px] font-semibold px-2 py-1 rounded-full shrink-0"
                        style={{ color: EFF_COLOR[eff], backgroundColor: EFF_BG[eff] }}
                      >
                        {EFF_LABEL[eff]}
                      </span>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {s.results.map((r, i) => {
                        const bt = BLANK_TYPES.find(b => b.id === r.blankTypeId)!;
                        return (
                          <div key={i} className="flex items-center justify-between text-[12px]">
                            <span className="text-[#4b4b4b]">{bt.name} <span className="text-[#b5b5b5]">({bt.size})</span></span>
                            <span className="font-semibold text-[#1a1a1a]">{r.produced} шт.</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-3 pt-2 border-t border-[#f5f5f5] text-[12px] text-[#6b6b6b]">
                      <span>Итого: <b className="text-[#1a1a1a]">{totalP} шт.</b></span>
                      <span>Сырьё: <b className="text-[#f59e0b]">{totalR} м²</b></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Журнал смен (прошлые дни) ── */}
        {allDates.filter(d => d !== today).length > 0 && (
          <div>
            <p className="text-[12px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-3">Журнал смен</p>
            <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
              {allDates.filter(d => d !== today).map((date, di) => {
                const dayShifts = doneShifts.filter(s => s.date === date);
                const dayP = dayShifts.reduce((a, s) => a + shiftTotalProduced(s), 0);
                const dayR = dayShifts.reduce((a, s) => a + shiftTotalRaw(s), 0);
                return (
                  <div key={date} className={di > 0 ? "border-t border-[#f0f0f0]" : ""}>
                    {/* Заголовок дня */}
                    <div className="px-4 py-2.5 bg-[#fafafa] flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-[#4b4b4b]">{date}</span>
                      <span className="text-[11px] text-[#9b9b9b]">
                        {dayP} шт. · {dayR.toFixed(1)} м²
                      </span>
                    </div>
                    {/* Строки смен */}
                    <table className="w-full">
                      <tbody>
                        {dayShifts.map((s, si) => {
                          const place    = PLACES.find(p => p.id === s.placeId)!;
                          const employee = EMPLOYEES.find(e => e.id === s.employeeId)!;
                          return s.results.map((r, ri) => {
                            const bt  = BLANK_TYPES.find(b => b.id === r.blankTypeId)!;
                            const isLast = si === dayShifts.length - 1 && ri === s.results.length - 1;
                            return (
                              <tr key={`${s.id}-${ri}`} className={`hover:bg-[#fafafa] transition-colors ${!isLast ? "border-b border-[#f8f8f8]" : ""}`}>
                                <td className="px-4 py-2.5 text-[12px] text-[#6b6b6b] w-[200px]">{place.name}</td>
                                <td className="px-4 py-2.5 text-[12px] text-[#4b4b4b]">{employee.name}</td>
                                <td className="px-4 py-2.5 text-[12px] text-[#1a1a1a]">{bt.name}</td>
                                <td className="px-4 py-2.5 text-[11px] font-mono text-[#9b9b9b]">{bt.size}</td>
                                <td className="px-4 py-2.5 text-[13px] font-semibold text-[#1a1a1a] text-right">{r.produced} шт.</td>
                                <td className="px-4 py-2.5 text-[12px] text-[#f59e0b] font-semibold text-right pr-5">{r.rawUsed} м²</td>
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
          </div>
        )}

      </div>

      {/* ════════════════════════════════════════════
          Модалка: Назначить смену
      ════════════════════════════════════════════ */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
          onClick={() => setAssignModal(false)}>
          <div className="bg-white rounded-2xl border border-[#ebebeb] shadow-2xl p-6 w-full max-w-[440px]"
            onClick={e => e.stopPropagation()}>

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#22c55e18] flex items-center justify-center">
                  <Icon name="CalendarPlus" size={18} style={{ color: "#22c55e" }} />
                </div>
                <h2 className="text-[16px] font-semibold text-[#1a1a1a]">Назначить смену</h2>
              </div>
              <button onClick={() => setAssignModal(false)} className="text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Место</label>
                <select value={fPlace} onChange={e => setFPlace(e.target.value)} className={selectCls}>
                  {PLACES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Сотрудник</label>
                <select value={fEmployee} onChange={e => setFEmployee(e.target.value)} className={selectCls}>
                  {EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Тип работы</label>
                <div className="flex gap-2">
                  {(["cutting", "engraving", "polishing"] as WorkType[]).map(wt => (
                    <button
                      key={wt}
                      onClick={() => setFWorkType(wt)}
                      className={`flex-1 py-2 rounded-[8px] text-[13px] font-medium border transition-all
                        ${fWorkType === wt ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "bg-white text-[#6b6b6b] border-[#e0e0e0] hover:border-[#b0b0b0]"}`}
                    >
                      {WORK_LABELS[wt]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Дата</label>
                <input type="text" value={fDate} onChange={e => setFDate(e.target.value)}
                  placeholder={today} className={inputCls} />
              </div>
            </div>

            <button
              onClick={handleAssign}
              className="mt-5 w-full bg-[#22c55e] text-white text-[14px] font-semibold py-3 rounded-[10px] hover:bg-[#16a34a] active:scale-[0.98] transition-all"
            >
              Открыть смену
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          Модалка: Завершить смену
      ════════════════════════════════════════════ */}
      {finishShiftId && (() => {
        const shift    = shifts.find(s => s.id === finishShiftId)!;
        const place    = PLACES.find(p => p.id === shift.placeId)!;
        const employee = EMPLOYEES.find(e => e.id === shift.employeeId)!;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
            onClick={() => setFinishShiftId(null)}>
            <div className="bg-white rounded-2xl border border-[#ebebeb] shadow-2xl w-full max-w-[540px] max-h-[90vh] flex flex-col"
              onClick={e => e.stopPropagation()}>

              {/* Шапка модалки */}
              <div className="flex items-center justify-between p-6 pb-4 border-b border-[#f0f0f0]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#f59e0b18] flex items-center justify-center">
                    <Icon name="CheckSquare" size={18} style={{ color: "#f59e0b" }} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-[#1a1a1a]">Завершение смены</h2>
                    <p className="text-[12px] text-[#9b9b9b]">{place.name} · {employee.name}</p>
                  </div>
                </div>
                <button onClick={() => setFinishShiftId(null)} className="text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors">
                  <Icon name="X" size={18} />
                </button>
              </div>

              {/* Тело */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <p className="text-[13px] font-semibold text-[#4b4b4b]">Что сделали за смену</p>

                {fResults.map((r, idx) => {
                  const bt = BLANK_TYPES.find(b => b.id === r.blankTypeId)!;
                  const autoRaw = +(bt.rawPerUnit * r.produced).toFixed(2);
                  return (
                    <div key={idx} className="bg-[#fafafa] border border-[#f0f0f0] rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-[#6b6b6b]">Результат #{idx + 1}</span>
                        {fResults.length > 1 && (
                          <button onClick={() => setFResults(prev => prev.filter((_, i) => i !== idx))}
                            className="text-[#c0c0c0] hover:text-[#dc2626] transition-colors">
                            <Icon name="Trash2" size={14} />
                          </button>
                        )}
                      </div>

                      <div>
                        <label className={labelCls}>Тип заготовки</label>
                        <select
                          value={r.blankTypeId}
                          onChange={e => updateResult(idx, { blankTypeId: e.target.value })}
                          className={selectCls}
                        >
                          {BLANK_TYPES.map(b => (
                            <option key={b.id} value={b.id}>{b.name} ({b.size})</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className={labelCls}>Количество (шт.)</label>
                          <input
                            type="number" min="1" step="1"
                            value={r.produced}
                            onChange={e => updateResult(idx, { produced: Math.max(1, parseInt(e.target.value) || 1) })}
                            className={inputCls}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[13px] font-medium text-[#4b4b4b]">Расход сырья (м²)</label>
                            <button
                              onClick={() => updateResult(idx, { rawAuto: !r.rawAuto, rawUsed: r.rawAuto ? r.rawUsed : autoRaw })}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all
                                ${r.rawAuto ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" : "bg-white text-[#6b6b6b] border-[#e0e0e0]"}`}
                            >
                              {r.rawAuto ? "авто" : "вручную"}
                            </button>
                          </div>
                          <input
                            type="number" min="0" step="0.01"
                            value={r.rawUsed}
                            readOnly={r.rawAuto}
                            onChange={e => !r.rawAuto && updateResult(idx, { rawUsed: parseFloat(e.target.value) || 0 })}
                            className={inputCls + (r.rawAuto ? " bg-[#f5f5f5] text-[#9b9b9b] cursor-default" : "")}
                          />
                        </div>
                      </div>

                      {r.rawAuto && (
                        <div className="text-[11px] text-[#9b9b9b]">
                          {bt.rawPerUnit} м²/шт. × {r.produced} шт. = <b className="text-[#f59e0b]">{autoRaw} м²</b>
                        </div>
                      )}

                      <div>
                        <label className={labelCls}>Для какого заказа</label>
                        <select
                          value={r.orderId ?? "На склад"}
                          onChange={e => updateResult(idx, { orderId: e.target.value })}
                          className={selectCls}
                        >
                          {ORDERS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={() => setFResults(prev => [...prev, emptyResult()])}
                  className="w-full py-2.5 border border-dashed border-[#d0d0d0] rounded-xl text-[13px] text-[#9b9b9b] hover:text-[#4b4b4b] hover:border-[#9b9b9b] transition-all"
                >
                  + Добавить ещё результат
                </button>

                {/* Итого */}
                {fResults.length > 0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex gap-6 text-[13px]">
                    <span className="text-[#4b4b4b]">Итого заготовок: <b className="text-[#1a1a1a]">{fResults.reduce((a, r) => a + r.produced, 0)} шт.</b></span>
                    <span className="text-[#4b4b4b]">Сырьё: <b className="text-[#f59e0b]">{fResults.reduce((a, r) => a + r.rawUsed, 0).toFixed(2)} м²</b></span>
                  </div>
                )}
              </div>

              {/* Кнопка */}
              <div className="p-6 pt-4 border-t border-[#f0f0f0]">
                <button
                  onClick={handleFinish}
                  disabled={fResults.some(r => r.produced <= 0)}
                  className="w-full bg-[#1a1a1a] text-white text-[14px] font-semibold py-3 rounded-[10px] hover:bg-[#333] active:scale-[0.98] transition-all disabled:opacity-40"
                >
                  Завершить смену
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
