import Icon from "@/components/ui/icon";
import { RawMaterial, Blank, StockItem, getAvailable, getAvailableBlank } from "./warehouse.types";
import { RawTable, BlanksTable } from "./WarehouseTables";
import StockTable from "./StockTable";

type Reserve = { materialId: string; totalReserved: number };
type BlankReserve = { blankId: string; totalReserved: number };

type Props = {
  tab: "raw" | "blanks" | "stock";
  filteredRaw: RawMaterial[];
  filteredBlanks: Blank[];
  rawMat: RawMaterial[];
  blanks: Blank[];
  stock: StockItem[];
  reserves: Reserve[];
  blankReserves: BlankReserve[];
  getReserved: (id: string) => number;
  getBlankReserved: (id: string) => number;
  onStockAdd: (item: StockItem) => void;
  onStockUpdateQty: (id: string, delta: number) => void;
  onStockRemove: (id: string) => void;
};

export default function WarehouseContent({
  tab,
  filteredRaw, filteredBlanks,
  rawMat, blanks, stock,
  reserves, blankReserves,
  getReserved, getBlankReserved,
  onStockAdd, onStockUpdateQty, onStockRemove,
}: Props) {
  return (
    <>
      {/* ── Вкладка: Сырьё ── */}
      {tab === "raw" && (
        <>
          {(() => {
            const problemMats = rawMat.filter(r => {
              const reserved  = getReserved(r.id);
              const available = getAvailable(r, reserved);
              return available < 0 || available < r.min;
            });
            if (problemMats.length === 0) {
              return (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                    <Icon name="CheckCircle" size={14} className="text-green-600" />
                  </div>
                  <span className="text-[13px] font-medium text-green-800">Все материалы в норме</span>
                </div>
              );
            }
            return (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="AlertTriangle" size={14} className="text-amber-600" />
                  <span className="text-[13px] font-semibold text-amber-800">Проблемные материалы</span>
                  <span className="text-[11px] bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-bold">{problemMats.length}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {problemMats.map(r => {
                    const reserved  = getReserved(r.id);
                    const available = getAvailable(r, reserved);
                    const isDeficit = available < 0;
                    const shortage  = isDeficit ? Math.abs(available) : 0;
                    return (
                      <div
                        key={r.id}
                        className={`rounded-lg border px-3 py-3 bg-white ${isDeficit ? "border-red-200" : "border-amber-200"}`}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isDeficit ? "bg-red-400" : "bg-amber-400"}`} />
                          <p className="text-[12px] font-semibold text-[#1a1a1a] truncate">{r.name}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-[#6b6b6b]">Остаток:</span>
                            <span className="font-mono font-semibold text-[#1a1a1a]">{r.qty} {r.unit}</span>
                          </div>
                          {reserved > 0 && (
                            <div className="flex justify-between text-[11px]">
                              <span className="text-[#6b6b6b]">Зарезервировано:</span>
                              <span className="font-mono font-semibold text-[#1a1a1a]">{reserved} {r.unit}</span>
                            </div>
                          )}
                          {isDeficit ? (
                            <div className="flex justify-between text-[11px] border-t border-red-100 pt-1 mt-1">
                              <span className="text-red-700 font-semibold">Не хватает:</span>
                              <span className="font-mono font-bold text-red-600">{shortage.toFixed(2)} {r.unit}</span>
                            </div>
                          ) : (
                            <div className="flex justify-between text-[11px] border-t border-amber-100 pt-1 mt-1">
                              <span className="text-amber-700 font-semibold">Доступно:</span>
                              <span className="font-mono font-bold text-amber-600">{available} {r.unit}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
          <RawTable
            filteredRaw={filteredRaw}
            reserves={reserves}
          />
        </>
      )}

      {/* ── Вкладка: Заготовки ── */}
      {tab === "blanks" && (
        <>
          {(() => {
            const problemBlanks = blanks.filter(b => {
              const avail = getAvailableBlank(b, getBlankReserved(b.id));
              return avail < 0 || avail <= b.min;
            });
            if (problemBlanks.length === 0) {
              return (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                    <Icon name="CheckCircle" size={14} className="text-green-600" />
                  </div>
                  <span className="text-[13px] font-medium text-green-800">Все заготовки в норме</span>
                </div>
              );
            }
            return (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="AlertTriangle" size={14} className="text-amber-600" />
                  <span className="text-[13px] font-semibold text-amber-800">Проблемные заготовки</span>
                  <span className="text-[11px] bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-bold">{problemBlanks.length}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {problemBlanks.map(b => {
                    const reserved  = getBlankReserved(b.id);
                    const available = getAvailableBlank(b, reserved);
                    const isDeficit = available < 0;
                    return (
                      <div
                        key={b.id}
                        className={`rounded-lg border px-3 py-3 bg-white ${isDeficit ? "border-red-200" : "border-amber-200"}`}
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isDeficit ? "bg-red-400" : "bg-amber-400"}`} />
                          <p className="text-[12px] font-semibold text-[#1a1a1a] truncate">{b.name}</p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-[#6b6b6b]">Остаток:</span>
                            <span className="font-mono font-semibold text-[#1a1a1a]">{b.qty} шт.</span>
                          </div>
                          {reserved > 0 && (
                            <div className="flex justify-between text-[11px]">
                              <span className="text-[#6b6b6b]">Зарезервировано:</span>
                              <span className="font-mono font-semibold text-[#1a1a1a]">{reserved} шт.</span>
                            </div>
                          )}
                          {isDeficit ? (
                            <div className="flex justify-between text-[11px] border-t border-red-100 pt-1 mt-1">
                              <span className="text-red-700 font-semibold">Не хватает:</span>
                              <span className="font-mono font-bold text-red-600">{Math.abs(available)} шт.</span>
                            </div>
                          ) : (
                            <div className="flex justify-between text-[11px] border-t border-amber-100 pt-1 mt-1">
                              <span className="text-amber-700 font-semibold">Доступно:</span>
                              <span className="font-mono font-bold text-amber-600">{available} шт.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
          <BlanksTable
            filteredBlanks={filteredBlanks}
            rawMat={rawMat}
            blankReserves={blankReserves}
          />
        </>
      )}

      {/* ── Вкладка: Изделия ── */}
      {tab === "stock" && (
        <StockTable
          items={stock}
          onAdd={onStockAdd}
          onUpdateQty={(id, delta) => onStockUpdateQty(id, delta)}
          onRemove={onStockRemove}
        />
      )}
    </>
  );
}