import Icon from "@/components/ui/icon";
import { RawMaterial, Blank, StockItem, ModalType } from "./warehouse.types";
import { MiniStat, TabBtn } from "./WarehouseModals";

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

      {/* ── Статы ── */}
      <div className="grid grid-cols-4 gap-3">

        {/* Сырьё — голубой */}
        <div className="col-span-1 bg-sky-50/70 border border-sky-100 rounded-2xl p-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-sky-400 px-1">Сырьё</p>
          <MiniStat icon="Layers"      color="#0ea5e9" label="Видов сырья"     value={String(rawMat.length)} />
          <MiniStat icon="SquareStack" color="#0ea5e9" label="Объём"           value={`${totalRawArea.toFixed(1)} м²`} />
          <MiniStat icon="Banknote"    color="#0ea5e9" label="Стоимость сырья" value={money(totalRawVal)} />
        </div>

        {/* Заготовки — фиолетовый */}
        <div className="col-span-1 bg-violet-50/70 border border-violet-100 rounded-2xl p-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 px-1">Заготовки</p>
          <MiniStat icon="Package"     color="#8b5cf6" label="Видов заготовок"    value={String(blanks.length)} />
          <MiniStat icon="Boxes"       color="#8b5cf6" label="Количество, шт."    value={String(totalBlankQty)} />
          <MiniStat icon="Coins"       color="#8b5cf6" label="Стоимость заготовок" value={money(totalBlankVal)} />
        </div>

        {/* В наличии — янтарный */}
        <div className="col-span-1 bg-amber-50/70 border border-amber-100 rounded-2xl p-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 px-1">В наличии</p>
          <MiniStat icon="ShoppingBag"     color="#f59e0b" label="Видов позиций"     value={String(stock.length)} />
          <MiniStat icon="PackageCheck"    color="#f59e0b" label="Количество, шт."   value={String(totalStockQty)} />
          <MiniStat icon="BadgeDollarSign" color="#f59e0b" label="Стоимость готовых" value={money(totalStockVal)} />
        </div>

        {/* Итог — серый */}
        <div className="col-span-1 bg-[#f4f4f4]/80 border border-[#e8e8e8] rounded-2xl p-3 flex flex-col justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#b5b5b5] px-1">Весь склад</p>
          <div className="flex-1 flex flex-col justify-center space-y-2 mt-2">
            <MiniStat icon="Wallet" color="#1a1a1a" label="Стоимость склада" value={money(totalWarehouseVal)} highlight />
          </div>
          <div className="mt-3 space-y-1 px-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-[#9b9b9b]">Сырьё</span>
              <span className="font-semibold text-sky-600">{money(totalRawVal)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#9b9b9b]">Заготовки</span>
              <span className="font-semibold text-violet-600">{money(totalBlankVal)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-[#9b9b9b]">В наличии</span>
              <span className="font-semibold text-amber-600">{money(totalStockVal)}</span>
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