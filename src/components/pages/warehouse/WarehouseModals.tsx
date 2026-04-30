import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import {
  RawMaterial, Blank, Movement,
  calcRawPerUnit, selectCls, inputCls,
  MOVE_TYPE, LEVEL_STYLE, getLevelRaw,
} from "./warehouse.types";

/* ── Сегодняшняя дата ── */
const todayStr = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

/* ════════════════════════════════════════
   Shared: обёртка модалки
════════════════════════════════════════ */
export function Modal({
  title, icon, iconColor, onClose, children, wide = false,
}: {
  title: string; icon: string; iconColor: string;
  onClose: () => void; children: React.ReactNode; wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl border border-[#ebebeb] shadow-2xl p-6 w-full ${wide ? "max-w-[720px]" : "max-w-[440px]"}`}
        onClick={e => e.stopPropagation()}
      >
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

/* ── MiniStat ── */
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

/* ── TabBtn ── */
export function TabBtn({ active, onClick, icon, label, count }: {
  active: boolean; onClick: () => void; icon: string; label: string; count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all
        ${active ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"}`}
    >
      <Icon name={icon as never} size={13} />
      {label}
      {count > 0 && (
        <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold">{count}</span>
      )}
    </button>
  );
}

/* ─── Поле-ярлык ─── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mb-1 text-[12px] text-[#6b6b6b]">{label}</label>
      {children}
    </div>
  );
}

/* ─── Серая подсказка-строка ─── */
function InfoRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f7f7f7] border border-[#efefef] rounded-lg px-3 py-2 text-[12px] text-[#6b6b6b]">
      {children}
    </div>
  );
}

/* ════════════════════════════════════════
   Модалка: Приход материала
════════════════════════════════════════ */
type ModalInProps = {
  rawMat: RawMaterial[];
  inRawId: string;          setInRawId: (v: string) => void;
  inQty: string;            setInQty: (v: string) => void;
  inReceiptId: string;      setInReceiptId: (v: string) => void;
  inPrice: string;          setInPrice: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function ModalIn({
  rawMat, inRawId, setInRawId, inQty, setInQty,
  inReceiptId, setInReceiptId, inPrice, setInPrice,
  onConfirm, onClose,
}: ModalInProps) {
  const raw = rawMat.find(r => r.id === inRawId);
  const qty = parseFloat(inQty) || 0;
  const price = parseFloat(inPrice) || (raw?.price ?? 0);
  const total = qty * price;

  return (
    <Modal title="Приход материала" icon="ArrowDownToLine" iconColor="#16a34a" onClose={onClose}>
      <div className="space-y-3">

        <Field label="Наименование сырья">
          <select value={inRawId} onChange={e => setInRawId(e.target.value)} className={selectCls}>
            {rawMat.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </Field>

        <Field label={`Количество (${raw?.unit ?? "м²"})`}>
          <input
            type="number" min="0.1" step="0.1" value={inQty}
            onChange={e => setInQty(e.target.value)}
            placeholder="0.0" className={inputCls}
          />
        </Field>

        <Field label="ID прихода / номер камня">
          <input
            value={inReceiptId} onChange={e => setInReceiptId(e.target.value)}
            placeholder="Например: КР-0041" className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Дата прихода">
            <div className={`${inputCls} bg-[#f8f8f8] text-[#9b9b9b] cursor-default`}>
              {todayStr}
            </div>
          </Field>
          <Field label="Цена за ед. (₽)">
            <input
              type="number" min="0" step="1" value={inPrice}
              onChange={e => setInPrice(e.target.value)}
              placeholder={String(raw?.price ?? "")} className={inputCls}
            />
          </Field>
        </div>

        {qty > 0 && (
          <InfoRow>
            Итого: <b className="text-[#1a1a1a]">{qty} {raw?.unit}</b>
            {" · "}Стоимость: <b className="text-[#1a1a1a]">{total.toLocaleString("ru")} ₽</b>
            {" · "}Новый остаток: <b className="text-[#1a1a1a]">{((raw?.qty ?? 0) + qty).toFixed(2)} {raw?.unit}</b>
          </InfoRow>
        )}

        <button
          onClick={onConfirm}
          className="w-full bg-[#1a1a1a] text-white text-[13px] py-2.5 rounded-[8px] hover:bg-[#333] transition-colors"
        >
          Оприходовать
        </button>
      </div>
    </Modal>
  );
}

/* ════════════════════════════════════════
   Модалка: Нарезка заготовок
════════════════════════════════════════ */
type ModalCutProps = {
  rawMat: RawMaterial[];
  blanks: Blank[];
  cutRawId: string;    setCutRawId: (v: string) => void;
  cutBlankId: string;  setCutBlankId: (v: string) => void;
  cutQty: string;      setCutQty: (v: string) => void;
  cutRawPer: string;   setCutRawPer: (v: string) => void;
  cutDeadline: string; setCutDeadline: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function ModalCut({
  rawMat, blanks,
  cutRawId, setCutRawId, cutBlankId, setCutBlankId,
  cutQty, setCutQty, cutRawPer, setCutRawPer,
  cutDeadline, setCutDeadline,
  onConfirm, onClose,
}: ModalCutProps) {
  const raw   = rawMat.find(r => r.id === cutRawId);
  const blank = blanks.find(b => b.id === cutBlankId);
  const qty   = parseInt(cutQty) || 0;
  const perUnit = parseFloat(cutRawPer) || 0;
  const totalRaw = +(qty * perUnit).toFixed(2);
  const notEnough = raw ? totalRaw > raw.qty : false;

  /* При смене заготовки пересчитать авторасход */
  useEffect(() => {
    if (!blank) return;
    const auto = calcRawPerUnit(blank.size);
    if (auto !== null) {
      setCutRawPer(String(auto));
    } else {
      setCutRawPer("");
    }
  }, [cutBlankId]);

  /* При смене сырья фильтруем связанные заготовки */
  const relatedBlanks = blanks.filter(b => b.materialId === cutRawId);
  const displayBlanks = relatedBlanks.length > 0 ? relatedBlanks : blanks;

  const autoOk = blank ? calcRawPerUnit(blank.size) !== null : false;

  return (
    <Modal title="Нарезка заготовок" icon="Scissors" iconColor="#6366f1" onClose={onClose}>
      <div className="space-y-3">

        <Field label="Сырьё для нарезки">
          <select value={cutRawId} onChange={e => setCutRawId(e.target.value)} className={selectCls}>
            {rawMat.map(r => {
              const lv = getLevelRaw(r);
              const suffix = lv === "critical" ? " ⚠ мало" : lv === "low" ? " ↓" : "";
              return (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.qty} {r.unit}{suffix}
                </option>
              );
            })}
          </select>
          {raw && (
            <p className="mt-1 text-[12px] text-[#9b9b9b]">
              Доступно: <b className="text-[#1a1a1a]">{raw.qty} {raw.unit}</b>
            </p>
          )}
        </Field>

        <Field label="Тип заготовки">
          <select value={cutBlankId} onChange={e => setCutBlankId(e.target.value)} className={selectCls}>
            {displayBlanks.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.size}) — на складе: {b.qty} шт.
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Кол-во заготовок (шт.)">
            <input
              type="number" min="1" step="1" value={cutQty}
              onChange={e => setCutQty(e.target.value)}
              placeholder="0" className={inputCls}
            />
          </Field>
          <Field label={`Расход на штуку (${raw?.unit ?? "м²"})`}>
            <input
              type="number" min="0.01" step="0.01" value={cutRawPer}
              onChange={e => setCutRawPer(e.target.value)}
              placeholder="0.5" className={inputCls}
            />
            {!autoOk && cutRawPer === "" && (
              <p className="mt-0.5 text-[11px] text-[#e09b20]">Не удалось рассчитать автоматически, укажите вручную</p>
            )}
          </Field>
        </div>

        <Field label="Нарезать до (дата)">
          <input
            type="date" value={cutDeadline}
            onChange={e => setCutDeadline(e.target.value)}
            className={inputCls}
          />
        </Field>

        {qty > 0 && perUnit > 0 && (
          <InfoRow>
            Итого будет списано:{" "}
            <b className={notEnough ? "text-red-600" : "text-[#1a1a1a]"}>{totalRaw} {raw?.unit}</b>
            {notEnough && <span className="ml-2 text-red-500 font-semibold">⚠ Недостаточно сырья</span>}
            {!notEnough && raw && (
              <span className="ml-2 text-[#9b9b9b]">
                · Останется: <b className="text-[#1a1a1a]">{(raw.qty - totalRaw).toFixed(2)} {raw.unit}</b>
              </span>
            )}
          </InfoRow>
        )}

        <button
          onClick={onConfirm}
          disabled={notEnough}
          className="w-full bg-[#6366f1] text-white text-[13px] py-2.5 rounded-[8px] hover:bg-[#5052cc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Создать заготовки
        </button>
      </div>
    </Modal>
  );
}

/* ════════════════════════════════════════
   Модалка: Списание
════════════════════════════════════════ */
type ModalUseProps = {
  blanks: Blank[];
  useBlankId: string; setUseBlankId: (v: string) => void;
  useQty: string;     setUseQty: (v: string) => void;
  useOrder: string;   setUseOrder: (v: string) => void;
  onConfirm: () => void;
  onClose: () => void;
};

export function ModalUse({ blanks, useBlankId, setUseBlankId, useQty, setUseQty, useOrder, setUseOrder, onConfirm, onClose }: ModalUseProps) {
  const blk = blanks.find(b => b.id === useBlankId);
  const qty = parseInt(useQty) || 0;
  const notEnough = blk ? qty > blk.qty : false;

  return (
    <Modal title="Списание заготовки" icon="ArrowUpFromLine" iconColor="#ef4444" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Заготовка">
          <select value={useBlankId} onChange={e => setUseBlankId(e.target.value)} className={selectCls}>
            {blanks.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.size}) — {b.qty} шт.</option>
            ))}
          </select>
        </Field>
        <Field label="Количество (шт.)">
          <input type="number" min="1" step="1" value={useQty}
            onChange={e => setUseQty(e.target.value)} placeholder="1" className={inputCls} />
          {notEnough && <p className="mt-0.5 text-[12px] text-red-500">Недостаточно заготовок на складе</p>}
        </Field>
        <Field label="Номер заказа (необязательно)">
          <input value={useOrder} onChange={e => setUseOrder(e.target.value)}
            placeholder="МП-0041" className={inputCls} />
        </Field>
        <button
          onClick={onConfirm}
          disabled={notEnough}
          className="w-full bg-white border border-[#e0e0e0] text-[#4b4b4b] text-[13px] py-2.5 rounded-[8px] hover:bg-[#f5f5f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Списать
        </button>
      </div>
    </Modal>
  );
}

