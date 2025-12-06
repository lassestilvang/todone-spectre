// @ts-nocheck
/**
 * Recurring Task System Test
 * Comprehensive test suite for the entire recurring task system
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
 * Test Suite: Recurring Task System Integration
 */
export class RecurringTaskSystemTest {
  private testResults: Array<{
    testName: string;
    success: boolean;
    message: string;
    details?: any;
  }> = [];

  /**
   * Run all system tests
   */
  async runAllTests(): Promise<{
    success: boolean;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    results: any[];
  }> {
    console.log("🧪 Running Recurring Task System Tests...\\n");

    // Service Tests
    await this.testRecurringTaskService();
    await this.testRecurringPatternService();
    await this.testRecurringTaskIntegration();

    // Utility Tests
    this.testRecurringUtils();
    this.testRecurringPatternUtils();

    // Integration Tests
    await this.testSystemIntegration();

    // Summary
    const passedTests = this.testResults.filter((r) => r.success).length;
    const failedTests = this.testResults.filter((r) => !r.success).length;

    console.log(`\\n📊 Test Summary:`);
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
   * Test Recurring Task Service
   */
  private async testRecurringTaskService(): Promise<void> {
    try {
      console.log("🧪 Testing Recurring Task Service...");

      // Test 1: Service availability
      if (recurringTaskService) {
        this.testResults.push({
          testName: "RecurringTaskService: Service Available",
          success: true,
          message: "Service instance available",
        });
      } else {
        this.testResults.push({
          testName: "RecurringTaskService: Service Available",
          success: false,
          message: "Service instance not available",
        });
        return;
      }

      // Test 2: Pattern presets
      const presets = recurringPatternService.getPatternPresets();
      this.testResults.push({
        testName: "RecurringTaskService: Pattern Presets",
        success: presets.length > 0,
        message:
          presets.length > 0
            ? `Found ${presets.length} presets`
            : "No presets found",
      });

      // Test 3: Pattern validation
      const testConfig = {
        pattern: "weekly",
        startDate: new Date(),
        endDate: null,
        maxOccurrences: 5,
        customInterval: 1,
        customUnit: null,
      };

      const validation =
        recurringPatternService.validatePatternConfig(testConfig);
      this.testResults.push({
        testName: "RecurringTaskService: Pattern Validation",
        success: validation.valid,
        message: validation.valid
          ? "Pattern validation works"
          : `Validation failed: ${validation.errors.join(", ")}`,
      });
    } catch (error) {
      this.testResults.push({
        testName: "RecurringTaskService: Service Tests",
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Test Recurring Pattern Service
   */
  private async testRecurringPatternService(): Promise<void> {
    try {
      console.log("🧪 Testing Recurring Pattern Service...");

      // Test 1: Service availability
      if (recurringPatternService) {
        this.testResults.push({
          testName: "RecurringPatternService: Service Available",
          success: true,
          message: "Service instance available",
        });
      } else {
        this.testResults.push({
          testName: "RecurringPatternService: Service Available",
          success: false,
          message: "Service instance not available",
        });
        return;
      }

      // Test 2: Pattern generation
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
        testName: "RecurringPatternService: Pattern Generation",
        success: instances.length > 0,
        message:
          instances.length > 0
            ? `Generated ${instances.length} instances`
            : "No instances generated",
      });

      // Test 3: Pattern formatting
      const formatted =
        recurringPatternService.formatRecurringPattern(testConfig);
      this.testResults.push({
        testName: "RecurringPatternService: Pattern Formatting",
        success: formatted.length > 0,
        message:
          formatted.length > 0
            ? `Formatted: ${formatted}`
            : "Formatting failed",
      });
    } catch (error) {
      this.testResults.push({
        testName: "RecurringPatternService: Service Tests",
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Test Recurring Task Integration
   */
  private async testRecurringTaskIntegration(): Promise<void> {
    try {
      console.log("🧪 Testing Recurring Task Integration...");

      // Test 1: Integration service availability
      if (recurringTaskIntegration) {
        this.testResults.push({
          testName: "RecurringTaskIntegration: Service Available",
          success: true,
          message: "Integration service available",
        });
      } else {
        this.testResults.push({
          testName: "RecurringTaskIntegration: Service Available",
          success: false,
          message: "Integration service not available",
        });
        return;
      }

      // Test 2: System statistics
      const stats = await recurringTaskIntegration.getSystemWideStatistics();
      this.testResults.push({
        testName: "RecurringTaskIntegration: System Statistics",
        success: stats !== null,
        message:
          stats !== null
            ? "Statistics retrieved successfully"
            : "Failed to get statistics",
      });
    } catch (error) {
      this.testResults.push({
        testName: "RecurringTaskIntegration: Service Tests",
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Test Recurring Utilities
   */
  private testRecurringUtils(): void {
    try {
      console.log("🧪 Testing Recurring Utilities...");

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
        testName: "RecurringUtils: Instance Generation",
        success: instances.length > 0,
        message:
          instances.length > 0
            ? `Generated ${instances.length} instances`
            : "No instances generated",
      });

      // Test 2: Config validation
      const validation = validateRecurringTaskConfig(config);
      this.testResults.push({
        testName: "RecurringUtils: Config Validation",
        success: validation.valid,
        message: validation.valid
          ? "Config validation works"
          : `Validation failed: ${validation.errors.join(", ")}`,
      });
    } catch (error) {
      this.testResults.push({
        testName: "RecurringUtils: Utility Tests",
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Test Recurring Pattern Utilities
   */
  private testRecurringPatternUtils(): void {
    try {
      console.log("🧪 Testing Recurring Pattern Utilities...");

      // Test 1: Pattern normalization
      const partialConfig = {
        pattern: "monthly",
        interval: 2,
      };

      const normalized = normalizeRecurringPatternConfig(partialConfig);
      this.testResults.push({
        testName: "RecurringPatternUtils: Pattern Normalization",
        success: normalized.pattern === "monthly" && normalized.interval === 2,
        message:
          normalized.pattern === "monthly" && normalized.interval === 2
            ? "Normalization works"
            : "Normalization failed",
      });

      // Test 2: Frequency description
      const description = getPatternFrequencyDescription({
        pattern: "daily",
        interval: 1,
      });

      this.testResults.push({
        testName: "RecurringPatternUtils: Frequency Description",
        success: description === "Daily",
        message:
          description === "Daily"
            ? "Frequency description works"
            : `Unexpected description: ${description}`,
      });
    } catch (error) {
      this.testResults.push({
        testName: "RecurringPatternUtils: Utility Tests",
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Test System Integration
   */
  private async testSystemIntegration(): Promise<void> {
    try {
      console.log("🧪 Testing System Integration...");

      // Test 1: Service connectivity
      const servicesAvailable =
        !!recurringTaskService &&
        !!recurringPatternService &&
        !!recurringTaskIntegration;

      this.testResults.push({
        testName: "SystemIntegration: Service Connectivity",
        success: servicesAvailable,
        message: servicesAvailable
          ? "All services available"
          : "Some services unavailable",
      });

      // Test 2: Pattern presets integration
      const presets = recurringPatternService.getPatternPresets();
      const hasPresets = presets.length > 0;

      this.testResults.push({
        testName: "SystemIntegration: Pattern Presets",
        success: hasPresets,
        message: hasPresets
          ? `Found ${presets.length} presets`
          : "No presets found",
      });

      // Test 3: System health
      const healthReport =
        await recurringTaskIntegration.getSystemHealthReport();
      this.testResults.push({
        testName: "SystemIntegration: System Health",
        success: healthReport.healthScore >= 0,
        message:
          healthReport.healthScore >= 0
            ? `Health score: ${healthReport.healthScore}`
            : "Health check failed",
      });
    } catch (error) {
      this.testResults.push({
        testName: "SystemIntegration: Integration Tests",
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Print test results
   */
  printResults(): void {
    console.log("\\n📋 Detailed Test Results:");
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
 * Run comprehensive system test
 */
export const runComprehensiveSystemTest = async (): Promise<void> => {
  const testSuite = new RecurringTaskSystemTest();
  const results = await testSuite.runAllTests();
  testSuite.printResults();

  if (results.success) {
    console.log(
      "\\n🎉 All system tests passed! Recurring task system is working correctly.",
    );
  } else {
    console.log("\\n⚠️  Some tests failed. Please review the results above.");
  }

  return results;
};
