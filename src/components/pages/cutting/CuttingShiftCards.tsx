import Icon from "@/components/ui/icon";
import {
  Shift, PLACES, EMPLOYEES, BLANK_TYPES, WORK_LABELS,
  shiftTotalProduced, shiftTotalRaw,
} from "./cutting.types";

type Props = {
  activeShifts: Shift[];
  todayDone: Shift[];
  onFinishClick: (id: string) => void;
  /* когда вкладка "Вчера" — нет активных, карточки всегда раскрыты */
  alwaysExpanded?: boolean;
};

/* ─── Разбивка по камню из списка результатов ─── */
function StoneBreakdown({ results }: { results: Shift["results"] }) {
  const byStone: Record<string, number> = {};
  results.forEach(r => {
    const bt = BLANK_TYPES.find(b => b.id === r.blankTypeId);
    if (!bt) return;
    byStone[bt.material] = (byStone[bt.material] ?? 0) + r.rawUsed;
  });
  return (
    <div className="space-y-0.5">
      {Object.entries(byStone).map(([mat, m2]) => (
        <div key={mat} className="flex justify-between text-[11px]">
          <span className="text-[#6b6b6b]">{mat}</span>
          <span className="font-semibold text-[#6366f1]">{m2.toFixed(2)} м²</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Разбивка по изделиям ─── */
function BlankBreakdown({ results }: { results: Shift["results"] }) {
  return (
    <div className="space-y-0.5">
      {results.map((r, i) => {
        const bt = BLANK_TYPES.find(b => b.id === r.blankTypeId);
        if (!bt) return null;
        return (
          <div key={i} className="flex items-baseline justify-between text-[11px]">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <span className="text-[#1a1a1a] font-medium truncate">{bt.name}</span>
              <span className="text-[#c0c0c0] font-mono shrink-0">{bt.size}</span>
            </div>
            <div className="flex items-baseline gap-2 shrink-0 ml-2">
              <span className="font-bold text-[#1a1a1a]">{r.produced} шт.</span>
              {r.orderId && (
                <span className="text-[10px] bg-[#f5f5f5] text-[#6b6b6b] px-1.5 py-px rounded-md font-mono">{r.orderId}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Карточка завершённой смены (всегда раскрыта) ─── */
function DoneCard({ s }: { s: Shift }) {
  const place    = PLACES.find(p => p.id === s.placeId)!;
  const employee = EMPLOYEES.find(e => e.id === s.employeeId)!;
  const totalP   = shiftTotalProduced(s);
  const totalR   = shiftTotalRaw(s);

  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
      {/* Шапка карточки */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#fafafa] border-b border-[#f0f0f0]">
        <div className="w-6 h-6 rounded-md bg-[#f0f0f0] flex items-center justify-center shrink-0">
          <Icon name="CheckCheck" size={12} className="text-[#9b9b9b]" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[12px] font-semibold text-[#4b4b4b] truncate block">{place.name}</span>
          <span className="text-[11px] text-[#9b9b9b]">{employee.name} · {s.startedAt}–{s.finishedAt}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-[12px]">
          <span className="font-bold text-[#1a1a1a]">{totalP} шт.</span>
          <span className="text-[#6366f1] font-semibold">{totalR} м²</span>
        </div>
      </div>

      {/* Тело — всегда раскрыто */}
      {s.results.length > 0 && (
        <div className="px-4 py-3 grid grid-cols-2 gap-x-5 gap-y-1">
          {/* Изделия */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-1.5">Изделия</p>
            <BlankBreakdown results={s.results} />
          </div>
          {/* Камень */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-1.5">Сырьё</p>
            <StoneBreakdown results={s.results} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Главный компонент
════════════════════════════════════════ */
export default function CuttingShiftCards({ activeShifts, todayDone, onFinishClick, alwaysExpanded = false }: Props) {

  /* Если alwaysExpanded (вкладка Вчера) — только раскрытые завершённые */
  if (alwaysExpanded) {
    if (todayDone.length === 0) return (
      <EmptyState text="Нет смен за этот день" />
    );
    return (
      <div className="space-y-2">
        {todayDone.map(s => <DoneCard key={s.id} s={s} />)}
      </div>
    );
  }

  /* ── Вкладка Сегодня: 2 колонки ── */
  return (
    <div className="grid grid-cols-2 gap-5 items-start">

      {/* ════ Левая колонка: Активные ════ */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-2">
          Активные смены
        </p>

        {activeShifts.length === 0 ? (
          <div className="flex items-center gap-3 bg-[#f8f8f8] border border-dashed border-[#e0e0e0] rounded-xl px-4 py-4">
            <div className="w-7 h-7 rounded-lg bg-[#f0f0f0] flex items-center justify-center shrink-0">
              <Icon name="Moon" size={13} className="text-[#c0c0c0]" />
            </div>
            <div>
              <p className="text-[12px] font-medium text-[#9b9b9b]">Нет активных смен</p>
              <p className="text-[11px] text-[#c0c0c0]">Назначьте смену для начала работы</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {activeShifts.map(s => {
              const place    = PLACES.find(p => p.id === s.placeId)!;
              const employee = EMPLOYEES.find(e => e.id === s.employeeId)!;
              return (
                <div key={s.id} className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center shrink-0">
                      <Icon name="Play" size={15} style={{ color: "#22c55e" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#1a1a1a] truncate">{place.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[12px] text-[#4b6b4b]">
                        <span>{employee.name}</span>
                        <span className="text-[#c0c0c0]">·</span>
                        <span>{WORK_LABELS[s.workType]}</span>
                        <span className="text-[#c0c0c0]">·</span>
                        <span>с {s.startedAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-semibold text-[#22c55e] bg-white/80 border border-[#bbf7d0] px-2.5 py-1 rounded-full">
                        В работе
                      </span>
                      <button
                        onClick={() => onFinishClick(s.id)}
                        className="text-[12px] font-semibold bg-[#1a1a1a] text-white px-3 py-1.5 rounded-[8px] hover:bg-[#333] transition-colors"
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

      {/* ════ Правая колонка: Завершённые ════ */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-2">
          Завершено сегодня
        </p>

        {todayDone.length === 0 ? (
          <div className="flex items-center gap-3 bg-[#f8f8f8] border border-dashed border-[#e0e0e0] rounded-xl px-4 py-4">
            <div className="w-7 h-7 rounded-lg bg-[#f0f0f0] flex items-center justify-center shrink-0">
              <Icon name="CheckCircle" size={13} className="text-[#c0c0c0]" />
            </div>
            <p className="text-[12px] text-[#9b9b9b]">Нет завершённых смен</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayDone.map(s => <DoneCard key={s.id} s={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-10 h-10 rounded-2xl bg-[#f4f4f4] flex items-center justify-center mb-2">
        <Icon name="CalendarX" size={18} className="text-[#c0c0c0]" />
      </div>
      <p className="text-[13px] text-[#b0b0b0]">{text}</p>
    </div>
  );
}
