import { useState, useMemo, useCallback, useEffect } from "react";
import LoadingScreen from "@/components/ui/LoadingScreen";
import {
  RawMaterial, Blank, Movement, ModalType, StockItem,
  getLevelRaw, getLevelBlank,
  MaterialReserve, calcBlankReserves,
} from "./warehouse/warehouse.types";
import { warehouseApi, cuttingApi, ordersApi } from "@/api/client";
import { dbToRaw, dbToBlank, dbToMovement, dbToStock } from "@/lib/converters";
import type { Order } from "./orders/orders.types";
import { useTasks } from "@/store/tasksStore";
import { toast } from "sonner";
import WarehouseHeader from "./warehouse/WarehouseHeader";
import WarehouseContent from "./warehouse/WarehouseContent";
import WarehouseModalsGroup from "./warehouse/WarehouseModalsGroup";

export default function WarehousePage() {
  const { addTask } = useTasks();
  const [tab, setTab]             = useState<"raw" | "blanks" | "stock">("raw");
  const [modal, setModal]         = useState<ModalType>(null);

  const [rawMat,      setRawMat]      = useState<RawMaterial[]>([]);
  const [blanks,      setBlanks]      = useState<Blank[]>([]);
  const [movements,   setMovements]   = useState<Movement[]>([]);
  const [stock,       setStock]       = useState<StockItem[]>([]);
  const [orders,      setOrders]      = useState<Order[]>([]);
  const [rawReserves, setRawReserves] = useState<MaterialReserve[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const reload = useCallback(() => {
    return Promise.all([
      warehouseApi.materials(),
      warehouseApi.blanks(),
      warehouseApi.movements(),
      warehouseApi.stock(),
      ordersApi.list(),
      warehouseApi.reserves(),
    ]).then(([mats, bls, movs, stk, ords, res]) => {
      // Строим MaterialReserve[] из задач нарезки
      const reserveMap: Record<string, MaterialReserve> = {};
      for (const r of res) {
        if (!r.material_id || Number(r.qty) <= 0) continue;
        const matId = String(r.material_id);
        if (!reserveMap[matId]) {
          reserveMap[matId] = { materialId: matId, totalReserved: 0, orders: [] };
        }
        reserveMap[matId].totalReserved = +(reserveMap[matId].totalReserved + Number(r.qty)).toFixed(2);
        // Подпись: "Имя заготовки · размер" если есть, иначе material_name
        const blankLabel = r.blank_name
          ? (r.blank_size ? `${r.blank_name} ${r.blank_size}` : r.blank_name)
          : (r.material_name ?? "Задача");
        reserveMap[matId].orders.push({
          orderId:    `Задача #${r.task_id ?? r.id}`,
          qty:        Number(r.qty),
          clientName: blankLabel,
          stage:      r.task_status ?? "pending",
        });
      }
      setRawReserves(Object.values(reserveMap));
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

  const [showHistory,  setShowHistory]  = useState(false);
  const [showAddMat,   setShowAddMat]   = useState(false);
  const [showAddBlank, setShowAddBlank] = useState(false);

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

    // Проверяем: остаток - уже зарезервировано >= нужное количество
    const alreadyReserved = getReserved(rawId);
    if (raw.qty - alreadyReserved < totalUsed) return;

    const note = `Нарезка: ${blk.name} (${q} шт.)${cutDeadline ? ` · до ${cutDeadline}` : ""}`;

    // Сначала создаём задачу, чтобы получить taskId для резерва
    cuttingApi.createTask({
      blankTypeId:  blk.blankTypeId ?? null,
      materialName: raw.name,
      totalQty:     q,
      deadline:     cutDeadline || null,
    }).then(res => {
      const taskId = res.id;

      // Создаём движение с taskId — бэкенд запишет резерв, не спишет
      warehouseApi.movement("cut", {
        materialId: parseInt(rawId),
        blankId:    parseInt(blkId),
        qty:        totalUsed,
        blankQty:   q,
        taskId,
        note,
      }).then(() => reload()).catch(console.error);

      const newTask = {
        id:            String(taskId),
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
        description: `Зарезервировано ${totalUsed} ${raw.unit} камня`,
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

  // Резервы сырья — из БД (задачи нарезки)
  const getReserved = (id: string) => rawReserves.find(r => r.materialId === id)?.totalReserved ?? 0;
  // Резервы заготовок — из заказов
  const blankReserves = useMemo(() => calcBlankReserves(orders), [orders]);
  const getBlankReserved = (id: string) => blankReserves.find(r => r.blankId === id)?.totalReserved ?? 0;

  const totalRawVal      = rawMat.reduce((s, r) => s + r.qty * r.price, 0);
  const totalRawArea     = rawMat.reduce((s, r) => s + r.qty, 0);
  const totalBlankQty    = blanks.reduce((s, b) => s + b.qty, 0);
  const totalBlankVal    = blanks.reduce((s, b) => s + b.qty * (b.costPrice || 0), 0);
  const totalBlankSale   = blanks.reduce((s, b) => s + b.qty * (b.salePrice || 0), 0);
  const totalStockQty    = stock.reduce((s, i) => s + i.qty, 0);
  const totalStockCost   = stock.reduce((s, i) => s + i.qty * (i.costPrice || 0), 0);
  const totalStockSale   = stock.reduce((s, i) => s + i.qty * (i.price || 0), 0);
  const totalStockVal    = totalStockCost; // себестоимость В Наличии
  const totalWarehouseVal = totalRawVal + totalBlankVal + totalStockCost; // только себестоимость
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
        totalBlankSale={totalBlankSale}
        totalStockQty={totalStockQty}
        totalStockCost={totalStockCost}
        totalStockSale={totalStockSale}
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
        onShowAddBlank={() => setShowAddBlank(true)}
        onShowHistory={() => setShowHistory(true)}
      />

      <WarehouseContent
        tab={tab}
        filteredRaw={filteredRaw}
        filteredBlanks={filteredBlanks}
        rawMat={rawMat}
        blanks={blanks}
        stock={stock}
        reserves={rawReserves}
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
        onStockUpdateCost={(id, costPrice) => {
          warehouseApi.updateStockCost(parseInt(id), costPrice)
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
        showAddBlank={showAddBlank}
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
        onCloseAddBlank={() => setShowAddBlank(false)}
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
        onAddBlank={data => {
          warehouseApi.addBlank({
            name:       data.name,
            size:       data.size,
            materialId: data.materialId,
            minQty:     data.minQty,
            costPrice:  data.costPrice,
            salePrice:  data.salePrice,
            rawPerUnit: data.rawPerUnit,
          })
            .then(() => reload())
            .catch(console.error);
        }}
      />

    </div>
  );
}