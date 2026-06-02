import Icon from "@/components/ui/icon";
import { Movement, MOVE_TYPE, RawMaterial, Blank } from "./warehouse.types";

export function MovementHistory({
  movements,
  rawMat = [],
  blanks = [],
  onOpenAll,
}: {
  movements: Movement[];
  rawMat?: RawMaterial[];
  blanks?: Blank[];
  onOpenAll: () => void;
}) {
  const recent = movements.slice(0, 5);
  const nameOf = (m: Movement): string => {
    if (m.materialId) return rawMat.find(r => r.id === m.materialId)?.name ?? "";
    if (m.blankId)    return blanks.find(b => b.id === m.blankId)?.name ?? "";
    return "";
  };
  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#f0f0f0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="History" size={13} className="text-[#9b9b9b]" />
          <span className="text-[12px] font-semibold text-[#4b4b4b]">Последние движения</span>
        </div>
        <button
          onClick={onOpenAll}
          className="flex items-center gap-1 text-[12px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
        >
          Открыть всю историю
          <Icon name="ChevronRight" size={13} />
        </button>
      </div>
      <div className="divide-y divide-[#f5f5f5]">
        {recent.length === 0 && (
          <p className="px-4 py-5 text-center text-[12px] text-[#c5c5c5]">История пуста</p>
        )}
        {recent.map(m => {
          const mt = MOVE_TYPE[m.type];
          return (
            <div key={m.id} className="flex items-center gap-3 px-4 py-2.5" style={{ backgroundColor: mt.rowBg }}>
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: mt.color + "22" }}
              >
                <Icon name={mt.icon as never} size={12} style={{ color: mt.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[12px] font-semibold" style={{ color: mt.color }}>{mt.label}</span>
                  {nameOf(m) && (
                    <span className="text-[12px] font-medium text-[#1a1a1a]">{nameOf(m)}</span>
                  )}
                  {m.order && (
                    <span className="text-[11px] bg-[#f0f0f0] text-[#4b4b4b] px-1.5 py-0.5 rounded font-mono">{m.order}</span>
                  )}
                  {m.receiptId && (
                    <span className="text-[11px] bg-[#f0f0f0] text-[#4b4b4b] px-1.5 py-0.5 rounded font-mono">{m.receiptId}</span>
                  )}
                </div>
                <p className="text-[11px] text-[#9b9b9b] mt-0.5 truncate">{m.note}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono text-[12px] font-semibold text-[#1a1a1a]">
                  {m.type === "in" ? "+" : "−"}{m.qty}
                  {m.totalSum ? ` · ${m.totalSum.toLocaleString("ru")} ₽` : ""}
                </div>
                {m.remainAfter !== undefined && (
                  <div className="text-[10px] text-[#9b9b9b]">остаток: {m.remainAfter}</div>
                )}
                <div className="text-[10px] text-[#c5c5c5]">{m.date}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}