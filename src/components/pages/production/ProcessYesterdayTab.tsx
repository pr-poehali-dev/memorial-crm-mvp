import Icon from "@/components/ui/icon";
import { Shift, WORK_LABELS, shiftTotalProduced, shiftTotalRaw, yesterday } from "../cutting/cutting.types";
import { WORK_ICON, fmtDate } from "./process.utils";

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
                <span className="text-[14px] font-bold text-[#2563eb]">{totalP} шт.</span>
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

export default function YesterdayTab({ shifts }: { shifts: Shift[] }) {
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
              <p className="text-[20px] font-bold text-[#2563eb]">{totalProduced}</p>
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