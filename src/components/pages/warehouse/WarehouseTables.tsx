import Icon from "@/components/ui/icon";
import { RawMaterial, Blank, Movement, getLevelRaw, getLevelBlank, LEVEL_STYLE, MOVE_TYPE } from "./warehouse.types";

/* ─── Таблица сырья ─── */
export function RawTable({ filteredRaw }: { filteredRaw: RawMaterial[] }) {
  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#f0f0f0]">
            {["Материал", "Ед.", "Остаток", "Мин. остаток", "Цена / ед.", "Стоимость", "Статус"].map(h => (
              <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredRaw.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-10 text-center text-[13px] text-[#b5b5b5]">Ничего не найдено</td></tr>
          )}
          {filteredRaw.map((r, i) => {
            const lv = getLevelRaw(r);
            const st = LEVEL_STYLE[lv];
            const isLast = i === filteredRaw.length - 1;
            return (
              <tr key={r.id} className={`${!isLast ? "border-b border-[#f5f5f5]" : ""} ${st.row} transition-colors`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                    <span className="text-[13px] font-medium text-[#1a1a1a]">{r.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[12px] text-[#6b6b6b]">{r.unit}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] font-semibold text-[#1a1a1a]">{r.qty}</span>
                    <span className="text-[11px] text-[#9b9b9b]">{r.unit}</span>
                  </div>
                  <div className="w-full h-1 bg-[#f0f0f0] rounded-full mt-1.5 max-w-[80px]">
                    <div className="h-1 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (r.qty / (r.min * 2)) * 100)}%`, backgroundColor: st.bar }} />
                  </div>
                </td>
                <td className="px-4 py-3 text-[12px] text-[#9b9b9b] font-mono">{r.min} {r.unit}</td>
                <td className="px-4 py-3 text-[12px] text-[#4b4b4b] font-mono">{r.price.toLocaleString("ru")} ₽</td>
                <td className="px-4 py-3 text-[12px] font-semibold text-[#1a1a1a] font-mono">
                  {(r.qty * r.price).toLocaleString("ru")} ₽
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${st.badge}`}>
                    {lv === "ok" ? "В норме" : lv === "low" ? "Мало" : "Критично"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Таблица заготовок ─── */
export function BlanksTable({ filteredBlanks, rawMat }: { filteredBlanks: Blank[]; rawMat: RawMaterial[] }) {
  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#f0f0f0]">
            {["Заготовка", "Размер", "Материал", "Остаток", "Мин.", "Статус"].map(h => (
              <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredBlanks.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px] text-[#b5b5b5]">Ничего не найдено</td></tr>
          )}
          {filteredBlanks.map((b, i) => {
            const lv   = getLevelBlank(b);
            const st   = LEVEL_STYLE[lv];
            const mat  = rawMat.find(r => r.id === b.materialId);
            const isLast = i === filteredBlanks.length - 1;
            return (
              <tr key={b.id} className={`${!isLast ? "border-b border-[#f5f5f5]" : ""} ${st.row} transition-colors`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                    <span className="text-[13px] font-medium text-[#1a1a1a]">{b.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-[#6b6b6b]">{b.size}</td>
                <td className="px-4 py-3">
                  <span className="text-[12px] text-[#4b4b4b] bg-[#f5f5f5] px-2 py-0.5 rounded-md">{mat?.name ?? "—"}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] font-semibold text-[#1a1a1a]">{b.qty}</span>
                    <span className="text-[11px] text-[#9b9b9b]">шт.</span>
                  </div>
                  <div className="w-full h-1 bg-[#f0f0f0] rounded-full mt-1.5 max-w-[60px]">
                    <div className="h-1 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (b.qty / (b.min * 2)) * 100)}%`, backgroundColor: st.bar }} />
                  </div>
                </td>
                <td className="px-4 py-3 text-[12px] text-[#9b9b9b] font-mono">{b.min} шт.</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${st.badge}`}>
                    {lv === "ok" ? "В норме" : lv === "low" ? "Мало" : "Критично"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── История движений ─── */
export function MovementHistory({ movements }: { movements: Movement[] }) {
  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#f0f0f0] flex items-center gap-2">
        <Icon name="History" size={13} className="text-[#9b9b9b]" />
        <span className="text-[12px] font-semibold text-[#4b4b4b]">История движений</span>
      </div>
      <div className="divide-y divide-[#f5f5f5]">
        {movements.slice(0, 8).map(m => {
          const mt = MOVE_TYPE[m.type];
          return (
            <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: mt.color + "18" }}>
                <Icon name={mt.icon as never} size={12} style={{ color: mt.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[12px] font-semibold" style={{ color: mt.color }}>{mt.label}</span>
                  <span className="text-[12px] text-[#1a1a1a]">{m.qty} ед.</span>
                  <span className="text-[12px] text-[#9b9b9b]">— {m.note}</span>
                  {m.order && (
                    <span className="text-[11px] bg-[#f5f5f5] text-[#6b6b6b] px-1.5 py-0.5 rounded font-mono">{m.order}</span>
                  )}
                </div>
              </div>
              <span className="text-[11px] text-[#b5b5b5] shrink-0">{m.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
