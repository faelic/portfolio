import type { CSSProperties, ReactNode } from "react";
import type { CapabilityVisualKey, Project, ProjectCapability } from "../../types/portfolio";

function ProjectPin({ quiet = false }: { quiet?: boolean }) {
  return <span className={`project-pin${quiet ? " project-pin--quiet" : ""}`} aria-hidden="true"><span /></span>;
}

export function ProjectThesisNote({ project }: { project: Project }) {
  const style = {
    "--note-rotation": `${project.thesis.rotation}deg`,
    "--pin-x": `${project.thesis.rotation < 0 ? 52.5 : 48.5}%`,
  } as CSSProperties;

  return (
    <aside className="project-thesis-wrap" aria-label={`${project.title} central idea`}>
      <div className="project-thesis-stack" style={style}>
        <span className="project-thesis-backing" aria-hidden="true" />
        <div className="project-thesis-note">
          <ProjectPin />
          <div className="project-thesis-inset">
            <span className="project-thesis-number">{project.thesis.number}</span>
            <h3>{project.thesis.title}</h3>
            <p>{project.thesis.body}</p>
          </div>
        </div>
      </div>
      <div className="project-thesis-context-wrap">
        <span className="project-context-label">About the build</span>
        <p className="project-thesis-context">{project.description}</p>
      </div>
    </aside>
  );
}

function VisualSvg({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 216 132" focusable="false" aria-hidden="true">
      <ellipse className="visual-object-shadow" cx="108" cy="108" rx="62" ry="10" />
      <g className="capability-visual__object">{children}</g>
    </svg>
  );
}

