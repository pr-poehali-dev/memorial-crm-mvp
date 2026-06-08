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
  totalStockQty: number;
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

export default function WarehouseHeader({
  rawMat, blanks, stock,
  totalRawVal, totalRawArea, totalBlankQty, totalBlankVal,
  totalStockQty, totalStockVal, totalWarehouseVal,
  criticalRaw, critBlanks,
  tab, search,
  onTabChange, onSearchChange, onModal, onShowAddMat, onShowAddBlank, onShowHistory,
}: Props) {
  return (
    <>
      {/* ── Шапка ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-[34px] font-bold text-[#1a1a1a] tracking-tight">Склад</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={onShowHistory}
            className="flex items-center gap-2 bg-white border border-[#ebebeb] text-[#4b4b4b] text-[13px] px-4 py-2 rounded-[8px] hover:border-[#c5c5c5] hover:bg-[#fafafa] transition-all"
          >
            <Icon name="History" size={14} />История
          </button>
          <button
            onClick={onShowAddMat}
            className="flex items-center gap-2 bg-white border border-[#ebebeb] text-[#4b4b4b] text-[13px] px-4 py-2 rounded-[8px] hover:border-[#c5c5c5] transition-colors"
          >
            <Icon name="Plus" size={14} />Материал
          </button>
          <button
            onClick={onShowAddBlank}
            className="flex items-center gap-2 bg-white border border-[#ebebeb] text-[#4b4b4b] text-[13px] px-4 py-2 rounded-[8px] hover:border-[#c5c5c5] transition-colors"
          >
            <Icon name="Plus" size={14} />Заготовка
          </button>
          <button
            onClick={() => onModal("in")}
            className="flex items-center gap-2 bg-[#1a1a1a] text-white text-[13px] px-4 py-2 rounded-[8px] hover:bg-[#333] transition-colors"
          >
            <Icon name="ArrowDownToLine" size={14} />Приход
          </button>
          <button
            onClick={() => onModal("cut")}
            className="flex items-center gap-2 bg-[#6366f1] text-white text-[13px] px-4 py-2 rounded-[8px] hover:bg-[#5052cc] transition-colors"
          >
            <Icon name="Scissors" size={14} />Нарезка
          </button>
          <button
            onClick={() => onModal("use")}
            className="flex items-center gap-2 bg-white border border-[#ebebeb] text-[#4b4b4b] text-[13px] px-4 py-2 rounded-[8px] hover:border-[#c5c5c5] transition-colors"
          >
            <Icon name="ArrowUpFromLine" size={14} />Списание
          </button>
        </div>
      </div>

      {/* ── Статы: 2 строки × 2 колонки ── */}
      <div className="grid grid-cols-2 gap-2.5">

        {/* Строка 1 левая: Сырьё */}
        <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center shrink-0">
            <Icon name="Layers" size={16} className="text-sky-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400 mb-1">Сырьё</p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-[15px] font-bold text-[#1a1a1a]">{rawMat.length} <span className="text-[11px] font-normal text-sky-400">видов</span></span>
              <span className="text-[15px] font-bold text-[#1a1a1a]">{totalRawArea.toFixed(1)} <span className="text-[11px] font-normal text-sky-400">м²</span></span>
              <span className="text-[13px] font-semibold text-sky-600 ml-auto">{money(totalRawVal)}</span>
            </div>
          </div>
        </div>

        {/* Строка 1 правая: Заготовки */}
        <div className="bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
            <Icon name="Package" size={16} className="text-violet-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-1">Заготовки</p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-[15px] font-bold text-[#1a1a1a]">{blanks.length} <span className="text-[11px] font-normal text-violet-400">видов</span></span>
              <span className="text-[15px] font-bold text-[#1a1a1a]">{totalBlankQty} <span className="text-[11px] font-normal text-violet-400">шт.</span></span>
              <span className="text-[13px] font-semibold text-violet-600 ml-auto">{money(totalBlankVal)}</span>
            </div>
          </div>
        </div>

        {/* Строка 2 левая: В наличии */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <Icon name="ShoppingBag" size={16} className="text-amber-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-1">В наличии</p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-[15px] font-bold text-[#1a1a1a]">{stock.length} <span className="text-[11px] font-normal text-amber-400">позиций</span></span>
              <span className="text-[15px] font-bold text-[#1a1a1a]">{totalStockQty} <span className="text-[11px] font-normal text-amber-400">шт.</span></span>
              <span className="text-[13px] font-semibold text-amber-600 ml-auto">{money(totalStockVal)}</span>
            </div>
          </div>
        </div>

        {/* Строка 2 правая: Весь склад */}
        <div className="bg-[#1a1a1a] rounded-xl px-4 py-3 flex items-center gap-4">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
            <Icon name="Wallet" size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Весь склад</p>
            <div className="flex items-center justify-between flex-wrap gap-1">
              <span className="text-[18px] font-bold text-white">{money(totalWarehouseVal)}</span>
              <div className="flex flex-col gap-0.5 text-[10px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                  <span className="text-white/40">Сырьё:</span>
                  <span className="text-sky-400 font-semibold">{money(totalRawVal)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                  <span className="text-white/40">Заготовки:</span>
                  <span className="text-violet-400 font-semibold">{money(totalBlankVal)}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-white/40">В наличии:</span>
                  <span className="text-amber-400 font-semibold">{money(totalStockVal)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Вкладки + поиск ── */}
      <div className="flex items-center gap-3">
        <div className="flex gap-0.5 bg-[#f0f0f0] rounded-[8px] p-0.5">
          <TabBtn active={tab === "raw"}    onClick={() => onTabChange("raw")}    icon="Layers"     label="Сырьё"     count={criticalRaw} />
          <TabBtn active={tab === "blanks"} onClick={() => onTabChange("blanks")} icon="Package"    label="Заготовки" count={critBlanks} />
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