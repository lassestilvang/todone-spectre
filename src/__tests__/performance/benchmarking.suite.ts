import { test, expect } from "@playwright/test";
import { TEST_USER, login } from "../e2e/utils/auth";
import {
  generatePerformanceTestData,
} from "./utils/testDataGenerators";

test.describe("Comprehensive Performance Benchmarking Suite", () => {
  test("Complete performance benchmarking across all critical paths", async ({
    page,
  }) => {
    await login(page, TEST_USER);

    // Run comprehensive benchmarking
    await test.step("Run comprehensive performance benchmarking", async () => {
      const benchmarkResults = {
        coreWorkflows: {},
        animationPerformance: {},
        apiPerformance: {},
        memoryUsage: {},
        bundleAnalysis: {},
        overallScore: 0,
        startedAt: new Date().toISOString(),
      };

      // 1. Core Workflows Benchmarking
      await runCoreWorkflowsBenchmark(page, benchmarkResults.coreWorkflows);

      // 2. Animation Performance Benchmarking
      await runAnimationPerformanceBenchmark(
        page,
        benchmarkResults.animationPerformance,
      );

      // 3. API Performance Benchmarking
      await runApiPerformanceBenchmark(page, benchmarkResults.apiPerformance);

      // 4. Memory Usage Benchmarking
      await runMemoryUsageBenchmark(page, benchmarkResults.memoryUsage);

      // 5. Bundle Analysis Benchmarking
      await runBundleAnalysisBenchmark(page, benchmarkResults.bundleAnalysis);

      // Calculate overall performance score
      benchmarkResults.overallScore =
        calculateOverallPerformanceScore(benchmarkResults);
      benchmarkResults.completedAt = new Date().toISOString();

      console.log("Comprehensive benchmarking results:", benchmarkResults);

      // Verify overall performance meets minimum requirements
      expect(benchmarkResults.overallScore).toBeGreaterThan(70); // Should score above 70 overall

      // Save benchmarking results (in a real implementation)
      console.log(
        "Benchmarking completed. Overall score:",
        benchmarkResults.overallScore,
      );
    });
  });

  test("Performance regression testing", async ({ page }) => {
    await login(page, TEST_USER);

    // Test for performance regressions compared to baseline
    await test.step("Test for performance regressions", async () => {
      // Load baseline performance data (would be loaded from file in real implementation)
      const baselinePerformance = getBaselinePerformanceData();

      // Run current performance tests
      const currentPerformance = await runRegressionTests(page);

      // Compare current vs baseline
      const regressionResults = comparePerformance(
        baselinePerformance,
        currentPerformance,
      );

      console.log("Performance regression analysis:", regressionResults);

      // Check for significant regressions
      const significantRegressions = regressionResults.filter(
        (result) =>
          result.regressionPercentage > 20 &&
          result.currentValue > getAcceptableThreshold(result.testName),
      );

      if (significantRegressions.length > 0) {
        console.warn(
          "Significant performance regressions detected:",
          significantRegressions,
        );
        expect(significantRegressions.length).toBe(0); // Should have no significant regressions
      } else {
        console.log("No significant performance regressions detected");
      }
    });
  });

  test("Performance benchmarking with dataset scaling", async ({ page }) => {
    await login(page, TEST_USER);

    // Test performance scaling with different dataset sizes
    await test.step("Test performance scaling with dataset sizes", async () => {
      const datasetSizes = ["small", "medium", "large"];
      const scalingResults = [];

      for (const size of datasetSizes) {
        console.log(`Testing with ${size} dataset`);

        // Generate dataset
        const dataset = generatePerformanceTestData(size);

        // Run performance tests with this dataset
        const performanceResult = await runScalingTests(page, dataset);

        scalingResults.push({
          datasetSize: size,
          itemCount: dataset.totalItems,
          ...performanceResult,
        });

        console.log(`${size} dataset results:`, performanceResult);

        // Clean up
        await page.click('button:has-text("Delete All Tasks")');
        await page.click('button:has-text("Confirm")');
        await page.click('button:has-text("Delete All Projects")');
        await page.click('button:has-text("Confirm")');
      }

      // Analyze scaling performance
      const scalingAnalysis = analyzePerformanceScaling(scalingResults);
      console.log("Performance scaling analysis:", scalingAnalysis);

      // Verify performance scales reasonably
      expect(scalingAnalysis.linearScaling).toBe(true); // Should scale linearly
      expect(scalingAnalysis.memoryEfficiency).toBeGreaterThan(0.7); // Should be memory efficient
    });
  });
});

// Helper functions for benchmarking

