import { useState } from "react";
import Icon from "@/components/ui/icon";

/* ─── Типы ─── */
type CuttingMachine = { id: string; name: string; type: string };
type CuttingEmployee = { id: string; name: string };

type BlankType = {
  id: string;
  name: string;
  size: string;
  materialName: string;
  rawPerUnit: number; // расход сырья (м²) на 1 заготовку
};

type CuttingShift = {
  id: string;
  date: string;
  machineId: string;
  employeeId: string;
  blankTypeId: string;
  produced: number;    // кол-во заготовок
  rawUsed: number;     // м² сырья
  note?: string;
};

/* ─── Данные ─── */
const MACHINES: CuttingMachine[] = [
  { id: "m1", name: "Пилорама №1", type: "Ленточная пила" },
  { id: "m2", name: "Пилорама №2", type: "Дисковая пила" },
];

const EMPLOYEES: CuttingEmployee[] = [
  { id: "e2", name: "Игорь В." },
  { id: "e6", name: "Павел Н." },
];

const BLANK_TYPES: BlankType[] = [
  { id: "bt1", name: "Плита стандарт",    size: "100×50×8",  materialName: "Гранит чёрный (габбро)", rawPerUnit: 0.50 },
  { id: "bt2", name: "Плита большая",     size: "120×60×10", materialName: "Гранит серый",           rawPerUnit: 0.72 },
  { id: "bt3", name: "Плита малая",       size: "80×40×6",   materialName: "Мрамор белый",           rawPerUnit: 0.32 },
  { id: "bt4", name: "Плита красный гран",size: "90×45×7",   materialName: "Гранит красный",         rawPerUnit: 0.41 },
  { id: "bt5", name: "Тумба",             size: "60×30×80",  materialName: "Гранит чёрный (габбро)", rawPerUnit: 1.44 },
];

const initShifts: CuttingShift[] = [
  { id: "cs1", date: "28.04.2026", machineId: "m1", employeeId: "e2", blankTypeId: "bt1", produced: 4, rawUsed: 2.0  },
  { id: "cs2", date: "27.04.2026", machineId: "m2", employeeId: "e6", blankTypeId: "bt2", produced: 2, rawUsed: 1.44 },
  { id: "cs3", date: "26.04.2026", machineId: "m1", employeeId: "e2", blankTypeId: "bt5", produced: 3, rawUsed: 4.32, note: "Тумбы под заказы МП-0040, МП-0042" },
  { id: "cs4", date: "25.04.2026", machineId: "m1", employeeId: "e2", blankTypeId: "bt3", produced: 2, rawUsed: 0.64 },
  { id: "cs5", date: "24.04.2026", machineId: "m2", employeeId: "e6", blankTypeId: "bt4", produced: 1, rawUsed: 0.41 },
];

const selectCls = "w-full bg-white border border-[#ebebeb] rounded-[8px] px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-[#c0c0c0] transition-colors";
const inputCls  = "w-full bg-white border border-[#ebebeb] rounded-[8px] px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-[#c0c0c0] transition-colors placeholder:text-[#c5c5c5]";

