"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, PenTool, Move, Maximize2, Palette, Code2, Layers } from "lucide-react";
import Link from "next/link";
import Projects from "@/components/Projects"; 
import LivingCanvas from "@/components/LivingCanvas";
import MediumModal from "@/components/MediumModal";

const MEDIUM_ITEMS = [
  { icon: Palette, title: "Visual Identity", desc: "A look that's unmistakably yours.", index: "01" },
  { icon: Code2, title: "Digital Presence", desc: "Built to perform, designed to impress.", index: "02" },
  { icon: Maximize2, title: "Growth", desc: "Foundations that scale with your ambition.", index: "03" },
  { icon: Move, title: "Experience", desc: "Interactions that feel alive.", index: "04" },
  { icon: Layers, title: "Discovery", desc: "Found when it matters most.", index: "05" },
  { icon: PenTool, title: "Story", desc: "Your narrative, told beautifully.", index: "06" }
];

export default function Home() {
  const [selectedMedium, setSelectedMedium] = useState<string | null>(null);

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

      {/* SECTION 2: MANIFESTO */}
      <section className="py-20 md:py-32 px-6 bg-transparent relative z-10 border-t border-border-subtle">
        <div className="max-w-4xl mx-auto text-center">
            <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-border-subtle to-transparent mx-auto mb-12" />
            
            {/* The Quote - Elegant Serif Italic */}
            <blockquote className="mb-8">
              <p className="font-serif italic text-2xl md:text-4xl lg:text-5xl font-light leading-relaxed md:leading-relaxed text-foreground">
                As The Creator of Heaven and Earth, <br />
                God designed us in His own Image.<br className="hidden sm:block" />
                We create to inspire others to do the same.
              </p>
              <span className="block mt-6 text-burgandy-500 text-sm md:text-base font-mono tracking-widest">
                #talormayde
              </span>
            </blockquote>

            
            <div className="w-[1px] h-12 bg-gradient-to-b from-border-subtle via-transparent to-transparent mx-auto mt-12" />
        </div>
      </section>

      {/* SECTION 3: PROJECTS */}
      <Projects />

      {/* SECTION 4: THE MEDIUM - CLICKABLE GRID */}
      <section className="py-24 px-6 bg-transparent border-t border-border-subtle relative z-10">
        <div className="max-w-7xl mx-auto">
            <div className="mb-12">
                <h2 className="text-4xl md:text-6xl font-light tracking-tight mb-4">THE MEDIUM</h2>
                <p className="text-muted-foreground text-lg font-light max-w-md">
                   Every detail considered. Every element intentional.
                </p>
            </div>
            
            {/* CLICKABLE GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                {MEDIUM_ITEMS.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => setSelectedMedium(s.title)}
                        className="group relative bg-background/40 border border-border-subtle p-10 hover:bg-foreground/5 transition-all duration-500 text-left cursor-pointer"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-3 rounded-lg text-muted-foreground group-hover:text-foreground transition-colors">
                                <s.icon strokeWidth={1} size={28} />
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors">{s.index}</span>
                        </div>
                        <h3 className="text-xl font-light mb-2 text-foreground">{s.title}</h3>
                        <p className="text-muted-foreground text-sm font-light leading-relaxed">{s.desc}</p>
                        
                        {/* Hover indicator */}
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest">Learn more</span>
                        </div>
                    </button>
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

      {/* MEDIUM MODAL */}
      {selectedMedium && (
        <MediumModal 
          itemTitle={selectedMedium} 
          onClose={() => setSelectedMedium(null)} 
        />
      )}
    </div>
  );
}