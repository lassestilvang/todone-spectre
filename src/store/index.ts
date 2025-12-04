export * from "./useStore";
export * from "./useAuthStore";
export * from "./useTaskStore";
export * from "./useProjectStore";
export * from "./useUiStore";
export * from "./useSearchStore";
export * from "./useOfflineStore";

// Store initialization function
export const initializeStores = () => {
  // This function can be called during app initialization
  // to set up any default values or perform initializations
  console.log("Initializing Zustand stores...");

  // You can add any initialization logic here
  // For example, loading initial data, setting up event listeners, etc.
};
