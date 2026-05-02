import { useState, useEffect, useMemo } from "react";
import Icon from "@/components/ui/icon";
import {
  Shift, ShiftResult, WorkType,
  PLACES, EMPLOYEES, BLANK_TYPES,
  today, yesterday, emptyResult,
  shiftTotalProduced, shiftTotalRaw,
} from "./cutting/cutting.types";
import { cuttingApi, DbShift, DbPlace, DbEmployee, DbBlankType } from "@/api/client";
import CuttingShiftCards from "./cutting/CuttingShiftCards";
import { ActiveColumn, DoneColumn } from "./cutting/CuttingShiftCards";
import CuttingJournal from "./cutting/CuttingJournal";
import CuttingTaskBlock from "./cutting/CuttingTaskBlock";
import { AssignModal, FinishModal } from "./cutting/CuttingModals";
import { useTasks } from "@/store/tasksStore";

type Tab = "today" | "yesterday" | "journal";

function dbToShift(s: DbShift): Shift {
  return {
    id: String(s.id),
    placeId: String(s.place_id),
    employeeId: String(s.employee_id),
    workType: s.work_type as WorkType,
    date: s.shift_date?.substring(0,10) || today,
    status: s.status as "active"|"done",
    startedAt: s.started_at?.substring(0,5) || "08:00",
    finishedAt: s.finished_at?.substring(0,5),
    taskId: s.task_id ? String(s.task_id) : undefined,
    taskQtyAssigned: s.task_qty_assigned || undefined,
    results: (s.results || []).map(r => ({
      blankTypeId: String(r.blank_type_id),
      produced: r.produced,
      rawAuto: true,
      rawUsed: Number(r.raw_used),
      orderId: r.order_ref || undefined,
    })),
  };
}

