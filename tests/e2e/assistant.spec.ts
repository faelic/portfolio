import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem("favour.boot-seen.v1", "true"));
});
const open = async (page: import("@playwright/test").Page) => {
  await page.goto("/");
  await expect(page.locator(".desktop")).not.toHaveClass(/is-booting/);
  await page.getByRole("button", { name: "Assistant", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Assistant", exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Message Avartar" })).toBeVisible();
};
const answer = (text: string) => `${JSON.stringify({ type: "delta", text })}\n${JSON.stringify({ type: "done", text })}\n`;

test("assistant loads on demand, keeps contextual chat, and inherits window behavior", async ({ page, isMobile }, testInfo) => {
  const requests: Array<{ question: string; history: unknown[] }> = [];
  let assistantLoaded = false;
  let releaseModule!: () => void;
  const moduleGate = new Promise<void>(resolve => { releaseModule = resolve; });
  await page.route("**/assets/AssistantFeature-*.js", async route => {
    await moduleGate;
    await route.continue();
  });
  page.on("request", request => { if (request.url().includes("/assets/AssistantFeature-")) assistantLoaded = true; });
  await page.route("**/api/chat", route => {
    const body = route.request().postDataJSON();
    requests.push(body);
    return route.fulfill({ contentType: "application/x-ndjson", body: answer(body.history.length ? "His contribution was frontend engineering." : "Favour builds backend systems, frontend applications, AI applications, and blockchain tools.") });
  });
  await page.goto("/");
  await expect(page.locator(".desktop")).not.toHaveClass(/is-booting/);
  expect(assistantLoaded).toBe(false);
  await page.getByRole("button", { name: "Assistant", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Assistant", exact: true });
  await expect(page.getByText("Opening assistant…", { exact: true })).toBeVisible();
  await expect(dialog).toBeFocused();
  const openingShell = await dialog.elementHandle();
  releaseModule();
  await expect(page.getByRole("heading", { name: "Hi! I'm Favour's assistant" })).toBeVisible();
  await expect(dialog).toBeFocused();
  expect(await dialog.evaluate((node, original) => node === original, openingShell)).toBe(true);
  expect(requests).toHaveLength(0);
  await dialog.screenshot({ path: testInfo.outputPath("assistant-empty.png") });
  const input = page.getByRole("textbox", { name: "Message Avartar" });
  await input.fill("What does Favour build?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Favour builds backend systems, frontend applications, AI applications, and blockchain tools.")).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Answer complete." })).toBeAttached();
  await dialog.screenshot({ path: testInfo.outputPath("assistant-conversation.png") });
  expect(await page.evaluate(() => localStorage.getItem("favour.assistant-history.v1"))).toBeNull();
  await input.fill("What was his contribution there?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("His contribution was frontend engineering.")).toBeVisible();
  expect(requests[1].history).toHaveLength(2);
  await dialog.getByRole("button", { name: "Close window" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Assistant", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Assistant", exact: true }).click();
  await expect(page.getByText("His contribution was frontend engineering.")).toBeVisible();
  if (!isMobile) {
    await dialog.getByRole("button", { name: "Expand window" }).click();
    await expect(dialog).toHaveClass(/is-expanded/);
    await dialog.getByRole("button", { name: "Restore window" }).click();
  } else {
    await expect.poll(async () => (await dialog.boundingBox())!.width).toBe(page.viewportSize()!.width);
    await expect(page.getByRole("button", { name: "About me", exact: true })).toHaveCount(0);
  }
  expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  if (isMobile) {
    await page.evaluate(() => {
      Object.defineProperty(window.visualViewport, "height", { configurable: true, value: 420 });
      window.visualViewport!.dispatchEvent(new Event("resize"));
    });
    await expect.poll(async () => (await dialog.boundingBox())!.height).toBe(420);
    const composer = await page.locator(".assistant-composer").boundingBox();
    expect(composer!.y + composer!.height).toBeLessThanOrEqual(420);
  }
});

test("saved chat can be restored, disabled, and cleared", async ({ page }) => {
  await page.route("**/api/chat", route => route.fulfill({ contentType: "application/x-ndjson", body: answer("Saved answer.") }));
  await open(page);
  await page.getByRole("switch", { name: "Keep chat history" }).focus();
  await page.getByRole("switch", { name: "Keep chat history" }).press("Space");
  await page.getByRole("textbox").fill("Remember this conversation");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Saved answer.")).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("favour.assistant-history.v1") || "[]").length)).toBe(2);
  await open(page);
  await expect(page.getByText("Saved answer.")).toBeVisible();
  await page.getByRole("switch").focus();
  await page.getByRole("switch").press("Space");
  await expect.poll(() => page.evaluate(() => localStorage.getItem("favour.assistant-history.v1"))).toBeNull();
  await expect(page.getByText("Saved answer.")).toBeVisible();
  await page.getByRole("button", { name: "Clear conversation" }).click();
  await expect(page.getByText("Saved answer.")).toHaveCount(0);
});

test("unavailable service preserves drafts and malicious output cannot load remote content", async ({ page }) => {
  let tracking = false;
  page.on("request", request => { if (request.url().includes("tracker.invalid")) tracking = true; });
  await page.route("**/api/chat", route => route.fulfill({ status: 503, body: "unavailable" }));
  await open(page);
  await page.getByRole("textbox").fill("Tell me about Favour");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("alert")).toContainText("unavailable");
  await expect(page.getByRole("textbox")).toHaveValue("Tell me about Favour");
  await page.unroute("**/api/chat");
  await page.route("**/api/chat", route => route.fulfill({ contentType: "application/x-ndjson", body: answer('<script>window.unsafe = true</script>\n\n![tracking](https://tracker.invalid/pixel)\n\n[unsafe](javascript:alert(1)) [phishing](https://evil.example/) [Repository](https://github.com/faelic/monierave) **Safe text**') }));
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Safe text", { exact: true })).toBeVisible();
  await expect(page.getByRole('link',{name:'Repository'})).toHaveAttribute('href','https://github.com/faelic/monierave');
  await expect(page.getByRole('link',{name:'phishing'})).toHaveCount(0);
  await expect(page.getByText('phishing',{exact:true})).toBeVisible();
  expect(await page.locator(".assistant-answer img, .assistant script, .assistant iframe").count()).toBe(0);
  expect(tracking).toBe(false);
  expect(await page.evaluate(() => "unsafe" in window)).toBe(false);
});

test("a failed assistant module stays inside its window", async ({ page }) => {
  await page.route("**/assets/AssistantFeature-*.js", route => route.abort());
  await page.goto("/");
  await expect(page.locator(".desktop")).not.toHaveClass(/is-booting/);
  await page.getByRole("button", { name: "Assistant", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("couldn’t load");
  await page.getByRole("dialog", { name: "Assistant", exact: true }).getByRole("button", { name: "Close window" }).click();
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Notes", exact: true })).toBeVisible();
});
