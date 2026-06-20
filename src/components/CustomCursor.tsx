import { useEffect, useRef } from "react";

/**
 * Premium custom cursor: a sharp dot + a soft glowing ring that trails with
 * easing. The ring expands over interactive elements ([data-cursor], links,
 * buttons). Over draggable skill cards ([data-cursor="drag"]) it morphs into a
 * unique "drag" cursor — a rotating dashed ring with a grip glyph + DRAG label.
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

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

      const target = e.target as HTMLElement;
      const overDrag = !!target.closest('[data-cursor="drag"]');
      const interactive = target.closest(
        "a, button, .btn, [data-cursor], input, textarea"
      );

      drag.classList.toggle("is-on", overDrag);
      dot.classList.toggle("is-hidden", overDrag);
      ring.classList.toggle("is-hidden", overDrag);
      ring.classList.toggle("is-active", !overDrag && !!interactive);
    };

    const loop = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      drag.style.transform = `translate(${ringX}px, ${ringY}px)`;
      raf = requestAnimationFrame(loop);
    };

    const onDown = () => {
      ring.classList.add("is-down");
      drag.classList.add("is-grab");
    };
    const onUp = () => {
      ring.classList.remove("is-down");
      drag.classList.remove("is-grab");
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    raf = requestAnimationFrame(loop);

    return () => {
      document.body.classList.remove("custom-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
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
