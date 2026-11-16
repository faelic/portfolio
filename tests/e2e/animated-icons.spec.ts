import { expect, test } from '@playwright/test';

test('Contact keeps its envelope shape and opens the flap on hover or focus', async ({ page, isMobile }, info) => {
  await page.goto('/');
  const contact = page.getByRole('link', { name: 'Contact', exact: true });
  const flap = contact.locator('[data-envelope-flap]');
  const closed = 'M4 7L12 13L20 7';
  const open = 'M4 7L12 1L20 7';
  await expect(contact.locator('rect')).toHaveAttribute('rx', '3');
  await expect(flap).toHaveAttribute('d', closed);
  if (!isMobile) {
    await contact.hover();
    await expect(flap).toHaveAttribute('d', open);
    await page.mouse.move(0, 0);
    await expect(flap).toHaveAttribute('d', closed);
  }
  await contact.focus();
  await expect(flap).toHaveAttribute('d', open);
  await page.screenshot({ path: info.outputPath('contact-envelope-open.png') });
  await page.getByRole('button', { name: 'Start with BlockScan', exact: true }).focus();
  await expect(flap).toHaveAttribute('d', closed);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await contact.focus();
  await expect(contact.locator('svg')).toHaveAttribute('data-animation', 'reduced');
  await expect(flap).toHaveAttribute('d', closed);
  await expect(contact).toHaveAttribute('href', 'mailto:ututufavour7@gmail.com');
});

test('animated controls preserve sound state, keyboard activation and reduced motion', async ({ page, isMobile }) => {
  await page.goto('/');
  await expect(page.locator('.boot-preloader')).toHaveCount(0);
  const contact = page.getByRole('link', { name: 'Contact', exact: true });
  await expect(contact.locator('.animated-icon--envelope')).toBeVisible();
  await expect(contact).toHaveAttribute('href', /^mailto:/);
  const muted = page.getByRole('button', { name: 'Sound off', exact: true });
  await muted.scrollIntoViewIfNeeded();
  if (!isMobile) {
    await muted.hover();
    await expect(muted.locator('.animated-icon--volume-off')).toBeVisible();
    await expect(muted).toHaveAttribute('aria-pressed', 'false');
  }
  await muted.click();
  const sound = page.getByRole('button', { name: 'Sound on', exact: true });
  await expect(sound.locator('.animated-icon--volume')).toBeVisible();
  await sound.press('Space');
  await expect(muted.locator('.animated-icon--volume-off')).toBeVisible();

  const settings = page.getByRole('button', { name: 'Desktop settings', exact: true });
  await settings.focus();
  await expect(settings).toBeFocused();
  await expect(settings.locator('svg')).toHaveAttribute('data-animation', 'active');
  await settings.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Desktop settings', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(settings.locator('svg')).toHaveAttribute('data-animation', 'reduced');
  await expect(settings.locator('g')).toHaveCSS('transform', 'none');
  await page.getByRole('button', { name: 'Start with BlockScan', exact: true }).click();
  const next = page.getByRole('button', { name: 'Next project Cleanup', exact: true });
  await expect(next.locator('.animated-icon--arrow-right')).toBeAttached();
  await next.click();
  await expect(page.getByRole('dialog', { name: 'Cleanup', exact: true })).toBeFocused();
});

test('assistant history switch, animated send/delete and immediate Stop retain their behavior', async ({ page }, info) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/api/chat', async route => {
    await gate;
    await route.fulfill({ contentType: 'application/x-ndjson', body: JSON.stringify({ type: 'done', text: 'Fixture answer.' }) + '\n' }).catch(() => {});
  });
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Assistant', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Assistant', exact: true });
    const history = page.getByRole('switch', { name: 'Keep chat history', exact: true });
    await history.focus(); await history.press('Space');
    await expect(history).toBeChecked();
    const clear = page.getByRole('button', { name: 'Clear conversation', exact: true });
    await expect(clear).toBeDisabled();
    const send = page.getByRole('button', { name: 'Send message', exact: true });
    await expect(send).toBeDisabled();
    await page.getByRole('textbox').fill('What does Favour build?');
    await send.focus();
    await expect(send).toBeFocused();
    await expect(send.locator('.animated-icon--send')).toHaveAttribute('data-animation', 'active');
    await dialog.screenshot({ path: info.outputPath('assistant-animated-controls.png') });
    await send.press('Enter');
    const stop = page.getByRole('button', { name: 'Stop response', exact: true });
    await expect(stop).toBeVisible();
    await expect(stop.locator('.animated-icon')).toHaveCount(0);
    await stop.click();
    await expect(send).toBeVisible();
    await expect(stop).toHaveCount(0);
    await expect(clear).toBeEnabled();
    await clear.focus();
    await expect(clear.locator('.animated-icon--trash')).toHaveAttribute('data-animation', 'active');
    await clear.press('Enter');
    await expect(page.getByRole('heading', { name: "Hi! I'm Favour's assistant", exact: true })).toBeVisible();
    await expect(clear).toBeDisabled();
    await expect(history).toBeChecked();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('.assistant-history-track')).toHaveCSS('transition-duration', '0s');
  } finally { release(); }
});

test('unavailable animation features leave visible icons and working controls', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', error => failures.push(error.message));
  await page.route('**/assets/features-*.js', route => route.abort());
  await page.goto('/');
  await expect(page.locator('.boot-preloader')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Contact', exact: true }).locator('svg')).toBeVisible();
  await page.getByRole('button', { name: 'Desktop settings', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Desktop settings', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Start with BlockScan', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'BlockScan', exact: true })).toBeFocused();
  expect(failures).toEqual([]);
});
