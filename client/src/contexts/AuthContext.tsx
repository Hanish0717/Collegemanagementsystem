import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getStoredUser,
  getToken,
  login as apiLogin,
  logout as apiLogout,
  fetchCurrentUser,
} from "../services/authService";
import type { AuthUser } from "@/types/auth";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: Parameters<typeof apiLogin>[0]) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getToken());
  const [isLoading, setIsLoading] = useState(false);

  const login = async (payload: Parameters<typeof apiLogin>[0]) => {
    setIsLoading(true);
    try {
      const result = await apiLogin(payload);
      // Direct login — result is the user object (no OTP step)
      setUser(result);
      setToken(getToken());
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    if (!getToken()) return null;
    try {
      const refreshedUser = await fetchCurrentUser();
      setUser(refreshedUser);
      return refreshedUser;
    } catch (err) {
      logout();
      return null;
    }
  };

  useEffect(() => {
    if (token) {
      refreshUser();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
