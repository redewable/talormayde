"use client";
import { motion } from "framer-motion";
import { Check, Layers, Layout, Sparkles } from "lucide-react";
import Link from "next/link";

const TIERS = [
  {
    name: "Foundation",
    price: "$2,500",
    desc: "The essential digital footprint. Meticulously crafted for emerging brands establishing their aesthetic.",
    icon: Layout,
    features: [
      "High-Performance Landing Page",
      "Next.js + React Architecture",
      "Mobile-First Responsive Design",
      "Core SEO Configuration",
      "Contact Form Integration",
      "1 Week Timeline"
    ],
    cta: "Select Foundation",
  },
  {
    name: "Signature",
    price: "$5,000",
    desc: "Our standard for digital excellence. A complete immersive ecosystem designed to convert and scale.",
    icon: Layers,
    popular: true,
    features: [
      "Multi-Page Interactive System",
      "Content Management (CMS)",
      "Project / Journal Portfolio",
      "Advanced Motion & Physics",
      "Analytics & Growth Setup",
      "Newsletter Integration",
      "3 Week Timeline"
    ],
    cta: "Select Signature",
  },
  {
    name: "Bespoke",
    price: "Custom",
    desc: "Unlimited engineering. For visionaries requiring custom applications, art direction, and aggressive growth.",
    icon: Sparkles,
    features: [
      "Enterprise-Grade Architecture",
      "Custom Web Applications",
      "Cinematic Art Direction",
      "Full Content Strategy",
      "Advanced SEO & Backlinking",
      "Priority Access Support",
      "Custom Timeline"
    ],
    cta: "Inquire for Bespoke",
  }
];

export default function Packages() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto font-sans">
      
      <div className="text-center mb-24 space-y-6">
        <h2 className="text-4xl md:text-5xl font-light text-foreground tracking-tight">
          ENGAGEMENT MODELS
        </h2>
        <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest max-w-md mx-auto">
          Transparent investments for scalable systems.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TIERS.map((tier, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`relative p-10 rounded-3xl border flex flex-col transition-all duration-500 ${
              tier.popular 
                ? "bg-white/5 border-white/20 shadow-2xl shadow-white/5" 
                : "bg-background/20 border-border-subtle hover:border-white/10"
            }`}
          >
            {/* Header */}
            <div className="mb-10">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${
                tier.popular ? "bg-white text-black" : "bg-white/5 text-zinc-400"
              }`}>
                <tier.icon strokeWidth={1} size={24} />
              </div>
              
              <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-4">
                {tier.name}
              </h3>
              
              <div className="text-4xl font-light text-foreground mb-6">
                {tier.price}
              </div>
              
              <p className="text-sm text-zinc-400 font-light leading-relaxed">
                {tier.desc}
              </p>
            </div>

            {/* Feature List */}
            <ul className="space-y-4 mb-10 flex-grow">
              {tier.features.map((feat) => (
                <li key={feat} className="flex items-start gap-4 text-sm text-zinc-300 font-light">
                  <Check size={14} className={`mt-1 flex-shrink-0 ${tier.popular ? "text-foreground" : "text-zinc-600"}`} />
                  {feat}
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Link href="/contact" className="w-full">
              <button className={`w-full py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                tier.popular 
                  ? "bg-white text-black hover:bg-zinc-200" 
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-foreground hover:border-white"
              }`}>
                {tier.cta}
              </button>
            </Link>

          </motion.div>
        ))}
      </div>

      <div className="mt-24 text-center">
        <p className="text-muted-foreground text-sm font-light">
          Not sure where to start? <Link href="/contact" className="text-foreground border-b border-zinc-700 pb-0.5 hover:border-white transition-all ml-1">Start a Conversation</Link>
        </p>
      </div>

    </section>
  );
}