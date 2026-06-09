import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Task, TaskFilter, STAGE_CONFIG } from "./tasks.types";

function KanbanCard({ task, onOpen }: { task: Task; onOpen: (t: Task) => void }) {
  const cfg = STAGE_CONFIG.find(s => s.key === task.stage)!;
  const isOverdue = task.deadlineState === "overdue";
  const isSoon    = task.deadlineState === "soon";

  return (
    <div
      onClick={() => onOpen(task)}
      className={`bg-white rounded-xl border cursor-pointer hover:shadow-md transition-all group ${
        isOverdue ? "border-red-200 bg-red-50/20" : isSoon ? "border-amber-200 bg-amber-50/20" : "border-[#ebebeb]"
      }`}
    >
      {/* Цветная полоска этапа */}
      <div className="h-1 rounded-t-xl" style={{ backgroundColor: cfg.color }} />

      <div className="px-4 py-3.5">
        {/* Заказ + срочность */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="text-[12px] font-bold text-[#2563eb] font-mono">{task.orderId}</span>
          <div className="flex items-center gap-1 shrink-0">
            {isOverdue && (
              <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">просрочен</span>
            )}
            {isSoon && !isOverdue && (
              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">скоро</span>
            )}
          </div>
        </div>

        {/* Клиент */}
        <p className="text-[14px] font-semibold text-[#1a1a1a] leading-tight mb-1">{task.client}</p>

        {/* Материал / размер */}
        {(task.stone || task.size) && (
          <p className="text-[11px] text-[#9b9b9b] mb-3">
            {task.stone}{task.stone && task.size ? " · " : ""}{task.size}
          </p>
        )}

        {/* Срок + ответственный */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f5f5f5]">
          {task.deadline ? (
            <div className="flex items-center gap-1">
              <Icon name="Calendar" size={11} className={isOverdue ? "text-red-500" : "text-[#b5b5b5]"} />
              <span className={`text-[12px] font-semibold ${
                isOverdue ? "text-red-600" : isSoon ? "text-amber-600" : "text-[#6b6b6b]"
              }`}>до {task.deadline}</span>
            </div>
          ) : <span />}
          {task.manager && (
            <span className="text-[11px] text-[#9b9b9b] flex items-center gap-1">
              <Icon name="User" size={10} />
              {task.manager.split(" ")[0]}
            </span>
          )}
        </div>

        {/* Проблема */}
        {task.comment && (
          <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-amber-100 bg-amber-50/50 rounded-lg px-2 py-1.5 -mx-1">
            <Icon name="AlertCircle" size={11} className="text-amber-500 shrink-0 mt-0.5" />
            <span className="text-[11px] text-amber-700 leading-tight line-clamp-2">{task.comment}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TasksKanban({ tasks, filter, search, onOpen }: {
  tasks: Task[];
  filter: TaskFilter;
  search: string;
  onOpen: (t: Task) => void;
}) {
  const visible = useMemo(() => {
    let list = tasks;
    if (filter === "overdue") list = list.filter(t => t.deadlineState === "overdue");
    if (filter === "mine")    list = list.filter(t => t.manager === "Олег К.");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.orderId.toLowerCase().includes(q) ||
        t.client.toLowerCase().includes(q) ||
        t.phone.includes(q)
      );
    }
    return list;
  }, [tasks, filter, search]);

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="flex gap-4 px-7 py-5 h-full min-w-max">
        {STAGE_CONFIG.map(cfg => {
          const col = visible.filter(t => t.stage === cfg.key);
          return (
            <div key={cfg.key} className="flex flex-col w-[260px] shrink-0">
              {/* Заголовок колонки */}
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                <span className="text-[13px] font-bold text-[#1a1a1a]">{cfg.label}</span>
                <span className="text-[11px] bg-[#f0f0f0] text-[#6b6b6b] px-2 py-0.5 rounded-full font-semibold ml-auto">
                  {col.length}
                </span>
              </div>

              {/* Карточки */}
              <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto">
                {col.length === 0 ? (
                  <div className="flex items-center justify-center h-20 border-2 border-dashed border-[#f0f0f0] rounded-xl">
                    <p className="text-[12px] text-[#c5c5c5]">Нет задач</p>
                  </div>
                ) : (
                  col.map(t => <KanbanCard key={t.id} task={t} onOpen={onOpen} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}