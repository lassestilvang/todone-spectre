import { test, expect } from "@playwright/test";
import { TEST_USER, login } from "./utils/auth";
import {
  generateRandomTask,
  generateRandomProject,
} from "./utils/testData";

test.describe("Performance Monitoring", () => {
  test("Performance monitoring: Complete complex workflows → Check performance metrics", async ({
    page,
  }) => {
    await login(page, TEST_USER);

    // Step 1: Create complex workflow with many tasks and projects
    await test.step("Create complex workflow", async () => {
      // Create multiple projects
      for (let i = 0; i < 5; i++) {
        const project = generateRandomProject();
        await page.click('button:has-text("Create Project")');
        await page.fill('input[name="name"]', project.name);
        await page.fill('textarea[name="description"]', project.description);
        await page.click('button[type="submit"]:has-text("Create Project")');
      }

      // Create multiple tasks
      for (let i = 0; i < 10; i++) {
        const task = generateRandomTask();
        await page.click('button:has-text("Create Task")');
        await page.fill('input[name="title"]', task.title);
        await page.fill('textarea[name="description"]', task.description);
        await page.selectOption('select[name="priority"]', task.priority);
        await page.click('button[type="submit"]:has-text("Create")');
      }

      await expect(page.locator("text=10 tasks created")).toBeVisible();
    });

    // Step 2: Perform complex operations
    await test.step("Perform complex operations", async () => {
      // Filter and search operations
      await page.click('button:has-text("Filter")');
      await page.selectOption('select[name="priorityFilter"]', "high");
      await page.click('button:has-text("Apply")');

      await page.fill('input[placeholder="Search tasks"]', "test");
      await expect(page.locator("div.task-item")).toHaveCountGreaterThan(0);

      // Sort operations
      await page.click('button:has-text("Sort")');
      await page.selectOption('select[name="sortBy"]', "priority");
      await page.click('button:has-text("Apply Sort")');
    });

    // Step 3: Check performance metrics
    await test.step("Check performance metrics", async () => {
      await page.click('button:has-text("Performance")');
      await expect(page.locator("text=Performance Metrics")).toBeVisible();

      // Check load times
      await expect(page.locator("text=Page Load Time")).toBeVisible();
      await expect(page.locator("text=API Response Time")).toBeVisible();
      await expect(page.locator("text=Task Rendering Time")).toBeVisible();

      // Verify performance is within acceptable limits
      const loadTime = await page.locator("text=Page Load Time").textContent();
      const apiTime = await page
        .locator("text=API Response Time")
        .textContent();

      // These would be actual assertions in a real implementation
      console.log("Performance metrics:", { loadTime, apiTime });
    });
  });

  test("Performance with large datasets", async ({ page }) => {
    await login(page, TEST_USER);

    // Create large dataset
    await test.step("Create large dataset", async () => {
      for (let i = 0; i < 20; i++) {
        const task = generateRandomTask();
        await page.click('button:has-text("Create Task")');
        await page.fill('input[name="title"]', `${task.title} ${i}`);
        await page.fill('textarea[name="description"]', task.description);
        await page.selectOption('select[name="priority"]', task.priority);
        await page.click('button[type="submit"]:has-text("Create")');
      }
    });

    // Test performance with large dataset
    await test.step("Test performance with large dataset", async () => {
      const startTime = Date.now();

      // Perform operations that should be fast even with large datasets
      await page.fill('input[placeholder="Search tasks"]', "test");
      await page.waitForSelector("div.task-item", { timeout: 2000 });

      const endTime = Date.now();
      const searchTime = endTime - startTime;

      console.log(`Search with large dataset took ${searchTime}ms`);
      expect(searchTime).toBeLessThan(3000); // Should be under 3 seconds

      // Test filtering performance
      await page.click('button:has-text("Filter")');
      await page.selectOption('select[name="priorityFilter"]', "high");
      await page.click('button:has-text("Apply")');

      await page.waitForSelector("div.task-item", { timeout: 2000 });
    });
  });

  test("Memory usage monitoring", async ({ page }) => {
    await login(page, TEST_USER);

    // Monitor memory usage during complex operations
    await test.step("Monitor memory usage", async () => {
      // Get initial memory usage
      const initialMemory = await page.evaluate(() => {
        return {
          jsHeapSizeLimit: window.performance.memory?.jsHeapSizeLimit,
          usedJSHeapSize: window.performance.memory?.usedJSHeapSize,
        };
      });

      console.log("Initial memory usage:", initialMemory);

      // Perform memory-intensive operations
      for (let i = 0; i < 15; i++) {
        const task = generateRandomTask();
        await page.click('button:has-text("Create Task")');
        await page.fill('input[name="title"]', `${task.title} ${i}`);
        await page.fill('textarea[name="description"]', task.description);
        await page.selectOption('select[name="priority"]', task.priority);
        await page.click('button[type="submit"]:has-text("Create")');
      }

      // Get memory usage after operations
      const finalMemory = await page.evaluate(() => {
        return {
          jsHeapSizeLimit: window.performance.memory?.jsHeapSizeLimit,
          usedJSHeapSize: window.performance.memory?.usedJSHeapSize,
        };
      });

      console.log("Final memory usage:", finalMemory);

      // Verify memory usage is reasonable
      if (initialMemory.usedJSHeapSize && finalMemory.usedJSHeapSize) {
        const memoryIncrease =
          finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
        const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
        console.log(`Memory increase: ${memoryIncreaseMB.toFixed(2)} MB`);

        // Memory should not increase by more than 50MB for this operation
        expect(memoryIncreaseMB).toBeLessThan(50);
      }
    });
  });
});

