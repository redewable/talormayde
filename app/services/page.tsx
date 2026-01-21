"use client";
import { motion } from "framer-motion";
import { Terminal, Database, Cloud, Code2, ShieldCheck, Zap } from "lucide-react";

const services = [
  {
    title: "The Architecture",
    description: "Built on Next.js 14. Server-side rendering for instant load times and SEO dominance.",
    icon: Code2,
    color: "text-blue-400",
  },
  {
    title: "The Deployment",
    description: "Vercel Edge Network. Your site lives globally, not on a single slow server.",
    icon: Cloud,
    color: "text-white",
  },
  {
    title: "The Backend",
    description: "Google Firebase integration. Real-time databases, secure authentication, and scalable storage.",
    icon: Database,
    color: "text-yellow-400",
  },
  {
    title: "The Security",
    description: "Enterprise-grade protection. Automated backups and strict access control.",
    icon: ShieldCheck,
    color: "text-emerald-400",
  },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-32 px-6">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-20 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-6"
        >
          THE <span className="text-zinc-500">SYSTEM.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-zinc-400 max-w-2xl mx-auto"
        >
          We don't sell templates. We engineer bespoke digital environments using the freshest stack on the internet.
        </motion.p>
      </div>

      {/* The Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
        {services.map((service, index) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group p-8 md:p-12 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-white/20 transition-all hover:bg-zinc-900"
          >
            <div className="mb-6 p-4 bg-zinc-950 rounded-2xl w-fit border border-white/5 group-hover:scale-110 transition-transform duration-300">
              <service.icon size={32} className={service.color} />
            </div>
            
            <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
            <p className="text-zinc-400 leading-relaxed text-lg">
              {service.description}
            </p>
          </motion.div>
        ))}

        {/* The "Command Line" Call to Action */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="md:col-span-2 mt-8 p-8 bg-black rounded-xl border border-zinc-800 font-mono text-sm text-zinc-400"
        >
          <div className="flex gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <p>$ init project --priority=high</p>
          <p className="mt-2 text-white">
            &gt; Ready to build? <a href="mailto:talormayde@gmail.com" className="text-blue-400 hover:underline">Contact Talormayde</a>
            </p>
          <p className="mt-2 text-emerald-500 animate-pulse">_</p>
        </motion.div>

      </div>
    </div>
  );
}