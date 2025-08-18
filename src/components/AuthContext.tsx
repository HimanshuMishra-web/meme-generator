import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../../constants';

interface User {
  _id?: string;
  username: string;
  email: string;
  role?: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (username: string, email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  handleAuthError: (error: any) => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const LOCAL_STORAGE_KEY = 'meme-app-auth';

async function loginApi(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  return res.json();
}

async function signupApi(username: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) throw new Error('Signup failed');
  return res.json();
}

async function refreshTokenApi(token: string) {
  const res = await fetch(`${API_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
  });
  if (!res.ok) throw new Error('Token refresh failed');
  return res.json();
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const { user, token } = JSON.parse(stored);
      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
      
      // Check if token is about to expire (within 1 hour)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
        
        if (expirationTime - currentTime < oneHour) {
          // Token expires soon, refresh it
          refreshToken();
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => loginApi(email, password),
    onSuccess: (data) => {
      const { user, token } = data.data;
      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user, token }));
    },
  });

  const signupMutation = useMutation({
    mutationFn: ({ username, email, password }: { username: string; email: string; password: string }) => signupApi(username, email, password),
    onSuccess: (data) => {
      const { user, token } = data.data;
      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user, token }));
    },
  });

  const refreshTokenMutation = useMutation({
    mutationFn: ({ token }: { token: string }) => refreshTokenApi(token),
    onSuccess: (data) => {
      const { user, token } = data.data;
      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user, token }));
    },
  });

  const signIn = async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return true;
    } catch {
      return false;
    }
  };

  const signUp = async (username: string, email: string, password: string) => {
    try {
      await signupMutation.mutateAsync({ username, email, password });
      return true;
    } catch {
      return false;
    }
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    queryClient.clear();
    window.location.href = '/'; // Redirect to home page
  };

  const refreshToken = async () => {
    if (!token) return false;
    try {
      await refreshTokenMutation.mutateAsync({ token });
      return true;
    } catch {
      return false;
    }
  };

  const handleAuthError = (error: any) => {
    if (error.response?.status === 401) {
      signOut();
      console.error('Unauthorized token error. User logged out.');
    } else {
      console.error('An unexpected error occurred:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, token, signIn, signUp, signOut, handleAuthError, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}; 