import { axe, setupAccessibilityTests, cleanupAccessibilityTests } from './accessibilitySetup';
import { render } from '@testing-library/react';
import React from 'react';

/**
 * Comprehensive Accessibility Test Runner
 * This utility runs automated accessibility tests across the entire application
 * to validate WCAG 2.1 AA compliance.
 */

interface AccessibilityTestOptions {
  componentName?: string;
  testName?: string;
  rules?: Record<string, { enabled: boolean }>;
  includeWCAG21AA?: boolean;
  includeBestPractices?: boolean;
  includeExperimental?: boolean;
}

interface AccessibilityTestResult {
  component: string;
  testName: string;
  violations: any[];
  passed: boolean;
  timestamp: string;
  duration: number;
}

class AccessibilityTestRunner {
  private results: AccessibilityTestResult[] = [];
  private startTime: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Run accessibility test on a component
   */
  async runComponentTest(
    component: React.ReactElement,
    options: AccessibilityTestOptions = {}
  ): Promise<AccessibilityTestResult> {
    const {
      componentName = 'Unnamed Component',
      testName = 'Accessibility Test',
      rules = {},
      includeWCAG21AA = true,
      includeBestPractices = false,
      includeExperimental = false
    } = options;

    // Setup accessibility testing environment
    setupAccessibilityTests();

    const componentStart = Date.now();

    try {
      // Render the component
      const { container } = render(component);

      // Configure axe rules
      const axeRules = this.getAxeRules(includeWCAG21AA, includeBestPractices, includeExperimental);

      // Run axe-core analysis
      const results = await axe(container, {
        rules: { ...axeRules, ...rules }
      });

      const componentEnd = Date.now();
      const duration = componentEnd - componentStart;

      const testResult: AccessibilityTestResult = {
        component: componentName,
        testName,
        violations: results.violations || [],
        passed: results.violations.length === 0,
        timestamp: new Date().toISOString(),
        duration
      };

      this.results.push(testResult);
      return testResult;

    } catch (error) {
      const componentEnd = Date.now();
      const duration = componentEnd - componentStart;

      const testResult: AccessibilityTestResult = {
        component: componentName,
        testName,
        violations: [{
          id: 'test-error',
          description: `Test failed to execute: ${error instanceof Error ? error.message : 'Unknown error'}`,
          help: 'Check test implementation and component rendering',
          nodes: []
        }],
        passed: false,
        timestamp: new Date().toISOString(),
        duration
      };

      this.results.push(testResult);
      return testResult;
    } finally {
      cleanupAccessibilityTests();
    }
  }

