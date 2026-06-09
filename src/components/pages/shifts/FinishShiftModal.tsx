import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  Shift, ShiftResult, PLACES, SHIFT_EMPLOYEES, BLANK_TYPES, SAMPLE_ORDERS,
  WORK_TYPE_LABELS,
} from "./shifts.types";

const sel = "bg-white border border-[#e0e0e0] rounded-[8px] px-3 py-2.5 text-[13px] text-[#1a1a1a] outline-none focus:border-[#b0b0b0] transition-colors";
const inp = "bg-white border border-[#e0e0e0] rounded-[8px] px-3 py-2.5 text-[14px] font-semibold text-[#1a1a1a] outline-none focus:border-[#b0b0b0] transition-colors w-full placeholder:text-[#c0c0c0] placeholder:font-normal";

type DraftResult = {
  blankTypeId: string;
  qty: string;
  manualMode: boolean;
  rawManual: string;
  forOrder: string;
};

const newDraft = (): DraftResult => ({
  blankTypeId: BLANK_TYPES[0].id,
  qty: "",
  manualMode: false,
  rawManual: "",
  forOrder: "склад",
});

type Props = {
  shift: Shift;
  onConfirm: (results: ShiftResult[], note: string) => void;
  onClose: () => void;
};

export default function FinishShiftModal({ shift, onConfirm, onClose }: Props) {
  const [rows, setRows]   = useState<DraftResult[]>([newDraft()]);
  const [note, setNote]   = useState("");

  const place = PLACES.find(p => p.id === shift.placeId);
  const emp   = SHIFT_EMPLOYEES.find(e => e.id === shift.employeeId);

  const updateRow = (i: number, patch: Partial<DraftResult>) => {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  };

  const addRow = () => setRows(prev => [...prev, newDraft()]);
  const removeRow = (i: number) => setRows(prev => prev.filter((_, idx) => idx !== i));

  const getAutoRaw = (row: DraftResult): number => {
    const blank = BLANK_TYPES.find(b => b.id === row.blankTypeId);
    const q = parseFloat(row.qty);
    if (!blank || !q) return 0;
    return +(blank.rawPerUnit * q).toFixed(2);
  };

  const totalQty = rows.reduce((s, r) => s + (parseFloat(r.qty) || 0), 0);
  const totalRaw = rows.reduce((s, r) => {
    if (r.manualMode && r.rawManual) return s + parseFloat(r.rawManual);
    return s + getAutoRaw(r);
  }, 0);

  const canSubmit = rows.some(r => parseFloat(r.qty) > 0);

  const handleConfirm = () => {
    if (!canSubmit) return;
    const results: ShiftResult[] = rows
      .filter(r => parseFloat(r.qty) > 0)
      .map(r => ({
        blankTypeId: r.blankTypeId,
        qty: parseFloat(r.qty),
        rawAuto: getAutoRaw(r),
        rawManual: r.manualMode && r.rawManual ? parseFloat(r.rawManual) : undefined,
        forOrder: r.forOrder || "склад",
      }));
    onConfirm(results, note.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-[#ebebeb] shadow-2xl w-full max-w-[560px] my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#22c55e18]">
              <Icon name="CheckCircle2" size={18} style={{ color: "#22c55e" }} />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-[#1a1a1a]">Завершить смену</h2>
              {place && emp && (
                <p className="text-[12px] text-[#9b9b9b]">
                  {place.name} · {emp.name} · {shift.date}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#b5b5b5] hover:text-[#1a1a1a] hover:bg-[#f5f5f5] transition-all">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">

          {/* Заголовок блока */}
          <div className="flex items-center gap-2">
            <Icon name="PackageCheck" size={15} className="text-[#9b9b9b]" />
            <span className="text-[14px] font-semibold text-[#1a1a1a]">Что сделали за смену</span>
          </div>

          {/* Строки результатов */}
          <div className="space-y-3">
            {rows.map((row, i) => {
              const blank   = BLANK_TYPES.find(b => b.id === row.blankTypeId)!;
              const autoRaw = getAutoRaw(row);
              const qty     = parseFloat(row.qty) || 0;

              return (
                <div key={i} className="bg-[#fafafa] border border-[#f0f0f0] rounded-xl p-4 space-y-3">
                  {/* Строка 1: тип заготовки + кол-во */}
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <label className="block text-[11px] text-[#9b9b9b] mb-1">Тип заготовки</label>
                      <select
                        value={row.blankTypeId}
                        onChange={e => updateRow(i, { blankTypeId: e.target.value })}
                        className={sel + " w-full"}
                      >
                        {BLANK_TYPES.map(b => (
                          <option key={b.id} value={b.id}>{b.name} ({b.size})</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-[90px]">
                      <label className="block text-[11px] text-[#9b9b9b] mb-1">Кол-во, шт</label>
                      <input
                        type="number"
                        min="1"
                        value={row.qty}
                        onChange={e => updateRow(i, { qty: e.target.value })}
                        placeholder="0"
                        className={inp}
                      />
                    </div>
                    {rows.length > 1 && (
                      <button
                        onClick={() => removeRow(i)}
                        className="mt-5 w-8 h-8 flex items-center justify-center rounded-lg text-[#c5c5c5] hover:text-[#ef4444] hover:bg-red-50 transition-all shrink-0"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    )}
                  </div>

                  {/* Строка 2: расход сырья + для какого заказа */}
                  <div className="flex gap-2 items-end">
                    {/* Расход сырья */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] text-[#9b9b9b]">Расход сырья</label>
                        <button
                          onClick={() => updateRow(i, { manualMode: !row.manualMode, rawManual: "" })}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition-all font-medium
                            ${row.manualMode
                              ? "border-[#2563eb] text-[#2563eb] bg-[#eff6ff]"
                              : "border-[#e0e0e0] text-[#9b9b9b] hover:border-[#b0b0b0]"}`}
                        >
                          {row.manualMode ? "вручную" : "авто"}
                        </button>
                      </div>
                      {row.manualMode ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.rawManual}
                            onChange={e => updateRow(i, { rawManual: e.target.value })}
                            placeholder="0.00"
                            className={inp}
                          />
                          <span className="text-[12px] text-[#9b9b9b] whitespace-nowrap">м²</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 h-[40px] px-3 bg-white border border-[#f0f0f0] rounded-[8px]">
                          {qty > 0 ? (
                            <>
                              <span className="text-[14px] font-semibold text-[#1a1a1a]">{autoRaw}</span>
                              <span className="text-[12px] text-[#9b9b9b]">м²</span>
                              <span className="text-[10px] text-[#c5c5c5] ml-1">
                                ({qty} × {blank.rawPerUnit} м²)
                              </span>
                            </>
                          ) : (
                            <span className="text-[12px] text-[#c5c5c5]">укажите кол-во</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Для заказа */}
                    <div className="w-[150px]">
                      <label className="block text-[11px] text-[#9b9b9b] mb-1">Для заказа</label>
                      <select
                        value={row.forOrder}
                        onChange={e => updateRow(i, { forOrder: e.target.value })}
                        className={sel + " w-full"}
                      >
                        <option value="склад">на склад</option>
                        {SAMPLE_ORDERS.map(o => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Добавить ещё */}
          <button
            onClick={addRow}
            className="flex items-center gap-2 text-[13px] text-[#2563eb] font-medium hover:text-[#1d4ed8] transition-colors"
          >
            <Icon name="Plus" size={14} />
            Добавить ещё результат
          </button>

          {/* Итог */}
          {totalQty > 0 && (
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name="BarChart2" size={14} style={{ color: "#16a34a" }} />
                <span className="text-[13px] font-semibold text-[#16a34a]">Итого за смену</span>
              </div>
              <div className="flex gap-4 text-[13px]">
                <span className="font-bold text-[#1a1a1a]">{totalQty} шт.</span>
                <span className="text-[#6b7280]">{totalRaw.toFixed(2)} м² сырья</span>
              </div>
            </div>
          )}

          {/* Заметка */}
          <div>
            <label className="block text-[12px] text-[#9b9b9b] mb-1">Примечание (необязательно)</label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Особые случаи, поломки..."
              className="w-full bg-white border border-[#e0e0e0] rounded-[8px] px-3 py-2.5 text-[13px] outline-none focus:border-[#b0b0b0] transition-colors placeholder:text-[#c5c5c5]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={handleConfirm}
            disabled={!canSubmit}
            className="w-full bg-[#1a1a1a] text-white text-[15px] font-semibold py-3.5 rounded-[12px] hover:bg-[#333] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Завершить смену
          </button>
        </div>
      </div>
    </div>
  );
}