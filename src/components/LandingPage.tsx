type Props = { onStart: () => void };

export default function LandingPage({ onStart }: Props) {
  return (
    <div className="min-h-screen bg-white flex flex-col font-golos">

      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-[#f0f0f0]">
        <span className="text-[15px] font-bold text-[#1a1a1a] tracking-[0.06em]">ПАМЯТЬ</span>
        <button
          onClick={onStart}
          className="text-[13px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
        >
          Войти
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-[560px]">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-[#f5f5f5] text-[#6b6b6b] text-[12px] font-medium px-3.5 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            CRM для производства памятников
          </div>

          {/* Title */}
          <h1 className="text-[52px] font-bold text-[#1a1a1a] leading-[1.1] tracking-[-0.03em] mb-6">
            СИСТЕМА<br />
            <span className="text-[#9b9b9b]">ПАМЯТЬ</span>
          </h1>

          {/* Description */}
          <p className="text-[17px] text-[#6b6b6b] leading-relaxed mb-10 max-w-[420px] mx-auto">
            Управляйте заказами, производством и клиентами в одном месте. Для небольших мастерских и крупных предприятий.
          </p>

          {/* CTA */}
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2.5 bg-[#1a1a1a] text-white text-[15px] font-semibold px-8 py-3.5 rounded-[10px] hover:bg-[#333] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Начать работу
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <p className="text-[12px] text-[#c5c5c5] mt-4">Бесплатный доступ на 14 дней · Без карты</p>
        </div>
      </main>

      {/* Feature strip */}
      <section className="border-t border-[#f0f0f0] py-8 px-8">
        <div className="max-w-[800px] mx-auto grid grid-cols-4 gap-6 text-center">
          {[
            { icon: "📋", label: "Заказы и сметы" },
            { icon: "🏭", label: "Производство" },
            { icon: "📦", label: "Склад" },
            { icon: "📊", label: "Аналитика" },
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-2">
              <span className="text-[22px]">{f.icon}</span>
              <span className="text-[12px] text-[#9b9b9b] font-medium">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-[#f0f0f0] flex items-center justify-between">
        <span className="text-[12px] text-[#c5c5c5]">© 2026 СИСТЕМА ПАМЯТЬ</span>
        <span className="text-[12px] text-[#c5c5c5]">Версия 1.0 MVP</span>
      </footer>
    </div>
  );
}
