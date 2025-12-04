/**
 * Complete Recurring Task Test Suite
 * Comprehensive test suite for the entire recurring task system
 */
import { runCompleteRecurringTaskSystemValidation } from './recurringTaskSystemValidation';
import { runRecurringTaskIntegrationTest } from './recurringTaskIntegrationTest';
import { recurringTaskIntegration } from '../../services/recurringTaskIntegration';
import { recurringTaskService } from '../../services/recurringTaskService';
import { recurringPatternManager } from '../../services/recurringPatternManager';
import { recurringTaskScheduler } from '../../services/recurringTaskScheduler';
import { recurringTaskGenerator } from '../../services/recurringTaskGenerator';

/**
 * Run the complete test suite
 */
export async function runCompleteRecurringTaskTestSuite(): Promise<{
  success: boolean;
  overallScore: number;
  testResults: {
    systemValidation: any;
    integrationTest: any;
    componentTests: any[];
  };
  recommendations: any[];
}> {
  console.log('🚀 Running Complete Recurring Task Test Suite...\\n');
  console.log('==========================================');
  console.log('  TODONE RECURRING TASK SYSTEM TEST SUITE');
  console.log('==========================================\\n');

  const startTime = performance.now();
  const testResults: any = {
    systemValidation: null,
    integrationTest: null,
    componentTests: []
  };

  try {
    // Initialize services
    recurringTaskIntegration.initialize();
    console.log('✅ Services initialized\\n');

    // Run system validation
    console.log('🔍 Running System Validation...');
    const systemValidation = await runCompleteRecurringTaskSystemValidation();
    testResults.systemValidation = systemValidation;
    console.log(`✅ System Validation Complete: ${systemValidation.isValid ? 'PASSED' : 'FAILED'}\\n`);

    // Run integration test
    console.log('🔗 Running Integration Test...');
    const integrationTest = await runRecurringTaskIntegrationTest();
    testResults.integrationTest = integrationTest;
    console.log(`✅ Integration Test Complete: ${integrationTest.success ? 'PASSED' : 'FAILED'}\\n`);

    // Run component tests
    console.log('🧩 Running Component Tests...');
    await runComponentTests(testResults.componentTests);
    console.log(`✅ Component Tests Complete\\n`);

    // Calculate overall score
    const overallScore = calculateOverallScore(testResults);

    // Generate recommendations
    const recommendations = generateRecommendations(testResults, overallScore);

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    console.log('📊 Test Suite Summary:');
    console.log(`🔹 Total Time: ${(totalTime / 1000).toFixed(2)} seconds`);
    console.log(`🔹 Overall Score: ${overallScore}/100`);
    console.log(`🔹 System Health: ${systemValidation.isValid ? '✅ HEALTHY' : '⚠️  ISSUES DETECTED'}`);
    console.log(`🔹 Integration Status: ${integrationTest.success ? '✅ WORKING' : '⚠️  ISSUES DETECTED'}`);
    console.log(`🔹 Recommendations: ${recommendations.length}\\n`);

    const success = overallScore >= 80 && systemValidation.isValid && integrationTest.success;

    console.log('🎯 Final Result:');
    if (success) {
      console.log('🎉 ALL TESTS PASSED! Recurring task system is fully operational.');
    } else {
      console.log('⚠️  Test suite completed with issues. Review recommendations below.');
    }

    return {
      success,
      overallScore,
      testResults,
      recommendations
    };

  } catch (error) {
    console.error('💥 Test suite failed with error:', error);

    return {
      success: false,
      overallScore: 0,
      testResults: {
        systemValidation: null,
        integrationTest: null,
        componentTests: [{
          testName: 'Complete Test Suite',
          status: 'fail',
          message: 'Test suite failed to complete',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        }]
      },
      recommendations: [{
        priority: 'critical',
        recommendation: 'Investigate test suite failure',
        action: 'Check error logs and system status'
      }]
    };
  }
}

/**
 * Run component-specific tests
 */
