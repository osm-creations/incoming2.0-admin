import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from './lib/api';

type AuthValue = {
  user: any | null;
  loading: boolean;
  login(login: string, password: string): Promise<void>;
  logout(): Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.me().then(r => setUser(r.user)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthValue>(() => ({
    user,
    loading,
    async login(login, password) {
      const result = await api.login(login, password);
      if (result.user.role !== 'ADMIN') {
        await api.logout().catch(() => undefined);
        throw new Error('Admin access required.');
      }
      setUser(result.user);
    },
    async logout() {
      await api.logout().catch(() => undefined);
      setUser(null);
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
