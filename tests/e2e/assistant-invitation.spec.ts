import { test, expect, type Page } from '@playwright/test';

const trackBounce = async (page: Page) => {
 await page.addInitScript(() => {
  const state = window as unknown as Window & {assistantBounceCount:number};
  state.assistantBounceCount=0;
  const original=Element.prototype.animate;
  Element.prototype.animate=function(keyframes,options) {
   const animation=original.call(this,keyframes,options);
   if(this.matches('.dock-hit--assistant .dock-artwork')) state.assistantBounceCount++;
   return animation;
  };
 });
};

test('desktop shows Assistant and bounces once without opening chat', async ({ page, isMobile }, info) => {
 await trackBounce(page);
 const requests: string[] = [];
 page.on('request', request => requests.push(request.url()));
 await page.goto('/');
 await expect(page.getByRole('heading', {name:"Hello, I'm Favour and I build backend systems, product interfaces, and AI applications."})).toBeVisible();
 await page.waitForTimeout(900);
 await expect(page.locator('.assistant-invitation,.dock-badge')).toHaveCount(0);
 expect(requests.some(url => /AssistantFeature-|\/api\/chat/.test(url))).toBe(false);
 const assistant = page.getByRole('button', {name:'Assistant',exact:true});
 if (!isMobile) {
  expect(await page.evaluate(()=>(window as unknown as Window & {assistantBounceCount:number}).assistantBounceCount)).toBe(1);
  await expect(assistant).toHaveClass(/has-entry-label/);
  await expect(assistant.locator('.dock-tooltip')).toHaveCSS('opacity', '1');
  await expect(assistant.locator('.dock-tooltip')).toHaveText('Assistant');
  await expect(page.getByRole('dialog',{name:'Assistant',exact:true})).toHaveCount(0);
  await expect(assistant).not.toHaveClass(/is-running/);
  await page.screenshot({path:info.outputPath('assistant-desktop-entry.png')});
 }
 await assistant.click();
 await expect(page.getByRole('dialog',{name:'Assistant',exact:true})).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(assistant).toBeFocused();
 await expect(assistant).not.toHaveClass(/is-running/);
 await expect(assistant).not.toHaveClass(/has-entry-label/);
 await page.mouse.move(0,0);
 await page.reload();
 await expect(assistant).not.toHaveClass(/has-entry-label/);
});

test('mobile bounces once when the icon enters view, without loading or opening chat', async ({ page }, info) => {
 await page.setViewportSize({width:390,height:568});
 await trackBounce(page);
 const requests:string[]=[];
 page.on('request',request=>requests.push(request.url()));
 await page.goto('/');
 const count=()=>page.evaluate(()=>(window as unknown as Window & {assistantBounceCount:number}).assistantBounceCount);
 await expect.poll(count).toBe(1);
 const assistant=page.getByRole('button',{name:'Assistant',exact:true});
 await assistant.scrollIntoViewIfNeeded();
 await expect.poll(count).toBe(1);
 await expect(assistant.locator('.dock-tooltip')).toHaveCSS('display','none');
 await expect(page.getByRole('dialog',{name:'Assistant',exact:true})).toHaveCount(0);
 await expect(assistant).not.toHaveClass(/is-running/);
 expect(requests.some(url=>/AssistantFeature-|\/api\/chat/.test(url))).toBe(false);
 await page.screenshot({path:info.outputPath('assistant-mobile-entry.png')});
 await page.evaluate(()=>window.scrollTo(0,0));
 await assistant.scrollIntoViewIfNeeded();
 expect(await count()).toBe(1);
 await page.reload();
 await assistant.scrollIntoViewIfNeeded();
 expect(await count()).toBe(0);
});

test('mobile reduced motion and denied storage remain quiet and usable',async({page})=>{
 await page.setViewportSize({width:390,height:568});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.addInitScript(()=>{
  Object.defineProperty(window,'sessionStorage',{get(){throw new DOMException('Denied');}});
 });
 await page.goto('/');
 const assistant=page.getByRole('button',{name:'Assistant',exact:true});
 await assistant.scrollIntoViewIfNeeded();
 await expect(assistant.locator('.dock-tooltip')).toHaveCSS('display','none');
 expect(await assistant.locator('.dock-artwork').evaluate(el=>el.getAnimations().length)).toBe(0);
 await expect(page.getByRole('dialog',{name:'Assistant',exact:true})).toHaveCount(0);
 await assistant.click();
 await expect(page.getByRole('dialog',{name:'Assistant',exact:true})).toBeVisible();
});
