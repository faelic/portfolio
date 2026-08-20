import { lazy, Suspense } from "react";

const LocationGlobe = lazy(() =>
  import("../map/LocationGlobe").then((module) => ({ default: module.LocationGlobe })),
);

export function AboutWindow() {
  return (
    <div className="window-body">
      <div className="about-content">
        <h2>About me</h2>
        <section className="identity" aria-label="Profile details">
          <div className="identity-avatar" role="img" aria-label="Favour avatar"><span aria-hidden="true">👨🏾‍💻</span></div>
          <dl className="identity-data">
            <div><dt>NAME</dt><dd>Favour Chukwuemerie Ututu</dd></div>
            <div><dt>POSITION</dt><dd>Software Engineer</dd></div>
            <div><dt>MAIL</dt><dd><a href="mailto:hello@favourututu.com">hello@favourututu.com</a></dd></div>
          </dl>
        </section>
        <section className="bio-card">
          <p>
            Most of what I build starts with curiosity: how something works beneath the surface,
            why it was designed that way, and whether there&apos;s a better way to approach it.
          </p>
          <p>
            I&apos;m a software engineer who enjoys moving across layers of the stack, from backend
            systems with Go and distributed systems to frontend development and blockchain. I
            don&apos;t particularly like putting myself in one box. I&apos;m more interested in becoming
            a well-rounded builder who can understand a problem deeply and use the right tools to
            solve it.
          </p>
          <p>
            AI has made that even more interesting. I see it less as something to replace the
            fundamentals and more as a tool that can expand how quickly I learn, experiment, and
            turn ideas into working software.
          </p>
          <p>
            I&apos;m ambitious about where I&apos;m going, but equally aware of how much there is still
            to learn. That keeps me curious, keeps me building, and keeps me open to ideas well
            beyond whatever happens to be my current area of expertise.
          </p>
        </section>
        <section className="location-block">
          <h3>Location</h3>
          <Suspense fallback={<div className="map-card map-card--loading"><p className="location-map-status">Preparing interactive globe…</p></div>}>
            <LocationGlobe />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
