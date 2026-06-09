import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { ordersApi, cuttingApi, warehouseApi, DbShift } from "@/api/client";
import { useApiData } from "@/api/useApiData";

type Props = { onNavigate: (section: string) => void };

function money(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млн ₽`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)} тыс. ₽`;
  return `${v.toLocaleString("ru")} ₽`;
}

function LiveDot() {
  return (
    <span className="relative flex h-1.5 w-1.5 shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
    </span>
  );
}

/* ── Компактная метрика ── */
function Metric({
  icon, color, bg, label, value, sub, badge, live, onClick,
}: {
  icon: string; color: string; bg: string;
  label: string; value: string | number; sub?: string;
  badge?: { text: string; green: boolean };
  live?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left bg-white border border-[#f0f0f0] rounded-xl px-4 py-3 hover:shadow-sm hover:border-[#e0e0e0] transition-all duration-150 w-full"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
          <Icon name={icon as never} size={13} style={{ color }} />
        </div>
        {live && (
          <div className="flex items-center gap-1 text-[10px] font-semibold text-green-600">
            <LiveDot />онлайн
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1 mb-0.5">
        <span className="text-[20px] font-bold text-[#1a1a1a] leading-none">{value}</span>
        {sub && <span className="text-[11px] text-[#9b9b9b]">{sub}</span>}
      </div>
      <p className="text-[11px] text-[#9b9b9b] leading-snug">{label}</p>
      {badge && (
        <span className={`mt-1.5 inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${badge.green ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
          {badge.text}
        </span>
      )}
    </button>
  );
}

/* ── Алерт-строка ── */
function AlertRow({ icon, color, bg, text, onClick }: {
  icon: string; color: string; bg: string; text: string; onClick?: () => void;
}) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left hover:brightness-95 transition-all"
      style={{ backgroundColor: bg }}
    >
      <Icon name={icon as never} size={13} style={{ color }} className="shrink-0" />
      <span className="text-[12px] font-medium flex-1" style={{ color }}>{text}</span>
      <Icon name="ChevronRight" size={11} style={{ color }} className="shrink-0 opacity-40" />
    </button>
  );
}

/* ── Секция с заголовком ── */
function Section({ label, live, children }: { label: string; live?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {live && <LiveDot />}
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#b0b0b0]">{label}</p>
      </div>
      {children}
    </div>
  );
}

export default function DashboardPage({ onNavigate }: Props) {
  const { data: rawOrders,  loading: l1 } = useApiData(() => ordersApi.production(),   [], "orders:production");
  const { data: rawShifts,  loading: l2 } = useApiData(() => cuttingApi.shifts(),      [], "cutting:shifts");
  const { data: rawMats,    loading: l3 } = useApiData(() => warehouseApi.materials(), [], "warehouse:materials");
  const { data: rawBlanks,  loading: l4 } = useApiData(() => warehouseApi.blanks(),    [], "warehouse:blanks");
  const { data: rawStock,   loading: l5 } = useApiData(() => warehouseApi.stock(),     [], "warehouse:stock");

  const loading = l1 || l2 || l3 || l4 || l5;

  /* Заказы */
  const orders = rawOrders ?? [];
  const ordersInWork  = orders.filter(o => ["Производство","Гравировка","Полировка"].includes(o.status)).length;
  const ordersReady   = orders.filter(o => o.status === "Готов").length;
  const ordersOverdue = orders.filter(o => o.deadline_state === "overdue").length;
  const ordersDebt    = orders.filter(o => Number(o.amount) > Number(o.paid))
    .reduce((s, o) => s + (Number(o.amount) - Number(o.paid)), 0);

  /* Смены */
  const shifts: DbShift[] = rawShifts ?? [];
  const activeShiftsCount = shifts.filter(s => s.status === "active").length;
  const blanksInWork = useMemo(() =>
    shifts.filter(s => s.status === "active" && s.task_qty_assigned)
          .reduce((sum, s) => sum + (s.task_qty_assigned ?? 0), 0),
  [shifts]);

  /* Склад */
  const mats   = rawMats   ?? [];
  const blanks = rawBlanks ?? [];
  const stock  = rawStock  ?? [];

  const critRaw    = mats.filter(m => Number(m.qty) <= Number(m.min_qty)).length;
  const critBlanks = blanks.filter(b => Number(b.qty) === 0).length;

  /* Стоимость склада (себестоимость) */
  const rawCost      = mats.reduce((s, m) => s + Number(m.qty) * Number(m.price), 0);
  const blankCost    = blanks.reduce((s, b) => s + Number(b.qty) * Number(b.cost_price ?? 0), 0);
  const blankSale    = blanks.reduce((s, b) => s + Number(b.qty) * Number(b.sale_price ?? 0), 0);
  const stockCost    = stock.reduce((s, i) => s + Number(i.qty) * Number((i as {cost_price?:number}).cost_price ?? 0), 0);
  const stockSale    = stock.reduce((s, i) => s + Number(i.qty) * Number(i.price), 0);
  const totalCost    = rawCost + blankCost + stockCost;
  const totalSale    = blankSale + stockSale;
  const totalProfit  = totalSale - (blankCost + stockCost);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });

  const dash = (v: string | number) => loading ? "—" : v;

  return (
    <div className="overflow-y-auto bg-white h-full">
      <div className="max-w-[960px] mx-auto px-6 py-5 space-y-5">

        {/* ── Шапка ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-bold text-[#1a1a1a]">Главная</h1>
            <p className="text-[12px] text-[#9b9b9b] capitalize">{dateStr}</p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#9b9b9b]">
            <LiveDot />
            <span className="font-semibold text-green-600">{timeStr}</span>
          </div>
        </div>

        {/* ── Алерты ── */}
        {!loading && (ordersOverdue > 0 || critRaw > 0 || critBlanks > 0) && (
          <div className="space-y-1.5">
            {ordersOverdue > 0 && <AlertRow icon="AlertTriangle" color="#dc2626" bg="#fef2f2"
              text={`${ordersOverdue} заказ${ordersOverdue > 1 ? "а" : ""} просрочено`}
              onClick={() => onNavigate("production")} />}
            {critRaw > 0 && <AlertRow icon="PackageX" color="#d97706" bg="#fffbeb"
              text={`${critRaw} вид${critRaw > 1 ? "а" : ""} сырья ниже минимума`}
              onClick={() => onNavigate("warehouse")} />}
            {critBlanks > 0 && <AlertRow icon="Boxes" color="#7c3aed" bg="#eff6ff"
              text={`${critBlanks} вид${critBlanks > 1 ? "а" : ""} заготовок закончилось`}
              onClick={() => onNavigate("warehouse")} />}
          </div>
        )}

        {/* ── Сейчас в работе ── */}
        <Section label="Сейчас в работе" live>
          <div className="grid grid-cols-4 gap-2">
            <Metric icon="Hammer"       color="#f59e0b" bg="#fffbeb"
              label="Заказов в работе" value={dash(ordersInWork)} sub="шт." live
              onClick={() => onNavigate("production")} />
            <Metric icon="Scissors"     color="#2563eb" bg="#eff6ff"
              label="Заготовок в нарезке" value={dash(blanksInWork || activeShiftsCount)} sub={blanksInWork ? "шт." : "смен"} live
              onClick={() => onNavigate("cutting")} />
            <Metric icon="CheckCircle2" color="#16a34a" bg="#f0fdf4"
              label="Готово к выдаче" value={dash(ordersReady)} sub="шт."
              onClick={() => onNavigate("production")} />
            <Metric icon="CreditCard"   color="#dc2626" bg="#fef2f2"
              label="Долг клиентов" value={dash(money(ordersDebt))}
              onClick={() => onNavigate("orders")} />
          </div>
        </Section>

        {/* ── Склад ── */}
        <Section label="Склад">
          <div className="grid grid-cols-4 gap-2">
            <Metric icon="Layers"      color="#0ea5e9" bg="#f0f9ff"
              label="Сырьё (себест.)" value={dash(money(rawCost))}
              onClick={() => onNavigate("warehouse")} />
            <Metric icon="Package"     color="#8b5cf6" bg="#eff6ff"
              label="Заготовки (себест.)" value={dash(money(blankCost))}
              badge={blankSale > 0 ? { text: `→ ${money(blankSale)}`, green: true } : undefined}
              onClick={() => onNavigate("warehouse")} />
            <Metric icon="ShoppingBag" color="#f59e0b" bg="#fffbeb"
              label="В наличии (себест.)" value={dash(money(stockCost))}
              badge={stockSale > 0 ? { text: `→ ${money(stockSale)}`, green: true } : undefined}
              onClick={() => onNavigate("warehouse")} />
            <Metric icon="TrendingUp"  color="#16a34a" bg="#f0fdf4"
              label="Потенц. прибыль" value={dash(money(totalProfit))}
              badge={totalProfit > 0 ? {
                text: `${Math.round((totalProfit / (blankCost + stockCost || 1)) * 100)}% маржа`,
                green: true,
              } : undefined}
              onClick={() => onNavigate("warehouse")} />
          </div>
        </Section>

        {/* ── Быстрый переход ── */}
        <Section label="Разделы">
          <div className="grid grid-cols-3 gap-2">
            <Metric icon="FileText"  color="#3b82f6" bg="#eff6ff"
              label="Заказы" value={dash(orders.length)} sub="всего"
              onClick={() => onNavigate("orders")} />
            <Metric icon="Hammer"    color="#f59e0b" bg="#fffbeb"
              label="Изготовление" value={dash(ordersInWork)} sub="в работе"
              onClick={() => onNavigate("production")} />
            <Metric icon="Scissors"  color="#2563eb" bg="#eff6ff"
              label="Заготовки" value={dash(activeShiftsCount)} sub="смен"
              onClick={() => onNavigate("cutting")} />
            <Metric icon="Package"   color="#8b5cf6" bg="#eff6ff"
              label="Склад" value={dash(money(totalCost))}
              onClick={() => onNavigate("warehouse")} />
            <Metric icon="Users"     color="#0ea5e9" bg="#f0f9ff"
              label="Заказчики" value="→"
              onClick={() => onNavigate("clients")} />
            <Metric icon="BarChart2" color="#10b981" bg="#ecfdf5"
              label="Аналитика" value="→"
              onClick={() => onNavigate("analytics")} />
          </div>
        </Section>

      </div>
    </div>
  );
}