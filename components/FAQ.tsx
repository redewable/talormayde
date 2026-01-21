"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const QUESTIONS = [
  {
    q: "What is the timeline for a commission?",
    a: "We prioritize precision. A Foundation project typically spans 1-2 weeks, while complete Signature ecosystems require 3-4 weeks for detailed engineering and art direction."
  },
  {
    q: "How is payment structured?",
    a: "We operate on a 50/50 basis. A 50% deposit is required to secure your slot in our production schedule, with the remaining balance due upon final delivery and hand-off."
  },
  {
    q: "Will I be able to edit the content myself?",
    a: "You maintain full autonomy. We integrate a user-friendly Content Management System (CMS) that allows you to update text, images, and journal entries without touching a line of code."
  },
  {
    q: "How does the SEO strategy work?",
    a: "We structure architecture for intelligence. Beyond standard keywords, we inject JSON-LD schemas that ensure your platform is perfectly readable by Google, search engines, and generative AI models."
  },
  {
    q: "Do you handle hosting and security?",
    a: "Yes. We deploy on Vercel's Edge Network—enterprise-grade infrastructure used by major global brands. It provides SSL encryption, global CDNs, and zero-maintenance security by default."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 px-6 max-w-3xl mx-auto font-sans">
      
      <div className="mb-20 text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">INQUIRIES</h2>
        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
            Details regarding the process
        </p>
      </div>

      <div className="space-y-4">
        {QUESTIONS.map((item, i) => (
          <div key={i} className="border-b border-white/5 overflow-hidden">
            
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between py-6 text-left hover:opacity-70 transition-opacity group"
            >
              <span className={`text-lg font-light transition-colors ${openIndex === i ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                {item.q}
              </span>
              <div className={`transition-transform duration-300 ${openIndex === i ? "rotate-180" : "rotate-0"}`}>
                 {openIndex === i ? <Minus size={14} className="text-white"/> : <Plus size={14} className="text-zinc-600"/>}
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
                  <div className="pb-8 text-zinc-500 leading-relaxed font-light text-sm max-w-2xl">
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