/**
 * Recurring Task Testing Utilities
 * Comprehensive testing utilities for the recurring task system
 * Integrates data generators, service mocks, and testing helpers
 */

import { RecurringTaskTestDataGenerator } from "./recurringTaskTestDataGenerators";
import {
  MockRecurringTaskService,
  MockRecurringPatternService,
  MockRecurringTaskIntegration,
} from "./recurringTaskServiceMocks";
import {
  createMockRecurringTask,
  createMockRecurringConfig,
} from "./recurringTestUtils";
import { validateRecurringTaskConfiguration } from "../recurringValidationUtils";
import { Task } from "../../types/task";
import { RecurringPattern } from "../../types/enums";

/**
 * Comprehensive Recurring Task Testing Suite
 */
export class RecurringTaskTestingSuite {
  private testDataGenerator: RecurringTaskTestDataGenerator;
  private mockTaskService: MockRecurringTaskService;
  private mockPatternService: MockRecurringPatternService;
  private mockIntegration: MockRecurringTaskIntegration;

  constructor() {
    this.testDataGenerator = RecurringTaskTestDataGenerator.getInstance();
    this.mockTaskService = new MockRecurringTaskService();
    this.mockPatternService = new MockRecurringPatternService();
    this.mockIntegration = new MockRecurringTaskIntegration();
  }

  /**
   * Initialize the testing suite with optional initial data
   */
  initialize(initialTasks: Task[] = []): void {
    this.mockTaskService = new MockRecurringTaskService(initialTasks);
    this.mockPatternService = new MockRecurringPatternService();
    this.mockIntegration = new MockRecurringTaskIntegration();
  }

  /**
   * Reset all testing utilities
   */
  reset(): void {
    this.mockTaskService.reset();
    this.mockPatternService.reset();
    this.mockIntegration.reset();
  }

  /**
   * Generate comprehensive test data for recurring tasks
   */
  generateTestData(): {
    scenarios: Record<string, Task>;
    edgeCases: Record<string, Task>;
    analyticsData: {
      tasks: Task[];
      expectedStats: {
        totalRecurringTasks: number;
        activeRecurringTasks: number;
        pausedRecurringTasks: number;
        completedInstances: number;
        pendingInstances: number;
      };
    };
  } {
    return {
      scenarios: this.testDataGenerator.generateRecurringTaskScenarios(),
      edgeCases: this.testDataGenerator.generateEdgeCaseTestData(),
      analyticsData: this.testDataGenerator.generateAnalyticsTestData(),
    };
  }

  /**
   * Create a complete test environment with realistic data
   */
  async createTestEnvironment(): Promise<{
    tasks: Task[];
    instances: Task[];
    services: {
      taskService: MockRecurringTaskService;
      patternService: MockRecurringPatternService;
      integration: MockRecurringTaskIntegration;
    };
  }> {
    // Generate test data
    const testData = this.generateTestData();

    // Add scenarios to mock service
    const scenarioTasks = Object.values(testData.scenarios);
    for (const task of scenarioTasks) {
      await this.mockTaskService.createRecurringTask(
        task,
        task.customFields?.recurringConfig || createMockRecurringConfig(),
      );
    }

    // Add edge cases
    const edgeCaseTasks = Object.values(testData.edgeCases);
    for (const task of edgeCaseTasks) {
      await this.mockTaskService.createRecurringTask(
        task,
        task.customFields?.recurringConfig || createMockRecurringConfig(),
      );
    }

    // Add analytics data
    for (const task of testData.analyticsData.tasks) {
      if (task.recurringPattern) {
        await this.mockTaskService.createRecurringTask(
          task,
          task.customFields?.recurringConfig || createMockRecurringConfig(),
        );
      }
    }

    return {
      tasks: this.mockTaskService.getRecurringTasks(),
      instances: this.mockTaskService.getRecurringInstances("all"),
      services: {
        taskService: this.mockTaskService,
        patternService: this.mockPatternService,
        integration: this.mockIntegration,
      },
    };
  }

