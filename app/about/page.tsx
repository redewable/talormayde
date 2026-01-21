"use client";
import { motion } from "framer-motion";

const milestones = [
  {
    year: "THE FOUNDATION",
    title: "The Cornerstone",
    description: "Built on faith. Inspired by the greatest servant leader. Jesus is the why behind the work.",
  },
  {
    year: "THE STANDARD",
    title: "No Excuses",
    description: "Success is not an accident; it is a habit. We do not negotiate with mediocrity. Excellence is the only option.",
  },
  {
    year: "THE INSPIRATION",
    title: "Think Different",
    description: "Chasing the Steve Jobs level of polish. Clean lines, intuitive design, and an obsession with the details that nobody sees.",
  },
  {
    year: "THE MISSION",
    title: "Talormayde Legacy",
    description: "Building a future for my family. Creating digital assets that don't just function—they dominate.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-32 px-6 pb-20">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto text-center mb-24"
      >
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6 uppercase text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-800">
          The Man <br /> In The Arena.
        </h1>
        <p className="text-xl text-zinc-500 max-w-2xl mx-auto italic">
          "It is not the critic who counts..."
        </p>
      </motion.div>

      {/* The Timeline */}
      <div className="max-w-3xl mx-auto relative">
        
        {/* The Vertical Line */}
        <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-px bg-zinc-800 md:-translate-x-1/2" />

        <div className="space-y-24">
          {milestones.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className={`relative flex flex-col md:flex-row gap-8 md:gap-0 ${
                index % 2 === 0 ? "md:flex-row-reverse" : ""
              }`}
            >
              {/* The Dot */}
              <div className="absolute left-0 md:left-1/2 w-10 h-10 bg-zinc-950 border border-zinc-700 rounded-full z-10 flex items-center justify-center md:-translate-x-1/2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>

              {/* Content Box */}
              <div className={`pl-16 md:pl-0 md:w-1/2 ${
                index % 2 === 0 ? "md:pl-16" : "md:pr-16 md:text-right"
              }`}>
                <span className="text-sm font-mono text-zinc-500 tracking-widest uppercase">
                  {item.year}
                </span>
                <h3 className="text-3xl font-bold mt-2 mb-4">{item.title}</h3>
                <p className="text-zinc-400 leading-relaxed text-lg">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}