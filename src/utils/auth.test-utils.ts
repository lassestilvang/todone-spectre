import { generateToken, validateToken, hashPassword, comparePasswords } from './auth';

interface MockUser {
  id: string;
  email: string;
  name?: string;
}

export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    ...overrides,
  };
};

export const createMockToken = (user: MockUser): string => {
  return generateToken(user);
};

export const createMockAuthState = (user: MockUser) => {
  const token = createMockToken(user);
  const refreshToken = generateToken(user);

  // Mock localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', refreshToken);
  }

  return {
    user,
    token,
    refreshToken,
  };
};

export const clearMockAuthState = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }
};

export const mockLoginResponse = (user: MockUser) => {
  return {
    token: createMockToken(user),
    refreshToken: generateToken(user),
    user,
  };
};

export const mockAuthApiResponse = (data: any, status: number = 200) => {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {},
  };
};

export const mockAuthApiError = (message: string = 'API Error', status: number = 400) => {
  return {
    response: {
      data: { message },
      status,
      statusText: 'Bad Request',
      headers: {},
      config: {},
    },
    message,
  };
};

export const createTestUserWithPassword = async (password: string = 'password123') => {
  const hashedPassword = await hashPassword(password);
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    password: hashedPassword,
  };
};

export const assertTokenValid = (token: string, user: MockUser) => {
  const decoded = validateToken(token);
  expect(decoded.id).toBe(user.id);
  expect(decoded.email).toBe(user.email);
  if (user.name) {
    expect(decoded.name).toBe(user.name);
  }
};

export const assertPasswordMatch = async (password: string, hashedPassword: string) => {
  const isMatch = await comparePasswords(password, hashedPassword);
  expect(isMatch).toBe(true);
};