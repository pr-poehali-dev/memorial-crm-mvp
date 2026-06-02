import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { DbProductionOrder } from "@/api/client";

/* ══════════════════════════════════════════════════════════
   ТИПЫ
══════════════════════════════════════════════════════════ */

type Stage = "sketch" | "cutting" | "engraving" | "polishing" | "ready";

const STAGE_CONFIG: {
  key: Stage; label: string; color: string; status: string;
}[] = [
  { key: "sketch",    label: "Эскиз",       color: "#6366f1", status: "Эскиз" },
  { key: "cutting",   label: "Распил",      color: "#f59e0b", status: "Производство" },
  { key: "engraving", label: "Гравировка",  color: "#ec4899", status: "Гравировка" },
  { key: "polishing", label: "Полировка",   color: "#14b8a6", status: "Полировка" },
  { key: "ready",     label: "Готово",      color: "#22c55e", status: "Готов" },
];

type Task = {
  id: string;
  orderId: string;
  client: string;
  phone: string;
  stone: string;
  size: string;
  stage: Stage;
  status: string;
  deadline: string;
  deadlineState: "overdue" | "soon" | "ok";
  manager: string;
  comment: string;
  payment: string;
  amount: number;
  paid: number;
};

function ordersToTasks(orders: DbProductionOrder[]): Task[] {
  return orders.map(o => {
    const stageConf = STAGE_CONFIG.find(s => s.status === o.status) ?? STAGE_CONFIG[0];
    return {
      id:            o.id,
      orderId:       o.id,
      client:        o.client_name,
      phone:         o.phone ?? "",
      stone:         o.stone ?? "",
      size:          o.size  ?? "",
      stage:         stageConf.key,
      status:        o.status,
      deadline:      o.deadline ? new Date(o.deadline).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }) : "",
      deadlineState: o.deadline_state,
      manager:       o.manager ?? "",
      comment:       o.comment ?? "",
      payment:       o.payment_label,
      amount:        Number(o.amount),
      paid:          Number(o.paid),
    };
  });
}

type TaskFilter = "all" | "overdue" | "mine";

/* ══════════════════════════════════════════════════════════
   KANBAN
══════════════════════════════════════════════════════════ */

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
          <span className="text-[12px] font-bold text-[#6366f1] font-mono">{task.orderId}</span>
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

