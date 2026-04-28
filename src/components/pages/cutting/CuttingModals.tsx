import Icon from "@/components/ui/icon";
import {
  WorkType, ShiftResult, Shift,
  PLACES, EMPLOYEES, BLANK_TYPES, ORDERS, WORK_LABELS,
  selectCls, inputCls, labelCls,
} from "./cutting.types";

/* ════════════════════════════════
   Модалка: Назначить смену
════════════════════════════════ */
type AssignProps = {
  fPlace: string;
  fEmployee: string;
  fWorkType: WorkType;
  fDate: string;
  today: string;
  onChangePlace: (v: string) => void;
  onChangeEmployee: (v: string) => void;
  onChangeWorkType: (v: WorkType) => void;
  onChangeDate: (v: string) => void;
  onAssign: () => void;
  onClose: () => void;
};

export function AssignModal({
  fPlace, fEmployee, fWorkType, fDate, today,
  onChangePlace, onChangeEmployee, onChangeWorkType, onChangeDate,
  onAssign, onClose,
}: AssignProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-[#ebebeb] shadow-2xl p-6 w-full max-w-[440px]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#22c55e18] flex items-center justify-center">
              <Icon name="CalendarPlus" size={18} style={{ color: "#22c55e" }} />
            </div>
            <h2 className="text-[16px] font-semibold text-[#1a1a1a]">Назначить смену</h2>
          </div>
          <button onClick={onClose} className="text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>Место</label>
            <select value={fPlace} onChange={e => onChangePlace(e.target.value)} className={selectCls}>
              {PLACES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Сотрудник</label>
            <select value={fEmployee} onChange={e => onChangeEmployee(e.target.value)} className={selectCls}>
              {EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Тип работы</label>
            <div className="flex gap-2">
              {(["cutting", "engraving", "polishing"] as WorkType[]).map(wt => (
                <button
                  key={wt}
                  onClick={() => onChangeWorkType(wt)}
                  className={`flex-1 py-2 rounded-[8px] text-[13px] font-medium border transition-all
                    ${fWorkType === wt
                      ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                      : "bg-white text-[#6b6b6b] border-[#e0e0e0] hover:border-[#b0b0b0]"}`}
                >
                  {WORK_LABELS[wt]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Дата</label>
            <input
              type="text"
              value={fDate}
              onChange={e => onChangeDate(e.target.value)}
              placeholder={today}
              className={inputCls}
            />
          </div>
        </div>

        <button
          onClick={onAssign}
          className="mt-5 w-full bg-[#22c55e] text-white text-[14px] font-semibold py-3 rounded-[10px] hover:bg-[#16a34a] active:scale-[0.98] transition-all"
        >
          Открыть смену
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════
   Модалка: Завершить смену
════════════════════════════════ */
type FinishProps = {
  shift: Shift;
  fResults: ShiftResult[];
  onUpdateResult: (idx: number, patch: Partial<ShiftResult>) => void;
  onAddResult: () => void;
  onRemoveResult: (idx: number) => void;
  onFinish: () => void;
  onClose: () => void;
};

export function FinishModal({
  shift, fResults,
  onUpdateResult, onAddResult, onRemoveResult,
  onFinish, onClose,
}: FinishProps) {
  const place    = PLACES.find(p => p.id === shift.placeId)!;
  const employee = EMPLOYEES.find(e => e.id === shift.employeeId)!;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-[#ebebeb] shadow-2xl w-full max-w-[540px] max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Шапка */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f59e0b18] flex items-center justify-center">
              <Icon name="CheckSquare" size={18} style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#1a1a1a]">Завершение смены</h2>
              <p className="text-[12px] text-[#9b9b9b]">{place.name} · {employee.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Тело */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-[13px] font-semibold text-[#4b4b4b]">Что сделали за смену</p>

          {fResults.map((r, idx) => {
            const bt      = BLANK_TYPES.find(b => b.id === r.blankTypeId)!;
            const autoRaw = +(bt.rawPerUnit * r.produced).toFixed(2);
            return (
              <div key={idx} className="bg-[#fafafa] border border-[#f0f0f0] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-[#6b6b6b]">Результат #{idx + 1}</span>
                  {fResults.length > 1 && (
                    <button
                      onClick={() => onRemoveResult(idx)}
                      className="text-[#c0c0c0] hover:text-[#dc2626] transition-colors"
                    >
                      <Icon name="Trash2" size={14} />
                    </button>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Тип заготовки</label>
                  <select
                    value={r.blankTypeId}
                    onChange={e => onUpdateResult(idx, { blankTypeId: e.target.value })}
                    className={selectCls}
                  >
                    {BLANK_TYPES.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.size})</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className={labelCls}>Количество (шт.)</label>
                    <input
                      type="number" min="1" step="1"
                      value={r.produced}
                      onChange={e => onUpdateResult(idx, { produced: Math.max(1, parseInt(e.target.value) || 1) })}
                      className={inputCls}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[13px] font-medium text-[#4b4b4b]">Расход сырья (м²)</label>
                      <button
                        onClick={() => onUpdateResult(idx, { rawAuto: !r.rawAuto, rawUsed: r.rawAuto ? r.rawUsed : autoRaw })}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all
                          ${r.rawAuto
                            ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                            : "bg-white text-[#6b6b6b] border-[#e0e0e0]"}`}
                      >
                        {r.rawAuto ? "авто" : "вручную"}
                      </button>
                    </div>
                    <input
                      type="number" min="0" step="0.01"
                      value={r.rawUsed}
                      readOnly={r.rawAuto}
                      onChange={e => !r.rawAuto && onUpdateResult(idx, { rawUsed: parseFloat(e.target.value) || 0 })}
                      className={inputCls + (r.rawAuto ? " bg-[#f5f5f5] text-[#9b9b9b] cursor-default" : "")}
                    />
                  </div>
                </div>

                {r.rawAuto && (
                  <div className="text-[11px] text-[#9b9b9b]">
                    {bt.rawPerUnit} м²/шт. × {r.produced} шт. = <b className="text-[#f59e0b]">{autoRaw} м²</b>
                  </div>
                )}

                <div>
                  <label className={labelCls}>Для какого заказа</label>
                  <select
                    value={r.orderId ?? "На склад"}
                    onChange={e => onUpdateResult(idx, { orderId: e.target.value })}
                    className={selectCls}
                  >
                    {ORDERS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            );
          })}

          <button
            onClick={onAddResult}
            className="w-full py-2.5 border border-dashed border-[#d0d0d0] rounded-xl text-[13px] text-[#9b9b9b] hover:text-[#4b4b4b] hover:border-[#9b9b9b] transition-all"
          >
            + Добавить ещё результат
          </button>

          {fResults.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex gap-6 text-[13px]">
              <span className="text-[#4b4b4b]">
                Итого заготовок: <b className="text-[#1a1a1a]">{fResults.reduce((a, r) => a + r.produced, 0)} шт.</b>
              </span>
              <span className="text-[#4b4b4b]">
                Сырьё: <b className="text-[#f59e0b]">{fResults.reduce((a, r) => a + r.rawUsed, 0).toFixed(2)} м²</b>
              </span>
            </div>
          )}
        </div>

        {/* Кнопка */}
        <div className="p-6 pt-4 border-t border-[#f0f0f0]">
          <button
            onClick={onFinish}
            disabled={fResults.some(r => r.produced <= 0)}
            className="w-full bg-[#1a1a1a] text-white text-[14px] font-semibold py-3 rounded-[10px] hover:bg-[#333] active:scale-[0.98] transition-all disabled:opacity-40"
          >
            Завершить смену
          </button>
        </div>
      </div>
    </div>
  );
}
