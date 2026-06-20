import { motion, useScroll, useSpring } from "framer-motion";

/** A slim luminous bar across the top that tracks total page scroll. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden />;
}
