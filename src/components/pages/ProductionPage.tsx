import { useState, useMemo, useEffect, useCallback } from "react";
import LoadingScreen from "@/components/ui/LoadingScreen";
import Icon from "@/components/ui/icon";
import {
  COL_CONFIG, COL_NEXT_STATUS,
  FilterKey, FlatItem, Column, Card,
} from "./production/production.types";
import { ordersApi, cuttingApi, DbProductionOrder, DbShift } from "@/api/client";
import {
  Shift, WorkType,
  today, yesterday,
  shiftTotalProduced, shiftTotalRaw,
} from "./cutting/cutting.types";
import ProductionKanban       from "./production/ProductionKanban";
import ProductionList         from "./production/ProductionList";
import ProductionDetailDrawer from "./production/ProductionDetailDrawer";
import ProcessTab             from "./production/ProcessTab";

type MainTab  = "orders" | "tasks" | "process";
type ViewMode = "kanban" | "list";

/* ─── Конвертеры ─── */
function dbToCard(o: DbProductionOrder): Card {
  return {
    id:            o.id,
    client:        o.client_name,
    stone:         o.stone  || "",
    size:          o.size   || "",
    status:        o.status,
    deadline:      o.deadline ? new Date(o.deadline).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }) : "",
    deadlineState: o.deadline_state,
    manager:       o.manager || "",
    phone:         o.phone   || "",
    payment:       o.payment_label,
    comment:       o.comment || undefined,
  };
}

function buildColumns(orders: DbProductionOrder[]): Column[] {
  return COL_CONFIG.map(cfg => ({
    id:    cfg.id,
    label: cfg.label,
    color: cfg.color,
    cards: orders.filter(o => cfg.statuses.includes(o.status)).map(dbToCard),
  }));
}

function flattenColumns(columns: Column[]): FlatItem[] {
  return columns.flatMap(col =>
    col.cards.map(card => ({
      itemId: card.id, orderId: card.id, colId: col.id,
      colLabel: col.label, colColor: col.color,
      client: card.client, stone: card.stone, size: card.size,
      deadline: card.deadline, deadlineState: card.deadlineState,
      manager: card.manager, urgent: card.urgent, phone: card.phone,
      payment: card.payment, problem: card.comment, allItems: [],
    }))
  );
}

function dbToShift(s: DbShift): Shift {
  return {
    id: String(s.id), placeId: String(s.place_id), placeName: s.place_name,
    employeeId: String(s.employee_id), employeeName: s.employee_name,
    workType: s.work_type as WorkType,
    date: s.shift_date?.substring(0, 10) || today,
    status: s.status as "active" | "done",
    startedAt: s.started_at?.substring(0, 5) || "08:00",
    finishedAt: s.finished_at?.substring(0, 5),
    taskId: s.task_id ? String(s.task_id) : undefined,
    taskQtyAssigned: s.task_qty_assigned || undefined,
    results: (s.results || []).map(r => ({
      blankTypeId: String(r.blank_type_id ?? ""),
      blankName: r.blank_name,
      material: r.material,
      produced: r.produced,
      rawAuto: true,
      rawUsed: Number(r.raw_used),
      orderId: r.order_ref || undefined,
    })),
  };
}

