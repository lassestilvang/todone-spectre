import { test, expect } from "@playwright/test";
import { TEST_USER, TEST_TEAM_MEMBER, login, registerUser } from "./utils/auth";
import { TEST_TASK, TEST_TEAM } from "./utils/testData";

test.describe("Collaboration Flow", () => {
  test("Complete collaboration workflow: Create team → Invite members → Assign tasks → Real-time updates", async ({
    page,
    context,
  }) => {
    // Step 1: Create team
    await test.step("Create team", async () => {
      await login(page, TEST_USER);
      await page.click('button:has-text("Teams")');
      await page.click('button:has-text("Create Team")');
      await page.fill('input[name="name"]', TEST_TEAM.name);
      await page.fill('textarea[name="description"]', TEST_TEAM.description);
      await page.click('button[type="submit"]:has-text("Create Team")');

      await expect(page.locator(`text="${TEST_TEAM.name}"`)).toBeVisible();
    });

    // Step 2: Invite team member
    await test.step("Invite team member", async () => {
      await page.click(`text="${TEST_TEAM.name}"`);
      await page.click('button:has-text("Invite Member")');
      await page.fill('input[name="email"]', TEST_TEAM_MEMBER.email);
      await page.click('button:has-text("Send Invite")');

      await expect(
        page.locator(`text=Invitation sent to ${TEST_TEAM_MEMBER.email}`),
      ).toBeVisible();
    });

    // Step 3: Team member accepts invitation and joins
    await test.step("Team member accepts invitation", async () => {
      // Open new page for team member
      const memberPage = await context.newPage();
      await registerUser(memberPage, TEST_TEAM_MEMBER);

      // Check notifications for invitation
      await memberPage.click('button:has-text("Notifications")');
      await expect(
        memberPage.locator(`text=Team invitation from ${TEST_USER.name}`),
      ).toBeVisible();
      await memberPage.click('button:has-text("Accept Invitation")');

      await expect(
        memberPage.locator(`text=Successfully joined ${TEST_TEAM.name}`),
      ).toBeVisible();
      await memberPage.close();
    });

    // Step 4: Assign task to team member
    await test.step("Assign task to team member", async () => {
      // Create a task first
      await page.click('button:has-text("Create Task")');
      await page.fill('input[name="title"]', TEST_TASK.title);
      await page.fill('textarea[name="description"]', TEST_TASK.description);
      await page.click('button[type="submit"]:has-text("Create")');

      // Assign task to team member
      await page.click(`text="${TEST_TASK.title}"`);
      await page.click('button:has-text("Assign")');
      await page.selectOption(
        'select[name="assignee"]',
        TEST_TEAM_MEMBER.email,
      );
      await page.click('button:has-text("Assign Task")');

      await expect(
        page.locator(`text=Assigned to ${TEST_TEAM_MEMBER.name}`),
      ).toBeVisible();
    });

    // Step 5: Verify real-time updates
    await test.step("Verify real-time updates", async () => {
      // Open new page for team member to verify real-time updates
      const memberPage = await context.newPage();
      await login(memberPage, TEST_TEAM_MEMBER);

      // Verify assigned task appears
      await expect(
        memberPage.locator(`text="${TEST_TASK.title}"`),
      ).toBeVisible();
      await expect(memberPage.locator("text=Assigned to you")).toBeVisible();

      // Team leader adds comment
      await page.click(`text="${TEST_TASK.title}"`);
      await page.click('button:has-text("Add Comment")');
      await page.fill(
        'textarea[name="comment"]',
        "Important update for this task",
      );
      await page.click('button[type="submit"]:has-text("Post Comment")');

      // Verify team member sees comment in real-time
      await memberPage.reload();
      await expect(
        memberPage.locator("text=Important update for this task"),
      ).toBeVisible();

      await memberPage.close();
    });
  });

  test("Collaboration error recovery scenarios", async ({ page }) => {
    await login(page, TEST_USER);

    // Test inviting invalid email
    await page.click('button:has-text("Teams")');
    await page.click('button:has-text("Create Team")');
    await page.fill('input[name="name"]', "Test Team");
    await page.click('button[type="submit"]:has-text("Create Team")');

    await page.click('button:has-text("Invite Member")');
    await page.fill('input[name="email"]', "invalid-email");
    await page.click('button:has-text("Send Invite")');

    await expect(
      page.locator("text=Please enter a valid email address"),
    ).toBeVisible();

    // Test assigning task to non-existent member
    await page.click('button:has-text("Create Task")');
    await page.fill('input[name="title"]', "Test Task");
    await page.click('button[type="submit"]:has-text("Create")');

    await page.click("text=Test Task");
    await page.click('button:has-text("Assign")');
    await page.selectOption(
      'select[name="assignee"]',
      "nonexistent@example.com",
    );
    await page.click('button:has-text("Assign Task")');

    await expect(page.locator("text=User not found")).toBeVisible();
  });
});

test.describe("Team Management", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USER);
  });

  test("Team creation and management", async ({ page }) => {
    // Create multiple teams
    const teams = [
      { name: "Development Team", description: "Main development team" },
      { name: "QA Team", description: "Quality assurance team" },
      { name: "Design Team", description: "UI/UX design team" },
    ];

    for (const team of teams) {
      await page.click('button:has-text("Create Team")');
      await page.fill('input[name="name"]', team.name);
      await page.fill('textarea[name="description"]', team.description);
      await page.click('button[type="submit"]:has-text("Create Team")');
    }

    // Verify all teams are visible
    for (const team of teams) {
      await expect(page.locator(`text="${team.name}"`)).toBeVisible();
    }

    // Test team filtering
    await page.fill('input[placeholder="Search teams"]', "Development");
    await expect(page.locator("text=Development Team")).toBeVisible();
    await expect(page.locator("text=QA Team")).not.toBeVisible();
  });

  test("Team member permissions", async ({ page, context }) => {
    // Create team and invite member
    await page.click('button:has-text("Create Team")');
    await page.fill('input[name="name"]', "Permission Test Team");
    await page.click('button[type="submit"]:has-text("Create Team")');

    await page.click('button:has-text("Invite Member")');
    await page.fill('input[name="email"]', TEST_TEAM_MEMBER.email);
    await page.click('button:has-text("Send Invite")');

    // Team member accepts invitation
    const memberPage = await context.newPage();
    await login(memberPage, TEST_TEAM_MEMBER);
    await memberPage.click('button:has-text("Notifications")');
    await memberPage.click('button:has-text("Accept Invitation")');
    await memberPage.click("text=Permission Test Team");

    // Verify member can see team but has limited permissions
    await expect(memberPage.locator("text=Team Settings")).not.toBeVisible();
    await expect(memberPage.locator("text=Invite Member")).not.toBeVisible();

    // Verify team leader has full permissions
    await expect(page.locator("text=Team Settings")).toBeVisible();
    await expect(page.locator("text=Invite Member")).toBeVisible();

    await memberPage.close();
  });
});
