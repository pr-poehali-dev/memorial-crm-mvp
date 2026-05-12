import { useState, useMemo, useEffect, useCallback } from "react";
import LoadingScreen from "@/components/ui/LoadingScreen";
import {
  COL_CONFIG, COL_NEXT_STATUS,
  FilterKey, FlatItem, Column, Card,
} from "./production/production.types";
import { ordersApi, DbProductionOrder } from "@/api/client";
import ProductionHeader       from "./production/ProductionHeader";
import ProductionKanban       from "./production/ProductionKanban";
import ProductionList         from "./production/ProductionList";
import ProductionDetailDrawer from "./production/ProductionDetailDrawer";

type ViewMode = "kanban" | "list";

function dbToCard(o: DbProductionOrder): Card {
  return {
    id:            o.id,
    client:        o.client_name,
    stone:         o.stone || "",
    size:          o.size  || "",
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
    cards: orders
      .filter(o => cfg.statuses.includes(o.status))
      .map(dbToCard),
  }));
}

function flattenColumns(columns: Column[]): FlatItem[] {
  return columns.flatMap(col =>
    col.cards.map(card => ({
      itemId:        card.id,
      orderId:       card.id,
      colId:         col.id,
      colLabel:      col.label,
      colColor:      col.color,
      client:        card.client,
      stone:         card.stone,
      size:          card.size,
      deadline:      card.deadline,
      deadlineState: card.deadlineState,
      manager:       card.manager,
      urgent:        card.urgent,
      phone:         card.phone,
      payment:       card.payment,
      problem:       card.comment,
      allItems:      [],
    }))
  );
}

export default function ProductionPage() {
  const [orders,  setOrders]  = useState<DbProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<FilterKey>("all");
  const [search,  setSearch]  = useState("");
  const [detail,  setDetail]  = useState<FlatItem | null>(null);
  const [view,    setView]    = useState<ViewMode>("kanban");
  const [listStage, setListStage] = useState<string | undefined>(undefined);

  const reload = useCallback(() =>
    ordersApi.production()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false)),
  []);

  useEffect(() => { reload(); }, [reload]);

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

  const visibleKeys = useMemo(() =>
    new Set(allItems.filter(c => applyFilter(c) && applySearch(c)).map(c => c.itemId)),
  [allItems, filter, search]);

  const totalInWork  = allItems.filter(c => c.colId !== "ready" && c.colId !== "delivery").length;
  const totalOverdue = allItems.filter(c => c.deadlineState === "overdue").length;
  const totalUrgent  = allItems.filter(c => !!c.urgent).length;

  const moveToNext = (item: FlatItem) => {
    const nextStatus = COL_NEXT_STATUS[item.colId];
    if (!nextStatus) return;
    ordersApi.update(item.orderId, { status: nextStatus })
      .then(() => reload())
      .catch(console.error);
    setDetail(null);
  };

  const handleSwitchToList = (colId: string) => {
    setListStage(colId);
    setView("list");
  };

  const handleSetView = (v: ViewMode) => {
    if (v === "kanban") setListStage(undefined);
    setView(v);
  };

  if (loading) {
    return <LoadingScreen text="Загружаем производство" />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f7f7f8]">
      <ProductionHeader
        totalInWork={totalInWork}
        totalOverdue={totalOverdue}
        totalUrgent={totalUrgent}
        filter={filter}
        setFilter={setFilter}
        search={search}
        setSearch={setSearch}
        view={view}
        setView={handleSetView}
      />

      {view === "kanban" ? (
        <ProductionKanban
          columns={columns}
          visibleKeys={visibleKeys}
          onItemClick={setDetail}
          onSwitchToList={handleSwitchToList}
        />
      ) : (
        <ProductionList
          allItems={allItems}
          initialStage={listStage}
          onItemClick={setDetail}
        />
      )}

      {detail && (
        <ProductionDetailDrawer
          item={detail}
          allItems={detail.allItems}
          onClose={() => setDetail(null)}
          onMoveNext={() => moveToNext(detail)}
        />
      )}
    </div>
  );
}