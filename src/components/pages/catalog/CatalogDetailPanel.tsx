import Icon from "@/components/ui/icon";
import { CATEGORY_META, CALC_TYPE_META, CatalogItem, CatalogCategory, CalcType } from "@/data/catalog";

/* ─── Helpers ─── */
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

/* ─── Switcher: Detail or Edit ─── */
type Props = {
  selected: CatalogItem;
  editing: CatalogItem | null;
  canEdit: boolean;
  onEdit: () => void;
  onClose: () => void;
  onToggle: () => void;
  onEditChange: (item: CatalogItem) => void;
  onSave: (item: CatalogItem) => void;
  onCancelEdit: () => void;
};

export default function CatalogDetailPanel({
  selected, editing, canEdit,
  onEdit, onClose, onToggle,
  onEditChange, onSave, onCancelEdit,
}: Props) {
  return (
    <div className="w-[300px] shrink-0 border-l border-[#ebebeb] bg-white overflow-y-auto animate-slide-in-right">
      {editing?.id === selected.id
        ? <EditForm item={editing} onChange={onEditChange} onSave={onSave} onCancel={onCancelEdit} />
        : <DetailPanel item={selected} canEdit={canEdit}
            onEdit={onEdit}
            onClose={onClose}
            onToggle={onToggle} />
      }
    </div>
  );
}
