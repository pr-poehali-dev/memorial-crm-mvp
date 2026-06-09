import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { FlatItem, DEADLINE_BADGE, COL_CONFIG } from "./production.types";

type SortKey = "deadline" | "urgency" | "stage";
type SortDir = "asc" | "desc";
type UrgencyFilter = "all" | "ok" | "urgent" | "overdue";

const URGENCY_ORDER = { overdue: 0, soon: 1, ok: 2 } as const;

type Props = {
  allItems: FlatItem[];
  initialStage?: string;
  onItemClick: (item: FlatItem) => void;
};

export default function ProductionList({ allItems, initialStage, onItemClick }: Props) {
  const [stage,   setStage]   = useState<string>(initialStage ?? "all");
  const [urgency, setUrgency] = useState<UrgencyFilter>("all");
  const [employee, setEmployee] = useState("all");
  const [search,   setSearch]   = useState("");
  const [sortKey,  setSortKey]  = useState<SortKey>("deadline");
  const [sortDir,  setSortDir]  = useState<SortDir>("asc");

  const employees = useMemo(() =>
    ["all", ...new Set(allItems.map(i => i.manager).filter(Boolean))], [allItems]);

  const filtered = useMemo(() => {
    let res = allItems;
    if (stage !== "all")    res = res.filter(i => i.colId === stage);
    if (urgency === "ok")      res = res.filter(i => i.deadlineState === "ok" && !i.urgent);
    if (urgency === "urgent")  res = res.filter(i => !!i.urgent);
    if (urgency === "overdue") res = res.filter(i => i.deadlineState === "overdue");
    if (employee !== "all") res = res.filter(i => i.manager === employee);
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      res = res.filter(i =>
        i.orderId.toLowerCase().includes(q) ||
        i.client.toLowerCase().includes(q) ||
        (i.phone ?? "").includes(q)
      );
    }
    const stageOrder = Object.fromEntries(COL_CONFIG.map((c, idx) => [c.id, idx]));
    return [...res].sort((a, b) => {
      let diff = 0;
      if (sortKey === "deadline") diff = URGENCY_ORDER[a.deadlineState] - URGENCY_ORDER[b.deadlineState];
      else if (sortKey === "urgency") {
        const au = a.urgent ? 0 : URGENCY_ORDER[a.deadlineState] + 1;
        const bu = b.urgent ? 0 : URGENCY_ORDER[b.deadlineState] + 1;
        diff = au - bu;
      } else if (sortKey === "stage") {
        diff = (stageOrder[a.colId] ?? 99) - (stageOrder[b.colId] ?? 99);
      }
      return sortDir === "asc" ? diff : -diff;
    });
  }, [allItems, stage, urgency, employee, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <Icon name="ChevronsUpDown" size={11} className="text-[#c0c0c0]" />;
    return <Icon name={sortDir === "asc" ? "ChevronUp" : "ChevronDown"} size={11} className="text-[#2563eb]" />;
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Фильтры */}
      <div className="shrink-0 px-7 py-3 bg-white border-b border-[#e8e8e8] flex items-center gap-3 flex-wrap">

        <div className="flex gap-0.5 bg-[#f4f4f4] rounded-[9px] p-0.5 shrink-0">
          <button
            onClick={() => setStage("all")}
            className={`px-3 py-1.5 rounded-[7px] text-[12px] font-medium transition-all whitespace-nowrap
              ${stage === "all" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
          >Все этапы</button>
          {COL_CONFIG.map(c => (
            <button
              key={c.id}
              onClick={() => setStage(c.id)}
              className={`px-3 py-1.5 rounded-[7px] text-[12px] font-medium transition-all whitespace-nowrap
                ${stage === c.id ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
            >{c.label}</button>
          ))}
        </div>

        <div className="flex gap-0.5 bg-[#f4f4f4] rounded-[9px] p-0.5 shrink-0">
          {(["all","ok","urgent","overdue"] as UrgencyFilter[]).map(u => {
            const labels = { all: "Все", ok: "Обычные", urgent: "Срочные", overdue: "Просроченные" };
            return (
              <button key={u} onClick={() => setUrgency(u)}
                className={`px-3 py-1.5 rounded-[7px] text-[12px] font-medium transition-all whitespace-nowrap
                  ${urgency === u
                    ? u === "overdue" ? "bg-red-500 text-white shadow-sm"
                    : u === "urgent"  ? "bg-amber-400 text-white shadow-sm"
                    : "bg-white text-[#1a1a1a] shadow-sm"
                    : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
              >{labels[u]}</button>
            );
          })}
        </div>

        <select value={employee} onChange={e => setEmployee(e.target.value)}
          className="bg-white border border-[#e8e8e8] rounded-[9px] px-3 py-2 text-[12px] text-[#1a1a1a] outline-none focus:border-[#b0b0b0] transition-colors">
          <option value="all">Все сотрудники</option>
          {employees.filter(e => e !== "all").map(e => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>

        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c0c0c0]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Заказ, клиент, телефон..."
            className="w-full bg-white border border-[#e8e8e8] rounded-[9px] pl-8 pr-7 py-2 text-[12px] outline-none focus:border-[#b0b0b0] transition-colors placeholder:text-[#c5c5c5]" />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#c0c0c0] hover:text-[#555]">
              <Icon name="X" size={12} />
            </button>
          )}
        </div>

        <span className="text-[12px] text-[#9b9b9b] ml-auto shrink-0">{filtered.length} заказов</span>
      </div>

      {/* Таблица */}
      <div className="flex-1 overflow-auto px-7 py-4">
        <div className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f0f0f0]">
                <Th label="№ / Клиент" />
                <Th label="Материал" />
                <Th label="Этап" sortKey="stage" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <Th label="Сотрудник" />
                <Th label="Оплата" />
                <Th label="Дедлайн" sortKey="deadline" current={sortKey} dir={sortDir} onSort={toggleSort} />
                <Th label="Срочность" sortKey="urgency" current={sortKey} dir={sortDir} onSort={toggleSort} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[13px] text-[#b5b5b5]">
                    Ничего не найдено
                  </td>
                </tr>
              )}
              {filtered.map((item, idx) => {
                const dl       = DEADLINE_BADGE[item.deadlineState];
                const colCfg   = COL_CONFIG.find(c => c.id === item.colId);
                const isLast   = idx === filtered.length - 1;
                return (
                  <tr
                    key={item.itemId}
                    onClick={() => onItemClick(item)}
                    className={`cursor-pointer hover:bg-[#fafafa] transition-colors ${isLast ? "" : "border-b border-[#f5f5f5]"}`}
                  >
                    <td className="px-4 py-3">
                      <p className="text-[14px] font-bold text-[#1a1a1a]">{item.orderId}</p>
                      <p className="text-[12px] text-[#8a8a8a]">{item.client}</p>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#4b4b4b]">
                      {item.stone && <p>{item.stone}</p>}
                      {item.size  && <p className="text-[11px] text-[#9b9b9b]">{item.size}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {colCfg && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap"
                          style={{ backgroundColor: colCfg.color + "18", color: colCfg.color }}>
                          {colCfg.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#4b4b4b]">{item.manager}</td>
                    <td className="px-4 py-3 text-[12px] text-[#4b4b4b] whitespace-nowrap">{item.payment}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {dl.label ? (
                        <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md"
                          style={{ backgroundColor: dl.bg, color: dl.color }}>
                          {item.deadline} — {dl.label}
                        </span>
                      ) : (
                        <span className="text-[12px] text-[#5a5a5a]">{item.deadline}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.urgent ? (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase">срочно</span>
                      ) : item.deadlineState === "overdue" ? (
                        <span className="text-[10px] font-bold bg-red-50 text-red-500 px-2 py-0.5 rounded-full">просрочен</span>
                      ) : null}
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

function Th({ label, sortKey, current, dir, onSort }: {
  label: string; sortKey?: SortKey; current?: SortKey; dir?: SortDir;
  onSort?: (k: SortKey) => void;
}) {
  return (
    <th
      className={`px-4 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap
        ${sortKey ? "cursor-pointer hover:text-[#2563eb] select-none" : ""}`}
      onClick={() => sortKey && onSort?.(sortKey)}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortKey && current === sortKey && (
          <Icon name={dir === "asc" ? "ChevronUp" : "ChevronDown"} size={11} className="text-[#2563eb]" />
        )}
        {sortKey && current !== sortKey && (
          <Icon name="ChevronsUpDown" size={11} className="text-[#c0c0c0]" />
        )}
      </span>
    </th>
  );
}