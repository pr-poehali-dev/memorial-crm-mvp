import { useState } from "react";
import Icon from "@/components/ui/icon";
import { COLUMNS, FILTERS, MACHINES, FilterKey, Card } from "./production/production.types";

/* ─── Плоский список задач из канбана (без «Готов») ─── */
type Task = Card & { stage: string; stageColor: string };

const STAGE_META: Record<string, { label: string; color: string }> = {
  sketch:    { label: "Эскиз",      color: "#6366f1" },
  engraving: { label: "Гравировка", color: "#ec4899" },
  polishing: { label: "Полировка",  color: "#14b8a6" },
};

function buildTasks(): Task[] {
  return COLUMNS
    .filter(c => c.id !== "ready")
    .flatMap(col =>
      col.cards.map(card => ({
        ...card,
        stage:      STAGE_META[col.id]?.label ?? col.label,
        stageColor: STAGE_META[col.id]?.color ?? "#9b9b9b",
      }))
    );
}

const STATUS_CFG = {
  overdue: { label: "Просрочен", color: "#dc2626", bg: "#fef2f2", border: "border-red-200"   },
  soon:    { label: "Срочно",    color: "#d97706", bg: "#fffbeb", border: "border-amber-200" },
  ok:      { label: "В работе",  color: "#6b7280", bg: "#f9fafb", border: "border-[#ebebeb]"  },
};

