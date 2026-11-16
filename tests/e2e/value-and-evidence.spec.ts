import { test, expect } from "@playwright/test";

test("identity is immediately usable without project images, model or geography requests", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", request => requests.push(request.url()));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Hello, I'm Favour and I build backend systems, product interfaces, and AI applications.", exact: true })).toBeVisible();
  await expect(page.locator(".desktop-intro-avatar img")).toHaveAttribute("src", "/assets/profile/favour-avatar-384.webp");
  await expect(page.getByRole("link", { name: "Contact", exact: true })).toHaveAttribute("href", "mailto:ututufavour7@gmail.com");
  expect(requests.filter(url => /\/assets\/projects\/|\/api\/chat|LocationGlobe-|AssistantFeature-/.test(url))).toEqual([]);
  const opener = page.getByRole("button", { name: "Start with BlockScan", exact: true });
  await opener.click();
  await expect(page.getByRole("dialog", { name: "BlockScan", exact: true })).toBeFocused();
  await expect(page).toHaveURL(/#blockscan$/);
  await page.getByRole("button", { name: "Close window", exact: true }).click();
  await expect(opener).toBeFocused();
});

test("responsive app bounds remain separate from identity and utilities stay reachable", async ({ page }) => {
  test.setTimeout(90_000);
  for (const size of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 1024, height: 768 }, { width: 768, height: 844 }, { width: 767, height: 844 }, { width: 390, height: 844 }, { width: 375, height: 667 }]) {
    await page.setViewportSize(size);
    await page.goto("/");
    const geometry = await page.locator(".desktop-shortcuts").evaluate(area => {
      const bounds = area.getBoundingClientRect();
      const intro = document.querySelector(".desktop-intro")!.getBoundingClientRect();
      return {
        overlap: intro.left < bounds.right && intro.right > bounds.left && intro.top < bounds.bottom && intro.bottom > bounds.top,
        horizontalOverflow: document.querySelector(".desktop")!.scrollWidth > innerWidth + 1,
        iconsInside: [...area.querySelectorAll(".shortcut")].every(icon => { const rect = icon.getBoundingClientRect(); return rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1 && rect.top >= bounds.top - 1 && rect.bottom <= bounds.bottom + 1; }),
      };
    });
    expect(geometry, `${size.width}×${size.height}`).toEqual({ overlap: false, horizontalOverflow: false, iconsInside: true });
    await page.getByRole("button", { name: "Sound off", exact: true }).click();
    await expect(page.getByRole("button", { name: "Sound on", exact: true })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Sound on", exact: true }).click();
  }
});

test("suggested questions require Send and references stay hidden after answers and restoration", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/chat", route => {
    calls++;
    return route.fulfill({ contentType: "application/x-ndjson", body: [
      JSON.stringify({ type: "references", items: [{ id: "project-monierave", title: "Forged label", href: "javascript:alert(1)", sections: ["Transfer integrity"], excerpt: "Selected public passage about transfers." }, { id: "private", excerpt: "Unknown" }] }),
      JSON.stringify({ type: "delta", text: "A grounded example answer." }),
      JSON.stringify({ type: "done", text: "A grounded example answer." }),
    ].join("\n") + "\n" });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Assistant", exact: true }).click();
  await page.getByRole("button", { name: "How does Monierave work?", exact: true }).click();
  await expect(page.getByRole("textbox")).toHaveValue("How does Monierave work?");
  expect(calls).toBe(0);
  await page.getByText("Keep chat history", { exact: true }).click();
  await expect(page.getByRole("switch", { name: "Keep chat history" })).toBeChecked();
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByText("A grounded example answer.", { exact: true })).toBeVisible();
  await expect(page.locator('.assistant')).toHaveCSS('background-color', 'rgb(8, 8, 8)');
  await expect(page.locator('.assistant-message--user .assistant-message-bubble')).toHaveCSS('background-color', 'rgb(28, 43, 53)');
  await expect(page.locator('.assistant-references')).toHaveCount(0);
  await expect(page.getByText('Selected public passage about transfers.', {exact:true})).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: "Assistant", exact: true }).click();
  await expect(page.getByText("A grounded example answer.", { exact: true })).toBeVisible();
  await expect(page.locator(".assistant-references")).toHaveCount(0);
  await page.getByRole("button", { name: "Clear conversation", exact: true }).click();
  await expect(page.getByText("Retrieved references (1)", { exact: true })).toHaveCount(0);
  expect(calls).toBe(1);
});
