"use client";
import { motion } from "framer-motion";
import { Feather, MapPin, Megaphone } from "lucide-react";

const PILLARS = [
  {
    icon: Feather,
    title: "THE STORY",
    subtitle: "Fitted to Your Vision",
    description:
      "Every brand has a narrative waiting to be told. We don't hand you a template — we listen, we study, and we craft the story that only you can tell. Then we make sure it's heard.",
    outcomes: [
      "A brand narrative that resonates",
      "Visual identity that feels unmistakably yours",
      "Messaging that connects, not just informs",
    ],
  },
  {
    icon: MapPin,
    title: "THE SIGNAL",
    subtitle: "Found When It Matters",
    description:
      "When a customer searches for what you offer, you appear. Your neighborhood. Your city. Your industry. We position you where intent lives — so you're discovered at the moment of decision.",
    outcomes: [
      "Appear in local and regional searches",
      "Optimized for how people actually find you",
      "A presence that compounds over time",
    ],
  },
  {
    icon: Megaphone,
    title: "THE REACH",
    subtitle: "Active Where They Live",
    description:
      "Your customers are already scrolling. We place your brand in their world — not with noise, but with presence. Polished profiles, strategic visibility, and content that earns attention.",
    outcomes: [
      "Social presence that matches your brand",
      "Targeted visibility to the right audience",
      "A system that works while you work",
    ],
  },
];

export default function ValuePillars() {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-24 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-light text-foreground tracking-tight mb-4">
            THE CRAFT
          </h2>
          <p className="text-muted-foreground text-sm md:text-base font-light max-w-xl mx-auto leading-relaxed">
            We don&apos;t sell services. We deliver outcomes.<br />
            Here&apos;s what changes when we work together.
          </p>
        </motion.div>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-4">
        {PILLARS.map((pillar, index) => (
          <motion.div
            key={pillar.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
            className="group relative"
          >
            {/* Card */}
            <div className="h-full p-10 lg:p-12 bg-background/40 border border-border-subtle rounded-sm hover:bg-foreground/[0.02] transition-all duration-500">
              {/* Icon */}
              <div className="mb-8">
                <div className="w-14 h-14 rounded-full bg-foreground/5 border border-border-subtle flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:bg-foreground/10 transition-all duration-500">
                  <pillar.icon strokeWidth={1} size={24} />
                </div>
              </div>

              {/* Title Block */}
              <div className="mb-8">
                <span className="text-[10px] font-mono text-muted-foreground/50 tracking-[0.3em] uppercase block mb-2">
                  0{index + 1}
                </span>
                <h3 className="text-2xl font-light text-foreground tracking-tight mb-2">
                  {pillar.title}
                </h3>
                <p className="text-sm font-mono text-muted-foreground tracking-wide">
                  {pillar.subtitle}
                </p>
              </div>

              {/* Description */}
              <p className="text-muted-foreground text-sm font-light leading-relaxed mb-10">
                {pillar.description}
              </p>

              {/* Outcomes */}
              <div className="space-y-4 pt-8 border-t border-border-subtle">
                <span className="text-[10px] font-mono text-muted-foreground/40 tracking-[0.2em] uppercase">
                  What You Get
                </span>
                <ul className="space-y-3">
                  {pillar.outcomes.map((outcome, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-zinc-400 font-light group-hover:text-zinc-300 transition-colors"
                    >
                      <span className="w-1 h-1 rounded-full bg-zinc-600 mt-2 flex-shrink-0" />
                      {outcome}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}