export default function CuttingPage() {
  const [tab,    setTab]    = useState<Tab>("today");
  const [shifts, setShifts] = useState<Shift[]>([]);

  useEffect(() => {
    cuttingApi.shifts().then(data => setShifts(data.map(dbToShift))).catch(console.error);
  }, []);
  const { updateTask, tasks } = useTasks();

  /* Модалки */
  const [assignModal,   setAssignModal]   = useState(false);
  const [finishShiftId, setFinishShiftId] = useState<string | null>(null);

  /* Форма назначения */
  const [fPlace,    setFPlace]    = useState(PLACES[0].id);
  const [fEmployee, setFEmployee] = useState(EMPLOYEES[0].id);
  const [fWorkType, setFWorkType] = useState<WorkType>("cutting");
  const [fDate,     setFDate]     = useState(today);
  const [fTaskId,   setFTaskId]   = useState("");
  const [fTaskQty,  setFTaskQty]  = useState("");

  /* Форма завершения */
  const [fResults, setFResults] = useState<ShiftResult[]>([emptyResult()]);

  /* ── Назначить смену ── */
  const handleAssign = () => {
    const taskQtyNum = parseInt(fTaskQty) || 0;
    const newShift: Shift = {
      id: "s" + Date.now(),
      placeId: fPlace,
      employeeId: fEmployee,
      workType: fWorkType,
      date: fDate,
      status: "active",
      startedAt: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      results: [],
      taskId: fTaskId || undefined,
      taskQtyAssigned: fTaskId && taskQtyNum > 0 ? taskQtyNum : undefined,
    };
    setShifts(prev => [newShift, ...prev]);

    /* Обновляем задачу: увеличиваем inProgressQty */
    if (fTaskId && taskQtyNum > 0) {
      updateTask(fTaskId, prev => ({
        inProgressQty: prev.inProgressQty + taskQtyNum,
        status: "active" as const,
      }));
    }

    setAssignModal(false);
    setFPlace(PLACES[0].id);
    setFEmployee(EMPLOYEES[0].id);
    setFWorkType("cutting");
    setFDate(today);
    setFTaskId("");
    setFTaskQty("");
  };

  /* ── Завершить смену ── */
  const handleFinish = () => {
    if (!finishShiftId) return;
    const shift = shifts.find(s => s.id === finishShiftId);

    setShifts(prev => prev.map(s => s.id === finishShiftId ? {
      ...s,
      status: "done",
      finishedAt: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
      results: fResults,
    } : s));

    /* Обновляем прогресс задачи */
    if (shift?.taskId) {
      const produced = fResults.reduce((a, r) => a + r.produced, 0);
      const assigned = shift.taskQtyAssigned ?? 0;
      updateTask(shift.taskId, prev => {
        const newDone       = prev.doneQty + produced;
        const newInProgress = Math.max(0, prev.inProgressQty - assigned);
        const isDone        = newDone >= prev.totalQty;
        return {
          doneQty:       newDone,
          inProgressQty: newInProgress,
          status:        isDone ? "done" as const : "active" as const,
        };
      });
    }

    setFinishShiftId(null);
    setFResults([emptyResult()]);
  };

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

  /* ── Производные ── */
  const activeShifts  = shifts.filter(s => s.status === "active");
  const todayDone     = shifts.filter(s => s.status === "done" && s.date === today);
  const yesterdayDone = shifts.filter(s => s.status === "done" && s.date === yesterday);
  const allDone       = shifts.filter(s => s.status === "done");

  const totalTodayP  = todayDone.reduce((a, s)  => a + shiftTotalProduced(s), 0);
  const totalTodayR  = todayDone.reduce((a, s)  => a + shiftTotalRaw(s), 0);

  const finishShift = finishShiftId ? shifts.find(s => s.id === finishShiftId) ?? null : null;

  /* ── Статы для вчера ── */
  const ydP = yesterdayDone.reduce((a, s) => a + shiftTotalProduced(s), 0);
  const ydR = yesterdayDone.reduce((a, s) => a + shiftTotalRaw(s), 0);

  const TABS: { key: Tab; label: string }[] = [
    { key: "today",     label: "Сегодня"    },
    { key: "yesterday", label: "Вчера"      },
    { key: "journal",   label: "Журнал смен" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Sticky шапка ── */}
      <div className="shrink-0 bg-[#fafafa] border-b border-[#ebebeb] px-7 pt-5 pb-0">

        {/* Строка 1: заголовок + кнопка */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-semibold text-[#1a1a1a] tracking-tight">Заготовки</h1>
          <button
            onClick={() => setAssignModal(true)}
            className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[13px] font-semibold px-4 py-2.5 rounded-[10px] hover:bg-[#333] transition-all shrink-0"
          >
            <Icon name="Plus" size={15} />
            Назначить смену
          </button>
        </div>

        {/* Строка 2: компактные метрики */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 bg-[#f4f4f4] rounded-lg px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] shrink-0" />
            <span className="text-[13px] text-[#4b4b4b]">Активных: <b className="text-[#1a1a1a]">{activeShifts.length}</b></span>
          </div>
          <div className="flex items-center gap-2 bg-[#f4f4f4] rounded-lg px-3 py-1.5">
            <Icon name="Layers" size={12} className="text-[#9b9b9b]" />
            <span className="text-[13px] text-[#4b4b4b]">Заготовок сегодня: <b className="text-[#1a1a1a]">{totalTodayP} шт.</b></span>
          </div>
          <div className="flex items-center gap-2 bg-[#f4f4f4] rounded-lg px-3 py-1.5">
            <Icon name="Package" size={12} className="text-[#9b9b9b]" />
            <span className="text-[13px] text-[#4b4b4b]">Сырьё: <b className="text-[#1a1a1a]">{totalTodayR.toFixed(1)} м²</b></span>
          </div>
        </div>

        {/* Вкладки */}
        <div className="flex gap-0">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 text-[13px] font-medium border-b-2 transition-all
                ${tab === t.key
                  ? "border-[#1a1a1a] text-[#1a1a1a]"
                  : "border-transparent text-[#9b9b9b] hover:text-[#4b4b4b]"}`}
            >
              {t.label}
              {t.key === "today" && activeShifts.length > 0 && (
                <span className="ml-1.5 text-[10px] font-bold text-[#22c55e] bg-[#f0fdf4] px-1.5 py-px rounded-full">
                  {activeShifts.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Тело ── */}
      <div className="flex-1 overflow-hidden flex flex-col">

        {/* ════ Сегодня ════ */}
        {tab === "today" && (
          <div className="flex-1 overflow-hidden grid grid-cols-3 divide-x divide-[#f0f0f0]">

            {/* ── Колонка 1: ЗАДАЧИ ── */}
            <div className="flex flex-col overflow-hidden">
              <div className="shrink-0 px-5 py-3 border-b border-[#f0f0f0] flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#ede9fe] flex items-center justify-center shrink-0">
                  <Icon name="ClipboardList" size={11} className="text-[#6366f1]" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#6366f1]">Задачи</p>
                {tasks.filter(t => t.status !== "done").length > 0 && (
                  <span className="text-[10px] font-bold bg-[#6366f1] text-white px-1.5 py-px rounded-full">
                    {tasks.filter(t => t.status !== "done").length}
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <CuttingTaskBlock />
              </div>
            </div>

            {/* ── Колонка 2: АКТИВНЫЕ ── */}
            <div className="flex flex-col overflow-hidden">
              <div className="shrink-0 px-5 py-3 border-b border-[#f0f0f0] flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#dcfce7] flex items-center justify-center shrink-0">
                  <Icon name="Play" size={11} className="text-[#16a34a]" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#16a34a]">Активные</p>
                {activeShifts.length > 0 && (
                  <span className="text-[10px] font-bold bg-[#22c55e] text-white px-1.5 py-px rounded-full">
                    {activeShifts.length}
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <ActiveColumn
                  shifts={activeShifts}
                  onFinishClick={(id) => { setFinishShiftId(id); setFResults([emptyResult()]); }}
                />
              </div>
            </div>

            {/* ── Колонка 3: ЗАВЕРШЕНО ── */}
            <div className="flex flex-col overflow-hidden">
              <div className="shrink-0 px-5 py-3 border-b border-[#f0f0f0] flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#f4f4f4] flex items-center justify-center shrink-0">
                  <Icon name="CheckCheck" size={11} className="text-[#9b9b9b]" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#9b9b9b]">Завершено</p>
                {todayDone.length > 0 && (
                  <span className="text-[10px] font-bold bg-[#9b9b9b] text-white px-1.5 py-px rounded-full">
                    {todayDone.length}
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <DoneColumn shifts={todayDone} />
              </div>
            </div>

          </div>
        )}

        {/* ════ Вчера ════ */}
        {tab === "yesterday" && (
          <div className="flex-1 overflow-y-auto px-7 py-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Смен",          value: String(yesterdayDone.length), sub: null },
                { label: "Изделий",       value: `${ydP}`,                     sub: "шт." },
                { label: "Расход сырья",  value: `${ydR.toFixed(1)}`,          sub: "м²"  },
              ].map(s => (
                <div key={s.label} className="bg-[#f4f4f4] rounded-xl px-4 py-3 flex flex-col gap-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[24px] font-semibold text-[#1a1a1a] leading-none">{s.value}</span>
                    {s.sub && <span className="text-[13px] text-[#9b9b9b]">{s.sub}</span>}
                  </div>
                  <span className="text-[11px] text-[#9b9b9b]">{s.label}</span>
                </div>
              ))}
            </div>
            {yesterdayDone.length === 0 ? (
              <EmptyState text="Нет смен за вчера" />
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#c0c0c0]">Смены за {yesterday}</p>
                <CuttingShiftCards
                  activeShifts={[]}
                  todayDone={yesterdayDone}
                  onFinishClick={() => {}}
                  alwaysExpanded
                />
              </div>
            )}
          </div>
        )}

        {/* ════ Журнал ════ */}
        {tab === "journal" && (
          <div className="flex-1 overflow-y-auto px-7 py-5">
            <CuttingJournal doneShifts={allDone} />
          </div>
        )}
      </div>

      {/* ── Модалки ── */}
      {assignModal && (
        <AssignModal
          fPlace={fPlace}
          fEmployee={fEmployee}
          fWorkType={fWorkType}
          fDate={fDate}
          today={today}
          fTaskId={fTaskId}
          fTaskQty={fTaskQty}
          onChangePlace={setFPlace}
          onChangeEmployee={setFEmployee}
          onChangeWorkType={setFWorkType}
          onChangeDate={setFDate}
          onChangeTaskId={setFTaskId}
          onChangeTaskQty={setFTaskQty}
          onAssign={handleAssign}
          onClose={() => setAssignModal(false)}
        />
      )}
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

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#f4f4f4] flex items-center justify-center mb-3">
        <Icon name="CalendarX" size={22} className="text-[#c0c0c0]" />
      </div>
      <p className="text-[14px] text-[#b0b0b0]">{text}</p>
    </div>
  );
}