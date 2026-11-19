import { useId, useLayoutEffect, useRef } from "react";
import { ComposerPrimitive, useAuiState } from "@assistant-ui/react";
import { AnimatedIcon } from "../icons/AnimatedIcon";

export function FollowupComposer({ suggestion, running, dismiss, setText }: {
  suggestion: string; running: boolean; dismiss: () => void; setText: (text: string) => void;
}) {
  const text = useAuiState(state => state.composer.text);
  const input = useRef<HTMLTextAreaElement>(null);
  const accepted = useRef<string | null>(null);
  const hint = useId();
  const visible = !!suggestion && !text && !running;
  useLayoutEffect(() => {
    if (accepted.current !== null) {
      if (text === accepted.current) input.current?.setSelectionRange(text.length, text.length);
      accepted.current = null;
    }
  }, [text]);
  const accept = () => {
    if (!visible) return;
    accepted.current = suggestion;
    setText(suggestion);
    dismiss();
    input.current?.focus();
  };
  return <div className="assistant-composer-wrap"><ComposerPrimitive.Root className="assistant-composer">
    <div className="assistant-composer-field">
      <ComposerPrimitive.Input ref={input} aria-label="Message Avartar" aria-describedby={visible ? hint : undefined}
        placeholder={visible ? suggestion : "Ask about Favour…"} maxLength={2000} rows={1} maxRows={5} autoFocus={false} cancelOnEscape={false}
        onChange={dismiss} onKeyDown={event => {
          if (!visible || event.nativeEvent.isComposing || event.altKey || event.ctrlKey || event.metaKey) return;
          if (event.key === "Tab" && !event.shiftKey) { event.preventDefault(); accept(); }
          if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); dismiss(); }
        }} />
    </div>
    {running ? <ComposerPrimitive.Cancel className="assistant-send" aria-label="Stop response"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" /></svg></ComposerPrimitive.Cancel>
      : <ComposerPrimitive.Send className="assistant-send" aria-label="Send message"><AnimatedIcon name="send"/></ComposerPrimitive.Send>}
  </ComposerPrimitive.Root>
    {visible && <div className="assistant-completion-hint">
      <span id={hint} className="sr-only">Optional suggestion: {suggestion} Press Tab to complete, or type your own question.</span>
      <button type="button" className="assistant-followup" aria-label={`Use suggested question: ${suggestion}`} onClick={accept}>
        <span className="assistant-followup-keyboard"><kbd aria-hidden="true">Tab</kbd> to complete</span>
        <span className="assistant-followup-touch">Use suggested question</span>
      </button>
    </div>}
  </div>;
}
