import { ProjectCarousel } from "../project/ProjectCarousel";
import type { Project } from "../../types/portfolio";

export function ProjectWindow({ project }: { project: Project }) {
  return (
    <div className="window-body">
      <div className="project-content">
        <div className="project-heading-row">
          <h2>{project.title}</h2>
          <div className="project-actions" aria-label={`${project.title} links`}>
            {project.liveUrl && <a className="project-live-link" href={project.liveUrl} target="_blank" rel="noreferrer" data-cuelume-hover="tick" data-cuelume-press="press" data-cuelume-release="pulse">View live ↗</a>}
            {project.repoUrl && <a className="project-source-link" href={project.repoUrl} target="_blank" rel="noreferrer" data-cuelume-hover="tick" data-cuelume-press="press" data-cuelume-release="release">Source ↗</a>}
          </div>
        </div>
        <p className="project-description">{project.description}</p>
        <ul className="project-highlights">{project.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
        <div className="project-meta">
          {project.meta.map(([label, value]) => <div className="meta-item" key={label}><span className="meta-label">{label}</span><span className="meta-value">{value}</span></div>)}
        </div>
        {project.images.length > 0 ? (
          <div className="project-gallery project-gallery--carousel"><ProjectCarousel project={project} /></div>
        ) : (
          <div className="project-preview-unavailable">
            <img src={project.icon} alt="" />
            <div><span className="project-preview-eyebrow">Repository preview</span><h3>No fabricated screenshots</h3><p>{project.previewNote}</p></div>
          </div>
        )}
      </div>
    </div>
  );
}
