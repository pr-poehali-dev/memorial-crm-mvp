import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Task, TaskFilter, Stage, STAGE_CONFIG } from "./tasks.types";

export default function TasksList({ tasks, stageFilter, filter, search, onOpen }: {
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
              {visible.map((t) => {
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