async function runCoreWorkflowsBenchmark(page, results) {
  console.log("Running core workflows benchmarking...");

  // Task creation benchmark
  const taskCreationStart = performance.now();
  for (let i = 0; i < 10; i++) {
    await page.click('button:has-text("Create Task")');
    await page.fill('input[name="title"]', `Benchmark Task ${i}`);
    await page.fill(
      'textarea[name="description"]',
      `Benchmark description ${i}`,
    );
    await page.selectOption('select[name="priority"]', "medium");
    await page.click('button[type="submit"]:has-text("Create")');
  }
  const taskCreationEnd = performance.now();

  // Project loading benchmark
  const projectStart = performance.now();
  await page.click('button:has-text("Projects")');
  await page.waitForSelector("text=Projects");
  const projectEnd = performance.now();

  // Search benchmark
  await page.fill('input[placeholder="Search tasks"]', "benchmark");
  await page.waitForSelector("div.task-item");
  const searchEnd = performance.now();

  results.taskCreation = {
    operations: 10,
    totalTime: taskCreationEnd - taskCreationStart,
    avgTimePerOperation: (taskCreationEnd - taskCreationStart) / 10,
  };

  results.projectLoading = {
    time: projectEnd - projectStart,
  };

  results.searchPerformance = {
    time: searchEnd - projectEnd,
  };

  console.log("Core workflows benchmarking completed:", results);
}

async function runAnimationPerformanceBenchmark(page, results) {
  console.log("Running animation performance benchmarking...");

  // Create test tasks
  for (let i = 0; i < 5; i++) {
    await page.click('button:has-text("Create Task")');
    await page.fill('input[name="title"]', `Animation Benchmark ${i}`);
    await page.fill('textarea[name="description"]', `Animation test ${i}`);
    await page.click('button[type="submit"]:has-text("Create")');
  }

  // Micro-interaction benchmark
  const microInteractionStart = performance.now();
  await page.click('button:has-text("Complete"):first');
  await page.waitForTimeout(500);
  const microInteractionEnd = performance.now();

  // View transition benchmark
  const viewTransitionStart = performance.now();
  await page.click('button:has-text("Board View")');
  await page.waitForSelector('div[aria-label="Board view loaded"]');
  const viewTransitionEnd = performance.now();

  results.microInteractions = {
    time: microInteractionEnd - microInteractionStart,
  };

  results.viewTransitions = {
    time: viewTransitionEnd - viewTransitionStart,
  };

  console.log("Animation performance benchmarking completed:", results);
}

async function runApiPerformanceBenchmark(page, results) {
  console.log("Running API performance benchmarking...");

  // Task creation API benchmark
  const apiStart = performance.now();
  await page.click('button:has-text("Create Task")');
  await page.fill('input[name="title"]', "API Benchmark Task");
  await page.fill('textarea[name="description"]', "API benchmark description");
  await page.click('button[type="submit"]:has-text("Create")');
  await page.waitForResponse("**/api/tasks");
  const apiEnd = performance.now();

  // Bulk operations benchmark
  const bulkStart = performance.now();
  for (let i = 0; i < 3; i++) {
    await page.click('button:has-text("Create Task")');
    await page.fill('input[name="title"]', `Bulk API Task ${i}`);
    await page.fill(
      'textarea[name="description"]',
      `Bulk API description ${i}`,
    );
    await page.click('button[type="submit"]:has-text("Create")');
  }
  await page.waitForResponse("**/api/tasks");
  const bulkEnd = performance.now();

  results.singleApiCall = {
    time: apiEnd - apiStart,
  };

  results.bulkOperations = {
    operations: 3,
    totalTime: bulkEnd - bulkStart,
    avgTimePerOperation: (bulkEnd - bulkStart) / 3,
  };

  console.log("API performance benchmarking completed:", results);
}

async function runMemoryUsageBenchmark(page, results) {
  console.log("Running memory usage benchmarking...");

  // Get initial memory
  const initialMemory = await page.evaluate(() => ({
    usedJSHeapSize: window.performance?.memory?.usedJSHeapSize || 0,
  }));

  // Create memory-intensive operations
  for (let i = 0; i < 20; i++) {
    await page.click('button:has-text("Create Task")');
    await page.fill('input[name="title"]', `Memory Benchmark Task ${i}`);
    await page.fill(
      'textarea[name="description"]',
      `Memory benchmark description with lots of content ${i}`.repeat(5),
    );
    await page.click('button[type="submit"]:has-text("Create")');
  }

  // Get memory after operations
  const finalMemory = await page.evaluate(() => ({
    usedJSHeapSize: window.performance?.memory?.usedJSHeapSize || 0,
  }));

  results.initialMemory = initialMemory.usedJSHeapSize;
  results.finalMemory = finalMemory.usedJSHeapSize;
  results.memoryIncrease =
    finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
  results.memoryIncreaseMB = results.memoryIncrease / (1024 * 1024);

  console.log("Memory usage benchmarking completed:", results);
}

