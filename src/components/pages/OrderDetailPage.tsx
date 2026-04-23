import { useState } from "react";
import Icon from "@/components/ui/icon";

const STAGES = ["Эскиз", "Распил", "Гравировка", "Полировка", "Готов", "Выдан"];

const ORDER = {
  id: "МП-0041",
  client: "Смирнова Алла Васильевна",
  phone: "+7 912 345-67-89",
  address: "Москва, ул. Ленина, 14, кв. 7",
  stone: "Гранит чёрный",
  size: "100×50×8 см",
  design: "Портрет + орнамент",
  inscription: "Иванов Пётр Семёнович\n1945–2021",
  deadline: "28 апреля 2026",
  currentStage: 1,
  status: "Производство",
  statusColor: "#f59e0b",
  amount: 38500,
  paid: 15000,
  manager: "Олег Краснов",
  production: "Игорь Верещагин",
  estimator: "Анна Морозова",
  clientComment: "Клиент просил сделать надпись крупнее, портрет — черно-белый, без цветной обработки.",
};

const ITEMS = [
  { name: "Изготовление памятника", qty: 1, unit: "шт.", price: 22000 },
  { name: "Гравировка надписи", qty: 1, unit: "шт.", price: 6500 },
  { name: "Портретное фото", qty: 1, unit: "шт.", price: 5000 },
  { name: "Доставка и установка", qty: 1, unit: "шт.", price: 5000 },
];

const MATERIALS = [
  { name: "Гранит чёрный (габбро)", qty: 0.42, unit: "м²", written: false },
  { name: "Абразивный диск 230мм", qty: 2, unit: "шт.", written: true },
  { name: "Алмазная фреза", qty: 1, unit: "шт.", written: false },
];

const COMMENTS = [
  { author: "Анна М.", date: "12 апр., 14:32", text: "Эскиз согласован с клиентом, приступаем к распилу." },
  { author: "Игорь В.", date: "15 апр., 09:10", text: "Материал заготовлен, начали обработку. Срок — 3 дня." },
  { author: "Олег К.", date: "18 апр., 17:45", text: "Клиент звонил, просит успеть к 25 апреля. Уточнил размер надписи." },
];

