import Icon from "@/components/ui/icon";
import { BLANK_TYPES } from "./cutting.types";
import { useTasks } from "@/store/tasksStore";

export default function CuttingTaskBlock() {
  const { tasks } = useTasks();
  const activeTasks = tasks.filter(t => t.status !== "done");
  const doneTasks   = tasks.filter(t => t.status === "done");
  const all = [...activeTasks, ...doneTasks];

  return (
    <div className="flex flex-col gap-2 h-full">
      {all.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center flex-1">
          <div className="w-10 h-10 rounded-2xl bg-[#f4f4f4] flex items-center justify-center mb-2">
            <Icon name="ClipboardList" size={18} className="text-[#c0c0c0]" />
          </div>
          <p className="text-[12px] text-[#b5b5b5]">Задач нет</p>
          <p className="text-[11px] text-[#c5c5c5] mt-0.5">Добавьте задачу через склад</p>
        </div>
      )}

      {all.map(task => {
        const bt        = BLANK_TYPES.find(b => b.id === task.blankTypeId);
        const remaining = task.totalQty - task.doneQty - task.inProgressQty;
        const pct       = task.totalQty > 0 ? Math.round((task.doneQty / task.totalQty) * 100) : 0;
        const isDone    = task.status === "done";
        const isActive  = task.status === "active";

        return (
          <div
            key={task.id}
            className={`rounded-xl border p-4 transition-colors ${
              isDone    ? "border-[#e8e8e8] bg-[#fafafa]"
              : isActive ? "border-[#c7d2fe] bg-[#f5f3ff]"
              : "border-[#e8e8e8] bg-white"
            }`}
          >
            {/* Заголовок */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <p className={`text-[14px] font-semibold leading-tight ${isDone ? "text-[#9b9b9b]" : "text-[#1a1a1a]"}`}>
                  {bt?.name ?? "Заготовка"}
                </p>
                <p className="text-[11px] text-[#9b9b9b] mt-0.5">
                  {task.materialName} · {bt?.size}
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                isDone    ? "bg-green-100 text-green-600"
                : isActive ? "bg-[#ede9fe] text-[#6366f1]"
                : "bg-[#f4f4f4] text-[#9b9b9b]"
              }`}>
                {isDone ? "Готово" : isActive ? "В работе" : "Не начато"}
              </span>
            </div>

            {/* Цифры крупно */}
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className={`text-[24px] font-bold leading-none ${isDone ? "text-[#9b9b9b]" : "text-[#1a1a1a]"}`}>
                {task.doneQty}
              </span>
              <span className="text-[13px] text-[#9b9b9b]">/ {task.totalQty} шт.</span>
            </div>

            {/* Прогресс-бар */}
            <div className="h-1.5 bg-[#ebebeb] rounded-full overflow-hidden mb-2.5">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  backgroundColor: isDone ? "#22c55e" : isActive ? "#6366f1" : "#c0c0c0",
                }}
              />
            </div>

            {/* Детали */}
            {!isDone && (
              <div className="flex items-center gap-3 flex-wrap">
                {remaining > 0 && (
                  <span className="text-[11px] text-[#6b6b6b]">
                    Осталось: <b className="text-[#6366f1]">{remaining} шт.</b>
                  </span>
                )}
                {task.inProgressQty > 0 && (
                  <span className="text-[11px] text-[#6b6b6b]">
                    В работе: <b className="text-[#f59e0b]">{task.inProgressQty} шт.</b>
                  </span>
                )}
                {task.deadline && (
                  <span className="text-[11px] text-[#9b9b9b] flex items-center gap-1 ml-auto">
                    <Icon name="Calendar" size={10} />
                    до {task.deadline}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
