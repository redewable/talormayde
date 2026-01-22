"use client";
import { motion } from "framer-motion";
import ValuePillars from "@/components/ValuePillars";
import Methodology from "@/components/Methodology";
import Packages from "@/components/Packages";
import FAQ from "@/components/FAQ";
import LivingCanvas from "@/components/LivingCanvas";

export default function Services() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-20 relative overflow-hidden font-sans selection:bg-white selection:text-black">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <LivingCanvas />
      </div>

      <div className="relative z-10">
        {/* Hero Header */}
        <div className="max-w-5xl mx-auto mb-20 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-foreground/20 to-transparent mx-auto mb-8" />

            <h1 className="text-5xl md:text-8xl font-light tracking-tight text-foreground mix-blend-overlay">
              WHAT WE DO
            </h1>
            <p className="text-muted-foreground text-sm md:text-base font-light max-w-2xl mx-auto leading-loose">
              We craft digital experiences that work as hard as you do.<br />
              <span className="text-foreground/80">
                Your story, told beautifully. Your brand, found everywhere.
              </span>
            </p>
          </motion.div>
        </div>

        {/* THE CRAFT - Value Pillars */}
        <div className="border-t border-border-subtle">
          <ValuePillars />
        </div>

        {/* THE FITTING - Methodology */}
        <Methodology />

        {/* ENGAGEMENTS - Packages */}
        <div className="border-t border-border-subtle pt-32">
          <Packages />
        </div>

        {/* FAQ */}
        <div className="border-t border-border-subtle pt-32">
          <FAQ />
        </div>
      </div>
    </div>
  );
}