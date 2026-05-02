import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { useNav } from "@/store/navStore";

export type Client = {
  id: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  orders: number;
  total: number;
  paid: number;
  last: string;
  active: boolean;
  comment: string;
  manager: string;
  since?: string;
};

export const CLIENTS: Client[] = [
  { id: "CL-001", name: "Смирнова Алла Васильевна",    phone: "+7 912 345-67-89", city: "Москва",   address: "ул. Ленина, 14, кв. 7",    orders: 3, total: 94500,  paid: 80000,  last: "12.04.2026", active: true,  comment: "Постоянный клиент, всегда оплачивает вовремя", manager: "Олег К.",  since: "авг 2025" },
  { id: "CL-002", name: "Козлов Игорь Дмитриевич",     phone: "+7 903 211-44-55", city: "Москва",   address: "пр. Мира, 88, кв. 12",     orders: 1, total: 22000,  paid: 0,      last: "10.04.2026", active: true,  comment: "Ожидает согласования эскиза",                  manager: "Анна М.",  since: "апр 2026" },
  { id: "CL-003", name: "Петрова Ольга Николаевна",    phone: "+7 965 888-11-22", city: "Балашиха", address: "ул. Советская, 5",         orders: 2, total: 87000,  paid: 87000,  last: "05.04.2026", active: false, comment: "Заказы закрыты, рекомендовала нас соседям",    manager: "Олег К.",  since: "янв 2026" },
  { id: "CL-004", name: "Фёдоров Сергей Семёнович",    phone: "+7 999 777-33-44", city: "Подольск", address: "ул. Парковая, 3",          orders: 1, total: 31000,  paid: 31000,  last: "01.04.2026", active: false, comment: "",                                             manager: "Игорь В.", since: "мар 2026" },
  { id: "CL-005", name: "Иванов Павел Константинович", phone: "+7 900 123-00-00", city: "Москва",   address: "ул. Тверская, 22, кв. 45", orders: 4, total: 148000, paid: 148000, last: "28.03.2026", active: false, comment: "VIP клиент. Всегда выбирает дорогие материалы", manager: "Анна М.",  since: "фев 2025" },
  { id: "CL-006", name: "Морозова Татьяна Ивановна",   phone: "+7 921 456-78-90", city: "Химки",    address: "ул. Молодёжная, 18",       orders: 2, total: 68000,  paid: 45000,  last: "25.03.2026", active: true,  comment: "Заказ в производстве",                         manager: "Игорь В.", since: "мар 2026" },
  { id: "CL-007", name: "Белова Елена Сергеевна",      phone: "+7 916 200-10-30", city: "Москва",   address: "ул. Садовая, 9, кв. 3",   orders: 1, total: 35000,  paid: 15000,  last: "15.04.2026", active: true,  comment: "Ждёт эскиза",                                 manager: "Олег К.",  since: "апр 2026" },
];

