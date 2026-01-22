"use client";
import { motion } from "framer-motion";
import { Ruler, Scissors, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: Ruler,
    number: "01",
    title: "The Measure",
    desc: "We listen before we create. Every brand has contours — a shape that's uniquely yours. We study your vision, your market, and the story you want to tell until we understand it completely.",
  },
  {
    icon: Scissors,
    number: "02",
    title: "The Cut",
    desc: "Precision over speed. We design and build with intention — every element placed deliberately, every interaction considered. No templates. No shortcuts. Just craft.",
  },
  {
    icon: Sparkles,
    number: "03",
    title: "The Fitting",
    desc: "A perfect fit isn't accidental. We refine, adjust, and polish until your digital presence fits your market exactly. Then we ensure it's positioned to be discovered.",
  },
];

export default function Methodology() {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto border-t border-border-subtle">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        {/* Left: The Manifesto */}
        <div className="lg:sticky lg:top-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-6 text-foreground">
              THE FITTING
            </h2>
            <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-md mb-8">
              Great work isn&apos;t rushed.<br />
              It&apos;s measured, cut, and fitted to perfection.
            </p>
            <div className="w-16 h-[1px] bg-border-subtle" />
          </motion.div>
        </div>

        {/* Right: The Steps */}
        <div className="space-y-16">
          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="flex gap-8">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-foreground/5 border border-border-subtle rounded-full flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                    <step.icon size={22} strokeWidth={1} />
                  </div>
                </div>

                {/* Content */}
                <div className="pt-1">
                  <span className="text-[10px] font-mono text-muted-foreground/40 tracking-[0.3em] uppercase mb-3 block group-hover:text-muted-foreground transition-colors">
                    {step.number}
                  </span>
                  <h3 className="text-xl font-light text-foreground mb-4 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm font-light max-w-md">
                    {step.desc}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {i < STEPS.length - 1 && (
                <div className="ml-7 mt-8 w-[1px] h-8 bg-gradient-to-b from-border-subtle to-transparent" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}