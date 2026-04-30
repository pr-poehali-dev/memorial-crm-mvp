import { useState } from "react";
import Icon from "@/components/ui/icon";
import { RawMaterial, Blank, Movement, MOVE_TYPE, selectCls, inputCls } from "./warehouse.types";
import { Modal, Field } from "./ModalShared";

/* ════════════════════════════════════════
   Модалка: Списание
════════════════════════════════════════ */
export type ModalUseProps = {
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
export type ModalMaterialProps = {
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
export type ModalHistoryProps = {
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
