import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { aiApi, AiMessage } from "@/api/client";

type Message = { role: "user" | "ai"; text: string; time: string };

const QUICK_BTNS = [
  { icon: "AlertTriangle", label: "Просрочки",   color: "#ef4444", question: "Какие заказы просрочены?" },
  { icon: "CreditCard",    label: "Долги",        color: "#f59e0b", question: "Есть ли долги клиентов? Сколько?" },
  { icon: "Package",       label: "Склад",        color: "#2563eb", question: "Что заканчивается на складе?" },
  { icon: "Scissors",      label: "Заготовки",    color: "#22c55e", question: "Какие задачи сейчас стоят на нарезку?" },
];

function now() {
  return new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" });
}

function AiIcon({ size = 32, glow = false }: { size?: number; glow?: boolean }) {
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 relative"
      style={{
        width: size, height: size,
        background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a4a 50%, #1a1a1a 100%)",
        boxShadow: glow
          ? "0 0 18px 4px rgba(37,99,235,0.3), 0 2px 8px rgba(0,0,0,0.25)"
          : "0 2px 8px rgba(0,0,0,0.18)",
      }}
    >
      <span style={{ fontSize: size * 0.44, lineHeight: 1 }} className="select-none">✦</span>
      {glow && (
        <span className="absolute inset-0 rounded-full animate-pulse"
          style={{ background: "radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%)" }} />
      )}
    </div>
  );
}

/* Рендерим текст с простым markdown: **bold**, • списки, \n */
function AiText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1.5" />;
        // Заменяем **text** на bold
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
          p.startsWith("**") && p.endsWith("**")
            ? <strong key={j} className="font-semibold text-[#1a1a1a]">{p.slice(2, -2)}</strong>
            : p
        );
        const isBullet = line.trim().startsWith("•") || line.trim().startsWith("-") || line.trim().startsWith("*");
        return (
          <p key={i} className={`text-[13px] leading-relaxed ${isBullet ? "pl-1" : ""}`}>
            {parts}
          </p>
        );
      })}
    </div>
  );
}

export default function AiAssistant({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [input,    setInput]    = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Привет! Я анализирую данные вашей CRM в реальном времени.\n\nСпросите меня о заказах, долгах, складе или производстве — отвечу на основе актуальных данных.", time: now() },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  /* Конвертируем историю чата в формат API */
  const toApiMessages = (msgs: Message[]): AiMessage[] =>
    msgs
      .filter(m => m.role !== "ai" || msgs.indexOf(m) > 0) // пропускаем первое приветствие
      .map(m => ({
        role:    m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));

  const sendMessage = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;

    const userMsg: Message = { role: "user", text: q, time: now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = toApiMessages([...messages, userMsg]);
      const { reply } = await aiApi.chat(history);
      setMessages(prev => [...prev, { role: "ai", text: reply, time: now() }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "ai",
        text: "Не удалось получить ответ. Проверьте подключение и попробуйте снова.",
        time: now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-40" onClick={onClose} />}

      <div className={`fixed right-0 top-0 h-full w-[380px] bg-white border-l border-[#ebebeb] z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out
        ${open ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="px-5 py-4 border-b border-[#f0f0f0] shrink-0"
          style={{ background: "linear-gradient(135deg, #fafafa 0%, #f0f3ff 100%)" }}>
          <div className="flex items-center gap-3">
            <AiIcon size={36} glow />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-[#1a1a1a]">AI-помощник</p>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${loading ? "bg-amber-400 animate-pulse" : "bg-green-400"}`} />
                <p className="text-[11px] text-[#9b9b9b]">
                  {loading ? "думает..." : "DeepSeek · анализирует CRM"}
                </p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#b5b5b5] hover:text-[#1a1a1a] hover:bg-white/60 transition-all">
              <Icon name="X" size={14} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>

              {/* Аватар */}
              {m.role === "ai" ? (
                <AiIcon size={26} />
              ) : (
                <div className="w-[26px] h-[26px] rounded-full bg-brand flex items-center justify-center shrink-0">
                  <Icon name="User" size={12} className="text-white" />
                </div>
              )}

              {/* Пузырь */}
              <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 ${
                m.role === "user"
                  ? "bg-brand text-white rounded-tr-sm"
                  : "bg-[#f5f5f7] text-[#2a2a2a] rounded-tl-sm"
              }`}>
                {m.role === "ai"
                  ? <AiText text={m.text} />
                  : <p className="text-[13px] leading-relaxed">{m.text}</p>
                }
                <p className={`text-[10px] mt-1 ${m.role === "user" ? "text-blue-200 text-right" : "text-[#b0b0b0]"}`}>
                  {m.time}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2.5">
              <AiIcon size={26} />
              <div className="bg-[#f5f5f7] rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#b0b0b0] animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick buttons */}
        <div className="px-4 pb-2 shrink-0">
          <div className="flex gap-1.5 flex-wrap">
            {QUICK_BTNS.map(b => (
              <button
                key={b.label}
                onClick={() => sendMessage(b.question)}
                disabled={loading}
                className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-full border border-[#e8e8e8] bg-white hover:border-[#c0c0c0] transition-colors disabled:opacity-40"
              >
                <Icon name={b.icon as never} size={11} style={{ color: b.color }} />
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-1 shrink-0 border-t border-[#f0f0f0]">
          <div className="flex gap-2 items-end bg-[#f5f5f7] rounded-2xl px-3.5 py-2.5">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Спросите что-нибудь о CRM..."
              rows={1}
              disabled={loading}
              className="flex-1 bg-transparent text-[13px] text-[#1a1a1a] placeholder:text-[#b0b0b0] outline-none resize-none leading-relaxed disabled:opacity-50"
              style={{ maxHeight: 120, overflowY: "auto" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-brand text-white hover:bg-brand-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
            >
              <Icon name="ArrowUp" size={13} />
            </button>
          </div>
          <p className="text-[10px] text-[#c0c0c0] text-center mt-1.5">Enter — отправить · Shift+Enter — перенос</p>
        </div>
      </div>
    </>
  );
}
