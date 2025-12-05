import { test, expect } from "@playwright/test";
import { TEST_USER, registerUser, login } from "./utils/auth";
import { TEST_TASK, TEST_PROJECT } from "./utils/testData";

test.describe("User Onboarding Flow", () => {
  test("Complete user onboarding: Registration → Login → Task creation → Project setup", async ({
    page,
  }) => {
    // Step 1: User Registration
    await test.step("User registration", async () => {
      await registerUser(page, TEST_USER);
      await expect(page).toHaveURL("/dashboard");
      await expect(page.locator("text=Welcome to Todone")).toBeVisible();
    });

    // Step 2: Create a task
    await test.step("Create first task", async () => {
      await page.click('button:has-text("Create Task")');
      await page.fill('input[name="title"]', TEST_TASK.title);
      await page.fill('textarea[name="description"]', TEST_TASK.description);
      await page.selectOption('select[name="priority"]', TEST_TASK.priority);
      await page.click('button[type="submit"]:has-text("Create")');

      await expect(page.locator(`text="${TEST_TASK.title}"`)).toBeVisible();
      await expect(
        page.locator(`text="${TEST_TASK.description}"`),
      ).toBeVisible();
    });

    // Step 3: Create a project
    await test.step("Create project", async () => {
      await page.click('button:has-text("Projects")');
      await page.click('button:has-text("Create Project")');
      await page.fill('input[name="name"]', TEST_PROJECT.name);
      await page.fill('textarea[name="description"]', TEST_PROJECT.description);
      await page.fill('input[name="dueDate"]', TEST_PROJECT.dueDate);
      await page.click('button[type="submit"]:has-text("Create Project")');

      await expect(page.locator(`text="${TEST_PROJECT.name}"`)).toBeVisible();
    });

    // Step 4: Logout and login to verify persistence
    await test.step("Verify data persistence across sessions", async () => {
      await page.click('button:has-text("Logout")');
      await page.waitForURL("/login");

      await login(page, TEST_USER);
      await expect(page).toHaveURL("/dashboard");

      // Verify task and project are still there
      await expect(page.locator(`text="${TEST_TASK.title}"`)).toBeVisible();
      await expect(page.locator(`text="${TEST_PROJECT.name}"`)).toBeVisible();
    });
  });

  test("User onboarding with error recovery", async ({ page }) => {
    // Test registration with invalid data
    await page.goto("/register");
    await page.click('button[type="submit"]'); // Submit empty form

    await expect(page.locator("text=Email is required")).toBeVisible();
    await expect(page.locator("text=Password is required")).toBeVisible();

    // Test registration with invalid email
    await page.fill('input[name="email"]', "invalid-email");
    await page.fill('input[name="password"]', "short");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Please enter a valid email")).toBeVisible();
    await expect(
      page.locator("text=Password must be at least 8 characters"),
    ).toBeVisible();

    // Successful registration after fixing errors
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard");
  });
});

test.describe("Authentication Flows", () => {
  test("Login with invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "wrong@example.com");
    await page.fill('input[name="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    await expect(page.locator("text=Invalid email or password")).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("Login and logout flow", async ({ page }) => {
    await login(page, TEST_USER);
    await expect(page).toHaveURL("/dashboard");

    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL("/login");
  });
});
