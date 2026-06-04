import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  Shift, WORK_LABELS,
  shiftTotalProduced, shiftTotalRaw,
  CuttingTask, BlankType, yesterday,
} from "./cutting.types";
import { DoneTaskModal } from "./CuttingTaskBlock";

/* ─── Разбивка сырья по камню ─── */
function StoneBreakdown({ results }: { results: Shift["results"] }) {
  const byStone: Record<string, number> = {};
  results.forEach(r => {
    const mat = r.material ?? "—";
    byStone[mat] = (byStone[mat] ?? 0) + r.rawUsed;
  });
  return (
    <div className="space-y-1.5">
      {Object.entries(byStone).map(([mat, m2]) => (
        <div key={mat} className="flex items-baseline justify-between">
          <span className="text-[12px] text-[#6b6b6b]">{mat}</span>
          <span className="text-[15px] font-bold text-[#1a1a1a]">{m2.toFixed(2)} <span className="text-[11px] font-normal text-[#9b9b9b]">м²</span></span>
        </div>
      ))}
    </div>
  );
}

/* ─── Разбивка изделий ─── */
function BlankBreakdown({ results }: { results: Shift["results"] }) {
  return (
    <div className="space-y-1.5">
      {results.map((r, i) => (
        <div key={i} className="flex items-baseline justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className="text-[12px] text-[#1a1a1a] font-medium truncate block">{r.blankName ?? r.blankTypeId}</span>
            {r.orderId && (
              <span className="text-[10px] text-[#9b9b9b] font-mono">{r.orderId}</span>
            )}
          </div>
          <span className="text-[15px] font-bold text-[#1a1a1a] shrink-0">{r.produced} <span className="text-[11px] font-normal text-[#9b9b9b]">шт.</span></span>
        </div>
      ))}
    </div>
  );
}

/* ─── Карточка активной смены ─── */
export function ActiveShiftCard({
  s, onFinish, tasks, blankTypes,
}: {
  s: Shift;
  onFinish: () => void;
  tasks?: CuttingTask[];
  blankTypes?: BlankType[];
}) {
  const placeName    = s.placeName    ?? s.placeId;
  const employeeName = s.employeeName ?? s.employeeId;

  const linkedTask = s.taskId && tasks ? tasks.find(t => t.id === s.taskId) : undefined;
  const plan = s.taskQtyAssigned ?? 0;

  const expectedRaw = (() => {
    if (!plan || !linkedTask || !blankTypes) return null;
    const bt = blankTypes.find(b => b.id === linkedTask.blankTypeId);
    if (!bt) return null;
    return +(bt.rawPerUnit * plan).toFixed(2);
  })();

  return (
    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl overflow-hidden">
      {/* Шапка */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#dcfce7]">
        <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center shrink-0">
          <Icon name="Play" size={14} style={{ color: "#16a34a" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#1a1a1a] truncate">{placeName}</p>
          <p className="text-[11px] text-[#4b6b4b] mt-px">{employeeName} · {WORK_LABELS[s.workType]}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Icon name="Clock" size={11} className="text-[#22c55e]" />
          <span className="text-[12px] font-semibold text-[#16a34a]">с {s.startedAt}</span>
        </div>
      </div>

      {/* Тело */}
      <div className="px-4 py-3 space-y-2">
        {s.taskId ? (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] text-[#4b6b4b]">
              Задача · <b>{plan} шт.</b>
            </span>
            {expectedRaw !== null && (
              <span className="text-[11px] text-[#4b6b4b] flex items-center gap-1">
                <Icon name="Package" size={10} className="text-[#6366f1]" />
                ожид. сырьё: <b className="text-[#6366f1]">{expectedRaw} м²</b>
              </span>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-[#9b9b9b]">Задача не привязана</p>
        )}

        {/* Статус + кнопка */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[#16a34a] bg-white/70 border border-[#bbf7d0] px-2.5 py-1 rounded-full">
            В работе
          </span>
          <button
            onClick={onFinish}
            className="text-[12px] font-semibold bg-[#1a1a1a] text-white px-4 py-2 rounded-[8px] hover:bg-[#333] transition-colors"
          >
            Завершить
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Карточка завершённой смены ─── */
function DoneCard({ s }: { s: Shift }) {
  const placeName    = s.placeName    ?? s.placeId;
  const employeeName = s.employeeName ?? s.employeeId;
  const totalP   = shiftTotalProduced(s);
  const totalR   = shiftTotalRaw(s);

  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
      {/* Шапка */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#fafafa] border-b border-[#f0f0f0]">
        <div className="w-7 h-7 rounded-lg bg-[#f0f0f0] flex items-center justify-center shrink-0">
          <Icon name="CheckCheck" size={12} className="text-[#9b9b9b]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-[#4b4b4b] truncate">{placeName}</p>
          <p className="text-[11px] text-[#9b9b9b]">{employeeName} · {s.startedAt}{s.finishedAt ? `–${s.finishedAt}` : ""}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[13px] font-bold text-[#1a1a1a]">{totalP} шт.</span>
          <span className="text-[12px] font-semibold text-[#6366f1]">{totalR} м²</span>
        </div>
      </div>

      {/* Тело */}
      {s.results.length > 0 && (
        <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-2">Изделия</p>
            <BlankBreakdown results={s.results} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-2">Сырьё</p>
            <StoneBreakdown results={s.results} />
          </div>
        </div>
      )}

      {s.results.length === 0 && (
        <div className="px-4 py-3">
          <p className="text-[12px] text-[#c0c0c0]">Результаты не указаны</p>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Колонка «Активные»
════════════════════════════════════════ */
export function ActiveColumn({ shifts, onFinishClick, tasks, blankTypes }: {
  shifts: Shift[];
  onFinishClick: (id: string) => void;
  tasks?: CuttingTask[];
  blankTypes?: BlankType[];
}) {
  return (
    <div className="flex flex-col gap-2 h-full">
      {shifts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center flex-1">
          <div className="w-10 h-10 rounded-2xl bg-[#f0fdf4] flex items-center justify-center mb-2">
            <Icon name="Moon" size={18} className="text-[#86efac]" />
          </div>
          <p className="text-[12px] text-[#b5b5b5]">Нет активных смен</p>
          <p className="text-[11px] text-[#c5c5c5] mt-0.5">Назначьте смену для начала</p>
        </div>
      ) : (
        shifts.map(s => (
          <ActiveShiftCard
            key={s.id}
            s={s}
            onFinish={() => onFinishClick(s.id)}
            tasks={tasks}
            blankTypes={blankTypes}
          />
        ))
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Колонка «Завершено»
════════════════════════════════════════ */
export function DoneColumn({ shifts, tasks }: { shifts: Shift[]; tasks?: CuttingTask[] }) {
  const [doneModal, setDoneModal] = useState<CuttingTask | null>(null);

  /* Задачи, завершённые вчера */
  const yesterdayTasks = (tasks ?? []).filter(
    t => t.status === "done" && t.updatedAt === yesterday
  );

  const hasAnything = shifts.length > 0 || yesterdayTasks.length > 0;

  return (
    <div className="flex flex-col gap-2 h-full">
      {!hasAnything && (
        <div className="flex flex-col items-center justify-center py-10 text-center flex-1">
          <div className="w-10 h-10 rounded-2xl bg-[#f4f4f4] flex items-center justify-center mb-2">
            <Icon name="CheckCircle" size={18} className="text-[#c0c0c0]" />
          </div>
          <p className="text-[12px] text-[#b5b5b5]">Завершённых нет</p>
          <p className="text-[11px] text-[#c5c5c5] mt-0.5">Появятся после завершения смен</p>
        </div>
      )}

      {/* Смены сегодня */}
      {shifts.map(s => <DoneCard key={s.id} s={s} />)}

      {/* Раздел «Завершено вчера» — задачи */}
      {yesterdayTasks.length > 0 && (
        <div className={shifts.length > 0 ? "mt-3" : ""}>
          <div className="flex items-center gap-2 mb-2 px-1">
            <div className="w-4 h-4 rounded-md bg-[#f0f0f0] flex items-center justify-center shrink-0">
              <Icon name="CalendarCheck" size={10} className="text-[#9b9b9b]" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#b5b5b5]">
              Завершено вчера
            </p>
            <span className="text-[10px] font-bold bg-[#f0f0f0] text-[#9b9b9b] px-1.5 py-px rounded-full">
              {yesterdayTasks.length}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {yesterdayTasks.map(task => (
              <button
                key={task.id}
                onClick={() => setDoneModal(task)}
                className="w-full flex items-center gap-3 bg-[#fafafa] border border-[#ebebeb] rounded-xl px-4 py-3 hover:bg-[#f0fdf4] hover:border-[#bbf7d0] transition-all text-left group"
              >
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Icon name="Check" size={12} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#6b6b6b] truncate group-hover:text-[#1a1a1a]">
                    {task.blankName || "Заготовка"}
                  </p>
                  <p className="text-[10px] text-[#b5b5b5]">{task.materialName}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[12px] font-bold text-[#9b9b9b]">{task.doneQty ?? 0} шт.</span>
                  <Icon name="ChevronRight" size={12} className="text-[#c5c5c5] group-hover:text-[#6b6b6b]" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {doneModal && (
        <DoneTaskModal task={doneModal} onClose={() => setDoneModal(null)} />
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Совместимость для вкладки «Вчера»
════════════════════════════════════════ */
type LegacyProps = {
  activeShifts: Shift[];
  todayDone: Shift[];
  onFinishClick: (id: string) => void;
  alwaysExpanded?: boolean;
};

export default function CuttingShiftCards({ activeShifts, todayDone, onFinishClick, alwaysExpanded }: LegacyProps) {
  if (alwaysExpanded) {
    if (todayDone.length === 0) return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-10 h-10 rounded-2xl bg-[#f4f4f4] flex items-center justify-center mb-2">
          <Icon name="CalendarX" size={18} className="text-[#c0c0c0]" />
        </div>
        <p className="text-[13px] text-[#b5b5b5]">Нет смен за этот день</p>
      </div>
    );
    return <div className="space-y-2">{todayDone.map(s => <DoneCard key={s.id} s={s} />)}</div>;
  }

  return (
    <div className="space-y-2">
      {activeShifts.map(s => (
        <ActiveShiftCard key={s.id} s={s} onFinish={() => onFinishClick(s.id)} />
      ))}
      {todayDone.map(s => <DoneCard key={s.id} s={s} />)}
    </div>
  );
}