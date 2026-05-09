import { clearToken, getToken, setToken } from "@/lib/tokenStorage";
import { authService } from "@/services/auth";
import type { User } from "@/types/api";
import { router } from "expo-router";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        try {
          const me = await authService.getMe();
          setUser(me);
        } catch {
          await clearToken();
        }
      }
      setIsLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const { access_token } = await authService.login(email, password);
    await setToken(access_token);
    const me = await authService.getMe();
    setUser(me);
  };

  const logout = async () => {
    await clearToken();
    setUser(null);
    router.replace("/(auth)/login");
  };
  const fetchMe = async () => {
    try {
      const me = await authService.getMe();
      setUser(me);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, fetchMe, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
