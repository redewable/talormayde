"use client";
import { motion } from "framer-motion";
import { ArrowRight, PenTool, Move, Maximize2, Palette, Code2, Layers } from "lucide-react";
import Link from "next/link";
import Projects from "@/components/Projects"; 
import LivingCanvas from "@/components/LivingCanvas";

export default function Home() {
  return (
    <div className="bg-background text-foreground min-h-screen font-sans overflow-x-hidden">
      
      {/* SECTION 1: HERO */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
        <LivingCanvas />
        <div className="relative z-20 text-center space-y-8 px-6 max-w-5xl mx-auto">
          
          <div className="mx-auto w-32 md:w-48 opacity-90 hover:opacity-100 transition-opacity">
            <img 
              src="/talormayde-logo.png" 
              alt="Talormayde" 
              /* Cleaned class list */
              className="adaptive-logo w-full h-auto drop-shadow-2xl" 
            />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-8xl font-light tracking-tight text-foreground leading-none mix-blend-overlay">
              UNLIMITED <br className="md:hidden" /> POTENTIAL
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm font-mono tracking-[0.3em] uppercase leading-loose">
              Created to Create.
            </p>
          </div>

          <div className="pt-8">
            <Link href="/contact" className="group relative inline-flex items-center gap-3 px-8 py-4 border border-border-subtle rounded-full hover:bg-foreground hover:text-background transition-all bg-background/50 backdrop-blur-sm">
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold">Begin The Work</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2: MANIFESTO - TIGHTENED (py-12) */}
      <section className="py-12 px-6 bg-transparent relative z-10 border-t border-border-subtle">
        <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-border-subtle to-transparent mx-auto" />
            <h2 className="text-2xl md:text-3xl font-light leading-relaxed">
                &quot;I am not a painter, so I paint.<br/>
                I am not a coder, so I code.&quot;<br/>
                We think, speak, and build <span className="border-b border-foreground/20 pb-1">outside of the box</span>.
            </h2>
        </div>
      </section>

      {/* SECTION 3: PROJECTS */}
      <Projects />

      {/* SECTION 4: THE MEDIUM - BENTO GRID */}
      <section className="py-24 px-6 bg-transparent border-t border-border-subtle relative z-10">
        <div className="max-w-7xl mx-auto">
            <div className="mb-12">
                <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-4">THE MEDIUM</h2>
                <p className="text-muted-foreground text-lg font-light max-w-md">
                   Every detail considered. Every element intentional.
                </p>
            </div>
            
            {/* SPRUCED UP GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                {[
                    { icon: Palette, title: "Visual Identity", desc: "A look that's unmistakably yours.", index: "01" },
                    { icon: Code2, title: "Digital Presence", desc: "Built to perform, designed to impress.", index: "02" },
                    { icon: Maximize2, title: "Growth", desc: "Foundations that scale with your ambition.", index: "03" },
                    { icon: Move, title: "Experience", desc: "Interactions that feel alive.", index: "04" },
                    { icon: Layers, title: "Discovery", desc: "Found when it matters most.", index: "05" },
                    { icon: PenTool, title: "Story", desc: "Your narrative, told beautifully.", index: "06" }
                ].map((s, i) => (
                    <div key={i} className="group relative bg-background/40 border border-border-subtle p-10 hover:bg-foreground/5 transition-colors duration-500">
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-3 rounded-lg text-muted-foreground group-hover:text-foreground transition-colors">
                                <s.icon strokeWidth={1} size={28} />
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground/30">{s.index}</span>
                        </div>
                        <h3 className="text-xl font-light mb-2 text-foreground">{s.title}</h3>
                        <p className="text-muted-foreground text-sm font-light leading-relaxed">{s.desc}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* SECTION 5: FINAL CTA */}
      <section className="py-40 px-6 bg-transparent text-center relative z-10 border-t border-border-subtle">
        <div className="max-w-2xl mx-auto space-y-12">
            <motion.div className="w-32 h-32 mx-auto relative group">
                <div className="absolute inset-0 bg-foreground/5 blur-3xl rounded-full" />
                <img src="/talormayde-logo.png" alt="Talormayde Mark" className="adaptive-logo relative z-10 w-full h-full object-contain opacity-80" />
            </motion.div>
            
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