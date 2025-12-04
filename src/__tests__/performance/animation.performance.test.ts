import { test, expect } from '@playwright/test';
import { TEST_USER, login } from '../e2e/utils/auth';

test.describe('Animation Performance Tests', () => {
  test('Micro-interaction performance testing', async ({ page }) => {
    await login(page, TEST_USER);

    // Create test tasks for animation testing
    await test.step('Create test tasks', async () => {
      for (let i = 0; i < 5; i++) {
        await page.click('button:has-text("Create Task")');
        await page.fill('input[name="title"]', `Animation Test Task ${i}`);
        await page.fill('textarea[name="description"]', `Description for animation test ${i}`);
        await page.selectOption('select[name="priority"]', 'medium');
        await page.click('button[type="submit"]:has-text("Create")');
      }
    });

    // Test micro-interaction performance
    await test.step('Test micro-interaction performance', async () => {
      const interactions = [
        { selector: 'button:has-text("Complete")', action: 'click', name: 'complete' },
        { selector: 'button:has-text("Star")', action: 'click', name: 'star' },
        { selector: 'button:has-text("Priority")', action: 'click', name: 'priority-change' }
      ];

      const performanceResults = [];

      for (const interaction of interactions) {
        const startTime = performance.now();

        // Perform the interaction
        if (interaction.action === 'click') {
          await page.click(interaction.selector);
          await page.waitForTimeout(500); // Wait for animation to complete
        }

        const endTime = performance.now();
        const interactionTime = endTime - startTime;

        performanceResults.push({
          interaction: interaction.name,
          time: interactionTime
        });

        console.log(`Micro-interaction "${interaction.name}" took ${interactionTime.toFixed(2)}ms`);
      }

      // Verify all micro-interactions are performant
      performanceResults.forEach(result => {
        expect(result.time).toBeLessThan(800); // Should be under 800ms including animation
      });
    });
  });

  test('View transition performance testing', async ({ page }) => {
    await login(page, TEST_USER);

    // Create multiple views for transition testing
    await test.step('Create test projects for view transitions', async () => {
      for (let i = 0; i < 3; i++) {
        await page.click('button:has-text("Create Project")');
        await page.fill('input[name="name"]', `Transition Test Project ${i}`);
        await page.fill('textarea[name="description"]', `Description for transition test ${i}`);
        await page.click('button[type="submit"]:has-text("Create Project")');
      }
    });

    // Test view transition performance
    await test.step('Test view transition performance', async () => {
      const viewTypes = ['List', 'Board', 'Calendar', 'Timeline'];
      const transitionTimes = [];

      for (const viewType of viewTypes) {
        const startTime = performance.now();
        await page.click(`button:has-text("${viewType} View")`);
        await page.waitForSelector(`div[aria-label="${viewType} view loaded"]`);
        const endTime = performance.now();
        const transitionTime = endTime - startTime;

        transitionTimes.push({
          viewType,
          time: transitionTime
        });

        console.log(`View transition to "${viewType}" took ${transitionTime.toFixed(2)}ms`);
      }

      // Verify view transitions are performant
      transitionTimes.forEach(result => {
        expect(result.time).toBeLessThan(1500); // Should be under 1.5 seconds
      });
    });
  });

  test('Task animation performance with multiple items', async ({ page }) => {
    await login(page, TEST_USER);

    // Create multiple tasks for bulk animation testing
    await test.step('Create multiple tasks for animation testing', async () => {
      for (let i = 0; i < 20; i++) {
        await page.click('button:has-text("Create Task")');
        await page.fill('input[name="title"]', `Bulk Animation Task ${i}`);
        await page.fill('textarea[name="description"]', `Bulk animation description ${i}`);
        await page.selectOption('select[name="priority"]', i % 3 === 0 ? 'high' : i % 2 === 0 ? 'medium' : 'low');
        await page.click('button[type="submit"]:has-text("Create")');
      }
    });

    // Test bulk task animation performance
    await test.step('Test bulk task animation performance', async () => {
      // Test bulk completion animation
      const startTime = performance.now();

      // Select multiple tasks and complete them
      for (let i = 0; i < 10; i++) {
        await page.click(`button:has-text("Complete"):nth(${i})`);
        // Don't wait between clicks to test concurrent animations
      }

      // Wait for all animations to complete
      await page.waitForTimeout(2000);
      const endTime = performance.now();
      const bulkAnimationTime = endTime - startTime;

      console.log(`Bulk task completion animation for 10 tasks took ${bulkAnimationTime.toFixed(2)}ms`);
      expect(bulkAnimationTime).toBeLessThan(3000); // Should be under 3 seconds for 10 concurrent animations

      // Test bulk reordering animation
      const reorderStartTime = performance.now();
      await page.dragAndDrop('div.task-item:nth-child(1)', 'div.task-item:nth-child(10)');
      await page.waitForTimeout(1000);
      const reorderEndTime = performance.now();
      const reorderTime = reorderEndTime - reorderStartTime;

      console.log(`Task reordering animation took ${reorderTime.toFixed(2)}ms`);
      expect(reorderTime).toBeLessThan(1500); // Should be under 1.5 seconds
    });
  });

  test('Animation frame rate monitoring', async ({ page }) => {
    await login(page, TEST_USER);

    // Create test task
    await page.click('button:has-text("Create Task")');
    await page.fill('input[name="title"]', 'Frame Rate Test Task');
    await page.fill('textarea[name="description"]', 'Testing animation frame rates');
    await page.selectOption('select[name="priority"]', 'high');
    await page.click('button[type="submit"]:has-text("Create")');

    // Monitor animation frame rates
    await test.step('Monitor animation frame rates', async () => {
      const frameRates = await page.evaluate(() => {
        return new Promise(resolve => {
          const results = [];
          let frameCount = 0;
          let lastTime = performance.now();
          const duration = 2000; // Monitor for 2 seconds

          const checkFrameRate = () => {
            frameCount++;
            const currentTime = performance.now();
            const elapsed = currentTime - lastTime;

            if (elapsed >= 1000) {
              const fps = (frameCount / elapsed) * 1000;
              results.push(fps);
              frameCount = 0;
              lastTime = currentTime;
            }

            if (currentTime - lastTime < duration) {
              requestAnimationFrame(checkFrameRate);
            } else {
              resolve(results);
            }
          };

          // Trigger animations
          document.querySelector('button:has-text("Complete")')?.click();
          requestAnimationFrame(checkFrameRate);
        });
      });

      console.log('Animation frame rates:', frameRates);

      // Verify frame rates are smooth (target 60fps)
      const avgFrameRate = frameRates.reduce((sum, rate) => sum + rate, 0) / frameRates.length;
      console.log(`Average animation frame rate: ${avgFrameRate.toFixed(2)} FPS`);
      expect(avgFrameRate).toBeGreaterThan(45); // Should maintain at least 45 FPS
    });
  });
});