import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { defaultConfig } from "../data";
import { useMagnetic } from "../hooks/useMagnetic";
import { ContactModal } from "./ContactModal";

// "+91 74189 95677" → "917418995677" for a wa.me deep link.
const whatsappNumber = defaultConfig.contact_phone.replace(/\D/g, "");
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  "Hi Aswin, I came across your portfolio and would love to connect!"
)}`;
const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
  defaultConfig.contact_location
)}`;

/* ── icons ── */
const Icon = {
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.207zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
};

/** Live Chennai (IST) time, refreshed each minute. */
function useChennaiTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date());
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 15000);
    return () => clearInterval(id);
  }, []);
  return time;
}

/** Interactive glass tile for a contact method — spotlight + lift on hover. */
function MethodTile({
  icon,
  label,
  value,
  href,
  accent,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  accent: string;
  delay: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <motion.a
      ref={ref}
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className="method glass"
      data-cursor
      onMouseMove={onMove}
      style={{ ["--accent" as string]: accent }}
      initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="method__spot" />
      <span className="method__icon">{icon}</span>
      <span className="method__text">
        <span className="method__label">{label}</span>
        <span className="method__value">{value}</span>
      </span>
      <span className="method__arrow">↗</span>
    </motion.a>
  );
}

function MagButton({
  href,
  onClick,
  children,
  primary,
  className,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  primary?: boolean;
  className?: string;
}) {
  const mag = useMagnetic<HTMLElement>(0.4);
  const cls = `btn ${primary ? "btn-primary" : ""} ${className || ""}`;
  if (href) {
    return (
      <a
        ref={mag.ref as React.Ref<HTMLAnchorElement>}
        onMouseMove={mag.onMouseMove}
        onMouseLeave={mag.onMouseLeave}
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noreferrer"
        className={cls}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      ref={mag.ref as React.Ref<HTMLButtonElement>}
      onMouseMove={mag.onMouseMove}
      onMouseLeave={mag.onMouseLeave}
      onClick={onClick}
      className={cls}
    >
      {children}
    </button>
  );
}

const TITLE_WORDS = ["Let's", "build", "something"];

export function Contact() {
  const [open, setOpen] = useState(false);
  const time = useChennaiTime();

  const wordWrap = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  };
  const word = {
    hidden: { y: "110%", opacity: 0 },
    show: {
      y: "0%",
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section id="contact" className="contact">
      <span className="section-index">05</span>

      {/* cinematic backdrop: rotating glow ring + orbs + halo */}
      <span className="contact__ring" aria-hidden />
      <span className="contact__orb contact__orb--a" aria-hidden />
      <span className="contact__orb contact__orb--b" aria-hidden />
      <div className="contact__halo" aria-hidden />

      <div className="container contact__inner">
        <motion.div
          className="contact__head"
          variants={wordWrap}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-20% 0px" }}
        >
          <motion.span className="eyebrow" variants={word} style={{ justifyContent: "center" }}>
            The Next Chapter
          </motion.span>

          <h2 className="contact__title">
            {TITLE_WORDS.map((w, i) => (
              <span key={i} className="contact__word">
                <motion.span className="contact__word-inner" variants={word}>
                  {w}
                </motion.span>
              </span>
            ))}
            <span className="contact__word">
              <motion.span className="contact__word-inner grad shimmer" variants={word}>
                extraordinary
              </motion.span>
            </span>
          </h2>

          <motion.p className="contact__lead" variants={word}>
            Have a project, a role, or just an idea worth chasing? Pick a channel
            below — I usually reply within a day.
          </motion.p>

          <motion.div className="contact__status" variants={word}>
            <span className="contact__avail">
              <span className="contact__pulse" /> Available for opportunities
            </span>
            <span className="contact__divider" />
            <span className="contact__time">
              <span className="contact__clock-dot" /> {time} · Chennai
            </span>
          </motion.div>
        </motion.div>

        {/* interactive method tiles */}
        <div className="contact__methods">
          <MethodTile
            icon={Icon.mail}
            label="Email"
            value={defaultConfig.contact_email}
            href={`mailto:${defaultConfig.contact_email}`}
            accent="#38bdf8"
            delay={0}
          />
          <MethodTile
            icon={Icon.whatsapp}
            label="WhatsApp"
            value={defaultConfig.contact_phone}
            href={whatsappUrl}
            accent="#25d366"
            delay={0.08}
          />
          <MethodTile
            icon={Icon.phone}
            label="Call"
            value={defaultConfig.contact_phone}
            href={`tel:${whatsappNumber ? "+" + whatsappNumber : ""}`}
            accent="#a855f7"
            delay={0.16}
          />
          <MethodTile
            icon={Icon.pin}
            label="Location"
            value={defaultConfig.contact_location}
            href={mapsUrl}
            accent="#22d3ee"
            delay={0.24}
          />
        </div>

        {/* primary CTA */}
        <motion.div
          className="contact__cta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <MagButton onClick={() => setOpen(true)} primary className="contact__cta-btn">
            Start a Conversation
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </MagButton>
          <MagButton href={whatsappUrl} className="btn-whatsapp">
            {Icon.whatsapp}
            Chat on WhatsApp
          </MagButton>
        </motion.div>

        {/* kinetic strip */}
        <div className="contact__strip" aria-hidden>
          <div className="contact__strip-track">
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k} className="contact__strip-row">
                Open to Freelance <i>✦</i> Full-time Roles <i>✦</i> Collaborations{" "}
                <i>✦</i> Let's Create <i>✦</i>{" "}
              </span>
            ))}
          </div>
        </div>

        <footer className="footer">
          <span>© {new Date().getFullYear()} Aswin Rajasekar</span>
          <span className="footer__made">Designed &amp; built with cinematic intent</span>
        </footer>
      </div>

      <ContactModal open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
