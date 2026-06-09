import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import {
  Shift, ShiftResult, WorkType, Place, Employee, BlankType, CuttingTask,
  today, emptyResultFromBt,
  shiftTotalProduced, shiftTotalRaw,
} from "./cutting/cutting.types";
import { cuttingApi, DbShift, DbPlace, DbEmployee, DbBlankType, DbCuttingTask } from "@/api/client";
import { useTasks } from "@/store/tasksStore";
import { ActiveColumn, DoneColumn } from "./cutting/CuttingShiftCards";
import CuttingJournal from "./cutting/CuttingJournal";
import CuttingTaskBlock from "./cutting/CuttingTaskBlock";
import { AssignModal, FinishModal } from "./cutting/CuttingModals";

type Tab = "today" | "journal";

type Props = {
  openTaskId?: string | null;
  onTaskOpened?: () => void;
};

function dbToShift(s: DbShift): Shift {
  return {
    id: String(s.id),
    placeId: String(s.place_id),
    placeName: s.place_name,
    employeeId: String(s.employee_id),
    employeeName: s.employee_name,
    workType: s.work_type as WorkType,
    date: s.shift_date?.substring(0, 10) || today,
    status: s.status as "active" | "done",
    startedAt: s.started_at?.substring(0, 5) || "08:00",
    finishedAt: s.finished_at?.substring(0, 5),
    taskId: s.task_id ? String(s.task_id) : undefined,
    taskQtyAssigned: s.task_qty_assigned || undefined,
    results: (s.results || []).map(r => ({
      blankTypeId: String(r.blankTypeId ?? r.blank_type_id ?? ""),
      blankName: r.blankName ?? r.blank_name,
      material: r.material,
      produced: Number(r.produced ?? 0),
      rawAuto: true,
      rawUsed: Number(r.rawUsed ?? r.raw_used ?? 0),
      orderId: (r.orderRef ?? r.order_ref) || undefined,
    })),
  };
}

function dbToPlace(p: DbPlace): Place {
  return { id: String(p.id), name: p.name, machine: p.machine, workTypes: p.work_types as WorkType[] };
}
function dbToEmployee(e: DbEmployee): Employee {
  return { id: String(e.id), name: e.name };
}
function dbToBlankType(b: DbBlankType): BlankType {
  return { id: String(b.id), name: b.name, size: b.size, material: b.material, rawPerUnit: Number(b.raw_per_unit) };
}
function dbToTask(t: DbCuttingTask): CuttingTask {
  return {
    id: String(t.id),
    blankTypeId: t.blank_type_id ? String(t.blank_type_id) : "",
    blankName: t.blank_name,
    blankSize: t.blank_size,
    materialName: t.material_name || "",
    totalQty: t.total_qty,
    doneQty: t.done_qty,
    inProgressQty: t.in_progress_qty,
    status: t.status as CuttingTask["status"],
    createdAt: new Date(t.created_at).toLocaleDateString("ru-RU"),
    updatedAt: t.updated_at ? t.updated_at.substring(0, 10) : undefined,
    deadline: t.deadline ? new Date(t.deadline).toLocaleDateString("ru-RU") : undefined,
  };
}

