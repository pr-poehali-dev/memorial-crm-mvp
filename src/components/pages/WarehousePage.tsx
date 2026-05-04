import { useState, useMemo, useEffect } from "react";
import {
  RawMaterial, Blank, Movement, ModalType, StockItem,
  getLevelRaw, getLevelBlank,
  calcRawPerUnit, calcReserves, calcBlankReserves,
} from "./warehouse/warehouse.types";
import { warehouseApi, DbMaterial, DbBlank, DbMovement, DbStockItem } from "@/api/client";
import { useTasks } from "@/store/tasksStore";
import { BLANK_TYPES as CUTTING_BLANK_TYPES } from "./cutting/cutting.types";
import WarehouseHeader from "./warehouse/WarehouseHeader";
import WarehouseContent from "./warehouse/WarehouseContent";
import WarehouseModalsGroup from "./warehouse/WarehouseModalsGroup";

function dbToRaw(m: DbMaterial): RawMaterial {
  return { id: String(m.id), name: m.name, unit: m.unit, qty: Number(m.qty),
           min: Number(m.min_qty), price: Number(m.price), imageUrl: m.image_url };
}
function dbToBlank(b: DbBlank): Blank {
  return { id: String(b.id), name: b.name, size: b.size||"", materialId: String(b.material_id),
           qty: Number(b.qty), min: Number(b.min_qty),
           costPrice: Number(b.cost_price) || 0,
           salePrice: Number(b.sale_price) || 0 };
}
function dbToMovement(m: DbMovement): Movement {
  return { id: String(m.id), date: new Date(m.move_date).toLocaleDateString("ru-RU", {day:"numeric",month:"short"}),
           type: m.move_type as Movement["type"], materialId: m.material_id ? String(m.material_id) : undefined,
           blankId: m.blank_id ? String(m.blank_id) : undefined, qty: Number(m.qty),
           pricePerUnit: m.price_per_unit ? Number(m.price_per_unit) : undefined,
           totalSum: m.total_sum ? Number(m.total_sum) : undefined,
           note: m.note, receiptId: m.receipt_id||undefined, order: m.order_ref||undefined,
           remainAfter: m.remain_after ? Number(m.remain_after) : undefined };
}
function dbToStock(s: DbStockItem): StockItem {
  return { id: String(s.id), catalogId: s.catalog_id||"", name: s.name, category: s.category,
           qty: s.qty, price: Number(s.price), addedAt: new Date(s.added_at).toLocaleDateString("ru-RU",{day:"numeric",month:"short"}),
           note: s.note };
}

const nowDate = () => new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "short" });

