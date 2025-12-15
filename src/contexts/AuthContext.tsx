import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'teacher' | 'parent' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  role: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Dummy users for demo
const dummyUsers: Record<string, User & { password: string }> = {
  'admin@school.com': {
    id: '1',
    name: 'John Administrator',
    email: 'admin@school.com',
    role: 'admin',
    password: 'admin123',
    avatar: 'JA',
  },
  'teacher@school.com': {
    id: '2',
    name: 'Sarah Thompson',
    email: 'teacher@school.com',
    role: 'teacher',
    password: 'teacher123',
    avatar: 'ST',
  },
  'parent@school.com': {
    id: '3',
    name: 'Michael Johnson',
    email: 'parent@school.com',
    role: 'parent',
    password: 'parent123',
    avatar: 'MJ',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const foundUser = dummyUsers[email.toLowerCase()];
    if (foundUser && foundUser.password === password) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        role: user?.role ?? null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
