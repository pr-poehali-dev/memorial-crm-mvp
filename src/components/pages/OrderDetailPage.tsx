import { useState } from "react";
import Icon from "@/components/ui/icon";
import StoneCalculator from "./StoneCalculator";
import { LineItem } from "./estimate.types";

const STAGES = ["Эскиз", "Распил", "Гравировка", "Полировка", "Готов", "Выдан"];

const STAGE_ROUTE: Record<string, string> = {
  "Распил":    "Заготовки",
  "Гравировка": "Производство",
  "Полировка":  "Производство",
};

const ORDER = {
  id:           "МП-0041",
  client:       "Смирнова Алла Васильевна",
  phone:        "+7 912 345-67-89",
  stone:        "Гранит чёрный",
  size:         "100×50×8 см",
  design:       "Портрет + орнамент",
  inscription:  "Иванов Пётр Семёнович\n1945–2021",
  deadline:     "28 апреля 2026",
  currentStage: 1,
  status:       "Производство",
  statusColor:  "#f59e0b",
  amount:       38500,
  paid:         15000,
  manager:      "Олег Краснов",
  production:   "Игорь Верещагин",
  estimator:    "Анна Морозова",
  clientComment: "Клиент просил сделать надпись крупнее, портрет — черно-белый, без цветной обработки.",
};

type OrderItem = { id: string; name: string; qty: number; unit: string; price: number; approved: boolean | null; hasCalc: boolean };

const ITEMS: OrderItem[] = [
  { id: "i1", name: "Изготовление памятника", qty: 1, unit: "шт.", price: 22000, approved: true,  hasCalc: true  },
  { id: "i2", name: "Гравировка надписи",     qty: 1, unit: "шт.", price: 6500,  approved: true,  hasCalc: true  },
  { id: "i3", name: "Портретное фото",        qty: 1, unit: "шт.", price: 5000,  approved: null,  hasCalc: false },
  { id: "i4", name: "Доставка и установка",   qty: 1, unit: "шт.", price: 5000,  approved: false, hasCalc: false },
];

const MATERIALS = [
  { name: "Гранит чёрный (габбро)", qty: 0.42, unit: "м²",  written: false },
  { name: "Абразивный диск 230мм",  qty: 2,    unit: "шт.", written: true  },
  { name: "Алмазная фреза",         qty: 1,    unit: "шт.", written: false },
];

const COMMENTS = [
  { author: "Анна М.",   date: "12 апр., 14:32", text: "Эскиз согласован с клиентом, приступаем к распилу." },
  { author: "Игорь В.",  date: "15 апр., 09:10", text: "Материал заготовлен, начали обработку. Срок — 3 дня." },
  { author: "Олег К.",   date: "18 апр., 17:45", text: "Клиент звонил, просит успеть к 25 апреля. Уточнил размер надписи." },
];

const APPROVE_CFG = {
  true:  { label: "Утверждено",       color: "#16a34a", bg: "#f0fdf4" },
  false: { label: "Не утверждено",    color: "#dc2626", bg: "#fef2f2" },
  null:  { label: "Требует расчёта",  color: "#d97706", bg: "#fffbeb" },
};

function Block({ title, icon, children, collapsible = false }: {
  title: string; icon: string; children: React.ReactNode; collapsible?: boolean;
}) {
  const [open, setOpen] = useState(!collapsible);
  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
      <div
        className={`flex items-center gap-2.5 px-5 py-3.5 border-b border-[#f5f5f5] ${collapsible ? "cursor-pointer hover:bg-[#fafafa] transition-colors select-none" : ""}`}
        onClick={collapsible ? () => setOpen(v => !v) : undefined}
      >
        <div className="w-6 h-6 rounded-md bg-[#f4f4f4] flex items-center justify-center shrink-0">
          <Icon name={icon as never} size={12} className="text-[#6b6b6b]" />
        </div>
        <p className="text-[13px] font-semibold text-[#1a1a1a] flex-1">{title}</p>
        {collapsible && (
          <Icon name={open ? "ChevronUp" : "ChevronDown"} size={14} className="text-[#c0c0c0]" />
        )}
      </div>
      {open && <div className="px-5 py-4">{children}</div>}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-[#9b9b9b]">{label}</span>
      <span className="text-[13px] font-medium text-[#1a1a1a]">{value}</span>
    </div>
  );
}

