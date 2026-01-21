"use client";
import { motion } from "framer-motion";
import { X, ExternalLink, Code, Layers, Smartphone, Monitor, Square as SquareIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface Project {
  id: string;
  title: string;
  category: string;
  url: string;
  tech: string;
  description: string;
  imageUrl?: string;
  orientation?: "square" | "landscape" | "portrait";
}

export default function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  
  // Close on Escape Key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Determine aspect ratio for the modal frame
  const getAspectClass = () => {
    switch(project.orientation) {
        case "portrait": return "aspect-[3/4] md:aspect-[2/3] max-h-[70vh]";
        case "landscape": return "aspect-video";
        default: return "aspect-square md:aspect-[4/3]";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
      
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/95 backdrop-blur-xl cursor-pointer"
      />

      {/* Modal Container */}
      <motion.div 
        layoutId={`card-${project.id}`}
        className="relative w-full max-w-7xl max-h-[90vh] bg-zinc-950 border border-white/10 shadow-2xl overflow-y-auto custom-scrollbar"
      >
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 bg-black/50 rounded-full text-white hover:bg-white hover:text-black transition-colors border border-white/10">
            <X size={20} />
        </button>

        <div className="flex flex-col">
            
            {/* 1. THE VISUAL (Adaptive Frame) */}
            <div className={`relative w-full bg-zinc-900 border-b border-white/10 overflow-hidden ${getAspectClass()}`}>
                {project.imageUrl ? (
                     <motion.img 
                        layoutId={`image-${project.id}`}
                        src={project.imageUrl} 
                        className="w-full h-full object-cover md:object-contain bg-zinc-900/50" 
                        alt={project.title}
                     />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 font-mono text-xs tracking-widest uppercase">
                        Missing Visual Data
                    </div>
                )}
                
                {/* Subtle Orientation Label */}
                <div className="absolute bottom-6 left-6 px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center gap-2 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                    {project.orientation === 'portrait' && <><Smartphone size={10}/> Mobile View</>}
                    {project.orientation === 'landscape' && <><Monitor size={10}/> Cinematic</>}
                    {(!project.orientation || project.orientation === 'square') && <><SquareIcon size={10}/> Standard</>}
                </div>
            </div>

            {/* 2. THE INTEL (Details) */}
            <div className="p-8 md:p-16 grid grid-cols-1 md:grid-cols-3 gap-12">
                
                {/* Title & Description */}
                <div className="md:col-span-2 space-y-8">
                    <div>
                        <span className="text-emerald-500 text-[10px] font-mono uppercase tracking-[0.3em] mb-4 block">
                            {project.category}
                        </span>
                        <h2 className="text-4xl md:text-6xl font-light text-white tracking-tight leading-none">
                            {project.title}
                        </h2>
                    </div>
                    
                    <div className="max-w-xl">
                        <h4 className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em] mb-4">
                            <Layers size={12} /> The Concept
                        </h4>
                        <p className="text-zinc-400 font-light leading-relaxed text-lg">
                            {project.description}
                        </p>
                    </div>
                </div>

                {/* Sidebar Details */}
                <div className="space-y-12">
                    <div>
                         <h4 className="flex items-center gap-2 text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em] mb-4">
                            <Code size={12} /> Tech Stack
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {project.tech.split(',').map((t, i) => (
                                <span key={i} className="text-[10px] font-mono text-zinc-300 border border-white/5 bg-white/5 px-3 py-1.5 rounded-sm whitespace-nowrap">
                                    {t.trim()}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5">
                        {project.url ? (
                            <Link href={project.url} target="_blank" className="block">
                                <button className="w-full py-5 bg-white text-black font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group">
                                    Launch Project <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </Link>
                        ) : (
                            <div className="w-full py-5 bg-zinc-900 text-zinc-600 font-mono uppercase tracking-widest text-[10px] text-center border border-white/5 cursor-not-allowed">
                                Private Case Study
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
      </motion.div>
    </div>
  );
}