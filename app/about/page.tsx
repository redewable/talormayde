"use client";
import { motion } from "framer-motion";
import { Code, Aperture, PenTool } from "lucide-react";
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
                <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-auto md:mx-0 mb-8" />
                
                <h1 className="text-5xl md:text-8xl font-light tracking-tight text-foreground mix-blend-overlay leading-none">
                    UNDEFINED <br />
                    <span className="text-zinc-600">BY NATURE.</span>
                </h1>
                
                <div className="max-w-2xl text-lg md:text-xl text-zinc-400 font-light leading-relaxed space-y-6">
                    <p>
                        <strong className="text-foreground font-normal">Talormayde</strong> is an interdisciplinary atelier positioned at the intersection of design, technology, and art.
                    </p>
                    <p>
                        We reject the separation between &quot;Creative&quot; and &quot;Technical.&quot; 
                        To us, clean code is a form of poetry, and a user interface is a living environment. 
                        We do not rely on templates or shortcuts. We build bespoke systems for brands that require distinct identities.
                    </p>
                </div>
            </motion.div>
        </div>

        {/* SECTION 2: THE PILLARS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-border-subtle pt-20 mb-32">
            {[
                { icon: Code, title: "Structure", desc: "We build on modern foundations (Next.js), ensuring speed, security, and scalability are inherent, not afterthoughts." },
                { icon: Aperture, title: "Vision", desc: "We don't just capture content; we compose scenes. Every image and motion is calibrated to tell a story." },
                { icon: PenTool, title: "Craft", desc: "We believe in the 'Hand-Made Web.' Every pixel is placed with intention, creating a feeling of luxury and permanence." }
            ].map((item, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group"
                >
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-6 text-zinc-400 group-hover:text-foreground group-hover:bg-white/10 transition-all">
                        <item.icon strokeWidth={1} size={20} />
                    </div>
                    <h3 className="text-lg font-light text-foreground mb-4 uppercase tracking-widest">{item.title}</h3>
                    <p className="text-muted-foreground text-sm leading-loose font-light">{item.desc}</p>
                </motion.div>
            ))}
        </div>

        {/* SECTION 3: THE STUDIO (Image Placeholder) */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-zinc-900 overflow-hidden rounded-sm grayscale hover:grayscale-0 transition-all duration-1000 group">
            
            {/* Overlay Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
            
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center space-y-4">
                    <p className="text-zinc-600 font-mono text-xs uppercase tracking-[0.3em] group-hover:text-zinc-400 transition-colors">
                        [ The Studio Space ]
                    </p>
                    {/* Image placeholder - uncomment when ready */}
                    {/* <Image src="/studio.jpg" alt="Talormayde Studio" fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" /> */}
                </div>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        </div>

        {/* Footer Note */}
        <div className="mt-20 text-center md:text-left">
            <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">
                Established 2010 • Bryan, Texas
            </p>
        </div>

      </div>
    </div>
  );
}