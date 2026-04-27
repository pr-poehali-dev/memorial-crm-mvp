import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

type Message = { role: "user" | "ai"; text: string; time: string };

const URGENT_ACTION = {
  icon: "Zap",
  text: "МП-0035 просрочен на 13 дней — срочно перевести на второго гравировщика",
  detail: "Лебедев К.А. ждёт. Этап Гравировка стоит.",
};

const PROBLEMS = [
  { icon: "AlertTriangle", color: "#ef4444", bg: "#fef2f2", border: "#fecaca", label: "Заказы просрочены", value: "3", detail: "МП-0035, МП-0033, МП-0040" },
  { icon: "CreditCard",    color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", label: "Клиенты не платят", value: "8", detail: "Долг: 123 500 ₽" },
  { icon: "Package",       color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe", label: "Заканчивается камень", value: "3", detail: "Мрамор белый, Гранит красный" },
  { icon: "AlertOctagon",  color: "#ec4899", bg: "#fdf2f8", border: "#f9a8d4", label: "Гравировка перегружена", value: "!", detail: "3 заказа, 2 просрочки" },
];

const ACTIONS = [
  { icon: "Phone",     color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0", label: "Позвонить Козлову",     detail: "Долг 22 000 ₽, заказ просрочен",     question: "Кто должен оплатить?" },
  { icon: "Zap",       color: "#ef4444", bg: "#fef2f2", border: "#fecaca", label: "Ускорить МП-0035",      detail: "Просрочен на 13 дней (Гравировка)",   question: "Какие заказы просрочены?" },
  { icon: "ShoppingCart", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe", label: "Закупить мрамор",   detail: "Остаток 0.4 м², срочно",              question: "Что закупить на складе?" },
  { icon: "UserCheck", color: "#ec4899", bg: "#fdf2f8", border: "#f9a8d4", label: "Добавить гравировщика", detail: "Узкое место — перегруз этапа",        question: "Где узкое место?" },
];

const QUICK_BTNS = [
  { icon: "AlertTriangle", label: "Просрочки",  color: "#ef4444", question: "Какие заказы просрочены?" },
  { icon: "CreditCard",    label: "Долги",       color: "#f59e0b", question: "Кто должен оплатить?" },
  { icon: "Package",       label: "Склад",       color: "#6366f1", question: "Что закупить на складе?" },
];

const AI_ANSWERS: Record<string, string> = {
  "Какие заказы просрочены?":
    "Просрочены 3 заказа:\n• МП-0035 — Лебедев К.А., Гравировка, +13 дней\n• МП-0033 — Семёнов Д.О., Полировка, +1 день\n• МП-0040 — Козлов И.Д., Эскиз, дедлайн 20 апреля",
  "Кто должен оплатить?":
    "8 клиентов с долгом — 123 500 ₽:\n• Козлов И.Д. — 22 000 ₽ (не оплачен)\n• Смирнова А.В. — 23 500 ₽ (частично)\n• Морозова Т.И. — 23 000 ₽ (частично)\n• Лебедев К.А. — 35 000 ₽ (не оплачен)\n• ещё 4 клиента...",
  "Где узкое место?":
    "Узкое место — Гравировка:\n• 3 заказа одновременно\n• 2 из них просрочены\n• Среднее время: 7 дней вместо нормы 4\n\nСовет: добавить второго исполнителя или перенести заказы.",
  "Что закупить на складе?":
    "Критичные позиции:\n• Мрамор белый — 0.4 м² (мин. 4 м²) 🚨\n• Гранит красный — 0.1 м² (мин. 5 м²) 🚨\n• Полировальная паста — 3.5 кг (мин. 5 кг)\n\nПримерная сумма закупки: ~180 000 ₽",
};

function getAiReply(q: string): string {
  const exact = AI_ANSWERS[q];
  if (exact) return exact;
  const l = q.toLowerCase();
  if (l.includes("просроч")) return AI_ANSWERS["Какие заказы просрочены?"];
  if (l.includes("долг") || l.includes("оплат")) return AI_ANSWERS["Кто должен оплатить?"];
  if (l.includes("узк") || l.includes("производств") || l.includes("гравир")) return AI_ANSWERS["Где узкое место?"];
  if (l.includes("склад") || l.includes("закупи") || l.includes("материал")) return AI_ANSWERS["Что закупить на складе?"];
  return "На основе данных CRM:\n\n9 заказов в работе, 3 просрочены. Долг клиентов — 123 500 ₽. Узкое место — Гравировка.\n\nРекомендую начать с просроченных заказов.";
}

function now() {
  return new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
}

/* ─── Иконка AI с градиентом ─── */
function AiIcon({ size = 32, glow = false }: { size?: number; glow?: boolean }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 relative"
      style={{
        width: size, height: size,
        background: "linear-gradient(135deg, #1a1a1a 0%, #3a3a5c 50%, #1a1a1a 100%)",
        boxShadow: glow ? "0 0 16px 4px rgba(99,102,241,0.35), 0 2px 8px rgba(0,0,0,0.25)" : "0 2px 8px rgba(0,0,0,0.18)",
      }}
    >
      <span style={{ fontSize: size * 0.44, lineHeight: 1 }} className="select-none">✦</span>
      {glow && (
        <span className="absolute inset-0 rounded-full animate-pulse"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)" }} />
      )}
    </div>
  );
}

export default function AiAssistant() {
  const [open, setOpen]     = useState(false);
  const [tab, setTab]       = useState<"overview" | "chat">("overview");
  const [input, setInput]   = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Привет! Смотрю данные вашей CRM.\n\n3 заказа просрочены, долгов на 123 500 ₽, Гравировка перегружена. Скажите что нужно — отвечу сразу.", time: now() },
  ]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tab === "chat") bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tab]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { role: "user", text: text.trim(), time: now() }]);
    setInput("");
    setTab("chat");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role: "ai", text: getAiReply(text.trim()), time: now() }]);
    }, 800 + Math.random() * 500);
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}

      {/* Panel */}
      <div className={`fixed right-0 top-0 h-full w-[360px] bg-white border-l border-[#ebebeb] z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out
        ${open ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="px-5 py-4 border-b border-[#f0f0f0] shrink-0"
          style={{ background: "linear-gradient(135deg, #fafafa 0%, #f0f0f8 100%)" }}>
          <div className="flex items-center gap-3">
            <AiIcon size={36} glow />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-[#1a1a1a]">AI-помощник</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <p className="text-[11px] text-[#9b9b9b]">следит за CRM в реальном времени</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#b5b5b5] hover:text-[#1a1a1a] hover:bg-white/60 transition-all">
              <Icon name="X" size={14} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#f0f0f0] px-5 shrink-0 bg-white">
          {[{ id: "overview", label: "Обзор" }, { id: "chat", label: "Чат" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as "overview" | "chat")}
              className={`py-3 px-1 mr-5 text-[12px] font-semibold border-b-2 transition-all
                ${tab === t.id ? "border-[#1a1a1a] text-[#1a1a1a]" : "border-transparent text-[#9b9b9b] hover:text-[#6b6b6b]"}`}>
              {t.label}
              {t.id === "chat" && messages.filter(m => m.role === "ai").length > 1 && (
                <span className="ml-1.5 text-[10px] bg-[#1a1a1a] text-white rounded-full px-1.5 py-px">
                  {messages.filter(m => m.role === "ai").length - 1}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Overview ─── */}
        {tab === "overview" && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">

              {/* Главное действие */}
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-[0.1em] mb-2">Главное сейчас</p>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon name="Zap" size={13} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#1a1a1a] leading-snug">{URGENT_ACTION.text}</p>
                    <p className="text-[11px] text-[#9b9b9b] mt-0.5">{URGENT_ACTION.detail}</p>
                  </div>
                </div>
              </div>

              {/* Что требует внимания */}
              <div>
                <p className="text-[10px] font-bold text-[#b5b5b5] uppercase tracking-[0.1em] mb-2.5">Что требует внимания</p>
                <div className="grid grid-cols-2 gap-2">
                  {PROBLEMS.map(p => (
                    <div key={p.label}
                      className="flex flex-col gap-1.5 p-3 rounded-xl border cursor-pointer hover:shadow-sm hover:scale-[1.01] transition-all"
                      style={{ backgroundColor: p.bg, borderColor: p.border }}>
                      <div className="flex items-center justify-between">
                        <Icon name={p.icon as never} size={13} style={{ color: p.color }} />
                        <span className="text-[18px] font-bold leading-none" style={{ color: p.color }}>{p.value}</span>
                      </div>
                      <p className="text-[11px] font-semibold leading-snug" style={{ color: p.color }}>{p.label}</p>
                      <p className="text-[10px] text-[#9b9b9b] leading-snug">{p.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Что делать сейчас */}
              <div>
                <p className="text-[10px] font-bold text-[#b5b5b5] uppercase tracking-[0.1em] mb-2.5">Что делать сейчас</p>
                <div className="space-y-2">
                  {ACTIONS.map((a, i) => (
                    <button key={i} onClick={() => sendMessage(a.question)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border text-left hover:shadow-sm hover:scale-[1.005] active:scale-[0.995] transition-all"
                      style={{ backgroundColor: a.bg, borderColor: a.border }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: a.color + "22" }}>
                        <Icon name={a.icon as never} size={13} style={{ color: a.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-[#1a1a1a] leading-snug">{a.label}</p>
                        <p className="text-[10px] text-[#9b9b9b] mt-0.5">{a.detail}</p>
                      </div>
                      <Icon name="ChevronRight" size={13} className="text-[#c5c5c5] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Быстрые кнопки */}
              <div>
                <p className="text-[10px] font-bold text-[#b5b5b5] uppercase tracking-[0.1em] mb-2.5">Быстрый ответ</p>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_BTNS.map(b => (
                    <button key={b.label} onClick={() => sendMessage(b.question)}
                      className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-white border border-[#ebebeb] hover:border-[#c8c8c8] hover:shadow-sm hover:scale-[1.03] active:scale-[0.97] transition-all">
                      <Icon name={b.icon as never} size={16} style={{ color: b.color }} />
                      <span className="text-[11px] font-medium text-[#4a4a4a]">{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ─── Chat ─── */}
        {tab === "chat" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                {m.role === "ai" && <AiIcon size={28} />}
                <div className={`max-w-[260px] flex flex-col gap-1 ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-[12px] leading-relaxed whitespace-pre-line
                    ${m.role === "user"
                      ? "bg-[#1a1a1a] text-white rounded-tr-sm"
                      : "bg-[#f5f5f5] text-[#1a1a1a] rounded-tl-sm"}`}>
                    {m.text}
                  </div>
                  <span className="text-[10px] text-[#c5c5c5] px-1">{m.time}</span>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-3">
                <AiIcon size={28} />
                <div className="bg-[#f5f5f5] px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b5b5b5] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b5b5b5] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b5b5b5] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-[#f0f0f0] shrink-0 bg-white">
          {tab === "overview" && (
            <p className="text-[11px] text-[#c5c5c5] text-center mb-2.5">или задайте свой вопрос</p>
          )}
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage(input)}
              placeholder="Спросите что угодно..."
              className="flex-1 bg-[#f5f5f5] border border-transparent focus:border-[#d0d0d0] focus:bg-white rounded-[10px] px-3.5 py-2.5 text-[13px] placeholder:text-[#c5c5c5] outline-none transition-all"
            />
            <button onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-[10px] flex items-center justify-center transition-all disabled:opacity-30 shrink-0"
              style={{ background: "linear-gradient(135deg, #1a1a1a, #3a3a5c)" }}>
              <Icon name="ArrowUp" size={15} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center
          ${open ? "bg-[#f0f0f0] scale-95" : "hover:scale-110"}`}
        style={{
          width: 52, height: 52,
          background: open ? undefined : "linear-gradient(135deg, #1a1a1a 0%, #3a3a5c 60%, #1a1a1a 100%)",
          boxShadow: open ? undefined : "0 0 20px 4px rgba(99,102,241,0.3), 0 4px 14px rgba(0,0,0,0.25)",
        }}
      >
        {open
          ? <Icon name="X" size={18} className="text-[#6b6b6b]" />
          : <span className="text-[20px] leading-none select-none">✦</span>
        }
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-[9px] font-bold text-white">3</span>
          </span>
        )}
      </button>
    </>
  );
}
