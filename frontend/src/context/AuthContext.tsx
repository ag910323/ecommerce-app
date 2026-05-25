import React, { createContext, useContext, useEffect, useState } from "react";
import type { LoginRequest, LoginResponse, UserResponse } from "../types";
import * as authApi from "../api/authApi";
import api from "../api/axios";

type AuthContextType = {
  user: UserResponse | null;
  token: string | null;
  login: (req: LoginRequest) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserResponse | null>(() => {
    const v = localStorage.getItem("user");
    return v ? JSON.parse(v) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [token, user]);

  const login = async (req: LoginRequest) => {
    try {
      sessionStorage.setItem('auth_login_started', new Date().toISOString());

      const data: LoginResponse = await authApi.loginUser(req);
      sessionStorage.setItem('auth_login_success', JSON.stringify({
        hasToken: !!data.jwtToken,
        hasUser: !!data.userResponse,
        userRoles: data.userResponse?.roleNames || [],
        timestamp: new Date().toISOString()
      }));

      setToken(data.jwtToken);
      setUser(data.userResponse);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.jwtToken}`;

      sessionStorage.setItem('auth_login_completed', new Date().toISOString());

    } catch (error) {
      sessionStorage.setItem('auth_login_error', JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }));
      throw error;
    }
  };

  const logout = () => {
    // Clear localStorage items
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");

    // Clear state
    setToken(null);
    setUser(null);

    // Redirect to login page
    window.location.href = "/login";
  };

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
