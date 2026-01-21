"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // We use a variable interval to make it look "organic" (like real data loading)
    let cur = 0;
    
    const interval = setInterval(() => {
      // Randomly increment by 1-10 to simulate loading chunks
      const increment = Math.floor(Math.random() * 10) + 1;
      cur += increment;

      if (cur >= 100) {
        cur = 100;
        setCount(100);
        clearInterval(interval);
        
        // Wait 1 full second at 100% so the user sees "100%"
        setTimeout(() => {
          onComplete();
        }, 1000); 
      } else {
        setCount(cur);
      }
    }, 60); // Speed of the tick (lower = faster)

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-zinc-950 text-white flex flex-col items-center justify-center cursor-wait"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
      <div className="relative overflow-hidden text-center">
        {/* The Number */}
        <motion.h1 
          className="text-[12vw] md:text-[10vw] font-bold font-space leading-none tracking-tighter"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {count}%
        </motion.h1>
      </div>

      <motion.div 
        className="mt-4 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="h-[1px] w-24 bg-zinc-800" />
        <p className="text-xs font-mono text-zinc-500 tracking-[0.3em] uppercase">
          {count === 100 ? "System Online" : "Loading Assets"}
        </p>
      </motion.div>
    </motion.div>
  );
}