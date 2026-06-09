import { useState, useMemo, useEffect } from "react";
import Icon from "@/components/ui/icon";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { ordersApi, DbOrder } from "@/api/client";
import { useNav } from "@/store/navStore";

/* ─── Типы ─── */
type SketchStatus = "waiting" | "sent" | "approved" | "revision";

type SketchOrder = {
  id: string;
  client: string;
  phone: string;
  stone: string;
  size: string;
  design: string;
  inscription: string;
  manager: string;
  deadline: string;
  deadlineState: string;
  amount: number;
  paid: number;
  comment: string;
  orderDate: string;
  sketchStatus: SketchStatus;
};

const SKETCH_STATUS: Record<SketchStatus, { label: string; color: string; bg: string; icon: string }> = {
  waiting:  { label: "Ожидает эскиза", color: "#9b9b9b", bg: "#f5f5f5",  icon: "Clock" },
  sent:     { label: "Отправлен",      color: "#f59e0b", bg: "#fffbeb",  icon: "Send" },
  approved: { label: "Одобрен",        color: "#16a34a", bg: "#f0fdf4",  icon: "CheckCircle" },
  revision: { label: "На доработку",   color: "#ef4444", bg: "#fef2f2",  icon: "RefreshCw" },
};

/* Локальные статусы эскизов (пока без бэкенда) */
const KEY = "sketch_statuses";
function loadStatuses(): Record<string, SketchStatus> {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
function saveStatuses(s: Record<string, SketchStatus>) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

function dbToSketch(o: DbOrder): SketchOrder {
  return {
    id:           o.id,
    client:       o.client_name,
    phone:        o.phone || "",
    stone:        o.stone || "",
    size:         o.size  || "",
    design:       o.design || "",
    inscription:  o.inscription || "",
    manager:      o.manager || "",
    deadline:     o.deadline ? new Date(o.deadline).toLocaleDateString("ru-RU") : "",
    deadlineState:o.deadline_state || "ok",
    amount:       Number(o.amount),
    paid:         Number(o.paid),
    comment:      o.comment || "",
    orderDate:    o.order_date ? new Date(o.order_date).toLocaleDateString("ru-RU") : "",
    sketchStatus: "waiting",
  };
}

/* ─── Карточка ─── */
function SketchCard({
  order,
  sketchStatus,
  onStatusChange,
  onOpenOrder,
}: {
  order: SketchOrder;
  sketchStatus: SketchStatus;
  onStatusChange: (id: string, s: SketchStatus) => void;
  onOpenOrder: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const st = SKETCH_STATUS[sketchStatus];
  const isOverdue = order.deadlineState === "overdue";
  const isSoon    = order.deadlineState === "soon";
  const debt = order.amount - order.paid;

  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-shadow hover:shadow-md ${
      isOverdue ? "border-red-200" : isSoon ? "border-amber-200" : "border-[#ebebeb]"
    }`}>
      {/* Шапка */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => onOpenOrder(order.id)}
                className="text-[12px] font-bold text-[#2563eb] hover:underline underline-offset-2 font-mono"
              >
                {order.id}
              </button>
              {isOverdue && (
                <span className="text-[10px] font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">просрочен</span>
              )}
              {isSoon && !isOverdue && (
                <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">скоро срок</span>
              )}
            </div>
            <p className="text-[15px] font-semibold text-[#1a1a1a] leading-tight">{order.client}</p>
            {order.phone && (
              <p className="text-[12px] text-[#9b9b9b] mt-0.5">{order.phone}</p>
            )}
          </div>
          {/* Статус эскиза */}
          <span
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shrink-0"
            style={{ color: st.color, backgroundColor: st.bg }}
          >
            <Icon name={st.icon as never} size={11} />
            {st.label}
          </span>
        </div>

        {/* Параметры изделия */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
          {order.stone && (
            <div>
              <p className="text-[10px] text-[#b5b5b5] uppercase tracking-wide">Материал</p>
              <p className="text-[12px] font-medium text-[#1a1a1a]">{order.stone}</p>
            </div>
          )}
          {order.size && (
            <div>
              <p className="text-[10px] text-[#b5b5b5] uppercase tracking-wide">Размер</p>
              <p className="text-[12px] font-mono text-[#1a1a1a]">{order.size}</p>
            </div>
          )}
          {order.design && (
            <div>
              <p className="text-[10px] text-[#b5b5b5] uppercase tracking-wide">Форма</p>
              <p className="text-[12px] text-[#1a1a1a]">{order.design}</p>
            </div>
          )}
          {order.deadline && (
            <div>
              <p className="text-[10px] text-[#b5b5b5] uppercase tracking-wide">Срок</p>
              <p className={`text-[12px] font-medium ${isOverdue ? "text-red-600" : isSoon ? "text-amber-600" : "text-[#1a1a1a]"}`}>
                {order.deadline}
              </p>
            </div>
          )}
        </div>

        {/* Надпись */}
        {order.inscription && (
          <div className="bg-[#f8f8f8] rounded-lg px-3 py-2 mb-3">
            <p className="text-[10px] text-[#b5b5b5] uppercase tracking-wide mb-0.5">Надпись</p>
            <p className="text-[12px] text-[#4b4b4b] italic leading-snug">&laquo;{order.inscription}&raquo;</p>
          </div>
        )}

        {/* Менеджер + сумма */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-[#9b9b9b]">
            <Icon name="User" size={11} />
            {order.manager || "—"}
          </div>
          <div className="text-right">
            <span className="text-[13px] font-semibold text-[#1a1a1a]">{order.amount.toLocaleString("ru")} ₽</span>
            {debt > 0 && (
              <span className="ml-2 text-[11px] text-red-500 font-medium">−{debt.toLocaleString("ru")} ₽</span>
            )}
          </div>
        </div>
      </div>

      {/* Разделитель + действия */}
      <div className="border-t border-[#f5f5f5]">
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between px-5 py-2.5 text-[12px] text-[#6b6b6b] hover:bg-[#fafafa] transition-colors"
        >
          <span className="font-medium">Статус эскиза</span>
          <Icon name={open ? "ChevronUp" : "ChevronDown"} size={14} className="text-[#b5b5b5]" />
        </button>

        {open && (
          <div className="px-5 pb-4 grid grid-cols-2 gap-2">
            {(Object.entries(SKETCH_STATUS) as [SketchStatus, typeof SKETCH_STATUS[SketchStatus]][]).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => { onStatusChange(order.id, key); setOpen(false); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[12px] font-medium transition-all ${
                  sketchStatus === key
                    ? "border-transparent"
                    : "border-[#ebebeb] text-[#6b6b6b] hover:bg-[#f5f5f5]"
                }`}
                style={sketchStatus === key ? { color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.color + "40" } : {}}
              >
                <Icon name={cfg.icon as never} size={13} style={{ color: cfg.color }} />
                {cfg.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Главная страница ─── */
type FilterKey = "all" | "waiting" | "sent" | "approved" | "revision";

export default function SketchesPage() {
  const { openOrder } = useNav();
  const [orders,   setOrders]   = useState<SketchOrder[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [statuses, setStatuses] = useState<Record<string, SketchStatus>>(loadStatuses);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState<FilterKey>("all");

  useEffect(() => {
    ordersApi.list()
      .then(data => {
        const sketches = data
          .filter(o => o.status === "Эскиз")
          .map(dbToSketch);
        setOrders(sketches);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = (id: string, s: SketchStatus) => {
    const next = { ...statuses, [id]: s };
    setStatuses(next);
    saveStatuses(next);
  };

  const getStatus = (id: string): SketchStatus => statuses[id] ?? "waiting";

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const st = getStatus(o.id);
      if (filter !== "all" && st !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          o.client.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          o.stone.toLowerCase().includes(q) ||
          (o.manager || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, statuses, filter, search]);

  /* Счётчики */
  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = { all: orders.length, waiting: 0, sent: 0, approved: 0, revision: 0 };
    orders.forEach(o => { c[getStatus(o.id)] = (c[getStatus(o.id)] || 0) + 1; });
    return c;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders, statuses]);

  const FILTERS: { key: FilterKey; label: string; color: string }[] = [
    { key: "all",      label: "Все",            color: "#6b6b6b" },
    { key: "waiting",  label: "Ожидают",        color: "#9b9b9b" },
    { key: "sent",     label: "Отправлены",     color: "#f59e0b" },
    { key: "revision", label: "На доработке",   color: "#ef4444" },
    { key: "approved", label: "Одобрены",       color: "#16a34a" },
  ];

  if (loading) return <LoadingScreen text="Загружаем эскизы" />;

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Шапка ── */}
      <div className="shrink-0 px-7 pt-6 pb-4 border-b border-[#ebebeb]">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-[32px] font-bold text-[#1a1a1a] tracking-tight">Эскизы</h1>
            <p className="text-[13px] text-[#9b9b9b] mt-0.5">
              Заказы на стадии разработки эскиза
            </p>
          </div>

          {/* Сводка */}
          <div className="flex items-center gap-3">
            {[
              { label: "Всего",        value: counts.all,      color: "#6b6b6b" },
              { label: "Ожидают",      value: counts.waiting,  color: "#9b9b9b" },
              { label: "Отправлены",   value: counts.sent,     color: "#f59e0b" },
              { label: "Доработка",    value: counts.revision, color: "#ef4444" },
              { label: "Одобрены",     value: counts.approved, color: "#16a34a" },
            ].map(s => (
              <div key={s.label} className="bg-white border border-[#ebebeb] rounded-xl px-4 py-2.5 text-center min-w-[72px]">
                <p className="text-[20px] font-bold leading-none" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] text-[#b5b5b5] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Фильтры + поиск */}
        <div className="flex items-center gap-3">
          <div className="flex gap-0.5 bg-[#f0f0f0] rounded-[8px] p-0.5">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all ${
                  filter === f.key ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"
                }`}
              >
                {f.label}
                {counts[f.key] > 0 && (
                  <span
                    className="text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
                    style={{ backgroundColor: filter === f.key ? f.color + "20" : "#e0e0e0", color: filter === f.key ? f.color : "#9b9b9b" }}
                  >
                    {counts[f.key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-[280px]">
            <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5b5]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Клиент, заказ, материал..."
              className="w-full bg-white border border-[#ebebeb] rounded-[8px] pl-8 pr-3 py-2 text-[13px] placeholder:text-[#c5c5c5] outline-none focus:border-[#c0c0c0] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── Список карточек ── */}
      <div className="flex-1 overflow-y-auto px-7 py-5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#f4f4f4] flex items-center justify-center mb-4">
              <Icon name="PenTool" size={24} className="text-[#c0c0c0]" />
            </div>
            <p className="text-[15px] font-medium text-[#9b9b9b]">
              {search || filter !== "all" ? "Ничего не найдено" : "Нет заказов на стадии эскиза"}
            </p>
            <p className="text-[13px] text-[#c5c5c5] mt-1">
              {search || filter !== "all"
                ? "Попробуйте изменить фильтры"
                : "Заказы появятся здесь, когда перейдут в статус «Эскиз»"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map(order => (
              <SketchCard
                key={order.id}
                order={order}
                sketchStatus={getStatus(order.id)}
                onStatusChange={handleStatusChange}
                onOpenOrder={openOrder}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}