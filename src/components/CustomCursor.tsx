import { useEffect, useRef } from "react";

/**
 * Premium custom cursor: a sharp dot + a soft glowing ring that trails with
 * easing. The ring expands and brightens over interactive elements
 * (anchors, buttons, [data-cursor]).
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable on devices with a fine pointer.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    document.body.classList.add("custom-cursor");
    const dot = dotRef.current!;
    const ring = ringRef.current!;

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
      const interactive = target.closest(
        "a, button, .btn, [data-cursor], input, textarea"
      );
      ring.classList.toggle("is-active", !!interactive);
    };

    const loop = () => {
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      raf = requestAnimationFrame(loop);
    };

    const onDown = () => ring.classList.add("is-down");
    const onUp = () => ring.classList.remove("is-down");

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
    </>
  );
}
