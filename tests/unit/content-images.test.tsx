import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { ResilientImage } from "../../src/components/shared/ResilientImage";
import { NotesWindow } from "../../src/components/windows/NotesWindow";
import { notes } from "../../src/data/notes";
import { profile } from "../../src/data/profile";

it("preserves evidence labels after an image fails and retries when source changes", () => {
  const { rerender } = render(<ResilientImage src="/one.png" alt="Project preview" fallbackLabel="Monierave screenshot" />);
  fireEvent.error(screen.getByAltText("Project preview"));
  expect(screen.getByText("Preview unavailable")).toBeVisible();
  expect(screen.getByRole("img", { name: "Monierave screenshot" })).toBeVisible();
  rerender(<ResilientImage src="/two.png" alt="New preview" fallbackLabel="Other screenshot" />);
  expect(screen.getByAltText("New preview")).toHaveAttribute("src", "/two.png");
});
it("uses each note's authoritative date in preview and reader, with keyboard tabs", () => {
  render(<NotesWindow />);
  expect(screen.getAllByText(notes.about.date)).toHaveLength(2);
  fireEvent.keyDown(screen.getByRole("tab", { name: /About/ }), { key: "Home" });
  expect(screen.getByRole("tab", { name: /Experience/ })).toHaveAttribute("aria-selected", "true");
  expect(screen.getAllByText(notes.experience.date)).toHaveLength(2);
});
it("aligns public positioning and records a planned assistant without changing project evidence", () => {
  expect(profile.position).toBe("Software Engineer");
  expect(profile.biography.join(" ")).toContain("currently learning agentic AI");
  const html = readFileSync("index.html", "utf8");
  expect(html).not.toContain("Backend-Focused");
  const knowledge = readFileSync("rag/knowledge/portfolio/assistant-status.md", "utf8");
  expect(knowledge).toContain("not available yet");
  expect(knowledge).toContain("not implemented yet");
  expect(knowledge).not.toContain("He uses these ideas in the AI assistant on his portfolio");
});
