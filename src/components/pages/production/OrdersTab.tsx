import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { DbProductionOrder } from "@/api/client";

type OrderFilter = "all" | "active" | "urgent" | "overdue" | "problem" | "ready" | "done";

const STAGE_LABEL: Record<string, string> = {
  "Эскиз":       "Эскиз",
  "Производство":"Производство",
  "Гравировка":  "Гравировка",
  "Полировка":   "Полировка",
  "Готов":       "Готов",
  "Доставка":    "Доставка",
};

const STAGE_COLOR: Record<string, string> = {
  "Эскиз":       "#6366f1",
  "Производство":"#f59e0b",
  "Гравировка":  "#ec4899",
  "Полировка":   "#14b8a6",
  "Готов":       "#22c55e",
  "Доставка":    "#6b7280",
};

function stageColor(status: string): string {
  return STAGE_COLOR[status] ?? "#9b9b9b";
}
function stageBg(status: string): string {
  const c = stageColor(status);
  return c + "18";
}

type Props = {
  orders: DbProductionOrder[];
  onOpenOrder: (id: string) => void;
  onNextStage: (id: string, currentStatus: string) => void;
};

const NEXT_STATUS: Record<string, string> = {
  "Эскиз":       "Производство",
  "Производство":"Гравировка",
  "Гравировка":  "Полировка",
  "Полировка":   "Готов",
  "Готов":       "Доставка",
  "Доставка":    "",
};

function ProblemCell({ comment }: { comment?: string }) {
  const [open, setOpen] = useState(false);
  if (!comment) return <span className="text-[12px] text-[#c5c5c5]">—</span>;
  return (
    <button
      onClick={() => setOpen(v => !v)}
      className="flex items-start gap-1.5 text-left w-full group"
    >
      <Icon name="AlertCircle" size={12} className="text-amber-500 shrink-0 mt-0.5" />
      {open ? (
        <span className="text-[12px] text-amber-700 whitespace-normal break-words">{comment}</span>
      ) : (
        <span className="text-[12px] text-amber-600 font-medium group-hover:underline underline-offset-2">
          Есть проблема
        </span>
      )}
      <Icon
        name={open ? "ChevronUp" : "ChevronDown"}
        size={11}
        className="text-amber-400 shrink-0 mt-0.5 ml-auto"
      />
    </button>
  );
}

