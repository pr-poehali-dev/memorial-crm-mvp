import { useEffect } from "react";
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

function PanelField({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-start gap-3">
      <span className="text-[12px] text-[#9b9b9b] shrink-0">{label}</span>
      <span className={`text-[12px] text-right ${bold ? "font-semibold text-[#1a1a1a]" : "text-[#1a1a1a] font-medium"}`}>{value}</span>
    </div>
  );
}

type Props = {
  selected: Order;
  onClose: () => void;
  onOpenOrder?: (id: string) => void;
};

export default function OrdersSidePanel({ selected, onClose, onOpenOrder }: Props) {
  /* Закрытие по Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const debt    = selected.amount - selected.paid;
  const paidPct = Math.round((selected.paid / selected.amount) * 100);

  return (
    <>
      {/* Затемнение фона */}
      <div
        className="fixed inset-0 z-40 bg-black/15 backdrop-blur-[1px] transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Панель */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[320px] bg-white border-l border-[#ebebeb] shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">

        {/* Шапка — sticky */}
        <div className="shrink-0 px-5 py-4 border-b border-[#f0f0f0] flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[13px] font-bold text-[#1a1a1a]">{selected.id}</span>
              <span
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                style={{ color: selected.statusColor, backgroundColor: selected.statusColor + "15" }}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: selected.statusColor }} />
                {selected.status}
              </span>
            </div>
            <p className="text-[15px] font-semibold text-[#1a1a1a] truncate">{selected.client}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[11px] text-[#9b9b9b] flex items-center gap-1">
                <Icon name="Calendar" size={10} />
                {selected.deadline}
              </span>
              <span className="text-[11px] text-[#9b9b9b] flex items-center gap-1">
                <Icon name="User" size={10} />
                {selected.manager}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="shrink-0 text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors p-1 mt-0.5">
            <Icon name="X" size={15} />
          </button>
        </div>

        {/* Тело — скроллируется */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Клиент */}
          <PanelSection title="Клиент">
            <PanelField label="Имя"    value={selected.client} bold />
            <PanelField label="Тел."   value={selected.phone} />
          </PanelSection>

          {/* Изделие */}
          <PanelSection title="Изделие">
            <PanelField label="Камень" value={selected.stone} />
            <PanelField label="Размер" value={`${selected.size} см`} />
            <PanelField label="Дизайн" value={selected.design} />
          </PanelSection>

          {/* Надпись */}
          {selected.inscription && (
            <PanelSection title="Надпись">
              <div className="bg-[#fafafa] border border-[#f0f0f0] rounded-lg px-3 py-2.5 text-[12px] text-[#1a1a1a] whitespace-pre-line leading-relaxed">
                {selected.inscription}
              </div>
            </PanelSection>
          )}

          {/* Финансы */}
          <PanelSection title="Финансы">
            <div className="bg-[#fafafa] border border-[#f0f0f0] rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-[#6b6b6b]">Сумма</span>
                <span className="font-bold text-[#1a1a1a]">{selected.amount.toLocaleString("ru")} ₽</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-[#9b9b9b]">Оплачено</span>
                <span className="text-[#16a34a] font-semibold">{selected.paid.toLocaleString("ru")} ₽</span>
              </div>
              {debt > 0 && (
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#9b9b9b]">Остаток</span>
                  <span className="text-red-500 font-semibold">{debt.toLocaleString("ru")} ₽</span>
                </div>
              )}
              {/* Прогресс */}
              <div className="pt-1">
                <div className="flex justify-between text-[10px] text-[#c0c0c0] mb-1">
                  <span>Оплата</span>
                  <span>{paidPct}%</span>
                </div>
                <div className="h-1.5 bg-[#ebebeb] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${paidPct}%`, backgroundColor: paidPct >= 100 ? "#16a34a" : "#6366f1" }}
                  />
                </div>
              </div>
            </div>
          </PanelSection>

          {/* Комментарий */}
          {selected.comment && (
            <PanelSection title="Комментарий">
              <p className="text-[12px] text-[#6b6b6b] leading-relaxed bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
                {selected.comment}
              </p>
            </PanelSection>
          )}

        </div>

        {/* Кнопки — закреплены внизу */}
        <div className="shrink-0 px-5 py-4 border-t border-[#f0f0f0] space-y-2">
          <button
            onClick={() => { onOpenOrder?.(selected.id); onClose(); }}
            className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] text-white text-[13px] font-semibold py-2.5 rounded-[9px] hover:bg-[#333] transition-colors"
          >
            <Icon name="Eye" size={13} />
            Открыть заказ
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-1.5 bg-white border border-[#ebebeb] text-[#4b4b4b] text-[12px] py-2 rounded-[8px] hover:border-[#c5c5c5] transition-colors">
              <Icon name="Pencil" size={12} /> Изменить
            </button>
            <button className="flex items-center justify-center gap-1.5 bg-white border border-[#ebebeb] text-[#4b4b4b] text-[12px] py-2 rounded-[8px] hover:border-[#c5c5c5] transition-colors">
              <Icon name="Banknote" size={12} /> Оплата
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
