import { useEffect, useRef } from "react";

type Props = { onStart: () => void };

const Arrow = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7l3 3 6-6" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(18px)";
    el.style.transition = `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`;
    const timer = setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 60);
    return () => clearTimeout(timer);
  }, [delay]);
  return <div ref={ref} className={className}>{children}</div>;
}

function ScrollFade({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(22px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
        obs.disconnect();
      }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}

/* ─── Mockup карточки ─── */
function MockupDashboard() {
  return (
    <div className="relative w-full max-w-[480px] mx-auto select-none pointer-events-none" style={{ height: 320 }}>
      {/* Основная карточка */}
      <div className="absolute inset-0 bg-white rounded-2xl border border-[#e8e8e8] shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* Шапка */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f2f2f2]">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-[#1a1a1a]">Производство</span>
            <span className="text-[10px] bg-[#f5f5f5] text-[#9b9b9b] px-2 py-0.5 rounded-full">9 заказов</span>
          </div>
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-[#f0f0f0]" />
            <span className="w-2 h-2 rounded-full bg-[#f0f0f0]" />
            <span className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
          </div>
        </div>
        {/* Строки */}
        <div className="px-5 py-3 flex flex-col gap-2.5">
          {[
            { id: "МП-0041", client: "Смирнова А.В.", status: "Распил", color: "#f59e0b", amount: "38 500 ₽", paid: "paid" },
            { id: "МП-0040", client: "Козлов И.Д.", status: "Эскиз", color: "#6366f1", amount: "22 000 ₽", paid: "unpaid" },
            { id: "МП-0039", client: "Петрова О.Н.", status: "Готов", color: "#22c55e", amount: "54 000 ₽", paid: "paid" },
            { id: "МП-0038", client: "Фёдоров С.С.", status: "Гравировка", color: "#ec4899", amount: "31 000 ₽", paid: "partial" },
          ].map((r) => (
            <div key={r.id} className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-[#9b9b9b] w-[60px] shrink-0">{r.id}</span>
              <span className="text-[12px] text-[#1a1a1a] flex-1 truncate">{r.client}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: r.color + "18", color: r.color }}>{r.status}</span>
              <span className="text-[12px] font-semibold text-[#1a1a1a] w-[72px] text-right shrink-0">{r.amount}</span>
            </div>
          ))}
        </div>
        {/* Итог */}
        <div className="mx-5 mt-1 border-t border-[#f5f5f5] pt-2.5 flex justify-between items-center">
          <span className="text-[11px] text-[#9b9b9b]">Итого за апрель</span>
          <span className="text-[13px] font-bold text-[#1a1a1a]">267 000 ₽</span>
        </div>
      </div>

      {/* Плавающая карточка — склад */}
      <div className="absolute -right-6 top-6 bg-white rounded-xl border border-[#e8e8e8] shadow-[0_4px_24px_rgba(0,0,0,0.10)] px-4 py-3 w-[150px]">
        <p className="text-[10px] text-[#9b9b9b] mb-1.5">Камень на складе</p>
        <p className="text-[20px] font-bold text-[#1a1a1a] leading-none">4.2 м³</p>
        <p className="text-[10px] text-[#f59e0b] mt-1 font-medium">↓ списано 0.8 м³</p>
      </div>

      {/* Плавающая карточка — прибыль */}
      <div className="absolute -left-5 bottom-10 bg-white rounded-xl border border-[#e8e8e8] shadow-[0_4px_24px_rgba(0,0,0,0.10)] px-4 py-3 w-[140px]">
        <p className="text-[10px] text-[#9b9b9b] mb-1.5">Прибыль</p>
        <p className="text-[20px] font-bold text-[#1a1a1a] leading-none">127 400 ₽</p>
        <p className="text-[10px] text-[#22c55e] mt-1 font-medium">↑ +18% к марту</p>
      </div>
    </div>
  );
}

export default function LandingPage({ onStart }: Props) {
  return (
    <div className="min-h-screen flex flex-col font-golos" style={{ background: "linear-gradient(160deg, #f8f8f8 0%, #ffffff 50%, #f5f5f7 100%)" }}>

      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-[#ebebeb] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <span className="text-[15px] font-bold text-[#1a1a1a] tracking-[0.07em]">ПАМЯТЬ</span>
        <div className="flex items-center gap-6">
          <span className="text-[12px] text-[#9b9b9b]">Подходит для мастерских и производств</span>
          <button
            onClick={onStart}
            className="text-[13px] font-medium text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
          >
            Войти
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="px-8 pt-20 pb-16 max-w-[1100px] mx-auto w-full">
        <div className="grid grid-cols-[1fr_1fr] gap-16 items-center">

          {/* Левая часть */}
          <div>
            <FadeIn delay={0}>
              <div className="inline-flex items-center gap-2 bg-white border border-[#ebebeb] text-[#6b6b6b] text-[12px] font-medium px-3.5 py-1.5 rounded-full mb-7 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                CRM для производства памятников
              </div>
            </FadeIn>

            <FadeIn delay={80}>
              <h1 className="text-[42px] font-bold text-[#1a1a1a] leading-[1.1] tracking-[-0.025em] mb-5">
                Вы теряете деньги<br />
                на камне и заказах —<br />
                <span className="text-[#9b9b9b]">даже не замечая</span>
              </h1>
            </FadeIn>

            <FadeIn delay={160}>
              <p className="text-[16px] text-[#6b6b6b] leading-[1.65] mb-8 max-w-[400px]">
                Система «ПАМЯТЬ» показывает реальную прибыль, контролирует производство и остатки материалов в одном месте.
              </p>
            </FadeIn>

            <FadeIn delay={240}>
              <div className="flex items-center gap-3">
                <button
                  onClick={onStart}
                  className="inline-flex items-center gap-2.5 bg-[#1a1a1a] text-white text-[14px] font-semibold px-6 py-3 rounded-[10px] hover:bg-[#333] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_2px_12px_rgba(0,0,0,0.18)]"
                >
                  Показать демо
                  <Arrow />
                </button>
                <button
                  onClick={onStart}
                  className="inline-flex items-center gap-2 text-[14px] font-medium text-[#4a4a4a] px-5 py-3 rounded-[10px] border border-[#e8e8e8] bg-white hover:border-[#c8c8c8] transition-all"
                >
                  Как работает
                </button>
              </div>
              <p className="text-[12px] text-[#b5b5b5] mt-4">Покажем на вашем примере за 15 минут</p>
            </FadeIn>
          </div>

          {/* Правая часть — mockup */}
          <FadeIn delay={200} className="hidden lg:block">
            <MockupDashboard />
          </FadeIn>
        </div>
      </main>

      {/* Feature strip */}
      <section className="border-y border-[#ebebeb] py-6 px-8 bg-white">
        <div className="max-w-[800px] mx-auto grid grid-cols-4 gap-6 text-center">
          {[
            { icon: "📋", label: "Заказы и сметы" },
            { icon: "🏭", label: "Производство" },
            { icon: "📦", label: "Склад камня" },
            { icon: "📊", label: "Аналитика" },
          ].map((f) => (
            <div key={f.label} className="flex flex-col items-center gap-1.5">
              <span className="text-[20px]">{f.icon}</span>
              <span className="text-[12px] text-[#9b9b9b] font-medium">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Problems */}
      <ScrollFade>
        <section className="py-20 px-8">
          <div className="max-w-[720px] mx-auto">
            <p className="text-[11px] text-[#9b9b9b] font-semibold uppercase tracking-[0.12em] mb-3 text-center">Знакомо?</p>
            <h2 className="text-[28px] font-bold text-[#1a1a1a] text-center tracking-tight mb-10">Типичные проблемы в производстве</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "🪨", text: "Не понятно, сколько камня осталось" },
                { icon: "📌", text: "Заказы теряются или задерживаются" },
                { icon: "💸", text: "Прибыль считается примерно" },
                { icon: "🔗", text: "Склад и производство не связаны" },
              ].map((p) => (
                <div
                  key={p.text}
                  className="flex items-start gap-3.5 bg-white border border-[#ebebeb] rounded-2xl px-5 py-4 hover:border-[#d0d0d0] hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all cursor-default"
                >
                  <span className="text-[20px] shrink-0 mt-0.5">{p.icon}</span>
                  <span className="text-[14px] text-[#3a3a3a] leading-snug">{p.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollFade>

      {/* Solution */}
      <ScrollFade>
        <section className="py-20 px-8 bg-[#fafafa] border-y border-[#ebebeb]">
          <div className="max-w-[720px] mx-auto">
            <p className="text-[11px] text-[#9b9b9b] font-semibold uppercase tracking-[0.12em] mb-3 text-center">Решение</p>
            <h2 className="text-[28px] font-bold text-[#1a1a1a] text-center tracking-tight mb-10">Система «ПАМЯТЬ» даёт контроль</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                "Видите остатки и списание материалов",
                "Контролируете каждый заказ в реальном времени",
                "Понимаете реальную прибыль по каждому заказу",
                "Убираете хаос в производстве",
              ].map((text) => (
                <div
                  key={text}
                  className="flex items-start gap-3.5 bg-white border border-[#ebebeb] rounded-2xl px-5 py-4 hover:border-[#22c55e]/30 hover:shadow-[0_2px_12px_rgba(34,197,94,0.07)] transition-all cursor-default"
                >
                  <div className="w-5 h-5 rounded-full bg-[#f0fdf4] border border-[#dcfce7] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckIcon />
                  </div>
                  <span className="text-[14px] text-[#1a1a1a] leading-snug">{text}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <button
                onClick={onStart}
                className="inline-flex items-center gap-2.5 bg-[#1a1a1a] text-white text-[14px] font-semibold px-7 py-3 rounded-[10px] hover:bg-[#333] transition-all shadow-[0_2px_12px_rgba(0,0,0,0.15)]"
              >
                Показать демо
                <Arrow />
              </button>
            </div>
          </div>
        </section>
      </ScrollFade>

      {/* How it works */}
      <ScrollFade>
        <section className="py-20 px-8">
          <div className="max-w-[720px] mx-auto">
            <p className="text-[11px] text-[#9b9b9b] font-semibold uppercase tracking-[0.12em] mb-3 text-center">Процесс</p>
            <h2 className="text-[28px] font-bold text-[#1a1a1a] text-center tracking-tight mb-12">Как это работает</h2>
            <div className="relative grid grid-cols-4 gap-4">
              {/* Линия */}
              <div className="absolute top-5 left-[12.5%] right-[12.5%] h-px bg-[#e8e8e8]" />
              {[
                { n: "1", label: "Добавляете заказ", sub: "клиент, размер, камень" },
                { n: "2", label: "Система считает смету", sub: "материалы, работа, прибыль" },
                { n: "3", label: "Контролируете производство", sub: "этапы, сроки, исполнители" },
                { n: "4", label: "Видите прибыль и остатки", sub: "по каждому заказу" },
              ].map((s) => (
                <div key={s.n} className="flex flex-col items-center text-center gap-3 relative">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-[#1a1a1a] flex items-center justify-center text-[14px] font-bold text-[#1a1a1a] z-10 shadow-sm">
                    {s.n}
                  </div>
                  <span className="text-[13px] font-semibold text-[#1a1a1a] leading-snug">{s.label}</span>
                  <span className="text-[11px] text-[#9b9b9b] leading-snug">{s.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollFade>

      {/* Pricing */}
      <ScrollFade>
        <section className="py-20 px-8 bg-[#fafafa] border-y border-[#ebebeb]">
          <div className="max-w-[640px] mx-auto">
            <p className="text-[11px] text-[#9b9b9b] font-semibold uppercase tracking-[0.12em] mb-3 text-center">Тарифы</p>
            <h2 className="text-[28px] font-bold text-[#1a1a1a] text-center tracking-tight mb-10">Выберите подходящий план</h2>
            <div className="grid grid-cols-2 gap-5">

              {/* Basic */}
              <div className="bg-white border border-[#e8e8e8] rounded-2xl p-7 flex flex-col gap-5 hover:border-[#c8c8c8] hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-all">
                <div>
                  <p className="text-[11px] font-semibold text-[#9b9b9b] uppercase tracking-[0.1em] mb-2">Базовый</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[32px] font-bold text-[#1a1a1a] leading-none">30 000</span>
                    <span className="text-[16px] font-semibold text-[#1a1a1a]">₽</span>
                  </div>
                  <p className="text-[12px] text-[#9b9b9b] mt-1">в месяц</p>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {["Заказы и клиенты", "Сметы", "Базовый склад", "Производство"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[13px] text-[#4a4a4a]">
                      <span className="w-4 h-4 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9b9b9b]" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onStart}
                  className="mt-auto w-full text-center text-[13px] font-semibold border border-[#1a1a1a] text-[#1a1a1a] rounded-[9px] py-2.5 hover:bg-[#1a1a1a] hover:text-white transition-all"
                >
                  Показать демо
                </button>
              </div>

              {/* Full */}
              <div className="bg-[#1a1a1a] rounded-2xl p-7 flex flex-col gap-5 relative overflow-hidden hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all">
                <div className="absolute top-4 right-4 bg-[#22c55e] text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide">
                  РЕКОМЕНДУЕМ
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-[#6b6b6b] uppercase tracking-[0.1em] mb-2">Полный</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[32px] font-bold text-white leading-none">80 000</span>
                    <span className="text-[16px] font-semibold text-white">₽</span>
                  </div>
                  <p className="text-[12px] text-[#6b6b6b] mt-1">в месяц</p>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {["Всё из базового", "Учёт камня и партий", "Себестоимость и прибыль", "Аналитика"].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[13px] text-[#d5d5d5]">
                      <div className="w-4 h-4 rounded-full bg-[#22c55e]/15 flex items-center justify-center shrink-0">
                        <CheckIcon />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onStart}
                  className="mt-auto w-full text-center text-[13px] font-semibold bg-white text-[#1a1a1a] rounded-[9px] py-2.5 hover:bg-[#f0f0f0] transition-all"
                >
                  Показать демо
                </button>
              </div>

            </div>
          </div>
        </section>
      </ScrollFade>

      {/* Final CTA */}
      <ScrollFade>
        <section className="py-20 px-8 text-center">
          <div className="max-w-[480px] mx-auto">
            <h2 className="text-[32px] font-bold text-[#1a1a1a] tracking-tight mb-3 leading-[1.15]">Готовы навести порядок?</h2>
            <p className="text-[15px] text-[#6b6b6b] mb-8">Покажем систему на вашем примере за 15 минут</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onStart}
                className="inline-flex items-center gap-2.5 bg-[#1a1a1a] text-white text-[15px] font-semibold px-8 py-3.5 rounded-[10px] hover:bg-[#333] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_2px_16px_rgba(0,0,0,0.18)]"
              >
                Показать демо
                <Arrow />
              </button>
            </div>
            <p className="text-[12px] text-[#c5c5c5] mt-4">Подходит для мастерских и производств памятников</p>
          </div>
        </section>
      </ScrollFade>

      {/* Footer */}
      <footer className="px-8 py-5 border-t border-[#f0f0f0] flex items-center justify-between bg-white">
        <span className="text-[12px] text-[#c5c5c5] font-semibold tracking-[0.05em]">ПАМЯТЬ</span>
        <span className="text-[12px] text-[#c5c5c5]">© 2026</span>
      </footer>
    </div>
  );
}
