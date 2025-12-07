// @ts-nocheck
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { LabelState, Label } from "../types/store";

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

export const useLabelStore = create<LabelState>()(
  devtools(
    persist(
      (set, get) => ({
        labels: [],
        currentLabelId: null,
        labelError: null,

        // CRUD Operations
        addLabel: (
          labelData: Omit<Label, "id" | "createdAt" | "updatedAt">
        ) => {
          const newLabel: Label = {
            ...labelData,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set((state) => ({
            labels: [...state.labels, newLabel],
          }));
        },

        updateLabel: (
          id: string,
          updates: Partial<Omit<Label, "id" | "createdAt">>
        ) => {
          set((state) => ({
            labels: state.labels.map((label) =>
              label.id === id
                ? {
                    ...label,
                    ...updates,
                    updatedAt: new Date(),
                  }
                : label
            ),
          }));
        },

        deleteLabel: (id: string) => {
          set((state) => ({
            labels: state.labels.filter((label) => label.id !== id),
            currentLabelId:
              state.currentLabelId === id ? null : state.currentLabelId,
          }));
        },

        // Selection operations
        setCurrentLabel: (labelId: string | null) => {
          set({ currentLabelId: labelId });
        },

        // Error handling
        setLabelError: (error: string | null) => {
          set({ labelError: error });
        },

        // Initialize with sample labels
        initializeSampleLabels: () => {
          const sampleLabels: Label[] = [
            {
              id: "label-1",
              name: "Urgent",
              color: "#EF4444",
              isPersonal: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: "label-2",
              name: "Work",
              color: "#3B82F6",
              isPersonal: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: "label-3",
              name: "Personal",
              color: "#10B981",
              isPersonal: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: "label-4",
              name: "Important",
              color: "#F59E0B",
              isPersonal: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];

          set({ labels: sampleLabels });
        },

        // Label operations
        getLabelsByCategory: (isPersonal: boolean) => {
          return get().labels.filter(
            (label) => label.isPersonal === isPersonal
          );
        },

        // Clear all labels
        clearAllLabels: () => {
          set({ labels: [] });
        },
      }),
      {
        name: "todone-labels-storage",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);
