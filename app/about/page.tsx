"use client";
import { motion } from "framer-motion";
import { Code, Aperture, Cpu } from "lucide-react";
import Image from "next/image"; 

export default function About() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-32 px-6 pb-20">
      
      {/* SECTION 1: THE HOOK */}
      <div className="max-w-4xl mx-auto mb-24">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-zinc-500 font-mono text-xs tracking-[0.3em] uppercase mb-4"
        >
          The Origin
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight mb-8"
        >
          WE DO NOT JUST WATCH THE FUTURE. <br />
          <span className="text-zinc-500">WE ENGINEER IT.</span>
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert prose-lg text-zinc-400"
        >
          <p>
            In a world saturated with noise, <strong>clarity is power.</strong>
          </p>
          <p>
            Talormayde was founded on a single premise: The separation between &quot;Creative&quot; and &quot;Technical&quot; is a lie. 
            Great code is art. Great video is engineering. To build a true legacy brand in the modern era, 
            you cannot be just one. You must be both.
          </p>
          <p>
            We are a hybrid firm. We speak the languages of algorithms and emotions fluently. 
            We build digital architecture that ranks, performs, and converts—and we fill it with stories that resonate.
          </p>
        </motion.div>
      </div>

      {/* SECTION 2: THE TRINITY */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
        {[
          { icon: Code, title: "The Architect", desc: "Clean, efficient, scalable code. We build platforms, not just pages." },
          { icon: Aperture, title: "The Director", desc: "Cinematic visuals. We don't capture content; we compose scenes." },
          { icon: Cpu, title: "The Strategist", desc: "Data-driven growth. We optimize for the machines that run the world." }
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900/30 border border-white/5 p-8 rounded-2xl hover:bg-zinc-900/50 transition-colors"
          >
            <item.icon size={32} className="text-white mb-6" />
            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* SECTION 3: THE IMAGE PLACEHOLDER */}
      <div className="max-w-7xl mx-auto h-[400px] md:h-[600px] relative rounded-3xl overflow-hidden mb-32 bg-zinc-900 border border-white/5 grayscale hover:grayscale-0 transition-all duration-700">
        <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-zinc-600 font-mono text-sm">[ UPLOAD STUDIO / TEAM PHOTO HERE ]</p>
            {/* WHEN READY, UNCOMMENT THIS:
              <Image src="/your-team-photo.jpg" alt="The Team" fill className="object-cover" />
            */}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
      </div>

    </div>
  );
}