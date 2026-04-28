import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Zone, Machine, Employee, Shift, ZONES, MACHINES, EMPLOYEES } from "./production.types";

const selectCls = "w-full bg-white border border-[#ebebeb] rounded-[8px] px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-[#c0c0c0] transition-colors";
const inputCls  = "w-full bg-white border border-[#ebebeb] rounded-[8px] px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-[#c0c0c0] transition-colors placeholder:text-[#c5c5c5]";

type Props = {
  initialZoneId?: string;
  onConfirm: (shift: Omit<Shift, "id">) => void;
  onClose: () => void;
};

export default function ProductionShiftModal({ initialZoneId, onConfirm, onClose }: Props) {
  const productionZones = ZONES.filter(z => z.type === "production");

  const [zoneId,      setZoneId]      = useState(initialZoneId ?? productionZones[0]?.id ?? "");
  const [machineId,   setMachineId]   = useState("");
  const [employeeId,  setEmployeeId]  = useState(EMPLOYEES[0]?.id ?? "");
  const [note,        setNote]        = useState("");

  const zoneMachines = MACHINES.filter(m => m.zoneId === zoneId);

  /* при смене зоны — сбросить станок */
  useEffect(() => {
    setMachineId(zoneMachines[0]?.id ?? "");
  }, [zoneId]);

  const selectedZone    = ZONES.find(z => z.id === zoneId);
  const selectedMachine = MACHINES.find(m => m.id === machineId);
  const canSubmit = zoneId && machineId && employeeId;

  const handleConfirm = () => {
    if (!canSubmit) return;
    onConfirm({
      zoneId,
      machineId,
      employeeId,
      date: new Date().toLocaleDateString("ru-RU"),
      note: note.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-fade-in"
      onClick={onClose}>
      <div className="bg-white rounded-2xl border border-[#ebebeb] shadow-2xl p-6 w-full max-w-[400px] animate-scale-in"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#f59e0b18]">
              <Icon name="CalendarClock" size={15} style={{ color: "#f59e0b" }} />
            </div>
            <h2 className="text-[15px] font-semibold text-[#1a1a1a]">Назначить смену</h2>
          </div>
          <button onClick={onClose} className="text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors">
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Шаг 1: Зона */}
        <div className="mb-3">
          <label className="block mb-1 text-[12px] font-medium text-[#6b6b6b]">
            <span className="inline-flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-[#1a1a1a] text-white text-[9px] font-bold flex items-center justify-center">1</span>
              Зона
            </span>
          </label>
          <select value={zoneId} onChange={e => setZoneId(e.target.value)} className={selectCls}>
            {productionZones.map(z => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
          {selectedZone && (
            <p className="mt-1 text-[11px] text-[#9b9b9b]">
              Доступно станков: {MACHINES.filter(m => m.zoneId === zoneId).length}
            </p>
          )}
        </div>

        {/* Шаг 2: Станок */}
        <div className="mb-3">
          <label className="block mb-1 text-[12px] font-medium text-[#6b6b6b]">
            <span className="inline-flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-[#1a1a1a] text-white text-[9px] font-bold flex items-center justify-center">2</span>
              Станок
            </span>
          </label>
          {zoneMachines.length === 0 ? (
            <div className="border border-dashed border-[#e0e0e0] rounded-[8px] px-3 py-2 text-[12px] text-[#b5b5b5] text-center">
              В этой зоне нет станков
            </div>
          ) : (
            <select value={machineId} onChange={e => setMachineId(e.target.value)} className={selectCls}>
              {zoneMachines.map(m => (
                <option key={m.id} value={m.id}>{m.name} — {m.type}</option>
              ))}
            </select>
          )}
        </div>

        {/* Шаг 3: Сотрудник */}
        <div className="mb-3">
          <label className="block mb-1 text-[12px] font-medium text-[#6b6b6b]">
            <span className="inline-flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-[#1a1a1a] text-white text-[9px] font-bold flex items-center justify-center">3</span>
              Сотрудник
            </span>
          </label>
          <select value={employeeId} onChange={e => setEmployeeId(e.target.value)} className={selectCls}>
            {EMPLOYEES.map(e => (
              <option key={e.id} value={e.id}>{e.name} — {e.role}</option>
            ))}
          </select>
        </div>

        {/* Заметка */}
        <div className="mb-4">
          <label className="block mb-1 text-[12px] text-[#6b6b6b]">Заметка (необязательно)</label>
          <input value={note} onChange={e => setNote(e.target.value)}
            placeholder="Особые указания..."
            className={inputCls} />
        </div>

        {/* Итог */}
        {canSubmit && selectedZone && selectedMachine && (
          <div className="bg-[#f5f5f5] rounded-lg px-3 py-2.5 mb-4 text-[12px] text-[#4b4b4b]">
            <span className="font-semibold text-[#1a1a1a]">{EMPLOYEES.find(e => e.id === employeeId)?.name}</span>
            {" "}→{" "}
            <span style={{ color: selectedZone.color }}>{selectedZone.name}</span>
            {" / "}
            <span>{selectedMachine.name}</span>
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!canSubmit}
          className="w-full bg-[#1a1a1a] text-white text-[13px] py-2.5 rounded-[8px] hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Назначить смену
        </button>
      </div>
    </div>
  );
}
