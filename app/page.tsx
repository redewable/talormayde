"use client";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import Link from "next/link";
// If you do NOT have an src folder, use "../components/Projects"
// If you DO have an src folder, use "@/components/Projects"
import Projects from "../components/Projects"; 

export default function Home() {
  return (
    <div className="bg-zinc-950 min-h-screen text-white selection:bg-white selection:text-black">
      
      {/* --- HERO SECTION --- */}
      <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
        
        {/* Background Ambience */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

        {/* The Manifesto */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center space-y-8 z-10 max-w-4xl"
        >
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-zinc-500 font-mono text-sm tracking-[0.2em] uppercase"
          >
            Est. 2024 • No Excuses
          </motion.p>

          <h1 className="text-6xl md:text-9xl font-bold tracking-tighter leading-[0.9]">
            <span className="block bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
              BUILDING
            </span>
            <span className="block text-zinc-800">
              LEGACY.
            </span>
          </h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-zinc-400 text-lg md:text-xl max-w-lg mx-auto leading-relaxed"
          >
            We don't just write code. We architect the standard of excellence for the next generation.
          </motion.p>

          {/* The Call to Action */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
            className="pt-8"
          >
            <a href="#work"> {/* This respects your smooth scroll CSS */}
              <button className="group relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95">
                <span className="relative z-10 flex items-center gap-2">
                  View The Work <ArrowDown size={18} />
                </span>
                <div className="absolute inset-0 bg-zinc-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </button>
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-32 md:bottom-12 animate-bounce text-zinc-600"
        >
          <ArrowDown size={24} />
        </motion.div>
      </main>

      {/* --- PROJECTS SECTION --- */}
      {/* This sits outside the <main> so it flows naturally below the fold */}
      <Projects />
      
    </div>
  );
}