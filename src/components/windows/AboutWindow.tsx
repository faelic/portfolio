import { GlobeSection } from "../map/GlobeSection";
import { profile } from "../../data/profile";

export function AboutWindow({ active }: { active: boolean }) {
  return (
    <div className="window-body">
      <div className="about-workspace project-workspace">
        <section className="about-scroll-panel project-scroll-panel" aria-label="About Favour">
          <div className="about-content">
            <h2>About me</h2>
            <section className="identity" aria-label="Profile details">
              <div className="identity-avatar" role="img" aria-label="Favour avatar"><span aria-hidden="true">👨🏾‍💻</span></div>
              <dl className="identity-data">
                <div><dt>NAME</dt><dd>{profile.name}</dd></div>
                <div><dt>POSITION</dt><dd>{profile.position}</dd></div>
                <div><dt>MAIL</dt><dd><a href={`mailto:${profile.email}`}>{profile.email}</a></dd></div>
              </dl>
            </section>
            <section className="bio-card">
              {profile.biography.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            </section>
            <section className="location-block">
              <h3>Location</h3>
              <p className="location-summary">Based in Lagos, Nigeria</p>
              <GlobeSection active={active} />
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}
