import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Shift, WORK_LABELS, shiftTotalProduced, shiftTotalRaw, today, yesterday } from "../cutting/cutting.types";

/* ══════════════════════════════════════════════════════════
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
══════════════════════════════════════════════════════════ */

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().substring(0, 10);
}

function fmtDate(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

const WORK_ICON: Record<string, string> = {
  cutting:   "Scissors",
  engraving: "Pen",
  polishing: "Layers",
};

/* ══════════════════════════════════════════════════════════
   1. ВКЛАДКА «СЕГОДНЯ»
══════════════════════════════════════════════════════════ */

function TodayTab({ shifts }: { shifts: Shift[] }) {
  const active  = shifts.filter(s => s.date === today && s.status === "active");
  const done    = shifts.filter(s => s.date === today && s.status === "done");

  const totalActive   = active.length;
  const totalDone     = done.length;
  const totalProduced = done.reduce((a, s) => a + shiftTotalProduced(s), 0);
  const totalRaw      = +done.reduce((a, s) => a + shiftTotalRaw(s), 0).toFixed(2);

  return (
    <div className="flex-1 overflow-y-auto px-7 py-5 space-y-6">

      {/* Краткая сводка дня */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Работают сейчас", value: String(totalActive), icon: "Play",        color: "#16a34a", bg: "#f0fdf4" },
          { label: "Завершено за день", value: String(totalDone),   icon: "CheckCheck", color: "#6b6b6b", bg: "#f5f5f5" },
          { label: "Произведено",       value: `${totalProduced} шт.`, icon: "Boxes",   color: "#6366f1", bg: "#f5f3ff" },
          { label: "Сырьё потрачено",   value: `${totalRaw} м²`,  icon: "Layers",     color: "#f59e0b", bg: "#fffbeb" },
        ].map(s => (
          <div key={s.label} className="bg-white border border-[#ebebeb] rounded-xl px-4 py-3.5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.bg }}>
              <Icon name={s.icon as never} size={16} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[20px] font-bold text-[#1a1a1a] leading-none">{s.value}</p>
              <p className="text-[11px] text-[#9b9b9b] mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Активные смены */}
      {active.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <h3 className="text-[13px] font-bold text-[#1a1a1a] uppercase tracking-wider">В работе прямо сейчас</h3>
            <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">{active.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {active.map(s => <ActiveCard key={s.id} shift={s} />)}
          </div>
        </div>
      )}

      {active.length === 0 && done.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#f4f4f4] flex items-center justify-center mb-4">
            <Icon name="Moon" size={22} className="text-[#c0c0c0]" />
          </div>
          <p className="text-[15px] font-medium text-[#9b9b9b]">Сегодня работ не было</p>
          <p className="text-[13px] text-[#c5c5c5] mt-1">Назначьте смены в разделе «Заготовки»</p>
        </div>
      )}

      {/* Завершённые за сегодня */}
      {done.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Icon name="CheckCircle" size={14} className="text-[#9b9b9b]" />
            <h3 className="text-[13px] font-bold text-[#6b6b6b] uppercase tracking-wider">Завершено сегодня</h3>
            <span className="text-[11px] bg-[#f0f0f0] text-[#9b9b9b] px-2 py-0.5 rounded-full font-bold">{done.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {done.map(s => <DoneShiftCard key={s.id} shift={s} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function ActiveCard({ shift: s }: { shift: Shift }) {
  const produced = s.results.reduce((a, r) => a + r.produced, 0);
  const orders   = [...new Set(s.results.map(r => r.orderId).filter(Boolean))];

  return (
    <div className="bg-white border border-green-200 rounded-xl overflow-hidden shadow-sm">
      <div className="bg-green-50 px-5 py-3.5 flex items-center justify-between border-b border-green-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
            <Icon name={WORK_ICON[s.workType] as never ?? "Hammer"} size={16} className="text-green-700" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-[#1a1a1a]">{s.placeName ?? s.placeId}</p>
            <p className="text-[12px] text-green-700">{s.employeeName} · {WORK_LABELS[s.workType]}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon name="Clock" size={12} className="text-green-600" />
          <span className="text-[13px] font-bold text-green-700">с {s.startedAt}</span>
        </div>
      </div>
      <div className="px-5 py-4 space-y-3">
        {s.taskId && (
          <div className="flex items-center gap-2">
            <Icon name="ClipboardList" size={13} className="text-[#9b9b9b] shrink-0" />
            <span className="text-[12px] text-[#4b4b4b]">
              Задача · план <b>{s.taskQtyAssigned} шт.</b>
            </span>
          </div>
        )}
        {s.results.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-2">Текущие результаты</p>
            <div className="space-y-1">
              {s.results.map((r, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[12px] text-[#4b4b4b]">{r.blankName ?? "—"}</span>
                  <span className="text-[13px] font-bold text-[#1a1a1a]">{r.produced} шт.</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-4 pt-1">
          {produced > 0 && (
            <div className="flex items-center gap-1.5">
              <Icon name="Boxes" size={12} className="text-[#6366f1]" />
              <span className="text-[12px] font-semibold text-[#6366f1]">{produced} шт.</span>
            </div>
          )}
          {orders.map(o => (
            <span key={o} className="text-[11px] font-mono bg-[#f0f0f0] text-[#4b4b4b] px-2 py-0.5 rounded">{o}</span>
          ))}
          <span className="ml-auto text-[11px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
            В работе
          </span>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   2. ВКЛАДКА «ВЧЕРА»
══════════════════════════════════════════════════════════ */

function YesterdayTab({ shifts }: { shifts: Shift[] }) {
  const yShifts = shifts.filter(s => s.date === yesterday && s.status === "done");

  const totalProduced = yShifts.reduce((a, s) => a + shiftTotalProduced(s), 0);
  const totalRaw      = +yShifts.reduce((a, s) => a + shiftTotalRaw(s), 0).toFixed(2);

  return (
    <div className="flex-1 overflow-y-auto px-7 py-5 space-y-5">
      {/* Заголовок дня */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#1a1a1a]">{fmtDate(yesterday)}</h2>
          <p className="text-[13px] text-[#9b9b9b]">{yShifts.length} смен · {totalProduced} шт. · {totalRaw} м² сырья</p>
        </div>
        {yShifts.length > 0 && (
          <div className="flex gap-3">
            <div className="bg-white border border-[#ebebeb] rounded-lg px-4 py-2.5 text-center">
              <p className="text-[20px] font-bold text-[#1a1a1a]">{yShifts.length}</p>
              <p className="text-[10px] text-[#9b9b9b]">смен</p>
            </div>
            <div className="bg-white border border-[#ebebeb] rounded-lg px-4 py-2.5 text-center">
              <p className="text-[20px] font-bold text-[#6366f1]">{totalProduced}</p>
              <p className="text-[10px] text-[#9b9b9b]">шт.</p>
            </div>
            <div className="bg-white border border-[#ebebeb] rounded-lg px-4 py-2.5 text-center">
              <p className="text-[20px] font-bold text-[#f59e0b]">{totalRaw}</p>
              <p className="text-[10px] text-[#9b9b9b]">м² сырья</p>
            </div>
          </div>
        )}
      </div>

      {yShifts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#f4f4f4] flex items-center justify-center mb-4">
            <Icon name="CalendarX" size={22} className="text-[#c0c0c0]" />
          </div>
          <p className="text-[15px] font-medium text-[#9b9b9b]">Вчера завершённых смен не было</p>
        </div>
      ) : (
        <div className="space-y-4">
          {yShifts.map(s => <YesterdayCard key={s.id} shift={s} />)}
        </div>
      )}
    </div>
  );
}

function YesterdayCard({ shift: s }: { shift: Shift }) {
  const totalP = shiftTotalProduced(s);
  const totalR = shiftTotalRaw(s);
  const orders = [...new Set(s.results.map(r => r.orderId).filter(Boolean))];

  /* Группируем сырьё по материалу */
  const byStone: Record<string, number> = {};
  s.results.forEach(r => {
    const mat = r.material ?? "—";
    byStone[mat] = (byStone[mat] ?? 0) + r.rawUsed;
  });

  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
      {/* Шапка */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-[#f5f5f5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#f5f5f5] flex items-center justify-center">
            <Icon name={WORK_ICON[s.workType] as never ?? "Hammer"} size={17} className="text-[#6b6b6b]" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-[#1a1a1a]">{s.placeName ?? s.placeId}</p>
            <p className="text-[13px] text-[#6b6b6b]">
              {s.employeeName} · {WORK_LABELS[s.workType]}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[13px] font-bold text-[#1a1a1a]">
            {s.startedAt}{s.finishedAt ? `–${s.finishedAt}` : ""}
          </p>
          <p className="text-[11px] text-[#9b9b9b] mt-0.5">{s.finishedAt ? "завершена" : "не завершена"}</p>
        </div>
      </div>

      {/* Тело — всегда раскрыто */}
      <div className="px-5 py-4 grid grid-cols-3 gap-5">
        {/* Изделия */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-2.5">Что сделано</p>
          {s.results.length > 0 ? (
            <div className="space-y-2">
              {s.results.map((r, i) => (
                <div key={i} className="flex items-baseline justify-between gap-2">
                  <span className="text-[13px] text-[#1a1a1a] truncate flex-1">{r.blankName ?? "—"}</span>
                  <span className="text-[15px] font-bold text-[#1a1a1a] shrink-0">{r.produced} <span className="text-[11px] font-normal text-[#9b9b9b]">шт.</span></span>
                </div>
              ))}
              <div className="pt-1 border-t border-[#f0f0f0] flex justify-between">
                <span className="text-[12px] text-[#9b9b9b]">Итого</span>
                <span className="text-[14px] font-bold text-[#6366f1]">{totalP} шт.</span>
              </div>
            </div>
          ) : (
            <p className="text-[12px] text-[#c5c5c5]">Не указано</p>
          )}
        </div>

        {/* Сырьё */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-2.5">Сырьё</p>
          {Object.keys(byStone).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(byStone).map(([mat, m2]) => (
                <div key={mat} className="flex items-baseline justify-between gap-2">
                  <span className="text-[13px] text-[#1a1a1a] truncate flex-1">{mat}</span>
                  <span className="text-[15px] font-bold text-[#1a1a1a] shrink-0">{m2.toFixed(2)} <span className="text-[11px] font-normal text-[#9b9b9b]">м²</span></span>
                </div>
              ))}
              <div className="pt-1 border-t border-[#f0f0f0] flex justify-between">
                <span className="text-[12px] text-[#9b9b9b]">Итого</span>
                <span className="text-[14px] font-bold text-[#f59e0b]">{totalR} м²</span>
              </div>
            </div>
          ) : (
            <p className="text-[12px] text-[#c5c5c5]">—</p>
          )}
        </div>

        {/* Заказы */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#c0c0c0] mb-2.5">Заказы</p>
          {orders.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {orders.map(o => (
                <span key={o} className="text-[12px] font-mono font-semibold bg-[#f0f0f0] text-[#4b4b4b] px-2.5 py-1 rounded-md">
                  {o}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-[#c5c5c5]">Не указаны</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   3. ВКЛАДКА «ЖУРНАЛ»
══════════════════════════════════════════════════════════ */

type JournalFilter = {
  period: "today" | "yesterday" | "7d" | "30d" | "custom";
  from: string;
  to: string;
  employee: string;
  place: string;
  workType: string;
  search: string;
};

function JournalTab({ shifts }: { shifts: Shift[] }) {
  const [f, setF] = useState<JournalFilter>({
    period: "7d", from: "", to: "", employee: "", place: "", workType: "", search: "",
  });

  const employees = useMemo(() => [...new Set(shifts.map(s => s.employeeName).filter(Boolean))], [shifts]);
  const places    = useMemo(() => [...new Set(shifts.map(s => s.placeName).filter(Boolean))], [shifts]);

  const inRange = (iso: string): boolean => {
    if (f.period === "today")     return iso === today;
    if (f.period === "yesterday") return iso === yesterday;
    if (f.period === "7d")        return iso >= daysAgo(7);
    if (f.period === "30d")       return iso >= daysAgo(30);
    if (f.period === "custom") {
      if (f.from && iso < f.from) return false;
      if (f.to   && iso > f.to)   return false;
    }
    return true;
  };

  const filtered = useMemo(() => shifts.filter(s => {
    if (!inRange(s.date)) return false;
    if (f.employee && s.employeeName !== f.employee) return false;
    if (f.place    && s.placeName    !== f.place)    return false;
    if (f.workType && s.workType     !== f.workType) return false;
    if (f.search) {
      const q = f.search.toLowerCase();
      const orders = s.results.map(r => r.orderId ?? "").join(" ");
      return (
        (s.employeeName ?? "").toLowerCase().includes(q) ||
        (s.placeName    ?? "").toLowerCase().includes(q) ||
        orders.toLowerCase().includes(q) ||
        s.results.some(r => (r.blankName ?? "").toLowerCase().includes(q))
      );
    }
    return true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [shifts, f]);

  const sel = (k: keyof JournalFilter) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    setF(prev => ({ ...prev, [k]: e.target.value }));

  const inputCls = "bg-white border border-[#e8e8e8] rounded-[8px] px-3 py-1.5 text-[12px] text-[#4b4b4b] outline-none focus:border-[#c0c0c0] transition-colors";
  const PERIODS = [
    { key: "today",     label: "Сегодня" },
    { key: "yesterday", label: "Вчера" },
    { key: "7d",        label: "7 дней" },
    { key: "30d",       label: "30 дней" },
    { key: "custom",    label: "Диапазон" },
  ];

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Фильтры */}
      <div className="shrink-0 px-7 py-3 border-b border-[#f0f0f0] flex flex-wrap items-center gap-2 bg-white">
        {/* Период — переключатель */}
        <div className="flex gap-0.5 bg-[#f0f0f0] rounded-[8px] p-0.5">
          {PERIODS.map(p => (
            <button key={p.key}
              onClick={() => setF(prev => ({ ...prev, period: p.key as JournalFilter["period"] }))}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all ${
                f.period === p.key ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"
              }`}
            >{p.label}</button>
          ))}
        </div>

        {f.period === "custom" && (
          <>
            <input type="date" value={f.from} onChange={sel("from")} className={inputCls} />
            <span className="text-[12px] text-[#9b9b9b]">—</span>
            <input type="date" value={f.to}   onChange={sel("to")}   className={inputCls} />
          </>
        )}

        <div className="w-px h-5 bg-[#e8e8e8]" />

        <select value={f.employee} onChange={sel("employee")} className={inputCls}>
          <option value="">Все сотрудники</option>
          {employees.map(e => <option key={e} value={e}>{e}</option>)}
        </select>

        <select value={f.place} onChange={sel("place")} className={inputCls}>
          <option value="">Все станки</option>
          {places.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select value={f.workType} onChange={sel("workType")} className={inputCls}>
          <option value="">Все типы работ</option>
          {Object.entries(WORK_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        <div className="relative">
          <Icon name="Search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#b5b5b5]" />
          <input
            value={f.search} onChange={sel("search")}
            placeholder="Заказ, изделие, сотрудник..."
            className={`${inputCls} pl-8 min-w-[200px]`}
          />
        </div>

        {(f.employee || f.place || f.workType || f.search) && (
          <button
            onClick={() => setF(prev => ({ ...prev, employee: "", place: "", workType: "", search: "" }))}
            className="flex items-center gap-1 text-[12px] text-[#9b9b9b] hover:text-[#4b4b4b]"
          >
            <Icon name="X" size={12} />Сброс
          </button>
        )}

        <span className="ml-auto text-[12px] text-[#9b9b9b]">
          {filtered.length} {filtered.length === 1 ? "запись" : "записей"}
        </span>
      </div>

      {/* Таблица */}
      <div className="flex-1 overflow-y-auto px-7 py-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Icon name="SearchX" size={28} className="text-[#c0c0c0] mb-3" />
            <p className="text-[14px] text-[#9b9b9b]">Нет записей по выбранным фильтрам</p>
          </div>
        ) : (
          <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f0f0f0] bg-[#fafafa]">
                  {["Дата", "Станок / Место", "Сотрудник", "Тип работы", "Изделия", "Заказы", "Произведено", "Сырьё", "Время", "Статус"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const totalP = shiftTotalProduced(s);
                  const totalR = shiftTotalRaw(s);
                  const orders = [...new Set(s.results.map(r => r.orderId).filter(Boolean))];
                  const blanks = [...new Set(s.results.map(r => r.blankName).filter(Boolean))];
                  return (
                    <tr key={s.id} className={`border-b border-[#f8f8f8] hover:bg-[#fafafa] transition-colors ${
                      s.status === "active" ? "bg-green-50/30" : ""
                    }`}>
                      <td className="px-4 py-2.5 text-[12px] text-[#6b6b6b] whitespace-nowrap">
                        {new Date(s.date + "T12:00:00").toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-[#1a1a1a] font-medium max-w-[140px]">
                        <span className="truncate block">{s.placeName ?? s.placeId}</span>
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-[#1a1a1a]">{s.employeeName ?? "—"}</td>
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-1.5 text-[12px] text-[#4b4b4b]">
                          <Icon name={WORK_ICON[s.workType] as never ?? "Hammer"} size={12} className="text-[#9b9b9b]" />
                          {WORK_LABELS[s.workType]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-[#4b4b4b] max-w-[140px]">
                        <span className="truncate block">{blanks.join(", ") || "—"}</span>
                      </td>
                      <td className="px-4 py-2.5 text-[12px] font-mono text-[#6b6b6b]">
                        {orders.length > 0 ? orders.join(", ") : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-[13px] font-bold text-[#1a1a1a] whitespace-nowrap">
                        {totalP > 0 ? `${totalP} шт.` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-[13px] font-bold text-[#f59e0b] whitespace-nowrap">
                        {totalR > 0 ? `${totalR} м²` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-[#6b6b6b] whitespace-nowrap">
                        {s.startedAt}{s.finishedAt ? `–${s.finishedAt}` : ""}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${
                          s.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-[#f0f0f0] text-[#6b6b6b]"
                        }`}>
                          {s.status === "active" ? "В работе" : "Завершена"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   4. ВКЛАДКА «АНАЛИТИКА»
══════════════════════════════════════════════════════════ */

function AnalyticsTab({ shifts }: { shifts: Shift[] }) {
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("30d");
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterPlace,    setFilterPlace]    = useState("");
  const [filterWorkType, setFilterWorkType] = useState("");

  const employees = useMemo(() => [...new Set(shifts.map(s => s.employeeName).filter(Boolean))], [shifts]);
  const places    = useMemo(() => [...new Set(shifts.map(s => s.placeName).filter(Boolean))], [shifts]);

  const filtered = useMemo(() => shifts.filter(s => {
    if (period === "7d"  && s.date < daysAgo(7))  return false;
    if (period === "30d" && s.date < daysAgo(30)) return false;
    if (filterEmployee && s.employeeName !== filterEmployee) return false;
    if (filterPlace    && s.placeName    !== filterPlace)    return false;
    if (filterWorkType && s.workType     !== filterWorkType) return false;
    return true;
  }), [shifts, period, filterEmployee, filterPlace, filterWorkType]);

  const done   = filtered.filter(s => s.status === "done");
  const active = filtered.filter(s => s.status === "active");

  /* Длительности */
  const durations = done
    .filter(s => s.finishedAt)
    .map(s => {
      const [sh, sm] = s.startedAt.split(":").map(Number);
      const [fh, fm] = (s.finishedAt!).split(":").map(Number);
      return (fh * 60 + fm) - (sh * 60 + sm);
    })
    .filter(d => d > 0);
  const avgMinutes = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

  /* Топы */
  const byPlace    = countBy(filtered, s => s.placeName ?? "");
  const byEmployee = countBy(filtered, s => s.employeeName ?? "");
  const byWorkType = countBy(filtered, s => s.workType);

  const topPlace    = topEntry(byPlace);
  const topEmployee = topEntry(byEmployee);
  const topWorkType = topEntry(byWorkType);

  const totalProduced = done.reduce((a, s) => a + shiftTotalProduced(s), 0);
  const totalRaw      = +done.reduce((a, s) => a + shiftTotalRaw(s), 0).toFixed(2);

  /* Для распила */
  const cutting       = done.filter(s => s.workType === "cutting");
  const cuttingBlankQ = cutting.reduce((a, s) => a + shiftTotalProduced(s), 0);
  const cuttingRaw    = +cutting.reduce((a, s) => a + shiftTotalRaw(s), 0).toFixed(2);
  const avgPerBlank   = cuttingBlankQ > 0 ? +(cuttingRaw / cuttingBlankQ).toFixed(3) : 0;

  /* Для производства — по типам */
  const byWt = countBy(done, s => s.workType);

  const inputCls = "bg-white border border-[#e8e8e8] rounded-[8px] px-3 py-1.5 text-[12px] text-[#4b4b4b] outline-none";

  return (
    <div className="flex-1 overflow-y-auto px-7 py-5 space-y-6">

      {/* Фильтры периода */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-0.5 bg-[#f0f0f0] rounded-[8px] p-0.5">
          {([["7d", "7 дней"], ["30d", "30 дней"], ["all", "Всё время"]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setPeriod(k)}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all ${
                period === k ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"
              }`}
            >{l}</button>
          ))}
        </div>
        <select value={filterEmployee} onChange={e => setFilterEmployee(e.target.value)} className={inputCls}>
          <option value="">Все сотрудники</option>
          {employees.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={filterPlace} onChange={e => setFilterPlace(e.target.value)} className={inputCls}>
          <option value="">Все станки</option>
          {places.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filterWorkType} onChange={e => setFilterWorkType(e.target.value)} className={inputCls}>
          <option value="">Все типы работ</option>
          {Object.entries(WORK_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {(filterEmployee || filterPlace || filterWorkType) && (
          <button onClick={() => { setFilterEmployee(""); setFilterPlace(""); setFilterWorkType(""); }}
            className="flex items-center gap-1 text-[12px] text-[#9b9b9b] hover:text-[#4b4b4b]">
            <Icon name="X" size={12} />Сброс
          </button>
        )}
      </div>

      {/* Основные показатели */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-3">Общие показатели</h3>
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Всего смен",         value: String(filtered.length), icon: "CalendarDays", color: "#6b6b6b" },
            { label: "Активных",           value: String(active.length),   icon: "Play",         color: "#16a34a" },
            { label: "Завершено",          value: String(done.length),     icon: "CheckCheck",   color: "#9b9b9b" },
            { label: "Произведено",        value: `${totalProduced} шт.`,  icon: "Boxes",        color: "#6366f1" },
            { label: "Сырьё потрачено",    value: `${totalRaw} м²`,        icon: "Layers",       color: "#f59e0b" },
          ].map(s => (
            <StatCard key={s.label} {...s} />
          ))}
          {[
            { label: "Среднее время смены", value: avgMinutes > 0 ? `${Math.floor(avgMinutes/60)}ч ${avgMinutes%60}м` : "—", icon: "Clock",  color: "#0ea5e9" },
            { label: "Топ станок",          value: topPlace || "—",         icon: "Hammer",   color: "#8b5cf6" },
            { label: "Топ сотрудник",       value: topEmployee || "—",      icon: "User",     color: "#ec4899" },
            { label: "Топ тип работы",      value: WORK_LABELS[topWorkType ?? ""] ?? "—", icon: "Tag", color: "#14b8a6" },
          ].map(s => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </div>

      {/* Распил */}
      {(cutting.length > 0 || !filterWorkType) && (
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-3">Распил / Заготовки</h3>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Смен по распилу"      value={String(cutting.length)}  icon="Scissors"    color="#6366f1" />
            <StatCard label="Заготовок нарезано"   value={`${cuttingBlankQ} шт.`} icon="Boxes"       color="#8b5cf6" />
            <StatCard label="Сырья потрачено"      value={`${cuttingRaw} м²`}     icon="Layers"      color="#f59e0b" />
            <StatCard label="Ср. расход на загот." value={`${avgPerBlank} м²`}    icon="Calculator"  color="#0ea5e9" />
          </div>
        </div>
      )}

      {/* По типам работ */}
      {Object.keys(byWt).length > 1 && (
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-3">По типам работ</h3>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(byWt).map(([wt, cnt]) => (
              <div key={wt} className="bg-white border border-[#ebebeb] rounded-xl px-4 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#f5f5f5] flex items-center justify-center">
                  <Icon name={WORK_ICON[wt] as never ?? "Hammer"} size={16} className="text-[#6b6b6b]" />
                </div>
                <div>
                  <p className="text-[20px] font-bold text-[#1a1a1a]">{cnt}</p>
                  <p className="text-[11px] text-[#9b9b9b]">{WORK_LABELS[wt]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* По сотрудникам */}
      {Object.keys(byEmployee).length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#b5b5b5] mb-3">По сотрудникам</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(byEmployee).sort((a, b) => b[1] - a[1]).map(([name, cnt]) => {
              const empShifts = done.filter(s => s.employeeName === name);
              const empP = empShifts.reduce((a, s) => a + shiftTotalProduced(s), 0);
              const empR = +empShifts.reduce((a, s) => a + shiftTotalRaw(s), 0).toFixed(2);
              return (
                <div key={name} className="bg-white border border-[#ebebeb] rounded-xl px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#f0f0f0] flex items-center justify-center">
                      <Icon name="User" size={16} className="text-[#9b9b9b]" />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-[#1a1a1a]">{name}</p>
                      <p className="text-[11px] text-[#9b9b9b]">{cnt} смен завершено</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {empP > 0 && <p className="text-[14px] font-bold text-[#6366f1]">{empP} шт.</p>}
                    {empR > 0 && <p className="text-[12px] text-[#f59e0b]">{empR} м²</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl px-4 py-3.5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + "18" }}>
        <Icon name={icon as never} size={16} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-[#1a1a1a] leading-none truncate">{value}</p>
        <p className="text-[11px] text-[#9b9b9b] mt-0.5 leading-tight">{label}</p>
      </div>
    </div>
  );
}

function DoneShiftCard({ shift: s }: { shift: Shift }) {
  const totalP = shiftTotalProduced(s);
  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl px-5 py-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[#f5f5f5] flex items-center justify-center shrink-0">
          <Icon name="CheckCheck" size={14} className="text-[#9b9b9b]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#1a1a1a] truncate">{s.placeName ?? s.placeId}</p>
          <p className="text-[11px] text-[#9b9b9b]">{s.employeeName} · {s.startedAt}{s.finishedAt ? `–${s.finishedAt}` : ""}</p>
        </div>
        {totalP > 0 && <span className="text-[14px] font-bold text-[#6366f1] shrink-0">{totalP} шт.</span>}
      </div>
      {s.results.length > 0 && (
        <div className="space-y-1">
          {s.results.map((r, i) => (
            <div key={i} className="flex items-center justify-between text-[12px]">
              <span className="text-[#6b6b6b]">{r.blankName ?? "—"}</span>
              <span className="font-semibold text-[#1a1a1a]">{r.produced} шт.</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function countBy<T>(arr: T[], key: (item: T) => string): Record<string, number> {
  const res: Record<string, number> = {};
  arr.forEach(item => { const k = key(item); res[k] = (res[k] ?? 0) + 1; });
  return res;
}
function topEntry(obj: Record<string, number>): string | undefined {
  return Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0];
}

/* ══════════════════════════════════════════════════════════
   ГЛАВНЫЙ КОМПОНЕНТ ProcessTab
══════════════════════════════════════════════════════════ */

type ProcessSubTab = "today" | "yesterday" | "journal" | "analytics";

export default function ProcessTab({ shifts }: { shifts: Shift[] }) {
  const [sub, setSub] = useState<ProcessSubTab>("today");

  const todayActive = shifts.filter(s => s.date === today && s.status === "active").length;
  const todayDone   = shifts.filter(s => s.date === today && s.status === "done").length;
  const yDone       = shifts.filter(s => s.date === yesterday && s.status === "done").length;

  const TABS: { key: ProcessSubTab; label: string; badge?: number }[] = [
    { key: "today",     label: "Сегодня",   badge: todayActive > 0 ? todayActive : undefined },
    { key: "yesterday", label: "Вчера",     badge: yDone > 0 ? yDone : undefined },
    { key: "journal",   label: "Журнал",    badge: undefined },
    { key: "analytics", label: "Аналитика", badge: undefined },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Подвкладки */}
      <div className="shrink-0 flex items-center gap-0 border-b border-[#f0f0f0] bg-white px-7">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setSub(t.key)}
            className={`relative flex items-center gap-2 px-5 py-3 text-[13px] font-medium border-b-2 transition-all ${
              sub === t.key
                ? "border-[#1a1a1a] text-[#1a1a1a]"
                : "border-transparent text-[#9b9b9b] hover:text-[#4b4b4b]"
            }`}
          >
            {t.label}
            {t.badge !== undefined && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                sub === t.key ? "bg-[#1a1a1a] text-white" : "bg-green-100 text-green-700"
              }`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
        <div className="ml-auto text-[11px] text-[#c0c0c0] py-3">
          {todayActive > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              {todayActive} в работе · {todayDone} завершено сегодня
            </span>
          )}
        </div>
      </div>

      {/* Контент */}
      {sub === "today"     && <TodayTab     shifts={shifts} />}
      {sub === "yesterday" && <YesterdayTab shifts={shifts} />}
      {sub === "journal"   && <JournalTab   shifts={shifts} />}
      {sub === "analytics" && <AnalyticsTab shifts={shifts} />}
    </div>
  );
}
