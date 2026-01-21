"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LivingCanvas from "@/components/LivingCanvas";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-white selection:text-black flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="opacity-30 fixed inset-0 pointer-events-none">
        <LivingCanvas />
      </div>

      <div className="relative z-10 space-y-8">
        
        {/* Stylized 404 - Large & Watermarked */}
        <h1 className="text-[120px] md:text-[200px] font-light leading-none tracking-tighter text-white/5 mix-blend-overlay select-none">
          404
        </h1>

        <div className="-mt-12 md:-mt-20 space-y-6">
            <h2 className="text-3xl md:text-4xl font-light text-white">
                The Canvas is Blank.
            </h2>
            
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                The page you are looking for does not exist<br/>
                or has been removed from the collection.
            </p>

            <Link href="/" className="inline-block pt-8">
                <button className="group px-8 py-4 bg-white text-black rounded-full font-bold text-xs tracking-widest uppercase hover:bg-zinc-200 transition-all flex items-center gap-2 mx-auto">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
                    Return to Studio
                </button>
            </Link>
        </div>
      </div>
      
    </div>
  );
}