import { useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { CATALOG as CATALOG_DATA, CATEGORY_META } from "@/data/catalog";

/* ─────────── Types ─────────── */
type ItemStatus = "by_manager" | "needs_calc" | "calculated" | "approved";
type Category   = string;

type LineItem = {
  id: string;
  name: string;
  category: Category;
  qty: number;
  unit: string;
  price: number;
  cost: number;
  status: ItemStatus;
  author: string;
  locked: boolean;
  note: string;
};

/* ─────────── Constants ─────────── */
const STATUS_META: Record<ItemStatus, { label: string; color: string; bg: string; border: string; icon: string }> = {
  by_manager:  { label: "Менеджер",       color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe", icon: "Pencil"      },
  needs_calc:  { label: "Нужен расчёт",  color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "Calculator"  },
  calculated:  { label: "Посчитано",     color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc", icon: "CheckCircle2" },
  approved:    { label: "Утверждено",    color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0", icon: "BadgeCheck"   },
};

const CAT_META = (cat: string) => CATEGORY_META[cat as keyof typeof CATEGORY_META] ?? { label: cat, color: "#9b9b9b" };

const INIT_ITEMS: LineItem[] = [
  { id: "1", name: "Изготовление памятника (базовый)", category: "stone",     qty: 1, unit: "шт.",     price: 22000, cost: 12000, status: "approved",    author: "Олег К.",    locked: true,  note: "" },
  { id: "2", name: "Гравировка надписи",               category: "engraving", qty: 1, unit: "шт.",     price: 6500,  cost: 2800,  status: "approved",    author: "Олег К.",    locked: true,  note: "" },
  { id: "3", name: "Портретное фото",                  category: "engraving", qty: 1, unit: "шт.",     price: 0,     cost: 0,     status: "needs_calc",  author: "Олег К.",    locked: false, note: "Уточнить: цветное или ч/б" },
  { id: "4", name: "Доставка до кладбища",             category: "delivery",  qty: 1, unit: "поезд.",  price: 3500,  cost: 1800,  status: "by_manager",  author: "Анна М.",    locked: false, note: "" },
  { id: "5", name: "Установка памятника",              category: "delivery",  qty: 1, unit: "шт.",     price: 0,     cost: 0,     status: "needs_calc",  author: "Анна М.",    locked: false, note: "Зависит от расстояния" },
];

function uid() { return Math.random().toString(36).slice(2, 8); }

/* ─────────── Component ─────────── */
export default function EstimatePage({ onBack }: { onBack?: () => void }) {
  const [items, setItems]     = useState<LineItem[]>(INIT_ITEMS);
  const [editId, setEditId]   = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ItemStatus | "all">("all");
  const [saved, setSaved]     = useState(false);
  const [approved, setApproved] = useState(false);

  const update = useCallback(<K extends keyof LineItem>(id: string, field: K, val: LineItem[K]) =>
    setItems(its => its.map(x => x.id === id ? { ...x, [field]: val } : x)), []);

  const addFromCatalog = (cat: typeof CATALOG_DATA[number]) => {
    setItems(its => [...its, {
      id: uid(), name: cat.name, category: cat.category,
      qty: 1, unit: cat.unit, price: cat.price, cost: cat.cost,
      status: cat.calcType === "fixed" ? "calculated" : "needs_calc",
      author: "Дмитрий С.", locked: false, note: cat.comment,
    }]);
    setShowAdd(false);
  };

  const addBlank = () => {
    const id = uid();
    setItems(its => [...its, {
      id, name: "", category: "extra", qty: 1, unit: "шт.", price: 0, cost: 0,
      status: "needs_calc", author: "Дмитрий С.", locked: false, note: "",
    }]);
    setEditId(id);
    setShowAdd(false);
  };

  const approveItem = (id: string) =>
    setItems(its => its.map(x => x.id === id ? { ...x, status: "approved", locked: true } : x));

  const removeItem = (id: string) =>
    setItems(its => its.filter(x => x.id !== id));

  const markCalculated = (id: string) =>
    setItems(its => its.map(x => x.id === id ? { ...x, status: "calculated" } : x));

  /* Totals */
  const visible = filterStatus === "all" ? items : items.filter(i => i.status === filterStatus);
  const totalPrice = items.reduce((s, i) => s + i.price * i.qty, 0);
  const totalCost  = items.reduce((s, i) => s + i.cost  * i.qty, 0);
  const totalMargin = totalPrice - totalCost;
  const marginPct = totalPrice > 0 ? Math.round((totalMargin / totalPrice) * 100) : 0;
  const needsCalc = items.filter(i => i.status === "needs_calc").length;
  const calcDone  = items.filter(i => ["calculated","approved"].includes(i.status)).length;

  return (
    <div className="h-full overflow-y-auto bg-[#fafafa]">
      <div className="max-w-[1100px] mx-auto px-7 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-5">
          {onBack && (
            <>
              <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-[#9b9b9b] hover:text-[#1a1a1a] transition-colors">
                <Icon name="ChevronLeft" size={14} />Заказы
              </button>
              <span className="text-[#d5d5d5]">/</span>
            </>
          )}
          <span className="text-[13px] font-semibold text-[#1a1a1a]">Калькулятор сметы</span>
        </div>

        {/* ── Order header ── */}
        <div className="bg-white border border-[#ebebeb] rounded-xl p-5 mb-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <span className="font-mono text-[12px] font-bold text-[#9b9b9b]">МП-0041</span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Производство
                  </span>
                  {needsCalc > 0 && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-red-50 text-red-500">
                      <Icon name="AlertCircle" size={10} />{needsCalc} не рассчитано
                    </span>
                  )}
                </div>
                <h1 className="text-[18px] font-semibold text-[#1a1a1a] tracking-tight mb-0.5">Смирнова Алла Васильевна</h1>
                <p className="text-[13px] text-[#9b9b9b]">Гранит чёрный · 100×50×8 см · дедлайн 28 апр.</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0 flex-wrap justify-end">
              <button className="flex items-center gap-1.5 text-[12px] border border-[#e5e5e5] text-[#4b4b4b] px-3 py-2 rounded-[7px] hover:border-[#c5c5c5] transition-colors">
                <Icon name="Printer" size={12} />Распечатать
              </button>
              <button className="flex items-center gap-1.5 text-[12px] border border-[#e5e5e5] text-[#4b4b4b] px-3 py-2 rounded-[7px] hover:border-[#c5c5c5] transition-colors">
                <Icon name="Download" size={12} />Экспорт PDF
              </button>
              <button
                onClick={() => { setApproved(true); setTimeout(() => setApproved(false), 2500); }}
                className={`flex items-center gap-1.5 text-[12px] px-3 py-2 rounded-[7px] transition-all
                  ${approved ? "bg-green-600 text-white" : "bg-[#1a1a1a] text-white hover:bg-[#333]"}`}>
                <Icon name={approved ? "Check" : "BadgeCheck"} size={12} />
                {approved ? "Смета утверждена!" : "Утвердить смету"}
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4 pt-4 border-t border-[#f5f5f5] grid grid-cols-4 gap-4">
            {[
              { label: "Всего позиций",    value: String(items.length),   color: "#6b6b6b" },
              { label: "Нужен расчёт",     value: String(needsCalc),      color: needsCalc > 0 ? "#d97706" : "#9b9b9b" },
              { label: "Посчитано",        value: String(calcDone),       color: "#0891b2" },
              { label: "Утверждено",       value: String(items.filter(i=>i.status==="approved").length), color: "#16a34a" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2.5">
                <span className="text-[20px] font-bold" style={{ color: s.color }}>{s.value}</span>
                <span className="text-[11px] text-[#9b9b9b]">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-5 items-start">

          {/* ── Main table ── */}
          <div className="flex-1 min-w-0 space-y-3">

            {/* Filter bar */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-1 bg-white border border-[#ebebeb] rounded-[8px] p-1">
                {([
                  { id: "all",        label: "Все" },
                  { id: "needs_calc", label: "Нужен расчёт" },
                  { id: "calculated", label: "Посчитано" },
                  { id: "approved",   label: "Утверждено" },
                ] as { id: ItemStatus | "all"; label: string }[]).map(f => {
                  const cnt = f.id === "all" ? items.length : items.filter(i => i.status === f.id).length;
                  return (
                    <button key={f.id} onClick={() => setFilterStatus(f.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
                        ${filterStatus === f.id ? "bg-[#1a1a1a] text-white" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}>
                      {f.label}
                      <span className={`text-[10px] px-1 rounded font-bold
                        ${filterStatus === f.id ? "bg-white/20 text-white" : "bg-[#f0f0f0] text-[#9b9b9b]"}`}>
                        {cnt}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowAdd(!showAdd)}
                  className="flex items-center gap-1.5 text-[12px] bg-[#1a1a1a] text-white px-3 py-2 rounded-[7px] hover:bg-[#333] transition-colors">
                  <Icon name="Plus" size={13} />Добавить позицию
                </button>
              </div>
            </div>

            {/* Add panel */}
            {showAdd && (
              <div className="bg-white border border-[#ebebeb] rounded-xl p-4 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[13px] font-semibold text-[#1a1a1a]">Выбрать из каталога</p>
                  <button onClick={() => setShowAdd(false)} className="text-[#b5b5b5] hover:text-[#1a1a1a]">
                    <Icon name="X" size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {CATALOG_DATA.filter(c => c.active).map(c => (
                    <button key={c.id} onClick={() => addFromCatalog(c)}
                      className="flex items-center justify-between text-left px-3 py-2.5 rounded-lg border border-[#f0f0f0] hover:border-[#c5c5c5] hover:bg-[#fafafa] transition-all group">
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium text-[#1a1a1a] truncate">{c.name}</p>
                        <p className="text-[10px]" style={{ color: CAT_META(c.category).color }}>{CAT_META(c.category).label}</p>
                      </div>
                      <span className="text-[12px] font-semibold text-[#6b6b6b] shrink-0 ml-3">
                        {c.price > 0 ? `${c.price.toLocaleString("ru")} ₽` : "расчёт"}
                      </span>
                    </button>
                  ))}
                </div>
                <button onClick={addBlank}
                  className="w-full flex items-center justify-center gap-2 text-[12px] text-[#6b6b6b] border border-dashed border-[#d5d5d5] hover:border-[#b5b5b5] py-2.5 rounded-lg transition-colors">
                  <Icon name="Plus" size={12} />Ввести вручную
                </button>
              </div>
            )}

            {/* Table */}
            <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#f0f0f0]">
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide">Позиция</th>
                    <th className="px-3 py-3 text-center text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide">Кол.</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide">Цена</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide">Сумма</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide">Себ-сть</th>
                    <th className="px-3 py-3 text-right text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide">Маржа</th>
                    <th className="px-3 py-3 text-center text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide">Статус</th>
                    <th className="px-3 py-3 text-center text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide w-20"></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-[13px] text-[#b5b5b5]">Нет позиций</td></tr>
                  )}
                  {visible.map((item, i) => {
                    const sm = STATUS_META[item.status];
                    const sumPrice = item.price * item.qty;
                    const sumCost  = item.cost  * item.qty;
                    const margin   = sumPrice - sumCost;
                    const mPct     = sumPrice > 0 ? Math.round((margin / sumPrice) * 100) : 0;
                    const isEditing = editId === item.id && !item.locked;
                    const isLast = i === visible.length - 1;

                    return (
                      <tr key={item.id}
                        className={`transition-colors group ${!isLast ? "border-b border-[#f5f5f5]" : ""}
                          ${item.status === "needs_calc" ? "bg-amber-50/40" : ""}
                          ${item.status === "approved" ? "bg-green-50/30" : ""}
                        `}>

                        {/* Позиция */}
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-2.5">
                            <div className="w-1 h-full min-h-[36px] rounded-full shrink-0 mt-0.5"
                              style={{ backgroundColor: CAT_META(item.category).color + "60" }} />
                            <div className="min-w-0">
                              {isEditing ? (
                                <input autoFocus value={item.name} onChange={e => update(item.id, "name", e.target.value)}
                                  className="w-full text-[13px] font-medium text-[#1a1a1a] bg-[#f5f5f5] rounded px-2 py-1 outline-none border border-[#d5d5d5] focus:border-[#1a1a1a]" />
                              ) : (
                                <p className="text-[13px] font-medium text-[#1a1a1a] leading-snug">{item.name || <span className="text-[#c5c5c5]">без названия</span>}</p>
                              )}
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-medium" style={{ color: CAT_META(item.category).color }}>
                                  {CAT_META(item.category).label}
                                </span>
                                <span className="text-[10px] text-[#c5c5c5]">· {item.author}</span>
                                {item.note && (
                                  <span className="text-[10px] text-[#9b9b9b] bg-[#f5f5f5] px-1.5 py-px rounded" title={item.note}>
                                    <Icon name="MessageSquare" size={9} className="inline mr-0.5" />{item.note.slice(0,22)}{item.note.length>22?"…":""}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Кол-во */}
                        <td className="px-3 py-3 text-center">
                          {isEditing ? (
                            <input type="number" min={1} value={item.qty}
                              onChange={e => update(item.id, "qty", Number(e.target.value))}
                              className="w-12 text-center text-[12px] font-mono bg-[#f5f5f5] rounded px-1 py-1 outline-none border border-[#d5d5d5]" />
                          ) : (
                            <span className="text-[12px] font-mono text-[#6b6b6b]">{item.qty} {item.unit}</span>
                          )}
                        </td>

                        {/* Цена */}
                        <td className="px-3 py-3 text-right">
                          {item.status === "needs_calc" && !isEditing ? (
                            <button onClick={() => setEditId(item.id)}
                              className="text-[11px] font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-md border border-amber-200 hover:bg-amber-200 transition-colors">
                              рассчитать
                            </button>
                          ) : isEditing ? (
                            <input type="number" value={item.price} onChange={e => update(item.id, "price", Number(e.target.value))}
                              className="w-20 text-right text-[12px] font-mono bg-[#f5f5f5] rounded px-2 py-1 outline-none border border-[#d5d5d5] focus:border-[#1a1a1a]" />
                          ) : (
                            <span className={`text-[12px] font-mono ${item.locked ? "text-[#9b9b9b]" : "text-[#1a1a1a]"}`}>
                              {item.price.toLocaleString("ru")} ₽
                            </span>
                          )}
                        </td>

                        {/* Сумма */}
                        <td className="px-3 py-3 text-right">
                          <span className="text-[13px] font-semibold text-[#1a1a1a]">
                            {item.status === "needs_calc" && item.price === 0 ? "—" : (sumPrice).toLocaleString("ru") + " ₽"}
                          </span>
                        </td>

                        {/* Себестоимость */}
                        <td className="px-3 py-3 text-right">
                          {isEditing ? (
                            <input type="number" value={item.cost} onChange={e => update(item.id, "cost", Number(e.target.value))}
                              className="w-20 text-right text-[12px] font-mono bg-[#f5f5f5] rounded px-2 py-1 outline-none border border-[#d5d5d5]" />
                          ) : (
                            <span className="text-[12px] font-mono text-[#9b9b9b]">
                              {item.cost > 0 ? sumCost.toLocaleString("ru") + " ₽" : "—"}
                            </span>
                          )}
                        </td>

                        {/* Маржа */}
                        <td className="px-3 py-3 text-right">
                          {margin > 0 ? (
                            <div>
                              <span className="text-[12px] font-semibold text-[#16a34a]">{margin.toLocaleString("ru")} ₽</span>
                              <div className="text-[10px] text-[#9b9b9b]">{mPct}%</div>
                            </div>
                          ) : <span className="text-[12px] text-[#c5c5c5]">—</span>}
                        </td>

                        {/* Статус */}
                        <td className="px-3 py-3 text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md border whitespace-nowrap"
                            style={{ color: sm.color, backgroundColor: sm.bg, borderColor: sm.border }}>
                            <Icon name={sm.icon as never} size={9} />
                            {sm.label}
                          </span>
                          {item.locked && (
                            <div className="flex items-center justify-center gap-1 mt-1 text-[9px] text-[#c5c5c5]">
                              <Icon name="Lock" size={8} />заблокировано
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-1">
                            {isEditing ? (
                              <>
                                <ActionBtn icon="Check" title="Сохранить" color="text-green-600"
                                  onClick={() => { markCalculated(item.id); setEditId(null); }} />
                                <ActionBtn icon="X" title="Отмена" color="text-[#9b9b9b]"
                                  onClick={() => setEditId(null)} />
                              </>
                            ) : (
                              <>
                                {!item.locked && (
                                  <ActionBtn icon="Pencil" title="Редактировать"
                                    onClick={() => setEditId(item.id)} />
                                )}
                                {item.status === "calculated" && (
                                  <ActionBtn icon="BadgeCheck" title="Утвердить" color="text-green-600"
                                    onClick={() => approveItem(item.id)} />
                                )}
                                {!item.locked && (
                                  <ActionBtn icon="Trash2" title="Удалить" color="text-[#d5d5d5] hover:text-red-400"
                                    onClick={() => removeItem(item.id)} />
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Right: totals ── */}
          <div className="w-[256px] shrink-0 space-y-4 sticky top-6">

            {/* Totals card */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-4">Итоги сметы</p>

              <div className="space-y-3 mb-4">
                <TotalRow label="Сумма (продажа)" value={`${totalPrice.toLocaleString("ru")} ₽`} bold />
                <TotalRow label="Себестоимость"  value={`${totalCost.toLocaleString("ru")} ₽`} />
                <div className="border-t border-[#f5f5f5] pt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-[#9b9b9b]">Маржа</span>
                    <span className="text-[15px] font-bold text-[#16a34a]">{totalMargin.toLocaleString("ru")} ₽</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#22c55e] rounded-full transition-all" style={{ width: `${marginPct}%` }} />
                    </div>
                    <span className={`text-[13px] font-bold ${marginPct >= 30 ? "text-[#16a34a]" : marginPct >= 15 ? "text-[#d97706]" : "text-red-500"}`}>
                      {marginPct}%
                    </span>
                  </div>
                  <p className="text-[10px] text-[#b5b5b5] mt-1">
                    {marginPct >= 30 ? "Хорошая маржа" : marginPct >= 15 ? "Допустимая маржа" : "Маржа ниже нормы"}
                  </p>
                </div>
              </div>

              {needsCalc > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <Icon name="AlertTriangle" size={12} className="text-amber-500" />
                    <span className="text-[12px] font-semibold text-amber-700">{needsCalc} позиции без цены</span>
                  </div>
                  <p className="text-[11px] text-amber-600 mt-0.5">Итоговая сумма неполная</p>
                </div>
              )}

              <button
                onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
                className={`w-full flex items-center justify-center gap-2 text-[13px] py-2.5 rounded-[8px] transition-all
                  ${saved ? "bg-green-600 text-white" : "bg-[#1a1a1a] text-white hover:bg-[#333]"}`}>
                <Icon name={saved ? "Check" : "Save"} size={13} />
                {saved ? "Сохранено!" : "Сохранить смету"}
              </button>
            </div>

            {/* Breakdown by category */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-3">По категориям</p>
              <div className="space-y-2.5">
                {(Object.keys(CATEGORY_META) as Category[]).map(cat => {
                  const catItems = items.filter(i => i.category === cat);
                  if (catItems.length === 0) return null;
                  const catSum = catItems.reduce((s, i) => s + i.price * i.qty, 0);
                  const catPct = totalPrice > 0 ? Math.round((catSum / totalPrice) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-medium" style={{ color: CAT_META(cat).color }}>
                          {CAT_META(cat).label}
                        </span>
                        <span className="text-[12px] font-semibold text-[#1a1a1a]">{catSum.toLocaleString("ru")} ₽</span>
                      </div>
                      <div className="h-1.5 bg-[#f5f5f5] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${catPct}%`, backgroundColor: CAT_META(cat).color + "80" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Responsible */}
            <div className="bg-white border border-[#ebebeb] rounded-xl p-5">
              <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-3">Ответственные</p>
              <div className="space-y-2.5">
                <PersonRow role="Менеджер"  name="Олег Краснов"    color="#6366f1" />
                <PersonRow role="Сметчик"   name="Дмитрий Соколов" color="#f59e0b" />
              </div>
              <div className="mt-3 pt-3 border-t border-[#f5f5f5] space-y-1.5 text-[11px] text-[#9b9b9b]">
                <div className="flex items-center gap-1.5">
                  <Icon name="BadgeCheck" size={11} className="text-green-500" />
                  Утверждённые позиции не пересчитываются
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="Calculator" size={11} className="text-amber-500" />
                  Сметчик считает только «Нужен расчёт»
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function ActionBtn({ icon, title, color = "text-[#9b9b9b]", onClick }: {
  icon: string; title: string; color?: string; onClick: () => void;
}) {
  return (
    <button title={title} onClick={onClick}
      className={`w-7 h-7 flex items-center justify-center rounded-[6px] border border-transparent hover:border-[#e5e5e5] hover:bg-[#fafafa] transition-all ${color}`}>
      <Icon name={icon as never} size={12} />
    </button>
  );
}

function TotalRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-[#9b9b9b]">{label}</span>
      <span className={`text-[13px] ${bold ? "font-bold text-[#1a1a1a]" : "font-semibold text-[#6b6b6b]"}`}>{value}</span>
    </div>
  );
}

function PersonRow({ role, name, color }: { role: string; name: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
        style={{ backgroundColor: color }}>{name[0]}</div>
      <div>
        <p className="text-[12px] font-semibold text-[#1a1a1a] leading-none mb-0.5">{name}</p>
        <p className="text-[10px] text-[#b5b5b5]">{role}</p>
      </div>
    </div>
  );
}