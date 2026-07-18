import { createContext, useContext, useMemo, useState } from "react";
import { authenticate } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("pg_token"));
  const [user, setUser] = useState(() => {
    const value = localStorage.getItem("pg_user");
    return value ? JSON.parse(value) : null;
  });

  const persist = (payload) => {
    localStorage.setItem("pg_token", payload.token);
    localStorage.setItem("pg_user", JSON.stringify(payload.user));
    setToken(payload.token);
    setUser(payload.user);
  };

  const login = async (loginId, password) => {
    const payload = await authenticate({ loginId, password });
    persist(payload);
    return payload.user;
  };

  const logout = () => {
    localStorage.removeItem("pg_token");
    localStorage.removeItem("pg_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token), login, logout }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
