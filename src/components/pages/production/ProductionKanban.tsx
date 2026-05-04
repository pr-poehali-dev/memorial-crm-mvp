import Icon from "@/components/ui/icon";
import {
  Column, FlatItem, DEADLINE_CARD, DEADLINE_BADGE,
} from "./production.types";

type Props = {
  columns: Column[];
  visibleKeys: Set<string>;
  onItemClick: (item: FlatItem) => void;
  onSwitchToList: (colId: string) => void;
};

export default function ProductionKanban({ columns, visibleKeys, onItemClick, onSwitchToList }: Props) {
  return (
    <div className="flex-1 overflow-x-auto overflow-y-auto">
      <div className="flex gap-4 px-7 py-5 items-start min-h-full min-w-max">
        {columns.map(col => {
          const items      = col.cards.map(card => toFlat(card, col)).filter(i => visibleKeys.has(i.itemId));
          const allFlat    = col.cards.map(card => toFlat(card, col));
          const overdueCnt = allFlat.filter(i => i.deadlineState === "overdue").length;
          return (
            <div key={col.id} className="w-[280px] shrink-0 flex flex-col gap-3">
              <div
                className="flex items-center gap-2.5 rounded-[12px] px-4 py-3"
                style={{ backgroundColor: col.color + "12", border: `1.5px solid ${col.color}28` }}
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                <span className="text-[14px] font-bold text-[#1a1a1a] flex-1 leading-none">{col.label}</span>
                <span
                  className="text-[12px] font-bold rounded-lg px-2 py-0.5"
                  style={{ backgroundColor: col.color + "20", color: col.color }}
                >
                  {allFlat.length}
                </span>
                {overdueCnt > 0 && (
                  <span className="text-[10px] font-bold bg-red-100 text-red-500 rounded-md px-1.5 py-0.5">
                    {overdueCnt}⚠
                  </span>
                )}
                <button
                  onClick={() => onSwitchToList(col.id)}
                  title="Открыть список по этапу"
                  className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/10 transition-colors shrink-0"
                >
                  <Icon name="List" size={13} style={{ color: col.color }} />
                </button>
              </div>
              {items.length === 0 ? (
                <div className="border-2 border-dashed border-[#e4e4e4] rounded-[14px] py-10 text-center text-[13px] text-[#c8c8c8]">
                  нет заказов
                </div>
              ) : items.map(item => (
                <ItemCard
                  key={item.itemId}
                  item={item}
                  colColor={col.color}
                  onClick={() => onItemClick(item)}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function toFlat(card: Column["cards"][0], col: Column): FlatItem {
  return {
    itemId:        card.id,
    orderId:       card.id,
    colId:         col.id,
    colLabel:      col.label,
    colColor:      col.color,
    client:        card.client,
    stone:         card.stone,
    size:          card.size,
    deadline:      card.deadline,
    deadlineState: card.deadlineState,
    manager:       card.manager,
    urgent:        card.urgent,
    phone:         card.phone,
    payment:       card.payment,
    problem:       card.comment,
    allItems:      [],
  };
}

function ItemCard({ item, colColor, onClick }: { item: FlatItem; colColor: string; onClick: () => void }) {
  const dc = DEADLINE_CARD[item.deadlineState];
  const dl = DEADLINE_BADGE[item.deadlineState];
  return (
    <div
      onClick={onClick}
      className={`rounded-[14px] border-[1.5px] ${dc.border} bg-white p-4 cursor-pointer
        hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 select-none`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[16px] font-black text-[#1a1a1a] tracking-tight">{item.orderId}</span>
            {item.stone && (
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-lg truncate max-w-[120px]"
                style={{ backgroundColor: colColor + "18", color: colColor }}
              >
                {item.stone}
              </span>
            )}
          </div>
          <p className="text-[12px] text-[#8a8a8a] mt-0.5">{item.client}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {item.urgent && (
            <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase">срочно</span>
          )}
          {item.problem && (
            <Icon name="AlertTriangle" size={14} className="text-red-400" />
          )}
        </div>
      </div>

      {item.size && (
        <p className="text-[11px] text-[#9b9b9b] mt-1 mb-2">{item.size}</p>
      )}

      <div className="space-y-1.5 mt-2">
        <div className="flex items-center gap-2 text-[12px] text-[#5a5a5a]">
          <Icon name="User" size={11} className="text-[#b0b0b0] shrink-0" />
          <span>{item.manager}</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Calendar" size={11} className="text-[#b0b0b0] shrink-0" />
          {dl.label ? (
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: dl.bg, color: dl.color }}>
              {item.deadline} — {dl.label}
            </span>
          ) : (
            <span className="text-[12px] text-[#5a5a5a]">{item.deadline}</span>
          )}
        </div>
        {item.payment && (
          <div className="flex items-center gap-2 text-[12px] text-[#5a5a5a]">
            <Icon name="CreditCard" size={11} className="text-[#b0b0b0] shrink-0" />
            <span>{item.payment}</span>
          </div>
        )}
      </div>
    </div>
  );
}