export default function OrderDetailPage({ onBack }: { onBack: () => void }) {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(COMMENTS);
  const [activeStage, setActiveStage] = useState(ORDER.currentStage);

  const debt = ORDER.amount - ORDER.paid;
  const paidPct = Math.round((ORDER.paid / ORDER.amount) * 100);

  const addComment = () => {
    if (!newComment.trim()) return;
    setComments(prev => [...prev, { author: "Олег К.", date: "сейчас", text: newComment.trim() }]);
    setNewComment("");
  };

  return (
    <div className="h-full overflow-y-auto bg-[#fafafa]">
      <div className="max-w-[1200px] mx-auto px-7 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-5">
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

          {/* ───── LEFT ───── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Header card */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="font-mono text-[13px] font-bold text-[#9b9b9b]">{ORDER.id}</span>
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-2 py-0.5 rounded-md bg-amber-50" style={{ color: ORDER.statusColor }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ORDER.statusColor }} />
                      {ORDER.status}
                    </span>
                  </div>
                  <h1 className="text-[20px] font-semibold text-[#1a1a1a] tracking-tight mb-0.5">{ORDER.client}</h1>
                  <p className="text-[13px] text-[#9b9b9b]">{ORDER.stone} · {ORDER.size} · {ORDER.design}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="flex items-center gap-1.5 border border-[#e5e5e5] bg-white text-[#4b4b4b] text-[12px] px-3 py-2 rounded-[7px] hover:border-[#c5c5c5] transition-colors">
                    <Icon name="Pencil" size={12} />
                    Редактировать
                  </button>
                  <button className="flex items-center gap-1.5 border border-[#e5e5e5] bg-white text-[#4b4b4b] text-[12px] px-3 py-2 rounded-[7px] hover:border-[#c5c5c5] transition-colors">
                    <Icon name="RefreshCw" size={12} />
                    Этап
                  </button>
                  <button className="flex items-center gap-1.5 bg-[#1a1a1a] text-white text-[12px] px-3 py-2 rounded-[7px] hover:bg-[#333] transition-colors">
                    <Icon name="Banknote" size={12} />
                    Оплата
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-5 pt-3 border-t border-[#f5f5f5]">
                <div className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b]">
                  <Icon name="Calendar" size={13} className="text-[#b5b5b5]" />
                  Срок: <span className="font-semibold text-[#1a1a1a]">{ORDER.deadline}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b]">
                  <Icon name="User" size={13} className="text-[#b5b5b5]" />
                  {ORDER.manager}
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b]">
                  <Icon name="Phone" size={13} className="text-[#b5b5b5]" />
                  {ORDER.phone}
                </div>
              </div>
            </div>

            {/* Client */}
            <Block title="Клиент" icon="User">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <InfoRow label="Имя" value={ORDER.client} />
                <InfoRow label="Телефон" value={ORDER.phone} />
                <InfoRow label="Адрес" value={ORDER.address} />
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

            {/* Estimate */}
            <Block title="Расчёт" icon="Calculator">
              <table className="w-full mb-3">
                <thead>
                  <tr className="border-b border-[#f5f5f5]">
                    {["Позиция", "Кол-во", "Ед.", "Цена", "Итого"].map(h => (
                      <th key={h} className="pb-2.5 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ITEMS.map((item, i) => (
                    <tr key={i} className="border-b border-[#f8f8f8] last:border-0">
                      <td className="py-2.5 text-[13px] text-[#1a1a1a]">{item.name}</td>
                      <td className="py-2.5 text-[13px] text-[#6b6b6b]">{item.qty}</td>
                      <td className="py-2.5 text-[12px] text-[#9b9b9b]">{item.unit}</td>
                      <td className="py-2.5 text-[13px] text-[#6b6b6b]">{item.price.toLocaleString("ru")} ₽</td>
                      <td className="py-2.5 text-[13px] font-semibold text-[#1a1a1a]">{(item.qty * item.price).toLocaleString("ru")} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between pt-1">
                <button className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b] hover:text-[#1a1a1a] border border-[#ebebeb] px-3 py-1.5 rounded-[7px] hover:border-[#c5c5c5] transition-colors">
                  <Icon name="RefreshCw" size={12} />
                  Пересчитать
                </button>
                <div className="text-right">
                  <p className="text-[11px] text-[#9b9b9b] mb-0.5">Итого</p>
                  <p className="text-[20px] font-bold text-[#1a1a1a]">{ORDER.amount.toLocaleString("ru")} ₽</p>
                </div>
              </div>
            </Block>

            {/* Materials */}
            <Block title="Материалы" icon="Package">
              <div className="space-y-2 mb-3">
                {MATERIALS.map((m, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-[#f8f8f8] last:border-0">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.written ? "bg-[#22c55e]" : "bg-[#d5d5d5]"}`} />
                      <span className="text-[13px] text-[#1a1a1a]">{m.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-[#9b9b9b] font-mono">{m.qty} {m.unit}</span>
                      {m.written
                        ? <span className="text-[11px] text-[#22c55e] bg-green-50 px-2 py-0.5 rounded-md font-semibold">списано</span>
                        : <span className="text-[11px] text-[#9b9b9b] bg-[#f5f5f5] px-2 py-0.5 rounded-md">не списано</span>
                      }
                    </div>
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b] hover:text-[#1a1a1a] border border-dashed border-[#e0e0e0] hover:border-[#c5c5c5] px-3 py-2 rounded-[7px] transition-colors w-full justify-center">
                <Icon name="Minus" size={12} />
                Списать материал
              </button>
            </Block>

            {/* Comments */}
            <Block title="Комментарии" icon="MessageSquare">
              <div className="space-y-3 mb-4">
                {comments.map((c, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[11px] font-bold text-[#6b6b6b] shrink-0 mt-0.5">
                      {c.author[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] font-semibold text-[#1a1a1a]">{c.author}</span>
                        <span className="text-[11px] text-[#b5b5b5]">{c.date}</span>
                      </div>
                      <p className="text-[13px] text-[#4b4b4b] leading-relaxed bg-[#fafafa] rounded-lg px-3 py-2.5 border border-[#f0f0f0]">
                        {c.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2.5">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Добавить комментарий..."
                  rows={2}
                  className="flex-1 bg-[#fafafa] border border-[#ebebeb] rounded-lg px-3 py-2.5 text-[13px] text-[#1a1a1a] placeholder:text-[#c5c5c5] outline-none focus:border-[#c0c0c0] resize-none transition-colors"
                />
                <button
                  onClick={addComment}
                  className="shrink-0 bg-[#1a1a1a] text-white px-3 py-2 rounded-lg hover:bg-[#333] transition-colors self-end"
                >
                  <Icon name="Send" size={14} />
                </button>
              </div>
            </Block>
          </div>

          {/* ───── RIGHT ───── */}
          <div className="w-[280px] shrink-0 space-y-4 sticky top-6">

            {/* Stage progress */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-4">Этап производства</p>
              <div className="space-y-1">
                {STAGES.map((stage, idx) => {
                  const isDone = idx < activeStage;
                  const isCurrent = idx === activeStage;
                  return (
                    <div key={stage} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all
                        ${isDone ? "bg-[#22c55e]" : isCurrent ? "bg-[#1a1a1a]" : "bg-[#f0f0f0]"}
                      `}>
                        {isDone
                          ? <Icon name="Check" size={10} className="text-white" />
                          : isCurrent
                            ? <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            : <span className="w-1.5 h-1.5 rounded-full bg-[#d0d0d0]" />
                        }
                      </div>
                      <div className="flex-1 flex items-center justify-between">
                        <span className={`text-[12px] font-medium ${isCurrent ? "text-[#1a1a1a]" : isDone ? "text-[#9b9b9b]" : "text-[#c5c5c5]"}`}>
                          {stage}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-[#1a1a1a] text-white px-1.5 py-0.5 rounded-md font-semibold">сейчас</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-[#f5f5f5] flex gap-2">
                <button
                  onClick={() => setActiveStage(s => Math.max(0, s - 1))}
                  className="flex-1 text-[11px] text-[#6b6b6b] border border-[#ebebeb] py-2 rounded-[7px] hover:border-[#c5c5c5] transition-colors"
                >
                  ← Назад
                </button>
                <button
                  onClick={() => setActiveStage(s => Math.min(STAGES.length - 1, s + 1))}
                  className="flex-1 text-[11px] bg-[#1a1a1a] text-white py-2 rounded-[7px] hover:bg-[#333] transition-colors"
                >
                  Далее →
                </button>
              </div>
            </div>

            {/* Finance */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-4">Финансы</p>
              <div className="space-y-2.5 mb-4">
                <FinRow label="Сумма заказа" value={`${ORDER.amount.toLocaleString("ru")} ₽`} />
                <FinRow label="Оплачено" value={`${ORDER.paid.toLocaleString("ru")} ₽`} valueColor="#16a34a" />
                <div>
                  <FinRow label="Остаток" value={`${debt.toLocaleString("ru")} ₽`} valueColor="#dc2626" />
                  <div className="mt-2 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#22c55e] rounded-full transition-all" style={{ width: `${paidPct}%` }} />
                  </div>
                  <p className="text-[10px] text-[#b5b5b5] mt-1 text-right">{paidPct}% оплачено</p>
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] text-white text-[12px] py-2.5 rounded-[8px] hover:bg-[#333] transition-colors">
                <Icon name="Banknote" size={13} />
                Добавить оплату
              </button>
            </div>

            {/* Responsible */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-4">Ответственные</p>
              <div className="space-y-3">
                <PersonRow role="Менеджер" name={ORDER.manager} />
                <PersonRow role="Производство" name={ORDER.production} />
                <PersonRow role="Сметчик" name={ORDER.estimator} />
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-3">Быстрые действия</p>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-2.5 text-[12px] text-[#4b4b4b] border border-[#ebebeb] px-3 py-2.5 rounded-[8px] hover:border-[#c5c5c5] hover:bg-[#fafafa] transition-all">
                  <Icon name="RefreshCw" size={13} className="text-[#9b9b9b]" />
                  Сменить этап
                </button>
                <button className="w-full flex items-center gap-2.5 text-[12px] text-[#4b4b4b] border border-[#ebebeb] px-3 py-2.5 rounded-[8px] hover:border-[#c5c5c5] hover:bg-[#fafafa] transition-all">
                  <Icon name="Printer" size={13} className="text-[#9b9b9b]" />
                  Распечатать заказ
                </button>
                <button className="w-full flex items-center gap-2.5 text-[12px] text-[#dc2626] border border-red-100 px-3 py-2.5 rounded-[8px] hover:border-red-200 hover:bg-red-50 transition-all">
                  <Icon name="CheckCircle" size={13} className="text-red-400" />
                  Закрыть заказ
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function Block({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon name={icon as never} size={14} className="text-[#9b9b9b]" />
        <h2 className="text-[14px] font-semibold text-[#1a1a1a]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-[#b5b5b5] mb-0.5">{label}</p>
      <p className="text-[13px] font-medium text-[#1a1a1a]">{value}</p>
    </div>
  );
}

function FinRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-[#9b9b9b]">{label}</span>
      <span className="text-[14px] font-semibold" style={{ color: valueColor || "#1a1a1a" }}>{value}</span>
    </div>
  );
}

function PersonRow({ role, name }: { role: string; name: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[11px] font-bold text-[#6b6b6b] shrink-0">
        {name[0]}
      </div>
      <div>
        <p className="text-[12px] font-medium text-[#1a1a1a] leading-none mb-0.5">{name}</p>
        <p className="text-[10px] text-[#b5b5b5]">{role}</p>
      </div>
    </div>
  );
}
