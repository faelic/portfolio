import { expect, test } from "@playwright/test";

test.use({ timezoneId: "Africa/Lagos" });
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("favour.boot-seen.v1", "true"));
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:4173\/)/, route => route.abort());
});

test("Avartar shows the portrait, thinking state, aligned bubbles, and local message times", async ({ page, isMobile }, testInfo) => {
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/chat", async route => {
    await pending;
    await route.fulfill({ contentType: "application/x-ndjson", body:
      '{"type":"delta","text":"Hi! How can I help?"}\n{"type":"done","text":"Hi! How can I help?"}\n',
    });
  });
  await page.clock.setFixedTime(new Date("2026-11-12T12:27:00.000Z"));
  await page.goto("/");
  await expect(page.locator(".desktop")).not.toHaveClass(/is-booting/);
  await expect(page.locator(".dock-icon--avatar img")).toBeVisible();
  await expect.poll(() => page.locator(".dock-icon--avatar img").evaluate((element: HTMLImageElement) => element.naturalWidth)).toBe(96);
  await page.getByRole("button", { name: "Assistant", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Assistant", exact: true });
  await expect(dialog).toBeVisible();
  await expect(page.locator(".assistant-welcome-portrait img")).toBeVisible();
  const keep = page.getByRole("switch", { name: "Keep chat history" });
  await expect(keep).not.toBeChecked();
  await keep.focus();
  await keep.press("Space");
  await expect(keep).toBeChecked();
  await page.getByRole("textbox", { name: "Message Avartar" }).fill("Hi");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator(".assistant-thinking")).toHaveText("Avartar is thinking…");
  await expect(page.locator(".assistant-message--user time")).toHaveText("13:27");
  await expect(page.locator(".assistant-message--assistant time")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".assistant-thinking-dots")).toHaveCSS("animation-name", "none");
  const historyLabel = await page.locator(".assistant-history").boundingBox();
  expect(historyLabel!.height).toBeGreaterThanOrEqual(44);
  await dialog.screenshot({ path: testInfo.outputPath("avartar-thinking.png"), animations: "disabled" });
  await page.clock.setFixedTime(new Date("2026-11-12T12:28:00.000Z"));
  release();
  await expect(page.getByText("Hi! How can I help?", { exact: true })).toBeVisible();
  await expect(page.locator(".assistant-thinking")).toHaveCount(0);
  await expect(page.locator(".assistant-message--assistant .assistant-message-label")).toHaveText("Avartar");
  await expect(page.locator(".assistant-message--assistant time")).toHaveText("13:28");
  await expect(page.locator(".assistant-message--assistant .portrait-avatar img")).toBeVisible();
  const user = await page.locator(".assistant-message--user .assistant-message-bubble").boundingBox();
  const assistant = await page.locator(".assistant-message--assistant .assistant-message-bubble").boundingBox();
  expect(user!.x).toBeGreaterThan(assistant!.x);
  expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  await dialog.screenshot({ path: testInfo.outputPath("avartar-conversation.png"), animations: "disabled" });
  if (isMobile) {
    await page.setViewportSize({ width: 320, height: 568 });
    await expect(dialog).toBeVisible();
    expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
    await dialog.screenshot({ path: testInfo.outputPath("avartar-small-mobile.png"), animations: "disabled" });
  }
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("favour.assistant-history.v1") || "[]").length)).toBe(2);
  await page.reload();
  await page.getByRole("button", { name: "Assistant", exact: true }).click();
  await expect(page.locator(".assistant-message--user time")).toHaveText("13:27");
  await expect(page.locator(".assistant-message--assistant time")).toHaveText("13:28");
  await page.getByRole("dialog", { name: "Assistant", exact: true }).getByRole("button", { name: "Close window" }).click();
  await page.getByRole("button", { name: "About me", exact: true }).click();
  const about = page.getByRole("dialog", { name: "About me", exact: true });
  await expect(about.locator(".identity-avatar img")).toBeVisible();
  await expect.poll(() => about.locator(".identity-avatar img").evaluate((element: HTMLImageElement) => element.naturalWidth)).toBe(384);
  await about.screenshot({ path: testInfo.outputPath("avartar-about-portrait.png"), animations: "disabled" });
});

test("legacy history stays readable and portrait failures have a safe fallback", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("favour.assistant-keep-history.v1", "true");
    localStorage.setItem("favour.assistant-history.v1", JSON.stringify([
      { id: "old-user", role: "user", text: "An older question", status: "complete" },
      { id: "old-answer", role: "assistant", text: "An older answer", status: "complete" },
    ]));
  });
  await page.route("**/assets/profile/favour-avatar-*.webp", route => route.abort());
  await page.goto("/");
  await expect(page.locator(".desktop")).not.toHaveClass(/is-booting/);
  await page.getByRole("button", { name: "Assistant", exact: true }).click();
  await expect(page.getByText("An older answer", { exact: true })).toBeVisible();
  await expect(page.locator(".assistant-message time")).toHaveCount(0);
  await expect(page.locator(".assistant-message-portrait .image-fallback")).toBeVisible();
});
