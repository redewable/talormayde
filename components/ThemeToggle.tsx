"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center justify-center w-10 h-5 group"
      aria-label="Toggle Theme"
    >
      {/* The Track */}
      <div className="absolute w-full h-[1px] bg-zinc-800 group-hover:bg-zinc-500 transition-colors" />
      
      {/* The Slide Dot */}
      <motion.div
        initial={false}
        animate={{ x: isDark ? 10 : -10 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="z-10 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] dark:bg-white light:bg-zinc-950"
      />
    </button>
  );
}