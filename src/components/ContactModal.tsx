import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import { defaultConfig } from "../data";
import { getLenis } from "../lib/SmoothScroll";

/**
 * ────────────────────────────────────────────────────────────────────────
 *  EMAILJS SETUP (one-time, ~3 minutes) — delivers to aswinrajasekar20@gmail.com
 *
 *  1. Create a free account at https://www.emailjs.com
 *  2. Email Services → "Add New Service" (connect Gmail: aswinrajasekar20@gmail.com)
 *     → copy the SERVICE ID.
 *  3. Email Templates → "Create New Template". In the template body use these
 *     variables: {{name}}, {{email}}, {{message}} (and set "To Email" to your
 *     address, "Reply To" to {{email}}) → copy the TEMPLATE ID.
 *  4. Account → General → copy your PUBLIC KEY.
 *  5. Paste the three values below.
 *
 *  Until all three are filled, the form gracefully falls back to opening the
 *  visitor's mail app pre-addressed to aswinrajasekar20@gmail.com.
 * ────────────────────────────────────────────────────────────────────────
 */
const EMAILJS_SERVICE_ID = "service_2xr9l5k";
const EMAILJS_TEMPLATE_ID = "template_x1qrh7u";
const EMAILJS_PUBLIC_KEY = "HTIQ2VH21slGC36vo";
const IS_CONFIGURED = [
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
].every((v) => v && !v.startsWith("YOUR_"));

type Status = "idle" | "submitting" | "success" | "error";

export function ContactModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // Lock page scroll (and pause Lenis) while the modal is open.
  useEffect(() => {
    const lenis = getLenis();
    if (open) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [open]);

  // Esc to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    onClose();
    // reset a moment later so the exit animation isn't interrupted
    setTimeout(() => {
      setStatus("idle");
      setError("");
    }, 400);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    // honeypot — bots fill hidden fields
    if (data.get("botcheck")) return;
    if (!name || !email || !message) {
      setStatus("error");
      setError("Please fill in your name, email and message.");
      return;
    }

    setStatus("submitting");
    setError("");

    // No mail-client popup. If EmailJS isn't configured yet, surface a clear
    // reminder instead of opening the visitor's email app.
    if (!IS_CONFIGURED) {
      setStatus("error");
      setError(
        "Email isn't connected yet — add your EmailJS keys in src/components/ContactModal.tsx to enable direct delivery."
      );
      return;
    }

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name,
          email,
          message,
          title: `Portfolio enquiry from ${name}`,
          to_email: defaultConfig.contact_email,
          reply_to: email,
        },
        { publicKey: EMAILJS_PUBLIC_KEY }
      );
      setStatus("success");
      form.reset();
    } catch (err: unknown) {
      setStatus("error");
      const msg =
        err && typeof err === "object" && "text" in err
          ? String((err as { text: string }).text)
          : "Something went wrong. Please try again or email me directly.";
      setError(msg);
    }
  };

  // staggered field reveal
  const list = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
  };
  const field = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleClose}
        >
          <div className="modal__backdrop" />

          <motion.div
            className="modal__card glass"
            role="dialog"
            aria-modal="true"
            aria-label="Contact form"
            initial={{ opacity: 0, y: 60, scale: 0.92, filter: "blur(16px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 40, scale: 0.95, filter: "blur(12px)" }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* animated aurora glow inside the modal */}
            <span className="modal__glow" />

            <button className="modal__close" onClick={handleClose} aria-label="Close">
              ×
            </button>

            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  className="modal__success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.svg viewBox="0 0 52 52" className="modal__check">
                    <motion.circle
                      cx="26" cy="26" r="24" fill="none"
                      stroke="currentColor" strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                    <motion.path
                      d="M14 27l8 8 16-16" fill="none"
                      stroke="currentColor" strokeWidth="3"
                      strokeLinecap="round" strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.45, delay: 0.5, ease: "easeOut" }}
                    />
                  </motion.svg>
                  <h3>Message on its way!</h3>
                  <p>
                    {IS_CONFIGURED
                      ? "Thanks for reaching out — I'll get back to you soon."
                      : "Your mail app should have opened. Hit send and I'll reply soon."}
                  </p>
                  <button className="btn btn-primary" onClick={handleClose}>
                    Done
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" variants={list} initial="hidden" animate="show">
                  <motion.span className="eyebrow" variants={field} style={{ justifyContent: "center" }}>
                    Say Hello
                  </motion.span>
                  <motion.h3 className="modal__title" variants={field}>
                    Let's <span className="grad">connect</span>
                  </motion.h3>

                  <form onSubmit={handleSubmit} className="modal__form">
                    {/* honeypot */}
                    <input type="checkbox" name="botcheck" className="modal__honeypot" tabIndex={-1} autoComplete="off" />

                    <motion.div className="field" variants={field}>
                      <label htmlFor="cf-name">Your Name</label>
                      <input id="cf-name" name="name" type="text" placeholder="Jane Doe" required />
                    </motion.div>

                    <motion.div className="field" variants={field}>
                      <label htmlFor="cf-email">Your Email</label>
                      <input id="cf-email" name="email" type="email" placeholder="jane@company.com" required />
                    </motion.div>

                    <motion.div className="field" variants={field}>
                      <label htmlFor="cf-msg">Message</label>
                      <textarea id="cf-msg" name="message" rows={4} placeholder="Tell me about your project or opportunity…" required />
                    </motion.div>

                    {status === "error" && (
                      <motion.p className="modal__error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {error}
                      </motion.p>
                    )}

                    <motion.button
                      type="submit"
                      className="btn btn-primary modal__submit"
                      variants={field}
                      disabled={status === "submitting"}
                    >
                      {status === "submitting" ? (
                        <>
                          <span className="modal__spinner" /> Sending…
                        </>
                      ) : (
                        <>
                          Send Message
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
