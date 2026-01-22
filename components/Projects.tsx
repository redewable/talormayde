"use client";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
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
  orientation?: "square" | "landscape" | "portrait";
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

  const getGridClasses = (orientation?: string) => {
    switch(orientation) {
        case "landscape": return "md:col-span-2 md:row-span-1";
        case "portrait": return "md:col-span-1 md:row-span-2";
        default: return "md:col-span-1 md:row-span-1";
    }
  };

  return (
    <section className="py-32 px-6 max-w-7xl mx-auto border-t border-border-subtle bg-transparent" id="work">
      
      <div className="flex justify-between items-end mb-20">
        <div>
          <h2 className="text-4xl md:text-6xl font-light text-foreground tracking-tight">
            THE COLLECTION
          </h2>
          <p className="text-muted-foreground text-xs font-mono uppercase tracking-widest mt-4">
            Curated Digital Architecture
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[350px] md:auto-rows-[400px] grid-flow-dense">
        {loading ? (
          [1,2,3].map(i => (
             <div key={i} className="bg-foreground/5 animate-pulse rounded-none" />
          ))
        ) : (
          projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedProject(project)}
              className={`group cursor-pointer relative bg-foreground/5 border border-border-subtle overflow-hidden ${getGridClasses(project.orientation)}`}
            >
              <div className="absolute inset-0">
                {/* Overlay that adapts to theme */}
                <div className="absolute inset-0 bg-background/40 z-10 group-hover:bg-transparent transition-colors duration-500" />
                
                {project.imageUrl && (
                  <motion.img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out" 
                  />
                )}
              </div>

              <div className="absolute inset-0 z-20 p-8 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-background via-background/20 to-transparent">
                  <div className="flex justify-between items-end">
                      <div>
                          <span className="text-emerald-500 text-[10px] font-mono uppercase tracking-widest mb-2 block">
                              {project.category}
                          </span>
                          <h3 className="text-2xl font-light text-foreground">
                              {project.title}
                          </h3>
                      </div>
                      <div className="bg-foreground text-background p-3 rounded-full">
                          <ArrowUpRight size={16} />
                      </div>
                  </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <ProjectModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}
    </section>
  );
}