export default function CuttingPage() {
  const [shifts, setShifts]   = useState<CuttingShift[]>(initShifts);
  const [showModal, setShowModal] = useState(false);

  /* форма */
  const [fMachine,   setFMachine]   = useState(MACHINES[0].id);
  const [fEmployee,  setFEmployee]  = useState(EMPLOYEES[0].id);
  const [fBlankType, setFBlankType] = useState(BLANK_TYPES[0].id);
  const [fProduced,  setFProduced]  = useState("");
  const [fNote,      setFNote]      = useState("");

  const selectedBlank = BLANK_TYPES.find(b => b.id === fBlankType)!;
  const autoRaw = fProduced ? (parseFloat(fProduced) * selectedBlank.rawPerUnit).toFixed(2) : "";

  const handleAdd = () => {
    const q = parseInt(fProduced);
    if (!q || q <= 0) return;
    const raw = +(q * selectedBlank.rawPerUnit).toFixed(2);
    setShifts(prev => [{
      id: "cs" + Date.now(),
      date: new Date().toLocaleDateString("ru-RU").replace(/\//g, "."),
      machineId: fMachine,
      employeeId: fEmployee,
      blankTypeId: fBlankType,
      produced: q,
      rawUsed: raw,
      note: fNote.trim() || undefined,
    }, ...prev]);
    setFProduced("");
    setFNote("");
    setShowModal(false);
  };

  /* сводка по типам заготовок */
  const blankSummary = BLANK_TYPES.map(bt => {
    const total = shifts.filter(s => s.blankTypeId === bt.id).reduce((sum, s) => sum + s.produced, 0);
    return { ...bt, total };
  }).filter(b => b.total > 0);

  /* итоги */
  const totalProduced = shifts.reduce((s, sh) => s + sh.produced, 0);
  const totalRaw      = shifts.reduce((s, sh) => s + sh.rawUsed, 0);
  const totalShifts   = shifts.length;

  return (
    <div className="p-7 max-w-[1100px] mx-auto w-full space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[21px] font-semibold text-[#1a1a1a] tracking-tight">Заготовки / Распил</h1>
          <p className="text-[13px] text-[#9b9b9b] mt-0.5">Учёт смен, производства заготовок и расхода сырья</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[13px] px-4 py-2 rounded-[8px] hover:bg-[#333] transition-colors"
        >
          <Icon name="Plus" size={14} />Добавить смену
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-[#ebebeb] rounded-xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#f59e0b18]">
            <Icon name="Layers" size={15} style={{ color: "#f59e0b" }} />
          </div>
          <div>
            <p className="text-[19px] font-semibold text-[#1a1a1a] leading-none mb-0.5">{totalProduced}</p>
            <p className="text-[11px] text-[#9b9b9b]">Заготовок произведено</p>
          </div>
        </div>
        <div className="bg-white border border-[#ebebeb] rounded-xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#6b728018]">
            <Icon name="Package" size={15} style={{ color: "#6b7280" }} />
          </div>
          <div>
            <p className="text-[19px] font-semibold text-[#1a1a1a] leading-none mb-0.5">{totalRaw.toFixed(1)} м²</p>
            <p className="text-[11px] text-[#9b9b9b]">Сырья израсходовано</p>
          </div>
        </div>
        <div className="bg-white border border-[#ebebeb] rounded-xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#6366f118]">
            <Icon name="CalendarClock" size={15} style={{ color: "#6366f1" }} />
          </div>
          <div>
            <p className="text-[19px] font-semibold text-[#1a1a1a] leading-none mb-0.5">{totalShifts}</p>
            <p className="text-[11px] text-[#9b9b9b]">Смен за период</p>
          </div>
        </div>
      </div>

      {/* Сводка по типам */}
      {blankSummary.length > 0 && (
        <div className="bg-white border border-[#ebebeb] rounded-xl p-4">
          <p className="text-[12px] font-semibold text-[#4b4b4b] mb-3 flex items-center gap-2">
            <Icon name="BarChart2" size={13} className="text-[#9b9b9b]" />
            Текущие остатки по типам
          </p>
          <div className="grid grid-cols-5 gap-2">
            {blankSummary.map(b => (
              <div key={b.id} className="bg-[#fafafa] border border-[#f0f0f0] rounded-lg px-3 py-2.5">
                <p className="text-[12px] font-semibold text-[#1a1a1a] truncate">{b.name}</p>
                <p className="text-[10px] text-[#9b9b9b] font-mono mb-1">{b.size}</p>
                <p className="text-[18px] font-bold text-[#1a1a1a] leading-none">{b.total}</p>
                <p className="text-[10px] text-[#b5b5b5] mt-0.5">шт. произведено</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Таблица смен */}
      <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex items-center gap-2">
          <Icon name="History" size={13} className="text-[#9b9b9b]" />
          <span className="text-[12px] font-semibold text-[#4b4b4b]">Журнал смен</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#f0f0f0]">
              {["Дата", "Станок", "Сотрудник", "Тип заготовки", "Размер", "Произведено", "Расход сырья", "Заметка"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shifts.map((s, i) => {
              const machine  = MACHINES.find(m => m.id === s.machineId);
              const employee = EMPLOYEES.find(e => e.id === s.employeeId);
              const blank    = BLANK_TYPES.find(b => b.id === s.blankTypeId);
              const isLast   = i === shifts.length - 1;
              return (
                <tr key={s.id} className={`hover:bg-[#fafafa] transition-colors ${!isLast ? "border-b border-[#f5f5f5]" : ""}`}>
                  <td className="px-4 py-3 text-[12px] text-[#6b6b6b] font-mono whitespace-nowrap">{s.date}</td>
                  <td className="px-4 py-3">
                    <p className="text-[12px] font-medium text-[#1a1a1a]">{machine?.name}</p>
                    <p className="text-[10px] text-[#9b9b9b]">{machine?.type}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-[#4b4b4b] bg-[#f5f5f5] px-2 py-0.5 rounded-md">{employee?.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[12px] font-medium text-[#1a1a1a]">{blank?.name}</p>
                    <p className="text-[10px] text-[#9b9b9b]">{blank?.materialName}</p>
                  </td>
                  <td className="px-4 py-3 text-[12px] font-mono text-[#6b6b6b]">{blank?.size}</td>
                  <td className="px-4 py-3">
                    <span className="text-[14px] font-bold text-[#1a1a1a]">{s.produced}</span>
                    <span className="text-[11px] text-[#9b9b9b] ml-1">шт.</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] font-semibold text-[#f59e0b]">{s.rawUsed}</span>
                    <span className="text-[11px] text-[#9b9b9b] ml-1">м²</span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-[#9b9b9b] max-w-[160px] truncate">{s.note ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Модалка добавления смены */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl border border-[#ebebeb] shadow-2xl p-6 w-full max-w-[420px] animate-scale-in"
            onClick={e => e.stopPropagation()}>

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#f59e0b18]">
                  <Icon name="Scissors" size={15} style={{ color: "#f59e0b" }} />
                </div>
                <h2 className="text-[15px] font-semibold text-[#1a1a1a]">Добавить смену распила</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors">
                <Icon name="X" size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-[12px] text-[#6b6b6b]">Станок</label>
                <select value={fMachine} onChange={e => setFMachine(e.target.value)} className={selectCls}>
                  {MACHINES.map(m => <option key={m.id} value={m.id}>{m.name} — {m.type}</option>)}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-[12px] text-[#6b6b6b]">Сотрудник</label>
                <select value={fEmployee} onChange={e => setFEmployee(e.target.value)} className={selectCls}>
                  {EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-[12px] text-[#6b6b6b]">Тип заготовки</label>
                <select value={fBlankType} onChange={e => setFBlankType(e.target.value)} className={selectCls}>
                  {BLANK_TYPES.map(b => <option key={b.id} value={b.id}>{b.name} ({b.size}) — {b.materialName}</option>)}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-[12px] text-[#6b6b6b]">Количество заготовок (шт.)</label>
                <input type="number" min="1" step="1" value={fProduced} onChange={e => setFProduced(e.target.value)}
                  placeholder="0" className={inputCls} />
              </div>

              {autoRaw && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-[12px] text-[#4b4b4b]">
                  Расход сырья: <b className="text-[#1a1a1a]">{autoRaw} м²</b>
                  <span className="text-[#9b9b9b] ml-1">({selectedBlank.rawPerUnit} м²/шт. × {fProduced} шт.)</span>
                </div>
              )}

              <div>
                <label className="block mb-1 text-[12px] text-[#6b6b6b]">Заметка (необязательно)</label>
                <input value={fNote} onChange={e => setFNote(e.target.value)}
                  placeholder="Привязка к заказам, особые указания..." className={inputCls} />
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={!fProduced || parseInt(fProduced) <= 0}
              className="mt-5 w-full bg-[#1a1a1a] text-white text-[13px] py-2.5 rounded-[8px] hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Записать смену
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
