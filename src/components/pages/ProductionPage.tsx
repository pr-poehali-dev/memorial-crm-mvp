import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import {
  COLUMNS, FILTERS, DEADLINE_CARD, DEADLINE_BADGE,
  MACHINES, FilterKey, Card,
} from "./production/production.types";

/* ─── Вспомогалки ─── */
type FlatCard = Card & { colId: string; colLabel: string; colColor: string };

const MACHINE_PLACE: Record<string, string> = {
  m3: "Место 3 — Гравёр ЧПУ №1",
  m4: "Место 4 — Гравёр ЧПУ №2",
  m5: "Место 5 — Лазер",
  m6: "Место 6 — Полировщик №1",
  m7: "Место 7 — Полировщик №2",
};

function machineName(machineId?: string): string {
  if (!machineId) return "—";
  return MACHINE_PLACE[machineId] ?? MACHINES.find(m => m.id === machineId)?.name ?? "—";
}

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  overdue: { label: "Просрочен", color: "#dc2626", bg: "#fef2f2" },
  soon:    { label: "Скоро",     color: "#d97706", bg: "#fffbeb" },
  ok:      { label: "В работе",  color: "#6b7280", bg: "#f9fafb" },
};

/* ════════════════════════════════════════ */
export default function ProductionPage() {
  const [view,   setView]   = useState<"kanban" | "list">("kanban");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<FlatCard | null>(null);

  const allFlat: FlatCard[] = useMemo(() =>
    COLUMNS.flatMap(col => col.cards.map(c => ({
      ...c, colId: col.id, colLabel: col.label, colColor: col.color,
    }))),
  []);

  const applyFilter = (c: FlatCard) => {
    if (filter === "mine")    return c.manager === "Олег К.";
    if (filter === "overdue") return c.deadlineState === "overdue";
    if (filter === "urgent")  return !!c.urgent;
    return true;
  };

  const applySearch = (c: FlatCard) => {
    const q = search.toLowerCase();
    return !q || c.id.toLowerCase().includes(q) || c.client.toLowerCase().includes(q) || c.phone.includes(q);
  };

  const visibleIds   = new Set(allFlat.filter(c => applyFilter(c) && applySearch(c)).map(c => c.id));
  const totalInWork  = allFlat.filter(c => c.colId !== "ready").length;
  const totalOverdue = allFlat.filter(c => c.deadlineState === "overdue").length;
  const totalUrgent  = allFlat.filter(c => c.urgent).length;

  const listCards = allFlat
    .filter(c => visibleIds.has(c.id))
    .sort((a, b) => {
      const ord: Record<string, number> = { overdue: 0, soon: 1, ok: 2 };
      return ord[a.deadlineState] - ord[b.deadlineState];
    });

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Sticky шапка ── */}
      <div className="shrink-0 bg-[#fafafa] border-b border-[#ebebeb] px-7 py-4">

        {/* Строка 1: заголовок + метрики + переключатель */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <h1 className="text-[20px] font-semibold text-[#1a1a1a] tracking-tight">Производство</h1>
            <div className="flex items-center gap-3 text-[13px]">
              <span className="text-[#6b6b6b]">В работе: <b className="text-[#1a1a1a]">{totalInWork}</b></span>
              {totalOverdue > 0 && (
                <span className="font-semibold text-[#dc2626] bg-red-50 border border-red-200 px-2 py-0.5 rounded-full text-[12px]">
                  {totalOverdue} просрочено
                </span>
              )}
              {totalUrgent > 0 && (
                <span className="font-semibold text-[#d97706] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[12px]">
                  {totalUrgent} срочных
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-0.5 bg-[#f0f0f0] rounded-[8px] p-0.5">
            <button
              onClick={() => setView("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
                ${view === "kanban" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
            >
              <Icon name="LayoutGrid" size={13} />Канбан
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
                ${view === "list" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
            >
              <Icon name="List" size={13} />Список
            </button>
          </div>
        </div>

        {/* Строка 2: фильтры + поиск */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-white border border-[#ebebeb] rounded-[8px] p-1 shrink-0">
            {FILTERS.map(f => {
              const cnt = f.key === "overdue" ? totalOverdue : f.key === "urgent" ? totalUrgent : null;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
                    ${filter === f.key ? "bg-[#1a1a1a] text-white" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
                >
                  {f.label}
                  {cnt !== null && cnt > 0 && (
                    <span className={`text-[10px] rounded-full px-1.5 py-px font-bold leading-none
                      ${filter === f.key ? "bg-white/25 text-white" : f.key === "overdue" ? "bg-red-100 text-red-500" : "bg-amber-100 text-amber-600"}`}>
                      {cnt}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="relative flex-1 max-w-[340px]">
            <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5b5]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск: номер, клиент или телефон"
              className="w-full bg-white border border-[#e0e0e0] rounded-[8px] pl-8 pr-3 py-2 text-[13px] outline-none focus:border-[#b0b0b0] transition-colors placeholder:text-[#c0c0c0]"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b5b5b5] hover:text-[#4b4b4b]">
                <Icon name="X" size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ════════ Канбан ════════ */}
      {view === "kanban" && (
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <div className="flex gap-3 items-start px-7 py-5 min-h-full">
            {COLUMNS.map(col => {
              const colFlat = col.cards
                .filter(c => visibleIds.has(c.id))
                .map(c => ({ ...c, colId: col.id, colLabel: col.label, colColor: col.color }));
              const colOver = col.cards.filter(c => c.deadlineState === "overdue").length;

              return (
                <div key={col.id} className="w-[240px] shrink-0 flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-[#ebebeb] mb-0.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                    <span className="text-[13px] font-semibold text-[#1a1a1a] flex-1">{col.label}</span>
                    <span className="text-[11px] font-semibold bg-[#f5f5f5] text-[#6b6b6b] rounded-md px-1.5 py-0.5">{col.cards.length}</span>
                    {colOver > 0 && (
                      <span className="text-[10px] font-bold bg-red-100 text-red-500 rounded-md px-1.5 py-0.5">{colOver}⚠</span>
                    )}
                  </div>

                  {colFlat.length === 0 ? (
                    <div className="border border-dashed border-[#e5e5e5] rounded-xl py-6 text-center text-[12px] text-[#c5c5c5]">
                      нет заказов
                    </div>
                  ) : colFlat.map(card => {
                    const dl = DEADLINE_BADGE[card.deadlineState];
                    const dc = DEADLINE_CARD[card.deadlineState];
                    const progress = Math.min(100, Math.round((card.daysInStage / 10) * 100));
                    return (
                      <div
                        key={card.id}
                        onClick={() => setDetail(card)}
                        className={`rounded-xl p-3 border cursor-pointer hover:shadow-md transition-all ${dc.border} ${dc.bg}`}
                      >
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
                        <p className="text-[12px] font-semibold text-[#1a1a1a] mb-0.5">{card.client}</p>
                        <p className="text-[11px] text-[#6b6b6b] mb-2">{card.stone} · {card.size}</p>
                        <div className="space-y-1 mb-2">
                          {card.machineId && (
                            <div className="flex items-center gap-1.5 text-[11px] text-[#6b6b6b]">
                              <Icon name="Settings" size={10} className="text-[#c0c0c0]" />
                              <span className="truncate">{machineName(card.machineId)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-[11px] text-[#6b6b6b]">
                            <Icon name="User" size={10} className="text-[#c0c0c0]" />
                            <span>{card.manager}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: dl.color || "#9b9b9b" }}>
                            <Icon name="Calendar" size={10} className="text-[#c0c0c0]" />
                            <span>до {card.deadline}</span>
                          </div>
                        </div>
                        <div className="h-1 rounded-full bg-[#f0f0f0] overflow-hidden">
                          <div className="h-full rounded-full" style={{
                            width: `${progress}%`,
                            backgroundColor: card.deadlineState === "overdue" ? "#ef4444" : card.deadlineState === "soon" ? "#f59e0b" : "#22c55e",
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════ Список ════════ */}
      {view === "list" && (
        <div className="flex-1 overflow-y-auto px-7 py-5">
          <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
            {listCards.length === 0 ? (
              <div className="px-5 py-8 text-center text-[13px] text-[#b5b5b5]">Нет заказов по фильтру</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f0f0f0]">
                    {["Заказ", "Клиент", "Этап", "Станок", "Ответственный", "Срок", "Статус"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listCards.map((card, i) => {
                    const st = STATUS[card.deadlineState];
                    return (
                      <tr
                        key={card.id}
                        onClick={() => setDetail(card)}
                        className={`cursor-pointer hover:bg-[#fafafa] transition-colors ${i < listCards.length - 1 ? "border-b border-[#f8f8f8]" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-[#1a1a1a]">{card.id}</span>
                            {card.urgent && <span className="text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-px rounded-full">⚡</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[13px] font-medium text-[#1a1a1a]">{card.client}</p>
                          <p className="text-[11px] text-[#9b9b9b]">{card.stone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                            style={{ color: card.colColor, backgroundColor: card.colColor + "18" }}>
                            {card.colLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[180px]">
                          <span className="text-[12px] text-[#6b6b6b] truncate block">{machineName(card.machineId)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[12px] text-[#4b4b4b] bg-[#f5f5f5] px-2 py-0.5 rounded-md">{card.manager}</span>
                        </td>
                        <td className="px-4 py-3 text-[12px]" style={{ color: st.color }}>до {card.deadline}</td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] font-semibold px-2 py-px rounded-full"
                            style={{ color: st.color, backgroundColor: st.bg }}>
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ════════ Детальная карточка ════════ */}
      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
          onClick={() => setDetail(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[#ebebeb] shadow-2xl w-full max-w-[460px]"
            onClick={e => e.stopPropagation()}
          >
            <div className={`px-6 py-4 border-b rounded-t-2xl flex items-start justify-between
              ${detail.deadlineState === "overdue" ? "bg-red-50 border-red-100" : detail.deadlineState === "soon" ? "bg-amber-50 border-amber-100" : "bg-white border-[#f0f0f0]"}`}>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[17px] font-bold text-[#1a1a1a]">{detail.id}</span>
                  {detail.urgent && <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-px rounded-full">⚡ СРОЧНО</span>}
                </div>
                <p className="text-[13px] text-[#6b6b6b]">{detail.stone} · {detail.size}</p>
              </div>
              <button onClick={() => setDetail(null)} className="text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors mt-0.5">
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-3">
              {[
                { icon: "User",      label: "Клиент",        value: detail.client },
                { icon: "Phone",     label: "Телефон",       value: detail.phone },
                { icon: "Layers",    label: "Этап",          value: detail.colLabel },
                { icon: "Settings",  label: "Станок",        value: machineName(detail.machineId) },
                { icon: "UserCheck", label: "Ответственный", value: detail.manager },
                { icon: "Calendar",  label: "Срок",          value: `до ${detail.deadline}` },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3">
                  <Icon name={row.icon as never} size={14} className="text-[#c0c0c0] shrink-0" />
                  <span className="text-[12px] text-[#9b9b9b] w-[110px] shrink-0">{row.label}</span>
                  <span className="text-[13px] font-medium text-[#1a1a1a]">{row.value}</span>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <Icon name="AlertCircle" size={14} className="text-[#c0c0c0] shrink-0" />
                <span className="text-[12px] text-[#9b9b9b] w-[110px] shrink-0">Статус</span>
                <span className="text-[11px] font-semibold px-2 py-px rounded-full"
                  style={{ color: STATUS[detail.deadlineState].color, backgroundColor: STATUS[detail.deadlineState].bg }}>
                  {STATUS[detail.deadlineState].label}
                </span>
              </div>
            </div>

            <div className="px-6 pb-5 flex gap-3">
              <button className="flex-1 py-2.5 border border-[#e0e0e0] rounded-[10px] text-[13px] font-medium text-[#4b4b4b] hover:bg-[#f5f5f5] transition-colors">
                Перейти в заказ
              </button>
              <button className="flex-1 py-2.5 bg-[#22c55e] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#16a34a] transition-colors">
                Отметить выполненным
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