async function runBundleAnalysisBenchmark(page, results) {
  console.log("Running bundle analysis benchmarking...");

  // Test component loading times
  const componentStart = performance.now();
  await page.click('button:has-text("Board View")');
  await page.waitForSelector('div[aria-label="Board view loaded"]');
  const componentEnd = performance.now();

  // Test lazy loading
  const lazyStart = performance.now();
  await page.click('button:has-text("Load AI Features")');
  await page.waitForSelector("div.ai-features-component");
  const lazyEnd = performance.now();

  results.componentLoading = {
    time: componentEnd - componentStart,
  };

  results.lazyLoading = {
    time: lazyEnd - lazyStart,
  };

  console.log("Bundle analysis benchmarking completed:", results);
}

function calculateOverallPerformanceScore(benchmarkResults) {
  // Calculate weighted score based on different performance areas
  const weights = {
    coreWorkflows: 0.3,
    animationPerformance: 0.2,
    apiPerformance: 0.25,
    memoryUsage: 0.15,
    bundleAnalysis: 0.1,
  };

  // Normalize and score each area (simplified scoring)
  const coreWorkflowScore = calculateCoreWorkflowScore(
    benchmarkResults.coreWorkflows,
  );
  const animationScore = calculateAnimationScore(
    benchmarkResults.animationPerformance,
  );
  const apiScore = calculateApiScore(benchmarkResults.apiPerformance);
  const memoryScore = calculateMemoryScore(benchmarkResults.memoryUsage);
  const bundleScore = calculateBundleScore(benchmarkResults.bundleAnalysis);

  // Calculate weighted average
  const overallScore =
    coreWorkflowScore * weights.coreWorkflows +
    animationScore * weights.animationPerformance +
    apiScore * weights.apiPerformance +
    memoryScore * weights.memoryUsage +
    bundleScore * weights.bundleAnalysis;

  return Math.round(overallScore);
}

function calculateCoreWorkflowScore(results) {
  // Score based on task creation speed and project loading
  const taskCreationScore = Math.min(
    100,
    100 - results.taskCreation?.avgTimePerOperation / 200,
  );
  const projectLoadingScore = Math.min(
    100,
    100 - results.projectLoading?.time / 2000,
  );
  const searchScore = Math.min(
    100,
    100 - results.searchPerformance?.time / 1500,
  );

  return (
    taskCreationScore * 0.5 + projectLoadingScore * 0.3 + searchScore * 0.2
  );
}

function calculateAnimationScore(results) {
  // Score based on animation performance
  const microInteractionScore = Math.min(
    100,
    100 - results.microInteractions?.time / 800,
  );
  const viewTransitionScore = Math.min(
    100,
    100 - results.viewTransitions?.time / 1500,
  );

  return microInteractionScore * 0.6 + viewTransitionScore * 0.4;
}

function calculateApiScore(results) {
  // Score based on API performance
  const singleApiScore = Math.min(
    100,
    100 - results.singleApiCall?.time / 1500,
  );
  const bulkApiScore = Math.min(
    100,
    100 - results.bulkOperations?.avgTimePerOperation / 800,
  );

  return singleApiScore * 0.4 + bulkApiScore * 0.6;
}

function calculateMemoryScore(results) {
  // Score based on memory efficiency
  const memoryEfficiencyScore = Math.min(
    100,
    100 - results.memoryIncreaseMB / 50,
  );

  return memoryEfficiencyScore;
}

function calculateBundleScore(results) {
  // Score based on bundle performance
  const componentScore = Math.min(
    100,
    100 - results.componentLoading?.time / 3000,
  );
  const lazyScore = Math.min(100, 100 - results.lazyLoading?.time / 2000);

  return componentScore * 0.7 + lazyScore * 0.3;
}

async function runRegressionTests(page) {
  // Run a subset of performance tests for regression detection
  const regressionResults = {};

  // Core workflow regression test
  const taskStart = performance.now();
  await page.click('button:has-text("Create Task")');
  await page.fill('input[name="title"]', "Regression Test Task");
  await page.fill(
    'textarea[name="description"]',
    "Regression test description",
  );
  await page.click('button[type="submit"]:has-text("Create")');
  const taskEnd = performance.now();

  regressionResults.taskCreationTime = taskEnd - taskStart;

  // Animation regression test
  const animStart = performance.now();
  await page.click('button:has-text("Complete"):first');
  await page.waitForTimeout(500);
  const animEnd = performance.now();

  regressionResults.animationTime = animEnd - animStart;

  // Memory regression test
  const initialMemory = await page.evaluate(() => ({
    usedJSHeapSize: window.performance?.memory?.usedJSHeapSize || 0,
  }));

  // Create some tasks
  for (let i = 0; i < 5; i++) {
    await page.click('button:has-text("Create Task")');
    await page.fill('input[name="title"]', `Regression Task ${i}`);
    await page.fill(
      'textarea[name="description"]',
      `Regression description ${i}`,
    );
    await page.click('button[type="submit"]:has-text("Create")');
  }

  const finalMemory = await page.evaluate(() => ({
    usedJSHeapSize: window.performance?.memory?.usedJSHeapSize || 0,
  }));

  regressionResults.memoryIncrease =
    finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;

  return regressionResults;
}

