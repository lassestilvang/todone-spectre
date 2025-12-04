import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { AuthState, User } from '../types/store';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/auth';
import { getSession, isAuthenticated as checkIsAuthenticated } from '../utils/auth';

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        token: null,

        login: async (email: string, password: string) => {
          set({ isLoading: true, error: null });

          try {
            const response = await apiLogin(email, password);

            const user: User = {
              id: response.user.id,
              email: response.user.email,
              name: response.user.name || email.split('@')[0],
              avatar: `https://api.dicebear.com/6.x/initials/svg?seed=${response.user.name || email.split('@')[0]}`,
              settings: {
                notificationsEnabled: true,
                emailFrequency: 'weekly',
                themePreference: 'system',
              },
            };

            set({
              user,
              isAuthenticated: true,
              token: response.token,
              isLoading: false,
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Login failed',
              isLoading: false,
            });
            throw error;
          }
        },

        logout: async () => {
          try {
            await apiLogout();
            set({
              user: null,
              isAuthenticated: false,
              token: null,
              error: null,
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Logout failed',
            });
            throw error;
          }
        },

        register: async (name: string, email: string, password: string) => {
          set({ isLoading: true, error: null });

          try {
            const response = await apiRegister(name, email, password);

            const user: User = {
              id: response.user.id,
              email: response.user.email,
              name: response.user.name || name,
              avatar: `https://api.dicebear.com/6.x/initials/svg?seed=${response.user.name || name}`,
              settings: {
                notificationsEnabled: true,
                emailFrequency: 'weekly',
                themePreference: 'system',
              },
            };

            set({
              user,
              isAuthenticated: true,
              token: response.token,
              isLoading: false,
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Registration failed',
              isLoading: false,
            });
            throw error;
          }
        },

        checkAuth: async () => {
          set({ isLoading: true, error: null });

          try {
            const authenticated = checkIsAuthenticated();
            const { token } = getSession();

            if (authenticated && token) {
              // In a real app, you would fetch user data from the token or API
              const userData = {
                id: 'current-user-id',
                email: 'user@example.com',
                name: 'Current User',
                avatar: `https://api.dicebear.com/6.x/initials/svg?seed=Current`,
                settings: {
                  notificationsEnabled: true,
                  emailFrequency: 'weekly',
                  themePreference: 'system',
                },
              };

              set({
                user: userData,
                isAuthenticated: true,
                token,
                isLoading: false,
              });
            } else {
              set({
                user: null,
                isAuthenticated: false,
                token: null,
                isLoading: false,
              });
            }
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Auth check failed',
              isLoading: false,
            });
            throw error;
          }
        },

        updateUserSettings: (settings: Partial<User['settings']>) => {
          set((state) => ({
            user: state.user ? {
              ...state.user,
              settings: {
                ...state.user.settings,
                ...settings,
              },
            } : null,
          }));
        },

        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'todone-auth-storage',
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);

// Helper function to create localStorage
const createJSONStorage = (getStorage: () => Storage) => ({
  getItem: (name: string) => {
    const storage = getStorage();
    const item = storage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: (name: string, value: any) => {
    const storage = getStorage();
    storage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    const storage = getStorage();
    storage.removeItem(name);
  },
});