"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Gem, Crown, Sparkles } from "lucide-react";
import Link from "next/link";
import PackageModal from "./PackageModal";

const TIERS = [
  {
    name: "Essentials",
    tagline: "Your Foundation",
    price: "$2,500",
    desc: "A refined digital home for your brand. Perfect for those ready to establish a distinguished presence online.",
    icon: Gem,
    features: [
      "A website that reflects your brand's quality",
      "Appear when customers search for you",
      "Seamless experience on any device",
      "A clear path for customers to reach you",
      "Ownership of your digital space",
    ],
    timeline: "Delivered in 1–2 weeks",
    cta: "Start Here",
  },
  {
    name: "Signature",
    tagline: "The Full Experience",
    price: "$5,000",
    desc: "A complete presence designed to grow with you. For brands ready to be discovered, remembered, and chosen.",
    icon: Crown,
    popular: true,
    features: [
      "A multi-page experience that tells your story",
      "Update your content anytime, from anywhere",
      "See exactly who's finding you and how",
      "Social profiles aligned to your identity",
      "A journal or portfolio to share your voice",
      "Built to scale as you grow",
    ],
    timeline: "Delivered in 3–4 weeks",
    cta: "Most Popular",
  },
  {
    name: "Bespoke",
    tagline: "Without Limits",
    price: "Custom",
    desc: "For visionaries who refuse to blend in. Custom-crafted systems, strategic visibility, and a presence that dominates.",
    icon: Sparkles,
    features: [
      "Your story, told across every channel",
      "Targeted reach to your ideal audience",
      "Own your local and regional search results",
      "Cinematic content and art direction",
      "Strategic campaigns that convert",
      "Priority partnership and support",
    ],
    timeline: "Timeline fitted to scope",
    cta: "Begin the Conversation",
  },
];

export default function Packages() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="text-center mb-24 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-light text-foreground tracking-tight mb-4">
            ENGAGEMENTS
          </h2>
          <p className="text-muted-foreground text-sm font-light max-w-lg mx-auto leading-relaxed">
            Every partnership begins with understanding what you need.<br />
            Choose the level that fits your vision.
          </p>
        </motion.div>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-4">
        {TIERS.map((tier, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className={`group relative p-10 lg:p-12 rounded-sm border flex flex-col transition-all duration-500 ${
              tier.popular
                ? "bg-foreground/[0.03] border-foreground/20 shadow-2xl shadow-foreground/5"
                : "bg-background/20 border-border-subtle hover:border-foreground/10"
            }`}
          >
            {/* Popular Badge */}
            {tier.popular && (
              <div className="absolute -top-3 left-10">
                <span className="bg-foreground text-background text-[10px] font-mono uppercase tracking-widest px-4 py-1.5">
                  Recommended
                </span>
              </div>
            )}

            {/* Header */}
            <div className="mb-10">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 ${
                  tier.popular
                    ? "bg-foreground text-background"
                    : "bg-foreground/5 text-muted-foreground"
                }`}
              >
                <tier.icon strokeWidth={1} size={22} />
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-light text-foreground tracking-tight mb-1">
                  {tier.name}
                </h3>
                <p className="text-xs font-mono text-muted-foreground/60 uppercase tracking-widest">
                  {tier.tagline}
                </p>
              </div>

              <div className="text-4xl font-light text-foreground mb-4">
                {tier.price}
              </div>

              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                {tier.desc}
              </p>
            </div>

            {/* Feature List */}
            <ul className="space-y-4 mb-8 flex-grow">
              {tier.features.map((feat) => (
                <li
                  key={feat}
                  className="flex items-start gap-4 text-sm text-muted-foreground font-light"
                >
                  <Check
                    size={14}
                    className={`mt-1 flex-shrink-0 ${
                      tier.popular ? "text-foreground" : "text-muted-foreground/50"
                    }`}
                  />
                  <span className="leading-relaxed">{feat}</span>
                </li>
              ))}
            </ul>

            {/* Timeline */}
            <div className="mb-8 pt-6 border-t border-border-subtle">
              <p className="text-xs font-mono text-muted-foreground/50 uppercase tracking-widest">
                {tier.timeline}
              </p>
            </div>

            {/* Buttons Container */}
            <div className="space-y-3">
              {/* CTA Button */}
              <Link href="/contact" className="w-full block">
                <button
                  className={`w-full py-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                    tier.popular
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : "bg-foreground/5 text-muted-foreground border border-border-subtle hover:text-foreground hover:border-foreground/30"
                  }`}
                >
                  {tier.cta}
                </button>
              </Link>

              {/* Learn More Button */}
              <button
                onClick={() => setSelectedTier(tier.name)}
                className="w-full py-3 text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest hover:text-muted-foreground transition-colors"
              >
                What&apos;s included →
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-20 text-center"
      >
        <p className="text-muted-foreground text-sm font-light">
          Not sure which fits?{" "}
          <Link
            href="/contact"
            className="text-foreground border-b border-border-subtle pb-0.5 hover:border-foreground transition-all ml-1"
          >
            Let&apos;s talk
          </Link>
        </p>
      </motion.div>

      {/* Package Modal */}
      {selectedTier && (
        <PackageModal 
          tierName={selectedTier} 
          onClose={() => setSelectedTier(null)} 
        />
      )}
    </section>
  );
}