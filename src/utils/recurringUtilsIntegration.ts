/**
 * Recurring Task Integration Utilities
 * Integration testing and validation utilities
 */
import { Task, RecurringTaskConfig } from "../types/task";
import { recurringTaskService } from "../services/recurringTaskService";
import { recurringPatternService } from "../services/recurringPatternService";
import { recurringTaskIntegration } from "../services/recurringTaskIntegration";

/**
 * Test recurring task creation integration
 */
export const testRecurringTaskCreationIntegration = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // Test data
    const testTaskData = {
      title: "Integration Test Task",
      description: "Test recurring task creation",
      status: "active" as const,
      priority: "P2" as const,
      dueDate: new Date(),
      dueTime: "10:00",
      completed: false,
      order: 0,
    };

    const testConfig = {
      pattern: "weekly" as const,
      startDate: new Date(),
      endDate: null,
      maxOccurrences: 5,
      customInterval: 1,
      customUnit: null,
    };

    // Create task using integration service
    const createdTask =
      await recurringTaskIntegration.createRecurringTaskIntegrated(
        testTaskData,
        testConfig,
      );

    if (!createdTask || !createdTask.id) {
      return {
        success: false,
        message: "Failed to create recurring task",
      };
    }

    // Verify task was created
    const retrievedTask = await recurringTaskService.getRecurringTask(
      createdTask.id,
    );
    if (!retrievedTask) {
      return {
        success: false,
        message: "Created task not found",
      };
    }

    // Verify instances were generated
    const instances = recurringTaskService.getRecurringInstances(
      createdTask.id,
    );
    if (instances.length === 0) {
      return {
        success: false,
        message: "No instances generated",
      };
    }

    return {
      success: true,
      message: `Successfully created recurring task with ${instances.length} instances`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Test recurring task update integration
 */
export const testRecurringTaskUpdateIntegration = async (
  taskId: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    // Get the task
    const task = await recurringTaskService.getRecurringTask(taskId);
    if (!task) {
      return {
        success: false,
        message: "Task not found",
      };
    }

    // Update task
    const updates = {
      title: "Updated Integration Test Task",
      description: "Updated test description",
    };

    const configUpdates = {
      maxOccurrences: 10,
    };

    const updatedTask =
      await recurringTaskIntegration.updateRecurringTaskIntegrated(
        taskId,
        updates,
        configUpdates,
      );

    if (!updatedTask) {
      return {
        success: false,
        message: "Failed to update task",
      };
    }

    // Verify update
    const retrievedTask = await recurringTaskService.getRecurringTask(taskId);
    if (retrievedTask?.title !== updates.title) {
      return {
        success: false,
        message: "Task update not reflected",
      };
    }

    return {
      success: true,
      message: "Successfully updated recurring task",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Test recurring task completion integration
 */
export const testRecurringTaskCompletionIntegration = async (
  taskId: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    // Get instances
    const instances = recurringTaskService.getRecurringInstances(taskId);
    if (instances.length === 0) {
      return {
        success: false,
        message: "No instances to complete",
      };
    }

    // Find a non-completed instance
    const instanceToComplete = instances.find(
      (instance) => !instance.completed,
    );
    if (!instanceToComplete) {
      return {
        success: false,
        message: "No incomplete instances found",
      };
    }

    // Complete the instance
    const completedInstance =
      await recurringTaskIntegration.completeRecurringInstanceIntegrated(
        instanceToComplete.id,
      );

    if (!completedInstance || !completedInstance.completed) {
      return {
        success: false,
        message: "Failed to complete instance",
      };
    }

    return {
      success: true,
      message: "Successfully completed recurring task instance",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Test system-wide integration
 */
export const testSystemWideIntegration = async (): Promise<{
  success: boolean;
  message: string;
  statistics: any;
}> => {
  try {
    // Get system statistics
    const statistics = await recurringTaskIntegration.getSystemWideStatistics();

    // Basic validation
    if (
      statistics.recurringTasks.total < 0 ||
      statistics.instances.total < 0 ||
      statistics.scheduling.queueLength < 0
    ) {
      return {
        success: false,
        message: "Invalid statistics data",
        statistics,
      };
    }

    return {
      success: true,
      message: "System-wide integration test passed",
      statistics,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      statistics: null,
    };
  }
};

/**
 * Test pattern service integration
 */
export const testPatternServiceIntegration = (): {
  success: boolean;
  message: string;
} => {
  try {
    // Test pattern presets
    const presets = recurringPatternService.getPatternPresets();
    if (presets.length === 0) {
      return {
        success: false,
        message: "No pattern presets found",
      };
    }

    // Test pattern validation
    const testConfig = {
      pattern: "weekly",
      frequency: "weekly",
      endCondition: "never",
      interval: 1,
    };

    const validation =
      recurringPatternService.validatePatternConfig(testConfig);
    if (!validation.valid) {
      return {
        success: false,
        message: `Pattern validation failed: ${validation.errors.join(", ")}`,
      };
    }

    // Test pattern formatting
    const formatted =
      recurringPatternService.formatRecurringPattern(testConfig);
    if (!formatted || formatted.length === 0) {
      return {
        success: false,
        message: "Pattern formatting failed",
      };
    }

    return {
      success: true,
      message: "Pattern service integration test passed",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
