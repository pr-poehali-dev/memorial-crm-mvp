import { useState } from "react";
import Icon from "@/components/ui/icon";
import { CuttingTask, Shift, shiftTotalProduced } from "./cutting.types";
import { cuttingApi } from "@/api/client";

/* ─── Унифицированный модал задачи (активной и завершённой) ─── */
export function TaskModal({
  task,
  onClose,
  onAssign,
  allShifts,
}: {
  task: CuttingTask;
  onClose: () => void;
  onAssign?: (taskId: string) => void;
  allShifts?: Shift[];
}) {
  const totalQty      = task.totalQty      ?? 0;
  const doneQty       = task.doneQty       ?? 0;
  const inProgressQty = task.inProgressQty ?? 0;
  const remaining     = totalQty - doneQty - inProgressQty;
  const pct           = totalQty > 0 ? Math.round((doneQty / totalQty) * 100) : 100;
  const isDone        = task.status === "done";
  const isActive      = task.status === "active";

  /* Смены связанные с этой задачей, группируем по дате */
  const taskShifts = (allShifts ?? [])
    .filter(s => s.taskId === task.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  const byDate: Record<string, Shift[]> = {};
  taskShifts.forEach(s => { byDate[s.date] = [...(byDate[s.date] ?? []), s]; });
  const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  function isoToRu(iso: string) {
    const [y, m, d] = iso.split("-");
    return `${d}.${m}.${y}`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-[#ebebeb] shadow-2xl w-full max-w-[480px] max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Шапка */}
        <div className="flex items-start justify-between gap-3 p-5 pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold text-[#9b9b9b] font-mono bg-[#f4f4f4] px-2 py-0.5 rounded">
                Задача #{task.id}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDone    ? "bg-green-100 text-green-700" :
                isActive  ? "bg-[#dbeafe] text-[#2563eb]" :
                            "bg-[#f4f4f4] text-[#9b9b9b]"
              }`}>
                {isDone ? "Завершена" : isActive ? "В работе" : "Не начата"}
              </span>
            </div>
            <h2 className="text-[17px] font-bold text-[#1a1a1a] leading-tight">
              {task.blankName || "Заготовка"}
            </h2>
            <p className="text-[12px] text-[#9b9b9b] mt-0.5">
              {task.materialName}{task.blankSize ? ` · ${task.blankSize}` : ""}
            </p>
          </div>
          <button onClick={onClose} className="text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors shrink-0 mt-0.5">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 pb-5 space-y-4">
          {/* Прогресс */}
          <div className="bg-[#f8f8f8] rounded-xl p-4">
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-[34px] font-bold text-[#1a1a1a] leading-none">{doneQty}</span>
              <span className="text-[14px] text-[#9b9b9b]">/ {totalQty} шт.</span>
              <span className="ml-auto text-[13px] font-semibold" style={{ color: isDone ? "#16a34a" : "#2563eb" }}>{pct}%</span>
            </div>
            <div className="h-2 bg-[#e8e8e8] rounded-full overflow-hidden flex">
              {doneQty > 0 && <div className="h-full bg-green-500 transition-all" style={{ width: `${(doneQty / totalQty) * 100}%` }} />}
              {inProgressQty > 0 && <div className="h-full bg-amber-400 transition-all" style={{ width: `${(inProgressQty / totalQty) * 100}%` }} />}
            </div>
            {!isDone && (
              <div className="flex gap-3 mt-2 text-[11px]">
                {doneQty > 0 && <span className="text-green-600">✓ {doneQty} готово</span>}
                {inProgressQty > 0 && <span className="text-amber-500">⟳ {inProgressQty} в работе</span>}
                {remaining > 0 && <span className="text-[#9b9b9b]">○ {remaining} осталось</span>}
              </div>
            )}
          </div>

          {/* Детали */}
          <div className="space-y-0 bg-white border border-[#f0f0f0] rounded-xl overflow-hidden">
            {[
              { label: "Материал", value: task.materialName || "—" },
              task.blankSize ? { label: "Размер", value: task.blankSize } : null,
              { label: "Создана",  value: task.createdAt },
              task.deadline ? { label: "Срок", value: `до ${task.deadline}` } : null,
            ].filter(Boolean).map((row, i, arr) => (
              <div key={i} className={`flex justify-between items-center px-4 py-2.5 ${i < arr.length - 1 ? "border-b border-[#f5f5f5]" : ""}`}>
                <span className="text-[12px] text-[#9b9b9b]">{row!.label}</span>
                <span className="text-[13px] font-medium text-[#1a1a1a]">{row!.value}</span>
              </div>
            ))}
          </div>

          {/* История смен по дням */}
          {sortedDates.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#b0b0b0] mb-2">История выполнения</p>
              <div className="space-y-2">
                {sortedDates.map(date => {
                  const dayShifts = byDate[date];
                  const dayDone = dayShifts.reduce((a, s) => a + shiftTotalProduced(s), 0);
                  return (
                    <div key={date} className="bg-[#f8f8f8] rounded-xl px-4 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12px] font-semibold text-[#4b4b4b]">{isoToRu(date)}</span>
                        <span className="text-[12px] font-bold text-green-600">+{dayDone} шт.</span>
                      </div>
                      {dayShifts.map(s => (
                        <div key={s.id} className="flex items-center justify-between text-[11px] text-[#9b9b9b] py-0.5">
                          <span>{s.employeeName ?? s.employeeId} · {s.placeName ?? s.placeId}</span>
                          <span className="font-medium text-[#6b6b6b]">{shiftTotalProduced(s)} шт.</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div className="flex gap-2 p-5 pt-0 shrink-0">
          {!isDone && onAssign && (
            <button
              onClick={() => { onClose(); onAssign(task.id); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[10px] bg-[#2563eb] text-white text-[13px] font-semibold hover:bg-[#1d4ed8] transition-colors"
            >
              <Icon name="UserPlus" size={13} />
              Назначить смену
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 text-[13px] font-medium border border-[#e8e8e8] text-[#6b6b6b] rounded-[10px] py-2.5 hover:bg-[#f5f5f5] transition-all"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

/* Устаревший экспорт для совместимости */
export function DoneTaskModal({ task, onClose }: { task: CuttingTask; onClose: () => void }) {
  return <TaskModal task={task} onClose={onClose} />;
}

type Props = {
  tasks: CuttingTask[];
  allShifts?: Shift[];
  onReload: () => void;
  onAssignClick?: (taskId: string) => void;
  openTaskId?: string | null;
  onTaskOpened?: () => void;
};

export default function CuttingTaskBlock({ tasks, allShifts, onReload, onAssignClick, openTaskId, onTaskOpened }: Props) {
  const [modalTask, setModalTask] = useState<CuttingTask | null>(null);

  /* Если снаружи передан openTaskId — ищем задачу среди ВСЕХ (включая done) */
  const effectiveModal = modalTask
    ?? (openTaskId ? tasks.find(t => t.id === openTaskId) ?? null : null);

  const handleClose = () => {
    setModalTask(null);
    onTaskOpened?.(); /* сбрасываем openTaskId в родителе */
  };

  const handleCancel = (task: CuttingTask) => {
    cuttingApi.cancelTask(parseInt(task.id)).then(onReload).catch(console.error);
  };

  const visibleTasks = tasks.filter(t => {
    if (t.status === "done" || t.status === "cancelled") return false;
    if (t.status === "active") {
      const remaining = (t.totalQty ?? 0) - (t.doneQty ?? 0) - (t.inProgressQty ?? 0);
      return remaining > 0;
    }
    return true;
  });

  return (
    <>
      {effectiveModal && (
        <TaskModal
          task={effectiveModal}
          onClose={handleClose}
          onAssign={onAssignClick}
          allShifts={allShifts}
        />
      )}

      <div className="flex flex-col gap-2 h-full">
        {visibleTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center flex-1">
            <div className="w-10 h-10 rounded-2xl bg-[#f4f4f4] flex items-center justify-center mb-2">
              <Icon name="ClipboardList" size={18} className="text-[#c0c0c0]" />
            </div>
            <p className="text-[12px] text-[#b5b5b5]">Активных задач нет</p>
            <p className="text-[11px] text-[#c5c5c5] mt-0.5">Создайте задачу через кнопку «Нарезка» на складе</p>
          </div>
        )}

        {visibleTasks.map(task => {
          const totalQty      = task.totalQty      ?? 0;
          const doneQty       = task.doneQty       ?? 0;
          const inProgressQty = task.inProgressQty ?? 0;
          const remaining     = totalQty - doneQty - inProgressQty;
          const isActive      = task.status === "active";

          return (
            <div
              key={task.id}
              onClick={() => setModalTask(task)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === "Enter" && setModalTask(task)}
              className={`rounded-xl border p-4 transition-all text-left hover:shadow-sm w-full cursor-pointer ${
                isActive ? "border-[#bfdbfe] bg-[#eff6ff] hover:border-[#93c5fd]" : "border-[#e8e8e8] bg-white hover:border-[#d0d0d0]"
              }`}
            >
              {/* Шапка карточки */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold font-mono text-[#b0b0b0]">#{task.id}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? "bg-[#dbeafe] text-[#2563eb]" : "bg-[#f4f4f4] text-[#9b9b9b]"
                    }`}>
                      {isActive ? "В работе" : "Не начато"}
                    </span>
                  </div>
                  <p className="text-[13px] font-semibold leading-tight text-[#1a1a1a]">
                    {task.blankName || "Заготовка"}
                  </p>
                  <p className="text-[11px] text-[#9b9b9b]">
                    {task.materialName}{task.blankSize ? ` · ${task.blankSize}` : ""}
                  </p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); handleCancel(task); }}
                  title="Отменить задачу"
                  className="w-5 h-5 flex items-center justify-center rounded text-[#c5c5c5] hover:text-red-400 hover:bg-red-50 transition-all shrink-0 mt-0.5"
                >
                  <Icon name="X" size={11} />
                </button>
              </div>

              {/* Прогресс */}
              <div className="flex items-baseline gap-1 mb-1.5">
                <span className="text-[22px] font-bold leading-none text-[#1a1a1a]">{doneQty}</span>
                <span className="text-[12px] text-[#9b9b9b]">/ {totalQty} шт.</span>
                {remaining > 0 && <span className="ml-auto text-[11px] text-[#9b9b9b]">{remaining} ост.</span>}
              </div>

              <div className="h-1.5 bg-[#ebebeb] rounded-full overflow-hidden flex">
                {doneQty > 0 && <div className="h-full bg-green-500" style={{ width: `${(doneQty / totalQty) * 100}%` }} />}
                {inProgressQty > 0 && <div className="h-full bg-amber-400" style={{ width: `${(inProgressQty / totalQty) * 100}%` }} />}
              </div>

              {onAssignClick && (
                <button
                  onClick={e => { e.stopPropagation(); onAssignClick(task.id); }}
                  className="mt-2.5 w-full text-[11px] font-semibold py-1.5 rounded-lg border border-[#bfdbfe] text-[#2563eb] hover:bg-[#eff6ff] transition-colors"
                >
                  + Назначить смену
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}