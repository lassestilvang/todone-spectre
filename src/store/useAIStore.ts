// @ts-nocheck
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { AIState } from "../types/store";

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

export const useAIStore = create<AIState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        aiAssistantEnabled: true,
        aiSuggestions: [],
        aiTaskBreakdowns: {},
        aiActionableItems: {},
        aiLoading: false,
        aiError: null,
        aiResponseCache: {},
        aiUsageStatistics: {
          totalRequests: 0,
          successfulRequests: 0,
          lastRequestTime: null,
        },

        // AI Assistant operations
        enableAIAssistant: () => {
          set({ aiAssistantEnabled: true });
        },

        disableAIAssistant: () => {
          set({ aiAssistantEnabled: false });
        },

        setAISuggestions: (taskId: string, suggestions: string[]) => {
          set((state) => ({
            aiSuggestions: [...state.aiSuggestions, ...suggestions],
            aiTaskBreakdowns: {
              ...state.aiTaskBreakdowns,
              [taskId]: {
                ...state.aiTaskBreakdowns[taskId],
                suggestions,
              },
            },
          }));
        },

        setAITaskBreakdown: (taskId: string, breakdown) => {
          set((state) => ({
            aiTaskBreakdowns: {
              ...state.aiTaskBreakdowns,
              [taskId]: breakdown,
            },
          }));
        },

        setAIActionableItems: (taskId: string, items) => {
          set((state) => ({
            aiActionableItems: {
              ...state.aiActionableItems,
              [taskId]: items,
            },
          }));
        },

        setAILoading: (loading: boolean) => {
          set({ aiLoading: loading });
        },

        setAIError: (error: string | null) => {
          set({ aiError: error });
        },

        cacheAIResponse: (prompt: string, response: string) => {
          set((state) => ({
            aiResponseCache: {
              ...state.aiResponseCache,
              [prompt]: response,
            },
          }));
        },

        recordAIUsage: (success: boolean) => {
          set((state) => ({
            aiUsageStatistics: {
              totalRequests: state.aiUsageStatistics.totalRequests + 1,
              successfulRequests: success
                ? state.aiUsageStatistics.successfulRequests + 1
                : state.aiUsageStatistics.successfulRequests,
              lastRequestTime: new Date(),
            },
          }));
        },

        clearAICache: () => {
          set({
            aiResponseCache: {},
            aiTaskBreakdowns: {},
            aiActionableItems: {},
          });
        },

        getAISuggestionsForTask: (taskId: string) => {
          return get().aiTaskBreakdowns[taskId]?.suggestions || [];
        },

        getAITaskBreakdown: (taskId: string) => {
          return get().aiTaskBreakdowns[taskId] || null;
        },

        getAIActionableItems: (taskId: string) => {
          return get().aiActionableItems[taskId] || [];
        },

        getCachedAIResponse: (prompt: string) => {
          return get().aiResponseCache[prompt] || null;
        },
      }),
      {
        name: "todone-ai-storage",
        storage: createJSONStorage(() => localStorage),
      },
    ),
  ),
);
