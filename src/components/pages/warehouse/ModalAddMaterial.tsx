import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";
import { Modal, Field } from "./ModalShared";
import { inputCls } from "./warehouse.types";
import type { RawMaterial } from "./warehouse.types";

export type ModalAddMaterialProps = {
  onClose: () => void;
  onAdd: (mat: RawMaterial) => void;
};

const ACCEPTED = "image/jpeg,image/png,image/webp";
const MAX_SIZE_MB = 2;

export function ModalAddMaterial({ onClose, onAdd }: ModalAddMaterialProps) {
  const [name,     setName]     = useState("");
  const [price,    setPrice]    = useState("");
  const [minQty,   setMinQty]   = useState("5");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setImgError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImgError("Только JPG, PNG или WebP");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setImgError(`Максимум ${MAX_SIZE_MB} МБ`);
      return;
    }
    const reader = new FileReader();
    reader.onload = e => setImageUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const canSubmit = name.trim() && parseFloat(price) > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const newMat: RawMaterial = {
      id:       "r-" + Date.now(),
      name:     name.trim(),
      unit:     "м²",
      qty:      0,
      min:      parseFloat(minQty) || 5,
      price:    parseFloat(price),
      imageUrl: imageUrl ?? undefined,
    };
    onAdd(newMat);
    onClose();
  };

  return (
    <Modal title="Добавить материал" icon="Plus" iconColor="#2563eb" onClose={onClose}>
      <div className="space-y-4">

        {/* Загрузка фото */}
        <Field label="Фото текстуры камня (необязательно)">
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl cursor-pointer transition-all
              ${dragging ? "border-[#2563eb] bg-[#eff6ff]" : "border-[#e0e0e0] hover:border-[#c0c0c0] bg-[#fafafa]"}
              ${imageUrl ? "h-[96px]" : "h-[96px]"}`}
          >
            {imageUrl ? (
              <>
                <img src={imageUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-80" />
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-[12px] font-medium">Заменить</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-9 h-9 rounded-full bg-[#efefef] flex items-center justify-center">
                  <Icon name="ImagePlus" size={16} className="text-[#9b9b9b]" />
                </div>
                <div className="text-center">
                  <p className="text-[12px] text-[#6b6b6b] font-medium">Перетащи или нажми для выбора</p>
                  <p className="text-[11px] text-[#b5b5b5] mt-0.5">JPG, PNG, WebP · до {MAX_SIZE_MB} МБ</p>
                </div>
              </>
            )}
          </div>
          {imgError && <p className="text-[11px] text-red-500 mt-1">{imgError}</p>}
          {imageUrl && (
            <button
              onClick={() => { setImageUrl(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="text-[11px] text-[#9b9b9b] hover:text-red-500 mt-1 transition-colors"
            >
              Удалить фото
            </button>
          )}
          <input ref={fileRef} type="file" accept={ACCEPTED} className="hidden" onChange={onFileChange} />
        </Field>

        {/* Название */}
        <Field label="Название материала *">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Например: Габбро-диабаз"
            className={inputCls}
          />
        </Field>

        {/* Цена */}
        <Field label="Цена за 1 м² (₽) *">
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="Например: 4200"
            min={0}
            className={inputCls}
          />
        </Field>

        {/* Минимальный остаток */}
        <Field label="Минимальный остаток (м²)">
          <input
            type="number"
            value={minQty}
            onChange={e => setMinQty(e.target.value)}
            placeholder="5"
            min={0}
            className={inputCls}
          />
        </Field>

        {/* Кнопки */}
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
            className="flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Добавить материал
          </button>
        </div>

      </div>
    </Modal>
  );
}