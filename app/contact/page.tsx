"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Mail, MapPin, Loader2, AlertCircle } from "lucide-react";
// --- NEW IMPORTS ---
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 
import { db } from "@/lib/firebase"; 

export default function Contact() {
  // --- CONFIGURATION ---
  const ACCESS_KEY = "d1c6f53e-c839-4013-b75d-6017189fa9ba"; // <--- REMEMBER TO PASTE YOUR KEY BACK IN!

  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries()); // Convert to JSON object for Firebase

    // 1. SAVE TO "BLACK BOX" (FIREBASE)
    try {
      await addDoc(collection(db, "leads"), {
        name: data.name,
        email: data.email,
        service: data.service,
        message: data.message,
        timestamp: serverTimestamp(),
        status: "new" // Mark as unread
      });

      // 2. SEND EMAIL (WEB3FORMS)
      formData.append("access_key", ACCESS_KEY);
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      const result = await response.json();

      if (result.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Transmission Error:", error);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-32 px-6 pb-20 relative overflow-hidden">
      
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 relative z-10">
        
        {/* Left: The Pitch */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-12"
        >
          <div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
              INITIATE <br />
              <span className="text-zinc-500">PROTOCOL.</span>
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed max-w-md">
              Ready to engineer your legacy? Tell us about the mission. 
              We accept a limited number of clients per quarter.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-zinc-300">
              <div className="p-3 bg-zinc-900 rounded-full border border-white/10">
                <Mail size={20} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-mono text-zinc-500 uppercase">Direct Line</p>
                <p className="text-lg font-bold">talormayde@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-zinc-300">
              <div className="p-3 bg-zinc-900 rounded-full border border-white/10">
                <MapPin size={20} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-mono text-zinc-500 uppercase">Base of Operations</p>
                <p className="text-lg font-bold">Global / Remote</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: The Form */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-zinc-900/30 backdrop-blur-sm border border-white/10 p-8 md:p-10 rounded-3xl"
        >
          {status === "success" ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <Check size={40} />
              </div>
              <h3 className="text-3xl font-bold">Transmission Received.</h3>
              <p className="text-zinc-400">Data secured in the Black Box. We will establish contact shortly.</p>
              <button onClick={() => setStatus("idle")} className="text-zinc-500 hover:text-white underline">Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bot Trap */}
              <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-zinc-500 uppercase ml-1">Identity</label>
                  <input name="name" required placeholder="Name / Organization" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 focus:border-white outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-mono text-zinc-500 uppercase ml-1">Contact</label>
                  <input type="email" name="email" required placeholder="email@company.com" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 focus:border-white outline-none transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-zinc-500 uppercase ml-1">Mission Type</label>
                <select name="service" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 focus:border-white outline-none transition-colors text-zinc-400 appearance-none">
                  <option>Protocol: Genesis ($2.5k)</option>
                  <option>Protocol: Ascension ($5k)</option>
                  <option>Protocol: Dominance ($8k+)</option>
                  <option>Other / Custom</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-zinc-500 uppercase ml-1">Intel</label>
                <textarea name="message" required placeholder="Project goals, timeline, and budget..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 h-32 focus:border-white outline-none transition-colors resize-none" />
              </div>

              {status === "error" && (
                 <div className="text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> Connection failed. Please try again.
                 </div>
              )}

              <button disabled={status === "sending"} className="w-full bg-white text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50">
                {status === "sending" ? <><Loader2 size={20} className="animate-spin" /> ENCRYPTING & SENDING...</> : <><ArrowRight size={20} /> SEND TRANSMISSION</>}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}