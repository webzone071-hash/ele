import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { Menu, X, ArrowUpRight, Mail, Phone, ShieldCheck } from "lucide-react";

export const Navbar: React.FC = () => {
  const { data, settings, currentPath, navigate } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPath]);

  // Handle escape key to close mobile menu & discreet admin shortcut (Ctrl+Alt+A / Cmd+Alt+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
      // Discreet hotkey for administrator access: Ctrl+Alt+A or Cmd+Alt+A
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        navigate("/admin");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navItems = data?.navigation && data.navigation.length > 0
    ? data.navigation
    : [
        { id: "1", name: "Home", url: "/", displayOrder: 1, isActive: true, openInNewTab: false },
        { id: "2", name: "About Us", url: "/about", displayOrder: 2, isActive: true, openInNewTab: false },
        { id: "3", name: "Services", url: "/services", displayOrder: 3, isActive: true, openInNewTab: false },
        { id: "4", name: "Portfolio", url: "/portfolio", displayOrder: 4, isActive: true, openInNewTab: false },
        { id: "5", name: "Contact Us", url: "/contact", displayOrder: 5, isActive: true, openInNewTab: false },
        { id: "6", name: "GET IN TOUCH", url: "/get-in-touch", displayOrder: 6, isActive: true, openInNewTab: false },
      ];

  const agencyName = settings?.agencyName || "Tech Elevant";
  const shortName = settings?.shortName || "Tech Elevant";
  const isFullLogo = settings?.logoUrl?.includes("logo");

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.06)] border-b border-neutral-200/80"
            : "bg-white/90 backdrop-blur-sm border-b border-neutral-100/80"
        } h-16 sm:h-20 flex items-center`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Logo & Agency Brand */}
            <button
              id="brand-logo-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/");
              }}
              className="flex items-center gap-2.5 sm:gap-3 group text-left focus:outline-none min-w-0"
              aria-label={`${agencyName} Homepage`}
            >
              {settings?.logoUrl ? (
                isFullLogo ? (
                  <img
                    src={settings.logoUrl}
                    alt={agencyName}
                    className="h-8 sm:h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <>
                    <img
                      src={settings.logoUrl}
                      alt={agencyName}
                      className="w-9 h-9 sm:w-10 sm:h-10 object-contain transition-transform duration-200 group-hover:scale-105 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-extrabold text-base sm:text-lg lg:text-xl tracking-tight text-neutral-950 group-hover:text-neutral-700 transition-colors block leading-tight truncate">
                        {agencyName}
                      </span>
                      <span className="text-[10px] font-semibold text-neutral-400 tracking-wider uppercase hidden sm:block">
                        Enterprise Engineering
                      </span>
                    </div>
                  </>
                )
              ) : (
                <>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0A1C6A] flex items-center justify-center text-white font-black text-xs sm:text-sm tracking-wider shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0">
                    TE
                  </div>
                  <div className="min-w-0">
                    <span className="font-extrabold text-base sm:text-lg lg:text-xl tracking-tight text-neutral-950 group-hover:text-neutral-700 transition-colors block leading-tight truncate">
                      {agencyName}
                    </span>
                    <span className="text-[10px] font-semibold text-neutral-400 tracking-wider uppercase hidden sm:block">
                      Enterprise Engineering
                    </span>
                  </div>
                </>
              )}
            </button>

            {/* Desktop Navigation Links (Visible on lg: 1024px+) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navItems.map((item) => {
                const isGetInTouch = item.name.toUpperCase().includes("TOUCH") || item.url === "/get-in-touch";
                const isActive = currentPath === item.url;

                if (isGetInTouch) {
                  return (
                    <button
                      key={item.id}
                      id={`nav-item-${item.id}`}
                      onClick={() => navigate(item.url)}
                      className="ml-2 xl:ml-3 px-4 xl:px-5 py-2.5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white font-semibold text-xs tracking-wider uppercase transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1.5 active:scale-95 shrink-0 whitespace-nowrap"
                    >
                      <span>{item.name}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => navigate(item.url)}
                    className={`px-3 xl:px-3.5 py-2 rounded-lg text-xs xl:text-sm font-medium transition-colors relative whitespace-nowrap ${
                      isActive
                        ? "text-neutral-950 font-semibold bg-neutral-100/80"
                        : "text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50"
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-neutral-950 rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Mobile & Tablet Controls (Visible below 1024px) */}
            <div className="flex items-center gap-1 sm:gap-2 lg:hidden">
              <button
                id="mobile-menu-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 sm:p-2.5 rounded-xl border border-neutral-200 text-neutral-900 hover:bg-neutral-100 transition-colors focus:outline-none min-w-[42px] min-h-[42px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center bg-white shadow-xs active:scale-95"
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile & Tablet Overlay & Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Semi-transparent Dimmed Backdrop */}
          <div
            className="fixed inset-0 top-16 sm:top-20 bg-neutral-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Menu Panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            className="fixed top-16 sm:top-20 left-0 right-0 bottom-0 bg-white z-50 overflow-y-auto border-t border-neutral-100 shadow-2xl flex flex-col justify-between animate-in slide-in-from-top-4 duration-200"
          >
            <div className="w-full max-w-xl mx-auto p-5 sm:p-8 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                  Menu Navigation
                </span>
                <span className="text-xs text-neutral-500 font-medium">
                  {agencyName}
                </span>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1.5 pt-2">
                {navItems.map((item) => {
                  const isGetInTouch = item.name.toUpperCase().includes("TOUCH") || item.url === "/get-in-touch";
                  const isActive = currentPath === item.url;

                  if (isGetInTouch) {
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate(item.url);
                        }}
                        className="w-full mt-3 py-3.5 px-5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-md min-h-[48px] active:scale-[0.99] transition-all"
                      >
                        <span>{item.name}</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate(item.url);
                      }}
                      className={`w-full text-left py-3 px-4 rounded-xl text-base font-medium transition-colors flex items-center justify-between min-h-[44px] ${
                        isActive
                          ? "bg-neutral-100 text-neutral-950 font-bold"
                          : "text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950"
                      }`}
                    >
                      <span>{item.name}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-neutral-950" />}
                    </button>
                  );
                })}

                {/* Direct Marketplace / Fiverr Link */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/marketplace-services");
                  }}
                  className={`w-full text-left py-3 px-4 rounded-xl text-base font-medium transition-colors flex items-center justify-between min-h-[44px] ${
                    currentPath === "/marketplace-services"
                      ? "bg-neutral-100 text-neutral-950 font-bold"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>Marketplace Services</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      Fiverr Pro
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-neutral-400" />
                </button>
              </div>
            </div>

            {/* Bottom Drawer Footer */}
            <div className="w-full max-w-xl mx-auto p-5 sm:p-8 pt-4 border-t border-neutral-100 space-y-3 pb-12 sm:pb-8 bg-neutral-50/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-neutral-600 gap-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <a
                    href={`mailto:${settings?.email || "contact@techelevant.com"}`}
                    className="font-semibold text-neutral-900 hover:underline truncate"
                  >
                    {settings?.email || "contact@techelevant.com"}
                  </a>
                </div>
                {settings?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="font-semibold text-neutral-900">{settings.phone}</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/admin");
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-neutral-300 bg-white text-neutral-800 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-neutral-50 shadow-xs min-h-[42px]"
                >
                  <ShieldCheck className="w-4 h-4 text-neutral-700" />
                  <span>Admin CMS Management Portal</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
