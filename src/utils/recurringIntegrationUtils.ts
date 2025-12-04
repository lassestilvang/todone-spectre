/**
 * Recurring Task Integration Utilities
 * Utilities for integrating recurring tasks with other system components
 * Provides integration with tasks, projects, filters, and other features
 */

import { Task, RecurringTaskConfig, RecurringPatternConfig } from '../types/task';
import { RecurringPattern } from '../types/enums';
import { recurringTaskService } from '../services/recurringTaskService';
import { recurringPatternService } from '../services/recurringPatternService';
import { isBefore, isAfter, format } from 'date-fns';
import { validateRecurringTaskConfiguration } from './recurringValidationUtils';

/**
 * Integrate recurring task with project management
 */
export const integrateRecurringTaskWithProject = (
  task: Task,
  projectId: string,
  config: RecurringTaskConfig
): Task => {
  return {
    ...task,
    projectId,
    customFields: {
      ...task.customFields,
      projectRecurringConfig: config,
      integratedWithProject: true
    }
  };
};

/**
 * Create recurring task instances for a specific project
 */
export const createProjectRecurringInstances = async (
  baseTask: Task,
  projectId: string,
  config: RecurringTaskConfig
): Promise<Task[]> => {
  const validation = validateRecurringTaskConfiguration(baseTask, config);
  if (!validation.valid) {
    throw new Error(`Invalid recurring configuration: ${validation.errors.join(', ')}`);
  }

  // Generate instances using the service
  const instances = await recurringTaskService.generateRecurringInstances(
    { ...baseTask, projectId },
    config
  );

  // Map instances to full task objects
  return instances.map(instance => ({
    ...baseTask,
    id: instance.id,
    projectId,
    dueDate: instance.date,
    customFields: {
      ...baseTask.customFields,
      originalTaskId: baseTask.id,
      isRecurringInstance: instance.isGenerated,
      instanceNumber: instance.isGenerated ? (task.customFields?.instanceCount || 0) + 1 : 0,
      projectRecurringConfig: config
    }
  }));
};

/**
 * Integrate recurring task with task hierarchy (subtasks)
 */
export const integrateRecurringTaskWithHierarchy = (
  parentTask: Task,
  childTask: Task,
  config: RecurringTaskConfig
): { parent: Task; child: Task } => {
  const updatedParent = {
    ...parentTask,
    customFields: {
      ...parentTask.customFields,
      hasRecurringChildren: true,
      childRecurringConfig: config
    }
  };

  const updatedChild = {
    ...childTask,
    parentTaskId: parentTask.id,
    customFields: {
      ...childTask.customFields,
      parentRecurringConfig: config,
      isChildOfRecurringTask: true
    }
  };

  return { parent: updatedParent, child: updatedChild };
};

/**
 * Synchronize recurring task instances with project changes
 */
export const synchronizeRecurringInstancesWithProject = async (
  originalTask: Task,
  projectId: string,
  config: RecurringTaskConfig
): Promise<Task[]> => {
  // Get all instances for this recurring task
  const allInstances = recurringTaskService.getRecurringInstances(originalTask.id);

  // Update each instance with the new project ID
  const updatedInstances = allInstances.map(instance => ({
    ...instance,
    projectId,
    customFields: {
      ...instance.customFields,
      projectId,
      lastSyncedWithProject: new Date().toISOString()
    }
  }));

  // In a real implementation, you would update these in the database
  // For now, we'll just return the updated instances
  return updatedInstances;
};

/**
 * Integrate recurring task with filtering system
 */
export const integrateRecurringTaskWithFilters = (
  task: Task,
  filterConfig: {
    includeRecurring?: boolean;
    recurringPatterns?: RecurringPattern[];
    statusFilter?: string[];
  }
): boolean => {
  // Check if task should be included based on filter configuration
  if (filterConfig.includeRecurring === false && task.recurringPattern) {
    return false;
  }

  if (filterConfig.recurringPatterns && filterConfig.recurringPatterns.length > 0) {
    if (!task.recurringPattern || !filterConfig.recurringPatterns.includes(task.recurringPattern)) {
      return false;
    }
  }

  if (filterConfig.statusFilter && filterConfig.statusFilter.length > 0) {
    if (!filterConfig.statusFilter.includes(task.status)) {
      return false;
    }
  }

  return true;
};

/**
 * Create recurring task configuration from existing task patterns
 */
export const createRecurringConfigFromExistingTask = (
  task: Task
): RecurringTaskConfig => {
  const existingConfig = task.customFields?.recurringConfig;

  if (existingConfig) {
    return existingConfig;
  }

  // Create default config based on task properties
  return {
    pattern: task.recurringPattern || 'weekly',
    startDate: task.dueDate || new Date(),
    endDate: null,
    maxOccurrences: 10,
    customInterval: 1,
    customUnit: null
  };
};

