import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import AssistantFeature, { type AssistantFrameProps } from "../../src/components/assistant/AssistantFeature";
import { completedMessages, HISTORY_KEY, KEEP_HISTORY_KEY, loadChat, modelHistory, type ChatMessage } from "../../src/components/assistant/history";
import { streamChat } from "../../src/components/assistant/stream";

const encoder = new TextEncoder();
const frame: AssistantFrameProps = {
  window: { key: "assistant", expanded: false, zIndex: 111 }, kind: "assistant", title: "Assistant", active: true,
  register: () => {}, onClose: () => {}, onFocus: () => {}, onMove: () => {}, onToggleExpanded: () => {},
};
function response(text: string, pieces = 7) {
  const bytes = encoder.encode(text);
  return new Response(new ReadableStream({ start(controller) {
    for (let index = 0; index < bytes.length; index += pieces) controller.enqueue(bytes.slice(index, index + pieces));
    controller.close();
  } }), { headers: { "content-type": "application/x-ndjson" } });
}
const done = (text: string) => `${JSON.stringify({ type: "delta", text })}\n${JSON.stringify({ type: "done", text })}\n`;
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  Element.prototype.scrollTo = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
});

it("decodes split JSON and Unicode, and uses the authoritative terminal answer", async () => {
  vi.mocked(fetch).mockResolvedValue(response('{"type":"delta","text":" Hi 👋 "}\n{"type":"done","text":"Hi 👋"}', 1));
  const seen: string[] = [];
  await expect(streamChat("Hello", [], new AbortController().signal, text => seen.push(text))).resolves.toBe("Hi 👋");
  expect(seen).toEqual([" Hi 👋 ", "Hi 👋"]);
});

it("delivers optional suggestions only after a valid completed stream", async () => {
  const suggested = vi.fn();
  const metadata = JSON.stringify({ type: "suggestion", question: "What happens if a notification fails?" }) + "\n";
  vi.mocked(fetch).mockResolvedValue(response(metadata + done("Monierave uses idempotency."), 1));
  await streamChat("Monierave?", [], new AbortController().signal, () => {}, undefined, suggested);
  expect(suggested).toHaveBeenCalledExactlyOnceWith("What happens if a notification fails?");
  expect(vi.mocked(fetch).mock.calls[0][1]?.headers).toHaveProperty("Accept", "application/x-ndjson; suggestions=1");
  suggested.mockClear();
  vi.mocked(fetch).mockResolvedValue(response(metadata + '{"type":"delta","text":"partial"}\n'));
  await expect(streamChat("Monierave?", [], new AbortController().signal, () => {}, undefined, suggested)).rejects.toThrow();
  expect(suggested).not.toHaveBeenCalled();
  for (const question of ["x".repeat(121), "Bad\nquestion", ""]) {
    vi.mocked(fetch).mockResolvedValue(response(JSON.stringify({ type: "suggestion", question }) + "\n" + done("Valid answer.")));
    await streamChat("Question", [], new AbortController().signal, () => {}, undefined, suggested);
    expect(suggested).not.toHaveBeenCalled();
  }
});

it("rejects truncated, malformed, oversized, and failed streams without leaking payloads", async () => {
  for (const text of ['{"type":"delta","text":"partial"}\n', 'PRIVATE invalid JSON\n', done("x".repeat(2001))]) {
    vi.mocked(fetch).mockResolvedValue(response(text));
    await expect(streamChat("Hello", [], new AbortController().signal, () => {})).rejects.toThrow(/connection ended/);
  }
  vi.mocked(fetch).mockResolvedValue(response('{"type":"error","code":"timeout","message":"Please try again."}\n'));
  await expect(streamChat("Hello", [], new AbortController().signal, () => {})).rejects.toThrow("Please try again.");
  vi.mocked(fetch).mockResolvedValue(new Response("busy", { status: 429 }));
  await expect(streamChat("Hello", [], new AbortController().signal, () => {})).rejects.toThrow(/busy/);
});

