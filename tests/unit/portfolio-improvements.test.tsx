import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { DesktopIntro } from "../../src/components/desktop/DesktopIntro";
import { ProjectWindow } from "../../src/components/windows/ProjectWindow";
import { projects } from "../../src/data/projects";
import { legacyLayoutKey, migrateLayout, sanitizeLayout } from "../../src/state/layout";
import { loadProjectOrder, orderStorageKey, studioOrder } from "../../src/state/studioLayout";
import { useDesktopLayout } from "../../src/hooks/useDesktopLayout";
import { validReferences } from "../../src/components/assistant/references";
import { HISTORY_KEY, KEEP_HISTORY_KEY, loadChat, modelHistory } from "../../src/components/assistant/history";
import { streamChat } from "../../src/components/assistant/stream";

it("opens the featured project with its real opener and presents an immediately usable identity", () => {
  const open = vi.fn();
  render(<DesktopIntro onOpen={open} />);
  expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Hello, I'm Favour and I build backend systems, product interfaces, and AI applications.");
  const primary = screen.getByRole("button", { name: "Start with Monierave" });
  fireEvent.click(primary);
  expect(open).toHaveBeenCalledWith("champ", primary);
  expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute("href", "mailto:ututufavour7@gmail.com");
  expect(screen.queryByRole("link", { name: /résumé/ })).not.toBeInTheDocument();
});

it("migrates legacy layouts without destroying originals and reset does not resurrect them", () => {
  const original = { champ: { x: 30, y: 40 } };
  localStorage.setItem(legacyLayoutKey("desktop"), JSON.stringify(original));
  const expected = loadProjectOrder("desktop");
  const view = renderHook(() => useDesktopLayout("desktop"));
  expect(view.result.current.order).toEqual(expected);
  expect(localStorage.getItem(legacyLayoutKey("desktop"))).toBe(JSON.stringify(original));
  act(() => view.result.current.reset());
  view.unmount();
  const reloaded = renderHook(() => useDesktopLayout("desktop"));
  expect(reloaded.result.current.order).toEqual(studioOrder);
  expect(JSON.parse(localStorage.getItem(orderStorageKey("desktop"))!)).toEqual(studioOrder);
  const mobile = migrateLayout({ champ: { x: 36, y: 27 }, silences: { x: 4, y: 27 } }, "mobile");
  expect(Object.keys(mobile)).toHaveLength(6);
  expect(sanitizeLayout(mobile, "mobile")).toEqual(mobile);
  expect(migrateLayout({ champ: { x: 999, y: 999 } }, "mobile")).toEqual({});
});

it("restores the original featured image and project story with source links", () => {
  render(<ProjectWindow project={projects.champ} />);
  expect(screen.getByRole("link", {name: "GitHub"})).toHaveAttribute("href", projects.champ.repoUrl);
  expect(screen.getByRole("heading", {name: "How it works"})).toBeVisible();
  expect(screen.getByAltText(projects.champ.images[0].alt)).toHaveAttribute("src", projects.champ.images[0].src);
  expect(screen.queryByRole("group", {name: "Choose screenshot"})).not.toBeInTheDocument();
});

it("canonicalizes public destinations and bounds untrusted reference metadata", () => {
  const [reference] = validReferences([{ id: "project-monierave", title: "Forged", href: "javascript:alert(1)", excerpt: "A public passage", sections: ["Transfers"] }]);
  expect(reference.title).toBe("Monierave");
  expect(reference.href).toBe("https://www.favourututu.com/#monierave");
  expect(validReferences([{ id: "__proto__", excerpt: "bad" }])).toEqual([]);
  expect(validReferences([{ id: "private-path", excerpt: "bad" }])).toEqual([]);
  expect(validReferences([{ id: "project-monierave", excerpt: "x".repeat(401) }])).toEqual([]);
});

it("receives references across split stream frames, restores them and excludes them from model history", async () => {
  const items = [{ id: "project-monierave", excerpt: "A public passage", sections: ["Transfers"] }];
  const wire = new TextEncoder().encode([JSON.stringify({ type: "references", items }), JSON.stringify({ type: "delta", text: "Answer" }), JSON.stringify({ type: "done", text: "Answer" })].join("\n"));
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new ReadableStream({ start(controller) { for (const byte of wire) controller.enqueue(new Uint8Array([byte])); controller.close(); } }), { headers: { "content-type": "application/x-ndjson" } })));
  const references = vi.fn();
  await expect(streamChat("Question", [], new AbortController().signal, () => {}, references)).resolves.toBe("Answer");
  localStorage.setItem(KEEP_HISTORY_KEY, "true");
  localStorage.setItem(HISTORY_KEY, JSON.stringify([{ id: "u", role: "user", text: "Question", status: "complete" }, { id: "a", role: "assistant", text: "Answer", status: "complete", references: references.mock.calls[0][0] }]));
  const restored = loadChat().messages;
  expect(restored[1].references?.[0].title).toBe("Monierave");
  expect(modelHistory(restored)).toEqual([{ role: "user", content: "Question" }, { role: "assistant", content: "Answer" }]);
});

it("accepts many valid frames coalesced by a proxy while retaining a per-frame bound", async () => {
  const wire = new TextEncoder().encode(Array.from({ length: 1000 }, () => JSON.stringify({ type: "delta", text: "a" })).join("\n") + "\n" + JSON.stringify({ type: "done", text: "a".repeat(1000) }) + "\n");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(new ReadableStream({ start(controller) { controller.enqueue(wire); controller.close(); } }), { headers: { "content-type": "application/x-ndjson" } })));
  await expect(streamChat("Question", [], new AbortController().signal, () => {})).resolves.toBe("a".repeat(1000));
});
