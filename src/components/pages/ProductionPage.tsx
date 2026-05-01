import { useState, useMemo } from "react";
import {
  COLUMNS, COL_NEXT,
  FilterKey, FlatItem, Column, ItemStatus,
  flattenItems,
} from "./production/production.types";
import ProductionHeader       from "./production/ProductionHeader";
import ProductionKanban       from "./production/ProductionKanban";
import ProductionDetailDrawer from "./production/ProductionDetailDrawer";

export default function ProductionPage() {
  const [columns, setColumns] = useState<Column[]>(COLUMNS);
  const [filter,  setFilter]  = useState<FilterKey>("all");
  const [search,  setSearch]  = useState("");
  const [detail,  setDetail]  = useState<FlatItem | null>(null);

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
      />

      <ProductionKanban
        columns={columns}
        visibleKeys={visibleKeys}
        onItemClick={setDetail}
      />

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
