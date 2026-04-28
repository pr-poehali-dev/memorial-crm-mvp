import Icon from "@/components/ui/icon";
import { Zone, Machine, Employee, Shift, COLUMNS } from "./production.types";

type Props = {
  zones: Zone[];
  machines: Machine[];
  employees: Employee[];
  shifts: Shift[];
  onAddShift: (zoneId: string) => void;
};

export default function ProductionZones({ zones, machines, employees, shifts, onAddShift }: Props) {
  const allCards = COLUMNS.flatMap(c => c.cards);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[#1a1a1a]">Зоны производства</h2>
        <span className="text-[12px] text-[#9b9b9b]">Текущие смены · {new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</span>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {zones.map(zone => {
          const zoneCards      = allCards.filter(c => c.zoneId === zone.id);
          const zoneMachines   = machines.filter(m => m.zoneId === zone.id);
          const zoneShifts     = shifts.filter(s => s.zoneId === zone.id);
          const overdueCount   = zoneCards.filter(c => c.deadlineState === "overdue").length;
          const activeEmployee = zoneShifts.length > 0
            ? employees.find(e => e.id === zoneShifts[0].employeeId)
            : null;
          const activeMachine  = zoneShifts.length > 0
            ? machines.find(m => m.id === zoneShifts[0].machineId)
            : null;

          return (
            <div
              key={zone.id}
              className="bg-white border border-[#ebebeb] rounded-xl p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow"
            >
              {/* Заголовок */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: zone.color + "18" }}>
                  <Icon name={zone.icon as never} size={13} style={{ color: zone.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#1a1a1a] truncate">{zone.name}</p>
                  <p className="text-[10px] text-[#b5b5b5]">{zone.type === "production" ? "производство" : "склад"}</p>
                </div>
              </div>

              {/* Счётчики */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#f5f5f5] rounded-lg px-2.5 py-1.5 text-center">
                  <p className="text-[15px] font-bold text-[#1a1a1a]">{zoneCards.length}</p>
                  <p className="text-[9px] text-[#9b9b9b] uppercase tracking-wide">заказов</p>
                </div>
                <div className={`flex-1 rounded-lg px-2.5 py-1.5 text-center ${overdueCount > 0 ? "bg-red-50" : "bg-[#f5f5f5]"}`}>
                  <p className={`text-[15px] font-bold ${overdueCount > 0 ? "text-red-500" : "text-[#1a1a1a]"}`}>{overdueCount}</p>
                  <p className="text-[9px] text-[#9b9b9b] uppercase tracking-wide">просрочек</p>
                </div>
              </div>

              {/* Станки */}
              {zoneMachines.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide">Станки</p>
                  {zoneMachines.map(m => {
                    const onMachine = shifts.find(s => s.machineId === m.id);
                    const emp = onMachine ? employees.find(e => e.id === onMachine.employeeId) : null;
                    return (
                      <div key={m.id} className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${onMachine ? "bg-green-400" : "bg-[#e0e0e0]"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-[#4b4b4b] truncate">{m.name}</p>
                          {emp && <p className="text-[10px] text-[#9b9b9b] truncate">{emp.name}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Текущая смена */}
              {zone.type === "production" && (
                <div className="border-t border-[#f0f0f0] pt-2.5">
                  {activeEmployee && activeMachine ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <Icon name="User" size={10} className="text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-semibold text-[#1a1a1a] truncate">{activeEmployee.name}</p>
                        <p className="text-[10px] text-[#9b9b9b] truncate">{activeMachine.name}</p>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0 animate-pulse" />
                    </div>
                  ) : (
                    <button
                      onClick={() => onAddShift(zone.id)}
                      className="w-full flex items-center justify-center gap-1.5 text-[11px] text-[#9b9b9b] hover:text-[#1a1a1a] border border-dashed border-[#e0e0e0] hover:border-[#b5b5b5] rounded-lg py-1.5 transition-colors"
                    >
                      <Icon name="Plus" size={11} />
                      Назначить смену
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
