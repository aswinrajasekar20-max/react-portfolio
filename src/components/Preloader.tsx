import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Cinematic boot sequence — black screen, a logo monogram resolves out of the
 * dark, a light sweep crosses the screen, a counter races to 100, then the
 * curtain lifts to reveal the hero. Apple-event / Marvel-title energy.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const DURATION = 1150;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      // ease-out
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        // Reveal only once webfonts are ready so the cursive swap doesn't cause
        // a layout shift on visible content (cuts CLS). Cap the wait so a slow
        // font never stalls the intro.
        const reveal = () => {
          setOpen(false);
          setTimeout(onDone, 750);
        };
        const fontsReady = (document as Document & { fonts?: FontFaceSet }).fonts
          ?.ready;
        Promise.race([
          fontsReady ?? Promise.resolve(),
          new Promise((r) => setTimeout(r, 1500)),
        ]).then(() => setTimeout(reveal, 100));
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* curtain panels that split apart */}
          <motion.div
            className="preloader__panel preloader__panel--top"
            initial={{ y: 0 }}
            animate={open ? { y: 0 } : {}}
            exit={{ y: "-101%" }}
            transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
          />
          <motion.div
            className="preloader__panel preloader__panel--bottom"
            initial={{ y: 0 }}
            exit={{ y: "101%" }}
            transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
          />

          <div className="preloader__core">
            <motion.div
              className="preloader__monogram"
              initial={{ opacity: 0, scale: 0.7, filter: "blur(14px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span>A</span>
              <i className="preloader__sweep" />
            </motion.div>

            <motion.div
              className="preloader__count"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {String(count).padStart(3, "0")}
            </motion.div>

            <div className="preloader__bar">
              <span style={{ width: `${count}%` }} />
            </div>
            <motion.p
              className="preloader__label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.6 }}
            >
              ENTERING THE EXPERIENCE
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
