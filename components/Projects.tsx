"use client";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MouseEvent, useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore"; // Import Firestore tools
import { db } from "../lib/firebase"; // Import your engine

// Define what a Project looks like
interface Project {
  id: string;
  title: string;
  category: string;
  url: string;
  tech: string;
  description: string;
  className?: string; // Optional grid sizing
  gradient?: string;  // Optional color
}

function Card({ project }: { project: Project }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function onMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onMouseMove={onMouseMove}
      className={`group relative overflow-hidden rounded-3xl bg-zinc-900/50 border border-white/10 ${project.className || "md:col-span-1 md:row-span-1"}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
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
      
      <Link href={project.url} target="_blank" className="relative flex h-full flex-col justify-between p-8 z-10">
        <div className="flex justify-between items-start">
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full bg-black/50">
            {project.category}
          </span>
          <div className="bg-white text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-45">
            <ArrowUpRight size={16} />
          </div>
        </div>

        <div className="mt-8">
          <h4 className="text-3xl font-bold text-white mb-2 group-hover:translate-x-1 transition-transform duration-300">
            {project.title}
          </h4>
          <p className="text-zinc-500 text-sm font-mono mb-2">
             {project.tech}
          </p>
          <p className="text-zinc-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 line-clamp-2">
             {project.description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH REAL DATA ON LOAD
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const data = querySnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as Project[];
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
        // Loading State (Skeleton Pulse)
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {[1,2,3].map(i => (
             <div key={i} className="rounded-3xl bg-zinc-900/30 border border-white/5 animate-pulse h-[300px]" />
          ))}
        </div>
      ) : (
        // Real Data Grid
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {projects.map((project) => (
            <Card key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}