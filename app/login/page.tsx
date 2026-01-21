"use client";
import { useState } from "react";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, ArrowRight } from "lucide-react";
import LivingCanvas from "@/components/LivingCanvas";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      // 1. FORCE SESSION PERSISTENCE (Remember Me)
      await setPersistence(auth, browserLocalPersistence);

      // 2. AUTHENTICATE
      await signInWithEmailAndPassword(auth, email, password);
      
      // 3. ROUTE BASED ON IDENTITY
      if (email.toLowerCase().includes("talor")) {
          router.push("/admin");
      } else {
          router.push("/dashboard");
      }

    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-white selection:text-black flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="opacity-40">
        <LivingCanvas />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md p-8 md:p-12 bg-background/20 backdrop-blur-xl border border-border-subtle rounded-3xl shadow-2xl"
      >
        <div className="text-center mb-12">
          <div className="w-16 mx-auto mb-6 opacity-80 invert">
            {/* Using your logo instead of a lock icon */}
            <img src="/talormayde-logo.png" alt="Logo" className="w-full h-auto" />
          </div>
          <h1 className="text-2xl font-light tracking-[0.2em] uppercase text-foreground mix-blend-overlay">
            The Atelier
          </h1>
          <p className="text-muted-foreground text-xs font-mono tracking-widest uppercase mt-3">
            Private Client Access
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-8">
          
          <div className="space-y-2 group">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest group-focus-within:text-foreground transition-colors">
                Identity
            </label>
            <input 
              type="email" 
              placeholder="email@address.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-zinc-800 py-3 text-lg font-light text-foreground outline-none focus:border-white transition-all placeholder:text-zinc-800"
            />
          </div>
          
          <div className="space-y-2 group">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-widest group-focus-within:text-foreground transition-colors">
                Key
            </label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-zinc-800 py-3 text-lg font-light text-foreground outline-none focus:border-white transition-all placeholder:text-zinc-800"
            />
          </div>

          {status === "error" && (
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-900/10 border border-red-500/10 rounded-lg flex items-center gap-3 text-red-400 text-xs font-mono uppercase tracking-wide"
            >
                <AlertCircle size={14} />
                <span>Credentials Unrecognized.</span>
            </motion.div>
          )}

          <div className="pt-4">
            <button 
                disabled={status === "loading"}
                className="w-full group relative px-8 py-4 bg-white text-black rounded-full font-bold text-sm tracking-widest uppercase overflow-hidden hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
            >
                {status === "loading" ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <>
                        Enter Studio <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
          </div>
        </form>

        <div className="mt-12 text-center">
            <p className="text-zinc-700 text-[10px] font-mono uppercase tracking-widest">
                Talormayde © 2025
            </p>
        </div>

      </motion.div>
    </div>
  );
}