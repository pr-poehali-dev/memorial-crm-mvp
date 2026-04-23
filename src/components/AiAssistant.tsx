import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

type Message = { role: "user" | "ai"; text: string; time: string };

const PROBLEMS = [
  { icon: "AlertTriangle", color: "#ef4444", bg: "#fef2f2", border: "#fecaca", label: "Просроченных заказов", value: "3", detail: "МП-0035, МП-0033, МП-0040" },
  { icon: "CreditCard",    color: "#f59e0b", bg: "#fffbeb", border: "#fde68a", label: "Долгов клиентов",      value: "8", detail: "Сумма: 123 500 ₽" },
  { icon: "Package",       color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe", label: "Дефицит материалов",  value: "3", detail: "Мрамор белый, Гранит красный" },
  { icon: "AlertOctagon",  color: "#ec4899", bg: "#fdf2f8", border: "#f9a8d4", label: "Узкое место",          value: "Гравировка", detail: "3 заказа, 2 просрочки" },
];

const RECOMMENDATIONS = [
  { icon: "Phone",        color: "#22c55e",  text: "Позвонить Козлову И.Д. — долг 22 000 ₽, заказ просрочен" },
  { icon: "ShoppingCart", color: "#6366f1",  text: "Закупить Мрамор белый — остаток 0.4 м², ниже минимума" },
  { icon: "Zap",          color: "#f59e0b",  text: "Ускорить МП-0035 — просрочен на 13 дней (Гравировка)" },
  { icon: "Banknote",     color: "#14b8a6",  text: "Напомнить Лебедеву К.А. об оплате — заказ не оплачен" },
  { icon: "UserCheck",    color: "#ec4899",  text: "Назначить второго гравировщика — перегрузка этапа" },
];

const QUICK_QUESTIONS = [
  "Какие заказы просрочены?",
  "Кто должен оплатить?",
  "Где узкое место?",
  "Что закупить на складе?",
];

const AI_ANSWERS: Record<string, string> = {
  "Какие заказы просрочены?":
    "Просрочены 3 заказа:\n• МП-0035 — Лебедев К.А., Гравировка, +13 дней\n• МП-0033 — Семёнов Д.О., Полировка, +1 день\n• МП-0040 — Козлов И.Д., Эскиз, просрочен дедлайн 20 апреля",
  "Кто должен оплатить?":
    "8 клиентов с долгом на общую сумму 123 500 ₽:\n• Козлов И.Д. — 22 000 ₽ (не оплачен)\n• Смирнова А.В. — 23 500 ₽ (частично)\n• Морозова Т.И. — 23 000 ₽ (частично)\n• Лебедев К.А. — 35 000 ₽ (не оплачен)\n• и ещё 4 клиента...",
  "Где узкое место?":
    "Узкое место — этап «Гравировка»:\n• 3 заказа в работе (максимум из всех этапов)\n• 2 из них просрочены\n• Среднее время на этапе: 7 дней вместо нормы 4 дня\n\nРекомендация: назначить второго исполнителя или перенести заказы.",
  "Что закупить на складе?":
    "Критичные позиции на складе:\n• Мрамор белый — 0.4 м² (мин. 4 м²), срочно!\n• Гранит красный — 0.1 м² (мин. 5 м²), срочно!\n• Полировальная паста — 3.5 кг (мин. 5 кг)\n\nОбщая сумма закупки: ~180 000 ₽",
};

function getAiReply(question: string): string {
  const exact = AI_ANSWERS[question];
  if (exact) return exact;
  const lower = question.toLowerCase();
  if (lower.includes("просроч")) return AI_ANSWERS["Какие заказы просрочены?"];
  if (lower.includes("долг") || lower.includes("оплат")) return AI_ANSWERS["Кто должен оплатить?"];
  if (lower.includes("узк") || lower.includes("производств")) return AI_ANSWERS["Где узкое место?"];
  if (lower.includes("склад") || lower.includes("закупи")) return AI_ANSWERS["Что закупить на складе?"];
  return "Понял вопрос. На основе текущих данных системы:\n\nВ работе 9 заказов, 3 просрочены. Долг клиентов — 123 500 ₽. Узкое место — Гравировка. Рекомендую начать с просроченных заказов.";
}

function now() {
  return new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
}

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"overview" | "chat">("overview");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Привет! Я анализирую данные вашей CRM.\n\nВижу 3 просроченных заказа и долги на 123 500 ₽. Готов ответить на любой вопрос о бизнесе.", time: now() },
  ]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tab === "chat") bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tab]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", text: text.trim(), time: now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTab("chat");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: "ai", text: getAiReply(text.trim()), time: now() }]);
    }, 900 + Math.random() * 600);
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}

      {/* Panel */}
      <div className={`fixed right-0 top-0 h-full w-[360px] bg-white border-l border-[#ebebeb] z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out
        ${open ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="px-5 py-4 border-b border-[#f0f0f0] flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
            <span className="text-[15px] leading-none">✦</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-[#1a1a1a]">AI-помощник</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-[11px] text-[#9b9b9b]">анализирует данные CRM</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)}
            className="text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors p-1">
            <Icon name="X" size={15} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#f0f0f0] px-5 shrink-0">
          {[{ id: "overview", label: "Обзор" }, { id: "chat", label: "Чат" }].map((t) => (
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

        {/* Overview tab */}
        {tab === "overview" && (
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-5">

              {/* Problems */}
              <div>
                <p className="text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-widest mb-3">Проблемы</p>
                <div className="space-y-2">
                  {PROBLEMS.map((p) => (
                    <div key={p.label} className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer hover:shadow-sm transition-all"
                      style={{ backgroundColor: p.bg, borderColor: p.border }}>
                      <Icon name={p.icon as never} size={14} className="mt-0.5 shrink-0" style={{ color: p.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[12px] font-semibold" style={{ color: p.color }}>{p.label}</span>
                          <span className="text-[15px] font-bold shrink-0" style={{ color: p.color }}>{p.value}</span>
                        </div>
                        <p className="text-[11px] text-[#6b6b6b] mt-0.5">{p.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <p className="text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-widest mb-3">Рекомендации</p>
                <div className="space-y-2">
                  {RECOMMENDATIONS.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#fafafa] border border-[#f0f0f0] hover:border-[#d5d5d5] cursor-pointer transition-all group">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: r.color + "18" }}>
                        <Icon name={r.icon as never} size={12} style={{ color: r.color }} />
                      </div>
                      <p className="text-[12px] text-[#4b4b4b] leading-relaxed flex-1">{r.text}</p>
                      <Icon name="ArrowRight" size={11} className="text-[#d5d5d5] group-hover:text-[#9b9b9b] shrink-0 mt-1 transition-colors" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick questions */}
              <div>
                <p className="text-[10px] font-semibold text-[#b5b5b5] uppercase tracking-widest mb-3">Быстрые вопросы</p>
                <div className="space-y-1.5">
                  {QUICK_QUESTIONS.map((q) => (
                    <button key={q} onClick={() => sendMessage(q)}
                      className="w-full flex items-center gap-2.5 text-left text-[12px] text-[#4b4b4b] bg-white border border-[#ebebeb] hover:border-[#c5c5c5] hover:bg-[#fafafa] px-3.5 py-2.5 rounded-[8px] transition-all group">
                      <Icon name="MessageSquare" size={12} className="text-[#c5c5c5] group-hover:text-[#9b9b9b] shrink-0 transition-colors" />
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat tab */}
        {tab === "chat" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                {m.role === "ai" && (
                  <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                    ✦
                  </div>
                )}
                <div className={`max-w-[260px] ${m.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <div className={`px-3.5 py-2.5 rounded-2xl text-[12px] leading-relaxed whitespace-pre-line
                    ${m.role === "user"
                      ? "bg-[#1a1a1a] text-white rounded-tr-sm"
                      : "bg-[#f5f5f5] text-[#1a1a1a] rounded-tl-sm"
                    }`}>
                    {m.text}
                  </div>
                  <span className="text-[10px] text-[#c5c5c5] px-1">{m.time}</span>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center text-[11px] shrink-0">✦</div>
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
        <div className="p-4 border-t border-[#f0f0f0] shrink-0">
          {tab === "overview" && (
            <p className="text-[11px] text-[#b5b5b5] text-center mb-3">или задайте свой вопрос</p>
          )}
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Спросите что-нибудь..."
              className="flex-1 bg-[#f5f5f5] border border-transparent focus:border-[#d0d0d0] focus:bg-white rounded-[10px] px-3.5 py-2.5 text-[13px] placeholder:text-[#c5c5c5] outline-none transition-all"
            />
            <button onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-[10px] bg-[#1a1a1a] text-white flex items-center justify-center hover:bg-[#333] transition-colors disabled:opacity-30 shrink-0">
              <Icon name="ArrowUp" size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-13 h-13 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center
          ${open ? "bg-[#f0f0f0] scale-95" : "bg-[#1a1a1a] hover:scale-110 hover:shadow-xl"}`}
        style={{ width: 52, height: 52 }}
      >
        {open
          ? <Icon name="X" size={18} className="text-[#6b6b6b]" />
          : <span className="text-[20px] leading-none select-none">✦</span>
        }
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-[9px] font-bold text-white">3</span>
          </span>
        )}
      </button>
    </>
  );
}