/* ════════════════════════════════════════
   Главный компонент
════════════════════════════════════════ */
export default function ProductionPage() {
  const [mainTab, setMainTab] = useState<MainTab>("orders");

  /* Данные */
  const [orders,   setOrders]   = useState<DbProductionOrder[]>([]);
  const [shifts,   setShifts]   = useState<Shift[]>([]);
  const [loading,  setLoading]  = useState(true);

  /* Вкладка «Заказы» */
  const [filter,    setFilter]    = useState<FilterKey>("all");
  const [search,    setSearch]    = useState("");
  const [detail,    setDetail]    = useState<FlatItem | null>(null);
  const [view,      setView]      = useState<ViewMode>("kanban");
  const [listStage, setListStage] = useState<string | undefined>(undefined);

  const reload = useCallback(() => {
    return Promise.all([
      ordersApi.production(),
      cuttingApi.shifts(),
    ]).then(([ords, shiftData]) => {
      setOrders(ords);
      setShifts(shiftData.map(dbToShift));
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  useEffect(() => { reload(); }, [reload]);

  /* Производные для «Заказы» */
  const columns  = useMemo(() => buildColumns(orders), [orders]);
  const allItems = useMemo(() => flattenColumns(columns), [columns]);

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

  const visibleKeys  = useMemo(() =>
    new Set(allItems.filter(c => applyFilter(c) && applySearch(c)).map(c => c.itemId)),
  [allItems, filter, search]);

  const totalInWork  = allItems.filter(c => c.colId !== "ready" && c.colId !== "delivery").length;
  const totalOverdue = allItems.filter(c => c.deadlineState === "overdue").length;
  const totalUrgent  = allItems.filter(c => !!c.urgent).length;

  const moveToNext = (item: FlatItem) => {
    const nextStatus = COL_NEXT_STATUS[item.colId];
    if (!nextStatus) return;
    ordersApi.update(item.orderId, { status: nextStatus }).then(() => reload()).catch(console.error);
    setDetail(null);
  };

  /* Счётчики для баджей вкладок */
  const activeShifts = shifts.filter(s => s.status === "active" && s.date === today).length;
  const taskOrders   = allItems.filter(c => c.colId !== "ready" && c.colId !== "delivery").length;

  if (loading) return <LoadingScreen text="Загружаем производство" />;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f7f7f8]">

      {/* ── Шапка с тремя главными вкладками ── */}
      <div className="shrink-0 bg-white border-b border-[#e8e8e8]">
        <div className="flex items-center justify-between px-7 pt-5 pb-0">
          <h1 className="text-[32px] font-bold text-[#1a1a1a] tracking-tight">Изготовление</h1>

          {/* Мини-сводка */}
          <div className="flex items-center gap-3 mb-1">
            {totalOverdue > 0 && (
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                <Icon name="AlertTriangle" size={13} />
                {totalOverdue} просрочено
              </span>
            )}
            {activeShifts > 0 && (
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {activeShifts} в работе
              </span>
            )}
          </div>
        </div>

        {/* Вкладки */}
        <div className="flex gap-0 px-7">
          {([
            { key: "orders",  label: "Заказы",  badge: taskOrders  > 0 ? taskOrders  : undefined },
            { key: "tasks",   label: "Задачи",  badge: undefined },
            { key: "process", label: "Процесс", badge: activeShifts > 0 ? activeShifts : undefined },
          ] as { key: MainTab; label: string; badge?: number }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setMainTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-[14px] font-medium border-b-2 transition-all ${
                mainTab === t.key
                  ? "border-[#1a1a1a] text-[#1a1a1a]"
                  : "border-transparent text-[#9b9b9b] hover:text-[#4b4b4b]"
              }`}
            >
              {t.label}
              {t.badge !== undefined && (
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                  mainTab === t.key
                    ? "bg-[#1a1a1a] text-white"
                    : t.key === "process"
                    ? "bg-green-100 text-green-700"
                    : "bg-[#f0f0f0] text-[#6b6b6b]"
                }`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── ВКЛАДКА: ЗАКАЗЫ ── */}
      {mainTab === "orders" && (
        <>
          {/* Фильтры заказов */}
          <div className="shrink-0 bg-white border-b border-[#f0f0f0] flex items-center gap-3 px-7 py-2.5">
            <div className="flex gap-0.5 bg-[#f4f4f4] rounded-[9px] p-0.5 shrink-0">
              {(["kanban", "list"] as ViewMode[]).map(v => (
                <button key={v} onClick={() => { if (v === "kanban") setListStage(undefined); setView(v); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[12px] font-medium transition-all ${
                    view === v ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"
                  }`}>
                  <Icon name={v === "kanban" ? "LayoutGrid" : "List"} size={13} />
                  {v === "kanban" ? "Канбан" : "Список"}
                </button>
              ))}
            </div>
            <div className="w-px h-5 bg-[#e8e8e8]" />
            <div className="flex gap-1 bg-[#f4f4f4] rounded-[9px] p-0.5 shrink-0">
              {[
                { key: "all", label: "Все" }, { key: "mine", label: "Мои" },
                { key: "overdue", label: "Просрочены" }, { key: "urgent", label: "Срочные" },
              ].map(f => {
                const cnt = f.key === "overdue" ? totalOverdue : f.key === "urgent" ? totalUrgent : null;
                return (
                  <button key={f.key} onClick={() => setFilter(f.key as FilterKey)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] text-[12px] font-medium transition-all ${
                      filter === f.key ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"
                    }`}>
                    {f.label}
                    {cnt !== null && cnt > 0 && (
                      <span className={`text-[10px] rounded-full px-1.5 py-px font-bold leading-none ${
                        filter === f.key ? "bg-[#1a1a1a] text-white"
                          : f.key === "overdue" ? "bg-red-100 text-red-500"
                          : "bg-amber-100 text-amber-600"
                      }`}>{cnt}</span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="relative max-w-[260px] flex-1">
              <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c0c0c0]" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Поиск по заказу или клиенту..."
                className="w-full bg-white border border-[#e8e8e8] rounded-[9px] pl-8 pr-8 py-1.5 text-[12px] outline-none focus:border-[#b0b0b0] transition-colors placeholder:text-[#c5c5c5]"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c0c0c0] hover:text-[#555]">
                  <Icon name="X" size={12} />
                </button>
              )}
            </div>
          </div>

          {view === "kanban" ? (
            <ProductionKanban
              columns={columns}
              visibleKeys={visibleKeys}
              onItemClick={setDetail}
              onSwitchToList={(colId) => { setListStage(colId); setView("list"); }}
            />
          ) : (
            <ProductionList allItems={allItems} initialStage={listStage} onItemClick={setDetail} />
          )}

          {detail && (
            <ProductionDetailDrawer
              item={detail}
              allItems={detail.allItems}
              onClose={() => setDetail(null)}
              onMoveNext={() => moveToNext(detail)}
            />
          )}
        </>
      )}

      {/* ── ВКЛАДКА: ЗАДАЧИ ── */}
      {mainTab === "tasks" && (
        <div className="flex-1 overflow-y-auto px-7 py-5">
          <div className="space-y-4">
            {COL_CONFIG.filter(c => c.id !== "ready" && c.id !== "delivery").map(cfg => {
              const colItems = allItems.filter(c => c.colId === cfg.id);
              return (
                <div key={cfg.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                    <h3 className="text-[14px] font-bold text-[#1a1a1a]">{cfg.label}</h3>
                    <span className="text-[12px] text-[#9b9b9b] bg-[#f0f0f0] px-2 py-0.5 rounded-full">{colItems.length}</span>
                  </div>
                  {colItems.length === 0 ? (
                    <div className="bg-white border border-[#ebebeb] rounded-xl px-5 py-4 text-[13px] text-[#c0c0c0]">
                      Нет задач в этом статусе
                    </div>
                  ) : (
                    <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
                      {colItems.map((item, i) => (
                        <button key={item.itemId}
                          onClick={() => setDetail(item)}
                          className={`w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-[#fafafa] transition-colors ${
                            i < colItems.length - 1 ? "border-b border-[#f5f5f5]" : ""
                          } ${item.deadlineState === "overdue" ? "bg-red-50/30" : ""}`}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[12px] font-bold text-[#6366f1] font-mono">{item.orderId}</span>
                              {item.deadlineState === "overdue" && (
                                <span className="text-[10px] font-semibold text-red-500 bg-red-100 px-1.5 py-0.5 rounded">просрочен</span>
                              )}
                            </div>
                            <p className="text-[14px] font-semibold text-[#1a1a1a] mt-0.5">{item.client}</p>
                            {(item.stone || item.size) && (
                              <p className="text-[12px] text-[#9b9b9b] mt-0.5">
                                {item.stone}{item.stone && item.size ? " · " : ""}{item.size}
                              </p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            {item.deadline && (
                              <p className={`text-[12px] font-medium ${
                                item.deadlineState === "overdue" ? "text-red-600"
                                : item.deadlineState === "soon" ? "text-amber-600"
                                : "text-[#9b9b9b]"}`}>
                                {item.deadline}
                              </p>
                            )}
                            <p className="text-[11px] text-[#b5b5b5] mt-0.5">{item.manager}</p>
                          </div>
                          <Icon name="ChevronRight" size={14} className="text-[#c5c5c5] shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {detail && (
            <ProductionDetailDrawer
              item={detail}
              allItems={detail.allItems}
              onClose={() => setDetail(null)}
              onMoveNext={() => moveToNext(detail)}
            />
          )}
        </div>
      )}

      {/* ── ВКЛАДКА: ПРОЦЕСС ── */}
      {mainTab === "process" && (
        <ProcessTab shifts={shifts} />
      )}
    </div>
  );
}
