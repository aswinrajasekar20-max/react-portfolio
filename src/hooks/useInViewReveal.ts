import { useEffect, useRef, useState } from "react";

/**
 * Lightweight IntersectionObserver reveal — returns a ref + boolean that
 * flips true the first time the element scrolls into view. Used by sections
 * that prefer plain CSS reveals over Framer Motion.
 */
export function useInViewReveal<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown, threshold]);

  return { ref, shown };
}