export default function OrdersTab({ orders, onOpenOrder, onNextStage }: Props) {
  const [filter, setFilter] = useState<OrderFilter>("active");
  const [search, setSearch] = useState("");

  const FILTERS: { key: OrderFilter; label: string }[] = [
    { key: "all",      label: "Все" },
    { key: "active",   label: "Активные" },
    { key: "urgent",   label: "Срочные" },
    { key: "overdue",  label: "Просроченные" },
    { key: "problem",  label: "Есть проблема" },
    { key: "ready",    label: "Готовы к выдаче" },
    { key: "done",     label: "Завершённые" },
  ];

  const counts = useMemo(() => ({
    all:      orders.length,
    active:   orders.filter(o => !["Готов","Доставка","Выдан"].includes(o.status)).length,
    urgent:   0,
    overdue:  orders.filter(o => o.deadline_state === "overdue").length,
    problem:  orders.filter(o => !!o.comment).length,
    ready:    orders.filter(o => o.status === "Готов").length,
    done:     orders.filter(o => ["Доставка","Выдан"].includes(o.status)).length,
  }), [orders]);

  const filtered = useMemo(() => {
    let list = orders;
    if (filter === "active")  list = list.filter(o => !["Готов","Доставка"].includes(o.status));
    if (filter === "overdue") list = list.filter(o => o.deadline_state === "overdue");
    if (filter === "problem") list = list.filter(o => !!o.comment);
    if (filter === "ready")   list = list.filter(o => o.status === "Готов");
    if (filter === "done")    list = list.filter(o => ["Доставка","Выдан"].includes(o.status));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.client_name.toLowerCase().includes(q) ||
        (o.phone ?? "").includes(q)
      );
    }
    return list;
  }, [orders, filter, search]);

  const totalAmount = filtered.reduce((a, o) => a + Number(o.amount), 0);
  const totalDebt   = filtered.reduce((a, o) => a + Math.max(0, Number(o.amount) - Number(o.paid)), 0);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Фильтры */}
      <div className="shrink-0 bg-white border-b border-[#f0f0f0] px-7 py-3 flex items-center gap-3">
        <div className="flex gap-0.5 bg-[#f0f0f0] rounded-[8px] p-0.5 flex-wrap">
          {FILTERS.map(f => {
            const cnt = counts[f.key];
            return (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all whitespace-nowrap ${
                  filter === f.key ? "bg-white text-[#1a1a1a] shadow-sm" : "text-[#6b6b6b] hover:text-[#1a1a1a]"
                }`}>
                {f.label}
                {cnt > 0 && (
                  <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${
                    filter === f.key ? "bg-[#1a1a1a] text-white"
                      : f.key === "overdue" ? "bg-red-100 text-red-600"
                      : f.key === "problem" ? "bg-amber-100 text-amber-700"
                      : "bg-[#e8e8e8] text-[#6b6b6b]"
                  }`}>{cnt}</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative flex-1 max-w-[280px] ml-auto">
          <Icon name="Search" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5b5]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Заказ, клиент, телефон..."
            className="w-full bg-white border border-[#e8e8e8] rounded-[8px] pl-8 pr-8 py-1.5 text-[12px] outline-none focus:border-[#c0c0c0] placeholder:text-[#c5c5c5] transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c0c0c0] hover:text-[#555]">
              <Icon name="X" size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Таблица */}
      <div className="flex-1 overflow-y-auto px-7 py-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#f4f4f4] flex items-center justify-center mb-4">
              <Icon name="ClipboardList" size={22} className="text-[#c0c0c0]" />
            </div>
            <p className="text-[15px] font-medium text-[#9b9b9b]">
              {search ? "Ничего не найдено" : "Нет заказов по выбранному фильтру"}
            </p>
          </div>
        ) : (
          <>
            {/* Итоги */}
            <div className="flex items-center gap-5 mb-4 text-[12px] text-[#9b9b9b]">
              <span><b className="text-[#1a1a1a]">{filtered.length}</b> заказов</span>
              <span>Сумма: <b className="text-[#1a1a1a]">{totalAmount.toLocaleString("ru")} ₽</b></span>
              {totalDebt > 0 && (
                <span>Долг: <b className="text-red-600">{totalDebt.toLocaleString("ru")} ₽</b></span>
              )}
            </div>

            <div className="bg-white border border-[#ebebeb] rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#fafafa] border-b border-[#f0f0f0]">
                    {["№ заказа", "Клиент", "Срок", "Этап", "Оплата", "Проблема", "Ответственный", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-[#b5b5b5] uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o, i) => {
                    const isOverdue = o.deadline_state === "overdue";
                    const isSoon    = o.deadline_state === "soon";
                    const debt      = Math.max(0, Number(o.amount) - Number(o.paid));
                    const nextStatus = NEXT_STATUS[o.status] ?? "";

                    return (
                      <tr key={o.id}
                        className={`border-b border-[#f8f8f8] hover:bg-[#fafafa] transition-colors ${
                          isOverdue ? "bg-red-50/30" : ""
                        }`}>
                        {/* № заказа */}
                        <td className="px-4 py-3.5">
                          <button onClick={() => onOpenOrder(o.id)}
                            className="text-[13px] font-bold text-[#6366f1] hover:underline underline-offset-2 font-mono">
                            {o.id}
                          </button>
                        </td>

                        {/* Клиент */}
                        <td className="px-4 py-3.5">
                          <p className="text-[13px] font-semibold text-[#1a1a1a]">{o.client_name}</p>
                          {o.phone && <p className="text-[11px] text-[#9b9b9b] mt-0.5">{o.phone}</p>}
                        </td>

                        {/* Срок */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {o.deadline ? (
                            <div className="flex items-center gap-1.5">
                              {isOverdue && <Icon name="AlertTriangle" size={11} className="text-red-500 shrink-0" />}
                              <span className={`text-[13px] font-semibold ${
                                isOverdue ? "text-red-600" : isSoon ? "text-amber-600" : "text-[#1a1a1a]"
                              }`}>
                                {new Date(o.deadline).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}
                              </span>
                              {isOverdue && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">просрочен</span>}
                              {isSoon && !isOverdue && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">скоро</span>}
                            </div>
                          ) : (
                            <span className="text-[12px] text-[#c5c5c5]">—</span>
                          )}
                        </td>

                        {/* Этап */}
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-lg w-fit"
                            style={{ color: stageColor(o.status), backgroundColor: stageBg(o.status) }}>
                            {STAGE_LABEL[o.status] ?? o.status}
                          </span>
                        </td>

                        {/* Оплата */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="text-[12px] font-medium text-[#1a1a1a]">{o.payment_label}</p>
                          {debt > 0 && (
                            <p className="text-[11px] text-red-500 mt-0.5">−{debt.toLocaleString("ru")} ₽</p>
                          )}
                        </td>

                        {/* Проблема */}
                        <td className="px-4 py-3.5 max-w-[200px]">
                          <ProblemCell comment={o.comment ?? undefined} />
                        </td>

                        {/* Ответственный */}
                        <td className="px-4 py-3.5 text-[12px] text-[#4b4b4b]">
                          {o.manager || <span className="text-[#c5c5c5]">—</span>}
                        </td>

                        {/* Действия */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => onOpenOrder(o.id)}
                              title="Открыть заказ"
                              className="w-7 h-7 rounded-lg bg-[#f5f5f5] hover:bg-[#ebebeb] flex items-center justify-center text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
                              <Icon name="ExternalLink" size={13} />
                            </button>
                            {nextStatus && (
                              <button onClick={() => onNextStage(o.id, o.status)}
                                title={`Перевести в «${nextStatus}»`}
                                className="w-7 h-7 rounded-lg bg-[#f5f5f5] hover:bg-[#1a1a1a] flex items-center justify-center text-[#6b6b6b] hover:text-white transition-colors">
                                <Icon name="ChevronRight" size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}