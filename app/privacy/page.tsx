"use client";
import { motion } from "framer-motion";
import { Lock, FileText, ShieldCheck, Eye } from "lucide-react";
import Link from "next/link";
import LivingCanvas from "@/components/LivingCanvas";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-white selection:text-black pt-32 px-6 pb-20 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <LivingCanvas />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-24 text-center space-y-6">
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-auto mb-8" />
          
          <h1 className="text-4xl md:text-6xl font-light tracking-tight text-foreground mix-blend-overlay">
            PRIVACY POLICY
          </h1>
          <p className="text-muted-foreground text-xs font-mono tracking-[0.2em] uppercase max-w-lg mx-auto leading-relaxed">
            Effective Date: {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-16 leading-relaxed text-zinc-400 font-light">
          
          <section className="space-y-6">
            <h3 className="text-foreground text-sm font-mono uppercase tracking-widest flex items-center gap-3 border-b border-border-subtle pb-4">
              <FileText size={14} className="text-muted-foreground" /> 1. Information Collection
            </h3>
            <p>
              Talormayde Studio collects information necessary to provide our design and development services. 
              When you contact us or commission a project, we may collect:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {[
                "Personal Identity (Name)",
                "Contact Information (Email)",
                "Project Specifications",
                "Billing Details (via Stripe)"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-zinc-300 bg-white/5 p-4 rounded-lg border border-border-subtle">
                  <div className="w-1 h-1 bg-white rounded-full" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-6">
            <h3 className="text-foreground text-sm font-mono uppercase tracking-widest flex items-center gap-3 border-b border-border-subtle pb-4">
              <Lock size={14} className="text-muted-foreground" /> 2. Security & Storage
            </h3>
            <p>
              We value discretion. Your data is encrypted and stored securely using enterprise-grade infrastructure (Google Cloud Platform). 
              We do not share, sell, or disclose client information to third parties unless required by law or necessary for project fulfillment (e.g., payment processing).
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-foreground text-sm font-mono uppercase tracking-widest flex items-center gap-3 border-b border-border-subtle pb-4">
              <Eye size={14} className="text-muted-foreground" /> 3. Usage of Information
            </h3>
            <p>
              Information is used strictly for the purpose of:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400 marker:text-zinc-600">
              <li>Facilitating the design and development process.</li>
              <li>Processing invoices and contracts.</li>
              <li>maintaining a record of project deliverables.</li>
            </ul>
          </section>

          <section className="p-8 bg-background/40 border border-border-subtle rounded-2xl backdrop-blur-sm">
            <h3 className="text-foreground text-xs font-mono uppercase tracking-widest mb-4 flex items-center gap-2">
               <ShieldCheck size={14} /> Your Rights
            </h3>
            <p className="mb-6 text-sm">
              You maintain the right to access, correct, or delete your personal information from our records at any time.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 text-foreground border-b border-white/20 pb-1 hover:border-white transition-all text-xs uppercase tracking-widest">
              Contact Privacy Officer &rarr;
            </Link>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-32 pt-8 border-t border-border-subtle text-center">
            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                Talormayde Studio © {new Date().getFullYear()}
            </p>
        </div>

      </div>
    </div>
  );
}