"use client";
import { motion } from "framer-motion";
import { Ruler, Aperture, PenTool } from "lucide-react";
import Image from "next/image";
import LivingCanvas from "../../components/LivingCanvas";

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-32 px-6 pb-20 relative overflow-hidden font-sans selection:bg-white selection:text-black">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <LivingCanvas />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        
        {/* SECTION 1: THE PHILOSOPHY */}
        <div className="mb-32 text-center md:text-left">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-foreground/20 to-transparent mx-auto md:mx-0 mb-8" />
                
                <h1 className="text-5xl md:text-8xl font-light tracking-tight text-foreground mix-blend-overlay leading-none">
                    UNDEFINED <br />
                    <span className="text-muted-foreground/40">BY NATURE.</span>
                </h1>
                
                <div className="max-w-2xl text-lg md:text-xl text-muted-foreground font-light leading-relaxed space-y-6">
                    <p>
                        <strong className="text-foreground font-normal">talormayde</strong> is an interdisciplinary atelier positioned at the intersection of design, technology, and story.
                    </p>
                    <p>
                        We reject the separation between &quot;Creative&quot; and &quot;Strategic.&quot; 
                        To us, a brand is a living thing — it needs to look right, feel right, and be found by the right people. 
                        We don&apos;t do templates or quick fixes. We measure, cut, and fit every element to your vision.
                    </p>
                </div>
            </motion.div>
        </div>

        {/* SECTION 2: THE PILLARS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-border-subtle pt-20 mb-32">
            {[
                { 
                  icon: Ruler, 
                  title: "Precision", 
                  desc: "Every brand has contours. We take the time to understand yours — your market, your customers, your vision — before a single pixel is placed." 
                },
                { 
                  icon: Aperture, 
                  title: "Vision", 
                  desc: "We don't just build — we compose. Every image, every interaction, every word is calibrated to tell your story and connect with your audience." 
                },
                { 
                  icon: PenTool, 
                  title: "Craft", 
                  desc: "We believe in the bespoke. No templates, no shortcuts. Your brand deserves something made by hand, with intention, built to last." 
                }
            ].map((item, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group"
                >
                    <div className="w-12 h-12 bg-foreground/5 rounded-full flex items-center justify-center mb-6 text-muted-foreground group-hover:text-foreground group-hover:bg-foreground/10 transition-all">
                        <item.icon strokeWidth={1} size={20} />
                    </div>
                    <h3 className="text-lg font-light text-foreground mb-4 uppercase tracking-widest">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-loose font-light">{item.desc}</p>
                </motion.div>
            ))}
        </div>

        {/* SECTION 3: THE STUDIO */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-foreground/5 overflow-hidden rounded-sm grayscale hover:grayscale-0 transition-all duration-1000 group">
            
            {/* Background Image */}
            <Image 
              src="/the-studio-space.jpg" 
              alt="talormayde Studio" 
              fill 
              className="object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" 
            />
            
            {/* Overlay Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border-subtle)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border-subtle)_2px,transparent_2px)] bg-[size:60.15px_60px] z-10" />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80 z-10" />
        </div>

        {/* Footer Note */}
        <div className="mt-10 text-center md:text-left">
            <p className="text-muted-foreground/70 font-mono text-[10px] uppercase tracking-widest">
                Established 2010
            </p>
        </div>

      </div>
    </div>
  );
}