import { test, expect } from '@playwright/test';

test('mobile header, utilities and dock stay separate and tappable across short screens', async ({ page }, info) => {
  test.setTimeout(90_000);
  for (const viewport of [
    { width: 320, height: 568 }, { width: 360, height: 640 }, { width: 375, height: 667 },
    { width: 390, height: 660 }, { width: 390, height: 844 }, { width: 430, height: 932 },
    { width: 667, height: 375 }, { width: 720, height: 450 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('.boot-preloader')).toHaveCount(0);
    const header = await page.locator('.studio-header').evaluate(el => {
      const [brand, status] = [...el.children].map(child => child.getBoundingClientRect());
      return Math.abs((brand.top + brand.height / 2) - (status.top + status.height / 2));
    });
    expect(header, JSON.stringify(viewport)).toBeLessThanOrEqual(1);
    await page.locator('.studio-footer').scrollIntoViewIfNeeded();
    const geometry = await page.locator('.studio-footer').evaluate(footer => {
      const rect = (selector: string) => document.querySelector(selector)!.getBoundingClientRect();
      const utilities = rect('.desktop-utilities');
      const dock = rect('.dock-hit-area');
      const buttons = [...footer.querySelectorAll<HTMLElement>('button, a')];
      return {
        utilitiesAboveDock: utilities.bottom + 8 <= dock.top,
        contentAboveFooter: rect('.studio-content').bottom + 8 <= footer.getBoundingClientRect().top,
        scrollNeeded: document.querySelector('.studio-content')!.scrollHeight > document.querySelector('.studio-content')!.clientHeight + 1,
        pageScroll: document.documentElement.scrollHeight > innerHeight + 1,
        portrait: rect('.desktop-intro-avatar').width,
        projectIcon: rect('.shortcut-thumbnail').width,
        summarySize: getComputedStyle(document.querySelector('.desktop-intro-summary')!).fontSize,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        allTargetsReachable: buttons.every(button => {
          const b = button.getBoundingClientRect();
          const hit = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
          return b.width >= 44 && b.height >= 44 && b.left >= 0 && b.right <= innerWidth
            && b.top >= 0 && b.bottom <= innerHeight && !!hit && button.contains(hit);
        }),
        footerFixed: getComputedStyle(footer).position === 'fixed',
        rootOverflow: getComputedStyle(document.documentElement).overflowY,
        desktopOverscroll: getComputedStyle(document.querySelector('.desktop')!).overscrollBehaviorY,
      };
    });
    expect(geometry, JSON.stringify(viewport)).toEqual({
      utilitiesAboveDock: true, contentAboveFooter: true, overflow: false,
      allTargetsReachable: true, footerFixed: true,
      scrollNeeded: viewport.height < 640 || viewport.width < 360, pageScroll: false,
      portrait: 56, projectIcon: 64, summarySize: '17px',
      rootOverflow: 'visible', desktopOverscroll: 'auto',
    });
    if (geometry.scrollNeeded) {
      const lastProject = page.getByRole('button', { name: 'Open Escrow', exact: true });
      await lastProject.scrollIntoViewIfNeeded();
      const project = await lastProject.boundingBox();
      const content = await page.locator('.studio-content').boundingBox();
      expect(project!.y).toBeGreaterThanOrEqual(content!.y - 1);
      expect(project!.y + project!.height).toBeLessThanOrEqual(content!.y + content!.height + 1);
    }
    if (viewport.width === 320 || viewport.height === 844) {
      await page.screenshot({ path: info.outputPath(`mobile-footer-${viewport.width}x${viewport.height}.png`), fullPage: true });
    }
    await page.getByRole('button', { name: 'Desktop settings', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Desktop settings', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('button', { name: 'Desktop settings', exact: true })).toBeFocused();
  }
});

test('mobile footer follows browser-height changes without moving or shrinking its controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 760 });
  await page.goto('/');
  for (const height of [660, 844, 700]) {
    await page.setViewportSize({ width: 390, height });
    const footer = await page.locator('.studio-footer').boundingBox();
    expect(footer!.y + footer!.height).toBeCloseTo(height - 12, 0);
    const content = await page.locator('.studio-content').boundingBox();
    expect(content!.y + content!.height).toBeLessThan(footer!.y);
    await expect(page.locator('.desktop-intro-avatar')).toHaveCSS('width', '56px');
    await expect(page.getByRole('button', { name: 'Desktop settings', exact: true })).toHaveCSS('width', '44px');
  }
});

test('entry stays immediately usable while portrait and fonts are stalled', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.route(/favour-avatar-384\.webp|\.woff2(?:\?.*)?$/, async route => {
    await gate;
    await route.continue();
  });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.boot-preloader')).toHaveCount(0);
    await expect(page.locator('main')).not.toHaveAttribute('inert');
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible();
    expect(requests.filter(url => /\/assets\/projects\/|\/api\/chat|AssistantFeature-/.test(url))).toEqual([]);
    await page.getByRole('button', { name: 'Start with BlockScan', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'BlockScan', exact: true })).toBeFocused();
  } finally { release(); }
});
