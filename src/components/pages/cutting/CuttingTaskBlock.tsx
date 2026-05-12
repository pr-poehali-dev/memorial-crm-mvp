import { useState } from "react";
import Icon from "@/components/ui/icon";
import { CuttingTask } from "./cutting.types";
import { cuttingApi } from "@/api/client";

/* ─── Попап с деталями завершённой задачи ─── */
function DoneTaskModal({ task, onClose }: { task: CuttingTask; onClose: () => void }) {
  const totalQty      = task.totalQty      ?? 0;
  const doneQty       = task.doneQty       ?? 0;
  const pct           = totalQty > 0 ? Math.round((doneQty / totalQty) * 100) : 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-[#ebebeb] shadow-2xl p-6 w-full max-w-[380px]"
        onClick={e => e.stopPropagation()}
      >
        {/* Шапка */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <Icon name="Check" size={13} className="text-green-600" />
              </div>
              <span className="text-[11px] font-bold text-green-600 uppercase tracking-wide">Готово</span>
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

        {/* Прогресс */}
        <div className="bg-[#f8f8f8] rounded-xl p-4 mb-4">
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-[36px] font-bold text-[#1a1a1a] leading-none">{doneQty}</span>
            <span className="text-[15px] text-[#9b9b9b]">/ {totalQty} шт.</span>
            <span className="ml-auto text-[13px] font-semibold text-green-600">{pct}%</span>
          </div>
          <div className="h-2 bg-[#e8e8e8] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Детали */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center py-2 border-b border-[#f5f5f5]">
            <span className="text-[12px] text-[#9b9b9b]">Материал</span>
            <span className="text-[13px] font-medium text-[#1a1a1a]">{task.materialName || "—"}</span>
          </div>
          {task.blankSize && (
            <div className="flex justify-between items-center py-2 border-b border-[#f5f5f5]">
              <span className="text-[12px] text-[#9b9b9b]">Размер</span>
              <span className="text-[13px] font-mono text-[#1a1a1a]">{task.blankSize}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-2 border-b border-[#f5f5f5]">
            <span className="text-[12px] text-[#9b9b9b]">Выполнено</span>
            <span className="text-[13px] font-semibold text-[#1a1a1a]">{doneQty} из {totalQty} шт.</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#f5f5f5]">
            <span className="text-[12px] text-[#9b9b9b]">Создана</span>
            <span className="text-[13px] text-[#1a1a1a]">{task.createdAt}</span>
          </div>
          {task.deadline && (
            <div className="flex justify-between items-center py-2">
              <span className="text-[12px] text-[#9b9b9b]">Срок</span>
              <span className="text-[13px] text-[#1a1a1a] flex items-center gap-1">
                <Icon name="Calendar" size={11} className="text-[#9b9b9b]" />
                до {task.deadline}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full text-[13px] font-semibold border border-[#e8e8e8] text-[#6b6b6b] rounded-[10px] py-2.5 hover:bg-[#f5f5f5] transition-all"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}

type Props = {
  tasks: CuttingTask[];
  onReload: () => void;
  onAssignClick?: (taskId: string) => void;
};

export default function CuttingTaskBlock({ tasks, onReload, onAssignClick }: Props) {
  const [doneModal, setDoneModal] = useState<CuttingTask | null>(null);

  /* Показываем только активные (pending + active), завершённые и отменённые скрыты */
  const visibleTasks = tasks.filter(t => t.status !== "done" && t.status !== "cancelled");

  const handleCancel = (task: CuttingTask) => {
    cuttingApi.cancelTask(parseInt(task.id))
      .then(onReload)
      .catch(console.error);
  };

  return (
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
        const pct           = totalQty > 0 ? Math.round((doneQty / totalQty) * 100) : 0;
        const isActive      = task.status === "active";
        const canAssign     = !isActive || remaining > 0;

        return (
          <div
            key={task.id}
            className={`rounded-xl border p-4 transition-colors ${
              isActive ? "border-[#c7d2fe] bg-[#f5f3ff]" : "border-[#e8e8e8] bg-white"
            }`}
          >
            {/* Заголовок */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold leading-tight text-[#1a1a1a]">
                  {task.blankName || "Заготовка"}
                </p>
                <p className="text-[11px] text-[#9b9b9b] mt-0.5">
                  {task.materialName}{task.blankSize ? ` · ${task.blankSize}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? "bg-[#ede9fe] text-[#6366f1]" : "bg-[#f4f4f4] text-[#9b9b9b]"
                }`}>
                  {isActive ? "В работе" : "Не начато"}
                </span>
                <button
                  onClick={() => handleCancel(task)}
                  title="Отменить задачу"
                  className="w-5 h-5 flex items-center justify-center rounded text-[#c5c5c5] hover:text-red-400 hover:bg-red-50 transition-all"
                >
                  <Icon name="X" size={11} />
                </button>
              </div>
            </div>

            {/* Цифры */}
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-[24px] font-bold leading-none text-[#1a1a1a]">{doneQty}</span>
              <span className="text-[13px] text-[#9b9b9b]">/ {totalQty} шт.</span>
            </div>

            {/* Прогресс-бар */}
            <div className="h-1.5 bg-[#ebebeb] rounded-full overflow-hidden mb-2.5">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: isActive ? "#6366f1" : "#c0c0c0" }}
              />
            </div>

            {/* Детали */}
            <div className="flex items-center gap-3 flex-wrap mb-3">
              {remaining > 0 && (
                <span className="text-[11px] text-[#6b6b6b]">
                  Осталось: <b className="text-[#6366f1]">{remaining} шт.</b>
                </span>
              )}
              {inProgressQty > 0 && (
                <span className="text-[11px] text-[#6b6b6b]">
                  В работе: <b className="text-[#f59e0b]">{inProgressQty} шт.</b>
                </span>
              )}
              {task.deadline && (
                <span className="text-[11px] text-[#9b9b9b] flex items-center gap-1 ml-auto">
                  <Icon name="Calendar" size={10} />
                  до {task.deadline}
                </span>
              )}
            </div>

            {/* Кнопка назначить смену */}
            {canAssign && onAssignClick && (
              <button
                onClick={() => onAssignClick(task.id)}
                className="w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#6366f1] border border-[#c7d2fe] bg-white rounded-lg py-1.5 hover:bg-[#f5f3ff] transition-all"
              >
                <Icon name="CalendarPlus" size={12} />
                Назначить смену
              </button>
            )}
          </div>
        );
      })}

      {/* Завершённые задачи — компактный список с кликом */}
      {(() => {
        const doneTasks = tasks.filter(t => t.status === "done");
        if (doneTasks.length === 0) return null;
        return (
          <div className="mt-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-2 px-1">
              Завершено ({doneTasks.length})
            </p>
            <div className="flex flex-col gap-1.5">
              {doneTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => setDoneModal(task)}
                  className="w-full flex items-center gap-3 bg-[#fafafa] border border-[#ebebeb] rounded-xl px-4 py-3 hover:bg-[#f0fdf4] hover:border-[#bbf7d0] transition-all text-left group"
                >
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Icon name="Check" size={12} className="text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#6b6b6b] truncate group-hover:text-[#1a1a1a]">
                      {task.blankName || "Заготовка"}
                    </p>
                    <p className="text-[10px] text-[#b5b5b5]">{task.materialName}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[12px] font-bold text-[#9b9b9b]">{task.doneQty ?? 0} шт.</span>
                    <Icon name="ChevronRight" size={12} className="text-[#c5c5c5] group-hover:text-[#6b6b6b]" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Попап завершённой задачи */}
      {doneModal && (
        <DoneTaskModal task={doneModal} onClose={() => setDoneModal(null)} />
      )}
    </div>
  );
}
