import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('bm_token'));
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bm_user') || 'null'); } catch { return null; }
  });

  useEffect(() => {
    if (token) localStorage.setItem('bm_token', token); else localStorage.removeItem('bm_token');
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem('bm_user', JSON.stringify(user)); else localStorage.removeItem('bm_user');
  }, [user]);

  const value = useMemo(() => ({ token, setToken, user, setUser, logout: () => { setToken(null); setUser(null); } }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
