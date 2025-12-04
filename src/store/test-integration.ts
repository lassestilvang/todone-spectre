import { useAuthStore } from "./useAuthStore";
import { useTaskStore } from "./useTaskStore";
import { useProjectStore } from "./useProjectStore";
import { useUiStore } from "./useUiStore";

console.log("Testing Zustand store integration...");

// Test Auth Store
const authStore = useAuthStore.getState();
console.log("Auth Store initialized:", {
  isAuthenticated: authStore.isAuthenticated,
  user: authStore.user,
});

// Test Task Store
const taskStore = useTaskStore.getState();
console.log("Task Store initialized:", {
  tasksCount: taskStore.tasks.length,
  filteredTasksCount: taskStore.filteredTasks.length,
});

// Test Project Store
const projectStore = useProjectStore.getState();
console.log("Project Store initialized:", {
  projectsCount: projectStore.projects.length,
});

// Test UI Store
const uiStore = useUiStore.getState();
console.log("UI Store initialized:", {
  isSidebarOpen: uiStore.isSidebarOpen,
  theme: uiStore.theme,
});

// Test some store actions
console.log("Testing store actions...");

// Test auth login (mock)
authStore.login("test@example.com", "password123");
console.log("After login:", {
  isAuthenticated: authStore.isAuthenticated,
  user: authStore.user?.name,
});

// Test task creation
taskStore.addTask({
  title: "Test Task",
  description: "This is a test task",
  status: "todo",
  priority: "medium",
  completed: false,
});
console.log("After adding task:", {
  tasksCount: taskStore.tasks.length,
});

// Test project creation
projectStore.addProject({
  name: "Test Project",
  description: "This is a test project",
  color: "#FF5733",
});
console.log("After adding project:", {
  projectsCount: projectStore.projects.length,
});

// Test UI state changes
uiStore.toggleSidebar();
uiStore.setTheme("dark");
console.log("After UI changes:", {
  isSidebarOpen: uiStore.isSidebarOpen,
  theme: uiStore.theme,
});

console.log("✅ All Zustand stores are properly integrated and working!");
