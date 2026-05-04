import { useState, useMemo, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { LineItem, uid } from "./estimate.types";
import { warehouseApi } from "@/api/client";

type Props = {
  onClose: () => void;
  onAdd: (item: LineItem) => void;
};

type Material = { id: string; label: string; priceM2: number; costM2: number; stock: number };

const SHAPES = [
  { id: "straight", label: "Прямая",    coef: 1.0  },
  { id: "arch",     label: "Арка",      coef: 1.15 },
  { id: "wave",     label: "Волна",     coef: 1.2  },
  { id: "complex",  label: "Сложная",   coef: 1.35 },
];

const POLISHING = [
  { id: "front",    label: "Лицевая",        cost: 1200 },
  { id: "two",      label: "2 стороны",      cost: 2100 },
  { id: "full",     label: "Полная",         cost: 3400 },
];

const ENGRAVING = [
  { id: "none",     label: "Без гравировки", price: 0,    cost: 0    },
  { id: "name",     label: "ФИО",            price: 3500, cost: 1500 },
  { id: "epitaph",  label: "ФИО + эпитафия", price: 5500, cost: 2200 },
];

const PORTRAIT = [
  { id: "none",     label: "Без портрета",   price: 0,    cost: 0    },
  { id: "simple",   label: "Простой",        price: 4500, cost: 2000 },
  { id: "detailed", label: "Детальный",      price: 7000, cost: 3200 },
];

const MARGIN_PRESETS = [
  { id: "econom",   label: "Эконом",    pct: 30 },
  { id: "standard", label: "Стандарт",  pct: 45 },
  { id: "premium",  label: "Премиум",   pct: 60 },
  { id: "manual",   label: "Вручную",   pct: 0  },
];

export default function StoneCalculator({ onClose, onAdd }: Props) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [material,  setMaterial]  = useState("");
  const [height,    setHeight]    = useState(100);
  const [width,     setWidth]     = useState(50);
  const [thickness, setThickness] = useState(8);
  const [shape,     setShape]     = useState(SHAPES[0].id);
  const [polishing, setPolishing] = useState(POLISHING[0].id);
  const [engraving, setEngraving] = useState(ENGRAVING[0].id);
  const [portrait,  setPortrait]  = useState(PORTRAIT[0].id);
  const [marginPreset, setMarginPreset] = useState(MARGIN_PRESETS[1].id);
  const [manualMargin, setManualMargin] = useState(45);

  useEffect(() => {
    warehouseApi.materials().then(rows => {
      const mats = rows.map(r => ({
        id:      String(r.id),
        label:   r.name,
        priceM2: r.price * 2,
        costM2:  r.price,
        stock:   Number(r.qty),
      }));
      setMaterials(mats);
      if (mats.length > 0) setMaterial(mats[0].id);
    }).catch(console.error);
  }, []);

  const mat   = materials.find(m => m.id === material) ?? { id: "", label: "", priceM2: 0, costM2: 0, stock: 0 };;
  const shp   = SHAPES.find(s => s.id === shape)!;
  const pol   = POLISHING.find(p => p.id === polishing)!;
  const engr  = ENGRAVING.find(e => e.id === engraving)!;
  const port  = PORTRAIT.find(p => p.id === portrait)!;
  const mPreset = MARGIN_PRESETS.find(m => m.id === marginPreset)!;

  const marginPct = marginPreset === "manual" ? manualMargin : mPreset.pct;

  const calc = useMemo(() => {
    const area     = (height / 100) * (width / 100);
    const areaCoef = area * shp.coef;

    const costStone     = areaCoef * mat.costM2;
    const costPolishing = pol.cost;
    const costEngraving = engr.cost;
    const costPortrait  = port.cost;
    const costWork      = 3500;
    const totalCost     = costStone + costPolishing + costEngraving + costPortrait + costWork;

    const price = marginPct > 0 ? Math.round(totalCost / (1 - marginPct / 100) / 100) * 100 : totalCost;
    const profit  = price - totalCost;
    const actualMarginPct = price > 0 ? Math.round((profit / price) * 100) : 0;

    const warehouseQty = mat.stock ?? 0;
    const available    = +(warehouseQty - areaCoef).toFixed(2);
    const hasStock     = available >= 0;

    return {
      area: +area.toFixed(3),
      areaCoef: +areaCoef.toFixed(3),
      costStone: Math.round(costStone),
      costPolishing,
      costEngraving: engr.price,
      costPortrait: port.price,
      costWork,
      totalCost: Math.round(totalCost),
      price: Math.round(price),
      profit: Math.round(profit),
      marginPct: actualMarginPct,
      available: +available.toFixed(2),
      hasStock,
    };
  }, [height, width, mat, shp, pol, engr, port, marginPct]);

  const handleAdd = () => {
    const shapeName    = shp.label.toLowerCase();
    const matName      = mat.label;
    const note         = `${matName} • ${height}×${width}×${thickness} см • ${shapeName}`;
    onAdd({
      id: uid(),
      name: "Стела (индивидуальный расчёт)",
      category: "stone",
      qty: 1,
      unit: "шт.",
      price: calc.price,
      cost: calc.totalCost,
      status: "calculated",
      author: "Дмитрий С.",
      locked: false,
      note,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)" }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[860px] max-h-[90vh] overflow-hidden flex flex-col">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#f5f5f5] rounded-lg flex items-center justify-center">
              <Icon name="Calculator" size={14} className="text-[#6b6b6b]" />
            </div>
            <span className="text-[15px] font-semibold text-[#1a1a1a]">Расчёт стелы</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f5f5f5] text-[#9b9b9b] hover:text-[#1a1a1a] transition-all">
            <Icon name="X" size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* ─── Параметры (слева) ─── */}
          <div className="w-[340px] shrink-0 border-r border-[#f0f0f0] overflow-y-auto px-5 py-5 flex flex-col gap-4">

            <Section label="Материал">
              <select value={material} onChange={e => setMaterial(e.target.value)} className={selectCls}
                disabled={materials.length === 0}>
                {materials.length === 0
                  ? <option>Загрузка...</option>
                  : materials.map(m => <option key={m.id} value={m.id}>{m.label}</option>)
                }
              </select>
            </Section>

            <Section label="Размеры (см)">
              <div className="grid grid-cols-3 gap-2">
                {([["Высота", height, setHeight], ["Ширина", width, setWidth], ["Толщина", thickness, setThickness]] as [string, number, (v: number) => void][]).map(([lbl, val, set]) => (
                  <div key={lbl}>
                    <p className="text-[10px] text-[#9b9b9b] mb-1">{lbl}</p>
                    <input type="number" min={1} value={val}
                      onChange={e => set(Number(e.target.value))}
                      className={inputCls} />
                  </div>
                ))}
              </div>
            </Section>

            <Section label="Форма">
              <div className="grid grid-cols-2 gap-1.5">
                {SHAPES.map(s => (
                  <button key={s.id} onClick={() => setShape(s.id)}
                    className={`text-[12px] px-3 py-2 rounded-lg border transition-all text-left
                      ${shape === s.id ? "border-[#1a1a1a] bg-[#1a1a1a] text-white" : "border-[#e8e8e8] text-[#4a4a4a] hover:border-[#c8c8c8]"}`}>
                    {s.label}
                    <span className={`text-[10px] ml-1 ${shape === s.id ? "text-white/60" : "text-[#9b9b9b]"}`}>×{s.coef}</span>
                  </button>
                ))}
              </div>
            </Section>

            <Section label="Полировка">
              <div className="flex flex-col gap-1.5">
                {POLISHING.map(p => (
                  <button key={p.id} onClick={() => setPolishing(p.id)}
                    className={`flex items-center justify-between text-[12px] px-3 py-2 rounded-lg border transition-all
                      ${polishing === p.id ? "border-[#1a1a1a] bg-[#1a1a1a] text-white" : "border-[#e8e8e8] text-[#4a4a4a] hover:border-[#c8c8c8]"}`}>
                    <span>{p.label}</span>
                    <span className={`text-[10px] ${polishing === p.id ? "text-white/60" : "text-[#9b9b9b]"}`}>+{p.cost.toLocaleString("ru")} ₽</span>
                  </button>
                ))}
              </div>
            </Section>

            <Section label="Гравировка">
              <div className="flex flex-col gap-1.5">
                {ENGRAVING.map(e => (
                  <button key={e.id} onClick={() => setEngraving(e.id)}
                    className={`flex items-center justify-between text-[12px] px-3 py-2 rounded-lg border transition-all
                      ${engraving === e.id ? "border-[#1a1a1a] bg-[#1a1a1a] text-white" : "border-[#e8e8e8] text-[#4a4a4a] hover:border-[#c8c8c8]"}`}>
                    <span>{e.label}</span>
                    {e.price > 0 && <span className={`text-[10px] ${engraving === e.id ? "text-white/60" : "text-[#9b9b9b]"}`}>+{e.price.toLocaleString("ru")} ₽</span>}
                  </button>
                ))}
              </div>
            </Section>

            <Section label="Портрет">
              <div className="flex flex-col gap-1.5">
                {PORTRAIT.map(p => (
                  <button key={p.id} onClick={() => setPortrait(p.id)}
                    className={`flex items-center justify-between text-[12px] px-3 py-2 rounded-lg border transition-all
                      ${portrait === p.id ? "border-[#1a1a1a] bg-[#1a1a1a] text-white" : "border-[#e8e8e8] text-[#4a4a4a] hover:border-[#c8c8c8]"}`}>
                    <span>{p.label}</span>
                    {p.price > 0 && <span className={`text-[10px] ${portrait === p.id ? "text-white/60" : "text-[#9b9b9b]"}`}>+{p.price.toLocaleString("ru")} ₽</span>}
                  </button>
                ))}
              </div>
            </Section>

            <Section label="Маржа">
              <div className="grid grid-cols-2 gap-1.5">
                {MARGIN_PRESETS.map(m => (
                  <button key={m.id} onClick={() => setMarginPreset(m.id)}
                    className={`text-[12px] px-3 py-2 rounded-lg border transition-all text-left
                      ${marginPreset === m.id ? "border-[#1a1a1a] bg-[#1a1a1a] text-white" : "border-[#e8e8e8] text-[#4a4a4a] hover:border-[#c8c8c8]"}`}>
                    {m.label}
                    {m.pct > 0 && <span className={`text-[10px] ml-1 ${marginPreset === m.id ? "text-white/60" : "text-[#9b9b9b]"}`}>{m.pct}%</span>}
                  </button>
                ))}
              </div>
              {marginPreset === "manual" && (
                <div className="flex items-center gap-2 mt-2">
                  <input type="number" min={0} max={90} value={manualMargin}
                    onChange={e => setManualMargin(Number(e.target.value))}
                    className={inputCls + " w-20"} />
                  <span className="text-[13px] text-[#6b6b6b]">%</span>
                </div>
              )}
            </Section>
          </div>

          {/* ─── Результат (справа) ─── */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">

            {/* Расход материала */}
            <ResultBlock title="Расход материала">
              <Row label="Площадь" value={`${calc.area} м²`} />
              <Row label="Коэффициент формы" value={`×${shp.coef}`} dim />
              <Row label="Итоговый расход" value={`${calc.areaCoef} м²`} bold />
            </ResultBlock>

            {/* Склад */}
            <ResultBlock title="Склад · Проверка">
              <Row label={`${mat.label} на складе`} value={`${mat.stock ?? 0} м²`} />
              <Row label="Требуется для заказа" value={`${calc.areaCoef} м²`} />
              <Row label="Останется после" value={`${calc.available} м²`} dim />
              <div className={`flex items-center gap-2 mt-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold
                ${calc.hasStock
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-600 border border-red-200"}`}>
                <Icon name={calc.hasStock ? "CheckCircle2" : "AlertTriangle"} size={13} />
                {calc.hasStock
                  ? `Материала хватает (запас ${calc.available} м²)`
                  : `Не хватает ${Math.abs(calc.available)} м² — нужен заказ`}
              </div>
            </ResultBlock>

            {/* Себестоимость */}
            <ResultBlock title="Себестоимость">
              <Row label="Камень" value={`${calc.costStone.toLocaleString("ru")} ₽`} />
              <Row label="Обработка / полировка" value={`${calc.costPolishing.toLocaleString("ru")} ₽`} dim />
              <Row label="Гравировка" value={`${engr.cost.toLocaleString("ru")} ₽`} dim />
              <Row label="Портрет" value={`${port.cost.toLocaleString("ru")} ₽`} dim />
              <Row label="Работа" value={`${calc.costWork.toLocaleString("ru")} ₽`} dim />
              <div className="border-t border-[#f0f0f0] mt-2 pt-2">
                <Row label="Итого себестоимость" value={`${calc.totalCost.toLocaleString("ru")} ₽`} bold />
              </div>
            </ResultBlock>

            {/* Цена */}
            <ResultBlock title="Цена продажи">
              <Row label="Цена" value={`${calc.price.toLocaleString("ru")} ₽`} bold large />
              <Row label="Прибыль" value={`${calc.profit.toLocaleString("ru")} ₽`}
                valueColor={calc.profit > 0 ? "#16a34a" : "#ef4444"} />
              <Row label="Маржа" value={`${calc.marginPct}%`}
                valueColor={calc.marginPct >= 40 ? "#16a34a" : calc.marginPct >= 25 ? "#d97706" : "#ef4444"} />
            </ResultBlock>

            <div className="mt-auto pt-2">
              <button
                onClick={handleAdd}
                className="w-full flex items-center justify-center gap-2 bg-[#1a1a1a] text-white text-[14px] font-semibold py-3 rounded-[10px] hover:bg-[#333] transition-all hover:scale-[1.01] active:scale-[0.99]">
                <Icon name="PlusCircle" size={15} />
                Добавить в смету
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-[#9b9b9b] uppercase tracking-[0.08em] mb-2">{label}</p>
      {children}
    </div>
  );
}

function ResultBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#fafafa] border border-[#f0f0f0] rounded-xl p-4">
      <p className="text-[11px] font-semibold text-[#9b9b9b] uppercase tracking-[0.08em] mb-3">{title}</p>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value, dim, bold, large, valueColor }: {
  label: string; value: string; dim?: boolean; bold?: boolean; large?: boolean; valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[12px] ${dim ? "text-[#9b9b9b]" : "text-[#4a4a4a]"}`}>{label}</span>
      <span className={`font-mono ${large ? "text-[16px]" : "text-[12px]"} ${bold ? "font-bold text-[#1a1a1a]" : "font-medium text-[#6b6b6b]"}`}
        style={valueColor ? { color: valueColor } : undefined}>
        {value}
      </span>
    </div>
  );
}

const selectCls = "w-full text-[13px] text-[#1a1a1a] bg-white border border-[#e8e8e8] rounded-lg px-3 py-2 outline-none focus:border-[#1a1a1a] transition-colors cursor-pointer";
const inputCls  = "w-full text-[13px] font-mono text-[#1a1a1a] bg-white border border-[#e8e8e8] rounded-lg px-3 py-2 outline-none focus:border-[#1a1a1a] transition-colors";