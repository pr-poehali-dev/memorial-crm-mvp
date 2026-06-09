import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";

type Props = {
  from: string;   // ISO "YYYY-MM-DD" или ""
  to: string;
  onChange: (from: string, to: string) => void;
};

const MONTH_RU = ["Январь","Февраль","Март","Апрель","Май","Июнь",
                   "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const DOW_RU = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

function iso(d: Date): string {
  return d.toISOString().substring(0, 10);
}

function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/* Возвращает 0=Пн…6=Вс */
function dowMon(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export default function DateRangePicker({ from, to, onChange }: Props) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [hover, setHover] = useState<string | null>(null);

  const days = useMemo(() => {
    const total = daysInMonth(viewYear, viewMonth);
    const firstDow = dowMon(startOfMonth(viewYear, viewMonth));
    const cells: (string | null)[] = Array(firstDow).fill(null);
    for (let d = 1; d <= total; d++) {
      const date = new Date(viewYear, viewMonth, d);
      cells.push(iso(date));
    }
    /* добиваем до кратного 7 */
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const handleDay = (day: string) => {
    if (!from || (from && to)) {
      /* начало нового выбора */
      onChange(day, "");
    } else {
      /* второй клик — завершаем диапазон */
      if (day < from) onChange(day, from);
      else            onChange(from, day);
    }
  };

  const inRange = (day: string) => {
    const lo = from;
    const hi = hover && !to ? (hover > from ? hover : from) : to;
    if (!lo || !hi) return false;
    return day > lo && day < hi;
  };

  const isFrom  = (day: string) => day === from;
  const isTo    = (day: string) => day === to;
  const isHover = (day: string) => !to && hover === day;

  return (
    <div className="bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden shadow-sm w-full">
      {/* Шапка месяца */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0]">
        <button
          onClick={prevMonth}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9b9b9b] hover:bg-[#f5f5f5] hover:text-[#1a1a1a] transition-colors"
        >
          <Icon name="ChevronLeft" size={14} />
        </button>
        <p className="text-[13px] font-semibold text-[#1a1a1a]">
          {MONTH_RU[viewMonth]} {viewYear}
        </p>
        <button
          onClick={nextMonth}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9b9b9b] hover:bg-[#f5f5f5] hover:text-[#1a1a1a] transition-colors"
        >
          <Icon name="ChevronRight" size={14} />
        </button>
      </div>

      {/* Дни недели */}
      <div className="grid grid-cols-7 px-2 pt-2">
        {DOW_RU.map(d => (
          <div key={d} className={`text-center text-[10px] font-bold uppercase tracking-wide py-1
            ${d === "Сб" || d === "Вс" ? "text-[#ef4444]" : "text-[#c0c0c0]"}`}>
            {d}
          </div>
        ))}
      </div>

      {/* Сетка дней */}
      <div className="grid grid-cols-7 px-2 pb-3 gap-y-0.5">
        {days.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;

          const active   = isFrom(day) || isTo(day);
          const rangeDay = inRange(day);
          const hov      = isHover(day);
          const isToday  = day === iso(today);
          const isSat    = new Date(day).getDay() === 6;
          const isSun    = new Date(day).getDay() === 0;

          /* края диапазона */
          const isStart = isFrom(day);
          const isEnd   = isTo(day) || (!to && hov);

          return (
            <button
              key={day}
              onClick={() => handleDay(day)}
              onMouseEnter={() => setHover(day)}
              onMouseLeave={() => setHover(null)}
              className={`relative h-8 text-[12px] font-medium transition-colors select-none
                ${active
                  ? "text-white z-10"
                  : rangeDay
                  ? "text-[#1a1a1a]"
                  : isToday
                  ? "font-bold text-[#2563eb]"
                  : isSat || isSun
                  ? "text-[#ef4444]"
                  : "text-[#1a1a1a] hover:bg-[#f5f5f5] rounded-lg"
                }`}
            >
              {/* Фон диапазона */}
              {(rangeDay || (from && !to && hover && day < (hover > from ? hover : from) && day > from)) && (
                <span className="absolute inset-y-0.5 inset-x-0 bg-[#2563eb]/10 z-0" />
              )}
              {/* Края */}
              {isStart && (
                <span className="absolute inset-y-0.5 inset-x-0 bg-[#2563eb] rounded-l-lg z-0" />
              )}
              {isEnd && (
                <span className="absolute inset-y-0.5 inset-x-0 bg-[#2563eb] rounded-r-lg z-0" />
              )}
              {active && !isStart && !isEnd && (
                <span className="absolute inset-y-0.5 inset-x-0 bg-[#2563eb] z-0" />
              )}
              <span className="relative z-10">{new Date(day).getDate()}</span>
            </button>
          );
        })}
      </div>

      {/* Нижняя панель: выбранный диапазон + кнопки */}
      <div className="border-t border-[#f0f0f0] px-4 py-2.5 flex items-center gap-3">
        <div className="flex-1 text-[11px] text-[#9b9b9b]">
          {from && to ? (
            <span className="text-[#1a1a1a] font-medium">
              {new Date(from).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
              {" — "}
              {new Date(to).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
            </span>
          ) : from ? (
            <span className="text-[#2563eb]">Выберите конец периода…</span>
          ) : (
            <span>Нажмите на начальную дату</span>
          )}
        </div>
        {(from || to) && (
          <button
            onClick={() => onChange("", "")}
            className="text-[11px] text-[#9b9b9b] hover:text-[#ef4444] transition-colors"
          >
            Сбросить
          </button>
        )}
      </div>
    </div>
  );
}