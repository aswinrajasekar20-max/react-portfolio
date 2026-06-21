import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Reveal } from "./Reveal";
import { getLenis } from "../lib/SmoothScroll";
import { projects, type Project } from "../data";

gsap.registerPlugin(ScrollTrigger);

const SPACING = 420; // px between card centres
const ANGLE = 38; // deg rotation per step
const DEPTH = 260; // z push-back per step
const LAST = projects.length - 1;

function hostOf(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return "live.preview";
  }
}

/** A single coverflow card; transform is derived from its distance to centre. */
function Card({
  project,
  pos,
  isActive,
  onClick,
}: {
  project: Project;
  pos: number; // signed distance from the active card (fractional)
  isActive: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const abs = Math.abs(pos);
  const [c1, c2] = project.gradient;

  const onMove = (e: React.MouseEvent) => {
    if (!isActive) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const transform = `translate(-50%, -50%) translateX(${pos * SPACING}px) translateZ(${-abs * DEPTH}px) rotateY(${pos * -ANGLE}deg) scale(${isActive ? 1 : 0.86})`;

  return (
    <div
      ref={ref}
      className={`pcard ${isActive ? "is-active" : ""}`}
      onClick={onClick}
      onMouseMove={onMove}
      data-cursor
      style={{
        transform,
        zIndex: 100 - Math.round(abs * 10),
        opacity: abs > 2.4 ? 0 : 1,
        filter: isActive
          ? "none"
          : `brightness(${1 - Math.min(abs * 0.18, 0.55)}) blur(${Math.min(abs * 1.4, 4)}px)`,
        pointerEvents: abs > 2.4 ? "none" : "auto",
      }}
    >
      <div className="pcard__frame glass">
        <span className="pcard__spotlight" />
        <div className="pcard__chrome">
          <span className="pcard__dots">
            <i /><i /><i />
          </span>
          <span className="pcard__url">{hostOf(project.live)}</span>
        </div>
        <div
          className="pcard__mesh"
          style={{ ["--c1" as string]: c1, ["--c2" as string]: c2 }}
        >
          <img className="pcard__img" src={project.image} alt={project.title} loading="lazy" />
          <span className="pcard__no">{String(project.id).padStart(2, "0")}</span>
          <span className="pcard__sheen" />
        </div>
      </div>
    </div>
  );
}

export function Projects() {
  // `pos` is a fractional index (0 → LAST) driven by scroll progress.
  const [pos, setPos] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);

  const active = Math.max(0, Math.min(LAST, Math.round(pos)));
  const current = projects[active];

  // ── Pin the section and map scroll progress → carousel position ──
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || LAST < 1) return;

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      // Give each project roughly ~85vh of scroll to advance through.
      end: () => "+=" + window.innerHeight * projects.length * 0.85,
      pin: true,
      pinSpacing: true,
      scrub: 0.5,
      snap: {
        snapTo: 1 / LAST,
        duration: { min: 0.2, max: 0.6 },
        ease: "power1.inOut",
      },
      invalidateOnRefresh: true,
      onUpdate: (self) => setPos(self.progress * LAST),
    });
    stRef.current = st;

    // Recalculate once everything (fonts/layout) settles.
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      clearTimeout(t);
      st.kill();
      stRef.current = null;
    };
  }, []);

  // Jump to a project by scrolling to its slice of the pinned range.
  const go = useCallback((i: number) => {
    const target = Math.max(0, Math.min(LAST, i));
    const st = stRef.current;
    if (!st || LAST < 1) {
      setPos(target);
      return;
    }
    const y = st.start + (target / LAST) * (st.end - st.start);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(y, { duration: 1 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  // Keyboard arrows — only while the section is pinned/active.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!stRef.current?.isActive) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(active + 1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(active - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, go]);

  return (
    <section id="work" className="projects" ref={sectionRef}>
      <span className="section-index">03</span>
      <div className="container projects__inner">
        <div className="projects__head">
          <Reveal>
            <span className="eyebrow">Selected Work</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="section-title">
              My <span className="grad">Projects</span>
            </h2>
          </Reveal>
        </div>

        {/* ── 3D coverflow stage ── */}
        <div className="coverflow">
          <div className="coverflow__stage">
            {projects.map((p, i) => (
              <Card
                key={p.id}
                project={p}
                pos={i - pos}
                isActive={Math.abs(i - pos) < 0.5}
                onClick={() => go(i)}
              />
            ))}
          </div>

          <button
            className="coverflow__arrow coverflow__arrow--prev"
            onClick={() => go(active - 1)}
            disabled={active === 0}
            aria-label="Previous project"
          >
            ‹
          </button>
          <button
            className="coverflow__arrow coverflow__arrow--next"
            onClick={() => go(active + 1)}
            disabled={active === LAST}
            aria-label="Next project"
          >
            ›
          </button>
        </div>

        {/* ── synced detail panel ── */}
        <div className="coverflow__panel">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              className="pdetail"
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="pdetail__title">{current.title}</h3>
              <p className="pdetail__desc">{current.description}</p>
              <div className="pdetail__tags">
                {current.tags.map((t) => (
                  <span key={t} className="pill">
                    {t}
                  </span>
                ))}
              </div>
              <div className="pdetail__actions">
                <a className="btn btn-primary" href={current.live} target="_blank" rel="noreferrer">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                  Live Demo
                </a>
                <a className="btn" href={current.github} target="_blank" rel="noreferrer">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  Source Code
                </a>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="coverflow__dots">
            {projects.map((p, i) => (
              <button
                key={p.id}
                className={`coverflow__dot ${i === active ? "is-active" : ""}`}
                onClick={() => go(i)}
                aria-label={`Go to ${p.title}`}
              />
            ))}
          </div>
          <span className="coverflow__counter">
            {String(active + 1).padStart(2, "0")}
            <i>/</i>
            {String(projects.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
