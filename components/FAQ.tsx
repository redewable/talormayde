"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const QUESTIONS = [
  {
    q: "How long does a project take?",
    a: "It depends on the scope. A focused, single-page presence can be ready in 1–2 weeks. A complete multi-page experience with all the details typically takes 3–4 weeks. We don't rush — we fit it right.",
  },
  {
    q: "How does payment work?",
    a: "Simple: 50% to begin, 50% upon completion. The initial deposit secures your place in our schedule, and the final payment is due once you're completely satisfied with the work.",
  },
  {
    q: "Can I update the content myself?",
    a: "Absolutely. We set everything up so you can easily change text, images, and posts whenever you need to — no technical knowledge required. Your brand, your control.",
  },
  {
    q: "How do you help people find my business?",
    a: "We build your presence to be discovered. That means optimizing for how people actually search — your name, your services, your location. When someone nearby searches for what you do, you show up.",
  },
  {
    q: "What about social media and ads?",
    a: "Depending on your package, we can align your social profiles to your brand, create targeted visibility campaigns, and ensure your presence is consistent everywhere your customers spend time.",
  },
  {
    q: "Do I need to worry about hosting or security?",
    a: "Not at all. We handle everything — your site is hosted on world-class infrastructure, secured by default, and runs fast everywhere. You focus on your business; we handle the technical side.",
  },
  {
    q: "What if I need changes after launch?",
    a: "We're here for the long term. Small adjustments are always welcome, and if you need larger updates down the road, we offer ongoing support. This is a partnership, not a transaction.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-6 max-w-3xl mx-auto font-sans">
      {/* Header */}
      <div className="mb-20 text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-light text-foreground tracking-tight">
          COMMON QUESTIONS
        </h2>
        <p className="text-muted-foreground text-sm font-light max-w-md mx-auto">
          Everything you need to know before we begin.
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-2">
        {QUESTIONS.map((item, i) => (
          <div
            key={i}
            className="border-b border-border-subtle overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between py-6 text-left hover:opacity-70 transition-opacity group"
            >
              <span
                className={`text-base md:text-lg font-light transition-colors pr-8 ${
                  openIndex === i
                    ? "text-foreground"
                    : "text-zinc-400 group-hover:text-zinc-200"
                }`}
              >
                {item.q}
              </span>
              <div
                className={`flex-shrink-0 transition-transform duration-300 ${
                  openIndex === i ? "rotate-180" : "rotate-0"
                }`}
              >
                {openIndex === i ? (
                  <Minus size={14} className="text-foreground" />
                ) : (
                  <Plus size={14} className="text-zinc-600" />
                )}
              </div>
            </button>

            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                >
                  <div className="pb-8 text-muted-foreground leading-relaxed font-light text-sm max-w-2xl">
                    {item.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}