import { validReferences, type PublicReference } from "./references";
import { isBoolean, storage } from "../../utils/storage";

export const HISTORY_KEY = "favour.assistant-history.v1";
export const KEEP_HISTORY_KEY = "favour.assistant-keep-history.v1";
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  status: "running" | "complete" | "interrupted" | "error";
  sentAt?: string;
  references?: PublicReference[];
}

export function validSentAt(value: unknown): value is string {
  return typeof value === "string" && value.length <= 35 && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
}

// Keep complete exchanges together. Interrupted answers are never model evidence.
export function completedMessages(messages: readonly ChatMessage[]): ChatMessage[] {
  const result: ChatMessage[] = [];
  for (let index = 0; index < messages.length - 1; index++) {
    const user = messages[index], answer = messages[index + 1];
    if (user.role === "user" && answer.role === "assistant" && answer.status === "complete") {
      result.push(user, answer);
      index++;
    }
  }
  return result.slice(-100);
}

function isHistory(value: unknown): value is ChatMessage[] {
  return Array.isArray(value) && value.length <= 100 && value.length % 2 === 0 && value.every((item, index) =>
    item && typeof item === "object" && typeof item.id === "string" && item.id.length <= 100 &&
    item.role === (index % 2 ? "assistant" : "user") && item.status === "complete" &&
    typeof item.text === "string" && item.text.length <= 2000,
  ) && new Set(value.map(item => item.id)).size === value.length;
}

export function loadChat() {
  const keep = storage.read(KEEP_HISTORY_KEY, false, isBoolean);
  if (!keep) storage.remove(HISTORY_KEY);
  const messages = keep ? storage.read<ChatMessage[]>(HISTORY_KEY, [], isHistory).map(({ id, role, text, status, sentAt, references }) => ({
    id, role, text, status, ...(role === "assistant" && references ? { references: validReferences(references) } : {}), ...(validSentAt(sentAt) ? { sentAt } : {}),
  })) : [];
  return { keep, messages };
}

export function modelHistory(messages: readonly ChatMessage[]) {
  return completedMessages(messages).slice(-12).map(({ role, text }) => ({ role, content: text }));
}
