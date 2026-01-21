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
      {/* BRAND MARK - TOP LEFT */}
      <div className="absolute top-8 left-8 z-50">
        <Link href="/">
            {/* CRITICAL FIX: 
               We removed ALL "invert" or "brightness" classes from Tailwind.
               We rely 100% on the "adaptive-logo" CSS class to handle the flip.
            */}
            <img 
                src="/talormayde.png" 
                alt="talormayde" 
                className="adaptive-logo w-32 h-auto opacity-90 hover:opacity-100 transition-opacity" 
            />
        </Link>
      </div>

      {/* FLOATING DOCK */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-auto px-6">
        <motion.nav
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-1 bg-glass backdrop-blur-xl px-4 py-2 rounded-full border border-border-subtle shadow-2xl"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`relative p-3 rounded-full transition-colors group ${
                  isActive 
                    ? "text-foreground" // Active: Black (Light) / White (Dark)
                    : "text-muted-foreground hover:text-foreground" // Inactive: Gray -> Color
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="nav-pill" 
                    className="absolute inset-0 bg-foreground/10 rounded-full -z-10" 
                  />
                )}
                <Icon size={18} />
              </Link>
            );
          })}

          {/* Vertical Divider */}
          <div className="w-[1px] h-4 bg-border-subtle mx-2" />
          
          {/* Theme Toggle */}
          <ThemeToggle />
        </motion.nav>
      </div>
    </>
  );
}