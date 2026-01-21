"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // To read the URL ID
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase"; // Note the extra ../ because we are deeper
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";

export default function BlogPost() {
  const { id } = useParams(); // Get ID from URL
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      const docRef = doc(db, "posts", id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPost(docSnap.data());
      }
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono">DECRYPTING...</div>;
  if (!post) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-mono">DATA CORRUPTED OR MISSING.</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-32 px-6 pb-20">
      
      <article className="max-w-3xl mx-auto">
        
        {/* Back Button */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-12 transition-colors">
          <ArrowLeft size={16} /> RETURN TO SIGNAL
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex gap-4 text-xs font-mono text-emerald-500 mb-6 uppercase tracking-widest">
            <span>{post.category || "Intel"}</span>
            <span className="text-zinc-600">|</span>
            <span>{new Date(post.date || Date.now()).toLocaleDateString()}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-8">
            {post.title}
          </h1>
          {post.imageUrl && (
            <div className="w-full h-[400px] relative rounded-3xl overflow-hidden border border-white/10">
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="prose prose-invert prose-lg max-w-none text-zinc-300">
            {/* If you save HTML in your admin, you can use dangerouslySetInnerHTML.
               For now, we assume plain text with line breaks.
            */}
            {post.content ? (
                post.content.split('\n').map((line: string, i: number) => (
                    <p key={i} className="mb-4">{line}</p>
                ))
            ) : (
                <p>No content data found.</p>
            )}
        </div>

      </article>

    </div>
  );
}