import { validReferences, type PublicReference } from "./references";
type ChatEvent = { type: "suggestion"; question: string } | { type: "references"; items: PublicReference[] } | { type: "delta" | "done"; text: string } | { type: "error"; message: string };
const INTERRUPTED = "The connection ended before the answer finished. Please try again.";

function retryHint(seconds: unknown) {
  const value = Number(seconds);
  if (!Number.isFinite(value) || value <= 0) return "";
  const unit = value < 60 ? "second" : value < 3600 ? "minute" : "hour";
  const count = Math.ceil(value / (value < 60 ? 1 : value < 3600 ? 60 : 3600));
  return ` Try again in ${count} ${unit}${count === 1 ? "" : "s"}.`;
}

function chatUrl() {
  const origin = import.meta.env.VITE_API_ORIGIN;
  if (!origin) return "/api/chat";
  const url = new URL(origin);
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error("The assistant connection is not configured correctly.");
  }
  return `${url.origin}/api/chat`;
}

function parseEvent(line: string): ChatEvent {
  let event: unknown;
  try { event = JSON.parse(line); } catch { throw new Error(INTERRUPTED); }
  if (event && typeof event === "object" && "type" in event) {
    if (event.type === "suggestion") {
      const question = "question" in event && typeof event.question === "string" ? event.question.trim() : "";
      const controls = [...question].some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);
      return { type: "suggestion", question: question.length <= 120 && !controls ? question : "" };
    }
    if (event.type === "references" && "items" in event) return { type: "references", items: validReferences(event.items) };
    if ((event.type === "delta" || event.type === "done") && "text" in event && typeof event.text === "string" && event.text.length <= 2000) return event as ChatEvent;
    if (event.type === "error" && "message" in event && typeof event.message === "string") {
      return { type: "error", message: event.message.slice(0, 300) + retryHint("retry_after" in event ? event.retry_after : undefined) };
    }
  }
  throw new Error(INTERRUPTED);
}

export async function streamChat(
  question: string,
  history: Array<{ role: "user" | "assistant"; content: string }>,
  signal: AbortSignal,
  onText: (text: string) => void,
  onReferences?: (references: PublicReference[]) => void,
  onSuggestion?: (question: string) => void,
  recentSuggestions: string[] = [],
): Promise<string> {
  let response: Response;
  try {
    response = await fetch(chatUrl(), {
      method: "POST", credentials: "include", headers: { "Content-Type": "application/json", "X-Portfolio-References": "1", "Accept": "application/x-ndjson; suggestions=1" },
      body: JSON.stringify({ question, history, ...(recentSuggestions.length ? { recent_suggestions: recentSuggestions.slice(-12) } : {}) }), signal,
    });
  } catch {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    throw new Error("The assistant is unavailable right now. Please try again shortly.");
  }
  if (!response.ok || !response.body) {
    if (response.status === 429) {
      let code: unknown;
      try { code = (await response.json()).code; } catch { /* Proxy responses may have no JSON. */ }
      const message = code === "budget_exhausted" ? "The assistant has reached its usage allowance."
        : code === "ip_busy" ? "Your network already has the maximum number of active answers."
        : code === "visitor_rate_limited" ? "You have reached 3 messages per minute."
          : code === "ip_rate_limited" ? "Your network has reached 6 messages per minute."
            : code === "ip_daily_limited" ? "Your network has reached 20 messages in 24 hours."
              : code === "visitor_busy" ? "Please wait for your current answer to finish."
        : code === "rate_limited" ? "Too many messages. Please wait before trying again."
          : "The assistant is busy. Please try again shortly.";
      throw new Error(message + retryHint(response.headers.get("Retry-After")));
    }
    const message = response.status === 401 || response.status === 403
      ? "The assistant connection was denied. Its site access settings need to be checked."
      : response.status === 404 || response.status === 405
        ? "The assistant endpoint is unavailable. Its connection settings need to be checked."
        : response.status === 413
          ? "This conversation is too large to send. Start a new conversation and try again."
          : response.status === 422
            ? "The assistant could not validate this request. Try a new conversation or a shorter message."
            : "The assistant is unavailable right now. Please try again shortly.";
    throw new Error(message);
  }
  if (!response.headers.get("content-type")?.includes("application/x-ndjson")) throw new Error(INTERRUPTED);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "", text = "", suggestion = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      let boundary: number;
      while ((boundary = buffer.indexOf("\n")) >= 0 || (done && buffer.trim())) {
        const line = boundary >= 0 ? buffer.slice(0, boundary) : buffer;
        if (line.length > 16_384) throw new Error(INTERRUPTED);
        buffer = boundary >= 0 ? buffer.slice(boundary + 1) : "";
        if (!line.trim()) continue;
        const event = parseEvent(line);
        if (event.type === "suggestion") { suggestion = event.question; continue; }
        if (event.type === "references") { onReferences?.(event.items); continue; }
        if (event.type === "error") throw new Error(event.message);
        if (event.type === "done") {
          if (!event.text.trim()) throw new Error(INTERRUPTED);
          onText(event.text);
          if (suggestion && !signal.aborted) onSuggestion?.(suggestion);
          return event.text;
        }
        text += event.text;
        if (text.length > 2000) throw new Error(INTERRUPTED);
        onText(text);
      }
      if (buffer.length > 16_384) throw new Error(INTERRUPTED);
      if (done) throw new Error(INTERRUPTED);
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}
