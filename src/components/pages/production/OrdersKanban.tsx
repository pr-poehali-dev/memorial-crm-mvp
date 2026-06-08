import Icon from "@/components/ui/icon";
import { DbProductionOrder } from "@/api/client";

const STAGES = ["Эскиз", "Производство", "Гравировка", "Полировка", "Готов", "Доставка"] as const;

const STAGE_COLOR: Record<string, string> = {
  "Эскиз":        "#6366f1",
  "Производство": "#f59e0b",
  "Гравировка":   "#ec4899",
  "Полировка":    "#14b8a6",
  "Готов":        "#22c55e",
  "Доставка":     "#6b7280",
};

const STAGE_BG: Record<string, string> = {
  "Эскиз":        "#eef2ff",
  "Производство": "#fffbeb",
  "Гравировка":   "#fdf2f8",
  "Полировка":    "#f0fdfa",
  "Готов":        "#f0fdf4",
  "Доставка":     "#f9fafb",
};

const NEXT_STATUS: Record<string, string> = {
  "Эскиз":        "Производство",
  "Производство": "Гравировка",
  "Гравировка":   "Полировка",
  "Полировка":    "Готов",
  "Готов":        "Доставка",
  "Доставка":     "",
};

type Props = {
  orders: DbProductionOrder[];
  onOpenOrder: (id: string) => void;
  onNextStage: (id: string, currentStatus: string) => void;
};

function OrderCard({ o, onOpen, onNext }: {
  o: DbProductionOrder;
  onOpen: () => void;
  onNext: () => void;
}) {
  const isOverdue = o.deadline_state === "overdue";
  const isSoon    = o.deadline_state === "soon";
  const debt      = Math.max(0, Number(o.amount) - Number(o.paid));
  const nextStage = NEXT_STATUS[o.status];

  return (
    <div
      className={`bg-white border rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group
        ${isOverdue ? "border-red-200 bg-red-50/30" : "border-[#ebebeb]"}`}
      onClick={onOpen}
    >
      {/* Шапка карточки */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[12px] font-bold text-[#6366f1] font-mono">{o.id}</span>
        {isOverdue && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-md shrink-0">
            <Icon name="AlertTriangle" size={9} />Просрочен
          </span>
        )}
        {isSoon && !isOverdue && (
          <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-md shrink-0">Скоро</span>
        )}
      </div>

      {/* Клиент */}
      <p className="text-[13px] font-semibold text-[#1a1a1a] mb-0.5 leading-tight">{o.client_name}</p>
      {o.stone && <p className="text-[11px] text-[#9b9b9b] mb-2">{o.stone}{o.size ? ` · ${o.size}` : ""}</p>}

      {/* Срок + сумма */}
      <div className="flex items-center justify-between text-[11px] mt-2">
        {o.deadline ? (
          <span className={`flex items-center gap-1 ${isOverdue ? "text-red-600 font-semibold" : "text-[#9b9b9b]"}`}>
            <Icon name="Calendar" size={10} />
            {new Date(o.deadline).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}
          </span>
        ) : <span />}
        {debt > 0 ? (
          <span className="text-red-600 font-semibold">{debt.toLocaleString("ru")} ₽</span>
        ) : (
          <span className="text-green-600 font-semibold">{Number(o.amount).toLocaleString("ru")} ₽</span>
        )}
      </div>

      {/* Кнопка следующий этап */}
      {nextStage && (
        <button
          onClick={e => { e.stopPropagation(); onNext(); }}
          className="mt-2.5 w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold border border-[#e8e8e8] text-[#6b6b6b] rounded-lg py-1.5 hover:border-[#1a1a1a] hover:text-[#1a1a1a] hover:bg-[#fafafa] transition-all opacity-0 group-hover:opacity-100"
        >
          → {nextStage}
        </button>
      )}
    </div>
  );
}

export default function OrdersKanban({ orders, onOpenOrder, onNextStage }: Props) {
  return (
    <div className="flex gap-3 h-full overflow-x-auto px-7 py-4 pb-6">
      {STAGES.map(stage => {
        const cols = orders.filter(o => o.status === stage);
        const color = STAGE_COLOR[stage];
        const bg    = STAGE_BG[stage];

        return (
          <div key={stage} className="flex flex-col shrink-0 w-[220px]">
            {/* Шапка колонки */}
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-2"
              style={{ backgroundColor: bg, border: `1px solid ${color}22` }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[12px] font-bold text-[#1a1a1a]">{stage}</span>
              </div>
              <span
                className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: color + "22", color }}
              >
                {cols.length}
              </span>
            </div>

            {/* Карточки */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
              {cols.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-center">
                  <p className="text-[12px] text-[#c5c5c5]">Пусто</p>
                </div>
              ) : (
                cols.map(o => (
                  <OrderCard
                    key={o.id}
                    o={o}
                    onOpen={() => onOpenOrder(o.id)}
                    onNext={() => onNextStage(o.id, o.status)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
