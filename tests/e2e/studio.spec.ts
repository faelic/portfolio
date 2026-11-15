import { test, expect } from '@playwright/test';

test('project hover and keyboard focus do not show previews or fetch screenshots', async ({ page, isMobile }) => {
 const requests: string[] = [];
 page.on('request', r => requests.push(r.url()));
 await page.goto('/');
 const icon = page.locator('[data-project="champ"]');
 if (!isMobile) await icon.hover();
 await icon.focus();
 await page.waitForTimeout(450);
 await expect(page.getByRole('tooltip')).toHaveCount(0);
 expect(requests.filter(url => url.includes('/assets/projects/'))).toEqual([]);
 await icon.press('Enter');
 await expect(page.getByRole('dialog', {name:'Monierave',exact:true})).toBeFocused();
});

test('case journey reuses one window, preserves geometry, and supports Back and Forward', async ({ page }) => {
 await page.goto('/');
 await page.getByRole('button',{name:'Start with Monierave',exact:true}).click();
 const dialog = page.locator('.window--project');
 await expect(dialog).toBeFocused();
 await dialog.evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished.catch(() => {}))));
 const before = await dialog.boundingBox();
 await dialog.getByRole('button',{name:/Next project Policy.ng/}).click();
 await expect(page).toHaveURL(/#policyng$/);
 await expect(dialog).toHaveCount(1);
 await expect(dialog).toHaveAttribute('aria-label','Policy.ng');
 const after = await dialog.boundingBox();
 expect(after!.x).toBeCloseTo(before!.x,0); expect(after!.width).toBeCloseTo(before!.width,0);
 await expect(dialog.locator('.project-scroll-panel')).toHaveJSProperty('scrollTop',0);
 await page.goBack();
 await expect(dialog).toHaveAttribute('aria-label','Monierave');
 await expect(dialog).toHaveCount(1);
 await page.goForward();
 await expect(dialog).toHaveAttribute('aria-label','Policy.ng');
 for (const title of ['BucketFlow','BlockScan','Cleanup','Escrow']) {
   await dialog.getByRole('button',{name:new RegExp(`Next project ${title}`)}).click();
   await expect(dialog).toHaveAttribute('aria-label',title);
 }
 await expect(dialog.getByRole('button',{name:'Back to desktop',exact:true})).toHaveCount(0);
 await dialog.getByRole('button',{name:'Close window',exact:true}).click();
 await expect(dialog).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Open Escrow',exact:true})).toBeFocused();
});

test('utilities reflect saved state and running indicators reflect real windows', async ({ page, isMobile }) => {
 await page.goto('/');
 const sound = page.getByRole('button',{name:'Sound off',exact:true});
 await expect(sound.locator('svg')).toBeVisible();
 await expect(sound).toHaveAttribute('aria-pressed','false');
 await sound.click(); await page.reload();
 await expect(page.getByRole('button',{name:'Sound on',exact:true})).toHaveAttribute('aria-pressed','true');
 const notes = page.getByRole('button',{name:'Notes',exact:true});
 await notes.click();
 if (!isMobile) await expect(notes).toHaveClass(/is-running/);
 await page.keyboard.press('Escape');
 await expect(notes).toBeFocused(); await expect(notes).not.toHaveClass(/is-running/);
});

test('interrupted close and resize settle without ghost windows', async ({ page, isMobile }) => {
 await page.goto('/#monierave');
 const dialog=page.getByRole('dialog',{name:'Monierave',exact:true});
 await expect(dialog).toBeVisible();
 await page.keyboard.press('Escape');
 await page.setViewportSize({width:isMobile?400:1300,height:800});
 await expect(dialog).toHaveCount(0);
 const icon=page.getByRole('button',{name:'Open Monierave',exact:true});
 await icon.press('Enter');
 await expect(dialog).toBeFocused();
 await page.keyboard.press('Escape');
 if (!isMobile) {
  await icon.press('Enter');
  await expect(dialog).toBeVisible();
 }
});

