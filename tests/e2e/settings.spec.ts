import {test,expect} from '@playwright/test';
test('settings save preferences, keep muted volume silent, trap focus, and restore the launcher',async({page},info)=>{
 await page.goto('/');
 const gear=page.getByRole('button',{name:'Desktop settings',exact:true});await gear.click();
 const modal=page.getByRole('dialog',{name:'Desktop settings'});
 await expect(modal).toBeVisible();await expect(page.getByRole('radio',{name:'Drag',exact:true})).toBeChecked();
 await expect(modal.getByRole('switch',{name:'Interface sounds'})).not.toBeChecked();
 const slider=modal.getByRole('slider',{name:'Volume'});await expect(slider).toHaveValue('20');
 await slider.press('Home');for(let i=0;i<65;i++) await slider.press('ArrowRight');await expect(modal.getByText('65%',{exact:true})).toBeVisible();
 await expect(modal.getByRole('switch',{name:'Interface sounds'})).not.toBeChecked();
 await expect(modal.getByRole('button',{name:'Play sample'})).toHaveCount(0);
 await expect(modal.getByText('Saved volume',{exact:true})).toBeVisible();
 await expect(modal.locator('.arrangement-demo')).toHaveAttribute('aria-label',/drag an app/i);
 await page.getByRole('radio',{name:'Arrow controls'}).check();
 await expect(modal.locator('.arrangement-demo')).toHaveAttribute('aria-label',/one slot/);
 await slider.focus();await page.keyboard.press('Tab');
 expect(await modal.evaluate(node=>node.contains(document.activeElement))).toBe(true);
 await modal.screenshot({path:info.outputPath('settings.png')});
 await page.keyboard.press('Escape');await expect(modal).toHaveCount(0);await expect(gear).toBeFocused();
 await page.reload();await gear.click();await expect(slider).toHaveValue('65');await expect(page.getByRole('radio',{name:'Arrow controls'})).toBeChecked();
 await modal.getByRole('switch',{name:'Interface sounds'}).check();
 await expect(modal.getByRole('button',{name:'Play sample'})).toBeVisible();
 await expect(slider).not.toHaveClass(/is-muted/);await page.keyboard.press('Escape');
 await expect(page.getByRole('button',{name:'Sound on',exact:true})).toHaveAttribute('aria-pressed','true');
});
test('arrangement closes settings, saves swaps, and offers reset undo',async({page})=>{
 await page.goto('/');const gear=page.getByRole('button',{name:'Desktop settings',exact:true});await gear.click();
 await page.getByRole('radio',{name:'Arrow controls'}).check();await page.getByRole('button',{name:'Rearrange apps',exact:true}).click();
 await expect(page.getByRole('dialog',{name:'Desktop settings'})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Select Monierave',exact:true})).toBeFocused();
 await page.getByRole('button',{name:'Move selected app right'}).click();await page.getByRole('button',{name:'Done',exact:true}).click();
 const moved=await page.locator('[data-project="champ"]').boundingBox();await gear.click();await page.getByRole('button',{name:'Reset to default'}).click();
 await expect(page.getByRole('button',{name:'Reset to default'})).toHaveCount(0);await page.getByRole('button',{name:'Undo reset'}).click();
 await page.keyboard.press('Escape');expect((await page.locator('[data-project="champ"]').boundingBox())!.x).toBeCloseTo(moved!.x,0);
 await gear.click();await page.getByRole('radio',{name:'Drag',exact:true}).check();await page.getByRole('button',{name:'Rearrange apps',exact:true}).click();
 await expect(page.getByRole('button',{name:'Move selected app right'})).toHaveCount(0);
 await page.locator('[data-project="champ"]').press('ArrowLeft');await page.keyboard.press('Enter');await expect(gear).toBeFocused();
});

test('demonstration remains static with reduced motion and does not rearrange real apps',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 const original=await page.locator('[data-project="champ"]').boundingBox();
 await page.getByRole('button',{name:'Desktop settings',exact:true}).click();
 const demo=page.locator('.arrangement-demo');await expect(demo).toHaveClass(/demo--static/);
 await page.getByRole('radio',{name:'Arrow controls'}).check();
 await expect(demo.locator('.demo-app--0')).toHaveCSS('animation-name','none');
 await page.keyboard.press('Escape');expect((await page.locator('[data-project="champ"]').boundingBox())!.x).toBeCloseTo(original!.x,0);
});
