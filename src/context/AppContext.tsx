import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { BootstrapData, SiteSettings, Service, Portfolio } from "../types";
import { api } from "../services/api";
import { initialData } from "../data/initialData";

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface AppContextType {
  data: BootstrapData | null;
  settings: SiteSettings | null;
  currentPath: string;
  navigate: (path: string) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  toasts: ToastMessage[];
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  dismissToast: (id: string) => void;
  activeServiceModal: Service | null;
  setActiveServiceModal: (service: Service | null) => void;
  activePortfolioModal: Portfolio | null;
  setActivePortfolioModal: (portfolio: Portfolio | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<BootstrapData>(() => {
    try {
      const saved = localStorage.getItem("techelevant_site_data");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return initialData;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const resolveCurrentPath = () => {
    const hash = window.location.hash;
    if (hash) {
      if (hash.startsWith("#/")) return hash.slice(1);
      if (hash.startsWith("#") && hash.length > 1 && !hash.startsWith("#modal")) return "/" + hash.slice(1);
    }
    return window.location.pathname || "/";
  };

  const [currentPath, setCurrentPath] = useState<string>(resolveCurrentPath);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeServiceModal, setActiveServiceModal] = useState<Service | null>(null);
  const [activePortfolioModal, setActivePortfolioModal] = useState<Portfolio | null>(null);

  const loadData = async () => {
    try {
      const bootstrap = await api.getBootstrapData();
      if (bootstrap && bootstrap.settings) {
        setData(bootstrap);
        try {
          localStorage.setItem("techelevant_site_data", JSON.stringify(bootstrap));
        } catch {
          // Ignore storage quota
        }

        // Dynamically update document title from site settings
        if (bootstrap.settings?.seoTitle) {
          document.title = bootstrap.settings.seoTitle;
        }
      }
    } catch (err) {
      console.log("Using cached/embedded site data fallback:", err);
    }
  };

  // Sync Favicon and Document Title dynamically whenever settings change
  useEffect(() => {
    if (data?.settings?.seoTitle) {
      document.title = data.settings.seoTitle;
    }
    if (data?.settings?.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = data.settings.faviconUrl;

      let appleIcon = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
      if (!appleIcon) {
        appleIcon = document.createElement("link");
        appleIcon.rel = "apple-touch-icon";
        document.head.appendChild(appleIcon);
      }
      appleIcon.href = data.settings.faviconUrl;
    }
  }, [data?.settings?.faviconUrl, data?.settings?.seoTitle]);

  // Public visitor tracking per page view
  useEffect(() => {
    if (!currentPath.startsWith("/admin")) {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        fetch("/api/public/track-visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page: currentPath,
            referrer: document.referrer || "Direct",
            timezone: tz,
            language: navigator.language,
          }),
        }).catch(() => {});
      } catch {
        // Silent
      }
    }
  }, [currentPath]);

  useEffect(() => {
    loadData();

    // Listen to browser popstate (back/forward) & hashchange
    const handleLocationChange = () => {
      setCurrentPath(resolveCurrentPath());
    };
    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = "toast-" + Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        data,
        settings: data?.settings || null,
        currentPath,
        navigate,
        isLoading,
        refreshData: loadData,
        toasts,
        showToast,
        dismissToast,
        activeServiceModal,
        setActiveServiceModal,
        activePortfolioModal,
        setActivePortfolioModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};
