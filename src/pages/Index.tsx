import { useState, useMemo, useEffect } from "react";
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
import { Role, ROLES } from "@/components/RoleSelect";
import NewOrderPage from "@/components/pages/NewOrderPage";
import EstimatePage from "@/components/pages/EstimatePage";
import CatalogPage from "@/components/pages/CatalogPage";
import CuttingPage from "@/components/pages/CuttingPage";
import BlankAnalyticsPage from "@/components/pages/BlankAnalyticsPage";
import SketchesPage from "@/components/pages/SketchesPage";
import DashboardPage from "@/components/pages/DashboardPage";
import AdminPage from "@/components/AdminPage";
import CompanyEntryPage from "@/components/CompanyEntryPage";
import EmployeesPage from "@/components/pages/EmployeesPage";
import { authApi } from "@/api/client";
import { useAuth } from "@/store/authStore";

type Section = "dashboard" | "overview" | "orders" | "production" | "cutting" | "warehouse" | "clients" | "analytics" | "estimate" | "catalog" | "settings" | "blank-analytics" | "sketches" | "employees";

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
      { id: "orders",   label: "Заказы",    icon: "FileText" },
      { id: "clients",  label: "Заказчики", icon: "Users" },
      { id: "catalog",  label: "Каталог",   icon: "BookOpen" },
    ],
  },
  {
    group: "Производство",
    color: "#f59e0b",
    hoverBg: "#fffbeb",
    activeBg: "#fef3c7",
    items: [
      { id: "cutting",    label: "Заготовки",    icon: "Scissors" },
      { id: "sketches",   label: "Эскизы",       icon: "PenTool"  },
      { id: "production", label: "Изготовление", icon: "Hammer"   },
    ],
  },
  {
    group: "Склад",
    color: "#6b7280",
    hoverBg: "#f5f5f5",
    activeBg: "#ebebeb",
    items: [
      { id: "warehouse", label: "Склад", icon: "Package" },
    ],
  },
  {
    group: "Инструменты",
    color: "#2563eb",
    hoverBg: "#eff6ff",
    activeBg: "#e0e7ff",
    items: [
      { id: "analytics", label: "Аналитика",  icon: "BarChart2"  },
      { id: "estimate",  label: "Калькулятор",icon: "Calculator" },
    ],
  },
  {
    group: "Система",
    color: "#9b9b9b",
    hoverBg: "#f5f5f5",
    activeBg: "#ebebeb",
    items: [
      { id: "employees", label: "Сотрудники", icon: "Users" },
      { id: "settings",  label: "Настройки",  icon: "Settings" },
    ],
  },
];

const ROLE_NAV: Record<Role, Section[]> = {
  manager:    ["dashboard", "orders", "catalog", "clients", "estimate"],
  estimator:  ["orders", "catalog", "estimate", "warehouse", "analytics"],
  production: ["cutting", "sketches", "production", "warehouse", "analytics"],
  accountant: ["orders", "clients", "analytics"],
  owner:      ["dashboard", "orders", "cutting", "sketches", "production", "catalog", "warehouse", "clients", "analytics", "estimate", "employees", "settings"],
};

const ROLE_DEFAULT: Record<Role, Section> = {
  manager:    "dashboard",
  estimator:  "estimate",
  production: "production",
  accountant: "orders",
  owner:      "dashboard",
};

type AppScreen = "entry" | "app";

