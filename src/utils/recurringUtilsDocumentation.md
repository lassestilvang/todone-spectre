# Recurring Task System Documentation

## Overview

The Todone Recurring Task System provides comprehensive functionality for creating, managing, and tracking recurring tasks. This system integrates seamlessly with the existing task management infrastructure and offers advanced features for complex scheduling scenarios.

## Core Components

### 1. Recurring Task Form (`RecurringTaskForm.tsx`)

The enhanced recurring task form provides:

- **Basic Task Information**: Title, description, status, priority, due date/time
- **Recurring Pattern Selection**: Daily, Weekly, Monthly, Yearly, Custom
- **Advanced Recurring Settings**:
  - Pattern presets for common configurations
  - Custom interval and unit selection
  - Day-of-week selection for weekly patterns
  - Day-of-month selection for monthly patterns
  - Positional monthly patterns (e.g., "first Monday")
- **End Conditions**:
  - End date
  - Maximum occurrences
  - Infinite recurrence
- **Live Preview**: Shows next 5 instances based on current configuration
- **Validation**: Real-time validation with error reporting

### 2. Recurring Task List (`RecurringTaskList.tsx`)

The enhanced recurring task list provides:

- **Advanced Filtering**:
  - Search by title/description
  - Filter by recurring pattern
  - Filter by task status
  - Show/hide completed tasks
- **Sorting**: By title, priority, due date, or status
- **Bulk Operations**:
  - Bulk selection mode
  - Pause/resume multiple tasks
  - Delete multiple tasks
- **Task Management**:
  - Pause/resume individual tasks
  - Generate next instance
  - Expand/collapse task details
  - View task statistics
- **Visual Indicators**:
  - Recurring pattern badges
  - Paused task indicators
  - Completion progress

### 3. Recurring Task Preview (`RecurringTaskPreview.tsx`)

The advanced recurring task preview provides:

- **Task Information**: Title, description, priority, status
- **Recurring Pattern Details**: Pattern type, interval, end conditions
- **Instance Management**:
  - View all generated instances
  - Show/hide all instances
  - Expand instance details
  - Mark instances as completed
- **Statistics Dashboard**:
  - Total instances
  - Completed instances
  - Pending instances
  - Next instance date
- **Regeneration**: One-click regeneration of all instances

### 4. Recurring Task Scheduler (`RecurringTaskScheduler.tsx`)

The comprehensive recurring task scheduler provides:

- **Instance Management**:
  - View all instances in a grid layout
  - Edit instance status
  - Mark instances as completed
- **Bulk Operations**:
  - Bulk status changes
  - Bulk completion
  - Bulk selection
- **Advanced Controls**:
  - Generate next instance
  - Regenerate all instances
  - Filter by status
  - Sort by date/status
- **Visualization**: Color-coded status indicators

## Services

### Recurring Task Service (`recurringTaskService.ts`)

The service provides comprehensive business logic with methods for CRUD operations, instance management, project integration, analytics, and import/export functionality.

### Recurring Pattern Service (`recurringPatternService.ts`)

The pattern service handles complex pattern generation with methods for date calculation, pattern validation, formatting, and preset management.

## Hooks

### `useRecurringTasks()` Hook

The comprehensive hook provides state management, data fetching, CRUD operations, instance management, advanced operations, analytics, and utility functions.

## Utilities

### Recurring Pattern Utilities (`recurringPatternUtils.ts`)

Comprehensive utilities for pattern validation, formatting, date calculations, and pattern manipulation.

### Recurring Task Validation Utilities (`recurringValidationUtils.ts`)

Validation functions for recurring task configurations, pattern-specific rules, business rules, and performance constraints.

### Recurring Task Integration Utilities (`recurringIntegrationUtils.ts`)

Utilities for integrating recurring tasks with projects, hierarchies, filters, dependencies, labels, and team collaboration.

### Recurring Task Utilities (`recurringUtils.ts`)

Core utility functions for managing recurring tasks, including instance generation, date calculations, and integration.

## Usage Examples

### Creating a Recurring Task

```typescript
import { useRecurringTasks } from '../hooks/useRecurringTasks';
import { RecurringTaskConfig } from '../types/task';

const { createRecurringTask } = useRecurringTasks();

const handleCreateRecurringTask = async () => {
  const taskData = {
    title: 'Weekly Team Meeting',
    description: 'Regular team sync meeting',
    status: 'active',
    priority: 'P2',
    dueDate: new Date('2023-06-15'),
    dueTime: '10:00:00'
  };

  const config: RecurringTaskConfig = {
    pattern: 'weekly',
    startDate: new Date('2023-06-15'),
    endDate: new Date('2023-12-31'),
    maxOccurrences: 26,
    customInterval: 1,
    customUnit: null
  };

  try {
    const newTask = await createRecurringTask(taskData, config);
    console.log('Created recurring task:', newTask);
  } catch (error) {
    console.error('Error creating recurring task:', error);
  }
};
```

### Managing Recurring Task Instances