  /**
   * Get default axe rules configuration
   */
  private getAxeRules(
    includeWCAG21AA: boolean,
    includeBestPractices: boolean,
    includeExperimental: boolean
  ): Record<string, { enabled: boolean }> {
    const rules: Record<string, { enabled: boolean }> = {};

    // WCAG 2.1 AA rules (required)
    if (includeWCAG21AA) {
      rules['color-contrast'] = { enabled: true };
      rules['aria-required-attr'] = { enabled: true };
      rules['aria-valid-attr'] = { enabled: true };
      rules['button-name'] = { enabled: true };
      rules['bypass'] = { enabled: true };
      rules['html-has-lang'] = { enabled: true };
      rules['image-alt'] = { enabled: true };
      rules['label'] = { enabled: true };
      rules['link-name'] = { enabled: true };
      rules['page-has-heading-one'] = { enabled: true };
      rules['region'] = { enabled: true };
      rules['skip-link'] = { enabled: true };
      rules['table-fake-caption'] = { enabled: true };
      rules['td-has-header'] = { enabled: true };
      rules['th-has-data-cells'] = { enabled: true };
      rules['valid-lang'] = { enabled: true };
      rules['video-caption'] = { enabled: true };
      rules['frame-title'] = { enabled: true };
      rules['heading-order'] = { enabled: true };
      rules['html-lang-valid'] = { enabled: true };
      rules['landmark-one-main'] = { enabled: true };
      rules['landmark-unique'] = { enabled: true };
      rules['list'] = { enabled: true };
      rules['listitem'] = { enabled: true };
      rules['meta-viewport'] = { enabled: true };
      rules['object-alt'] = { enabled: true };
      rules['role-img-alt'] = { enabled: true };
      rules['scope-attr-valid'] = { enabled: true };
      rules['server-side-image-map'] = { enabled: true };
      rules['svg-img-alt'] = { enabled: true };
    }

    // Best practices (optional)
    if (includeBestPractices) {
      rules['aria-allowed-attr'] = { enabled: true };
      rules['aria-deprecated-role'] = { enabled: true };
      rules['aria-hidden-body'] = { enabled: true };
      rules['aria-hidden-focus'] = { enabled: true };
      rules['aria-input-field-name'] = { enabled: true };
      rules['aria-meter-name'] = { enabled: true };
      rules['aria-progressbar-name'] = { enabled: true };
      rules['aria-required-children'] = { enabled: true };
      rules['aria-required-parent'] = { enabled: true };
      rules['aria-roledescription'] = { enabled: true };
      rules['aria-roles'] = { enabled: true };
      rules['aria-text'] = { enabled: true };
      rules['aria-toggle-field-name'] = { enabled: true };
      rules['aria-tooltip-name'] = { enabled: true };
      rules['aria-valid-attr-value'] = { enabled: true };
      rules['audio-caption'] = { enabled: true };
      rules['blink'] = { enabled: true };
      rules['definition-list'] = { enabled: true };
      rules['dlitem'] = { enabled: true };
      rules['document-title'] = { enabled: true };
      rules['duplicate-id'] = { enabled: true };
      rules['duplicate-id-active'] = { enabled: true };
      rules['duplicate-id-aria'] = { enabled: true };
      rules['form-field-multiple-labels'] = { enabled: true };
      rules['frame-focusable-content'] = { enabled: true };
      rules['frame-title-unique'] = { enabled: true };
      rules['heading-order'] = { enabled: true };
      rules['hidden-content'] = { enabled: true };
      rules['html-xml-lang-mismatch'] = { enabled: true };
      rules['identical-links-same-purpose'] = { enabled: true };
      rules['input-button-name'] = { enabled: true };
      rules['label-content-name-mismatch'] = { enabled: true };
      rules['label-title-only'] = { enabled: true };
      rules['layout-table'] = { enabled: true };
      rules['link-in-text-block'] = { enabled: true };
      rules['marquee'] = { enabled: true };
      rules['meta-refresh'] = { enabled: true };
      rules['meta-viewport-large'] = { enabled: true };
      rules['nested-interactive'] = { enabled: true };
      rules['no-autoplay-audio'] = { enabled: true };
      rules['object-alt'] = { enabled: true };
      rules['p-as-heading'] = { enabled: true };
      rules['presentational-children'] = { enabled: true };
      rules['role-img-alt'] = { enabled: true };
      rules['scope-attr'] = { enabled: true };
      rules['scrollable-region-focusable'] = { enabled: true };
      rules['select-name'] = { enabled: true };
      rules['select-name'] = { enabled: true };
      rules['server-side-image-map'] = { enabled: true };
      rules['svg-img-alt'] = { enabled: true };
      rules['table-duplicate-name'] = { enabled: true };
      rules['table-fake-caption'] = { enabled: true };
      rules['td-has-header'] = { enabled: true };
      rules['td-headers-attr'] = { enabled: true };
      rules['th-has-data-cells'] = { enabled: true };
      rules['valid-lang'] = { enabled: true };
      rules['video-caption'] = { enabled: true };
    }

    return rules;
  }

