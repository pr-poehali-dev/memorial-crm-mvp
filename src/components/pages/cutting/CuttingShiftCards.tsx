import Icon from "@/components/ui/icon";
import {
  Shift, PLACES, EMPLOYEES, BLANK_TYPES, WORK_LABELS,
  shiftTotalProduced, shiftTotalRaw, efficiency,
  EFF_COLOR, EFF_BG, EFF_LABEL,
} from "./cutting.types";

type Props = {
  activeShifts: Shift[];
  todayDone: Shift[];
  onFinishClick: (id: string) => void;
};

export default function CuttingShiftCards({ activeShifts, todayDone, onFinishClick }: Props) {
  return (
    <>
      {/* Активные смены */}
      {activeShifts.length > 0 && (
        <div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-3">Активные смены сегодня</p>
          <div className="grid grid-cols-2 gap-3">
            {activeShifts.map(s => {
              const place    = PLACES.find(p => p.id === s.placeId)!;
              const employee = EMPLOYEES.find(e => e.id === s.employeeId)!;
              return (
                <div key={s.id} className="bg-white border border-[#e0e0e0] rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#22c55e18] flex items-center justify-center shrink-0">
                    <Icon name="Play" size={18} style={{ color: "#22c55e" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#1a1a1a] truncate">{place.name}</p>
                    <p className="text-[12px] text-[#6b6b6b]">{employee.name} · {WORK_LABELS[s.workType]} · с {s.startedAt}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-semibold text-[#22c55e] bg-[#f0fdf4] border border-[#bbf7d0] px-2 py-1 rounded-full">
                      В работе
                    </span>
                    <button
                      onClick={() => onFinishClick(s.id)}
                      className="text-[13px] font-semibold bg-[#1a1a1a] text-white px-3 py-1.5 rounded-[8px] hover:bg-[#333] transition-colors"
                    >
                      Завершить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Завершённые сегодня */}
      {todayDone.length > 0 && (
        <div>
          <p className="text-[12px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-3">Завершено сегодня</p>
          <div className="grid grid-cols-2 gap-3">
            {todayDone.map(s => {
              const place    = PLACES.find(p => p.id === s.placeId)!;
              const employee = EMPLOYEES.find(e => e.id === s.employeeId)!;
              const eff      = efficiency(s);
              const totalP   = shiftTotalProduced(s);
              const totalR   = shiftTotalRaw(s);
              return (
                <div key={s.id} className="bg-white border border-[#ebebeb] rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#1a1a1a] truncate">{place.name}</p>
                      <p className="text-[12px] text-[#6b6b6b]">{employee.name} · {s.startedAt}–{s.finishedAt}</p>
                    </div>
                    <span
                      className="text-[11px] font-semibold px-2 py-1 rounded-full shrink-0"
                      style={{ color: EFF_COLOR[eff], backgroundColor: EFF_BG[eff] }}
                    >
                      {EFF_LABEL[eff]}
                    </span>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    {s.results.map((r, i) => {
                      const bt = BLANK_TYPES.find(b => b.id === r.blankTypeId)!;
                      return (
                        <div key={i} className="flex items-center justify-between text-[12px]">
                          <span className="text-[#4b4b4b]">{bt.name} <span className="text-[#b5b5b5]">({bt.size})</span></span>
                          <span className="font-semibold text-[#1a1a1a]">{r.produced} шт.</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-3 pt-2 border-t border-[#f5f5f5] text-[12px] text-[#6b6b6b]">
                    <span>Итого: <b className="text-[#1a1a1a]">{totalP} шт.</b></span>
                    <span>Сырьё: <b className="text-[#f59e0b]">{totalR} м²</b></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
