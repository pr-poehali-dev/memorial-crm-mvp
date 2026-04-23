import Icon from "@/components/ui/icon";
import { LineItem } from "./estimate.types";

type Props = {
  items: LineItem[];
  needsCalc: number;
  calcDone: number;
  approved: boolean;
  onBack?: () => void;
  onApprove: () => void;
};

export default function EstimateHeader({ items, needsCalc, calcDone, approved, onBack, onApprove }: Props) {
  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5">
        {onBack && (
          <>
            <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-[#9b9b9b] hover:text-[#1a1a1a] transition-colors">
              <Icon name="ChevronLeft" size={14} />Заказы
            </button>
            <span className="text-[#d5d5d5]">/</span>
          </>
        )}
        <span className="text-[13px] font-semibold text-[#1a1a1a]">Калькулятор сметы</span>
      </div>

      {/* Order header */}
      <div className="bg-white border border-[#ebebeb] rounded-xl p-5 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="font-mono text-[12px] font-bold text-[#9b9b9b]">МП-0041</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Производство
                </span>
                {needsCalc > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-red-50 text-red-500">
                    <Icon name="AlertCircle" size={10} />{needsCalc} не рассчитано
                  </span>
                )}
              </div>
              <h1 className="text-[18px] font-semibold text-[#1a1a1a] tracking-tight mb-0.5">Смирнова Алла Васильевна</h1>
              <p className="text-[13px] text-[#9b9b9b]">Гранит чёрный · 100×50×8 см · дедлайн 28 апр.</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap justify-end">
            <button className="flex items-center gap-1.5 text-[12px] border border-[#e5e5e5] text-[#4b4b4b] px-3 py-2 rounded-[7px] hover:border-[#c5c5c5] transition-colors">
              <Icon name="Printer" size={12} />Распечатать
            </button>
            <button className="flex items-center gap-1.5 text-[12px] border border-[#e5e5e5] text-[#4b4b4b] px-3 py-2 rounded-[7px] hover:border-[#c5c5c5] transition-colors">
              <Icon name="Download" size={12} />Экспорт PDF
            </button>
            <button
              onClick={onApprove}
              className={`flex items-center gap-1.5 text-[12px] px-3 py-2 rounded-[7px] transition-all
                ${approved ? "bg-green-600 text-white" : "bg-[#1a1a1a] text-white hover:bg-[#333]"}`}>
              <Icon name={approved ? "Check" : "BadgeCheck"} size={12} />
              {approved ? "Смета утверждена!" : "Утвердить смету"}
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4 pt-4 border-t border-[#f5f5f5] grid grid-cols-4 gap-4">
          {[
            { label: "Всего позиций", value: String(items.length),                                              color: "#6b6b6b" },
            { label: "Нужен расчёт",  value: String(needsCalc),                                                 color: needsCalc > 0 ? "#d97706" : "#9b9b9b" },
            { label: "Посчитано",     value: String(calcDone),                                                   color: "#0891b2" },
            { label: "Утверждено",    value: String(items.filter(i => i.status === "approved").length),          color: "#16a34a" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2.5">
              <span className="text-[20px] font-bold" style={{ color: s.color }}>{s.value}</span>
              <span className="text-[11px] text-[#9b9b9b]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
