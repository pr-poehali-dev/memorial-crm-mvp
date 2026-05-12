import Icon from "@/components/ui/icon";
import {
  WorkType, ShiftResult, Shift, Place, Employee, BlankType, CuttingTask,
  WORK_LABELS,
  selectCls, inputCls, labelCls,
} from "./cutting.types";

/* ════════════════════════════════
   Ползунок с числовым вводом
════════════════════════════════ */
function SliderInput({
  label, value, min = 1, max, onChange, suffix = "шт.",
}: {
  label?: string;
  value: number;
  min?: number;
  max: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  /* если всего 1 вариант — показываем только бейдж, без ползунка */
  if (max <= min) {
    return (
      <div>
        {label && <label className={labelCls}>{label}</label>}
        <div className="flex items-center gap-2">
          <span className="text-[22px] font-bold text-[#1a1a1a]">{value}</span>
          <span className="text-[13px] text-[#9b9b9b]">{suffix}</span>
        </div>
      </div>
    );
  }

  const pct = Math.round(((value - min) / (max - min)) * 100);

  return (
    <div>
      {label && <label className={labelCls}>{label}</label>}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            type="range"
            min={min}
            max={max}
            step={1}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #1a1a1a ${pct}%, #e8e8e8 ${pct}%)`,
            }}
          />
          <div className="flex justify-between mt-0.5">
            <span className="text-[10px] text-[#c5c5c5]">{min}</span>
            <span className="text-[10px] text-[#c5c5c5]">{max}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 w-[68px] shrink-0">
          <input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={e => {
              const v = Math.min(max, Math.max(min, parseInt(e.target.value) || min));
              onChange(v);
            }}
            className="w-full bg-white border border-[#e0e0e0] rounded-[8px] px-2 py-1.5 text-[13px] text-[#1a1a1a] text-center outline-none focus:border-[#b0b0b0] transition-colors"
          />
          <span className="text-[11px] text-[#9b9b9b] shrink-0">{suffix}</span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════
   Модалка: Назначить смену
════════════════════════════════ */
type AssignProps = {
  fPlace: string;
  fEmployee: string;
  fWorkType: WorkType;
  fDate: string;
  today: string;
  fTaskId: string;
  fTaskQty: string;
  places: Place[];
  employees: Employee[];
  tasks: CuttingTask[];
  onChangePlace: (v: string) => void;
  onChangeEmployee: (v: string) => void;
  onChangeWorkType: (v: WorkType) => void;
  onChangeDate: (v: string) => void;
  onChangeTaskId: (v: string) => void;
  onChangeTaskQty: (v: string) => void;
  onAssign: () => void;
  onClose: () => void;
};

export function AssignModal({
  fPlace, fEmployee, fWorkType, fDate, today,
  fTaskId, fTaskQty,
  places, employees, tasks,
  onChangePlace, onChangeEmployee, onChangeWorkType, onChangeDate,
  onChangeTaskId, onChangeTaskQty,
  onAssign, onClose,
}: AssignProps) {
  const openTasks = tasks.filter(t => t.status !== "done" && t.status !== "cancelled");
  const selectedTask = openTasks.find(t => t.id === fTaskId);
  const remaining = selectedTask
    ? selectedTask.totalQty - selectedTask.doneQty - selectedTask.inProgressQty
    : 0;
  const taskQtyNum = parseInt(fTaskQty) || (remaining > 0 ? remaining : 0);
  const taskOverLimit = selectedTask && taskQtyNum > remaining;

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
              {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className={labelCls}>Сотрудник</label>
            <select value={fEmployee} onChange={e => onChangeEmployee(e.target.value)} className={selectCls}>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
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

          {openTasks.length > 0 && (
            <div className="bg-[#f5f3ff] border border-[#d8d8ff] rounded-[10px] p-3 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#6366f1]">Задача на нарезку</p>
              <div>
                <label className={labelCls}>Выбрать задачу</label>
                <select
                  value={fTaskId}
                  onChange={e => { onChangeTaskId(e.target.value); onChangeTaskQty(""); }}
                  className={selectCls}
                >
                  <option value="">— без задачи —</option>
                  {openTasks.map(t => {
                    const rem = t.totalQty - t.doneQty - t.inProgressQty;
                    return (
                      <option key={t.id} value={t.id}>
                        {t.blankName ?? "Заготовка"} · осталось {rem} шт.
                      </option>
                    );
                  })}
                </select>
              </div>

              {fTaskId && selectedTask && remaining > 0 && (
                <SliderInput
                  label="Количество в работу"
                  value={taskQtyNum}
                  min={1}
                  max={remaining}
                  onChange={v => onChangeTaskQty(String(v))}
                  suffix="шт."
                />
              )}

              {fTaskId && selectedTask && !taskOverLimit && taskQtyNum > 0 && remaining > 0 && (
                <p className="text-[11px] text-[#6366f1]">
                  После назначения останется: {remaining - taskQtyNum} шт.
                </p>
              )}
              {taskOverLimit && (
                <p className="text-[11px] text-red-500">Нельзя назначить больше {remaining} шт.</p>
              )}
            </div>
          )}

          <div>
            <label className={labelCls}>Дата</label>
            <input
              type="date"
              value={fDate}
              onChange={e => onChangeDate(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <button
          onClick={onAssign}
          disabled={!!(fTaskId && taskOverLimit)}
          className="mt-5 w-full bg-[#22c55e] text-white text-[14px] font-semibold py-3 rounded-[10px] hover:bg-[#16a34a] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
  blankTypes: BlankType[];
  onUpdateResult: (idx: number, patch: Partial<ShiftResult>) => void;
  onAddResult: () => void;
  onRemoveResult: (idx: number) => void;
  onFinish: () => void;
  onClose: () => void;
};

export function FinishModal({
  shift, fResults, blankTypes,
  onUpdateResult, onAddResult, onRemoveResult,
  onFinish, onClose,
}: FinishProps) {
  const place    = { name: shift.placeId,    machine: "" };
  const employee = { name: shift.employeeId };

  const totalProduced = fResults.reduce((a, r) => a + r.produced, 0);
  const totalRaw      = +fResults.reduce((a, r) => a + r.rawUsed, 0).toFixed(2);
  const plan          = shift.taskQtyAssigned ?? 0;
  const underPlan     = plan > 0 && totalProduced < plan;
  const pct           = plan > 0 ? Math.min(100, Math.round((totalProduced / plan) * 100)) : 0;

  const ORDERS = ["На склад", "МП-0038", "МП-0040", "МП-0042", "МП-0045"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-[#ebebeb] shadow-2xl w-full max-w-[520px] max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f59e0b18] flex items-center justify-center shrink-0">
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

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {plan > 0 && (
            <div className="bg-[#f5f3ff] border border-[#d8d8ff] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-md bg-[#6366f1] flex items-center justify-center shrink-0">
                  <Icon name="ClipboardList" size={10} className="text-white" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#6366f1]">Задача смены</p>
              </div>
              <div className="flex items-center justify-between gap-4 mb-3">
                <p className="text-[14px] font-semibold text-[#1a1a1a]">План: {plan} шт.</p>
                <p className="text-[24px] font-bold text-[#6366f1] leading-none">{totalProduced}/{plan}</p>
              </div>
              <div className="h-2 bg-[#e8e4ff] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: underPlan ? "#f59e0b" : "#6366f1" }} />
              </div>
              {underPlan && totalProduced > 0 && (
                <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <Icon name="AlertTriangle" size={13} className="text-amber-500 shrink-0" />
                  <p className="text-[12px] text-amber-700">
                    Выполнено меньше плана — {plan - totalProduced} шт. не доделано
                  </p>
                </div>
              )}
            </div>
          )}

          <p className="text-[13px] font-semibold text-[#4b4b4b]">Что сделали за смену</p>

          {fResults.map((r, idx) => {
            const bt      = blankTypes.find(b => b.id === r.blankTypeId) ?? blankTypes[0];
            const autoRaw = bt ? +(bt.rawPerUnit * r.produced).toFixed(2) : 0;
            /* если к смене привязана задача — ползунок до plan, иначе до 999 */
            const maxQty  = plan > 0 ? plan : 999;

            return (
              <div key={idx} className="bg-[#fafafa] border border-[#f0f0f0] rounded-xl p-4 space-y-3">
                {fResults.length > 1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-[#6b6b6b]">Результат #{idx + 1}</span>
                    <button onClick={() => onRemoveResult(idx)} className="text-[#c0c0c0] hover:text-[#dc2626] transition-colors">
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                )}

                <div>
                  <label className={labelCls}>Тип заготовки</label>
                  <select
                    value={r.blankTypeId}
                    onChange={e => {
                      const newBt = blankTypes.find(b => b.id === e.target.value);
                      const newRaw = r.rawAuto && newBt ? +(newBt.rawPerUnit * r.produced).toFixed(2) : r.rawUsed;
                      onUpdateResult(idx, { blankTypeId: e.target.value, rawUsed: newRaw });
                    }}
                    className={selectCls}
                  >
                    {blankTypes.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.size})</option>
                    ))}
                  </select>
                </div>

                {/* Ползунок количества */}
                <SliderInput
                  label={plan > 0 ? `Количество (план: ${plan} шт.)` : "Количество (шт.)"}
                  value={r.produced}
                  min={1}
                  max={maxQty}
                  onChange={v => {
                    const newRaw = r.rawAuto && bt ? +(bt.rawPerUnit * v).toFixed(2) : r.rawUsed;
                    onUpdateResult(idx, { produced: v, rawUsed: newRaw });
                  }}
                  suffix="шт."
                />

                {/* Расход сырья */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[13px] font-medium text-[#4b4b4b]">Расход сырья (м²)</label>
                    <button
                      onClick={() => {
                        const switchingToAuto = r.rawAuto === false;
                        onUpdateResult(idx, { rawAuto: !r.rawAuto, rawUsed: switchingToAuto ? autoRaw : r.rawUsed });
                      }}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all
                        ${r.rawAuto
                          ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                          : "bg-white text-[#6b6b6b] border-[#e0e0e0]"}`}
                    >
                      {r.rawAuto ? "авто" : "вручную"}
                    </button>
                  </div>
                  {r.rawAuto ? (
                    <div className="bg-[#f5f5f5] border border-[#e8e8e8] rounded-[10px] px-3 py-2.5 flex items-center justify-between">
                      <span className="text-[12px] text-[#9b9b9b]">
                        {bt?.rawPerUnit ?? 0} м²/шт. × {r.produced} шт.
                      </span>
                      <span className="text-[14px] font-bold text-[#f59e0b]">{autoRaw} м²</span>
                    </div>
                  ) : (
                    <input
                      type="number" min="0" step="0.01"
                      value={r.rawUsed}
                      onChange={e => onUpdateResult(idx, { rawUsed: parseFloat(e.target.value) || 0 })}
                      className={inputCls}
                    />
                  )}
                </div>

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
                Итого: <b className="text-[#1a1a1a]">{totalProduced} шт.</b>
              </span>
              <span className="text-[#4b4b4b]">
                Сырьё: <b className="text-[#f59e0b]">{totalRaw} м²</b>
              </span>
              {plan > 0 && underPlan && (
                <span className="ml-auto text-amber-600 font-semibold">
                  −{plan - totalProduced} шт. от плана
                </span>
              )}
            </div>
          )}
        </div>

        <div className="px-6 pb-5 pt-4 border-t border-[#f0f0f0]">
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