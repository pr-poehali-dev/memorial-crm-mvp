import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  COLUMNS, FILTERS, DEADLINE_CARD, DEADLINE_BADGE,
  ZONES, MACHINES, EMPLOYEES, initShifts,
  FilterKey, Card, Shift,
} from "./production/production.types";

/* ─── Вспомогалки ─── */
const STAGE_CHAIN = [
  { id: "заготовки", label: "Заготовки", icon: "Layers" },
  { id: "sketch",    label: "Эскиз",     icon: "PenLine" },
  { id: "engraving", label: "Гравировка",icon: "PenTool" },
  { id: "polishing", label: "Полировка", icon: "Sparkles" },
  { id: "ready",     label: "Готов",     icon: "CheckCircle" },
];

function stageState(colId: string): "overdue" | "warn" | "ok" | "idle" {
  const col = COLUMNS.find(c => c.id === colId);
  if (!col) return "idle";
  const over = col.cards.filter(c => c.deadlineState === "overdue").length;
  const soon = col.cards.filter(c => c.deadlineState === "soon").length;
  if (over > 0) return "overdue";
  if (soon > 0) return "warn";
  if (col.cards.length > 0) return "ok";
  return "idle";
}

const STAGE_COLORS = {
  overdue: { ring: "ring-2 ring-red-400",    bg: "bg-red-50",    text: "text-red-600",    dot: "#ef4444", label: "bg-red-100 text-red-600" },
  warn:    { ring: "ring-2 ring-amber-300",  bg: "bg-amber-50",  text: "text-amber-600",  dot: "#f59e0b", label: "bg-amber-100 text-amber-600" },
  ok:      { ring: "ring-2 ring-green-300",  bg: "bg-green-50",  text: "text-green-700",  dot: "#22c55e", label: "bg-green-100 text-green-700" },
  idle:    { ring: "",                        bg: "bg-[#f5f5f5]", text: "text-[#9b9b9b]", dot: "#d1d5db", label: "bg-[#f0f0f0] text-[#9b9b9b]" },
};

