import Icon from "@/components/ui/icon";
import { Deceased, OrderItem, MANAGERS, ESTIMATORS } from "./newOrder.types";

type Props = {
  clientName: string;
  clientPhone: string;
  deceased: Deceased[];
  items: OrderItem[];
  stone: string;
  deadline: string;
  total: number;
  needsCalcCount: number;
  manager: string;
  estimator: string;
  onManagerChange: (v: string) => void;
  onEstimatorChange: (v: string) => void;
};

export default function NewOrderSidebar({
  clientName, clientPhone, deceased, items, stone, deadline,
  total, needsCalcCount, manager, estimator,
  onManagerChange, onEstimatorChange,
}: Props) {
  const checklist = [
    { label: "Заказчик заполнен",   done: !!clientName && !!clientPhone },
    { label: "Умерший(ие) указаны", done: deceased.some(d => d.lastName) },
    { label: "Позиции добавлены",   done: items.length > 0 },
    { label: "Материал выбран",      done: !!stone },
    { label: "Дедлайн указан",       done: !!deadline },
  ];

  return (
    <div className="w-[260px] shrink-0 space-y-4 sticky top-6">

      {/* Order summary */}
      <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
        <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-4">Сводка заказа</p>
        <div className="space-y-3">
          <SummaryRow icon="User"     label="Заказчик" value={clientName || <span className="text-[#c5c5c5]">не указан</span>} />
          <SummaryRow icon="Heart"    label="Умерших"  value={`${deceased.length} чел.`} />
          <SummaryRow icon="Layers"   label="Позиций"  value={`${items.length} шт.`} />
          <SummaryRow icon="Box"      label="Материал" value={stone || <span className="text-[#c5c5c5]">не выбран</span>} />
          <SummaryRow icon="Calendar" label="Дедлайн"  value={deadline || <span className="text-[#c5c5c5]">не указан</span>} />
        </div>

        {needsCalcCount > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Calculator" size={12} className="text-amber-500" />
              <span className="text-[12px] font-semibold text-amber-700">Нужен расчёт</span>
            </div>
            <p className="text-[11px] text-amber-600">{needsCalcCount} позиции отправятся сметчику</p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-[#f5f5f5]">
          <div className="flex justify-between items-baseline">
            <span className="text-[12px] text-[#9b9b9b]">Итого (предв.)</span>
            <span className="text-[18px] font-bold text-[#1a1a1a]">{total.toLocaleString("ru")} ₽</span>
          </div>
        </div>
      </div>

      {/* Responsible */}
      <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
        <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-4">Ответственные</p>
        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-[#9b9b9b] block mb-1.5">Менеджер (создаёт)</label>
            <select value={manager} onChange={e => onManagerChange(e.target.value)}
              className="w-full bg-[#fafafa] border border-[#ebebeb] rounded-lg px-3 py-2 text-[12px] font-semibold text-[#1a1a1a] outline-none focus:border-[#c0c0c0] transition-colors cursor-pointer">
              {MANAGERS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-[#9b9b9b] block mb-1.5">Сметчик (проверяет)</label>
            <select value={estimator} onChange={e => onEstimatorChange(e.target.value)}
              className="w-full bg-[#fafafa] border border-[#ebebeb] rounded-lg px-3 py-2 text-[12px] font-semibold text-[#1a1a1a] outline-none focus:border-[#c0c0c0] transition-colors cursor-pointer">
              {ESTIMATORS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[#f5f5f5] space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] text-[#9b9b9b]">
            <Icon name="Info" size={11} />
            <span>Сметчик получит уведомление</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#9b9b9b]">
            <Icon name="BadgeCheck" size={11} />
            <span>Утверждённые позиции — без пересчёта</span>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
        <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-3">Чеклист</p>
        <div className="space-y-2">
          {checklist.map((c) => (
            <div key={c.label} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all
                ${c.done ? "bg-[#22c55e]" : "bg-[#f0f0f0]"}`}>
                {c.done && <Icon name="Check" size={9} className="text-white" />}
              </div>
              <span className={`text-[12px] ${c.done ? "text-[#1a1a1a]" : "text-[#b5b5b5]"}`}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ icon, label, value }: { icon: string; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon name={icon as never} size={12} className="text-[#c5c5c5] shrink-0" />
      <span className="text-[12px] text-[#9b9b9b] shrink-0">{label}</span>
      <span className="text-[12px] font-medium text-[#1a1a1a] ml-auto text-right truncate max-w-[120px]">{value}</span>
    </div>
  );
}
