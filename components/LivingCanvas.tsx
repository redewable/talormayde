"use client";

export default function LivingCanvas() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-background transition-colors duration-500">
      
      {/* 1. The Deep Void Base - Changed opacity to be dynamic */}
      <div className="absolute inset-0 bg-background opacity-90 dark:opacity-90 light:opacity-0 transition-opacity" />

      {/* 2. The "Creation" Lights - Only visible in dark mode for atmosphere */}
      <div className="absolute top-[-50%] left-[-20%] w-[120%] h-[120%] bg-gradient-to-br from-indigo-900/20 via-transparent to-transparent blur-[120px] animate-[pulse_8s_ease-in-out_infinite] dark:block hidden" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[100%] bg-gradient-to-tl from-emerald-900/10 via-transparent to-transparent blur-[100px] animate-[pulse_12s_ease-in-out_infinite_reverse] dark:block hidden" />
      
      {/* 3. The "Divine Spark" */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[150px] opacity-40 mix-blend-soft-light dark:block hidden" />
    </div>
  );
}