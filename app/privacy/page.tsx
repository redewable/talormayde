"use client";
import { motion } from "framer-motion";
import { Shield, Lock, EyeOff } from "lucide-react";
import Link from "next/link";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400 pt-32 px-6 pb-20 font-mono text-sm">
      
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-16 border-b border-white/10 pb-8">
          <div className="flex items-center gap-2 text-emerald-500 mb-4">
            <Shield size={16} />
            <span className="uppercase tracking-widest text-xs">Protocol: Privacy</span>
          </div>
          <h1 className="text-4xl text-white font-bold tracking-tighter mb-4 font-sans">
            DATA PROTECTION DIRECTIVE
          </h1>
          <p className="opacity-50">Last Updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Content */}
        <div className="space-y-12 leading-relaxed">
          
          <section>
            <h3 className="text-white font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Lock size={14} /> 1. Data Collection
            </h3>
            <p className="mb-4">
              Talormayde ("The Agency") collects specific data points to establish communication channels. 
              When you initiate a transmission via our contact protocol, we secure the following assets:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-emerald-500">
              <li>Identity (Name / Organization)</li>
              <li>Coordinates (Email Address)</li>
              <li>Mission Brief (Project Details)</li>
              <li>Telemetry (Browser Metadata & Timezone)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-white font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <EyeOff size={14} /> 2. The Black Box (Storage)
            </h3>
            <p>
              Your data is encrypted and stored in our secure database ("The Black Box"). 
              We utilize Google Cloud Platform (Firebase) for enterprise-grade security. 
              We do not sell, trade, or leak your intel to third-party operatives.
            </p>
          </section>

          <section>
            <h3 className="text-white font-bold uppercase tracking-wider mb-4">3. Operational Usage</h3>
            <p>
              Data is used strictly for:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-emerald-500 mt-2">
              <li>Establishing project timelines.</li>
              <li>Sending invoices and contracts.</li>
              <li>Improving site performance via anonymous analytics.</li>
            </ul>
          </section>

          <section className="p-6 bg-zinc-900/30 border border-white/5 rounded-xl">
            <h3 className="text-white font-bold uppercase tracking-wider mb-2">4. Your Rights</h3>
            <p className="mb-4">
              You maintain full clearance level to request the deletion of your data logs.
            </p>
            <Link href="/contact" className="text-emerald-500 hover:text-white underline underline-offset-4 transition-colors">
              Request Data Purge &rarr;
            </Link>
          </section>

        </div>

      </div>
    </div>
  );
}