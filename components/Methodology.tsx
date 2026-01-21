"use client";
import { motion } from "framer-motion";
import { Scan, PenTool, MoveUpRight } from "lucide-react";

const STEPS = [
  {
    icon: Scan,
    number: "01",
    title: "Immersion",
    desc: "We do not guess. We study the silence before the sound. We deconstruct your brand's essence to find the truth."
  },
  {
    icon: PenTool,
    number: "02",
    title: "Composition",
    desc: "Code as poetry. We build the architecture while simultaneously crafting the visual narrative that fills it."
  },
  {
    icon: MoveUpRight,
    number: "03",
    title: "Realization",
    desc: "The work enters the world. We ensure the system is optimized for discovery, performance, and permanence."
  }
];

export default function Methodology() {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        {/* Left: The Manifesto */}
        <div>
          <h2 className="text-4xl md:text-5xl font-light tracking-tight mb-6 text-white">
            THE METHOD
          </h2>
          <p className="text-zinc-500 text-lg font-light leading-relaxed max-w-md">
            Complexity is the enemy of beauty. <br/>
            We have refined our process into a linear, lucid workflow.
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
              className="flex gap-8 group"
            >
              <div className="flex-shrink-0 pt-2">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500">
                  <step.icon size={20} strokeWidth={1} />
                </div>
              </div>
              <div>
                <span className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-2 block group-hover:text-white transition-colors">{step.number}</span>
                <h3 className="text-xl font-light text-white mb-2">{step.title}</h3>
                <p className="text-zinc-500 leading-relaxed text-sm font-light">
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