import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import {
  RawMaterial, Blank, Movement, ModalType,
  initRaw, initBlanks, initMovements,
  getLevelRaw, getLevelBlank, getAvailable,
  calcRawPerUnit, calcReserves,
} from "./warehouse/warehouse.types";
import { RawTable, BlanksTable, MovementHistory } from "./warehouse/WarehouseTables";
import {
  MiniStat, TabBtn,
  ModalIn, ModalCut, ModalUse,
  ModalHistory, ModalMaterial,
} from "./warehouse/WarehouseModals";
import { useTasks } from "@/store/tasksStore";
import { BLANK_TYPES as CUTTING_BLANK_TYPES } from "./cutting/cutting.types";
import { orders as allOrders } from "./orders/orders.types";

const nowDate = () => new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "short" });

export default function WarehousePage() {
  const [tab, setTab]             = useState<"raw" | "blanks">("raw");
  const [rawMat, setRawMat]       = useState<RawMaterial[]>(initRaw);
  const [blanks, setBlanks]       = useState<Blank[]>(initBlanks);
  const [movements, setMovements] = useState<Movement[]>(initMovements);
  const [modal, setModal]         = useState<ModalType>(null);
  const [search, setSearch]       = useState("");
  const { addTask } = useTasks();

  /* история / детали материала */
  const [showHistory,   setShowHistory]   = useState(false);
  const [matDetail,     setMatDetail]     = useState<RawMaterial | null>(null);

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

  const reserves    = useMemo(() => calcReserves(allOrders), []);
  const getReserved = (id: string) => reserves.find(r => r.materialId === id)?.totalReserved ?? 0;

  const toBuy       = rawMat.filter(r => getAvailable(r, getReserved(r.id)) < 0);
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
      <div className="grid grid-cols-4 gap-3">
        <MiniStat icon="Layers"        color="#6b6b6b" label="Видов сырья"       value={String(rawMat.length)} />
        <MiniStat icon="Package"       color="#6366f1" label="Видов заготовок"   value={String(blanks.length)} />
        <MiniStat icon="Banknote"      color="#16a34a" label="Стоимость сырья"   value={`${(totalRawVal / 1000).toFixed(0)} тыс. ₽`} />
        <MiniStat icon="AlertTriangle" color="#ef4444" label="Критичных позиций" value={String(criticalRaw + critBlanks)} alert={criticalRaw + critBlanks > 0} />
      </div>

      {/* ── Акцент: доступно к использованию ── */}
      <div className="grid grid-cols-3 gap-3">
        {rawMat.filter(r => getReserved(r.id) > 0).map(r => {
          const reserved  = getReserved(r.id);
          const available = getAvailable(r, reserved);
          const isDeficit = available < 0;
          return (
            <div
              key={r.id}
              className={`rounded-xl border px-4 py-3 flex items-center justify-between ${
                isDeficit ? "bg-red-50 border-red-200" : "bg-white border-[#ebebeb]"
              }`}
            >
              <div>
                <p className="text-[11px] text-[#9b9b9b] mb-0.5">{r.name}</p>
                <div className="flex items-baseline gap-1">
                  <span className={`text-[22px] font-black font-mono ${isDeficit ? "text-red-500" : "text-[#1a1a1a]"}`}>
                    {available}
                  </span>
                  <span className="text-[12px] text-[#9b9b9b]">{r.unit}</span>
                  {isDeficit && <span className="text-[11px] text-red-500 font-semibold ml-1">дефицит</span>}
                </div>
                <p className="text-[10px] text-[#b5b5b5] mt-0.5">
                  Остаток {r.qty} · Резерв {reserved}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDeficit ? "bg-red-100" : "bg-[#f0fdf4]"}`}>
                <Icon name={isDeficit ? "TrendingDown" : "TrendingUp"} size={18} className={isDeficit ? "text-red-500" : "text-green-600"} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Что закупить (дефицит: Доступно < 0) ── */}
      {toBuy.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="ShoppingCart" size={14} className="text-red-600" />
            <span className="text-[13px] font-semibold text-red-800">Срочно закупить</span>
            <span className="text-[11px] bg-red-200 text-red-700 px-2 py-0.5 rounded-full font-bold">{toBuy.length}</span>
            <span className="text-[11px] text-red-500 ml-1">— доступно меньше нуля</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {toBuy.map(r => {
              const reserved  = getReserved(r.id);
              const available = getAvailable(r, reserved);
              const shortage  = Math.abs(available);
              return (
                <div key={r.id} className="bg-white rounded-lg border border-red-100 px-3 py-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                    <p className="text-[12px] font-semibold text-[#1a1a1a] truncate">{r.name}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#9b9b9b]">Есть на складе:</span>
                      <span className="font-mono font-semibold text-[#1a1a1a]">{r.qty} {r.unit}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#9b9b9b]">Зарезервировано:</span>
                      <span className="font-mono font-semibold text-amber-600">{reserved} {r.unit}</span>
                    </div>
                    <div className="flex justify-between text-[11px] border-t border-red-100 pt-1 mt-1">
                      <span className="text-red-700 font-semibold">Нужно докупить:</span>
                      <span className="font-mono font-bold text-red-600">{shortage.toFixed(2)} {r.unit}</span>
                    </div>
                    <div className="text-right text-[10px] text-[#9b9b9b]">
                      ≈ {(shortage * r.price).toLocaleString("ru")} ₽
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Вкладки + поиск ── */}
      <div className="flex items-center gap-3">
        <div className="flex gap-0.5 bg-[#f0f0f0] rounded-[8px] p-0.5">
          <TabBtn active={tab === "raw"}    onClick={() => setTab("raw")}    icon="Layers"  label="Сырьё"     count={criticalRaw} />
          <TabBtn active={tab === "blanks"} onClick={() => setTab("blanks")} icon="Package" label="Заготовки" count={critBlanks} />
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
      {tab === "raw"    && (
        <RawTable
          filteredRaw={filteredRaw}
          reserves={reserves}
          onHistory={mat => setMatDetail(mat)}
        />
      )}
      {tab === "blanks" && (
        <BlanksTable filteredBlanks={filteredBlanks} rawMat={rawMat} />
      )}

      {/* ── История движений (компактная) ── */}
      <MovementHistory movements={movements} onOpenAll={() => setShowHistory(true)} />

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