import { useState } from "react";
import Icon from "@/components/ui/icon";
import OverviewPage from "@/components/pages/OverviewPage";
import OrdersPage from "@/components/pages/OrdersPage";
import OrderDetailPage from "@/components/pages/OrderDetailPage";
import ProductionPage from "@/components/pages/ProductionPage";
import WarehousePage from "@/components/pages/WarehousePage";
import ClientsPage from "@/components/pages/ClientsPage";
import ClientDetailPage from "@/components/pages/ClientDetailPage";
import AnalyticsPage from "@/components/pages/AnalyticsPage";
import SettingsPage from "@/components/pages/SettingsPage";
import AiAssistant from "@/components/AiAssistant";
import RoleSelect, { Role, ROLES } from "@/components/RoleSelect";
import LandingPage from "@/components/LandingPage";
import LoginPage from "@/components/LoginPage";
import NewOrderPage from "@/components/pages/NewOrderPage";
import EstimatePage from "@/components/pages/EstimatePage";
import CatalogPage from "@/components/pages/CatalogPage";
import Logo, { LogoCompact } from "@/components/Logo";
import CuttingPage from "@/components/pages/CuttingPage";
import BlankAnalyticsPage from "@/components/pages/BlankAnalyticsPage";

type Section = "overview" | "orders" | "production" | "cutting" | "warehouse" | "clients" | "analytics" | "estimate" | "catalog" | "settings" | "blank-analytics";