export default function Index() {
  /* Определяем режим из URL */
  const urlParams  = new URLSearchParams(window.location.search);
  const slugParam  = urlParams.get("company");
  const isAdmin    = urlParams.get("admin") !== null;

  const { checkAuth, login: authLogin } = useAuth();

  const [screen,   setScreen]   = useState<AppScreen>("entry");
  const [role,     setRole]     = useState<Role>("owner");
  const [active,   setActive]   = useState<Section>("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const [openCuttingTaskId, setOpenCuttingTaskId] = useState<string | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [aiOpen,   setAiOpen]   = useState(false);
  const [companyName, setCompanyName] = useState<string>("");

  /* Проверяем сохранённый токен при старте */
  useEffect(() => {
    const token = localStorage.getItem("crm_token");
    if (!token) return;
    authApi.me()
      .then(({ user }) => {
        setRole(user.role as Role);
        setActive(ROLE_DEFAULT[user.role as Role] ?? "dashboard");
        setCompanyName(user.companyName ?? "");
        setScreen("app");
        /* Синхронизируем с AuthContext чтобы useAuth().user работал везде */
        checkAuth();
      })
      .catch(() => localStorage.removeItem("crm_token"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = (_token: string) => {
    authApi.me()
      .then(({ user }) => {
        setRole(user.role as Role);
        setActive(ROLE_DEFAULT[user.role as Role] ?? "dashboard");
        setCompanyName(user.companyName ?? "");
        setScreen("app");
        checkAuth();
      })
      .catch(() => localStorage.removeItem("crm_token"));
  };

  const handleLogout = () => {
    localStorage.removeItem("crm_token");
    setScreen("entry");
    setCompanyName("");
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
    openCuttingTask: (taskId: string) => {
      setActive("cutting");
      setOpenOrder(null);
      setCreatingOrder(false);
      setOpenCuttingTaskId(taskId);
    },
  }), []);

  /* Админка */
  if (isAdmin) return <AdminPage />;

  /* Вход по slug компании */
  if (screen === "entry" && slugParam) {
    return <CompanyEntryPage slug={slugParam} onLogin={handleLogin} />;
  }

  /* Нет токена и нет slug — показываем заглушку */
  if (screen === "entry") {
    return (
      <div className="min-h-screen bg-[#f6f7f9] flex items-center justify-center font-golos">
        <div className="text-center max-w-[360px] px-4">
          <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] flex items-center justify-center mx-auto mb-5">
            <span className="text-white text-[22px] font-bold">П</span>
          </div>
          <h1 className="text-[20px] font-bold text-[#1a1a1a] mb-2">ПАМЯТЬ</h1>
          <p className="text-[14px] text-[#9b9b9b] mb-6">Система управления производством</p>
          <p className="text-[13px] text-[#b5b5b5]">Перейдите по ссылке вашей компании для входа</p>
        </div>
      </div>
    );
  }

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
      case "cutting":    return <CuttingPage openTaskId={openCuttingTaskId} onTaskOpened={() => setOpenCuttingTaskId(null)} />;
      case "warehouse":  return <WarehousePage />;
      case "clients":    return <ClientsPage />;
      case "analytics":  return <AnalyticsPage />;
      case "estimate":   return <EstimatePage />;
      case "catalog":          return <CatalogPage canEdit={role === "estimator" || role === "owner"} />;
      case "blank-analytics":  return <BlankAnalyticsPage />;
      case "employees":        return <EmployeesPage />;
      case "settings":         return <SettingsPage />;
    }
  };

  /* Группы с пунктами для текущей роли */
  const visibleGroups = NAV_GROUPS
    .map(g => ({ ...g, items: g.items.filter(i => ROLE_NAV[role].includes(i.id)) }))
    .filter(g => g.items.length > 0);

  /* Группы без метки сверху (одиночные или с особым поведением) */
  const SOLO_GROUPS = new Set(["Главная", "Склад", "Система"]);

  return (
    <NavContext.Provider value={navValue}>
    <div className="flex h-screen font-golos overflow-hidden bg-white">

      {/* ── Sidebar ── */}
      <aside className={`flex flex-col bg-[#f4f4f5] transition-all duration-200 shrink-0 ${collapsed ? "w-[60px]" : "w-[210px]"}`}>

        {/* Логотип */}
        <div className={`flex items-center shrink-0 ${collapsed ? "justify-center h-[64px]" : "px-4 py-3 gap-3"}`}>
          <img
            src="https://cdn.poehali.dev/projects/4e0e07db-0b5c-4868-8b3d-3bd655c50b19/bucket/0246c54c-eecf-476c-a002-30b881a57acf.png"
            alt="Память"
            className="shrink-0 object-contain rounded-lg"
            style={{ width: collapsed ? 36 : 40, height: collapsed ? 36 : 40 }}
          />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-[#1a1a1a] leading-tight tracking-tight">ПАМЯТЬ</p>
              <p className="text-[9px] text-[#9b9b9b] leading-tight tracking-wide uppercase font-medium">система производства и продаж</p>
            </div>
          )}
        </div>

        {/* Навигация */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-2 space-y-1">
          {visibleGroups.map((group, gi) => {
            const isSolo = SOLO_GROUPS.has(group.group);
            return (
              <div key={group.group}>
                {/* Метка группы */}
                {!collapsed && !isSolo && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#b0b0b0] px-3 pt-3 pb-1 select-none">
                    {group.group}
                  </p>
                )}
                {!collapsed && isSolo && gi > 0 && (
                  <div className="h-px bg-[#e4e4e6] mx-3 my-2" />
                )}

                {/* Пункты */}
                <div className="space-y-0.5">
                  {group.items.map(item => {
                    const isActive = active === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        title={collapsed ? item.label : undefined}
                        className={`relative w-full flex items-center transition-all duration-150 outline-none
                          ${collapsed ? "justify-center h-10 rounded-xl" : "gap-2.5 px-3 py-2.5 rounded-xl"}
                          ${isActive
                            ? "bg-white text-[#1a1a1a] shadow-[0_1px_4px_rgba(0,0,0,0.10)]"
                            : "text-[#6b6b6b] hover:bg-white/60 hover:text-[#1a1a1a]"
                          }`}
                      >
                        <Icon
                          name={item.icon as never}
                          size={15}
                          className="shrink-0"
                          style={{ color: isActive ? "#1a1a1a" : undefined }}
                        />
                        {!collapsed && (
                          <span className={`text-[13px] truncate ${isActive ? "font-semibold" : "font-medium"}`}>
                            {item.label}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Нижняя часть: роль + выйти + свернуть */}
        <div className="pb-3 px-2 space-y-0.5">
          <div className="h-px bg-[#e4e4e6] mx-1 mb-2" />
          <div
            title={collapsed ? currentRole.label : undefined}
            className={`w-full flex items-center gap-2.5 rounded-xl py-2 px-3 ${collapsed ? "justify-center px-0" : ""}`}
          >
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: currentRole.color }}>
              <Icon name={currentRole.icon as never} size={11} className="text-white" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-[#1a1a1a] truncate leading-tight">{currentRole.label}</p>
                {companyName && <p className="text-[10px] text-[#9b9b9b] truncate leading-tight">{companyName}</p>}
              </div>
            )}
            {!collapsed && (
              <button onClick={handleLogout} title="Выйти" className="shrink-0 text-[#c0c0c0] hover:text-red-400 transition-colors">
                <Icon name="LogOut" size={13} />
              </button>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full flex items-center gap-2.5 rounded-xl py-2 text-[#b0b0b0] hover:bg-white/60 hover:text-[#6b6b6b] transition-colors
              ${collapsed ? "justify-center px-0" : "px-3"}`}
          >
            <Icon name={collapsed ? "PanelLeftOpen" : "PanelLeftClose"} size={13} className="shrink-0" />
            {!collapsed && <span className="text-[12px]">Свернуть</span>}
          </button>
        </div>
      </aside>

      {/* ── Рабочая область ── */}
      <div className="flex-1 overflow-hidden min-w-0 relative bg-white flex flex-col border-l border-[#e8e8e8]">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {renderMain()}
        </div>

        {/* AI FAB */}
        {!aiOpen && (
          <button
            onClick={() => setAiOpen(true)}
            className="absolute bottom-6 right-6 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
            style={{
              width: 48, height: 48,
              background: "linear-gradient(135deg, #1a1a1a 0%, #3a3a5c 60%, #1a1a1a 100%)",
              boxShadow: "0 0 16px 3px rgba(99,102,241,0.25), 0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            <span className="text-[18px] leading-none select-none">✦</span>
          </button>
        )}
      </div>

      <AiAssistant open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
    </NavContext.Provider>
  );
}