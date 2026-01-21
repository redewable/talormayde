"use client";
import { motion } from "framer-motion";
import { Search, PenTool, Rocket } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    phase: "PHASE 01",
    title: "Discovery & Blueprint",
    desc: "We do not guess. We analyze your market, deconstruct your competitors, and architect a system designed to win."
  },
  {
    icon: PenTool,
    phase: "PHASE 02",
    title: "Cinematic Engineering",
    desc: "Code meets camera. We build the high-performance application while simultaneously producing the visual assets that fuel it."
  },
  {
    icon: Rocket,
    phase: "PHASE 03",
    title: "Launch & Scale",
    desc: "Deployment is just the beginning. We install analytics, optimize for search engines, and hand you the keys to the command center."
  }
];

export default function Methodology() {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        
        {/* Left: The Manifesto */}
        <div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">THE SYSTEM.</h2>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
            Complexity is the enemy of execution. We have refined our process into a linear, high-velocity workflow.
          </p>
        </div>

        {/* Right: The Steps */}
        <div className="space-y-12">
          {STEPS.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="flex gap-6 group"
            >
              <div className="flex-shrink-0 mt-2">
                <div className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
                  <step.icon size={20} className="text-zinc-500 group-hover:text-emerald-400" />
                </div>
              </div>
              <div>
                <span className="text-xs font-mono text-emerald-500 tracking-widest">{step.phase}</span>
                <h3 className="text-xl font-bold mt-1 mb-2 group-hover:text-white transition-colors">{step.title}</h3>
                <p className="text-zinc-500 leading-relaxed text-sm">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}