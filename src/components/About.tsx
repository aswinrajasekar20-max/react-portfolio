import { Reveal } from "./Reveal";
import { defaultConfig } from "../data";
import profileImg from "../assets/aswin-profile.webp";

const FACTS = [
  { k: "Based in", v: "Chennai, India" },
  { k: "Role", v: "Full Stack Developer" },
  { k: "Education", v: "BBA Graduate" },
  { k: "Trained at", v: "Freshworks STS" },
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
          <div className="about__photo glass">
            <img src={profileImg} alt="Aswin Rajasekar" width={350} height={500} loading="lazy" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
