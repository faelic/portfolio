import { test, expect } from '@playwright/test';
test('studio stays quiet and assistant opens only from an explicit action', async ({ page }) => {
 const requests: string[] = [];
 page.on('request', request => requests.push(request.url()));
 await page.goto('/');
 await expect(page.getByRole('heading', {name:"Hello, I'm Favour and I build backend systems, product interfaces, and AI applications."})).toBeVisible();
 await page.waitForTimeout(900);
 await expect(page.locator('.assistant-invitation,.dock-badge')).toHaveCount(0);
 expect(requests.some(url => /AssistantFeature-|\/api\/chat/.test(url))).toBe(false);
 const assistant = page.getByRole('button', {name:'Assistant',exact:true});
 await assistant.click();
 await expect(page.getByRole('dialog',{name:'Assistant',exact:true})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(assistant).toBeFocused();
 await expect(assistant).not.toHaveClass(/is-running/);
});