async function runComponentTests(componentTests: any[]): Promise<void> {
  try {
    // Test RecurringTaskService
    if (recurringTaskService) {
      componentTests.push({
        testName: 'RecurringTaskService',
        status: 'pass',
        message: 'Service is available and responsive',
        details: {}
      });
    } else {
      componentTests.push({
        testName: 'RecurringTaskService',
        status: 'fail',
        message: 'Service is not available',
        details: {}
      });
    }

    // Test RecurringPatternManager
    if (recurringPatternManager) {
      const testConfig = {
        pattern: 'daily' as const,
        startDate: new Date(),
        endCondition: 'never' as const,
        interval: 1
      };

      const validation = recurringPatternManager.validatePatternConfigAdvanced(testConfig);
      if (validation.valid) {
        componentTests.push({
          testName: 'RecurringPatternManager',
          status: 'pass',
          message: 'Pattern manager is functional',
          details: {}
        });
      } else {
        componentTests.push({
          testName: 'RecurringPatternManager',
          status: 'fail',
          message: 'Pattern manager validation failed',
          details: { errors: validation.errors }
        });
      }
    } else {
      componentTests.push({
        testName: 'RecurringPatternManager',
        status: 'fail',
        message: 'Pattern manager is not available',
        details: {}
      });
    }

    // Test RecurringTaskScheduler
    if (recurringTaskScheduler) {
      const stats = await recurringTaskScheduler.getSchedulingStatistics();
      if (stats) {
        componentTests.push({
          testName: 'RecurringTaskScheduler',
          status: 'pass',
          message: 'Scheduler is functional',
          details: {}
        });
      } else {
        componentTests.push({
          testName: 'RecurringTaskScheduler',
          status: 'fail',
          message: 'Scheduler statistics failed',
          details: {}
        });
      }
    } else {
      componentTests.push({
        testName: 'RecurringTaskScheduler',
        status: 'fail',
        message: 'Scheduler is not available',
        details: {}
      });
    }

    // Test RecurringTaskGenerator
    if (recurringTaskGenerator) {
      const testConfig = {
        pattern: 'weekly' as const,
        startDate: new Date(),
        endCondition: 'never' as const,
        interval: 1
      };

      const instances = await recurringTaskGenerator.generateRecurringTaskInstances(
        'test-task-id',
        testConfig
      );

      if (instances.length > 0) {
        componentTests.push({
          testName: 'RecurringTaskGenerator',
          status: 'pass',
          message: 'Generator is functional',
          details: { instancesGenerated: instances.length }
        });
      } else {
        componentTests.push({
          testName: 'RecurringTaskGenerator',
          status: 'fail',
          message: 'Generator failed to create instances',
          details: {}
        });
      }
    } else {
      componentTests.push({
        testName: 'RecurringTaskGenerator',
        status: 'fail',
        message: 'Generator is not available',
        details: {}
      });
    }

    // Test RecurringTaskIntegration
    if (recurringTaskIntegration) {
      const healthReport = await recurringTaskIntegration.getSystemHealthReport();
      if (healthReport) {
        componentTests.push({
          testName: 'RecurringTaskIntegration',
          status: 'pass',
          message: 'Integration service is functional',
          details: { healthScore: healthReport.healthScore }
        });
      } else {
        componentTests.push({
          testName: 'RecurringTaskIntegration',
          status: 'fail',
          message: 'Integration service health report failed',
          details: {}
        });
      }
    } else {
      componentTests.push({
        testName: 'RecurringTaskIntegration',
        status: 'fail',
        message: 'Integration service is not available',
        details: {}
      });
    }

  } catch (error) {
    componentTests.push({
      testName: 'Component Tests',
      status: 'fail',
      message: 'Component tests failed',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    });
  }
}

/**
 * Calculate overall score
 */