  /**
   * Run comprehensive validation tests
   */
  async runValidationTests(): Promise<{
    passed: number;
    failed: number;
    results: Array<{
      testName: string;
      passed: boolean;
      errors?: string[];
    }>;
  }> {
    const testCases = [
      {
        name: "Daily Task Validation",
        task: this.testDataGenerator.generateRealisticRecurringTask("daily"),
        shouldBeValid: true,
      },
      {
        name: "Weekly Task Validation",
        task: this.testDataGenerator.generateRealisticRecurringTask("weekly"),
        shouldBeValid: true,
      },
      {
        name: "Monthly Task Validation",
        task: this.testDataGenerator.generateRealisticRecurringTask("monthly"),
        shouldBeValid: true,
      },
      {
        name: "Yearly Task Validation",
        task: this.testDataGenerator.generateRealisticRecurringTask("yearly"),
        shouldBeValid: true,
      },
      {
        name: "Custom Pattern Validation",
        task: this.testDataGenerator.generateRealisticRecurringTask("custom"),
        shouldBeValid: true,
      },
      {
        name: "Invalid Task (No Pattern)",
        task: createMockRecurringTask({
          recurringPattern: undefined,
          customFields: {
            recurringConfig: {
              pattern: undefined,
              startDate: new Date(),
            },
          },
        }),
        shouldBeValid: false,
      },
      {
        name: "Invalid Task (Past Start Date)",
        task: createMockRecurringTask({
          customFields: {
            recurringConfig: {
              pattern: "weekly",
              startDate: new Date(Date.now() - 86400000), // Yesterday
            },
          },
        }),
        shouldBeValid: false,
      },
    ];

    const results: Array<{
      testName: string;
      passed: boolean;
      errors?: string[];
    }> = [];

    for (const testCase of testCases) {
      try {
        const validation = validateRecurringTaskConfiguration(
          testCase.task,
          testCase.task.customFields?.recurringConfig ||
            createMockRecurringConfig(),
        );

        const passed = validation.valid === testCase.shouldBeValid;

        results.push({
          testName: testCase.name,
          passed,
          errors: passed ? undefined : validation.errors,
        });
      } catch (error) {
        results.push({
          testName: testCase.name,
          passed: false,
          errors: [error instanceof Error ? error.message : "Unknown error"],
        });
      }
    }

    const passed = results.filter((r) => r.passed).length;
    const failed = results.length - passed;

    return { passed, failed, results };
  }

  /**
   * Run service integration tests
   */
  async runServiceIntegrationTests(): Promise<{
    serviceTests: {
      createTest: { success: boolean; error?: string };
      updateTest: { success: boolean; error?: string };
      deleteTest: { success: boolean; error?: string };
      instanceGenerationTest: { success: boolean; error?: string };
    };
    patternTests: {
      validationTest: { success: boolean; error?: string };
      dateGenerationTest: { success: boolean; error?: string };
    };
    integrationTests: {
      fullWorkflowTest: { success: boolean; error?: string };
      errorHandlingTest: { success: boolean; error?: string };
    };
  }> {
    const serviceTests = {
      createTest: { success: false },
      updateTest: { success: false },
      deleteTest: { success: false },
      instanceGenerationTest: { success: false },
    };

    const patternTests = {
      validationTest: { success: false },
      dateGenerationTest: { success: false },
    };

    const integrationTests = {
      fullWorkflowTest: { success: false },
      errorHandlingTest: { success: false },
    };

    try {
      // Test service methods
      const testTask =
        this.testDataGenerator.generateRealisticRecurringTask("weekly");
      const testConfig =
        testTask.customFields?.recurringConfig || createMockRecurringConfig();

      // Create test
      const createdTask = await this.mockTaskService.createRecurringTask(
        testTask,
        testConfig,
      );
      serviceTests.createTest.success = !!createdTask;

      // Update test
      if (serviceTests.createTest.success && createdTask.id) {
        const updatedTask = await this.mockTaskService.updateRecurringTask(
          createdTask.id,
          { title: "Updated Test Task" },
        );
        serviceTests.updateTest.success =
          updatedTask.title === "Updated Test Task";
      }

      // Instance generation test
      if (serviceTests.createTest.success && createdTask.id) {
        const instances = await this.mockTaskService.generateRecurringInstances(
          createdTask,
          createdTask.customFields?.recurringConfig || testConfig,
        );
        serviceTests.instanceGenerationTest.success = instances.length > 0;
      }

      // Delete test
      if (serviceTests.createTest.success && createdTask.id) {
        await this.mockTaskService.deleteRecurringTask(createdTask.id, false);
        serviceTests.deleteTest.success = true;
      }

      // Pattern service tests
      const patternConfig =
        this.mockPatternService.getDefaultPatternConfig("weekly");
      const validation =
        this.mockPatternService.validatePatternConfig(patternConfig);
      patternTests.validationTest.success = validation.valid;

      const dates = this.mockPatternService.generateRecurringDates(
        new Date(),
        patternConfig,
        5,
      );
      patternTests.dateGenerationTest.success = dates.length === 5;

      // Integration tests
      const integrationTask =
        this.testDataGenerator.generateRealisticRecurringTask("monthly");
      const integrationConfig =
        integrationTask.customFields?.recurringConfig ||
        createMockRecurringConfig();

      // Full workflow test
      const integratedTask =
        await this.mockIntegration.createRecurringTaskIntegrated(
          integrationTask,
          integrationConfig,
        );
      integrationTests.fullWorkflowTest.success = !!integratedTask;

      // Error handling test
      try {
        await this.mockTaskService.getRecurringTask("non-existent-id");
        integrationTests.errorHandlingTest.success = false;
      } catch {
        integrationTests.errorHandlingTest.success = true;
      }
    } catch (error) {
      console.error("Integration test error:", error);
      if (error instanceof Error) {
        if (error.message.includes("create")) {
          serviceTests.createTest.error = error.message;
        } else if (error.message.includes("update")) {
          serviceTests.updateTest.error = error.message;
        } else if (error.message.includes("delete")) {
          serviceTests.deleteTest.error = error.message;
        } else if (error.message.includes("instance")) {
          serviceTests.instanceGenerationTest.error = error.message;
        } else if (error.message.includes("pattern")) {
          patternTests.validationTest.error = error.message;
        } else if (error.message.includes("date")) {
          patternTests.dateGenerationTest.error = error.message;
        } else if (error.message.includes("workflow")) {
          integrationTests.fullWorkflowTest.error = error.message;
        } else {
          integrationTests.errorHandlingTest.error = error.message;
        }
      }
    }

    return {
      serviceTests,
      patternTests,
      integrationTests,
    };
  }

