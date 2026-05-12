import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Arrow, CheckIcon, FadeIn, ScrollFade } from "./LandingShared";
import { MockupHero, MockupOrders, MockupWarehouse, MockupProduction, MockupAnalytics } from "./LandingMockups";

type OnStart = { onStart: () => void };

/* ── Nav ── */
export function LandingNav({ onStart }: OnStart) {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white/90 backdrop-blur-sm sticky top-0 z-50 border-b border-[#ebebeb]">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-[#1a1a1a] rounded-[7px] flex items-center justify-center">
          <span className="text-white text-[10px] font-bold tracking-wide">М</span>
        </div>
        <span className="text-[14px] font-bold text-[#1a1a1a] tracking-[0.04em]">ПАМЯТЬ</span>
      </div>
      <nav className="hidden md:flex items-center gap-7">
        {["Возможности", "Как работает", "Цены", "FAQ"].map(item => (
          <span key={item} className="text-[13px] text-[#6b6b6b] hover:text-[#1a1a1a] cursor-pointer transition-colors">{item}</span>
        ))}
      </nav>
      <button
        onClick={onStart}
        className="text-[13px] font-semibold bg-[#1a1a1a] text-white px-5 py-2 rounded-[8px] hover:bg-[#333] transition-all"
      >
        Войти
      </button>
    </header>
  );
}

/* ── Hero ── */
export function LandingHero({ onStart }: OnStart) {
  return (
    <section className="pt-20 pb-16 px-8 max-w-[1100px] mx-auto w-full">
      <div className="grid grid-cols-[1fr_1.1fr] gap-14 items-center">
        <div>
          <FadeIn delay={0}>
            <div className="inline-flex items-center gap-2 bg-white border border-[#ebebeb] text-[#6b6b6b] text-[11px] font-medium px-3 py-1.5 rounded-full mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
              CRM для производства памятников
            </div>
          </FadeIn>
          <FadeIn delay={80}>
            <h1 className="text-[44px] font-bold text-[#1a1a1a] leading-[1.08] tracking-[-0.03em] mb-5">
              Превратите хаос<br />
              в производстве<br />
              <span className="text-[#9b9b9b]">в чёткий контроль</span>
            </h1>
          </FadeIn>
          <FadeIn delay={160}>
            <p className="text-[15px] text-[#6b6b6b] leading-[1.65] mb-8 max-w-[380px]">
              Система «ПАМЯТЬ» ведёт заказы, считает расход материалов и показывает реальную прибыль — всё в одном месте.
            </p>
          </FadeIn>
          <FadeIn delay={240}>
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={onStart}
                className="inline-flex items-center gap-2.5 bg-[#1a1a1a] text-white text-[14px] font-semibold px-6 py-3 rounded-[10px] hover:bg-[#333] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_2px_12px_rgba(0,0,0,0.2)]"
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
            <p className="text-[12px] text-[#b5b5b5]">Без кредитной карты · Покажем за 15 минут</p>
          </FadeIn>
        </div>
        <FadeIn delay={200} className="hidden lg:block">
          <MockupHero />
        </FadeIn>
      </div>
    </section>
  );
}

