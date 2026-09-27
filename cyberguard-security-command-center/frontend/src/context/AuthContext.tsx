import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../api/types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginSuccess: (user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  pending2FAToken: string | null;
  setPending2FAToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pending2FAToken, setPending2FAToken] = useState<string | null>(null);

  const refreshUser = async () => {
    try {
      const res = await api.auth.getMe();
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const loginSuccess = (userData: User) => {
    setUser(userData);
    setPending2FAToken(null);
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore network failure on logout
    } finally {
      setUser(null);
      setPending2FAToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginSuccess,
        logout,
        refreshUser,
        pending2FAToken,
        setPending2FAToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