function TasksKanban({ tasks, filter, search, onOpen }: {
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

/* ══════════════════════════════════════════════════════════
   СПИСОК ЗАДАЧ
══════════════════════════════════════════════════════════ */

function TasksList({ tasks, stageFilter, filter, search, onOpen }: {
  tasks: Task[];
  stageFilter: Stage | "all";
  filter: TaskFilter;
  search: string;
  onOpen: (t: Task) => void;
}) {
  const visible = useMemo(() => {
    let list = tasks;
    if (stageFilter !== "all") list = list.filter(t => t.stage === stageFilter);
    if (filter === "overdue")  list = list.filter(t => t.deadlineState === "overdue");
    if (filter === "mine")     list = list.filter(t => t.manager === "Олег К.");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.orderId.toLowerCase().includes(q) ||
        t.client.toLowerCase().includes(q) ||
        t.phone.includes(q)
      );
    }
    return list;
  }, [tasks, stageFilter, filter, search]);

  return (
    <div className="flex-1 overflow-y-auto px-7 py-4">
      {visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#f4f4f4] flex items-center justify-center mb-4">
            <Icon name="Layers" size={22} className="text-[#c0c0c0]" />
          </div>
          <p className="text-[15px] font-medium text-[#9b9b9b]">Нет задач по выбранным фильтрам</p>
        </div>
      ) : (
        <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#f0f0f0]">
                {["Заказ", "Клиент", "Материал / размер", "Этап", "Срок", "Ответственный", "Оплата", "Проблема", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((t, i) => {
                const cfg = STAGE_CONFIG.find(s => s.key === t.stage)!;
                const isOverdue = t.deadlineState === "overdue";
                const isSoon    = t.deadlineState === "soon";
                return (
                  <tr key={t.id}
                    className={`border-b border-[#f8f8f8] hover:bg-[#fafafa] transition-colors cursor-pointer ${
                      isOverdue ? "bg-red-50/20" : ""
                    }`}
                    onClick={() => onOpen(t)}
                  >
                    <td className="px-4 py-3">
                      <span className="text-[12px] font-bold text-[#6366f1] font-mono">{t.orderId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[13px] font-semibold text-[#1a1a1a]">{t.client}</p>
                      {t.phone && <p className="text-[11px] text-[#9b9b9b]">{t.phone}</p>}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#4b4b4b]">
                      {t.stone}{t.stone && t.size ? " · " : ""}{t.size || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                        style={{ color: cfg.color, backgroundColor: cfg.color + "18" }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {t.deadline ? (
                        <span className={`text-[13px] font-semibold ${
                          isOverdue ? "text-red-600" : isSoon ? "text-amber-600" : "text-[#1a1a1a]"
                        }`}>
                          {isOverdue && <Icon name="AlertTriangle" size={11} className="text-red-500 mr-1 inline" />}
                          {t.deadline}
                        </span>
                      ) : <span className="text-[12px] text-[#c5c5c5]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#4b4b4b]">
                      {t.manager || <span className="text-[#c5c5c5]">—</span>}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#6b6b6b]">{t.payment}</td>
                    <td className="px-4 py-3 max-w-[160px]">
                      {t.comment ? (
                        <div className="flex items-start gap-1">
                          <Icon name="AlertCircle" size={11} className="text-amber-500 shrink-0 mt-0.5" />
                          <span className="text-[11px] text-amber-700 truncate">{t.comment}</span>
                        </div>
                      ) : <span className="text-[12px] text-[#c5c5c5]">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Icon name="ChevronRight" size={14} className="text-[#c5c5c5]" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ДЕТАЛИ ЗАДАЧИ (боковая панель)
══════════════════════════════════════════════════════════ */

function TaskDrawer({ task, onClose, onNextStage }: {
  task: Task;
  onClose: () => void;
  onNextStage: (id: string, status: string) => void;
}) {
  const cfg = STAGE_CONFIG.find(s => s.key === task.stage)!;
  const cfgIdx = STAGE_CONFIG.findIndex(s => s.key === task.stage);
  const nextCfg = cfgIdx < STAGE_CONFIG.length - 1 ? STAGE_CONFIG[cfgIdx + 1] : null;
  const debt = Math.max(0, task.amount - task.paid);
  const isOverdue = task.deadlineState === "overdue";
  const isSoon    = task.deadlineState === "soon";

  return (
    <div className="fixed inset-0 z-40 flex" onClick={onClose}>
      <div className="flex-1" />
      <div
        className="w-[420px] h-full bg-white border-l border-[#ebebeb] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Шапка */}
        <div className="shrink-0 px-6 py-5 border-b border-[#f0f0f0] flex items-start justify-between">
          <div>
            <span className="text-[12px] font-bold text-[#6366f1] font-mono">{task.orderId}</span>
            <h2 className="text-[18px] font-bold text-[#1a1a1a] mt-1">{task.client}</h2>
            {task.phone && <p className="text-[12px] text-[#9b9b9b] mt-0.5">{task.phone}</p>}
          </div>
          <button onClick={onClose} className="text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors mt-1">
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Этап */}
        <div className="shrink-0 px-6 py-4 border-b border-[#f5f5f5]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-3">Текущий этап</p>
          <div className="flex gap-1.5 flex-wrap">
            {STAGE_CONFIG.map((s, idx) => (
              <span key={s.key}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                style={{
                  backgroundColor: s.key === task.stage ? s.color + "20" : "#f5f5f5",
                  color: s.key === task.stage ? s.color : "#9b9b9b",
                  fontWeight: s.key === task.stage ? 700 : 500,
                }}>
                {s.key === task.stage && <Icon name="CheckCircle" size={11} />}
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Детали */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {(task.stone || task.size) && (
            <div className="bg-[#f8f8f8] rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-2">Изделие</p>
              {task.stone && <p className="text-[14px] font-semibold text-[#1a1a1a]">{task.stone}</p>}
              {task.size  && <p className="text-[12px] text-[#6b6b6b] mt-0.5 font-mono">{task.size}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#f8f8f8] rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-1.5">Срок</p>
              <p className={`text-[16px] font-bold ${isOverdue ? "text-red-600" : isSoon ? "text-amber-600" : "text-[#1a1a1a]"}`}>
                {task.deadline || "—"}
              </p>
              {isOverdue && <p className="text-[11px] text-red-500 mt-0.5">просрочен</p>}
              {isSoon && !isOverdue && <p className="text-[11px] text-amber-600 mt-0.5">скоро срок</p>}
            </div>
            <div className="bg-[#f8f8f8] rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-1.5">Ответственный</p>
              <p className="text-[14px] font-semibold text-[#1a1a1a]">{task.manager || "—"}</p>
            </div>
          </div>

          <div className="bg-[#f8f8f8] rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-2">Оплата</p>
            <p className="text-[15px] font-bold text-[#1a1a1a]">{task.amount.toLocaleString("ru")} ₽</p>
            <p className="text-[12px] text-[#6b6b6b] mt-0.5">{task.payment}</p>
            {debt > 0 && <p className="text-[12px] text-red-500 mt-0.5 font-semibold">Долг: {debt.toLocaleString("ru")} ₽</p>}
          </div>

          {task.comment && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2 flex items-center gap-1.5">
                <Icon name="AlertCircle" size={11} />Проблема / узкое место
              </p>
              <p className="text-[13px] text-amber-800">{task.comment}</p>
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div className="shrink-0 px-6 py-4 border-t border-[#f0f0f0] space-y-2">
          {nextCfg && (
            <button
              onClick={() => { onNextStage(task.orderId, task.status); onClose(); }}
              className="w-full bg-[#1a1a1a] text-white text-[13px] font-semibold py-3 rounded-[10px] hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="ArrowRight" size={15} />
              Перевести в «{nextCfg.label}»
            </button>
          )}
          <button onClick={onClose}
            className="w-full border border-[#ebebeb] text-[#6b6b6b] text-[13px] py-2.5 rounded-[10px] hover:bg-[#fafafa] transition-colors">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ГЛАВНЫЙ КОМПОНЕНТ
══════════════════════════════════════════════════════════ */

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