  /**
   * Generate comprehensive accessibility report
   */
  generateReport(): AccessibilityTestReport {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;

    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = this.results.filter(r => !r.passed).length;
    const totalTests = this.results.length;

    const complianceScore = totalTests > 0
      ? Math.round((passedTests / totalTests) * 100)
      : 0;

    return {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        complianceScore,
        timestamp: new Date().toISOString(),
        totalDuration
      },
      results: this.results,
      wcagCompliance: this.calculateWCAGCompliance()
    };
  }

  /**
   * Calculate WCAG 2.1 AA compliance level
   */
  private calculateWCAGCompliance(): WCAGComplianceLevel {
    const failedTests = this.results.filter(r => !r.passed);

    if (failedTests.length === 0) {
      return {
        level: 'AAA',
        description: 'Full WCAG 2.1 AAA compliance achieved',
        score: 100
      };
    }

    const criticalFailures = failedTests.filter(test =>
      test.violations.some(v =>
        ['color-contrast', 'aria-required-attr', 'button-name', 'label', 'link-name'].includes(v.id)
      )
    );

    if (criticalFailures.length === 0) {
      return {
        level: 'AA',
        description: 'WCAG 2.1 AA compliance achieved',
        score: 90
      };
    }

    if (criticalFailures.length <= 2) {
      return {
        level: 'A',
        description: 'WCAG 2.1 A compliance achieved',
        score: 75
      };
    }

    return {
      level: 'Partial',
      description: 'Partial WCAG compliance - critical issues need attention',
      score: 50
    };
  }

  /**
   * Reset test results
   */
  reset(): void {
    this.results = [];
    this.startTime = Date.now();
  }
}

interface AccessibilityTestReport {
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    complianceScore: number;
    timestamp: string;
    totalDuration: number;
  };
  results: AccessibilityTestResult[];
  wcagCompliance: WCAGComplianceLevel;
}

interface WCAGComplianceLevel {
  level: 'AAA' | 'AA' | 'A' | 'Partial';
  description: string;
  score: number;
}

/**
 * Run comprehensive accessibility audit
 */
export async function runComprehensiveAccessibilityAudit(
  components: Array<{ component: React.ReactElement; name: string }>,
  options: AccessibilityTestOptions = {}
): Promise<AccessibilityTestReport> {
  const runner = new AccessibilityTestRunner();

  console.log('🚀 Starting comprehensive accessibility audit...');
  console.log(`📊 Testing ${components.length} components for WCAG 2.1 AA compliance`);

  for (const { component, name } of components) {
    console.log(`🧪 Testing ${name}...`);
    const result = await runner.runComponentTest(component, {
      componentName: name,
      testName: `WCAG 2.1 AA Compliance Test - ${name}`,
      ...options
    });

    if (result.passed) {
      console.log(`✅ ${name}: PASSED (${result.duration}ms)`);
    } else {
      console.log(`❌ ${name}: FAILED (${result.violations.length} violations)`);
      result.violations.forEach(violation => {
        console.log(`  - ${violation.id}: ${violation.description}`);
      });
    }
  }

  const report = runner.generateReport();
  console.log('📋 Accessibility Audit Complete!');
  console.log(`📊 Results: ${report.summary.passedTests}/${report.summary.totalTests} tests passed`);
  console.log(`🎯 Compliance: ${report.wcagCompliance.level} (${report.wcagCompliance.score}/100)`);

  return report;
}

/**
 * Quick accessibility check for a single component
 */
export async function quickAccessibilityCheck(
  component: React.ReactElement,
  componentName: string
): Promise<AccessibilityTestResult> {
  const runner = new AccessibilityTestRunner();
  return runner.runComponentTest(component, {
    componentName,
    testName: `Quick Accessibility Check - ${componentName}`,
    includeWCAG21AA: true
  });
}

/**
 * Export test runner for use in test suites
 */
export { AccessibilityTestRunner };
export type { AccessibilityTestResult, AccessibilityTestReport, WCAGComplianceLevel };