  /**
   * Run performance tests
   */
  async runPerformanceTests(taskCount: number = 100): Promise<{
    creationTime: number;
    generationTime: number;
    memoryUsage: number;
    success: boolean;
    stats: {
      tasksCreated: number;
      instancesGenerated: number;
      averageCreationTime: number;
      averageGenerationTime: number;
    };
  }> {
    const startTime = performance.now();
    let memoryStart = 0;

    if (typeof performance.memory !== "undefined") {
      memoryStart = performance.memory.usedJSHeapSize;
    }

    try {
      const testTasks: Task[] = [];
      let totalCreationTime = 0;
      let totalGenerationTime = 0;
      let totalInstances = 0;

      // Create multiple tasks and measure performance
      for (let i = 0; i < taskCount; i++) {
        const pattern = this.getRandomPattern();
        const task = this.testDataGenerator.generateRealisticRecurringTask(
          pattern,
          {
            title: `Performance Test Task ${i + 1}`,
            customFields: {
              recurringConfig: {
                pattern,
                startDate: new Date(),
                endDate: new Date(Date.now() + 86400000 * 30), // 30 days from now
                maxOccurrences: 5,
                customInterval: 1,
                customUnit: null,
              },
            },
          },
        );

        const taskStart = performance.now();
        const createdTask = await this.mockTaskService.createRecurringTask(
          task,
          task.customFields?.recurringConfig || createMockRecurringConfig(),
        );
        const taskEnd = performance.now();

        totalCreationTime += taskEnd - taskStart;
        testTasks.push(createdTask);

        // Generate instances and measure time
        const genStart = performance.now();
        const instances = await this.mockTaskService.generateRecurringInstances(
          createdTask,
          createdTask.customFields?.recurringConfig ||
            createMockRecurringConfig(),
        );
        const genEnd = performance.now();

        totalGenerationTime += genEnd - genStart;
        totalInstances += instances.length;
      }

      const endTime = performance.now();
      let memoryEnd = 0;

      if (typeof performance.memory !== "undefined") {
        memoryEnd = performance.memory.usedJSHeapSize;
      }

      const memoryUsage = memoryEnd - memoryStart;

      return {
        creationTime: endTime - startTime,
        generationTime: totalGenerationTime,
        memoryUsage,
        success: true,
        stats: {
          tasksCreated: testTasks.length,
          instancesGenerated: totalInstances,
          averageCreationTime: totalCreationTime / taskCount,
          averageGenerationTime: totalGenerationTime / taskCount,
        },
      };
    } catch (error) {
      console.error("Performance test error:", error);
      return {
        creationTime: 0,
        generationTime: 0,
        memoryUsage: 0,
        success: false,
        stats: {
          tasksCreated: 0,
          instancesGenerated: 0,
          averageCreationTime: 0,
          averageGenerationTime: 0,
        },
      };
    }
  }

