"use client";

export default function LivingCanvas() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-zinc-950">
      
      {/* 1. The Deep Void Base */}
      <div className="absolute inset-0 bg-black opacity-90" />

      {/* 2. The "Creation" Lights - Slow moving, organic gradients */}
      <div className="absolute top-[-50%] left-[-20%] w-[120%] h-[120%] bg-gradient-to-br from-indigo-900/20 via-transparent to-transparent blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[100%] bg-gradient-to-tl from-emerald-900/10 via-transparent to-transparent blur-[100px] animate-[pulse_12s_ease-in-out_infinite_reverse]" />
      
      {/* 3. The "Divine Spark" - A central, subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[150px] opacity-40 mix-blend-soft-light" />

      {/* 4. Grain Overlay (Texture) - Makes it feel like physical canvas/paper */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay pointer-events-none" />
      
    </div>
  );
}