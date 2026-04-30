import { RawMaterial } from "./warehouse.types";
import { selectCls, inputCls } from "./warehouse.types";
import { Modal, Field, InfoRow, todayStr } from "./ModalShared";

export type ModalInProps = {
  rawMat: RawMaterial[];
  inRawId: string;          setInRawId: (v: string) => void;
  inQty: string;            setInQty: (v: string) => void;
  inReceiptId: string;      setInReceiptId: (v: string) => void;
  inPrice: string;          setInPrice: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function ModalIn({
  rawMat, inRawId, setInRawId, inQty, setInQty,
  inReceiptId, setInReceiptId, inPrice, setInPrice,
  onConfirm, onClose,
}: ModalInProps) {
  const raw = rawMat.find(r => r.id === inRawId);
  const qty = parseFloat(inQty) || 0;
  const price = parseFloat(inPrice) || (raw?.price ?? 0);
  const total = qty * price;

  return (
    <Modal title="Приход материала" icon="ArrowDownToLine" iconColor="#16a34a" onClose={onClose}>
      <div className="space-y-3">

        <Field label="Наименование сырья">
          <select value={inRawId} onChange={e => setInRawId(e.target.value)} className={selectCls}>
            {rawMat.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </Field>

        <Field label={`Количество (${raw?.unit ?? "м²"})`}>
          <input
            type="number" min="0.1" step="0.1" value={inQty}
            onChange={e => setInQty(e.target.value)}
            placeholder="0.0" className={inputCls}
          />
        </Field>

        <Field label="ID прихода / номер камня">
          <input
            value={inReceiptId} onChange={e => setInReceiptId(e.target.value)}
            placeholder="Например: КР-0041" className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Дата прихода">
            <div className={`${inputCls} bg-[#f8f8f8] text-[#9b9b9b] cursor-default`}>
              {todayStr}
            </div>
          </Field>
          <Field label="Цена за ед. (₽)">
            <input
              type="number" min="0" step="1" value={inPrice}
              onChange={e => setInPrice(e.target.value)}
              placeholder={String(raw?.price ?? "")} className={inputCls}
            />
          </Field>
        </div>

        {qty > 0 && (
          <InfoRow>
            Итого: <b className="text-[#1a1a1a]">{qty} {raw?.unit}</b>
            {" · "}Стоимость: <b className="text-[#1a1a1a]">{total.toLocaleString("ru")} ₽</b>
            {" · "}Новый остаток: <b className="text-[#1a1a1a]">{((raw?.qty ?? 0) + qty).toFixed(2)} {raw?.unit}</b>
          </InfoRow>
        )}

        <button
          onClick={onConfirm}
          className="w-full bg-[#1a1a1a] text-white text-[13px] py-2.5 rounded-[8px] hover:bg-[#333] transition-colors"
        >
          Оприходовать
        </button>
      </div>
    </Modal>
  );
}
