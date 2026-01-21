"use client";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
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
    <footer className="bg-background border-t border-border-subtle pt-20 pb-10 px-6 relative overflow-hidden font-sans selection:bg-white selection:text-black">
      
      {/* Background Decor - Subtle & Dark */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/5 rounded-full blur-[120px] pointer-events-none mix-blend-overlay" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
          
          {/* Left: The Call */}
          <div className="space-y-8">
            <h2 className="text-5xl md:text-7xl font-light tracking-tight leading-none text-foreground mix-blend-overlay">
              READY TO <br />
              <span className="text-foreground">CREATE?</span>
            </h2>
            <Link href="/contact">
              <button className="group flex items-center gap-4 text-sm md:text-base font-mono uppercase tracking-widest hover:gap-6 transition-all text-zinc-400 hover:text-foreground">
                <span className="border-b border-zinc-500 group-hover:border-white pb-1 transition-colors">Begin the Work</span>
                <div className="bg-white text-black rounded-full p-2 group-hover:rotate-45 transition-transform duration-500">
                  <ArrowUpRight size={16} />
                </div>
              </button>
            </Link>
          </div>

          {/* Right: The Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <div className="space-y-4">
              <h4 className="text-foreground mb-6 opacity-50">Sitemap</h4>
              <Link href="/" className="block hover:text-foreground transition-colors">Index</Link>
              <Link href="/services" className="block hover:text-foreground transition-colors">Capabilities</Link>
              <Link href="/#work" className="block hover:text-foreground transition-colors">The Collection</Link>
              <Link href="/journal" className="block hover:text-foreground transition-colors">Journal</Link>
            </div>
            <div className="space-y-4">
              <h4 className="text-foreground mb-6 opacity-50">Socials</h4>
              <Link href="#" className="block hover:text-foreground transition-colors">Instagram</Link>
              <Link href="#" className="block hover:text-foreground transition-colors">Twitter / X</Link>
              <Link href="#" className="block hover:text-foreground transition-colors">LinkedIn</Link>
            </div>
            <div className="space-y-4">
              <h4 className="text-foreground mb-6 opacity-50">Legal</h4>
              <Link href="/privacy" className="block hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/login" className="block hover:text-emerald-500 transition-colors">Client Access</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border-subtle pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>Studio Online • {time} TX</span>
          </div>
          <div>
            © 2026 TALORMAYDE.
          </div>
        </div>
      </div>
    </footer>
  );
}