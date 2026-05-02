import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import {
  CATEGORY_META, CatalogCategory, CatalogItem, CalcType,
} from "@/data/catalog";
import { catalogApi, DbCatalogItem } from "@/api/client";
import CatalogTable from "./catalog/CatalogTable";
import CatalogDetailPanel from "./catalog/CatalogDetailPanel";

function dbToCatalog(c: DbCatalogItem): CatalogItem {
  return {
    id: c.id, name: c.name,
    category: c.category as CatalogCategory,
    unit: c.unit, price: Number(c.price), cost: Number(c.cost),
    calcType: c.calc_type as CalcType, active: c.active,
    comment: c.comment || "", usedInOrders: c.used_in_orders || 0,
    createdBy: c.created_by || "", updatedAt: "",
    stockQty: c.stock_qty || 0,
  };
}

type FilterCat = CatalogCategory | "all";

const ALL_CATS: { id: FilterCat; label: string }[] = [
  { id: "all", label: "Все" },
  ...Object.entries(CATEGORY_META).map(([id, m]) => ({ id: id as CatalogCategory, label: m.label })),
];

function uid() { return Math.random().toString(36).slice(2, 8); }

export default function CatalogPage({ canEdit = true }: { canEdit?: boolean }) {
  const [items, setItems]         = useState<CatalogItem[]>([]);

  useEffect(() => {
    catalogApi.list().then(data => setItems(data.map(dbToCatalog))).catch(console.error);
  }, []);

  const [filterCat, setFilterCat]       = useState<FilterCat>("all");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch]             = useState("");
  const [selected, setSelected]         = useState<CatalogItem | null>(null);
  const [editing, setEditing]           = useState<CatalogItem | null>(null);
  const [hovered, setHovered]           = useState<string | null>(null);

  const filtered = items.filter(i => {
    const matchCat    = filterCat === "all" || i.category === filterCat;
    const matchActive = filterActive === "all" || (filterActive === "active" ? i.active : !i.active);
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchActive && matchSearch;
  });

  const totalActive  = items.filter(i => i.active).length;
  const totalOrders  = items.reduce((s, i) => s + i.usedInOrders, 0);
  const avgMargin    = Math.round(items.filter(i => i.price > 0).reduce((s, i) => s + ((i.price - i.cost) / i.price) * 100, 0) / items.filter(i => i.price > 0).length);
  const needsCalcCnt = items.filter(i => i.calcType === "manual" || i.calcType === "formula").length;

  const toggleActive = (id: string) =>
    setItems(its => its.map(x => x.id === id ? { ...x, active: !x.active } : x));

  const saveEdit = (item: CatalogItem) => {
    setItems(its => its.map(x => x.id === item.id ? item : x));
    setEditing(null);
    setSelected(item);
  };

  const addNew = () => {
    const newItem: CatalogItem = {
      id: uid(), name: "Новая позиция", category: "other", unit: "шт.",
      price: 0, cost: 0, calcType: "fixed", active: true,
      comment: "", usedInOrders: 0, createdBy: "Дмитрий С.", updatedAt: "сейчас",
    };
    setItems(its => [newItem, ...its]);
    setEditing(newItem);
  };

  return (
    <div className="flex h-full overflow-hidden">

      {/* Main */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-7 max-w-[1060px] mx-auto w-full space-y-5">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[21px] font-semibold text-[#1a1a1a] tracking-tight">Каталог</h1>
              <p className="text-[13px] text-[#9b9b9b] mt-0.5">Справочник изделий и услуг компании</p>
            </div>
            {canEdit && (
              <button onClick={addNew}
                className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[13px] px-4 py-2 rounded-[8px] hover:bg-[#333] transition-colors">
                <Icon name="Plus" size={14} />Добавить позицию
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: "Layers",     color: "#6b6b6b", label: "Позиций в каталоге", value: String(totalActive),  sub: `${items.length} всего` },
              { icon: "FileText",   color: "#6366f1", label: "Использований",       value: String(totalOrders),  sub: "в заказах" },
              { icon: "TrendingUp", color: "#16a34a", label: "Средняя маржа",       value: `${avgMargin}%`,      sub: "по каталогу" },
              { icon: "Calculator", color: "#d97706", label: "Ручной расчёт",       value: String(needsCalcCnt), sub: "позиций" },
            ].map(s => (
              <div key={s.label} className="bg-white border border-[#ebebeb] rounded-xl px-4 py-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + "18" }}>
                  <Icon name={s.icon as never} size={15} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-[18px] font-bold text-[#1a1a1a] leading-none mb-0.5">{s.value}</p>
                  <p className="text-[11px] text-[#9b9b9b]">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Category scroll */}
            <div className="flex gap-1 bg-white border border-[#ebebeb] rounded-[8px] p-1 overflow-x-auto">
              {ALL_CATS.map(c => {
                const cnt = c.id === "all" ? items.length : items.filter(i => i.category === c.id).length;
                return (
                  <button key={c.id} onClick={() => setFilterCat(c.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] text-[11px] font-medium whitespace-nowrap transition-all
                      ${filterCat === c.id ? "bg-[#1a1a1a] text-white" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}>
                    {c.label}
                    <span className={`text-[10px] px-1 rounded font-bold ${filterCat === c.id ? "bg-white/20 text-white" : "bg-[#f0f0f0] text-[#9b9b9b]"}`}>{cnt}</span>
                  </button>
                );
              })}
            </div>

            {/* Active filter */}
            <div className="flex gap-1 bg-white border border-[#ebebeb] rounded-[8px] p-1">
              {(["all","active","inactive"] as const).map(f => (
                <button key={f} onClick={() => setFilterActive(f)}
                  className={`px-2.5 py-1.5 rounded-[6px] text-[11px] font-medium transition-all
                    ${filterActive === f ? "bg-[#1a1a1a] text-white" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}>
                  {f === "all" ? "Все" : f === "active" ? "Активные" : "Неактивные"}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-[240px]">
              <Icon name="Search" size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5b5]" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Поиск по названию..."
                className="w-full bg-white border border-[#ebebeb] rounded-[8px] pl-8 pr-3 py-2 text-[12px] placeholder:text-[#c5c5c5] outline-none focus:border-[#c0c0c0] transition-colors" />
            </div>
          </div>

          {/* Table */}
          <CatalogTable
            filtered={filtered}
            selected={selected}
            hovered={hovered}
            canEdit={canEdit}
            onSelect={item => { setSelected(item); setEditing(null); }}
            onHover={setHovered}
            onEdit={item => { setEditing({ ...item }); setSelected(item); }}
            onToggle={toggleActive}
          />
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <CatalogDetailPanel
          selected={selected}
          editing={editing}
          canEdit={canEdit}
          onEdit={() => setEditing({ ...selected })}
          onClose={() => setSelected(null)}
          onToggle={() => toggleActive(selected.id)}
          onEditChange={setEditing}
          onSave={saveEdit}
          onCancelEdit={() => setEditing(null)}
        />
      )}
    </div>
  );
}
