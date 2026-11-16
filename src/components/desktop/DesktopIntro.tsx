import { profile, portfolioPresentation } from "../../data/profile";
import type { ProjectKey } from "../../types/portfolio";
import { PortraitAvatar } from "../shared/PortraitAvatar";
import { projects } from "../../data/projects";
import { AnimatedIcon } from "../icons/AnimatedIcon";

export function DesktopIntro({ onOpen }: { onOpen: (project: ProjectKey, opener: HTMLElement) => void }) {
  return <section className="desktop-intro" aria-labelledby="portfolio-name">
    <div className="desktop-intro-identity">
      <PortraitAvatar className="desktop-intro-avatar" large decorative />
      <p className="desktop-intro-role">{profile.position}</p>
    </div>
    <h2 id="portfolio-name" className="desktop-intro-summary">{portfolioPresentation.summary}</h2>
    <nav className="desktop-intro-actions" aria-label="Explore Favour's work">
      <button type="button" className="intro-primary" onClick={event => onOpen(portfolioPresentation.featuredProject, event.currentTarget)}>Start with {projects[portfolioPresentation.featuredProject].title}</button>
      <a className="intro-contact" href={`mailto:${profile.email}`}><AnimatedIcon name="envelope"/><span>Contact</span></a>
      {portfolioPresentation.resumeUrl && <a href={portfolioPresentation.resumeUrl} target="_blank" rel="noopener noreferrer">View résumé</a>}
    </nav>
  </section>;
}
