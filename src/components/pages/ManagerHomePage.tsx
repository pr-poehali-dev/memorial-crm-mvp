import Icon from "@/components/ui/icon";

const RECENT_ORDERS = [
  { id: "МП-0041", client: "Смирнова А.В.", status: "Производство", statusColor: "#f59e0b", statusBg: "#fffbeb", deadline: "28 апр.", paid: "partial" as const, amount: 38500, paidAmt: 15000 },
  { id: "МП-0040", client: "Козлов И.Д.",   status: "Эскиз",        statusColor: "#2563eb", statusBg: "#eff6ff", deadline: "20 апр.", paid: "unpaid"  as const, amount: 22000, paidAmt: 0 },
  { id: "МП-0039", client: "Петрова О.Н.",  status: "Готов",        statusColor: "#22c55e", statusBg: "#f0fdf4", deadline: "25 апр.", paid: "paid"    as const, amount: 54000, paidAmt: 54000 },
  { id: "МП-0038", client: "Фёдоров С.С.",  status: "Доставка",     statusColor: "#14b8a6", statusBg: "#f0fdfa", deadline: "26 апр.", paid: "paid"    as const, amount: 31000, paidAmt: 31000 },
  { id: "МП-0036", client: "Морозова Т.И.", status: "Производство", statusColor: "#f59e0b", statusBg: "#fffbeb", deadline: "30 апр.", paid: "partial" as const, amount: 46000, paidAmt: 20000 },
];

const PAY_LABEL: Record<"paid" | "partial" | "unpaid", { label: string; color: string }> = {
  paid:    { label: "Оплачен",    color: "#22c55e" },
  partial: { label: "Частично",   color: "#f59e0b" },
  unpaid:  { label: "Не оплачен", color: "#ef4444" },
};

type Props = {
  onNewOrder: () => void;
  onOpenOrder: (id: string) => void;
  onAddClient: () => void;
  onOpenOrders: () => void;
  onOpenEstimate: () => void;
};

export default function ManagerHomePage({ onNewOrder, onOpenOrder, onAddClient, onOpenOrders, onOpenEstimate }: Props) {
  const overdueCount  = 3;
  const unpaidCount   = 4;
  const unpaidAmount  = 81000;

  return (
    <div className="h-full overflow-y-auto bg-[#fafafa]">
      <div className="max-w-[680px] mx-auto px-6 py-10 flex flex-col gap-8">

        {/* Приветствие */}
        <div>
          <h1 className="text-[24px] font-bold text-[#1a1a1a] tracking-tight">Добрый день, Олег 👋</h1>
          <p className="text-[14px] text-[#9b9b9b] mt-1">Что нужно сделать сегодня?</p>
        </div>

        {/* Главная кнопка */}
        <button
          onClick={onNewOrder}
          className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] text-white rounded-2xl py-5 text-[16px] font-semibold hover:bg-[#2a2a2a] active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
        >
          <div className="w-8 h-8 bg-white/15 rounded-xl flex items-center justify-center">
            <Icon name="Plus" size={18} />
          </div>
          Создать заказ
        </button>

        {/* Быстрые действия */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "UserPlus",    label: "Добавить\nклиента",    onClick: onAddClient },
            { icon: "Search",      label: "Найти\nзаказ",         onClick: onOpenOrders },
            { icon: "Calculator",  label: "Калькулятор\nсметы",   onClick: onOpenEstimate },
          ].map((a) => (
            <button
              key={a.label}
              onClick={a.onClick}
              className="flex flex-col items-center gap-2.5 bg-white border border-[#e8e8e8] rounded-2xl py-5 px-3 hover:border-[#c8c8c8] hover:shadow-sm active:scale-[0.97] transition-all"
            >
              <div className="w-10 h-10 bg-[#f5f5f5] rounded-xl flex items-center justify-center">
                <Icon name={a.icon as never} size={18} className="text-[#4a4a4a]" />
              </div>
              <span className="text-[12px] font-medium text-[#3a3a3a] text-center leading-snug whitespace-pre-line">{a.label}</span>
            </button>
          ))}
        </div>

        {/* Требует внимания */}
        {(overdueCount > 0 || unpaidCount > 0) && (
          <div>
            <p className="text-[11px] font-semibold text-[#9b9b9b] uppercase tracking-[0.1em] mb-3">Требует внимания</p>
            <div className="flex flex-col gap-2">
              {overdueCount > 0 && (
                <button
                  onClick={onOpenOrders}
                  className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-2xl px-5 py-4 hover:border-red-300 hover:shadow-sm active:scale-[0.99] transition-all text-left"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                    <Icon name="AlertTriangle" size={18} className="text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-red-700">Просроченные заказы</p>
                    <p className="text-[12px] text-red-400 mt-0.5">МП-0035, МП-0033, МП-0040</p>
                  </div>
                  <span className="text-[28px] font-bold text-red-500 leading-none">{overdueCount}</span>
                </button>
              )}
              {unpaidCount > 0 && (
                <button
                  onClick={onOpenOrders}
                  className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 hover:border-amber-300 hover:shadow-sm active:scale-[0.99] transition-all text-left"
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <Icon name="CreditCard" size={18} className="text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-amber-700">Ждут оплаты</p>
                    <p className="text-[12px] text-amber-400 mt-0.5">Долг: {unpaidAmount.toLocaleString("ru")} ₽</p>
                  </div>
                  <span className="text-[28px] font-bold text-amber-500 leading-none">{unpaidCount}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Последние заказы */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-[#9b9b9b] uppercase tracking-[0.1em]">Последние заказы</p>
            <button onClick={onOpenOrders} className="text-[12px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
              Все заказы →
            </button>
          </div>
          <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden">
            {RECENT_ORDERS.map((o, i) => {
              const pay = PAY_LABEL[o.paid];
              const isLast = i === RECENT_ORDERS.length - 1;
              return (
                <button
                  key={o.id}
                  onClick={() => onOpenOrder(o.id)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 hover:bg-[#fafafa] active:bg-[#f5f5f5] transition-colors text-left ${!isLast ? "border-b border-[#f0f0f0]" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-mono text-[#b5b5b5]">{o.id}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: o.statusColor, backgroundColor: o.statusBg }}>
                        {o.status}
                      </span>
                    </div>
                    <p className="text-[13px] font-medium text-[#1a1a1a] truncate">{o.client}</p>
                    <p className="text-[11px] text-[#b5b5b5] mt-0.5">до {o.deadline}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-semibold text-[#1a1a1a]">{o.amount.toLocaleString("ru")} ₽</p>
                    <p className="text-[11px] mt-0.5 font-medium" style={{ color: pay.color }}>{pay.label}</p>
                  </div>
                  <Icon name="ChevronRight" size={14} className="text-[#d5d5d5] shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}