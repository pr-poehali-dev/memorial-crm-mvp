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

function machineName(machineId?: string) {
  if (!machineId) return "—";
  return MACHINE_PLACE[machineId] ?? MACHINES.find(m => m.id === machineId)?.name ?? "—";
}

const STATUS = {
  overdue: { label: "Просрочен", color: "#dc2626", bg: "#fef2f2", pill: "border-red-200"   },
  soon:    { label: "Скоро",     color: "#d97706", bg: "#fffbeb", pill: "border-amber-200" },
  ok:      { label: "В работе",  color: "#6b7280", bg: "#f9fafb", pill: "border-[#e8e8e8]" },
} as const;

/* ════════════════════════════════════════════════════════ */
export default function ProductionPage() {
  const [view,   setView]   = useState<"kanban" | "list">("kanban");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<FlatCard | null>(null);

  /* Все заказы плоским списком */
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
    const q = search.toLowerCase().trim();
    return !q
      || c.id.toLowerCase().includes(q)
      || c.client.toLowerCase().includes(q)
      || c.phone.includes(q);
  };

  const visibleIds   = useMemo(() =>
    new Set(allFlat.filter(c => applyFilter(c) && applySearch(c)).map(c => c.id)),
  [allFlat, filter, search]);

  const totalInWork  = allFlat.filter(c => c.colId !== "ready").length;
  const totalOverdue = allFlat.filter(c => c.deadlineState === "overdue").length;
  const totalUrgent  = allFlat.filter(c => !!c.urgent).length;

  /* Список: сортировка overdue → soon → ok */
  const listCards = allFlat
    .filter(c => visibleIds.has(c.id))
    .sort((a, b) => {
      const ord = { overdue: 0, soon: 1, ok: 2 } as const;
      return ord[a.deadlineState] - ord[b.deadlineState];
    });

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#fafafa]">

      {/* ══════════ ШАПКА ══════════ */}
      <div className="shrink-0 border-b border-[#ebebeb] bg-[#fafafa] px-7 py-4 space-y-3">

        {/* Строка 1 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <h1 className="text-[20px] font-semibold text-[#1a1a1a] tracking-tight">Производство</h1>

            {/* Компактные метрики */}
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

          {/* Переключатель вида */}
          <div className="flex gap-0.5 bg-[#f0f0f0] rounded-[8px] p-0.5">
            {(["kanban", "list"] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
                  ${view === v ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
              >
                <Icon name={v === "kanban" ? "LayoutGrid" : "List"} size={13} />
                {v === "kanban" ? "Канбан" : "Список"}
              </button>
            ))}
          </div>
        </div>

        {/* Строка 2: фильтры + поиск */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-white border border-[#ebebeb] rounded-[8px] p-1 shrink-0">
            {FILTERS.map(f => {
              const cnt = f.key === "overdue" ? totalOverdue : f.key === "urgent" ? totalUrgent : null;
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
                    ${active ? "bg-[#1a1a1a] text-white" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
                >
                  {f.label}
                  {cnt !== null && cnt > 0 && (
                    <span className={`text-[10px] rounded-full px-1.5 py-px font-bold leading-none
                      ${active ? "bg-white/20 text-white" : f.key === "overdue" ? "bg-red-100 text-red-500" : "bg-amber-100 text-amber-600"}`}>
                      {cnt}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 max-w-[340px]">
            <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c0c0c0]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск: номер, клиент или телефон"
              className="w-full bg-white border border-[#e0e0e0] rounded-[8px] pl-8 pr-8 py-2 text-[13px] outline-none focus:border-[#b0b0b0] transition-colors placeholder:text-[#c5c5c5]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c0c0c0] hover:text-[#555]"
              >
                <Icon name="X" size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══════════ КАНБАН ══════════ */}
      {view === "kanban" && (
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <div className="flex gap-3 px-7 py-5 items-start min-h-full">
            {COLUMNS.map(col => {
              const cards = col.cards
                .filter(c => visibleIds.has(c.id))
                .map(c => ({ ...c, colId: col.id, colLabel: col.label, colColor: col.color }));
              const overdueCnt = col.cards.filter(c => c.deadlineState === "overdue").length;

              return (
                <div key={col.id} className="w-[248px] shrink-0 flex flex-col gap-2">

                  {/* Заголовок колонки */}
                  <div className="flex items-center gap-2 bg-white border border-[#ebebeb] rounded-xl px-3 py-2.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                    <span className="text-[13px] font-semibold text-[#1a1a1a] flex-1 leading-none">{col.label}</span>
                    <span className="text-[11px] font-semibold bg-[#f4f4f4] text-[#6b6b6b] rounded-md px-1.5 py-0.5">
                      {col.cards.length}
                    </span>
                    {overdueCnt > 0 && (
                      <span className="text-[10px] font-bold bg-red-100 text-red-500 rounded-md px-1.5 py-0.5">
                        {overdueCnt}⚠
                      </span>
                    )}
                  </div>

                  {/* Карточки */}
                  {cards.length === 0 ? (
                    <div className="border border-dashed border-[#e8e8e8] rounded-xl py-7 text-center text-[12px] text-[#c8c8c8]">
                      нет заказов
                    </div>
                  ) : cards.map(card => {
                    const dl  = DEADLINE_BADGE[card.deadlineState];
                    const dc  = DEADLINE_CARD[card.deadlineState];
                    const pct = Math.min(100, Math.round((card.daysInStage / 10) * 100));
                    return (
                      <div
                        key={card.id}
                        onClick={() => setDetail(card)}
                        className={`rounded-xl p-3.5 border cursor-pointer hover:shadow-md transition-all group ${dc.border} ${dc.bg}`}
                      >
                        {/* Номер + теги */}
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-[12px] font-bold text-[#1a1a1a]">{card.id}</span>
                          {card.urgent && (
                            <span className="text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-px rounded-full shrink-0">
                              ⚡ СРОЧНО
                            </span>
                          )}
                          {dl.label && (
                            <span className="ml-auto text-[9px] font-semibold px-1.5 py-px rounded-full shrink-0"
                              style={{ color: dl.color, backgroundColor: dl.bg }}>
                              {dl.label}
                            </span>
                          )}
                        </div>

                        {/* Клиент + изделие */}
                        <p className="text-[12px] font-semibold text-[#1a1a1a] mb-0.5 truncate">{card.client}</p>
                        <p className="text-[11px] text-[#6b6b6b] mb-2.5 truncate">{card.product} · {card.stone}</p>

                        {/* Детали */}
                        <div className="space-y-1 mb-2.5">
                          {card.machineId && (
                            <Row icon="Settings" text={machineName(card.machineId)} />
                          )}
                          <Row icon="User" text={card.manager} />
                          <Row
                            icon="Calendar"
                            text={`до ${card.deadline}`}
                            color={dl.color || undefined}
                          />
                        </div>

                        {/* Прогресс */}
                        <div className="h-1 rounded-full bg-[#eaeaea] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              backgroundColor:
                                card.deadlineState === "overdue" ? "#ef4444"
                                : card.deadlineState === "soon"  ? "#f59e0b"
                                : "#22c55e",
                            }}
                          />
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

      {/* ══════════ СПИСОК ══════════ */}
      {view === "list" && (
        <div className="flex-1 overflow-y-auto px-7 py-5">
          <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
            {listCards.length === 0 ? (
              <div className="py-12 text-center text-[13px] text-[#b5b5b5]">Нет заказов по фильтру</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f2f2f2]">
                    {["Заказ", "Клиент", "Изделие", "Этап", "Станок", "Ответственный", "Срок", "Статус"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#c0c0c0] uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
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
                        className={`cursor-pointer hover:bg-[#fafafa] transition-colors ${i < listCards.length - 1 ? "border-b border-[#f5f5f5]" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-bold text-[#1a1a1a]">{card.id}</span>
                            {card.urgent && (
                              <span className="text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-px rounded-full">⚡</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-[13px] font-medium text-[#1a1a1a]">{card.client}</p>
                          <p className="text-[11px] text-[#9b9b9b]">{card.phone}</p>
                        </td>
                        <td className="px-4 py-3 max-w-[140px]">
                          <p className="text-[12px] text-[#4b4b4b] truncate">{card.product}</p>
                          <p className="text-[11px] text-[#c0c0c0] font-mono">{card.stone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                            style={{ color: card.colColor, backgroundColor: card.colColor + "18" }}
                          >
                            {card.colLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[160px]">
                          <span className="text-[12px] text-[#6b6b6b] truncate block">{machineName(card.machineId)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[12px] text-[#4b4b4b] bg-[#f5f5f5] px-2 py-0.5 rounded-md">
                            {card.manager}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[12px] font-medium" style={{ color: st.color }}>
                          до {card.deadline}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-[11px] font-semibold px-2 py-px rounded-full"
                            style={{ color: st.color, backgroundColor: st.bg }}
                          >
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

      {/* ══════════ ДЕТАЛЬНАЯ КАРТОЧКА ══════════ */}
      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/25 backdrop-blur-sm"
          onClick={() => setDetail(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[#e8e8e8] shadow-2xl w-full max-w-[480px] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Шапка модалки */}
            <div className={`px-6 py-5 border-b flex items-start justify-between
              ${detail.deadlineState === "overdue"
                ? "bg-red-50 border-red-100"
                : detail.deadlineState === "soon"
                ? "bg-amber-50 border-amber-100"
                : "bg-white border-[#f0f0f0]"}`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[18px] font-bold text-[#1a1a1a]">{detail.id}</span>
                  {detail.urgent && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-px rounded-full">
                      ⚡ СРОЧНО
                    </span>
                  )}
                  <span
                    className="text-[11px] font-semibold px-2 py-px rounded-full ml-1"
                    style={{ color: STATUS[detail.deadlineState].color, backgroundColor: STATUS[detail.deadlineState].bg }}
                  >
                    {STATUS[detail.deadlineState].label}
                  </span>
                </div>
                <p className="text-[13px] text-[#6b6b6b]">{detail.product} · {detail.stone} · {detail.size}</p>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="text-[#c0c0c0] hover:text-[#1a1a1a] transition-colors mt-0.5"
              >
                <Icon name="X" size={18} />
              </button>
            </div>

            {/* Тело */}
            <div className="px-6 py-5 space-y-2.5">
              {[
                { icon: "User",        label: "Клиент",        value: detail.client },
                { icon: "Phone",       label: "Телефон",       value: detail.phone },
                { icon: "Box",         label: "Изделие",       value: `${detail.product} · ${detail.stone} (${detail.size})` },
                { icon: "Layers",      label: "Этап",          value: detail.colLabel },
                { icon: "Settings",    label: "Станок",        value: machineName(detail.machineId) },
                { icon: "UserCheck",   label: "Ответственный", value: detail.manager },
                { icon: "Calendar",    label: "Срок",          value: `до ${detail.deadline}` },
                ...(detail.payment ? [{ icon: "CreditCard", label: "Оплата", value: detail.payment }] : []),
              ].map(row => (
                <div key={row.label} className="flex items-start gap-3">
                  <Icon name={row.icon as never} size={14} className="text-[#d0d0d0] shrink-0 mt-0.5" />
                  <span className="text-[12px] text-[#9b9b9b] w-[108px] shrink-0 leading-[1.4]">{row.label}</span>
                  <span className="text-[13px] font-medium text-[#1a1a1a] leading-[1.4]">{row.value}</span>
                </div>
              ))}

              {/* Проблема — выделяем отдельно */}
              {detail.problem && (
                <div className="mt-1 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <Icon name="AlertTriangle" size={14} className="text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-red-400 uppercase tracking-wide mb-0.5">Проблема</p>
                    <p className="text-[13px] text-red-700">{detail.problem}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Кнопки */}
            <div className="px-6 pb-5 flex gap-3">
              <button className="flex-1 py-2.5 border border-[#e0e0e0] rounded-[10px] text-[13px] font-medium text-[#4b4b4b] hover:bg-[#f5f5f5] transition-colors">
                Перейти в заказ
              </button>
              <button className="flex-1 py-2.5 bg-[#1a1a1a] text-white rounded-[10px] text-[13px] font-semibold hover:bg-[#333] transition-colors">
                Отметить выполненным
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Вспомогательные компоненты ─── */
function Row({ icon, text, color }: { icon: string; text: string; color?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon name={icon as never} size={10} className="text-[#d0d0d0] shrink-0" />
      <span className="text-[11px] truncate" style={{ color: color ?? "#6b6b6b" }}>{text}</span>
    </div>
  );
}

function Chip({
  label, color = "#4b4b4b", bg = "#f4f4f4", border = "border-[#e8e8e8]",
}: {
  label: string; color?: string; bg?: string; border?: string;
}) {
  return (
    <span
      className={`text-[12px] font-semibold px-2.5 py-1 rounded-full border ${border}`}
      style={{ color, backgroundColor: bg }}
    >
      {label}
    </span>
  );
}
