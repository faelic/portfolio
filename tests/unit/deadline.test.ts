import { expect, it, vi } from "vitest";
import { withDeadline } from "../../src/utils/withDeadline";
it("settles a stalled optional import with a bounded failure", async () => {
  vi.useFakeTimers();
  const result = expect(withDeadline(new Promise(() => {}))).rejects.toThrow("too long");
  await vi.advanceTimersByTimeAsync(10_000);
  await result;
  vi.useRealTimers();
});
it("clears the import watchdog on success and propagates rejection", async () => {
  vi.useFakeTimers();
  await expect(withDeadline(Promise.resolve("module"))).resolves.toBe("module");
  expect(vi.getTimerCount()).toBe(0);
  await expect(withDeadline(Promise.reject(new Error("Download failed")))).rejects.toThrow("Download failed");
  expect(vi.getTimerCount()).toBe(0);
  vi.useRealTimers();
});
