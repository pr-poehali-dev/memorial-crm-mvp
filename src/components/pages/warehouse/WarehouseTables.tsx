import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  RawMaterial, Blank, Movement,
  getLevelRaw, getLevelBlank, getAvailable, LEVEL_STYLE, MOVE_TYPE,
  MaterialReserve,
} from "./warehouse.types";

/* ─── Таблица сырья (с резервами) ─── */
export function RawTable({
  filteredRaw,
  reserves,
  onHistory,
}: {
  filteredRaw: RawMaterial[];
  reserves: MaterialReserve[];
  onHistory: (mat: RawMaterial) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const getReserve = (id: string): MaterialReserve | undefined =>
    reserves.find(r => r.materialId === id);

  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#f0f0f0]">
            {["Материал", "Ед.", "Остаток", "Зарезервировано", "Доступно", "Мин.", "Цена / ед.", "Стоимость", "Статус", ""].map(h => (
              <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredRaw.length === 0 && (
            <tr>
              <td colSpan={10} className="px-4 py-10 text-center text-[13px] text-[#b5b5b5]">Ничего не найдено</td>
            </tr>
          )}
          {filteredRaw.map((r, i) => {
            const reserve   = getReserve(r.id);
            const reserved  = reserve?.totalReserved ?? 0;
            const available = getAvailable(r, reserved);
            const lv        = getLevelRaw(r, reserved);
            const st        = LEVEL_STYLE[lv];
            const isLast    = i === filteredRaw.length - 1;
            const isOpen    = expanded.has(r.id);
            const hasReserve = reserved > 0;

            /* цвет «Доступно» */
            const availColor = available < 0
              ? "#ef4444"
              : available <= r.min
              ? "#d97706"
              : "#16a34a";

            return (
              <>
                <tr
                  key={r.id}
                  className={`
                    ${!isLast || isOpen ? "border-b border-[#f5f5f5]" : ""}
                    ${available < 0 ? "bg-red-50" : available <= r.min ? "bg-amber-50/60" : st.row}
                    transition-colors cursor-pointer hover:brightness-[0.98]
                  `}
                  onClick={() => hasReserve && toggleRow(r.id)}
                >
                  {/* Материал */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                      <span className="text-[13px] font-medium text-[#1a1a1a]">{r.name}</span>
                      {hasReserve && (
                        <Icon
                          name={isOpen ? "ChevronDown" : "ChevronRight"}
                          size={12}
                          className="text-[#b5b5b5] transition-transform"
                        />
                      )}
                    </div>
                  </td>

                  {/* Ед. */}
                  <td className="px-4 py-3 text-[12px] text-[#6b6b6b]">{r.unit}</td>

                  {/* Остаток */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-[15px] font-bold text-[#1a1a1a]">{r.qty}</span>
                    <span className="text-[11px] text-[#9b9b9b] ml-1">{r.unit}</span>
                    {reserved > 0 && (
                      <div className="text-[10px] text-[#9b9b9b] mt-0.5">
                        резерв: {reserved} {r.unit}
                      </div>
                    )}
                  </td>

                  {/* Зарезервировано */}
                  <td className="px-4 py-3">
                    {reserved > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[13px] font-semibold text-[#d97706]">{reserved}</span>
                        <span className="text-[11px] text-[#9b9b9b]">{r.unit}</span>
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                          {reserve?.orders.length} зак.
                        </span>
                      </div>
                    ) : (
                      <span className="text-[12px] text-[#c5c5c5]">—</span>
                    )}
                  </td>

                  {/* Доступно */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="font-mono text-[17px] font-black"
                        style={{ color: availColor }}
                      >
                        {available < 0 ? available : available}
                      </span>
                      <span className="text-[11px] text-[#9b9b9b]">{r.unit}</span>
                      {available < 0 && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">
                          дефицит
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Мин. */}
                  <td className="px-4 py-3 text-[12px] text-[#9b9b9b] font-mono">{r.min} {r.unit}</td>

                  {/* Цена */}
                  <td className="px-4 py-3 text-[12px] text-[#4b4b4b] font-mono">{r.price.toLocaleString("ru")} ₽</td>

                  {/* Стоимость */}
                  <td className="px-4 py-3 text-[12px] font-semibold text-[#1a1a1a] font-mono">
                    {(r.qty * r.price).toLocaleString("ru")} ₽
                  </td>

                  {/* Статус */}
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${
                      available < 0
                        ? "bg-red-100 text-red-600"
                        : available <= r.min
                        ? "bg-amber-100 text-amber-600"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {available < 0 ? "Дефицит" : available <= r.min ? "Мало" : "В норме"}
                    </span>
                  </td>

                  {/* История */}
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onHistory(r)}
                      className="flex items-center gap-1 text-[11px] text-[#9b9b9b] hover:text-[#6366f1] transition-colors whitespace-nowrap"
                      title="История по материалу"
                    >
                      <Icon name="History" size={12} />
                      История
                    </button>
                  </td>
                </tr>

                {/* Раскрытие — список заказов */}
                {isOpen && reserve && (
                  <tr key={r.id + "-detail"} className="bg-amber-50/40 border-b border-[#f5f5f5]">
                    <td colSpan={10} className="px-6 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name="BookOpen" size={12} className="text-amber-600" />
                        <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide">
                          Зарезервировано под заказы
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {reserve.orders.map(o => (
                          <div
                            key={o.orderId}
                            className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-1.5"
                          >
                            <span className="text-[12px] font-semibold text-[#1a1a1a]">{o.orderId}</span>
                            <span className="text-[11px] text-[#6b6b6b]">→</span>
                            <span className="text-[12px] font-mono font-semibold text-amber-700">
                              {o.qty} {r.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Таблица заготовок ─── */
export function BlanksTable({
  filteredBlanks,
  rawMat,
}: {
  filteredBlanks: Blank[];
  rawMat: RawMaterial[];
}) {
  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#f0f0f0]">
            {["Заготовка", "Размер", "Материал", "Остаток", "Мин.", "Статус"].map(h => (
              <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredBlanks.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-[#b5b5b5]">Ничего не найдено</td>
            </tr>
          )}
          {filteredBlanks.map((b, i) => {
            const lv     = getLevelBlank(b);
            const st     = LEVEL_STYLE[lv];
            const mat    = rawMat.find(r => r.id === b.materialId);
            const isLast = i === filteredBlanks.length - 1;
            return (
              <tr
                key={b.id}
                className={`${!isLast ? "border-b border-[#f5f5f5]" : ""} ${st.row} transition-colors`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                    <span className="text-[13px] font-medium text-[#1a1a1a]">{b.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-[12px] text-[#6b6b6b]">{b.size}</td>
                <td className="px-4 py-3">
                  <span className="text-[12px] text-[#4b4b4b] bg-[#f5f5f5] px-2 py-0.5 rounded-md">
                    {mat?.name ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] font-semibold text-[#1a1a1a]">{b.qty}</span>
                    <span className="text-[11px] text-[#9b9b9b]">шт.</span>
                  </div>
                  <div className="w-full h-1 bg-[#f0f0f0] rounded-full mt-1.5 max-w-[60px]">
                    <div
                      className="h-1 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (b.qty / (b.min * 2)) * 100)}%`, backgroundColor: st.bar }}
                    />
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

/* ─── История движений (компактная, последние 5) ─── */
export function MovementHistory({
  movements,
  onOpenAll,
}: {
  movements: Movement[];
  onOpenAll: () => void;
}) {
  const recent = movements.slice(0, 5);
  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#f0f0f0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="History" size={13} className="text-[#9b9b9b]" />
          <span className="text-[12px] font-semibold text-[#4b4b4b]">Последние движения</span>
        </div>
        <button
          onClick={onOpenAll}
          className="flex items-center gap-1 text-[12px] text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors"
        >
          Открыть всю историю
          <Icon name="ChevronRight" size={13} />
        </button>
      </div>
      <div className="divide-y divide-[#f5f5f5]">
        {recent.length === 0 && (
          <p className="px-4 py-5 text-center text-[12px] text-[#c5c5c5]">История пуста</p>
        )}
        {recent.map(m => {
          const mt = MOVE_TYPE[m.type];
          return (
            <div key={m.id} className="flex items-center gap-3 px-4 py-2.5" style={{ backgroundColor: mt.rowBg }}>
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: mt.color + "22" }}
              >
                <Icon name={mt.icon as never} size={12} style={{ color: mt.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[12px] font-semibold" style={{ color: mt.color }}>{mt.label}</span>
                  {m.order && (
                    <span className="text-[11px] bg-[#f0f0f0] text-[#4b4b4b] px-1.5 py-0.5 rounded font-mono">{m.order}</span>
                  )}
                  {m.receiptId && (
                    <span className="text-[11px] bg-[#f0f0f0] text-[#4b4b4b] px-1.5 py-0.5 rounded font-mono">{m.receiptId}</span>
                  )}
                </div>
                <p className="text-[11px] text-[#9b9b9b] mt-0.5 truncate">{m.note}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono text-[12px] font-semibold text-[#1a1a1a]">
                  {m.type === "in" ? "+" : "−"}{m.qty}
                  {m.totalSum ? ` · ${m.totalSum.toLocaleString("ru")} ₽` : ""}
                </div>
                {m.remainAfter !== undefined && (
                  <div className="text-[10px] text-[#9b9b9b]">остаток: {m.remainAfter}</div>
                )}
                <div className="text-[10px] text-[#c5c5c5]">{m.date}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
