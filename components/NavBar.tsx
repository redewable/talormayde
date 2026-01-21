"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Home, Briefcase, Sparkles, User, Fingerprint, Mail } from "lucide-react"; // Added Mail
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Work", path: "/#work", icon: Briefcase },
  { name: "Services", path: "/services", icon: Sparkles },
  { name: "About", path: "/about", icon: Fingerprint },
  { name: "Contact", path: "/contact", icon: Mail }, // <--- Added Contact
  { name: "Client", path: "/login", icon: User },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <>
      {/* --- 1. TOP STATUS BAR (Logo & Pulse) --- */}
      <div className="fixed top-6 left-6 z-50 mix-blend-difference">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter text-white hover:opacity-80 transition-opacity">
          {/* The Pulsing Status Dot */}
          <span className="relative flex h-2.5 w-2.5 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          TALORMAYDE
        </Link>
      </div>

      {/* --- 2. BOTTOM FLOATING DOCK --- */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <motion.nav
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="pointer-events-auto flex gap-2 md:gap-4 bg-black/80 backdrop-blur-xl px-4 py-3 rounded-full border border-white/10 shadow-2xl"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.path}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-full transition-all duration-300 group ${
                  isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white/10 rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                
                {/* Tooltip on Hover (Optional Polish) */}
                <span className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-white text-[10px] uppercase tracking-widest px-2 py-1 rounded border border-white/10 pointer-events-none">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </motion.nav>
      </div>
    </>
  );
}