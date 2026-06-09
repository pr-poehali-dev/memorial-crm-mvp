import Icon from "@/components/ui/icon";
import { RawMaterial, Blank, StockItem, ModalType } from "./warehouse.types";
import { TabBtn } from "./WarehouseModals";

type Props = {
  rawMat: RawMaterial[];
  blanks: Blank[];
  stock: StockItem[];
  totalRawVal: number;
  totalRawArea: number;
  totalBlankQty: number;
  totalBlankVal: number;
  totalBlankSale: number;
  totalStockQty: number;
  totalStockCost: number;
  totalStockSale: number;
  totalStockVal: number;
  totalWarehouseVal: number;
  criticalRaw: number;
  critBlanks: number;
  tab: "raw" | "blanks" | "stock";
  search: string;
  onTabChange: (t: "raw" | "blanks" | "stock") => void;
  onSearchChange: (v: string) => void;
  onModal: (m: ModalType) => void;
  onShowAddMat: () => void;
  onShowAddBlank: () => void;
  onShowHistory: () => void;
};

function money(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млн ₽`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)} тыс. ₽`;
  return `${v.toLocaleString("ru")} ₽`;
}

/* Маленький лейбл маржи */
function MarginBadge({ cost, sale }: { cost: number; sale: number }) {
  if (!sale || !cost) return null;
  const profit = sale - cost;
  const pct = cost > 0 ? Math.round((profit / cost) * 100) : 0;
  const positive = profit >= 0;
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${positive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
      {positive ? "+" : ""}{money(profit)} / {pct}%
    </span>
  );
}

