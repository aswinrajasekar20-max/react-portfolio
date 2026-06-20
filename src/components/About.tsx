import { Reveal } from "./Reveal";
import { defaultConfig } from "../data";

const FACTS = [
  { k: "Based in", v: "Chennai, India" },
  { k: "Focus", v: "Full Stack Web" },
  { k: "Learning at", v: "Freshworks STS" },
  { k: "Origin", v: "Thoothukudi" },
];

export function About() {
  return (
    <section id="about" className="about">
      <span className="section-index">01</span>
      <div className="container about__grid">
        <div className="about__intro">
          <Reveal>
            <span className="eyebrow">The Story</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="section-title">
              Crafting the web with <span className="grad">intent</span> &amp;
              curiosity
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="about__text">{defaultConfig.about_text}</p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="about__facts">
              {FACTS.map((f) => (
                <div key={f.k} className="about__fact glass">
                  <span className="about__fact-k">{f.k}</span>
                  <span className="about__fact-v">{f.v}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="about__aside">
          <div className="about__card glass">
            <div className="about__avatar">
              <span>A</span>
              <i className="about__avatar-glow" />
            </div>
            <h3 className="about__card-name">Aswin Rajasekar</h3>
            <p className="about__card-role">Full Stack Developer</p>
            <div className="about__quote">
              “I build scalable, user-friendly applications — and obsess over
              the details that make them feel effortless.”
            </div>
            <div className="about__links">
              <a className="pill" href={defaultConfig.github_url} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
              <a className="pill" href={defaultConfig.linkedin_url} target="_blank" rel="noreferrer">
                LinkedIn ↗
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
