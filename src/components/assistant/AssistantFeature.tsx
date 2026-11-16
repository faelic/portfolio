import { AnimatedIcon } from "../icons/AnimatedIcon";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import {
  AssistantRuntimeProvider, ComposerPrimitive, MessagePrimitive, ThreadPrimitive,
  useExternalStoreRuntime, useAuiState, type AppendMessage, type ThreadMessageLike,
} from "@assistant-ui/react";
import Markdown from "react-markdown";
import { approvedAssistantUrl } from './links';
import { remarkApprovedAutolinks } from './autolinks';
import { WindowFrame } from "../windows/WindowFrame";
import { PortraitAvatar } from "../shared/PortraitAvatar";
import { storage } from "../../utils/storage";
import { completedMessages, HISTORY_KEY, KEEP_HISTORY_KEY, loadChat, modelHistory, validSentAt, type ChatMessage } from "./history";
import { streamChat } from "./stream";
import "./assistant.css";

export type AssistantFrameProps = Omit<ComponentProps<typeof WindowFrame>, "children">;
const AVARTAR_NAME = "Avartar";
const fullTimeFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "long" });

function convertMessage(message: ChatMessage): ThreadMessageLike {
  return {
    id: message.id, role: message.role, content: message.text,
    ...(validSentAt(message.sentAt) ? { createdAt: new Date(message.sentAt) } : {}),
    ...(message.role === "assistant" ? { status: message.status === "running"
      ? { type: "running" as const }
      : message.status === "complete"
        ? { type: "complete" as const, reason: "stop" as const }
        : { type: "incomplete" as const, reason: "cancelled" as const },
    } : {}),
    metadata: { custom: { status: message.status, sentAt: message.sentAt, references: message.references } },
  };
}

function Message() {
  const role = useAuiState(state => state.message.role);
  const status = useAuiState(state => state.message.metadata.custom.status);
  const sentAt = useAuiState(state => state.message.metadata.custom.sentAt);
  const empty = useAuiState(state => !state.message.content.some(part => part.type === "text" && part.text.trim()));
  const pending = status === "running" && empty;
  const time = validSentAt(sentAt) ? <SentTime sentAt={sentAt} /> : null;
  return <MessagePrimitive.Root className={`assistant-message assistant-message--${role}`}>
    {role === "assistant" && <PortraitAvatar className="assistant-message-portrait" decorative />}
    <div className="assistant-message-content" aria-busy={status === "running"}>
      {pending ? <p className="assistant-thinking" aria-hidden="true">{AVARTAR_NAME} is thinking<span className="assistant-thinking-dots">…</span></p>
        : <>
          <div className="assistant-message-meta">
            {role === "user" && time && <>{time}<span aria-hidden="true">·</span></>}
            <span className="assistant-message-label">{role === "user" ? "You" : AVARTAR_NAME}</span>
            {role === "assistant" && time && <><span aria-hidden="true">·</span>{time}</>}
          </div>
          <div className="assistant-message-bubble">
            {!empty && <MessagePrimitive.Parts components={{ Text: role === "user" ? UserText : AnswerText }} />}
            {(status === "interrupted" || status === "error") && <p className="assistant-message-note">Response {status === "error" ? "incomplete" : "stopped"}</p>}
          </div>
        </>}
    </div>
  </MessagePrimitive.Root>;
}

function SentTime({ sentAt }: { sentAt: string }) {
  const date = new Date(sentAt);
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  return <time dateTime={sentAt} title={fullTimeFormat.format(date)}>{time}</time>;
}

function UserText({ text }: { text: string }) { return <p className="assistant-user-text">{text}</p>; }
function AnswerText({ text }: { text: string }) {
  return <div className="assistant-answer"><Markdown skipHtml remarkPlugins={[remarkApprovedAutolinks]} urlTransform={approvedAssistantUrl}
    allowedElements={["p", "strong", "em", "ul", "ol", "li", "a", "code", "pre", "blockquote", "br", "hr", "h1", "h2", "h3"]}
    components={{ a: ({ href, children }) => href ? <a href={href} target="_blank" rel="noopener noreferrer">{children}</a> : <span>{children}</span> }}
  >{text}</Markdown></div>;
}

