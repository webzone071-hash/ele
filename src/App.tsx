import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider, useApp } from "./context/AppContext";
import { Navbar } from "./components/common/Navbar";
import { Footer } from "./components/common/Footer";
import { Toast } from "./components/common/Toast";
import { PointerBubble } from "./components/common/PointerBubble";
import { ServiceDetailModal, PortfolioDetailModal } from "./components/common/DetailModals";
import { HomePage } from "./pages/public/HomePage";
import { AboutPage } from "./pages/public/AboutPage";
import { ServicesPage } from "./pages/public/ServicesPage";
import { PortfolioPage } from "./pages/public/PortfolioPage";
import { MarketplacePage } from "./pages/public/MarketplacePage";
import { ContactPage } from "./pages/public/ContactPage";
import { GetInTouchPage } from "./pages/public/GetInTouchPage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";

const MainContent: React.FC = () => {
  const { currentPath, settings } = useApp();
  const { isAuthenticated, isLoading } = useAuth();

  // Update dynamic document title from settings if available
  useEffect(() => {
    if (settings?.agencyName) {
      if (currentPath.startsWith("/admin")) {
        document.title = `Admin CMS | ${settings.agencyName}`;
      } else if (currentPath === "/about") {
        document.title = `About Us | ${settings.agencyName}`;
      } else if (currentPath === "/services") {
        document.title = `Engineering Services | ${settings.agencyName}`;
      } else if (currentPath === "/portfolio") {
        document.title = `Case Studies & Portfolio | ${settings.agencyName}`;
      } else if (currentPath === "/marketplace-services") {
        document.title = `Ready-to-Order Fiverr Gigs | ${settings.agencyName}`;
      } else if (currentPath === "/contact") {
        document.title = `Contact Engineering | ${settings.agencyName}`;
      } else if (currentPath === "/get-in-touch") {
        document.title = `Schedule Scoping Consultation | ${settings.agencyName}`;
      } else {
        document.title = settings.metaTitle || `${settings.agencyName} | High-Performance Software Development`;
      }
    }
  }, [currentPath, settings]);

  // Loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0A1C6A] text-white flex items-center justify-center font-black text-sm animate-pulse">
            TE
          </div>
          <span className="text-xs text-neutral-400 font-mono tracking-widest uppercase">
            Loading System Architecture...
          </span>
        </div>
      </div>
    );
  }

  // Admin Routes (Supports /admin, /admin/, /admin?..., and hash /#/admin)
  const normalizedPath = currentPath.toLowerCase().split("?")[0].replace(/\/$/, "") || "/";
  if (normalizedPath === "/admin" || normalizedPath.startsWith("/admin/")) {
    if (!isAuthenticated) {
      return (
        <>
          <AdminLoginPage />
          <Toast />
        </>
      );
    }
    return (
      <>
        <AdminDashboardPage />
        <Toast />
      </>
    );
  }

  // Public Routes
  const renderPublicPage = () => {
    const basePath = currentPath.split("?")[0];
    switch (basePath) {
      case "/":
      case "/home":
        return <HomePage />;
      case "/about":
        return <AboutPage />;
      case "/services":
        return <ServicesPage />;
      case "/portfolio":
        return <PortfolioPage />;
      case "/marketplace-services":
        return <MarketplacePage />;
      case "/contact":
        return <ContactPage />;
      case "/get-in-touch":
        return <GetInTouchPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <PointerBubble />
      <Navbar />
      <div className="flex-1">{renderPublicPage()}</div>
      <Footer />
      <ServiceDetailModal />
      <PortfolioDetailModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </AuthProvider>
  );
}

