import { useState } from "react";
import Icon from "@/components/ui/icon";

/* ─── Типы ─── */
type RawMaterial = {
  id: string;
  name: string;
  unit: string;
  qty: number;
  min: number;
  price: number;
};

type Blank = {
  id: string;
  name: string;
  size: string;
  materialId: string;
  qty: number;
  min: number;
};

type Movement = {
  id: string;
  date: string;
  type: "in" | "cut" | "use";
  qty: number;
  note: string;
  order?: string;
};

/* ─── Данные: сырьё ─── */
const initRaw: RawMaterial[] = [
  { id: "r1", name: "Гранит чёрный (габбро)", unit: "м²", qty: 14.5, min: 5,  price: 4200 },
  { id: "r2", name: "Гранит серый",           unit: "м²", qty: 7.2,  min: 5,  price: 3800 },
  { id: "r3", name: "Гранит красный",         unit: "м²", qty: 3.1,  min: 5,  price: 5100 },
  { id: "r4", name: "Мрамор белый",           unit: "м²", qty: 2.4,  min: 4,  price: 6500 },
  { id: "r5", name: "Мрамор серый",           unit: "м²", qty: 5.8,  min: 3,  price: 5800 },
];

/* ─── Данные: заготовки ─── */
const initBlanks: Blank[] = [
  { id: "b1", name: "Плита стандарт",    size: "100×50×8",  materialId: "r1", qty: 4, min: 2 },
  { id: "b2", name: "Плита большая",     size: "120×60×10", materialId: "r2", qty: 2, min: 1 },
  { id: "b3", name: "Плита малая",       size: "80×40×6",   materialId: "r4", qty: 1, min: 2 },
  { id: "b4", name: "Плита красный гран",size: "90×45×7",   materialId: "r3", qty: 0, min: 1 },
  { id: "b5", name: "Тумба",             size: "60×30×80",  materialId: "r1", qty: 3, min: 1 },
];

/* ─── История движений ─── */
const initMovements: Movement[] = [
  { id: "m1", date: "20 апр.", type: "use",  qty: 1,    note: "Списание",        order: "МП-0041" },
  { id: "m2", date: "18 апр.", type: "cut",  qty: 2,    note: "Нарезка заготовок" },
  { id: "m3", date: "15 апр.", type: "in",   qty: 5.0,  note: "Приход от поставщика" },
  { id: "m4", date: "10 апр.", type: "use",  qty: 1,    note: "Списание",        order: "МП-0038" },
  { id: "m5", date: "05 апр.", type: "cut",  qty: 3,    note: "Нарезка заготовок" },
];

/* ─── Вспомогалки ─── */
function getLevelRaw(r: RawMaterial): "critical" | "low" | "ok" {
  if (r.qty <= 0 || r.qty < r.min * 0.5) return "critical";
  if (r.qty <= r.min) return "low";
  return "ok";
}
function getLevelBlank(b: Blank): "critical" | "low" | "ok" {
  if (b.qty <= 0 || b.qty < b.min * 0.5) return "critical";
  if (b.qty <= b.min) return "low";
  return "ok";
}

const LEVEL_STYLE = {
  critical: { dot: "bg-red-400",    badge: "bg-red-100 text-red-600",    row: "bg-red-50",      bar: "#ef4444" },
  low:      { dot: "bg-amber-400",  badge: "bg-amber-100 text-amber-600",row: "bg-amber-50/60", bar: "#f59e0b" },
  ok:       { dot: "bg-green-400",  badge: "bg-green-100 text-green-700",row: "",               bar: "#22c55e" },
};

const MOVE_TYPE: Record<Movement["type"], { label: string; color: string; icon: string }> = {
  in:  { label: "Приход",   color: "#16a34a", icon: "ArrowDownToLine" },
  cut: { label: "Нарезка",  color: "#6366f1", icon: "Scissors" },
  use: { label: "Списание", color: "#ef4444", icon: "ArrowUpFromLine" },
};

/* ─── Модалки ─── */
type ModalType = "in" | "cut" | "use" | null;

