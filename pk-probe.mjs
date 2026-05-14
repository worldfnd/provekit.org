import { chromium } from '@playwright/test';

const url = process.argv[2] || 'https://provekit.atheon.xyz/benchmarks';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
page.on('requestfailed', (req) =>
  logs.push(`[reqfail] ${req.url()} :: ${req.failure()?.errorText}`),
);
page.on('response', (res) => {
  if (res.status() >= 400) logs.push(`[${res.status()}] ${res.url()}`);
});

await page.goto(url, { waitUntil: 'load' });
console.log('=== first console flush (4s) ===');
await page.waitForTimeout(4000);
console.log(logs.join('\n'));

console.log('\n=== snapshot ===');
const data = await page.evaluate(() => {
  const txt = (sel) => document.querySelector(sel)?.textContent?.trim() ?? null;
  return {
    statusLabel: txt('[data-demo-status-label]'),
    statusInfo: txt('[data-demo-status-info]'),
    goLabel: txt('[data-demo-go-label]'),
    coi: globalThis.crossOriginIsolated,
    sab: typeof SharedArrayBuffer !== 'undefined',
    hc: navigator.hardwareConcurrency,
  };
});
console.log(JSON.stringify(data, null, 2));

console.log('\n=== waiting another 10s for ready ===');
await page.waitForTimeout(10000);
const data2 = await page.evaluate(() => {
  const txt = (sel) => document.querySelector(sel)?.textContent?.trim() ?? null;
  return {
    statusLabel: txt('[data-demo-status-label]'),
    goLabel: txt('[data-demo-go-label]'),
  };
});
console.log(JSON.stringify(data2, null, 2));
console.log('\n=== full console after 14s ===');
console.log(logs.join('\n'));

await browser.close();
