import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Reveal } from "./Reveal";
import { statsData } from "../data";

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const DURATION = 1600;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref} className="stat__num">
      {n}
      <i className="stat__suffix">{suffix}</i>
    </span>
  );
}

export function Stats() {
  return (
    <section className="stats">
      <div className="container">
        <Reveal>
          <div className="stats__strip glass">
            {statsData.map((s) => (
              <div key={s.label} className="stat">
                <Counter value={s.value} suffix={s.suffix} />
                <span className="stat__label">{s.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