/**
 * Integrate recurring task with task completion system
 */
export const integrateRecurringTaskCompletion = async (
  task: Task,
  config: RecurringTaskConfig
): Promise<{ shouldGenerateNext: boolean; nextInstance?: Task }> => {
  // Check if we should generate a next instance
  const shouldGenerate = shouldGenerateNextRecurringInstance(task, config);

  if (shouldGenerate) {
    // Generate the next instance
    const nextInstance = await recurringTaskService.generateNextRecurringInstance(task);

    if (nextInstance) {
      return {
        shouldGenerateNext: true,
        nextInstance
      };
    }
  }

  return {
    shouldGenerateNext: false
  };
};

/**
 * Check if we should generate the next recurring instance
 */
export const shouldGenerateNextRecurringInstance = (
  task: Task,
  config: RecurringTaskConfig
): boolean => {
  if (!task.completed) return false;
  if (!task.recurringPattern) return false;

  // Check end conditions
  if (config.endDate && isAfter(new Date(), new Date(config.endDate))) {
    return false;
  }

  if (config.maxOccurrences) {
    const currentCount = task.customFields?.recurringCount || 0;
    if (currentCount >= config.maxOccurrences) {
      return false;
    }
  }

  return true;
};

/**
 * Integrate recurring task with task prioritization
 */
export const integrateRecurringTaskWithPriority = (
  task: Task,
  config: RecurringTaskConfig
): RecurringTaskConfig => {
  // Adjust recurring configuration based on task priority
  switch (task.priority) {
    case 'P1':
      // High priority tasks might need more frequent recurrence
      return {
        ...config,
        customInterval: Math.max(1, config.customInterval || 1)
      };
    case 'P4':
      // Low priority tasks might need less frequent recurrence
      return {
        ...config,
        customInterval: (config.customInterval || 1) * 2
      };
    default:
      return config;
  }
};

/**
 * Create recurring task summary for display
 */
export const createRecurringTaskSummary = (
  task: Task,
  config: RecurringTaskConfig
): string => {
  const patternInfo = recurringPatternService.formatRecurringPattern(
    getPatternConfigFromTaskConfig(config)
  );

  const parts = [`${patternInfo} task`];

  if (config.endDate) {
    parts.push(`ending ${format(new Date(config.endDate), 'PPP')}`);
  } else if (config.maxOccurrences) {
    parts.push(`for ${config.maxOccurrences} occurrences`);
  } else {
    parts.push('with no end date');
  }

  if (task.projectId) {
    parts.push(`in project ${task.projectId}`);
  }

  return parts.join(' ');
};

/**
 * Get pattern configuration from task config
 */
export const getPatternConfigFromTaskConfig = (
  config: RecurringTaskConfig
): RecurringPatternConfig => {
  return {
    pattern: config.pattern,
    frequency: config.customUnit || config.pattern,
    endCondition: config.endDate ? 'on_date' : config.maxOccurrences ? 'after_occurrences' : 'never',
    endDate: config.endDate || null,
    maxOccurrences: config.maxOccurrences || null,
    interval: config.customInterval || 1,
    customDays: null,
    customMonthDays: null,
    customMonthPosition: null,
    customMonthDay: null
  };
};

/**
 * Integrate recurring task with task dependencies
 */
export const integrateRecurringTaskWithDependencies = (
  task: Task,
  dependencies: string[],
  config: RecurringTaskConfig
): Task => {
  return {
    ...task,
    dependencies: [...(task.dependencies || []), ...dependencies],
    customFields: {
      ...task.customFields,
      recurringDependencies: dependencies,
      dependencyRecurringConfig: config
    }
  };
};

/**
 * Create recurring task instances with dependency inheritance
 */
export const createRecurringInstancesWithDependencies = async (
  baseTask: Task,
  config: RecurringTaskConfig
): Promise<Task[]> => {
  const instances = await recurringTaskService.generateRecurringInstances(baseTask, config);

  return instances.map((instance, index) => ({
    ...baseTask,
    id: instance.id,
    title: `${baseTask.title} (Instance ${index + 1})`,
    dueDate: instance.date,
    dependencies: baseTask.dependencies || [],
    customFields: {
      ...baseTask.customFields,
      originalTaskId: baseTask.id,
      isRecurringInstance: true,
      instanceNumber: index + 1,
      inheritedDependencies: baseTask.dependencies
    }
  }));
};

/**
 * Synchronize recurring task instances with parent task changes
 */
