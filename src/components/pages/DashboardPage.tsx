import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { ordersApi, cuttingApi, warehouseApi, DbShift } from "@/api/client";
import { useApiData } from "@/api/useApiData";
import { today } from "./cutting/cutting.types";

type Props = {
  onNavigate: (section: string) => void;
};

function money(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млн ₽`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)} тыс. ₽`;
  return `${v.toLocaleString("ru")} ₽`;
}

/* ── Пульсирующий индикатор "онлайн" ── */
function LiveDot() {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
    </span>
  );
}

/* ── Карточка быстрого перехода ── */
function NavCard({
  icon, color, bg, border, title, subtitle, value, valueSub, live, onClick,
}: {
  icon: string; color: string; bg: string; border: string;
  title: string; subtitle: string;
  value: string | number; valueSub?: string;
  live?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group text-left bg-white border rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 w-full"
      style={{ borderColor: border }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
          <Icon name={icon as never} size={18} style={{ color }} />
        </div>
        {live && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-green-600">
            <LiveDot />
            онлайн
          </div>
        )}
      </div>
      <div className="mb-1">
        <span className="text-[28px] font-bold text-[#1a1a1a] leading-none">{value}</span>
        {valueSub && <span className="text-[14px] text-[#9b9b9b] ml-1.5">{valueSub}</span>}
      </div>
      <p className="text-[13px] font-semibold text-[#1a1a1a]">{title}</p>
      <p className="text-[11px] text-[#9b9b9b] mt-0.5">{subtitle}</p>
      <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }}>
        Перейти <Icon name="ArrowRight" size={11} />
      </div>
    </button>
  );
}

/* ── Строка алерта ── */
function AlertRow({ icon, color, bg, text, onClick }: {
  icon: string; color: string; bg: string; text: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:brightness-95 transition-all"
      style={{ backgroundColor: bg }}
    >
      <Icon name={icon as never} size={14} style={{ color }} className="shrink-0" />
      <span className="text-[13px] font-medium flex-1" style={{ color }}>{text}</span>
      <Icon name="ChevronRight" size={13} style={{ color }} className="shrink-0 opacity-50" />
    </button>
  );
}

