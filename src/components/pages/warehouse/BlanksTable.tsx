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
      className="text-[12px] font-semibold text-[#2563eb] hover:underline underline-offset-2 transition-colors"
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
  const totalCostB = filteredBlanks.reduce((a, b) => a + b.qty * b.costPrice, 0);

  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#f0f0f0]">
            {["Заготовка", "Размер", "Материал", "Остаток", "Зарезервировано", "Доступно", "Мин.", "Себестоимость", "Статус", ""].map(h => (
              <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredBlanks.length === 0 && (
            <tr>
              <td colSpan={10} className="px-4 py-10 text-center text-[13px] text-[#b5b5b5]">Ничего не найдено</td>
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

                  {/* Себестоимость с расшифровкой */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="group relative inline-block">
                      <span className="text-[13px] font-semibold text-[#1a1a1a] font-mono cursor-default">
                        {b.costPrice > 0 ? `${b.costPrice.toLocaleString("ru")} ₽` : "—"}
                      </span>
                      {b.costPrice > 0 && b.rawPerUnit && b.materialPrice && (
                        <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:flex flex-col gap-1 bg-[#1a1a1a] text-white text-[11px] rounded-lg px-3 py-2 whitespace-nowrap z-10 shadow-lg">
                          <span className="text-[#9b9b9b]">Расчёт себестоимости:</span>
                          <span>{b.rawPerUnit} м² × {b.materialPrice.toLocaleString("ru")} ₽/м²</span>
                          <span className="text-[#22c55e] font-semibold">= {b.costPrice.toLocaleString("ru")} ₽</span>
                        </div>
                      )}
                    </div>
                  </td>

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
                    <td colSpan={10} className="px-6 py-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name="BookOpen" size={12} className="text-amber-600" />
                        <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide">
                          Зарезервировано под заказы
                        </span>
                        <span className="text-[10px] bg-amber-200 text-amber-700 px-1.5 py-0.5 rounded-full font-bold ml-1">
                          {reserve.orders.length}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {reserve.orders.map(o => (
                          <div
                            key={o.orderId}
                            className="flex items-center justify-between bg-white border border-amber-200 rounded-lg px-3 py-2 gap-3"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <OrderLink orderId={o.orderId} />
                              {o.clientName && (
                                <span className="text-[12px] text-[#4b4b4b] truncate">{o.clientName}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {o.stage && (
                                <span className="text-[10px] font-semibold bg-[#f0f0f0] text-[#6b6b6b] px-2 py-0.5 rounded whitespace-nowrap">
                                  {o.stage}
                                </span>
                              )}
                              <span className="text-[12px] font-mono font-bold text-amber-700 whitespace-nowrap">
                                {o.qty} шт.
                              </span>
                            </div>
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
            <td className="px-4 py-3 font-mono text-[13px] font-bold text-[#1a1a1a]">
              {totalCostB.toLocaleString("ru")} ₽
              <span className="text-[10px] font-normal text-[#9b9b9b] ml-1">общая себест.</span>
            </td>
            <td colSpan={2} className="px-4 py-3" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}