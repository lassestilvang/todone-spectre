import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const {
    user,
    isAuthenticated,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    checkAuth: storeCheckAuth,
  } = useAuthStore();

  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await storeCheckAuth();
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    await storeLogin(email, password);
    navigate('/dashboard');
  };

  const register = async (name: string, email: string, password: string) => {
    await storeRegister(name, email, password);
    navigate('/dashboard');
  };

  const logout = async () => {
    await storeLogout();
    navigate('/auth/login');
  };

  const checkAuth = async () => {
    await storeCheckAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
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