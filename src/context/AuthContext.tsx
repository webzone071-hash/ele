import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AdminUser } from "../types";
import { api } from "../services/api";

interface AuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrToken: string, passwordOrUser?: any) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem("apex_admin_token");
    if (!token) {
      setAdmin(null);
      setIsLoading(false);
      return false;
    }

    try {
      const res = await api.getMe();
      if (res && res.success && res.admin) {
        setAdmin(res.admin);
        setIsLoading(false);
        return true;
      }
    } catch {
      // ignore
    }

    // Try restoring saved local admin user
    try {
      const saved = localStorage.getItem("techelevant_admin_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          setAdmin(parsed);
          setIsLoading(false);
          return true;
        }
      }
    } catch {
      // ignore
    }

    localStorage.removeItem("apex_admin_token");
    localStorage.removeItem("techelevant_admin_user");
    setAdmin(null);
    setIsLoading(false);
    return false;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (emailOrToken: string, passwordOrUser?: any) => {
    // If password string is provided, authenticate against backend endpoint
    if (typeof passwordOrUser === "string") {
      const res = await api.login(emailOrToken, passwordOrUser);
      if (res.token && res.admin) {
        localStorage.setItem("apex_admin_token", res.token);
        setAdmin(res.admin);
        return res;
      }
      throw new Error(res.error || "Authentication failed");
    } else {
      // Direct token & admin object assignment
      localStorage.setItem("apex_admin_token", emailOrToken);
      setAdmin(passwordOrUser || { id: "admin-1", email: emailOrToken, name: "Administrator", role: "super_admin" });
      return { success: true };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem("apex_admin_token");
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isAuthenticated: !!admin,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
