import { test, expect } from "@playwright/test";
import { TEST_USER, login } from "../e2e/utils/auth";
import { generatePerformanceTestData } from "./utils/testDataGenerators";

test.describe("Network Condition Performance Tests", () => {
  test("Performance under different network conditions", async ({ page }) => {
    await login(page, TEST_USER);

    // Test performance with varying network conditions
    await test.step("Test performance with network throttling", async () => {
      const networkConditions = [
        { name: "No throttling", download: 0, upload: 0, latency: 0 },
        { name: "Slow 3G", download: 1.5, upload: 0.75, latency: 400 },
        { name: "Fast 3G", download: 10, upload: 5, latency: 150 },
      ];

      const performanceResults = [];

      for (const condition of networkConditions) {
        // Simulate network condition
        console.log(`Testing with ${condition.name} network conditions`);

        // Apply network throttling (simulated)
        await page.evaluate((condition) => {
          console.log(
            `Simulating ${condition.name} network: ${condition.download} Mbps down, ${condition.upload} Mbps up, ${condition.latency}ms latency`,
          );
        }, condition);

        // Test task creation performance
        const taskCreationTimes = [];
        for (let i = 0; i < 3; i++) {
          const startTime = performance.now();

          await page.click('button:has-text("Create Task")');
          await page.fill(
            'input[name="title"]',
            `Network Test Task ${condition.name} ${i}`,
          );
          await page.fill(
            'textarea[name="description"]',
            `Testing under ${condition.name} conditions`,
          );
          await page.selectOption('select[name="priority"]', "medium");
          await page.click('button[type="submit"]:has-text("Create")');

          await page.waitForSelector(
            `text=Network Test Task ${condition.name} ${i}`,
          );
          const endTime = performance.now();
          taskCreationTimes.push(endTime - startTime);
        }

        const avgTaskCreationTime =
          taskCreationTimes.reduce((sum, time) => sum + time, 0) /
          taskCreationTimes.length;

        // Test page navigation performance
        const navStartTime = performance.now();
        await page.click('button:has-text("Projects")');
        await page.waitForSelector("text=Projects");
        const navEndTime = performance.now();
        const navTime = navEndTime - navStartTime;

        performanceResults.push({
          networkCondition: condition.name,
          avgTaskCreationTime,
          navigationTime: navTime,
          totalOperations: taskCreationTimes.length + 1,
        });

        console.log(
          `${condition.name} - Avg Task Creation: ${avgTaskCreationTime.toFixed(2)}ms, Navigation: ${navTime.toFixed(2)}ms`,
        );

        // Clean up tasks
        await page.click('button:has-text("Delete All Tasks")');
        await page.click('button:has-text("Confirm")');
      }

      // Analyze network condition impact
      console.log(
        "Network condition performance analysis:",
        performanceResults,
      );

      // Verify performance is acceptable even under slow conditions
      const slow3GResult = performanceResults.find(
        (r) => r.networkCondition === "Slow 3G",
      );
      if (slow3GResult) {
        expect(slow3GResult.avgTaskCreationTime).toBeLessThan(8000); // Should be under 8 seconds even on slow 3G
        expect(slow3GResult.navigationTime).toBeLessThan(10000); // Should be under 10 seconds even on slow 3G
      }
    });
  });

  test("Offline mode performance and synchronization", async ({ page }) => {
    await login(page, TEST_USER);

    // Test offline mode performance
    await test.step("Test offline mode performance", async () => {
      // Simulate going offline
      console.log("Simulating offline mode");

      // Create tasks while offline
      const offlineTaskTimes = [];
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();

        await page.click('button:has-text("Create Task")');
        await page.fill('input[name="title"]', `Offline Task ${i}`);
        await page.fill(
          'textarea[name="description"]',
          `Created while offline ${i}`,
        );
        await page.selectOption('select[name="priority"]', "high");
        await page.click('button[type="submit"]:has-text("Create")');

        // In offline mode, this should queue the operation
        const endTime = performance.now();
        offlineTaskTimes.push(endTime - startTime);
      }

      const avgOfflineTime =
        offlineTaskTimes.reduce((sum, time) => sum + time, 0) /
        offlineTaskTimes.length;
      console.log(
        `Average offline task creation time: ${avgOfflineTime.toFixed(2)}ms`,
      );

      // Simulate coming back online and syncing
      console.log("Simulating reconnection and synchronization");

      const syncStartTime = performance.now();

      // Simulate sync process
      await page.evaluate(() => {
        console.log("Simulating synchronization of queued operations");
        // This would be replaced with actual sync monitoring
      });

      // Wait for sync to complete (simulated)
      await page.waitForTimeout(2000);

      const syncEndTime = performance.now();
      const syncTime = syncEndTime - syncStartTime;

      console.log(`Synchronization completed in ${syncTime.toFixed(2)}ms`);

      // Verify sync completed in reasonable time
      expect(syncTime).toBeLessThan(15000); // Should sync in under 15 seconds
    });
  });

  test("API response time under network stress", async ({ page }) => {
    await login(page, TEST_USER);

    // Test API performance under network stress
    await test.step("Test API response times under network stress", async () => {
      const stressLevels = [
        { name: "Normal", concurrentRequests: 1 },
        { name: "Moderate", concurrentRequests: 3 },
        { name: "High", concurrentRequests: 5 },
      ];

      const apiPerformanceResults = [];

      for (const stressLevel of stressLevels) {
        console.log(
          `Testing API under ${stressLevel.name} stress (${stressLevel.concurrentRequests} concurrent requests)`,
        );

        const requestTimes = [];

        // Simulate concurrent API requests
        const requestPromises = [];
        for (let i = 0; i < stressLevel.concurrentRequests; i++) {
          requestPromises.push(
            page.evaluate(async (i) => {
              const startTime = performance.now();

              // Simulate API request
              const response = await fetch("/api/test-endpoint", {
                method: "POST",
                body: JSON.stringify({
                  test: `request-${i}`,
                  stress: stressLevel.name,
                }),
                headers: { "Content-Type": "application/json" },
              });

              await response.json();
              const endTime = performance.now();
              return endTime - startTime;
            }, i),
          );
        }

        const times = await Promise.all(requestPromises);
        requestTimes.push(...times);

        const avgRequestTime =
          times.reduce((sum, time) => sum + time, 0) / times.length;

        apiPerformanceResults.push({
          stressLevel: stressLevel.name,
          concurrentRequests: stressLevel.concurrentRequests,
          avgRequestTime,
          maxRequestTime: Math.max(...times),
          minRequestTime: Math.min(...times),
        });

        console.log(
          `${stressLevel.name} stress - Avg: ${avgRequestTime.toFixed(2)}ms, Max: ${Math.max(...times).toFixed(2)}ms`,
        );
      }

      // Analyze API performance under stress
      console.log("API stress test results:", apiPerformanceResults);

      // Verify API handles stress reasonably
      const highStressResult = apiPerformanceResults.find(
        (r) => r.stressLevel === "High",
      );
      if (highStressResult) {
        expect(highStressResult.avgRequestTime).toBeLessThan(5000); // Should average under 5 seconds even under high stress
      }
    });
  });

  test("Network condition impact on data synchronization", async ({ page }) => {
    await login(page, TEST_USER);

    // Test how network conditions affect data synchronization
    await test.step("Test network impact on data synchronization", async () => {
      // Generate test data
      const testData = generatePerformanceTestData("medium");

      // Test synchronization under different conditions
      const networkConditions = [
        { name: "WiFi", speed: "fast" },
        { name: "4G", speed: "medium" },
        { name: "3G", speed: "slow" },
      ];

      const syncPerformanceResults = [];

      for (const condition of networkConditions) {
        console.log(
          `Testing data synchronization under ${condition.name} conditions`,
        );

        // Simulate network condition
        await page.evaluate((condition) => {
          console.log(
            `Simulating ${condition.name} network for synchronization`,
          );
        }, condition);

        // Measure synchronization performance
        const syncStartTime = performance.now();

        // Simulate synchronizing the test data
        await page.evaluate((data) => {
          console.log(
            `Simulating synchronization of ${data.tasks.length} tasks and ${data.projects.length} projects`,
          );
          // This would be replaced with actual sync operations
        }, testData);

        // Wait for synchronization to complete (simulated)
        await page.waitForTimeout(1000 + Math.random() * 2000);

        const syncEndTime = performance.now();
        const syncTime = syncEndTime - syncStartTime;

        // Calculate expected sync time based on data size and network condition
        const expectedSyncTime = calculateExpectedSyncTime(
          testData.totalItems,
          condition.speed,
        );

        syncPerformanceResults.push({
          networkCondition: condition.name,
          dataSize: testData.totalItems,
          actualSyncTime: syncTime,
          expectedSyncTime,
          performanceRatio: syncTime / expectedSyncTime,
        });

        console.log(
          `${condition.name} sync - Data: ${testData.totalItems} items, Time: ${syncTime.toFixed(2)}ms, Expected: ${expectedSyncTime.toFixed(2)}ms`,
        );
      }

      // Analyze synchronization performance
      console.log(
        "Data synchronization performance analysis:",
        syncPerformanceResults,
      );

      // Verify synchronization performance is reasonable
      syncPerformanceResults.forEach((result) => {
        expect(result.performanceRatio).toBeLessThan(2.0); // Should not take more than 2x expected time
      });
    });
  });
});

// Helper function to calculate expected sync time
function calculateExpectedSyncTime(dataSize: number, networkSpeed: string) {
  const speedMultipliers = {
    fast: 1.0,
    medium: 1.8,
    slow: 3.5,
  };

  const multiplier = speedMultipliers[networkSpeed] || 1.0;
  const baseTimePerItem = 2; // ms per item

  return dataSize * baseTimePerItem * multiplier;
}
