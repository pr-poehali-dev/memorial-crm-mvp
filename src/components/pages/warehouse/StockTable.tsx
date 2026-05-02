import { useState } from "react";
import Icon from "@/components/ui/icon";
import { StockItem, inputCls } from "./warehouse.types";
import { CATEGORY_META } from "@/data/catalog";

const CATEGORY_LABELS: Record<string, string> = {
  monument:  "Памятники",
  pedestal:  "Тумбы",
  flowerbed: "Цветники",
  fence:     "Ограды",
  coffin:    "Гробы",
  cross:     "Кресты",
  art:       "Художественные работы",
  service:   "Услуги",
  other:     "Прочее",
};

type Props = {
  items: StockItem[];
  onAdd: (item: StockItem) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
};

export default function StockTable({ items, onAdd, onUpdateQty, onRemove }: Props) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [showAdd, setShowAdd] = useState(false);

  /* форма добавления */
  const [formName,  setFormName]  = useState("");
  const [formCat,   setFormCat]   = useState("monument");
  const [formQty,   setFormQty]   = useState("1");
  const [formPrice, setFormPrice] = useState("");
  const [formNote,  setFormNote]  = useState("");

  const filtered = items.filter(it => {
    const matchSearch = it.name.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === "all" || it.category === catFilter;
    return matchSearch && matchCat;
  });

  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const totalVal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const cats     = [...new Set(items.map(i => i.category))];

  const handleAdd = () => {
    if (!formName.trim() || !formPrice) return;
    onAdd({
      id:        "st-" + Date.now(),
      catalogId: "",
      name:      formName.trim(),
      category:  formCat,
      qty:       parseInt(formQty) || 1,
      price:     parseFloat(formPrice),
      addedAt:   new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "short" }),
      note:      formNote.trim() || undefined,
    });
    setFormName(""); setFormCat("monument"); setFormQty("1"); setFormPrice(""); setFormNote("");
    setShowAdd(false);
  };

  return (
    <div className="space-y-4">

      {/* ── Мини-статы ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-[#ebebeb] rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#eef2ff] flex items-center justify-center shrink-0">
            <Icon name="Package" size={15} className="text-[#6366f1]" />
          </div>
          <div>
            <p className="text-[17px] font-semibold text-[#1a1a1a] leading-none">{items.length}</p>
            <p className="text-[11px] text-[#9b9b9b]">Позиций</p>
          </div>
        </div>
        <div className="bg-white border border-[#ebebeb] rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] flex items-center justify-center shrink-0">
            <Icon name="Layers" size={15} className="text-[#16a34a]" />
          </div>
          <div>
            <p className="text-[17px] font-semibold text-[#1a1a1a] leading-none">{totalQty}</p>
            <p className="text-[11px] text-[#9b9b9b]">Единиц итого</p>
          </div>
        </div>
        <div className="bg-white border border-[#ebebeb] rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#fffbeb] flex items-center justify-center shrink-0">
            <Icon name="Banknote" size={15} className="text-[#d97706]" />
          </div>
          <div>
            <p className="text-[17px] font-semibold text-[#1a1a1a] leading-none">{(totalVal / 1000).toFixed(0)} тыс. ₽</p>
            <p className="text-[11px] text-[#9b9b9b]">Стоимость склада</p>
          </div>
        </div>
      </div>

      {/* ── Фильтры + кнопка ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-0.5 bg-[#f4f4f4] rounded-[9px] p-0.5 shrink-0">
          <button
            onClick={() => setCatFilter("all")}
            className={`px-3 py-1.5 rounded-[7px] text-[12px] font-medium transition-all ${catFilter === "all" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
          >
            Все
          </button>
          {cats.map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-[7px] text-[12px] font-medium transition-all whitespace-nowrap ${catFilter === c ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
            >
              {CATEGORY_LABELS[c] ?? c}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-[220px]">
          <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5b5]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="w-full bg-white border border-[#ebebeb] rounded-[8px] pl-8 pr-3 py-2 text-[13px] placeholder:text-[#c5c5c5] outline-none focus:border-[#c0c0c0] transition-colors"
          />
        </div>

        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-2 ml-auto bg-[#1a1a1a] text-white text-[13px] px-4 py-2 rounded-[8px] hover:bg-[#333] transition-colors shrink-0"
        >
          <Icon name="Plus" size={14} />
          Добавить изделие
        </button>
      </div>

      {/* ── Форма добавления ── */}
      {showAdd && (
        <div className="bg-[#fafafa] border border-[#ebebeb] rounded-xl p-4">
          <p className="text-[12px] font-semibold text-[#1a1a1a] mb-3">Новое изделие на склад</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] text-[#6b6b6b] mb-1">Название *</label>
              <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Памятник стандартный..." className={inputCls} />
            </div>
            <div>
              <label className="block text-[11px] text-[#6b6b6b] mb-1">Категория</label>
              <select value={formCat} onChange={e => setFormCat(e.target.value)} className={inputCls}>
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-[#6b6b6b] mb-1">Кол-во (шт.) *</label>
              <input type="number" min={1} value={formQty} onChange={e => setFormQty(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-[11px] text-[#6b6b6b] mb-1">Цена (₽) *</label>
              <input type="number" min={0} value={formPrice} onChange={e => setFormPrice(e.target.value)} placeholder="22000" className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="block text-[11px] text-[#6b6b6b] mb-1">Примечание</label>
              <input value={formNote} onChange={e => setFormNote(e.target.value)} placeholder="Необязательно..." className={inputCls} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-[8px] border border-[#ebebeb] text-[12px] text-[#6b6b6b] hover:border-[#c5c5c5] transition-colors">Отмена</button>
            <button
              onClick={handleAdd}
              disabled={!formName.trim() || !formPrice}
              className="flex-1 py-2 rounded-[8px] bg-[#1a1a1a] text-white text-[12px] font-semibold hover:bg-[#333] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Добавить
            </button>
          </div>
        </div>
      )}

      {/* ── Таблица ── */}
      <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f0f0f0]">
              {["Изделие", "Категория", "На складе", "Цена / шт.", "Стоимость", "Добавлено", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[13px] text-[#b5b5b5]">
                  {items.length === 0 ? "Склад пуст — добавьте первое изделие" : "Ничего не найдено"}
                </td>
              </tr>
            )}
            {filtered.map((item, i) => {
              const catMeta = CATEGORY_META[item.category as keyof typeof CATEGORY_META];
              const isLast  = i === filtered.length - 1;
              return (
                <tr key={item.id} className={`transition-colors hover:bg-[#fafafa] ${!isLast ? "border-b border-[#f5f5f5]" : ""}`}>

                  {/* Изделие */}
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-medium text-[#1a1a1a]">{item.name}</p>
                    {item.note && <p className="text-[11px] text-[#9b9b9b] mt-0.5">{item.note}</p>}
                  </td>

                  {/* Категория */}
                  <td className="px-4 py-3">
                    {catMeta ? (
                      <span
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap"
                        style={{ color: catMeta.color, backgroundColor: catMeta.bg }}
                      >
                        {catMeta.label}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#9b9b9b]">{CATEGORY_LABELS[item.category] ?? item.category}</span>
                    )}
                  </td>

                  {/* Кол-во — с кнопками */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQty(item.id, -1)}
                        disabled={item.qty <= 0}
                        className="w-6 h-6 rounded-md border border-[#e8e8e8] flex items-center justify-center text-[#6b6b6b] hover:border-[#c0c0c0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Icon name="Minus" size={10} />
                      </button>
                      <span className="font-mono text-[15px] font-bold text-[#1a1a1a] w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => onUpdateQty(item.id, 1)}
                        className="w-6 h-6 rounded-md border border-[#e8e8e8] flex items-center justify-center text-[#6b6b6b] hover:border-[#c0c0c0] transition-colors"
                      >
                        <Icon name="Plus" size={10} />
                      </button>
                      <span className="text-[11px] text-[#9b9b9b]">шт.</span>
                      {item.qty === 0 && (
                        <span className="text-[10px] font-bold bg-red-100 text-red-500 px-1.5 py-0.5 rounded">нет</span>
                      )}
                    </div>
                  </td>

                  {/* Цена */}
                  <td className="px-4 py-3 text-[13px] font-mono text-[#1a1a1a] whitespace-nowrap">
                    {item.price.toLocaleString("ru")} ₽
                  </td>

                  {/* Стоимость */}
                  <td className="px-4 py-3 text-[13px] font-semibold font-mono text-[#1a1a1a] whitespace-nowrap">
                    {(item.qty * item.price).toLocaleString("ru")} ₽
                  </td>

                  {/* Дата */}
                  <td className="px-4 py-3 text-[12px] text-[#9b9b9b] whitespace-nowrap">{item.addedAt}</td>

                  {/* Удалить */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-[#c0c0c0] hover:text-red-400 transition-colors"
                      title="Убрать со склада"
                    >
                      <Icon name="Trash2" size={13} />
                    </button>
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
