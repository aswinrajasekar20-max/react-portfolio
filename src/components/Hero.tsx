import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { HeroParticles } from "./HeroParticles";
import { defaultConfig } from "../data";
import { useMagnetic } from "../hooks/useMagnetic";
import { ParticleImage } from "./ParticleImage";
import heroImg from "../assets/image.webp";

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

  // Cursor-driven 3D tilt for the illustration (separate element so it doesn't
  // fight the frame's float / entrance animations).
  const tiltRef = useRef<HTMLDivElement>(null);
  const onVisualMove = (e: React.MouseEvent) => {
    const el = tiltRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1200px) rotateX(${-py * 5}deg) rotateY(${px * 6}deg)`;
  };
  const onVisualLeave = () => {
    if (tiltRef.current)
      tiltRef.current.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg)";
  };

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

      <div className="hero__layout container">
      <motion.div
        className="hero__content"
        variants={container}
        initial="hidden"
        animate={started ? "show" : "hidden"}
      >
        <motion.span className="hero__badge glass" variants={fade}>
          <span className="hero__dot" /> Hi there.
        </motion.span>

        <h1 className="hero__name">
          <span className="hero__line">
            {"I'm ".split("").map((c, idx) => (
              <span key={`d${idx}`} className="hero__letterwrap">
                <motion.span className="hero__letter dim" variants={letter}>
                  {c === " " ? " " : c}
                </motion.span>
              </span>
            ))}
            {name.replace("I'm", "").trim().split("").map((c, idx) => (
              <span key={`g${idx}`} className="hero__letterwrap">
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            GitHub
          </MagneticButton>
        </motion.div>
      </motion.div>

      <motion.div
        className="hero__visual"
        initial={{ opacity: 0, x: 70, scale: 0.9, filter: "blur(16px)" }}
        animate={
          started
            ? { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }
            : { opacity: 0 }
        }
        transition={{ duration: 1.1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
        onMouseMove={onVisualMove}
        onMouseLeave={onVisualLeave}
      >
        <div ref={tiltRef} className="hero__visual-tilt">
          <div className="hero__visual-frame">
            <span className="hero__visual-glow" />
            <ParticleImage src={heroImg} alt="Aswin coding at his desk" />
            <span className="hero__visual-sheen" />
          </div>
        </div>
      </motion.div>
      </div>

    </section>
  );
}
