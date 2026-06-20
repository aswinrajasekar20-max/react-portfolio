import { useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { Reveal } from "./Reveal";
import { techStack } from "../data";

type Pt = { x: number; y: number };

/**
 * Skills grid where each glass card can be dragged. While you drag a card,
 * glowing elastic "threads" web out from it to every other card (and back to
 * its empty slot); on release the card springs home (dragSnapToOrigin).
 */
export function Skills() {
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const homes = useRef<Pt[]>([]);

  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragPos, setDragPos] = useState<Pt | null>(null);
  const [grid, setGrid] = useState({ w: 0, h: 0 });

  // Measure every card's home centre relative to the grid (called on drag start).
  const measure = () => {
    const g = gridRef.current;
    if (!g) return;
    const gr = g.getBoundingClientRect();
    setGrid({ w: gr.width, h: gr.height });
    homes.current = cardRefs.current.map((el) => {
      if (!el) return { x: 0, y: 0 };
      const r = el.getBoundingClientRect();
      return {
        x: r.left - gr.left + r.width / 2,
        y: r.top - gr.top + r.height / 2,
      };
    });
  };

  const onStart = (i: number) => {
    measure();
    setDragIdx(i);
    setDragPos(homes.current[i] ?? null);
  };
  const onDrag = (i: number, info: PanInfo) => {
    const h = homes.current[i];
    if (!h) return;
    setDragPos({ x: h.x + info.offset.x, y: h.y + info.offset.y });
  };
  const onEnd = () => {
    setDragIdx(null);
    setDragPos(null);
  };

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
              A living web of frontend, backend and tooling — grab any card and
              pull; it threads across the whole section, then snaps back home.
            </p>
          </Reveal>
        </div>

        <div ref={gridRef} className="skills__grid">
          {/* elastic thread web — only while dragging */}
          {dragIdx !== null && dragPos && (
            <svg
              className="skills__web"
              width={grid.w}
              height={grid.h}
              viewBox={`0 0 ${grid.w} ${grid.h}`}
            >
              <defs>
                <linearGradient id="thread" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#38bdf8" />
                  <stop offset="0.5" stopColor="#22d3ee" />
                  <stop offset="1" stopColor="#a855f7" />
                </linearGradient>
              </defs>

              {/* a single strong rope back to the card's home slot, with sag */}
              {homes.current[dragIdx] &&
                (() => {
                  const h = homes.current[dragIdx];
                  const dist = Math.hypot(dragPos.x - h.x, dragPos.y - h.y);
                  const mx = (dragPos.x + h.x) / 2;
                  const my = (dragPos.y + h.y) / 2 + dist * 0.16; // rope droop
                  const d = `M ${dragPos.x} ${dragPos.y} Q ${mx} ${my} ${h.x} ${h.y}`;
                  return (
                    <>
                      {/* soft outer glow */}
                      <path d={d} fill="none" stroke="url(#thread)" strokeWidth={9} opacity={0.18} />
                      {/* solid rope */}
                      <path d={d} fill="none" stroke="url(#thread)" strokeWidth={4} opacity={0.95} />
                      {/* anchor knot at the home slot */}
                      <circle cx={h.x} cy={h.y} r={5} fill="#22d3ee" opacity={0.9} />
                    </>
                  );
                })()}
            </svg>
          )}

          {techStack.map((tech, i) => (
            <SkillCard
              key={tech.name}
              tech={tech}
              index={i}
              setRef={(el) => (cardRefs.current[i] = el)}
              isDragging={dragIdx === i}
              onDragStart={() => onStart(i)}
              onDrag={(info) => onDrag(i, info)}
              onDragEnd={onEnd}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function SkillCard({
  tech,
  index,
  setRef,
  isDragging,
  onDragStart,
  onDrag,
  onDragEnd,
}: {
  tech: (typeof techStack)[number];
  index: number;
  setRef: (el: HTMLDivElement | null) => void;
  isDragging: boolean;
  onDragStart: () => void;
  onDrag: (info: PanInfo) => void;
  onDragEnd: () => void;
}) {
  const innerRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    if (isDragging) return;
    const el = innerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(py - 0.5) * -16}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 16}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };
  const onLeave = () => {
    const el = innerRef.current;
    if (!el) return;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
  };

  return (
    <motion.div
      ref={setRef}
      className={`skill-wrap ${isDragging ? "is-dragging" : ""}`}
      drag
      dragSnapToOrigin
      dragElastic={0.5}
      dragMomentum={false}
      onDragStart={onDragStart}
      onDrag={(_, info) => onDrag(info)}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.14, zIndex: 60 }}
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
        ref={innerRef}
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
