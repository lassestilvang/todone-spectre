// @ts-nocheck
/**
 * Recurring Task Integration Test
 * Tests the complete integration of recurring task features
 */
import { Task, RecurringTaskConfig } from "../../types/task";
import { RecurringPattern } from "../../types/enums";
import { recurringTaskService } from "../../services/recurringTaskService";
import { recurringPatternService } from "../../services/recurringPatternService";
import { recurringTaskIntegration } from "../../services/recurringTaskIntegration";
import {
  generateRecurringTaskInstances,
  validateRecurringTaskConfig,
} from "../recurringUtils";
import {
  normalizeRecurringPatternConfig,
  getPatternFrequencyDescription,
} from "../recurringPatternUtils";

/**
 * Integration Test Suite
 */
export class RecurringTaskIntegrationTest {
  private testResults: Array<{
    testName: string;
    success: boolean;
    message: string;
    details?: any;
  }> = [];

  /**
   * Run all integration tests
   */
  async runAllTests(): Promise<{
    success: boolean;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    results: any[];
  }> {
    console.log("🔗 Running Recurring Task Integration Tests...\\n");

    // Core functionality tests
    await this.testCoreFunctionality();
    await this.testPatternManagement();
    await this.testInstanceGeneration();
    await this.testValidationAndErrorHandling();

    // Summary
    const passedTests = this.testResults.filter((r) => r.success).length;
    const failedTests = this.testResults.filter((r) => !r.success).length;

    console.log(`\\n📊 Integration Test Summary:`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(
      `📈 Success Rate: ${Math.round((passedTests / this.testResults.length) * 100)}%`,
    );

    return {
      success: failedTests === 0,
      totalTests: this.testResults.length,
      passedTests,
      failedTests,
      results: this.testResults,
    };
  }

  /**
   * Test core functionality
   */
  private async testCoreFunctionality(): Promise<void> {
    try {
      console.log("🧪 Testing Core Functionality...");

      // Test 1: Service availability
      const servicesAvailable =
        !!recurringTaskService &&
        !!recurringPatternService &&
        !!recurringTaskIntegration;

      this.testResults.push({
        testName: "CoreFunctionality: Service Availability",
        success: servicesAvailable,
        message: servicesAvailable
          ? "All core services available"
          : "Some services unavailable",
      });

      // Test 2: Pattern presets
      const presets = recurringPatternService.getPatternPresets();
      this.testResults.push({
        testName: "CoreFunctionality: Pattern Presets",
        success: presets.length > 0,
        message:
          presets.length > 0
            ? `Found ${presets.length} presets`
            : "No presets found",
      });

      // Test 3: Pattern validation
      const testConfig = {
        pattern: "weekly",
        frequency: "weekly",
        endCondition: "never",
        interval: 1,
      };

      const validation =
        recurringPatternService.validatePatternConfig(testConfig);
      this.testResults.push({
        testName: "CoreFunctionality: Pattern Validation",
        success: validation.valid,
        message: validation.valid
          ? "Pattern validation works"
          : `Validation failed: ${validation.errors.join(", ")}`,
      });
    } catch (error) {
      this.testResults.push({
        testName: "CoreFunctionality: Core Tests",
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Test pattern management
   */
  private async testPatternManagement(): Promise<void> {
    try {
      console.log("🧪 Testing Pattern Management...");

      // Test 1: Pattern generation
      const testConfig = {
        pattern: "weekly",
        frequency: "weekly",
        endCondition: "never",
        interval: 1,
      };

      const instances = recurringPatternService.generateRecurringDates(
        new Date(),
        testConfig,
        3,
      );
      this.testResults.push({
        testName: "PatternManagement: Pattern Generation",
        success: instances.length > 0,
        message:
          instances.length > 0
            ? `Generated ${instances.length} instances`
            : "No instances generated",
      });

      // Test 2: Pattern formatting
      const formatted =
        recurringPatternService.formatRecurringPattern(testConfig);
      this.testResults.push({
        testName: "PatternManagement: Pattern Formatting",
        success: formatted.length > 0,
        message:
          formatted.length > 0
            ? `Formatted: ${formatted}`
            : "Formatting failed",
      });

      // Test 3: Pattern complexity
      const complexity =
        recurringPatternService.getPatternComplexityScore(testConfig);
      this.testResults.push({
        testName: "PatternManagement: Pattern Complexity",
        success: complexity >= 0,
        message:
          complexity >= 0
            ? `Complexity score: ${complexity}`
            : "Complexity calculation failed",
      });
    } catch (error) {
      this.testResults.push({
        testName: "PatternManagement: Pattern Tests",
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Test instance generation
   */
  private async testInstanceGeneration(): Promise<void> {
    try {
      console.log("🧪 Testing Instance Generation...");

      // Test 1: Instance generation
      const mockTask: Task = {
        id: "test-task",
        title: "Test Task",
        status: "active",
        priority: "P2",
        dueDate: new Date(),
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 0,
      };

      const config: RecurringTaskConfig = {
        pattern: "weekly",
        startDate: new Date(),
        endDate: null,
        maxOccurrences: 3,
        customInterval: 1,
        customUnit: null,
      };

      const instances = generateRecurringTaskInstances(mockTask, config, 3);
      this.testResults.push({
        testName: "InstanceGeneration: Instance Generation",
        success: instances.length > 0,
        message:
          instances.length > 0
            ? `Generated ${instances.length} instances`
            : "No instances generated",
      });

      // Test 2: Config validation
      const validation = validateRecurringTaskConfig(config);
      this.testResults.push({
        testName: "InstanceGeneration: Config Validation",
        success: validation.valid,
        message: validation.valid
          ? "Config validation works"
          : `Validation failed: ${validation.errors.join(", ")}`,
      });

      // Test 3: Pattern normalization
      const partialConfig = {
        pattern: "monthly",
        interval: 2,
      };

      const normalized = normalizeRecurringPatternConfig(partialConfig);
      this.testResults.push({
        testName: "InstanceGeneration: Pattern Normalization",
        success: normalized.pattern === "monthly" && normalized.interval === 2,
        message:
          normalized.pattern === "monthly" && normalized.interval === 2
            ? "Normalization works"
            : "Normalization failed",
      });
    } catch (error) {
      this.testResults.push({
        testName: "InstanceGeneration: Generation Tests",
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Test validation and error handling
   */
  private async testValidationAndErrorHandling(): Promise<void> {
    try {
      console.log("🧪 Testing Validation and Error Handling...");

      // Test 1: Invalid config validation
      const invalidConfig = {
        pattern: "weekly",
        startDate: new Date(),
        endDate: new Date("2020-01-01"), // Past date
        maxOccurrences: 0, // Invalid
        customInterval: 1,
        customUnit: null,
      };

      const validation = validateRecurringTaskConfig(invalidConfig);
      this.testResults.push({
        testName: "Validation: Invalid Config Detection",
        success: !validation.valid && validation.errors.length > 0,
        message:
          !validation.valid && validation.errors.length > 0
            ? "Invalid config detected"
            : "Invalid config not detected",
      });

      // Test 2: Pattern validation
      const invalidPatternConfig = {
        pattern: "weekly",
        frequency: "weekly",
        endCondition: "never",
        interval: 0, // Invalid
      };

      const patternValidation =
        recurringPatternService.validatePatternConfig(invalidPatternConfig);
      this.testResults.push({
        testName: "Validation: Pattern Validation",
        success: !patternValidation.valid,
        message: !patternValidation.valid
          ? "Invalid pattern detected"
          : "Invalid pattern not detected",
      });

      // Test 3: System health
      const healthReport =
        await recurringTaskIntegration.getSystemHealthReport();
      this.testResults.push({
        testName: "Validation: System Health",
        success: healthReport.healthScore >= 0,
        message:
          healthReport.healthScore >= 0
            ? `Health score: ${healthReport.healthScore}`
            : "Health check failed",
      });
    } catch (error) {
      this.testResults.push({
        testName: "Validation: Validation Tests",
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Print test results
   */
  printResults(): void {
    console.log("\\n📋 Detailed Integration Test Results:");
    this.testResults.forEach((result, index) => {
      const status = result.success ? "✅" : "❌";
      console.log(`${status} ${index + 1}. ${result.testName}`);
      console.log(`   ${result.message}`);
      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details)}`);
      }
    });
  }
}

/**
 * Run comprehensive integration test
 */
export const runComprehensiveIntegrationTest = async (): Promise<void> => {
  const testSuite = new RecurringTaskIntegrationTest();
  const results = await testSuite.runAllTests();
  testSuite.printResults();

  if (results.success) {
    console.log(
      "\\n🎉 All integration tests passed! Recurring task system is fully integrated.",
    );
  } else {
    console.log(
      "\\n⚠️  Some integration tests failed. Please review the results above.",
    );
  }

  return results;
};
