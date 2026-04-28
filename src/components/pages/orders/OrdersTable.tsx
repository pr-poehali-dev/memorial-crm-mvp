import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Order, PAY_LABELS, DEADLINE_ROW } from "./orders.types";

function ActionBtn({ icon, title, onClick }: { icon: string; title: string; onClick?: () => void }) {
  return (
    <button
      title={title}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className="w-7 h-7 flex items-center justify-center rounded-[6px] bg-white border border-[#e5e5e5] text-[#6b6b6b] hover:text-[#1a1a1a] hover:border-[#c5c5c5] transition-all"
    >
      <Icon name={icon as never} size={12} />
    </button>
  );
}

type Props = {
  filtered: Order[];
  selected: Order | null;
  onSelect: (o: Order) => void;
  onOpenOrder?: (id: string) => void;
};

export default function OrdersTable({ filtered, selected, onSelect, onOpenOrder }: Props) {
  const [actionRow, setActionRow] = useState<string | null>(null);

  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#f0f0f0]">
            {["Заказ / Клиент", "Изделие", "Дедлайн", "Статус", "Менеджер", "Оплата", ""].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-[13px] text-[#b5b5b5]">Заказы не найдены</td>
            </tr>
          )}
          {filtered.map((o, i) => {
            const pay = PAY_LABELS[o.payStatus];
            const debt = o.amount - o.paid;
            const isLast = i === filtered.length - 1;
            return (
              <tr
                key={o.id}
                onClick={() => { onSelect(o); }}
                onMouseEnter={() => setActionRow(o.id)}
                onMouseLeave={() => setActionRow(null)}
                className={`cursor-pointer transition-colors relative
                  ${DEADLINE_ROW[o.deadlineState]}
                  ${selected?.id === o.id ? "!bg-[#f0f4ff]" : ""}
                  ${!isLast ? "border-b border-[#f5f5f5]" : ""}
                `}
              >
                {/* Заказ + Клиент */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    {o.deadlineState === "overdue" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    )}
                    {o.deadlineState === "soon" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    )}
                    <span className="font-mono text-[12px] font-bold text-[#1a1a1a]">{o.id}</span>
                  </div>
                  <div className="text-[13px] font-medium text-[#1a1a1a]">{o.client}</div>
                  <div className="text-[11px] text-[#b5b5b5]">{o.phone}</div>
                  {o.comment && (
                    <div className="text-[11px] text-[#9b9b9b] mt-0.5 max-w-[180px] truncate" title={o.comment}>
                      {o.comment}
                    </div>
                  )}
                </td>

                {/* Изделие */}
                <td className="px-4 py-3">
                  <div className="text-[12px] text-[#1a1a1a] font-medium">{o.stone}</div>
                  <div className="text-[11px] text-[#9b9b9b] font-mono">{o.size} см</div>
                  <div className="text-[11px] text-[#b5b5b5]">{o.design}</div>
                </td>

                {/* Дедлайн */}
                <td className="px-4 py-3 whitespace-nowrap">
                  {o.deadlineState === "overdue" && (
                    <div className="text-[11px] font-semibold text-red-500 mb-0.5 flex items-center gap-1">
                      <Icon name="AlertTriangle" size={10} />просрочен
                    </div>
                  )}
                  {o.deadlineState === "soon" && (
                    <div className="text-[11px] font-semibold text-amber-500 mb-0.5">скоро</div>
                  )}
                  {o.deadlineState === "done" && (
                    <div className="text-[11px] text-[#9b9b9b] mb-0.5">выполнен</div>
                  )}
                  <div className={`text-[12px] font-medium ${o.deadlineState === "overdue" ? "text-red-600" : "text-[#1a1a1a]"}`}>
                    {o.deadline}
                  </div>
                  <div className="text-[11px] text-[#b5b5b5]">создан {o.date}</div>
                </td>

                {/* Статус */}
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold whitespace-nowrap" style={{ color: o.statusColor }}>
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: o.statusColor }} />
                    {o.status}
                  </span>
                </td>

                {/* Менеджер */}
                <td className="px-4 py-3">
                  <span className="text-[11px] bg-[#f5f5f5] text-[#5b5b5b] px-2 py-1 rounded-md font-medium">
                    {o.manager}
                  </span>
                </td>

                {/* Оплата */}
                <td className="px-4 py-3">
                  <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md mb-1"
                    style={{ color: pay.color, backgroundColor: pay.bg }}>
                    {pay.label}
                  </span>
                  <div className="text-[11px] text-[#1a1a1a] font-medium">{o.amount.toLocaleString("ru")} ₽</div>
                  {debt > 0 && (
                    <div className="text-[11px] text-red-500">долг {debt.toLocaleString("ru")} ₽</div>
                  )}
                </td>

                {/* Быстрые действия */}
                <td className="px-3 py-3">
                  <div className={`flex items-center gap-1 transition-opacity ${actionRow === o.id ? "opacity-100" : "opacity-0"}`}>
                    <ActionBtn icon="Eye" title="Открыть" onClick={() => onOpenOrder?.(o.id)} />
                    <ActionBtn icon="Pencil" title="Редактировать" />
                    <ActionBtn icon="Banknote" title="Добавить оплату" />
                    <ActionBtn icon="RefreshCw" title="Изменить статус" />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
