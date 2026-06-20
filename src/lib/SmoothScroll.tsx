import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Shared singleton so other components (e.g. the pinned projects carousel)
// can programmatically scroll through Lenis.
let lenisSingleton: Lenis | null = null;
export const getLenis = () => lenisSingleton;

/**
 * Drives ultra-smooth, premium-feeling scrolling with Lenis and syncs it to
 * GSAP's ScrollTrigger + ticker so every scroll-based reveal stays in lockstep
 * (no jank, no double rAF loops).
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });
    lenisRef.current = lenis;
    lenisSingleton = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisRef.current = null;
      lenisSingleton = null;
    };
  }, []);

  return <>{children}</>;
}
