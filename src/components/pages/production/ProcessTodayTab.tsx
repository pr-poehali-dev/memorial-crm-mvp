import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Shift, WORK_LABELS, WorkType, shiftTotalProduced, shiftTotalRaw, today } from "../cutting/cutting.types";
import { WORK_ICON, DoneShiftCard } from "./process.utils";

type ViewMode = "list" | "kanban";

const WORK_TYPES: { key: WorkType; label: string; color: string; bg: string }[] = [
  { key: "cutting",   label: "Распил",    color: "#f59e0b", bg: "#fffbeb" },
  { key: "engraving", label: "Гравировка",color: "#ec4899", bg: "#fdf2f8" },
  { key: "polishing", label: "Полировка", color: "#14b8a6", bg: "#f0fdfa" },
];

function KanbanView({ active, done }: { active: Shift[]; done: Shift[] }) {
  const all = [...active, ...done];

  return (
    <div className="flex gap-4 h-full overflow-x-auto px-7 py-4 pb-6">
      {/* Колонка "В работе" */}
      <div className="flex flex-col shrink-0 w-[240px]">
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-2 bg-green-50 border border-green-100">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
            <span className="text-[12px] font-bold text-[#1a1a1a]">В работе</span>
          </div>
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">{active.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          {active.length === 0 ? (
            <p className="text-[12px] text-[#c5c5c5] text-center py-8">Нет активных смен</p>
          ) : active.map(s => (
            <div key={s.id} className="bg-white border border-green-200 rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <Icon name={WORK_ICON[s.workType] as never ?? "Hammer"} size={13} className="text-green-700 shrink-0" />
                <span className="text-[12px] font-semibold text-[#1a1a1a] truncate">{s.placeName ?? s.placeId}</span>
              </div>
              <p className="text-[11px] text-[#6b6b6b] mb-2">{s.employeeName} · {WORK_LABELS[s.workType]}</p>
              {s.taskQtyAssigned && (
                <p className="text-[11px] text-[#9b9b9b]">План: <b className="text-[#1a1a1a]">{s.taskQtyAssigned} шт.</b></p>
              )}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#f0f0f0]">
                <span className="text-[11px] text-[#9b9b9b]">с {s.startedAt}</span>
                <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">В работе</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Колонки по типу работ — завершённые */}
      {WORK_TYPES.map(wt => {
        const cols = done.filter(s => s.workType === wt.key);
        const totalP = cols.reduce((a, s) => a + shiftTotalProduced(s), 0);
        return (
          <div key={wt.key} className="flex flex-col shrink-0 w-[240px]">
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-2"
              style={{ backgroundColor: wt.bg, border: `1px solid ${wt.color}22` }}
            >
              <div className="flex items-center gap-2">
                <Icon name={WORK_ICON[wt.key] as never ?? "Hammer"} size={13} style={{ color: wt.color }} />
                <span className="text-[12px] font-bold text-[#1a1a1a]">{wt.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {totalP > 0 && <span className="text-[10px] text-[#9b9b9b]">{totalP} шт.</span>}
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: wt.color + "22", color: wt.color }}>
                  {cols.length}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {cols.length === 0 ? (
                <p className="text-[12px] text-[#c5c5c5] text-center py-8">Нет завершённых</p>
              ) : cols.map(s => (
                <DoneShiftCard key={s.id} shift={s} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActiveCard({ shift: s }: { shift: Shift }) {
  const produced = s.results.reduce((a, r) => a + r.produced, 0);
  const orders   = [...new Set(s.results.map(r => r.orderId).filter(Boolean))];

  return (
    <div className="bg-white border border-green-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-green-50 px-5 py-3.5 flex items-center justify-between border-b border-green-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
            <Icon name={WORK_ICON[s.workType] as never ?? "Hammer"} size={16} className="text-green-700" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-[#1a1a1a]">{s.placeName ?? s.placeId}</p>
            <p className="text-[12px] text-green-700">{s.employeeName} · {WORK_LABELS[s.workType]}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="Clock" size={12} className="text-green-600" />
          <span className="text-[13px] font-bold text-green-700">с {s.startedAt}</span>
        </div>
      </div>
      <div className="px-5 py-4 space-y-3">
        {s.taskId && (
          <div className="flex items-center gap-2">
            <Icon name="ClipboardList" size={13} className="text-[#9b9b9b] shrink-0" />
            <span className="text-[12px] text-[#4b4b4b]">
              Задача · план <b>{s.taskQtyAssigned} шт.</b>
            </span>
          </div>
        )}
        {s.results.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-2">Текущие результаты</p>
            <div className="space-y-1">
              {s.results.map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[12px] text-[#4b4b4b]">{r.blankName ?? "—"}</span>
                  <span className="text-[13px] font-bold text-[#1a1a1a]">{r.produced} шт.</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-4 pt-1">
          {produced > 0 && (
            <div className="flex items-center gap-1.5">
              <Icon name="Boxes" size={12} className="text-[#2563eb]" />
              <span className="text-[12px] font-semibold text-[#2563eb]">{produced} шт.</span>
            </div>
          )}
          {orders.map(o => (
            <span key={o} className="text-[11px] font-mono bg-[#f0f0f0] text-[#4b4b4b] px-2 py-0.5 rounded">{o}</span>
          ))}
          <span className="ml-auto text-[11px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
            В работе
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TodayTab({ shifts }: { shifts: Shift[] }) {
  const [view, setView] = useState<ViewMode>("list");

  const active  = shifts.filter(s => s.date === today && s.status === "active");
  const done    = shifts.filter(s => s.date === today && s.status === "done");

  const totalActive   = active.length;
  const totalDone     = done.length;
  const totalProduced = done.reduce((a, s) => a + shiftTotalProduced(s), 0);
  const totalRaw      = +done.reduce((a, s) => a + shiftTotalRaw(s), 0).toFixed(2);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* Переключатель вида */}
      <div className="shrink-0 bg-white border-b border-[#f0f0f0] px-7 py-2.5 flex items-center gap-3">
        <div className="flex gap-0.5 bg-[#f0f0f0] rounded-[8px] p-0.5">
          {(["list", "kanban"] as ViewMode[]).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all ${
                view === v ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"
              }`}>
              <Icon name={v === "kanban" ? "LayoutGrid" : "List"} size={13} />
              {v === "kanban" ? "Канбан" : "Список"}
            </button>
          ))}
        </div>
      </div>

      {/* Канбан */}
      {view === "kanban" && (
        <div className="flex-1 overflow-hidden">
          <KanbanView active={active} done={done} />
        </div>
      )}

      {/* Список */}
      {view === "list" && (
      <div className="flex-1 overflow-y-auto px-7 py-5 space-y-6">

      {/* Краткая сводка дня */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Работают сейчас",   value: String(totalActive),       icon: "Play",       color: "#16a34a", bg: "#f0fdf4" },
          { label: "Завершено за день", value: String(totalDone),         icon: "CheckCheck", color: "#6b6b6b", bg: "#f5f5f5" },
          { label: "Произведено",       value: `${totalProduced} шт.`,    icon: "Boxes",      color: "#2563eb", bg: "#eff6ff" },
          { label: "Сырьё потрачено",   value: `${totalRaw} м²`,          icon: "Layers",     color: "#f59e0b", bg: "#fffbeb" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#ebebeb] rounded-xl px-4 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
              <Icon name={s.icon as never} size={16} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[20px] font-bold text-[#1a1a1a] leading-none">{s.value}</p>
              <p className="text-[11px] text-[#9b9b9b] mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Активные смены */}
      {active.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h3 className="text-[13px] font-bold text-[#1a1a1a] uppercase tracking-wider">В работе прямо сейчас</h3>
            <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">{active.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {active.map(s => <ActiveCard key={s.id} shift={s} />)}
          </div>
        </div>
      )}

      {active.length === 0 && done.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#f4f4f4] flex items-center justify-center mb-4">
            <Icon name="Moon" size={22} className="text-[#c0c0c0]" />
          </div>
          <p className="text-[15px] font-medium text-[#9b9b9b]">Сегодня работ не было</p>
          <p className="text-[13px] text-[#c5c5c5] mt-1">Назначьте смены в разделе «Заготовки»</p>
        </div>
      )}

      {/* Завершённые за сегодня */}
      {done.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Icon name="CheckCircle" size={14} className="text-[#9b9b9b]" />
            <h3 className="text-[13px] font-bold text-[#6b6b6b] uppercase tracking-wider">Завершено сегодня</h3>
            <span className="text-[11px] bg-[#f0f0f0] text-[#9b9b9b] px-2 py-0.5 rounded-full font-bold">{done.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {done.map(s => <DoneShiftCard key={s.id} shift={s} />)}
          </div>
        </div>
      )}
      </div>
      )}
    </div>
  );
}