it("saves only completed pairs and sends at most six exchanges for context", () => {
  const messages: ChatMessage[] = Array.from({ length: 60 }, (_, index) => ([
    { id: `${index}-u`, role: "user" as const, text: `Q${index}`, status: "complete" as const },
    { id: `${index}-a`, role: "assistant" as const, text: `A${index}`, status: index === 59 ? "interrupted" as const : "complete" as const },
  ])).flat();
  expect(completedMessages(messages)).toHaveLength(100);
  expect(modelHistory(messages)).toHaveLength(12);
  expect(modelHistory(messages).at(-1)?.content).toBe("A58");
  localStorage.setItem(KEEP_HISTORY_KEY, "true");
  localStorage.setItem(HISTORY_KEY, JSON.stringify([{ role: "system", text: "Untrusted" }]));
  expect(loadChat().messages).toEqual([]);
});

it('renders unknown model links as text while keeping approved repository links clickable', async () => {
  vi.mocked(fetch).mockResolvedValue(response(done('[Repository](https://github.com/faelic/monierave) and [Untrusted](https://evil.example/)')));
  render(<AssistantFeature frame={frame} />);
  fireEvent.change(screen.getByRole('textbox'), {target:{value:'Show the repository'}});
  fireEvent.click(screen.getByRole('button',{name:'Send message'}));
  expect(await screen.findByRole('link',{name:'Repository'})).toHaveAttribute('href','https://github.com/faelic/monierave');
  expect(screen.getByText('Untrusted')).toBeVisible();
  expect(screen.queryByRole('link',{name:'Untrusted'})).not.toBeInTheDocument();
});

it('makes approved bare URLs clickable without linking unknown URLs or code', async () => {
  vi.mocked(fetch).mockResolvedValue(response(done('Repository: https://github.com/faelic/monierave. Live: (https://monierave.favourututu.com/). Unknown: https://evil.example/ and https://github.com/attacker/project. Code: `https://github.com/faelic/bucketflow`')));
  render(<AssistantFeature frame={frame} />);
  fireEvent.change(screen.getByRole('textbox'), {target:{value:'Give me my project links'}});
  fireEvent.click(screen.getByRole('button',{name:'Send message'}));
  expect(await screen.findByRole('link',{name:'https://github.com/faelic/monierave'})).toHaveAttribute('href','https://github.com/faelic/monierave');
  expect(screen.getByRole('link',{name:'https://monierave.favourututu.com/'})).toHaveAttribute('href','https://monierave.favourututu.com/');
  expect(screen.queryByRole('link',{name:'https://evil.example/'})).not.toBeInTheDocument();
  expect(screen.queryByRole('link',{name:'https://github.com/attacker/project'})).not.toBeInTheDocument();
  expect(screen.queryByRole('link',{name:'https://github.com/faelic/bucketflow'})).not.toBeInTheDocument();
});

