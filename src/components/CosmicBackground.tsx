import { useEffect, useRef } from "react";

/**
 * The living, layered atmosphere behind everything:
 *   1. animated cosmic gradient (CSS)
 *   2. floating glowing particles with depth + parallax (canvas)
 *   3. slowly shifting aurora light blobs (CSS)
 *   4. subtle film-grain noise (CSS)
 *   5. volumetric light rays (CSS)
 * The canvas is throttled and DPR-capped to hold 60fps.
 */
export function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.4);

    type P = {
      x: number;
      y: number;
      z: number; // depth 0..1
      r: number;
      vx: number;
      vy: number;
      hue: number;
    };
    let particles: P[] = [];

    const palette = [199, 188, 258, 280]; // blue, cyan, purple, violet hues

    const build = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const density = Math.min(80, Math.floor((width * height) / 24000));
      particles = Array.from({ length: density }, () => {
        const z = Math.random();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          z,
          r: 0.6 + z * 2.4,
          vx: (Math.random() - 0.5) * 0.12 * (0.4 + z),
          vy: (Math.random() - 0.5) * 0.12 * (0.4 + z),
          hue: palette[(Math.random() * palette.length) | 0],
        };
      });
    };

    let mx = 0;
    let my = 0;
    const onMouse = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    let raf = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        // wrap around edges
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // parallax offset by depth
        const ox = mx * p.z * 26;
        const oy = my * p.z * 26;

        const alpha = 0.18 + p.z * 0.55;
        ctx.beginPath();
        ctx.arc(p.x + ox, p.y + oy, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${alpha})`;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 65%, ${alpha})`;
        ctx.shadowBlur = 4 + p.z * 8;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(render);
    };

    build();
    window.addEventListener("resize", build);
    window.addEventListener("mousemove", onMouse);
    if (!reduce) raf = requestAnimationFrame(render);
    else {
      // draw a single static frame
      render();
      cancelAnimationFrame(raf);
    }

    return () => {
      window.removeEventListener("resize", build);
      window.removeEventListener("mousemove", onMouse);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="cosmos" aria-hidden>
      <div className="cosmos__gradient" />
      <div className="cosmos__aurora">
        <span className="blob blob--blue" />
        <span className="blob blob--purple" />
        <span className="blob blob--cyan" />
      </div>
      <div className="cosmos__rays" />
      <canvas ref={canvasRef} className="cosmos__particles" />
      <div className="cosmos__noise" />
      <div className="cosmos__vignette" />
    </div>
  );
}