type NavItem = { id: Section; label: string; icon: string; sub?: string };
type NavGroup = { group: string; color: string; hoverBg: string; activeBg: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    group: "Продажи",
    color: "#3b82f6",
    hoverBg: "#eff6ff",
    activeBg: "#dbeafe",
    items: [
      { id: "orders",   label: "Заказы",      icon: "FileText",   sub: "Учёт и статусы" },
      { id: "clients",  label: "Клиенты",     icon: "Users",      sub: "База покупателей" },
      { id: "estimate", label: "Калькулятор", icon: "Calculator", sub: "Расчёт стоимости" },
      { id: "catalog",  label: "Каталог",     icon: "BookOpen",   sub: "Изделия и цены" },
    ],
  },
  {
    group: "Цех",
    color: "#f59e0b",
    hoverBg: "#fffbeb",
    activeBg: "#fef3c7",
    items: [
      { id: "cutting",         label: "Заготовки",       icon: "Scissors",  sub: "Распил и учёт смен" },
      { id: "production",      label: "Производство",    icon: "Hammer",    sub: "Эскиз, гравировка, полировка" },
      { id: "warehouse",       label: "Склад",           icon: "Package",   sub: "Сырьё и заготовки" },
      { id: "analytics",       label: "Аналитика",       icon: "BarChart2", sub: "Отчёты и статистика" },
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

const ALL_NAV: NavItem[] = NAV_GROUPS.flatMap(g => g.items);

const ROLE_NAV: Record<Role, Section[]> = {
  manager:    ["orders", "catalog", "clients"],
  estimator:  ["orders", "catalog", "estimate", "warehouse", "analytics"],
  production: ["cutting", "production", "warehouse", "analytics"],
  accountant: ["orders", "clients", "analytics"],
  owner:      ["orders", "cutting", "production", "catalog", "warehouse", "clients", "analytics", "estimate", "settings"],
};

const ROLE_DEFAULT: Record<Role, Section> = {
  manager:    "orders",
  estimator:  "estimate",
  production: "production",
  accountant: "orders",
  owner:      "orders",
};

type AppScreen = "landing" | "login" | "role-select" | "app";

export default function Index() {
  const [screen, setScreen]     = useState<AppScreen>("app");
  const [role, setRole]         = useState<Role | null>("owner");
  const [active, setActive]     = useState<Section>("overview");
  const [collapsed, setCollapsed]   = useState(false);
  const [openOrder, setOpenOrder]   = useState<string | null>(null);
  const [openClient, setOpenClient] = useState<string | null>(null);
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [creatingOrder, setCreatingOrder]   = useState(false);
  const [aiOpen, setAiOpen]               = useState(false);
  const [openGroups, setOpenGroups]       = useState<Set<string>>(new Set());

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const handleRoleSelect = (r: Role) => {
    setRole(r);
    setActive(ROLE_DEFAULT[r]);
    setOpenOrder(null);
    setOpenClient(null);
    setScreen("app");
  };

  const handleNavClick = (id: Section) => {
    setActive(id);
    setOpenOrder(null);
    setOpenClient(null);
    setCreatingOrder(false);
    // auto-expand group containing this item
    const parentGroup = NAV_GROUPS.find(g => g.items.some(i => i.id === id));
    if (parentGroup) setOpenGroups(prev => new Set([...prev, parentGroup.group]));
  };

  if (screen === "landing") return <LandingPage onStart={() => setScreen("login")} />;
  if (screen === "login")   return <LoginPage onLogin={() => setScreen("role-select")} onBack={() => setScreen("landing")} />;
  if (screen === "role-select") return <RoleSelect onSelect={handleRoleSelect} />;

  const currentRole = ROLES.find((r) => r.id === role)!;

  const renderMain = () => {
    if (creatingOrder) return <NewOrderPage onBack={() => setCreatingOrder(false)} />;
    if (active === "orders" && openOrder)   return <OrderDetailPage onBack={() => setOpenOrder(null)} />;
    if (active === "clients" && openClient) return <ClientDetailPage clientId={openClient} onBack={() => setOpenClient(null)} />;
    switch (active) {
      case "overview":   return <OverviewPage />;
      case "orders":     return <OrdersPage onOpenOrder={(id) => setOpenOrder(id)} onNewOrder={() => setCreatingOrder(true)} />;
      case "production": return <ProductionPage />;
      case "cutting":    return <CuttingPage />;
      case "warehouse":  return <WarehousePage />;
      case "clients":    return <ClientsPage onOpenClient={(id) => setOpenClient(id)} />;
      case "analytics":  return <AnalyticsPage />;
      case "estimate":   return <EstimatePage />;
      case "catalog":          return <CatalogPage canEdit={role === "estimator" || role === "owner"} />;
      case "blank-analytics":  return <BlankAnalyticsPage />;
      case "settings":         return <SettingsPage />;
    }
  };

  return (
    <div className="flex h-screen bg-[#fafafa] font-golos overflow-hidden">

      {/* Sidebar */}
      <aside className={`flex flex-col border-r border-[#ebebeb] bg-white transition-all duration-300 shrink-0 ${collapsed ? "w-[56px]" : "w-[220px]"}`}>

        {/* Logo */}
        <button
          onClick={() => { setScreen("landing"); setRole(null); }}
          className={`flex items-center h-[56px] border-b border-[#ebebeb] hover:bg-[#fafafa] transition-colors w-full ${collapsed ? "justify-center px-0" : "px-4"}`}
        >
          {collapsed ? <Logo size="sm" iconOnly /> : <LogoCompact />}
        </button>

        {/* Role badge */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1">
            <button
              onClick={() => setShowRolePicker(true)}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[8px] border border-[#f0f0f0] hover:border-[#d5d5d5] transition-all group"
              style={{ backgroundColor: currentRole.bg }}
            >
              <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: currentRole.color }}>
                <Icon name={currentRole.icon as never} size={11} className="text-white" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-[11px] font-semibold truncate" style={{ color: currentRole.color }}>{currentRole.label}</p>
              </div>
              <Icon name="ChevronsUpDown" size={11} className="text-[#b5b5b5] group-hover:text-[#6b6b6b] shrink-0 transition-colors" />
            </button>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center py-2">
            <button onClick={() => setShowRolePicker(true)} title={currentRole.label}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
              style={{ backgroundColor: currentRole.color }}>
              <Icon name={currentRole.icon as never} size={13} className="text-white" />
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-2 px-2 flex flex-col overflow-y-auto overflow-x-hidden">
          {NAV_GROUPS.map((group, gi) => {
            const groupItems = group.items.filter(n => ROLE_NAV[role].includes(n.id));
            if (groupItems.length === 0) return null;
            const isOpen = openGroups.has(group.group);
            const hasActive = groupItems.some(i => i.id === active);

            const noCollapse = group.group === "Аналитика" || group.group === "Система";

            return (
              <div key={group.group} className={gi > 0 ? "mt-1" : ""}>

                {/* Заголовок группы */}
                {!collapsed && !noCollapse ? (
                  <button
                    onClick={() => toggleGroup(group.group)}
                    className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-[6px] hover:bg-[#f5f5f5] transition-colors group/hdr"
                  >
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest flex-1 text-left transition-colors"
                      style={{ color: hasActive ? group.color : "#c0c0c0" }}
                    >
                      {group.group}
                    </span>
                    <Icon
                      name={isOpen ? "ChevronDown" : "ChevronRight"}
                      size={11}
                      className="transition-all duration-200 text-[#d0d0d0] group-hover/hdr:text-[#9b9b9b]"
                    />
                  </button>
                ) : !collapsed && noCollapse ? (
                  <div className="mx-2 my-1.5 h-px bg-[#f0f0f0]" />
                ) : (
                  gi > 0 && <div className="mx-auto w-4 h-px bg-[#ebebeb] my-1.5" />
                )}

                {/* Пункты группы */}
                <div
                  className="flex flex-col gap-0.5 overflow-hidden transition-all duration-200"
                  style={{ maxHeight: (collapsed || isOpen || noCollapse) ? "400px" : "0px", opacity: (collapsed || isOpen || noCollapse) ? 1 : 0 }}
                >
                  {groupItems.map((item) => {
                    const isActive = active === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        title={collapsed ? item.label : undefined}
                        className={`relative flex items-center gap-2.5 rounded-[6px] transition-all duration-150 w-full text-left group/item
                          ${collapsed ? "justify-center h-8 px-0" : "px-2.5 py-1.5"}`}
                        style={{
                          backgroundColor: isActive ? group.activeBg : undefined,
                        }}
                        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = group.hoverBg; }}
                        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
                      >
                        {/* Активная полоска слева */}
                        {!collapsed && isActive && (
                          <span
                            className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full"
                            style={{ backgroundColor: group.color }}
                          />
                        )}

                        <Icon
                          name={item.icon as never}
                          size={15}
                          className="shrink-0 transition-colors duration-150"
                          style={{ color: isActive ? group.color : undefined }}
                        />

                        {!collapsed && (
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[13px] leading-tight transition-colors duration-150"
                              style={{ color: isActive ? group.color : undefined, fontWeight: isActive ? 500 : undefined }}
                            >
                              {item.label}
                            </p>
                            {item.sub && (
                              <p className="text-[10px] text-[#c5c5c5] leading-tight mt-0.5">{item.sub}</p>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-[#ebebeb] pt-2 pb-3 px-2 space-y-1">
          {!collapsed && (
            <div className="px-2.5 py-2 rounded-[6px]">
              <p className="text-[11px] font-semibold text-[#1a1a1a] leading-snug truncate">ООО «Память Урал»</p>
              <p className="text-[10px] text-[#b5b5b5]">Производство памятников</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex items-center gap-2.5 rounded-[6px] h-8 text-[#9b9b9b] hover:text-[#1a1a1a] hover:bg-[#f5f5f5] transition-all w-full ${collapsed ? "justify-center px-0" : "px-2.5"}`}
          >
            <Icon name={collapsed ? "PanelLeftOpen" : "PanelLeftClose"} size={14} className="shrink-0" />
            {!collapsed && <span className="text-[13px]">Свернуть</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto min-w-0 relative">
        {renderMain()}

        {/* AI FAB — внутри контент-зоны */}
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
  );
}