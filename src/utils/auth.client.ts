/**
 * Client-side safe auth utilities that don't import jsonwebtoken
 * This file can be safely imported in browser code
 */

const JWT_SECRET =
  (import.meta as any).env?.VITE_JWT_SECRET || "default-secret-key";

interface UserPayload {
  id: string;
  email: string;
  name?: string;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class AuthenticationError extends AuthError {
  constructor(message: string = "Authentication failed") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AuthError {
  constructor(message: string = "Authorization failed") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class TokenExpiredError extends AuthError {
  constructor(message: string = "Token expired") {
    super(message);
    this.name = "TokenExpiredError";
  }
}

export const getSession = (): {
  token: string | null;
  refreshToken: string | null;
} => {
  if (typeof window === "undefined") {
    return { token: null, refreshToken: null };
  }

  const token = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  return {
    token,
    refreshToken,
  };
};

export const setSession = (token: string, refreshToken: string): void => {
  if (typeof window === "undefined") return;

  localStorage.setItem("authToken", token);
  localStorage.setItem("refreshToken", refreshToken);
};

export const clearSession = (): void => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
};

/**
 * Client-side token validation that doesn't use jsonwebtoken
 * This is a simplified validation that just checks if the token exists and has the right structure
 */
export const isAuthenticated = (): boolean => {
  const { token } = getSession();
  if (!token) return false;

  // Simple client-side validation - just check if token exists and looks like a JWT
  try {
    // Basic JWT structure check (3 parts separated by dots)
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Check if parts are base64 encoded strings
    return parts.every((part) => /^[A-Za-z0-9\-_]+$/.test(part));
  } catch {
    return false;
  }
};

/**
 * Simple token validation for client-side use
 * Doesn't actually verify the token signature, just checks structure and expiration
 */
export const validateToken = (token: string): UserPayload => {
  try {
    // Basic structure validation
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token structure");
    }

    // Decode the payload (second part) to check expiration
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) {
      throw new Error("Token has no expiration");
    }

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp < currentTime) {
      throw new TokenExpiredError();
    }

    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
    };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw error;
    }
    throw new Error("Invalid or expired token");
  }
};

/**
 * Simple token decoding for client-side use
 */
export const decodeToken = (token: string): UserPayload | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
};
