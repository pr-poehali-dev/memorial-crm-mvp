import Icon from "@/components/ui/icon";
import { FILTERS, FilterKey } from "./production.types";

type ViewMode = "kanban" | "list";

type Props = {
  totalInWork: number;
  totalOverdue: number;
  totalUrgent: number;
  filter: FilterKey;
  setFilter: (f: FilterKey) => void;
  search: string;
  setSearch: (s: string) => void;
  view: ViewMode;
  setView: (v: ViewMode) => void;
};

export default function ProductionHeader({
  totalInWork, totalOverdue, totalUrgent,
  filter, setFilter,
  search, setSearch,
  view, setView,
}: Props) {
  return (
    <div className="shrink-0 bg-white border-b border-[#e8e8e8]">

      {/* Строка 1: заголовок + метрики */}
      <div className="flex items-center gap-4 px-7 py-4">
        <h1 className="text-[20px] font-semibold text-[#1a1a1a] tracking-tight">Производство</h1>
        <div className="flex items-center gap-2">
          <Chip label={`В работе: ${totalInWork}`} />
          {totalOverdue > 0 && (
            <Chip label={`${totalOverdue} просрочено`} color="#dc2626" bg="#fef2f2" border="border-red-200" />
          )}
          {totalUrgent > 0 && (
            <Chip label={`${totalUrgent} срочных`} color="#d97706" bg="#fffbeb" border="border-amber-200" />
          )}
        </div>
      </div>

      {/* Строка 2: переключатель слева + фильтры */}
      <div className="flex items-center gap-3 px-7 py-2.5 border-t border-[#f0f0f0]">

        {/* Переключатель — крайний левый */}
        <div className="flex gap-0.5 bg-[#f4f4f4] rounded-[9px] p-0.5 shrink-0">
          {(["kanban", "list"] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[12px] font-medium transition-all
                ${view === v ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
            >
              <Icon name={v === "kanban" ? "LayoutGrid" : "List"} size={13} />
              {v === "kanban" ? "Канбан" : "Список"}
            </button>
          ))}
        </div>

        {/* Разделитель */}
        <div className="w-px h-5 bg-[#e8e8e8] shrink-0" />

        {/* Фильтры — только в режиме канбана */}
        {view === "kanban" && (
          <>
            <div className="flex gap-1 bg-[#f4f4f4] rounded-[9px] p-0.5 shrink-0">
              {FILTERS.map(f => {
                const cnt = f.key === "overdue" ? totalOverdue : f.key === "urgent" ? totalUrgent : null;
                const active = filter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[12px] font-medium transition-all
                      ${active ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
                  >
                    {f.label}
                    {cnt !== null && cnt > 0 && (
                      <span className={`text-[10px] rounded-full px-1.5 py-px font-bold leading-none
                        ${active ? "bg-[#1a1a1a] text-white" : f.key === "overdue" ? "bg-red-100 text-red-500" : "bg-amber-100 text-amber-600"}`}>
                        {cnt}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="relative max-w-[280px] flex-1">
              <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c0c0c0]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск по номеру заказа..."
                className="w-full bg-white border border-[#e8e8e8] rounded-[9px] pl-8 pr-8 py-1.5 text-[12px] outline-none focus:border-[#b0b0b0] transition-colors placeholder:text-[#c5c5c5]"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c0c0c0] hover:text-[#555]">
                  <Icon name="X" size={12} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Chip({ label, color = "#6b6b6b", bg = "#f4f4f4", border = "border-[#e8e8e8]" }: {
  label: string; color?: string; bg?: string; border?: string;
}) {
  return (
    <span
      className={`text-[12px] font-semibold px-3 py-1 rounded-full border ${border}`}
      style={{ color, backgroundColor: bg }}
    >
      {label}
    </span>
  );
}