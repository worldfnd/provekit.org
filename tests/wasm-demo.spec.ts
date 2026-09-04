import { expect, test } from '@playwright/test';

test('generates and verifies a real ProveKit WASM proof', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name === 'chromium-mobile' || testInfo.project.name === 'chromium-tablet',
    'The proof workflow runs once per browser engine; responsive coverage runs separately.',
  );
  const browserErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });
  page.on('pageerror', (error) => browserErrors.push(error.message));

  await page.goto('/benchmarks');

  // The threaded WASM runtime requires cross-origin isolation. This assertion
  // also protects the deployment headers in vercel.json from being removed:
  // without them production silently falls back to a much slower single thread.
  await expect.poll(() => page.evaluate(() => self.crossOriginIsolated)).toBe(true);

  const status = page.locator('[data-demo-status-label]');
  const generate = page.locator('[data-demo-go]');
  await generate.scrollIntoViewIfNeeded();
  await expect(status).toHaveText('READY');
  await expect(generate).toBeEnabled();
  await expect(page.locator('[data-demo-status-info]')).not.toContainText(/· 1 thread$/);

  await generate.click();

  await expect.poll(() => status.textContent()).toMatch(/^(VERIFIED|ERROR)$/);
  const runtimeError = await page.locator('.pk-demo-status').getAttribute('data-error');
  expect(runtimeError, `${testInfo.project.name} proof workflow failed`).toBeNull();
  expect(browserErrors, `${testInfo.project.name} emitted browser errors`).toEqual([]);
  await expect(status).toHaveText('VERIFIED');
  await expect(page.locator('[data-demo-kpi="size"]')).not.toHaveText('…');
  const parseDurationMs = (duration: string) => {
    const value = Number.parseFloat(duration);
    return duration.endsWith(' s') ? value * 1000 : value;
  };
  const totalMs = parseDurationMs(await page.locator('[data-demo-kpi="total"]').innerText());
  const perHashMs = parseDurationMs(await page.locator('[data-demo-kpi="per-hash"]').innerText());
  // Both values are formatted independently; second-based values are rounded
  // to 10 ms, so allow the resulting display-level rounding difference.
  expect(Math.abs(perHashMs - totalMs / 17)).toBeLessThanOrEqual(6);
  await expect(page.locator('[data-demo-hash]')).toHaveClass(/is-revealed/);
});