export default function DashboardPage({ onNavigate }: Props) {
  const { data: rawOrders,  loading: l1 } = useApiData(() => ordersApi.production(),    [], "orders:production");
  const { data: rawShifts,  loading: l2 } = useApiData(() => cuttingApi.shifts(),       [], "cutting:shifts");
  const { data: rawMats,    loading: l3 } = useApiData(() => warehouseApi.materials(),  [], "warehouse:materials");
  const { data: rawBlanks,  loading: l4 } = useApiData(() => warehouseApi.blanks(),     [], "warehouse:blanks");

  const loading = l1 || l2 || l3 || l4;

  /* Заказы */
  const orders = rawOrders ?? [];
  const activeStatuses = ["Производство", "Гравировка", "Полировка"];
  const ordersInWork  = orders.filter(o => activeStatuses.includes(o.status)).length;
  const ordersReady   = orders.filter(o => o.status === "Готов").length;
  const ordersOverdue = orders.filter(o => o.deadline_state === "overdue").length;
  const ordersDebt    = orders.filter(o => Number(o.amount) > Number(o.paid))
    .reduce((s, o) => s + (Number(o.amount) - Number(o.paid)), 0);

  /* Смены */
  const shifts: DbShift[] = rawShifts ?? [];
  const activeShiftsCount = shifts.filter(s => s.status === "active").length;

  /* Заготовок в работе = сумма task_qty_assigned у активных смен */
  const blanksInWork = useMemo(() =>
    shifts
      .filter(s => s.status === "active" && s.task_qty_assigned)
      .reduce((sum, s) => sum + (s.task_qty_assigned ?? 0), 0),
  [shifts]);

  /* Склад */
  const mats   = rawMats   ?? [];
  const blanks = rawBlanks ?? [];
  const critRaw    = mats.filter(m => Number(m.qty) <= Number(m.min_qty)).length;
  const critBlanks = blanks.filter(b => Number(b.qty) === 0).length;
  const totalStock = mats.reduce((s, m) => s + Number(m.qty) * Number(m.price), 0)
    + blanks.reduce((s, b) => s + Number(b.qty) * Number(b.cost_price), 0);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="flex-1 overflow-y-auto bg-[#f7f7f8]">
      <div className="max-w-[1100px] mx-auto px-7 py-7 space-y-6">

        {/* ── Шапка ── */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight">Главная</h1>
            <p className="text-[13px] text-[#9b9b9b] mt-0.5 capitalize">{dateStr}</p>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[#9b9b9b]">
            <LiveDot />
            <span className="font-semibold text-green-600">{timeStr}</span>
            <span>· данные в реальном времени</span>
          </div>
        </div>

        {/* ── Алерты (если есть проблемы) ── */}
        {!loading && (ordersOverdue > 0 || critRaw > 0 || critBlanks > 0) && (
          <div className="space-y-2">
            {ordersOverdue > 0 && (
              <AlertRow
                icon="AlertTriangle" color="#dc2626" bg="#fef2f2"
                text={`${ordersOverdue} заказ${ordersOverdue > 1 ? "а" : ""} просрочено — нужно реагировать`}
                onClick={() => onNavigate("production")}
              />
            )}
            {critRaw > 0 && (
              <AlertRow
                icon="PackageX" color="#d97706" bg="#fffbeb"
                text={`${critRaw} вид${critRaw > 1 ? "а" : ""} сырья на нуле или ниже минимума`}
                onClick={() => onNavigate("warehouse")}
              />
            )}
            {critBlanks > 0 && (
              <AlertRow
                icon="Boxes" color="#7c3aed" bg="#f5f3ff"
                text={`${critBlanks} вид${critBlanks > 1 ? "а" : ""} заготовок закончилось`}
                onClick={() => onNavigate("warehouse")}
              />
            )}
          </div>
        )}

        {/* ── Текущий процесс (онлайн) ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <LiveDot />
            <h2 className="text-[13px] font-bold text-[#1a1a1a] uppercase tracking-widest">Сейчас в работе</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

            <NavCard
              icon="Hammer" color="#f59e0b" bg="#fffbeb" border="#fde68a"
              title="Заказов в работе"
              subtitle="Производство, гравировка, полировка"
              value={loading ? "—" : ordersInWork}
              valueSub="шт."
              live
              onClick={() => onNavigate("production")}
            />

            <NavCard
              icon="Scissors" color="#6366f1" bg="#eef2ff" border="#c7d2fe"
              title="Заготовок в работе"
              subtitle="Активных смен на нарезке"
              value={loading ? "—" : blanksInWork || activeShiftsCount}
              valueSub={blanksInWork ? "шт." : "смен"}
              live
              onClick={() => onNavigate("cutting")}
            />

            <NavCard
              icon="CheckCircle2" color="#16a34a" bg="#f0fdf4" border="#bbf7d0"
              title="Готово к выдаче"
              subtitle="Заказы ожидают клиента"
              value={loading ? "—" : ordersReady}
              valueSub="шт."
              onClick={() => onNavigate("production")}
            />

            <NavCard
              icon="CreditCard" color="#dc2626" bg="#fef2f2" border="#fecaca"
              title="Долг клиентов"
              subtitle="Сумма неоплаченных заказов"
              value={loading ? "—" : money(ordersDebt)}
              onClick={() => onNavigate("orders")}
            />
          </div>
        </div>

        {/* ── Разделы ── */}
        <div>
          <h2 className="text-[13px] font-bold text-[#1a1a1a] uppercase tracking-widest mb-3">Быстрый переход</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

            <NavCard
              icon="FileText" color="#3b82f6" bg="#eff6ff" border="#bfdbfe"
              title="Заказы"
              subtitle="Все заказы, статусы, оплата"
              value={loading ? "—" : orders.length}
              valueSub="всего"
              onClick={() => onNavigate("orders")}
            />

            <NavCard
              icon="Hammer" color="#f59e0b" bg="#fffbeb" border="#fde68a"
              title="Изготовление"
              subtitle="Этапы, задачи, процесс"
              value={loading ? "—" : ordersInWork}
              valueSub="в работе"
              onClick={() => onNavigate("production")}
            />

            <NavCard
              icon="Scissors" color="#6366f1" bg="#eef2ff" border="#c7d2fe"
              title="Заготовки"
              subtitle="Нарезка, смены, учёт"
              value={loading ? "—" : activeShiftsCount}
              valueSub="активных смен"
              onClick={() => onNavigate("cutting")}
            />

            <NavCard
              icon="Package" color="#8b5cf6" bg="#f5f3ff" border="#ddd6fe"
              title="Склад"
              subtitle="Сырьё, заготовки, наличие"
              value={loading ? "—" : money(totalStock)}
              onClick={() => onNavigate("warehouse")}
            />

            <NavCard
              icon="Users" color="#0ea5e9" bg="#f0f9ff" border="#bae6fd"
              title="Заказчики"
              subtitle="База клиентов"
              value={loading ? "—" : "→"}
              onClick={() => onNavigate("clients")}
            />

            <NavCard
              icon="BarChart2" color="#10b981" bg="#ecfdf5" border="#a7f3d0"
              title="Аналитика"
              subtitle="Отчёты и статистика"
              value={loading ? "—" : "→"}
              onClick={() => onNavigate("analytics")}
            />

          </div>
        </div>

      </div>
    </div>
  );
}