it("starts without requests and supports opt-in storage, restoration, disabling and clearing", async () => {
  vi.mocked(fetch).mockResolvedValue(response(done("A supported answer.")));
  const view = render(<AssistantFeature frame={frame} />);
  expect(fetch).not.toHaveBeenCalled();
  expect(screen.getByRole("switch", { name: "Keep chat history" })).not.toBeChecked();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Who is Favour?" } });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  await screen.findByText("A supported answer.");
  await waitFor(() => expect(screen.queryByRole("button", { name: "Stop response" })).not.toBeInTheDocument());
  expect(localStorage.getItem(HISTORY_KEY)).toBeNull();
  fireEvent.click(screen.getByRole("switch"));
  await waitFor(() => expect(JSON.parse(localStorage.getItem(HISTORY_KEY)!)).toHaveLength(2));
  view.unmount();
  const restored = render(<AssistantFeature frame={frame} />);
  expect(screen.getByText("A supported answer.")).toBeVisible();
  fireEvent.click(screen.getByRole("switch"));
  expect(localStorage.getItem(HISTORY_KEY)).toBeNull();
  expect(screen.getByText("A supported answer.")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Clear conversation" }));
  expect(screen.queryByText("A supported answer.")).not.toBeInTheDocument();
  expect(localStorage.getItem(HISTORY_KEY)).toBeNull();
  restored.unmount();
});

it("keeps failed drafts and renders model markup without HTML, images, or unsafe links", async () => {
  vi.mocked(fetch).mockResolvedValue(response('{"type":"error","message":"The service is unavailable."}\n'));
  render(<AssistantFeature frame={frame} />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "A question" } });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  await screen.findByRole("alert");
  await waitFor(() => expect(screen.getByRole("textbox")).toHaveValue("A question"));
  const malicious = '<script>alert(1)</script>\n\n![tracking](https://tracker.invalid/pixel)\n\n[bad](javascript:alert(1)) [safe](https://github.com/faelic)';
  vi.mocked(fetch).mockResolvedValue(response(done(malicious)));
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  await screen.findByRole("link", { name: "safe" });
  expect(document.querySelector('.assistant script')).toBeNull();
  expect(document.querySelector('.assistant-answer img')).toBeNull();
  expect(screen.queryByRole("link", { name: "bad" })).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "safe" })).toHaveAttribute("rel", "noopener noreferrer");
  expect(JSON.parse(vi.mocked(fetch).mock.calls[1][1]!.body as string).history).toEqual([]);
});

it("starts a fresh request with empty history after clearing a completed or failed conversation", async () => {
  vi.mocked(fetch)
    .mockResolvedValueOnce(response(done("First answer.")))
    .mockResolvedValueOnce(response('{"type":"error","code":"unavailable","message":"The request could not be completed. Please try again later."}\n'))
    .mockResolvedValueOnce(response(done("Fresh answer.")));
  render(<AssistantFeature frame={frame} />);
  const send = (text: string) => {
    fireEvent.change(screen.getByRole("textbox"), { target: { value: text } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  };
  send("First question");
  await screen.findByText("First answer.");
  await waitFor(() => expect(screen.queryByRole("button", { name: "Stop response" })).not.toBeInTheDocument());
  fireEvent.click(screen.getByRole("button", { name: "Clear conversation" }));
  send("Second question");
  await screen.findByRole("alert");
  fireEvent.click(screen.getByRole("button", { name: "Clear conversation" }));
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  send("Fresh question");
  await screen.findByText("Fresh answer.");
  expect(screen.queryByText("First answer.")).not.toBeInTheDocument();
  expect(vi.mocked(fetch).mock.calls.map(([, options]) => JSON.parse(options!.body as string))).toEqual([
    { question: "First question", history: [] },
    { question: "Second question", history: [] },
    { question: "Fresh question", history: [] },
  ]);
});

it("aborts on close, retains the visible partial answer, and excludes it from later context", async () => {
  let signal: AbortSignal | undefined;
  vi.mocked(fetch).mockImplementation(async (_url, options) => {
    signal = options?.signal as AbortSignal;
    return new Response(new ReadableStream({ start(controller) {
      controller.enqueue(encoder.encode('{"type":"delta","text":"Partial answer"}\n'));
      signal?.addEventListener("abort", () => controller.error(new DOMException("Aborted", "AbortError")));
    } }), { headers: { "content-type": "application/x-ndjson" } });
  });
  const view = render(<AssistantFeature frame={frame} />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Question one" } });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  await screen.findByText("Partial answer");
  await act(async () => view.rerender(<AssistantFeature />));
  expect(signal?.aborted).toBe(true);
  view.rerender(<AssistantFeature frame={frame} />);
  expect(screen.getByText("Partial answer")).toBeVisible();
  expect(screen.getByText("Response stopped")).toBeVisible();
  vi.mocked(fetch).mockResolvedValue(response(done("A fresh answer.")));
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Question two" } });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  await screen.findByText("A fresh answer.");
  expect(JSON.parse(vi.mocked(fetch).mock.calls[1][1]!.body as string).history).toEqual([]);
});

it("remains usable when browser storage is denied", async () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new DOMException("Denied"); });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Denied"); });
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => { throw new DOMException("Denied"); });
  vi.mocked(fetch).mockResolvedValue(response(done("Still works.")));
  render(<AssistantFeature frame={frame} />);
  fireEvent.click(screen.getByRole("switch"));
  expect(screen.getByText("This browser couldn’t save your history. Messages stay for this visit.")).toBeVisible();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Hello" } });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  await screen.findByText("Still works.");
});

