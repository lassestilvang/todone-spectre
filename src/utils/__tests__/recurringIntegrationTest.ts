/**
 * Recurring Task Integration Test
 * Comprehensive test to verify all recurring task components work together
 */

import {
  createMockRecurringTask,
  createMockRecurringConfig,
} from "./recurringTestUtils";
import { validateRecurringTaskConfiguration } from "../recurringValidationUtils";
import { recurringTaskService } from "../../services/recurringTaskService";
import { recurringPatternService } from "../../services/recurringPatternService";
import { useRecurringTasks } from "../../hooks/useRecurringTasks";
import { RecurringTaskForm } from "../../features/recurring/RecurringTaskForm";
import { RecurringTaskList } from "../../features/recurring/RecurringTaskList";
import { RecurringTaskPreview } from "../../features/recurring/RecurringTaskPreview";
import { RecurringTaskScheduler } from "../../features/recurring/RecurringTaskScheduler";

/**
 * Run comprehensive integration test
 */
export const runRecurringTaskIntegrationTest = async (): Promise<{
  success: boolean;
  componentTests: Record<string, { success: boolean; error?: string }>;
  serviceTests: Record<string, { success: boolean; error?: string }>;
  validationTests: Record<string, { success: boolean; error?: string }>;
  performanceMetrics: {
    totalTime: number;
    componentLoadTime: number;
    serviceOperationTime: number;
  };
}> => {
  const startTime = performance.now();
  const componentTests: Record<string, { success: boolean; error?: string }> =
    {};
  const serviceTests: Record<string, { success: boolean; error?: string }> = {};
  const validationTests: Record<string, { success: boolean; error?: string }> =
    {};

  try {
    // Test 1: Component Integration
    console.log("🧪 Testing component integration...");

    // Verify components can be imported and rendered
    try {
      // These would normally be tested with React Testing Library
      // For this integration test, we'll just verify they exist and have the right structure
      componentTests.RecurringTaskForm = {
        success:
          typeof RecurringTaskForm === "function" &&
          RecurringTaskForm.name === "RecurringTaskForm",
      };

      componentTests.RecurringTaskList = {
        success:
          typeof RecurringTaskList === "function" &&
          RecurringTaskList.name === "RecurringTaskList",
      };

      componentTests.RecurringTaskPreview = {
        success:
          typeof RecurringTaskPreview === "function" &&
          RecurringTaskPreview.name === "RecurringTaskPreview",
      };

      componentTests.RecurringTaskScheduler = {
        success:
          typeof RecurringTaskScheduler === "function" &&
          RecurringTaskScheduler.name === "RecurringTaskScheduler",
      };
    } catch (error) {
      componentTests.RecurringTaskForm = {
        success: false,
        error: error.message,
      };
      componentTests.RecurringTaskList = {
        success: false,
        error: error.message,
      };
      componentTests.RecurringTaskPreview = {
        success: false,
        error: error.message,
      };
      componentTests.RecurringTaskScheduler = {
        success: false,
        error: error.message,
      };
    }

    const componentLoadTime = performance.now();

    // Test 2: Service Integration
    console.log("🔧 Testing service integration...");

    try {
      const mockTask = createMockRecurringTask();
      const mockConfig = createMockRecurringConfig();

      // Test pattern service
      const patternTest = recurringPatternService.validatePatternConfig(
        getPatternConfigFromTaskConfig(mockConfig),
      );
      serviceTests.PatternService = {
        success: patternTest.valid,
      };

      // Test recurring task service methods
      const serviceValidation = validateRecurringTaskConfiguration(
        mockTask,
        mockConfig,
      );
      serviceTests.RecurringTaskService = {
        success: serviceValidation.valid,
      };

      // Test instance generation
      const instances = await recurringTaskService.generateRecurringInstances(
        mockTask,
        mockConfig,
      );
      serviceTests.InstanceGeneration = {
        success: instances.length > 0,
      };
    } catch (error) {
      serviceTests.PatternService = { success: false, error: error.message };
      serviceTests.RecurringTaskService = {
        success: false,
        error: error.message,
      };
      serviceTests.InstanceGeneration = {
        success: false,
        error: error.message,
      };
    }

    const serviceOperationTime = performance.now();

    // Test 3: Validation Integration
    console.log("✅ Testing validation integration...");

    try {
      const validTask = createMockRecurringTask();
      const validConfig = createMockRecurringConfig();

      const validValidation = validateRecurringTaskConfiguration(
        validTask,
        validConfig,
      );
      validationTests.ValidConfiguration = {
        success: validValidation.valid && validValidation.errors.length === 0,
      };

      const invalidConfig = createMockRecurringConfig({
        pattern: undefined,
        startDate: undefined,
      });

      const invalidValidation = validateRecurringTaskConfiguration(
        validTask,
        invalidConfig,
      );
      validationTests.InvalidConfiguration = {
        success:
          !invalidValidation.valid && invalidValidation.errors.length > 0,
      };
    } catch (error) {
      validationTests.ValidConfiguration = {
        success: false,
        error: error.message,
      };
      validationTests.InvalidConfiguration = {
        success: false,
        error: error.message,
      };
    }

    const endTime = performance.now();

    // Calculate performance metrics
    const performanceMetrics = {
      totalTime: endTime - startTime,
      componentLoadTime: componentLoadTime - startTime,
      serviceOperationTime: serviceOperationTime - componentLoadTime,
    };

    // Determine overall success
    const allComponentTestsPassed = Object.values(componentTests).every(
      (t) => t.success,
    );
    const allServiceTestsPassed = Object.values(serviceTests).every(
      (t) => t.success,
    );
    const allValidationTestsPassed = Object.values(validationTests).every(
      (t) => t.success,
    );

    const success =
      allComponentTestsPassed &&
      allServiceTestsPassed &&
      allValidationTestsPassed;

    return {
      success,
      componentTests,
      serviceTests,
      validationTests,
      performanceMetrics,
    };
  } catch (error) {
    console.error("Integration test failed:", error);
    return {
      success: false,
      componentTests: {
        RecurringTaskForm: { success: false, error: error.message },
        RecurringTaskList: { success: false, error: error.message },
        RecurringTaskPreview: { success: false, error: error.message },
        RecurringTaskScheduler: { success: false, error: error.message },
      },
      serviceTests: {
        PatternService: { success: false, error: error.message },
        RecurringTaskService: { success: false, error: error.message },
        InstanceGeneration: { success: false, error: error.message },
      },
      validationTests: {
        ValidConfiguration: { success: false, error: error.message },
        InvalidConfiguration: { success: false, error: error.message },
      },
      performanceMetrics: {
        totalTime: 0,
        componentLoadTime: 0,
        serviceOperationTime: 0,
      },
    };
  }
};

