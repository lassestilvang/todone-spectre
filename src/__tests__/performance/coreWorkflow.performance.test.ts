import { test, expect } from "@playwright/test";
import { TEST_USER, login } from "../e2e/utils/auth";
import {
  generateRandomTask,
  generateRandomProject,
} from "../e2e/utils/testData";

test.describe("Core Workflow Performance Tests", () => {
  test("Task creation performance with varying dataset sizes", async ({
    page,
  }) => {
    await login(page, TEST_USER);

    const datasetSizes = [10, 50, 100];
    const results = [];

    for (const size of datasetSizes) {
      await test.step(`Test task creation with ${size} tasks`, async () => {
        const startTime = performance.now();

        // Create multiple tasks
        for (let i = 0; i < size; i++) {
          const task = generateRandomTask();
          await page.click('button:has-text("Create Task")');
          await page.fill('input[name="title"]', `${task.title} ${i}`);
          await page.fill('textarea[name="description"]', task.description);
          await page.selectOption('select[name="priority"]', task.priority);
          await page.click('button[type="submit"]:has-text("Create")');
          await page.waitForSelector(`text=${task.title} ${i}`);
        }

        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTimePerTask = totalTime / size;

        results.push({
          datasetSize: size,
          totalTime,
          avgTimePerTask,
          tasksPerSecond: (size / totalTime) * 1000,
        });

        console.log(
          `Created ${size} tasks: ${totalTime.toFixed(2)}ms total, ${avgTimePerTask.toFixed(2)}ms avg per task`,
        );

        // Clean up for next test
        await page.click('button:has-text("Delete All Tasks")');
        await page.click('button:has-text("Confirm")');
      });
    }

    // Analyze performance scaling
    console.log("Performance scaling analysis:", results);

    // Verify performance is acceptable
    const largeDatasetResult = results.find((r) => r.datasetSize === 100);
    expect(largeDatasetResult?.avgTimePerTask).toBeLessThan(500); // Should be under 500ms per task for 100 tasks
  });

  test("Project loading performance with complex structures", async ({
    page,
  }) => {
    await login(page, TEST_USER);

    // Create complex project structure
    await test.step("Create complex project structure", async () => {
      const startTime = performance.now();

      // Create projects with nested tasks
      for (let p = 0; p < 3; p++) {
        const project = generateRandomProject();
        await page.click('button:has-text("Create Project")');
        await page.fill('input[name="name"]', `${project.name} ${p}`);
        await page.fill('textarea[name="description"]', project.description);
        await page.click('button[type="submit"]:has-text("Create Project")');

        // Add tasks to each project
        for (let t = 0; t < 15; t++) {
          const task = generateRandomTask();
          await page.click('button:has-text("Add Task")');
          await page.fill('input[name="title"]', `${task.title} ${p}-${t}`);
          await page.fill('textarea[name="description"]', task.description);
          await page.selectOption('select[name="priority"]', task.priority);
          await page.click('button[type="submit"]:has-text("Add")');
        }
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      console.log(
        `Created complex project structure in ${totalTime.toFixed(2)}ms`,
      );
      expect(totalTime).toBeLessThan(15000); // Should be under 15 seconds
    });

    // Test project switching performance
    await test.step("Test project switching performance", async () => {
      const switchTimes = [];

      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();
        await page.click(`button:has-text("Project ${i}")`);
        await page.waitForSelector("text=Project Details");
        const endTime = performance.now();
        switchTimes.push(endTime - startTime);
      }

      const avgSwitchTime =
        switchTimes.reduce((sum, time) => sum + time, 0) / switchTimes.length;
      console.log(`Average project switch time: ${avgSwitchTime.toFixed(2)}ms`);
      expect(avgSwitchTime).toBeLessThan(1000); // Should be under 1 second
    });
  });

  test("Search functionality performance with large datasets", async ({
    page,
  }) => {
    await login(page, TEST_USER);

    // Create large dataset
    await test.step("Create large dataset for search testing", async () => {
      for (let i = 0; i < 50; i++) {
        const task = generateRandomTask();
        await page.click('button:has-text("Create Task")');
        await page.fill('input[name="title"]', `${task.title} ${i}`);
        await page.fill(
          'textarea[name="description"]',
          `Searchable content ${i} ${task.description}`,
        );
        await page.selectOption('select[name="priority"]', task.priority);
        await page.click('button[type="submit"]:has-text("Create")');
      }
    });

    // Test search performance
    await test.step("Test search performance", async () => {
      const searchTerms = ["urgent", "important", "content", "test"];

      for (const term of searchTerms) {
        const startTime = performance.now();
        await page.fill('input[placeholder="Search tasks"]', term);
        await page.waitForSelector("div.task-item", { timeout: 2000 });
        const endTime = performance.now();
        const searchTime = endTime - startTime;

        console.log(`Search for "${term}" took ${searchTime.toFixed(2)}ms`);
        expect(searchTime).toBeLessThan(1500); // Should be under 1.5 seconds

        // Clear search
        await page.fill('input[placeholder="Search tasks"]', "");
      }
    });
  });
});
