import { test, expect } from '@playwright/test';
import { TEST_USER, login } from '../e2e/utils/auth';
import { generateRandomTask, generateRandomProject } from '../e2e/utils/testData';

test.describe('Memory Usage Performance Tests', () => {
  test('Memory usage during long sessions', async ({ page }) => {
    await login(page, TEST_USER);

    // Monitor memory usage over extended operations
    await test.step('Monitor memory usage during long session', async () => {
      const memoryMeasurements = [];

      // Get initial memory usage
      const initialMemory = await getMemoryUsage(page);
      memoryMeasurements.push({ step: 'Initial', ...initialMemory });

      // Perform operations in batches and measure memory
      for (let batch = 0; batch < 5; batch++) {
        // Create tasks
        for (let i = 0; i < 10; i++) {
          const task = generateRandomTask();
          await page.click('button:has-text("Create Task")');
          await page.fill('input[name="title"]', `${task.title} ${batch}-${i}`);
          await page.fill('textarea[name="description"]', task.description);
          await page.selectOption('select[name="priority"]', task.priority);
          await page.click('button[type="submit"]:has-text("Create")');
        }

        // Measure memory after batch
        const batchMemory = await getMemoryUsage(page);
        memoryMeasurements.push({ step: `After batch ${batch + 1}`, ...batchMemory });

        // Perform some task operations
        await page.click('button:has-text("Filter")');
        await page.selectOption('select[name="priorityFilter"]', 'high');
        await page.click('button:has-text("Apply")');

        await page.fill('input[placeholder="Search tasks"]', 'test');
        await page.waitForSelector('div.task-item');
        await page.fill('input[placeholder="Search tasks"]', '');
      }

      // Analyze memory usage patterns
      console.log('Memory usage measurements:', memoryMeasurements);

      // Calculate memory growth
      if (initialMemory.usedJSHeapSize && memoryMeasurements.length > 1) {
        const finalMemory = memoryMeasurements[memoryMeasurements.length - 1];
        if (finalMemory.usedJSHeapSize) {
          const memoryIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
          const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
          console.log(`Total memory increase during long session: ${memoryIncreaseMB.toFixed(2)} MB`);

          // Memory should not increase excessively during normal operations
          expect(memoryIncreaseMB).toBeLessThan(100); // Should be under 100MB increase
        }
      }
    });
  });

  test('Memory usage with large datasets', async ({ page }) => {
    await login(page, TEST_USER);

    // Test memory usage with progressively larger datasets
    await test.step('Test memory usage with large datasets', async () => {
      const datasetSizes = [50, 100, 200];
      const memoryResults = [];

      for (const size of datasetSizes) {
        const startMemory = await getMemoryUsage(page);

        // Create dataset
        for (let i = 0; i < size; i++) {
          const task = generateRandomTask();
          await page.click('button:has-text("Create Task")');
          await page.fill('input[name="title"]', `${task.title} ${size}-${i}`);
          await page.fill('textarea[name="description"]', task.description);
          await page.selectOption('select[name="priority"]', task.priority);
          await page.click('button[type="submit"]:has-text("Create")');
        }

        const endMemory = await getMemoryUsage(page);

        if (startMemory.usedJSHeapSize && endMemory.usedJSHeapSize) {
          const memoryIncrease = endMemory.usedJSHeapSize - startMemory.usedJSHeapSize;
          const memoryIncreaseMB = memoryIncrease / (1024 * 1024);

          memoryResults.push({
            datasetSize: size,
            memoryIncreaseMB,
            memoryPerItemKB: (memoryIncrease / size) / 1024
          });

          console.log(`Memory increase for ${size} items: ${memoryIncreaseMB.toFixed(2)} MB (${(memoryIncrease / size / 1024).toFixed(2)} KB per item)`);
        }

        // Clean up for next test
        await page.click('button:has-text("Delete All Tasks")');
        await page.click('button:has-text("Confirm")');
      }

      // Analyze memory efficiency
      console.log('Memory efficiency analysis:', memoryResults);

      // Verify memory usage scales reasonably
      const largeDatasetResult = memoryResults.find(r => r.datasetSize === 200);
      if (largeDatasetResult) {
        expect(largeDatasetResult.memoryPerItemKB).toBeLessThan(50); // Should be under 50KB per item
      }
    });
  });

  test('Memory leak detection during prolonged usage', async ({ page }) => {
    await login(page, TEST_USER);

    // Test for memory leaks by repeating operations
    await test.step('Test for memory leaks', async () => {
      const memoryMeasurements = [];
      const operations = [];

      // Get initial memory
      const initialMemory = await getMemoryUsage(page);
      memoryMeasurements.push(initialMemory);

      // Perform repeated create/delete cycles
      for (let cycle = 0; cycle < 10; cycle++) {
        const cycleStartMemory = await getMemoryUsage(page);

        // Create tasks
        for (let i = 0; i < 5; i++) {
          const task = generateRandomTask();
          await page.click('button:has-text("Create Task")');
          await page.fill('input[name="title"]', `${task.title} ${cycle}-${i}`);
          await page.fill('textarea[name="description"]', task.description);
          await page.selectOption('select[name="priority"]', task.priority);
          await page.click('button[type="submit"]:has-text("Create")');
        }

        // Perform operations
        await page.click('button:has-text("Filter")');
        await page.selectOption('select[name="priorityFilter"]', 'all');
        await page.click('button:has-text("Apply")');

        // Delete tasks
        await page.click('button:has-text("Delete All Tasks")');
        await page.click('button:has-text("Confirm")');

        const cycleEndMemory = await getMemoryUsage(page);
        memoryMeasurements.push(cycleEndMemory);

        if (cycleStartMemory.usedJSHeapSize && cycleEndMemory.usedJSHeapSize) {
          const cycleMemoryIncrease = cycleEndMemory.usedJSHeapSize - cycleStartMemory.usedJSHeapSize;
          operations.push({
            cycle,
            memoryIncrease: cycleMemoryIncrease,
            memoryIncreaseMB: cycleMemoryIncrease / (1024 * 1024)
          });
        }
      }

      console.log('Memory leak detection results:', operations);

      // Analyze for memory leaks
      const significantLeaks = operations.filter(op => op.memoryIncreaseMB > 5); // More than 5MB increase per cycle
      if (significantLeaks.length > 0) {
        console.warn('Potential memory leaks detected:', significantLeaks);
      }

      // Overall memory increase should be reasonable
      const finalMemoryIncrease = memoryMeasurements[memoryMeasurements.length - 1].usedJSHeapSize -
                                  memoryMeasurements[0].usedJSHeapSize;
      const finalMemoryIncreaseMB = finalMemoryIncrease / (1024 * 1024);

      console.log(`Total memory increase after ${operations.length} cycles: ${finalMemoryIncreaseMB.toFixed(2)} MB`);
      expect(finalMemoryIncreaseMB).toBeLessThan(50); // Should be under 50MB total increase
    });
  });

  test('Complex workflow memory usage', async ({ page }) => {
    await login(page, TEST_USER);

    // Test memory usage with complex workflows
    await test.step('Test complex workflow memory usage', async () => {
      const initialMemory = await getMemoryUsage(page);

      // Create complex structure: projects with tasks, comments, attachments
      for (let p = 0; p < 2; p++) {
        const project = generateRandomProject();
        await page.click('button:has-text("Create Project")');
        await page.fill('input[name="name"]', `${project.name} ${p}`);
        await page.fill('textarea[name="description"]', project.description);
        await page.click('button[type="submit"]:has-text("Create Project")');

        // Add tasks with comments
        for (let t = 0; t < 8; t++) {
          const task = generateRandomTask();
          await page.click('button:has-text("Add Task")');
          await page.fill('input[name="title"]', `${task.title} ${p}-${t}`);
          await page.fill('textarea[name="description"]', task.description);
          await page.selectOption('select[name="priority"]', task.priority);
          await page.click('button[type="submit"]:has-text("Add")');

          // Add comments to some tasks
          if (t % 2 === 0) {
            await page.click('button:has-text("Add Comment")');
            await page.fill('textarea[name="comment"]', `Comment for task ${p}-${t}`);
            await page.click('button[type="submit"]:has-text("Post Comment")');
          }
        }
      }

      const afterComplexMemory = await getMemoryUsage(page);

      // Perform complex operations
      await page.click('button:has-text("Filter")');
      await page.selectOption('select[name="priorityFilter"]', 'high');
      await page.click('button:has-text("Apply")');

      await page.fill('input[placeholder="Search tasks"]', 'important');
      await page.waitForSelector('div.task-item');

      const finalMemory = await getMemoryUsage(page);

      // Analyze memory usage
      if (initialMemory.usedJSHeapSize && finalMemory.usedJSHeapSize) {
        const totalIncrease = finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
        const complexOperationsIncrease = finalMemory.usedJSHeapSize - afterComplexMemory.usedJSHeapSize;

        console.log(`Memory increase after complex structure creation: ${(totalIncrease / (1024 * 1024)).toFixed(2)} MB`);
        console.log(`Memory increase after complex operations: ${(complexOperationsIncrease / (1024 * 1024)).toFixed(2)} MB`);

        // Complex workflows should not cause excessive memory usage
        expect(totalIncrease / (1024 * 1024)).toBeLessThan(80); // Under 80MB for complex structure
      }
    });
  });
});

// Helper function to get memory usage
async function getMemoryUsage(page) {
  return await page.evaluate(() => {
    return {
      jsHeapSizeLimit: window.performance?.memory?.jsHeapSizeLimit,
      usedJSHeapSize: window.performance?.memory?.usedJSHeapSize,
      totalJSHeapSize: window.performance?.memory?.totalJSHeapSize,
      timestamp: Date.now()
    };
  });
}