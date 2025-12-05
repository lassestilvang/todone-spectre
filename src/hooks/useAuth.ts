import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    checkAuth: storeCheckAuth,
    loading: storeLoading,
    error: storeError,
  } = useAuthStore();

  const [isLoading, setIsLoading] = useState(storeLoading);
  const [error, setError] = useState(storeError);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(storeLoading);
    setError(storeError);
  }, [storeLoading, storeError]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await storeLogin(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await storeRegister(name, email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await storeLogout();
      navigate("/auth/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await storeCheckAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auth check failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    checkAuth,
  };
};
