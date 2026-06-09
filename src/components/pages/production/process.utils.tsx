import Icon from "@/components/ui/icon";
import { Shift, shiftTotalProduced } from "../cutting/cutting.types";

export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().substring(0, 10);
}

export function fmtDate(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

export const WORK_ICON: Record<string, string> = {
  cutting:   "Scissors",
  engraving: "Pen",
  polishing: "Layers",
};

export function countBy<T>(arr: T[], key: (item: T) => string): Record<string, number> {
  const res: Record<string, number> = {};
  arr.forEach(item => { const k = key(item); res[k] = (res[k] ?? 0) + 1; });
  return res;
}

export function topEntry(obj: Record<string, number>): string | undefined {
  return Object.entries(obj).sort((a, b) => b[1] - a[1])[0]?.[0];
}

export function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
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

export function DoneShiftCard({ shift: s }: { shift: Shift }) {
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
        {totalP > 0 && <span className="text-[14px] font-bold text-[#2563eb] shrink-0">{totalP} шт.</span>}
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