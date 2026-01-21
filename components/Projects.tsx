"use client";
import { motion, useMotionTemplate, useMotionValue, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { MouseEvent, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore"; 
import { db } from "../lib/firebase"; 
import ProjectModal from "./ProjectModal"; // <--- Import the new Modal

interface Project {
  id: string;
  title: string;
  category: string;
  url: string;
  tech: string;
  description: string;
  imageUrl?: string;
  order?: number;
}

function Card({ project, onClick }: { project: Project; onClick: () => void }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function onMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      layoutId={`card-${project.id}`} // Connects this card to the modal animation
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onMouseMove={onMouseMove}
      onClick={onClick} // Open Modal on Click
      className="group relative overflow-hidden rounded-3xl bg-zinc-900/50 border border-white/10 md:col-span-1 md:row-span-1 h-full min-h-[350px] cursor-pointer"
    >
      {/* 1. BACKGROUND IMAGE */}
      {project.imageUrl && (
        <div className="absolute inset-0 z-0">
          <img 
            src={project.imageUrl} 
            alt={project.title} 
            className="w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-all duration-500 scale-100 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
        </div>
      )}

      {/* 2. SPOTLIGHT */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100 z-10"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.1),
              transparent 80%
            )
          `,
        }}
      />
      
      {/* 3. CONTENT */}
      <div className="relative flex h-full flex-col justify-between p-8 z-20">
        <div className="flex justify-between items-start">
          <span className="text-xs font-mono text-zinc-300 uppercase tracking-widest border border-white/20 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md">
            {project.category}
          </span>
          <div className="bg-white text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-45">
            <ArrowUpRight size={16} />
          </div>
        </div>

        <div className="mt-8">
          <h4 className="text-3xl font-bold text-white mb-2 group-hover:translate-x-1 transition-transform duration-300 drop-shadow-lg">
            {project.title}
          </h4>
          <p className="text-zinc-400 text-sm font-mono mb-2 drop-shadow-md">
             {project.tech}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null); // <--- State for Modal

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const data = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as Project[];
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

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto" id="work">
      <div className="mb-16 border-b border-white/10 pb-8">
        <h3 className="text-4xl md:text-6xl font-bold text-white">Selected Works</h3>
        <p className="text-zinc-400 mt-4 max-w-md">
          Digital architecture built for performance and legacy.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[350px]">
          {[1,2,3].map(i => (
             <div key={i} className="rounded-3xl bg-zinc-900/30 border border-white/5 animate-pulse h-[350px]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              project={project} 
              onClick={() => setSelectedProject(project)} // <--- CLICK HANDLER
            />
          ))}
        </div>
      )}

      {/* THE MODAL OVERLAY */}
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