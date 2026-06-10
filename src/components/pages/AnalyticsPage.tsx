import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import LoadingScreen from "@/components/ui/LoadingScreen";
import DateRangePicker from "@/components/ui/DateRangePicker";
import { ordersApi, DbOrderStats } from "@/api/client";

type Period = "week" | "month" | "year" | "custom";

const COLORS = ["#2563eb", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6", "#ef4444"];

function BarChart({ labels, values, color, unit }: { labels: string[]; values: number[]; color: string; unit: string }) {
  const max = Math.max(...values, 1);
  const [tooltip, setTooltip] = useState<number | null>(null);
  return (
    <div className="flex items-end gap-1.5 h-[120px]">
      {values.map((v, i) => (
        <div key={labels[i]} className="flex-1 flex flex-col items-center gap-1.5 h-full relative"
          onMouseEnter={() => setTooltip(i)} onMouseLeave={() => setTooltip(null)}>
          {tooltip === i && v > 0 && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap z-10 pointer-events-none">
              {unit === "₽" ? `${(v / 1000).toFixed(0)} тыс.` : v}
            </div>
          )}
          <div className="w-full flex items-end flex-1">
            <div className="w-full rounded-t-[3px] transition-all duration-200"
              style={{
                height: `${(v / max) * 100}%`,
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
  const [period,    setPeriod]    = useState<Period>("month");
  const [stats,     setStats]     = useState<DbOrderStats | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo,   setCustomTo]   = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);

  /* Закрывать попап при клике снаружи */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (period === "custom" && (!customFrom || !customTo)) return;
    setLoading(true);
    ordersApi.stats(period, customFrom || undefined, customTo || undefined)
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [period, customFrom, customTo]);

  /* Метка периода для отображения */
  const periodLabel = period === "custom" && customFrom && customTo
    ? `${customFrom.split("-").reverse().join(".")} — ${customTo.split("-").reverse().join(".")}`
    : null;

  const d = stats;
  const totals = d?.totals;
  const chart  = d?.chart ?? [];
  const topClients = d?.topClients ?? [];
  const stones = d?.stones ?? [];
  const deficit = d?.deficit ?? [];

  const totalRevenue = Number(totals?.total_revenue ?? 0);
  const totalOrders  = Number(totals?.total_orders ?? 0);
  const avgCheck     = Number(totals?.avg_check ?? 0);
  const totalDebt    = Number(totals?.total_debt ?? 0);
  const profit       = totalRevenue * 0.35;
  const overdueCount = Number(totals?.overdue_count ?? 0);
  const unpaidCount  = Number(totals?.unpaid_count ?? 0);
  const inProd       = d?.inProduction ?? 0;

  const maxClient = topClients[0]?.total ?? 1;

  return (
    <div className="p-7 max-w-[1100px] mx-auto w-full space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[21px] font-semibold text-[#1a1a1a] tracking-tight">Аналитика</h1>
          <p className="text-[13px] text-[#9b9b9b] mt-0.5">Данные по производству памятников</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Кнопки быстрого периода */}
          <div className="flex gap-1 bg-white border border-[#ebebeb] rounded-[8px] p-1">
            {(["week", "month", "year"] as const).map((p) => (
              <button key={p} onClick={() => { setPeriod(p); setShowPicker(false); }}
                className={`px-3.5 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
                  ${period === p ? "bg-[#1a1a1a] text-white shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}>
                {p === "week" ? "Неделя" : p === "month" ? "Месяц" : "Год"}
              </button>
            ))}
          </div>

          {/* Кнопка «Период» с попапом */}
          <div ref={pickerRef} className="relative">
            <button
              onClick={() => setShowPicker(v => !v)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-[12px] font-medium border transition-all ${
                period === "custom"
                  ? "bg-brand text-white border-brand"
                  : showPicker
                  ? "border-brand text-brand bg-brand-subtle"
                  : "bg-white border-[#ebebeb] text-[#6b6b6b] hover:text-[#1a1a1a]"
              }`}
            >
              <Icon name="CalendarRange" size={13} />
              {period === "custom" && periodLabel ? periodLabel : "Период"}
              {period === "custom" && (
                <button
                  onClick={e => { e.stopPropagation(); setPeriod("month"); setCustomFrom(""); setCustomTo(""); }}
                  className="ml-1 opacity-70 hover:opacity-100"
                >
                  <Icon name="X" size={11} />
                </button>
              )}
            </button>

            {showPicker && (
              <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-[#e8e8e8] rounded-2xl shadow-2xl p-4 w-[280px]">
                <p className="text-[11px] font-bold text-[#9b9b9b] uppercase tracking-wide mb-3">Выберите период</p>
                <DateRangePicker
                  from={customFrom}
                  to={customTo}
                  onChange={(f, t) => {
                    setCustomFrom(f);
                    setCustomTo(t);
                    if (f && t) {
                      setPeriod("custom");
                      setShowPicker(false);
                    }
                  }}
                />
                {(!customFrom || !customTo) && (
                  <p className="text-[11px] text-[#b5b5b5] mt-3 text-center">
                    Выберите начало и конец периода
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingScreen text="Загружаем аналитику" />
      ) : (
        <>
          {/* Top metrics */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: "Выручка",    value: `${(totalRevenue/1000).toFixed(0)} тыс. ₽`, delta: `${totalOrders} заказов`,  up: true,  icon: "TrendingUp",  color: "#2563eb" },
              { label: "Заказов",    value: String(totalOrders),                          delta: `ср. чек ${Math.round(avgCheck/1000)}к ₽`, up: true, icon: "FileText", color: "#22c55e" },
              { label: "Средний чек",value: `${Math.round(avgCheck).toLocaleString("ru")} ₽`, delta: "по всем заказам", up: true, icon: "BarChart2", color: "#f59e0b" },
              { label: "Долги",      value: `${(totalDebt/1000).toFixed(0)} тыс. ₽`,    delta: `${unpaidCount} без оплаты`, up: false, icon: "CreditCard", color: "#ef4444" },
              { label: "~Прибыль",   value: `${(profit/1000).toFixed(0)} тыс. ₽`,        delta: "~35% маржа",            up: true,  icon: "Wallet",      color: "#14b8a6" },
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

          {/* Требует внимания */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Icon name="AlertCircle" size={14} className="text-[#9b9b9b]" />
              <p className="text-[12px] font-semibold text-[#9b9b9b] uppercase tracking-wide">Требует внимания</p>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: "AlertTriangle", color: "#ef4444", bg: "#fef2f2", border: "#fecaca", label: "Просроченных заказов", value: String(overdueCount) },
                { icon: "CreditCard",    color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", label: "Долг клиентов",         value: `${(totalDebt/1000).toFixed(0)} тыс. ₽` },
                { icon: "Package",       color: "#ec4899", bg: "#fdf2f8", border: "#f9a8d4", label: "Дефицит материалов",    value: String(deficit.length) },
                { icon: "Hammer",        color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", label: "В производстве",        value: String(inProd) },
              ].map((p) => (
                <div key={p.label} className="border rounded-xl p-4 cursor-pointer hover:shadow-sm transition-all"
                  style={{ backgroundColor: p.bg, borderColor: p.border }}>
                  <div className="flex items-start justify-between gap-1 mb-2">
                    <Icon name={p.icon as never} size={14} style={{ color: p.color }} />
                    <span className="text-[20px] font-bold leading-none" style={{ color: p.color }}>{p.value}</span>
                  </div>
                  <p className="text-[12px] font-semibold" style={{ color: p.color }}>{p.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Графики */}
          <div className="grid grid-cols-2 gap-4">

            {/* Выручка */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-semibold text-[#1a1a1a]">Выручка</p>
                <span className="text-[11px] text-[#9b9b9b]">{period === "week" ? "по дням" : period === "month" ? "по месяцам" : period === "year" ? "по годам" : "по дням"}</span>
              </div>
              {chart.length > 0 ? (
                <BarChart
                  labels={chart.map(r => r.label)}
                  values={chart.map(r => Number(r.revenue))}
                  color="#2563eb"
                  unit="₽"
                />
              ) : (
                <div className="h-[120px] flex items-center justify-center text-[12px] text-[#c5c5c5]">Нет данных</div>
              )}
            </div>

            {/* Заказы */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-semibold text-[#1a1a1a]">Заказы</p>
                <span className="text-[11px] text-[#9b9b9b]">количество</span>
              </div>
              {chart.length > 0 ? (
                <BarChart
                  labels={chart.map(r => r.label)}
                  values={chart.map(r => Number(r.orders_count))}
                  color="#22c55e"
                  unit="шт"
                />
              ) : (
                <div className="h-[120px] flex items-center justify-center text-[12px] text-[#c5c5c5]">Нет данных</div>
              )}
            </div>
          </div>

          {/* Нижний блок */}
          <div className="grid grid-cols-3 gap-4">

            {/* Топ клиенты */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <p className="text-[13px] font-semibold text-[#1a1a1a] mb-4">Топ клиентов</p>
              {topClients.length === 0 ? (
                <p className="text-[12px] text-[#c5c5c5]">Нет данных</p>
              ) : (
                <div className="space-y-3">
                  {topClients.map((c, i) => (
                    <div key={c.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                            style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                            {i + 1}
                          </div>
                          <span className="text-[12px] text-[#1a1a1a] truncate max-w-[100px]">{c.name}</span>
                        </div>
                        <span className="text-[12px] font-semibold text-[#1a1a1a] shrink-0">
                          {(Number(c.total) / 1000).toFixed(0)} тыс.
                        </span>
                      </div>
                      <div className="h-1 bg-[#f0f0f0] rounded-full overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{ width: `${(Number(c.total) / maxClient) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Материалы */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <p className="text-[13px] font-semibold text-[#1a1a1a] mb-4">Материалы в заказах</p>
              {stones.length === 0 ? (
                <p className="text-[12px] text-[#c5c5c5]">Нет данных</p>
              ) : (
                <div className="space-y-2.5">
                  {stones.map((s, i) => (
                    <div key={s.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] text-[#1a1a1a] truncate">{s.name}</span>
                          <span className="text-[11px] text-[#6b6b6b] shrink-0 ml-2">{s.pct}%</span>
                        </div>
                        <div className="h-1 bg-[#f0f0f0] rounded-full mt-1 overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Дефицит материалов */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <p className="text-[13px] font-semibold text-[#1a1a1a] mb-4">Дефицит материалов</p>
              {deficit.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Icon name="CheckCircle2" size={22} className="text-[#22c55e] mb-2" />
                  <p className="text-[12px] text-[#9b9b9b]">Всё в норме</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {deficit.map((m) => (
                    <div key={m.name} className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-[#1a1a1a] truncate">{m.name}</p>
                        <p className="text-[11px] text-[#9b9b9b]">
                          {m.free} {m.unit} / мин. {m.min} {m.unit}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md shrink-0">
                        −{(m.min - m.free).toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}