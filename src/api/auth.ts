// @ts-nocheck
import axios from "axios";
import {
  generateToken,
  generateRefreshToken,
  validateToken,
  hashPassword,
  comparePasswords,
  AuthError,
  AuthenticationError,
  AuthorizationError,
  TokenExpiredError,
  setSession,
  clearSession,
  getSession,
} from "../utils/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

interface RegisterResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

interface User {
  id: string;
  email: string;
  name?: string;
  password: string;
}

// Mock database for demonstration
const mockUsers: User[] = [];

export const login = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  try {
    // In a real app, this would be an API call
    const user = mockUsers.find((u) => u.email === email);

    if (!user) {
      throw new AuthenticationError("User not found");
    }

    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError("Invalid password");
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
    });

    setSession(token, refreshToken);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthenticationError("Login failed");
  }
};

export const register = async (
  name: string,
  email: string,
  password: string,
): Promise<RegisterResponse> => {
  try {
    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      throw new AuthError("User already exists");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 15),
      email,
      name,
      password: hashedPassword,
    };

    mockUsers.push(newUser);

    // Generate tokens
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    const refreshToken = generateRefreshToken({
      id: newUser.id,
      email: newUser.email,
    });

    setSession(token, refreshToken);

    return {
      token,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    };
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError("Registration failed");
  }
};

export const logout = async (): Promise<void> => {
  try {
    // In a real app, this would be an API call to invalidate the token
    clearSession();
  } catch {
    throw new AuthError("Logout failed");
  }
};

export const refreshToken = async (): Promise<{
  token: string;
  refreshToken: string;
}> => {
  try {
    const { refreshToken: currentRefreshToken } = getSession();

    if (!currentRefreshToken) {
      throw new AuthorizationError("No refresh token available");
    }

    // Validate refresh token
    const userPayload = validateToken(currentRefreshToken);

    // Generate new tokens
    const newToken = generateToken({
      id: userPayload.id,
      email: userPayload.email,
      name: userPayload.name,
    });

    const newRefreshToken = generateRefreshToken({
      id: userPayload.id,
      email: userPayload.email,
    });

    setSession(newToken, newRefreshToken);

    return {
      token: newToken,
      refreshToken: newRefreshToken,
    };
  } catch {
    throw new TokenExpiredError("Token refresh failed");
  }
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  try {
    // In a real app, this would be an API call
    const user = mockUsers.find((u) => u.email === email);

    if (!user) {
      throw new AuthError("User not found");
    }

    // Generate reset token (in real app, this would be sent via email)
    const resetToken = generateToken({
      id: user.id,
      email: user.email,
    });

    console.log(`Password reset token for ${email}: ${resetToken}`);
    // In a real app, you would send this token via email
  } catch {
    throw new AuthError("Password reset request failed");
  }
};

export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<void> => {
  try {
    // Validate reset token
    const userPayload = validateToken(token);

    // Find user and update password
    const userIndex = mockUsers.findIndex((u) => u.id === userPayload.id);
    if (userIndex === -1) {
      throw new AuthError("User not found");
    }

    // Update password
    const hashedPassword = await hashPassword(newPassword);
    mockUsers[userIndex].password = hashedPassword;

    // Clear session to force re-login
    clearSession();
  } catch {
    throw new AuthError("Password reset failed");
  }
};

// API client with auth interceptor
export const createAuthApiClient = () => {
  const api = axios.create({
    baseURL: API_BASE_URL,
  });

  api.interceptors.request.use(
    async (config) => {
      const { token } = getSession();

      if (token) {
        try {
          // Check if token is expired
          validateToken(token);
          config.headers.Authorization = `Bearer ${token}`;
        } catch {
          // Token expired, try to refresh
          try {
            const { token: newToken } = await refreshToken();
            config.headers.Authorization = `Bearer ${newToken}`;
          } catch {
            // Refresh failed, clear session and redirect to login
            clearSession();
            throw new TokenExpiredError("Session expired");
          }
        }
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  return api;
};