export default function OrderDetailPage({ onBack }: { onBack: () => void }) {
  const [newComment, setNewComment]   = useState("");
  const [comments, setComments]       = useState(COMMENTS);
  const [activeStage, setActiveStage] = useState(ORDER.currentStage);
  const [orderItems, setOrderItems]   = useState<OrderItem[]>(ITEMS);
  const [showCalc, setShowCalc]       = useState(false);
  const [calcItemId, setCalcItemId]   = useState<string | null>(null);

  const openCalcFor = (id: string) => { setCalcItemId(id); setShowCalc(true); };

  const handleCalcResult = (result: LineItem) => {
    if (calcItemId) {
      setOrderItems(prev => prev.map(it =>
        it.id === calcItemId
          ? { ...it, price: result.price, hasCalc: true, approved: null }
          : it
      ));
    }
    setShowCalc(false);
    setCalcItemId(null);
  };

  const debt    = ORDER.amount - ORDER.paid;
  const paidPct = Math.round((ORDER.paid / ORDER.amount) * 100);

  const totalApproved   = orderItems.filter(i => i.approved === true).reduce((s, i) => s + i.qty * i.price, 0);
  const totalUnapproved = orderItems.filter(i => i.approved === false).reduce((s, i) => s + i.qty * i.price, 0);
  const totalPending    = orderItems.filter(i => i.approved === null).reduce((s, i) => s + i.qty * i.price, 0);
  const allApproved     = orderItems.every(i => i.approved === true);

  const currentStageName = STAGES[activeStage];
  const routeTarget      = STAGE_ROUTE[currentStageName];

  const addComment = () => {
    if (!newComment.trim()) return;
    setComments(prev => [...prev, { author: "Олег К.", date: "сейчас", text: newComment.trim() }]);
    setNewComment("");
  };

  return (
    <div className="h-full overflow-y-auto bg-[#fafafa]">
      {showCalc && (
        <StoneCalculator onClose={() => { setShowCalc(false); setCalcItemId(null); }} onAdd={handleCalcResult} />
      )}
      <div className="max-w-[1100px] mx-auto px-6 py-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[13px] text-[#9b9b9b] hover:text-[#1a1a1a] transition-colors"
          >
            <Icon name="ChevronLeft" size={14} />
            Заказы
          </button>
          <span className="text-[#d5d5d5]">/</span>
          <span className="text-[13px] font-semibold text-[#1a1a1a] font-mono">{ORDER.id}</span>
        </div>

        <div className="flex gap-5 items-start">

          {/* ───── ЛЕВАЯ КОЛОНКА ───── */}
          <div className="flex-1 min-w-0 space-y-3">

            {/* ── Шапка заказа ── */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-[12px] font-bold text-[#9b9b9b]">{ORDER.id}</span>
                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                      style={{ color: ORDER.statusColor, backgroundColor: ORDER.statusColor + "15" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ORDER.statusColor }} />
                      {ORDER.status}
                    </span>
                  </div>
                  <h1 className="text-[20px] font-bold text-[#1a1a1a] tracking-tight leading-tight">
                    {ORDER.client}
                  </h1>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="flex items-center gap-1.5 border border-[#e5e5e5] bg-white text-[#4b4b4b] text-[12px] px-3 py-2 rounded-[7px] hover:border-[#c5c5c5] transition-colors">
                    <Icon name="Pencil" size={12} /> Изменить
                  </button>
                  <button className="flex items-center gap-1.5 bg-[#1a1a1a] text-white text-[12px] px-3 py-2 rounded-[7px] hover:bg-[#333] transition-colors">
                    <Icon name="Banknote" size={12} /> Оплата
                  </button>
                </div>
              </div>

              {/* Мета-строка */}
              <div className="flex items-center gap-5 pt-3 border-t border-[#f5f5f5] flex-wrap gap-y-2">
                <div className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b]">
                  <Icon name="Calendar" size={13} className="text-[#b5b5b5]" />
                  Срок: <span className="font-semibold text-[#1a1a1a] ml-1">{ORDER.deadline}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b]">
                  <Icon name="User" size={13} className="text-[#b5b5b5]" />
                  <span className="font-medium text-[#1a1a1a]">{ORDER.manager}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b]">
                  <Icon name="Phone" size={13} className="text-[#b5b5b5]" />
                  {ORDER.phone}
                </div>
              </div>
            </div>

            {/* ── Клиент ── */}
            <Block title="Клиент" icon="User">
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="ФИО"     value={ORDER.client} />
                <InfoRow label="Телефон" value={ORDER.phone}  />
              </div>
              {ORDER.clientComment && (
                <div className="mt-4 pt-4 border-t border-[#f5f5f5]">
                  <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-2">Комментарий клиента</p>
                  <p className="text-[13px] text-[#4b4b4b] leading-relaxed bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
                    {ORDER.clientComment}
                  </p>
                </div>
              )}
            </Block>

            {/* ── Заказ (позиции) ── */}
            <Block title="Заказ" icon="FileText">
              <table className="w-full mb-4">
                <thead>
                  <tr className="border-b border-[#f5f5f5]">
                    {["Позиция", "Кол.", "Цена", "Сумма", "Статус", ""].map(h => (
                      <th key={h} className="pb-2.5 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, i) => {
                    const cfg = APPROVE_CFG[String(item.approved) as keyof typeof APPROVE_CFG];
                    return (
                      <tr key={i} className="border-b border-[#f8f8f8] last:border-0 group">
                        <td className="py-2.5 text-[13px] text-[#1a1a1a] pr-3">{item.name}</td>
                        <td className="py-2.5 text-[12px] text-[#6b6b6b]">{item.qty} {item.unit}</td>
                        <td className="py-2.5 text-[12px] text-[#6b6b6b] font-mono">
                          {item.price > 0 ? `${item.price.toLocaleString("ru")} ₽` : <span className="text-[#d97706]">—</span>}
                        </td>
                        <td className="py-2.5 text-[13px] font-semibold text-[#1a1a1a] font-mono">
                          {item.price > 0 ? `${(item.qty * item.price).toLocaleString("ru")} ₽` : "—"}
                        </td>
                        <td className="py-2.5">
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap"
                            style={{ color: cfg.color, backgroundColor: cfg.bg }}
                          >
                            {cfg.label}
                          </span>
                        </td>
                        {/* Кнопка расчёта */}
                        <td className="py-2.5 pl-2">
                          <button
                            onClick={() => openCalcFor(item.id)}
                            className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-[7px] border transition-colors whitespace-nowrap
                              ${item.hasCalc
                                ? "border-[#e8e8e8] text-[#6b6b6b] hover:border-[#c0c0c0] hover:text-[#1a1a1a]"
                                : "border-[#6366f1] bg-[#f5f3ff] text-[#6366f1] hover:bg-[#ede9fe]"
                              }`}
                          >
                            <Icon name="Calculator" size={10} />
                            {item.hasCalc ? "Пересчитать" : "Рассчитать"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Сводка */}
              <div className="border-t border-[#f5f5f5] pt-3">
                {allApproved ? (
                  <div className="flex justify-end items-baseline gap-2">
                    <span className="text-[12px] text-[#9b9b9b]">Итого</span>
                    <span className="text-[22px] font-bold text-[#1a1a1a]">{ORDER.amount.toLocaleString("ru")} ₽</span>
                  </div>
                ) : (
                  <div className="flex items-end justify-between gap-4">
                    <div className="space-y-1 text-[12px]">
                      {totalApproved > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                          <span className="text-[#6b6b6b]">Утверждено</span>
                          <span className="font-semibold text-[#1a1a1a]">{totalApproved.toLocaleString("ru")} ₽</span>
                        </div>
                      )}
                      {totalUnapproved > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                          <span className="text-[#6b6b6b]">Не утверждено</span>
                          <span className="font-semibold text-[#1a1a1a]">{totalUnapproved.toLocaleString("ru")} ₽</span>
                        </div>
                      )}
                      {totalPending > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                          <span className="text-[#6b6b6b]">Требует расчёта</span>
                          <span className="font-semibold text-[#1a1a1a]">{totalPending.toLocaleString("ru")} ₽</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-[#9b9b9b] mb-0.5">Итого</p>
                      <p className="text-[22px] font-bold text-[#1a1a1a]">{ORDER.amount.toLocaleString("ru")} ₽</p>
                    </div>
                  </div>
                )}
              </div>
            </Block>

            {/* ── Материалы (свёрнуты) ── */}
            <Block title="Материалы" icon="Package" collapsible>
              <div className="space-y-2">
                {MATERIALS.map((m, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 py-1.5 border-b border-[#f8f8f8] last:border-0">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${m.written ? "bg-green-400" : "bg-[#e0e0e0]"}`} />
                      <span className="text-[13px] text-[#1a1a1a]">{m.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[12px] font-mono text-[#6b6b6b]">{m.qty} {m.unit}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${m.written ? "bg-green-100 text-green-700" : "bg-[#f4f4f4] text-[#9b9b9b]"}`}>
                        {m.written ? "Списано" : "Не списано"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-3 flex items-center gap-1.5 text-[12px] text-[#6b6b6b] hover:text-[#1a1a1a] border border-[#ebebeb] px-3 py-1.5 rounded-[7px] hover:border-[#c5c5c5] transition-colors">
                <Icon name="ArrowUpFromLine" size={12} />
                Списать материал
              </button>
            </Block>

            {/* ── Комментарии ── */}
            <Block title="Комментарии" icon="MessageSquare">
              <div className="space-y-3 mb-4">
                {comments.map((c, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[11px] font-bold text-[#6b6b6b] shrink-0">
                      {c.author.split(" ").map(w => w[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-[12px] font-semibold text-[#1a1a1a]">{c.author}</span>
                        <span className="text-[11px] text-[#b5b5b5]">{c.date}</span>
                      </div>
                      <p className="text-[13px] text-[#4b4b4b] leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && addComment()}
                  placeholder="Добавить комментарий..."
                  className="flex-1 bg-[#fafafa] border border-[#ebebeb] rounded-[8px] px-3 py-2 text-[13px] outline-none focus:border-[#c0c0c0] transition-colors placeholder:text-[#c5c5c5]"
                />
                <button
                  onClick={addComment}
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-[#1a1a1a] text-white text-[12px] rounded-[8px] hover:bg-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  <Icon name="Send" size={13} />
                </button>
              </div>
            </Block>

          </div>

          {/* ───── ПРАВАЯ КОЛОНКА ───── */}
          <div className="w-[260px] shrink-0 space-y-3 sticky top-6">

            {/* ── Этап производства ── */}
            <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f5f5f5]">
                <div className="w-5 h-5 rounded-md bg-[#f4f4f4] flex items-center justify-center shrink-0">
                  <Icon name="Layers" size={11} className="text-[#6b6b6b]" />
                </div>
                <p className="text-[12px] font-semibold text-[#1a1a1a]">Этап производства</p>
              </div>
              <div className="px-4 py-3 space-y-1.5">
                {STAGES.map((s, i) => {
                  const done   = i < activeStage;
                  const active = i === activeStage;
                  return (
                    <div key={s} className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        done   ? "bg-green-500" :
                        active ? "bg-[#1a1a1a]" : "bg-[#f0f0f0]"
                      }`}>
                        {done
                          ? <Icon name="Check" size={10} className="text-white" />
                          : <span className={`text-[9px] font-bold ${active ? "text-white" : "text-[#c0c0c0]"}`}>{i + 1}</span>
                        }
                      </div>
                      <span className={`text-[12px] ${active ? "font-semibold text-[#1a1a1a]" : done ? "text-[#9b9b9b]" : "text-[#c0c0c0]"}`}>
                        {s}
                      </span>
                      {active && routeTarget && (
                        <span className="ml-auto text-[10px] font-medium text-[#6366f1] cursor-pointer hover:underline whitespace-nowrap">
                          → {routeTarget}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="px-4 pb-3 flex gap-2">
                <button
                  onClick={() => setActiveStage(Math.max(0, activeStage - 1))}
                  className="flex-1 text-[11px] py-1.5 rounded-[7px] border border-[#ebebeb] text-[#6b6b6b] hover:border-[#c5c5c5] transition-colors"
                >
                  ← Назад
                </button>
                <button
                  onClick={() => setActiveStage(Math.min(STAGES.length - 1, activeStage + 1))}
                  className="flex-1 text-[11px] py-1.5 rounded-[7px] bg-[#1a1a1a] text-white hover:bg-[#333] transition-colors"
                >
                  Далее →
                </button>
              </div>
            </div>

            {/* ── Финансы ── */}
            <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f5f5f5]">
                <div className="w-5 h-5 rounded-md bg-[#f4f4f4] flex items-center justify-center shrink-0">
                  <Icon name="Banknote" size={11} className="text-[#6b6b6b]" />
                </div>
                <p className="text-[12px] font-semibold text-[#1a1a1a]">Финансы</p>
              </div>
              <div className="px-4 py-3 space-y-2.5">
                <div>
                  <p className="text-[11px] text-[#9b9b9b] mb-0.5">Сумма заказа</p>
                  <p className="text-[20px] font-bold text-[#1a1a1a]">{ORDER.amount.toLocaleString("ru")} ₽</p>
                </div>
                <div className="space-y-1.5 text-[12px]">
                  <div className="flex justify-between">
                    <span className="text-[#6b6b6b]">Оплачено</span>
                    <span className="font-semibold text-[#16a34a]">{ORDER.paid.toLocaleString("ru")} ₽</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b6b6b]">Остаток</span>
                    <span className={`font-semibold ${debt > 0 ? "text-red-500" : "text-[#9b9b9b]"}`}>
                      {debt > 0 ? `${debt.toLocaleString("ru")} ₽` : "—"}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-[#c0c0c0] mb-1">
                    <span>Прогресс оплаты</span>
                    <span>{paidPct}%</span>
                  </div>
                  <div className="h-1.5 bg-[#ebebeb] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${paidPct}%`, backgroundColor: paidPct >= 100 ? "#16a34a" : "#6366f1" }}
                    />
                  </div>
                </div>
                <button className="w-full flex items-center justify-center gap-1.5 bg-[#1a1a1a] text-white text-[12px] py-2 rounded-[8px] hover:bg-[#333] transition-colors mt-1">
                  <Icon name="Banknote" size={12} /> Добавить оплату
                </button>
              </div>
            </div>

            {/* ── Ответственные ── */}
            <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f5f5f5]">
                <div className="w-5 h-5 rounded-md bg-[#f4f4f4] flex items-center justify-center shrink-0">
                  <Icon name="Users" size={11} className="text-[#6b6b6b]" />
                </div>
                <p className="text-[12px] font-semibold text-[#1a1a1a]">Ответственные</p>
              </div>
              <div className="px-4 py-3 space-y-3">
                {[
                  { label: "Менеджер",      name: ORDER.manager,    icon: "UserCheck" },
                  { label: "Производство",   name: ORDER.production, icon: "Hammer"    },
                  { label: "Сметчик",        name: ORDER.estimator,  icon: "Calculator" },
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#f4f4f4] flex items-center justify-center shrink-0">
                      <Icon name={r.icon as never} size={12} className="text-[#6b6b6b]" />
                    </div>
                    <div>
                      <p className="text-[11px] text-[#9b9b9b]">{r.label}</p>
                      <p className="text-[12px] font-semibold text-[#1a1a1a]">{r.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Быстрые действия ── */}
            <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f5f5f5]">
                <div className="w-5 h-5 rounded-md bg-[#f4f4f4] flex items-center justify-center shrink-0">
                  <Icon name="Zap" size={11} className="text-[#6b6b6b]" />
                </div>
                <p className="text-[12px] font-semibold text-[#1a1a1a]">Действия</p>
              </div>
              <div className="px-4 py-3 space-y-2">
                <button className="w-full flex items-center gap-2 text-[12px] text-[#4b4b4b] border border-[#ebebeb] px-3 py-2 rounded-[8px] hover:border-[#c5c5c5] transition-colors">
                  <Icon name="RefreshCw" size={12} className="text-[#9b9b9b]" /> Сменить этап
                </button>
                <button className="w-full flex items-center gap-2 text-[12px] text-[#4b4b4b] border border-[#ebebeb] px-3 py-2 rounded-[8px] hover:border-[#c5c5c5] transition-colors">
                  <Icon name="Printer" size={12} className="text-[#9b9b9b]" /> Распечатать заказ
                </button>
                <button className="w-full flex items-center gap-2 text-[12px] text-red-500 border border-red-100 bg-red-50 px-3 py-2 rounded-[8px] hover:bg-red-100 hover:border-red-200 transition-colors">
                  <Icon name="XCircle" size={12} /> Закрыть заказ
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}