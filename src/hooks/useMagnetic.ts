import { useRef, useCallback } from "react";

/**
 * Magnetic hover: the element gently drifts toward the cursor while hovered,
 * then springs back. Pointer-fine devices only — no-ops on touch.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T | null>(null);

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    },
    [strength]
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = "translate(0px, 0px)";
  }, []);

  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}
