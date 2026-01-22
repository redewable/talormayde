"use client";
import { X, Gem, Crown, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PackageDetails {
  name: string;
  tagline: string;
  price: string;
  description: string;
  whatYouGet: string[];
  behindTheScenes: string[];
  idealFor: string[];
  icon: typeof Gem;
}

const PACKAGE_DETAILS: Record<string, PackageDetails> = {
  "Essentials": {
    name: "Essentials",
    tagline: "Your Foundation",
    price: "$2,500",
    icon: Gem,
    description: "A refined digital home that establishes your brand with clarity and professionalism. The starting point for businesses ready to be taken seriously online.",
    whatYouGet: [
      "A polished, single-page website that tells your story",
      "Mobile-friendly design that looks great on any device",
      "Basic search visibility so customers can find you",
      "Clear calls-to-action that guide visitors to contact you",
      "Fast loading speeds and secure hosting included",
    ],
    behindTheScenes: [
      "Custom Next.js build",
      "Mobile-first responsive CSS",
      "Core SEO setup",
      "Google Business Profile",
      "Contact form integration",
      "Vercel/Netlify hosting",
    ],
    idealFor: [
      "New businesses establishing their first online presence",
      "Professionals needing a polished digital business card",
      "Local service providers",
      "Anyone replacing an outdated website",
    ],
  },
  "Signature": {
    name: "Signature",
    tagline: "The Full Experience",
    price: "$5,000",
    icon: Crown,
    description: "A complete digital presence designed to grow with you. Beyond just a website — a system for being discovered, building trust, and converting visitors into customers.",
    whatYouGet: [
      "A multi-page website that tells your full story",
      "Content management to update text and images yourself",
      "Analytics to see who's visiting and how they found you",
      "Social media profiles designed to match your brand",
      "Blog or portfolio to share your work and expertise",
    ],
    behindTheScenes: [
      "Next.js with app router",
      "Headless CMS integration",
      "Google Analytics 4",
      "Search Console setup",
      "Schema markup",
      "Newsletter integration",
      "Core Web Vitals optimization",
    ],
    idealFor: [
      "Growing businesses ready to scale online",
      "Service providers showcasing portfolios",
      "Brands that update content regularly",
      "Businesses serious about search visibility",
    ],
  },
  "Bespoke": {
    name: "Bespoke",
    tagline: "Without Limits",
    price: "Custom",
    icon: Sparkles,
    description: "For visionaries who refuse to blend in. A full partnership — custom systems, strategic visibility, and ongoing support to dominate your market.",
    whatYouGet: [
      "Your story told across every channel",
      "Targeted campaigns reaching ideal customers",
      "Local and regional search dominance",
      "Professional photography or video direction",
      "Advertising strategy and campaign management",
      "Priority support and strategic partnership",
    ],
    behindTheScenes: [
      "Full-stack custom development",
      "Advanced SEO + GEO",
      "Google/Meta Ads management",
      "Content strategy",
      "Art direction",
      "Custom integrations",
      "Monthly strategy calls",
      "Dedicated communication channel",
    ],
    idealFor: [
      "Established businesses ready to dominate",
      "Brands launching new products or services",
      "Companies needing full-service partnership",
      "Visionaries with ambitious goals",
    ],
  },
};

export default function PackageModal({ tierName, onClose }: { tierName: string; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const tier = PACKAGE_DETAILS[tierName];

  useEffect(() => {
    setMounted(true);
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!mounted || !tier) return null;

  const TierIcon = tier.icon;
  const totalPages = 3;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          backgroundColor: 'var(--color-background)',
          opacity: 0.95,
        }}
      />

      {/* Centering wrapper */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          pointerEvents: 'none',
        }}
      >
        {/* Modal */}
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            pointerEvents: 'auto',
            width: '100%',
            maxWidth: '1000px',
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            overflow: 'hidden',
          }}
        >
          {/* Close Button - Desktop Only - Hand-drawn style */}
          <button 
            onClick={onClose} 
            className="hidden lg:flex absolute top-4 right-4 z-50 w-10 h-10 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="font-serif text-3xl font-light" style={{ fontStyle: 'italic' }}>×</span>
          </button>

          {/* ============ DESKTOP LAYOUT ============ */}
          <div className="hidden lg:block">
            <div className="flex">
              {/* Left Column - Header + What You Get */}
              <div className="w-1/2 p-8 border-r border-border-subtle">
                {/* Header */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-full bg-foreground/5 flex items-center justify-center text-muted-foreground">
                    <TierIcon strokeWidth={1} size={22} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-light text-foreground tracking-tight">
                      {tier.name}
                    </h2>
                    <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
                      {tier.tagline} · {tier.price}
                    </p>
                  </div>
                </div>

                <p className="text-muted-foreground font-light leading-relaxed text-base mb-6">
                  {tier.description}
                </p>

                {/* What You Get */}
                <div>
                  <h4 className="text-[10px] font-mono text-emerald-500 uppercase tracking-[0.2em] mb-4">
                    What You Get
                  </h4>
                  <ul className="space-y-3">
                    {tier.whatYouGet.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-foreground font-light">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column - Behind + Ideal For + CTA */}
              <div className="w-1/2 p-8 flex flex-col">
                {/* Behind The Scenes */}
                <div className="mb-6">
                  <h4 className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-[0.2em] mb-4">
                    Behind The Scenes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tier.behindTheScenes.map((item, i) => (
                      <span key={i} className="text-[10px] font-mono text-muted-foreground border border-border-subtle bg-foreground/5 px-2.5 py-1 rounded-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ideal For */}
                <div className="mb-6 flex-grow">
                  <h4 className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-[0.2em] mb-4">
                    Ideal For
                  </h4>
                  <ul className="space-y-2">
                    {tier.idealFor.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground font-light">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 flex-shrink-0 mt-1.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <a href="/contact" className="block">
                  <button className="w-full py-3.5 bg-foreground text-background font-bold uppercase tracking-[0.15em] text-[11px] hover:bg-foreground/90 transition-all">
                    Start With {tier.name}
                  </button>
                </a>
              </div>
            </div>
          </div>

          {/* ============ MOBILE LAYOUT - SWIPEABLE PAGES ============ */}
          <div className="lg:hidden relative">
            {/* Header - Always visible */}
            <div className="p-5 pb-4 border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center text-muted-foreground">
                  <TierIcon strokeWidth={1} size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-light text-foreground tracking-tight">
                    {tier.name}
                  </h2>
                  <p className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-widest">
                    {tier.tagline} · {tier.price}
                  </p>
                </div>
              </div>
              
              {/* Close Button - Hand-drawn style X */}
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="font-serif text-2xl font-light" style={{ fontStyle: 'italic' }}>×</span>
              </button>
            </div>

            {/* Page Content */}
            <div className="p-5 min-h-[280px]">
              {/* Page 1: Description + What You Get */}
              {currentPage === 0 && (
                <div>
                  <p className="text-muted-foreground font-light leading-relaxed text-sm mb-5">
                    {tier.description}
                  </p>
                  <h4 className="text-[9px] font-mono text-emerald-500 uppercase tracking-[0.2em] mb-3">
                    What You Get
                  </h4>
                  <ul className="space-y-2">
                    {tier.whatYouGet.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground font-light">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0 mt-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Page 2: Behind The Scenes */}
              {currentPage === 1 && (
                <div>
                  <h4 className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-[0.2em] mb-4">
                    Behind The Scenes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tier.behindTheScenes.map((item, i) => (
                      <span key={i} className="text-[10px] font-mono text-muted-foreground border border-border-subtle bg-foreground/5 px-3 py-1.5 rounded-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Page 3: Ideal For */}
              {currentPage === 2 && (
                <div>
                  <h4 className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-[0.2em] mb-4">
                    Ideal For
                  </h4>
                  <ul className="space-y-3">
                    {tier.idealFor.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground font-light">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30 flex-shrink-0 mt-2" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="p-5 pt-4 border-t border-border-subtle">
              {/* Nav Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className={`flex-1 py-3 border border-border-subtle rounded-sm flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest transition-all ${
                    currentPage === 0 ? 'opacity-30' : 'hover:border-foreground/30'
                  }`}
                >
                  <ChevronLeft size={14} />
                  Back
                </button>

                {currentPage < totalPages - 1 ? (
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="flex-1 py-3 bg-foreground text-background rounded-sm flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest hover:bg-foreground/90 transition-all"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                ) : (
                  <a href="/contact" className="flex-1">
                    <button className="w-full py-3 bg-foreground text-background rounded-sm text-[10px] font-mono uppercase tracking-widest hover:bg-foreground/90 transition-all">
                      Get Started
                    </button>
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}