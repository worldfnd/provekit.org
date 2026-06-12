import { test, expect } from '@playwright/test';

test('renders all sections', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Client-side zero-knowledge');
  await expect(page.locator('#install-title')).toBeAttached();
  await expect(page.locator('#features-title')).toBeAttached();
  await expect(page.locator('#credit-title')).toBeAttached();
  await expect(page.locator('#benchmarks-title')).toBeAttached();
  await expect(page.locator('#faq-title')).toBeAttached();
});

test('no horizontal scroll at desktop', async ({ page }, testInfo) => {
  // Site is designed at a fixed 1600px width; only assert no-scroll on desktop viewports.
  test.skip(
    (testInfo.project.use.viewport?.width ?? 0) < 1440,
    'Fixed-width design; mobile/tablet responsive adaptation is out of scope here.',
  );
  await page.goto('/');
  const hasHorizontalScroll = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(hasHorizontalScroll).toBe(false);
});

test('faq toggles open and closed', async ({ page }) => {
  await page.goto('/');
  const trigger = page.locator('[data-pk-faq-trigger]').first();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});
