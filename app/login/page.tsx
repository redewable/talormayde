"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, User, AlertCircle } from "lucide-react";
import Link from "next/link";
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "../../lib/firebase"; 
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    // If the browser remembers you, skip the login screen entirely
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) router.push("/admin");
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Tell Firebase to remember this user in the browser storage (Forever)
      await setPersistence(auth, browserLocalPersistence);
      
      // 2. Now sign in
      await signInWithEmailAndPassword(auth, email, password);
      
      // 3. Redirect (The useEffect above handles this too, but this is faster)
      router.push("/admin");
    } catch (err: any) {
      console.error(err);
      setError("Access Denied. Invalid credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-zinc-950 rounded-full border border-white/10 shadow-inner">
            <Lock size={24} className="text-emerald-500" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Client Access</h1>
          <p className="text-zinc-500 text-sm">
            Enter your secure credentials to view project status.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-900/20 text-red-400 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-500 uppercase ml-1">Identity</label>
            <div className="relative group">
              <User className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-white transition-colors" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@company.com"
                className="w-full bg-zinc-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-white/30 transition-colors placeholder:text-zinc-700"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-500 uppercase ml-1">Key</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-white transition-colors" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-white/30 transition-colors placeholder:text-zinc-700"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : "Authenticate"} 
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-zinc-600">
            Secure connection encrypted by Talormayde.
          </p>
        </div>
      </motion.div>

      <Link href="/" className="mt-8 text-zinc-500 text-sm hover:text-white transition-colors flex items-center gap-2">
        ← Return to Grid
      </Link>
    </div>
  );
}