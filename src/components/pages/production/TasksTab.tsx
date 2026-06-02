import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { DbProductionOrder } from "@/api/client";
import { Task, TaskFilter, Stage, STAGE_CONFIG, ordersToTasks } from "./tasks.types";
import TasksKanban from "./TasksKanban";
import TasksList   from "./TasksList";
import TaskDrawer  from "./TaskDrawer";

type ViewMode = "kanban" | "list";

export default function TasksTab({ orders, onNextStage }: {
  orders: DbProductionOrder[];
  onNextStage: (id: string, status: string) => void;
}) {
  const [view,        setView]        = useState<ViewMode>("kanban");
  const [stageFilter, setStageFilter] = useState<Stage | "all">("all");
  const [filter,      setFilter]      = useState<TaskFilter>("all");
  const [search,      setSearch]      = useState("");
  const [selected,    setSelected]    = useState<Task | null>(null);

  const tasks = useMemo(() => ordersToTasks(orders), [orders]);

  const overdueCount = tasks.filter(t => t.deadlineState === "overdue").length;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Панель управления */}
      <div className="shrink-0 bg-white border-b border-[#f0f0f0] px-7 py-3 flex items-center gap-3">
        {/* Вид */}
        <div className="flex gap-0.5 bg-[#f0f0f0] rounded-[8px] p-0.5 shrink-0">
          {(["kanban", "list"] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all ${
                view === v ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"
              }`}>
              <Icon name={v === "kanban" ? "LayoutGrid" : "List"} size={13} />
              {v === "kanban" ? "Канбан" : "Список"}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-[#e8e8e8]" />

        {/* Этап (только в режиме списка) */}
        {view === "list" && (
          <div className="flex gap-0.5 bg-[#f0f0f0] rounded-[8px] p-0.5 shrink-0">
            <button onClick={() => setStageFilter("all")}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all ${
                stageFilter === "all" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"
              }`}>Все этапы</button>
            {STAGE_CONFIG.map(s => (
              <button key={s.key} onClick={() => setStageFilter(s.key)}
                className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all ${
                  stageFilter === s.key ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"
                }`}>{s.label}</button>
            ))}
          </div>
        )}

        {/* Доп. фильтры */}
        <div className="flex gap-0.5 bg-[#f0f0f0] rounded-[8px] p-0.5 shrink-0">
          {([
            { key: "all",     label: "Все" },
            { key: "overdue", label: "Просроченные" },
            { key: "mine",    label: "Мои" },
          ] as { key: TaskFilter; label: string }[]).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all ${
                filter === f.key ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"
              }`}>
              {f.label}
              {f.key === "overdue" && overdueCount > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  filter === "overdue" ? "bg-[#1a1a1a] text-white" : "bg-red-100 text-red-600"
                }`}>{overdueCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Поиск */}
        <div className="relative flex-1 max-w-[240px] ml-auto">
          <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5b5]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Заказ, клиент, телефон..."
            className="w-full bg-white border border-[#e8e8e8] rounded-[8px] pl-8 pr-8 py-1.5 text-[12px] outline-none focus:border-[#c0c0c0] placeholder:text-[#c5c5c5] transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c0c0c0] hover:text-[#555]">
              <Icon name="X" size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Контент */}
      {view === "kanban" ? (
        <TasksKanban tasks={tasks} filter={filter} search={search} onOpen={setSelected} />
      ) : (
        <TasksList tasks={tasks} stageFilter={stageFilter} filter={filter} search={search} onOpen={setSelected} />
      )}

      {/* Детальная панель */}
      {selected && (
        <TaskDrawer
          task={selected}
          onClose={() => setSelected(null)}
          onNextStage={onNextStage}
        />
      )}
    </div>
  );
}
