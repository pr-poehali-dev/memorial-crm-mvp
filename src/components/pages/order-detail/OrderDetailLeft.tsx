import { useState } from "react";
import Icon from "@/components/ui/icon";

type OrderItem = { id: string; name: string; qty: number; unit: string; price: number; approved: boolean | null; hasCalc: boolean };
type Comment   = { author: string; date: string; text: string };
type Material  = { name: string; qty: number; unit: string; written: boolean };

const APPROVE_CFG = {
  true:  { label: "Утверждено",      color: "#16a34a", bg: "#f0fdf4" },
  false: { label: "Не утверждено",   color: "#dc2626", bg: "#fef2f2" },
  null:  { label: "Требует расчёта", color: "#d97706", bg: "#fffbeb" },
};

function Block({ title, icon, children, collapsible = false }: {
  title: string; icon: string; children: React.ReactNode; collapsible?: boolean;
}) {
  const [open, setOpen] = useState(!collapsible);
  return (
    <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
      <div
        className={`flex items-center gap-2.5 px-5 py-3.5 border-b border-[#f5f5f5] ${collapsible ? "cursor-pointer hover:bg-[#fafafa] transition-colors select-none" : ""}`}
        onClick={collapsible ? () => setOpen(v => !v) : undefined}
      >
        <div className="w-6 h-6 rounded-md bg-[#f4f4f4] flex items-center justify-center shrink-0">
          <Icon name={icon as never} size={12} className="text-[#6b6b6b]" />
        </div>
        <p className="text-[13px] font-semibold text-[#1a1a1a] flex-1">{title}</p>
        {collapsible && (
          <Icon name={open ? "ChevronUp" : "ChevronDown"} size={14} className="text-[#c0c0c0]" />
        )}
      </div>
      {open && <div className="px-5 py-4">{children}</div>}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-[#9b9b9b]">{label}</span>
      <span className="text-[13px] font-medium text-[#1a1a1a]">{value}</span>
    </div>
  );
}

type Props = {
  client: string;
  phone: string;
  clientComment: string;
  orderAmount: number;
  orderItems: OrderItem[];
  materials: Material[];
  comments: Comment[];
  newComment: string;
  totalApproved: number;
  totalUnapproved: number;
  totalPending: number;
  allApproved: boolean;
  onOpenCalcFor: (id: string) => void;
  onNewCommentChange: (v: string) => void;
  onAddComment: () => void;
};

export default function OrderDetailLeft({
  client, phone, clientComment,
  orderAmount, orderItems, materials,
  comments, newComment,
  totalApproved, totalUnapproved, totalPending, allApproved,
  onOpenCalcFor, onNewCommentChange, onAddComment,
}: Props) {
  return (
    <div className="flex-1 min-w-0 space-y-3">

      {/* ── Клиент ── */}
      <Block title="Клиент" icon="User">
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="ФИО"     value={client} />
          <InfoRow label="Телефон" value={phone}  />
        </div>
        {clientComment && (
          <div className="mt-4 pt-4 border-t border-[#f5f5f5]">
            <p className="text-[11px] font-semibold text-[#b5b5b5] uppercase tracking-wide mb-2">Комментарий клиента</p>
            <p className="text-[13px] text-[#4b4b4b] leading-relaxed bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
              {clientComment}
            </p>
          </div>
        )}
      </Block>

      {/* ── Заказ (позиции) ── */}
      <Block title="Заказ" icon="FileText">
        <table className="w-full mb-4">
          <thead>
            <tr className="border-b border-[#f5f5f5]">
              {["Позиция", "Кол.", "Цена", "Сумма", "Статус", ""].map(h => (
                <th key={h} className="pb-2.5 text-left text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item, i) => {
              const cfg = APPROVE_CFG[String(item.approved) as keyof typeof APPROVE_CFG];
              return (
                <tr key={i} className="border-b border-[#f8f8f8] last:border-0 group">
                  <td className="py-2.5 text-[13px] text-[#1a1a1a] pr-3">{item.name}</td>
                  <td className="py-2.5 text-[12px] text-[#6b6b6b]">{item.qty} {item.unit}</td>
                  <td className="py-2.5 text-[12px] text-[#6b6b6b] font-mono">
                    {item.price > 0 ? `${item.price.toLocaleString("ru")} ₽` : <span className="text-[#d97706]">—</span>}
                  </td>
                  <td className="py-2.5 text-[13px] font-semibold text-[#1a1a1a] font-mono">
                    {item.price > 0 ? `${(item.qty * item.price).toLocaleString("ru")} ₽` : "—"}
                  </td>
                  <td className="py-2.5">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md whitespace-nowrap"
                      style={{ color: cfg.color, backgroundColor: cfg.bg }}
                    >
                      {cfg.label}
                    </span>
                  </td>
                  <td className="py-2.5 pl-2">
                    <button
                      onClick={() => onOpenCalcFor(item.id)}
                      className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-[7px] border transition-colors whitespace-nowrap
                        ${item.hasCalc
                          ? "border-[#e8e8e8] text-[#6b6b6b] hover:border-[#c0c0c0] hover:text-[#1a1a1a]"
                          : "border-[#2563eb] bg-[#eff6ff] text-[#2563eb] hover:bg-[#dbeafe]"
                        }`}
                    >
                      <Icon name="Calculator" size={10} />
                      {item.hasCalc ? "Пересчитать" : "Рассчитать"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Сводка */}
        <div className="border-t border-[#f5f5f5] pt-3">
          {allApproved ? (
            <div className="flex justify-end items-baseline gap-2">
              <span className="text-[12px] text-[#9b9b9b]">Итого</span>
              <span className="text-[22px] font-bold text-[#1a1a1a]">{orderAmount.toLocaleString("ru")} ₽</span>
            </div>
          ) : (
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-1 text-[12px]">
                {totalApproved > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
                    <span className="text-[#6b6b6b]">Утверждено</span>
                    <span className="font-semibold text-[#1a1a1a]">{totalApproved.toLocaleString("ru")} ₽</span>
                  </div>
                )}
                {totalUnapproved > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                    <span className="text-[#6b6b6b]">Не утверждено</span>
                    <span className="font-semibold text-[#1a1a1a]">{totalUnapproved.toLocaleString("ru")} ₽</span>
                  </div>
                )}
                {totalPending > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                    <span className="text-[#6b6b6b]">Требует расчёта</span>
                    <span className="font-semibold text-[#1a1a1a]">{totalPending.toLocaleString("ru")} ₽</span>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[#9b9b9b] mb-0.5">Итого</p>
                <p className="text-[22px] font-bold text-[#1a1a1a]">{orderAmount.toLocaleString("ru")} ₽</p>
              </div>
            </div>
          )}
        </div>
      </Block>

      {/* ── Материалы (свёрнуты) ── */}
      <Block title="Материалы" icon="Package" collapsible>
        <div className="space-y-2">
          {materials.map((m, i) => (
            <div key={i} className="flex items-center justify-between gap-3 py-1.5 border-b border-[#f8f8f8] last:border-0">
              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full shrink-0 ${m.written ? "bg-green-400" : "bg-[#e0e0e0]"}`} />
                <span className="text-[13px] text-[#1a1a1a]">{m.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[12px] font-mono text-[#6b6b6b]">{m.qty} {m.unit}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${m.written ? "bg-green-100 text-green-700" : "bg-[#f4f4f4] text-[#9b9b9b]"}`}>
                  {m.written ? "Списано" : "Не списано"}
                </span>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-3 flex items-center gap-1.5 text-[12px] text-[#6b6b6b] hover:text-[#1a1a1a] border border-[#ebebeb] px-3 py-1.5 rounded-[7px] hover:border-[#c5c5c5] transition-colors">
          <Icon name="ArrowUpFromLine" size={12} />
          Списать материал
        </button>
      </Block>

      {/* ── Комментарии ── */}
      <Block title="Комментарии" icon="MessageSquare">
        <div className="space-y-3 mb-4">
          {comments.map((c, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[11px] font-bold text-[#6b6b6b] shrink-0">
                {c.author.split(" ").map(w => w[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-[12px] font-semibold text-[#1a1a1a]">{c.author}</span>
                  <span className="text-[11px] text-[#b5b5b5]">{c.date}</span>
                </div>
                <p className="text-[13px] text-[#4b4b4b] leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newComment}
            onChange={e => onNewCommentChange(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && onAddComment()}
            placeholder="Добавить комментарий..."
            className="flex-1 bg-[#fafafa] border border-[#ebebeb] rounded-[8px] px-3 py-2 text-[13px] outline-none focus:border-[#c0c0c0] transition-colors placeholder:text-[#c5c5c5]"
          />
          <button
            onClick={onAddComment}
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-[#1a1a1a] text-white text-[12px] rounded-[8px] hover:bg-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Icon name="Send" size={13} />
          </button>
        </div>
      </Block>

    </div>
  );
}