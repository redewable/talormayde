"use client";
import { motion } from "framer-motion";
import { ArrowRight, PenTool, Move, Maximize2, Palette, ChevronRight } from "lucide-react";
import Link from "next/link";
import Projects from "@/components/Projects"; 
import LivingCanvas from "@/components/LivingCanvas";

export default function Home() {
  return (
    <div className="bg-background text-foreground min-h-screen font-sans selection:bg-emerald-500 selection:text-white overflow-x-hidden transition-colors duration-500">
      
      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <LivingCanvas />
        <div className="relative z-20 text-center space-y-12 px-6 max-w-5xl mx-auto">
          {/* LOGO: Same fix here - Invert in light mode to turn the white logo black */}
          <div className="mx-auto w-32 md:w-48 opacity-90 invert dark:invert-0 transition-all">
             <img src="/talormayde-logo.png" alt="Talormayde" className="w-full h-auto drop-shadow-2xl" />
          </div>
          
          <div className="space-y-6">
            {/* Removed mix-blend-overlay to fix visibility issues */}
            <h1 className="text-5xl md:text-8xl font-light tracking-tight text-foreground leading-none">
              UNLIMITED <br className="md:hidden" /> POTENTIAL
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm font-mono tracking-[0.3em] uppercase leading-loose">
              Created to Create.
            </p>
          </div>
          <div className="pt-12">
            <Link href="/contact" className="group relative inline-flex items-center gap-3 px-10 py-5 border border-border-subtle rounded-full hover:bg-foreground/5 transition-all hover:scale-105">
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold">Begin The Work</span>
                <ArrowRight size={14} className="text-muted-foreground group-hover:text-foreground transition-colors"/>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2: MANIFESTO */}
      <section className="py-40 px-6 bg-transparent relative z-10 border-t border-border-subtle">
        <div className="max-w-3xl mx-auto text-center space-y-12">
            <div className="w-[1px] h-24 bg-gradient-to-b from-transparent via-border-subtle to-transparent mx-auto" />
            <h2 className="text-2xl md:text-4xl font-light leading-relaxed">
                &quot;I am not a painter, so I paint.<br/>
                I am not a coder, so I code.<br/>
                We think, speak, and do <span className="border-b border-foreground/20 pb-1">outside of the box</span>.&quot;
            </h2>
            <p className="text-muted-foreground text-[10px] font-mono uppercase tracking-[0.3em] leading-loose">
                The Lord has given us this canvas.<br/>It is up to us to determine its value.
            </p>
        </div>
      </section>

      <Projects />

      {/* SECTION 4: THE MEDIUM - UPDATED DESIGN */}
      <section className="py-40 px-6 bg-transparent border-t border-border-subtle relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
            <div>
                <h2 className="text-4xl md:text-6xl font-light mb-8 tracking-tight sticky top-32">THE MEDIUM</h2>
                <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-md sticky top-52">
                   We believe the impossible is possible. We use technology not as a utility, but as an art form. 
                   Every pixel is placed with intention.
                </p>
            </div>
            
            <div className="grid grid-cols-1">
                {[
                    { icon: Palette, title: "Art Direction", desc: "Defining the visual soul of the brand." },
                    { icon: PenTool, title: "Digital Craftsmanship", desc: "Bespoke development, hand-coded for precision." },
                    { icon: Maximize2, title: "Expansion", desc: "Scaling impact through strategic design systems." },
                    { icon: Move, title: "Motion", desc: "Breathing life into static interfaces." }
                ].map((s, i) => (
                    <div key={i} className="group flex gap-8 items-center border-t border-border-subtle py-12 hover:bg-foreground/5 transition-colors px-4 -mx-4 rounded-xl cursor-default">
                        <div className="p-4 rounded-full bg-background border border-border-subtle group-hover:border-foreground/20 transition-colors">
                          <s.icon strokeWidth={1} size={24} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-xl font-light mb-1 uppercase tracking-widest">{s.title}</h3>
                            <p className="text-muted-foreground text-sm font-light">{s.desc}</p>
                        </div>
                        <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" size={16} />
                    </div>
                ))}
                {/* Closing Border */}
                <div className="border-t border-border-subtle" />
            </div>
        </div>
      </section>

      {/* SECTION 5: FINAL CTA */}
      <section className="py-60 px-6 bg-transparent text-center relative z-10 border-t border-border-subtle">
        <div className="max-w-2xl mx-auto space-y-12">
            <motion.div className="w-40 h-40 mx-auto relative group">
                <div className="absolute inset-0 bg-foreground/5 blur-3xl rounded-full" />
                {/* Apply the new brand-logo class here too */}
                <img src="/talormayde-logo.png" alt="Mark" className="brand-logo relative z-10 w-full h-full object-contain opacity-80" />
            </motion.div>
            
            {/* REMOVED mix-blend-overlay, ADDED text-foreground */}
            <h2 className="text-4xl md:text-6xl font-light tracking-tight text-foreground">
                What will we create?
            </h2>
            
            <div className="pt-4">
              <Link href="/contact" className="inline-block border-b border-border-subtle pb-1 text-muted-foreground hover:text-foreground hover:border-foreground transition-all text-xs font-mono uppercase tracking-[0.3em]">
                  Start the Conversation
              </Link>
            </div>
        </div>
      </section>
    </div>
  );
}