export default function AssistantFeature({ frame, mount }: { frame?: AssistantFrameProps; mount?: HTMLElement | null }) {
  const [initial] = useState(loadChat);
  const [messages, setMessages] = useState<ChatMessage[]>(initial.messages);
  const [keep, setKeep] = useState(initial.keep);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const controller = useRef<AbortController | null>(null);
  const surface = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<ReturnType<typeof useExternalStoreRuntime<ChatMessage>> | null>(null);
  const mobileOpen = !!frame?.mobile;

  const stop = () => { controller.current?.abort(); };
  useEffect(() => { if (!frame) controller.current?.abort(); }, [frame]);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    const viewport = window.visualViewport;
    const element = surface.current?.closest<HTMLElement>(".window");
    if (!mobileOpen || !viewport || !element) return;
    const resize = () => {
      element.style.setProperty("--assistant-viewport-height", `${viewport.height}px`);
      element.style.setProperty("--assistant-viewport-top", `${viewport.offsetTop}px`);
    };
    resize();
    viewport.addEventListener("resize", resize);
    viewport.addEventListener("scroll", resize);
    return () => {
      viewport.removeEventListener("resize", resize);
      viewport.removeEventListener("scroll", resize);
      element.style.removeProperty("--assistant-viewport-height");
      element.style.removeProperty("--assistant-viewport-top");
    };
  }, [mobileOpen, mount]);
  useEffect(() => {
    const saved = storage.write(KEEP_HISTORY_KEY, keep);
    setStorageUnavailable(keep && !saved);
    if (!keep) storage.remove(HISTORY_KEY);
  }, [keep]);
  useEffect(() => {
    if (keep && !running) {
      const completed = completedMessages(messages);
      if (completed.length) setStorageUnavailable(!storage.write(HISTORY_KEY, completed));
      else storage.remove(HISTORY_KEY);
    }
  }, [keep, messages, running]);

  const onNew = async (message: AppendMessage) => {
    if (controller.current) return;
    const question = message.content.filter(part => part.type === "text").map(part => part.text).join("\n").trim();
    if (!question) return;
    if (question.length > 2000) { setError("Keep your message under 2,000 characters."); return; }
    const request = new AbortController();
    controller.current = request;
    const id = crypto.randomUUID();
    const history = modelHistory(messages);
    const submittedAt = new Date().toISOString();
    let responseSentAt: string | undefined;
    setError(""); setRunning(true); setAnnouncement(`${AVARTAR_NAME} is thinking…`);
    setMessages(current => [...current.slice(-100),
      { id: `${id}-user`, role: "user", text: question, status: "complete", sentAt: submittedAt },
      { id, role: "assistant", text: "", status: "running" },
    ]);
    const update = (text: string, status: ChatMessage["status"] = "running") => {
      if (request.signal.aborted || controller.current !== request) return;
      if (!responseSentAt && text.trim()) responseSentAt = new Date().toISOString();
      const sentAt = responseSentAt;
      setMessages(current => current.map(item => item.id === id ? {
        ...item, text, status, sentAt,
      } : item));
    };
    try {
      const text = await streamChat(question, history, request.signal, update, references => {
        if (!request.signal.aborted && controller.current === request) setMessages(current => current.map(item => item.id === id ? { ...item, references } : item));
      });
      update(text, "complete");
      setAnnouncement("Answer complete.");
    } catch (failure) {
      if (controller.current !== request) return;
      const interrupted = request.signal.aborted;
      setMessages(current => current.map(item => item.id === id ? { ...item, status: interrupted ? "interrupted" : "error" } : item));
      if (!interrupted) {
        setError(failure instanceof Error ? failure.message : "The answer could not finish. Please try again.");
        const composer = runtimeRef.current?.thread.composer;
        if (composer && !composer.getState().text) composer.setText(question);
      }
      setAnnouncement(interrupted ? "Response stopped." : "The answer could not finish.");
    } finally {
      if (controller.current === request) { controller.current = null; setRunning(false); }
    }
  };

  const runtime = useExternalStoreRuntime({
    messages, convertMessage, isRunning: running, onNew,
    onCancel: async () => stop(),
  });
  runtimeRef.current = runtime;
  const clear = () => {
    stop(); controller.current = null;
    setMessages([]); setRunning(false); setError(""); setAnnouncement("Conversation cleared.");
    runtime.thread.composer.setText("");
    storage.remove(HISTORY_KEY);
  };

  const content = <ThreadPrimitive.Root ref={surface} className="assistant">
        <div className="assistant-toolbar">
          <label className="assistant-history"><input className="sr-only" type="checkbox" role="switch" checked={keep} onChange={event => setKeep(event.target.checked)} /><span className="assistant-history-track" aria-hidden="true" />Keep chat history</label>
          <button type="button" className="assistant-clear" onClick={clear} disabled={!messages.length && !error} aria-label="Clear conversation" title="Clear conversation"><AnimatedIcon name="trash"/></button>
        </div>
        <ThreadPrimitive.Viewport className="assistant-viewport" autoScroll scrollToBottomOnRunStart={false} role="region" aria-label="Conversation" tabIndex={0}>
          <ThreadPrimitive.Empty>
            <div className="assistant-welcome">
              <PortraitAvatar className="assistant-welcome-portrait" large />
              <h2>Hi! I'm Favour's assistant</h2>
              <p>Ask me about his work, projects, or experience. My answers draw from his portfolio.</p>
              <div className="assistant-suggestions" aria-label="Suggested questions">{["What does Favour build?", "What’s his experience?", "How does Monierave work?"].map(question => <button type="button" key={question} onClick={() => runtime.thread.composer.setText(question)}>{question}</button>)}</div>
            </div>
          </ThreadPrimitive.Empty>
          <div className="assistant-messages"><ThreadPrimitive.Messages components={{ Message }} /></div>
        </ThreadPrimitive.Viewport>
        <div className="assistant-bottom">
          {error && <p className="assistant-error" role="alert">{error}</p>}
          <p className="sr-only" role="status">{announcement}</p>
          <ComposerPrimitive.Root className="assistant-composer">
            <ComposerPrimitive.Input aria-label="Message Avartar" placeholder="Ask about Favour…" maxLength={2000} rows={1} maxRows={5} autoFocus={false} cancelOnEscape={false} />
            {running ? <ComposerPrimitive.Cancel className="assistant-send" aria-label="Stop response"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" /></svg></ComposerPrimitive.Cancel>
              : <ComposerPrimitive.Send className="assistant-send" aria-label="Send message"><AnimatedIcon name="send"/></ComposerPrimitive.Send>}
          </ComposerPrimitive.Root>
          <p className="assistant-privacy">{keep
            ? storageUnavailable ? "This browser couldn’t save your history. Messages stay for this visit." : "Saved in this browser. You can clear it anytime."
            : "History saving is off. Messages stay for this visit."}</p>
        </div>
      </ThreadPrimitive.Root>;
  return <AssistantRuntimeProvider runtime={runtime}>
    {frame && (mount === undefined ? <WindowFrame {...frame}>{content}</WindowFrame> : mount ? createPortal(content, mount) : null)}
  </AssistantRuntimeProvider>;
}
