import { useState, useMemo } from "react";
import { NavContext } from "@/store/navStore";
import Icon from "@/components/ui/icon";
import OverviewPage from "@/components/pages/OverviewPage";
import OrdersPage from "@/components/pages/OrdersPage";
import OrderDetailPage from "@/components/pages/OrderDetailPage";
import ProductionPage from "@/components/pages/ProductionPage";
import WarehousePage from "@/components/pages/WarehousePage";
import ClientsPage from "@/components/pages/ClientsPage";

import AnalyticsPage from "@/components/pages/AnalyticsPage";
import SettingsPage from "@/components/pages/SettingsPage";
import AiAssistant from "@/components/AiAssistant";
import RoleSelect, { Role, ROLES } from "@/components/RoleSelect";
import LandingPage from "@/components/LandingPage";
import LoginPage from "@/components/LoginPage";
import NewOrderPage from "@/components/pages/NewOrderPage";
import EstimatePage from "@/components/pages/EstimatePage";
import CatalogPage from "@/components/pages/CatalogPage";

import CuttingPage from "@/components/pages/CuttingPage";
import BlankAnalyticsPage from "@/components/pages/BlankAnalyticsPage";
import SketchesPage from "@/components/pages/SketchesPage";
import DashboardPage from "@/components/pages/DashboardPage";

type Section = "dashboard" | "overview" | "orders" | "production" | "cutting" | "warehouse" | "clients" | "analytics" | "estimate" | "catalog" | "settings" | "blank-analytics" | "sketches";

type NavItem = { id: Section; label: string; icon: string; sub?: string };
type NavGroup = { group: string; color: string; hoverBg: string; activeBg: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    group: "Главная",
    color: "#1a1a1a",
    hoverBg: "#f5f5f5",
    activeBg: "#1a1a1a",
    items: [
      { id: "dashboard", label: "Главная", icon: "LayoutDashboard" },
    ],
  },
  {
    group: "Продажи",
    color: "#3b82f6",
    hoverBg: "#eff6ff",
    activeBg: "#dbeafe",
    items: [
      { id: "orders",   label: "Заказы",      icon: "FileText",   sub: "Учёт и статусы" },
      { id: "clients",  label: "Заказчики",    icon: "Users",      sub: "База заказчиков" },
      { id: "estimate", label: "Калькулятор", icon: "Calculator", sub: "Расчёт стоимости" },
      { id: "catalog",  label: "Каталог",     icon: "BookOpen",   sub: "Изделия и цены" },
    ],
  },
  {
    group: "Производство",
    color: "#f59e0b",
    hoverBg: "#fffbeb",
    activeBg: "#fef3c7",
    items: [
      { id: "cutting",    label: "Заготовки",    icon: "Scissors", sub: "Распил и учёт смен" },
      { id: "sketches",   label: "Эскизы",       icon: "PenTool",  sub: "Разработка эскизов" },
      { id: "production", label: "Изготовление", icon: "Hammer",   sub: "Гравировка, полировка, готово" },
    ],
  },
  {
    group: "Склад",
    color: "#6b7280",
    hoverBg: "#f5f5f5",
    activeBg: "#ebebeb",
    items: [
      { id: "warehouse", label: "Склад", icon: "Package", sub: "Сырьё и заготовки" },
    ],
  },
  {
    group: "Аналитика",
    color: "#6366f1",
    hoverBg: "#eef2ff",
    activeBg: "#e0e7ff",
    items: [
      { id: "analytics", label: "Аналитика", icon: "BarChart2", sub: "Отчёты и статистика" },
    ],
  },
  {
    group: "Система",
    color: "#9b9b9b",
    hoverBg: "#f5f5f5",
    activeBg: "#ebebeb",
    items: [
      { id: "settings", label: "Настройки", icon: "Settings", sub: "Конфигурация" },
    ],
  },
];

const ROLE_NAV: Record<Role, Section[]> = {
  manager:    ["dashboard", "orders", "catalog", "clients"],
  estimator:  ["orders", "catalog", "estimate", "warehouse", "analytics"],
  production: ["cutting", "sketches", "production", "warehouse", "analytics"],
  accountant: ["orders", "clients", "analytics"],
  owner:      ["dashboard", "orders", "cutting", "sketches", "production", "catalog", "warehouse", "clients", "analytics", "estimate", "settings"],
};

