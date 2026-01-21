"use client";

export default function Grain() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden opacity-[0.03]">
      <svg className="h-full w-full">
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8" // Adjust grain size (0.6 - 0.9)
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </div>
  );
}