import { test, expect } from "@playwright/test";
import { TEST_USER, login } from "./utils/auth";
import { generateRandomTask } from "./utils/testData";

test.describe("Offline Workflow", () => {
  test("Offline workflow: Go offline → Create tasks → Reconnect → Verify sync", async ({
    page,
  }) => {
    await login(page, TEST_USER);

    // Step 1: Go offline
    await test.step("Simulate offline mode", async () => {
      await page.context().setOffline(true);
      await expect(page.locator("text=Offline Mode")).toBeVisible();
    });

    // Step 2: Create tasks while offline
    await test.step("Create tasks while offline", async () => {
      const offlineTasks = [
        generateRandomTask(),
        generateRandomTask(),
        generateRandomTask(),
      ];

      for (const task of offlineTasks) {
        await page.click('button:has-text("Create Task")');
        await page.fill('input[name="title"]', task.title);
        await page.fill('textarea[name="description"]', task.description);
        await page.selectOption('select[name="priority"]', task.priority);
        await page.click('button[type="submit"]:has-text("Create")');

        await expect(page.locator(`text="${task.title}"`)).toBeVisible();
        await expect(page.locator("text=Task queued for sync")).toBeVisible();
      }
    });

    // Step 3: Verify offline queue
    await test.step("Verify offline queue", async () => {
      await page.click('button:has-text("Offline Queue")');
      await expect(page.locator("text=3 tasks pending sync")).toBeVisible();

      const queueItems = await page.locator("div.offline-queue-item").all();
      expect(queueItems.length).toBe(3);
    });

    // Step 4: Reconnect and verify sync
    await test.step("Reconnect and verify sync", async () => {
      await page.context().setOffline(false);
      await expect(page.locator("text=Online - Syncing data")).toBeVisible();
      await expect(
        page.locator("text=All tasks synced successfully"),
      ).toBeVisible();

      // Verify tasks are properly saved
      await page.reload();
      for (let i = 0; i < 3; i++) {
        await expect(page.locator(`text=Task ${i}`)).toBeVisible();
      }
    });
  });

  test("Offline error recovery scenarios", async ({ page }) => {
    await login(page, TEST_USER);

    // Test offline detection
    await page.context().setOffline(true);
    await expect(page.locator("text=You are offline")).toBeVisible();

    // Test creating task with invalid data while offline
    await page.click('button:has-text("Create Task")');
    await page.click('button[type="submit"]:has-text("Create")'); // Empty form

    await expect(page.locator("text=Title is required")).toBeVisible();
    await expect(
      page.locator("text=Task validation failed - will not be queued"),
    ).toBeVisible();

    // Test that invalid tasks are not queued
    await page.click('button:has-text("Offline Queue")');
    await expect(page.locator("text=0 tasks pending sync")).toBeVisible();

    // Reconnect and verify no sync errors
    await page.context().setOffline(false);
    await expect(page.locator("text=Online")).toBeVisible();
    await expect(page.locator("text=No sync errors")).toBeVisible();
  });

  test("Offline task editing and conflict resolution", async ({ page }) => {
    await login(page, TEST_USER);

    // Create a task while online
    await page.click('button:has-text("Create Task")');
    await page.fill('input[name="title"]', TEST_TASK.title);
    await page.fill('textarea[name="description"]', TEST_TASK.description);
    await page.click('button[type="submit"]:has-text("Create")');

    // Go offline
    await page.context().setOffline(true);

    // Edit task while offline
    await page.click(`text="${TEST_TASK.title}"`);
    await page.click('button:has-text("Edit")');
    await page.fill(
      'textarea[name="description"]',
      "Updated description while offline",
    );
    await page.click('button[type="submit"]:has-text("Update")');

    await expect(
      page.locator("text=Task update queued for sync"),
    ).toBeVisible();

    // Reconnect and verify sync
    await page.context().setOffline(false);
    await expect(page.locator("text=Syncing updates")).toBeVisible();
    await expect(page.locator("text=Task updated successfully")).toBeVisible();

    // Verify the updated description
    await page.reload();
    await page.click(`text="${TEST_TASK.title}"`);
    await expect(
      page.locator("text=Updated description while offline"),
    ).toBeVisible();
  });
});

test.describe("Offline Collaboration Scenarios", () => {
  test("Offline team collaboration with sync conflicts", async ({
    page,
  }) => {
    await login(page, TEST_USER);

    // Create a team and task while online
    await page.click('button:has-text("Create Team")');
    await page.fill('input[name="name"]', "Offline Test Team");
    await page.click('button[type="submit"]:has-text("Create Team")');

    await page.click('button:has-text("Create Task")');
    await page.fill('input[name="title"]', "Collaboration Test Task");
    await page.click('button[type="submit"]:has-text("Create")');

    // Go offline
    await page.context().setOffline(true);

    // Team leader assigns task to themselves while offline
    await page.click("text=Collaboration Test Task");
    await page.click('button:has-text("Assign")');
    await page.selectOption('select[name="assignee"]', TEST_USER.email);
    await page.click('button:has-text("Assign Task")');

    await expect(page.locator("text=Assignment queued for sync")).toBeVisible();

    // Reconnect and verify sync
    await page.context().setOffline(false);
    await expect(page.locator("text=Syncing assignment")).toBeVisible();
    await expect(page.locator("text=Task assigned successfully")).toBeVisible();

    // Verify assignment persisted
    await page.reload();
    await page.click("text=Collaboration Test Task");
    await expect(
      page.locator(`text=Assigned to ${TEST_USER.name}`),
    ).toBeVisible();
  });
});
