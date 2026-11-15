import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const label = process.argv[2] ?? 'after';
const entryOnly = process.argv.includes('--entry-only');
const browser = await chromium.launch({ channel: "chromium", args: ['--use-angle=swiftshader', '--enable-webgl'] });
const results = [];
for (const mobile of [false, true]) {
  for (let run = 1; run <= 3; run++) {
    const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 720 }, isMobile: mobile, hasTouch: mobile });
    await context.addInitScript(() => {
      window.__frames = 0;
      const original = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = callback => original(time => { window.__frames++; callback(time); });
    });
    const page = await context.newPage();
    let mapRequests = 0;
    page.on('request', request => { if (/openfreemap|maplibre.org/.test(request.url())) mapRequests++; });
    const started = Date.now();
    await page.goto('http://127.0.0.1:4173/');
    await page.locator('.desktop:not(.is-booting)').waitFor();
    const entryMs = Date.now() - started;
    const entryResources = await page.evaluate(() => performance.getEntriesByType('resource').map(r => ({ name: r.name.split('/').pop(), transfer: r.transferSize, decoded: r.decodedBodySize })));
    if (entryOnly) {
      results.push({ profile: mobile ? 'mobile-touch' : 'desktop', run, entryMs, entryResources });
      await context.close();
      continue;
    }
    const aboutStarted = Date.now();
    await page.getByRole('button', { name: 'About me', exact: true }).click();
    await page.getByRole('heading', { name: 'About me', exact: true }).waitFor();
    await page.waitForTimeout(2000);
    const requestsBeforeScroll = mapRequests;
    const beforeFrames = await page.evaluate(() => window.__frames);
    await page.waitForTimeout(1000);
    const offscreenFrames = await page.evaluate(() => window.__frames) - beforeFrames;
    await page.locator('.location-block').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Explore globe', exact: true }).click();
    let mapState = 'timeout';
    try {
      await page.locator('.is-map-ready, .has-map-error, .globe-failure').first().waitFor({ timeout: 12000 });
      mapState = await page.locator('.is-map-ready').count() ? 'ready' : 'unavailable';
    } catch { /* Recorded as timeout rather than fabricated timing. */ }
    const mapElapsedMs = Date.now() - aboutStarted;
    const resources = await page.evaluate(() => performance.getEntriesByType('resource').map(r => ({ name: r.name.split('/').pop(), transfer: r.transferSize, decoded: r.decodedBodySize })));
    results.push({ profile: mobile ? 'mobile-touch' : 'desktop', run, entryMs, requestsBeforeScroll, offscreenFramesPerSecond: offscreenFrames, mapElapsedMs, mapState, mapRequests, entryResources, resources });
    await context.close();
  }
}
await browser.close();
const output = `/private/tmp/portfolio-performance-${label}.json`;
await writeFile(output, JSON.stringify({ label, environment: 'Chromium headless, local production preview, unthrottled loopback, fresh browser context per run; external map network is uncontrolled', results }, null, 2));
console.log(output);
console.table(results.map(({ profile, run, entryMs, requestsBeforeScroll, offscreenFramesPerSecond, mapElapsedMs, mapState, mapRequests }) => ({ profile, run, entryMs, requestsBeforeScroll, offscreenFramesPerSecond, mapElapsedMs, mapState, mapRequests })));