function CapabilityVisual({ type }: { type: CapabilityVisualKey }) {
  switch (type) {
    case "ledger":
      return <VisualSvg><rect className="visual-surface visual-back" x="52" y="24" width="112" height="76" rx="14" /><rect className="visual-surface" x="43" y="32" width="116" height="76" rx="14" /><path className="visual-line" d="M70 54h62M70 68h62M70 82h38" /><path className="visual-accent-line" d="M81 48v42M122 48v42" /><path className="visual-accent-line visual-heavy" d="m124 82 7 7 15-18" /><circle className="visual-solid" cx="68" cy="54" r="3" /></VisualSvg>;
    case "sessions":
      return <VisualSvg><path className="visual-surface" d="M108 20 151 37v29c0 23-17 39-43 49-26-10-43-26-43-49V37z" /><path className="visual-accent-fill" d="M108 35 137 47v20c0 15-11 26-29 34-18-8-29-19-29-34V47z" /><circle className="visual-surface" cx="108" cy="67" r="16" /><path className="visual-accent-line visual-heavy" d="M108 58v18M101 67h14" /><path className="visual-line" d="M48 54c-9 11-9 27 0 38M168 54c9 11 9 27 0 38" /><path className="visual-accent-line" d="m45 51 5 3-1 6m122-9-5 3 1 6" /></VisualSvg>;
    case "operations":
      return <VisualSvg><rect className="visual-surface" x="31" y="50" width="46" height="34" rx="10" /><rect className="visual-surface" x="87" y="24" width="42" height="34" rx="10" /><rect className="visual-surface" x="139" y="68" width="46" height="34" rx="10" /><path className="visual-line" d="M77 67h17c10 0 14-4 14-12M129 42h13c12 0 20 8 20 20v6M77 75h36c14 0 26 7 26 17" /><circle className="visual-solid" cx="54" cy="67" r="7" /><path className="visual-accent-line visual-heavy" d="M99 36h18M99 45h12M151 82h22M151 90h14" /><circle className="visual-accent-fill" cx="118" cy="75" r="7" /></VisualSvg>;
    case "split":
      return <VisualSvg><circle className="visual-surface" cx="108" cy="42" r="22" /><path className="visual-accent-line visual-heavy" d="M101 42h14M108 34v16" /><path className="visual-line" d="M108 64v12M108 76H57v10M108 76h51v10M108 76v10" /><rect className="visual-surface" x="32" y="86" width="48" height="28" rx="9" /><rect className="visual-surface" x="84" y="86" width="48" height="28" rx="9" /><rect className="visual-surface" x="136" y="86" width="48" height="28" rx="9" /><path className="visual-accent-line" d="M44 100h24M96 100h24M148 100h24" /></VisualSvg>;
    case "chain-sync":
      return <VisualSvg><rect className="visual-surface" x="27" y="34" width="70" height="64" rx="14" /><rect className="visual-surface" x="119" y="34" width="70" height="64" rx="14" /><path className="visual-accent-line" d="M41 51h42M41 64h29M41 78h35M134 51h40M134 64h27M134 78h34" /><path className="visual-line visual-heavy" d="M98 52h18m-6-6 6 6-6 6M118 82H100m6-6-6 6 6 6" /><circle className="visual-accent-fill" cx="62" cy="104" r="6" /><circle className="visual-accent-fill" cx="154" cy="104" r="6" /></VisualSvg>;
    case "guardrails":
      return <VisualSvg><path className="visual-surface" d="M108 20 155 39v31c0 23-17 38-47 48-30-10-47-25-47-48V39z" /><path className="visual-line" d="M82 74c8-20 44-20 52 0" /><path className="visual-accent-line visual-heavy" d="M108 74 126 56" /><circle className="visual-solid" cx="108" cy="74" r="7" /><path className="visual-accent-line" d="M78 50h60M80 92h56" /></VisualSvg>;
    case "chain-data":
      return <VisualSvg><path className="visual-line" d="M45 70h27M98 52h25M147 78h25" /><rect className="visual-surface" x="30" y="54" width="38" height="38" rx="9" /><rect className="visual-surface" x="79" y="34" width="42" height="42" rx="10" /><rect className="visual-surface" x="137" y="62" width="42" height="42" rx="10" /><path className="visual-accent-line" d="M39 65h20M39 74h14M89 47h22M89 57h15M147 75h22M147 85h14" /><circle className="visual-accent-fill" cx="73" cy="70" r="5" /><circle className="visual-accent-fill" cx="128" cy="55" r="5" /></VisualSvg>;
    case "navigation":
      return <VisualSvg><rect className="visual-surface" x="30" y="30" width="156" height="75" rx="16" /><path className="visual-line" d="M48 48h52M48 63h74M48 78h58" /><circle className="visual-accent-fill" cx="145" cy="63" r="21" /><circle className="visual-surface" cx="145" cy="63" r="10" /><path className="visual-accent-line visual-heavy" d="m153 71 15 15" /><path className="visual-line" d="M61 105v10m44-10v10m44-10v10" /></VisualSvg>;
    case "learning":
      return <VisualSvg><path className="visual-surface" d="M44 92h38V70h38V48h38V26h18v83H44z" /><path className="visual-accent-line visual-heavy" d="m55 80 29-18 21 4 37-29" /><circle className="visual-solid" cx="55" cy="80" r="5" /><circle className="visual-solid" cx="84" cy="62" r="5" /><circle className="visual-solid" cx="105" cy="66" r="5" /><circle className="visual-solid" cx="142" cy="37" r="5" /><path className="visual-line" d="M52 101h116" /></VisualSvg>;
    case "approval-scan":
      return <VisualSvg><circle className="visual-surface" cx="88" cy="66" r="43" /><circle className="visual-line-ring" cx="88" cy="66" r="27" /><circle className="visual-line-ring" cx="88" cy="66" r="12" /><path className="visual-accent-line visual-heavy" d="M88 66 119 43" /><circle className="visual-solid" cx="88" cy="66" r="5" /><rect className="visual-surface" x="137" y="43" width="48" height="47" rx="12" /><path className="visual-accent-line" d="M149 57h24M149 69h17M149 80h21" /></VisualSvg>;
    case "risk-review":
      return <VisualSvg><rect className="visual-surface" x="38" y="25" width="140" height="83" rx="17" /><path className="visual-line" d="M56 45h57M56 62h44M56 79h67" /><path className="visual-accent-fill" d="m149 45 19 34h-38z" /><path className="visual-surface-line visual-heavy" d="M149 57v10m0 6h.1" /><path className="visual-accent-line" d="M56 95h92" /></VisualSvg>;
    case "revoke":
      return <VisualSvg><rect className="visual-surface" x="35" y="43" width="146" height="48" rx="15" /><circle className="visual-accent-fill" cx="62" cy="67" r="13" /><path className="visual-line" d="M85 58h71M85 72h46" /><path className="visual-accent-line visual-heavy" d="m140 87 29-40M140 47l29 40" /><path className="visual-line" d="M53 67h18" /></VisualSvg>;
    case "roles":
      return <VisualSvg><rect className="visual-surface" x="83" y="48" width="50" height="46" rx="12" /><path className="visual-accent-line" d="M95 63h26M95 76h18" /><circle className="visual-solid" cx="47" cy="43" r="12" /><circle className="visual-solid" cx="169" cy="43" r="12" /><circle className="visual-solid" cx="108" cy="112" r="12" /><path className="visual-line" d="M58 48 83 60m75-12-25 12m-25 34v6" /><path className="visual-accent-fill" d="M34 69c3-12 23-12 26 0M156 69c3-12 23-12 26 0M95 130c3-12 23-12 26 0" /></VisualSvg>;
    case "lifecycle":
      return <VisualSvg><path className="visual-line visual-heavy" d="M38 67h140" /><circle className="visual-solid" cx="43" cy="67" r="11" /><circle className="visual-surface" cx="86" cy="67" r="11" /><circle className="visual-surface" cx="130" cy="67" r="11" /><circle className="visual-accent-fill" cx="174" cy="67" r="11" /><path className="visual-accent-line" d="m167 67 5 5 9-12" /><path className="visual-line" d="M31 94h24M74 94h24M118 94h24M162 94h24" /></VisualSvg>;
    case "wallet-sync":
      return <VisualSvg><rect className="visual-surface" x="28" y="41" width="72" height="55" rx="14" /><path className="visual-accent-fill" d="M75 59h32v20H75a10 10 0 0 1 0-20" /><circle className="visual-surface" cx="85" cy="69" r="4" /><rect className="visual-surface" x="132" y="32" width="58" height="72" rx="14" /><path className="visual-accent-line" d="M145 49h32M145 62h22M145 76h29M145 89h18" /><path className="visual-line visual-heavy" d="M105 50h22m-7-6 7 6-7 6M129 87h-23m7-6-7 6 7 6" /></VisualSvg>;
    case "frontend-system":
      return <VisualSvg><rect className="visual-surface" x="31" y="27" width="154" height="82" rx="17" /><path className="visual-line" d="M31 48h154M62 48v61" /><circle className="visual-solid" cx="45" cy="38" r="3" /><circle className="visual-solid" cx="55" cy="38" r="3" /><path className="visual-accent-line" d="M76 62h42M76 75h88M76 89h65M43 63h8M43 77h8M43 91h8" /></VisualSvg>;
    case "information":
      return <VisualSvg><rect className="visual-surface visual-back" x="62" y="22" width="91" height="89" rx="14" /><rect className="visual-surface" x="47" y="29" width="91" height="89" rx="14" /><path className="visual-line" d="M62 49h48M62 62h58M62 75h41M62 88h52" /><circle className="visual-accent-fill" cx="145" cy="81" r="20" /><circle className="visual-surface" cx="145" cy="81" r="9" /><path className="visual-accent-line visual-heavy" d="m152 88 14 14" /></VisualSvg>;
    case "collaboration":
      return <VisualSvg><rect className="visual-surface" x="41" y="34" width="134" height="70" rx="16" /><path className="visual-line" d="M74 34v70M74 56h101" /><circle className="visual-solid" cx="57" cy="47" r="5" /><path className="visual-accent-line" d="M87 71h42M87 84h66" /><path className="visual-accent-fill" d="m47 83 16-7-6 17-3-7zM142 43l16-7-6 17-3-7z" /><path className="visual-line" d="M56 84 79 69m71-25-16 16" /></VisualSvg>;
  }
}

