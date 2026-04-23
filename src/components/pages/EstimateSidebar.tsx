import Icon from "@/components/ui/icon";
import { CATEGORY_META } from "@/data/catalog";
import { LineItem, CAT_META } from "./estimate.types";

type Props = {
  items: LineItem[];
  totalPrice: number;
  totalCost: number;
  totalMargin: number;
  marginPct: number;
  needsCalc: number;
  saved: boolean;
  onSave: () => void;
};

export default function EstimateSidebar({
  items, totalPrice, totalCost, totalMargin, marginPct, needsCalc, saved, onSave,
}: Props) {
  return (
    <div className="w-[256px] shrink-0 space-y-4 sticky top-6">

      {/* Totals card */}
      <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
        <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-4">Итоги сметы</p>

        <div className="space-y-3 mb-4">
          <TotalRow label="Сумма (продажа)" value={`${totalPrice.toLocaleString("ru")} ₽`} bold />
          <TotalRow label="Себестоимость"   value={`${totalCost.toLocaleString("ru")} ₽`} />
          <div className="border-t border-[#f5f5f5] pt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] text-[#9b9b9b]">Маржа</span>
              <span className="text-[15px] font-bold text-[#16a34a]">{totalMargin.toLocaleString("ru")} ₽</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                <div className="h-full bg-[#22c55e] rounded-full transition-all" style={{ width: `${marginPct}%` }} />
              </div>
              <span className={`text-[13px] font-bold ${marginPct >= 30 ? "text-[#16a34a]" : marginPct >= 15 ? "text-[#d97706]" : "text-red-500"}`}>
                {marginPct}%
              </span>
            </div>
            <p className="text-[10px] text-[#b5b5b5] mt-1">
              {marginPct >= 30 ? "Хорошая маржа" : marginPct >= 15 ? "Допустимая маржа" : "Маржа ниже нормы"}
            </p>
          </div>
        </div>

        {needsCalc > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 mb-3">
            <div className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={12} className="text-amber-500" />
              <span className="text-[12px] font-semibold text-amber-700">{needsCalc} позиции без цены</span>
            </div>
            <p className="text-[11px] text-amber-600 mt-0.5">Итоговая сумма неполная</p>
          </div>
        )}

        <button
          onClick={onSave}
          className={`w-full flex items-center justify-center gap-2 text-[13px] py-2.5 rounded-[8px] transition-all
            ${saved ? "bg-green-600 text-white" : "bg-[#1a1a1a] text-white hover:bg-[#333]"}`}>
          <Icon name={saved ? "Check" : "Save"} size={13} />
          {saved ? "Сохранено!" : "Сохранить смету"}
        </button>
      </div>

      {/* Breakdown by category */}
      <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
        <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-3">По категориям</p>
        <div className="space-y-2.5">
          {(Object.keys(CATEGORY_META) as string[]).map(cat => {
            const catItems = items.filter(i => i.category === cat);
            if (catItems.length === 0) return null;
            const catSum = catItems.reduce((s, i) => s + i.price * i.qty, 0);
            const catPct = totalPrice > 0 ? Math.round((catSum / totalPrice) * 100) : 0;
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-medium" style={{ color: CAT_META(cat).color }}>
                    {CAT_META(cat).label}
                  </span>
                  <span className="text-[12px] font-semibold text-[#1a1a1a]">{catSum.toLocaleString("ru")} ₽</span>
                </div>
                <div className="h-1.5 bg-[#f5f5f5] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${catPct}%`, backgroundColor: CAT_META(cat).color + "80" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Responsible */}
      <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
        <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-3">Ответственные</p>
        <div className="space-y-2.5">
          <PersonRow role="Менеджер" name="Олег Краснов"    color="#6366f1" />
          <PersonRow role="Сметчик"  name="Дмитрий Соколов" color="#f59e0b" />
        </div>
        <div className="mt-3 pt-3 border-t border-[#f5f5f5] space-y-1.5 text-[11px] text-[#9b9b9b]">
          <div className="flex items-center gap-1.5">
            <Icon name="BadgeCheck" size={11} className="text-green-500" />
            Утверждённые позиции не пересчитываются
          </div>
          <div className="flex items-center gap-1.5">
            <Icon name="Calculator" size={11} className="text-amber-500" />
            Сметчик считает только «Нужен расчёт»
          </div>
        </div>
      </div>
    </div>
  );
}

function TotalRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-[#9b9b9b]">{label}</span>
      <span className={`text-[13px] ${bold ? "font-bold text-[#1a1a1a]" : "font-semibold text-[#6b6b6b]"}`}>{value}</span>
    </div>
  );
}

function PersonRow({ role, name, color }: { role: string; name: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
        style={{ backgroundColor: color }}>{name[0]}</div>
      <div>
        <p className="text-[12px] font-semibold text-[#1a1a1a] leading-none mb-0.5">{name}</p>
        <p className="text-[10px] text-[#b5b5b5]">{role}</p>
      </div>
    </div>
  );
}
