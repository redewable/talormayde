"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import Link from "next/link";
import { ArrowRight, Calendar, User, Clock } from "lucide-react";

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const querySnapshot = await getDocs(collection(db, "posts"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-32 px-6 pb-20">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-20 text-center">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-emerald-500 font-mono text-xs tracking-[0.3em] uppercase mb-4"
        >
          Intelligence & Insights
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter"
        >
          THE SIGNAL
        </motion.h1>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          // Skeleton Loading State
          [1,2,3].map(i => <div key={i} className="h-96 bg-zinc-900/30 rounded-3xl animate-pulse border border-white/5" />)
        ) : (
          posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={`/blog/${post.id}`} className="group block h-full bg-zinc-900/30 border border-white/10 rounded-3xl overflow-hidden hover:border-emerald-500/50 transition-all hover:bg-zinc-900/50">
                
                {/* Image */}
                <div className="h-48 bg-zinc-950 relative overflow-hidden">
                   {post.imageUrl ? (
                     <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                   ) : (
                     <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-700 font-mono text-xs">NO VISUAL</div>
                   )}
                </div>

                {/* Content */}
                <div className="p-8">
                  <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 mb-4">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.date || Date.now()).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 text-emerald-500"><Clock size={12} /> 5 MIN READ</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 leading-tight group-hover:text-emerald-400 transition-colors">
                    {post.title}
                  </h3>
                  
                  <p className="text-zinc-400 text-sm line-clamp-3 mb-6">
                    {post.excerpt}
                  </p>

                  <span className="inline-flex items-center gap-2 text-sm font-bold text-white group-hover:gap-3 transition-all">
                    READ TRANSMISSION <ArrowRight size={16} className="text-emerald-500" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>

      {!loading && posts.length === 0 && (
        <div className="text-center py-20 text-zinc-500">
          <p>No transmissions intercepted.</p>
          <p className="text-xs font-mono mt-2">Initialize new data in Admin Panel.</p>
        </div>
      )}
    </div>
  );
}