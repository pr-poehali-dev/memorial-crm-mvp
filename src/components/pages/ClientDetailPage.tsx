import { useState } from "react";
import Icon from "@/components/ui/icon";
import { CLIENTS } from "./ClientsPage";

const CLIENT_ORDERS: Record<string, {
  id: string; stone: string; size: string; status: string; statusColor: string; amount: number; paid: number; date: string;
}[]> = {
  "CL-001": [
    { id: "МП-0041", stone: "Гранит чёрный", size: "100×50×8", status: "Производство", statusColor: "#f59e0b", amount: 38500, paid: 15000, date: "12.04.2026" },
    { id: "МП-0028", stone: "Гранит серый",  size: "90×45×7",  status: "Выдан",        statusColor: "#9b9b9b", amount: 31000, paid: 31000, date: "10.01.2026" },
    { id: "МП-0015", stone: "Мрамор белый",  size: "80×40×6",  status: "Выдан",        statusColor: "#9b9b9b", amount: 25000, paid: 25000, date: "05.08.2025" },
  ],
  "CL-002": [
    { id: "МП-0040", stone: "Мрамор белый",  size: "80×40×6",  status: "Эскиз",        statusColor: "#6366f1", amount: 22000, paid: 0,     date: "10.04.2026" },
  ],
};

const CLIENT_COMMENTS: Record<string, { author: string; date: string; text: string }[]> = {
  "CL-001": [
    { author: "Олег К.", date: "12 апр.", text: "Клиент уточнил размер надписи, согласовали шрифт." },
    { author: "Анна М.", date: "10 янв.", text: "Второй заказ. Доволен качеством первого." },
  ],
  "CL-006": [
    { author: "Игорь В.", date: "25 мар.", text: "Обсудили дизайн. Клиент выбрал звезду МВД." },
  ],
};

const FILES = [
  { name: "эскиз_МП-0041.pdf",   size: "1.2 МБ", type: "pdf",  date: "12 апр." },
  { name: "фото_надпись.jpg",    size: "840 КБ", type: "img",  date: "11 апр." },
  { name: "договор_001.docx",    size: "95 КБ",  type: "doc",  date: "10 апр." },
];

