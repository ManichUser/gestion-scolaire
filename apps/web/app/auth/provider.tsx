'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type AuthContextType = {
  role: 'admin' | 'enseignant' | null;
  token: string | null;
  login: (role: 'admin' | 'enseignant') => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<'admin' | 'enseignant' | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (role: 'admin' | 'enseignant') => {
    // TODO: Replace this simulated login with actual API call to backend
    // Example:
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   body: JSON.stringify({ role }),
    // });
    // const data = await response.json();
    // if (data.token) {
    //   setToken(data.token);
    //   setRole(data.role);
    // }
    // Simulated delay
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setToken('fake-token-' + role);
        setRole(role);
        resolve();
      }, 500);
    });
  };

  const logout = () => {
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ role, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}