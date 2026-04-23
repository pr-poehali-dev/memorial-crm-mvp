import { useState } from "react";
import Icon from "@/components/ui/icon";

export type Role = "manager" | "estimator" | "production" | "accountant" | "owner";

export const ROLES: {
  id: Role;
  label: string;
  description: string;
  icon: string;
  access: string[];
  focus: string;
  color: string;
  bg: string;
  badge: string;
}[] = [
  {
    id: "manager",
    label: "Менеджер",
    description: "Создание и ведение заказов, работа с клиентами",
    icon: "Briefcase",
    access: ["Обзор", "Заказы", "Клиенты"],
    focus: "Создание заказов и коммуникация с клиентами",
    color: "#6366f1",
    bg: "#eef2ff",
    badge: "Продажи",
  },
  {
    id: "estimator",
    label: "Сметчик",
    description: "Расчёт стоимости, работа со сметами и материалами",
    icon: "Calculator",
    access: ["Заказы", "Склад", "Аналитика"],
    focus: "Калькуляция и расчёт стоимости заказов",
    color: "#f59e0b",
    bg: "#fffbeb",
    badge: "Расчёты",
  },
  {
    id: "production",
    label: "Производство",
    description: "Управление этапами изготовления памятников",
    icon: "Hammer",
    access: ["Производство", "Склад"],
    focus: "Контроль этапов и движение заказов по производству",
    color: "#ec4899",
    bg: "#fdf2f8",
    badge: "Цех",
  },
  {
    id: "accountant",
    label: "Бухгалтер",
    description: "Оплаты, долги и финансовый контроль",
    icon: "Wallet",
    access: ["Обзор", "Заказы", "Клиенты", "Аналитика"],
    focus: "Финансы, оплаты и задолженности клиентов",
    color: "#14b8a6",
    bg: "#f0fdfa",
    badge: "Финансы",
  },
  {
    id: "owner",
    label: "Владелец",
    description: "Полный доступ ко всем разделам и аналитике",
    icon: "Crown",
    access: ["Обзор", "Заказы", "Производство", "Склад", "Клиенты", "Аналитика", "Настройки"],
    focus: "Полный контроль бизнеса и управление командой",
    color: "#1a1a1a",
    bg: "#f5f5f5",
    badge: "Весь доступ",
  },
];

export default function RoleSelect({ onSelect }: { onSelect: (role: Role) => void }) {
  const [hovered, setHovered] = useState<Role | null>(null);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-6 py-12 font-golos">

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-8 h-8 rounded-[8px] bg-[#1a1a1a] flex items-center justify-center">
          <span className="text-white text-[14px] font-bold leading-none">М</span>
        </div>
        <span className="text-[18px] font-semibold text-[#1a1a1a] tracking-tight">МемориалCRM</span>
      </div>

      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-[28px] font-bold text-[#1a1a1a] tracking-tight mb-2">Выберите режим работы</h1>
        <p className="text-[15px] text-[#9b9b9b]">Интерфейс адаптируется под вашу роль в компании</p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-5 gap-3 w-full max-w-[900px] mb-8">
        {ROLES.map((role) => {
          const isHovered = hovered === role.id;
          return (
            <button
              key={role.id}
              onClick={() => onSelect(role.id)}
              onMouseEnter={() => setHovered(role.id)}
              onMouseLeave={() => setHovered(null)}
              className={`flex flex-col items-center text-center p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer group
                ${isHovered
                  ? "border-current shadow-lg -translate-y-1"
                  : "border-[#ebebeb] bg-white hover:shadow-md"
                }`}
              style={isHovered ? { borderColor: role.color, backgroundColor: role.bg } : {}}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all"
                style={{ backgroundColor: isHovered ? role.color : "#f0f0f0" }}>
                <Icon name={role.icon as never} size={22}
                  className="transition-colors"
                  style={{ color: isHovered ? "#fff" : "#9b9b9b" }} />
              </div>

              {/* Label */}
              <p className="text-[15px] font-bold text-[#1a1a1a] mb-1">{role.label}</p>

              {/* Badge */}
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2.5 transition-all"
                style={{
                  backgroundColor: isHovered ? role.color + "20" : "#f5f5f5",
                  color: isHovered ? role.color : "#9b9b9b",
                }}>
                {role.badge}
              </span>

              {/* Description */}
              <p className="text-[11px] text-[#9b9b9b] leading-snug">{role.description}</p>

              {/* Access pills */}
              <div className="flex flex-wrap justify-center gap-1 mt-3">
                {role.access.slice(0, 3).map((a) => (
                  <span key={a} className="text-[10px] px-1.5 py-0.5 rounded-md font-medium transition-all"
                    style={{
                      backgroundColor: isHovered ? role.color + "15" : "#f5f5f5",
                      color: isHovered ? role.color : "#b5b5b5",
                    }}>
                    {a}
                  </span>
                ))}
                {role.access.length > 3 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium text-[#b5b5b5] bg-[#f5f5f5]">
                    +{role.access.length - 3}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Focus hint */}
      <div className="h-10 flex items-center">
        {hovered && (
          <div className="flex items-center gap-2 text-[13px] text-[#6b6b6b] animate-fade-in">
            <Icon name="Lightbulb" size={14} className="text-[#f59e0b]" />
            <span className="font-medium text-[#1a1a1a]">{ROLES.find(r => r.id === hovered)?.label}:</span>
            {ROLES.find(r => r.id === hovered)?.focus}
          </div>
        )}
      </div>

      <p className="text-[12px] text-[#c5c5c5] mt-4">
        Роль можно сменить в любой момент внутри системы
      </p>
    </div>
  );
}
