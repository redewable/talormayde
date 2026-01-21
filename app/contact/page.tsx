"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Send } from "lucide-react";
import LivingCanvas from "@/components/LivingCanvas";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    vision: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send to Firebase "leads" collection
      await addDoc(collection(db, "leads"), {
        name: formData.name,
        email: formData.email,
        message: formData.vision, // Mapping 'vision' to 'message'
        service: "Commission Inquiry",
        date: new Date().toISOString(),
        status: "new"
      });
      
      // Optional: Trigger email alert here if you set up Resend later
      
      setLoading(false);
      setSent(true);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-white selection:text-black flex items-center justify-center relative overflow-hidden">
      
      {/* Background - Reusing the Living Canvas for brand consistency */}
      <div className="opacity-50">
        <LivingCanvas />
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6 py-20">
        
        {/* Header */}
        <div className="mb-16 text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white mix-blend-overlay">
                THE COMMISSION
            </h1>
            <p className="text-zinc-500 text-sm font-mono tracking-widest uppercase">
                We take on a limited number of visions each year.
            </p>
        </div>

        {sent ? (
            // Success State
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-12 border border-white/10 bg-black/50 backdrop-blur-xl rounded-2xl"
            >
                <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <Send size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-light text-white mb-4">Correspondence Received.</h2>
                <p className="text-zinc-400 leading-relaxed max-w-md mx-auto">
                    We are reviewing your vision. If the fit is right, we will reach out to schedule a discovery session.
                </p>
                <button 
                    onClick={() => setSent(false)}
                    className="mt-8 text-xs font-mono uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
                >
                    Send Another
                </button>
            </motion.div>
        ) : (
            // The Form
            <motion.form 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSubmit}
                className="space-y-12 bg-black/20 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-white/5"
            >
                {/* Name Field */}
                <div className="space-y-2 group">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest group-focus-within:text-white transition-colors">
                        Who are you?
                    </label>
                    <input 
                        type="text" 
                        required
                        className="w-full bg-transparent border-b border-zinc-800 py-4 text-xl md:text-2xl font-light text-white outline-none focus:border-white transition-all placeholder:text-zinc-800"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>

                {/* Email Field */}
                <div className="space-y-2 group">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest group-focus-within:text-white transition-colors">
                        Where can we reach you?
                    </label>
                    <input 
                        type="email" 
                        required
                        className="w-full bg-transparent border-b border-zinc-800 py-4 text-xl md:text-2xl font-light text-white outline-none focus:border-white transition-all placeholder:text-zinc-800"
                        placeholder="email@address.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                </div>

                {/* The Vision Field */}
                <div className="space-y-2 group">
                    <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest group-focus-within:text-white transition-colors">
                        What will we create together?
                    </label>
                    <textarea 
                        required
                        rows={4}
                        className="w-full bg-transparent border-b border-zinc-800 py-4 text-xl md:text-2xl font-light text-white outline-none focus:border-white transition-all placeholder:text-zinc-800 resize-none"
                        placeholder="Tell us about the vision..."
                        value={formData.vision}
                        onChange={(e) => setFormData({...formData, vision: e.target.value})}
                    />
                </div>

                <div className="pt-8 flex justify-end">
                    <button 
                        disabled={loading}
                        className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-sm tracking-widest uppercase overflow-hidden hover:pr-12 transition-all disabled:opacity-50 disabled:hover:pr-8"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {loading ? "Sending..." : "Send Inquiry"} 
                            {!loading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
                        </span>
                        <div className="absolute inset-0 bg-zinc-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>
                </div>

            </motion.form>
        )}

      </div>
    </div>
  );
}