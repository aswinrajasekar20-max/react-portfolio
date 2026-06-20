import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Reusable scroll-into-view reveal — fade + rise with cinematic easing. */
export function Reveal({
  children,
  delay = 0,
  y = 40,
  className,
  blur = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  blur?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: blur ? "blur(12px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.95, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
