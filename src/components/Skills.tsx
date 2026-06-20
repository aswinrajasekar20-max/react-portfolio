import { useRef } from "react";
import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { techStack, type Tech } from "../data";

/** A single glass skill tile with cursor-tracked 3D tilt + reactive glow. */
function SkillCard({ tech, index }: { tech: Tech; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -16;
    const ry = (px - 0.5) * 16;
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{
        duration: 0.7,
        delay: (index % 6) * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <div
        ref={ref}
        className="skill glass"
        data-cursor
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ ["--accent" as string]: tech.color }}
      >
        <span className="skill__spot" />
        <span
          className="skill__icon"
          dangerouslySetInnerHTML={{ __html: tech.icon }}
        />
        <span className="skill__name">{tech.name}</span>
        <span className="skill__ring" />
      </div>
    </motion.div>
  );
}

export function Skills() {
  return (
    <section id="skills" className="skills">
      <span className="section-index">02</span>
      <div className="container">
        <div className="skills__head">
          <Reveal>
            <span className="eyebrow">Toolkit</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="section-title">
              The <span className="grad">technologies</span> I build with
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="section-lead">
              A living matrix of frontend, backend and tooling — each tile reacts
              to your cursor in real 3D space.
            </p>
          </Reveal>
        </div>

        <div className="skills__grid">
          {techStack.map((t, i) => (
            <SkillCard key={t.name} tech={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
