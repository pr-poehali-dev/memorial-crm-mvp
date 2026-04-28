import Icon from "@/components/ui/icon";
import { RawMaterial, Blank, getLevelRaw, selectCls, inputCls } from "./warehouse.types";

/* ─── Shared: Modal wrapper ─── */
export function Modal({ title, icon, iconColor, onClose, children }: {
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

/* ─── Shared: MiniStat ─── */
export function MiniStat({ icon, color, label, value, alert: isAlert }: {
  icon: string; color: string; label: string; value: string; alert?: boolean;
}) {
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

/* ─── Shared: TabBtn ─── */
export function TabBtn({ active, onClick, icon, label, count }: {
  active: boolean; onClick: () => void; icon: string; label: string; count: number;
}) {
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

/* ─── Модалка: Приход ─── */
export type ModalInMode = "existing" | "new";

type ModalInProps = {
  rawMat: RawMaterial[];
  mode: ModalInMode;
  setMode: (v: ModalInMode) => void;
  inRawId: string;
  setInRawId: (v: string) => void;
  inQty: string;
  setInQty: (v: string) => void;
  inName: string;
  setInName: (v: string) => void;
  inUnit: string;
  setInUnit: (v: string) => void;
  inMin: string;
  setInMin: (v: string) => void;
  inPrice: string;
  setInPrice: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function ModalIn({
  rawMat, mode, setMode,
  inRawId, setInRawId, inQty, setInQty,
  inName, setInName, inUnit, setInUnit, inMin, setInMin, inPrice, setInPrice,
  onConfirm, onClose,
}: ModalInProps) {
  const selectedRaw = rawMat.find(r => r.id === inRawId);

  return (
    <Modal title="Приход материала" icon="ArrowDownToLine" iconColor="#16a34a" onClose={onClose}>

      {/* Переключатель режима */}
      <div className="flex gap-0.5 bg-[#f0f0f0] rounded-[8px] p-0.5 mb-4">
        <button
          onClick={() => setMode("existing")}
          className={`flex-1 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
            ${mode === "existing" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
        >
          Существующий
        </button>
        <button
          onClick={() => setMode("new")}
          className={`flex-1 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
            ${mode === "new" ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
        >
          Новый материал
        </button>
      </div>

      {mode === "existing" ? (
        <>
          <label className="block mb-1 text-[12px] text-[#6b6b6b]">Материал</label>
          <select value={inRawId} onChange={e => setInRawId(e.target.value)} className={selectCls}>
            {rawMat.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <label className="block mt-3 mb-1 text-[12px] text-[#6b6b6b]">
            Количество ({selectedRaw?.unit ?? "ед."})
          </label>
          <input type="number" min="0.1" step="0.1" value={inQty} onChange={e => setInQty(e.target.value)}
            placeholder="0.0" className={inputCls} />
          {inQty && selectedRaw && (
            <p className="mt-2 text-[12px] text-[#6b6b6b]">
              Стоимость прихода: <b className="text-[#1a1a1a]">
                {(parseFloat(inQty) * selectedRaw.price).toLocaleString("ru")} ₽
              </b>
            </p>
          )}
        </>
      ) : (
        <>
          <label className="block mb-1 text-[12px] text-[#6b6b6b]">Наименование</label>
          <input value={inName} onChange={e => setInName(e.target.value)}
            placeholder="Гранит чёрный (габбро)" className={inputCls} />

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block mb-1 text-[12px] text-[#6b6b6b]">Единица измерения</label>
              <select value={inUnit} onChange={e => setInUnit(e.target.value)} className={selectCls}>
                <option>м²</option>
                <option>м³</option>
                <option>шт.</option>
                <option>кг</option>
                <option>л</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-[12px] text-[#6b6b6b]">Количество</label>
              <input type="number" min="0.1" step="0.1" value={inQty} onChange={e => setInQty(e.target.value)}
                placeholder="0.0" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block mb-1 text-[12px] text-[#6b6b6b]">Мин. остаток</label>
              <input type="number" min="0" step="0.1" value={inMin} onChange={e => setInMin(e.target.value)}
                placeholder="5" className={inputCls} />
            </div>
            <div>
              <label className="block mb-1 text-[12px] text-[#6b6b6b]">Цена за ед., ₽</label>
              <input type="number" min="0" step="1" value={inPrice} onChange={e => setInPrice(e.target.value)}
                placeholder="4200" className={inputCls} />
            </div>
          </div>
        </>
      )}

      <button onClick={onConfirm}
        className="mt-4 w-full bg-[#1a1a1a] text-white text-[13px] py-2.5 rounded-[8px] hover:bg-[#333] transition-colors">
        Оприходовать
      </button>
    </Modal>
  );
}

/* ─── Модалка: Нарезка ─── */
type ModalCutProps = {
  rawMat: RawMaterial[];
  blanks: Blank[];
  cutRawId: string;
  setCutRawId: (v: string) => void;
  cutBlankId: string;
  setCutBlankId: (v: string) => void;
  cutQty: string;
  setCutQty: (v: string) => void;
  cutCost: string;
  setCutCost: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function ModalCut({
  rawMat, blanks, cutRawId, setCutRawId, cutBlankId, setCutBlankId,
  cutQty, setCutQty, cutCost, setCutCost, onConfirm, onClose,
}: ModalCutProps) {
  const relatedBlanks = blanks.filter(b => b.materialId === cutRawId);
  const displayBlanks = relatedBlanks.length > 0 ? relatedBlanks : blanks;

  return (
    <Modal title="Нарезка заготовок" icon="Scissors" iconColor="#6366f1" onClose={onClose}>
      <label className="block mb-1 text-[12px] text-[#6b6b6b]">Сырьё для нарезки</label>
      <select value={cutRawId} onChange={e => setCutRawId(e.target.value)} className={selectCls}>
        {rawMat.map(r => (
          <option key={r.id} value={r.id}>{r.name} — {r.qty} {r.unit}</option>
        ))}
      </select>
      <label className="block mt-3 mb-1 text-[12px] text-[#6b6b6b]">Тип заготовки</label>
      <select value={cutBlankId} onChange={e => setCutBlankId(e.target.value)} className={selectCls}>
        {displayBlanks.map(b => (
          <option key={b.id} value={b.id}>{b.name} ({b.size})</option>
        ))}
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
      <button onClick={onConfirm}
        className="mt-4 w-full bg-[#6366f1] text-white text-[13px] py-2.5 rounded-[8px] hover:bg-[#5052cc] transition-colors">
        Создать заготовки
      </button>
    </Modal>
  );
}

/* ─── Модалка: Списание ─── */
type ModalUseProps = {
  blanks: Blank[];
  useBlankId: string;
  setUseBlankId: (v: string) => void;
  useQty: string;
  setUseQty: (v: string) => void;
  useOrder: string;
  setUseOrder: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function ModalUse({ blanks, useBlankId, setUseBlankId, useQty, setUseQty, useOrder, setUseOrder, onConfirm, onClose }: ModalUseProps) {
  return (
    <Modal title="Списание заготовки" icon="ArrowUpFromLine" iconColor="#ef4444" onClose={onClose}>
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
      <button onClick={onConfirm}
        className="mt-4 w-full bg-[#ef4444] text-white text-[13px] py-2.5 rounded-[8px] hover:bg-[#dc2626] transition-colors">
        Списать
      </button>
    </Modal>
  );
}