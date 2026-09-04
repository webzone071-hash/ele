import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import {
  LayoutDashboard,
  Layers,
  Briefcase,
  FolderKanban,
  ShoppingBag,
  Users,
  Repeat,
  MessageSquareQuote,
  Inbox,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  ShieldAlert,
  Globe,
  RefreshCw,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  const { user, logout } = useAuth();
  const { navigate, refreshData, data, settings, leads: contextLeads } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const leads = (contextLeads && contextLeads.length > 0) ? contextLeads : (data?.leads || []);
  const newLeadsCount = leads.filter((l) => l.status === "new").length;

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    {
      id: "visitors",
      label: "Visitor Traffic & Geo",
      icon: Globe,
      badge: "Live",
    },
    {
      id: "security",
      label: "Anti-DDoS Protection",
      icon: ShieldAlert,
      badge: "Shield",
    },
    { id: "sections", label: "Hide/Show Sections", icon: Layers, badge: "Visibility" },
    { id: "services", label: "Services CMS", icon: Briefcase },
    { id: "portfolio", label: "Portfolio CMS", icon: FolderKanban },
    {
      id: "fiverr",
      label: "Fiverr Gigs CMS",
      icon: ShoppingBag,
      badge: "Marketplace",
    },
    {
      id: "leads",
      label: "Client Inquiries",
      icon: Inbox,
      count: newLeadsCount > 0 ? newLeadsCount : undefined,
    },
    { id: "team", label: "Team Members", icon: Users },
    { id: "process", label: "Process Steps", icon: Repeat },
    { id: "testimonials", label: "Testimonials", icon: MessageSquareQuote },
    { id: "settings", label: "Agency Settings", icon: Settings },
  ];

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3.5 bg-neutral-950 border-b border-neutral-800 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0A1C6A] p-1 flex items-center justify-center">
            <img src="/icon.svg" alt="Tech Elevant" className="w-6 h-6 object-contain" />
          </div>
          <span className="font-extrabold text-sm text-white tracking-tight">
            Tech Elevant CMS
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/")}
            className="p-2 text-neutral-400 hover:text-white"
            title="View Live Website"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-neutral-900 text-neutral-200"
            aria-label="Toggle Navigation"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-neutral-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0A1C6A] p-1.5 flex items-center justify-center shadow-sm">
                <img src="/icon.svg" alt="Tech Elevant" className="w-6 h-6 object-contain" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-white block">
                  Tech Elevant CMS
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Admin Session</span>
                </span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav items */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)] no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-colors ${
                    isActive
                      ? "bg-white text-neutral-950 font-bold shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-neutral-950" : "text-neutral-400"}`} />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.count !== undefined && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                        {item.count}
                      </span>
                    )}
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[9px] font-bold uppercase">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User & Quick Links */}
        <div className="p-4 border-t border-neutral-800/80 space-y-3">
          <div className="flex items-center justify-between px-2 text-xs">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
              title="Sync live data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-white" : ""}`} />
              <span>{isRefreshing ? "Syncing..." : "Sync DB"}</span>
            </button>

            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
              title="View Public Site"
            >
              <span>View Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-neutral-800 text-neutral-300 font-bold text-xs flex items-center justify-center shrink-0">
                {user?.name?.[0] || "A"}
              </div>
              <div className="truncate">
                <span className="block text-xs font-bold text-white truncate">
                  {user?.name || "Admin"}
                </span>
                <span className="block text-[10px] text-neutral-400 truncate">
                  {user?.email || "admin@techelevant.com"}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-neutral-900 min-h-screen">
        {/* Desktop Topbar */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-neutral-950/60 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-bold text-white tracking-tight uppercase">
              {navItems.find((i) => i.id === activeTab)?.label || "Admin Console"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh Store</span>
            </button>

            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-neutral-950 font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors"
            >
              <span>Preview Live Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
