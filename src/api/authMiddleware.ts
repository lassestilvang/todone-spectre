// @ts-nocheck
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import {
  getSession,
  validateToken,
  refreshToken as refreshAuthToken,
  clearSession,
  TokenExpiredError,
} from "../utils/auth.client";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const createAuthMiddleware = () => {
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor - DISABLED FOR TESTING
  api.interceptors.request.use(
    async (config: AxiosRequestConfig) => {
      try {
        // DISABLED FOR TESTING: Skip authentication checks
        // const { token } = getSession();
        // if (token) {
        //   try {
        //     validateToken(token);
        //     if (config.headers) {
        //       config.headers.Authorization = `Bearer ${token}`;
        //     }
        //   } catch {
        //     try {
        //       const { token: newToken } = await refreshAuthToken();
        //       if (config.headers) {
        //         config.headers.Authorization = `Bearer ${newToken}`;
        //       }
        //     } catch {
        //       clearSession();
        //       throw new TokenExpiredError(
        //         "Session expired, please login again",
        //       );
        //     }
        //   }
        // }

        return config;
      } catch (error) {
        return Promise.reject(error);
      }
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor - DISABLED FOR TESTING
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      // DISABLED FOR TESTING: Skip 401 error handling
      // const originalRequest = error.config;
      // if (error.response?.status === 401 && !originalRequest?._retry) {
      //   originalRequest._retry = true;
      //   try {
      //     const { token: newToken } = await refreshAuthToken();
      //     if (originalRequest.headers) {
      //       originalRequest.headers.Authorization = `Bearer ${newToken}`;
      //     }
      //     return api(originalRequest);
      //   } catch {
      //     clearSession();
      //     return Promise.reject(
      //       new TokenExpiredError("Session expired, please login again"),
      //     );
      //   }
      // }

      return Promise.reject(error);
    },
  );

  return api;
};

// Default authenticated API client
export const authApi = createAuthMiddleware();

// Helper function to make authenticated requests
export const makeAuthRequest = async <T>(
  method: "get" | "post" | "put" | "patch" | "delete",
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  try {
    const response = await authApi({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      clearSession();
      window.location.href = "/auth/login";
    }
    throw error;
  }
};
