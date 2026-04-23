import { useState } from "react";
import Icon from "@/components/ui/icon";

type DeadlineState = "overdue" | "soon" | "ok";
type FilterKey = "all" | "mine" | "overdue" | "urgent";

type Card = {
  id: string;
  client: string;
  stone: string;
  size: string;
  daysInStage: number;
  deadline: string;
  deadlineState: DeadlineState;
  manager: string;
  urgent?: boolean;
  phone: string;
};

type Column = {
  id: string;
  label: string;
  color: string;
  cards: Card[];
};

const COLUMNS: Column[] = [
  {
    id: "sketch", label: "Эскиз", color: "#6366f1",
    cards: [
      { id: "МП-0040", client: "Козлов И.Д.", stone: "Мрамор белый", size: "80×40×6", daysInStage: 2, deadline: "20.04", deadlineState: "overdue", manager: "Анна М.", phone: "+7 903 211-44-55" },
      { id: "МП-0042", client: "Белова Е.С.", stone: "Гранит чёрный", size: "90×45×7", daysInStage: 1, deadline: "02.05", deadlineState: "ok", manager: "Олег К.", phone: "+7 916 200-10-30" },
    ],
  },
  {
    id: "cutting", label: "Распил", color: "#f59e0b",
    cards: [
      { id: "МП-0041", client: "Смирнова А.В.", stone: "Гранит чёрный", size: "100×50×8", daysInStage: 5, deadline: "28.04", deadlineState: "soon", manager: "Олег К.", urgent: true, phone: "+7 912 345-67-89" },
      { id: "МП-0036", client: "Морозова Т.И.", stone: "Гранит габбро", size: "110×55×8", daysInStage: 3, deadline: "30.04", deadlineState: "ok", manager: "Игорь В.", phone: "+7 921 456-78-90" },
    ],
  },
  {
    id: "engraving", label: "Гравировка", color: "#ec4899",
    cards: [
      { id: "МП-0035", client: "Лебедев К.А.", stone: "Гранит серый", size: "100×50×8", daysInStage: 7, deadline: "10.04", deadlineState: "overdue", manager: "Игорь В.", urgent: true, phone: "+7 916 700-22-11" },
    ],
  },
  {
    id: "polishing", label: "Полировка", color: "#14b8a6",
    cards: [
      { id: "МП-0034", client: "Новикова П.В.", stone: "Мрамор серый", size: "80×40×6", daysInStage: 9, deadline: "26.04", deadlineState: "soon", manager: "Анна М.", phone: "+7 977 300-55-66" },
      { id: "МП-0033", client: "Семёнов Д.О.", stone: "Гранит красный", size: "90×45×7", daysInStage: 8, deadline: "24.04", deadlineState: "overdue", manager: "Олег К.", phone: "+7 925 100-77-88" },
    ],
  },
  {
    id: "ready", label: "Готов", color: "#22c55e",
    cards: [
      { id: "МП-0039", client: "Петрова О.Н.", stone: "Гранит серый", size: "120×60×10", daysInStage: 14, deadline: "25.04", deadlineState: "ok", manager: "Олег К.", phone: "+7 965 888-11-22" },
      { id: "МП-0037", client: "Иванов П.К.", stone: "Гранит чёрный", size: "100×50×8", daysInStage: 12, deadline: "15.04", deadlineState: "ok", manager: "Анна М.", phone: "+7 900 123-00-00" },
    ],
  },
];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "mine", label: "Мои" },
  { key: "overdue", label: "Просроченные" },
  { key: "urgent", label: "Срочные" },
];

const DEADLINE_CARD: Record<DeadlineState, { border: string; bg: string }> = {
  overdue: { border: "border-red-200",    bg: "bg-red-50" },
  soon:    { border: "border-amber-200",  bg: "bg-amber-50/50" },
  ok:      { border: "border-[#ebebeb]",  bg: "bg-white" },
};

const DEADLINE_BADGE: Record<DeadlineState, { label: string; color: string; bg: string }> = {
  overdue: { label: "просрочен", color: "#ef4444", bg: "#fef2f2" },
  soon:    { label: "скоро",     color: "#d97706", bg: "#fffbeb" },
  ok:      { label: "",          color: "",         bg: "" },
};

