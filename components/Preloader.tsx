"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cur = 0;
    const interval = setInterval(() => {
      const increment = Math.floor(Math.random() * 10) + 1;
      cur += increment;

      if (cur >= 100) {
        cur = 100;
        setCount(100);
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 800); 
      } else {
        setCount(cur);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-background text-foreground flex flex-col items-center justify-center cursor-wait"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <div className="relative flex items-center justify-center">
        {/* THE GLOWING MARK */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
          animate={{ 
            opacity: [0, 1, 0.8, 1], 
            scale: 1, 
            filter: "blur(0px)" 
          }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="relative w-24 h-24 md:w-32 md:h-32 mb-12"
        >
          {/* Pulsing Ambient Glow */}
          <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full animate-pulse" />
          
          <img 
            src="/talormayde-logo.png" 
            alt="Talormayde" 
            className="relative z-10 w-full h-full object-contain invert opacity-90" 
          />
        </motion.div>
      </div>

      <motion.div 
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {/* Minimalist Progress Line */}
        <div className="h-[1px] w-32 bg-zinc-900 overflow-hidden rounded-full">
             <motion.div 
                className="h-full bg-white" 
                initial={{ width: 0 }}
                animate={{ width: `${count}%` }}
                transition={{ ease: "linear" }}
             />
        </div>

        <div className="flex flex-col items-center gap-1">
            <p className="text-[9px] font-mono text-muted-foreground tracking-[0.4em] uppercase">
              {count === 100 ? "Studio Ready" : "Initializing Atelier"}
            </p>
            <span className="text-[10px] font-mono text-zinc-700">{count}%</span>
        </div>
      </motion.div>
    </motion.div>
  );
}