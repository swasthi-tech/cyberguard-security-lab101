import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthState } from '../types';
import { fetchAuthApi } from '../lib/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, captchaId?: string, captchaAnswer?: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  verifyTwoFA: (code: string) => Promise<boolean>;
  updateUser: (user: Partial<User>) => void;
  checkSession: () => Promise<void>;
}

interface RegisterData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  captchaId?: string;
  captchaAnswer?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, user: null, needsTwoFA: false });
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
    try {
      const res = await fetchAuthApi('/api/auth/me');
      if (res.ok) {
        const { user } = await res.json();
        setAuth({ isAuthenticated: true, user, needsTwoFA: false });
      } else {
        setAuth({ isAuthenticated: false, user: null, needsTwoFA: false });
      }
    } catch (e) {
      setAuth({ isAuthenticated: false, user: null, needsTwoFA: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (email: string, password: string, captchaId?: string, captchaAnswer?: string): Promise<boolean> => {
    try {
      const res = await fetchAuthApi('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, captchaId, captchaAnswer }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.requires2FA) {
          setAuth({ isAuthenticated: false, user: null, needsTwoFA: true });
          return true;
        } else {
          await checkSession();
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const res = await fetchAuthApi('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await checkSession();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const verifyTwoFA = async (code: string): Promise<boolean> => {
    try {
      const res = await fetchAuthApi('/api/2fa/verify-login', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        await checkSession();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetchAuthApi('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setAuth({ isAuthenticated: false, user: null, needsTwoFA: false });
  };

  const updateUser = (data: Partial<User>) => {
    if (auth.user) {
      const updated = { ...auth.user, ...data };
      setAuth({ ...auth, user: updated });
    }
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, register, logout, verifyTwoFA, updateUser, checkSession }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
