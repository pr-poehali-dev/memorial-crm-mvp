import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  PLACES, SHIFT_EMPLOYEES, WORK_TYPE_LABELS,
  WorkType, Shift, TODAY,
} from "./shifts.types";

const sel = "w-full bg-white border border-[#e0e0e0] rounded-[10px] px-3.5 py-3 text-[14px] text-[#1a1a1a] outline-none focus:border-[#b0b0b0] transition-colors";

type Props = {
  filterWorkType?: WorkType;   // ограничить список мест (напр. только "cutting")
  onConfirm: (shift: Omit<Shift, "id">) => void;
  onClose: () => void;
};

export default function AssignShiftModal({ filterWorkType, onConfirm, onClose }: Props) {
  const places = filterWorkType
    ? PLACES.filter(p => p.workType === filterWorkType)
    : PLACES;

  const [placeId,     setPlaceId]     = useState(places[0]?.id ?? "");
  const [employeeId,  setEmployeeId]  = useState(SHIFT_EMPLOYEES[0].id);
  const [date,        setDate]        = useState(TODAY);

  const place = PLACES.find(p => p.id === placeId);
  const emp   = SHIFT_EMPLOYEES.find(e => e.id === employeeId);

  const handleConfirm = () => {
    if (!placeId || !employeeId) return;
    onConfirm({
      placeId,
      employeeId,
      workType: place!.workType,
      date,
      status: "active",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/25 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-[#ebebeb] shadow-2xl p-6 w-full max-w-[420px]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#f59e0b18]">
              <Icon name="CalendarClock" size={18} style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold text-[#1a1a1a]">Назначить смену</h2>
              <p className="text-[12px] text-[#9b9b9b]">Заполните 3 поля</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#b5b5b5] hover:text-[#1a1a1a] hover:bg-[#f5f5f5] transition-all">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Место */}
          <div>
            <label className="block text-[13px] font-semibold text-[#4b4b4b] mb-1.5">Место и станок</label>
            <select value={placeId} onChange={e => setPlaceId(e.target.value)} className={sel}>
              {places.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {place && (
              <p className="mt-1 text-[11px] text-[#9b9b9b]">
                Тип работы: {WORK_TYPE_LABELS[place.workType]}
              </p>
            )}
          </div>

          {/* Сотрудник */}
          <div>
            <label className="block text-[13px] font-semibold text-[#4b4b4b] mb-1.5">Сотрудник</label>
            <select value={employeeId} onChange={e => setEmployeeId(e.target.value)} className={sel}>
              {SHIFT_EMPLOYEES.map(e => (
                <option key={e.id} value={e.id}>{e.name} — {e.role}</option>
              ))}
            </select>
          </div>

          {/* Дата */}
          <div>
            <label className="block text-[13px] font-semibold text-[#4b4b4b] mb-1.5">Дата</label>
            <input
              type="text"
              value={date}
              onChange={e => setDate(e.target.value)}
              className={sel}
              placeholder="дд.мм.гггг"
            />
          </div>
        </div>

        {/* Preview */}
        {place && emp && (
          <div className="mt-5 bg-[#fafafa] border border-[#f0f0f0] rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: place.color + "20" }}>
              <Icon name={place.icon as never} size={14} style={{ color: place.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#1a1a1a] truncate">{place.name}</p>
              <p className="text-[11px] text-[#9b9b9b]">{emp.name} · {date}</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!placeId || !employeeId}
          className="mt-5 w-full bg-[#1a1a1a] text-white text-[15px] font-semibold py-3.5 rounded-[12px] hover:bg-[#333] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Назначить смену
        </button>
      </div>
    </div>
  );
}
