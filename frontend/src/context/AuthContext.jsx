import { createContext, useContext, useEffect, useMemo, useState } from "react";
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

const tokenExpiry = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

const clearStoredAuth = () => {
  ["pg_token", "pg_user", "pg_login_status", "pg_role", "pg_name", "pg_email", "pg_token_expires_at"].forEach((key) => localStorage.removeItem(key));
};

const redirectExpiredSession = () => {
  if (window.location.pathname.startsWith("/login")) return;
  const current = `${window.location.pathname}${window.location.search}`;
  window.location.assign(`/login?redirect=${encodeURIComponent(current)}`);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("pg_token"));
  const [user, setUser] = useState(() => {
    const value = localStorage.getItem("pg_user");
    try { return value ? JSON.parse(value) : null; } catch { return null; }
  });

  const persist = (payload) => {
    const normalized = normalizePayload(payload);
    localStorage.setItem("pg_token", normalized.token);
    localStorage.setItem("pg_user", JSON.stringify(normalized.user));
    localStorage.setItem("pg_login_status", "true");
    localStorage.setItem("pg_role", normalized.user.role);
    localStorage.setItem("pg_name", normalized.user.name || "");
    localStorage.setItem("pg_email", normalized.user.email || "");
    localStorage.setItem("pg_token_expires_at", String(tokenExpiry(normalized.token) || Date.now() + 7 * 24 * 60 * 60 * 1000));
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
    clearStoredAuth();
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (!token || !user) {
      if (token || user) logout();
      return undefined;
    }

    let expiresAt = Number(localStorage.getItem("pg_token_expires_at")) || tokenExpiry(token);
    if (!expiresAt && token.startsWith("dev-token-")) {
      expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem("pg_token_expires_at", String(expiresAt));
    }
    if (!expiresAt || expiresAt <= Date.now()) {
      logout();
      redirectExpiredSession();
      return undefined;
    }

    const timer = window.setTimeout(() => window.dispatchEvent(new CustomEvent("pg-auth-unauthorized")), Math.min(expiresAt - Date.now(), 2_147_483_647));
    const handleUnauthorized = () => {
      logout();
      redirectExpiredSession();
    };
    window.addEventListener("pg-auth-unauthorized", handleUnauthorized);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pg-auth-unauthorized", handleUnauthorized);
    };
  }, [token, user]);

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), login, socialLogin, logout }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
