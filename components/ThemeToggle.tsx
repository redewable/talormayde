"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-10 h-6" />; 

  const isDark = theme === "dark";

  return (
    <div className="flex items-center justify-center h-full">
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative flex items-center w-10 h-6 cursor-pointer group"
        aria-label="Toggle Theme"
      >
        {/* Track Line */}
        <div className="absolute w-full h-[1px] bg-zinc-800 dark:bg-zinc-800 light:bg-zinc-300 group-hover:bg-zinc-500 transition-colors" />
        
        {/* Sliding Dot */}
        <motion.div
          animate={{ x: isDark ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="z-10 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] dark:bg-white light:bg-background"
        />
      </button>
    </div>
  );
}