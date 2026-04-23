import Icon from "@/components/ui/icon";
import { CATALOG as CATALOG_DATA } from "@/data/catalog";
import { LineItem, ItemStatus, STATUS_META, CAT_META } from "./estimate.types";

type Props = {
  visible: LineItem[];
  filterStatus: ItemStatus | "all";
  items: LineItem[];
  editId: string | null;
  showAdd: boolean;
  onFilterChange: (f: ItemStatus | "all") => void;
  onToggleAdd: () => void;
  onCloseAdd: () => void;
  onAddFromCatalog: (cat: typeof CATALOG_DATA[number]) => void;
  onAddBlank: () => void;
  onUpdate: <K extends keyof LineItem>(id: string, field: K, val: LineItem[K]) => void;
  onSetEditId: (id: string | null) => void;
  onMarkCalculated: (id: string) => void;
  onApproveItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
};

export default function EstimateTable({
  visible, filterStatus, items, editId, showAdd,
  onFilterChange, onToggleAdd, onCloseAdd,
  onAddFromCatalog, onAddBlank,
  onUpdate, onSetEditId, onMarkCalculated, onApproveItem, onRemoveItem,
}: Props) {
  return (
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
              <button key={f.id} onClick={() => onFilterChange(f.id)}
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
          <button onClick={onToggleAdd}
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
            <button onClick={onCloseAdd} className="text-[#b5b5b5] hover:text-[#1a1a1a]">
              <Icon name="X" size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {CATALOG_DATA.filter(c => c.active).map(c => (
              <button key={c.id} onClick={() => onAddFromCatalog(c)}
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
          <button onClick={onAddBlank}
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
                          <input autoFocus value={item.name} onChange={e => onUpdate(item.id, "name", e.target.value)}
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
                              <Icon name="MessageSquare" size={9} className="inline mr-0.5" />{item.note.slice(0, 22)}{item.note.length > 22 ? "…" : ""}
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
                        onChange={e => onUpdate(item.id, "qty", Number(e.target.value))}
                        className="w-12 text-center text-[12px] font-mono bg-[#f5f5f5] rounded px-1 py-1 outline-none border border-[#d5d5d5]" />
                    ) : (
                      <span className="text-[12px] font-mono text-[#6b6b6b]">{item.qty} {item.unit}</span>
                    )}
                  </td>

                  {/* Цена */}
                  <td className="px-3 py-3 text-right">
                    {item.status === "needs_calc" && !isEditing ? (
                      <button onClick={() => onSetEditId(item.id)}
                        className="text-[11px] font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-md border border-amber-200 hover:bg-amber-200 transition-colors">
                        рассчитать
                      </button>
                    ) : isEditing ? (
                      <input type="number" value={item.price} onChange={e => onUpdate(item.id, "price", Number(e.target.value))}
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
                      {item.status === "needs_calc" && item.price === 0 ? "—" : sumPrice.toLocaleString("ru") + " ₽"}
                    </span>
                  </td>

                  {/* Себестоимость */}
                  <td className="px-3 py-3 text-right">
                    {isEditing ? (
                      <input type="number" value={item.cost} onChange={e => onUpdate(item.id, "cost", Number(e.target.value))}
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
                            onClick={() => { onMarkCalculated(item.id); onSetEditId(null); }} />
                          <ActionBtn icon="X" title="Отмена" color="text-[#9b9b9b]"
                            onClick={() => onSetEditId(null)} />
                        </>
                      ) : (
                        <>
                          {!item.locked && (
                            <ActionBtn icon="Pencil" title="Редактировать"
                              onClick={() => onSetEditId(item.id)} />
                          )}
                          {item.status === "calculated" && (
                            <ActionBtn icon="BadgeCheck" title="Утвердить" color="text-green-600"
                              onClick={() => onApproveItem(item.id)} />
                          )}
                          {!item.locked && (
                            <ActionBtn icon="Trash2" title="Удалить" color="text-[#d5d5d5] hover:text-red-400"
                              onClick={() => onRemoveItem(item.id)} />
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
  );
}

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
