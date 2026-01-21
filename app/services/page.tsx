"use client";
import { motion } from "framer-motion";
import { Camera, Globe, TrendingUp, Monitor, Layers, Cpu } from "lucide-react";
import Packages from "@/components/Packages";
import FAQ from "@/components/FAQ";
import LivingCanvas from "@/components/LivingCanvas";
import Methodology from "@/components/Methodology"; // Import it

const capabilities = [
  {
    category: "DIGITAL ARCHITECTURE",
    items: [
      "Bespoke Web Platforms",
      "Generative Engine Optimization",
      "Semantic Structure",
      "Spatial Computing / 3D",
    ],
    icon: Globe,
    color: "text-indigo-300",
  },
  {
    category: "VISUAL ENGINEERING",
    items: [
      "Cinematic Documentation",
      "Art Direction",
      "Motion Design System",
      "Post-Production & Grading",
    ],
    icon: Camera,
    color: "text-emerald-300",
  },
  {
    category: "SIGNAL EXPANSION",
    items: [
      "Brand Positioning",
      "Content Ecosystems",
      "Distribution Strategy",
      "Conversion Intelligence",
    ],
    icon: TrendingUp,
    color: "text-zinc-300",
  },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-20 relative overflow-hidden font-sans selection:bg-white selection:text-black">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <LivingCanvas />
      </div>

      <div className="relative z-10">
        
        {/* Header */}
        <div className="max-w-5xl mx-auto mb-32 px-6 text-center">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-auto mb-8" />
                
                <h1 className="text-5xl md:text-8xl font-light tracking-tight text-foreground mix-blend-overlay">
                    CAPABILITIES
                </h1>
                <p className="text-zinc-400 text-sm md:text-base font-mono tracking-[0.2em] uppercase max-w-2xl mx-auto leading-loose">
                    We do not just build websites.<br/>
                    We engineer <span className="text-foreground border-b border-white/20 pb-1">digital ecosystems</span>.
                </p>
            </motion.div>
        </div>

        {/* The Capabilities Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6 mb-40">
            {capabilities.map((cap, index) => (
            <motion.div
                key={cap.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-10 rounded-3xl bg-background/20 border border-border-subtle hover:border-white/10 transition-all hover:bg-background/40 backdrop-blur-sm"
            >
                <div className={`mb-8 p-4 rounded-full w-fit bg-white/5 border border-border-subtle ${cap.color} group-hover:bg-white/10 transition-colors`}>
                    <cap.icon strokeWidth={1} size={32} />
                </div>
                
                <h3 className="text-xs font-mono text-muted-foreground tracking-widest mb-8 border-b border-border-subtle pb-4 uppercase">
                    {cap.category}
                </h3>

                <ul className="space-y-6">
                {cap.items.map((item) => (
                    <li key={item} className="flex items-center gap-4 text-zinc-300 font-light group-hover:text-foreground transition-colors">
                        <div className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-white transition-colors" />
                        {item}
                    </li>
                ))}
                </ul>
            </motion.div>
            ))}
        </div>

        {/* --- THE METHOD SECTION --- */}
            <Methodology />

        {/* --- PACKAGES SECTION (Wrapped to match style) --- */}
        <div className="relative z-10 border-t border-border-subtle pt-32">
             <Packages />
        </div>

        {/* --- FAQ SECTION (Wrapped to match style) --- */}
        <div className="relative z-10 border-t border-border-subtle pt-32">
             <FAQ />
        </div>

      </div>
    </div>
  );
}