export default function ProductionPage() {
  const [filter,      setFilter]      = useState<FilterKey>("all");
  const [hovered,     setHovered]     = useState<string | null>(null);
  const [shifts,      setShifts]      = useState<Shift[]>(initShifts);
  const [masterMode,  setMasterMode]  = useState(false);
  const [activeStage, setActiveStage] = useState<string | null>(null);

  const allCards    = COLUMNS.flatMap(c => c.cards);
  const overdue     = allCards.filter(c => c.deadlineState === "overdue").length;
  const urgent      = allCards.filter(c => c.urgent).length;
  const totalInWork = allCards.filter(c => COLUMNS.find(col => col.id !== "ready" && col.cards.includes(c))).length;

  /* Узкое место */
  const bottleneck = [...COLUMNS]
    .map(col => ({
      ...col,
      score: col.cards.filter(c => c.deadlineState === "overdue").length * 3 + col.cards.length,
    }))
    .sort((a, b) => b.score - a.score)[0];

  const applyFilter = (card: Card): boolean => {
    if (filter === "mine")    return card.manager === "Олег К.";
    if (filter === "overdue") return card.deadlineState === "overdue";
    if (filter === "urgent")  return !!card.urgent;
    return true;
  };

  /* Зоны с агрегацией */
  const productionZones = ZONES.filter(z => z.type === "production").map(zone => {
    const zoneMachines = MACHINES.filter(m => m.zoneId === zone.id);
    const zoneCards    = allCards.filter(c => c.zoneId === zone.id);
    const zoneOverdue  = zoneCards.filter(c => c.deadlineState === "overdue").length;
    const shift        = shifts.find(s => s.zoneId === zone.id);
    const employee     = shift ? EMPLOYEES.find(e => e.id === shift.employeeId) : null;
    return { ...zone, machines: zoneMachines, cards: zoneCards, overdueCount: zoneOverdue, employee };
  });

  /* Режим мастера: задачи на сегодня */
  const todayCards = allCards.filter(c =>
    c.deadlineState === "overdue" || c.deadlineState === "soon" || c.urgent
  ).sort((a, b) => {
    const order: Record<string, number> = { overdue: 0, soon: 1, ok: 2 };
    return order[a.deadlineState] - order[b.deadlineState];
  });

  /* Колонки для канбана (без заготовок) */
  const kanbanCols = COLUMNS.filter(c => c.id !== "cutting");

  /* фильтрация по активному этапу */
  const activeCol = activeStage ? kanbanCols.find(c => c.id === activeStage) : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Шапка ── */}
      <div className="px-7 pt-6 pb-0 shrink-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[21px] font-semibold text-[#1a1a1a] tracking-tight">Производство</h1>
            <p className="text-[13px] text-[#9b9b9b] mt-0.5">{allCards.length} изделий · {overdue} просрочено · {urgent} срочных</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMasterMode(m => !m)}
              className={`flex items-center gap-2 text-[13px] px-4 py-2 rounded-[8px] border transition-all font-medium
                ${masterMode
                  ? "bg-[#f59e0b] text-white border-[#f59e0b] shadow-sm"
                  : "bg-white text-[#4b4b4b] border-[#ebebeb] hover:border-[#c5c5c5]"}`}
            >
              <Icon name="HardHat" size={14} />
              Режим мастера
            </button>
          </div>
        </div>

        {/* ── Цепочка этапов ── */}
        <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
          {STAGE_CHAIN.map((stage, idx) => {
            const state = stage.id === "заготовки" ? "idle" : stageState(stage.id);
            const sc    = STAGE_COLORS[state];
            const col   = COLUMNS.find(c => c.id === stage.id);
            const count = col?.cards.length ?? 0;
            const isActive = activeStage === stage.id;

            return (
              <div key={stage.id} className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setActiveStage(isActive ? null : (stage.id === "заготовки" ? null : stage.id))}
                  className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl border transition-all
                    ${sc.bg} ${sc.ring}
                    ${isActive ? "shadow-md scale-[1.03]" : "hover:scale-[1.02]"}
                    ${stage.id === "заготовки" ? "cursor-default opacity-60" : "cursor-pointer"}`}
                >
                  <Icon name={stage.icon as never} size={16} style={{ color: sc.dot }} />
                  <span className={`text-[12px] font-semibold ${sc.text}`}>{stage.label}</span>
                  {count > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-px rounded-full ${sc.label}`}>
                      {count} шт.
                    </span>
                  )}
                  {state === "overdue" && (
                    <span className="text-[9px] font-bold text-red-500 bg-red-100 px-1.5 py-px rounded-full">
                      {col?.cards.filter(c => c.deadlineState === "overdue").length} просрочки
                    </span>
                  )}
                </button>

                {idx < STAGE_CHAIN.length - 1 && (
                  <Icon name="ChevronRight" size={14} className="text-[#d0d0d0] shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Узкое место ── */}
        {bottleneck && bottleneck.cards.filter(c => c.deadlineState === "overdue").length > 0 && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
            <Icon name="AlertOctagon" size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-red-700">Где сейчас проблема</p>
              <p className="text-[12px] text-red-600 mt-0.5">
                <b>{bottleneck.label}</b> —{" "}
                {bottleneck.cards.length} заказов,{" "}
                {bottleneck.cards.filter(c => c.deadlineState === "overdue").length} просрочки.{" "}
                {bottleneck.cards.filter(c => c.urgent).length > 0 && (
                  <span className="font-semibold">⚡ Есть срочные!</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* ── Зоны производства ── */}
        {!masterMode && (
          <div className="grid grid-cols-2 gap-3 mb-5">
            {productionZones.map(zone => (
              <div key={zone.id} className="bg-white border border-[#ebebeb] rounded-xl p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: zone.color + "18" }}>
                    <Icon name={zone.icon as never} size={13} style={{ color: zone.color }} />
                  </div>
                  <span className="text-[13px] font-semibold text-[#1a1a1a]">{zone.name}</span>
                  <span className="ml-auto text-[11px] text-[#9b9b9b]">{zone.cards.length} заказов</span>
                  {zone.overdueCount > 0 && (
                    <span className="text-[10px] font-bold text-red-500 bg-red-100 px-1.5 py-px rounded-full">
                      {zone.overdueCount} просрочки
                    </span>
                  )}
                </div>

                {/* Станки */}
                <div className="space-y-1.5 mb-3">
                  {zone.machines.map(m => (
                    <div key={m.id} className="flex items-center gap-2 text-[12px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d0d0d0] shrink-0" />
                      <span className="text-[#4b4b4b]">Место {m.id.replace("m", "")} — {m.name}</span>
                    </div>
                  ))}
                </div>

                {/* Сотрудник */}
                <div className="flex items-center justify-between pt-2.5 border-t border-[#f5f5f5]">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#9b9b9b]">
                    <Icon name="User" size={11} />
                    {zone.employee
                      ? <span className="text-[#4b4b4b] font-medium">{zone.employee.name}</span>
                      : <span className="text-[#c0c0c0] italic">Не назначен</span>
                    }
                  </div>
                  <button className="text-[11px] font-semibold text-[#6366f1] hover:text-[#4f46e5] transition-colors">
                    Открыть этап →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Фильтры ── */}
        {!masterMode && (
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1 bg-white border border-[#ebebeb] rounded-[8px] p-1">
              {FILTERS.map(f => {
                const count = f.key === "overdue" ? overdue : f.key === "urgent" ? urgent : null;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
                      ${filter === f.key ? "bg-[#1a1a1a] text-white shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
                  >
                    {f.label}
                    {count !== null && count > 0 && (
                      <span className={`text-[10px] rounded-full px-1.5 py-px font-bold leading-none
                        ${filter === f.key ? "bg-white/20 text-white" : f.key === "overdue" ? "bg-red-100 text-red-500" : "bg-amber-100 text-amber-600"}`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {activeStage && (
              <div className="flex items-center gap-1.5 text-[12px] text-[#6366f1] bg-[#eef2ff] border border-[#e0e7ff] px-3 py-1.5 rounded-[8px]">
                <Icon name="Filter" size={12} />
                Этап: {STAGE_CHAIN.find(s => s.id === activeStage)?.label}
                <button onClick={() => setActiveStage(null)} className="ml-1 text-[#9b9b9b] hover:text-[#6366f1]">
                  <Icon name="X" size={11} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════════ Режим мастера ════════ */}
      {masterMode ? (
        <div className="flex-1 overflow-y-auto px-7 pb-7">
          <div className="space-y-3 max-w-[700px]">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-2">Задачи на сегодня</p>
            {todayCards.length === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-4 text-[13px] text-green-700 flex items-center gap-2">
                <Icon name="CheckCircle" size={15} />
                Всё в порядке — просрочек и срочных нет
              </div>
            )}
            {todayCards.map(card => {
              const col  = COLUMNS.find(c => c.cards.some(x => x.id === card.id));
              const dc   = DEADLINE_CARD[card.deadlineState];
              const dl   = DEADLINE_BADGE[card.deadlineState];
              const machine = card.machineId ? MACHINES.find(m => m.id === card.machineId) : null;
              return (
                <div
                  key={card.id}
                  className={`rounded-xl border p-4 flex items-start gap-4 ${dc.border} ${dc.bg}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-bold text-[#1a1a1a]">{card.id}</span>
                      {card.urgent && (
                        <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-px rounded-full">⚡ СРОЧНО</span>
                      )}
                      {dl.label && (
                        <span className="text-[10px] font-semibold px-1.5 py-px rounded-full"
                          style={{ color: dl.color, backgroundColor: dl.bg }}>
                          {dl.label}
                        </span>
                      )}
                    </div>
                    <p className="text-[14px] font-semibold text-[#1a1a1a]">{card.client}</p>
                    <p className="text-[12px] text-[#6b6b6b] mt-0.5">{card.stone} · {card.size}</p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-[11px] text-[#9b9b9b]">Этап: <b className="text-[#1a1a1a]">{col?.label}</b></p>
                    <p className="text-[11px] text-[#9b9b9b]">Срок: <b style={{ color: dl.color || "#1a1a1a" }}>{card.deadline}</b></p>
                    {machine && <p className="text-[11px] text-[#9b9b9b]">{machine.name}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      /* ════════ Канбан ════════ */
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-auto pb-7">
          <div className="flex gap-3 items-start px-7 min-h-full">
            {(activeCol ? [activeCol] : kanbanCols).map(col => {
              const visibleCards = col.cards.filter(applyFilter);
              const colOverdue   = col.cards.filter(c => c.deadlineState === "overdue").length;
              const isBottleneck = col.id === bottleneck?.id;

              return (
                <div key={col.id} className={activeCol ? "w-full max-w-[560px]" : "w-[240px] shrink-0"}>

                  {/* Заголовок колонки */}
                  <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border mb-2
                    ${isBottleneck ? "bg-amber-50 border-amber-200" : "bg-white border-[#ebebeb]"}`}>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                    <span className="text-[13px] font-semibold text-[#1a1a1a] flex-1">{col.label}</span>
                    <span className="text-[11px] font-semibold bg-[#f5f5f5] text-[#6b6b6b] rounded-md px-1.5 py-0.5">
                      {col.cards.length}
                    </span>
                    {colOverdue > 0 && (
                      <span className="text-[10px] font-bold bg-red-100 text-red-500 rounded-md px-1.5 py-0.5">
                        {colOverdue}⚠
                      </span>
                    )}
                  </div>

                  {/* Карточки */}
                  <div className={`flex flex-col gap-2 ${activeCol ? "grid grid-cols-2" : ""}`}>
                    {visibleCards.length === 0 && filter !== "all" ? (
                      <div className="border border-dashed border-[#e5e5e5] rounded-xl py-6 text-center text-[12px] text-[#c5c5c5]">
                        нет заказов
                      </div>
                    ) : (
                      visibleCards.map(card => {
                        const dl      = DEADLINE_BADGE[card.deadlineState];
                        const dc      = DEADLINE_CARD[card.deadlineState];
                        const machine = card.machineId ? MACHINES.find(m => m.id === card.machineId) : null;
                        const emp     = card.manager ? EMPLOYEES.find(e => e.name === card.manager) : null;
                        const progress = Math.min(100, Math.round((card.daysInStage / 10) * 100));

                        return (
                          <div
                            key={card.id}
                            onMouseEnter={() => setHovered(card.id)}
                            onMouseLeave={() => setHovered(null)}
                            className={`rounded-xl p-3 border transition-all cursor-pointer hover:shadow-md ${dc.border} ${dc.bg}`}
                          >
                            {/* Строка 1: ID + срочно */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[12px] font-bold text-[#1a1a1a]">{card.id}</span>
                              {card.urgent && (
                                <span className="text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-px rounded-full">⚡ СРОЧНО</span>
                              )}
                              {dl.label && (
                                <span className="ml-auto text-[9px] font-semibold px-1.5 py-px rounded-full"
                                  style={{ color: dl.color, backgroundColor: dl.bg }}>
                                  {dl.label}
                                </span>
                              )}
                            </div>

                            {/* Клиент + изделие */}
                            <p className="text-[12px] font-semibold text-[#1a1a1a] mb-0.5">{card.client}</p>
                            <p className="text-[11px] text-[#6b6b6b] mb-2">{card.stone} · {card.size}</p>

                            {/* Срок */}
                            <div className="flex items-center gap-1.5 mb-2 text-[11px]">
                              <Icon name="Calendar" size={11} className="text-[#b5b5b5]" />
                              <span style={{ color: dl.color || "#9b9b9b" }}>до {card.deadline}</span>
                            </div>

                            {/* Ответственный */}
                            <div className="flex items-center gap-1.5 mb-2 text-[11px] text-[#6b6b6b]">
                              <Icon name="User" size={11} className="text-[#b5b5b5]" />
                              <span>{card.manager}</span>
                            </div>

                            {/* Станок */}
                            {machine && (
                              <div className="flex items-center gap-1.5 mb-2 text-[11px] text-[#6b6b6b]">
                                <Icon name="Settings" size={11} className="text-[#b5b5b5]" />
                                <span>{machine.name}</span>
                              </div>
                            )}

                            {/* Прогресс */}
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-[10px] text-[#b5b5b5] mb-1">
                                <span>{card.daysInStage} дн. в этапе</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="h-1 rounded-full bg-[#f0f0f0] overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${progress}%`,
                                    backgroundColor: card.deadlineState === "overdue" ? "#ef4444"
                                      : card.deadlineState === "soon" ? "#f59e0b" : "#22c55e",
                                  }}
                                />
                              </div>
                            </div>

                            {/* Hover-действия */}
                            {hovered === card.id && (
                              <div className="mt-2.5 pt-2.5 border-t border-[#f0f0f0] flex gap-1.5">
                                <button className="flex-1 text-[10px] font-semibold text-[#6366f1] bg-[#eef2ff] hover:bg-[#e0e7ff] py-1 rounded-lg transition-colors">
                                  Открыть
                                </button>
                                <button className="flex-1 text-[10px] font-semibold text-[#22c55e] bg-[#f0fdf4] hover:bg-[#dcfce7] py-1 rounded-lg transition-colors">
                                  Продвинуть
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
