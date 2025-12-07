import {
  login,
  register,
  logout,
  refreshToken,
  requestPasswordReset,
  resetPassword,
} from "../../api/auth";
import {
  AuthenticationError,
  AuthorizationError,
  AuthError,
} from "../../utils/auth.client";

// Mock the auth utilities
jest.mock("../../utils/auth", () => ({
  ...jest.requireActual("../../utils/auth"),
  generateToken: jest.fn().mockReturnValue("mock-token"),
  generateRefreshToken: jest.fn().mockReturnValue("mock-refresh-token"),
  validateToken: jest
    .fn()
    .mockReturnValue({ id: "user-1", email: "test@example.com" }),
  hashPassword: jest.fn().mockResolvedValue("hashed-password"),
  comparePasswords: jest.fn().mockResolvedValue(true),
  setSession: jest.fn(),
  clearSession: jest.fn(),
  getSession: jest.fn().mockReturnValue({
    token: "current-token",
    refreshToken: "current-refresh-token",
  }),
}));

describe("Auth API", () => {
  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    password: "hashed-password",
  };

  // Mock user database
  const mockUsers: any[] = [mockUser];

  beforeEach(() => {
    // Reset mock users
    while (mockUsers.length > 0) {
      mockUsers.pop();
    }
    mockUsers.push(mockUser);
  });

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      const result = await login("test@example.com", "password123");
      expect(result).toBeDefined();
      expect(result.token).toBe("mock-token");
      expect(result.refreshToken).toBe("mock-refresh-token");
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe("test@example.com");
    });

    it("should throw AuthenticationError for invalid user", async () => {
      await expect(
        login("nonexistent@example.com", "password123")
      ).rejects.toThrow(AuthenticationError);
    });

    it("should throw AuthenticationError for invalid password", async () => {
      // Mock comparePasswords to return false
      require("../../utils/auth").comparePasswords.mockResolvedValueOnce(false);

      await expect(login("test@example.com", "wrongpassword")).rejects.toThrow(
        AuthenticationError
      );
    });
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const result = await register(
        "New User",
        "new@example.com",
        "password123"
      );
      expect(result).toBeDefined();
      expect(result.token).toBe("mock-token");
      expect(result.refreshToken).toBe("mock-refresh-token");
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe("new@example.com");
    });

    it("should throw AuthError for existing user", async () => {
      // Add the new user first
      mockUsers.push({
        id: "user-2",
        email: "existing@example.com",
        name: "Existing User",
        password: "hashed-password",
      });

      await expect(
        register("New User", "existing@example.com", "password123")
      ).rejects.toThrow(AuthError);
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      await expect(logout()).resolves.not.toThrow();
    });
  });

  describe("refreshToken", () => {
    it("should refresh token successfully", async () => {
      const result = await refreshToken();
      expect(result).toBeDefined();
      expect(result.token).toBe("mock-token");
      expect(result.refreshToken).toBe("mock-refresh-token");
    });

    it("should throw AuthorizationError when no refresh token available", async () => {
      // Mock getSession to return no refresh token
      require("../../utils/auth").getSession.mockReturnValueOnce({
        token: null,
        refreshToken: null,
      });

      await expect(refreshToken()).rejects.toThrow(AuthorizationError);
    });
  });

  describe("requestPasswordReset", () => {
    it("should request password reset successfully", async () => {
      await expect(
        requestPasswordReset("test@example.com")
      ).resolves.not.toThrow();
    });

    it("should throw AuthError for nonexistent user", async () => {
      await expect(
        requestPasswordReset("nonexistent@example.com")
      ).rejects.toThrow(AuthError);
    });
  });

  describe("resetPassword", () => {
    it("should reset password successfully", async () => {
      await expect(
        resetPassword("valid-token", "newpassword123")
      ).resolves.not.toThrow();
    });

    it("should throw AuthError for invalid token", async () => {
      // Mock validateToken to throw error
      require("../../utils/auth").validateToken.mockImplementationOnce(() => {
        throw new Error("Invalid token");
      });

      await expect(
        resetPassword("invalid-token", "newpassword123")
      ).rejects.toThrow(AuthError);
    });
  });

  describe("createAuthApiClient", () => {
    it("should create an axios instance with auth interceptor", () => {
      const { createAuthApiClient } = require("../../api/auth");
      const api = createAuthApiClient();
      expect(api).toBeDefined();
      expect(api.interceptors).toBeDefined();
    });
  });
});
