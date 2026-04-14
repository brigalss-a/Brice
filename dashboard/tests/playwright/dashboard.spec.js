// Playwright dashboard test stub
// Real tests planned, not yet implemented.
const { test, expect } = require('@playwright/test');

test('dashboard login and protected UI', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[placeholder="workspace"]', 'e2e-dash');
  await page.fill('input[placeholder="email"]', 'dash@e2e.com');
  await page.fill('input[placeholder="password"]', 'pw');
  await page.click('button:has-text("Register")');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(1000);
  // Should see summary and persona library
  await expect(page.locator('h2', { hasText: 'Summary' })).toBeVisible();
  await expect(page.locator('h2', { hasText: 'Persona Library' })).toBeVisible();
});

test('dashboard SSE events and job status', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[placeholder="workspace"]', 'e2e-dash');
  await page.fill('input[placeholder="email"]', 'dash2@e2e.com');
  await page.fill('input[placeholder="password"]', 'pw');
  await page.click('button:has-text("Register")');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(1000);
  // Queue a simulation job
  await page.click('button:has-text("Queue Simulation")');
  await page.waitForTimeout(2000);
  // Should see job status and events
  await expect(page.locator('h2', { hasText: 'Events' })).toBeVisible();
  await expect(page.locator('h2', { hasText: 'Claims' })).toBeVisible();
  await expect(page.locator('div', { hasText: 'Job Status:' })).toBeVisible();
});

test('dashboard shows SSE error state', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[placeholder="workspace"]', 'e2e-dash');
  await page.fill('input[placeholder="email"]', 'dash3@e2e.com');
  await page.fill('input[placeholder="password"]', 'pw');
  await page.click('button:has-text("Register")');
  await page.waitForTimeout(1000);
  await page.click('button:has-text("Login")');
  await page.waitForTimeout(1000);
  // Simulate SSE disconnect
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await page.waitForTimeout(500);
  await expect(page.locator('div', { hasText: 'SSE connection lost' })).toBeVisible();
});
