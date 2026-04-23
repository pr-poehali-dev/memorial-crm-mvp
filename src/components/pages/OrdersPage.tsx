import { useState } from "react";
import Icon from "@/components/ui/icon";

type PayStatus = "paid" | "partial" | "unpaid";
type DeadlineState = "overdue" | "soon" | "ok" | "done";

type Order = {
  id: string;
  client: string;
  phone: string;
  stone: string;
  size: string;
  inscription: string;
  design: string;
  status: string;
  statusColor: string;
  amount: number;
  paid: number;
  date: string;
  deadline: string;
  manager: string;
  comment: string;
  deadlineState: DeadlineState;
  payStatus: PayStatus;
};

const orders: Order[] = [
  {
    id: "МП-0041", client: "Смирнова А.В.", phone: "+7 912 345-67-89",
    stone: "Гранит чёрный", size: "100×50×8",
    inscription: "Иванов Пётр Семёнович\n1945–2021", design: "Портрет + орнамент",
    status: "Производство", statusColor: "#f59e0b",
    amount: 38500, paid: 15000,
    date: "12.04.2026", deadline: "28.04.2026",
    manager: "Олег К.", comment: "Клиент просил сделать надпись крупнее",
    deadlineState: "soon", payStatus: "partial",
  },
  {
    id: "МП-0040", client: "Козлов И.Д.", phone: "+7 903 211-44-55",
    stone: "Мрамор белый", size: "80×40×6",
    inscription: "Козлова Мария\n1950–2023", design: "Крест + розы",
    status: "Эскиз", statusColor: "#6366f1",
    amount: 22000, paid: 0,
    date: "10.04.2026", deadline: "20.04.2026",
    manager: "Анна М.", comment: "Ожидает согласования эскиза",
    deadlineState: "overdue", payStatus: "unpaid",
  },
  {
    id: "МП-0039", client: "Петрова О.Н.", phone: "+7 965 888-11-22",
    stone: "Гранит серый", size: "120×60×10",
    inscription: "Петров Алексей\n1938–2020", design: "Фото + берёзы",
    status: "Готов", statusColor: "#22c55e",
    amount: 54000, paid: 54000,
    date: "05.04.2026", deadline: "25.04.2026",
    manager: "Олег К.", comment: "Готов к выдаче, клиент не приехал",
    deadlineState: "ok", payStatus: "paid",
  },
  {
    id: "МП-0038", client: "Фёдоров С.С.", phone: "+7 999 777-33-44",
    stone: "Гранит красный", size: "90×45×7",
    inscription: "Фёдорова Нина\n1960–2024", design: "Лилии",
    status: "Доставка", statusColor: "#3b82f6",
    amount: 31000, paid: 31000,
    date: "01.04.2026", deadline: "22.04.2026",
    manager: "Игорь В.", comment: "Доставка на кладбище Митино",
    deadlineState: "overdue", payStatus: "paid",
  },
  {
    id: "МП-0037", client: "Иванов П.К.", phone: "+7 900 123-00-00",
    stone: "Гранит чёрный", size: "100×50×8",
    inscription: "Иванов Константин\n1955–2022", design: "Портрет",
    status: "Выдан", statusColor: "#9b9b9b",
    amount: 41000, paid: 41000,
    date: "28.03.2026", deadline: "15.04.2026",
    manager: "Анна М.", comment: "",
    deadlineState: "done", payStatus: "paid",
  },
  {
    id: "МП-0036", client: "Морозова Т.И.", phone: "+7 921 456-78-90",
    stone: "Гранит габбро", size: "110×55×8",
    inscription: "Морозов Виктор\n1942–2021", design: "Звезда + надпись",
    status: "Производство", statusColor: "#f59e0b",
    amount: 46000, paid: 20000,
    date: "25.03.2026", deadline: "30.04.2026",
    manager: "Игорь В.", comment: "Гравировка звезды по шаблону МВД",
    deadlineState: "ok", payStatus: "partial",
  },
  {
    id: "МП-0035", client: "Лебедев К.А.", phone: "+7 916 700-22-11",
    stone: "Гранит серый", size: "100×50×8",
    inscription: "Лебедева Ирина\n1963–2023", design: "Цветы + орнамент",
    status: "Производство", statusColor: "#f59e0b",
    amount: 35000, paid: 0,
    date: "20.03.2026", deadline: "10.04.2026",
    manager: "Олег К.", comment: "Ждём предоплату, работы не начаты",
    deadlineState: "overdue", payStatus: "unpaid",
  },
];