  /**
   * Generate comprehensive test report
   */
  async generateTestReport(): Promise<string> {
    const reportLines: string[] = [
      "RECURRING TASK TESTING REPORT",
      "============================",
      "",
      `Generated: ${new Date().toISOString()}`,
      "",
    ];

    // Run all tests
    const validationResults = await this.runValidationTests();
    const integrationResults = await this.runServiceIntegrationTests();
    const performanceResults = await this.runPerformanceTests(50);

    // Validation Results
    reportLines.push(
      "VALIDATION TESTS:",
      `  Total Tests: ${validationResults.results.length}`,
      `  Passed: ${validationResults.passed}`,
      `  Failed: ${validationResults.failed}`,
      `  Success Rate: ${((validationResults.passed / validationResults.results.length) * 100).toFixed(1)}%`,
      "",
    );

    // Service Integration Results
    reportLines.push(
      "SERVICE INTEGRATION TESTS:",
      `  Create Test: ${integrationResults.serviceTests.createTest.success ? "✅ PASS" : "❌ FAIL"}`,
      `  Update Test: ${integrationResults.serviceTests.updateTest.success ? "✅ PASS" : "❌ FAIL"}`,
      `  Delete Test: ${integrationResults.serviceTests.deleteTest.success ? "✅ PASS" : "❌ FAIL"}`,
      `  Instance Generation: ${integrationResults.serviceTests.instanceGenerationTest.success ? "✅ PASS" : "❌ FAIL"}`,
      `  Pattern Validation: ${integrationResults.patternTests.validationTest.success ? "✅ PASS" : "❌ FAIL"}`,
      `  Date Generation: ${integrationResults.patternTests.dateGenerationTest.success ? "✅ PASS" : "❌ FAIL"}`,
      `  Full Workflow: ${integrationResults.integrationTests.fullWorkflowTest.success ? "✅ PASS" : "❌ FAIL"}`,
      `  Error Handling: ${integrationResults.integrationTests.errorHandlingTest.success ? "✅ PASS" : "❌ FAIL"}`,
      "",
    );

    // Performance Results
    reportLines.push(
      "PERFORMANCE TESTS:",
      `  Total Time: ${performanceResults.creationTime.toFixed(2)}ms`,
      `  Tasks Created: ${performanceResults.stats.tasksCreated}`,
      `  Instances Generated: ${performanceResults.stats.instancesGenerated}`,
      `  Average Creation Time: ${performanceResults.stats.averageCreationTime.toFixed(2)}ms/task`,
      `  Average Generation Time: ${performanceResults.stats.averageGenerationTime.toFixed(2)}ms/task`,
      `  Memory Usage: ${(performanceResults.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
      `  Success: ${performanceResults.success ? "✅ PASS" : "❌ FAIL"}`,
      "",
    );

    // Overall Summary
    const totalTests = validationResults.results.length + 8; // 8 integration tests
    const totalPassed =
      validationResults.passed +
      (integrationResults.serviceTests.createTest.success ? 1 : 0) +
      (integrationResults.serviceTests.updateTest.success ? 1 : 0) +
      (integrationResults.serviceTests.deleteTest.success ? 1 : 0) +
      (integrationResults.serviceTests.instanceGenerationTest.success ? 1 : 0) +
      (integrationResults.patternTests.validationTest.success ? 1 : 0) +
      (integrationResults.patternTests.dateGenerationTest.success ? 1 : 0) +
      (integrationResults.integrationTests.fullWorkflowTest.success ? 1 : 0) +
      (integrationResults.integrationTests.errorHandlingTest.success ? 1 : 0);

    const passRate = (totalPassed / totalTests) * 100;

    reportLines.push(
      "OVERALL SUMMARY:",
      `  Total Tests: ${totalTests}`,
      `  Passed: ${totalPassed}`,
      `  Failed: ${totalTests - totalPassed}`,
      `  Pass Rate: ${passRate.toFixed(1)}%`,
      `  Status: ${passRate >= 90 ? "✅ EXCELLENT" : passRate >= 70 ? "⚠️  GOOD" : "❌ NEEDS IMPROVEMENT"}`,
      "",
      "============================",
      "END OF TESTING REPORT",
    );

    return reportLines.join("\n");
  }

  // Helper methods

  private getRandomPattern(): RecurringPattern {
    const patterns: RecurringPattern[] = [
      "daily",
      "weekly",
      "monthly",
      "yearly",
      "custom",
    ];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }
}

// Singleton instance
export const recurringTaskTestingSuite = new RecurringTaskTestingSuite();