/* ══════════════════════════════════════════════════════ */
export default function WarehousePage() {
  const [tab, setTab]       = useState<"raw" | "blanks">("raw");
  const [rawMat, setRawMat] = useState<RawMaterial[]>(initRaw);
  const [blanks, setBlanks] = useState<Blank[]>(initBlanks);
  const [movements, setMovements] = useState<Movement[]>(initMovements);
  const [modal, setModal]   = useState<ModalType>(null);
  const [search, setSearch] = useState("");

  /* форма прихода */
  const [inRawId, setInRawId]   = useState(rawMat[0].id);
  const [inQty, setInQty]       = useState("");

  /* форма нарезки */
  const [cutRawId, setCutRawId]       = useState(rawMat[0].id);
  const [cutBlankId, setCutBlankId]   = useState(blanks[0].id);
  const [cutQty, setCutQty]           = useState("");
  const [cutCost, setCutCost]         = useState("");

  /* форма списания */
  const [useBlankId, setUseBlankId]   = useState(blanks[0].id);
  const [useQty, setUseQty]           = useState("");
  const [useOrder, setUseOrder]       = useState("");

  /* ── действия ── */
  const handleIn = () => {
    const q = parseFloat(inQty);
    if (!q || q <= 0) return;
    setRawMat(prev => prev.map(r => r.id === inRawId ? { ...r, qty: +(r.qty + q).toFixed(2) } : r));
    setMovements(prev => [{ id: Date.now().toString(), date: "Сейчас", type: "in", qty: q, note: "Приход от поставщика" }, ...prev]);
    setInQty("");
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
  const totalRawValue   = rawMat.reduce((s, r) => s + r.qty * r.price, 0);
  const criticalRaw     = rawMat.filter(r => getLevelRaw(r) === "critical").length;
  const criticalBlanks  = blanks.filter(b => getLevelBlank(b) === "critical").length;

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
        <MiniStat icon="Layers"         color="#6b6b6b"  label="Видов сырья"       value={String(rawMat.length)} />
        <MiniStat icon="Package"        color="#6366f1"  label="Видов заготовок"   value={String(blanks.length)} />
        <MiniStat icon="Banknote"       color="#16a34a"  label="Стоимость сырья"   value={`${(totalRawValue/1000).toFixed(0)} тыс. ₽`} />
        <MiniStat icon="AlertTriangle"  color="#ef4444"  label="Критичных позиций" value={String(criticalRaw + criticalBlanks)} alert={criticalRaw + criticalBlanks > 0} />
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
          <TabBtn active={tab === "raw"}    onClick={() => setTab("raw")}    icon="Layers"  label="Сырьё"      count={criticalRaw} />
          <TabBtn active={tab === "blanks"} onClick={() => setTab("blanks")} icon="Package" label="Заготовки"  count={criticalBlanks} />
        </div>
        <div className="relative flex-1 max-w-[240px]">
          <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5b5]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="w-full bg-white border border-[#ebebeb] rounded-[8px] pl-8 pr-3 py-2 text-[13px] placeholder:text-[#c5c5c5] outline-none focus:border-[#c0c0c0] transition-colors" />
        </div>
      </div>

      {/* Вкладка: Сырьё */}
      {tab === "raw" && (
        <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f0f0f0]">
                {["Материал", "Ед.", "Остаток", "Мин. остаток", "Цена / ед.", "Стоимость", "Статус"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRaw.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-[13px] text-[#b5b5b5]">Ничего не найдено</td></tr>
              )}
              {filteredRaw.map((r, i) => {
                const lv = getLevelRaw(r);
                const st = LEVEL_STYLE[lv];
                const isLast = i === filteredRaw.length - 1;
                return (
                  <tr key={r.id} className={`${!isLast ? "border-b border-[#f5f5f5]" : ""} ${st.row} transition-colors`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                        <span className="text-[13px] font-medium text-[#1a1a1a]">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#6b6b6b]">{r.unit}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px] font-semibold text-[#1a1a1a]">{r.qty}</span>
                        <span className="text-[11px] text-[#9b9b9b]">{r.unit}</span>
                      </div>
                      {/* прогресс-бар */}
                      <div className="w-full h-1 bg-[#f0f0f0] rounded-full mt-1.5 max-w-[80px]">
                        <div className="h-1 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (r.qty / (r.min * 2)) * 100)}%`, backgroundColor: st.bar }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#9b9b9b] font-mono">{r.min} {r.unit}</td>
                    <td className="px-4 py-3 text-[12px] text-[#4b4b4b] font-mono">{r.price.toLocaleString("ru")} ₽</td>
                    <td className="px-4 py-3 text-[12px] font-semibold text-[#1a1a1a] font-mono">
                      {(r.qty * r.price).toLocaleString("ru")} ₽
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${st.badge}`}>
                        {lv === "ok" ? "В норме" : lv === "low" ? "Мало" : "Критично"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Вкладка: Заготовки */}
      {tab === "blanks" && (
        <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f0f0f0]">
                {["Заготовка", "Размер", "Материал", "Остаток", "Мин.", "Статус"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBlanks.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-[13px] text-[#b5b5b5]">Ничего не найдено</td></tr>
              )}
              {filteredBlanks.map((b, i) => {
                const lv   = getLevelBlank(b);
                const st   = LEVEL_STYLE[lv];
                const mat  = rawMat.find(r => r.id === b.materialId);
                const isLast = i === filteredBlanks.length - 1;
                return (
                  <tr key={b.id} className={`${!isLast ? "border-b border-[#f5f5f5]" : ""} ${st.row} transition-colors`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                        <span className="text-[13px] font-medium text-[#1a1a1a]">{b.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-[#6b6b6b]">{b.size}</td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] text-[#4b4b4b] bg-[#f5f5f5] px-2 py-0.5 rounded-md">{mat?.name ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[13px] font-semibold text-[#1a1a1a]">{b.qty}</span>
                        <span className="text-[11px] text-[#9b9b9b]">шт.</span>
                      </div>
                      <div className="w-full h-1 bg-[#f0f0f0] rounded-full mt-1.5 max-w-[60px]">
                        <div className="h-1 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (b.qty / (b.min * 2)) * 100)}%`, backgroundColor: st.bar }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#9b9b9b] font-mono">{b.min} шт.</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md ${st.badge}`}>
                        {lv === "ok" ? "В норме" : lv === "low" ? "Мало" : "Критично"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* История движений */}
      <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#f0f0f0] flex items-center gap-2">
          <Icon name="History" size={13} className="text-[#9b9b9b]" />
          <span className="text-[12px] font-semibold text-[#4b4b4b]">История движений</span>
        </div>
        <div className="divide-y divide-[#f5f5f5]">
          {movements.slice(0, 8).map(m => {
            const mt = MOVE_TYPE[m.type];
            return (
              <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: mt.color + "18" }}>
                  <Icon name={mt.icon as never} size={12} style={{ color: mt.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[12px] font-semibold" style={{ color: mt.color }}>{mt.label}</span>
                    <span className="text-[12px] text-[#1a1a1a]">{m.qty} ед.</span>
                    <span className="text-[12px] text-[#9b9b9b]">— {m.note}</span>
                    {m.order && (
                      <span className="text-[11px] bg-[#f5f5f5] text-[#6b6b6b] px-1.5 py-0.5 rounded font-mono">{m.order}</span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-[#b5b5b5] shrink-0">{m.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══ Модалка: Приход ═══ */}
      {modal === "in" && (
        <Modal title="Приход материала" icon="ArrowDownToLine" iconColor="#16a34a" onClose={() => setModal(null)}>
          <label className="block mb-1 text-[12px] text-[#6b6b6b]">Материал</label>
          <select value={inRawId} onChange={e => setInRawId(e.target.value)} className={selectCls}>
            {rawMat.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <label className="block mt-3 mb-1 text-[12px] text-[#6b6b6b]">
            Количество ({rawMat.find(r => r.id === inRawId)?.unit})
          </label>
          <input type="number" min="0.1" step="0.1" value={inQty} onChange={e => setInQty(e.target.value)}
            placeholder="0.0" className={inputCls} />
          {inRawId && inQty && (
            <p className="mt-2 text-[12px] text-[#6b6b6b]">
              Стоимость прихода: <b className="text-[#1a1a1a]">
                {(parseFloat(inQty) * (rawMat.find(r => r.id === inRawId)?.price ?? 0)).toLocaleString("ru")} ₽
              </b>
            </p>
          )}
          <button onClick={handleIn}
            className="mt-4 w-full bg-[#1a1a1a] text-white text-[13px] py-2.5 rounded-[8px] hover:bg-[#333] transition-colors">
            Оприходовать
          </button>
        </Modal>
      )}

      {/* ═══ Модалка: Нарезка ═══ */}
      {modal === "cut" && (
        <Modal title="Нарезка заготовок" icon="Scissors" iconColor="#6366f1" onClose={() => setModal(null)}>
          <label className="block mb-1 text-[12px] text-[#6b6b6b]">Сырьё для нарезки</label>
          <select value={cutRawId} onChange={e => setCutRawId(e.target.value)} className={selectCls}>
            {rawMat.map(r => (
              <option key={r.id} value={r.id}>{r.name} — {r.qty} {r.unit}</option>
            ))}
          </select>
          <label className="block mt-3 mb-1 text-[12px] text-[#6b6b6b]">Тип заготовки</label>
          <select value={cutBlankId} onChange={e => setCutBlankId(e.target.value)} className={selectCls}>
            {blanks.filter(b => b.materialId === cutRawId).map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.size})</option>
            ))}
            {blanks.filter(b => b.materialId === cutRawId).length === 0 &&
              blanks.map(b => <option key={b.id} value={b.id}>{b.name} ({b.size})</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block mb-1 text-[12px] text-[#6b6b6b]">Кол-во заготовок</label>
              <input type="number" min="1" step="1" value={cutQty} onChange={e => setCutQty(e.target.value)}
                placeholder="0" className={inputCls} />
            </div>
            <div>
              <label className="block mb-1 text-[12px] text-[#6b6b6b]">
                Расход сырья на штуку ({rawMat.find(r => r.id === cutRawId)?.unit})
              </label>
              <input type="number" min="0.01" step="0.01" value={cutCost} onChange={e => setCutCost(e.target.value)}
                placeholder="0.5" className={inputCls} />
            </div>
          </div>
          {cutQty && cutCost && (
            <div className="mt-2 bg-[#f5f5f5] rounded-lg px-3 py-2 text-[12px] text-[#6b6b6b]">
              Спишется сырья: <b className="text-[#1a1a1a]">{(parseFloat(cutCost) * parseInt(cutQty)).toFixed(2)} {rawMat.find(r => r.id === cutRawId)?.unit}</b>
            </div>
          )}
          <button onClick={handleCut}
            className="mt-4 w-full bg-[#6366f1] text-white text-[13px] py-2.5 rounded-[8px] hover:bg-[#5052cc] transition-colors">
            Создать заготовки
          </button>
        </Modal>
      )}

      {/* ═══ Модалка: Списание ═══ */}
      {modal === "use" && (
        <Modal title="Списание заготовки" icon="ArrowUpFromLine" iconColor="#ef4444" onClose={() => setModal(null)}>
          <label className="block mb-1 text-[12px] text-[#6b6b6b]">Заготовка</label>
          <select value={useBlankId} onChange={e => setUseBlankId(e.target.value)} className={selectCls}>
            {blanks.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.size}) — {b.qty} шт.</option>
            ))}
          </select>
          <label className="block mt-3 mb-1 text-[12px] text-[#6b6b6b]">Количество (шт.)</label>
          <input type="number" min="1" step="1" value={useQty} onChange={e => setUseQty(e.target.value)}
            placeholder="1" className={inputCls} />
          <label className="block mt-3 mb-1 text-[12px] text-[#6b6b6b]">Номер заказа (необязательно)</label>
          <input type="text" value={useOrder} onChange={e => setUseOrder(e.target.value)}
            placeholder="МП-0041" className={inputCls} />
          <button onClick={handleUse}
            className="mt-4 w-full bg-[#ef4444] text-white text-[13px] py-2.5 rounded-[8px] hover:bg-[#dc2626] transition-colors">
            Списать
          </button>
        </Modal>
      )}
    </div>
  );
}

/* ─── Вспомогательные компоненты ─── */
const selectCls = "w-full bg-white border border-[#ebebeb] rounded-[8px] px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-[#c0c0c0] transition-colors";
const inputCls  = "w-full bg-white border border-[#ebebeb] rounded-[8px] px-3 py-2 text-[13px] text-[#1a1a1a] outline-none focus:border-[#c0c0c0] transition-colors placeholder:text-[#c5c5c5]";

function TabBtn({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: string; label: string; count: number }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
        ${active ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}>
      <Icon name={icon as never} size={13} />
      {label}
      {count > 0 && (
        <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold">{count}</span>
      )}
    </button>
  );
}

function MiniStat({ icon, color, label, value, alert: isAlert }: { icon: string; color: string; label: string; value: string; alert?: boolean }) {
  return (
    <div className={`bg-white border rounded-xl px-4 py-3.5 flex items-center gap-3 ${isAlert ? "border-red-200 bg-red-50" : "border-[#ebebeb]"}`}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: color + "18" }}>
        <Icon name={icon as never} size={15} style={{ color }} />
      </div>
      <div>
        <p className="text-[17px] font-semibold text-[#1a1a1a] leading-none mb-0.5">{value}</p>
        <p className="text-[11px] text-[#9b9b9b]">{label}</p>
      </div>
    </div>
  );
}

function Modal({ title, icon, iconColor, onClose, children }: {
  title: string; icon: string; iconColor: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-fade-in"
      onClick={onClose}>
      <div className="bg-white rounded-2xl border border-[#ebebeb] shadow-2xl p-6 w-full max-w-[420px] animate-scale-in"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconColor + "18" }}>
              <Icon name={icon as never} size={15} style={{ color: iconColor }} />
            </div>
            <h2 className="text-[15px] font-semibold text-[#1a1a1a]">{title}</h2>
          </div>
          <button onClick={onClose} className="text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors">
            <Icon name="X" size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
