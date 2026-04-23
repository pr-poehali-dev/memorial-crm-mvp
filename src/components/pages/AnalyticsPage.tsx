const months = ["Окт", "Ноя", "Дек", "Янв", "Фев", "Мар", "Апр"];
const revenue = [185000, 210000, 195000, 220000, 198000, 265000, 284000];
const ordersCount = [12, 15, 13, 17, 14, 19, 24];

const maxRevenue = Math.max(...revenue);

const stones = [
  { name: "Гранит чёрный", pct: 42, color: "#1a1a1a" },
  { name: "Гранит серый", pct: 23, color: "#6b6b6b" },
  { name: "Мрамор белый", pct: 15, color: "#b5b5b5" },
  { name: "Гранит красный", pct: 12, color: "#e97676" },
  { name: "Прочие", pct: 8, color: "#d5d5d5" },
];

export default function AnalyticsPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#1a1a1a] tracking-tight">Аналитика</h1>
        <p className="text-[13px] text-[#9b9b9b] mt-0.5">Октябрь 2025 — Апрель 2026</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Выручка за 7 мес.", value: "₽ 1 557 000", delta: "+53%" },
          { label: "Заказов за 7 мес.", value: "114", delta: "+33%" },
          { label: "Средний чек", value: "₽ 13 658", delta: "+15%" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-[#ebebeb] rounded-xl p-5">
            <p className="text-[11px] text-[#9b9b9b] uppercase tracking-wide font-medium mb-2">{s.label}</p>
            <p className="text-[24px] font-semibold text-[#1a1a1a] leading-none mb-1">{s.value}</p>
            <p className="text-[12px] text-[#22c55e] font-medium">{s.delta} к прош. году</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-[#ebebeb] rounded-xl p-6">
          <h3 className="text-[13px] font-semibold text-[#1a1a1a] mb-5">Выручка по месяцам</h3>
          <div className="flex items-end gap-2 h-[140px]">
            {revenue.map((v, i) => (
              <div key={months[i]} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex items-end justify-center" style={{ height: "120px" }}>
                  <div
                    className="w-full rounded-t-[4px] transition-all"
                    style={{
                      height: `${(v / maxRevenue) * 120}px`,
                      backgroundColor: i === revenue.length - 1 ? "#1a1a1a" : "#e8e8e8",
                    }}
                  />
                </div>
                <span className="text-[10px] text-[#b5b5b5]">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#ebebeb] rounded-xl p-6">
          <h3 className="text-[13px] font-semibold text-[#1a1a1a] mb-5">Заказов по месяцам</h3>
          <div className="flex items-end gap-2 h-[140px]">
            {ordersCount.map((v, i) => (
              <div key={months[i]} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full flex items-end justify-center" style={{ height: "120px" }}>
                  <div
                    className="w-full rounded-t-[4px] transition-all"
                    style={{
                      height: `${(v / Math.max(...ordersCount)) * 120}px`,
                      backgroundColor: i === ordersCount.length - 1 ? "#6366f1" : "#e8e8e8",
                    }}
                  />
                </div>
                <span className="text-[10px] text-[#b5b5b5]">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#ebebeb] rounded-xl p-6 col-span-2">
          <h3 className="text-[13px] font-semibold text-[#1a1a1a] mb-4">Популярные материалы</h3>
          <div className="space-y-3">
            {stones.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-[13px] text-[#6b6b6b] w-[180px] shrink-0">{s.name}</span>
                <div className="flex-1 h-2 bg-[#f5f5f5] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                </div>
                <span className="text-[12px] font-medium text-[#9b9b9b] w-8 text-right">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
