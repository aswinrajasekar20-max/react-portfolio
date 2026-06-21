import { useEffect, useRef } from "react";

/**
 * Premium custom cursor — performance-tuned:
 *   • mousemove only stores coordinates (no DOM work, no layout reads).
 *   • hover/drag detection runs on `pointerover` and short-circuits unless the
 *     hovered element actually changed (so closest() isn't called every pixel).
 *   • all transforms are written once per frame in a single rAF loop using
 *     translate3d (GPU-composited), and class toggles only fire on state change.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    document.body.classList.add("custom-cursor");
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const drag = dragRef.current!;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let dx = mx;
    let dy = my;
    let rx = mx;
    let ry = my;
    let raf = 0;

    let lastEl: Element | null = null;
    let overDrag = false;
    let interactive = false;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    // Only recompute hover state when the pointer enters a different element.
    const onOver = (e: Event) => {
      const t = e.target as Element | null;
      if (t === lastEl) return;
      lastEl = t;
      const od = !!t?.closest('[data-cursor="drag"]');
      const it = !!t?.closest("a, button, .btn, [data-cursor], input, textarea");

      if (od !== overDrag) {
        overDrag = od;
        drag.classList.toggle("is-on", od);
        dot.classList.toggle("is-hidden", od);
        ring.classList.toggle("is-hidden", od);
      }
      if (it !== interactive) interactive = it;
      ring.classList.toggle("is-active", interactive && !overDrag);
    };

    const onDown = () => {
      ring.classList.add("is-down");
      drag.classList.add("is-grab");
    };
    const onUp = () => {
      ring.classList.remove("is-down");
      drag.classList.remove("is-grab");
    };

    const loop = () => {
      dx += (mx - dx) * 0.6; // dot — snappy
      dy += (my - dy) * 0.6;
      rx += (mx - rx) * 0.18; // ring — trailing
      ry += (my - ry) * 0.18;
      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      drag.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    raf = requestAnimationFrame(loop);

    return () => {
      document.body.classList.remove("custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden />
      <div ref={ringRef} className="cursor-ring" aria-hidden />
      <div ref={dragRef} className="cursor-drag" aria-hidden>
        <svg className="cursor-drag__icon" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="9" cy="6" r="1.5" />
          <circle cx="15" cy="6" r="1.5" />
          <circle cx="9" cy="12" r="1.5" />
          <circle cx="15" cy="12" r="1.5" />
          <circle cx="9" cy="18" r="1.5" />
          <circle cx="15" cy="18" r="1.5" />
        </svg>
        <span className="cursor-drag__label">DRAG</span>
      </div>
    </>
  );
}
