import { useState } from "react";
import Icon from "@/components/ui/icon";
import OverviewPage from "@/components/pages/OverviewPage";
import OrdersPage from "@/components/pages/OrdersPage";
import OrderDetailPage from "@/components/pages/OrderDetailPage";
import ProductionPage from "@/components/pages/ProductionPage";
import WarehousePage from "@/components/pages/WarehousePage";
import ClientsPage from "@/components/pages/ClientsPage";
import AnalyticsPage from "@/components/pages/AnalyticsPage";
import SettingsPage from "@/components/pages/SettingsPage";

type Section = "overview" | "orders" | "production" | "warehouse" | "clients" | "analytics" | "settings";

const nav: { id: Section; label: string; icon: string }[] = [
  { id: "overview", label: "Обзор", icon: "LayoutDashboard" },
  { id: "orders", label: "Заказы", icon: "FileText" },
  { id: "production", label: "Производство", icon: "Hammer" },
  { id: "warehouse", label: "Склад", icon: "Package" },
  { id: "clients", label: "Клиенты", icon: "Users" },
  { id: "analytics", label: "Аналитика", icon: "BarChart2" },
  { id: "settings", label: "Настройки", icon: "Settings" },
];

export default function Index() {
  const [active, setActive] = useState<Section>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [openOrder, setOpenOrder] = useState<string | null>(null);

  const handleNavClick = (id: Section) => {
    setActive(id);
    setOpenOrder(null);
  };

  const renderMain = () => {
    if (active === "orders" && openOrder) {
      return <OrderDetailPage onBack={() => setOpenOrder(null)} />;
    }
    switch (active) {
      case "overview":    return <OverviewPage />;
      case "orders":      return <OrdersPage onOpenOrder={(id) => setOpenOrder(id)} />;
      case "production":  return <ProductionPage />;
      case "warehouse":   return <WarehousePage />;
      case "clients":     return <ClientsPage />;
      case "analytics":   return <AnalyticsPage />;
      case "settings":    return <SettingsPage />;
    }
  };

  return (
    <div className="flex h-screen bg-[#fafafa] font-golos overflow-hidden">
      <aside
        className={`flex flex-col border-r border-[#ebebeb] bg-white transition-all duration-300 shrink-0 ${collapsed ? "w-[56px]" : "w-[220px]"}`}
      >
        <div className={`flex items-center h-[56px] border-b border-[#ebebeb] ${collapsed ? "justify-center" : "px-4 gap-2"}`}>
          <div className="w-6 h-6 rounded-[6px] bg-[#1a1a1a] flex items-center justify-center shrink-0">
            <span className="text-white text-[11px] font-bold leading-none">М</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-[14px] text-[#1a1a1a] tracking-tight whitespace-nowrap">МемориалCRM</span>
          )}
        </div>

        <nav className="flex-1 py-2 px-2 flex flex-col gap-0.5 overflow-hidden">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-2.5 rounded-[6px] h-8 transition-all duration-150 w-full text-left
                ${collapsed ? "justify-center px-0" : "px-2.5"}
                ${active === item.id
                  ? "bg-[#f0f0f0] text-[#1a1a1a] font-medium"
                  : "text-[#737373] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]"
                }
              `}
            >
              <Icon name={item.icon as never} size={15} className="shrink-0" />
              {!collapsed && <span className="text-[13px]">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="px-2 pb-3 border-t border-[#ebebeb] pt-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex items-center gap-2.5 rounded-[6px] h-8 text-[#9b9b9b] hover:text-[#1a1a1a] hover:bg-[#f5f5f5] transition-all w-full ${collapsed ? "justify-center px-0" : "px-2.5"}`}
          >
            <Icon name={collapsed ? "PanelLeftOpen" : "PanelLeftClose"} size={14} className="shrink-0" />
            {!collapsed && <span className="text-[13px]">Свернуть</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto min-w-0">
        {renderMain()}
      </main>
    </div>
  );
}
