type Props = { onStart: () => void };

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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
      <main className="flex flex-col items-center justify-center px-6 text-center pt-20 pb-16">
        <div className="max-w-[580px]">
          <div className="inline-flex items-center gap-2 bg-[#f5f5f5] text-[#6b6b6b] text-[12px] font-medium px-3.5 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            CRM для производства памятников
          </div>

          <h1 className="text-[44px] font-bold text-[#1a1a1a] leading-[1.1] tracking-[-0.03em] mb-6">
            Контроль заказов, производства и камня —<br />
            <span className="text-[#9b9b9b]">в одной системе</span>
          </h1>

          <p className="text-[17px] text-[#6b6b6b] leading-relaxed mb-3 max-w-[440px] mx-auto">
            Перестаньте терять материал, деньги и сроки.<br />
            Система показывает реальную прибыль по каждому заказу.
          </p>

          <div className="flex flex-col items-center gap-4 mt-10">
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2.5 bg-[#1a1a1a] text-white text-[15px] font-semibold px-8 py-3.5 rounded-[10px] hover:bg-[#333] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Показать демо
              <Arrow />
            </button>
            <p className="text-[12px] text-[#c5c5c5]">Покажем систему на вашем примере за 15 минут</p>
          </div>
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

      {/* Problems */}
      <section className="border-t border-[#f0f0f0] py-16 px-8">
        <div className="max-w-[640px] mx-auto">
          <p className="text-[12px] text-[#9b9b9b] font-medium uppercase tracking-widest mb-6 text-center">Знакомо?</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              "Не понятно, сколько камня осталось",
              "Заказы теряются или задерживаются",
              "Прибыль считается примерно",
              "Склад и производство не связаны",
            ].map((text) => (
              <div key={text} className="flex items-start gap-3 bg-[#fafafa] border border-[#f0f0f0] rounded-xl px-4 py-3.5">
                <span className="text-[#e5e5e5] text-[18px] leading-none mt-0.5">—</span>
                <span className="text-[14px] text-[#4a4a4a] leading-snug">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="border-t border-[#f0f0f0] py-16 px-8 bg-[#fafafa]">
        <div className="max-w-[640px] mx-auto">
          <p className="text-[12px] text-[#9b9b9b] font-medium uppercase tracking-widest mb-6 text-center">Система решает это</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              "Видите остатки и списание материалов",
              "Контролируете каждый заказ",
              "Понимаете реальную прибыль",
              "Убираете хаос в производстве",
            ].map((text) => (
              <div key={text} className="flex items-start gap-3 bg-white border border-[#f0f0f0] rounded-xl px-4 py-3.5">
                <span className="text-[#22c55e] text-[16px] leading-none mt-0.5 font-bold">✔</span>
                <span className="text-[14px] text-[#1a1a1a] leading-snug">{text}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2.5 bg-[#1a1a1a] text-white text-[14px] font-semibold px-7 py-3 rounded-[10px] hover:bg-[#333] transition-all"
            >
              Показать демо
              <Arrow />
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-[#f0f0f0] py-16 px-8">
        <div className="max-w-[640px] mx-auto">
          <p className="text-[12px] text-[#9b9b9b] font-medium uppercase tracking-widest mb-10 text-center">Как это работает</p>
          <div className="grid grid-cols-4 gap-4">
            {[
              { n: "1", label: "Добавляете заказ" },
              { n: "2", label: "Система считает смету" },
              { n: "3", label: "Контролируете производство" },
              { n: "4", label: "Видите прибыль и остатки" },
            ].map((s) => (
              <div key={s.n} className="flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center text-[15px] font-bold text-[#1a1a1a]">
                  {s.n}
                </div>
                <span className="text-[13px] text-[#4a4a4a] leading-snug">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-[#f0f0f0] py-16 px-8 bg-[#fafafa]">
        <div className="max-w-[640px] mx-auto">
          <p className="text-[12px] text-[#9b9b9b] font-medium uppercase tracking-widest mb-10 text-center">Тарифы</p>
          <div className="grid grid-cols-2 gap-4">

            {/* Basic */}
            <div className="bg-white border border-[#e8e8e8] rounded-2xl p-6 flex flex-col gap-4">
              <div>
                <p className="text-[13px] font-semibold text-[#6b6b6b] uppercase tracking-wider mb-1">Базовый</p>
                <p className="text-[28px] font-bold text-[#1a1a1a] leading-none">30 000 ₽</p>
                <p className="text-[12px] text-[#9b9b9b] mt-1">в месяц</p>
              </div>
              <ul className="flex flex-col gap-2">
                {["Заказы и клиенты", "Сметы", "Базовый склад", "Производство"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-[#4a4a4a]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onStart}
                className="mt-auto w-full text-center text-[13px] font-semibold border border-[#1a1a1a] text-[#1a1a1a] rounded-[8px] py-2.5 hover:bg-[#1a1a1a] hover:text-white transition-all"
              >
                Показать демо
              </button>
            </div>

            {/* Full */}
            <div className="bg-[#1a1a1a] border border-[#1a1a1a] rounded-2xl p-6 flex flex-col gap-4">
              <div>
                <p className="text-[13px] font-semibold text-[#9b9b9b] uppercase tracking-wider mb-1">Полный</p>
                <p className="text-[28px] font-bold text-white leading-none">80 000 ₽</p>
                <p className="text-[12px] text-[#6b6b6b] mt-1">в месяц</p>
              </div>
              <ul className="flex flex-col gap-2">
                {["Всё из базового", "Учёт камня и партий", "Себестоимость и прибыль", "Аналитика"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-[#d5d5d5]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={onStart}
                className="mt-auto w-full text-center text-[13px] font-semibold bg-white text-[#1a1a1a] rounded-[8px] py-2.5 hover:bg-[#f0f0f0] transition-all"
              >
                Показать демо
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-[#f0f0f0] py-16 px-8 text-center">
        <div className="max-w-[480px] mx-auto">
          <h2 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight mb-3">Готовы навести порядок?</h2>
          <p className="text-[15px] text-[#6b6b6b] mb-8">Покажем систему на вашем примере за 15 минут</p>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2.5 bg-[#1a1a1a] text-white text-[15px] font-semibold px-8 py-3.5 rounded-[10px] hover:bg-[#333] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Показать демо
            <Arrow />
          </button>
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
