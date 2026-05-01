import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import {
  FlatItem, COLUMNS, DEADLINE_BADGE, ITEM_STATUS_LABEL,
  MACHINE_PLACE, MACHINES, EMPLOYEES,
} from "./production.types";

type SortKey = "deadline" | "urgency" | "progress" | "stage";
type SortDir = "asc" | "desc";
type StageFilter = "all" | "sketch" | "engraving" | "polishing" | "ready";
type UrgencyFilter = "all" | "ok" | "urgent" | "overdue";

const STAGE_LABELS: Record<string, string> = {
  sketch:    "Эскиз",
  engraving: "Гравировка",
  polishing: "Полировка",
  ready:     "Готов",
};

const STAGE_COLORS: Record<string, string> = {
  sketch:    "#6366f1",
  engraving: "#ec4899",
  polishing: "#14b8a6",
  ready:     "#22c55e",
};

const URGENCY_ORDER = { overdue: 0, soon: 1, ok: 2 } as const;
const STAGE_ORDER   = { sketch: 0, engraving: 1, polishing: 2, ready: 3 } as const;

type Props = {
  allItems: FlatItem[];
  initialStage?: string;
  onItemClick: (item: FlatItem) => void;
};

export default function ProductionList({ allItems, initialStage, onItemClick }: Props) {
  const [stage,   setStage]   = useState<StageFilter>((initialStage as StageFilter) ?? "all");
  const [urgency, setUrgency] = useState<UrgencyFilter>("all");
  const [employee, setEmployee] = useState("all");
  const [machine,  setMachine]  = useState("all");
  const [search,   setSearch]   = useState("");
  const [sortKey,  setSortKey]  = useState<SortKey>("deadline");
  const [sortDir,  setSortDir]  = useState<SortDir>("asc");

  /* уникальные значения для дропдаунов */
  const employees = useMemo(() =>
    ["all", ...new Set(allItems.map(i => i.manager).filter(Boolean))], [allItems]);

  const machines = useMemo(() =>
    ["all", ...new Set(allItems.map(i => i.machineId).filter(Boolean) as string[])], [allItems]);

  /* фильтрация */
  const filtered = useMemo(() => {
    let res = allItems;

    if (stage !== "all")    res = res.filter(i => i.colId === stage);
    if (urgency === "ok")      res = res.filter(i => i.deadlineState === "ok" && !i.urgent);
    if (urgency === "urgent")  res = res.filter(i => !!i.urgent);
    if (urgency === "overdue") res = res.filter(i => i.deadlineState === "overdue");
    if (employee !== "all") res = res.filter(i => i.manager === employee);
    if (machine  !== "all") res = res.filter(i => i.machineId === machine);

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      res = res.filter(i =>
        i.orderId.toLowerCase().includes(q) ||
        i.client.toLowerCase().includes(q) ||
        (i.phone ?? "").includes(q)
      );
    }

    return [...res].sort((a, b) => {
      let diff = 0;
      if (sortKey === "deadline") {
        diff = URGENCY_ORDER[a.deadlineState] - URGENCY_ORDER[b.deadlineState];
      } else if (sortKey === "urgency") {
        const au = a.urgent ? 0 : URGENCY_ORDER[a.deadlineState] + 1;
        const bu = b.urgent ? 0 : URGENCY_ORDER[b.deadlineState] + 1;
        diff = au - bu;
      } else if (sortKey === "progress") {
        diff = a.itemProgress - b.itemProgress;
      } else if (sortKey === "stage") {
        diff = (STAGE_ORDER[a.colId as keyof typeof STAGE_ORDER] ?? 99)
             - (STAGE_ORDER[b.colId as keyof typeof STAGE_ORDER] ?? 99);
      }
      return sortDir === "asc" ? diff : -diff;
    });
  }, [allItems, stage, urgency, employee, machine, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <Icon name="ChevronsUpDown" size={11} className="text-[#c0c0c0]" />;
    return <Icon name={sortDir === "asc" ? "ChevronUp" : "ChevronDown"} size={11} className="text-[#6366f1]" />;
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">

      {/* ── Фильтры ── */}
      <div className="shrink-0 px-7 py-3 bg-white border-b border-[#e8e8e8] flex items-center gap-3 flex-wrap">

        {/* По этапу */}
        <div className="flex gap-0.5 bg-[#f4f4f4] rounded-[9px] p-0.5 shrink-0">
          {(["all","sketch","engraving","polishing","ready"] as StageFilter[]).map(s => {
            const active = stage === s;
            return (
              <button
                key={s}
                onClick={() => setStage(s)}
                className={`px-3 py-1.5 rounded-[7px] text-[12px] font-medium transition-all whitespace-nowrap
                  ${active ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
              >
                {s === "all" ? "Все этапы" : STAGE_LABELS[s]}
              </button>
            );
          })}
        </div>

        {/* По срочности */}
        <div className="flex gap-0.5 bg-[#f4f4f4] rounded-[9px] p-0.5 shrink-0">
          {(["all","ok","urgent","overdue"] as UrgencyFilter[]).map(u => {
            const active = urgency === u;
            const labels = { all: "Все", ok: "Обычные", urgent: "Срочные", overdue: "Просроченные" };
            return (
              <button
                key={u}
                onClick={() => setUrgency(u)}
                className={`px-3 py-1.5 rounded-[7px] text-[12px] font-medium transition-all whitespace-nowrap
                  ${active
                    ? u === "overdue" ? "bg-red-500 text-white shadow-sm"
                    : u === "urgent"  ? "bg-amber-400 text-white shadow-sm"
                    : "bg-white text-[#1a1a1a] shadow-sm"
                    : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
              >
                {labels[u]}
              </button>
            );
          })}
        </div>

        {/* Сотрудник */}
        <select
          value={employee}
          onChange={e => setEmployee(e.target.value)}
          className="bg-white border border-[#e8e8e8] rounded-[9px] px-3 py-2 text-[12px] text-[#1a1a1a] outline-none focus:border-[#b0b0b0] transition-colors"
        >
          <option value="all">Все сотрудники</option>
          {employees.filter(e => e !== "all").map(e => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>

        {/* Станок */}
        <select
          value={machine}
          onChange={e => setMachine(e.target.value)}
          className="bg-white border border-[#e8e8e8] rounded-[9px] px-3 py-2 text-[12px] text-[#1a1a1a] outline-none focus:border-[#b0b0b0] transition-colors"
        >
          <option value="all">Все станки</option>
          {machines.filter(m => m !== "all").map(m => (
            <option key={m} value={m}>{MACHINE_PLACE[m] ?? m}</option>
          ))}
        </select>

        {/* Поиск */}
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c0c0c0]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Заказ, клиент, телефон..."
            className="w-full bg-white border border-[#e8e8e8] rounded-[9px] pl-8 pr-7 py-2 text-[12px] outline-none focus:border-[#b0b0b0] transition-colors placeholder:text-[#c5c5c5]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#c0c0c0] hover:text-[#555]">
              <Icon name="X" size={12} />
            </button>
          )}
        </div>

        {/* Итого */}
        <span className="text-[12px] text-[#9b9b9b] ml-auto shrink-0">
          {filtered.length} изделий
        </span>
      </div>

      {/* ── Таблица ── */}
      <div className="flex-1 overflow-auto px-7 py-4">
        <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f0f0f0]">
                <Th label="№ / Клиент" />
                <Th label="Этап"      sortKey="stage"    current={sortKey} dir={sortDir} onSort={toggleSort} />
                <Th label="Прогресс"  sortKey="progress" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <Th label="Сотрудник" />
                <Th label="Станок" />
                <Th label="Дедлайн"   sortKey="deadline" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <Th label="Срочность" sortKey="urgency"  current={sortKey} dir={sortDir} onSort={toggleSort} />
                <Th label="Изделия" />
                <Th label="Статус" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[13px] text-[#b5b5b5]">
                    Ничего не найдено
                  </td>
                </tr>
              )}
              {filtered.map((item, idx) => {
                const dl        = DEADLINE_BADGE[item.deadlineState];
                const st        = ITEM_STATUS_LABEL[item.itemStatus];
                const machine   = item.machineId ? (MACHINE_PLACE[item.machineId] ?? "—") : "—";
                const doneCount = item.allItems.filter(i => i.status === "done").length;
                const total     = item.allItems.length;
                const isLast    = idx === filtered.length - 1;
                const stageColor = STAGE_COLORS[item.colId] ?? "#6b7280";

                const rowBg = item.deadlineState === "overdue"
                  ? "bg-red-50 hover:bg-red-100/40"
                  : item.urgent
                  ? "bg-amber-50/60 hover:bg-amber-100/40"
                  : "hover:bg-[#fafafa]";

                return (
                  <tr
                    key={item.itemId}
                    onClick={() => onItemClick(item)}
                    className={`cursor-pointer transition-colors ${rowBg} ${!isLast ? "border-b border-[#f5f5f5]" : ""}`}
                  >
                    {/* № / Клиент */}
                    <td className="px-4 py-3">
                      <div className="text-[13px] font-bold text-[#1a1a1a]">{item.orderId}</div>
                      <div className="text-[11px] text-[#6b6b6b] mt-0.5">{item.client}</div>
                      <div
                        className="text-[11px] font-semibold mt-0.5 px-1.5 py-0.5 rounded-md inline-block"
                        style={{ backgroundColor: stageColor + "18", color: stageColor }}
                      >
                        {item.itemType}
                      </div>
                    </td>

                    {/* Этап */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: stageColor }} />
                        <span className="text-[12px] font-semibold text-[#1a1a1a]">{STAGE_LABELS[item.colId] ?? item.colLabel}</span>
                      </div>
                    </td>

                    {/* Прогресс */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[90px]">
                        <div className="flex-1 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${item.itemProgress}%`, backgroundColor: stageColor }}
                          />
                        </div>
                        <span className="text-[11px] font-semibold text-[#1a1a1a] shrink-0">{item.itemProgress}%</span>
                      </div>
                    </td>

                    {/* Сотрудник */}
                    <td className="px-4 py-3 text-[12px] text-[#1a1a1a] whitespace-nowrap">{item.manager}</td>

                    {/* Станок */}
                    <td className="px-4 py-3 text-[12px] text-[#6b6b6b] whitespace-nowrap">{machine}</td>

                    {/* Дедлайн */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {dl.label ? (
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: dl.bg, color: dl.color }}
                        >
                          {item.deadline}
                        </span>
                      ) : (
                        <span className="text-[12px] text-[#1a1a1a]">{item.deadline}</span>
                      )}
                    </td>

                    {/* Срочность */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.deadlineState === "overdue" ? (
                        <span className="text-[11px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-md">Просрочен</span>
                      ) : item.urgent ? (
                        <span className="text-[11px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md">Срочно</span>
                      ) : (
                        <span className="text-[11px] text-[#9b9b9b]">—</span>
                      )}
                    </td>

                    {/* Изделия */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {total > 1 ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[12px] font-semibold text-[#1a1a1a]">{doneCount}/{total}</span>
                          <div className="flex gap-0.5">
                            {item.allItems.map(i => (
                              <span
                                key={i.id}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  i.status === "done" ? "bg-green-400"
                                  : i.status === "in_progress" ? "bg-amber-400"
                                  : "bg-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-[12px] text-[#9b9b9b]">1 изд.</span>
                      )}
                    </td>

                    {/* Статус */}
                    <td className="px-4 py-3">
                      <span
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap"
                        style={{ backgroundColor: st.bg, color: st.color }}
                      >
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Заголовок колонки с сортировкой ─── */
function Th({
  label, sortKey, current, dir, onSort,
}: {
  label: string;
  sortKey?: SortKey;
  current?: SortKey;
  dir?: SortDir;
  onSort?: (k: SortKey) => void;
}) {
  const isActive = sortKey && current === sortKey;
  return (
    <th
      className={`px-4 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap
        ${sortKey ? "cursor-pointer select-none hover:text-[#6b6b6b]" : ""} ${isActive ? "text-[#6366f1]" : ""}`}
      onClick={() => sortKey && onSort?.(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortKey && (
          isActive
            ? <Icon name={dir === "asc" ? "ChevronUp" : "ChevronDown"} size={11} className="text-[#6366f1]" />
            : <Icon name="ChevronsUpDown" size={11} className="text-[#c0c0c0]" />
        )}
      </div>
    </th>
  );
}
