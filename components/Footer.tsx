"use client";
import { motion } from "framer-motion";
import { Github, Instagram, Linkedin, Twitter, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
  const [time, setTime] = useState("");

  // Real-time Clock (Texas Time)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { 
        timeZone: "America/Chicago", 
        hour: "2-digit", 
        minute: "2-digit", 
        hour12: false 
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-zinc-950 border-t border-white/10 pt-20 pb-10 px-6 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
          
          {/* Left: The Call */}
          <div className="space-y-8">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none">
              READY TO <br />
              <span className="text-zinc-500 group-hover:text-white transition-colors">SCALE?</span>
            </h2>
            <Link href="/contact">
              <button className="group flex items-center gap-4 text-xl font-bold hover:gap-6 transition-all">
                <span className="border-b border-white pb-1">INITIATE PROJECT</span>
                <div className="bg-white text-black rounded-full p-2 group-hover:rotate-45 transition-transform duration-500">
                  <ArrowUpRight size={20} />
                </div>
              </button>
            </Link>
          </div>

          {/* Right: The Grid */}
          <div className="grid grid-cols-2 gap-8 text-sm text-zinc-400">
            <div className="space-y-4">
              <h4 className="text-white font-mono uppercase tracking-widest text-xs mb-6">Sitemap</h4>
              <Link href="/" className="block hover:text-white transition-colors">Index</Link>
              <Link href="/services" className="block hover:text-white transition-colors">Capabilities</Link>
              <Link href="/#work" className="block hover:text-white transition-colors">Selected Work</Link>
              <Link href="/about" className="block hover:text-white transition-colors">The Agency</Link>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-mono uppercase tracking-widest text-xs mb-6">Socials</h4>
              <Link href="#" className="block hover:text-white transition-colors">Instagram</Link>
              <Link href="#" className="block hover:text-white transition-colors">Twitter / X</Link>
              <Link href="#" className="block hover:text-white transition-colors">LinkedIn</Link>
              <Link href="#" className="block hover:text-white transition-colors">GitHub</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-zinc-500 uppercase tracking-wider">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span>Systems Online • {time} TX</span>
          </div>
          <div>
            © 2025 TALORMAYDE.
          </div>
        </div>
      </div>
    </footer>
  );
}