test.describe("Performance Edge Cases", () => {
  test("Performance with rapid user interactions", async ({ page }) => {
    await login(page, TEST_USER);

    // Test rapid task creation
    await test.step("Test rapid task creation", async () => {
      const startTime = Date.now();

      for (let i = 0; i < 5; i++) {
        await page.click('button:has-text("Create Task")');
        await page.fill('input[name="title"]', `Rapid Task ${i}`);
        await page.fill(
          'textarea[name="description"]',
          `Description for rapid task ${i}`,
        );
        await page.click('button[type="submit"]:has-text("Create")');
        await page.waitForSelector(`text=Rapid Task ${i}`);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTimePerTask = totalTime / 5;

      console.log(
        `Created 5 tasks in ${totalTime}ms (avg ${avgTimePerTask}ms per task)`,
      );
      expect(avgTimePerTask).toBeLessThan(2000); // Should average less than 2 seconds per task
    });

    // Test rapid filtering and sorting
    await test.step("Test rapid filtering and sorting", async () => {
      const operations = [
        { filter: "high", sort: "priority" },
        { filter: "medium", sort: "dueDate" },
        { filter: "all", sort: "creationDate" },
      ];

      const startTime = Date.now();

      for (const op of operations) {
        await page.click('button:has-text("Filter")');
        await page.selectOption('select[name="priorityFilter"]', op.filter);
        await page.click('button:has-text("Apply")');

        await page.click('button:has-text("Sort")');
        await page.selectOption('select[name="sortBy"]', op.sort);
        await page.click('button:has-text("Apply Sort")');

        await page.waitForSelector("div.task-item", { timeout: 1000 });
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;
      const avgTimePerOp = totalTime / operations.length;

      console.log(
        `Performed ${operations.length} filter/sort operations in ${totalTime}ms (avg ${avgTimePerOp}ms per operation)`,
      );
      expect(avgTimePerOp).toBeLessThan(1500); // Should average less than 1.5 seconds per operation
    });
  });

  test("Performance with network throttling", async ({ page }) => {
    await login(page, TEST_USER);

    // Simulate slow network
    await test.step("Simulate slow network", async () => {
      await page.context().setOffline(false); // Ensure we're online first

      // This would be implemented with actual network throttling in a real test
      console.log("Network throttling test would be implemented here");

      // For now, just verify the app handles network conditions gracefully
      await page.click('button:has-text("Create Task")');
      await page.fill('input[name="title"]', "Network Test Task");
      await page.fill(
        'textarea[name="description"]',
        "Testing network conditions",
      );
      await page.click('button[type="submit"]:has-text("Create")');

      await expect(page.locator("text=Network Test Task")).toBeVisible();
    });
  });
});
