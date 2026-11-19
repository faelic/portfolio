import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const conversation = JSON.parse(readFileSync(new URL("../fixtures/followup-conversation.json", import.meta.url), "utf8")) as {
  turns: Array<{ question: string; answer: string; suggestion: string }>;
};
const generatedConversation = JSON.parse(readFileSync(new URL("../fixtures/model-followup-conversation.json", import.meta.url), "utf8")) as {
  turns: Array<{ question: string; answer: string; follow_up: { question: string } }>;
};

const question = "What happens if a notification fails?";
const reply = [
  { type: "delta", text: "Monierave uses idempotency keys." },
  { type: "suggestion", question },
  { type: "done", text: "Monierave uses idempotency keys." },
].map(event => JSON.stringify(event) + "\n").join("");

async function open(page: Page) {
  await page.goto("/");
  await expect(page.locator(".desktop")).toHaveClass(/is-entry-ready/);
  await page.getByRole("button", { name: "Assistant", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Message Avartar" })).toBeVisible();
}

async function send(page: Page) {
  await page.getByRole("textbox").fill("How does Monierave prevent duplicates?");
  await page.getByRole("button", { name: "Send message" }).click();
}

test("suggestions keep renewing through eight turns instead of disappearing after the first", async ({ page }) => {
  const requests: Array<{ question: string; history: unknown[]; recent_suggestions?: string[] }> = [];
  await page.route("**/api/chat", route => {
    const turn = conversation.turns[requests.length];
    const body = route.request().postDataJSON();
    requests.push(body);
    expect(body.question).toBe(turn.question);
    expect(body.recent_suggestions ?? []).toHaveLength(Math.min(requests.length - 1, 12));
    return route.fulfill({ contentType: "application/x-ndjson", body: [
      { type: "delta", text: turn.answer }, { type: "suggestion", question: turn.suggestion }, { type: "done", text: turn.answer },
    ].map(event => JSON.stringify(event) + "\n").join("") });
  });
  await open(page);
  const input = page.getByRole("textbox");
  await input.fill(conversation.turns[0].question);
  await page.getByRole("button", { name: "Send message" }).click();
  for (const [index, turn] of conversation.turns.entries()) {
    await expect(input).toHaveAttribute("placeholder", turn.suggestion);
    await expect(input).toHaveValue("");
    await expect(page.locator(".assistant-followup")).toBeVisible();
    await input.focus();
    await input.press("Tab");
    await expect(input).toHaveValue(turn.suggestion);
    expect(await input.evaluate((el: HTMLTextAreaElement) => [el.selectionStart, el.selectionEnd])).toEqual([turn.suggestion.length, turn.suggestion.length]);
    if (index < conversation.turns.length - 1) await input.press("Enter");
  }
  expect(requests).toHaveLength(8);
  expect(requests.map(request => request.history.length)).toEqual([0, 2, 4, 6, 8, 10, 12, 12]);
});

test("twelve model-generated suggestions renew without leaking internal metadata", async ({ page }) => {
  const requests: Array<{ question: string; history: unknown[]; recent_suggestions?: string[] }> = [];
  await page.route("**/api/chat", route => {
    const turn = generatedConversation.turns[requests.length];
    const body = route.request().postDataJSON();
    requests.push(body);
    expect(body.question).toBe(turn.question);
    expect(body.recent_suggestions ?? []).toHaveLength(Math.min(requests.length - 1, 12));
    return route.fulfill({ contentType: "application/x-ndjson", body: [
      { type: "delta", text: turn.answer }, { type: "suggestion", question: turn.follow_up.question }, { type: "done", text: turn.answer },
    ].map(event => JSON.stringify(event) + "\n").join("") });
  });
  await open(page);
  const input = page.getByRole("textbox");
  await input.fill(generatedConversation.turns[0].question);
  await page.getByRole("button", { name: "Send message" }).click();
  for (const [index, turn] of generatedConversation.turns.entries()) {
    await expect(input).toHaveAttribute("placeholder", turn.follow_up.question);
    await expect(input).toHaveValue("");
    await input.focus();
    await input.press("Tab");
    await expect(input).toHaveValue(turn.follow_up.question);
    expect(await input.evaluate((el: HTMLTextAreaElement) => [el.selectionStart, el.selectionEnd])).toEqual([turn.follow_up.question.length, turn.follow_up.question.length]);
    if (index < generatedConversation.turns.length - 1) await input.press("Enter");
  }
  expect(requests).toHaveLength(12);
  expect(requests.every(request => request.history.length <= 12)).toBe(true);
  await expect(page.locator(".assistant")).not.toContainText("evidence_quote");
  await expect(page.locator(".assistant")).not.toContainText("follow_up");
});

test("Tab accepts the whole preview once, leaves the caret at the end, and then resumes normal navigation", async ({ page, browserName }, testInfo) => {
  let calls = 0;
  await page.route("**/api/chat", route => {
    calls++;
    expect(route.request().headers().accept).toBe("application/x-ndjson; suggestions=1");
    return route.fulfill({ contentType: "application/x-ndjson", body: reply });
  });
  await open(page);
  await send(page);
  const preview = page.getByRole("button", { name: `Use suggested question: ${question}` });
  const input = page.getByRole("textbox");
  await expect(preview).toBeVisible();
  await page.getByRole("dialog", { name: "Assistant", exact: true }).screenshot({ path: testInfo.outputPath("preview.png") });
  await expect(input).toHaveValue("");
  await expect(input).toHaveAttribute("placeholder", question);
  const composerBox = (await page.locator(".assistant-composer").boundingBox())!;
  expect((await preview.boundingBox())!.y).toBeGreaterThanOrEqual(composerBox.y + composerBox.height);
  await expect(page.getByRole("button", { name: "Send message" })).toBeDisabled();
  await input.focus();
  await input.press("Enter");
  expect(calls).toBe(1);
  await input.press("Shift+Tab");
  await expect(input).not.toBeFocused();
  await input.focus();
  await input.press("Tab");
  await expect(input).toBeFocused();
  await expect(input).toHaveValue(question);
  expect(await input.evaluate((el: HTMLTextAreaElement) => [el.selectionStart, el.selectionEnd])).toEqual([question.length, question.length]);
  await page.keyboard.type(" Please.");
  await expect(input).toHaveValue(question + " Please.");
  await expect(preview).toHaveCount(0);
  expect(calls).toBe(1);
  await input.press("Tab");
  await expect(input).not.toBeFocused();
  // Safari's native Tab policy can skip buttons unless full keyboard access
  // is enabled. Do not override that policy just to focus Send.
  if (browserName !== "webkit") await expect(page.getByRole("button", { name: "Send message" })).toBeFocused();
  await input.focus();
  await input.press("ControlOrMeta+A");
  await page.keyboard.type("My own question");
  await expect(input).toHaveValue("My own question");
  await page.getByRole("dialog", { name: "Assistant", exact: true }).screenshot({ path: testInfo.outputPath("accepted.png") });
});

test("typing dismisses the preview; Escape dismisses without closing the window", async ({ page }) => {
  await page.route("**/api/chat", route => route.fulfill({ contentType: "application/x-ndjson", body: reply }));
  await open(page);
  await send(page);
  const input = page.getByRole("textbox");
  const preview = page.locator(".assistant-followup");
  await expect(preview).toBeVisible();
  await input.focus();
  await input.press("Escape");
  await expect(preview).toHaveCount(0);
  await expect(page.getByRole("dialog", { name: "Assistant", exact: true })).toBeVisible();
  await send(page);
  await expect(preview).toBeVisible();
  await input.focus();
  await page.keyboard.type("A different direction");
  await expect(input).toHaveValue("A different direction");
  await expect(preview).toHaveCount(0);
  await input.fill("");
  await expect(preview).toHaveCount(0);
});

test("a late suggestion never overwrites a draft and clearing cancels pending suggestions", async ({ page }) => {
  let release!: () => void;
  let calls = 0;
  await page.route("**/api/chat", async route => {
    calls++;
    await new Promise<void>(resolve => { release = resolve; });
    await route.fulfill({ contentType: "application/x-ndjson", body: reply }).catch(() => {});
  });
  await open(page);
  await send(page);
  await expect.poll(() => calls).toBe(1);
  const input = page.getByRole("textbox");
  await input.fill("Keep my draft");
  release();
  await expect(page.getByText("Monierave uses idempotency keys.", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Stop response" })).toHaveCount(0);
  await expect(input).toHaveValue("Keep my draft");
  await expect(page.locator(".assistant-followup")).toHaveCount(0);
  await input.fill("");
  await expect(page.locator(".assistant-followup")).toHaveCount(0);
  await send(page);
  await expect.poll(() => calls).toBe(2);
  await page.getByRole("button", { name: "Clear conversation" }).click();
  release();
  await expect(input).toHaveValue("");
  await expect(page.locator(".assistant-followup")).toHaveCount(0);
  await expect(page.getByText("Monierave uses idempotency keys.", { exact: true })).toHaveCount(0);
});

test.describe("compact touch interaction", () => {
  test.use({ viewport: { width: 360, height: 640 }, isMobile: true, hasTouch: true });
  test("placeholder stays optional; hint tap fills without sending and keyboard viewport stays clear", async ({ page }, testInfo) => {
    let calls = 0;
    await page.route("**/api/chat", route => {
      calls++;
      return route.fulfill({ contentType: "application/x-ndjson", body: reply });
    });
    await open(page);
    await send(page);
    const preview = page.locator(".assistant-followup");
    const input = page.getByRole("textbox");
    await expect(preview).toBeVisible();
    expect((await preview.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await expect(preview.locator("kbd")).toBeHidden();
    await expect(input).toHaveAttribute("placeholder", question);
    await input.tap();
    await expect(input).toHaveValue("");
    await expect(page.getByRole("button", { name: "Send message" })).toBeDisabled();
    expect(calls).toBe(1);
    await page.getByRole("dialog", { name: "Assistant", exact: true }).screenshot({ path: testInfo.outputPath("mobile-preview.png") });
    await preview.tap();
    await expect(input).toHaveValue(question);
    await expect(input).toBeFocused();
    expect(await input.evaluate((el: HTMLTextAreaElement) => [el.selectionStart, el.selectionEnd])).toEqual([question.length, question.length]);
    expect(calls).toBe(1);
    await page.evaluate(() => {
      Object.defineProperty(window.visualViewport, "height", { configurable: true, value: 360 });
      window.visualViewport!.dispatchEvent(new Event("resize"));
    });
    await expect.poll(async () => (await page.locator(".assistant-composer").boundingBox())!.y + (await page.locator(".assistant-composer").boundingBox())!.height).toBeLessThanOrEqual(360);
    expect(await page.getByRole("dialog", { name: "Assistant", exact: true }).evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.getByRole("button", { name: "Send message" }).tap();
    await expect.poll(() => calls).toBe(2);
  });
});
