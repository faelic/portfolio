// Capture real, current UI. No generated artwork, AI calls, or visitor content.
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const target = new URL(process.argv[2] ?? 'http://127.0.0.1:4173/');
if (!['127.0.0.1', 'localhost'].includes(target.hostname) || target.pathname !== '/' || target.search || target.hash) {
  throw new Error('Use the root of a local portfolio preview server.');
}
const output = resolve('public/og/favour-studio-v5.png');
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.origin !== target.origin || url.pathname.startsWith('/api/') ? route.abort() : route.continue();
  });
  await page.goto(target.href, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Start with BlockScan', exact: true }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.desktop-home img').evaluateAll(async images => {
    await Promise.all(images.map(image => image.decode()));
    if (images.some(image => !image.naturalWidth)) throw new Error('Landing artwork did not load.');
  });
  const geometry = await page.evaluate(() => {
    const selectors = ['.studio-header', '.desktop-intro', '.desktop-shortcuts', '.dock-hit-area'];
    return document.querySelectorAll('.desktop-shortcuts .shortcut').length === 6 && selectors.every(selector => {
      const box = document.querySelector(selector).getBoundingClientRect();
      return box.left >= 0 && box.top >= 0 && box.right <= innerWidth && box.bottom <= innerHeight;
    });
  });
  if (!geometry) throw new Error('The full studio must fit within the social preview.');
  await mkdir(resolve('public/og'), { recursive: true });
  await page.screenshot({ path: output, animations: 'disabled' });
  process.stdout.write(`Captured current studio: ${output} (1200×630)\n`);
} finally {
  await browser.close();
}