test('wide studio fits its first viewport and compact reflow stays readable', async ({ page }) => {
 for (const viewport of [{width:1440,height:900},{width:1280,height:720},{width:720,height:450}]) {
  await page.setViewportSize(viewport); await page.goto('/');
  const bounds=await page.evaluate(()=> {
    const apps=document.querySelector('.desktop-shortcuts')!.getBoundingClientRect();
    const dock=document.querySelector('.dock-hit-area')!.getBoundingClientRect();
    const intro=document.querySelector('.desktop-intro')!.getBoundingClientRect();
    return {apps:{top:apps.top,bottom:apps.bottom},dock:{top:dock.top,bottom:dock.bottom},intro:{top:intro.top,bottom:intro.bottom},overflow:document.querySelector('.desktop')!.scrollWidth>innerWidth+1};
  });
  expect(bounds.overflow).toBe(false); expect(bounds.apps.top).toBeGreaterThan(bounds.intro.bottom);
  if(viewport.width>=1200) { expect(bounds.apps.bottom).toBeLessThan(bounds.dock.top); expect(bounds.dock.bottom).toBeLessThanOrEqual(viewport.height); }
 }
});


test('native assistive activation opens a project and restores its real launcher', async ({ page }) => {
 await page.goto('/');
 const launcher = page.locator('[data-project="champ"]');
 await launcher.evaluate((button: HTMLButtonElement) => button.click());
 const dialog = page.getByRole('dialog', { name: 'Monierave', exact: true });
 await expect(dialog).toBeFocused();
 await expect(dialog).toHaveCount(1);
 await dialog.getByRole('button', { name: 'Close window', exact: true }).click();
 await expect(launcher).toBeFocused();
});

test('project window uses side-by-side visuals on desktop and stacked mobile reading',async({page,isMobile},info)=>{
 await page.goto('/#monierave');const dialog=page.getByRole('dialog',{name:'Monierave',exact:true});
 await expect(dialog).toBeFocused();await dialog.evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished.catch(()=>{}))));
 const visual=dialog.locator('.project-featured-column');const reading=dialog.locator('.project-window-story');
 const v=await visual.boundingBox(),r=await reading.boundingBox();
 if(isMobile) { await expect(dialog.locator('.project-case-layout')).toHaveCSS('flex-direction','column'); } else expect(v!.x+v!.width).toBeLessThan(r!.x);
 await expect(dialog.getByRole('button',{name:/Ask AI/})).toHaveCount(0);
 await expect(dialog.getByRole('heading',{name:'How it works',exact:true})).toBeVisible();
 await dialog.screenshot({path:info.outputPath('two-column-project.png')});
 await dialog.getByRole('button',{name:/Next project Policy.ng/}).click();await expect(dialog).toHaveCount(0);
 await expect(page.getByRole('dialog',{name:'Policy.ng',exact:true})).toBeFocused();
});

test('window controls stay circular and mobile navigation follows all content',async({page,isMobile})=>{
 await page.goto('/');await expect(page.getByText('Available',{exact:true})).toBeVisible();
 await page.goto('/#policyng');const dialog=page.getByRole('dialog',{name:'Policy.ng',exact:true});await expect(dialog).toBeFocused();
 await dialog.evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished.catch(()=>{}))));
 await expect(dialog.locator('.traffic-light--minimize')).toHaveCount(0);
 const close=await dialog.getByRole('button',{name:'Close window',exact:true}).boundingBox();expect(close!.width).toBeCloseTo(close!.height,0);
 if(isMobile){
  await dialog.locator('.project-sequence').scrollIntoViewIfNeeded();
  const nav=await dialog.locator('.project-sequence').boundingBox();
  const stack=await dialog.locator('.project-window-stack').boundingBox();
  const links=await dialog.locator('.project-window-links').boundingBox();
  expect(nav!.y).toBeGreaterThanOrEqual(stack!.y+stack!.height);
  expect(nav!.y).toBeGreaterThanOrEqual(links!.y+links!.height);
 }
});
