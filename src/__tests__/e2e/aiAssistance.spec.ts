import { test, expect } from '@playwright/test';
import { TEST_USER, login } from './utils/auth';

test.describe('AI Assistance Flow', () => {
  test('AI assistance: Create task with natural language → Get suggestions → Apply suggestions', async ({ page }) => {
    await login(page, TEST_USER);

    // Step 1: Create task with natural language
    await test.step('Create task using natural language', async () => {
      await page.click('button:has-text("AI Assistant")');
      await page.click('button:has-text("Create Task with AI")');

      await page.fill('textarea[name="naturalLanguageInput"]',
        'Create a comprehensive project plan for website redesign including research, design, development, and testing phases with appropriate deadlines');

      await page.click('button:has-text("Generate Task")');
      await expect(page.locator('text=Analyzing your request')).toBeVisible();
      await expect(page.locator('text=Task suggestions generated')).toBeVisible();
    });

    // Step 2: Review and apply AI suggestions
    await test.step('Review and apply AI suggestions', async () => {
      // Verify AI suggestions are displayed
      await expect(page.locator('text=Suggested Task Title')).toBeVisible();
      await expect(page.locator('text=Suggested Description')).toBeVisible();
      await expect(page.locator('text=Suggested Priority')).toBeVisible();

      // Apply AI suggestions
      await page.click('button:has-text("Apply All Suggestions")');
      await expect(page.locator('text=Task created with AI assistance')).toBeVisible();

      // Verify task was created with AI suggestions
      await expect(page.locator('text=Website Redesign Project Plan')).toBeVisible();
      await expect(page.locator('text=Comprehensive project plan')).toBeVisible();
    });

    // Step 3: Get additional AI suggestions
    await test.step('Get additional AI suggestions', async () => {
      await page.click('text=Website Redesign Project Plan');
      await page.click('button:has-text("AI Suggestions")');

      await expect(page.locator('text=Generating additional suggestions')).toBeVisible();
      await expect(page.locator('text=Additional suggestions')).toBeVisible();

      // Apply specific suggestion
      await page.click('button:has-text("Apply Suggestion")');
      await expect(page.locator('text=Suggestion applied successfully')).toBeVisible();
    });
  });

  test('AI assistance error recovery', async ({ page }) => {
    await login(page, TEST_USER);
    await page.click('button:has-text("AI Assistant")');

    // Test with empty input
    await page.click('button:has-text("Create Task with AI")');
    await page.click('button:has-text("Generate Task")');

    await expect(page.locator('text=Please enter a description for AI to analyze')).toBeVisible();

    // Test with very short input
    await page.fill('textarea[name="naturalLanguageInput"]', 'test');
    await page.click('button:has-text("Generate Task")');

    await expect(page.locator('text=Please provide more details for better suggestions')).toBeVisible();

    // Test successful generation after fixing
    await page.fill('textarea[name="naturalLanguageInput"]',
      'Create a task for implementing user authentication with email/password and social login options');
    await page.click('button:has-text("Generate Task")');

    await expect(page.locator('text=Task suggestions generated')).toBeVisible();
  });

  test('AI task breakdown and prioritization', async ({ page }) => {
    await login(page, TEST_USER);
    await page.click('button:has-text("AI Assistant")');

    // Test complex task breakdown
    await page.click('button:has-text("Breakdown Complex Task")');
    await page.fill('textarea[name="complexTaskInput"]',
      'Plan and execute a complete marketing campaign for our new product launch including market research, content creation, social media strategy, influencer outreach, and performance tracking');

    await page.click('button:has-text("Breakdown Task")');
    await expect(page.locator('text=Analyzing complex task')).toBeVisible();
    await expect(page.locator('text=Task breakdown complete')).toBeVisible();

    // Verify breakdown results
    await expect(page.locator('text=Suggested Subtasks')).toBeVisible();
    await expect(page.locator('text=Recommended Timeline')).toBeVisible();
    await expect(page.locator('text=Priority Suggestions')).toBeVisible();

    // Apply breakdown
    await page.click('button:has-text("Create All Subtasks")');
    await expect(page.locator('text=Subtasks created successfully')).toBeVisible();
  });
});

test.describe('AI Performance and Integration', () => {
  test('AI assistance with different task types', async ({ page }) => {
    await login(page, TEST_USER);
    await page.click('button:has-text("AI Assistant")');

    const testCases = [
      {
        input: 'Schedule a team meeting for project kickoff next Monday at 10 AM',
        expected: 'Team Meeting'
      },
      {
        input: 'Create a bug fix task for the login page authentication issue',
        expected: 'Bug Fix'
      },
      {
        input: 'Plan quarterly review and performance evaluation process',
        expected: 'Quarterly Review'
      }
    ];

    for (const testCase of testCases) {
      await page.click('button:has-text("Create Task with AI")');
      await page.fill('textarea[name="naturalLanguageInput"]', testCase.input);
      await page.click('button:has-text("Generate Task")');
      await expect(page.locator(`text=${testCase.expected}`)).toBeVisible();
      await page.click('button:has-text("Cancel")');
    }
  });

  test('AI suggestion customization', async ({ page }) => {
    await login(page, TEST_USER);
    await page.click('button:has-text("AI Assistant")');
    await page.click('button:has-text("Create Task with AI")');

    await page.fill('textarea[name="naturalLanguageInput"]',
      'Create a documentation task for API endpoints');

    await page.click('button:has-text("Generate Task")');
    await expect(page.locator('text=Task suggestions generated')).toBeVisible();

    // Customize suggestions before applying
    await page.fill('input[name="customTitle"]', 'Custom API Documentation Task');
    await page.selectOption('select[name="customPriority"]', 'high');
    await page.click('button:has-text("Apply Custom Suggestions")');

    await expect(page.locator('text=Custom API Documentation Task')).toBeVisible();
    await expect(page.locator('text=High Priority')).toBeVisible();
  });
});