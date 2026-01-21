"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Home, Briefcase, Sparkles, User, Fingerprint, Mail, BookOpen } from "lucide-react"; 
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle"; 

const navItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Collection", path: "/#work", icon: Briefcase },
  { name: "Capabilities", path: "/services", icon: Sparkles },
  { name: "Journal", path: "/journal", icon: BookOpen },
  { name: "Studio", path: "/about", icon: Fingerprint },
  { name: "Contact", path: "/contact", icon: Mail }, 
  { name: "Access", path: "/login", icon: User },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <>
      {/* --- 1. TOP LEFT: STUDIO MARK --- */}
      <div className="fixed top-8 left-8 z-50">
        <Link href="/" className="group flex items-center gap-3">
            {/* OPTION A: IMAGE LOGO (Preferred) */}
            {/* Ensure you have talormayde-logo.png in your public folder */}
            <img 
              src="/talormayde.png" 
              alt="talormayde" 
              className="w-32 h-auto opacity-90 group-hover:opacity-100 transition-opacity dark:invert" 
            />

            {/* OPTION B: TEXT LOGO (Delete the <img> above if you prefer text only) 
            <span className="text-sm font-mono font-bold tracking-[0.2em] text-white uppercase group-hover:opacity-70 transition-opacity">
                Talormayde
            </span>
            */}
        </Link>
      </div>

      {/* --- 2. BOTTOM FLOATING DOCK --- */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none px-6">
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="pointer-events-auto flex gap-1 md:gap-2 bg-zinc-950/80 backdrop-blur-xl px-4 py-3 rounded-full border border-white/10 shadow-2xl shadow-black/50"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`relative flex flex-col items-center justify-center p-3 md:p-3.5 rounded-full transition-all duration-300 group ${
                  isActive ? "text-white" : "text-zinc-500 hover:text-zinc-200"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white/10 rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                
                {/* Tooltip on Hover */}
                <span className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-zinc-300 text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded-lg border border-white/10 pointer-events-none whitespace-nowrap">
                  {item.name}
                </span>
              </Link>
              
            );
          })}
          {/* Divider and Toggle */}
            <div className="w-[1px] h-4 bg-white/10 mx-2" />
                <ThemeToggle />
        </motion.nav>
      </div>
    </>
  );
}