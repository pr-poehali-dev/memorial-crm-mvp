import { useState } from "react";
import Icon from "@/components/ui/icon";

type Period = "week" | "month" | "year";

const DATA: Record<Period, {
  labels: string[];
  revenue: number[];
  orders: number[];
  totalRevenue: number;
  totalOrders: number;
  avgCheck: number;
  debt: number;
  profit: number;
  deltaRevenue: string;
  deltaOrders: string;
  deltaCheck: string;
}> = {
  week: {
    labels: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    revenue: [42000, 18000, 67000, 31000, 54000, 0, 22000],
    orders:  [3, 1, 5, 2, 4, 0, 2],
    totalRevenue: 234000, totalOrders: 17, avgCheck: 13765, debt: 68500, profit: 81900,
    deltaRevenue: "+8%", deltaOrders: "+2", deltaCheck: "+5%",
  },
  month: {
    labels: ["Окт", "Ноя", "Дек", "Янв", "Фев", "Мар", "Апр"],
    revenue: [185000, 210000, 195000, 220000, 198000, 265000, 284000],
    orders:  [12, 15, 13, 17, 14, 19, 24],
    totalRevenue: 1557000, totalOrders: 114, avgCheck: 13658, debt: 123500, profit: 544950,
    deltaRevenue: "+53%", deltaOrders: "+33%", deltaCheck: "+15%",
  },
  year: {
    labels: ["2020", "2021", "2022", "2023", "2024", "2025", "2026"],
    revenue: [820000, 1050000, 1340000, 1580000, 1820000, 2150000, 1557000],
    orders:  [58, 74, 96, 112, 130, 156, 114],
    totalRevenue: 10317000, totalOrders: 740, avgCheck: 13943, debt: 123500, profit: 3610950,
    deltaRevenue: "+18%", deltaOrders: "+20%", deltaCheck: "+4%",
  },
};

