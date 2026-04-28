import Icon from "@/components/ui/icon";
import { Order } from "./orders.types";

type Props = {
  orders: Order[];
  onOpenOrder?: (id: string) => void;
};

export default function OrdersControlBoard({ orders, onOpenOrder }: Props) {
  const overdue = orders.filter(o => o.deadlineState === "overdue");
  const unpaid  = orders.filter(o => o.payStatus !== "paid" && o.deadlineState !== "overdue");
  const inwork  = orders.filter(o =>
    ["Эскиз","Производство","Доставка"].includes(o.status) &&
    o.deadlineState !== "overdue" &&
    o.payStatus === "paid"
  );

  const cols = [
    {
      id: "overdue",
      label: "Просроченные",
      icon: "AlertTriangle",
      color: "#ef4444",
      bg: "#fef2f2",
      border: "#fecaca",
      headerBg: "#fee2e2",
      items: overdue,
    },
    {
      id: "unpaid",
      label: "Без оплаты",
      icon: "CreditCard",
      color: "#d97706",
      bg: "#fffbeb",
      border: "#fde68a",
      headerBg: "#fef3c7",
      items: unpaid,
    },
    {
      id: "inwork",
      label: "В работе",
      icon: "Hammer",
      color: "#6b6b6b",
      bg: "#fafafa",
      border: "#ebebeb",
      headerBg: "#f5f5f5",
      items: inwork,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 items-start">
      {cols.map(col => (
        <div key={col.id} className="flex flex-col gap-2">
          {/* Заголовок колонки */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border"
            style={{ backgroundColor: col.headerBg, borderColor: col.border }}>
            <Icon name={col.icon as never} size={13} style={{ color: col.color }} />
            <span className="text-[13px] font-semibold flex-1" style={{ color: col.color }}>{col.label}</span>
            <span className="text-[12px] font-bold px-2 py-0.5 rounded-md bg-white/70"
              style={{ color: col.color }}>{col.items.length}</span>
          </div>

          {/* Карточки */}
          {col.items.length === 0 && (
            <div className="border border-dashed border-[#e5e5e5] rounded-xl py-6 text-center text-[12px] text-[#c5c5c5]">
              нет заказов
            </div>
          )}
          {col.items.map(o => {
            const debt = o.amount - o.paid;
            return (
              <button
                key={o.id}
                onClick={() => onOpenOrder?.(o.id)}
                className="w-full text-left bg-white border rounded-xl px-4 py-3.5 flex flex-col gap-2 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
                style={{ borderColor: col.border }}
              >
                {/* Номер + клиент */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-[#9b9b9b]">{o.id}</span>
                    <p className="text-[13px] font-semibold text-[#1a1a1a] mt-0.5 leading-snug">{o.client}</p>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md shrink-0 mt-0.5"
                    style={{ backgroundColor: o.statusColor + "18", color: o.statusColor }}>
                    {o.status}
                  </span>
                </div>

                {/* Дедлайн */}
                {o.deadline && (
                  <div className="flex items-center gap-1.5">
                    <Icon name="Calendar" size={11} className={o.deadlineState === "overdue" ? "text-red-400" : "text-[#b5b5b5]"} />
                    <span className={`text-[11px] font-medium ${o.deadlineState === "overdue" ? "text-red-500" : "text-[#9b9b9b]"}`}>
                      {o.deadline}
                      {o.deadlineState === "overdue" && " · просрочен"}
                    </span>
                  </div>
                )}

                {/* Сумма + долг */}
                <div className="flex items-center justify-between pt-1 border-t border-[#f5f5f5]">
                  <span className="text-[12px] font-semibold text-[#1a1a1a]">
                    {o.amount.toLocaleString("ru")} ₽
                  </span>
                  {debt > 0 && (
                    <span className="text-[11px] font-semibold text-red-500">
                      долг {debt.toLocaleString("ru")} ₽
                    </span>
                  )}
                  {debt === 0 && (
                    <span className="text-[11px] text-[#22c55e] font-medium">оплачен</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
