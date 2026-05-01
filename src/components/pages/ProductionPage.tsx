import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import {
  COLUMNS, FILTERS, DEADLINE_CARD, DEADLINE_BADGE,
  MACHINES, MACHINE_PLACE, COL_NEXT, COL_NEXT_LABEL,
  FilterKey, FlatItem, Column, OrderItem, ITEM_STATUS_LABEL,
  flattenItems, ItemStatus,
} from "./production/production.types";

/* ══════════════════════════════════════════════════════════
   КАНБАН ПО ИЗДЕЛИЯМ
══════════════════════════════════════════════════════════ */

export default function ProductionPage() {
  const [columns, setColumns] = useState<Column[]>(COLUMNS);
  const [filter,  setFilter]  = useState<FilterKey>("all");
  const [search,  setSearch]  = useState("");
  const [detail,  setDetail]  = useState<FlatItem | null>(null);

  /* Все изделия плоским списком */
  const allItems = useMemo(() => flattenItems(columns), [columns]);

  const applyFilter = (c: FlatItem) => {
    if (filter === "mine")    return c.manager === "Олег К.";
    if (filter === "overdue") return c.deadlineState === "overdue";
    if (filter === "urgent")  return !!c.urgent;
    return true;
  };

  const applySearch = (c: FlatItem) => {
    const q = search.toLowerCase().trim();
    return !q || c.orderId.toLowerCase().includes(q) || c.client.toLowerCase().includes(q);
  };

  const visibleKeys = useMemo(() =>
    new Set(allItems.filter(c => applyFilter(c) && applySearch(c)).map(c => c.itemId)),
  [allItems, filter, search]);

  const totalInWork  = allItems.filter(c => c.colId !== "ready").length;
  const totalOverdue = allItems.filter(c => c.deadlineState === "overdue").length;
  const totalUrgent  = allItems.filter(c => !!c.urgent).length;

  /* Перевести изделие на следующий этап */
  const moveToNext = (item: FlatItem) => {
    const nextCol = COL_NEXT[item.colId];
    if (!nextCol) return;
    setColumns(prev => prev.map(col => ({
      ...col,
      cards: col.cards.map(card => ({
        ...card,
        items: card.items.map(it =>
          it.id === item.itemId
            ? { ...it, colId: nextCol, status: nextCol === "ready" ? "done" : "in_progress" as ItemStatus, progress: nextCol === "ready" ? 100 : it.progress }
            : it
        ),
      })),
    })));
    setDetail(null);
  };

  /* Обновить деталь после изменения */
  const refreshDetail = (itemId: string) => {
    const updated = flattenItems(columns).find(i => i.itemId === itemId);
    if (updated) setDetail(updated);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f7f7f8]">

      {/* ══════════ ШАПКА ══════════ */}
      <div className="shrink-0 border-b border-[#e8e8e8] bg-white px-7 py-4 space-y-3">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
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
        </div>

        {/* Фильтры + поиск */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-[#f4f4f4] rounded-[10px] p-1 shrink-0">
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
              className="w-full bg-white border border-[#e8e8e8] rounded-[9px] pl-8 pr-8 py-2 text-[13px] outline-none focus:border-[#b0b0b0] transition-colors placeholder:text-[#c5c5c5]"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c0c0c0] hover:text-[#555]">
                <Icon name="X" size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ══════════ КАНБАН ══════════ */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="flex gap-4 px-7 py-5 items-start min-h-full min-w-max">
          {columns.map(col => {
            const items = flattenItems([col]).filter(i => visibleKeys.has(i.itemId));
            const overdueCnt = flattenItems([col]).filter(i => i.deadlineState === "overdue").length;

            return (
              <div key={col.id} className="w-[280px] shrink-0 flex flex-col gap-3">

                {/* Заголовок колонки */}
                <div
                  className="flex items-center gap-2.5 rounded-[12px] px-4 py-3"
                  style={{ backgroundColor: col.color + "12", border: `1.5px solid ${col.color}28` }}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: col.color }} />
                  <span className="text-[14px] font-bold text-[#1a1a1a] flex-1 leading-none">{col.label}</span>
                  <span
                    className="text-[12px] font-bold rounded-lg px-2 py-0.5"
                    style={{ backgroundColor: col.color + "20", color: col.color }}
                  >
                    {flattenItems([col]).length}
                  </span>
                  {overdueCnt > 0 && (
                    <span className="text-[10px] font-bold bg-red-100 text-red-500 rounded-md px-1.5 py-0.5">
                      {overdueCnt}⚠
                    </span>
                  )}
                </div>

                {/* Карточки изделий */}
                {items.length === 0 ? (
                  <div className="border-2 border-dashed border-[#e4e4e4] rounded-[14px] py-10 text-center text-[13px] text-[#c8c8c8]">
                    нет изделий
                  </div>
                ) : items.map(item => (
                  <ItemCard
                    key={item.itemId}
                    item={item}
                    onClick={() => setDetail(item)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════ ДЕТАЛЬНОЕ ОКНО ══════════ */}
      {detail && (
        <DetailDrawer
          item={detail}
          allItems={detail.allItems}
          onClose={() => setDetail(null)}
          onMoveNext={() => moveToNext(detail)}
        />
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   КАРТОЧКА ИЗДЕЛИЯ
══════════════════════════════════════════════════════════ */
function ItemCard({ item, onClick }: { item: FlatItem; onClick: () => void }) {
  const dc  = DEADLINE_CARD[item.deadlineState];
  const dl  = DEADLINE_BADGE[item.deadlineState];
  const st  = ITEM_STATUS_LABEL[item.itemStatus];
  const machine = item.machineId ? MACHINE_PLACE[item.machineId] : null;

  const doneCount    = item.allItems.filter(i => i.status === "done").length;
  const totalCount   = item.allItems.length;
  const isMulti      = totalCount > 1;

  return (
    <div
      onClick={onClick}
      className={`rounded-[14px] border-[1.5px] ${dc.border} ${dc.bg} p-4 cursor-pointer
        hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 select-none`}
    >
      {/* Заголовок */}
      <div className="flex items-start justify-between gap-2 mb-1">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[16px] font-black text-[#1a1a1a] tracking-tight">{item.orderId}</span>
            <span
              className="text-[13px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-lg"
              style={{ backgroundColor: item.colColor + "18", color: item.colColor }}
            >
              {item.itemType}
            </span>
          </div>
          <p className="text-[12px] text-[#8a8a8a] mt-0.5">{item.client}</p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {item.urgent && (
            <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase">срочно</span>
          )}
          {item.problem && (
            <Icon name="AlertTriangle" size={14} className="text-red-400" />
          )}
        </div>
      </div>

      {/* Прогресс */}
      <div className="mt-3 mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-[#a0a0a0] font-medium uppercase tracking-wide">Прогресс</span>
          <span className="text-[11px] font-bold" style={{ color: item.colColor }}>{item.itemProgress}%</span>
        </div>
        <div className="h-1.5 bg-[#ebebeb] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${item.itemProgress}%`, backgroundColor: item.colColor }}
          />
        </div>
      </div>

      {/* Инфо */}
      <div className="space-y-1.5">
        {machine && (
          <div className="flex items-center gap-2 text-[12px] text-[#5a5a5a]">
            <Icon name="MapPin" size={11} className="text-[#b0b0b0] shrink-0" />
            <span>{machine}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-[12px] text-[#5a5a5a]">
          <Icon name="User" size={11} className="text-[#b0b0b0] shrink-0" />
          <span>{item.manager}</span>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="Calendar" size={11} className="text-[#b0b0b0] shrink-0" />
          {dl.label ? (
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: dl.bg, color: dl.color }}>
              {item.deadline} — {dl.label}
            </span>
          ) : (
            <span className="text-[12px] text-[#5a5a5a]">{item.deadline}</span>
          )}
        </div>
      </div>

      {/* Счётчик изделий в заказе */}
      {isMulti && (
        <div className="mt-3 pt-3 border-t border-[#ebebeb] flex items-center justify-between">
          <span className="text-[11px] text-[#a0a0a0]">
            {doneCount} из {totalCount} изделий готово
          </span>
          <div className="flex gap-1">
            {item.allItems.map(i => (
              <span
                key={i.id}
                className={`w-2 h-2 rounded-full ${
                  i.status === "done"        ? "bg-green-400"
                  : i.status === "in_progress" ? "bg-amber-400"
                  : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ДЕТАЛЬНАЯ ПАНЕЛЬ
══════════════════════════════════════════════════════════ */
function DetailDrawer({
  item, allItems, onClose, onMoveNext,
}: {
  item: FlatItem;
  allItems: OrderItem[];
  onClose: () => void;
  onMoveNext: () => void;
}) {
  const nextLabel = COL_NEXT_LABEL[item.colId];
  const st = ITEM_STATUS_LABEL[item.itemStatus];
  const machine = item.machineId ? MACHINE_PLACE[item.machineId] : null;

  const doneCount  = allItems.filter(i => i.status === "done").length;
  const totalCount = allItems.length;

  return (
    <>
      {/* Оверлей */}
      <div
        className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-40"
        onClick={onClose}
      />

      {/* Панель */}
      <div className="fixed right-0 top-0 bottom-0 w-[420px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden">

        {/* Шапка */}
        <div className="shrink-0 px-6 py-5 border-b border-[#f0f0f0]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[22px] font-black text-[#1a1a1a]">{item.orderId}</span>
                <span
                  className="text-[14px] font-black uppercase tracking-wide px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: item.colColor + "18", color: item.colColor }}
                >
                  {item.itemType}
                </span>
              </div>
              <p className="text-[14px] text-[#6b6b6b] mt-1">{item.client}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9b9b9b] hover:bg-[#f4f4f4] hover:text-[#1a1a1a] transition-colors shrink-0"
            >
              <Icon name="X" size={16} />
            </button>
          </div>

          {/* Статусы */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-[12px] font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: st.bg, color: st.color }}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${st.dot} mr-1.5`} />
              {st.label}
            </span>
            <span
              className="text-[12px] font-semibold px-2.5 py-1 rounded-lg"
              style={{ backgroundColor: item.colColor + "18", color: item.colColor }}
            >
              {item.colLabel}
            </span>
            {item.urgent && (
              <span className="text-[11px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full uppercase">
                срочно
              </span>
            )}
            {DEADLINE_BADGE[item.deadlineState].label && (
              <span
                className="text-[12px] font-semibold px-2.5 py-1 rounded-lg"
                style={{ backgroundColor: DEADLINE_BADGE[item.deadlineState].bg, color: DEADLINE_BADGE[item.deadlineState].color }}
              >
                {DEADLINE_BADGE[item.deadlineState].label}
              </span>
            )}
          </div>
        </div>

        {/* Контент */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Прогресс */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold text-[#6b6b6b] uppercase tracking-wide">Прогресс изделия</span>
              <span className="text-[14px] font-black" style={{ color: item.colColor }}>{item.itemProgress}%</span>
            </div>
            <div className="h-2.5 bg-[#f0f0f0] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${item.itemProgress}%`, backgroundColor: item.colColor }}
              />
            </div>
          </div>

          {/* Детали */}
          <div className="bg-[#f9f9f9] rounded-[14px] p-4 space-y-3">
            <p className="text-[11px] font-bold text-[#b0b0b0] uppercase tracking-widest">Детали</p>
            <InfoRow icon="Layers" label="Материал" value={`${item.stone} · ${item.size}`} />
            {machine && <InfoRow icon="MapPin" label="Место" value={machine} />}
            <InfoRow icon="User"     label="Ответственный" value={item.manager} />
            <InfoRow icon="Calendar" label="Срок"          value={item.deadline} highlight={item.deadlineState !== "ok"} />
            {item.payment && <InfoRow icon="CreditCard" label="Оплата" value={item.payment} />}
          </div>

          {/* Проблема */}
          {item.problem && (
            <div className="bg-red-50 border border-red-100 rounded-[14px] p-4 flex gap-3">
              <Icon name="AlertTriangle" size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-semibold text-red-600 mb-1">Проблема</p>
                <p className="text-[13px] text-red-800">{item.problem}</p>
              </div>
            </div>
          )}

          {/* Другие изделия заказа */}
          {totalCount > 1 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-bold text-[#6b6b6b] uppercase tracking-widest">
                  Другие изделия заказа
                </p>
                <span className="text-[11px] text-[#9b9b9b]">
                  {doneCount} / {totalCount} готово
                </span>
              </div>
              <div className="space-y-2">
                {allItems.map(it => {
                  const s = ITEM_STATUS_LABEL[it.status];
                  const isCurrent = it.id === item.itemId;
                  return (
                    <div
                      key={it.id}
                      className={`flex items-center gap-3 rounded-[12px] px-4 py-3 border transition-colors
                        ${isCurrent ? "border-[#1a1a1a] bg-[#f9f9f9]" : "border-[#f0f0f0] bg-white"}`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
                      <div className="flex-1 min-w-0">
                        <span className={`text-[13px] font-semibold ${isCurrent ? "text-[#1a1a1a]" : "text-[#4a4a4a]"}`}>
                          {it.type}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] text-[#9b9b9b] ml-2">← текущее</span>
                        )}
                      </div>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-lg shrink-0"
                        style={{ backgroundColor: s.bg, color: s.color }}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Прогресс заказа целиком */}
              <div className="mt-3 p-3 bg-[#f4f4f4] rounded-[10px]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-[#8a8a8a]">Заказ в целом</span>
                  <span className="text-[11px] font-bold text-[#1a1a1a]">
                    {Math.round((doneCount / totalCount) * 100)}%
                  </span>
                </div>
                <div className="h-1.5 bg-[#e0e0e0] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#1a1a1a] transition-all"
                    style={{ width: `${(doneCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div className="shrink-0 px-6 py-4 border-t border-[#f0f0f0] space-y-2">
          {nextLabel && (
            <button
              onClick={onMoveNext}
              className="w-full flex items-center justify-center gap-2 rounded-[12px] py-3 text-[14px] font-bold text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: item.colColor }}
            >
              <Icon name="ArrowRight" size={15} />
              Следующий этап: {nextLabel}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-[#f4f4f4] hover:bg-[#ebebeb] rounded-[12px] py-3 text-[14px] font-semibold text-[#4b4b4b] transition-colors"
          >
            <Icon name="FileText" size={14} />
            Открыть заказ
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Вспомогалки ─── */
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

function InfoRow({ icon, label, value, highlight = false }: {
  icon: string; label: string; value: string; highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon name={icon as never} size={13} className="text-[#c0c0c0] shrink-0" />
      <span className="text-[12px] text-[#8a8a8a] w-[100px] shrink-0">{label}</span>
      <span className={`text-[13px] font-semibold ${highlight ? "text-amber-600" : "text-[#1a1a1a]"}`}>
        {value}
      </span>
    </div>
  );
}
