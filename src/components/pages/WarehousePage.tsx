import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import {
  RawMaterial, Blank, Movement, ModalType, StockItem,
  initRaw, initBlanks, initMovements, initStock,
  getLevelRaw, getLevelBlank, getAvailable, getAvailableBlank,
  calcRawPerUnit, calcReserves, calcBlankReserves,
} from "./warehouse/warehouse.types";
import { RawTable, BlanksTable, MovementHistory } from "./warehouse/WarehouseTables";
import {
  MiniStat, TabBtn,
  ModalIn, ModalCut, ModalUse,
  ModalHistory, ModalMaterial,
} from "./warehouse/WarehouseModals";
import { ModalAddMaterial } from "./warehouse/ModalAddMaterial";
import StockTable from "./warehouse/StockTable";
import { useTasks } from "@/store/tasksStore";
import { BLANK_TYPES as CUTTING_BLANK_TYPES } from "./cutting/cutting.types";
import { orders as allOrders } from "./orders/orders.types";

const nowDate = () => new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "short" });

export default function WarehousePage() {
  const [tab, setTab]             = useState<"raw" | "blanks" | "stock">("raw");
  const [rawMat, setRawMat]       = useState<RawMaterial[]>(initRaw);
  const [blanks, setBlanks]       = useState<Blank[]>(initBlanks);
  const [movements, setMovements] = useState<Movement[]>(initMovements);
  const [stock, setStock]         = useState<StockItem[]>(initStock);
  const [modal, setModal]         = useState<ModalType>(null);
  const [search, setSearch]       = useState("");
  const { addTask } = useTasks();

  /* история / детали материала */
  const [showHistory,   setShowHistory]   = useState(false);
  const [matDetail,     setMatDetail]     = useState<RawMaterial | null>(null);
  const [showAddMat,    setShowAddMat]    = useState(false);

  /* ── форма Приход ── */
  const [inRawId,     setInRawId]     = useState(initRaw[0].id);
  const [inQty,       setInQty]       = useState("");
  const [inReceiptId, setInReceiptId] = useState("");
  const [inPrice,     setInPrice]     = useState("");

  /* ── форма Нарезка ── */
  const [cutRawId,    setCutRawId]    = useState(initRaw[0].id);
  const [cutBlankId,  setCutBlankId]  = useState(initBlanks[0].id);
  const [cutQty,      setCutQty]      = useState("");
  const [cutRawPer,   setCutRawPer]   = useState("");
  const [cutDeadline, setCutDeadline] = useState("");

  /* ── форма Списание ── */
  const [useBlankId, setUseBlankId] = useState(initBlanks[0].id);
  const [useQty,     setUseQty]     = useState("");
  const [useOrder,   setUseOrder]   = useState("");

  /* ════════ ДЕЙСТВИЯ ════════ */

  const handleIn = () => {
    const q = parseFloat(inQty);
    if (!q || q <= 0) return;
    const raw     = rawMat.find(r => r.id === inRawId)!;
    const price   = parseFloat(inPrice) || raw.price;
    const total   = +(q * price).toFixed(0);
    const newQty  = +(raw.qty + q).toFixed(2);
    const note    = `Приход от поставщика${inReceiptId.trim() ? ` · ${inReceiptId.trim()}` : ""}`;

    setRawMat(prev => prev.map(r =>
      r.id === inRawId
        ? { ...r, qty: newQty, price: price }
        : r
    ));
    setMovements(prev => [{
      id: Date.now().toString(),
      date: nowDate(),
      type: "in",
      materialId: inRawId,
      qty: q,
      pricePerUnit: price,
      totalSum: total,
      note,
      receiptId: inReceiptId.trim() || undefined,
      remainAfter: newQty,
    }, ...prev]);

    setInQty(""); setInReceiptId(""); setInPrice("");
    setModal(null);
  };

  const handleCut = () => {
    const q       = parseInt(cutQty);
    const perUnit = parseFloat(cutRawPer);
    if (!q || q <= 0 || !perUnit || perUnit <= 0) return;

    const raw        = rawMat.find(r => r.id === cutRawId)!;
    const blk        = blanks.find(b => b.id === cutBlankId)!;
    const totalUsed  = +(perUnit * q).toFixed(2);
    if (raw.qty < totalUsed) return;

    const newRawQty  = +(raw.qty - totalUsed).toFixed(2);

    setRawMat(prev => prev.map(r =>
      r.id === cutRawId ? { ...r, qty: newRawQty } : r
    ));
    setBlanks(prev => prev.map(b =>
      b.id === cutBlankId ? { ...b, qty: b.qty + q } : b
    ));
    setMovements(prev => [{
      id: Date.now().toString(),
      date: nowDate(),
      type: "cut",
      materialId: cutRawId,
      blankId: cutBlankId,
      qty: totalUsed,
      note: `Нарезка: ${blk.name} (${q} шт.)${cutDeadline ? ` · до ${cutDeadline}` : ""}`,
      remainAfter: newRawQty,
    }, ...prev]);

    /* ── Создаём задачу на нарезку ── */
    const matchedBt = CUTTING_BLANK_TYPES.find(bt => bt.name === blk.name) ?? CUTTING_BLANK_TYPES[0];
    addTask({
      id: "task-" + Date.now(),
      blankTypeId: matchedBt.id,
      materialName: raw.name,
      totalQty: q,
      doneQty: 0,
      inProgressQty: 0,
      status: "pending",
      createdAt: nowDate(),
      deadline: cutDeadline || undefined,
    });

    setCutQty(""); setCutRawPer(""); setCutDeadline("");
    setModal(null);
  };

  const handleUse = () => {
    const q   = parseInt(useQty);
    if (!q || q <= 0) return;
    const blk = blanks.find(b => b.id === useBlankId)!;
    if (blk.qty < q) return;

    setBlanks(prev => prev.map(b =>
      b.id === useBlankId ? { ...b, qty: b.qty - q } : b
    ));
    setMovements(prev => [{
      id: Date.now().toString(),
      date: nowDate(),
      type: "use",
      blankId: useBlankId,
      qty: q,
      note: "Списание на заказ",
      order: useOrder.trim() || undefined,
    }, ...prev]);

    setUseQty(""); setUseOrder("");
    setModal(null);
  };

  /* ── Фильтры ── */
  const filteredRaw    = rawMat.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
  const filteredBlanks = blanks.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  const reserves       = useMemo(() => calcReserves(allOrders), []);
  const blankReserves  = useMemo(() => calcBlankReserves(allOrders), []);
  const getReserved    = (id: string) => reserves.find(r => r.materialId === id)?.totalReserved ?? 0;
  const getBlankReserved = (id: string) => blankReserves.find(r => r.blankId === id)?.totalReserved ?? 0;

  const totalRawVal = rawMat.reduce((s, r) => s + r.qty * r.price, 0);
  const criticalRaw = rawMat.filter(r => getLevelRaw(r, getReserved(r.id)) === "critical").length;
  const critBlanks  = blanks.filter(b => getLevelBlank(b) === "critical").length;

  return (
    <div className="p-7 max-w-[1100px] mx-auto w-full space-y-5">

      {/* ── Шапка ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[21px] font-semibold text-[#1a1a1a] tracking-tight">Склад</h1>
          <p className="text-[13px] text-[#9b9b9b] mt-0.5">
            {rawMat.length} видов сырья · {blanks.length} видов заготовок
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddMat(true)}
            className="flex items-center gap-2 bg-white border border-[#ebebeb] text-[#4b4b4b] text-[13px] px-4 py-2 rounded-[8px] hover:border-[#c5c5c5] transition-colors"
          >
            <Icon name="Plus" size={14} />Материал
          </button>
          <button
            onClick={() => setModal("in")}
            className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[13px] px-4 py-2 rounded-[8px] hover:bg-[#333] transition-colors"
          >
            <Icon name="ArrowDownToLine" size={14} />Приход
          </button>
          <button
            onClick={() => setModal("cut")}
            className="flex items-center gap-2 bg-[#6366f1] text-white text-[13px] px-4 py-2 rounded-[8px] hover:bg-[#5052cc] transition-colors"
          >
            <Icon name="Scissors" size={14} />Нарезка
          </button>
          <button
            onClick={() => setModal("use")}
            className="flex items-center gap-2 bg-white border border-[#ebebeb] text-[#4b4b4b] text-[13px] px-4 py-2 rounded-[8px] hover:border-[#c5c5c5] transition-colors"
          >
            <Icon name="ArrowUpFromLine" size={14} />Списание
          </button>
        </div>
      </div>

      {/* ── Статы ── */}
      <div className="grid grid-cols-3 gap-3">
        <MiniStat icon="Layers"   color="#6b6b6b" label="Видов сырья"     value={String(rawMat.length)} />
        <MiniStat icon="Package"  color="#6366f1" label="Видов заготовок" value={String(blanks.length)} />
        <MiniStat icon="Banknote" color="#16a34a" label="Стоимость сырья" value={`${(totalRawVal / 1000).toFixed(0)} тыс. ₽`} />
      </div>

      {/* ── Вкладки + поиск ── */}
      <div className="flex items-center gap-3">
        <div className="flex gap-0.5 bg-[#f0f0f0] rounded-[8px] p-0.5">
          <TabBtn active={tab === "raw"}    onClick={() => setTab("raw")}    icon="Layers"    label="Сырьё"     count={criticalRaw} />
          <TabBtn active={tab === "blanks"} onClick={() => setTab("blanks")} icon="Package"   label="Заготовки" count={critBlanks} />
          <TabBtn active={tab === "stock"}  onClick={() => setTab("stock")}  icon="LayoutGrid" label="Изделия"   count={0} />
        </div>
        <div className="relative flex-1 max-w-[240px]">
          <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5b5]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="w-full bg-white border border-[#ebebeb] rounded-[8px] pl-8 pr-3 py-2 text-[13px] placeholder:text-[#c5c5c5] outline-none focus:border-[#c0c0c0] transition-colors"
          />
        </div>
      </div>

      {/* ── Таблицы ── */}
      {tab === "raw" && (
        <>
          {/* Проблемные материалы */}
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
            onHistory={mat => setMatDetail(mat)}
          />
        </>
      )}

      {tab === "blanks" && (
        <>
          {/* Проблемные заготовки */}
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

      {tab === "stock" && (
        <StockTable
          items={stock}
          onAdd={item => setStock(prev => [...prev, item])}
          onUpdateQty={(id, delta) =>
            setStock(prev => prev.map(it =>
              it.id === id ? { ...it, qty: Math.max(0, it.qty + delta) } : it
            ))
          }
          onRemove={id => setStock(prev => prev.filter(it => it.id !== id))}
        />
      )}

      {/* ── История движений (компактная) ── */}
      {tab !== "stock" && (
        <MovementHistory movements={movements} onOpenAll={() => setShowHistory(true)} />
      )}

      {/* ════════ МОДАЛКИ ════════ */}

      {modal === "in" && (
        <ModalIn
          rawMat={rawMat}
          inRawId={inRawId}         setInRawId={setInRawId}
          inQty={inQty}             setInQty={setInQty}
          inReceiptId={inReceiptId} setInReceiptId={setInReceiptId}
          inPrice={inPrice}         setInPrice={setInPrice}
          onConfirm={handleIn}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "cut" && (
        <ModalCut
          rawMat={rawMat} blanks={blanks}
          cutRawId={cutRawId}       setCutRawId={setCutRawId}
          cutBlankId={cutBlankId}   setCutBlankId={setCutBlankId}
          cutQty={cutQty}           setCutQty={setCutQty}
          cutRawPer={cutRawPer}     setCutRawPer={setCutRawPer}
          cutDeadline={cutDeadline} setCutDeadline={setCutDeadline}
          onConfirm={handleCut}
          onClose={() => setModal(null)}
        />
      )}

      {modal === "use" && (
        <ModalUse
          blanks={blanks}
          useBlankId={useBlankId} setUseBlankId={setUseBlankId}
          useQty={useQty}         setUseQty={setUseQty}
          useOrder={useOrder}     setUseOrder={setUseOrder}
          onConfirm={handleUse}
          onClose={() => setModal(null)}
        />
      )}

      {/* История по конкретному материалу */}
      {matDetail && (
        <ModalMaterial
          material={matDetail}
          movements={movements}
          onClose={() => setMatDetail(null)}
        />
      )}

      {/* Добавить новый материал */}
      {showAddMat && (
        <ModalAddMaterial
          onClose={() => setShowAddMat(false)}
          onAdd={mat => setRawMat(prev => [...prev, mat])}
        />
      )}

      {/* Полная история */}
      {showHistory && (
        <ModalHistory
          movements={movements}
          rawMat={rawMat}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}