type FilterKey = "all" | "mine" | "overdue" | "unpaid" | "inwork";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "mine", label: "Мои" },
  { key: "overdue", label: "Просроченные" },
  { key: "unpaid", label: "Без оплаты" },
  { key: "inwork", label: "В работе" },
];

const PAY_LABELS: Record<PayStatus, { label: string; color: string; bg: string }> = {
  paid:    { label: "Оплачен",   color: "#16a34a", bg: "#f0fdf4" },
  partial: { label: "Частично",  color: "#d97706", bg: "#fffbeb" },
  unpaid:  { label: "Не оплачен", color: "#dc2626", bg: "#fef2f2" },
};

const DEADLINE_ROW: Record<DeadlineState, string> = {
  overdue: "bg-red-50 hover:bg-red-100/60",
  soon:    "bg-amber-50/60 hover:bg-amber-100/40",
  ok:      "hover:bg-[#fafafa]",
  done:    "hover:bg-[#fafafa] opacity-70",
};

const miniStats = [
  { label: "Всего заказов",  value: String(orders.length), icon: "FileText", color: "#6b6b6b" },
  { label: "В работе",       value: String(orders.filter(o => ["Эскиз","Производство","Доставка"].includes(o.status)).length), icon: "Hammer", color: "#f59e0b" },
  { label: "Просрочено",     value: String(orders.filter(o => o.deadlineState === "overdue").length), icon: "AlertTriangle", color: "#ef4444" },
  { label: "Долг клиентов",  value: orders.filter(o => o.payStatus !== "paid").reduce((s,o) => s + (o.amount - o.paid), 0).toLocaleString("ru") + " ₽", icon: "CreditCard", color: "#6366f1" },
];