```typescript
import { useRecurringTasks } from '../hooks/useRecurringTasks';

const { completeRecurringInstance, generateNextInstance, regenerateAllInstances } = useRecurringTasks();

const handleCompleteInstance = async (instanceId: string) => {
  try {
    await completeRecurringInstance(instanceId);
    console.log('Instance completed successfully');
  } catch (error) {
    console.error('Error completing instance:', error);
  }
};
```

### Using Advanced Pattern Configuration

```typescript
import { createPatternConfig } from '../utils/recurringPatternUtils';

const customPattern = createPatternConfig('custom', {
  frequency: 'monthly',
  customMonthDays: [1, 15],
  endCondition: 'on_date',
  endDate: new Date('2023-12-31'),
  interval: 1
});
```

### Working with Recurring Task Analytics

```typescript
import { useRecurringTasks } from '../hooks/useRecurringTasks';

const { getRecurringTaskStats, getRecurringTaskAnalytics, getRecurringTaskTimeline } = useRecurringTasks();

const loadAnalytics = async (taskId: string) => {
  try {
    const stats = getRecurringTaskStats(taskId);
    const analytics = await getRecurringTaskAnalytics(taskId);
    const timeline = await getRecurringTaskTimeline(taskId);
  } catch (error) {
    console.error('Error loading analytics:', error);
  }
};
```

## Integration Patterns

### Project Integration

```typescript
import { useRecurringTasks } from '../hooks/useRecurringTasks';

const { createRecurringTaskWithProject, fetchRecurringTasksByProject } = useRecurringTasks();

const handleCreateProjectRecurringTask = async (projectId: string) => {
  const taskData = {
    title: 'Project Weekly Sync',
    description: 'Weekly project synchronization meeting',
    status: 'active',
    priority: 'P2'
  };

  const config = {
    pattern: 'weekly',
    startDate: new Date(),
    maxOccurrences: 52
  };

  try {
    const newTask = await createRecurringTaskWithProject(taskData, projectId, config);
    console.log('Created project recurring task:', newTask);
  } catch (error) {
    console.error('Error creating project recurring task:', error);
  }
};
```

### Template System Integration

```typescript
import { useRecurringTasks } from '../hooks/useRecurringTasks';

const { createRecurringTaskTemplate, applyRecurringTaskTemplate } = useRecurringTasks();

const handleCreateTemplate = async (taskId: string) => {
  try {
    const template = await createRecurringTaskTemplate(taskId, 'Weekly Meeting Template');
    localStorage.setItem(`recurring-template-${template.templateId}`, JSON.stringify(template));
  } catch (error) {
    console.error('Error creating template:', error);
  }
};
```

## Best Practices

1. **Always validate configurations** before creating or updating recurring tasks
2. **Use pattern presets** for common configurations to ensure consistency
3. **Set reasonable end conditions** to prevent unlimited instance generation
4. **Monitor instance generation** to ensure tasks are being created as expected
5. **Use bulk operations** for managing multiple instances efficiently

## Troubleshooting

### Common Issues and Solutions

**Issue: Recurring task instances not being generated**
- Check that the task has a valid recurring pattern
- Verify that end conditions (date or max occurrences) haven't been reached
- Ensure the task is not paused
- Check that the start date is not in the past

**Issue: Performance problems with many recurring tasks**
- Review the complexity of recurring patterns
- Consider reducing the number of instances generated
- Implement pagination for displaying instances
- Review database indexing for recurring task queries

## API Reference

### Service Methods

#### `recurringTaskService.createRecurringTask(taskData, config)`
Creates a new recurring task with the specified configuration.

#### `recurringTaskService.updateRecurringTask(taskId, updates, configUpdates)`
Updates an existing recurring task and optionally its configuration.

#### `recurringTaskService.generateRecurringInstances(task, config)`
Generates recurring instances based on the task and configuration.

### Hook Methods

#### `useRecurringTasks().createRecurringTask(taskData, config)`
Creates a recurring task using the hook interface.

#### `useRecurringTasks().fetchRecurringTasks()`
Fetches all recurring tasks.

#### `useRecurringTasks().getRecurringTaskStats(taskId)`
Gets statistics for a recurring task.

### Utility Functions

#### `validateRecurringTaskConfiguration(task, config)`
Validates a complete recurring task configuration.

#### `createPatternConfig(pattern, options)`
Creates a pattern configuration from simple parameters.

## Migration Guide

### From Non-Recurring to Recurring Tasks

1. **Identify tasks** that should be recurring
2. **Create appropriate configurations** for each task
3. **Use the service methods** to convert tasks to recurring
4. **Review and adjust** the generated instances

### Updating Existing Recurring Tasks

1. **Fetch the current configuration** for the task
2. **Make necessary adjustments** to the configuration
3. **Validate the new configuration**
4. **Update the task** using the service methods

## Future Enhancements

1. **Advanced Pattern Types**: Add support for more complex patterns
2. **Time Zone Support**: Enhance date/time handling for different time zones
3. **Calendar Integration**: Deep integration with calendar views
4. **Natural Language Processing**: Allow pattern creation via natural language
5. **Machine Learning**: Intelligent pattern suggestions based on usage history