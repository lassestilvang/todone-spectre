import { test, expect } from '@playwright/test';
import { TEST_USER, login } from './utils/auth';
import { TEST_TASK, TEST_COMMENT, generateRandomTask } from './utils/testData';

test.describe('Task Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USER);
  });

  test('Complete task management workflow: Create → Set priority → Add comments → Complete task', async ({ page }) => {
    // Step 1: Create task
    await test.step('Create task', async () => {
      await page.click('button:has-text("Create Task")');
      await page.fill('input[name="title"]', TEST_TASK.title);
      await page.fill('textarea[name="description"]', TEST_TASK.description);
      await page.click('button[type="submit"]:has-text("Create")');

      await expect(page.locator(`text="${TEST_TASK.title}"`)).toBeVisible();
    });

    // Step 2: Set priority
    await test.step('Set task priority', async () => {
      await page.click(`text="${TEST_TASK.title}"`);
      await page.click('button:has-text("Edit")');
      await page.selectOption('select[name="priority"]', 'high');
      await page.click('button[type="submit"]:has-text("Update")');

      await expect(page.locator('text=High Priority')).toBeVisible();
    });

    // Step 3: Add comments
    await test.step('Add comments to task', async () => {
      await page.click('button:has-text("Add Comment")');
      await page.fill('textarea[name="comment"]', TEST_COMMENT.text);
      await page.click('button[type="submit"]:has-text("Post Comment")');

      await expect(page.locator(`text="${TEST_COMMENT.text}"`)).toBeVisible();
    });

    // Step 4: Complete task
    await test.step('Complete task', async () => {
      await page.click('button:has-text("Mark as Complete")');
      await expect(page.locator('text=Completed')).toBeVisible();
      await expect(page.locator('text=Task completed successfully')).toBeVisible();
    });
  });

  test('Task management with multiple tasks and filtering', async ({ page }) => {
    // Create multiple tasks
    const tasks = [TEST_TASK, generateRandomTask(), generateRandomTask()];

    for (const task of tasks) {
      await page.click('button:has-text("Create Task")');
      await page.fill('input[name="title"]', task.title);
      await page.fill('textarea[name="description"]', task.description);
      await page.selectOption('select[name="priority"]', task.priority);
      await page.click('button[type="submit"]:has-text("Create")');
    }

    // Test filtering by priority
    await page.click('button:has-text("Filter")');
    await page.selectOption('select[name="priorityFilter"]', 'high');
    await page.click('button:has-text("Apply")');

    // Verify only high priority tasks are shown
    const taskElements = await page.locator('div.task-item').all();
    for (const taskElement of taskElements) {
      await expect(taskElement).toContainText('High Priority');
    }

    // Test search functionality
    await page.fill('input[placeholder="Search tasks"]', TEST_TASK.title);
    await expect(page.locator(`text="${TEST_TASK.title}"`)).toBeVisible();
    await expect(page.locator(`text="${tasks[1].title}"`)).not.toBeVisible();
  });

  test('Task error recovery scenarios', async ({ page }) => {
    // Test creating task with invalid data
    await page.click('button:has-text("Create Task")');
    await page.click('button[type="submit"]:has-text("Create")'); // Empty form

    await expect(page.locator('text=Title is required')).toBeVisible();

    // Test editing non-existent task
    await page.goto('/tasks/999999/edit');
    await expect(page.locator('text=Task not found')).toBeVisible();
  });
});

test.describe('Task Management Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USER);
  });

  test('Task with very long content', async ({ page }) => {
    const longTitle = 'A'.repeat(200);
    const longDescription = 'B'.repeat(1000);

    await page.click('button:has-text("Create Task")');
    await page.fill('input[name="title"]', longTitle);
    await page.fill('textarea[name="description"]', longDescription);
    await page.click('button[type="submit"]:has-text("Create")');

    await expect(page.locator(`text="${longTitle.substring(0, 50)}..."`)).toBeVisible();
  });

  test('Task priority changes and UI updates', async ({ page }) => {
    await page.click('button:has-text("Create Task")');
    await page.fill('input[name="title"]', 'Priority Test Task');
    await page.fill('textarea[name="description"]', 'Testing priority changes');
    await page.selectOption('select[name="priority"]', 'low');
    await page.click('button[type="submit"]:has-text("Create")');

    // Change priority multiple times
    await page.click('text=Priority Test Task');
    await page.click('button:has-text("Edit")');
    await page.selectOption('select[name="priority"]', 'medium');
    await page.click('button[type="submit"]:has-text("Update")');

    await expect(page.locator('text=Medium Priority')).toBeVisible();

    await page.click('button:has-text("Edit")');
    await page.selectOption('select[name="priority"]', 'critical');
    await page.click('button[type="submit"]:has-text("Update")');

    await expect(page.locator('text=Critical Priority')).toBeVisible();
  });
});