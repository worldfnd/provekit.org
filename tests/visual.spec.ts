import { test, expect } from '@playwright/test';

test('renders all sections without horizontal scroll', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Client-side zero-knowledge');
  await expect(page.locator('#install-title')).toBeVisible();
  await expect(page.locator('#features-title')).toBeAttached();
  await expect(page.locator('#credit-title')).toBeVisible();
  await expect(page.locator('#benchmarks-title')).toBeVisible();
  await expect(page.locator('#faq-title')).toBeVisible();

  const hasHorizontalScroll = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalScroll).toBe(false);
});

test('faq toggles open and closed', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('details').first();
  await expect(first).toHaveAttribute('open', '');
  await first.locator('summary').click();
  await expect(first).not.toHaveAttribute('open', '');
});