/* ════════════════════════════════════════
   Модалка: История по материалу
════════════════════════════════════════ */
type ModalMaterialProps = {
  material: RawMaterial;
  movements: Movement[];
  onClose: () => void;
};

export function ModalMaterial({ material, movements, onClose }: ModalMaterialProps) {
  const matMoves = movements.filter(m => m.materialId === material.id);
  const totalIn  = matMoves.filter(m => m.type === "in").reduce((a, m) => a + m.qty, 0);
  const totalCut = matMoves.filter(m => m.type === "cut").reduce((a, m) => a + m.qty, 0);
  const totalUse = matMoves.filter(m => m.type === "use").reduce((a, m) => a + m.qty, 0);
  const avgPrice = (() => {
    const inMoves = matMoves.filter(m => m.type === "in" && m.pricePerUnit);
    if (!inMoves.length) return material.price;
    return Math.round(inMoves.reduce((a, m) => a + (m.pricePerUnit ?? 0), 0) / inMoves.length);
  })();

  return (
    <Modal title={`${material.name} — история`} icon="History" iconColor="#6366f1" onClose={onClose} wide>
      {/* Сводка */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Текущий остаток",   value: `${material.qty} ${material.unit}` },
          { label: "Мин. остаток",      value: `${material.min} ${material.unit}` },
          { label: "Средняя цена",      value: `${avgPrice.toLocaleString("ru")} ₽/${material.unit}` },
          { label: "Стоимость остатка", value: `${(material.qty * avgPrice).toLocaleString("ru")} ₽` },
          { label: "Всего приходило",   value: `${totalIn.toFixed(2)} ${material.unit}` },
          { label: "Нарезано / списано",value: `${(totalCut + totalUse).toFixed(2)} ${material.unit}` },
        ].map(s => (
          <div key={s.label} className="bg-[#f8f8f8] rounded-lg px-3 py-2.5">
            <p className="text-[11px] text-[#9b9b9b] mb-0.5">{s.label}</p>
            <p className="text-[14px] font-semibold text-[#1a1a1a]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Таблица */}
      {matMoves.length === 0 ? (
        <p className="text-center text-[13px] text-[#b5b5b5] py-6">Нет операций по этому материалу</p>
      ) : (
        <div className="border border-[#ebebeb] rounded-xl overflow-hidden max-h-[340px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-[#f0f0f0]">
                {["Дата", "Операция", "ID / Заказ", "Кол-во", "Цена", "Сумма", "Остаток"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matMoves.map((m, i) => {
                const mt = MOVE_TYPE[m.type];
                return (
                  <tr
                    key={m.id}
                    className={`${i < matMoves.length - 1 ? "border-b border-[#f8f8f8]" : ""}`}
                    style={{ backgroundColor: mt.rowBg }}
                  >
                    <td className="px-3 py-2 text-[12px] text-[#6b6b6b] whitespace-nowrap">{m.date}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <Icon name={mt.icon as never} size={11} style={{ color: mt.color }} />
                        <span className="text-[12px] font-semibold" style={{ color: mt.color }}>{mt.label}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[12px] text-[#4b4b4b] font-mono">
                      {m.receiptId ?? m.order ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-[12px] font-semibold text-[#1a1a1a]">
                      {m.type === "in" ? "+" : "−"}{m.qty} {material.unit}
                    </td>
                    <td className="px-3 py-2 text-[12px] text-[#6b6b6b]">
                      {m.pricePerUnit ? `${m.pricePerUnit.toLocaleString("ru")} ₽` : "—"}
                    </td>
                    <td className="px-3 py-2 text-[12px] text-[#6b6b6b]">
                      {m.totalSum ? `${m.totalSum.toLocaleString("ru")} ₽` : "—"}
                    </td>
                    <td className="px-3 py-2 text-[12px] text-[#9b9b9b]">
                      {m.remainAfter !== undefined ? `${m.remainAfter} ${material.unit}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}

/* ════════════════════════════════════════
   Модалка: Полная история движений
════════════════════════════════════════ */
type ModalHistoryProps = {
  movements: Movement[];
  rawMat: RawMaterial[];
  onClose: () => void;
};

export function ModalHistory({ movements, rawMat, onClose }: ModalHistoryProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [filterMat,  setFilterMat]  = useState<string>("all");
  const [filterId,   setFilterId]   = useState<string>("");

  const filtered = movements.filter(m => {
    if (filterType !== "all" && m.type !== filterType) return false;
    if (filterMat  !== "all" && m.materialId !== filterMat) return false;
    if (filterId && !(m.receiptId ?? m.order ?? "").toLowerCase().includes(filterId.toLowerCase())) return false;
    return true;
  });

  const totalP = filtered.filter(m => m.type === "in").reduce((a, m) => a + m.qty, 0);
  const totalM = filtered.filter(m => m.type !== "in").reduce((a, m) => a + m.qty, 0);

  return (
    <Modal title="Полная история движений" icon="History" iconColor="#6b6b6b" onClose={onClose} wide>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-white border border-[#e8e8e8] rounded-[7px] px-3 py-1.5 text-[12px] text-[#4b4b4b] outline-none"
        >
          <option value="all">Все операции</option>
          <option value="in">Приход</option>
          <option value="cut">Нарезка</option>
          <option value="use">Списание</option>
          <option value="adjust">Корректировка</option>
        </select>
        <select
          value={filterMat} onChange={e => setFilterMat(e.target.value)}
          className="bg-white border border-[#e8e8e8] rounded-[7px] px-3 py-1.5 text-[12px] text-[#4b4b4b] outline-none"
        >
          <option value="all">Все материалы</option>
          {rawMat.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <input
          value={filterId} onChange={e => setFilterId(e.target.value)}
          placeholder="ID прихода / номер камня"
          className="bg-white border border-[#e8e8e8] rounded-[7px] px-3 py-1.5 text-[12px] outline-none placeholder:text-[#c5c5c5] min-w-[200px]"
        />
        {(filterType !== "all" || filterMat !== "all" || filterId) && (
          <button
            onClick={() => { setFilterType("all"); setFilterMat("all"); setFilterId(""); }}
            className="flex items-center gap-1 text-[12px] text-[#9b9b9b] hover:text-[#4b4b4b]"
          >
            <Icon name="X" size={11} />Сброс
          </button>
        )}
      </div>

      {/* Итог за период */}
      <div className="flex gap-4 text-[12px] text-[#6b6b6b] bg-[#f8f8f8] rounded-lg px-4 py-2.5 mb-4">
        <span>Операций: <b className="text-[#1a1a1a]">{filtered.length}</b></span>
        <span>Приход: <b className="text-green-700">+{totalP.toFixed(2)}</b></span>
        <span>Расход: <b className="text-red-600">−{totalM.toFixed(2)}</b></span>
      </div>

      {/* Таблица */}
      {filtered.length === 0 ? (
        <p className="text-center text-[13px] text-[#b5b5b5] py-6">Нет операций по выбранному фильтру</p>
      ) : (
        <div className="border border-[#ebebeb] rounded-xl overflow-hidden max-h-[380px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="border-b border-[#f0f0f0]">
                {["Дата", "Тип", "Материал", "ID / Заказ", "Кол-во", "Цена", "Сумма", "Остаток", "Комментарий"].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => {
                const mt  = MOVE_TYPE[m.type];
                const mat = rawMat.find(r => r.id === m.materialId);
                return (
                  <tr
                    key={m.id}
                    className={`${i < filtered.length - 1 ? "border-b border-[#f8f8f8]" : ""}`}
                    style={{ backgroundColor: mt.rowBg }}
                  >
                    <td className="px-3 py-2 text-[12px] text-[#6b6b6b] whitespace-nowrap">{m.date}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <Icon name={mt.icon as never} size={11} style={{ color: mt.color }} />
                        <span className="text-[11px] font-semibold" style={{ color: mt.color }}>{mt.label}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-[12px] text-[#4b4b4b] max-w-[130px]">
                      <span className="truncate block">{mat?.name ?? "—"}</span>
                    </td>
                    <td className="px-3 py-2 text-[11px] font-mono text-[#6b6b6b]">
                      {m.receiptId ?? m.order ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-[12px] font-semibold text-[#1a1a1a] whitespace-nowrap">
                      {m.type === "in" ? "+" : "−"}{m.qty}
                    </td>
                    <td className="px-3 py-2 text-[12px] text-[#6b6b6b]">
                      {m.pricePerUnit ? `${m.pricePerUnit.toLocaleString("ru")} ₽` : "—"}
                    </td>
                    <td className="px-3 py-2 text-[12px] text-[#6b6b6b]">
                      {m.totalSum ? `${m.totalSum.toLocaleString("ru")} ₽` : "—"}
                    </td>
                    <td className="px-3 py-2 text-[12px] text-[#9b9b9b]">
                      {m.remainAfter !== undefined ? m.remainAfter : "—"}
                    </td>
                    <td className="px-3 py-2 text-[12px] text-[#6b6b6b] max-w-[160px]">
                      <span className="truncate block">{m.note}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}
