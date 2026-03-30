import { createContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const data = await apiRequest("/auth/me");
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const persistSession = (nextUser) => {
    setUser(nextUser);
    setLoading(false);
  };

  const logout = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST", body: {} });
    } catch {
      // Clear local state even if the server session is already gone.
    }

    setUser(null);
  };

  const value = useMemo(
    () => ({
      token: null,
      user,
      loading,
      persistSession,
      logout,
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
