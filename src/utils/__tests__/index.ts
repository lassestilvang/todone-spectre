/**
 * Recurring Task Testing Utilities Index
 * Centralized export of all recurring task testing utilities
 * Provides easy access to the complete testing toolkit
 */

// Test Data Generators
export { RecurringTaskTestDataGenerator, recurringTaskTestDataGenerator } from './recurringTaskTestDataGenerators';

// Service Mocks
export {
  MockRecurringTaskService,
  MockRecurringPatternService,
  MockRecurringTaskIntegration,
  mockRecurringTaskService,
  mockRecurringPatternService,
  mockRecurringTaskIntegration
} from './recurringTaskServiceMocks';

// Testing Suite
export { recurringTaskTestingSuite } from './recurringTaskTestingUtilities';

// Comprehensive Test Runner
export { RecurringTaskComprehensiveTestRunner, recurringTaskComprehensiveTestRunner } from './recurringTaskComprehensiveTestRunner';

// Existing Test Utilities
export {
  createMockRecurringTask,
  createMockRecurringConfig,
  createMockPatternConfig,
  generateTestRecurringInstances,
  createRecurringTaskTestScenarios,
  validateTestRecurringTask,
  testRecurringPatternGeneration,
  testRecurringTaskServiceMethods,
  createRecurringTaskPerformanceTest,
  createRecurringTaskValidationTestSuite,
  runRecurringTaskValidationTests,
  createRecurringTaskIntegrationTest,
  testRecurringTaskAnalytics,
  createMockRecurringTaskWithInstances,
  createRecurringTaskAnalyticsTestData
} from './recurringTestUtils';

// Validation Utilities
export { validateRecurringTaskConfiguration } from '../recurringValidationUtils';

// Complete Test Suite
export {
  runCompleteRecurringTaskTestSuite,
  runAndExportTestSuite,
  exportTestResultsForAnalysis
} from './recurringTaskCompleteTestSuite';

// System Validation
export {
  validateCompleteRecurringTaskSystem,
  runCompleteValidationAndLogResults,
  createValidationReport
} from './recurringCompleteValidation';

// Integration Tests
export {
  runRecurringTaskIntegrationTest
} from './recurringTaskIntegrationTest';

// System Validation
export {
  runCompleteRecurringTaskSystemValidation
} from './recurringTaskSystemValidation';

/**
 * Comprehensive Testing Toolkit
 * Provides access to all testing utilities in one place
 */
export const RecurringTaskTestingToolkit = {
  // Data Generation
  dataGenerators: {
    testDataGenerator: recurringTaskTestDataGenerator,
    createMockRecurringTask,
    createMockRecurringConfig,
    createMockPatternConfig,
    generateTestRecurringInstances,
    createRecurringTaskTestScenarios,
    createMockRecurringTaskWithInstances,
    createRecurringTaskAnalyticsTestData
  },

  // Service Mocks
  serviceMocks: {
    mockTaskService: mockRecurringTaskService,
    mockPatternService: mockRecurringPatternService,
    mockIntegration: mockRecurringTaskIntegration,
    MockRecurringTaskService,
    MockRecurringPatternService,
    MockRecurringTaskIntegration
  },

  // Testing Suite
  testingSuite: recurringTaskTestingSuite,

  // Comprehensive Test Runner
  testRunner: recurringTaskComprehensiveTestRunner,

  // Validation Utilities
  validation: {
    validateRecurringTaskConfiguration,
    validateTestRecurringTask,
    testRecurringPatternGeneration
  },

  // Service Testing
  serviceTesting: {
    testRecurringTaskServiceMethods,
    createRecurringTaskPerformanceTest,
    testRecurringTaskAnalytics
  },

  // Validation Testing
  validationTesting: {
    createRecurringTaskValidationTestSuite,
    runRecurringTaskValidationTests,
    createRecurringTaskIntegrationTest
  },

  // Complete Test Suites
  completeSuites: {
    runCompleteRecurringTaskTestSuite,
    runAndExportTestSuite,
    exportTestResultsForAnalysis,
    validateCompleteRecurringTaskSystem,
    runCompleteValidationAndLogResults,
    createValidationReport,
    runRecurringTaskIntegrationTest,
    runCompleteRecurringTaskSystemValidation
  }
};

/**
 * Quick Start Testing Functions
 * Convenience functions for common testing scenarios
 */
export const RecurringTaskQuickTests = {
  /**
   * Run a quick validation test
   */
  async runQuickValidationTest(): Promise<{
    passed: number;
    failed: number;
    passRate: number;
  }> {
    const results = await recurringTaskTestingSuite.runValidationTests();
    return {
      passed: results.passed,
      failed: results.failed,
      passRate: (results.passed / results.results.length) * 100
    };
  },

  /**
   * Run a quick integration test
   */
  async runQuickIntegrationTest(): Promise<{
    servicePassed: number;
    patternPassed: number;
    integrationPassed: number;
    totalPassed: number;
    totalTests: number;
  }> {
    const results = await recurringTaskTestingSuite.runServiceIntegrationTests();

    const servicePassed = [
      results.serviceTests.createTest.success,
      results.serviceTests.updateTest.success,
      results.serviceTests.deleteTest.success,
      results.serviceTests.instanceGenerationTest.success
    ].filter(Boolean).length;

    const patternPassed = [
      results.patternTests.validationTest.success,
      results.patternTests.dateGenerationTest.success
    ].filter(Boolean).length;

    const integrationPassed = [
      results.integrationTests.fullWorkflowTest.success,
      results.integrationTests.errorHandlingTest.success
    ].filter(Boolean).length;

    return {
      servicePassed,
      patternPassed,
      integrationPassed,
      totalPassed: servicePassed + patternPassed + integrationPassed,
      totalTests: 8
    };
  },

  /**
   * Run a quick performance test
   */
  async runQuickPerformanceTest(taskCount: number = 10): Promise<{
    success: boolean;
    creationTime: number;
    generationTime: number;
    memoryUsage: number;
  }> {
    const results = await recurringTaskTestingSuite.runPerformanceTests(taskCount);
    return {
      success: results.success,
      creationTime: results.creationTime,
      generationTime: results.generationTime,
      memoryUsage: results.memoryUsage
    };
  },

  /**
   * Generate test data for a specific pattern
   */
  generatePatternTestData(pattern: RecurringPattern): Task {
    return recurringTaskTestDataGenerator.generateRealisticRecurringTask(pattern);
  },

  /**
   * Create a mock service with test data
   */
  createMockServiceWithTestData(): MockRecurringTaskService {
    const mockService = new MockRecurringTaskService();
    const testData = recurringTaskTestDataGenerator.generateRecurringTaskScenarios();

    // Add test data to mock service
    Object.values(testData).forEach(async (task) => {
      await mockService.createRecurringTask(
        task,
        task.customFields?.recurringConfig || {
          pattern: 'weekly',
          startDate: new Date(),
          maxOccurrences: 10
        }
      );
    });

    return mockService;
  }
};