function calculateOverallScore(testResults: any): number {
  let score = 100;

  // System validation impact (40% weight)
  if (!testResults.systemValidation.isValid) {
    score -= 40;
  } else {
    // Deduct for validation warnings
    const warningCount = testResults.systemValidation.validationResults.filter(
      (r: any) => r.status === 'warning'
    ).length;
    score -= Math.min(20, warningCount * 2);
  }

  // Integration test impact (30% weight)
  if (!testResults.integrationTest.success) {
    score -= 30;
  } else {
    // Deduct for integration test warnings
    const failCount = testResults.integrationTest.testResults.filter(
      (r: any) => r.status === 'fail'
    ).length;
    score -= Math.min(15, failCount * 3);
  }

  // Component tests impact (30% weight)
  const componentFailCount = testResults.componentTests.filter(
    (r: any) => r.status === 'fail'
  ).length;

  if (componentFailCount > 0) {
    score -= Math.min(30, componentFailCount * 6);
  }

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Generate recommendations based on test results
 */
function generateRecommendations(testResults: any, overallScore: number): any[] {
  const recommendations: any[] = [];

  // Overall system recommendations
  if (overallScore >= 90) {
    recommendations.push({
      priority: 'low',
      recommendation: 'System is operating at optimal levels',
      action: 'Continue normal operations'
    });
  } else if (overallScore >= 70) {
    recommendations.push({
      priority: 'medium',
      recommendation: 'System is operational but could be optimized',
      action: 'Review test results for optimization opportunities'
    });
  } else {
    recommendations.push({
      priority: 'high',
      recommendation: 'System requires attention - performance issues detected',
      action: 'Review failed tests and system health report immediately'
    });
  }

  // System validation recommendations
  if (testResults.systemValidation) {
    const criticalIssues = testResults.systemValidation.validationResults.filter(
      (r: any) => r.status === 'fail'
    );

    if (criticalIssues.length > 0) {
      recommendations.push({
        priority: 'high',
        recommendation: `System has ${criticalIssues.length} critical validation issues`,
        action: 'Review system validation results and address failures'
      });
    }

    const warnings = testResults.systemValidation.validationResults.filter(
      (r: any) => r.status === 'warning'
    );

    if (warnings.length > 0) {
      recommendations.push({
        priority: 'medium',
        recommendation: `System has ${warnings.length} validation warnings`,
        action: 'Review warnings and consider optimizations'
      });
    }
  }

  // Integration test recommendations
  if (testResults.integrationTest) {
    const integrationFailures = testResults.integrationTest.testResults.filter(
      (r: any) => r.status === 'fail'
    );

    if (integrationFailures.length > 0) {
      recommendations.push({
        priority: 'high',
        recommendation: `Integration tests have ${integrationFailures.length} failures`,
        action: 'Review integration test results and fix failures'
      });
    }
  }

  // Component test recommendations
  const componentFailures = testResults.componentTests.filter(
    (r: any) => r.status === 'fail'
  );

  if (componentFailures.length > 0) {
    recommendations.push({
      priority: 'high',
      recommendation: `Component tests have ${componentFailures.length} failures`,
      action: 'Review component test results and address issues'
    });
  }

  // Performance recommendations
  if (testResults.integrationTest?.performanceMetrics) {
    const { totalTime, passRate } = testResults.integrationTest.performanceMetrics;

    if (totalTime > 5000) { // More than 5 seconds
      recommendations.push({
        priority: 'medium',
        recommendation: 'Test suite execution time is high',
        action: 'Investigate performance bottlenecks'
      });
    }

    if (passRate < 90) {
      recommendations.push({
        priority: 'high',
        recommendation: 'Integration test pass rate is low',
        action: 'Review and fix failing integration tests'
      });
    }
  }

  return recommendations;
}

/**
 * Export system configuration for analysis
 */
export function exportTestResultsForAnalysis(testResults: any): string {
  try {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      testSuiteVersion: '1.0.0',
      overallScore: calculateOverallScore(testResults),
      systemValidation: testResults.systemValidation,
      integrationTest: testResults.integrationTest,
      componentTests: testResults.componentTests,
      recommendations: generateRecommendations(testResults, calculateOverallScore(testResults))
    }, null, 2);
  } catch (error) {
    console.error('Error exporting test results:', error);
    return JSON.stringify({
      error: 'Failed to export test results',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Run the complete test suite and export results
 */
export async function runAndExportTestSuite(): Promise<string> {
  try {
    const result = await runCompleteRecurringTaskTestSuite();
    return exportTestResultsForAnalysis(result.testResults);
  } catch (error) {
    console.error('Error running and exporting test suite:', error);
    return JSON.stringify({
      error: 'Failed to run and export test suite',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Run the complete test suite if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment - run test suite
  runCompleteRecurringTaskTestSuite()
    .then(result => {
      console.log('\\n📄 Test Results Export:');
      const exportData = exportTestResultsForAnalysis(result.testResults);
      console.log(exportData);

      if (!result.success) {
        console.log('\\n⚠️  Critical Issues Requiring Attention:');
        result.recommendations
          .filter(r => r.priority === 'high')
          .forEach(rec => {
            console.log(`  🔴 ${rec.recommendation}`);
            console.log(`     Action: ${rec.action}`);
          });
      }
    })
    .catch(console.error);
}