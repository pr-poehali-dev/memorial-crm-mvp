import Icon from "@/components/ui/icon";
import { useNav } from "@/store/navStore";
import { FlatItem, DEADLINE_BADGE, COL_NEXT_LABEL } from "./production.types";

type Props = {
  item: FlatItem;
  allItems: { id: string; type: string; status: string; progress: number }[];
  onClose: () => void;
  onMoveNext: () => void;
};

export default function ProductionDetailDrawer({ item, onClose, onMoveNext }: Props) {
  const nextLabel = COL_NEXT_LABEL[item.colId];
  const dl = DEADLINE_BADGE[item.deadlineState];
  const { openOrder } = useNav();

  return (
    <>
      <div className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-[420px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden">

        {/* Шапка */}
        <div className="shrink-0 px-6 py-5 border-b border-[#f0f0f0]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[22px] font-black text-[#1a1a1a]">{item.orderId}</span>
                <span
                  className="text-[13px] font-semibold px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: item.colColor + "18", color: item.colColor }}
                >
                  {item.colLabel}
                </span>
              </div>
              <p className="text-[14px] text-[#6b6b6b] mt-1">{item.client}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9b9b9b] hover:bg-[#f4f4f4] hover:text-[#1a1a1a] transition-colors shrink-0"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {item.urgent && (
              <span className="text-[11px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase">срочно</span>
            )}
            {dl.label && (
              <span className="text-[12px] font-semibold px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: dl.bg, color: dl.color }}>
                {dl.label}
              </span>
            )}
          </div>
        </div>

        {/* Тело */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="bg-[#f9f9f9] rounded-[14px] p-4 space-y-3">
            <p className="text-[11px] font-bold text-[#b0b0b0] uppercase tracking-widest">Детали</p>
            {(item.stone || item.size) && (
              <InfoRow icon="Layers" label="Материал" value={[item.stone, item.size].filter(Boolean).join(" · ")} />
            )}
            <InfoRow icon="User"     label="Ответственный" value={item.manager} />
            <InfoRow icon="Calendar" label="Срок"          value={item.deadline} highlight={item.deadlineState !== "ok"} />
            {item.payment && <InfoRow icon="CreditCard" label="Оплата" value={item.payment} />}
          </div>

          {item.problem && (
            <div className="bg-red-50 border border-red-100 rounded-[14px] p-4 flex gap-3">
              <Icon name="AlertTriangle" size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-semibold text-red-600 mb-1">Комментарий</p>
                <p className="text-[13px] text-red-800">{item.problem}</p>
              </div>
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div className="shrink-0 px-6 py-4 border-t border-[#f0f0f0] space-y-2">
          {nextLabel && (
            <button
              onClick={onMoveNext}
              className="w-full flex items-center justify-center gap-2 rounded-[12px] py-3 text-[14px] font-bold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: item.colColor }}
            >
              <Icon name="ArrowRight" size={15} />
              Следующий этап: {nextLabel}
            </button>
          )}
          <button
            onClick={() => { onClose(); openOrder(item.orderId); }}
            className="w-full flex items-center justify-center gap-2 bg-[#f4f4f4] hover:bg-[#ebebeb] rounded-[12px] py-3 text-[14px] font-semibold text-[#4b4b4b] transition-colors"
          >
            <Icon name="FileText" size={14} />
            Открыть заказ {item.orderId}
          </button>
        </div>
      </div>
    </>
  );
}

function InfoRow({ icon, label, value, highlight = false }: {
  icon: string; label: string; value: string; highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon name={icon as never} size={14} className="text-[#b0b0b0] shrink-0" />
      <span className="text-[12px] text-[#8a8a8a] w-[110px] shrink-0">{label}</span>
      <span className={`text-[13px] font-medium ${highlight ? "text-red-500 font-semibold" : "text-[#1a1a1a]"}`}>
        {value}
      </span>
    </div>
  );
}