export default function WarehousePage() {
  const [tab, setTab]             = useState<"raw" | "blanks" | "stock">("raw");
  const [rawMat, setRawMat]       = useState<RawMaterial[]>([]);
  const [blanks, setBlanks]       = useState<Blank[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [stock, setStock]         = useState<StockItem[]>([]);
  const [modal, setModal]         = useState<ModalType>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([
      warehouseApi.materials(),
      warehouseApi.blanks(),
      warehouseApi.movements(),
      warehouseApi.stock(),
    ]).then(([mats, bls, movs, stk]) => {
      setRawMat(mats.map(dbToRaw));
      setBlanks(bls.map(dbToBlank));
      setMovements(movs.map(dbToMovement));
      setStock(stk.map(dbToStock));
    }).catch(console.error).finally(() => setLoadingData(false));
  }, []);

  const [search, setSearch]     = useState("");
  const { addTask } = useTasks();

  const [showHistory, setShowHistory] = useState(false);
  const [matDetail,   setMatDetail]   = useState<RawMaterial | null>(null);
  const [showAddMat,  setShowAddMat]  = useState(false);

  /* ── форма Приход ── */
  const [inRawId,     setInRawId]     = useState("");
  const [inQty,       setInQty]       = useState("");
  const [inReceiptId, setInReceiptId] = useState("");
  const [inPrice,     setInPrice]     = useState("");

  /* ── форма Нарезка ── */
  const [cutRawId,    setCutRawId]    = useState("");
  const [cutBlankId,  setCutBlankId]  = useState("");
  const [cutQty,      setCutQty]      = useState("");
  const [cutRawPer,   setCutRawPer]   = useState("");
  const [cutDeadline, setCutDeadline] = useState("");

  /* ── форма Списание ── */
  const [useBlankId, setUseBlankId] = useState("");
  const [useQty,     setUseQty]     = useState("");
  const [useOrder,   setUseOrder]   = useState("");

  /* ════════ ДЕЙСТВИЯ ════════ */

  const handleIn = () => {
    const q = parseFloat(inQty);
    if (!q || q <= 0) return;
    const raw    = rawMat.find(r => r.id === inRawId)!;
    const price  = parseFloat(inPrice) || raw.price;
    const total  = +(q * price).toFixed(0);
    const newQty = +(raw.qty + q).toFixed(2);
    const note   = `Приход от поставщика${inReceiptId.trim() ? ` · ${inReceiptId.trim()}` : ""}`;

    setRawMat(prev => prev.map(r =>
      r.id === inRawId ? { ...r, qty: newQty, price: price } : r
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

    const raw       = rawMat.find(r => r.id === cutRawId)!;
    const blk       = blanks.find(b => b.id === cutBlankId)!;
    const totalUsed = +(perUnit * q).toFixed(2);
    if (raw.qty < totalUsed) return;

    const newRawQty = +(raw.qty - totalUsed).toFixed(2);

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

  const reserves      = useMemo(() => calcReserves([]), []);
  const blankReserves = useMemo(() => calcBlankReserves([]), []);
  const getReserved      = (id: string) => reserves.find(r => r.materialId === id)?.totalReserved ?? 0;
  const getBlankReserved = (id: string) => blankReserves.find(r => r.blankId === id)?.totalReserved ?? 0;

  const totalRawVal = rawMat.reduce((s, r) => s + r.qty * r.price, 0);
  const criticalRaw = rawMat.filter(r => getLevelRaw(r, getReserved(r.id)) === "critical").length;
  const critBlanks  = blanks.filter(b => getLevelBlank(b) === "critical").length;

  return (
    <div className="p-7 max-w-[1100px] mx-auto w-full space-y-5">

      <WarehouseHeader
        rawMat={rawMat}
        blanks={blanks}
        totalRawVal={totalRawVal}
        criticalRaw={criticalRaw}
        critBlanks={critBlanks}
        tab={tab}
        search={search}
        onTabChange={setTab}
        onSearchChange={setSearch}
        onModal={setModal}
        onShowAddMat={() => setShowAddMat(true)}
      />

      <WarehouseContent
        tab={tab}
        filteredRaw={filteredRaw}
        filteredBlanks={filteredBlanks}
        rawMat={rawMat}
        blanks={blanks}
        movements={movements}
        stock={stock}
        reserves={reserves}
        blankReserves={blankReserves}
        getReserved={getReserved}
        getBlankReserved={getBlankReserved}
        onHistory={setMatDetail}
        onOpenAll={() => setShowHistory(true)}
        onStockAdd={item => setStock(prev => [...prev, item])}
        onStockUpdateQty={(id, delta) =>
          setStock(prev => prev.map(it =>
            it.id === id ? { ...it, qty: Math.max(0, it.qty + delta) } : it
          ))
        }
        onStockRemove={id => setStock(prev => prev.filter(it => it.id !== id))}
      />

      <WarehouseModalsGroup
        modal={modal}
        rawMat={rawMat}
        blanks={blanks}
        movements={movements}
        matDetail={matDetail}
        showAddMat={showAddMat}
        showHistory={showHistory}
        inRawId={inRawId}         setInRawId={setInRawId}
        inQty={inQty}             setInQty={setInQty}
        inReceiptId={inReceiptId} setInReceiptId={setInReceiptId}
        inPrice={inPrice}         setInPrice={setInPrice}
        cutRawId={cutRawId}       setCutRawId={setCutRawId}
        cutBlankId={cutBlankId}   setCutBlankId={setCutBlankId}
        cutQty={cutQty}           setCutQty={setCutQty}
        cutRawPer={cutRawPer}     setCutRawPer={setCutRawPer}
        cutDeadline={cutDeadline} setCutDeadline={setCutDeadline}
        useBlankId={useBlankId}   setUseBlankId={setUseBlankId}
        useQty={useQty}           setUseQty={setUseQty}
        useOrder={useOrder}       setUseOrder={setUseOrder}
        onConfirmIn={handleIn}
        onConfirmCut={handleCut}
        onConfirmUse={handleUse}
        onCloseModal={() => setModal(null)}
        onCloseMatDetail={() => setMatDetail(null)}
        onCloseAddMat={() => setShowAddMat(false)}
        onCloseHistory={() => setShowHistory(false)}
        onAddMat={mat => setRawMat(prev => [...prev, mat])}
      />

    </div>
  );
}