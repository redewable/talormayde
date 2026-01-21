"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Maximize2 } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore"; 
import { db } from "../lib/firebase"; 
import ProjectModal from "./ProjectModal"; 

interface Project {
  id: string;
  title: string;
  category: string;
  url: string;
  tech: string;
  description: string;
  imageUrl?: string;
  order?: number;
  orientation?: "square" | "landscape" | "portrait"; // <--- NEW TYPE
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
        data.sort((a, b) => (a.order || 999) - (b.order || 999));
        setProjects(data);
      } catch (error) {
        console.error("Error loading projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Helper to determine span classes
  const getGridClasses = (orientation?: string) => {
    switch(orientation) {
        case "landscape": return "md:col-span-2 md:row-span-1"; // Wide
        case "portrait": return "md:col-span-1 md:row-span-2";  // Tall
        default: return "md:col-span-1 md:row-span-1";          // Square
    }
  };

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto border-t border-white/5" id="work">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-20">
        <div>
          <h2 className="text-4xl md:text-6xl font-light text-white tracking-tight mix-blend-overlay">
            THE COLLECTION
          </h2>
          <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest mt-4">
            Curated Digital Architecture
          </p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-zinc-700 text-[10px] font-mono uppercase tracking-widest">
            Index: 2024 — 2025
          </p>
        </div>
      </div>

      {/* THE COLLAGE GRID */}
      {/* grid-auto-flow-dense is the magic that fills the holes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[350px] md:auto-rows-[400px] grid-flow-dense">
        {loading ? (
          [1,2,3,4,5,6].map(i => (
             <div key={i} className="bg-zinc-900/30 animate-pulse border border-white/5 rounded-none" />
          ))
        ) : (
          projects.map((project, i) => (
            <motion.div
              layoutId={`card-${project.id}`}
              key={project.id}
              onClick={() => setSelectedProject(project)}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`group cursor-pointer relative bg-zinc-900 border border-white/5 overflow-hidden ${getGridClasses(project.orientation)}`}
            >
              {/* Image Container - Absolute Fill */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-black/30 z-10 group-hover:bg-transparent transition-colors duration-500" />
                
                {project.imageUrl ? (
                  <motion.img 
                    layoutId={`image-${project.id}`}
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-700 ease-out" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-800 font-mono text-xs">NO VISUAL</div>
                )}
              </div>

              {/* Hover Content */}
              <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex justify-between items-end">
                        <div>
                            <span className="text-emerald-500 text-[10px] font-mono uppercase tracking-widest mb-2 block">
                                {project.category}
                            </span>
                            <h3 className="text-2xl font-light text-white">
                                {project.title}
                            </h3>
                        </div>
                        <div className="bg-white text-black p-3 rounded-full">
                            <ArrowUpRight size={16} />
                        </div>
                    </div>
                  </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectModal 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)} 
          />
        )}
      </AnimatePresence>

    </section>
  );
}