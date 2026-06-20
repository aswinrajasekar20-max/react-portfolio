import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "work", label: "Work" },
  { id: "journey", label: "Journey" },
  { id: "contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    LINKS.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) io.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <button className="navbar__brand" onClick={() => go("home")}>
        <span className="navbar__mark">A</span>
        <span className="navbar__name">ASWIN</span>
      </button>

      <div className="navbar__links">
        {LINKS.map((l) => (
          <button
            key={l.id}
            className={`navbar__link ${active === l.id ? "is-active" : ""}`}
            onClick={() => go(l.id)}
          >
            {l.label}
            {active === l.id && (
              <motion.span layoutId="nav-glow" className="navbar__glow" />
            )}
          </button>
        ))}
      </div>

      <button className="btn navbar__cta" onClick={() => go("contact")}>
        Let's Talk
      </button>
    </motion.nav>
  );
}
