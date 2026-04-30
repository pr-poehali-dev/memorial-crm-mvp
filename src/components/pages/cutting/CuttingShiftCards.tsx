import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  Shift, PLACES, EMPLOYEES, BLANK_TYPES, WORK_LABELS,
  shiftTotalProduced, shiftTotalRaw,
} from "./cutting.types";

type Props = {
  activeShifts: Shift[];
  todayDone: Shift[];
  onFinishClick: (id: string) => void;
};

export default function CuttingShiftCards({ activeShifts, todayDone, onFinishClick }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) =>
    setExpandedId(prev => prev === id ? null : id);

  return (
    <div className="space-y-6">

      {/* ════ Активные смены ════ */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-3">
          Активные смены
        </p>

        {activeShifts.length === 0 ? (
          <div className="flex items-center gap-3 bg-[#f8f8f8] border border-dashed border-[#e0e0e0] rounded-xl px-5 py-5">
            <div className="w-8 h-8 rounded-lg bg-[#f0f0f0] flex items-center justify-center shrink-0">
              <Icon name="Moon" size={15} className="text-[#c0c0c0]" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#9b9b9b]">Нет активных смен</p>
              <p className="text-[12px] text-[#c0c0c0]">Назначьте смену, чтобы начать работу</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {activeShifts.map(s => {
              const place    = PLACES.find(p => p.id === s.placeId)!;
              const employee = EMPLOYEES.find(e => e.id === s.employeeId)!;
              return (
                <div key={s.id} className="bg-white border border-[#e0e0e0] rounded-2xl p-5">
                  <div className="flex items-center gap-4">
                    {/* Иконка-статус */}
                    <div className="w-11 h-11 rounded-xl bg-[#f0fdf4] flex items-center justify-center shrink-0">
                      <Icon name="Play" size={20} style={{ color: "#22c55e" }} />
                    </div>

                    {/* Основная инфа */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[16px] font-semibold text-[#1a1a1a] truncate">{place.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-[13px] text-[#6b6b6b]">
                        <span>{employee.name}</span>
                        <span className="text-[#d5d5d5]">·</span>
                        <span>{WORK_LABELS[s.workType]}</span>
                        <span className="text-[#d5d5d5]">·</span>
                        <span>с {s.startedAt}</span>
                      </div>
                    </div>

                    {/* Статус + кнопка */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[12px] font-semibold text-[#22c55e] bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1.5 rounded-full">
                        В работе
                      </span>
                      <button
                        onClick={() => onFinishClick(s.id)}
                        className="text-[13px] font-semibold bg-[#1a1a1a] text-white px-4 py-2 rounded-[10px] hover:bg-[#333] transition-colors"
                      >
                        Завершить
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ════ Завершённые сегодня ════ */}
      {todayDone.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-3">
            Завершено
          </p>
          <div className="space-y-2">
            {todayDone.map(s => {
              const place    = PLACES.find(p => p.id === s.placeId)!;
              const employee = EMPLOYEES.find(e => e.id === s.employeeId)!;
              const totalP   = shiftTotalProduced(s);
              const totalR   = shiftTotalRaw(s);
              const isOpen   = expandedId === s.id;

              return (
                <div
                  key={s.id}
                  className="bg-[#fafafa] border border-[#ebebeb] rounded-xl overflow-hidden cursor-pointer hover:border-[#d5d5d5] transition-colors"
                  onClick={() => toggleExpand(s.id)}
                >
                  {/* Компактная строка */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-7 h-7 rounded-lg bg-[#f0f0f0] flex items-center justify-center shrink-0">
                      <Icon name="CheckCheck" size={13} className="text-[#9b9b9b]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#4b4b4b] truncate">{place.name}</p>
                      <p className="text-[12px] text-[#9b9b9b]">{employee.name} · {s.startedAt}–{s.finishedAt}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 text-[12px]">
                      <span className="text-[#4b4b4b] font-semibold">{totalP} шт.</span>
                      <span className="text-[#9b9b9b]">{totalR} м²</span>
                      <Icon
                        name={isOpen ? "ChevronUp" : "ChevronDown"}
                        size={14}
                        className="text-[#c0c0c0]"
                      />
                    </div>
                  </div>

                  {/* Раскрытые детали */}
                  {isOpen && (
                    <div className="border-t border-[#ebebeb] px-4 py-3 space-y-2 bg-white">
                      {s.results.map((r, i) => {
                        const bt = BLANK_TYPES.find(b => b.id === r.blankTypeId)!;
                        return (
                          <div key={i} className="flex items-center justify-between text-[12px]">
                            <div className="flex items-center gap-2">
                              <span className="text-[#1a1a1a] font-medium">{bt.name}</span>
                              <span className="text-[#c0c0c0] font-mono">{bt.size}</span>
                              {r.orderId && (
                                <span className="text-[10px] bg-[#f5f5f5] text-[#6b6b6b] px-1.5 py-px rounded-md">{r.orderId}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-[#1a1a1a]">{r.produced} шт.</span>
                              <span className="text-[#9b9b9b]">{r.rawUsed} м²</span>
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex gap-4 pt-2 border-t border-[#f0f0f0] text-[12px] text-[#6b6b6b]">
                        <span>Итого: <b className="text-[#1a1a1a]">{totalP} шт.</b></span>
                        <span>Сырьё: <b className="text-[#1a1a1a]">{totalR} м²</b></span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
