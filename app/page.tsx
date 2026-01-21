"use client";
import { motion } from "framer-motion";
import { ArrowDown, Github, Instagram, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";
import Projects from "../components/Projects"; 

export default function Home() {
  
  // --- GEO DATA (Structured Data for AI) ---
  // This helps ChatGPT/Google understand your business entity
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Talormayde",
    "url": "https://talormayde.com",
    "description": "A full-stack digital agency specializing in high-performance web architecture, video production, and social growth strategy.",
    "priceRange": "$$$",
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "TX",
      "addressCountry": "US"
    },
    "knowsAbout": ["Next.js", "SEO", "Video Production", "Brand Strategy", "Web Development"]
  };

  return (
    <div className="bg-zinc-950 min-h-screen text-white selection:bg-white selection:text-black">
      
      {/* INJECT GEO DATA FOR AI */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* --- HERO SECTION --- */}
      <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
        
        {/* Background: Grid Texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        {/* Background: Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

        {/* The Manifesto */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center space-y-8 z-10 max-w-5xl"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="flex items-center justify-center gap-3 text-zinc-500 font-mono text-xs tracking-[0.2em] uppercase"
          >
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Est. 2025 • Systems Online
          </motion.div>

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
            Digital architecture, cinematic storytelling, and generative optimization. 
            We engineer the standard of excellence.
          </motion.p>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
            className="pt-8"
          >
            <a href="#work">
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
          className="absolute bottom-12 animate-bounce text-zinc-600 hidden md:block"
        >
          <ArrowDown size={24} />
        </motion.div>
      </main>

      {/* --- PROJECTS SECTION --- */}
      <Projects />

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/10 bg-black pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">TALORMAYDE</h2>
            <p className="text-zinc-500 text-sm mt-2">© 2025 All Rights Reserved.</p>
          </div>
          
          <div className="flex gap-6">
            {[Github, Twitter, Instagram, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="text-zinc-500 hover:text-white transition-colors">
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>
      </footer>
      
    </div>
  );
}