export default function ProductionPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [hovered, setHovered] = useState<string | null>(null);

  const allCards = COLUMNS.flatMap(c => c.cards);
  const totalInWork = allCards.filter(c => !["ready"].includes(COLUMNS.find(col => col.cards.includes(c))?.id || "")).length;
  const overdue = allCards.filter(c => c.deadlineState === "overdue").length;
  const urgent = allCards.filter(c => c.urgent).length;
  const avgDays = Math.round(allCards.reduce((s, c) => s + c.daysInStage, 0) / allCards.length);

  // Узкое место — этап с максимальным количеством просрочек или карточек
  const bottleneck = [...COLUMNS]
    .map(col => ({
      ...col,
      score: col.cards.filter(c => c.deadlineState === "overdue").length * 3 + col.cards.length,
    }))
    .sort((a, b) => b.score - a.score)[0];

  const applyFilter = (card: Card): boolean => {
    if (filter === "mine") return card.manager === "Олег К.";
    if (filter === "overdue") return card.deadlineState === "overdue";
    if (filter === "urgent") return !!card.urgent;
    return true;
  };

  const miniStats = [
    { label: "Всего в работе",       value: String(totalInWork),  icon: "Hammer",        color: "#6b6b6b" },
    { label: "Просрочено",           value: String(overdue),      icon: "AlertTriangle", color: "#ef4444" },
    { label: "Срочных заказов",      value: String(urgent),       icon: "Zap",           color: "#f59e0b" },
    { label: "Среднее время (дней)", value: String(avgDays),      icon: "Clock",         color: "#6366f1" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-7 pt-7 pb-4 shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[21px] font-semibold text-[#1a1a1a] tracking-tight">Производство</h1>
            <p className="text-[13px] text-[#9b9b9b] mt-0.5">
              {allCards.length} изделий в работе · апрель 2026
            </p>
          </div>
          <button className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[13px] px-4 py-2 rounded-[8px] hover:bg-[#333] transition-colors">
            <Icon name="Plus" size={14} />
            Добавить заказ
          </button>
        </div>

        {/* Mini-stats */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {miniStats.map((s) => (
            <div key={s.label} className="bg-white border border-[#ebebeb] rounded-xl px-4 py-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + "18" }}>
                <Icon name={s.icon as never} size={15} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-[19px] font-semibold text-[#1a1a1a] leading-none mb-0.5">{s.value}</p>
                <p className="text-[11px] text-[#9b9b9b]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottleneck + Filters row */}
        <div className="flex items-center gap-4">
          {/* Bottleneck */}
          <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-[8px] px-3.5 py-2.5 shrink-0">
            <Icon name="AlertOctagon" size={14} className="text-amber-500 shrink-0" />
            <span className="text-[12px] text-amber-700 font-medium">Узкое место:</span>
            <span className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-800">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: bottleneck.color }} />
              {bottleneck.label}
            </span>
            <span className="text-[11px] text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-md">
              {bottleneck.cards.filter(c => c.deadlineState === "overdue").length} просрочки
            </span>
          </div>

          {/* Filters */}
          <div className="flex gap-1 bg-white border border-[#ebebeb] rounded-[8px] p-1">
            {FILTERS.map((f) => {
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
        </div>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto overflow-y-auto px-7 pb-7">
        <div className="flex gap-3 min-w-max items-start">
          {COLUMNS.map((col) => {
            const visibleCards = col.cards.filter(applyFilter);
            const colOverdue = col.cards.filter(c => c.deadlineState === "overdue").length;
            const isBottleneck = col.id === bottleneck.id;

            return (
              <div key={col.id} className="w-[240px] flex flex-col gap-2">
                {/* Column header */}
                <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border mb-0.5 ${isBottleneck ? "bg-amber-50 border-amber-200" : "bg-white border-[#ebebeb]"}`}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                  <span className="text-[13px] font-semibold text-[#1a1a1a] flex-1">{col.label}</span>
                  <span className="text-[11px] font-semibold bg-[#f5f5f5] text-[#6b6b6b] rounded-md px-1.5 py-0.5">{col.cards.length}</span>
                  {colOverdue > 0 && (
                    <span className="text-[10px] font-bold bg-red-100 text-red-500 rounded-md px-1.5 py-0.5">
                      {colOverdue}⚠
                    </span>
                  )}
                </div>

                {/* Cards */}
                {visibleCards.length === 0 && filter !== "all" ? (
                  <div className="border border-dashed border-[#e5e5e5] rounded-xl py-6 text-center text-[12px] text-[#c5c5c5]">
                    нет заказов
                  </div>
                ) : (
                  visibleCards.map((card) => {
                    const dl = DEADLINE_BADGE[card.deadlineState];
                    const dc = DEADLINE_CARD[card.deadlineState];
                    const isHovered = hovered === card.id;

                    return (
                      <div
                        key={card.id}
                        onMouseEnter={() => setHovered(card.id)}
                        onMouseLeave={() => setHovered(null)}
                        className={`border rounded-xl p-3.5 cursor-pointer transition-all relative overflow-hidden
                          ${dc.bg} ${dc.border}
                          ${isHovered ? "shadow-md -translate-y-0.5" : "hover:shadow-sm"}
                        `}
                      >
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-1 mb-2.5">
                          <span className="font-mono text-[11px] font-bold text-[#9b9b9b]">{card.id}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            {card.urgent && (
                              <span className="flex items-center gap-0.5 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-md font-bold">
                                <Icon name="Zap" size={8} />срочно
                              </span>
                            )}
                            {dl.label && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md" style={{ color: dl.color, backgroundColor: dl.bg }}>
                                {dl.label}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Client */}
                        <p className="text-[13px] font-semibold text-[#1a1a1a] mb-0.5 leading-snug">{card.client}</p>
                        <p className="text-[11px] text-[#9b9b9b] mb-3">{card.stone} · {card.size} см</p>

                        {/* Deadline */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1.5">
                            <Icon name="CalendarClock" size={11} className={card.deadlineState === "overdue" ? "text-red-400" : "text-[#b5b5b5]"} />
                            <span className={`text-[12px] font-semibold ${card.deadlineState === "overdue" ? "text-red-500" : card.deadlineState === "soon" ? "text-amber-600" : "text-[#6b6b6b]"}`}>
                              {card.deadline}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#b5b5b5] bg-[#f5f5f5] px-1.5 py-0.5 rounded-md font-medium">
                            {card.manager.split(" ")[0]}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="flex items-center gap-2 mb-2.5">
                          <div className="flex-1 h-1 bg-[#f0f0f0] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, (card.daysInStage / 14) * 100)}%`,
                                backgroundColor: card.deadlineState === "overdue" ? "#ef4444"
                                  : card.deadlineState === "soon" ? "#f59e0b"
                                  : col.color,
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-[#b5b5b5] shrink-0">{card.daysInStage} дн.</span>
                        </div>

                        {/* Hover actions */}
                        <div className={`grid grid-cols-3 gap-1 transition-all duration-200 overflow-hidden ${isHovered ? "max-h-12 opacity-100 mt-0.5" : "max-h-0 opacity-0"}`}>
                          <HoverBtn icon="Eye" label="Открыть" />
                          <HoverBtn icon="ArrowRight" label="Этап →" accent />
                          <HoverBtn icon="UserCheck" label="Назначить" />
                        </div>
                      </div>
                    );
                  })
                )}

                <button className="w-full text-[12px] text-[#c5c5c5] hover:text-[#6b6b6b] border border-dashed border-[#e8e8e8] hover:border-[#c5c5c5] rounded-xl py-2.5 transition-colors">
                  + Добавить
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HoverBtn({ icon, label, accent }: { icon: string; label: string; accent?: boolean }) {
  return (
    <button
      onClick={(e) => e.stopPropagation()}
      className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[10px] font-medium transition-colors
        ${accent
          ? "bg-[#1a1a1a] text-white hover:bg-[#333]"
          : "bg-white/80 border border-[#e5e5e5] text-[#6b6b6b] hover:text-[#1a1a1a] hover:border-[#c5c5c5]"
        }`}
    >
      <Icon name={icon as never} size={11} />
      {label}
    </button>
  );
}
