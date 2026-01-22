"use client";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface MediumItem {
  title: string;
  tagline: string;
  description: string;
  includes: string[];
}

const MEDIUM_DETAILS: Record<string, MediumItem> = {
  "Visual Identity": {
    title: "Visual Identity",
    tagline: "A look that's unmistakably yours.",
    description: "Your brand deserves more than a generic logo. We craft complete visual systems — from marks and wordmarks to color palettes and typography — that feel intentional, refined, and uniquely yours. The kind of identity that makes people stop and take notice.",
    includes: [
      "Logo & brand mark design",
      "Color palette development",
      "Typography selection",
      "Brand guidelines document",
      "Social media assets",
      "Business card & collateral design",
    ],
  },
  "Digital Presence": {
    title: "Digital Presence",
    tagline: "Built to perform, designed to impress.",
    description: "Your website is your flagship — it should work as hard as you do. We build custom sites that load fast, look stunning on every device, and convert visitors into customers. No templates. No shortcuts. Just craftsmanship.",
    includes: [
      "Custom website design & development",
      "Mobile-first responsive layouts",
      "Landing pages that convert",
      "E-commerce solutions",
      "Content management systems",
      "Hosting & maintenance",
    ],
  },
  "Growth": {
    title: "Growth",
    tagline: "Foundations that scale with your ambition.",
    description: "Getting found isn't luck — it's strategy. We build your presence to rank where it matters, track what works, and continuously improve. When someone searches for what you do, you show up.",
    includes: [
      "Search Engine Optimization (SEO)",
      "Local search optimization (GEO)",
      "Google Business Profile setup",
      "Analytics & conversion tracking",
      "Performance monitoring",
      "Monthly growth reporting",
    ],
  },
  "Experience": {
    title: "Experience",
    tagline: "Interactions that feel alive.",
    description: "The best interfaces don't just work — they feel good. We design experiences with subtle motion, intuitive flow, and the kind of polish that makes people want to click around. Every hover, scroll, and transition is considered.",
    includes: [
      "User experience (UX) design",
      "Interface animation & motion",
      "Micro-interactions",
      "Prototype & interaction design",
      "Accessibility optimization",
      "User journey mapping",
    ],
  },
  "Discovery": {
    title: "Discovery",
    tagline: "Found when it matters most.",
    description: "When a customer nearby searches for what you offer, do you appear? We make sure you do. From Google Maps to local directories, we position your business exactly where intent lives — so you're discovered at the moment of decision.",
    includes: [
      "Google Business optimization",
      "Local directory listings",
      "Map pack visibility",
      "Review management strategy",
      "Citation building",
      "Location-based targeting",
    ],
  },
  "Story": {
    title: "Story",
    tagline: "Your narrative, told beautifully.",
    description: "Every brand has a story worth telling — the challenge is telling it well. We help you discover your narrative and share it across every channel: your website, your social presence, your advertising. Consistent, compelling, and unmistakably you.",
    includes: [
      "Brand storytelling & messaging",
      "Content strategy",
      "Social media presence (Facebook, Instagram)",
      "Targeted advertising campaigns",
      "Email marketing setup",
      "Copywriting & brand voice",
    ],
  },
};

export default function MediumModal({ itemTitle, onClose }: { itemTitle: string; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const item = MEDIUM_DETAILS[itemTitle];

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

  if (!mounted || !item) return null;

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
            maxWidth: '550px',
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto',
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          }}
        >
          {/* Close Button */}
          <button 
            onClick={onClose} 
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 50,
              padding: '10px',
              borderRadius: '50%',
              border: '1px solid var(--color-border-subtle)',
              backgroundColor: 'var(--color-background)',
              cursor: 'pointer',
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>

          {/* Content */}
          <div className="p-6 sm:p-8">
            
            {/* Header */}
            <div className="mb-6 pr-8">
              <h2 className="text-2xl sm:text-3xl font-light text-foreground tracking-tight mb-2">
                {item.title}
              </h2>
              <p className="text-emerald-500 text-sm font-light">
                {item.tagline}
              </p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <p className="text-muted-foreground font-light leading-relaxed text-sm sm:text-base">
                {item.description}
              </p>
            </div>

            {/* What's Included */}
            <div className="pt-6 border-t border-border-subtle">
              <h4 className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-[0.2em] mb-4">
                What This Includes
              </h4>
              <ul className="space-y-3">
                {item.includes.map((service, i) => (
                  <li 
                    key={i}
                    className="flex items-center gap-3 text-sm text-muted-foreground font-light"
                  >
                    <span className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
                    {service}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="mt-8 pt-6 border-t border-border-subtle">
              <a href="/contact" className="block">
                <button className="w-full py-3 bg-foreground text-background font-bold uppercase tracking-[0.15em] text-[10px] hover:bg-foreground/90 transition-all">
                  Discuss Your Project
                </button>
              </a>
            </div>

          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}