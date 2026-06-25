import React, { createContext, useContext, useState } from "react";
import type { DemoUser } from "./api";

interface AuthContextType {
  user: DemoUser | null;
  loading: boolean;
  login: (email: string, role: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_DEFAULT_USER: DemoUser = {
  id: "demo-user",
  firstName: "Demo",
  lastName: "User",
  name: "Demo User",
  email: "demo@example.com",
  role: "Administrator",
  emailVerified: true,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DemoUser | null>(DEMO_DEFAULT_USER);

  const login = (email: string, role: string) => {
    setUser({
      id: "demo-user",
      firstName: "Demo",
      lastName: "User",
      name: "Demo User",
      email,
      role,
      emailVerified: true,
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading: false, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Return a default/fallback implementation to avoid crashes in headless environments
    return {
      user: DEMO_DEFAULT_USER,
      loading: false,
      login: () => {},
      logout: () => {},
    };
  }
  return context;
};
