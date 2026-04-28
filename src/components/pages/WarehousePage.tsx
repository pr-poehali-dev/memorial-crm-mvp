import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  RawMaterial, Blank, Movement, ModalType,
  initRaw, initBlanks, initMovements,
  getLevelRaw, getLevelBlank, LEVEL_STYLE,
} from "./warehouse/warehouse.types";
import { RawTable, BlanksTable, MovementHistory } from "./warehouse/WarehouseTables";
import { MiniStat, TabBtn, ModalIn, ModalCut, ModalUse } from "./warehouse/WarehouseModals";

export default function WarehousePage() {
  const [tab, setTab]             = useState<"raw" | "blanks">("raw");
  const [rawMat, setRawMat]       = useState<RawMaterial[]>(initRaw);
  const [blanks, setBlanks]       = useState<Blank[]>(initBlanks);
  const [movements, setMovements] = useState<Movement[]>(initMovements);
  const [modal, setModal]         = useState<ModalType>(null);
  const [search, setSearch]       = useState("");

  /* форма прихода */
  const [inRawId, setInRawId]   = useState(rawMat[0].id);
  const [inQty, setInQty]       = useState("");
  const [inOrder, setInOrder]   = useState("");

  /* форма нарезки */
  const [cutRawId, setCutRawId]     = useState(rawMat[0].id);
  const [cutBlankId, setCutBlankId] = useState(blanks[0].id);
  const [cutQty, setCutQty]         = useState("");
  const [cutCost, setCutCost]       = useState("");

  /* форма списания */
  const [useBlankId, setUseBlankId] = useState(blanks[0].id);
  const [useQty, setUseQty]         = useState("");
  const [useOrder, setUseOrder]     = useState("");

  /* ── действия ── */
  const handleIn = () => {
    const q = parseFloat(inQty);
    if (!q || q <= 0) return;
    const note = inOrder.trim() ? `Приход от поставщика · ${inOrder.trim()}` : "Приход от поставщика";
    setRawMat(prev => prev.map(r => r.id === inRawId ? { ...r, qty: +(r.qty + q).toFixed(2) } : r));
    setMovements(prev => [{ id: Date.now().toString(), date: "Сейчас", type: "in", qty: q, note, order: inOrder.trim() || undefined }, ...prev]);
    setInQty("");
    setInOrder("");
    setModal(null);
  };

  const handleCut = () => {
    const q = parseInt(cutQty);
    if (!q || q <= 0) return;
    const raw = rawMat.find(r => r.id === cutRawId)!;
    const blk = blanks.find(b => b.id === cutBlankId)!;
    const costPerBlank = parseFloat(cutCost) || 0;
    const totalRawUsed = +(costPerBlank > 0 ? costPerBlank * q / raw.price : q * 0.5).toFixed(2);
    if (raw.qty < totalRawUsed) { alert("Недостаточно сырья"); return; }
    setRawMat(prev => prev.map(r => r.id === cutRawId ? { ...r, qty: +(r.qty - totalRawUsed).toFixed(2) } : r));
    setBlanks(prev => prev.map(b => b.id === cutBlankId ? { ...b, qty: b.qty + q } : b));
    setMovements(prev => [{ id: Date.now().toString(), date: "Сейчас", type: "cut", qty: q, note: `Нарезка: ${blk.name} из ${raw.name}` }, ...prev]);
    setCutQty("");
    setCutCost("");
    setModal(null);
  };

  const handleUse = () => {
    const q = parseInt(useQty);
    if (!q || q <= 0) return;
    const blk = blanks.find(b => b.id === useBlankId)!;
    if (blk.qty < q) { alert("Недостаточно заготовок"); return; }
    setBlanks(prev => prev.map(b => b.id === useBlankId ? { ...b, qty: b.qty - q } : b));
    setMovements(prev => [{ id: Date.now().toString(), date: "Сейчас", type: "use", qty: q, note: "Списание на заказ", order: useOrder || undefined }, ...prev]);
    setUseQty("");
    setUseOrder("");
    setModal(null);
  };

  /* ── фильтры ── */
  const filteredRaw    = rawMat.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
  const filteredBlanks = blanks.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  /* ── блок "что закупить" ── */
  const toBuy = rawMat.filter(r => getLevelRaw(r) !== "ok");

  /* ── итоги ── */
  const totalRawValue  = rawMat.reduce((s, r) => s + r.qty * r.price, 0);
  const criticalRaw    = rawMat.filter(r => getLevelRaw(r) === "critical").length;
  const criticalBlanks = blanks.filter(b => getLevelBlank(b) === "critical").length;

  return (
    <div className="p-7 max-w-[1100px] mx-auto w-full space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[21px] font-semibold text-[#1a1a1a] tracking-tight">Склад</h1>
          <p className="text-[13px] text-[#9b9b9b] mt-0.5">{rawMat.length} видов сырья · {blanks.length} видов заготовок</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setModal("in")}
            className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[13px] px-4 py-2 rounded-[8px] hover:bg-[#333] transition-colors">
            <Icon name="ArrowDownToLine" size={14} />Приход
          </button>
          <button onClick={() => setModal("cut")}
            className="flex items-center gap-2 bg-[#6366f1] text-white text-[13px] px-4 py-2 rounded-[8px] hover:bg-[#5052cc] transition-colors">
            <Icon name="Scissors" size={14} />Нарезка
          </button>
          <button onClick={() => setModal("use")}
            className="flex items-center gap-2 bg-white border border-[#ebebeb] text-[#4b4b4b] text-[13px] px-4 py-2 rounded-[8px] hover:border-[#c5c5c5] transition-colors">
            <Icon name="ArrowUpFromLine" size={14} />Списание
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <MiniStat icon="Layers"        color="#6b6b6b" label="Видов сырья"       value={String(rawMat.length)} />
        <MiniStat icon="Package"       color="#6366f1" label="Видов заготовок"   value={String(blanks.length)} />
        <MiniStat icon="Banknote"      color="#16a34a" label="Стоимость сырья"   value={`${(totalRawValue / 1000).toFixed(0)} тыс. ₽`} />
        <MiniStat icon="AlertTriangle" color="#ef4444" label="Критичных позиций" value={String(criticalRaw + criticalBlanks)} alert={criticalRaw + criticalBlanks > 0} />
      </div>

      {/* Что закупить */}
      {toBuy.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="ShoppingCart" size={14} className="text-amber-600" />
            <span className="text-[13px] font-semibold text-amber-800">Что нужно закупить</span>
            <span className="text-[11px] bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-bold">{toBuy.length}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {toBuy.map(r => {
              const lv = getLevelRaw(r);
              const st = LEVEL_STYLE[lv];
              const needed = Math.max(0, r.min * 2 - r.qty);
              return (
                <div key={r.id} className="bg-white rounded-lg border border-amber-100 px-3 py-2.5 flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${st.dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#1a1a1a] truncate">{r.name}</p>
                    <p className="text-[11px] text-[#9b9b9b]">
                      Есть: <b className={lv === "critical" ? "text-red-500" : "text-amber-600"}>{r.qty} {r.unit}</b>
                      <span className="mx-1">·</span>Нужно докупить: <b>{needed.toFixed(1)} {r.unit}</b>
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[11px] font-semibold text-[#1a1a1a]">{(needed * r.price).toLocaleString("ru")} ₽</p>
                    <p className="text-[10px] text-[#b5b5b5]">~стоимость</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Вкладки */}
      <div className="flex items-center gap-3">
        <div className="flex gap-0.5 bg-[#f0f0f0] rounded-[8px] p-0.5">
          <TabBtn active={tab === "raw"}    onClick={() => setTab("raw")}    icon="Layers"  label="Сырьё"     count={criticalRaw} />
          <TabBtn active={tab === "blanks"} onClick={() => setTab("blanks")} icon="Package" label="Заготовки" count={criticalBlanks} />
        </div>
        <div className="relative flex-1 max-w-[240px]">
          <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5b5]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="w-full bg-white border border-[#ebebeb] rounded-[8px] pl-8 pr-3 py-2 text-[13px] placeholder:text-[#c5c5c5] outline-none focus:border-[#c0c0c0] transition-colors" />
        </div>
      </div>

      {/* Таблицы */}
      {tab === "raw"    && <RawTable    filteredRaw={filteredRaw} />}
      {tab === "blanks" && <BlanksTable filteredBlanks={filteredBlanks} rawMat={rawMat} />}

      {/* История движений */}
      <MovementHistory movements={movements} />

      {/* Модалки */}
      {modal === "in" && (
        <ModalIn
          rawMat={rawMat}
          inRawId={inRawId}   setInRawId={setInRawId}
          inQty={inQty}       setInQty={setInQty}
          inOrder={inOrder}   setInOrder={setInOrder}
          onConfirm={handleIn}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "cut" && (
        <ModalCut
          rawMat={rawMat} blanks={blanks}
          cutRawId={cutRawId}   setCutRawId={setCutRawId}
          cutBlankId={cutBlankId} setCutBlankId={setCutBlankId}
          cutQty={cutQty}       setCutQty={setCutQty}
          cutCost={cutCost}     setCutCost={setCutCost}
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
    </div>
  );
}