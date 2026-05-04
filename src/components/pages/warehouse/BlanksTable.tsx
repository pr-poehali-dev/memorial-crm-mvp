import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useNav } from "@/store/navStore";
import {
  Blank, RawMaterial,
  getLevelBlankReserved, getAvailableBlank,
  LEVEL_STYLE,
  BlankReserve,
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

export function BlanksTable({
  filteredBlanks,
  rawMat,
  blankReserves,
}: {
  filteredBlanks: Blank[];
  rawMat: RawMaterial[];
  blankReserves: BlankReserve[];
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const getBlankReserve = (id: string): BlankReserve | undefined =>
    blankReserves.find(r => r.blankId === id);

  const totalQtyB       = filteredBlanks.reduce((a, b) => a + b.qty, 0);
  const totalReservedB  = filteredBlanks.reduce((a, b) => a + (getBlankReserve(b.id)?.totalReserved ?? 0), 0);
  const totalAvailableB = filteredBlanks.reduce((a, b) => a + getAvailableBlank(b, getBlankReserve(b.id)?.totalReserved ?? 0), 0);
  const totalCostB      = filteredBlanks.reduce((a, b) => a + b.qty * b.costPrice, 0);
  const totalSaleB      = filteredBlanks.reduce((a, b) => a + b.qty * b.salePrice, 0);

  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#f0f0f0]">
            {["Заготовка", "Размер", "Материал", "Остаток", "Зарезервировано", "Доступно", "Мин.", "Себест.", "Цена прод.", "Статус", ""].map(h => (
              <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredBlanks.length === 0 && (
            <tr>
              <td colSpan={11} className="px-4 py-10 text-center text-[13px] text-[#b5b5b5]">Ничего не найдено</td>
            </tr>
          )}
          {filteredBlanks.map((b, i) => {
            const reserve    = getBlankReserve(b.id);
            const reserved   = reserve?.totalReserved ?? 0;
            const available  = getAvailableBlank(b, reserved);
            const lv         = getLevelBlankReserved(b, reserved);
            const st         = LEVEL_STYLE[lv];
            const mat        = rawMat.find(r => r.id === b.materialId);
            const isLast     = i === filteredBlanks.length - 1;
            const isOpen     = expanded.has(b.id);
            const hasReserve = reserved > 0;

            const availColor = available < 0
              ? "#ef4444"
              : available <= b.min
              ? "#d97706"
              : "#16a34a";

            return (
              <>
                <tr
                  key={b.id}
                  className={`
                    ${!isLast || isOpen ? "border-b border-[#f5f5f5]" : ""}
                    ${available < 0 ? "bg-red-50" : available <= b.min ? "bg-amber-50/60" : ""}
                    transition-colors ${hasReserve ? "cursor-pointer hover:brightness-[0.98]" : ""}
                  `}
                  onClick={() => hasReserve && toggleRow(b.id)}
                >
                  {/* Заготовка */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                      <span className="text-[13px] font-medium text-[#1a1a1a]">{b.name}</span>
                      {hasReserve && (
                        <Icon
                          name={isOpen ? "ChevronDown" : "ChevronRight"}
                          size={12}
                          className="text-[#b5b5b5] transition-transform"
                        />
                      )}
                    </div>
                  </td>

                  {/* Размер */}
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-[12px] text-[#1a1a1a]">{b.size}</td>

                  {/* Материал */}
                  <td className="px-4 py-3">
                    <span className="text-[12px] text-[#1a1a1a] bg-[#f5f5f5] px-2 py-0.5 rounded-md whitespace-nowrap">
                      {mat?.name ?? "—"}
                    </span>
                  </td>

                  {/* Остаток */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono text-[14px] font-bold text-[#1a1a1a]">{b.qty}</span>
                    <span className="text-[11px] text-[#6b6b6b] ml-1">шт.</span>
                  </td>

                  {/* Зарезервировано */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {reserved > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[13px] font-semibold text-[#1a1a1a]">{reserved}</span>
                        <span className="text-[11px] text-[#6b6b6b]">шт.</span>
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
                      <span className="font-mono text-[14px] font-bold" style={{ color: availColor }}>
                        {available}
                      </span>
                      <span className="text-[11px] text-[#6b6b6b]">шт.</span>
                    </div>
                  </td>

                  {/* Мин. */}
                  <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#1a1a1a] font-mono">{b.min} шт.</td>

                  {/* Себестоимость */}
                  <td className="px-4 py-3 whitespace-nowrap text-[12px] text-[#6b6b6b] font-mono">{b.costPrice.toLocaleString("ru")} ₽</td>

                  {/* Цена продажи */}
                  <td className="px-4 py-3 whitespace-nowrap text-[12px] font-semibold text-[#1a1a1a] font-mono">{b.salePrice.toLocaleString("ru")} ₽</td>

                  {/* Статус */}
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap ${
                      available < 0
                        ? "bg-red-100 text-red-600"
                        : available <= b.min
                        ? "bg-amber-100 text-amber-600"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {available < 0 ? "Не хватает" : available <= b.min ? "Мало" : "В норме"}
                    </span>
                  </td>

                  {/* Пустая колонка для выравнивания */}
                  <td className="px-4 py-3" />
                </tr>

                {/* Раскрытие — список заказов */}
                {isOpen && reserve && (
                  <tr key={b.id + "-detail"} className="bg-amber-50/40 border-b border-[#f5f5f5]">
                    <td colSpan={11} className="px-6 py-3">
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
                              {o.qty} шт.
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
            <td colSpan={3} className="px-4 py-3 text-[11px] font-bold text-[#9b9b9b] uppercase tracking-wide">Итого</td>
            <td className="px-4 py-3 font-mono text-[14px] font-bold text-[#1a1a1a]">{totalQtyB} <span className="text-[11px] font-normal text-[#9b9b9b]">шт.</span></td>
            <td className="px-4 py-3 font-mono text-[13px] font-semibold text-[#1a1a1a]">{totalReservedB} <span className="text-[11px] font-normal text-[#9b9b9b]">шт.</span></td>
            <td className="px-4 py-3 font-mono text-[14px] font-bold" style={{ color: totalAvailableB < 0 ? "#ef4444" : "#16a34a" }}>{totalAvailableB} <span className="text-[11px] font-normal text-[#9b9b9b]">шт.</span></td>
            <td className="px-4 py-3" />
            <td className="px-4 py-3 font-mono text-[12px] font-semibold text-[#6b6b6b]">{totalCostB.toLocaleString("ru")} ₽</td>
            <td className="px-4 py-3 font-mono text-[13px] font-bold text-[#6366f1]">{totalSaleB.toLocaleString("ru")} ₽</td>
            <td colSpan={2} className="px-4 py-3" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
