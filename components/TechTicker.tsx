"use client";
import { motion } from "framer-motion";

// --- LOGO DEFINITIONS (SVGs) ---
const LOGOS = [
  {
    name: "Next.js",
    icon: (
      <svg viewBox="0 0 180 180" fill="none" className="h-10 w-auto" xmlns="http://www.w3.org/2000/svg"><mask id="mask0_1_2" style={{maskType:"alpha"}} maskUnits="userSpaceOnUse" x="0" y="0" width="180" height="180"><circle cx="90" cy="90" r="90" fill="black"/></mask><g mask="url(#mask0_1_2)"><circle cx="90" cy="90" r="90" fill="currentColor"/><path d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z" fill="url(#paint0_linear_1_2)"/><rect x="115" y="54" width="12" height="72" fill="url(#paint1_linear_1_2)"/></g><defs><linearGradient id="paint0_linear_1_2" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse"><stop stopColor="white"/><stop offset="1" stopColor="white" stopOpacity="0"/></linearGradient><linearGradient id="paint1_linear_1_2" x1="121" y1="54" x2="120.799" y2="106.875" gradientUnits="userSpaceOnUse"><stop stopColor="white"/><stop offset="1" stopColor="white" stopOpacity="0"/></linearGradient></defs></svg>
    ),
  },
  {
    name: "React",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="h-12 w-auto" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="2" fill="currentColor"/><g strokeWidth="1.5"><ellipse rx="10" ry="4.5" transform="rotate(0 12 12)" cx="12" cy="12" /><ellipse rx="10" ry="4.5" transform="rotate(60 12 12)" cx="12" cy="12" /><ellipse rx="10" ry="4.5" transform="rotate(120 12 12)" cx="12" cy="12" /></g></svg>
    ),
  },
  {
    name: "Vercel",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-auto" xmlns="http://www.w3.org/2000/svg"><path d="M24 22.525H0l12-21.05 12 21.05z" /></svg>
    ),
  },
  {
    name: "Tailwind",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-auto" xmlns="http://www.w3.org/2000/svg"><path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z"/></svg>
    ),
  },
  {
    name: "Firebase",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-12 w-auto" xmlns="http://www.w3.org/2000/svg"><path d="M3.89 15.672L6.255 2.508a.674.674 0 011.166-.316l2.91 5.485-6.44 7.995zM13.636 6.83l2.87-2.894a.675.675 0 011.15.422l.84 8.798-4.86-6.326z"/><path d="M14.004 14.97l-3.64-6.858a.678.678 0 00-1.194 0l-4.73 8.91 8.89 5.032a1.353 1.353 0 001.357 0l8.914-5.048-9.6-2.036z"/></svg>
    ),
  },
  {
    name: "Figma",
    icon: (
      <svg viewBox="0 0 15 24" fill="currentColor" className="h-10 w-auto" xmlns="http://www.w3.org/2000/svg"><path d="M3.75 24C5.82107 24 7.5 22.3211 7.5 20.25V16.5H3.75C1.67893 16.5 0 18.1789 0 20.25C0 22.3211 1.67893 24 3.75 24Z"/><path d="M15 7.5C15 9.57107 13.3211 11.25 11.25 11.25H7.5V3.75H11.25C13.3211 3.75 15 5.42893 15 7.5Z"/><path d="M3.75 0C1.67893 0 0 1.67893 0 3.75C0 5.82107 1.67893 7.5 3.75 7.5H7.5V0H3.75Z"/><path d="M7.5 11.25V16.5C9.57107 16.5 11.25 14.8211 11.25 12.75C11.25 10.6789 9.57107 9 7.5 9V11.25Z"/><path d="M0 11.25C0 9.17893 1.67893 7.5 3.75 7.5H7.5V15H3.75C1.67893 15 0 13.3211 0 11.25Z"/></svg>
    ),
  },
  {
    name: "TypeScript",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-auto" xmlns="http://www.w3.org/2000/svg"><path d="M1.125 0C0.502 0 0 0.502 0 1.125v21.75C0 23.498 0.502 24 1.125 24h21.75c0.623 0 1.125-0.502 1.125-1.125V1.125C24 0.502 23.498 0 22.875 0H1.125zM11.5 16h-1.5v-6h-3v-2h8v2h-3v6h-0.5zM18.5 16h-4v-2h2c0.552 0 1-0.448 1-1v-1c0-0.552-0.448-1-1-1h-2v-1h3v-2h-3c-0.552 0-1 0.448-1 1v3c0 0.552 0.448 1 1 1h2v1h-3v2h4v-2z" fillRule="evenodd"/></svg>
    ),
  },
  {
    name: "Stripe",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-auto" xmlns="http://www.w3.org/2000/svg"><path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.928 0-1.302.92-2.36 2.67-2.36 1.265 0 2.982.506 3.328 1.264l2.727-2.618C17.47.886 15.424 0 13.352 0 8.01 0 3.86 3.168 3.86 7.818c0 5.178 4.226 6.666 8.356 8.07 2.443.83 2.924 1.63 2.924 2.936 0 1.705-1.574 2.53-3.693 2.53-2.623 0-4.04-1.002-4.57-1.89l-2.98 2.56c1.785 2.22 4.965 2.976 7.55 2.976 5.895 0 10.036-3.084 10.036-7.85 0-5.71-4.78-6.904-7.507-7.95z"/></svg>
    ),
  },
];

export default function TechTicker() {
  return (
    <div className="w-full py-10 border-y border-white/5 bg-black/50 overflow-hidden relative z-10">
      
      {/* The Gradient Fade on sides */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-zinc-950 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-zinc-950 to-transparent z-20 pointer-events-none" />

      <div className="flex whitespace-nowrap">
        <motion.div 
          className="flex gap-24 items-center"
          animate={{ x: "-50%" }}
          transition={{ 
            duration: 30, // Slower for logo visibility
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          {/* Loop list 4 times for smoothness */}
          {[...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS].map((tech, i) => (
            <div key={i} className="flex items-center gap-24 group">
              {/* The Logo: Gray by default, White on hover */}
              <div 
                className="text-zinc-800 transition-all duration-300 group-hover:text-white group-hover:scale-110 filter group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                title={tech.name}
              >
                {tech.icon}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}