export default function OrdersPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [actionRow, setActionRow] = useState<string | null>(null);

  const applyFilter = (o: Order) => {
    if (filter === "mine") return o.manager === "Олег К.";
    if (filter === "overdue") return o.deadlineState === "overdue";
    if (filter === "unpaid") return o.payStatus !== "paid";
    if (filter === "inwork") return ["Эскиз","Производство"].includes(o.status);
    return true;
  };

  const applySearch = (o: Order) => {
    const q = search.toLowerCase();
    return !q || o.id.toLowerCase().includes(q) || o.client.toLowerCase().includes(q) || o.phone.includes(q);
  };

  const filtered = orders.filter(o => applyFilter(o) && applySearch(o));

  return (
    <div className="flex h-full min-h-0">
      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-7 pb-0 max-w-[1100px] w-full mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-[21px] font-semibold text-[#1a1a1a] tracking-tight">Заказы</h1>
              <p className="text-[13px] text-[#9b9b9b] mt-0.5">{filtered.length} из {orders.length}</p>
            </div>
            <button className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[13px] px-4 py-2 rounded-[8px] hover:bg-[#333] transition-colors">
              <Icon name="Plus" size={14} />
              Новый заказ
            </button>
          </div>

          {/* Mini-dashboard */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {miniStats.map((s) => (
              <div key={s.label} className="bg-white border border-[#ebebeb] rounded-xl px-4 py-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + "18" }}>
                  <Icon name={s.icon as never} size={15} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-[17px] font-semibold text-[#1a1a1a] leading-none mb-0.5">{s.value}</p>
                  <p className="text-[11px] text-[#9b9b9b]">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters + Search */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex gap-1 bg-white border border-[#ebebeb] rounded-[8px] p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
                    ${filter === f.key ? "bg-[#1a1a1a] text-white shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
                >
                  {f.label}
                  {f.key === "overdue" && <span className="ml-1.5 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5">
                    {orders.filter(o => o.deadlineState === "overdue").length}
                  </span>}
                  {f.key === "unpaid" && <span className="ml-1.5 text-[10px] bg-amber-500 text-white rounded-full px-1.5 py-0.5">
                    {orders.filter(o => o.payStatus !== "paid").length}
                  </span>}
                </button>
              ))}
            </div>
            <div className="relative flex-1 max-w-[280px]">
              <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5b5]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Номер, клиент, телефон..."
                className="w-full bg-white border border-[#ebebeb] rounded-[8px] pl-8 pr-3 py-2 text-[13px] text-[#1a1a1a] placeholder:text-[#c5c5c5] outline-none focus:border-[#c0c0c0] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="px-7 pb-7 max-w-[1100px] w-full mx-auto">
          <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0f0f0]">
                  {["Заказ / Клиент", "Изделие", "Дедлайн", "Статус", "Менеджер", "Оплата", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[13px] text-[#b5b5b5]">Заказы не найдены</td>
                  </tr>
                )}
                {filtered.map((o, i) => {
                  const pay = PAY_LABELS[o.payStatus];
                  const debt = o.amount - o.paid;
                  const isLast = i === filtered.length - 1;
                  return (
                    <tr
                      key={o.id}
                      onClick={() => setSelected(selected?.id === o.id ? null : o)}
                      onMouseEnter={() => setActionRow(o.id)}
                      onMouseLeave={() => setActionRow(null)}
                      className={`cursor-pointer transition-colors relative
                        ${DEADLINE_ROW[o.deadlineState]}
                        ${selected?.id === o.id ? "!bg-[#f0f4ff]" : ""}
                        ${!isLast ? "border-b border-[#f5f5f5]" : ""}
                      `}
                    >
                      {/* Заказ + Клиент */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 mb-0.5">
                          {o.deadlineState === "overdue" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                          )}
                          {o.deadlineState === "soon" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          )}
                          <span className="font-mono text-[12px] font-bold text-[#1a1a1a]">{o.id}</span>
                        </div>
                        <div className="text-[13px] font-medium text-[#1a1a1a]">{o.client}</div>
                        <div className="text-[11px] text-[#b5b5b5]">{o.phone}</div>
                        {o.comment && (
                          <div className="text-[11px] text-[#9b9b9b] mt-0.5 max-w-[180px] truncate" title={o.comment}>
                            {o.comment}
                          </div>
                        )}
                      </td>

                      {/* Изделие */}
                      <td className="px-4 py-3">
                        <div className="text-[12px] text-[#1a1a1a] font-medium">{o.stone}</div>
                        <div className="text-[11px] text-[#9b9b9b] font-mono">{o.size} см</div>
                        <div className="text-[11px] text-[#b5b5b5]">{o.design}</div>
                      </td>

                      {/* Дедлайн */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {o.deadlineState === "overdue" && (
                          <div className="text-[11px] font-semibold text-red-500 mb-0.5 flex items-center gap-1">
                            <Icon name="AlertTriangle" size={10} />просрочен
                          </div>
                        )}
                        {o.deadlineState === "soon" && (
                          <div className="text-[11px] font-semibold text-amber-500 mb-0.5">скоро</div>
                        )}
                        {o.deadlineState === "done" && (
                          <div className="text-[11px] text-[#9b9b9b] mb-0.5">выполнен</div>
                        )}
                        <div className={`text-[12px] font-medium ${o.deadlineState === "overdue" ? "text-red-600" : "text-[#1a1a1a]"}`}>
                          {o.deadline}
                        </div>
                        <div className="text-[11px] text-[#b5b5b5]">создан {o.date}</div>
                      </td>

                      {/* Статус */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold whitespace-nowrap" style={{ color: o.statusColor }}>
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: o.statusColor }} />
                          {o.status}
                        </span>
                      </td>

                      {/* Менеджер */}
                      <td className="px-4 py-3">
                        <span className="text-[11px] bg-[#f5f5f5] text-[#5b5b5b] px-2 py-1 rounded-md font-medium">
                          {o.manager}
                        </span>
                      </td>

                      {/* Оплата */}
                      <td className="px-4 py-3">
                        <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md mb-1"
                          style={{ color: pay.color, backgroundColor: pay.bg }}>
                          {pay.label}
                        </span>
                        <div className="text-[11px] text-[#1a1a1a] font-medium">{o.amount.toLocaleString("ru")} ₽</div>
                        {debt > 0 && (
                          <div className="text-[11px] text-red-500">долг {debt.toLocaleString("ru")} ₽</div>
                        )}
                      </td>

                      {/* Быстрые действия */}
                      <td className="px-3 py-3">
                        <div className={`flex items-center gap-1 transition-opacity ${actionRow === o.id ? "opacity-100" : "opacity-0"}`}>
                          <ActionBtn icon="Eye" title="Открыть" />
                          <ActionBtn icon="Pencil" title="Редактировать" />
                          <ActionBtn icon="Banknote" title="Добавить оплату" />
                          <ActionBtn icon="RefreshCw" title="Изменить статус" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Side panel */}
      {selected && (
        <div className="w-[300px] shrink-0 border-l border-[#ebebeb] bg-white overflow-y-auto animate-slide-in-right">
          <div className="p-5 border-b border-[#f5f5f5] flex items-center justify-between sticky top-0 bg-white z-10">
            <div>
              <span className="font-mono text-[12px] font-bold text-[#1a1a1a]">{selected.id}</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selected.statusColor }} />
                <span className="text-[12px] font-medium" style={{ color: selected.statusColor }}>{selected.status}</span>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors p-1">
              <Icon name="X" size={14} />
            </button>
          </div>

          <div className="p-5 space-y-5">
            <PanelSection title="Клиент">
              <PanelField label="Имя" value={selected.client} />
              <PanelField label="Телефон" value={selected.phone} />
            </PanelSection>

            <PanelSection title="Памятник">
              <PanelField label="Камень" value={selected.stone} />
              <PanelField label="Размер" value={`${selected.size} см`} />
              <PanelField label="Дизайн" value={selected.design} />
            </PanelSection>

            <PanelSection title="Надпись">
              <div className="bg-[#fafafa] border border-[#f0f0f0] rounded-lg p-3 text-[12px] text-[#1a1a1a] whitespace-pre-line leading-relaxed">
                {selected.inscription}
              </div>
            </PanelSection>

            <PanelSection title="Смета">
              <div className="space-y-2 bg-[#fafafa] border border-[#f0f0f0] rounded-lg p-3">
                {[
                  ["Изготовление", Math.round(selected.amount * 0.7)],
                  ["Гравировка",   Math.round(selected.amount * 0.2)],
                  ["Доставка",     Math.round(selected.amount * 0.1)],
                ].map(([l, v]) => (
                  <div key={String(l)} className="flex justify-between text-[12px]">
                    <span className="text-[#9b9b9b]">{l}</span>
                    <span className="text-[#1a1a1a]">{Number(v).toLocaleString("ru")} ₽</span>
                  </div>
                ))}
                <div className="border-t border-[#ebebeb] pt-2 flex justify-between text-[13px] font-semibold">
                  <span>Итого</span>
                  <span>{selected.amount.toLocaleString("ru")} ₽</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#9b9b9b]">Оплачено</span>
                  <span className="text-[#16a34a] font-medium">{selected.paid.toLocaleString("ru")} ₽</span>
                </div>
                {selected.amount - selected.paid > 0 && (
                  <div className="flex justify-between text-[12px]">
                    <span className="text-[#9b9b9b]">Долг</span>
                    <span className="text-red-500 font-semibold">{(selected.amount - selected.paid).toLocaleString("ru")} ₽</span>
                  </div>
                )}
              </div>
            </PanelSection>

            {selected.comment && (
              <PanelSection title="Комментарий">
                <p className="text-[12px] text-[#6b6b6b] leading-relaxed bg-amber-50 border border-amber-100 rounded-lg p-3">
                  {selected.comment}
                </p>
              </PanelSection>
            )}

            <PanelSection title="Дедлайн">
              <div className="flex items-center justify-between">
                <span className={`text-[13px] font-semibold ${selected.deadlineState === "overdue" ? "text-red-500" : "text-[#1a1a1a]"}`}>
                  {selected.deadline}
                </span>
                {selected.deadlineState === "overdue" && (
                  <span className="text-[11px] bg-red-50 text-red-500 px-2 py-0.5 rounded-md font-semibold">просрочен</span>
                )}
              </div>
            </PanelSection>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button className="flex items-center justify-center gap-2 bg-[#1a1a1a] text-white text-[12px] px-3 py-2.5 rounded-[8px] hover:bg-[#333] transition-colors">
                <Icon name="Pencil" size={12} /> Редактировать
              </button>
              <button className="flex items-center justify-center gap-2 bg-white border border-[#ebebeb] text-[#4b4b4b] text-[12px] px-3 py-2.5 rounded-[8px] hover:border-[#c5c5c5] transition-colors">
                <Icon name="Banknote" size={12} /> Оплата
              </button>
              <button className="flex items-center justify-center gap-2 bg-white border border-[#ebebeb] text-[#4b4b4b] text-[12px] px-3 py-2.5 rounded-[8px] hover:border-[#c5c5c5] transition-colors col-span-2">
                <Icon name="RefreshCw" size={12} /> Изменить статус
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ icon, title }: { icon: string; title: string }) {
  return (
    <button
      title={title}
      onClick={(e) => e.stopPropagation()}
      className="w-7 h-7 flex items-center justify-center rounded-[6px] bg-white border border-[#e5e5e5] text-[#6b6b6b] hover:text-[#1a1a1a] hover:border-[#c5c5c5] transition-all"
    >
      <Icon name={icon as never} size={12} />
    </button>
  );
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wider mb-2">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function PanelField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-3">
      <span className="text-[12px] text-[#9b9b9b] shrink-0">{label}</span>
      <span className="text-[12px] text-[#1a1a1a] text-right font-medium">{value}</span>
    </div>
  );
}
