export const TEST_USER = {
  email: "test@example.com",
  password: "TestPassword123!",
  name: "Test User",
};

export const TEST_TEAM_MEMBER = {
  email: "member@example.com",
  password: "MemberPassword123!",
  name: "Team Member",
};

export async function login(page, user = TEST_USER) {
  await page.goto("/login");
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}

export async function registerUser(page, user) {
  await page.goto("/register");
  await page.fill('input[name="name"]', user.name);
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
}

export async function logout(page) {
  await page.click('button:has-text("Logout")');
  await page.waitForURL("/login");
}
