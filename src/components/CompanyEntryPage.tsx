import { useState, useEffect } from "react";
import { authApi } from "@/api/client";
import Icon from "@/components/ui/icon";

const ROLE_LABELS: Record<string, string> = {
  owner:      "Владелец",
  manager:    "Менеджер",
  production: "Производство",
  estimator:  "Сметчик",
  accountant: "Бухгалтер",
};

const ROLE_ICONS: Record<string, string> = {
  owner:      "Crown",
  manager:    "Briefcase",
  production: "Hammer",
  estimator:  "Calculator",
  accountant: "Wallet",
};

const ROLE_DESC: Record<string, string> = {
  owner:      "Полный доступ ко всем разделам",
  manager:    "Заказы, клиенты, аналитика",
  production: "Производство, заготовки",
  estimator:  "Сметы и каталог",
  accountant: "Финансы и отчёты",
};

type Member = { id: number; name: string; role: string };

type Props = {
  slug: string;
  onLogin: (token: string) => void;
};

export default function CompanyEntryPage({ slug, onLogin }: Props) {
  const [company,  setCompany]  = useState<{ id: number; name: string } | null>(null);
  const [members,  setMembers]  = useState<Member[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    authApi.getCompanyBySlug(slug)
      .then(co => {
        setCompany(co);
        return authApi.getCompanyRoles(slug);
      })
      .then(setMembers)
      .catch(() => setError("Компания не найдена. Проверьте ссылку."))
      .finally(() => setLoading(false));
  }, [slug]);

  const enter = async (memberId: number) => {
    setEntering(true);
    try {
      const { token } = await authApi.enterRole(memberId);
      localStorage.setItem("crm_token", token);
      onLogin(token);
    } catch {
      setError("Не удалось войти");
      setEntering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center font-golos">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-[13px] text-[#9b9b9b]">Загружаем...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center font-golos">
        <div className="text-center max-w-[320px]">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Icon name="AlertCircle" size={22} className="text-red-400" />
          </div>
          <p className="text-[15px] font-semibold text-[#1a1a1a] mb-2">Ссылка недействительна</p>
          <p className="text-[13px] text-[#9b9b9b]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9] flex flex-col items-center justify-center px-4 font-golos">
      <div className="w-full max-w-[420px]">

        {/* Логотип компании */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mb-3 shadow-lg">
            <span className="text-white text-[22px] font-bold leading-none">
              {company?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="text-[19px] font-bold text-[#1a1a1a] text-center">{company?.name}</h1>
          <p className="text-[13px] text-[#9b9b9b] mt-1">Добро пожаловать! Выберите вашу роль</p>
        </div>

        {/* Список ролей */}
        {members.length === 0 ? (
          <div className="bg-white border border-[#ebebeb] rounded-2xl p-8 text-center">
            <Icon name="Users" size={28} className="text-[#c0c0c0] mx-auto mb-3" />
            <p className="text-[14px] text-[#b0b0b0]">Нет доступных ролей</p>
            <p className="text-[12px] text-[#c5c5c5] mt-1">Обратитесь к администратору</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {members.map(m => (
              <button
                key={m.id}
                onClick={() => !entering && enter(m.id)}
                disabled={entering}
                className="w-full bg-white border border-[#ebebeb] rounded-2xl p-4 text-left flex items-center gap-4 hover:border-brand hover:shadow-sm transition-all group disabled:opacity-60"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-subtle border border-brand-border flex items-center justify-center shrink-0 group-hover:bg-brand-light transition-colors">
                  <Icon name={ROLE_ICONS[m.role] ?? "User"} size={18} className="text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#1a1a1a]">{m.name}</p>
                  <p className="text-[12px] text-[#9b9b9b]">
                    {ROLE_LABELS[m.role] ?? m.role}
                    <span className="mx-1.5 text-[#d0d0d0]">·</span>
                    {ROLE_DESC[m.role] ?? ""}
                  </p>
                </div>
                <Icon name="ChevronRight" size={16} className="text-[#c0c0c0] group-hover:text-brand shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        )}

        <p className="text-center text-[11px] text-[#c5c5c5] mt-6">
          Нет нужной роли? Обратитесь к администратору
        </p>
      </div>
    </div>
  );
}
