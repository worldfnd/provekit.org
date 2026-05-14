import { chromium } from '@playwright/test';

const url = 'https://provekit.atheon.xyz/benchmarks';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));

await page.goto(url);
await page.waitForFunction(() =>
  document.querySelector('[data-demo-status-label]')?.textContent?.trim() === 'READY'
);
console.log('READY reached');

console.log('\n--- click GENERATE PROOF (SHA) ---');
await page.click('[data-demo-go]');
try {
  await page.waitForFunction(
    () => {
      const t = document.querySelector('[data-demo-status-label]')?.textContent?.trim();
      return t === 'DONE' || t === 'ERROR';
    },
    { timeout: 120_000 },
  );
} catch (_) {}
const sha = await page.evaluate(() => ({
  status: document.querySelector('[data-demo-status-label]')?.textContent?.trim(),
  goLabel: document.querySelector('[data-demo-go-label]')?.textContent?.trim(),
  total: document.querySelector('[data-demo-kpi="total"]')?.textContent?.trim(),
  size: document.querySelector('[data-demo-kpi="size"]')?.textContent?.trim(),
  constraints: document.querySelector('[data-demo-kpi="constraints"]')?.textContent?.trim(),
}));
console.log('SHA-256 result:', JSON.stringify(sha, null, 2));

console.log('\n--- switch to Poseidon ---');
await page.click('[data-demo-circuit="poseidon"]');
await page.waitForTimeout(500);
const swapped = await page.evaluate(() =>
  document.querySelector('[data-demo-statement]')?.textContent?.trim(),
);
console.log('Poseidon statement:', swapped);

console.log('\n--- console snapshot after SHA ---');
console.log(logs.slice(-15).join('\n'));
await browser.close();