it("records submission and first-text times once, keeps portraits beside replies, and restores those times", async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  try {
    vi.setSystemTime(new Date("2026-11-12T12:27:00.000Z"));
    let wire!: ReadableStreamDefaultController<Uint8Array>;
    vi.mocked(fetch).mockResolvedValue(new Response(new ReadableStream({ start(controller) { wire = controller; } }), {
      headers: { "content-type": "application/x-ndjson" },
    }));
    const view = render(<AssistantFeature frame={frame} />);
    fireEvent.click(screen.getByRole("switch"));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Hi" } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await waitFor(() => expect(view.container.querySelector(".assistant-thinking")).toHaveTextContent("Avartar is thinking…"));
    expect(view.container.querySelector(".assistant-message--user time")).toHaveAttribute("datetime", "2026-11-12T12:27:00.000Z");
    expect(view.container.querySelector(".assistant-message--user .portrait-avatar")).toBeNull();
    expect(view.container.querySelector(".assistant-message--assistant .portrait-avatar img")).toHaveAttribute("src", "/assets/profile/favour-avatar-96.webp");
    expect(view.container.querySelector(".assistant-message--assistant time")).toBeNull();
    await act(async () => wire.enqueue(encoder.encode(JSON.stringify({ type: "delta", text: "  " }) + "\n")));
    expect(view.container.querySelector(".assistant-thinking")).toBeVisible();
    expect(view.container.querySelector(".assistant-message--assistant time")).toBeNull();
    vi.setSystemTime(new Date("2026-11-12T12:28:00.000Z"));
    await act(async () => wire.enqueue(encoder.encode(JSON.stringify({ type: "delta", text: "Hi!" }) + "\n")));
    await screen.findByText("Hi!");
    expect(view.container.querySelector(".assistant-thinking")).toBeNull();
    expect(view.container.querySelector(".assistant-message--assistant time")).toHaveAttribute("datetime", "2026-11-12T12:28:00.000Z");
    vi.setSystemTime(new Date("2026-11-12T12:35:00.000Z"));
    await act(async () => {
      wire.enqueue(encoder.encode(JSON.stringify({ type: "done", text: "Hi! How can I help?" }) + "\n"));
      wire.close();
    });
    await waitFor(() => expect(JSON.parse(localStorage.getItem(HISTORY_KEY)!)).toHaveLength(2));
    const saved = loadChat().messages;
    expect(saved.map(message => message.sentAt)).toEqual(["2026-11-12T12:27:00.000Z", "2026-11-12T12:28:00.000Z"]);
    expect(modelHistory(saved)).toEqual([{ role: "user", content: "Hi" }, { role: "assistant", content: "Hi! How can I help?" }]);
    view.unmount();
    const restored = render(<AssistantFeature frame={frame} />);
    expect(restored.container.querySelector(".assistant-message--assistant time")).toHaveAttribute("datetime", "2026-11-12T12:28:00.000Z");
  } finally { vi.useRealTimers(); }
});

it("restores legacy chat without invented times and drops invalid optional time metadata", () => {
  localStorage.setItem(KEEP_HISTORY_KEY, "true");
  localStorage.setItem(HISTORY_KEY, JSON.stringify([
    { id: "legacy-u", role: "user", text: "Earlier question", status: "complete", sentAt: "not-a-date" },
    { id: "legacy-a", role: "assistant", text: "Earlier answer", status: "complete" },
  ]));
  expect(loadChat().messages).toEqual([
    { id: "legacy-u", role: "user", text: "Earlier question", status: "complete" },
    { id: "legacy-a", role: "assistant", text: "Earlier answer", status: "complete" },
  ]);
  const view = render(<AssistantFeature frame={frame} />);
  expect(screen.getByText("Earlier answer")).toBeVisible();
  expect(view.container.querySelector(".assistant-message time")).toBeNull();
  expect(screen.getByText("Avartar", { exact: true })).toBeVisible();
});