const problems = [
  { icon: "AlertTriangle", color: "#ef4444", bg: "#fef2f2", border: "#fecaca", label: "Просроченных заказов", value: "3", hint: "МП-0035, МП-0033, МП-0040" },
  { icon: "CreditCard",    color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", label: "Долг клиентов",         value: "8",  hint: "На 123 500 ₽" },
  { icon: "AlertOctagon",  color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe", label: "Узкое место",           value: "Гравировка", hint: "2 просрочки, 3 заказа" },
  { icon: "Package",       color: "#ec4899", bg: "#fdf2f8", border: "#f9a8d4", label: "Критичных материалов",  value: "3",  hint: "Мрамор белый и др." },
];

const topClients = [
  { name: "Иванов П.К.",   total: 148000, orders: 4, color: "#6366f1" },
  { name: "Смирнова А.В.", total: 94500,  orders: 3, color: "#22c55e" },
  { name: "Петрова О.Н.",  total: 87000,  orders: 2, color: "#f59e0b" },
  { name: "Морозова Т.И.", total: 68000,  orders: 2, color: "#ec4899" },
  { name: "Белова Е.С.",   total: 35000,  orders: 1, color: "#14b8a6" },
];

const stones = [
  { name: "Гранит чёрный (габбро)", pct: 42, count: 48, color: "#1a1a1a" },
  { name: "Гранит серый",           pct: 23, count: 26, color: "#6b6b6b" },
  { name: "Мрамор белый",           pct: 15, count: 17, color: "#b5b5b5" },
  { name: "Гранит красный",         pct: 12, count: 14, color: "#e97676" },
  { name: "Прочие",                 pct: 8,  count: 9,  color: "#d5d5d5" },
];

const deficitMaterials = [
  { name: "Мрамор белый",           free: 0.4,  min: 4,  unit: "м²" },
  { name: "Гранит красный",         free: 0.1,  min: 5,  unit: "м²" },
  { name: "Полировальная паста",    free: 3.5,  min: 5,  unit: "кг" },
];

const productionStats = [
  { label: "Среднее время заказа",      value: "11 дней",       icon: "Clock",         color: "#6b6b6b" },
  { label: "Самый загруженный этап",    value: "Гравировка",    icon: "AlertOctagon",  color: "#f59e0b" },
  { label: "Задержек за месяц",         value: "5",             icon: "AlertTriangle", color: "#ef4444" },
  { label: "В производстве сейчас",    value: "9 изделий",     icon: "Hammer",        color: "#6366f1" },
];

function BarChart({ labels, values, color, unit }: { labels: string[]; values: number[]; color: string; unit: string }) {
  const max = Math.max(...values);
  const [tooltip, setTooltip] = useState<number | null>(null);
  return (
    <div className="flex items-end gap-1.5 h-[120px]">
      {values.map((v, i) => (
        <div key={labels[i]} className="flex-1 flex flex-col items-center gap-1.5 h-full relative"
          onMouseEnter={() => setTooltip(i)} onMouseLeave={() => setTooltip(null)}>
          {tooltip === i && v > 0 && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap z-10 pointer-events-none">
              {unit === "₽" ? `${(v/1000).toFixed(0)} тыс.` : v}
            </div>
          )}
          <div className="w-full flex items-end flex-1">
            <div className="w-full rounded-t-[3px] transition-all duration-200"
              style={{
                height: max > 0 ? `${(v / max) * 100}%` : "0%",
                backgroundColor: i === values.length - 1 ? color : "#f0f0f0",
                minHeight: v > 0 ? "3px" : "0px",
              }} />
          </div>
          <span className="text-[9px] text-[#c5c5c5] leading-none">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("month");
  const d = DATA[period];
  const maxClient = topClients[0].total;

  return (
    <div className="p-7 max-w-[1100px] mx-auto w-full space-y-5">

      {/* Header + Period filter */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[21px] font-semibold text-[#1a1a1a] tracking-tight">Аналитика</h1>
          <p className="text-[13px] text-[#9b9b9b] mt-0.5">Данные по производству памятников</p>
        </div>
        <div className="flex gap-1 bg-white border border-[#ebebeb] rounded-[8px] p-1">
          {(["week", "month", "year"] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
                ${period === p ? "bg-[#1a1a1a] text-white shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}>
              {p === "week" ? "Неделя" : p === "month" ? "Месяц" : "Год"}
            </button>
          ))}
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Выручка",    value: `${(d.totalRevenue/1000).toFixed(0)} тыс. ₽`, delta: d.deltaRevenue, up: true,  icon: "TrendingUp",    color: "#6366f1" },
          { label: "Заказов",    value: String(d.totalOrders),                          delta: d.deltaOrders,  up: true,  icon: "FileText",      color: "#22c55e" },
          { label: "Средний чек",value: `${d.avgCheck.toLocaleString("ru")} ₽`,        delta: d.deltaCheck,   up: true,  icon: "BarChart2",     color: "#f59e0b" },
          { label: "Долги",      value: `${(d.debt/1000).toFixed(0)} тыс. ₽`,          delta: "8 клиентов",   up: false, icon: "CreditCard",    color: "#ef4444" },
          { label: "~Прибыль",   value: `${(d.profit/1000).toFixed(0)} тыс. ₽`,        delta: "~35% маржа",   up: true,  icon: "Wallet",        color: "#14b8a6" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#ebebeb] rounded-xl p-4 hover:border-[#d5d5d5] transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "18" }}>
                <Icon name={s.icon as never} size={13} style={{ color: s.color }} />
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${s.up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                {s.delta}
              </span>
            </div>
            <p className="text-[20px] font-bold text-[#1a1a1a] leading-none mb-1 tracking-tight">{s.value}</p>
            <p className="text-[11px] text-[#9b9b9b] font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Problems */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Icon name="AlertCircle" size={14} className="text-[#9b9b9b]" />
          <p className="text-[12px] font-semibold text-[#9b9b9b] uppercase tracking-wide">Требует внимания</p>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {problems.map((p) => (
            <div key={p.label} className="border rounded-xl p-4 cursor-pointer hover:shadow-sm transition-all"
              style={{ backgroundColor: p.bg, borderColor: p.border }}>
              <div className="flex items-start justify-between gap-1 mb-2">
                <Icon name={p.icon as never} size={14} style={{ color: p.color }} />
                <span className="text-[20px] font-bold leading-none" style={{ color: p.color }}>{p.value}</span>
              </div>
              <p className="text-[12px] font-semibold mb-0.5" style={{ color: p.color }}>{p.label}</p>
              <p className="text-[11px] text-[#6b6b6b] leading-snug">{p.hint}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[13px] font-semibold text-[#1a1a1a]">Выручка</h3>
              <p className="text-[11px] text-[#9b9b9b] mt-0.5">{d.deltaRevenue} к предыдущему периоду</p>
            </div>
            <span className="text-[18px] font-bold text-[#1a1a1a]">{(d.totalRevenue/1000).toFixed(0)} тыс.</span>
          </div>
          <BarChart labels={d.labels} values={d.revenue} color="#1a1a1a" unit="₽" />
        </div>

        <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[13px] font-semibold text-[#1a1a1a]">Заказы</h3>
              <p className="text-[11px] text-[#9b9b9b] mt-0.5">{d.deltaOrders} к предыдущему периоду</p>
            </div>
            <span className="text-[18px] font-bold text-[#6366f1]">{d.totalOrders}</span>
          </div>
          <BarChart labels={d.labels} values={d.orders} color="#6366f1" unit="шт" />
        </div>
      </div>

      {/* Production + Top clients */}
      <div className="grid grid-cols-[1fr_320px] gap-4">

        {/* Production block */}
        <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Hammer" size={14} className="text-[#9b9b9b]" />
            <h3 className="text-[13px] font-semibold text-[#1a1a1a]">Производство</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {productionStats.map((s) => (
              <div key={s.label} className="flex items-center gap-3 p-3 bg-[#fafafa] rounded-xl border border-[#f0f0f0]">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + "18" }}>
                  <Icon name={s.icon as never} size={13} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#1a1a1a] leading-none mb-0.5">{s.value}</p>
                  <p className="text-[10px] text-[#9b9b9b]">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stage load */}
          <div>
            <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-3">Загрузка этапов</p>
            <div className="space-y-2.5">
              {[
                { name: "Эскиз",      val: 2, max: 5, color: "#6366f1" },
                { name: "Распил",     val: 2, max: 5, color: "#f59e0b" },
                { name: "Гравировка", val: 3, max: 5, color: "#ec4899", hot: true },
                { name: "Полировка",  val: 2, max: 5, color: "#14b8a6" },
                { name: "Готов",      val: 2, max: 5, color: "#22c55e" },
              ].map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-[90px] shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="text-[12px] text-[#6b6b6b]">{s.name}</span>
                  </div>
                  <div className="flex-1 h-2 bg-[#f5f5f5] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${(s.val/s.max)*100}%`, backgroundColor: s.color }} />
                  </div>
                  <div className="flex items-center gap-1.5 w-10 shrink-0">
                    <span className="text-[12px] font-semibold text-[#1a1a1a]">{s.val}</span>
                    {s.hot && <span className="text-[9px] bg-amber-100 text-amber-600 px-1 py-px rounded font-bold">!</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top clients */}
        <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Users" size={14} className="text-[#9b9b9b]" />
            <h3 className="text-[13px] font-semibold text-[#1a1a1a]">Топ клиентов</h3>
          </div>
          <div className="space-y-3 mb-5">
            {topClients.map((c, i) => (
              <div key={c.name} className="flex items-center gap-3">
                <span className="text-[12px] font-bold text-[#c5c5c5] w-4 shrink-0">{i + 1}</span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                  style={{ backgroundColor: c.color }}>
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[#1a1a1a] truncate">{c.name}</p>
                  <div className="mt-1 h-1 bg-[#f5f5f5] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(c.total/maxClient)*100}%`, backgroundColor: c.color }} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[12px] font-semibold text-[#1a1a1a]">{(c.total/1000).toFixed(0)} тыс.</p>
                  <p className="text-[10px] text-[#b5b5b5]">{c.orders} зак.</p>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-[#f5f5f5]">
            <div className="flex justify-between text-[12px] mb-1">
              <span className="text-[#9b9b9b]">Активных клиентов</span>
              <span className="font-semibold text-[#1a1a1a]">4 из 7</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-[#9b9b9b]">Повторных заказов</span>
              <span className="font-semibold text-[#22c55e]">57%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Materials */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="BarChart2" size={14} className="text-[#9b9b9b]" />
            <h3 className="text-[13px] font-semibold text-[#1a1a1a]">Популярные материалы</h3>
          </div>
          <div className="space-y-3">
            {stones.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-[12px] text-[#4b4b4b] flex-1">{s.name}</span>
                <div className="w-[100px] h-1.5 bg-[#f5f5f5] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                </div>
                <span className="text-[11px] font-semibold text-[#9b9b9b] w-8 text-right">{s.pct}%</span>
                <span className="text-[11px] text-[#b5b5b5] w-12 text-right">{s.count} шт.</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Package" size={14} className="text-[#9b9b9b]" />
            <h3 className="text-[13px] font-semibold text-[#1a1a1a]">Дефицитные материалы</h3>
          </div>
          <div className="space-y-3">
            {deficitMaterials.map((m) => {
              const pct = Math.min(100, (m.free / m.min) * 100);
              return (
                <div key={m.name} className="p-3 rounded-xl border border-red-100 bg-red-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] font-semibold text-[#1a1a1a]">{m.name}</span>
                    <span className="text-[11px] font-bold text-red-500">{m.free} {m.unit}</span>
                  </div>
                  <div className="h-1.5 bg-red-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[10px] text-red-400 mt-1">Минимум: {m.min} {m.unit} · осталось {Math.round(pct)}%</p>
                </div>
              );
            })}
          </div>
          <button className="mt-4 w-full flex items-center justify-center gap-2 text-[12px] text-[#6b6b6b] border border-dashed border-[#e0e0e0] hover:border-[#c5c5c5] py-2.5 rounded-[8px] transition-colors">
            <Icon name="ShoppingCart" size={12} />Создать заявку на закупку
          </button>
        </div>
      </div>
    </div>
  );
}
