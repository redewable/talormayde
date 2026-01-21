"use client";
import { motion } from "framer-motion";
import { ArrowRight, PenTool, Move, Maximize2, Palette } from "lucide-react";
import Link from "next/link";
import Projects from "@/components/Projects"; // This is the Collage Grid we built
import LivingCanvas from "@/components/LivingCanvas";

export default function Home() {
  return (
    <div className="bg-zinc-950 min-h-screen font-sans selection:bg-white selection:text-black overflow-x-hidden text-zinc-100">
      
      {/* --- SECTION 1: THE CREATION HERO --- */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <LivingCanvas />

        <div className="relative z-20 text-center space-y-12 px-6 max-w-5xl mx-auto">
          {/* Logo Mark */}
          <div className="mx-auto w-32 md:w-48 opacity-90 invert hover:opacity-100 transition-opacity">
             <img src="/talormayde-logo.png" alt="Talormayde" className="w-full h-auto drop-shadow-2xl" />
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-8xl font-light tracking-tight text-white mix-blend-overlay leading-none">
              UNLIMITED <br className="md:hidden" /> POTENTIAL
            </h1>
            <p className="text-zinc-500 text-xs md:text-sm font-mono tracking-[0.3em] uppercase leading-loose">
              Created to Create.
            </p>
          </div>

          <div className="pt-12">
            <Link href="/contact" className="group relative inline-flex items-center gap-3 px-10 py-5 border border-white/10 rounded-full hover:bg-white/5 transition-all hover:scale-105">
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold">Begin The Work</span>
                <ArrowRight size={14} className="text-zinc-600 group-hover:text-white transition-colors"/>
            </Link>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: THE MANIFESTO --- */}
      <section className="py-40 px-6 bg-zinc-950 relative z-10 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center space-y-12">
            <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-zinc-800 to-transparent mx-auto" />
            
            <h2 className="text-2xl md:text-4xl font-light leading-relaxed text-zinc-300">
                &quot;I am not a painter, so I paint.<br/>
                I am not a coder, so I code.<br/>
                We think, speak, and do <span className="text-white border-b border-white/20 pb-1">outside of the box</span>.&quot;
            </h2>
            
            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-[0.3em] leading-loose">
                The Lord has given us this canvas.<br/>It is up to us to determine its value.
            </p>
        </div>
      </section>

      {/* --- SECTION 3: THE COLLECTION (THE COLLAGE GRID) --- */}
      {/* This component handles the 'Well Arranged Collage' and orientations */}
      <Projects />

      {/* --- SECTION 4: THE MEDIUM (SERVICES) --- */}
      <section className="py-40 px-6 bg-zinc-950 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
            <div>
                <h2 className="text-4xl md:text-6xl font-light text-white mb-8 tracking-tight">THE MEDIUM</h2>
                <p className="text-zinc-500 text-lg font-light leading-relaxed max-w-md">
                   We believe the impossible is possible. We use technology not as a utility, but as an art form. 
                   Every pixel is placed with intention.
                </p>
            </div>
            
            <div className="grid grid-cols-1 gap-12">
                {[
                    { icon: Palette, title: "Art Direction", desc: "Defining the visual soul of the brand." },
                    { icon: PenTool, title: "Digital Craftsmanship", desc: "Bespoke development, hand-coded for precision." },
                    { icon: Maximize2, title: "Expansion", desc: "Scaling impact through strategic design systems." },
                    { icon: Move, title: "Motion", desc: "Breathing life into static interfaces." }
                ].map((s, i) => (
                    <div key={i} className="group flex gap-8 items-start border-b border-white/5 pb-12 hover:border-white/20 transition-colors">
                        <s.icon strokeWidth={1} size={32} className="text-zinc-600 group-hover:text-white transition-colors mt-1" />
                        <div>
                            <h3 className="text-xl font-light text-white mb-3 uppercase tracking-widest">{s.title}</h3>
                            <p className="text-zinc-500 text-sm font-light leading-relaxed">{s.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* --- SECTION 5: FINAL CTA --- */}
      <section className="py-60 px-6 bg-zinc-950 text-center relative z-10 border-t border-white/5">
        <div className="max-w-2xl mx-auto space-y-12">
            
            {/* THE LOGO MARK (Replaces the Pulse) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="w-40 h-40 mx-auto relative group"
            >
                {/* Subtle Outer Glow */}
                <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full group-hover:bg-white/10 transition-colors duration-700" />
                
                <img 
                  src="/talormayde-logo.png" 
                  alt="Talormayde Mark" 
                  className="relative z-10 w-full h-full object-contain invert opacity-80 group-hover:opacity-100 transition-opacity duration-700" 
                />
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-light text-white tracking-tight">
                What will we create?
            </h2>
            
            <div className="pt-4">
              <Link href="/contact" className="inline-block border-b border-zinc-500 pb-1 text-zinc-400 hover:text-white hover:border-white transition-all text-xs font-mono uppercase tracking-[0.3em]">
                  Start the Conversation
              </Link>
            </div>
        </div>
        
        <div className="mt-32 pt-8 border-t border-white/5 w-full max-w-xs mx-auto flex justify-center">
            <Link href="/journal" className="text-zinc-600 hover:text-white transition-colors text-[10px] font-mono uppercase tracking-[0.3em]">
                Read the Journal
            </Link>
        </div>
      </section>

    </div>
  );
}