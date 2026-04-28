import { useState } from "react";
import Icon from "@/components/ui/icon";
import { orders, miniStats, FilterKey, Order } from "./orders/orders.types";
import OrdersTable from "./orders/OrdersTable";
import OrdersSidePanel from "./orders/OrdersSidePanel";
import OrdersControlBoard from "./orders/OrdersControlBoard";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",     label: "Все" },
  { key: "mine",    label: "Мои" },
  { key: "overdue", label: "Просроченные" },
  { key: "unpaid",  label: "Без оплаты" },
];

export default function OrdersPage({ onOpenOrder, onNewOrder }: { onOpenOrder?: (id: string) => void; onNewOrder?: () => void }) {
  const [view, setView]         = useState<"list" | "control">("list");
  const [filter, setFilter]     = useState<FilterKey>("all");
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<Order | null>(null);

  const applyFilter = (o: Order) => {
    if (filter === "mine")    return o.manager === "Олег К.";
    if (filter === "overdue") return o.deadlineState === "overdue";
    if (filter === "unpaid")  return o.payStatus !== "paid";
    return true;
  };

  const applySearch = (o: Order) => {
    const q = search.toLowerCase();
    return !q || o.id.toLowerCase().includes(q) || o.client.toLowerCase().includes(q) || o.phone.includes(q);
  };

  const filtered = orders.filter(o => applyFilter(o) && applySearch(o));

  const overdueCount = orders.filter(o => o.deadlineState === "overdue").length;
  const unpaidCount  = orders.filter(o => o.payStatus !== "paid").length;

  return (
    <div className="flex h-full min-h-0">
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* ── Sticky-шапка ── */}
        <div className="sticky top-0 z-20 bg-[#fafafa] border-b border-[#ebebeb]">
          <div className="px-7 py-4 max-w-[1100px] w-full mx-auto">

            {/* Строка 1: заголовок + счётчик */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h1 className="text-[20px] font-semibold text-[#1a1a1a] tracking-tight">Заказы</h1>
                <span className="text-[13px] text-[#b5b5b5]">{filtered.length} из {orders.length}</span>
              </div>
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
            </div>

            {/* Строка 2: кнопка + поиск + фильтры */}
            <div className="flex items-center gap-3">

              {/* Кнопка «Новый заказ» — крупная, primary */}
              <button
                onClick={onNewOrder}
                className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[14px] font-semibold px-5 py-2.5 rounded-[10px] hover:bg-[#333] active:scale-[0.98] transition-all shrink-0 shadow-sm"
              >
                <Icon name="Plus" size={16} />
                Новый заказ
              </button>

              {/* Поиск — широкий */}
              <div className="relative flex-1 max-w-[400px]">
                <Icon name="Search" size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b5b5b5]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск: номер, клиент или телефон"
                  className="w-full bg-white border border-[#e0e0e0] rounded-[10px] pl-10 pr-4 py-2.5 text-[14px] text-[#1a1a1a] placeholder:text-[#c0c0c0] outline-none focus:border-[#b0b0b0] focus:shadow-sm transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b5b5b5] hover:text-[#4b4b4b] transition-colors"
                  >
                    <Icon name="X" size={13} />
                  </button>
                )}
              </div>

              {/* Фильтры */}
              <div className="flex gap-1 bg-white border border-[#ebebeb] rounded-[8px] p-1 shrink-0">
                {FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
                      ${filter === f.key ? "bg-[#1a1a1a] text-white shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
                  >
                    {f.label}
                    {f.key === "overdue" && overdueCount > 0 && (
                      <span className={`text-[10px] rounded-full px-1.5 py-px font-bold leading-none
                        ${filter === f.key ? "bg-white/25 text-white" : "bg-red-100 text-red-500"}`}>
                        {overdueCount}
                      </span>
                    )}
                    {f.key === "unpaid" && unpaidCount > 0 && (
                      <span className={`text-[10px] rounded-full px-1.5 py-px font-bold leading-none
                        ${filter === f.key ? "bg-white/25 text-white" : "bg-amber-100 text-amber-600"}`}>
                        {unpaidCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mini-dashboard */}
        <div className="px-7 pt-4 pb-0 max-w-[1100px] w-full mx-auto">
          <div className="grid grid-cols-4 gap-3 mb-4">
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
        </div>

        {/* Канбан «Контроль» */}
        {view === "control" && (
          <div className="px-7 pb-7 max-w-[1100px] w-full mx-auto mt-2">
            <OrdersControlBoard orders={orders} onOpenOrder={onOpenOrder} />
          </div>
        )}

        {/* Таблица */}
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

      {/* Боковая панель */}
      {selected && (
        <OrdersSidePanel selected={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
