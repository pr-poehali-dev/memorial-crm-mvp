import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useNav } from "@/store/navStore";
import {
  RawMaterial,
  getLevelRaw, getAvailable,
  LEVEL_STYLE,
  MaterialReserve,
} from "./warehouse.types";

function OrderLink({ orderId }: { orderId: string }) {
  const { openOrder } = useNav();
  return (
    <button
      onClick={() => openOrder(orderId)}
      className="text-[12px] font-semibold text-[#6366f1] hover:underline underline-offset-2 transition-colors"
    >
      {orderId}
    </button>
  );
}

export function RawTable({
  filteredRaw,
  reserves,
}: {
  filteredRaw: RawMaterial[];
  reserves: MaterialReserve[];
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

  const totalQtyR       = +filteredRaw.reduce((a, r) => a + r.qty, 0).toFixed(2);
  const totalReservedR  = +filteredRaw.reduce((a, r) => a + (getReserve(r.id)?.totalReserved ?? 0), 0).toFixed(2);
  const totalAvailableR = +(filteredRaw.reduce((a, r) => a + getAvailable(r, getReserve(r.id)?.totalReserved ?? 0), 0)).toFixed(2);
  const totalCostR      = filteredRaw.reduce((a, r) => a + r.qty * r.price, 0);

  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#f0f0f0]">
            {["Материал", "Ед.", "Остаток", "Зарезервировано", "Доступно", "Мин.", "Цена / ед.", "Стоимость", "Статус"].map(h => (
              <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredRaw.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-10 text-center text-[13px] text-[#b5b5b5]">Ничего не найдено</td>
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
                    <div className="flex items-center gap-2.5">
                      {r.imageUrl ? (
                        <img
                          src={r.imageUrl}
                          alt={r.name}
                          className="w-7 h-7 rounded-[5px] object-cover shrink-0 border border-[#e8e8e8]"
                        />
                      ) : (
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                      )}
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
                  <td className="px-4 py-3 text-[12px] text-[#1a1a1a]">{r.unit}</td>

                  {/* Остаток */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono text-[14px] font-bold text-[#1a1a1a]">{(+r.qty.toFixed(2))}</span>
                    <span className="text-[11px] text-[#6b6b6b] ml-1">{r.unit}</span>
                  </td>

                  {/* Зарезервировано */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {reserved > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[13px] font-semibold text-[#1a1a1a]">{(+reserved.toFixed(2))}</span>
                        <span className="text-[11px] text-[#6b6b6b]">{r.unit}</span>
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                          {reserve?.orders.length} зак.
                        </span>
                      </div>
                    ) : (
                      <span className="text-[12px] text-[#c5c5c5]">—</span>
                    )}
                  </td>

                  {/* Доступно */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="font-mono text-[14px] font-bold"
                        style={{ color: availColor }}
                      >
                        {(+available.toFixed(2))}
                      </span>
                      <span className="text-[11px] text-[#6b6b6b]">{r.unit}</span>
                    </div>
                  </td>

                  {/* Мин. */}
                  <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#1a1a1a] font-mono">{(+r.min.toFixed(2))} {r.unit}</td>

                  {/* Цена */}
                  <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#1a1a1a] font-mono">{r.price.toLocaleString("ru")} ₽</td>

                  {/* Стоимость */}
                  <td className="px-4 py-3 whitespace-nowrap text-[12px] font-semibold text-[#1a1a1a] font-mono">
                    {(r.qty * r.price).toLocaleString("ru")} ₽
                  </td>

                  {/* Статус */}
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap ${
                      available < 0
                        ? "bg-red-100 text-red-600"
                        : available <= r.min
                        ? "bg-amber-100 text-amber-600"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {available < 0 ? "Не хватает" : available <= r.min ? "Мало" : "В норме"}
                    </span>
                  </td>

                </tr>

                {/* Раскрытие — список заказов */}
                {isOpen && reserve && (
                  <tr key={r.id + "-detail"} className="bg-amber-50/40 border-b border-[#f5f5f5]">
                    <td colSpan={9} className="px-6 py-3">
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
                            <OrderLink orderId={o.orderId} />
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
        <tfoot>
          <tr className="border-t-2 border-[#e8e8e8] bg-[#fafafa]">
            <td colSpan={2} className="px-4 py-3 text-[11px] font-bold text-[#9b9b9b] uppercase tracking-wide">Итого</td>
            <td className="px-4 py-3 font-mono text-[14px] font-bold text-[#1a1a1a]">
              {totalQtyR} <span className="text-[11px] font-normal text-[#9b9b9b]">м²</span>
            </td>
            <td className="px-4 py-3 font-mono text-[13px] font-semibold text-[#1a1a1a]">
              {+(totalReservedR).toFixed(2)} <span className="text-[11px] font-normal text-[#9b9b9b]">м²</span>
            </td>
            <td className="px-4 py-3 font-mono text-[14px] font-bold" style={{ color: totalAvailableR < 0 ? "#ef4444" : "#16a34a" }}>
              {totalAvailableR} <span className="text-[11px] font-normal text-[#9b9b9b]">м²</span>
            </td>
            <td className="px-4 py-3" />
            <td className="px-4 py-3" />
            <td className="px-4 py-3 font-mono text-[13px] font-bold text-[#6366f1]">
              {totalCostR.toLocaleString("ru")} ₽
            </td>
            <td colSpan={2} className="px-4 py-3" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}