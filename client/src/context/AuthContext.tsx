import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authApi } from "../services/api";
import { getSocket, disconnectSocket } from "../services/socket";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  socket: ReturnType<typeof getSocket>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const socket = getSocket(token);

  const loadUser = useCallback(async () => {
    const t = localStorage.getItem("token");
    if (!t) {
      setLoading(false);
      return;
    }
    setToken(t);
    try {
      const { data } = await authApi.me();
      setUser(data.user as User);
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await authApi.login(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user as User);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Login failed");
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      const { data } = await authApi.signup(name, email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user as User);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || "Sign up failed");
    }
  }, []);

  const logout = useCallback(() => {
    disconnectSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, socket }}>
      {children}
    </AuthContext.Provider>
  );
};