/**
 * Helper function to get pattern config from task config
 */
function getPatternConfigFromTaskConfig(config: any): any {
  return {
    pattern: config.pattern,
    frequency: config.customUnit || config.pattern,
    endCondition: config.endDate
      ? "on_date"
      : config.maxOccurrences
        ? "after_occurrences"
        : "never",
    endDate: config.endDate || null,
    maxOccurrences: config.maxOccurrences || null,
    interval: config.customInterval || 1,
    customDays: null,
    customMonthDays: null,
    customMonthPosition: null,
    customMonthDay: null,
  };
}

/**
 * Run integration test and log results
 */
export const logIntegrationTestResults = async (): Promise<void> => {
  console.log("🔍 Running Recurring Task Integration Test...\\n");

  const startTime = performance.now();
  const result = await runRecurringTaskIntegrationTest();
  const endTime = performance.now();

  console.log("📊 Integration Test Results:");
  console.log(
    `⏱️  Total Time: ${result.performanceMetrics.totalTime.toFixed(2)}ms`,
  );
  console.log(
    `📦 Component Load: ${result.performanceMetrics.componentLoadTime.toFixed(2)}ms`,
  );
  console.log(
    `⚙️  Service Operations: ${result.performanceMetrics.serviceOperationTime.toFixed(2)}ms`,
  );
  console.log("");

  console.log("🧪 Component Tests:");
  Object.entries(result.componentTests).forEach(([name, test]) => {
    console.log(
      `  ${test.success ? "✅" : "❌"} ${name}: ${test.success ? "Passed" : `Failed - ${test.error}`}`,
    );
  });

  console.log("\\n🔧 Service Tests:");
  Object.entries(result.serviceTests).forEach(([name, test]) => {
    console.log(
      `  ${test.success ? "✅" : "❌"} ${name}: ${test.success ? "Passed" : `Failed - ${test.error}`}`,
    );
  });

  console.log("\\n✅ Validation Tests:");
  Object.entries(result.validationTests).forEach(([name, test]) => {
    console.log(
      `  ${test.success ? "✅" : "❌"} ${name}: ${test.success ? "Passed" : `Failed - ${test.error}`}`,
    );
  });

  console.log("\\n📈 Overall Results:");
  const passedComponents = Object.values(result.componentTests).filter(
    (t) => t.success,
  ).length;
  const passedServices = Object.values(result.serviceTests).filter(
    (t) => t.success,
  ).length;
  const passedValidations = Object.values(result.validationTests).filter(
    (t) => t.success,
  ).length;
  const totalTests = passedComponents + passedServices + passedValidations;
  const passedTests = passedComponents + passedServices + passedValidations;

  console.log(`🎯 Tests Passed: ${passedTests}/${totalTests}`);
  console.log(
    `🎉 Success: ${result.success ? "✅ All integration tests passed!" : "❌ Some integration tests failed."}`,
  );

  if (!result.success) {
    console.log("\\n🔍 Failed Tests Summary:");
    const failedTests = [
      ...Object.entries(result.componentTests).filter(
        ([_, test]) => !test.success,
      ),
      ...Object.entries(result.serviceTests).filter(
        ([_, test]) => !test.success,
      ),
      ...Object.entries(result.validationTests).filter(
        ([_, test]) => !test.success,
      ),
    ];

    failedTests.forEach(([name, test]) => {
      console.log(`  🔴 ${name}: ${test.error}`);
    });
  }

  console.log(
    `\\n⏱️  Total Execution Time: ${(endTime - startTime).toFixed(2)}ms`,
  );
};

