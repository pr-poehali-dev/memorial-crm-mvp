import Icon from "@/components/ui/icon";
import { CATEGORY_META, CALC_TYPE_META, CatalogItem } from "@/data/catalog";

function IABtn({ icon, title, onClick }: { icon: string; title: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button title={title} onClick={onClick}
      className="w-7 h-7 flex items-center justify-center rounded-[6px] bg-white border border-[#e5e5e5] text-[#6b6b6b] hover:text-[#1a1a1a] hover:border-[#c5c5c5] transition-all">
      <Icon name={icon as never} size={12} />
    </button>
  );
}

type Props = {
  filtered: CatalogItem[];
  selected: CatalogItem | null;
  hovered: string | null;
  canEdit: boolean;
  onSelect: (item: CatalogItem) => void;
  onHover: (id: string | null) => void;
  onEdit: (item: CatalogItem) => void;
  onToggle: (id: string) => void;
};

export default function CatalogTable({
  filtered, selected, hovered, canEdit,
  onSelect, onHover, onEdit, onToggle,
}: Props) {
  return (
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
            const catM   = CATEGORY_META[item.category];
            const calcM  = CALC_TYPE_META[item.calcType];
            const margin = item.price > 0 ? Math.round(((item.price - item.cost) / item.price) * 100) : null;
            const isLast = i === filtered.length - 1;
            const stockQty = item.stockQty ?? 0;

            return (
              <tr key={item.id}
                onClick={() => onSelect(item)}
                onMouseEnter={() => onHover(item.id)}
                onMouseLeave={() => onHover(null)}
                className={`cursor-pointer transition-colors
                  ${!item.active ? "opacity-50" : ""}
                  ${selected?.id === item.id ? "bg-[#f0f4ff]" : "hover:bg-[#fafafa]"}
                  ${!isLast ? "border-b border-[#f5f5f5]" : ""}`}>

                {/* Позиция */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: catM.color + "50" }} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold text-[#1a1a1a]">{item.name}</p>
                        {stockQty > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 whitespace-nowrap shrink-0">
                            На складе: {stockQty} шт.
                          </span>
                        )}
                      </div>
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
                    <IABtn icon="Eye" title="Открыть" onClick={e => { e.stopPropagation(); onSelect(item); }} />
                    {canEdit && (
                      <IABtn icon="Pencil" title="Редактировать" onClick={e => { e.stopPropagation(); onEdit(item); }} />
                    )}
                    <IABtn icon={item.active ? "EyeOff" : "Eye"} title={item.active ? "Деактивировать" : "Активировать"}
                      onClick={e => { e.stopPropagation(); onToggle(item.id); }} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
