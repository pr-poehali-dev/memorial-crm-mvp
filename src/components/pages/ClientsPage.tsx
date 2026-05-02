import { useState, useMemo } from "react";
import { clientsApi, DbClient } from "@/api/client";
import { useApiData } from "@/api/useApiData";
import ClientsTable from "./clients/ClientsTable";
import ClientOverlay from "./clients/ClientOverlay";

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

function dbToClient(c: DbClient): Client {
  return {
    id:      String(c.id),
    name:    c.name,
    phone:   c.phone || "",
    city:    c.city  || "",
    address: c.address || "",
    orders:  Number(c.orders_count || 0),
    total:   Number(c.total_amount || 0),
    paid:    Number(c.total_paid || 0),
    last:    c.last_order_date ? new Date(c.last_order_date).toLocaleDateString("ru-RU") : "",
    active:  c.active,
    comment: c.comment || "",
    manager: c.manager || "",
    since:   c.since_label || "",
  };
}

export default function ClientsPage({ onOpenClient: _onOpenClient }: { onOpenClient?: (id: string) => void }) {
  const [search, setSearch]             = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [selected, setSelected]         = useState<Client | null>(null);

  const { data: rawClients, loading } = useApiData(() => clientsApi.list());
  const clients: Client[] = useMemo(() => (rawClients || []).map(dbToClient), [rawClients]);

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || (c.phone||"").includes(q) || (c.city||"").toLowerCase().includes(q);
    const matchFilter = filterActive === "all" || (filterActive === "active" ? c.active : !c.active);
    return matchSearch && matchFilter;
  });

  const totalDebt   = clients.reduce((s, c) => s + (c.total - c.paid), 0);
  const activeCount = clients.filter(c => c.active).length;
  const debtClients = clients.filter(c => c.total - c.paid > 0).length;

  return (
    <div className="p-7 max-w-[1060px] mx-auto w-full space-y-5">
      <ClientsTable
        clients={clients}
        filtered={filtered}
        selected={selected}
        totalDebt={totalDebt}
        activeCount={activeCount}
        debtClients={debtClients}
        loading={loading}
        search={search}
        filterActive={filterActive}
        onSearchChange={setSearch}
        onFilterChange={setFilterActive}
        onSelect={setSelected}
      />

      {selected && (
        <ClientOverlay client={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
