import { motion } from "framer-motion";
import { Reveal } from "./Reveal";
import { highlightsData, type Highlight } from "../data";

function TimelineNode({ item, index }: { item: Highlight; index: number }) {
  const [c1, c2] = item.gradient;
  return (
    <motion.div
      className="tl__row"
      initial={{ opacity: 0, x: index % 2 ? 60 : -60, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-15% 0px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="tl__node">
        <span className="tl__dot" style={{ background: c1, boxShadow: `0 0 22px ${c1}` }} />
      </div>
      <div className="tl__card glass" style={{ ["--c1" as string]: c1, ["--c2" as string]: c2 }}>
        <span className="tl__period pill">{item.period}</span>
        <div
          className="tl__icon"
          style={{ color: item.color }}
          dangerouslySetInnerHTML={{ __html: item.icon }}
        />
        <h3 className="tl__title">{item.title}</h3>
        <p className="tl__desc">{item.description}</p>
      </div>
    </motion.div>
  );
}

export function Journey() {
  return (
    <section id="journey" className="journey">
      <span className="section-index">04</span>
      <div className="container">
        <div className="journey__head">
          <Reveal>
            <span className="eyebrow">The Path</span>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="section-title">
              A <span className="grad">journey</span> of growth
            </h2>
          </Reveal>
        </div>

        <div className="tl">
          <div className="tl__spine">
            <motion.span
              className="tl__progress"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-20% 0px" }}
              transition={{ duration: 1.6, ease: "easeOut" }}
            />
          </div>
          {highlightsData.map((h, i) => (
            <TimelineNode key={`${h.title}-${i}`} item={h} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
