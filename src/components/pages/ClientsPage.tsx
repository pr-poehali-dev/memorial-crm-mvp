import { useState } from "react";
import Icon from "@/components/ui/icon";

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
};

export const CLIENTS: Client[] = [
  { id: "CL-001", name: "Смирнова Алла Васильевна",   phone: "+7 912 345-67-89", city: "Москва",   address: "ул. Ленина, 14, кв. 7",     orders: 3, total: 94500,  paid: 80000, last: "12.04.2026", active: true,  comment: "Постоянный клиент, всегда оплачивает вовремя", manager: "Олег К." },
  { id: "CL-002", name: "Козлов Игорь Дмитриевич",    phone: "+7 903 211-44-55", city: "Москва",   address: "пр. Мира, 88, кв. 12",      orders: 1, total: 22000,  paid: 0,     last: "10.04.2026", active: true,  comment: "Ожидает согласования эскиза",                  manager: "Анна М." },
  { id: "CL-003", name: "Петрова Ольга Николаевна",   phone: "+7 965 888-11-22", city: "Балашиха", address: "ул. Советская, 5",          orders: 2, total: 87000,  paid: 87000, last: "05.04.2026", active: false, comment: "Заказы закрыты, рекомендовала нас соседям",    manager: "Олег К." },
  { id: "CL-004", name: "Фёдоров Сергей Семёнович",   phone: "+7 999 777-33-44", city: "Подольск", address: "ул. Парковая, 3",           orders: 1, total: 31000,  paid: 31000, last: "01.04.2026", active: false, comment: "",                                             manager: "Игорь В." },
  { id: "CL-005", name: "Иванов Павел Константинович", phone: "+7 900 123-00-00", city: "Москва",   address: "ул. Тверская, 22, кв. 45",  orders: 4, total: 148000, paid: 148000,last: "28.03.2026", active: false, comment: "VIP клиент. Всегда выбирает дорогие материалы", manager: "Анна М." },
  { id: "CL-006", name: "Морозова Татьяна Ивановна",  phone: "+7 921 456-78-90", city: "Химки",    address: "ул. Молодёжная, 18",         orders: 2, total: 68000,  paid: 45000, last: "25.03.2026", active: true,  comment: "Заказ в производстве",                         manager: "Игорь В." },
  { id: "CL-007", name: "Белова Елена Сергеевна",     phone: "+7 916 200-10-30", city: "Москва",   address: "ул. Садовая, 9, кв. 3",     orders: 1, total: 35000,  paid: 15000, last: "15.04.2026", active: true,  comment: "Ждёт эскиза",                                 manager: "Олег К." },
];

