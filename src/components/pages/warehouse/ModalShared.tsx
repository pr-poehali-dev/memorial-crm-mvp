import Icon from "@/components/ui/icon";

/* ── Сегодняшняя дата ── */
export const todayStr = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

/* ════════════════════════════════════════
   Shared: обёртка модалки
════════════════════════════════════════ */
export function Modal({
  title, icon, iconColor, onClose, children, wide = false,
}: {
  title: string; icon: string; iconColor: string;
  onClose: () => void; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl border border-[#ebebeb] shadow-2xl p-6 w-full ${wide ? "max-w-[720px]" : "max-w-[440px]"}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconColor + "18" }}>
              <Icon name={icon as never} size={15} style={{ color: iconColor }} />
            </div>
            <h2 className="text-[15px] font-semibold text-[#1a1a1a]">{title}</h2>
          </div>
          <button onClick={onClose} className="text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors">
            <Icon name="X" size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── MiniStat ── */
export function MiniStat({ icon, color, label, value, alert: isAlert, highlight }: {
  icon: string; color: string; label: string; value: string; alert?: boolean; highlight?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden bg-white border rounded-xl px-4 py-3.5 flex items-center gap-3
        transition-all duration-300 ease-out cursor-default
        hover:-translate-y-1 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18)]
        ${isAlert ? "border-red-200 bg-red-50" : highlight ? "border-[#1a1a1a]/15 bg-gradient-to-br from-white to-[#f7f7f7]" : "border-[#ebebeb] hover:border-[#dcdcdc]"}`}
    >
      {/* мягкое свечение при наведении */}
      <span
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(120px 80px at 18% 30%, ${color}14, transparent 70%)` }}
      />
      <div
        className="relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
        style={{ backgroundColor: color + "18" }}
      >
        <Icon name={icon as never} size={15} style={{ color }} />
      </div>
      <div className="relative min-w-0">
        <p className="text-[17px] font-semibold text-[#1a1a1a] leading-none mb-0.5 transition-colors duration-300 truncate">{value}</p>
        <p className="text-[11px] text-[#9b9b9b] truncate">{label}</p>
      </div>
    </div>
  );
}

/* ── TabBtn ── */
export function TabBtn({ active, onClick, icon, label, count }: {
  active: boolean; onClick: () => void; icon: string; label: string; count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
        ${active ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
    >
      <Icon name={icon as never} size={13} />
      {label}
      {count > 0 && (
        <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold">{count}</span>
      )}
    </button>
  );
}

/* ─── Поле-ярлык ─── */
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mb-1 text-[12px] text-[#6b6b6b]">{label}</label>
      {children}
    </div>
  );
}

/* ─── Серая подсказка-строка ─── */
export function InfoRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f7f7f7] border border-[#efefef] rounded-lg px-3 py-2 text-[12px] text-[#6b6b6b]">
      {children}
    </div>
  );
}