import { lazy, Suspense } from "react";

const LocationGlobe = lazy(() =>
  import("../map/LocationGlobe").then((module) => ({ default: module.LocationGlobe })),
);

export function AboutWindow() {
  return (
    <div className="window-body">
      <div className="about-workspace project-workspace">
        <section className="about-scroll-panel project-scroll-panel" aria-label="About Favour">
          <div className="about-content">
            <h2>About me</h2>
            <section className="identity" aria-label="Profile details">
              <div className="identity-avatar" role="img" aria-label="Favour avatar"><span aria-hidden="true">👨🏾‍💻</span></div>
              <dl className="identity-data">
                <div><dt>NAME</dt><dd>Favour Chukwuemerie Ututu</dd></div>
                <div><dt>POSITION</dt><dd>Software Engineer</dd></div>
                <div><dt>MAIL</dt><dd><a href="mailto:ututufavour7@gmail.com">ututufavour7@gmail.com</a></dd></div>
              </dl>
            </section>
            <section className="bio-card">
              <p>
                I came into software from Quantity Surveying, so my path was not a straight one.
                What kept pulling me in was the need to understand how digital products worked
                beyond the screen: what happened after an action, where the data went, and why one
                implementation held up better than another. At some point, asking those questions
                was no longer enough, so I started building.
              </p>
              <p>
                Frontend work with React and TypeScript gave me a close view of how software
                becomes a product. On Policy.ng, I worked across public-facing pages and an admin
                dashboard, turning API-driven workflows into interfaces people could use. It taught
                me to see a product as a connected system rather than a collection of separate
                screens.
              </p>
              <p>
                That pushed me toward the backend. I wanted to understand where state lived, how
                systems handled failure, and how data stayed correct when requests were retried or
                happened at the same time. I began going deeper with Go, PostgreSQL, APIs,
                transactions, testing, and distributed-system patterns. My blockchain projects added
                another perspective, especially around permissions, on-chain state, and the
                difference between what an interface expects and what a system can actually
                guarantee.
              </p>
              <p>
                AI now helps me move through that learning process faster. I use it to explore
                unfamiliar ideas, compare approaches, and get to something I can test. But I still
                read the documentation, question the output, write tests, and trace the code until I
                understand why it works.
              </p>
              <p>
                Today, I am a backend-focused software engineer with full-stack range. My current
                focus is Go and reliable backend systems, while my frontend and blockchain
                experience helps me understand the product around the API. I am always open to
                learning, whether that means going deeper into core software engineering or stepping
                into an unfamiliar part of the stack when the problem calls for it. I care less about
                collecting tools than about understanding a problem well enough to make good
                decisions and build something that holds up.
              </p>
            </section>
            <section className="location-block">
              <h3>Location</h3>
              <Suspense fallback={<div className="map-card map-card--loading"><p className="location-map-status">Preparing interactive globe…</p></div>}>
                <LocationGlobe />
              </Suspense>
            </section>
          </div>
        </section>
      </div>
    </div>
  );
}
