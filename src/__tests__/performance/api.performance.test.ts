import { test, expect } from "@playwright/test";
import { TEST_USER, login } from "../e2e/utils/auth";
import {
  generateRandomTask,
  generateRandomProject,
} from "../e2e/utils/testData";

test.describe("API Performance Tests", () => {
  test("Authentication API performance", async ({ page }) => {
    // Test login performance
    await test.step("Test login API performance", async () => {
      const startTime = performance.now();
      await login(page, TEST_USER);
      const endTime = performance.now();
      const loginTime = endTime - startTime;

      console.log(`Login API call took ${loginTime.toFixed(2)}ms`);
      expect(loginTime).toBeLessThan(2000); // Should be under 2 seconds
    });

    // Test session validation performance
    await test.step("Test session validation performance", async () => {
      const startTime = performance.now();
      await page.goto("/api/validate-session");
      await page.waitForResponse("/api/validate-session");
      const endTime = performance.now();
      const validationTime = endTime - startTime;

      console.log(`Session validation took ${validationTime.toFixed(2)}ms`);
      expect(validationTime).toBeLessThan(500); // Should be under 500ms
    });
  });

  test("Task operations API performance", async ({ page }) => {
    await login(page, TEST_USER);

    // Test task creation API performance
    await test.step("Test task creation API performance", async () => {
      const task = generateRandomTask();
      const startTime = performance.now();

      await page.click('button:has-text("Create Task")');
      await page.fill('input[name="title"]', task.title);
      await page.fill('textarea[name="description"]', task.description);
      await page.selectOption('select[name="priority"]', task.priority);
      await page.click('button[type="submit"]:has-text("Create")');

      await page.waitForResponse("**/api/tasks");
      const endTime = performance.now();
      const creationTime = endTime - startTime;

      console.log(`Task creation API call took ${creationTime.toFixed(2)}ms`);
      expect(creationTime).toBeLessThan(1500); // Should be under 1.5 seconds
    });

    // Test bulk task operations performance
    await test.step("Test bulk task operations performance", async () => {
      const startTime = performance.now();

      // Create multiple tasks
      for (let i = 0; i < 10; i++) {
        const task = generateRandomTask();
        await page.click('button:has-text("Create Task")');
        await page.fill('input[name="title"]', `${task.title} ${i}`);
        await page.fill('textarea[name="description"]', task.description);
        await page.selectOption('select[name="priority"]', task.priority);
        await page.click('button[type="submit"]:has-text("Create")');
      }

      await page.waitForResponse("**/api/tasks");
      const endTime = performance.now();
      const bulkTime = endTime - startTime;
      const avgTimePerTask = bulkTime / 10;

      console.log(
        `Bulk task creation (10 tasks) took ${bulkTime.toFixed(2)}ms total, ${avgTimePerTask.toFixed(2)}ms avg per task`,
      );
      expect(avgTimePerTask).toBeLessThan(800); // Should average under 800ms per task
    });

    // Test task update performance
    await test.step("Test task update performance", async () => {
      const startTime = performance.now();

      await page.click('button:has-text("Edit"):first');
      await page.fill('input[name="title"]', "Updated Task Title");
      await page.click('button[type="submit"]:has-text("Update")');

      await page.waitForResponse("**/api/tasks/*");
      const endTime = performance.now();
      const updateTime = endTime - startTime;

      console.log(`Task update API call took ${updateTime.toFixed(2)}ms`);
      expect(updateTime).toBeLessThan(1000); // Should be under 1 second
    });
  });

  test("Collaboration updates API performance", async ({ page }) => {
    await login(page, TEST_USER);

    // Create test project for collaboration
    await test.step("Create test project", async () => {
      const project = generateRandomProject();
      await page.click('button:has-text("Create Project")');
      await page.fill('input[name="name"]', project.name);
      await page.fill('textarea[name="description"]', project.description);
      await page.click('button[type="submit"]:has-text("Create Project")');
    });

    // Test real-time collaboration updates
    await test.step("Test real-time collaboration updates", async () => {
      const updateTimes = [];

      // Simulate multiple collaboration updates
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();

        // Simulate collaboration update (comment, task assignment, etc.)
        await page.click('button:has-text("Add Comment")');
        await page.fill(
          'textarea[name="comment"]',
          `Collaboration update ${i}`,
        );
        await page.click('button[type="submit"]:has-text("Post Comment")');

        await page.waitForResponse("**/api/collaboration/*");
        const endTime = performance.now();
        updateTimes.push(endTime - startTime);
      }

      const avgUpdateTime =
        updateTimes.reduce((sum, time) => sum + time, 0) / updateTimes.length;
      console.log(
        `Average collaboration update time: ${avgUpdateTime.toFixed(2)}ms`,
      );
      expect(avgUpdateTime).toBeLessThan(1200); // Should average under 1.2 seconds
    });

    // Test concurrent collaboration performance
    await test.step("Test concurrent collaboration performance", async () => {
      const startTime = performance.now();

      // Simulate multiple concurrent updates
      const updatePromises = [];
      for (let i = 0; i < 3; i++) {
        updatePromises.push(
          page.evaluate(async (i) => {
            // Simulate concurrent API calls
            const responses = [];
            for (let j = 0; j < 2; j++) {
              const response = await fetch("/api/collaboration/update", {
                method: "POST",
                body: JSON.stringify({ update: `concurrent-${i}-${j}` }),
                headers: { "Content-Type": "application/json" },
              });
              responses.push(await response.json());
            }
            return responses;
          }, i),
        );
      }

      await Promise.all(updatePromises);
      const endTime = performance.now();
      const concurrentTime = endTime - startTime;

      console.log(
        `Concurrent collaboration updates (6 total) took ${concurrentTime.toFixed(2)}ms`,
      );
      expect(concurrentTime).toBeLessThan(3000); // Should handle 6 concurrent updates in under 3 seconds
    });
  });

  test("API response time analysis", async ({ page }) => {
    await login(page, TEST_USER);

    // Test various API endpoints and analyze response times
    await test.step("Analyze API response times", async () => {
      const endpoints = [
        { path: "/api/tasks", method: "GET", name: "Get Tasks" },
        { path: "/api/projects", method: "GET", name: "Get Projects" },
        { path: "/api/user/profile", method: "GET", name: "Get User Profile" },
        { path: "/api/stats", method: "GET", name: "Get Statistics" },
      ];

      const responseTimes = [];

      for (const endpoint of endpoints) {
        const startTime = performance.now();
        await page.goto(endpoint.path);
        await page.waitForResponse(endpoint.path);
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        responseTimes.push({
          endpoint: endpoint.name,
          method: endpoint.method,
          time: responseTime,
        });

        console.log(
          `${endpoint.method} ${endpoint.name}: ${responseTime.toFixed(2)}ms`,
        );
      }

      // Verify all API responses are performant
      responseTimes.forEach((result) => {
        expect(result.time).toBeLessThan(2000); // All should be under 2 seconds
      });

      // Calculate average response time
      const avgResponseTime =
        responseTimes.reduce((sum, result) => sum + result.time, 0) /
        responseTimes.length;
      console.log(`Average API response time: ${avgResponseTime.toFixed(2)}ms`);
    });
  });
});
