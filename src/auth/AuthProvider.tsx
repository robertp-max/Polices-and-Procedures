import React, { createContext, useContext, ReactNode } from 'react';
import type { DemoUser } from './api';

interface AuthContextType {
  user: DemoUser | null;
}

const AuthContext = createContext<AuthContextType>({ user: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  // Simple demo user for baseline (no real auth)
  const user: DemoUser = {
    email: 'demo@careindeed.test',
    name: 'Demo User',
    role: 'DON',
    emailVerified: true,
  };
  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