function getBaselinePerformanceData() {
  // This would be loaded from a baseline file in a real implementation
  return {
    taskCreationTime: 800,
    animationTime: 600,
    memoryIncrease: 20 * 1024 * 1024, // 20MB
  };
}

function comparePerformance(baseline, current) {
  return Object.keys(baseline).map((key) => {
    const baselineValue = baseline[key];
    const currentValue = current[key];

    const difference = currentValue - baselineValue;
    const regressionPercentage = (difference / baselineValue) * 100;

    return {
      testName: key,
      baselineValue,
      currentValue,
      difference,
      regressionPercentage,
      isRegression: regressionPercentage > 0,
    };
  });
}

function getAcceptableThreshold(testName) {
  const thresholds = {
    taskCreationTime: 1500,
    animationTime: 1200,
    memoryIncrease: 50 * 1024 * 1024, // 50MB
  };

  return thresholds[testName] || Infinity;
}

async function runScalingTests(page, dataset) {
  // Run performance tests with the given dataset
  const scalingResults = {
    taskCreationTime: 0,
    memoryUsage: 0,
    searchPerformance: 0,
  };

  // Test task creation with dataset
  const creationStart = performance.now();

  // Create tasks from dataset
  for (let i = 0; i < Math.min(10, dataset.tasks.length); i++) {
    const task = dataset.tasks[i];
    await page.click('button:has-text("Create Task")');
    await page.fill('input[name="title"]', task.title);
    await page.fill('textarea[name="description"]', task.description);
    await page.click('button[type="submit"]:has-text("Create")');
  }

  const creationEnd = performance.now();
  scalingResults.taskCreationTime = creationEnd - creationStart;

  // Test memory usage
  const initialMemory = await page.evaluate(() => ({
    usedJSHeapSize: window.performance?.memory?.usedJSHeapSize || 0,
  }));

  // Create more tasks to test memory
  for (let i = 0; i < Math.min(5, dataset.tasks.length - 10); i++) {
    const task = dataset.tasks[i + 10];
    await page.click('button:has-text("Create Task")');
    await page.fill('input[name="title"]', task.title);
    await page.fill('textarea[name="description"]', task.description);
    await page.click('button[type="submit"]:has-text("Create")');
  }

  const finalMemory = await page.evaluate(() => ({
    usedJSHeapSize: window.performance?.memory?.usedJSHeapSize || 0,
  }));

  scalingResults.memoryUsage =
    finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;

  // Test search performance
  const searchStart = performance.now();
  await page.fill('input[placeholder="Search tasks"]', "test");
  await page.waitForSelector("div.task-item");
  const searchEnd = performance.now();

  scalingResults.searchPerformance = searchEnd - searchStart;

  return scalingResults;
}

function analyzePerformanceScaling(scalingResults) {
  // Analyze how performance scales with dataset size
  const timePerItem = scalingResults.map(
    (result) => result.taskCreationTime / result.itemCount,
  );

  const memoryPerItem = scalingResults.map(
    (result) => result.memoryUsage / result.itemCount,
  );

  // Check if scaling is linear
  const avgTimePerItem =
    timePerItem.reduce((sum, time) => sum + time, 0) / timePerItem.length;
  const avgMemoryPerItem =
    memoryPerItem.reduce((sum, mem) => sum + mem, 0) / memoryPerItem.length;

  // Calculate scaling factors
  const timeScalingFactors = timePerItem.map((time) => time / avgTimePerItem);
  const memoryScalingFactors = memoryPerItem.map(
    (mem) => mem / avgMemoryPerItem,
  );

  // Check if scaling is approximately linear (within 50% variance)
  const timeVariance = timeScalingFactors.reduce(
    (max, factor) => Math.max(max, Math.abs(factor - 1)),
    0,
  );

  const memoryVariance = memoryScalingFactors.reduce(
    (max, factor) => Math.max(max, Math.abs(factor - 1)),
    0,
  );

  return {
    linearScaling: timeVariance < 0.5 && memoryVariance < 0.5,
    avgTimePerItem,
    avgMemoryPerItem,
    memoryEfficiency: 1 / (avgMemoryPerItem / (1024 * 1024)), // Items per MB
    timeVariance,
    memoryVariance,
  };
}
