/**
 * Services exports
 */

// Offline services
export { OfflineService, offlineService } from "./offlineService";
export { OfflineSyncService, offlineSyncService } from "./offlineSyncService";
export {
  OfflineUtilsService,
  offlineUtilsService,
} from "./offlineUtilsService";
export { OfflineTaskService, offlineTaskService } from "./offlineTaskService";
export {
  OfflineDataPersistence,
  offlineDataPersistence,
} from "./offlineDataPersistence";

// Other services (existing pattern)
export { TaskService, taskService } from "./taskService";
export { CalendarSyncService } from "./calendarSyncService";
export { CalendarService } from "./calendarService";
export { CollaborationService } from "./collaborationService";
export { CommentService } from "./commentService";
export { DndService } from "./dndService";
export { DragAndDropService } from "./dragAndDropService";
export { FilterService } from "./filterService";
export { InboxService } from "./inboxService";
export { KarmaService } from "./karmaService";
export { KeyboardService } from "./keyboardService";
export { LabelService } from "./labelService";
export { ListViewService } from "./listViewService";
export { NlpParserService } from "./nlpParserService";
export { NlpService } from "./nlpService";
export { ProductivityService } from "./productivityService";
export { RecurringPatternManager } from "./recurringPatternManager";
export { RecurringPatternService } from "./recurringPatternService";
export { RecurringTaskGenerator } from "./recurringTaskGenerator";
export { RecurringTaskIntegration } from "./recurringTaskIntegration";
export { RecurringTaskScheduler } from "./recurringTaskScheduler";
export { RecurringTaskService } from "./recurringTaskService";
export { SearchService } from "./searchService";
export { SubTaskService } from "./subTaskService";
export { TaskHierarchyService } from "./taskHierarchyService";
export { TemplateCategoryService } from "./templateCategoryService";
export { TemplateService } from "./templateService";
export { TodayService } from "./todayService";
export { UpcomingService } from "./upcomingService";
export { AiService } from "./aiService";
export { AiTaskService } from "./aiTaskService";
export { BoardViewService } from "./boardViewService";
export { CalendarViewService } from "./calendarViewService";
export { CollaborationActivityService } from "./collaborationActivityService";
export { CommandService } from "./commandService";

// Empty state and onboarding services
export { EmptyStateService, emptyStateService } from "./emptyStateService";
export { OnboardingService, onboardingService } from "./onboardingService";

// Accessibility services
export { accessibilityService } from "./accessibilityService";
export { accessibilityConfigService } from "./accessibilityConfigService";

// Mobile services
export { MobileService, mobileService } from "./mobileService";
export {
  MobileConfigService,
  mobileConfigService,
} from "./mobileConfigService";

// Extension services
export { default as extensionService } from "./extensionService";
export { default as extensionConfigService } from "./extensionConfigService";
