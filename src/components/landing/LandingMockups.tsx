/* ─── Mockup: Дашборд заказов ─── */
export function MockupOrders() {
  const orders = [
    { id: "МП-0041", client: "Смирнова А.В.", status: "Распил", color: "#f59e0b", amount: "38 500 ₽" },
    { id: "МП-0040", client: "Козлов И.Д.", status: "Эскиз", color: "#6b6b6b", amount: "22 000 ₽" },
    { id: "МП-0039", client: "Петрова О.Н.", status: "Готов", color: "#1a1a1a", amount: "54 000 ₽" },
    { id: "МП-0038", client: "Фёдоров С.С.", status: "Гравировка", color: "#9b9b9b", amount: "31 000 ₽" },
  ];
  return (
    <div className="bg-white rounded-2xl border border-[#e8e8e8] shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden select-none pointer-events-none">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#f2f2f2]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#1a1a1a]">Заказы</span>
          <span className="text-[10px] bg-[#f5f5f5] text-[#9b9b9b] px-1.5 py-0.5 rounded-full">9 активных</span>
        </div>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f0f0f0]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#f0f0f0]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
        </div>
      </div>
      <div className="px-4 py-2.5 flex flex-col gap-2">
        {orders.map(r => (
          <div key={r.id} className="flex items-center gap-2.5">
            <span className="text-[10px] font-mono text-[#b5b5b5] w-[52px] shrink-0">{r.id}</span>
            <span className="text-[11px] text-[#1a1a1a] flex-1 truncate">{r.client}</span>
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 border" style={{ borderColor: r.color + "40", color: r.color, backgroundColor: r.color + "10" }}>{r.status}</span>
            <span className="text-[11px] font-semibold text-[#1a1a1a] w-[60px] text-right shrink-0">{r.amount}</span>
          </div>
        ))}
      </div>
      <div className="mx-4 border-t border-[#f5f5f5] py-2.5 flex justify-between">
        <span className="text-[10px] text-[#b5b5b5]">Итого апрель</span>
        <span className="text-[11px] font-bold text-[#1a1a1a]">267 000 ₽</span>
      </div>
    </div>
  );
}

