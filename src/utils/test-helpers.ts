import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../features/auth/AuthProvider';

export function renderWithProviders(ui: React.ReactElement, options = {}) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </MemoryRouter>,
    options
  );
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function generateRandomId(prefix: string = 'test'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createTestContext() {
  return {
    user: {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com'
    },
    config: {
      theme: 'light',
      notifications: true
    }
  };
}