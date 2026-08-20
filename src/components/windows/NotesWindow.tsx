import { useState } from "react";
import { notes } from "../../data/notes";

type NoteKey = keyof typeof notes;

export function NotesWindow() {
  const [selected, setSelected] = useState<NoteKey>("about");
  const note = notes[selected];
  return (
    <div className="window-body">
      <div className="notes-shell">
        <aside className="notes-list" role="tablist" aria-label="Notes">
          {(["experience", "about"] as NoteKey[]).map((key) => (
            <button key={key} className={`note-list-button${selected === key ? " is-selected" : ""}`} type="button" role="tab" aria-selected={selected === key} data-cuelume-hover="tick" data-cuelume-toggle="toggle" onClick={() => setSelected(key)}>
              <span className="note-list-title">{notes[key].title}</span>
              <span className="note-list-preview"><time>17/08/2026</time> {key === "about" ? "I'm Favour…" : "Software…"}</span>
            </button>
          ))}
        </aside>
        <section className="note-reader" aria-live="polite">
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
