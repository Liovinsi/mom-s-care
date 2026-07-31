import { createContext, useContext, useMemo, useState } from "react";
import { authenticate, authenticateSocial } from "../services/authService";

const AuthContext = createContext(null);

const roleAliases = {
  SUPER_ADMIN: "Admin",
  ADMIN: "Admin",
  WARDEN: "Warden",
  USER: "User",
  GUEST: "User"
};

const normalizePayload = (payload) => ({
  ...payload,
  user: {
    ...payload.user,
    role: roleAliases[payload.user?.role] || payload.user?.role
  }
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("pg_token"));
  const [user, setUser] = useState(() => {
    const value = localStorage.getItem("pg_user");
    return value ? JSON.parse(value) : null;
  });

  const persist = (payload) => {
    const normalized = normalizePayload(payload);
    localStorage.setItem("pg_token", normalized.token);
    localStorage.setItem("pg_user", JSON.stringify(normalized.user));
    localStorage.setItem("pg_login_status", "true");
    localStorage.setItem("pg_role", normalized.user.role);
    localStorage.setItem("pg_name", normalized.user.name || "");
    localStorage.setItem("pg_email", normalized.user.email || "");
    setToken(normalized.token);
    setUser(normalized.user);
  };

  const login = async (loginId, password) => {
    const payload = await authenticate({ loginId, password });
    persist(payload);
    return payload.user;
  };

  const socialLogin = async (provider) => {
    const payload = await authenticateSocial(provider);
    persist(payload);
    return payload.user;
  };

  const logout = () => {
    localStorage.removeItem("pg_token");
    localStorage.removeItem("pg_user");
    localStorage.removeItem("pg_login_status");
    localStorage.removeItem("pg_role");
    localStorage.removeItem("pg_name");
    localStorage.removeItem("pg_email");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), login, socialLogin, logout }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
