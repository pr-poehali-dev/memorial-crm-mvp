import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  CATALOG, CATEGORY_META, CALC_TYPE_META,
  CatalogCategory, CatalogItem, CalcType,
} from "@/data/catalog";

type FilterCat = CatalogCategory | "all";
type View = "table" | "detail";

const ALL_CATS: { id: FilterCat; label: string }[] = [
  { id: "all", label: "Все" },
  ...Object.entries(CATEGORY_META).map(([id, m]) => ({ id: id as CatalogCategory, label: m.label })),
];

function uid() { return Math.random().toString(36).slice(2, 8); }

export default function CatalogPage({ canEdit = true }: { canEdit?: boolean }) {
  const [items, setItems]         = useState<CatalogItem[]>(CATALOG);
  const [filterCat, setFilterCat] = useState<FilterCat>("all");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch]       = useState("");
  const [view, setView]           = useState<View>("table");
  const [selected, setSelected]   = useState<CatalogItem | null>(null);
  const [editing, setEditing]     = useState<CatalogItem | null>(null);
  const [showNew, setShowNew]     = useState(false);
  const [hovered, setHovered]     = useState<string | null>(null);

  const filtered = items.filter(i => {
    const matchCat    = filterCat === "all" || i.category === filterCat;
    const matchActive = filterActive === "all" || (filterActive === "active" ? i.active : !i.active);
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchActive && matchSearch;
  });

  const totalActive   = items.filter(i => i.active).length;
  const totalOrders   = items.reduce((s, i) => s + i.usedInOrders, 0);
  const avgMargin     = Math.round(items.filter(i => i.price > 0).reduce((s, i) => s + ((i.price - i.cost) / i.price) * 100, 0) / items.filter(i => i.price > 0).length);
  const needsCalcCnt  = items.filter(i => i.calcType === "manual" || i.calcType === "formula").length;

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
    setShowNew(false);
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
              { icon: "Layers",        color: "#6b6b6b", label: "Позиций в каталоге",  value: String(totalActive),   sub: `${items.length} всего` },
              { icon: "FileText",      color: "#6366f1", label: "Использований",        value: String(totalOrders),   sub: "в заказах" },
              { icon: "TrendingUp",    color: "#16a34a", label: "Средняя маржа",        value: `${avgMargin}%`,       sub: "по каталогу" },
              { icon: "Calculator",    color: "#d97706", label: "Ручной расчёт",        value: String(needsCalcCnt),  sub: "позиций" },
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
          <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0f0f0]">
                  {["Позиция", "Категория", "Ед.", "Цена", "Себ-сть", "Маржа", "Расчёт", "Исп.", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-[13px] text-[#b5b5b5]">Позиции не найдены</td></tr>
                )}
                {filtered.map((item, i) => {
                  const catM  = CATEGORY_META[item.category];
                  const calcM = CALC_TYPE_META[item.calcType];
                  const margin = item.price > 0 ? Math.round(((item.price - item.cost) / item.price) * 100) : null;
                  const isLast = i === filtered.length - 1;

                  return (
                    <tr key={item.id}
                      onClick={() => { setSelected(item); setEditing(null); }}
                      onMouseEnter={() => setHovered(item.id)}
                      onMouseLeave={() => setHovered(null)}
                      className={`cursor-pointer transition-colors
                        ${!item.active ? "opacity-50" : ""}
                        ${selected?.id === item.id ? "bg-[#f0f4ff]" : "hover:bg-[#fafafa]"}
                        ${!isLast ? "border-b border-[#f5f5f5]" : ""}`}>

                      {/* Позиция */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: catM.color + "50" }} />
                          <div>
                            <p className="text-[13px] font-semibold text-[#1a1a1a]">{item.name}</p>
                            {item.comment && (
                              <p className="text-[11px] text-[#b5b5b5] truncate max-w-[180px]">{item.comment}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Категория */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md"
                          style={{ color: catM.color, backgroundColor: catM.bg }}>
                          {catM.label}
                        </span>
                      </td>

                      {/* Ед. */}
                      <td className="px-4 py-3 text-[12px] text-[#9b9b9b]">{item.unit}</td>

                      {/* Цена */}
                      <td className="px-4 py-3">
                        {item.price > 0
                          ? <span className="text-[13px] font-semibold text-[#1a1a1a]">{item.price.toLocaleString("ru")} ₽</span>
                          : <span className="text-[11px] text-[#d97706] font-semibold bg-amber-50 px-1.5 py-0.5 rounded-md">расчёт</span>}
                      </td>

                      {/* Себестоимость */}
                      <td className="px-4 py-3 text-[12px] text-[#9b9b9b] font-mono">
                        {item.cost > 0 ? `${item.cost.toLocaleString("ru")} ₽` : "—"}
                      </td>

                      {/* Маржа */}
                      <td className="px-4 py-3">
                        {margin !== null
                          ? <span className={`text-[12px] font-bold ${margin >= 40 ? "text-[#16a34a]" : margin >= 20 ? "text-[#d97706]" : "text-red-500"}`}>{margin}%</span>
                          : <span className="text-[#c5c5c5]">—</span>}
                      </td>

                      {/* Тип расчёта */}
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md border"
                          style={{ color: calcM.color, borderColor: calcM.color + "40", backgroundColor: calcM.color + "10" }}>
                          {calcM.label}
                        </span>
                      </td>

                      {/* Использований */}
                      <td className="px-4 py-3">
                        <span className="text-[12px] font-semibold text-[#6b6b6b]">{item.usedInOrders}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3">
                        <div className={`flex items-center gap-1 transition-opacity ${hovered === item.id ? "opacity-100" : "opacity-0"}`}>
                          <IABtn icon="Eye" title="Открыть" onClick={e => { e.stopPropagation(); setSelected(item); }} />
                          {canEdit && (
                            <IABtn icon="Pencil" title="Редактировать" onClick={e => { e.stopPropagation(); setEditing({...item}); setSelected(item); }} />
                          )}
                          <IABtn icon={item.active ? "EyeOff" : "Eye"} title={item.active ? "Деактивировать" : "Активировать"}
                            onClick={e => { e.stopPropagation(); toggleActive(item.id); }} />
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

      {/* Detail panel */}
      {selected && (
        <div className="w-[300px] shrink-0 border-l border-[#ebebeb] bg-white overflow-y-auto animate-slide-in-right">
          {editing?.id === selected.id
            ? <EditForm item={editing} onChange={setEditing} onSave={saveEdit} onCancel={() => setEditing(null)} />
            : <DetailPanel item={selected} canEdit={canEdit}
                onEdit={() => setEditing({...selected})}
                onClose={() => setSelected(null)}
                onToggle={() => toggleActive(selected.id)} />
          }
        </div>
      )}
    </div>
  );
}

/* ─── Detail Panel ─── */
function DetailPanel({ item, canEdit, onEdit, onClose, onToggle }: {
  item: CatalogItem; canEdit: boolean;
  onEdit: () => void; onClose: () => void; onToggle: () => void;
}) {
  const catM  = CATEGORY_META[item.category];
  const calcM = CALC_TYPE_META[item.calcType];
  const margin = item.price > 0 ? Math.round(((item.price - item.cost) / item.price) * 100) : null;

  return (
    <>
      <div className="px-5 py-4 border-b border-[#f5f5f5] sticky top-0 bg-white z-10 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[#1a1a1a] leading-snug">{item.name}</p>
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md mt-1"
            style={{ color: catM.color, backgroundColor: catM.bg }}>
            {catM.label}
          </span>
        </div>
        <button onClick={onClose} className="text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors shrink-0 pt-0.5">
          <Icon name="X" size={14} />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-lg
            ${item.active ? "bg-green-50 text-green-700" : "bg-[#f5f5f5] text-[#9b9b9b]"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${item.active ? "bg-green-400" : "bg-[#c5c5c5]"}`} />
            {item.active ? "Активна" : "Неактивна"}
          </span>
          <span className="text-[11px] text-[#b5b5b5]">обновлено {item.updatedAt}</span>
        </div>

        {/* Price block */}
        <PanelSection title="Цена и себестоимость">
          <div className="bg-[#fafafa] border border-[#f0f0f0] rounded-xl p-4 space-y-2.5">
            <PRow label="Цена продажи"  value={item.price > 0 ? `${item.price.toLocaleString("ru")} ₽` : "ручной расчёт"} bold />
            <PRow label="Себестоимость" value={item.cost > 0  ? `${item.cost.toLocaleString("ru")} ₽`  : "—"} />
            {margin !== null && (
              <div className="border-t border-[#ebebeb] pt-2.5">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[12px] text-[#9b9b9b]">Маржа</span>
                  <span className={`text-[15px] font-bold ${margin >= 40 ? "text-[#16a34a]" : margin >= 20 ? "text-[#d97706]" : "text-red-500"}`}>{margin}%</span>
                </div>
                <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100,margin)}%`, backgroundColor: margin >= 40 ? "#22c55e" : margin >= 20 ? "#f59e0b" : "#ef4444" }} />
                </div>
              </div>
            )}
          </div>
        </PanelSection>

        {/* Calc type */}
        <PanelSection title="Тип расчёта">
          <div className="flex items-start gap-3 p-3 rounded-xl border"
            style={{ borderColor: calcM.color + "30", backgroundColor: calcM.color + "08" }}>
            <Icon name="Calculator" size={14} className="mt-0.5 shrink-0" style={{ color: calcM.color }} />
            <div>
              <p className="text-[13px] font-semibold" style={{ color: calcM.color }}>{calcM.label}</p>
              <p className="text-[11px] text-[#9b9b9b] mt-0.5">{calcM.hint}</p>
            </div>
          </div>
        </PanelSection>

        {/* Meta */}
        <PanelSection title="Информация">
          <PRow label="Единица"  value={item.unit} />
          <PRow label="Применений" value={`${item.usedInOrders} заказов`} />
          <PRow label="Добавил"  value={item.createdBy} />
        </PanelSection>

        {item.comment && (
          <PanelSection title="Комментарий">
            <p className="text-[12px] text-[#4b4b4b] bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 leading-relaxed">{item.comment}</p>
          </PanelSection>
        )}

        {/* Materials stub */}
        <PanelSection title="Связанные материалы">
          <div className="flex items-center gap-2 p-3 bg-[#fafafa] border border-dashed border-[#e0e0e0] rounded-xl">
            <Icon name="Package" size={13} className="text-[#c5c5c5]" />
            <span className="text-[12px] text-[#b5b5b5]">Материалы будут добавлены позже</span>
          </div>
        </PanelSection>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button className="w-full flex items-center justify-center gap-2 text-[12px] bg-[#1a1a1a] text-white py-2.5 rounded-[8px] hover:bg-[#333] transition-colors">
            <Icon name="Plus" size={12} />Добавить в заказ
          </button>
          {canEdit && (
            <>
              <button onClick={onEdit}
                className="w-full flex items-center justify-center gap-2 text-[12px] border border-[#ebebeb] text-[#4b4b4b] py-2.5 rounded-[8px] hover:border-[#c5c5c5] transition-colors">
                <Icon name="Pencil" size={12} />Редактировать
              </button>
              <button onClick={onToggle}
                className="w-full flex items-center justify-center gap-2 text-[12px] border border-[#ebebeb] text-[#9b9b9b] py-2.5 rounded-[8px] hover:border-[#c5c5c5] transition-colors">
                <Icon name={item.active ? "EyeOff" : "Eye"} size={12} />
                {item.active ? "Деактивировать" : "Активировать"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── Edit Form ─── */
function EditForm({ item, onChange, onSave, onCancel }: {
  item: CatalogItem;
  onChange: (item: CatalogItem) => void;
  onSave: (item: CatalogItem) => void;
  onCancel: () => void;
}) {
  const set = <K extends keyof CatalogItem>(k: K, v: CatalogItem[K]) => onChange({ ...item, [k]: v });

  return (
    <>
      <div className="px-5 py-4 border-b border-[#f5f5f5] sticky top-0 bg-white z-10 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-[#1a1a1a]">Редактировать</p>
        <button onClick={onCancel} className="text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors">
          <Icon name="X" size={14} />
        </button>
      </div>
      <div className="p-5 space-y-4">
        <EField label="Название *" value={item.name} onChange={v => set("name", v)} />

        <div>
          <label className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide block mb-1.5">Категория</label>
          <select value={item.category} onChange={e => set("category", e.target.value as CatalogCategory)}
            className="w-full bg-[#fafafa] border border-[#ebebeb] rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#c0c0c0] transition-colors cursor-pointer">
            {Object.entries(CATEGORY_META).map(([k, m]) => (
              <option key={k} value={k}>{m.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <EField label="Ед. изм." value={item.unit} onChange={v => set("unit", v)} />
          <div>
            <label className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide block mb-1.5">Тип расчёта</label>
            <select value={item.calcType} onChange={e => set("calcType", e.target.value as CalcType)}
              className="w-full bg-[#fafafa] border border-[#ebebeb] rounded-lg px-3 py-2.5 text-[12px] outline-none focus:border-[#c0c0c0] transition-colors cursor-pointer">
              {Object.entries(CALC_TYPE_META).map(([k, m]) => (
                <option key={k} value={k}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <EField label="Цена (₽)" value={String(item.price)} onChange={v => set("price", Number(v))} type="number" />
          <EField label="Себ-сть (₽)" value={String(item.cost)} onChange={v => set("cost", Number(v))} type="number" />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide block mb-1.5">Комментарий</label>
          <textarea value={item.comment} onChange={e => set("comment", e.target.value)} rows={2}
            className="w-full bg-[#fafafa] border border-[#ebebeb] rounded-lg px-3 py-2.5 text-[12px] placeholder:text-[#c5c5c5] outline-none focus:border-[#c0c0c0] resize-none transition-colors" />
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-[13px] text-[#4b4b4b]">Активная позиция</span>
          <button onClick={() => set("active", !item.active)}
            className={`relative w-9 h-5 rounded-full transition-colors ${item.active ? "bg-[#1a1a1a]" : "bg-[#e5e5e5]"}`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${item.active ? "left-[18px]" : "left-0.5"}`} />
          </button>
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={() => onSave(item)}
            className="flex-1 bg-[#1a1a1a] text-white text-[13px] py-2.5 rounded-[8px] hover:bg-[#333] transition-colors flex items-center justify-center gap-2">
            <Icon name="Check" size={13} />Сохранить
          </button>
          <button onClick={onCancel}
            className="flex-1 border border-[#ebebeb] text-[#6b6b6b] text-[13px] py-2.5 rounded-[8px] hover:border-[#c5c5c5] transition-colors">
            Отмена
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Helpers ─── */
function IABtn({ icon, title, onClick }: { icon: string; title: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button title={title} onClick={onClick}
      className="w-7 h-7 flex items-center justify-center rounded-[6px] bg-white border border-[#e5e5e5] text-[#6b6b6b] hover:text-[#1a1a1a] hover:border-[#c5c5c5] transition-all">
      <Icon name={icon as never} size={12} />
    </button>
  );
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wider mb-2">{title}</p>
      {children}
    </div>
  );
}

function PRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[12px] text-[#9b9b9b]">{label}</span>
      <span className={`text-[12px] ${bold ? "font-bold text-[#1a1a1a]" : "font-medium text-[#6b6b6b]"}`}>{value}</span>
    </div>
  );
}

function EField({ label, value, onChange, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide block mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-[#fafafa] border border-[#ebebeb] rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#c0c0c0] transition-colors" />
    </div>
  );
}