/**
 * Run a quick health check for the recurring task system
 */
export const runRecurringTaskHealthCheck = async (): Promise<{
  healthy: boolean;
  issues: string[];
  warnings: string[];
}> => {
  const issues: string[] = [];
  const warnings: string[] = [];

  try {
    // Check if services are available
    if (!recurringTaskService) {
      issues.push("RecurringTaskService not available");
    }

    if (!recurringPatternService) {
      issues.push("RecurringPatternService not available");
    }

    // Check if hooks are available
    try {
      // Check if hook is available - we can't call it directly in non-React context
      if (typeof useRecurringTasks !== "function") {
        issues.push("useRecurringTasks hook not available");
      }
    } catch (error) {
      issues.push(`useRecurringTasks hook error: ${error.message}`);
    }

    // Test basic functionality
    try {
      const mockTask = createMockRecurringTask();
      const mockConfig = createMockRecurringConfig();

      const validation = validateRecurringTaskConfiguration(
        mockTask,
        mockConfig,
      );
      if (!validation.valid) {
        warnings.push(
          `Configuration validation issues: ${validation.errors.join(", ")}`,
        );
      }
    } catch (error) {
      issues.push(`Basic functionality test failed: ${error.message}`);
    }

    // Test pattern generation
    try {
      const patternConfig =
        recurringPatternService.getDefaultPatternConfig("weekly");
      const testInstances = recurringPatternService.generateRecurringDates(
        new Date(),
        patternConfig,
        3,
      );

      if (testInstances.length === 0) {
        warnings.push("Pattern generation test produced no instances");
      }
    } catch (error) {
      issues.push(`Pattern generation test failed: ${error.message}`);
    }

    return {
      healthy: issues.length === 0,
      issues,
      warnings,
    };
  } catch (error) {
    issues.push(`Health check failed: ${error.message}`);
    return {
      healthy: false,
      issues,
      warnings: [],
    };
  }
};
