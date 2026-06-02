import Icon from "@/components/ui/icon";
import { Task, STAGE_CONFIG } from "./tasks.types";

export default function TaskDrawer({ task, onClose, onNextStage }: {
  task: Task;
  onClose: () => void;
  onNextStage: (id: string, status: string) => void;
}) {
  const cfgIdx  = STAGE_CONFIG.findIndex(s => s.key === task.stage);
  const nextCfg = cfgIdx < STAGE_CONFIG.length - 1 ? STAGE_CONFIG[cfgIdx + 1] : null;
  const debt      = Math.max(0, task.amount - task.paid);
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
            {STAGE_CONFIG.map(s => (
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
