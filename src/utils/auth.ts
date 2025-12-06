import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || "default-secret-key";
const JWT_EXPIRES_IN = "1h";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

interface UserPayload {
  id: string;
  email: string;
  name?: string;
}

export const generateToken = (user: UserPayload): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
};

export const generateRefreshToken = (user: UserPayload): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN },
  );
};

export const validateToken = (token: string): UserPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch {
    throw new Error("Invalid or expired token");
  }
};

export const decodeToken = (token: string): UserPayload | null => {
  try {
    return jwt.decode(token) as UserPayload | null;
  } catch {
    return null;
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

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

export const isAuthenticated = (): boolean => {
  const { token } = getSession();
  if (!token) return false;

  try {
    validateToken(token);
    return true;
  } catch {
    return false;
  }
};
