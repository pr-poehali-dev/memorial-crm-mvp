import { useState } from "react";
import { Modal, Field } from "./ModalShared";
import { inputCls } from "./warehouse.types";
import type { RawMaterial } from "./warehouse.types";

export type NewBlankData = {
  name: string;
  size: string;
  materialId?: number;
  minQty: number;
  costPrice: number;
  salePrice: number;
  rawPerUnit: number;
};

type Props = {
  rawMat: RawMaterial[];
  onClose: () => void;
  onAdd: (data: NewBlankData) => void;
};

export function ModalAddBlank({ rawMat, onClose, onAdd }: Props) {
  const [name,       setName]       = useState("");
  const [size,       setSize]       = useState("");
  const [materialId, setMaterialId] = useState(rawMat[0]?.id ?? "");
  const [minQty,     setMinQty]     = useState("0");
  const [costPrice,  setCostPrice]  = useState("");
  const [salePrice,  setSalePrice]  = useState("");
  const [rawPerUnit, setRawPerUnit] = useState("");

  const canSubmit = name.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onAdd({
      name:       name.trim(),
      size:       size.trim(),
      materialId: materialId ? parseInt(materialId) : undefined,
      minQty:     parseFloat(minQty) || 0,
      costPrice:  parseFloat(costPrice) || 0,
      salePrice:  parseFloat(salePrice) || 0,
      rawPerUnit: parseFloat(rawPerUnit) || 0,
    });
    onClose();
  };

  return (
    <Modal title="Добавить вид заготовки" icon="Package" iconColor="#8b5cf6" onClose={onClose}>
      <div className="space-y-4">

        {/* Название */}
        <Field label="Название заготовки *">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Например: Плита стандарт"
            className={inputCls}
          />
        </Field>

        {/* Размер */}
        <Field label="Размер (Ш×В×Т)">
          <input
            value={size}
            onChange={e => setSize(e.target.value)}
            placeholder="100×50×8"
            className={inputCls}
          />
        </Field>

        {/* Материал */}
        {rawMat.length > 0 && (
          <Field label="Материал сырья">
            <select
              value={materialId}
              onChange={e => setMaterialId(e.target.value)}
              className={inputCls}
            >
              <option value="">— не указан —</option>
              {rawMat.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </Field>
        )}

        {/* Расход сырья на 1 шт */}
        <Field label="Расход сырья на 1 шт (м²)">
          <input
            type="number"
            value={rawPerUnit}
            onChange={e => setRawPerUnit(e.target.value)}
            placeholder="0.50"
            min={0}
            step={0.01}
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          {/* Себестоимость */}
          <Field label="Себестоимость (₽)">
            <input
              type="number"
              value={costPrice}
              onChange={e => setCostPrice(e.target.value)}
              placeholder="0"
              min={0}
              className={inputCls}
            />
          </Field>

          {/* Цена продажи */}
          <Field label="Цена продажи (₽)">
            <input
              type="number"
              value={salePrice}
              onChange={e => setSalePrice(e.target.value)}
              placeholder="0"
              min={0}
              className={inputCls}
            />
          </Field>
        </div>

        {/* Минимальный остаток */}
        <Field label="Минимальный остаток (шт.)">
          <input
            type="number"
            value={minQty}
            onChange={e => setMinQty(e.target.value)}
            placeholder="0"
            min={0}
            className={inputCls}
          />
        </Field>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-[10px] text-[13px] border border-[#ebebeb] text-[#6b6b6b] hover:border-[#c5c5c5] transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#8b5cf6] text-white hover:bg-[#7c3aed] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Добавить заготовку
          </button>
        </div>

      </div>
    </Modal>
  );
}
