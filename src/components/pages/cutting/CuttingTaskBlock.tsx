import Icon from "@/components/ui/icon";
import { CuttingTask, BLANK_TYPES } from "./cutting.types";
import { useTasks } from "@/store/tasksStore";

const STATUS_CFG = {
  pending: { label: "Не начато",  color: "#9b9b9b", bg: "#f5f5f5"  },
  active:  { label: "В работе",   color: "#6366f1", bg: "#f0f0ff"  },
  done:    { label: "Выполнено",  color: "#16a34a", bg: "#f0fdf4"  },
};

export default function CuttingTaskBlock() {
  const { tasks } = useTasks();

  const activeTasks = tasks.filter(t => t.status !== "done");
  const doneTasks   = tasks.filter(t => t.status === "done");

  if (tasks.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded-md bg-[#6366f1] flex items-center justify-center shrink-0">
          <Icon name="ClipboardList" size={11} className="text-white" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#6366f1]">
          Задачи на нарезку
        </p>
        {activeTasks.length > 0 && (
          <span className="text-[10px] font-bold bg-[#6366f1] text-white px-1.5 py-px rounded-full">
            {activeTasks.length}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Сначала активные */}
        {[...activeTasks, ...doneTasks].map(task => {
          const bt         = BLANK_TYPES.find(b => b.id === task.blankTypeId);
          const remaining  = task.totalQty - task.doneQty;
          const pct        = task.totalQty > 0 ? Math.round((task.doneQty / task.totalQty) * 100) : 0;
          const st         = STATUS_CFG[task.status];

          return (
            <div
              key={task.id}
              className={`rounded-xl border px-4 py-3 ${task.status === "done" ? "border-[#ebebeb] bg-[#fafafa]" : "border-[#d8d8ff] bg-[#fafafe]"}`}
            >
              {/* Шапка */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-semibold truncate ${task.status === "done" ? "text-[#9b9b9b]" : "text-[#1a1a1a]"}`}>
                    {bt?.name ?? "Заготовка"}
                  </p>
                  <p className="text-[11px] text-[#9b9b9b]">{task.materialName} · {bt?.size}</p>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                  style={{ color: st.color, backgroundColor: st.bg }}
                >
                  {st.label}
                </span>
              </div>

              {/* Прогресс */}
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-1.5 bg-[#ebebeb] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: task.status === "done" ? "#16a34a" : "#6366f1",
                    }}
                  />
                </div>
                <span className="text-[11px] font-bold text-[#1a1a1a] shrink-0">
                  {task.doneQty}/{task.totalQty} шт.
                </span>
              </div>

              {/* Детали */}
              <div className="flex items-center gap-3 text-[11px] text-[#9b9b9b]">
                {task.status !== "done" && (
                  <span>Осталось: <b className="text-[#6366f1]">{remaining} шт.</b></span>
                )}
                {task.inProgressQty > 0 && (
                  <span>В работе: <b className="text-[#f59e0b]">{task.inProgressQty} шт.</b></span>
                )}
                {task.deadline && (
                  <span className="ml-auto flex items-center gap-1">
                    <Icon name="Calendar" size={10} />
                    до {task.deadline}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
