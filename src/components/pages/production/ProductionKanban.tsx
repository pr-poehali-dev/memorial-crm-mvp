import Icon from "@/components/ui/icon";
import {
  Column, FlatItem, DEADLINE_CARD, DEADLINE_BADGE,
  MACHINE_PLACE, ITEM_STATUS_LABEL, flattenItems,
} from "./production.types";

type Props = {
  columns: Column[];
  visibleKeys: Set<string>;
  onItemClick: (item: FlatItem) => void;
};

export default function ProductionKanban({ columns, visibleKeys, onItemClick }: Props) {
  return (
    <div className="flex-1 overflow-x-auto overflow-y-auto">
      <div className="flex gap-4 px-7 py-5 items-start min-h-full min-w-max">
        {columns.map(col => {
          const items = flattenItems([col]).filter(i => visibleKeys.has(i.itemId));
          const overdueCnt = flattenItems([col]).filter(i => i.deadlineState === "overdue").length;
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
                  {flattenItems([col]).length}
                </span>
                {overdueCnt > 0 && (
                  <span className="text-[10px] font-bold bg-red-100 text-red-500 rounded-md px-1.5 py-0.5">
                    {overdueCnt}⚠
                  </span>
                )}
              </div>
              {items.length === 0 ? (
                <div className="border-2 border-dashed border-[#e4e4e4] rounded-[14px] py-10 text-center text-[13px] text-[#c8c8c8]">
                  нет изделий
                </div>
              ) : items.map(item => (
                <ItemCard
                  key={item.itemId}
                  item={item}
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

function ItemCard({ item, onClick }: { item: FlatItem; onClick: () => void }) {
  const dc  = DEADLINE_CARD[item.deadlineState];
  const dl  = DEADLINE_BADGE[item.deadlineState];
  const st  = ITEM_STATUS_LABEL[item.itemStatus];
  const machine = item.machineId ? MACHINE_PLACE[item.machineId] : null;
  const doneCount  = item.allItems.filter(i => i.status === "done").length;
  const totalCount = item.allItems.length;
  const isMulti    = totalCount > 1;
  return (
    <div
      onClick={onClick}
      className={`rounded-[14px] border-[1.5px] ${dc.border} ${dc.bg} p-4 cursor-pointer
        hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 select-none`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[16px] font-black text-[#1a1a1a] tracking-tight">{item.orderId}</span>
            <span
              className="text-[13px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-lg"
              style={{ backgroundColor: item.colColor + "18", color: item.colColor }}
            >
              {item.itemType}
            </span>
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
      <div className="mt-3 mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[#a0a0a0] font-medium uppercase tracking-wide">Прогресс</span>
          <span className="text-[11px] font-bold" style={{ color: item.colColor }}>{item.itemProgress}%</span>
        </div>
        <div className="h-1.5 bg-[#ebebeb] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${item.itemProgress}%`, backgroundColor: item.colColor }}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        {machine && (
          <div className="flex items-center gap-2 text-[12px] text-[#5a5a5a]">
            <Icon name="MapPin" size={11} className="text-[#b0b0b0] shrink-0" />
            <span>{machine}</span>
          </div>
        )}
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
      </div>
      {isMulti && (
        <div className="mt-3 pt-3 border-t border-[#ebebeb] flex items-center justify-between">
          <span className="text-[11px] text-[#a0a0a0]">
            {doneCount} из {totalCount} изделий готово
          </span>
          <div className="flex gap-1">
            {item.allItems.map(i => (
              <span
                key={i.id}
                className={`w-2 h-2 rounded-full ${
                  i.status === "done"          ? "bg-green-400"
                  : i.status === "in_progress" ? "bg-amber-400"
                  : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
