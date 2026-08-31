import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  verifyTwoFA: (code: string) => Promise<boolean>;
  updateUser: (user: Partial<User>) => void;
}

interface RegisterData {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo user for simulation
const DEMO_USER: User = {
  id: 'usr-001',
  fullName: 'Alex Carter',
  username: 'alexcarter',
  email: 'alex@cyberguard.lab',
  createdAt: '2026-01-15',
  lastLogin: '2026-08-30T20:30:00Z',
  twoFAEnabled: true,
  securityScore: 94,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const stored = sessionStorage.getItem('cyberguard_auth');
    if (stored) {
      try { return JSON.parse(stored); }
      catch { return { isAuthenticated: false, user: null, needsTwoFA: false }; }
    }
    return { isAuthenticated: false, user: null, needsTwoFA: false };
  });

  const saveAuth = (state: AuthState) => {
    setAuth(state);
    sessionStorage.setItem('cyberguard_auth', JSON.stringify(state));
  };

  const login = async (email: string, _password: string): Promise<boolean> => {
    // DEMO: Accept any credentials with a simulated delay
    await new Promise(r => setTimeout(r, 1200));
    if (!email) return false;
    saveAuth({ isAuthenticated: false, user: DEMO_USER, needsTwoFA: true });
    return true;
  };

  const register = async (_data: RegisterData): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 1500));
    saveAuth({ isAuthenticated: false, user: DEMO_USER, needsTwoFA: true });
    return true;
  };

  const verifyTwoFA = async (code: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 800));
    // DEMO: Accept any 6-digit code
    if (code.length === 6) {
      saveAuth({ isAuthenticated: true, user: auth.user, needsTwoFA: false });
      return true;
    }
    return false;
  };

  const logout = () => {
    saveAuth({ isAuthenticated: false, user: null, needsTwoFA: false });
    sessionStorage.removeItem('cyberguard_auth');
  };

  const updateUser = (data: Partial<User>) => {
    if (auth.user) {
      const updated = { ...auth.user, ...data };
      saveAuth({ ...auth, user: updated });
    }
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, register, logout, verifyTwoFA, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