export const synchronizeRecurringInstancesWithParent = async (
  parentTask: Task,
  config: RecurringTaskConfig
): Promise<Task[]> => {
  // Get all instances for this recurring task
  const instances = recurringTaskService.getRecurringInstances(parentTask.id);

  // Update each instance with parent task properties
  return instances.map(instance => ({
    ...instance,
    title: parentTask.title,
    description: parentTask.description,
    priority: parentTask.priority,
    status: parentTask.status,
    customFields: {
      ...instance.customFields,
      lastSyncedWithParent: new Date().toISOString(),
      parentTaskId: parentTask.id,
      parentTaskTitle: parentTask.title
    }
  }));
};

/**
 * Integrate recurring task with task labeling system
 */
export const integrateRecurringTaskWithLabels = (
  task: Task,
  labelIds: string[],
  config: RecurringTaskConfig
): Task => {
  return {
    ...task,
    labelIds: [...(task.labelIds || []), ...labelIds],
    customFields: {
      ...task.customFields,
      recurringLabels: labelIds,
      labelRecurringConfig: config
    }
  };
};

/**
 * Create recurring task configuration for team collaboration
 */
export const createTeamRecurringConfig = (
  baseConfig: RecurringTaskConfig,
  teamSettings: {
    teamId: string;
    defaultInterval?: number;
    maxOccurrences?: number;
  }
): RecurringTaskConfig => {
  return {
    ...baseConfig,
    customInterval: teamSettings.defaultInterval || baseConfig.customInterval || 1,
    maxOccurrences: teamSettings.maxOccurrences || baseConfig.maxOccurrences,
    customFields: {
      ...baseConfig.customFields,
      teamId: teamSettings.teamId,
      teamRecurringConfig: true
    }
  };
};

/**
 * Validate recurring task integration with other systems
 */
export const validateRecurringTaskIntegration = (
  task: Task,
  config: RecurringTaskConfig,
  integrationContext: {
    projectId?: string;
    hasDependencies?: boolean;
    hasSubtasks?: boolean;
  }
): { valid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate project integration
  if (integrationContext.projectId && !task.projectId) {
    warnings.push('Task is not assigned to the specified project');
  }

  // Validate dependency integration
  if (integrationContext.hasDependencies && (!task.dependencies || task.dependencies.length === 0)) {
    warnings.push('Task has no dependencies but integration expects dependencies');
  }

  // Validate subtask integration
  if (integrationContext.hasSubtasks && task.parentTaskId) {
    errors.push('Recurring task cannot be a subtask when subtask integration is expected');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Create comprehensive recurring task integration report
 */
export const createRecurringTaskIntegrationReport = (
  task: Task,
  config: RecurringTaskConfig,
  integrationResults: {
    projectIntegration?: boolean;
    filterIntegration?: boolean;
    dependencyIntegration?: boolean;
    labelIntegration?: boolean;
  }
): {
  integrationScore: number;
  integrationDetails: Record<string, { integrated: boolean; issues?: string[] }>;
  recommendations: string[];
} => {
  const details: Record<string, { integrated: boolean; issues?: string[] }> = {};
  const recommendations: string[] = [];

  // Project integration
  if (integrationResults.projectIntegration !== undefined) {
    details.project = {
      integrated: integrationResults.projectIntegration,
      issues: integrationResults.projectIntegration ? undefined : ['Task not properly integrated with project']
    };

    if (!integrationResults.projectIntegration) {
      recommendations.push('Assign task to a project for better organization');
    }
  }

  // Filter integration
  if (integrationResults.filterIntegration !== undefined) {
    details.filter = {
      integrated: integrationResults.filterIntegration,
      issues: integrationResults.filterIntegration ? undefined : ['Task may not appear in expected filters']
    };

    if (!integrationResults.filterIntegration) {
      recommendations.push('Review filter configuration to ensure task visibility');
    }
  }

  // Dependency integration
  if (integrationResults.dependencyIntegration !== undefined) {
    details.dependency = {
      integrated: integrationResults.dependencyIntegration,
      issues: integrationResults.dependencyIntegration ? undefined : ['Task dependencies may not be properly managed']
    };

    if (!integrationResults.dependencyIntegration) {
      recommendations.push('Review task dependencies for recurring instances');
    }
  }

  // Label integration
  if (integrationResults.labelIntegration !== undefined) {
    details.label = {
      integrated: integrationResults.labelIntegration,
      issues: integrationResults.labelIntegration ? undefined : ['Task labels may not be inherited by instances']
    };

    if (!integrationResults.labelIntegration) {
      recommendations.push('Ensure labels are properly configured for recurring instances');
    }
  }

  // Calculate integration score
  const integratedCount = Object.values(details).filter(d => d.integrated).length;
  const totalIntegrations = Object.keys(details).length;
  const integrationScore = totalIntegrations > 0 ? Math.round((integratedCount / totalIntegrations) * 100) : 0;

  return {
    integrationScore,
    integrationDetails: details,
    recommendations
  };
};