export default function ClientsPage({ onOpenClient }: { onOpenClient?: (id: string) => void }) {
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [hovered, setHovered] = useState<string | null>(null);

  const filtered = CLIENTS.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.city.toLowerCase().includes(q);
    const matchFilter = filterActive === "all" || (filterActive === "active" ? c.active : !c.active);
    return matchSearch && matchFilter;
  });

  const totalRevenue = CLIENTS.reduce((s, c) => s + c.total, 0);
  const totalDebt    = CLIENTS.reduce((s, c) => s + (c.total - c.paid), 0);
  const activeCount  = CLIENTS.filter((c) => c.active).length;

  return (
    <div className="p-7 max-w-[1060px] mx-auto w-full space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[21px] font-semibold text-[#1a1a1a] tracking-tight">Клиенты</h1>
          <p className="text-[13px] text-[#9b9b9b] mt-0.5">{CLIENTS.length} клиентов</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[13px] px-4 py-2 rounded-[8px] hover:bg-[#333] transition-colors">
          <Icon name="Plus" size={14} />
          Добавить
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <MiniStat icon="Users"        color="#6b6b6b" label="Всего клиентов"   value={String(CLIENTS.length)} sub={`${activeCount} активных`} />
        <MiniStat icon="TrendingUp"   color="#6366f1" label="Общая выручка"    value={`${(totalRevenue/1000).toFixed(0)} тыс. ₽`} sub="за всё время" />
        <MiniStat icon="CreditCard"   color="#ef4444" label="Долг клиентов"    value={`${(totalDebt/1000).toFixed(0)} тыс. ₽`} sub={`${CLIENTS.filter(c=>c.paid<c.total).length} клиентов`} alert={totalDebt > 0} />
      </div>

      {/* Filters + search */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1 bg-white border border-[#ebebeb] rounded-[8px] p-1">
          {(["all","active","inactive"] as const).map((f) => (
            <button key={f} onClick={() => setFilterActive(f)}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
                ${filterActive === f ? "bg-[#1a1a1a] text-white shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}>
              {f === "all" ? "Все" : f === "active" ? "Активные" : "Неактивные"}
            </button>
          ))}
        </div>
        <div className="relative max-w-[280px] flex-1">
          <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5b5]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Имя, телефон, город..."
            className="w-full bg-white border border-[#ebebeb] rounded-[8px] pl-8 pr-3 py-2 text-[13px] placeholder:text-[#c5c5c5] outline-none focus:border-[#c0c0c0] transition-colors" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f0f0f0]">
              {["Клиент", "Контакт", "Заказов", "Выручка", "Долг", "Статус", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-[13px] text-[#b5b5b5]">Клиенты не найдены</td></tr>
            )}
            {filtered.map((c, i) => {
              const debt = c.total - c.paid;
              const isLast = i === filtered.length - 1;
              return (
                <tr key={c.id}
                  onClick={() => onOpenClient?.(c.id)}
                  onMouseEnter={() => setHovered(c.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={`cursor-pointer transition-colors hover:bg-[#fafafa] ${!isLast ? "border-b border-[#f5f5f5]" : ""}`}>

                  {/* Клиент */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0
                        ${c.active ? "bg-[#f0f0f0] text-[#6b6b6b]" : "bg-[#f8f8f8] text-[#b5b5b5]"}`}>
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1a1a1a]">{c.name}</p>
                        <p className="text-[11px] text-[#b5b5b5]">{c.city} · {c.manager}</p>
                      </div>
                    </div>
                  </td>

                  {/* Контакт */}
                  <td className="px-4 py-3.5">
                    <p className="text-[12px] text-[#6b6b6b]">{c.phone}</p>
                    {c.comment && (
                      <p className="text-[11px] text-[#b5b5b5] max-w-[180px] truncate mt-0.5" title={c.comment}>
                        {c.comment}
                      </p>
                    )}
                  </td>

                  {/* Заказов */}
                  <td className="px-4 py-3.5">
                    <span className="text-[13px] font-bold text-[#1a1a1a]">{c.orders}</span>
                    <p className="text-[11px] text-[#b5b5b5]">последний {c.last}</p>
                  </td>

                  {/* Выручка */}
                  <td className="px-4 py-3.5">
                    <span className="text-[13px] font-semibold text-[#1a1a1a]">{c.total.toLocaleString("ru")} ₽</span>
                    <div className="mt-1 w-20 h-1 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#6366f1] rounded-full"
                        style={{ width: `${Math.min(100, (c.total / 148000) * 100)}%` }} />
                    </div>
                  </td>

                  {/* Долг */}
                  <td className="px-4 py-3.5">
                    {debt > 0
                      ? <span className="text-[12px] font-semibold text-red-500">{debt.toLocaleString("ru")} ₽</span>
                      : <span className="text-[12px] text-[#22c55e] font-semibold flex items-center gap-1">
                          <Icon name="Check" size={11} />нет
                        </span>
                    }
                  </td>

                  {/* Статус */}
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-md
                      ${c.active ? "bg-green-50 text-green-600" : "bg-[#f5f5f5] text-[#9b9b9b]"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.active ? "bg-green-400" : "bg-[#c5c5c5]"}`} />
                      {c.active ? "Активный" : "Неактивный"}
                    </span>
                  </td>

                  {/* Действия */}
                  <td className="px-3 py-3.5">
                    <div className={`flex items-center gap-1 transition-opacity ${hovered === c.id ? "opacity-100" : "opacity-0"}`}>
                      <QuickBtn icon="Eye"       title="Открыть"          onClick={(e) => { e.stopPropagation(); onOpenClient?.(c.id); }} />
                      <QuickBtn icon="FileText"  title="Создать заказ"    onClick={(e) => e.stopPropagation()} />
                      <QuickBtn icon="Phone"     title="Позвонить"        onClick={(e) => e.stopPropagation()} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MiniStat({ icon, color, label, value, sub, alert }: {
  icon: string; color: string; label: string; value: string; sub: string; alert?: boolean;
}) {
  return (
    <div className={`bg-white border rounded-xl px-5 py-4 flex items-center gap-4 ${alert ? "border-red-200" : "border-[#ebebeb]"}`}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + "18" }}>
        <Icon name={icon as never} size={16} style={{ color }} />
      </div>
      <div>
        <p className="text-[22px] font-bold text-[#1a1a1a] leading-none mb-1">{value}</p>
        <p className="text-[12px] font-medium text-[#6b6b6b]">{label}</p>
        <p className="text-[11px] text-[#b5b5b5]">{sub}</p>
      </div>
    </div>
  );
}

function QuickBtn({ icon, title, onClick }: { icon: string; title: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button title={title} onClick={onClick}
      className="w-7 h-7 flex items-center justify-center rounded-[6px] bg-white border border-[#e5e5e5] text-[#6b6b6b] hover:text-[#1a1a1a] hover:border-[#c5c5c5] transition-all">
      <Icon name={icon as never} size={12} />
    </button>
  );
}
