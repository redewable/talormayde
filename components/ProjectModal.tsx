"use client";
import { motion } from "framer-motion";
import { X, ExternalLink, Layers, Eye } from "lucide-react"; // Added Eye icon
import Link from "next/link";
import { useEffect, useRef } from "react"; // Added useRef
import { doc, updateDoc, increment } from "firebase/firestore"; // Firebase tools
import { db } from "../lib/firebase"; 

interface Project {
  id: string;
  title: string;
  category: string;
  url: string;
  tech: string;
  description: string;
  imageUrl?: string;
  views?: number; // New field
}

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  // Use a ref to ensure we only count the view ONCE per open
  const hasCounted = useRef(false);

  // Close on Escape Key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // TELEMETRY: Increment View Count
  useEffect(() => {
    if (!hasCounted.current) {
      const recordView = async () => {
        try {
          const projectRef = doc(db, "projects", project.id);
          await updateDoc(projectRef, {
            views: increment(1)
          });
          hasCounted.current = true;
        } catch (error) {
          console.error("Telemetry Error:", error);
        }
      };
      recordView();
    }
  }, [project.id]);

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 md:p-8">
      
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
      />

      {/* Card */}
      <motion.div
        layoutId={`card-${project.id}`}
        className="w-full max-w-5xl bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden relative z-10 shadow-2xl flex flex-col md:flex-row max-h-[85vh]"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 backdrop-blur-md rounded-full text-white/70 hover:text-white hover:bg-black transition-all"
        >
          <X size={20} />
        </button>

        {/* LEFT: Image */}
        <div className="w-full md:w-3/5 h-64 md:h-auto relative bg-zinc-950">
          {project.imageUrl && (
            <img 
              src={project.imageUrl} 
              alt={project.title} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent md:bg-gradient-to-r" />
          
          {/* View Counter Badge (Visual Feedback) */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs font-mono text-white/50 bg-black/50 backdrop-blur px-3 py-1 rounded-full">
            <Eye size={12} /> {(project.views || 0) + 1} Views
          </div>
        </div>

        {/* RIGHT: Content */}
        <div className="w-full md:w-2/5 p-8 md:p-10 flex flex-col bg-zinc-900">
          
          <div className="mb-6">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest border border-emerald-400/20 px-3 py-1 rounded-full bg-emerald-400/10">
              {project.category}
            </span>
          </div>

          <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
            {project.title}
          </h2>

          <div className="space-y-6 flex-grow overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex items-start gap-3 text-zinc-400 border-b border-white/5 pb-4">
               <Layers size={18} className="mt-1 flex-shrink-0 text-zinc-500" />
               <div>
                 <p className="text-xs font-mono uppercase text-zinc-500 mb-1">Tech Stack</p>
                 <p className="text-sm font-light">{project.tech}</p>
               </div>
            </div>
            
            <div className="prose prose-invert prose-sm text-zinc-400 leading-relaxed font-light">
               <p>{project.description}</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <Link 
              href={project.url} 
              target="_blank"
              className="flex items-center justify-center gap-2 w-full bg-white text-black font-bold py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all group"
            >
              VISIT LIVE SYSTEM <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
}