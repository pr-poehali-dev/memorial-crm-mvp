import { useState } from "react";
import Icon from "@/components/ui/icon";
import { RawMaterial, Blank, StockItem, selectCls, inputCls } from "./warehouse.types";
import { Modal, Field, InfoRow } from "./ModalShared";

export type UseAnyPayload = {
  itemType: "raw" | "blank" | "stock";
  itemId: number;
  qty: number;
  note: string;
  orderRef?: string;
};

export type ModalUseAnyProps = {
  rawMat: RawMaterial[];
  blanks: Blank[];
  stock: StockItem[];
  onConfirm: (p: UseAnyPayload) => void;
  onClose: () => void;
};

type Kind = "raw" | "blank" | "stock";

const KINDS: { key: Kind; label: string; icon: string }[] = [
  { key: "raw",   label: "Сырьё",     icon: "Layers" },
  { key: "blank", label: "Заготовка", icon: "Package" },
  { key: "stock", label: "Изделие",   icon: "LayoutGrid" },
];

export function ModalUseAny({ rawMat, blanks, stock, onConfirm, onClose }: ModalUseAnyProps) {
  const [kind,   setKind]   = useState<Kind>("blank");
  const [itemId, setItemId] = useState<string>("");
  const [qty,    setQty]    = useState<string>("");
  const [order,  setOrder]  = useState<string>("");

  /* Список доступных позиций под выбранный тип */
  const options =
    kind === "raw"
      ? rawMat.map(r => ({ id: r.id, label: `${r.name} — ${r.qty} ${r.unit}`, available: r.qty, unit: r.unit }))
      : kind === "blank"
      ? blanks.map(b => ({ id: b.id, label: `${b.name} (${b.size}) — ${b.qty} шт.`, available: b.qty, unit: "шт." }))
      : stock.map(s => ({ id: s.id, label: `${s.name} — ${s.qty} шт.`, available: s.qty, unit: "шт." }));

  const selectedId  = itemId || options[0]?.id || "";
  const selected    = options.find(o => o.id === selectedId);
  const isRaw       = kind === "raw";
  const qtyNum      = isRaw ? (parseFloat(qty) || 0) : (parseInt(qty) || 0);
  const notEnough   = selected ? qtyNum > selected.available : false;
  const canSubmit   = !!selected && qtyNum > 0 && !notEnough;

  const switchKind = (k: Kind) => {
    setKind(k);
    setItemId("");
    setQty("");
  };

  const handleConfirm = () => {
    if (!canSubmit || !selected) return;
    const typeLabel = KINDS.find(k => k.key === kind)!.label;
    const noteName  = selected.label.split(" — ")[0];
    onConfirm({
      itemType: kind,
      itemId:   parseInt(selected.id),
      qty:      qtyNum,
      note:     `Списание (${typeLabel}): ${noteName}${order.trim() ? ` · ${order.trim()}` : ""}`,
      orderRef: order.trim() || undefined,
    });
  };

  return (
    <Modal title="Списание со склада" icon="ArrowUpFromLine" iconColor="#ef4444" onClose={onClose}>
      <div className="space-y-3">

        {/* Переключатель типа */}
        <Field label="Что списываем">
          <div className="grid grid-cols-3 gap-1.5 bg-[#f0f0f0] rounded-[8px] p-1">
            {KINDS.map(k => (
              <button
                key={k.key}
                onClick={() => switchKind(k.key)}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-[6px] text-[12px] font-medium transition-all
                  ${kind === k.key ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
              >
                <Icon name={k.icon as never} size={13} />
                {k.label}
              </button>
            ))}
          </div>
        </Field>

        {/* Выбор позиции */}
        <Field label={KINDS.find(k => k.key === kind)!.label}>
          {options.length === 0 ? (
            <p className="text-[12px] text-[#b5b5b5] py-2">Нет позиций этого типа на складе</p>
          ) : (
            <select value={selectedId} onChange={e => setItemId(e.target.value)} className={selectCls}>
              {options.map(o => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          )}
        </Field>

        {/* Количество */}
        <Field label={`Количество (${selected?.unit ?? "шт."})`}>
          <input
            type="number"
            min={isRaw ? "0.01" : "1"}
            step={isRaw ? "0.01" : "1"}
            value={qty}
            onChange={e => setQty(e.target.value)}
            placeholder={isRaw ? "0.5" : "1"}
            className={inputCls}
          />
          {notEnough && <p className="mt-0.5 text-[12px] text-red-500">Недостаточно на складе (есть {selected?.available} {selected?.unit})</p>}
        </Field>

        {/* Заказ */}
        <Field label="Номер заказа (необязательно)">
          <input value={order} onChange={e => setOrder(e.target.value)} placeholder="МП-0041" className={inputCls} />
        </Field>

        {selected && qtyNum > 0 && !notEnough && (
          <InfoRow>
            Спишем <b className="text-[#1a1a1a]">{qtyNum} {selected.unit}</b>
            <span className="ml-2 text-[#9b9b9b]">· Останется: <b className="text-[#1a1a1a]">{+(selected.available - qtyNum).toFixed(2)} {selected.unit}</b></span>
          </InfoRow>
        )}

        <button
          onClick={handleConfirm}
          disabled={!canSubmit}
          className="w-full bg-[#ef4444] text-white text-[13px] py-2.5 rounded-[8px] hover:bg-[#dc2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Списать
        </button>
      </div>
    </Modal>
  );
}

export default ModalUseAny;
