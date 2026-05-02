import Icon from "@/components/ui/icon";
import { Client } from "../ClientsPage";

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

type Props = {
  clients: Client[];
  filtered: Client[];
  selected: Client | null;
  totalDebt: number;
  activeCount: number;
  debtClients: number;
  loading: boolean;
  search: string;
  filterActive: "all" | "active" | "inactive";
  onSearchChange: (v: string) => void;
  onFilterChange: (f: "all" | "active" | "inactive") => void;
  onSelect: (c: Client) => void;
};

export default function ClientsTable({
  clients, filtered, selected,
  totalDebt, activeCount, debtClients,
  loading, search, filterActive,
  onSearchChange, onFilterChange, onSelect,
}: Props) {
  return (
    <>
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[21px] font-semibold text-[#1a1a1a] tracking-tight">Клиенты</h1>
          <p className="text-[13px] text-[#9b9b9b] mt-0.5">{clients.length} клиентов</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[13px] px-4 py-2 rounded-[8px] hover:bg-[#333] transition-colors">
          <Icon name="Plus" size={14} />Добавить
        </button>
      </div>

      {/* Метрики */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon="Users"      color="#6b6b6b" label="Всего клиентов"         value={String(clients.length)} />
        <StatCard icon="UserCheck"  color="#6366f1" label="С активными заказами"   value={String(activeCount)} />
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
              onClick={() => onFilterChange(f)}
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
            onChange={e => onSearchChange(e.target.value)}
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
            {loading && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px] text-[#b5b5b5]">Загрузка...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px] text-[#b5b5b5]">Клиенты не найдены</td></tr>
            )}
            {filtered.map((c, i) => {
              const debt   = c.total - c.paid;
              const isLast = i === filtered.length - 1;
              return (
                <tr
                  key={c.id}
                  onClick={() => onSelect(c)}
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

                  {/* Действия */}
                  <td className="px-3 py-3.5" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <ActionBtn icon="Eye"    title="Открыть"       onClick={() => onSelect(c)} accent />
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
    </>
  );
}
