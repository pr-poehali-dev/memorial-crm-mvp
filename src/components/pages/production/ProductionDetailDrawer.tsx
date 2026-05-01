import Icon from "@/components/ui/icon";
import {
  FlatItem, OrderItem, DEADLINE_BADGE,
  COL_NEXT_LABEL, ITEM_STATUS_LABEL, MACHINE_PLACE,
} from "./production.types";

type Props = {
  item: FlatItem;
  allItems: OrderItem[];
  onClose: () => void;
  onMoveNext: () => void;
};

export default function ProductionDetailDrawer({ item, allItems, onClose, onMoveNext }: Props) {
  const nextLabel = COL_NEXT_LABEL[item.colId];
  const st = ITEM_STATUS_LABEL[item.itemStatus];
  const machine = item.machineId ? MACHINE_PLACE[item.machineId] : null;
  const doneCount  = allItems.filter(i => i.status === "done").length;
  const totalCount = allItems.length;
  return (
    <>
      <div
        className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-40"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-[420px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        <div className="shrink-0 px-6 py-5 border-b border-[#f0f0f0]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[22px] font-black text-[#1a1a1a]">{item.orderId}</span>
                <span
                  className="text-[14px] font-black uppercase tracking-wide px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: item.colColor + "18", color: item.colColor }}
                >
                  {item.itemType}
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
            <span className="text-[12px] font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: st.bg, color: st.color }}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${st.dot} mr-1.5`} />
              {st.label}
            </span>
            <span
              className="text-[12px] font-semibold px-2.5 py-1 rounded-lg"
              style={{ backgroundColor: item.colColor + "18", color: item.colColor }}
            >
              {item.colLabel}
            </span>
            {item.urgent && (
              <span className="text-[11px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase">
                срочно
              </span>
            )}
            {DEADLINE_BADGE[item.deadlineState].label && (
              <span
                className="text-[12px] font-semibold px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: DEADLINE_BADGE[item.deadlineState].bg, color: DEADLINE_BADGE[item.deadlineState].color }}
              >
                {DEADLINE_BADGE[item.deadlineState].label}
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold text-[#6b6b6b] uppercase tracking-wide">Прогресс изделия</span>
              <span className="text-[14px] font-black" style={{ color: item.colColor }}>{item.itemProgress}%</span>
            </div>
            <div className="h-2.5 bg-[#f0f0f0] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${item.itemProgress}%`, backgroundColor: item.colColor }}
              />
            </div>
          </div>
          <div className="bg-[#f9f9f9] rounded-[14px] p-4 space-y-3">
            <p className="text-[11px] font-bold text-[#b0b0b0] uppercase tracking-widest">Детали</p>
            <InfoRow icon="Layers" label="Материал" value={`${item.stone} · ${item.size}`} />
            {machine && <InfoRow icon="MapPin" label="Место" value={machine} />}
            <InfoRow icon="User"     label="Ответственный" value={item.manager} />
            <InfoRow icon="Calendar" label="Срок"          value={item.deadline} highlight={item.deadlineState !== "ok"} />
            {item.payment && <InfoRow icon="CreditCard" label="Оплата" value={item.payment} />}
          </div>
          {item.problem && (
            <div className="bg-red-50 border border-red-100 rounded-[14px] p-4 flex gap-3">
              <Icon name="AlertTriangle" size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-semibold text-red-600 mb-1">Проблема</p>
                <p className="text-[13px] text-red-800">{item.problem}</p>
              </div>
            </div>
          )}
          {totalCount > 1 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-bold text-[#6b6b6b] uppercase tracking-widest">
                  Другие изделия заказа
                </p>
                <span className="text-[11px] text-[#9b9b9b]">
                  {doneCount} / {totalCount} готово
                </span>
              </div>
              <div className="space-y-2">
                {allItems.map(it => {
                  const s = ITEM_STATUS_LABEL[it.status];
                  const isCurrent = it.id === item.itemId;
                  return (
                    <div
                      key={it.id}
                      className={`flex items-center gap-3 rounded-[12px] px-4 py-3 border transition-colors
                        ${isCurrent ? "border-[#1a1a1a] bg-[#f9f9f9]" : "border-[#f0f0f0] bg-white"}`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
                      <div className="flex-1 min-w-0">
                        <span className={`text-[13px] font-semibold ${isCurrent ? "text-[#1a1a1a]" : "text-[#4a4a4a]"}`}>
                          {it.type}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] text-[#9b9b9b] ml-2">← текущее</span>
                        )}
                      </div>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-lg shrink-0"
                        style={{ backgroundColor: s.bg, color: s.color }}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 p-3 bg-[#f4f4f4] rounded-[10px]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-[#8a8a8a]">Заказ в целом</span>
                  <span className="text-[11px] font-bold text-[#1a1a1a]">
                    {Math.round((doneCount / totalCount) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-[#e0e0e0] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#1a1a1a] transition-all"
                    style={{ width: `${(doneCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
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
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-[#f4f4f4] hover:bg-[#ebebeb] rounded-[12px] py-3 text-[14px] font-semibold text-[#4b4b4b] transition-colors"
          >
            <Icon name="FileText" size={14} />
            Открыть заказ
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
      <Icon name={icon as never} size={13} className="text-[#c0c0c0] shrink-0" />
      <span className="text-[12px] text-[#8a8a8a] w-[100px] shrink-0">{label}</span>
      <span className={`text-[13px] font-semibold ${highlight ? "text-amber-600" : "text-[#1a1a1a]"}`}>
        {value}
      </span>
    </div>
  );
}
