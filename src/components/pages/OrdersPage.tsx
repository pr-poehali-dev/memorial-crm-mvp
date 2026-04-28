import { useState } from "react";
import Icon from "@/components/ui/icon";
import { orders, miniStats, FILTERS, FilterKey, Order } from "./orders/orders.types";
import OrdersTable from "./orders/OrdersTable";
import OrdersSidePanel from "./orders/OrdersSidePanel";
import OrdersControlBoard from "./orders/OrdersControlBoard";

export default function OrdersPage({ onOpenOrder, onNewOrder }: { onOpenOrder?: (id: string) => void; onNewOrder?: () => void }) {
  const [view, setView]       = useState<"list" | "control">("list");
  const [filter, setFilter]   = useState<FilterKey>("all");
  const [search, setSearch]   = useState("");
  const [selected, setSelected] = useState<Order | null>(null);

  const applyFilter = (o: Order) => {
    if (filter === "mine")    return o.manager === "Олег К.";
    if (filter === "overdue") return o.deadlineState === "overdue";
    if (filter === "unpaid")  return o.payStatus !== "paid";
    if (filter === "inwork")  return ["Эскиз","Производство"].includes(o.status);
    return true;
  };

  const applySearch = (o: Order) => {
    const q = search.toLowerCase();
    return !q || o.id.toLowerCase().includes(q) || o.client.toLowerCase().includes(q) || o.phone.includes(q);
  };

  const filtered = orders.filter(o => applyFilter(o) && applySearch(o));

  return (
    <div className="flex h-full min-h-0">
      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-7 pb-0 max-w-[1100px] w-full mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[21px] font-semibold text-[#1a1a1a] tracking-tight">Заказы</h1>
              <p className="text-[13px] text-[#9b9b9b] mt-0.5">{filtered.length} из {orders.length}</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Переключатель вида */}
              <div className="flex gap-0.5 bg-[#f0f0f0] rounded-[8px] p-0.5">
                <button
                  onClick={() => setView("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
                    ${view === "list" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
                >
                  <Icon name="List" size={13} />Список
                </button>
                <button
                  onClick={() => setView("control")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
                    ${view === "control" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
                >
                  <Icon name="LayoutGrid" size={13} />Контроль
                </button>
              </div>
              <button onClick={onNewOrder} className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[13px] px-4 py-2 rounded-[8px] hover:bg-[#333] transition-colors">
                <Icon name="Plus" size={14} />
                Новый заказ
              </button>
            </div>
          </div>

          {/* Mini-dashboard */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {miniStats.map((s) => (
              <div key={s.label} className="bg-white border border-[#ebebeb] rounded-xl px-4 py-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + "18" }}>
                  <Icon name={s.icon as never} size={15} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-[17px] font-semibold text-[#1a1a1a] leading-none mb-0.5">{s.value}</p>
                  <p className="text-[11px] text-[#9b9b9b]">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters + Search */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1 bg-white border border-[#ebebeb] rounded-[8px] p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
                    ${filter === f.key ? "bg-[#1a1a1a] text-white shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
                >
                  {f.label}
                  {f.key === "overdue" && <span className="ml-1.5 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5">
                    {orders.filter(o => o.deadlineState === "overdue").length}
                  </span>}
                  {f.key === "unpaid" && <span className="ml-1.5 text-[10px] bg-amber-500 text-white rounded-full px-1.5 py-0.5">
                    {orders.filter(o => o.payStatus !== "paid").length}
                  </span>}
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-[280px]">
              <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5b5]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Номер, клиент, телефон..."
                className="w-full bg-white border border-[#ebebeb] rounded-[8px] pl-8 pr-3 py-2 text-[13px] text-[#1a1a1a] placeholder:text-[#c5c5c5] outline-none focus:border-[#c0c0c0] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* ─── Канбан «Контроль» ─── */}
        {view === "control" && (
          <div className="px-7 pb-7 max-w-[1100px] w-full mx-auto mt-4">
            <OrdersControlBoard orders={orders} onOpenOrder={onOpenOrder} />
          </div>
        )}

        {/* Table */}
        {view === "list" && (
          <div className="px-7 pb-7 max-w-[1100px] w-full mx-auto">
            <OrdersTable
              filtered={filtered}
              selected={selected}
              onSelect={(o) => setSelected(selected?.id === o.id ? null : o)}
              onOpenOrder={onOpenOrder}
            />
          </div>
        )}
      </div>

      {/* Side panel */}
      {selected && (
        <OrdersSidePanel selected={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
