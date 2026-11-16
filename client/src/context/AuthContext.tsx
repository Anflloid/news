import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as api from '../api/api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean; // перевірка збереженого токена під час запуску
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem(api.TOKEN_KEY)) {
      setLoading(false);
      return;
    }
    api
      .getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem(api.TOKEN_KEY)) // токен прострочений
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      async login(email, password) {
        const data = await api.login(email, password);
        localStorage.setItem(api.TOKEN_KEY, data.token);
        setUser(data.user);
      },
      async register(name, email, password) {
        const data = await api.register(name, email, password);
        localStorage.setItem(api.TOKEN_KEY, data.token);
        setUser(data.user);
      },
      logout() {
        localStorage.removeItem(api.TOKEN_KEY);
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth потрібно використовувати всередині AuthProvider');
  return context;
}