it("uses the configured HTTPS API origin and displays bounded retry guidance", async () => {
  vi.stubEnv("VITE_API_ORIGIN", "https://rag-api.favourututu.com");
  try {
    vi.mocked(fetch).mockResolvedValue(response(done("Answer.")));
    await streamChat("Question", [], new AbortController().signal, () => {});
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe("https://rag-api.favourututu.com/api/chat");
    expect(vi.mocked(fetch).mock.calls[0][1]?.credentials).toBe("include");
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ code: "budget_exhausted", message: "PRIVATE" }), {
      status: 429, headers: { "Retry-After": "3600", "Content-Type": "application/json" },
    }));
    await expect(streamChat("Question", [], new AbortController().signal, () => {})).rejects.toThrow("The assistant has reached its usage allowance. Try again in 1 hour.");
    vi.mocked(fetch).mockClear();
    vi.stubEnv("VITE_API_ORIGIN", "http://unsafe.invalid");
    await expect(streamChat("Question", [], new AbortController().signal, () => {})).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
  } finally { vi.unstubAllEnvs(); }
});

it("explains visitor, network and active-response limits without exposing server details", async () => {
  for (const [code, expected] of [
    ['visitor_rate_limited', 'You have reached 3 messages per minute.'],
    ['ip_rate_limited', 'Your network has reached 6 messages per minute.'],
    ['ip_daily_limited', 'Your network has reached 20 messages in 24 hours.'],
    ['visitor_busy', 'Please wait for your current answer to finish.'],
    ['ip_busy', 'Your network already has the maximum number of active answers.'],
  ]) {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({code, message:'PRIVATE'}), {
      status:429, headers:{'Retry-After':'60','Content-Type':'application/json'},
    }));
    await expect(streamChat('Question', [], new AbortController().signal, () => {})).rejects.toThrow(expected + ' Try again in 1 minute.');
  }
});

it("distinguishes connection denials from validation errors without echoing server details", async () => {
  for (const [status, expected] of [[403, /site access settings/], [404, /endpoint is unavailable/], [413, /conversation is too large/], [422, /validate this request/]] as const) {
    vi.mocked(fetch).mockResolvedValue(new Response('PRIVATE server detail', { status }));
    await expect(streamChat('What did Favour contribute to Policy.ng?', [], new AbortController().signal, () => {})).rejects.toThrow(expected);
  }
});


it("remembers displayed follow-ups for this visit and forgets them on clear", async () => {
  const suggested = "How does Monierave manage login sessions?";
  vi.mocked(fetch)
    .mockResolvedValueOnce(response(done("First answer.").replace('{"type":"done"', `${JSON.stringify({ type: "suggestion", question: suggested })}\n{"type":"done"`)))
    .mockResolvedValueOnce(response(done("Second answer.")))
    .mockResolvedValueOnce(response(done("Fresh answer.")));
  render(<AssistantFeature frame={frame} />);
  const send = async (text: string, answer: string) => {
    fireEvent.change(screen.getByRole("textbox"), { target: { value: text } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));
    await screen.findByText(answer);
    await waitFor(() => expect(screen.queryByRole("button", { name: "Stop response" })).not.toBeInTheDocument());
  };
  await send("First question", "First answer.");
  await send("A different question", "Second answer.");
  expect(JSON.parse(vi.mocked(fetch).mock.calls[1][1]!.body as string).recent_suggestions).toEqual([suggested]);
  fireEvent.click(screen.getByRole("button", { name: "Clear conversation" }));
  await send("Fresh question", "Fresh answer.");
  expect(JSON.parse(vi.mocked(fetch).mock.calls[2][1]!.body as string).recent_suggestions).toBeUndefined();
});