/* ─── Mockup: Склад ─── */
export function MockupWarehouse() {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e8e8] shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden select-none pointer-events-none">
      <div className="px-4 py-3 border-b border-[#f2f2f2]">
        <span className="text-[11px] font-semibold text-[#1a1a1a]">Склад материалов</span>
      </div>
      <div className="px-4 py-3 flex flex-col gap-3">
        {[
          { name: "Гранит чёрный", qty: "4.2 м²", pct: 72, warn: false },
          { name: "Мрамор белый", qty: "1.1 м²", pct: 18, warn: true },
          { name: "Гранит серый", qty: "6.8 м²", pct: 90, warn: false },
        ].map(m => (
          <div key={m.name}>
            <div className="flex justify-between mb-1">
              <span className="text-[11px] text-[#3a3a3a]">{m.name}</span>
              <span className={`text-[10px] font-semibold ${m.warn ? "text-[#f59e0b]" : "text-[#1a1a1a]"}`}>{m.qty}</span>
            </div>
            <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${m.pct}%`, backgroundColor: m.warn ? "#f59e0b" : "#1a1a1a" }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mx-4 border-t border-[#f5f5f5] py-2.5 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
        <span className="text-[10px] text-[#f59e0b]">Мрамор белый — мало на складе</span>
      </div>
    </div>
  );
}

/* ─── Mockup: Производство ─── */
export function MockupProduction() {
  return (
    <div className="bg-white rounded-2xl border border-[#e8e8e8] shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden select-none pointer-events-none">
      <div className="px-4 py-3 border-b border-[#f2f2f2]">
        <span className="text-[11px] font-semibold text-[#1a1a1a]">Производство</span>
      </div>
      <div className="px-4 py-3 flex flex-col gap-2.5">
        {[
          { stage: "Замер", count: 2, color: "#6b6b6b" },
          { stage: "Эскиз", count: 3, color: "#9b9b9b" },
          { stage: "Распил", count: 4, color: "#f59e0b" },
          { stage: "Гравировка", count: 2, color: "#3a3a3a" },
          { stage: "Готов", count: 5, color: "#1a1a1a" },
        ].map(s => (
          <div key={s.stage} className="flex items-center gap-2.5">
            <span className="text-[10px] text-[#9b9b9b] w-[72px] shrink-0">{s.stage}</span>
            <div className="flex-1 flex gap-1">
              {Array.from({ length: s.count }).map((_, i) => (
                <span key={i} className="h-4 w-4 rounded-[3px]" style={{ backgroundColor: s.color + "20", border: `1px solid ${s.color}40` }} />
              ))}
            </div>
            <span className="text-[10px] font-semibold text-[#1a1a1a]">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Mockup: Аналитика ─── */
export function MockupAnalytics() {
  const bars = [45, 62, 38, 71, 55, 80, 67, 90, 74, 85, 92, 78];
  return (
    <div className="bg-white rounded-2xl border border-[#e8e8e8] shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden select-none pointer-events-none">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#f2f2f2]">
        <span className="text-[11px] font-semibold text-[#1a1a1a]">Выручка по месяцам</span>
        <span className="text-[10px] text-[#22c55e] font-semibold">↑ +18%</span>
      </div>
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-end gap-1.5 h-[64px]">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 rounded-t-sm transition-all" style={{ height: `${h}%`, backgroundColor: i === bars.length - 1 ? "#1a1a1a" : "#e8e8e8" }} />
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-[#c5c5c5]">Янв</span>
          <span className="text-[9px] text-[#c5c5c5]">Дек</span>
        </div>
      </div>
      <div className="mx-4 border-t border-[#f5f5f5] py-2.5 flex gap-4">
        <div>
          <p className="text-[9px] text-[#b5b5b5]">Этот месяц</p>
          <p className="text-[12px] font-bold text-[#1a1a1a]">267 000 ₽</p>
        </div>
        <div>
          <p className="text-[9px] text-[#b5b5b5]">Маржа</p>
          <p className="text-[12px] font-bold text-[#1a1a1a]">47%</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Mockup Hero (большой дашборд) ─── */
export function MockupHero() {
  return (
    <div className="relative w-full select-none pointer-events-none">
      <div className="bg-white rounded-2xl border border-[#e8e8e8] shadow-[0_16px_60px_rgba(0,0,0,0.10)] overflow-hidden">
        {/* Шапка */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#f2f2f2] bg-[#fafafa]">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e8e8e8]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#e8e8e8]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#e8e8e8]" />
          </div>
          <span className="text-[11px] text-[#b5b5b5] ml-2 font-mono">memorial-crm.ru</span>
        </div>
        {/* Контент */}
        <div className="flex">
          {/* Сайдбар */}
          <div className="w-[120px] shrink-0 border-r border-[#f2f2f2] px-3 py-4 flex flex-col gap-1">
            {["Заказы", "Производство", "Склад", "Клиенты", "Аналитика"].map((item, i) => (
              <div key={item} className={`text-[10px] px-2 py-1.5 rounded-[6px] ${i === 0 ? "bg-[#1a1a1a] text-white font-semibold" : "text-[#9b9b9b]"}`}>
                {item}
              </div>
            ))}
          </div>
          {/* Основной контент */}
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[12px] font-semibold text-[#1a1a1a]">Производство</p>
                <p className="text-[10px] text-[#9b9b9b]">9 активных заказов</p>
              </div>
              <div className="bg-[#1a1a1a] text-white text-[10px] font-semibold px-2.5 py-1 rounded-[6px]">+ Заказ</div>
            </div>
            <div className="flex flex-col gap-1.5">
              {[
                { id: "МП-0041", client: "Смирнова А.В.", status: "Распил", color: "#f59e0b", amount: "38 500 ₽" },
                { id: "МП-0040", client: "Козлов И.Д.", status: "Эскиз", color: "#6b6b6b", amount: "22 000 ₽" },
                { id: "МП-0039", client: "Петрова О.Н.", status: "Готов", color: "#22c55e", amount: "54 000 ₽" },
                { id: "МП-0038", client: "Фёдоров С.С.", status: "Гравировка", color: "#9b9b9b", amount: "31 000 ₽" },
              ].map(r => (
                <div key={r.id} className="flex items-center gap-2 bg-[#fafafa] rounded-[6px] px-2.5 py-1.5">
                  <span className="text-[9px] font-mono text-[#b5b5b5] w-[48px] shrink-0">{r.id}</span>
                  <span className="text-[10px] text-[#1a1a1a] flex-1 truncate">{r.client}</span>
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ color: r.color, backgroundColor: r.color + "15" }}>{r.status}</span>
                  <span className="text-[10px] font-bold text-[#1a1a1a] shrink-0">{r.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Плашки */}
      <div className="absolute -right-4 top-12 bg-white rounded-xl border border-[#e8e8e8] shadow-[0_4px_24px_rgba(0,0,0,0.12)] px-3.5 py-2.5 w-[130px]">
        <p className="text-[9px] text-[#9b9b9b] mb-1">Прибыль</p>
        <p className="text-[17px] font-bold text-[#1a1a1a] leading-none">127 400 ₽</p>
        <p className="text-[9px] text-[#22c55e] mt-1 font-medium">↑ +18% к марту</p>
      </div>
      <div className="absolute -left-4 bottom-8 bg-white rounded-xl border border-[#e8e8e8] shadow-[0_4px_24px_rgba(0,0,0,0.12)] px-3.5 py-2.5 w-[120px]">
        <p className="text-[9px] text-[#9b9b9b] mb-1">Камень</p>
        <p className="text-[17px] font-bold text-[#1a1a1a] leading-none">4.2 м²</p>
        <p className="text-[9px] text-[#f59e0b] mt-1 font-medium">↓ 0.8 м² ушло</p>
      </div>
    </div>
  );
}
