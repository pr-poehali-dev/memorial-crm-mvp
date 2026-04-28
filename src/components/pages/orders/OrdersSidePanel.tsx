import Icon from "@/components/ui/icon";
import { Order } from "./orders.types";

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wider mb-2">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function PanelField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-3">
      <span className="text-[12px] text-[#9b9b9b] shrink-0">{label}</span>
      <span className="text-[12px] text-[#1a1a1a] text-right font-medium">{value}</span>
    </div>
  );
}

type Props = {
  selected: Order;
  onClose: () => void;
};

export default function OrdersSidePanel({ selected, onClose }: Props) {
  return (
    <div className="w-[300px] shrink-0 border-l border-[#ebebeb] bg-white overflow-y-auto animate-slide-in-right">
      <div className="p-5 border-b border-[#f5f5f5] flex items-center justify-between sticky top-0 bg-white z-10">
        <div>
          <span className="font-mono text-[12px] font-bold text-[#1a1a1a]">{selected.id}</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selected.statusColor }} />
            <span className="text-[12px] font-medium" style={{ color: selected.statusColor }}>{selected.status}</span>
          </div>
        </div>
        <button onClick={onClose} className="text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors p-1">
          <Icon name="X" size={14} />
        </button>
      </div>

      <div className="p-5 space-y-5">
        <PanelSection title="Клиент">
          <PanelField label="Имя" value={selected.client} />
          <PanelField label="Телефон" value={selected.phone} />
        </PanelSection>

        <PanelSection title="Памятник">
          <PanelField label="Камень" value={selected.stone} />
          <PanelField label="Размер" value={`${selected.size} см`} />
          <PanelField label="Дизайн" value={selected.design} />
        </PanelSection>

        <PanelSection title="Надпись">
          <div className="bg-[#fafafa] border border-[#f0f0f0] rounded-lg p-3 text-[12px] text-[#1a1a1a] whitespace-pre-line leading-relaxed">
            {selected.inscription}
          </div>
        </PanelSection>

        <PanelSection title="Смета">
          <div className="space-y-2 bg-[#fafafa] border border-[#f0f0f0] rounded-lg p-3">
            {[
              ["Изготовление", Math.round(selected.amount * 0.7)],
              ["Гравировка",   Math.round(selected.amount * 0.2)],
              ["Доставка",     Math.round(selected.amount * 0.1)],
            ].map(([l, v]) => (
              <div key={String(l)} className="flex justify-between text-[12px]">
                <span className="text-[#9b9b9b]">{l}</span>
                <span className="text-[#1a1a1a]">{Number(v).toLocaleString("ru")} ₽</span>
              </div>
            ))}
            <div className="border-t border-[#ebebeb] pt-2 flex justify-between text-[13px] font-semibold">
              <span>Итого</span>
              <span>{selected.amount.toLocaleString("ru")} ₽</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-[#9b9b9b]">Оплачено</span>
              <span className="text-[#16a34a] font-medium">{selected.paid.toLocaleString("ru")} ₽</span>
            </div>
            {selected.amount - selected.paid > 0 && (
              <div className="flex justify-between text-[12px]">
                <span className="text-[#9b9b9b]">Долг</span>
                <span className="text-red-500 font-semibold">{(selected.amount - selected.paid).toLocaleString("ru")} ₽</span>
              </div>
            )}
          </div>
        </PanelSection>

        {selected.comment && (
          <PanelSection title="Комментарий">
            <p className="text-[12px] text-[#6b6b6b] leading-relaxed bg-amber-50 border border-amber-100 rounded-lg p-3">
              {selected.comment}
            </p>
          </PanelSection>
        )}

        <PanelSection title="Дедлайн">
          <div className="flex items-center justify-between">
            <span className={`text-[13px] font-semibold ${selected.deadlineState === "overdue" ? "text-red-500" : "text-[#1a1a1a]"}`}>
              {selected.deadline}
            </span>
            {selected.deadlineState === "overdue" && (
              <span className="text-[11px] bg-red-50 text-red-500 px-2 py-0.5 rounded-md font-semibold">просрочен</span>
            )}
          </div>
        </PanelSection>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button className="flex items-center justify-center gap-2 bg-[#1a1a1a] text-white text-[12px] px-3 py-2.5 rounded-[8px] hover:bg-[#333] transition-colors">
            <Icon name="Pencil" size={12} /> Редактировать
          </button>
          <button className="flex items-center justify-center gap-2 bg-white border border-[#ebebeb] text-[#4b4b4b] text-[12px] px-3 py-2.5 rounded-[8px] hover:border-[#c5c5c5] transition-colors">
            <Icon name="Banknote" size={12} /> Оплата
          </button>
          <button className="flex items-center justify-center gap-2 bg-white border border-[#ebebeb] text-[#4b4b4b] text-[12px] px-3 py-2.5 rounded-[8px] hover:border-[#c5c5c5] transition-colors col-span-2">
            <Icon name="RefreshCw" size={12} /> Изменить статус
          </button>
        </div>
      </div>
    </div>
  );
}