const ROLE_DEFAULT: Record<Role, Section> = {
  manager:    "dashboard",
  estimator:  "estimate",
  production: "production",
  accountant: "orders",
  owner:      "dashboard",
};

type AppScreen = "landing" | "login" | "role-select" | "app";

export default function Index() {
  const [screen, setScreen]     = useState<AppScreen>("app");
  const [role, setRole]         = useState<Role | null>("owner");
  const [active, setActive]     = useState<Section>("dashboard");
  const [collapsed, setCollapsed]   = useState(false);
  const [openOrder, setOpenOrder]   = useState<string | null>(null);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [creatingOrder, setCreatingOrder]   = useState(false);
  const [aiOpen, setAiOpen]               = useState(false);
  const handleRoleSelect = (r: Role) => {
    setRole(r);
    setActive(ROLE_DEFAULT[r]);
    setOpenOrder(null);
    setScreen("app");
  };

  const handleNavClick = (id: Section) => {
    setActive(id);
    setOpenOrder(null);
    setCreatingOrder(false);
  };

  const navValue = useMemo(() => ({
    openOrder: (orderId: string) => {
      setActive("orders");
      setOpenOrder(orderId);
      setCreatingOrder(false);
    },
  }), []);

  if (screen === "landing") return <LandingPage onStart={() => setScreen("login")} />;
  if (screen === "login")   return <LoginPage onLogin={() => setScreen("role-select")} onBack={() => setScreen("landing")} />;
  if (screen === "role-select") return <RoleSelect onSelect={handleRoleSelect} />;

  const currentRole = ROLES.find((r) => r.id === role)!;

  const renderMain = () => {
    if (creatingOrder) return <NewOrderPage onBack={() => setCreatingOrder(false)} />;
    if (active === "orders" && openOrder) return <OrderDetailPage onBack={() => setOpenOrder(null)} />;
    switch (active) {
      case "dashboard":  return <DashboardPage onNavigate={(s) => handleNavClick(s as Section)} />;
      case "overview":   return <OverviewPage />;
      case "orders":     return <OrdersPage onOpenOrder={(id) => setOpenOrder(id)} onNewOrder={() => setCreatingOrder(true)} />;
      case "sketches":   return <SketchesPage />;
      case "production": return <ProductionPage />;
      case "cutting":    return <CuttingPage />;
      case "warehouse":  return <WarehousePage />;
      case "clients":    return <ClientsPage />;
      case "analytics":  return <AnalyticsPage />;
      case "estimate":   return <EstimatePage />;
      case "catalog":          return <CatalogPage canEdit={role === "estimator" || role === "owner"} />;
      case "blank-analytics":  return <BlankAnalyticsPage />;
      case "settings":         return <SettingsPage />;
    }
  };

  /* Все nav-пункты текущей роли — плоский список */
  const flatNav = NAV_GROUPS.flatMap(g => g.items).filter(i => ROLE_NAV[role].includes(i.id));

  /* Разделители: перед «Аналитика» и «Настройки» */
  const DIVIDER_BEFORE = new Set(["analytics", "settings"]);

  return (
    <NavContext.Provider value={navValue}>
    <div className="flex h-screen font-golos overflow-hidden bg-[#f5f5f7]">

      {/* ── Sidebar ── */}
      <aside className={`flex flex-col bg-white border-r border-[#e8e8e8] transition-all duration-200 shrink-0 ${collapsed ? "w-[52px]" : "w-[200px]"}`}>

        {/* Логотип / название */}
        <div className={`flex items-center h-[52px] border-b border-[#f0f0f0] shrink-0 ${collapsed ? "justify-center px-0" : "px-4 gap-2.5"}`}>
          <div className="w-7 h-7 rounded-lg bg-[#1a1a1a] flex items-center justify-center shrink-0">
            <span className="text-white text-[13px] font-bold select-none">П</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[#1a1a1a] truncate leading-tight">pio-admin</p>
            </div>
          )}
        </div>

        {/* Навигация — плоский список */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2 space-y-0.5">
          {flatNav.map((item) => {
            const isActive = active === item.id;
            const showDivider = DIVIDER_BEFORE.has(item.id);
            return (
              <div key={item.id}>
                {showDivider && <div className="my-1.5 mx-1 h-px bg-[#f0f0f0]" />}
                <button
                  onClick={() => handleNavClick(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-2.5 rounded-[6px] transition-all duration-150
                    ${collapsed ? "justify-center h-9 px-0" : "px-3 py-2"}
                    ${isActive
                      ? "bg-[#1a1a1a] text-white"
                      : "text-[#6b6b6b] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]"
                    }`}
                >
                  <Icon
                    name={item.icon as never}
                    size={15}
                    className="shrink-0"
                  />
                  {!collapsed && (
                    <span className="text-[13px] font-medium leading-none truncate">{item.label}</span>
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Роль + сворачивание */}
        <div className="border-t border-[#f0f0f0] py-2 px-2 space-y-0.5">
          <button
            onClick={() => setShowRolePicker(true)}
            className={`w-full flex items-center gap-2.5 rounded-[6px] py-2 hover:bg-[#f5f5f5] transition-colors
              ${collapsed ? "justify-center px-0" : "px-3"}`}
            title={collapsed ? currentRole.label : undefined}
          >
            <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: currentRole.color }}>
              <Icon name={currentRole.icon as never} size={12} className="text-white" />
            </div>
            {!collapsed && (
              <span className="text-[12px] font-medium text-[#6b6b6b] truncate flex-1 text-left">{currentRole.label}</span>
            )}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center gap-2.5 rounded-[6px] py-2 text-[#b5b5b5] hover:bg-[#f5f5f5] hover:text-[#6b6b6b] transition-colors
              ${collapsed ? "justify-center px-0" : "px-3"}`}
          >
            <Icon name={collapsed ? "PanelLeftOpen" : "PanelLeftClose"} size={14} className="shrink-0" />
            {!collapsed && <span className="text-[12px]">Свернуть</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-hidden min-w-0 relative flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {renderMain()}
        </div>

        {/* AI FAB */}
        {!aiOpen && (
          <button
            onClick={() => setAiOpen(true)}
            className="absolute bottom-6 right-6 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
            style={{
              width: 52, height: 52,
              background: "linear-gradient(135deg, #1a1a1a 0%, #3a3a5c 60%, #1a1a1a 100%)",
              boxShadow: "0 0 20px 4px rgba(99,102,241,0.3), 0 4px 14px rgba(0,0,0,0.25)",
            }}
          >
            <span className="text-[20px] leading-none select-none">✦</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-[9px] font-bold text-white">3</span>
            </span>
          </button>
        )}
      </main>

      <AiAssistant open={aiOpen} onClose={() => setAiOpen(false)} />

      {/* Role picker modal */}
      {showRolePicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowRolePicker(false)}>
          <div className="bg-white rounded-2xl border border-[#ebebeb] shadow-2xl p-6 w-full max-w-[820px] animate-scale-in"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[17px] font-semibold text-[#1a1a1a]">Сменить роль</h2>
                <p className="text-[12px] text-[#9b9b9b] mt-0.5">Интерфейс адаптируется автоматически</p>
              </div>
              <button onClick={() => setShowRolePicker(false)} className="text-[#b5b5b5] hover:text-[#1a1a1a] transition-colors">
                <Icon name="X" size={16} />
              </button>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {ROLES.map((r) => {
                const isCurrent = r.id === role;
                return (
                  <button key={r.id}
                    onClick={() => { handleRoleSelect(r.id); setShowRolePicker(false); }}
                    className={`flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all
                      ${isCurrent ? "shadow-sm" : "border-[#ebebeb] hover:border-[#d0d0d0] hover:shadow-sm"}`}
                    style={isCurrent ? { borderColor: r.color, backgroundColor: r.bg } : {}}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2.5"
                      style={{ backgroundColor: isCurrent ? r.color : "#f0f0f0" }}>
                      <Icon name={r.icon as never} size={18} style={{ color: isCurrent ? "#fff" : "#9b9b9b" }} />
                    </div>
                    <p className="text-[13px] font-semibold text-[#1a1a1a] mb-1">{r.label}</p>
                    <p className="text-[10px] text-[#9b9b9b] leading-snug">{r.description}</p>
                    {isCurrent && (
                      <span className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: r.color + "20", color: r.color }}>
                        текущая
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
    </NavContext.Provider>
  );
}