import { techStack } from "../data";

/** Infinite, edge-faded marquee of the tech names — a kinetic divider. */
export function Marquee() {
  const items = techStack.map((t) => t.name);
  const row = [...items, ...items]; // duplicated for seamless loop
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee__track">
        {row.map((name, i) => (
          <span key={i} className="marquee__item">
            {name}
            <i className="marquee__star">✦</i>
          </span>
        ))}
      </div>
    </div>
  );
}
