import { useState } from "react";

type Props = { onLogin: () => void; onBack: () => void };

export default function LoginPage({ onLogin, onBack }: Props) {
  const [login, setLogin]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login.trim() || !password.trim()) {
      setError("Введите логин и пароль");
      return;
    }
    if (login !== "123" || password !== "123") {
      setError("Неверный логин или пароль");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-golos">

      {/* Nav */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-[#ebebeb] bg-white">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[13px] text-[#9b9b9b] hover:text-[#1a1a1a] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Назад
        </button>
        <button onClick={onBack} className="text-[14px] font-bold text-[#1a1a1a] tracking-[0.06em] hover:text-[#4b4b4b] transition-colors">ПАМЯТЬ</button>
        <div className="w-16" />
      </header>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-[380px]">

          {/* Company badge */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center shrink-0">
              <span className="text-white text-[16px] font-bold leading-none">П</span>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-[#1a1a1a]">ООО «Память Урал»</p>
              <p className="text-[11px] text-[#9b9b9b]">Производство памятников</p>
            </div>
          </div>

          <div className="bg-white border border-[#ebebeb] rounded-2xl p-8 shadow-sm">
            <h1 className="text-[20px] font-bold text-[#1a1a1a] tracking-tight mb-1.5">Вход в систему</h1>
            <p className="text-[13px] text-[#9b9b9b] mb-7">Используйте данные вашей учётной записи</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-[#9b9b9b] uppercase tracking-wide block mb-1.5">
                  Логин
                </label>
                <input
                  value={login}
                  onChange={e => { setLogin(e.target.value); setError(""); }}
                  placeholder="Введите логин"
                  autoComplete="username"
                  className={`w-full bg-[#fafafa] border rounded-[10px] px-4 py-3 text-[14px] text-[#1a1a1a] placeholder:text-[#c5c5c5] outline-none transition-colors
                    ${error ? "border-red-300 focus:border-red-400" : "border-[#ebebeb] focus:border-[#b0b0b0]"}`}
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#9b9b9b] uppercase tracking-wide block mb-1.5">
                  Пароль
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full bg-[#fafafa] border rounded-[10px] px-4 py-3 text-[14px] text-[#1a1a1a] placeholder:text-[#c5c5c5] outline-none transition-colors
                    ${error ? "border-red-300 focus:border-red-400" : "border-[#ebebeb] focus:border-[#b0b0b0]"}`}
                />
              </div>

              {error && (
                <p className="text-[12px] text-red-500 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-red-400 shrink-0" />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 text-[14px] font-semibold py-3 rounded-[10px] transition-all mt-2
                  ${loading ? "bg-[#4b4b4b] text-white cursor-not-allowed" : "bg-[#1a1a1a] text-white hover:bg-[#333] active:scale-[0.98]"}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <circle cx="7.5" cy="7.5" r="6" stroke="white" strokeWidth="1.5" strokeDasharray="28" strokeDashoffset="10" strokeLinecap="round"/>
                    </svg>
                    Вход...
                  </>
                ) : "Войти"}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#f5f5f5] text-center">
              <p className="text-[11px] text-[#b5b5b5]">Логин: <span className="font-semibold text-[#9b9b9b]">123</span> · Пароль: <span className="font-semibold text-[#9b9b9b]">123</span></p>
            </div>
          </div>

          <p className="text-[11px] text-[#c5c5c5] text-center mt-5">
            Проблемы со входом? Обратитесь к администратору системы
          </p>
        </div>
      </div>
    </div>
  );
}