const CLIENT_ORDERS: Record<string, {
  id: string; status: string; statusColor: string; amount: number; paid: number; date: string;
}[]> = {
  "CL-001": [
    { id: "МП-0041", status: "Производство", statusColor: "#f59e0b", amount: 38500, paid: 15000, date: "12.04.2026" },
    { id: "МП-0028", status: "Выдан",        statusColor: "#9b9b9b", amount: 31000, paid: 31000, date: "10.01.2026" },
    { id: "МП-0015", status: "Выдан",        statusColor: "#9b9b9b", amount: 25000, paid: 25000, date: "05.08.2025" },
  ],
  "CL-002": [
    { id: "МП-0040", status: "Эскиз",        statusColor: "#6366f1", amount: 22000, paid: 0,     date: "10.04.2026" },
  ],
  "CL-006": [
    { id: "МП-0039", status: "Производство", statusColor: "#f59e0b", amount: 44000, paid: 25000, date: "25.03.2026" },
    { id: "МП-0031", status: "Выдан",        statusColor: "#9b9b9b", amount: 24000, paid: 24000, date: "10.02.2026" },
  ],
  "CL-007": [
    { id: "МП-0042", status: "Эскиз",        statusColor: "#6366f1", amount: 35000, paid: 15000, date: "15.04.2026" },
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

/* ═══════════════════════════════════════
   OVERLAY клиента
═══════════════════════════════════════ */
function ClientOverlay({ client, onClose }: { client: Client; onClose: () => void }) {
  const { openOrder } = useNav();
  const orders   = CLIENT_ORDERS[client.id] ?? [];
  const comments = CLIENT_COMMENTS[client.id] ?? [];
  const [newComment, setNewComment] = useState("");
  const [allComments, setAllComments] = useState(comments);

  const debt    = client.total - client.paid;
  const paidPct = client.total > 0 ? Math.round((client.paid / client.total) * 100) : 0;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const addComment = () => {
    if (!newComment.trim()) return;
    setAllComments(p => [...p, { author: "Олег К.", date: "сейчас", text: newComment.trim() }]);
    setNewComment("");
  };

  return (
    <>
      {/* Затемнение */}
      <div
        className="fixed inset-0 z-40 bg-black/15 backdrop-blur-[1px] animate-fade-in"
        onClick={onClose}
      />

      {/* Панель справа */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[380px] bg-white border-l border-[#ebebeb] shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">

        {/* Шапка */}
        <div className="shrink-0 px-5 py-4 border-b border-[#f0f0f0]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold shrink-0
                ${client.active ? "bg-[#f0f0f0] text-[#6b6b6b]" : "bg-[#f8f8f8] text-[#b5b5b5]"}`}>
                {client.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-[#1a1a1a] leading-tight">{client.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[12px] text-[#6b6b6b]">{client.city}</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                    ${client.active ? "bg-green-100 text-green-600" : "bg-[#f0f0f0] text-[#9b9b9b]"}`}>
                    <span className={`w-1 h-1 rounded-full ${client.active ? "bg-green-500" : "bg-[#c0c0c0]"}`} />
                    {client.active ? "Активный" : "Неактивный"}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="shrink-0 text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors p-1">
              <Icon name="X" size={15} />
            </button>
          </div>

          {/* Контакты */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#f5f5f5]">
            <div className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b]">
              <Icon name="Phone" size={12} className="text-[#b5b5b5]" />
              {client.phone}
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b]">
              <Icon name="User" size={12} className="text-[#b5b5b5]" />
              {client.manager}
            </div>
            {client.since && (
              <div className="flex items-center gap-1.5 text-[12px] text-[#6b6b6b]">
                <Icon name="Calendar" size={12} className="text-[#b5b5b5]" />
                с {client.since}
              </div>
            )}
          </div>
        </div>

        {/* Скроллируемое тело */}
        <div className="flex-1 overflow-y-auto">

          {/* Финансы */}
          <div className="px-5 py-4 border-b border-[#f5f5f5]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-3">Финансы</p>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <p className="text-[11px] text-[#9b9b9b] mb-0.5">Заказов</p>
                <p className="text-[18px] font-bold text-[#1a1a1a]">{client.orders}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#9b9b9b] mb-0.5">Оплачено</p>
                <p className="text-[18px] font-bold text-[#16a34a]">{(client.paid / 1000).toFixed(0)} тыс.</p>
              </div>
              <div>
                <p className="text-[11px] text-[#9b9b9b] mb-0.5">Долг</p>
                {debt > 0
                  ? <p className="text-[18px] font-bold text-red-500">{(debt / 1000).toFixed(0)} тыс.</p>
                  : <p className="text-[15px] font-semibold text-[#16a34a]">Нет</p>
                }
              </div>
            </div>
            {client.total > 0 && (
              <div>
                <div className="flex justify-between text-[10px] text-[#c0c0c0] mb-1">
                  <span>Оплата</span>
                  <span>{paidPct}%</span>
                </div>
                <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${paidPct}%`, backgroundColor: paidPct >= 100 ? "#16a34a" : "#6366f1" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Заказы */}
          <div className="px-5 py-4 border-b border-[#f5f5f5]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#b5b5b5]">Заказы</p>
              <span className="text-[11px] text-[#9b9b9b]">{orders.length} шт.</span>
            </div>
            {orders.length === 0 ? (
              <p className="text-[12px] text-[#c0c0c0] py-1">Заказов нет</p>
            ) : (
              <div className="space-y-1.5">
                {orders.map(o => {
                  const d = o.amount - o.paid;
                  return (
                    <div
                      key={o.id}
                      onClick={() => { openOrder(o.id); onClose(); }}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-[10px] border border-[#f0f0f0] hover:border-[#d5d5d5] hover:bg-[#fafafa] cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] font-bold text-[#9b9b9b]">{o.id}</span>
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-semibold"
                              style={{ color: o.statusColor }}
                            >
                              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: o.statusColor }} />
                              {o.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#b5b5b5] mt-0.5">{o.date}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[13px] font-bold text-[#1a1a1a]">{o.amount.toLocaleString("ru")} ₽</p>
                        {d > 0
                          ? <p className="text-[10px] text-red-500 font-semibold">долг {d.toLocaleString("ru")} ₽</p>
                          : <p className="text-[10px] text-[#16a34a]">оплачен</p>
                        }
                      </div>
                      <Icon name="ChevronRight" size={13} className="text-[#c0c0c0] shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Комментарий клиента */}
          {client.comment && (
            <div className="px-5 py-4 border-b border-[#f5f5f5]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-2">Заметка</p>
              <p className="text-[12px] text-[#6b6b6b] leading-relaxed bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
                {client.comment}
              </p>
            </div>
          )}

          {/* Комментарии сотрудников */}
          <div className="px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-3">История общения</p>
            {allComments.length > 0 && (
              <div className="space-y-3 mb-3">
                {allComments.map((c, i) => (
                  <div key={i} className="flex gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[10px] font-bold text-[#6b6b6b] shrink-0">
                      {c.author.split(" ").map(w => w[0]).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[11px] font-semibold text-[#1a1a1a]">{c.author}</span>
                        <span className="text-[10px] text-[#b5b5b5]">{c.date}</span>
                      </div>
                      <p className="text-[12px] text-[#4b4b4b] leading-relaxed mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addComment()}
                placeholder="Добавить заметку..."
                className="flex-1 bg-[#fafafa] border border-[#ebebeb] rounded-[8px] px-3 py-2 text-[12px] outline-none focus:border-[#c0c0c0] transition-colors placeholder:text-[#c5c5c5]"
              />
              <button
                onClick={addComment}
                disabled={!newComment.trim()}
                className="px-3 py-2 bg-[#1a1a1a] text-white rounded-[8px] hover:bg-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Icon name="Send" size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Кнопка — закреплена внизу */}
        <div className="shrink-0 px-5 py-4 border-t border-[#f0f0f0]">
          <button className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] text-white text-[13px] font-semibold py-2.5 rounded-[9px] hover:bg-[#333] transition-colors">
            <Icon name="Plus" size={14} />
            Создать заказ
          </button>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════
   ГЛАВНАЯ СТРАНИЦА
═══════════════════════════════════════ */
export default function ClientsPage({ onOpenClient: _onOpenClient }: { onOpenClient?: (id: string) => void }) {
  const [search, setSearch]           = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [selected, setSelected]       = useState<Client | null>(null);

  const filtered = CLIENTS.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.city.toLowerCase().includes(q);
    const matchFilter = filterActive === "all" || (filterActive === "active" ? c.active : !c.active);
    return matchSearch && matchFilter;
  });

  const totalDebt    = CLIENTS.reduce((s, c) => s + (c.total - c.paid), 0);
  const activeCount  = CLIENTS.filter(c => c.active).length;
  const debtClients  = CLIENTS.filter(c => c.total - c.paid > 0).length;

  return (
    <div className="p-7 max-w-[1060px] mx-auto w-full space-y-5">

      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[21px] font-semibold text-[#1a1a1a] tracking-tight">Клиенты</h1>
          <p className="text-[13px] text-[#9b9b9b] mt-0.5">{CLIENTS.length} клиентов</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[13px] px-4 py-2 rounded-[8px] hover:bg-[#333] transition-colors">
          <Icon name="Plus" size={14} />Добавить
        </button>
      </div>

      {/* Метрики — 3 карточки */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon="Users" color="#6b6b6b" label="Всего клиентов" value={String(CLIENTS.length)} />
        <StatCard icon="UserCheck" color="#6366f1" label="С активными заказами" value={String(activeCount)} />
        <StatCard
          icon="CreditCard" color="#ef4444"
          label="Общий долг"
          value={totalDebt > 0 ? `${(totalDebt / 1000).toFixed(0)} тыс. ₽` : "—"}
          sub={totalDebt > 0 ? `${debtClients} клиентов` : "Долгов нет"}
          alert={totalDebt > 0}
        />
      </div>

      {/* Фильтры + поиск */}
      <div className="flex items-center gap-3">
        <div className="flex gap-0.5 bg-[#f4f4f4] rounded-[9px] p-0.5">
          {(["all", "active", "inactive"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
              className={`px-3 py-1.5 rounded-[7px] text-[12px] font-medium transition-all whitespace-nowrap
                ${filterActive === f ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
            >
              {f === "all" ? "Все" : f === "active" ? "Активные" : "Неактивные"}
            </button>
          ))}
        </div>
        <div className="relative max-w-[280px] flex-1">
          <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5b5]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Имя, телефон, город..."
            className="w-full bg-white border border-[#ebebeb] rounded-[8px] pl-8 pr-3 py-2 text-[13px] placeholder:text-[#c5c5c5] outline-none focus:border-[#c0c0c0] transition-colors"
          />
        </div>
      </div>

      {/* Таблица */}
      <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f0f0f0]">
              {["Клиент", "Телефон", "Заказов", "Долг", "Статус", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px] text-[#b5b5b5]">Клиенты не найдены</td></tr>
            )}
            {filtered.map((c, i) => {
              const debt   = c.total - c.paid;
              const isLast = i === filtered.length - 1;
              return (
                <tr
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`cursor-pointer transition-colors hover:bg-[#fafafa]
                    ${selected?.id === c.id ? "!bg-[#f5f3ff]" : ""}
                    ${!isLast ? "border-b border-[#f5f5f5]" : ""}`}
                >
                  {/* Клиент */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0
                        ${c.active ? "bg-[#f0f0f0] text-[#6b6b6b]" : "bg-[#f8f8f8] text-[#c0c0c0]"}`}>
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1a1a1a]">{c.name}</p>
                        <p className="text-[11px] text-[#b5b5b5]">{c.city} · {c.manager}</p>
                      </div>
                    </div>
                  </td>

                  {/* Телефон */}
                  <td className="px-4 py-3.5">
                    <p className="text-[12px] text-[#6b6b6b] font-mono">{c.phone}</p>
                  </td>

                  {/* Заказов */}
                  <td className="px-4 py-3.5">
                    <span className="text-[14px] font-bold text-[#1a1a1a]">{c.orders}</span>
                    <p className="text-[10px] text-[#b5b5b5]">последний {c.last}</p>
                  </td>

                  {/* Долг */}
                  <td className="px-4 py-3.5">
                    {debt > 0
                      ? <span className="text-[13px] font-semibold text-red-500">{debt.toLocaleString("ru")} ₽</span>
                      : <span className="text-[12px] text-[#16a34a] font-medium">Нет</span>
                    }
                  </td>

                  {/* Статус */}
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full
                      ${c.active ? "bg-green-50 text-green-600" : "bg-[#f5f5f5] text-[#9b9b9b]"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.active ? "bg-green-400" : "bg-[#d0d0d0]"}`} />
                      {c.active ? "Активный" : "Завершён"}
                    </span>
                  </td>

                  {/* Действия — всегда видимы */}
                  <td className="px-3 py-3.5" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <ActionBtn icon="Eye"    title="Открыть"        onClick={() => setSelected(c)} accent />
                      <ActionBtn icon="Pencil" title="Редактировать" />
                      <ActionBtn icon="Plus"   title="Новый заказ" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Overlay клиента */}
      {selected && (
        <ClientOverlay client={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

/* ── Компоненты ── */

function StatCard({ icon, color, label, value, sub, alert }: {
  icon: string; color: string; label: string; value: string; sub?: string; alert?: boolean;
}) {
  return (
    <div className={`bg-white border rounded-xl px-4 py-3.5 flex items-center gap-3 ${alert ? "border-red-200 bg-red-50/40" : "border-[#ebebeb]"}`}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + "18" }}>
        <Icon name={icon as never} size={15} style={{ color }} />
      </div>
      <div>
        <p className="text-[17px] font-semibold text-[#1a1a1a] leading-none mb-0.5">{value}</p>
        <p className="text-[11px] text-[#9b9b9b]">{label}</p>
        {sub && <p className="text-[11px] text-[#b5b5b5]">{sub}</p>}
      </div>
    </div>
  );
}

function ActionBtn({ icon, title, onClick, accent }: {
  icon: string; title: string; onClick?: () => void; accent?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`w-7 h-7 flex items-center justify-center rounded-[6px] border transition-all
        ${accent
          ? "bg-[#1a1a1a] border-[#1a1a1a] text-white hover:bg-[#333]"
          : "bg-white border-[#e5e5e5] text-[#6b6b6b] hover:text-[#1a1a1a] hover:border-[#c0c0c0]"
        }`}
    >
      <Icon name={icon as never} size={12} />
    </button>
  );
}
