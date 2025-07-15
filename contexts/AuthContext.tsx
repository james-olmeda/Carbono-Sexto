import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { User, UserRole } from '../types';
import { USERS } from '../constants';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string) => Promise<User>;
  logout: () => void;
  signup: (name: string, email: string) => Promise<User>;
  inviteUser: (email: string, role: UserRole) => Promise<User>;
  updateUser: (userId: string, data: Partial<Pick<User, 'name' | 'role'>>) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useStickyState = <T,>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, value]);

  return [value, setValue];
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useStickyState<User | null>(null, 'currentUser');
  const [users, setUsers] = useStickyState<User[]>(USERS, 'users');

  const login = async (email: string): Promise<User> => {
    // In a real app, this would be an API call with email and password
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      return user;
    }
    throw new Error('User not found.');
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const signup = async (name: string, email: string): Promise<User> => {
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('An account with this email already exists.');
    }
    const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        role: 'Member', // All new signups are members by default
        avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  };
  
  const inviteUser = async (email: string, role: UserRole): Promise<User> => {
     if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('A user with this email already exists.');
    }
    const newUser: User = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0], // Default name from email
        email,
        role,
        avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
    };
    setUsers(prev => [...prev, newUser]);
    return newUser;
  };
  
  const updateUser = async (userId: string, data: Partial<Pick<User, 'name' | 'role'>>): Promise<User> => {
    let updatedUser: User | undefined;
    setUsers(prev => prev.map(user => {
        if (user.id === userId) {
            updatedUser = { ...user, ...data };
            return updatedUser;
        }
        return user;
    }));
    if (updatedUser) {
        if (currentUser?.id === userId) {
            setCurrentUser(updatedUser);
        }
        return updatedUser;
    }
    throw new Error("User not found for update.");
  };
  
  const deleteUser = async (userId: string): Promise<void> => {
    if(currentUser?.id === userId) {
        throw new Error("You cannot delete yourself.");
    }
    setUsers(prev => prev.filter(user => user.id !== userId));
  };


  const value = useMemo(() => ({
    currentUser,
    users,
    login,
    logout,
    signup,
    inviteUser,
    updateUser,
    deleteUser,
  }), [currentUser, users]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};