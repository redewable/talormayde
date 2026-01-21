"use client";
import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      
      {/* Glitch Effect Text */}
      <h1 className="text-[150px] font-bold font-mono leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-zinc-700 to-black select-none opacity-50">
        404
      </h1>

      <div className="relative z-10 -mt-16 space-y-6">
        <div className="flex items-center justify-center gap-2 text-red-500 font-mono text-sm tracking-widest uppercase animate-pulse">
          <AlertTriangle size={16} /> Signal Lost
        </div>

        <h2 className="text-4xl font-bold">Coordinates Not Found.</h2>
        
        <p className="text-zinc-500 max-w-md mx-auto">
          The sector you are trying to access does not exist or has been redacted.
        </p>

        <Link href="/">
          <button className="mt-8 px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-2 mx-auto">
            <ArrowLeft size={18} /> RETURN TO BASE
          </button>
        </Link>
      </div>
      
    </div>
  );
}