import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { User, UserRole } from '../types';
import { CredentialResponse } from '@react-oauth/google';
import jwtDecode from 'jwt-decode';
import { PublicClientApplication } from '@azure/msal-browser';
import { USERS } from '../constants';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (email: string) => Promise<User>;
  loginWithGoogle: (response: CredentialResponse) => Promise<User>;
  loginWithMicrosoft: () => Promise<User>;
  loginWithApple: (data: any) => Promise<User>;
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

  const loginWithGoogle = async (response: CredentialResponse): Promise<User> => {
    if (!response.credential) throw new Error('Google authentication failed');
    const profile: any = jwtDecode(response.credential);
    const newUser: User = {
        id: profile.sub,
        name: profile.name || profile.email,
        email: profile.email,
        avatarUrl: profile.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || profile.email)}`,
        role: 'Member'
    };
    setUsers(prev => {
        if (prev.some(u => u.id === newUser.id)) return prev;
        return [...prev, newUser];
    });
    setCurrentUser(newUser);
    return newUser;
  };

  const msalInstance = useMemo(() => new PublicClientApplication({
    auth: { clientId: process.env.MICROSOFT_CLIENT_ID || '' }
  }), []);

  const loginWithMicrosoft = async (): Promise<User> => {
    const result = await msalInstance.loginPopup({ scopes: ['User.Read'] });
    const account = result.account;
    if (!account) throw new Error('Microsoft authentication failed');
    const newUser: User = {
        id: account.localAccountId,
        name: account.name || account.username,
        email: account.username,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(account.name || account.username)}`,
        role: 'Member'
    };
    setUsers(prev => {
        if (prev.some(u => u.id === newUser.id)) return prev;
        return [...prev, newUser];
    });
    setCurrentUser(newUser);
    return newUser;
  };

  const loginWithApple = async (data: any): Promise<User> => {
    const token = data.authorization?.id_token;
    if (!token) throw new Error('Apple authentication failed');
    const profile: any = jwtDecode(token);
    const name = data.user?.name ? `${data.user.name.firstName} ${data.user.name.lastName}` : profile.email;
    const newUser: User = {
        id: profile.sub,
        name,
        email: profile.email,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
        role: 'Member'
    };
    setUsers(prev => {
        if (prev.some(u => u.id === newUser.id)) return prev;
        return [...prev, newUser];
    });
    setCurrentUser(newUser);
    return newUser;
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
    loginWithGoogle,
    loginWithMicrosoft,
    loginWithApple,
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