export default function WarehouseHeader({
  rawMat, blanks, stock,
  totalRawVal, totalRawArea,
  totalBlankQty, totalBlankVal, totalBlankSale,
  totalStockQty, totalStockCost, totalStockSale,
  totalWarehouseVal,
  criticalRaw, critBlanks,
  tab, search,
  onTabChange, onSearchChange, onModal, onShowAddMat, onShowAddBlank, onShowHistory,
}: Props) {

  /* Примерная маржа сырья: если оно пойдёт в изделия со средней наценкой заготовок */
  const blankMarginPct = totalBlankVal > 0 ? (totalBlankSale - totalBlankVal) / totalBlankVal : 0;
  const rawPotentialSale = totalRawVal * (1 + blankMarginPct);
  const rawProfit = rawPotentialSale - totalRawVal;

  return (
    <>
      {/* ── Шапка ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-[34px] font-bold text-[#1a1a1a] tracking-tight">Склад</h1>
        <div className="flex items-center gap-2">
          <button onClick={onShowHistory} className="flex items-center gap-2 bg-white border border-[#ebebeb] text-[#4b4b4b] text-[13px] px-4 py-2 rounded-[8px] hover:border-[#c5c5c5] hover:bg-[#fafafa] transition-all">
            <Icon name="History" size={14} />История
          </button>
          <button onClick={onShowAddMat} className="flex items-center gap-2 bg-white border border-[#ebebeb] text-[#4b4b4b] text-[13px] px-4 py-2 rounded-[8px] hover:border-[#c5c5c5] transition-colors">
            <Icon name="Plus" size={14} />Материал
          </button>
          <button onClick={onShowAddBlank} className="flex items-center gap-2 bg-white border border-[#ebebeb] text-[#4b4b4b] text-[13px] px-4 py-2 rounded-[8px] hover:border-[#c5c5c5] transition-colors">
            <Icon name="Plus" size={14} />Заготовка
          </button>
          <button onClick={() => onModal("in")} className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[13px] px-4 py-2 rounded-[8px] hover:bg-[#333] transition-colors">
            <Icon name="ArrowDownToLine" size={14} />Приход
          </button>
          <button onClick={() => onModal("cut")} className="flex items-center gap-2 bg-[#6366f1] text-white text-[13px] px-4 py-2 rounded-[8px] hover:bg-[#5052cc] transition-colors">
            <Icon name="Scissors" size={14} />Нарезка
          </button>
          <button onClick={() => onModal("use")} className="flex items-center gap-2 bg-white border border-[#ebebeb] text-[#4b4b4b] text-[13px] px-4 py-2 rounded-[8px] hover:border-[#c5c5c5] transition-colors">
            <Icon name="ArrowUpFromLine" size={14} />Списание
          </button>
        </div>
      </div>

      {/* ── Статы: 2×2 ── */}
      <div className="grid grid-cols-2 gap-2.5">

        {/* Сырьё */}
        <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
            <Icon name="Layers" size={16} className="text-sky-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400 mb-1">Сырьё</p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[15px] font-bold text-[#1a1a1a]">{rawMat.length} <span className="text-[11px] font-normal text-sky-400">видов</span></span>
              <span className="text-[15px] font-bold text-[#1a1a1a]">{totalRawArea.toFixed(1)} <span className="text-[11px] font-normal text-sky-400">м²</span></span>
              <span className="text-[13px] font-semibold text-sky-600 ml-auto">{money(totalRawVal)}</span>
            </div>
            {blankMarginPct > 0 && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="text-[10px] text-sky-400">Потенциальная прибыль:</span>
                <MarginBadge cost={totalRawVal} sale={rawPotentialSale} />
              </div>
            )}
          </div>
        </div>

        {/* Заготовки */}
        <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
            <Icon name="Package" size={16} className="text-violet-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-1">Заготовки</p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[15px] font-bold text-[#1a1a1a]">{blanks.length} <span className="text-[11px] font-normal text-violet-400">видов</span></span>
              <span className="text-[15px] font-bold text-[#1a1a1a]">{totalBlankQty} <span className="text-[11px] font-normal text-violet-400">шт.</span></span>
              <span className="text-[13px] font-semibold text-violet-600 ml-auto">{money(totalBlankVal)}</span>
            </div>
            {totalBlankSale > 0 && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="text-[10px] text-violet-400">Потенциальная прибыль:</span>
                <MarginBadge cost={totalBlankVal} sale={totalBlankSale} />
              </div>
            )}
          </div>
        </div>

        {/* В наличии */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <Icon name="ShoppingBag" size={16} className="text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-1">В наличии</p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[15px] font-bold text-[#1a1a1a]">{stock.length} <span className="text-[11px] font-normal text-amber-400">позиций</span></span>
              <span className="text-[15px] font-bold text-[#1a1a1a]">{totalStockQty} <span className="text-[11px] font-normal text-amber-400">шт.</span></span>
            </div>
            <div className="mt-1.5 flex items-center gap-3 flex-wrap">
              <span className="text-[11px] text-amber-500">Себест.: <b className="text-[#1a1a1a]">{money(totalStockCost)}</b></span>
              <span className="text-[11px] text-amber-500">Продажа: <b className="text-[#1a1a1a]">{money(totalStockSale)}</b></span>
              {totalStockSale > 0 && <MarginBadge cost={totalStockCost} sale={totalStockSale} />}
            </div>
          </div>
        </div>

        {/* Весь склад */}
        <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <Icon name="Wallet" size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Весь склад (себестоимость)</p>
            <span className="text-[20px] font-bold text-white">{money(totalWarehouseVal)}</span>
          </div>
        </div>

      </div>

      {/* ── Вкладки + поиск ── */}
      <div className="flex items-center gap-3">
        <div className="flex gap-0.5 bg-[#f0f0f0] rounded-[8px] p-0.5">
          <TabBtn active={tab === "raw"}    onClick={() => onTabChange("raw")}    icon="Layers"      label="Сырьё"     count={criticalRaw} />
          <TabBtn active={tab === "blanks"} onClick={() => onTabChange("blanks")} icon="Package"     label="Заготовки" count={critBlanks} />
          <TabBtn active={tab === "stock"}  onClick={() => onTabChange("stock")}  icon="ShoppingBag" label="В наличии" count={0} />
        </div>
        <div className="relative flex-1 max-w-[240px]">
          <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5b5]" />
          <input
            value={search} onChange={e => onSearchChange(e.target.value)}
            placeholder="Поиск..."
            className="w-full bg-white border border-[#ebebeb] rounded-[8px] pl-8 pr-3 py-2 text-[13px] placeholder:text-[#c5c5c5] outline-none focus:border-[#c0c0c0] transition-colors"
          />
        </div>
      </div>
    </>
  );
}
