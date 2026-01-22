"use client";
import { X, ExternalLink, Code, Layers, Smartphone, Monitor, Square as SquareIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const getOrientationLabel = () => {
    switch(project.orientation) {
      case "portrait": return { icon: Smartphone, label: "Mobile" };
      case "landscape": return { icon: Monitor, label: "Cinematic" };
      default: return { icon: SquareIcon, label: "Standard" };
    }
  };

  const orientationInfo = getOrientationLabel();
  const OrientationIcon = orientationInfo.icon;
  const techItems = project.tech ? project.tech.split(',').map(t => t.trim()).filter(Boolean) : [];

  if (!mounted) return null;

  const modalContent = (
    <>
      {/* Full screen backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          backgroundColor: 'var(--color-background)',
          opacity: 0.95,
        }}
      />

      {/* Centering wrapper */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          pointerEvents: 'none',
        }}
      >
        {/* Modal */}
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            pointerEvents: 'auto',
            width: '100%',
            maxWidth: '1000px',
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto',
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          }}
        >
          {/* Close Button */}
          <button 
            onClick={onClose} 
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 50,
              padding: '10px',
              borderRadius: '50%',
              border: '1px solid var(--color-border-subtle)',
              backgroundColor: 'var(--color-background)',
              cursor: 'pointer',
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>

          {/* Layout - Stack mobile, side-by-side desktop */}
          <div className="flex flex-col lg:flex-row">
            
            {/* Image */}
            <div className="relative w-full lg:w-[45%] h-40 lg:h-auto lg:min-h-[350px] flex-shrink-0 bg-zinc-900/50">
              {project.imageUrl ? (
                <img 
                  src={project.imageUrl} 
                  className="w-full h-full object-cover" 
                  alt={project.title}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 font-mono text-xs tracking-widest uppercase">
                  No Preview
                </div>
              )}
              
              {/* Badge */}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-background/70 backdrop-blur-md border border-border-subtle rounded-full flex items-center gap-1.5 text-[8px] font-mono text-muted-foreground uppercase tracking-widest">
                <OrientationIcon size={9} />
                {orientationInfo.label}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col p-5 lg:p-6">
              
              {/* Header */}
              <div className="mb-4">
                <span className="text-emerald-500 text-[10px] font-mono uppercase tracking-[0.2em] mb-1 block">
                  {project.category}
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-light text-foreground tracking-tight leading-tight pr-8">
                  {project.title}
                </h2>
              </div>

              {/* Description */}
              {project.description && (
                <div className="mb-4">
                  <h4 className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground/50 uppercase tracking-[0.2em] mb-1.5">
                    <Layers size={10} /> Overview
                  </h4>
                  <p className="text-muted-foreground font-light leading-relaxed text-sm line-clamp-2 lg:line-clamp-3">
                    {project.description}
                  </p>
                </div>
              )}

              {/* Tech Stack */}
              {techItems.length > 0 && (
                <div className="mb-4">
                  <h4 className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground/50 uppercase tracking-[0.2em] mb-1.5">
                    <Code size={10} /> Built With
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {techItems.slice(0, 4).map((t, i) => (
                      <span 
                        key={i} 
                        className="text-[9px] font-mono text-muted-foreground border border-border-subtle bg-foreground/5 px-2 py-0.5 rounded-sm"
                      >
                        {t}
                      </span>
                    ))}
                    {techItems.length > 4 && (
                      <span className="text-[9px] font-mono text-muted-foreground/50 px-1 py-0.5">
                        +{techItems.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="pt-4 border-t border-border-subtle mt-auto">
                {project.url ? (
                  <Link href={project.url} target="_blank" rel="noopener noreferrer" className="block">
                    <button className="w-full py-3 bg-foreground text-background font-bold uppercase tracking-[0.15em] text-[10px] hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 group">
                      View Live Project 
                      <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </Link>
                ) : (
                  <div className="w-full py-3 bg-foreground/5 text-muted-foreground font-mono uppercase tracking-widest text-[10px] text-center border border-border-subtle">
                    Private Case Study
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}