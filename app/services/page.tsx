"use client";
import { motion } from "framer-motion";
import { Camera, Zap, Globe, TrendingUp } from "lucide-react";
import Link from "next/link";
import Packages from "@/components/Packages";
import FAQ from "@/components/FAQ";

const capabilities = [
  {
    category: "DIGITAL ARCHITECTURE",
    items: [
      "High-Performance Web Development",
      "Generative Engine Optimization (GEO)",
      "Technical SEO & Semantics",
      "Interactive 3D Environments",
    ],
    icon: Globe,
    color: "text-blue-400",
  },
  {
    category: "VISUAL ENGINEERING",
    items: [
      "Cinematic Videography",
      "Editorial Photography",
      "Brand Storytelling",
      "Post-Production & VFX",
    ],
    icon: Camera,
    color: "text-purple-400",
  },
  {
    category: "AUDIENCE WARFARE",
    items: [
      "Social Media Strategy",
      "YouTube Channel Growth",
      "Content Distribution Systems",
      "Analytics & Conversion",
    ],
    icon: TrendingUp,
    color: "text-emerald-400",
  },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-32 px-6 pb-20">
      
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-24 text-center">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-zinc-500 font-mono text-xs tracking-[0.3em] uppercase mb-4"
        >
          Capabilities & Systems
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-8xl font-bold tracking-tighter mb-8"
        >
          FULL STACK <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-200 to-zinc-800">
            DOMINANCE
          </span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
        >
          We don't just build websites; we build media companies. 
          From the code that runs the engine to the content that fuels it.
        </motion.p>
      </div>

      {/* The Capabilities Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
        {capabilities.map((cap, index) => (
          <motion.div
            key={cap.category}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group p-8 rounded-3xl bg-zinc-900/30 border border-white/5 hover:border-white/10 transition-all hover:bg-zinc-900/50"
          >
            <div className={`mb-6 p-4 rounded-2xl w-fit bg-black border border-white/5 ${cap.color}`}>
              <cap.icon size={28} />
            </div>
            
            <h3 className="text-sm font-mono text-zinc-500 tracking-widest mb-6 border-b border-white/5 pb-4">
              {cap.category}
            </h3>

            <ul className="space-y-4">
              {cap.items.map((item) => (
                <li key={item} className="flex items-center gap-3 text-zinc-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-white transition-colors" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* --- NEW: PACKAGES SECTION --- */}
      <Packages />

      {/* --- NEW: FAQ SECTION --- */}
      <FAQ />

    </div>
  );
}