export default function CuttingPage({ openTaskId, onTaskOpened }: Props) {
  const [tab,        setTab]       = useState<Tab>("today");

  /* Задачи из глобального TasksContext (туда пишет и Склад при создании) */
  const { tasks, setTasks: setCtxTasks } = useTasks();

  const [shifts,     setShifts]     = useState<Shift[]>([]);
  const [places,     setPlaces]     = useState<Place[]>([]);
  const [employees,  setEmployees]  = useState<Employee[]>([]);
  const [blankTypes, setBlankTypes] = useState<BlankType[]>([]);

  const reloadShifts = useCallback(() =>
    cuttingApi.shifts().then(data => setShifts(data.map(dbToShift))).catch(console.error), []);

  const reloadTasks = useCallback(() =>
    cuttingApi.tasks().then(data => {
      setCtxTasks(data.map(dbToTask));
    }).catch(console.error), [setCtxTasks]);

  useEffect(() => {
    reloadShifts();
    reloadTasks();
    cuttingApi.places().then(d => setPlaces(d.map(dbToPlace))).catch(console.error);
    cuttingApi.employees().then(d => setEmployees(d.map(dbToEmployee))).catch(console.error);
    cuttingApi.blankTypes().then(d => setBlankTypes(d.map(dbToBlankType))).catch(console.error);
  }, [reloadShifts, reloadTasks]);

  /* Модалки */
  const [assignModal,   setAssignModal]   = useState(false);
  const [finishShiftId, setFinishShiftId] = useState<string | null>(null);
  const [finishLoading, setFinishLoading] = useState(false);

  /* Форма назначения */
  const [fPlace,    setFPlace]    = useState("");
  const [fEmployee, setFEmployee] = useState("");
  const [fWorkType, setFWorkType] = useState<WorkType>("cutting");
  const [fDate,     setFDate]     = useState(today);
  const [fTaskId,   setFTaskId]   = useState("");
  const [fTaskQty,  setFTaskQty]  = useState("");

  useEffect(() => {
    if (places.length > 0 && !fPlace) setFPlace(places[0].id);
  }, [places, fPlace]);
  useEffect(() => {
    if (employees.length > 0 && !fEmployee) setFEmployee(employees[0].id);
  }, [employees, fEmployee]);

  /* Форма завершения */
  const firstBt = blankTypes[0];
  const [fResults, setFResults] = useState<ShiftResult[]>([]);
  useEffect(() => {
    if (firstBt && fResults.length === 0) setFResults([emptyResultFromBt(firstBt)]);
  }, [firstBt, fResults.length]);

  /* ── Назначить смену → API ── */
  const handleAssign = () => {
    const taskQtyNum = parseInt(fTaskQty) || 0;
    cuttingApi.assignShift({
      placeId:         parseInt(fPlace),
      employeeId:      parseInt(fEmployee),
      workType:        fWorkType,
      date:            fDate,
      taskId:          fTaskId ? parseInt(fTaskId) : undefined,
      taskQtyAssigned: fTaskId && taskQtyNum > 0 ? taskQtyNum : undefined,
    }).then(() => {
      reloadShifts();
      reloadTasks();
      setAssignModal(false);
      setFWorkType("cutting");
      setFDate(today);
      setFTaskId("");
      setFTaskQty("");
    }).catch(console.error);
  };

  /* ── Завершить смену → API ── */
  const handleFinish = () => {
    if (!finishShiftId || finishLoading) return;
    setFinishLoading(true);
    /* Закрываем модал сразу — предотвращает двойное нажатие */
    setFinishShiftId(null);
    cuttingApi.finishShift({
      shiftId: parseInt(finishShiftId),
      results: fResults.map(r => {
        const bt = blankTypes.find(b => b.id === r.blankTypeId);
        const rawUsed = r.rawAuto && bt
          ? +(bt.rawPerUnit * r.produced).toFixed(2)
          : r.rawUsed;
        return {
          blankTypeId: parseInt(r.blankTypeId),
          produced:    r.produced,
          rawAuto:     r.rawAuto,
          rawUsed,
          orderId:     r.orderId,
        };
      }),
    }).then(() => {
      reloadShifts();
      reloadTasks();
      setFResults(firstBt ? [emptyResultFromBt(firstBt)] : []);
    }).catch(console.error)
      .finally(() => setFinishLoading(false));
  };

  const updateResult = (idx: number, patch: Partial<ShiftResult>) => {
    setFResults(prev => prev.map((r, i) => {
      if (i !== idx) return r;
      const merged = { ...r, ...patch };
      if (("blankTypeId" in patch || "produced" in patch) && merged.rawAuto) {
        const bt = blankTypes.find(b => b.id === merged.blankTypeId);
        if (bt) merged.rawUsed = +(bt.rawPerUnit * merged.produced).toFixed(2);
      }
      return merged;
    }));
  };

  /* ── Производные ── */
  const activeShifts = shifts.filter(s => s.status === "active");
  const todayDone    = shifts.filter(s => s.status === "done" && s.date === today);
  const allDone      = shifts.filter(s => s.status === "done");

  const finishShift = finishShiftId ? shifts.find(s => s.id === finishShiftId) ?? null : null;

  const TABS: { key: Tab; label: string }[] = [
    { key: "today",   label: "Сегодня" },
    { key: "journal", label: "Журнал смен" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Sticky шапка ── */}
      <div className="shrink-0 bg-[#fafafa] border-b border-[#ebebeb] px-7 pt-5 pb-0">
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

        {/* Сегодня */}
        {tab === "today" && (
          <div className="flex-1 overflow-hidden grid grid-cols-3 divide-x divide-[#f0f0f0]">

            <div className="flex flex-col overflow-hidden">
              <div className="shrink-0 px-5 py-3 border-b border-[#f0f0f0] flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-[#ede9fe] flex items-center justify-center shrink-0">
                  <Icon name="ClipboardList" size={11} className="text-[#6366f1]" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#6366f1]">Задачи</p>
                {(() => {
                  const n = tasks.filter(t => {
                    if (t.status === "done" || t.status === "cancelled") return false;
                    if (t.status === "active") {
                      const rem = (t.totalQty ?? 0) - (t.doneQty ?? 0) - (t.inProgressQty ?? 0);
                      return rem > 0;
                    }
                    return true;
                  }).length;
                  return n > 0 ? (
                    <span className="text-[10px] font-bold bg-[#6366f1] text-white px-1.5 py-px rounded-full">{n}</span>
                  ) : null;
                })()}
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <CuttingTaskBlock
                  tasks={tasks}
                  onReload={reloadTasks}
                  openTaskId={openTaskId}
                  onTaskOpened={onTaskOpened}
                  onAssignClick={(taskId) => {
                    setFTaskId(taskId);
                    setFTaskQty("");
                    setAssignModal(true);
                    onTaskOpened?.();
                  }}
                />
              </div>
            </div>

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
                  tasks={tasks}
                  blankTypes={blankTypes}
                  onFinishClick={(id) => {
                    setFinishShiftId(id);
                    const shift = activeShifts.find(s => s.id === id);
                    const plan  = shift?.taskQtyAssigned ?? 0;
                    /* находим задачу привязанную к смене, чтобы взять blankTypeId */
                    const linkedTask = shift?.taskId
                      ? tasks.find(t => t.id === shift.taskId)
                      : undefined;
                    const bt = linkedTask?.blankTypeId
                      ? blankTypes.find(b => b.id === linkedTask.blankTypeId) ?? firstBt
                      : firstBt;
                    if (bt) {
                      const produced = plan > 0 ? plan : 1;
                      const rawUsed  = +(bt.rawPerUnit * produced).toFixed(2);
                      setFResults([{ blankTypeId: bt.id, produced, rawAuto: true, rawUsed }]);
                    } else {
                      setFResults([]);
                    }
                  }}
                />
              </div>
            </div>

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
                <DoneColumn shifts={todayDone} tasks={tasks} />
              </div>
            </div>

          </div>
        )}

        {/* Журнал */}
        {tab === "journal" && (
          <div className="flex-1 overflow-hidden px-7 py-5">
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
          places={places}
          employees={employees}
          tasks={tasks}
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
          blankTypes={blankTypes}
          maxProduced={
            finishShift.taskQtyAssigned ??
            (finishShift.taskId
              ? (tasks.find(t => t.id === finishShift.taskId)?.totalQty ?? undefined)
              : undefined)
          }
          loading={finishLoading}
          onUpdateResult={updateResult}
          onAddResult={() => setFResults(prev => [...prev, firstBt ? emptyResultFromBt(firstBt) : prev[0]])}
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