export default function ProductionPage() {
  const allTasks = buildTasks();

  const [done,    setDone]    = useState<Set<string>>(new Set());
  const [filter,  setFilter]  = useState<FilterKey>("all");
  const [showAll, setShowAll] = useState(false);

  const applyFilter = (t: Task) => {
    if (filter === "mine")    return t.manager === "Олег К.";
    if (filter === "overdue") return t.deadlineState === "overdue";
    if (filter === "urgent")  return !!t.urgent;
    return true;
  };

  const visible  = allTasks.filter(t => !done.has(t.id) && applyFilter(t));
  const priority = visible.filter(t => t.deadlineState === "overdue" || t.urgent);
  const rest     = visible.filter(t => t.deadlineState !== "overdue" && !t.urgent);

  const totalOverdue = allTasks.filter(t => t.deadlineState === "overdue").length;
  const totalUrgent  = allTasks.filter(t => t.urgent).length;
  const totalInWork  = allTasks.length;

  const markDone = (id: string) => setDone(prev => new Set([...prev, id]));

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto bg-[#fafafa]">
      <div className="p-7 max-w-[780px] mx-auto w-full space-y-6">

        {/* ── Шапка ── */}
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold text-[#1a1a1a] tracking-tight">Производство</h1>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 bg-white border border-[#e0e0e0] text-[#4b4b4b] text-[13px] font-medium px-4 py-2.5 rounded-[10px] hover:border-[#c0c0c0] transition-colors">
              <Icon name="Play" size={14} />
              Начать смену
            </button>
            <button className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[13px] font-semibold px-4 py-2.5 rounded-[10px] hover:bg-[#333] transition-colors">
              <Icon name="Plus" size={14} />
              Добавить заказ
            </button>
          </div>
        </div>

        {/* ── Сводка «сегодня нужно сделать» ── */}
        <div className="bg-white border border-[#ebebeb] rounded-2xl p-5">
          <p className="text-[12px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-4">Сегодня нужно сделать</p>
          <div className="flex items-center gap-6">
            <div className="flex-1 flex gap-6">
              <div className="flex flex-col gap-0.5">
                <span className="text-[36px] font-bold leading-none" style={{ color: totalOverdue > 0 ? "#dc2626" : "#c0c0c0" }}>
                  {totalOverdue}
                </span>
                <span className="text-[12px] text-[#9b9b9b]">просрочено</span>
              </div>
              <div className="w-px bg-[#f0f0f0]" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[36px] font-bold leading-none" style={{ color: totalUrgent > 0 ? "#d97706" : "#c0c0c0" }}>
                  {totalUrgent}
                </span>
                <span className="text-[12px] text-[#9b9b9b]">срочных</span>
              </div>
              <div className="w-px bg-[#f0f0f0]" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[36px] font-bold text-[#1a1a1a] leading-none">{totalInWork}</span>
                <span className="text-[12px] text-[#9b9b9b]">в работе</span>
              </div>
            </div>
            <button
              onClick={() => setShowAll(true)}
              className="shrink-0 bg-[#1a1a1a] text-white text-[13px] font-semibold px-5 py-2.5 rounded-[10px] hover:bg-[#333] transition-colors"
            >
              Показать задачи
            </button>
          </div>
        </div>

        {/* ── Фильтры ── */}
        <div className="flex gap-1 bg-white border border-[#ebebeb] rounded-[8px] p-1 w-fit">
          {FILTERS.map(f => {
            const cnt = f.key === "overdue" ? totalOverdue : f.key === "urgent" ? totalUrgent : null;
            return (
              <button
                key={f.key}
                onClick={() => { setFilter(f.key); setShowAll(true); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] font-medium transition-all
                  ${filter === f.key ? "bg-[#1a1a1a] text-white" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
              >
                {f.label}
                {cnt !== null && cnt > 0 && (
                  <span className={`text-[10px] rounded-full px-1.5 py-px font-bold leading-none
                    ${filter === f.key ? "bg-white/25 text-white" : f.key === "overdue" ? "bg-red-100 text-red-500" : "bg-amber-100 text-amber-600"}`}>
                    {cnt}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Приоритетные ── */}
        {(showAll || filter !== "all") && priority.length > 0 && (
          <div className="space-y-2">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[#c0c0c0]">Приоритетные</p>
            {priority.map(t => <TaskRow key={t.id} task={t} onDone={markDone} />)}
          </div>
        )}

        {/* ── Остальные ── */}
        {(showAll || filter !== "all") && rest.length > 0 && (
          <div className="space-y-2">
            {priority.length > 0 && (
              <p className="text-[12px] font-bold uppercase tracking-widest text-[#c0c0c0]">Остальные</p>
            )}
            {rest.map(t => <TaskRow key={t.id} task={t} onDone={markDone} />)}
          </div>
        )}

        {/* ── Всё готово ── */}
        {(showAll || filter !== "all") && visible.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-5 flex items-center gap-3">
            <Icon name="CheckCircle" size={20} className="text-green-500 shrink-0" />
            <div>
              <p className="text-[14px] font-semibold text-green-700">Всё готово</p>
              <p className="text-[12px] text-green-600 mt-0.5">Нет активных задач по выбранному фильтру</p>
            </div>
          </div>
        )}

        {/* ── Кнопка «показать все» ── */}
        {!showAll && filter === "all" && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full py-3 border border-dashed border-[#d0d0d0] rounded-xl text-[13px] text-[#9b9b9b] hover:text-[#4b4b4b] hover:border-[#9b9b9b] transition-all"
          >
            Показать все задачи ({visible.length})
          </button>
        )}

      </div>
    </div>
  );
}

/* ─── Строка задачи ─── */
function TaskRow({ task, onDone }: { task: Task; onDone: (id: string) => void }) {
  const st      = STATUS_CFG[task.deadlineState];
  const machine = task.machineId ? MACHINES.find(m => m.id === task.machineId) : null;

  return (
    <div className={`bg-white border rounded-xl px-5 py-4 flex items-center gap-4 ${st.border}`}
      style={{ backgroundColor: task.deadlineState !== "ok" ? st.bg : "#fff" }}>

      <div className="w-1 self-stretch rounded-full shrink-0" style={{ backgroundColor: st.color }} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[15px] font-bold text-[#1a1a1a]">{task.id}</span>
          {task.urgent && (
            <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-px rounded-full">⚡ СРОЧНО</span>
          )}
          <span
            className="text-[11px] font-semibold px-2 py-px rounded-full"
            style={{ color: st.color, backgroundColor: st.bg || "#f5f5f5" }}
          >
            {st.label}
          </span>
        </div>
        <p className="text-[14px] font-medium text-[#1a1a1a] truncate">{task.client}</p>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span
            className="text-[11px] font-semibold px-2 py-px rounded-md"
            style={{ color: task.stageColor, backgroundColor: task.stageColor + "15" }}
          >
            {task.stage}
          </span>
          {machine && <span className="text-[12px] text-[#9b9b9b]">{machine.name}</span>}
          <span className="text-[12px] text-[#9b9b9b]">до {task.deadline}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button className="text-[13px] font-medium text-[#6b6b6b] bg-[#f5f5f5] hover:bg-[#ebebeb] px-3 py-1.5 rounded-[8px] transition-colors">
          Открыть
        </button>
        <button
          onClick={() => onDone(task.id)}
          className="text-[13px] font-semibold text-white bg-[#22c55e] hover:bg-[#16a34a] px-3 py-1.5 rounded-[8px] transition-colors"
        >
          Готово
        </button>
      </div>
    </div>
  );
}
