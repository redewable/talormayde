"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Share2 } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase"; // Adjust path if needed (e.g. ../../lib/firebase)
import LivingCanvas from "@/components/LivingCanvas";

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      try {
        const docRef = doc(db, "posts", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error loading post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono text-xs uppercase tracking-widest">
      Retrieving Entry...
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white space-y-4">
      <h1 className="text-2xl font-light">Entry Not Found</h1>
      <Link href="/journal" className="text-zinc-500 hover:text-white text-xs uppercase tracking-widest border-b border-zinc-700 pb-1">Return to Archive</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-white selection:text-black relative overflow-hidden">
      
      {/* Background Ambience - Dimmed significantly for reading */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <LivingCanvas />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-32 pb-20">
        
        {/* Navigation */}
        <div className="mb-12">
            <Link href="/journal" className="group inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-mono uppercase tracking-widest">
                <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> 
                Back to Journal
            </Link>
        </div>

        {/* Header */}
        <header className="mb-16 space-y-8">
            <div className="flex flex-wrap gap-4 text-xs font-mono text-emerald-500 uppercase tracking-widest">
                <span className="px-3 py-1 border border-emerald-500/20 rounded-full bg-emerald-500/5">
                    {post.category || "Uncategorized"}
                </span>
                <span className="flex items-center gap-2 text-zinc-500">
                    <Calendar size={12} />
                    {new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-light leading-tight text-white">
                {post.title}
            </h1>
        </header>

        {/* Hero Image */}
        {post.imageUrl && (
            <div className="w-full aspect-video bg-zinc-900 mb-16 rounded-sm overflow-hidden border border-white/5">
                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover opacity-90" />
            </div>
        )}

        {/* Content Body */}
        <article className="prose prose-invert prose-lg max-w-none text-zinc-300 font-light leading-relaxed">
            {/* Simple paragraph mapping. 
               If you add a Rich Text Editor later, you'd replace this with a parser.
            */}
            {post.content?.split('\n').map((paragraph: string, i: number) => (
                paragraph.trim() === "" ? <br key={i} /> : <p key={i}>{paragraph}</p>
            ))}
        </article>

        {/* Footer / Share */}
        <div className="mt-20 pt-8 border-t border-white/5 flex justify-between items-center">
            <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest">
                End of Entry
            </p>
            <button className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
                <Share2 size={14} /> Share
            </button>
        </div>

      </div>
    </div>
  );
}