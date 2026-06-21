import { useEffect, useRef } from "react";

/**
 * Renders an image as a cloud of small colored particles that assemble into the
 * picture on load (spring-converge from a scattered start) and scatter away from
 * the cursor. Near-white background pixels are skipped so only the subject forms.
 *
 * Canvas2D, DPR-capped, pauses when scrolled out of view.
 */
export function ParticleImage({ src, alt }: { src: string; alt?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Fixed internal resolution — the canvas is CSS-stretched to fill the frame,
    // so particle detail stays high regardless of the frame's on-screen size.
    const RES = 440;

    type P = { x: number; y: number; tx: number; ty: number; vx: number; vy: number; color: string };
    let particles: P[] = [];
    let size = 0;
    let raf = 0;
    const mouse = { x: -9999, y: -9999 };

    const img = new Image();

    const build = () => {
      size = RES;
      canvas.width = RES;
      canvas.height = RES;
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      // sample the image (drawn "cover" into a square) at display resolution
      const off = document.createElement("canvas");
      off.width = size;
      off.height = size;
      const octx = off.getContext("2d")!;
      // ZOOM > 1 crops the illustration's white border so the subject fills the frame
      const ZOOM = 1.32;
      const scale = Math.max(size / img.width, size / img.height) * ZOOM;
      const dw = img.width * scale;
      const dh = img.height * scale;
      octx.drawImage(img, (size - dw) / 2, (size - dh) / 2, dw, dh);
      const data = octx.getImageData(0, 0, size, size).data;

      // larger frames use slightly wider spacing to keep particle counts sane
      const step = size > 700 ? 7 : size > 560 ? 6 : size > 360 ? 5 : 4;
      const next: P[] = [];
      for (let y = 0; y < size; y += step) {
        for (let x = 0; x < size; x += step) {
          const i = (y * size + x) * 4;
          if (data[i + 3] < 128) continue;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if ((r + g + b) / 3 > 238) continue; // drop near-white background
          next.push({
            tx: x,
            ty: y,
            x: Math.random() * size,
            y: Math.random() * size,
            vx: 0,
            vy: 0,
            color: `rgb(${r},${g},${b})`,
          });
        }
      }
      particles = next;
    };

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      for (const p of particles) {
        // spring toward target
        p.vx = (p.vx + (p.tx - p.x) * 0.02) * 0.86;
        p.vy = (p.vy + (p.ty - p.y) * 0.02) * 0.86;
        // scatter away from the cursor
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const md2 = mdx * mdx + mdy * mdy;
        if (md2 < 62 * 62) {
          const d = Math.sqrt(md2) || 1;
          const f = ((62 - d) / 62) * 4.5;
          p.vx += (mdx / d) * f;
          p.vy += (mdy / d) * f;
        }
        p.x += p.vx;
        p.y += p.vy;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 1.8, 1.8);
      }
      raf = requestAnimationFrame(render);
    };

    const start = () => {
      if (reduce) {
        for (const p of particles) {
          p.x = p.tx;
          p.y = p.ty;
        }
      }
      if (!raf) raf = requestAnimationFrame(render);
    };

    // Defer the heavy pixel-sampling/particle build off the critical path so it
    // doesn't block the main thread during load (lowers Total Blocking Time).
    const onLoad = () => {
      const run = () => {
        build();
        updateRect();
        start();
      };
      const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
      if (ric) ric(run, { timeout: 600 });
      else setTimeout(run, 0);
    };
    img.addEventListener("load", onLoad);
    img.src = src;
    if (img.complete && img.naturalWidth) onLoad();

    // Cache the canvas rect; recompute on scroll/resize instead of every move
    // (reading getBoundingClientRect per mousemove forces a synchronous reflow).
    let rect = canvas.getBoundingClientRect();
    const updateRect = () => {
      rect = canvas.getBoundingClientRect();
    };
    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX - rect.left) * (size / rect.width);
      mouse.y = (e.clientY - rect.top) * (size / rect.height);
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", updateRect, { passive: true });
    window.addEventListener("resize", updateRect);
    canvas.addEventListener("mouseleave", onLeave);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!raf && particles.length) raf = requestAnimationFrame(render);
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      img.removeEventListener("load", onLoad);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", updateRect);
      window.removeEventListener("resize", updateRect);
      canvas.removeEventListener("mouseleave", onLeave);
      io.disconnect();
    };
  }, [src]);

  return <canvas ref={canvasRef} className="hero__particle-img" role="img" aria-label={alt} />;
}
