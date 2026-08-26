import type { Project } from "../../types/portfolio";

function ExternalLinkIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M7 4h9v9M16 4 8.5 11.5M14 10v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2.5a9.7 9.7 0 0 0-3.07 18.9c.49.09.67-.21.67-.47v-1.86c-2.72.59-3.29-1.16-3.29-1.16-.44-1.13-1.09-1.43-1.09-1.43-.89-.61.07-.6.07-.6.98.07 1.5 1.01 1.5 1.01.88 1.5 2.3 1.07 2.86.82.09-.64.34-1.07.62-1.32-2.17-.25-4.46-1.09-4.46-4.84 0-1.07.38-1.94 1.01-2.63-.1-.25-.44-1.25.1-2.59 0 0 .82-.26 2.67 1.01a9.3 9.3 0 0 1 4.86 0c1.85-1.27 2.67-1.01 2.67-1.01.54 1.34.2 2.34.1 2.59.63.69 1.01 1.56 1.01 2.63 0 3.76-2.29 4.58-4.47 4.83.35.3.66.9.66 1.81v2.69c0 .26.18.57.67.47A9.7 9.7 0 0 0 12 2.5Z" />
    </svg>
  );
}

export function ProjectWindow({ project }: { project: Project }) {
  const featuredImage = project.images[project.featuredImageIndex ?? 0];
  const renderStoryCopy = (copy: string) => {
    return copy
      .split(/\n{2,}/g)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .map((paragraph, index) => <p key={`${project.key}-story-${index}`}>{paragraph}</p>);
  };

  return (
    <div className="window-body">
      <div className="project-workspace">
        <section className="project-scroll-panel" aria-label={`${project.title} project details`}>
          <div className="project-scroll-content">
            <article className="project-case-layout" aria-labelledby={`${project.key}-case-title`}>
              <div className="project-featured-column">
                {featuredImage ? (
                  <figure className="project-featured-media">
                    <img src={featuredImage.src} alt={featuredImage.alt} decoding="async" />
                  </figure>
                ) : (
                  <div className="project-featured-empty" role="img" aria-label={`${project.title} has no deployed interface screenshot`}>
                    <img src={project.icon} alt="" aria-hidden="true" />
                    <strong>Repository-only project</strong>
                    <span>No fabricated product screenshot.</span>
                  </div>
                )}
              </div>

              <div className="project-window-story">
                <h2 id={`${project.key}-case-title`}>{project.title}</h2>

                <section className="project-window-story-section">
                  <h3>{project.windowStory.learnedTitle ?? "What I learnt"}</h3>
                  {renderStoryCopy(project.windowStory.learned)}
                </section>

                <section className="project-window-story-section project-window-story-section--how-works">
                  <h3>How it works</h3>
                  {renderStoryCopy(project.windowStory.howItWorks)}
                </section>

                <section className="project-window-story-section project-window-stack" aria-labelledby={`${project.key}-stack-title`}>
                  <h3 id={`${project.key}-stack-title`}>Tech stack</h3>
                  <ul>
                    {project.techStack.map((technology) => <li key={technology}>{technology}</li>)}
                  </ul>
                </section>

                {(project.liveUrl || project.repoUrl) && (
                  <nav className="project-window-links" aria-label={`${project.title} project links`}>
                    {project.liveUrl && (
                      <a className="project-window-link project-window-link--live" href={project.liveUrl} target="_blank" rel="noreferrer" data-cuelume-hover="tick" data-cuelume-press="press" data-cuelume-release="pulse">
                        <span>View live</span>
                        <ExternalLinkIcon />
                      </a>
                    )}
                    {project.repoUrl && (
                      <a className="project-window-link project-window-link--github" href={project.repoUrl} target="_blank" rel="noreferrer" data-cuelume-hover="tick" data-cuelume-press="press" data-cuelume-release="release">
                        <GitHubIcon />
                        <span>GitHub</span>
                      </a>
                    )}
                  </nav>
                )}
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