/* ── Логотипы (доверие) ── */
export function LandingTrustedBy() {
  return (
    <section className="py-5 px-8 bg-white border-y border-[#ebebeb]">
      <div className="max-w-[900px] mx-auto">
        <p className="text-[11px] text-[#c5c5c5] text-center mb-4 font-medium tracking-wide uppercase">Используют мастерские и производства по всей России</p>
        <div className="flex items-center justify-center gap-10 flex-wrap">
          {["Гранит-Сервис", "МемориалПро", "КаменьМастер", "СтоунВерк", "ГравюрА"].map(name => (
            <span key={name} className="text-[13px] font-semibold text-[#c8c8c8] tracking-wide">{name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Features ── */
export function LandingFeatures() {
  return (
    <ScrollFade>
      <section className="py-20 px-8 max-w-[1100px] mx-auto w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 bg-white border border-[#ebebeb] text-[#9b9b9b] text-[11px] font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
            <Icon name="Sparkles" size={11} />
            Возможности
          </div>
          <h2 className="text-[32px] font-bold text-[#1a1a1a] tracking-tight mb-3">Всё для управления производством</h2>
          <p className="text-[15px] text-[#6b6b6b] max-w-[480px] mx-auto">Заказы, материалы, этапы производства и аналитика — в одной системе.</p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-[#e8e8e8] p-6 hover:shadow-[0_4px_24px_rgba(0,0,0,0.07)] hover:border-[#d0d0d0] transition-all">
            <div className="mb-5"><MockupOrders /></div>
            <div className="w-8 h-8 bg-[#f5f5f5] rounded-[8px] flex items-center justify-center mb-3">
              <Icon name="ClipboardList" size={16} className="text-[#1a1a1a]" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#1a1a1a] mb-1.5">Заказы и клиенты</h3>
            <p className="text-[13px] text-[#6b6b6b] leading-relaxed">Ведите все заказы в одном месте. Статусы, сроки, история изменений — всё под рукой.</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e8e8e8] p-6 hover:shadow-[0_4px_24px_rgba(0,0,0,0.07)] hover:border-[#d0d0d0] transition-all">
            <div className="mb-5"><MockupWarehouse /></div>
            <div className="w-8 h-8 bg-[#f5f5f5] rounded-[8px] flex items-center justify-center mb-3">
              <Icon name="Package" size={16} className="text-[#1a1a1a]" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#1a1a1a] mb-1.5">Склад материалов</h3>
            <p className="text-[13px] text-[#6b6b6b] leading-relaxed">Учёт остатков камня по партиям. Автоматическое списание при создании заказа и предупреждения о нехватке.</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e8e8e8] p-6 hover:shadow-[0_4px_24px_rgba(0,0,0,0.07)] hover:border-[#d0d0d0] transition-all">
            <div className="mb-5"><MockupProduction /></div>
            <div className="w-8 h-8 bg-[#f5f5f5] rounded-[8px] flex items-center justify-center mb-3">
              <Icon name="Factory" size={16} className="text-[#1a1a1a]" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#1a1a1a] mb-1.5">Контроль производства</h3>
            <p className="text-[13px] text-[#6b6b6b] leading-relaxed">Отслеживайте каждый этап: от замера до готового изделия. Назначайте исполнителей и контролируйте сроки.</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#e8e8e8] p-6 hover:shadow-[0_4px_24px_rgba(0,0,0,0.07)] hover:border-[#d0d0d0] transition-all">
            <div className="mb-5"><MockupAnalytics /></div>
            <div className="w-8 h-8 bg-[#f5f5f5] rounded-[8px] flex items-center justify-center mb-3">
              <Icon name="BarChart2" size={16} className="text-[#1a1a1a]" />
            </div>
            <h3 className="text-[15px] font-semibold text-[#1a1a1a] mb-1.5">Аналитика и прибыль</h3>
            <p className="text-[13px] text-[#6b6b6b] leading-relaxed">Выручка, себестоимость и маржа по каждому заказу. Видите реальную прибыль, а не примерную.</p>
          </div>
        </div>
      </section>
    </ScrollFade>
  );
}

/* ── How it works ── */
export function LandingHowItWorks() {
  return (
    <ScrollFade>
      <section className="py-20 px-8 bg-white border-y border-[#ebebeb]">
        <div className="max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 bg-[#f5f5f5] text-[#9b9b9b] text-[11px] font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
              <Icon name="Play" size={10} />
              Как работает
            </div>
            <h2 className="text-[32px] font-bold text-[#1a1a1a] tracking-tight mb-3">Запустите за 3 шага</h2>
            <p className="text-[15px] text-[#6b6b6b]">Простой старт без долгого обучения</p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {[
              {
                n: "01",
                title: "Добавьте первый заказ",
                desc: "Укажите клиента, размеры, материал и стоимость. Система сама рассчитает смету и расход камня.",
                mockup: (
                  <div className="bg-[#f8f8f8] rounded-xl border border-[#ebebeb] p-3 text-left">
                    <p className="text-[10px] text-[#9b9b9b] mb-2">Новый заказ</p>
                    <div className="flex flex-col gap-1.5">
                      {["Клиент: Смирнова А.В.", "Стела 120×60", "Гранит чёрный"].map(l => (
                        <div key={l} className="bg-white border border-[#ebebeb] rounded-[6px] px-2.5 py-1.5">
                          <span className="text-[10px] text-[#3a3a3a]">{l}</span>
                        </div>
                      ))}
                      <div className="bg-[#1a1a1a] text-white text-center text-[10px] font-semibold py-1.5 rounded-[6px] mt-1">Создать заказ</div>
                    </div>
                  </div>
                ),
              },
              {
                n: "02",
                title: "Управляйте производством",
                desc: "Переводите заказы по этапам: замер, эскиз, распил, гравировка. Назначайте исполнителей.",
                mockup: (
                  <div className="bg-[#f8f8f8] rounded-xl border border-[#ebebeb] p-3 text-left">
                    <p className="text-[10px] text-[#9b9b9b] mb-2">Этапы МП-0041</p>
                    <div className="flex flex-col gap-1">
                      {[
                        { label: "Замер", done: true },
                        { label: "Эскиз", done: true },
                        { label: "Распил", done: false, active: true },
                        { label: "Гравировка", done: false },
                      ].map(s => (
                        <div key={s.label} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] ${s.active ? "bg-[#1a1a1a]" : "bg-white border border-[#ebebeb]"}`}>
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${s.done ? "bg-[#1a1a1a]" : s.active ? "bg-white/20 border border-white/40" : "bg-[#f0f0f0] border border-[#e0e0e0]"}`}>
                            {s.done && <CheckIcon />}
                          </div>
                          <span className={`text-[10px] font-medium ${s.active ? "text-white" : s.done ? "text-[#9b9b9b] line-through" : "text-[#3a3a3a]"}`}>{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                n: "03",
                title: "Смотрите прибыль",
                desc: "Видите выручку, себестоимость и маржу. По каждому заказу и сводно за любой период.",
                mockup: (
                  <div className="bg-[#f8f8f8] rounded-xl border border-[#ebebeb] p-3 text-left">
                    <p className="text-[10px] text-[#9b9b9b] mb-2">Итог апрель</p>
                    <div className="flex flex-col gap-1.5">
                      {[
                        { label: "Выручка", val: "267 000 ₽", bold: false },
                        { label: "Себестоимость", val: "141 000 ₽", bold: false },
                        { label: "Прибыль", val: "126 000 ₽", bold: true },
                      ].map(r => (
                        <div key={r.label} className={`flex justify-between px-2.5 py-1.5 rounded-[6px] ${r.bold ? "bg-[#1a1a1a]" : "bg-white border border-[#ebebeb]"}`}>
                          <span className={`text-[10px] ${r.bold ? "text-[#9b9b9b]" : "text-[#6b6b6b]"}`}>{r.label}</span>
                          <span className={`text-[10px] font-bold ${r.bold ? "text-white" : "text-[#1a1a1a]"}`}>{r.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
            ].map((step) => (
              <div key={step.n} className="flex flex-col gap-4">
                <div>{step.mockup}</div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold text-[#b5b5b5] tracking-wide">Шаг {step.n}</span>
                  </div>
                  <h3 className="text-[15px] font-semibold text-[#1a1a1a] mb-1.5">{step.title}</h3>
                  <p className="text-[13px] text-[#6b6b6b] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ScrollFade>
  );
}

/* ── Testimonials ── */
export function LandingTestimonials() {
  return (
    <ScrollFade>
      <section className="py-20 px-8 max-w-[1100px] mx-auto w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 bg-white border border-[#ebebeb] text-[#9b9b9b] text-[11px] font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
            <Icon name="Star" size={11} />
            Отзывы клиентов
          </div>
          <h2 className="text-[32px] font-bold text-[#1a1a1a] tracking-tight mb-3">Говорят владельцы мастерских</h2>
          <p className="text-[15px] text-[#6b6b6b]">Реальные отзывы тех, кто уже работает в системе</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { name: "Александр К.", role: "Мастерская «Гранит»", text: "Раньше всё считали в тетради и Excel. Теперь открываю систему — сразу вижу, сколько заказов в работе и сколько камня осталось." },
            { name: "Ирина М.", role: "СтоунМастер, Казань", text: "Самое ценное — видеть реальную прибыль по каждому заказу. Оказалось, что некоторые заказы были убыточными — мы этого даже не знали." },
            { name: "Сергей Д.", role: "Завод «Мемориал»", text: "Система навела порядок в производстве. Каждый мастер знает свой этап, ничего не теряется. Сроки стали соблюдать на 30% точнее." },
            { name: "Наталья В.", role: "Мастерская «Камень»", text: "Клиенты теперь всегда знают статус своего заказа. Звонков с вопросом «когда будет готово» стало в разы меньше." },
            { name: "Дмитрий П.", role: "ГранитПро, Москва", text: "Внедрили за один день. Всё интуитивно понятно, обучать сотрудников почти не пришлось. Рекомендую всем производствам." },
            { name: "Елена С.", role: "Семейная мастерская", text: "Для небольшой мастерской это просто находка. Наконец-то знаю, сколько реально зарабатываю, а не думаю приблизительно." },
          ].map((t, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#e8e8e8] p-5 hover:border-[#d0d0d0] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all">
              <p className="text-[13px] text-[#3a3a3a] leading-relaxed mb-4">«{t.text}»</p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center shrink-0">
                  <span className="text-[13px] font-semibold text-[#6b6b6b]">{t.name[0]}</span>
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-[#1a1a1a]">{t.name}</p>
                  <p className="text-[11px] text-[#9b9b9b]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </ScrollFade>
  );
}

/* ── Pricing ── */
export function LandingPricing({ onStart }: OnStart) {
  return (
    <ScrollFade>
      <section className="py-20 px-8 bg-white border-y border-[#ebebeb]">
        <div className="max-w-[700px] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 bg-[#f5f5f5] text-[#9b9b9b] text-[11px] font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
              <Icon name="CreditCard" size={11} />
              Тарифы
            </div>
            <h2 className="text-[32px] font-bold text-[#1a1a1a] tracking-tight mb-3">Выберите подходящий план</h2>
            <p className="text-[15px] text-[#6b6b6b]">Гибкие условия для любого масштаба производства</p>
          </div>

          <div className="grid grid-cols-2 gap-5">
            {/* Базовый */}
            <div className="bg-[#fafafa] border border-[#e8e8e8] rounded-2xl p-7 flex flex-col gap-5 hover:border-[#c8c8c8] transition-all">
              <div>
                <p className="text-[11px] font-semibold text-[#9b9b9b] uppercase tracking-[0.1em] mb-3">Базовый</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-[36px] font-bold text-[#1a1a1a] leading-none">30 000</span>
                  <span className="text-[16px] font-semibold text-[#1a1a1a]">₽</span>
                </div>
                <p className="text-[12px] text-[#9b9b9b]">в месяц</p>
              </div>
              <p className="text-[12px] text-[#6b6b6b]">Что включено в базовый план:</p>
              <ul className="flex flex-col gap-2">
                {["Заказы и клиенты", "Сметы и расчёты", "Базовый склад", "Этапы производства"].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-[13px] text-[#3a3a3a]">
                    <span className="w-4 h-4 rounded-full bg-[#ebebeb] flex items-center justify-center shrink-0">
                      <CheckIcon />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={onStart} className="mt-auto w-full text-center text-[13px] font-semibold border border-[#1a1a1a] text-[#1a1a1a] rounded-[10px] py-3 hover:bg-[#1a1a1a] hover:text-white transition-all">
                Показать демо
              </button>
            </div>

            {/* Полный */}
            <div className="bg-[#1a1a1a] rounded-2xl p-7 flex flex-col gap-5 relative overflow-hidden hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)] transition-all">
              <div className="absolute top-5 right-5 bg-white text-[#1a1a1a] text-[9px] font-bold px-2.5 py-1 rounded-full tracking-wide">
                РЕКОМЕНДУЕМ
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#555] uppercase tracking-[0.1em] mb-3">Полный</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-[36px] font-bold text-white leading-none">80 000</span>
                  <span className="text-[16px] font-semibold text-white">₽</span>
                </div>
                <p className="text-[12px] text-[#555]">в месяц</p>
              </div>
              <p className="text-[12px] text-[#555]">Всё из базового, плюс:</p>
              <ul className="flex flex-col gap-2">
                {["Учёт камня по партиям", "Себестоимость и маржа", "Сводная аналитика", "Приоритетная поддержка"].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-[13px] text-[#d5d5d5]">
                    <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-white">
                      <CheckIcon />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={onStart} className="mt-auto w-full text-center text-[13px] font-semibold bg-white text-[#1a1a1a] rounded-[10px] py-3 hover:bg-[#f0f0f0] transition-all">
                Показать демо
              </button>
            </div>
          </div>
        </div>
      </section>
    </ScrollFade>
  );
}

/* ── FAQ ── */
function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(null);
  const items = [
    { q: "Подходит ли система для небольшой мастерской?", a: "Да, система работает как для маленьких мастерских с 1–2 сотрудниками, так и для крупных производств с десятками заказов в месяц." },
    { q: "Нужно ли устанавливать что-то на компьютер?", a: "Нет. Система работает в браузере — открываете с любого устройства. Никакой установки не нужно." },
    { q: "Как происходит учёт камня и материалов?", a: "При создании заказа система автоматически рассчитывает расход материала. Остатки на складе обновляются в реальном времени." },
    { q: "Можно ли попробовать систему перед покупкой?", a: "Да. Нажмите «Показать демо» — мы покажем работу системы на вашем реальном примере за 15 минут." },
    { q: "Как считается прибыль по заказу?", a: "Система учитывает стоимость материала, работу сотрудников и итоговую сумму заказа. Вы видите маржу по каждому заказу и сводно за месяц." },
    { q: "Безопасны ли данные клиентов?", a: "Все данные хранятся на защищённых серверах и доступны только вашей организации. Доступ защищён логином и паролем." },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 max-w-[800px] mx-auto">
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-white border border-[#e8e8e8] rounded-[14px] overflow-hidden hover:border-[#d0d0d0] transition-all cursor-pointer"
          onClick={() => setOpen(open === i ? null : i)}
        >
          <div className="flex items-center justify-between px-5 py-4 gap-3">
            <span className="text-[13px] font-medium text-[#1a1a1a] leading-snug">{item.q}</span>
            <span className={`shrink-0 w-5 h-5 rounded-full border border-[#e8e8e8] flex items-center justify-center transition-all ${open === i ? "bg-[#1a1a1a] border-[#1a1a1a] rotate-45" : ""}`}>
              <Icon name="Plus" size={10} className={open === i ? "text-white" : "text-[#9b9b9b]"} />
            </span>
          </div>
          {open === i && (
            <div className="px-5 pb-4">
              <p className="text-[12px] text-[#6b6b6b] leading-relaxed border-t border-[#f5f5f5] pt-3">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function LandingFAQ() {
  return (
    <ScrollFade>
      <section className="py-20 px-8 max-w-[1100px] mx-auto w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 bg-white border border-[#ebebeb] text-[#9b9b9b] text-[11px] font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
            <Icon name="HelpCircle" size={11} />
            FAQ
          </div>
          <h2 className="text-[32px] font-bold text-[#1a1a1a] tracking-tight mb-3">Часто задаваемые вопросы</h2>
          <p className="text-[15px] text-[#6b6b6b]">Ответы на вопросы перед началом работы</p>
        </div>
        <FAQAccordion />
      </section>
    </ScrollFade>
  );
}

/* ── Final CTA ── */
export function LandingCTA({ onStart }: OnStart) {
  return (
    <ScrollFade>
      <section className="py-16 px-8 mx-8 mb-12 bg-[#1a1a1a] rounded-3xl max-w-[1084px] mx-auto">
        <div className="text-center max-w-[520px] mx-auto">
          <h2 className="text-[36px] font-bold text-white leading-[1.1] tracking-tight mb-4">
            Готовы навести порядок<br />в производстве?
          </h2>
          <p className="text-[15px] text-[#888] mb-8">Покажем систему на вашем примере за 15 минут — без давления и продаж</p>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2.5 bg-white text-[#1a1a1a] text-[14px] font-semibold px-8 py-3.5 rounded-[10px] hover:bg-[#f0f0f0] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Показать демо
            <Arrow />
          </button>
          <p className="text-[12px] text-[#555] mt-4">Без кредитной карты · Покажем на вашем примере</p>
        </div>
      </section>
    </ScrollFade>
  );
}

/* ── Footer ── */
export function LandingFooter() {
  return (
    <footer className="px-8 py-8 border-t border-[#ebebeb] bg-white">
      <div className="max-w-[1100px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#1a1a1a] rounded-[6px] flex items-center justify-center">
            <span className="text-white text-[9px] font-bold">М</span>
          </div>
          <span className="text-[13px] font-bold text-[#1a1a1a] tracking-[0.04em]">ПАМЯТЬ</span>
        </div>
        <div className="flex items-center gap-6">
          {["Возможности", "Тарифы", "FAQ"].map(item => (
            <span key={item} className="text-[12px] text-[#9b9b9b] hover:text-[#1a1a1a] cursor-pointer transition-colors">{item}</span>
          ))}
        </div>
        <span className="text-[12px] text-[#c5c5c5]">© 2026 ПАМЯТЬ</span>
      </div>
    </footer>
  );
}
