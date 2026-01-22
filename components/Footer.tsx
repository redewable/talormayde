"use client";
import Link from "next/link";
import { ArrowUpRight, Instagram, Linkedin, Facebook, Github, Fingerprint } from "lucide-react";

// Custom X Logo
const XLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border-subtle pt-32 pb-12 px-6 relative overflow-hidden z-40">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32">
            
            {/* LEFT: MASSIVE CALL TO ACTION */}
            <div className="flex flex-col justify-between">
                <div>
                    <h2 className="text-[12vw] lg:text-[7rem] font-light tracking-tighter leading-[0.85] text-foreground mb-8">
                        READY TO<br />
                        <span className="text-muted-foreground">CREATE?</span>
                    </h2>
                </div>
                <div>
                    <Link href="/contact" className="group inline-flex items-center gap-4 text-sm font-mono uppercase tracking-widest text-foreground border-b border-foreground/30 pb-2 hover:border-foreground transition-all">
                        Initiate Commission 
                        <ArrowUpRight size={16} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
            
            {/* RIGHT: BALANCED 3-COLUMN GRID */}
            <div className="grid grid-cols-3 gap-8 lg:pt-4">
                
                {/* COL 1: INDEX (5 Items) */}
                <div className="space-y-8">
                    <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground/60">Index</h4>
                    <nav className="flex flex-col gap-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                        <Link href="/services" className="hover:text-foreground transition-colors">Capabilities</Link>
                        <Link href="/#work" className="hover:text-foreground transition-colors">The Collection</Link>
                        <Link href="/journal" className="hover:text-foreground transition-colors">Journal</Link>
                        <Link href="/about" className="hover:text-foreground transition-colors">Studio</Link>
                    </nav>
                </div>
                
                {/* COL 2: NETWORK (5 Items - Vertically Stacked to Match Index) */}
                <div className="space-y-8">
                    <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground/60">Network</h4>
                    <div className="flex flex-col gap-4 text-muted-foreground">
                        <Link href="#" className="hover:text-foreground transition-colors w-fit" aria-label="GitHub">
                            <Github size={20} strokeWidth={1.5} />
                        </Link>
                        <Link href="#" className="hover:text-foreground transition-colors w-fit" aria-label="LinkedIn">
                            <Linkedin size={20} strokeWidth={1.5} />
                        </Link>
                        <Link href="#" className="hover:text-foreground transition-colors w-fit" aria-label="Instagram">
                            <Instagram size={20} strokeWidth={1.5} />
                        </Link>
                        <Link href="#" className="hover:text-foreground transition-colors w-fit" aria-label="Facebook">
                            <Facebook size={20} strokeWidth={1.5} />
                        </Link>
                        <Link href="#" className="hover:text-foreground transition-colors w-fit" aria-label="X">
                            <XLogo className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                {/* COL 3: LEGAL (4 Items) */}
                <div className="space-y-8">
                    <h4 className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground/60">Legal</h4>
                    <nav className="flex flex-col gap-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                        <div className="h-px w-8 bg-border-subtle my-2" />
                        <Link href="/login" className="flex items-center gap-2 hover:text-foreground transition-colors text-emerald-500/80 hover:text-emerald-500">
                            <Fingerprint size={14} /> Client Access
                        </Link>
                    </nav>
                </div>

            </div>
        </div>

        {/* BOTTOM METADATA */}
        <div className="flex flex-col md:flex-row justify-between items-end border-t border-border-subtle pt-8 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40">
            <p>talormayde Atelier © {currentYear}</p>
            <p>TX / Global</p>
        </div>
      </div>
    </footer>
  );
}