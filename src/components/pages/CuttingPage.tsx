import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  Shift, ShiftResult, WorkType,
  PLACES, EMPLOYEES, BLANK_TYPES,
  initShifts, today, emptyResult,
  shiftTotalProduced, shiftTotalRaw,
} from "./cutting/cutting.types";
import CuttingShiftCards from "./cutting/CuttingShiftCards";
import CuttingJournal from "./cutting/CuttingJournal";
import { AssignModal, FinishModal } from "./cutting/CuttingModals";

export default function CuttingPage() {
  const [shifts, setShifts] = useState<Shift[]>(initShifts);

  /* Модалки */
  const [assignModal,   setAssignModal]   = useState(false);
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
  const todayDone    = doneShifts.filter(s => s.date === today);
  const totalToday   = todayDone.reduce((a, s) => a + shiftTotalProduced(s), 0);
  const rawToday     = todayDone.reduce((a, s) => a + shiftTotalRaw(s), 0);

  const finishShift  = finishShiftId ? shifts.find(s => s.id === finishShiftId) ?? null : null;

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
            { label: "Активных смен",      value: String(activeShifts.length), icon: "Play",    color: "#22c55e" },
            { label: "Заготовок сегодня",  value: String(totalToday),          icon: "Layers",  color: "#f59e0b" },
            { label: "Сырья сегодня (м²)", value: rawToday.toFixed(1),         icon: "Package", color: "#6366f1" },
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

        {/* ── Карточки смен ── */}
        <CuttingShiftCards
          activeShifts={activeShifts}
          todayDone={todayDone}
          onFinishClick={(id) => { setFinishShiftId(id); setFResults([emptyResult()]); }}
        />

        {/* ── Журнал ── */}
        <CuttingJournal doneShifts={doneShifts} />

      </div>

      {/* ── Модалка: назначить ── */}
      {assignModal && (
        <AssignModal
          fPlace={fPlace}
          fEmployee={fEmployee}
          fWorkType={fWorkType}
          fDate={fDate}
          today={today}
          onChangePlace={setFPlace}
          onChangeEmployee={setFEmployee}
          onChangeWorkType={setFWorkType}
          onChangeDate={setFDate}
          onAssign={handleAssign}
          onClose={() => setAssignModal(false)}
        />
      )}

      {/* ── Модалка: завершить ── */}
      {finishShift && (
        <FinishModal
          shift={finishShift}
          fResults={fResults}
          onUpdateResult={updateResult}
          onAddResult={() => setFResults(prev => [...prev, emptyResult()])}
          onRemoveResult={(idx) => setFResults(prev => prev.filter((_, i) => i !== idx))}
          onFinish={handleFinish}
          onClose={() => setFinishShiftId(null)}
        />
      )}
    </div>
  );
}
