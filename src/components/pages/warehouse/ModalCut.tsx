import { useEffect } from "react";
import { RawMaterial, Blank, calcRawPerUnit, getLevelRaw, selectCls, inputCls } from "./warehouse.types";
import { Modal, Field, InfoRow } from "./ModalShared";

export type ModalCutProps = {
  rawMat: RawMaterial[];
  blanks: Blank[];
  cutRawId: string;    setCutRawId: (v: string) => void;
  cutBlankId: string;  setCutBlankId: (v: string) => void;
  cutQty: string;      setCutQty: (v: string) => void;
  cutRawPer: string;   setCutRawPer: (v: string) => void;
  cutDeadline: string; setCutDeadline: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function ModalCut({
  rawMat, blanks,
  cutRawId, setCutRawId, cutBlankId, setCutBlankId,
  cutQty, setCutQty, cutRawPer, setCutRawPer,
  cutDeadline, setCutDeadline,
  onConfirm, onClose,
}: ModalCutProps) {
  const raw   = rawMat.find(r => r.id === cutRawId);
  const blank = blanks.find(b => b.id === cutBlankId);
  const qty   = parseInt(cutQty) || 0;
  const perUnit = parseFloat(cutRawPer) || 0;
  const totalRaw = +(qty * perUnit).toFixed(2);
  const notEnough = raw ? totalRaw > raw.qty : false;

  /* При смене заготовки пересчитать авторасход */
  useEffect(() => {
    if (!blank) return;
    const auto = calcRawPerUnit(blank.size);
    if (auto !== null) {
      setCutRawPer(String(auto));
    } else {
      setCutRawPer("");
    }
  }, [cutBlankId]);

  /* При смене сырья фильтруем связанные заготовки */
  const relatedBlanks = blanks.filter(b => b.materialId === cutRawId);
  const displayBlanks = relatedBlanks.length > 0 ? relatedBlanks : blanks;

  const autoOk = blank ? calcRawPerUnit(blank.size) !== null : false;

  return (
    <Modal title="Нарезка заготовок" icon="Scissors" iconColor="#6366f1" onClose={onClose}>
      <div className="space-y-3">

        <Field label="Сырьё для нарезки">
          <select value={cutRawId} onChange={e => setCutRawId(e.target.value)} className={selectCls}>
            {rawMat.map(r => {
              const lv = getLevelRaw(r);
              const suffix = lv === "critical" ? " ⚠ мало" : lv === "low" ? " ↓" : "";
              return (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.qty} {r.unit}{suffix}
                </option>
              );
            })}
          </select>
          {raw && (
            <p className="mt-1 text-[12px] text-[#9b9b9b]">
              Доступно: <b className="text-[#1a1a1a]">{raw.qty} {raw.unit}</b>
            </p>
          )}
        </Field>

        <Field label="Тип заготовки">
          <select value={cutBlankId} onChange={e => setCutBlankId(e.target.value)} className={selectCls}>
            {displayBlanks.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.size}) — на складе: {b.qty} шт.
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Кол-во заготовок (шт.)">
            <input
              type="number" min="1" step="1" value={cutQty}
              onChange={e => setCutQty(e.target.value)}
              placeholder="0" className={inputCls}
            />
          </Field>
          <Field label={`Расход на штуку (${raw?.unit ?? "м²"})`}>
            <input
              type="number" min="0.01" step="0.01" value={cutRawPer}
              onChange={e => setCutRawPer(e.target.value)}
              placeholder="0.5" className={inputCls}
            />
            {!autoOk && cutRawPer === "" && (
              <p className="mt-0.5 text-[11px] text-[#e09b20]">Не удалось рассчитать автоматически, укажите вручную</p>
            )}
          </Field>
        </div>

        <Field label="Нарезать до (дата)">
          <input
            type="date" value={cutDeadline}
            onChange={e => setCutDeadline(e.target.value)}
            className={inputCls}
          />
        </Field>

        {qty > 0 && perUnit > 0 && (
          <InfoRow>
            Итого будет списано:{" "}
            <b className={notEnough ? "text-red-600" : "text-[#1a1a1a]"}>{totalRaw} {raw?.unit}</b>
            {notEnough && <span className="ml-2 text-red-500 font-semibold">⚠ Недостаточно сырья</span>}
            {!notEnough && raw && (
              <span className="ml-2 text-[#9b9b9b]">
                · Останется: <b className="text-[#1a1a1a]">{(raw.qty - totalRaw).toFixed(2)} {raw.unit}</b>
              </span>
            )}
          </InfoRow>
        )}

        <button
          onClick={onConfirm}
          disabled={notEnough}
          className="w-full bg-[#6366f1] text-white text-[13px] py-2.5 rounded-[8px] hover:bg-[#5052cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Создать заготовки
        </button>
      </div>
    </Modal>
  );
}
