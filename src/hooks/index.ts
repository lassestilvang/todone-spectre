/**
 * Hooks exports
 */

// Offline hooks
export { useOffline } from "./useOffline";
export { useOfflineSync } from "./useOfflineSync";
export { useOfflineSettings } from "./useOfflineSettings";
export { useOfflineTasks } from "./useOfflineTasks";
export { useOfflineDataPersistence } from "./useOfflineDataPersistence";

// Other hooks (existing pattern)
export { useAuth } from "./useAuth";
export { useSession } from "./useSession";
export { useUsers } from "./useUsers";
export { useProjects } from "./useProjects";
export { useTasks } from "./useTasks";
export { useSubTasks } from "./useSubTasks";
export { useTaskHierarchy } from "./useTaskHierarchy";
export { useTaskDragAndDrop } from "./useTaskDragAndDrop";
export { useRecurringTasks } from "./useRecurringTasks";
export { useRecurringTaskState } from "./useRecurringTaskState";
export { useRecurringPatterns } from "./useRecurringPatterns";
export { useRecurringTaskIntegration } from "./useRecurringTaskIntegration";
export { useCalendar } from "./useCalendar";
export { useCalendarSync } from "./useCalendarSync";
export { useCalendarView } from "./useCalendarView";
export { useComments } from "./useComments";
export { useCommentForm } from "./useCommentForm";
export { useCollaboration } from "./useCollaboration";
export { useCollaborationActivity } from "./useCollaborationActivity";
export { useFilters } from "./useFilters";
export { useLabels } from "./useLabels";
export { useListView } from "./useListView";
export { useBoardView } from "./useBoardView";
export { useInbox } from "./useInbox";
export { useToday } from "./useToday";
export { useUpcoming } from "./useUpcoming";
export { useSearch } from "./useSearch";
export { useCommandPalette } from "./useCommandPalette";
export { useKeyboardShortcuts } from "./useKeyboardShortcuts";
export { useDragAndDrop } from "./useDragAndDrop";
export { useKarma } from "./useKarma";
export { useProductivity } from "./useProductivity";
export { useTemplates } from "./useTemplates";
export { useTemplateCategories } from "./useTemplateCategories";
export { useNaturalLanguage } from "./useNaturalLanguage";
export { useNlpParser } from "./useNlpParser";
export { useAIAssistant } from "./useAIAssistant";
export { useAITaskSuggestions } from "./useAITaskSuggestions";

// Empty state and onboarding hooks
export { useEmptyState } from "./useEmptyState";
export { useOnboarding } from "./useOnboarding";

// Accessibility hooks
export { useAccessibility } from "./useAccessibility";
export { useAccessibilityConfig } from "./useAccessibilityConfig";

// Mobile hooks
export { useMobile } from "./useMobile";
export { useMobileConfig } from "./useMobileConfig";

// Extension hooks
export { useExtension } from "./useExtension";
export { useExtensionConfig } from "./useExtensionConfig";
export { useExtensionState } from "./useExtension";
export { useExtensionDispatch } from "./useExtension";
export { useExtensionService } from "./useExtension";
export { useExtensionConfigValue } from "./useExtensionConfig";
export { useExtensionConfigUpdate } from "./useExtensionConfig";
export { usePageIntegration } from "./useExtensionConfig";
export { useAutoSync } from "./useExtensionConfig";
export { useExtensionTheme } from "./useExtensionConfig";
export { useExtensionNotifications } from "./useExtensionConfig";
export { ExtensionProvider } from "./useExtension";
export { ExtensionConfigProvider } from "./useExtensionConfig";
