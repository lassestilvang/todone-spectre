export const appConfig = {
  name: "Todone",
  version: "1.0.0",
  theme: {
    primaryColor: "#10b981",
    darkMode: false,
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  },
  features: {
    analytics: import.meta.env.VITE_FEATURE_ANALYTICS === "true",
    notifications: import.meta.env.VITE_FEATURE_NOTIFICATIONS === "true",
  },
};
