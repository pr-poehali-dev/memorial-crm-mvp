import { useState, useMemo } from "react";
import { clientsApi } from "@/api/client";
import { dbToClient } from "@/lib/converters";
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



export default function ClientsPage({ onOpenClient: _onOpenClient }: { onOpenClient?: (id: string) => void }) {
  const [search, setSearch]             = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [selected, setSelected]         = useState<Client | null>(null);

  const { data: rawClients, loading } = useApiData(() => clientsApi.list(), [], "clients:list");
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