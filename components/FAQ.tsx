"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const QUESTIONS = [
  {
    q: "What is the typical timeline for a deployment?",
    a: "Speed is a feature. A 'Genesis' protocol (Landing Page) typically deploys in 7 days. Full 'Ascension' systems (Multi-page + CMS) require 3-4 weeks for engineering and QA."
  },
  {
    q: "Do you offer financing or payment installments?",
    a: "Affirmative. We structure operations with a 50% mobilization deposit to begin, and the remaining 50% upon successful deployment and hand-off."
  },
  {
    q: "Will I be able to edit the site myself?",
    a: "Absolute control. We build custom Command Centers (CMS) that allow you to update text, images, and projects without touching a single line of code."
  },
  {
    q: "How does the SEO / GEO optimization work?",
    a: "We don't just use keywords; we structure data for AI. We inject JSON-LD schemas that tell Google and ChatGPT exactly who you are, ensuring you rank for both humans and machines."
  },
  {
    q: "Do you handle hosting and maintenance?",
    a: "We deploy on Vercel's Edge Network—the same infrastructure used by Uber and Meta. It is faster, more secure, and requires zero manual server maintenance."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-32 px-6 max-w-4xl mx-auto">
      
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold mb-4">CLASSIFIED INTELLIGENCE</h2>
        <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full" />
      </div>

      <div className="space-y-4">
        {QUESTIONS.map((item, i) => (
          <div key={i} className="border border-white/10 rounded-2xl bg-zinc-900/20 overflow-hidden">
            
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
            >
              <span className="font-bold text-lg text-zinc-200">{item.q}</span>
              <div className={`p-2 rounded-full border border-white/10 transition-colors ${openIndex === i ? "bg-white text-black" : "text-zinc-500"}`}>
                {openIndex === i ? <Minus size={16} /> : <Plus size={16} />}
              </div>
            </button>

            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="p-6 pt-0 text-zinc-400 leading-relaxed border-t border-white/5 mt-2">
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