function CapabilityGroup({ capability, index }: { capability: ProjectCapability; index: number }) {
  const proofStyle = {
    "--proof-rotation": `${index % 2 === 0 ? -0.65 : 0.7}deg`,
    "--proof-offset": `${index % 3 === 0 ? -5 : index % 3 === 1 ? 6 : -2}px`,
    "--pin-x": `${index % 2 === 0 ? 54 : 47}%`,
  } as CSSProperties;

  return (
    <article className="project-capability-group">
      <div className="project-capability-card">
        <div className="project-capability-visual"><CapabilityVisual type={capability.visual} /></div>
        <div className="project-capability-copy">
          <h4>{capability.title}</h4>
          <p>{capability.description}</p>
        </div>
      </div>
      <div className="project-proof-note" style={proofStyle}>
        <ProjectPin quiet />
        <span className="project-proof-check" aria-hidden="true">✓</span>
        <p>{capability.proof}</p>
      </div>
    </article>
  );
}

export function ProjectCapabilityGrid({ project }: { project: Project }) {
  return (
    <section className="project-story" aria-labelledby={`${project.key}-capabilities`}>
      <div className="project-section-heading">
        <h3 id={`${project.key}-capabilities`}>Core capabilities</h3>
        <p>What the project demonstrates and the implementation evidence behind each claim.</p>
      </div>
      <div className="project-capability-grid">
        {project.capabilities.map((capability, index) => <CapabilityGroup capability={capability} index={index} key={capability.id} />)}
      </div>
    </section>
  );
}

export function ProjectMetadata({ project }: { project: Project }) {
  return (
    <section className="project-metadata-section" aria-label={`${project.title} metadata`}>
      <div className="project-meta">
        {project.meta.map(([label, value]) => <div className="meta-item" key={label}><span className="meta-label">{label}</span><span className="meta-value">{value}</span></div>)}
      </div>
    </section>
  );
}
