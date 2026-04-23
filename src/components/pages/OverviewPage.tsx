import Icon from "@/components/ui/icon";

const stats = [
  {
    label: "Активных заказов",
    value: "24",
    sub: "+3 за неделю",
    icon: "FileText",
    trend: "+14%",
    trendUp: true,
    detail: "8 ожидают предоплаты",
  },
  {
    label: "В производстве",
    value: "11",
    sub: "из 24 заказов",
    icon: "Hammer",
    trend: "46%",
    trendUp: true,
    detail: "2 просрочены",
  },
  {
    label: "Готово к выдаче",
    value: "5",
    sub: "ожидают клиентов",
    icon: "CheckCircle",
    trend: "3 дня",
    trendUp: false,
    detail: "средний срок ожидания",
  },
  {
    label: "Выручка (апрель)",
    value: "284 000 ₽",
    sub: "план: 320 000 ₽",
    icon: "TrendingUp",
    trend: "+12%",
    trendUp: true,
    detail: "к прошлому месяцу",
  },
];

const alerts = [
  { icon: "AlertTriangle", color: "#ef4444", bg: "#fef2f2", border: "#fecaca", label: "Просроченные заказы", value: "2", desc: "МП-0035, МП-0033 — превышен срок изготовления" },
  { icon: "CreditCard", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", label: "Неоплаченные заказы", value: "8", desc: "На сумму 184 000 ₽ · ожидают аванса" },
  { icon: "Package", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe", label: "Низкий остаток материалов", value: "3", desc: "Гранит красный, Мрамор белый, Гранит серый" },
];

const recentOrders = [
  { id: "МП-0041", client: "Смирнова А.В.", stone: "Гранит чёрный", size: "100×50×8", status: "Производство", statusColor: "#f59e0b", price: "38 500 ₽", manager: "Олег К." },
  { id: "МП-0040", client: "Козлов И.Д.", stone: "Мрамор белый", size: "80×40×6", status: "Эскиз", statusColor: "#6366f1", price: "22 000 ₽", manager: "Анна М." },
  { id: "МП-0039", client: "Петрова О.Н.", stone: "Гранит серый", size: "120×60×10", status: "Готов", statusColor: "#22c55e", price: "54 000 ₽", manager: "Олег К." },
  { id: "МП-0038", client: "Фёдоров С.С.", stone: "Гранит красный", size: "90×45×7", status: "Доставка", statusColor: "#3b82f6", price: "31 000 ₽", manager: "Игорь В." },
  { id: "МП-0037", client: "Иванов П.К.", stone: "Гранит чёрный", size: "100×50×8", status: "Выдан", statusColor: "#9b9b9b", price: "41 000 ₽", manager: "Анна М." },
  { id: "МП-0036", client: "Морозова Т.И.", stone: "Гранит габбро", size: "110×55×8", status: "Производство", statusColor: "#f59e0b", price: "46 000 ₽", manager: "Олег К." },
];

const warehouse = [
  { name: "Гранит чёрный", qty: 14.5, max: 20, unit: "м²", ok: true },
  { name: "Гранит серый", qty: 3.1, max: 15, unit: "м²", ok: false },
  { name: "Мрамор белый", qty: 2.4, max: 12, unit: "м²", ok: false },
  { name: "Гранит габбро", qty: 9.0, max: 15, unit: "м²", ok: true },
  { name: "Гранит красный", qty: 1.2, max: 10, unit: "м²", ok: false },
];

const production = [
  { id: "МП-0035", client: "Лебедев К.А.", stage: "Гравировка", overdue: 3, manager: "Игорь В." },
  { id: "МП-0033", client: "Семёнов Д.О.", stage: "Полировка", overdue: 1, manager: "Олег К." },
];

const chartData = [
  { month: "Окт", value: 185 },
  { month: "Ноя", value: 210 },
  { month: "Дек", value: 195 },
  { month: "Янв", value: 220 },
  { month: "Фев", value: 198 },
  { month: "Мар", value: 265 },
  { month: "Апр", value: 284 },
];
const chartMax = Math.max(...chartData.map((d) => d.value));

const quickActions = [
  { label: "Создать заказ", icon: "Plus", primary: true },
  { label: "Добавить клиента", icon: "UserPlus", primary: false },
  { label: "Калькулятор сметы", icon: "Calculator", primary: false },
];

export default function OverviewPage() {
  return (
    <div className="p-7 max-w-[1200px] space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[21px] font-semibold text-[#1a1a1a] tracking-tight">Обзор</h1>
          <p className="text-[13px] text-[#9b9b9b] mt-0.5">Апрель 2026 · МемориалCRM</p>
        </div>
        <div className="flex gap-2">
          {quickActions.map((a) => (
            <button
              key={a.label}
              className={`flex items-center gap-2 text-[13px] px-3.5 py-2 rounded-[8px] transition-colors
                ${a.primary
                  ? "bg-[#1a1a1a] text-white hover:bg-[#333]"
                  : "bg-white border border-[#e5e5e5] text-[#4b4b4b] hover:border-[#c5c5c5] hover:bg-[#fafafa]"
                }`}
            >
              <Icon name={a.icon as never} size={14} />
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-[#ebebeb] rounded-xl p-5 hover:border-[#d5d5d5] transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#f5f5f5] flex items-center justify-center">
                <Icon name={s.icon as never} size={15} className="text-[#6b6b6b]" />
              </div>
              <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${s.trendUp ? "text-[#16a34a] bg-[#f0fdf4]" : "text-[#9b9b9b] bg-[#f5f5f5]"}`}>
                {s.trend}
              </span>
            </div>
            <p className="text-[27px] font-semibold text-[#1a1a1a] leading-none mb-1.5 tracking-tight">{s.value}</p>
            <p className="text-[12px] text-[#6b6b6b] font-medium mb-0.5">{s.label}</p>
            <p className="text-[11px] text-[#b5b5b5]">{s.detail}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      <div>
        <p className="text-[12px] font-semibold text-[#9b9b9b] uppercase tracking-wide mb-3">Требует внимания</p>
        <div className="grid grid-cols-3 gap-3">
          {alerts.map((a) => (
            <div key={a.label} className="border rounded-xl p-4 cursor-pointer hover:shadow-sm transition-all" style={{ backgroundColor: a.bg, borderColor: a.border }}>
              <div className="flex items-center gap-2.5 mb-2">
                <Icon name={a.icon as never} size={15} style={{ color: a.color }} />
                <span className="text-[13px] font-semibold" style={{ color: a.color }}>{a.label}</span>
                <span className="ml-auto text-[18px] font-bold" style={{ color: a.color }}>{a.value}</span>
              </div>
              <p className="text-[12px] text-[#6b6b6b] leading-snug">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart + Production issues */}
      <div className="grid grid-cols-[1fr_320px] gap-4">
        {/* Chart */}
        <div className="bg-white border border-[#ebebeb] rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[14px] font-semibold text-[#1a1a1a]">Выручка по месяцам</h2>
              <p className="text-[12px] text-[#9b9b9b] mt-0.5">тыс. ₽ · окт 2025 — апр 2026</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[22px] font-semibold text-[#1a1a1a]">284</span>
              <span className="text-[13px] text-[#9b9b9b]">тыс. ₽</span>
            </div>
          </div>
          <div className="flex items-end gap-2.5 h-[120px]">
            {chartData.map((d, i) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5 h-full">
                <div className="w-full flex items-end flex-1">
                  <div
                    className="w-full rounded-t-[5px] transition-all relative group"
                    style={{
                      height: `${(d.value / chartMax) * 100}%`,
                      backgroundColor: i === chartData.length - 1 ? "#1a1a1a" : "#f0f0f0",
                    }}
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[#1a1a1a] text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">
                      {d.value} тыс.
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-[#b5b5b5] leading-none">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Production issues */}
        <div className="bg-white border border-[#ebebeb] rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <h2 className="text-[14px] font-semibold text-[#1a1a1a]">Проблемы в производстве</h2>
          </div>
          <div className="space-y-3 flex-1">
            {production.map((p) => (
              <div key={p.id} className="border border-red-100 bg-red-50 rounded-lg p-3.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[11px] font-semibold text-red-600">{p.id}</span>
                  <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">
                    +{p.overdue} дн.
                  </span>
                </div>
                <p className="text-[12px] font-medium text-[#1a1a1a] mb-0.5">{p.client}</p>
                <p className="text-[11px] text-[#9b9b9b]">{p.stage} · {p.manager}</p>
              </div>
            ))}
          </div>
          <button className="mt-4 text-[12px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors flex items-center gap-1.5">
            <Icon name="ArrowRight" size={12} />
            Перейти в производство
          </button>
        </div>
      </div>

      {/* Orders + Warehouse */}
      <div className="grid grid-cols-[1fr_280px] gap-4">
        {/* Recent orders */}
        <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#f5f5f5] flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-[#1a1a1a]">Последние заказы</h2>
            <button className="text-[12px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors flex items-center gap-1">
              Все заказы <Icon name="ChevronRight" size={12} />
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f5f5f5]">
                {["Номер", "Клиент", "Материал", "Размер", "Статус", "Сумма", "Менеджер"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o, i) => (
                <tr
                  key={o.id}
                  className={`hover:bg-[#fafafa] cursor-pointer transition-colors ${i < recentOrders.length - 1 ? "border-b border-[#f8f8f8]" : ""}`}
                >
                  <td className="px-4 py-3 text-[12px] font-mono text-[#1a1a1a] font-semibold">{o.id}</td>
                  <td className="px-4 py-3 text-[12px] text-[#1a1a1a]">{o.client}</td>
                  <td className="px-4 py-3 text-[12px] text-[#6b6b6b]">{o.stone}</td>
                  <td className="px-4 py-3 text-[12px] font-mono text-[#9b9b9b]">{o.size}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: o.statusColor }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: o.statusColor }} />
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] font-semibold text-[#1a1a1a]">{o.price}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] bg-[#f5f5f5] text-[#6b6b6b] px-2 py-0.5 rounded-md font-medium">{o.manager}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Warehouse */}
        <div className="bg-white border border-[#ebebeb] rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-semibold text-[#1a1a1a]">Склад</h2>
            <button className="text-[12px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
              <Icon name="ChevronRight" size={14} />
            </button>
          </div>
          <div className="space-y-3.5 flex-1">
            {warehouse.map((w) => {
              const pct = Math.min(100, (w.qty / w.max) * 100);
              return (
                <div key={w.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-[#3b3b3b] font-medium">{w.name}</span>
                    <span className={`text-[12px] font-semibold ${w.ok ? "text-[#6b6b6b]" : "text-red-500"}`}>
                      {w.qty} {w.unit}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: w.ok ? "#d1d5db" : "#fca5a5",
                      }}
                    />
                  </div>
                  {!w.ok && (
                    <p className="text-[10px] text-red-400 mt-0.5">Ниже минимума</p>
                  )}
                </div>
              );
            })}
          </div>
          <button className="mt-4 text-[12px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors flex items-center gap-1.5">
            <Icon name="Package" size={12} />
            Управление складом
          </button>
        </div>
      </div>
    </div>
  );
}
