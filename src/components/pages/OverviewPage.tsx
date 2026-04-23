const stats = [
  { label: "Активных заказов", value: "24", sub: "+3 за неделю", color: "#1a1a1a" },
  { label: "В производстве", value: "11", sub: "из 24 заказов", color: "#1a1a1a" },
  { label: "Готово к выдаче", value: "5", sub: "ожидают клиентов", color: "#1a1a1a" },
  { label: "Выручка (месяц)", value: "₽ 284 000", sub: "+12% к прошлому", color: "#1a1a1a" },
];

const recentOrders = [
  { id: "МП-0041", client: "Смирнова А.В.", stone: "Гранит чёрный", size: "100×50×8", status: "Производство", statusColor: "#f59e0b" },
  { id: "МП-0040", client: "Козлов И.Д.", stone: "Мрамор белый", size: "80×40×6", status: "Эскиз", statusColor: "#6366f1" },
  { id: "МП-0039", client: "Петрова О.Н.", stone: "Гранит серый", size: "120×60×10", status: "Готов", statusColor: "#22c55e" },
  { id: "МП-0038", client: "Фёдоров С.С.", stone: "Гранит красный", size: "90×45×7", status: "Доставка", statusColor: "#3b82f6" },
  { id: "МП-0037", client: "Иванов П.К.", stone: "Гранит чёрный", size: "100×50×8", status: "Готов", statusColor: "#22c55e" },
];

export default function OverviewPage() {
  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-[22px] font-semibold text-[#1a1a1a] tracking-tight">Обзор</h1>
        <p className="text-[13px] text-[#9b9b9b] mt-0.5">Апрель 2026 · Производство памятников</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-[#ebebeb] rounded-xl p-5">
            <p className="text-[12px] text-[#9b9b9b] mb-2 uppercase tracking-wide font-medium">{s.label}</p>
            <p className="text-[26px] font-semibold text-[#1a1a1a] leading-none mb-1.5">{s.value}</p>
            <p className="text-[12px] text-[#b5b5b5]">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#ebebeb] flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-[#1a1a1a]">Последние заказы</h2>
          <span className="text-[12px] text-[#9b9b9b]">5 из 24</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f5f5f5]">
              {["Номер", "Клиент", "Камень", "Размер (см)", "Статус"].map((h) => (
                <th key={h} className="px-6 py-3 text-left text-[11px] font-medium text-[#9b9b9b] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o, i) => (
              <tr key={o.id} className={`hover:bg-[#fafafa] transition-colors ${i < recentOrders.length - 1 ? "border-b border-[#f5f5f5]" : ""}`}>
                <td className="px-6 py-3.5 text-[13px] font-mono text-[#1a1a1a] font-medium">{o.id}</td>
                <td className="px-6 py-3.5 text-[13px] text-[#1a1a1a]">{o.client}</td>
                <td className="px-6 py-3.5 text-[13px] text-[#6b6b6b]">{o.stone}</td>
                <td className="px-6 py-3.5 text-[13px] text-[#6b6b6b] font-mono">{o.size}</td>
                <td className="px-6 py-3.5">
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-medium" style={{ color: o.statusColor }}>
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: o.statusColor }} />
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