export default function ClientDetailPage({ clientId, onBack }: { clientId: string; onBack: () => void }) {
  const client = CLIENTS.find((c) => c.id === clientId) ?? CLIENTS[0];
  const orders = CLIENT_ORDERS[clientId] ?? [];
  const initialComments = CLIENT_COMMENTS[clientId] ?? [];

  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [active, setActive] = useState<boolean>(client.active);

  const debt = client.total - client.paid;
  const paidPct = client.total > 0 ? Math.round((client.paid / client.total) * 100) : 0;

  const addComment = () => {
    if (!newComment.trim()) return;
    setComments((p) => [...p, { author: "Олег К.", date: "сейчас", text: newComment.trim() }]);
    setNewComment("");
  };

  return (
    <div className="h-full overflow-y-auto bg-[#fafafa]">
      <div className="max-w-[1200px] mx-auto px-7 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-5">
          <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-[#9b9b9b] hover:text-[#1a1a1a] transition-colors">
            <Icon name="ChevronLeft" size={14} />Клиенты
          </button>
          <span className="text-[#d5d5d5]">/</span>
          <span className="text-[13px] font-semibold text-[#1a1a1a]">{client.name}</span>
        </div>

        <div className="flex gap-5 items-start">

          {/* ── LEFT ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Header */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[20px] font-bold text-[#6b6b6b] shrink-0">
                    {client.name[0]}
                  </div>
                  <div>
                    <h1 className="text-[19px] font-semibold text-[#1a1a1a] tracking-tight">{client.name}</h1>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[13px] text-[#6b6b6b]">{client.phone}</span>
                      <span className="text-[#d5d5d5]">·</span>
                      <span className="text-[13px] text-[#6b6b6b]">{client.city}</span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md
                        ${active ? "bg-green-50 text-green-600" : "bg-[#f5f5f5] text-[#9b9b9b]"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-400" : "bg-[#c5c5c5]"}`} />
                        {active ? "Активный" : "Неактивный"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="flex items-center gap-1.5 border border-[#e5e5e5] text-[#4b4b4b] text-[12px] px-3 py-2 rounded-[7px] hover:border-[#c5c5c5] transition-colors">
                    <Icon name="Pencil" size={12} />Редактировать
                  </button>
                  <button className="flex items-center gap-1.5 bg-[#1a1a1a] text-white text-[12px] px-3 py-2 rounded-[7px] hover:bg-[#333] transition-colors">
                    <Icon name="Plus" size={12} />Новый заказ
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#f5f5f5]">
                <InfoCell label="Адрес" value={client.address} />
                <InfoCell label="Менеджер" value={client.manager} />
                <InfoCell label="Клиент с" value="2025 года" />
              </div>
              {client.comment && (
                <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 text-[12px] text-[#6b6b6b] leading-relaxed">
                  {client.comment}
                </div>
              )}
            </div>

            {/* Orders */}
            <Block title="Заказы" icon="FileText" count={orders.length}>
              {orders.length === 0 ? (
                <p className="text-[13px] text-[#b5b5b5] py-2">Заказов нет</p>
              ) : (
                <div className="space-y-2">
                  {orders.map((o) => {
                    const d = o.amount - o.paid;
                    return (
                      <div key={o.id} className="flex items-center gap-4 p-3.5 rounded-xl border border-[#f0f0f0] hover:border-[#d5d5d5] hover:bg-[#fafafa] cursor-pointer transition-all">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-[12px] font-bold text-[#9b9b9b]">{o.id}</span>
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: o.statusColor }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: o.statusColor }} />
                              {o.status}
                            </span>
                          </div>
                          <p className="text-[13px] font-medium text-[#1a1a1a]">{o.stone} · {o.size} см</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[13px] font-semibold text-[#1a1a1a]">{o.amount.toLocaleString("ru")} ₽</p>
                          {d > 0
                            ? <p className="text-[11px] text-red-500">долг {d.toLocaleString("ru")} ₽</p>
                            : <p className="text-[11px] text-[#22c55e]">оплачен</p>}
                        </div>
                        <span className="text-[11px] text-[#b5b5b5] shrink-0">{o.date}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Block>

            {/* Files */}
            <Block title="Файлы" icon="Paperclip" count={FILES.length}>
              <div className="space-y-2 mb-3">
                {FILES.map((f) => (
                  <div key={f.name} className="flex items-center gap-3 p-3 rounded-xl border border-[#f0f0f0] hover:border-[#d5d5d5] cursor-pointer transition-colors group">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold
                      ${f.type === "pdf" ? "bg-red-50 text-red-500"
                      : f.type === "img" ? "bg-blue-50 text-blue-500"
                      : "bg-slate-50 text-slate-500"}`}>
                      {f.type.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[#1a1a1a] truncate">{f.name}</p>
                      <p className="text-[11px] text-[#b5b5b5]">{f.size} · {f.date}</p>
                    </div>
                    <Icon name="Download" size={13} className="text-[#b5b5b5] group-hover:text-[#6b6b6b] transition-colors" />
                  </div>
                ))}
              </div>
              <button className="flex items-center gap-2 text-[12px] text-[#6b6b6b] hover:text-[#1a1a1a] border border-dashed border-[#e0e0e0] hover:border-[#c5c5c5] px-3 py-2 rounded-[7px] transition-colors w-full justify-center">
                <Icon name="Upload" size={12} />Загрузить файл
              </button>
            </Block>

            {/* Comments */}
            <Block title="Комментарии" icon="MessageSquare" count={comments.length}>
              <div className="space-y-3 mb-4">
                {comments.length === 0 && (
                  <p className="text-[13px] text-[#b5b5b5]">Комментариев нет</p>
                )}
                {comments.map((c, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[11px] font-bold text-[#6b6b6b] shrink-0 mt-0.5">
                      {c.author[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[12px] font-semibold text-[#1a1a1a]">{c.author}</span>
                        <span className="text-[11px] text-[#b5b5b5]">{c.date}</span>
                      </div>
                      <p className="text-[13px] text-[#4b4b4b] bg-[#fafafa] border border-[#f0f0f0] rounded-lg px-3 py-2.5 leading-relaxed">
                        {c.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2.5">
                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Добавить комментарий..." rows={2}
                  className="flex-1 bg-[#fafafa] border border-[#ebebeb] rounded-lg px-3 py-2.5 text-[13px] placeholder:text-[#c5c5c5] outline-none focus:border-[#c0c0c0] resize-none transition-colors" />
                <button onClick={addComment}
                  className="shrink-0 bg-[#1a1a1a] text-white px-3 py-2 rounded-lg hover:bg-[#333] transition-colors self-end">
                  <Icon name="Send" size={14} />
                </button>
              </div>
            </Block>
          </div>

          {/* ── RIGHT ── */}
          <div className="w-[268px] shrink-0 space-y-4 sticky top-6">

            {/* Finance */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-4">Финансы</p>
              <div className="space-y-3 mb-4">
                <FinRow label="Всего заказов"  value={`${client.total.toLocaleString("ru")} ₽`} />
                <FinRow label="Оплачено"        value={`${client.paid.toLocaleString("ru")} ₽`} color="#16a34a" />
                <div>
                  <FinRow label="Долг"          value={debt > 0 ? `${debt.toLocaleString("ru")} ₽` : "—"} color={debt > 0 ? "#dc2626" : "#9b9b9b"} />
                  <div className="mt-2 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#22c55e] rounded-full" style={{ width: `${paidPct}%` }} />
                  </div>
                  <p className="text-[10px] text-[#b5b5b5] mt-1 text-right">{paidPct}% оплачено</p>
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 text-[12px] border border-[#ebebeb] text-[#4b4b4b] py-2.5 rounded-[8px] hover:border-[#c5c5c5] transition-colors">
                <Icon name="Banknote" size={13} />Добавить оплату
              </button>
            </div>

            {/* Status */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-3">Статус клиента</p>
              <div className="flex gap-2">
                <button onClick={() => setActive(true)}
                  className={`flex-1 py-2 rounded-[7px] text-[12px] font-semibold transition-all
                    ${active ? "bg-green-50 text-green-700 border border-green-200" : "border border-[#ebebeb] text-[#9b9b9b] hover:border-[#c5c5c5]"}`}>
                  Активный
                </button>
                <button onClick={() => setActive(false)}
                  className={`flex-1 py-2 rounded-[7px] text-[12px] font-semibold transition-all
                    ${!active ? "bg-[#f5f5f5] text-[#6b6b6b] border border-[#e0e0e0]" : "border border-[#ebebeb] text-[#9b9b9b] hover:border-[#c5c5c5]"}`}>
                  Неактивный
                </button>
              </div>
            </div>

            {/* Manager */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-3">Менеджер</p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[12px] font-bold text-[#6b6b6b] shrink-0">
                  {client.manager[0]}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#1a1a1a]">{client.manager}</p>
                  <p className="text-[11px] text-[#b5b5b5]">ответственный</p>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-3">Быстрые действия</p>
              <div className="space-y-2">
                <QuickAction icon="FileText"  label="Создать заказ" />
                <QuickAction icon="Phone"     label={`Позвонить`} sub={client.phone} />
                <QuickAction icon="Download"  label="Скачать досье" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Block({ title, icon, count, children }: { title: string; icon: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon name={icon as never} size={14} className="text-[#9b9b9b]" />
        <h2 className="text-[14px] font-semibold text-[#1a1a1a]">{title}</h2>
        {count !== undefined && (
          <span className="text-[11px] bg-[#f5f5f5] text-[#9b9b9b] px-1.5 py-0.5 rounded-md font-semibold ml-1">{count}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-[#b5b5b5] mb-0.5">{label}</p>
      <p className="text-[13px] font-medium text-[#1a1a1a]">{value}</p>
    </div>
  );
}

function FinRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-[#9b9b9b]">{label}</span>
      <span className="text-[13px] font-semibold" style={{ color: color ?? "#1a1a1a" }}>{value}</span>
    </div>
  );
}

function QuickAction({ icon, label, sub }: { icon: string; label: string; sub?: string }) {
  return (
    <button className="w-full flex items-center gap-2.5 text-[12px] text-[#4b4b4b] border border-[#ebebeb] px-3 py-2.5 rounded-[8px] hover:border-[#c5c5c5] hover:bg-[#fafafa] transition-all text-left">
      <Icon name={icon as never} size={13} className="text-[#9b9b9b] shrink-0" />
      <span className="flex-1">{label}</span>
      {sub && <span className="text-[11px] text-[#b5b5b5]">{sub}</span>}
    </button>
  );
}
