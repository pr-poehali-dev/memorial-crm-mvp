import { Shift, PLACES, EMPLOYEES, BLANK_TYPES, shiftTotalProduced, shiftTotalRaw, today } from "./cutting.types";

type Props = {
  doneShifts: Shift[];
};

export default function CuttingJournal({ doneShifts }: Props) {
  const allDates = [...new Set(doneShifts.map(s => s.date))].sort((a, b) => {
    const parse = (d: string) => d.split(".").reverse().join("-");
    return parse(b).localeCompare(parse(a));
  });

  const pastDates = allDates.filter(d => d !== today);
  if (pastDates.length === 0) return null;

  return (
    <div>
      <p className="text-[12px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-3">Журнал смен</p>
      <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
        {pastDates.map((date, di) => {
          const dayShifts = doneShifts.filter(s => s.date === date);
          const dayP = dayShifts.reduce((a, s) => a + shiftTotalProduced(s), 0);
          const dayR = dayShifts.reduce((a, s) => a + shiftTotalRaw(s), 0);
          return (
            <div key={date} className={di > 0 ? "border-t border-[#f0f0f0]" : ""}>
              <div className="px-4 py-2.5 bg-[#fafafa] flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#4b4b4b]">{date}</span>
                <span className="text-[11px] text-[#9b9b9b]">
                  {dayP} шт. · {dayR.toFixed(1)} м²
                </span>
              </div>
              <table className="w-full">
                <tbody>
                  {dayShifts.map((s, si) => {
                    const place    = PLACES.find(p => p.id === s.placeId)!;
                    const employee = EMPLOYEES.find(e => e.id === s.employeeId)!;
                    return s.results.map((r, ri) => {
                      const bt     = BLANK_TYPES.find(b => b.id === r.blankTypeId)!;
                      const isLast = si === dayShifts.length - 1 && ri === s.results.length - 1;
                      return (
                        <tr
                          key={`${s.id}-${ri}`}
                          className={`hover:bg-[#fafafa] transition-colors ${!isLast ? "border-b border-[#f8f8f8]" : ""}`}
                        >
                          <td className="px-4 py-2.5 text-[12px] text-[#6b6b6b] w-[200px]">{place.name}</td>
                          <td className="px-4 py-2.5 text-[12px] text-[#4b4b4b]">{employee.name}</td>
                          <td className="px-4 py-2.5 text-[12px] text-[#1a1a1a]">{bt.name}</td>
                          <td className="px-4 py-2.5 text-[11px] font-mono text-[#9b9b9b]">{bt.size}</td>
                          <td className="px-4 py-2.5 text-[13px] font-semibold text-[#1a1a1a] text-right">{r.produced} шт.</td>
                          <td className="px-4 py-2.5 text-[12px] text-[#f59e0b] font-semibold text-right pr-5">{r.rawUsed} м²</td>
                        </tr>
                      );
                    });
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
