import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HeroParticles } from "./HeroParticles";
import { defaultConfig } from "../data";
import { useMagnetic } from "../hooks/useMagnetic";

/** Cycling typewriter for the role line. */
function useTypewriter(words: string[], speed = 80, pause = 1500) {
  const [text, setText] = useState("");
  const [i, setI] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[i % words.length];
    let delay = deleting ? speed / 2 : speed;

    if (!deleting && text === current) {
      delay = pause;
      const t = setTimeout(() => setDeleting(true), delay);
      return () => clearTimeout(t);
    }
    if (deleting && text === "") {
      setDeleting(false);
      setI((v) => v + 1);
      return;
    }
    const t = setTimeout(() => {
      setText((prev) =>
        deleting
          ? current.slice(0, prev.length - 1)
          : current.slice(0, prev.length + 1)
      );
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, i, words, speed, pause]);

  return text;
}

function MagneticButton({
  children,
  href,
  primary,
}: {
  children: React.ReactNode;
  href: string;
  primary?: boolean;
}) {
  const mag = useMagnetic<HTMLAnchorElement>(0.4);
  return (
    <a
      ref={mag.ref}
      onMouseMove={mag.onMouseMove}
      onMouseLeave={mag.onMouseLeave}
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className={`btn ${primary ? "btn-primary" : ""}`}
    >
      {children}
    </a>
  );
}

export function Hero({ started }: { started: boolean }) {
  const role = useTypewriter(defaultConfig.hero_titles);
  const name = defaultConfig.hero_name.trim();

  // Stagger config — only fires once the preloader has lifted.
  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };
  const letter = {
    hidden: { y: "110%", opacity: 0 },
    show: {
      y: "0%",
      opacity: 1,
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
    },
  };
  const fade = {
    hidden: { y: 26, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section id="home" className="hero">
      <HeroParticles />
      <div className="hero__glowfloor" />

      <motion.div
        className="hero__content container"
        variants={container}
        initial="hidden"
        animate={started ? "show" : "hidden"}
      >
        <motion.span className="hero__badge glass" variants={fade}>
          <span className="hero__dot" /> Available for opportunities
        </motion.span>

        <h1 className="hero__name">
          <span className="hero__line">
            {"Hi, I'm".split("").map((c, idx) => (
              <span key={idx} className="hero__letterwrap">
                <motion.span className="hero__letter dim" variants={letter}>
                  {c === " " ? " " : c}
                </motion.span>
              </span>
            ))}
          </span>
          <span className="hero__line hero__line--accent">
            {name.replace("I'm", "").trim().split("").map((c, idx) => (
              <span key={idx} className="hero__letterwrap">
                <motion.span className="hero__letter grad" variants={letter}>
                  {c === " " ? " " : c}
                </motion.span>
              </span>
            ))}
          </span>
        </h1>

        <motion.div className="hero__role" variants={fade}>
          <span className="hero__role-text">{role}</span>
          <span className="hero__caret" />
        </motion.div>

        <motion.p className="hero__tagline" variants={fade}>
          {defaultConfig.hero_tagline}
        </motion.p>

        <motion.div className="hero__actions" variants={fade}>
          <MagneticButton href="#work" primary>
            View My Work
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </MagneticButton>
          <MagneticButton href={defaultConfig.github_url}>
            GitHub
          </MagneticButton>
        </motion.div>
      </motion.div>

      <motion.div
        className="hero__scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: started ? 0.7 : 0 }}
        transition={{ delay: 1.6, duration: 1 }}
      >
        <span>Scroll</span>
        <div className="hero__mouse">
          <i />
        </div>
      </motion.div>
    </section>
  );
}
