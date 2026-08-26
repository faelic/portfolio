import { useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { notes } from "../../data/notes";

type NoteKey = keyof typeof notes;

export function NotesWindow() {
  const [selected, setSelected] = useState<NoteKey>("about");
  const tabRefs = useRef<Partial<Record<NoteKey, HTMLButtonElement | null>>>({});
  const note = notes[selected];
  const noteKeys: NoteKey[] = ["experience", "about"];

  const selectFromKeyboard = (event: ReactKeyboardEvent<HTMLButtonElement>, key: NoteKey) => {
    const currentIndex = noteKeys.indexOf(key);
    const direction = event.key === "ArrowRight" || event.key === "ArrowDown"
      ? 1
      : event.key === "ArrowLeft" || event.key === "ArrowUp"
        ? -1
        : 0;

    if (direction === 0 && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();

    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? noteKeys.length - 1
        : (currentIndex + direction + noteKeys.length) % noteKeys.length;
    const nextKey = noteKeys[nextIndex];
    setSelected(nextKey);
    tabRefs.current[nextKey]?.focus();
  };

  return (
    <div className="window-body">
      <div className="notes-shell">
        <aside className="notes-list" role="tablist" aria-label="Notes">
          {noteKeys.map((key) => (
            <button
              key={key}
              ref={(node) => { tabRefs.current[key] = node; }}
              id={`note-tab-${key}`}
              className={`note-list-button${selected === key ? " is-selected" : ""}`}
              type="button"
              role="tab"
              aria-selected={selected === key}
              aria-controls="note-reader-panel"
              tabIndex={selected === key ? 0 : -1}
              data-cuelume-hover="tick"
              data-cuelume-toggle="toggle"
              onKeyDown={(event) => selectFromKeyboard(event, key)}
              onClick={() => setSelected(key)}
            >
              <span className="note-list-title">{notes[key].title}</span>
              <span className="note-list-preview"><time>17/08/2026</time> {key === "about" ? "I'm Favour…" : "Software…"}</span>
            </button>
          ))}
        </aside>
        <section id="note-reader-panel" className="note-reader" role="tabpanel" aria-labelledby={`note-tab-${selected}`} tabIndex={0}>
          <p className="note-date">{note.date}</p>
          <h2>{note.title}</h2>
          <div className="note-copy">
            {selected === "about" ? notes.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : notes.experience.roles.map((role) => (
              <div key={role.title}><h3>{role.title}</h3><p className="role-place">{role.place}</p><p className="role-date">{role.date}</p><ul>{role.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
