"use client";
import { motion } from "framer-motion";
import { Check, Zap, Globe, Crown } from "lucide-react";
import Link from "next/link";

const TIERS = [
  {
    name: "PROTOCOL: GENESIS",
    price: "$2,500",
    desc: "The essential digital footprint. Perfect for startups establishing a beachhead.",
    icon: Globe,
    features: [
      "High-Performance Landing Page",
      "Next.js + Tailwind Architecture",
      "Mobile-First Responsive Design",
      "Basic SEO Configuration",
      "Contact Form Integration",
      "1 Week Turnaround"
    ],
    cta: "Initiate Genesis",
    color: "border-zinc-800",
    bg: "bg-zinc-900/20"
  },
  {
    name: "PROTOCOL: ASCENSION",
    price: "$5,000",
    desc: "Full-scale digital ecosystem. For brands ready to compete and convert.",
    icon: Zap,
    popular: true,
    features: [
      "Multi-Page Interactive System",
      "Admin Dashboard (CMS)",
      "Blog / Project Portfolio",
      "Advanced Animation & Physics",
      "Google Analytics & GEO Setup",
      "Email Marketing Integration",
      "3 Week Turnaround"
    ],
    cta: "Initiate Ascension",
    color: "border-emerald-500/50",
    bg: "bg-zinc-900/60"
  },
  {
    name: "PROTOCOL: DOMINANCE",
    price: "$8,000+",
    desc: "Total market warfare. Custom engineering, video production, and aggressive growth.",
    icon: Crown,
    features: [
      "Enterprise-Grade Architecture",
      "E-Commerce / Custom Web App",
      "Cinematic Video Production",
      "Social Media Strategy (1 Month)",
      "Advanced SEO & Backlinking",
      "Priority 24/7 Support",
      "Custom Timeline"
    ],
    cta: "Initiate Dominance",
    color: "border-purple-500/50",
    bg: "bg-zinc-900/20"
  }
];

export default function Packages() {
  return (
    <section className="py-32 px-6 max-w-7xl mx-auto">
      
      <div className="text-center mb-20">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">TACTICAL LOADOUTS</h2>
        <p className="text-zinc-400 max-w-xl mx-auto">
          Transparent pricing for scalable systems. Choose your level of engagement.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TIERS.map((tier, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative p-8 rounded-3xl border ${tier.color} ${tier.bg} flex flex-col`}
          >
            {/* "Most Popular" Badge */}
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black font-bold text-xs uppercase tracking-widest px-4 py-1 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                Recommended
              </div>
            )}

            <div className="mb-8">
              <div className="w-12 h-12 bg-zinc-950 rounded-xl border border-white/10 flex items-center justify-center mb-6 text-white">
                <tier.icon size={24} />
              </div>
              <h3 className="text-sm font-mono text-zinc-500 tracking-widest mb-2">{tier.name}</h3>
              <div className="text-4xl font-bold text-white mb-4">{tier.price}</div>
              <p className="text-sm text-zinc-400 leading-relaxed">{tier.desc}</p>
            </div>

            {/* Feature List */}
            <ul className="space-y-4 mb-8 flex-grow">
              {tier.features.map((feat) => (
                <li key={feat} className="flex items-start gap-3 text-sm text-zinc-300">
                  <Check size={16} className="mt-0.5 text-emerald-500 flex-shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Link href="/contact" className="w-full">
              <button className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all ${
                tier.popular 
                  ? "bg-white text-black hover:bg-emerald-400" 
                  : "bg-zinc-800 text-white hover:bg-white hover:text-black"
              }`}>
                {tier.cta}
              </button>
            </Link>

          </motion.div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <p className="text-zinc-500 text-sm">
          Need a custom deployment? <Link href="/contact" className="text-white underline decoration-zinc-700 underline-offset-4 hover:decoration-white transition-all">Contact Command</Link>
        </p>
      </div>

    </section>
  );
}