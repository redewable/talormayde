"use client";

export default function GrainOverlay() {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none mix-blend-overlay">
      <div className="absolute inset-0 w-full h-full opacity-[0.15] dark:opacity-[0.1]">
        <svg className="w-full h-full">
          <filter id="noiseFilter">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.8" 
              numOctaves="3" 
              stitchTiles="stitch" 
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>
    </div>
  );
}