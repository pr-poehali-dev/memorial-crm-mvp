import { useState, useMemo, useCallback, useEffect } from "react";
import LoadingScreen from "@/components/ui/LoadingScreen";
import {
  RawMaterial, Blank, Movement, ModalType, StockItem,
  getLevelRaw, getLevelBlank,
  calcReserves, calcBlankReserves,
} from "./warehouse/warehouse.types";
import { warehouseApi, cuttingApi, ordersApi, DbMaterial, DbBlank, DbMovement, DbStockItem } from "@/api/client";
import type { Order } from "./orders/orders.types";
import { useTasks } from "@/store/tasksStore";
import { toast } from "sonner";
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
           salePrice: Number(b.sale_price) || 0,
           blankTypeId: b.blank_type_id || undefined };
}
function dbToMovement(m: DbMovement): Movement {
  return { id: String(m.id), date: new Date(m.move_date).toLocaleDateString("ru-RU", {day:"numeric",month:"short"}),
           isoDate: String(m.move_date).substring(0, 10),
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

export default function WarehousePage() {
  const { addTask } = useTasks();
  const [tab, setTab]             = useState<"raw" | "blanks" | "stock">("raw");
  const [modal, setModal]         = useState<ModalType>(null);

  const [rawMat,     setRawMat]     = useState<RawMaterial[]>([]);
  const [blanks,     setBlanks]     = useState<Blank[]>([]);
  const [movements,  setMovements]  = useState<Movement[]>([]);
  const [stock,      setStock]      = useState<StockItem[]>([]);
  const [orders,     setOrders]     = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const reload = useCallback(() => {
    return Promise.all([
      warehouseApi.materials(),
      warehouseApi.blanks(),
      warehouseApi.movements(),
      warehouseApi.stock(),
      ordersApi.list(),
    ]).then(([mats, bls, movs, stk, ords]) => {
      setRawMat(mats.map(dbToRaw));
      setBlanks(bls.map(dbToBlank));
      setMovements(movs.map(dbToMovement));
      setStock(stk.map(dbToStock));
      setOrders(ords.map(o => ({
        id:            o.id,
        client:        o.client_name,
        phone:         o.phone || "",
        stone:         o.stone || "",
        size:          o.size || "",
        inscription:   o.inscription || "",
        design:        o.design || "",
        status:        o.status,
        statusColor:   o.status_color,
        amount:        Number(o.amount),
        paid:          Number(o.paid),
        date:          o.order_date ? new Date(o.order_date).toLocaleDateString("ru-RU") : "",
        deadline:      o.deadline   ? new Date(o.deadline).toLocaleDateString("ru-RU") : "",
        manager:       o.manager || "",
        comment:       o.comment || "",
        deadlineState: (o.deadline_state as Order["deadlineState"]) || "ok",
        payStatus:     (o.pay_status  as Order["payStatus"])  || "unpaid",
      })));
    });
  }, []);

  useEffect(() => {
    reload().catch(console.error).finally(() => setLoadingData(false));
  }, [reload]);

  const [search, setSearch]     = useState("");

  const [showHistory, setShowHistory] = useState(false);
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



  /* ════════ ДЕЙСТВИЯ ════════ */

  const handleIn = () => {
    const q = parseFloat(inQty);
    if (!q || q <= 0) return;
    const rawId2 = inRawId || rawMat[0]?.id || "";
    const raw    = rawMat.find(r => r.id === rawId2)!;
    if (!raw) return;
    const price = parseFloat(inPrice) || raw.price;
    const total = +(q * price).toFixed(0);
    const note  = `Приход от поставщика${inReceiptId.trim() ? ` · ${inReceiptId.trim()}` : ""}`;

    warehouseApi.movement("in", {
      materialId:   parseInt(rawId2),
      qty:          q,
      pricePerUnit: price,
      totalSum:     total,
      note,
      receiptId:    inReceiptId.trim() || undefined,
    }).then(() => reload()).catch(console.error);

    setInQty(""); setInReceiptId(""); setInPrice("");
    setModal(null);
  };

  const handleCut = () => {
    const q       = parseInt(cutQty);
    const perUnit = parseFloat(cutRawPer);
    if (!q || q <= 0 || !perUnit || perUnit <= 0) return;

    const rawId = cutRawId  || rawMat[0]?.id  || "";
    const blkId = cutBlankId || blanks[0]?.id || "";
    const raw   = rawMat.find(r => r.id === rawId)!;
    const blk   = blanks.find(b => b.id === blkId)!;
    if (!raw || !blk) return;
    const totalUsed = +(perUnit * q).toFixed(2);
    if (raw.qty < totalUsed) return;

    warehouseApi.movement("cut", {
      materialId: parseInt(rawId),
      blankId:    parseInt(blkId),
      qty:        totalUsed,
      blankQty:   q,
      note:       `Нарезка: ${blk.name} (${q} шт.)${cutDeadline ? ` · до ${cutDeadline}` : ""}`,
    }).then(() => reload()).catch(console.error);

    cuttingApi.createTask({
      blankTypeId:  blk.blankTypeId ?? null,
      materialName: raw.name,
      totalQty:     q,
      deadline:     cutDeadline || null,
    }).then(res => {
      const newTask = {
        id:            String(res.id),
        blankTypeId:   blk.blankTypeId ? String(blk.blankTypeId) : "",
        blankName:     blk.name,
        blankSize:     blk.size,
        materialName:  raw.name,
        totalQty:      q,
        doneQty:       0,
        inProgressQty: 0,
        status:        "pending" as const,
        createdAt:     new Date().toLocaleDateString("ru-RU"),
        deadline:      cutDeadline || undefined,
      };
      addTask(newTask);
      toast.success(`Задача создана: ${blk.name} — ${q} шт.`, {
        description: "Появилась в разделе Заготовки → Задачи",
        duration: 4000,
      });
    }).catch(console.error);

    setCutQty(""); setCutRawPer(""); setCutDeadline("");
    setModal(null);
  };

  const handleUse = (p: { itemType: "raw"|"blank"|"stock"; itemId: number; qty: number; note: string; orderRef?: string }) => {
    warehouseApi.useAny(p)
      .then(() => reload())
      .then(() => toast.success("Списано со склада"))
      .catch(console.error);
    setModal(null);
  };

  /* ── Фильтры ── */
  const filteredRaw    = rawMat.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
  const filteredBlanks = blanks.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  const reserves      = useMemo(() => calcReserves(orders), [orders]);
  const blankReserves = useMemo(() => calcBlankReserves(orders), [orders]);
  const getReserved      = (id: string) => reserves.find(r => r.materialId === id)?.totalReserved ?? 0;
  const getBlankReserved = (id: string) => blankReserves.find(r => r.blankId === id)?.totalReserved ?? 0;

  const totalRawVal   = rawMat.reduce((s, r) => s + r.qty * r.price, 0);
  const totalRawArea  = rawMat.reduce((s, r) => s + r.qty, 0);
  const totalBlankQty = blanks.reduce((s, b) => s + b.qty, 0);
  const totalBlankVal = blanks.reduce((s, b) => s + b.qty * (b.salePrice || b.costPrice || 0), 0);
  const totalStockQty = stock.reduce((s, i) => s + i.qty, 0);
  const totalStockVal = stock.reduce((s, i) => s + i.qty * (i.price || 0), 0);
  const totalWarehouseVal = totalRawVal + totalBlankVal + totalStockVal;
  const criticalRaw   = rawMat.filter(r => getLevelRaw(r, getReserved(r.id)) === "critical").length;
  const critBlanks    = blanks.filter(b => getLevelBlank(b) === "critical").length;

  if (loadingData) {
    return <LoadingScreen text="Загружаем склад" />;
  }

  return (
    <div className="p-7 max-w-[1100px] mx-auto w-full space-y-5">

      <WarehouseHeader
        rawMat={rawMat}
        blanks={blanks}
        stock={stock}
        totalRawVal={totalRawVal}
        totalRawArea={totalRawArea}
        totalBlankQty={totalBlankQty}
        totalBlankVal={totalBlankVal}
        totalStockQty={totalStockQty}
        totalStockVal={totalStockVal}
        totalWarehouseVal={totalWarehouseVal}
        criticalRaw={criticalRaw}
        critBlanks={critBlanks}
        tab={tab}
        search={search}
        onTabChange={setTab}
        onSearchChange={setSearch}
        onModal={(m) => {
          if (m === "cut") {
            if (!cutRawId && rawMat.length > 0) setCutRawId(rawMat[0].id);
            if (!cutBlankId && blanks.length > 0) setCutBlankId(blanks[0].id);
          }
          if (m === "in" && !inRawId && rawMat.length > 0) setInRawId(rawMat[0].id);
          setModal(m);
        }}
        onShowAddMat={() => setShowAddMat(true)}
        onShowHistory={() => setShowHistory(true)}
      />

      <WarehouseContent
        tab={tab}
        filteredRaw={filteredRaw}
        filteredBlanks={filteredBlanks}
        rawMat={rawMat}
        blanks={blanks}
        stock={stock}
        reserves={reserves}
        blankReserves={blankReserves}
        getReserved={getReserved}
        getBlankReserved={getBlankReserved}
        onStockAdd={item => {
          warehouseApi.addStock({
            catalogId: item.catalogId || undefined,
            name:      item.name,
            category:  item.category,
            qty:       item.qty,
            price:     item.price,
            note:      item.note,
          }).then(() => reload()).catch(console.error);
        }}
        onStockUpdateQty={(id, delta) => {
          warehouseApi.updateStockQty(parseInt(id), delta)
            .then(() => reload()).catch(console.error);
        }}
        onStockRemove={id => {
          warehouseApi.removeStock(parseInt(id))
            .then(() => reload()).catch(console.error);
        }}
      />

      <WarehouseModalsGroup
        modal={modal}
        rawMat={rawMat}
        blanks={blanks}
        stock={stock}
        movements={movements}
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
        onConfirmIn={handleIn}
        onConfirmCut={handleCut}
        onConfirmUse={handleUse}
        onCloseModal={() => setModal(null)}
        onCloseAddMat={() => setShowAddMat(false)}
        onCloseHistory={() => setShowHistory(false)}
        onAddMat={mat => {
          warehouseApi.addMaterial({
            name:     mat.name,
            unit:     mat.unit,
            qty:      mat.qty,
            minQty:   mat.min,
            price:    mat.price,
            imageUrl: mat.imageUrl,
          } as unknown as Partial<DbMaterial>)
            .then(() => reload())
            .catch(console.error);
        }}
      />

    </div>
  );
}