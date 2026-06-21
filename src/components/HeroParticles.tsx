import { useEffect, useRef } from "react";

/**
 * Lightweight 2D canvas hero visual — twinkling stars + an interactive
 * "particle web": drifting nodes that link to nearby nodes and to the cursor,
 * with a gentle repulsion as you move through them.
 *
 * Pure Canvas2D (no WebGL / Three.js) so it stays tiny and holds 60fps.
 * Animation pauses automatically whenever the hero scrolls out of view.
 */
const NODE_COLORS = ["#38bdf8", "#22d3ee", "#a855f7"];
const LINK_DIST = 132;
const MOUSE_LINK = 184;
const MOUSE_PUSH = 150;

type Node = { x: number; y: number; vx: number; vy: number; r: number; c: string };
type Star = { x: number; y: number; r: number; t: number };

export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let w = 0;
    let h = 0;
    let nodes: Node[] = [];
    let stars: Star[] = [];
    const mouse = { x: -9999, y: -9999, active: false };

    const build = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const nodeCount = Math.min(72, Math.max(26, Math.floor((w * h) / 17000)));
      nodes = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.34,
        vy: (Math.random() - 0.5) * 0.34,
        r: 1.2 + Math.random() * 1.9,
        c: NODE_COLORS[(Math.random() * NODE_COLORS.length) | 0],
      }));

      const starCount = Math.min(140, Math.floor((w * h) / 9000));
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.1 + 0.2,
        t: Math.random() * Math.PI * 2,
      }));
    };

    // Cache the canvas rect; recompute on scroll/resize rather than reading
    // getBoundingClientRect on every mousemove (which forces a reflow).
    let rect = canvas.getBoundingClientRect();
    const updateRect = () => {
      rect = canvas.getBoundingClientRect();
    };
    const onMove = (e: MouseEvent) => {
      const ly = e.clientY - rect.top;
      mouse.x = e.clientX - rect.left;
      mouse.y = ly;
      mouse.active = ly >= 0 && ly <= h;
    };
    const onLeave = () => {
      mouse.active = false;
    };

    let raf = 0;
    const frame = (now: number) => {
      const time = now * 0.001;
      ctx.clearRect(0, 0, w, h);

      // twinkling stars
      for (const s of stars) {
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(time * 0.8 + s.t));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 224, 255, ${0.22 * tw})`;
        ctx.fill();
      }

      // move nodes + cursor repulsion
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        if (mouse.active) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MOUSE_PUSH * MOUSE_PUSH) {
            const d = Math.sqrt(d2) || 1;
            const f = ((MOUSE_PUSH - d) / MOUSE_PUSH) * 0.7;
            n.x += (dx / d) * f;
            n.y += (dy / d) * f;
          }
        }
      }

      // links between nodes + to the cursor
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const al = (1 - Math.sqrt(d2) / LINK_DIST) * 0.16;
            ctx.strokeStyle = `rgba(125, 185, 255, ${al})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        if (mouse.active) {
          const dx = a.x - mouse.x;
          const dy = a.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MOUSE_LINK * MOUSE_LINK) {
            const al = (1 - Math.sqrt(d2) / MOUSE_LINK) * 0.5;
            ctx.strokeStyle = `rgba(56, 189, 248, ${al})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // glowing nodes
      ctx.shadowBlur = 6;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.c;
        ctx.shadowColor = n.c;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(frame);
    };

    build();
    updateRect();
    const onResize = () => {
      build();
      updateRect();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", updateRect, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    canvas.addEventListener("mouseleave", onLeave);

    // Pause the loop when the hero leaves the viewport — saves CPU/battery.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!raf && !reduce) raf = requestAnimationFrame(frame);
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    if (reduce) frame(0); // one static frame
    else raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", updateRect);
      window.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      io.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero__particles" aria-hidden />;
}
