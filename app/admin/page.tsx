"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LayoutGrid, LogOut, Save, X, Trash2, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase"; // Your engine
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function Admin() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  // Form State
  const [newItem, setNewItem] = useState({
    title: "",
    category: "",
    url: "",
    tech: "",
    description: "",
    className: "md:col-span-1 md:row-span-1", // Default size
    gradient: "from-blue-500/20 to-slate-900/20", // Default color
  });

  // 1. THE BOUNCER (Security Check)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login"); // Kick them out
      } else {
        setUser(currentUser);
        fetchProjects(); // Load data if allowed
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // 2. FETCH PROJECTS
  const fetchProjects = async () => {
    const querySnapshot = await getDocs(collection(db, "projects"));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProjects(data);
  };

  // 3. ADD PROJECT
    const handleAdd = async () => {
        if (!newItem.title) return; // Silent fail if empty, or add a red border logic later

        setStatus("saving");

        try {
        // Artificial delay for "cinematic" feel (optional, but feels more robust)
        await new Promise(resolve => setTimeout(resolve, 800)); 
        
        await addDoc(collection(db, "projects"), newItem);
        
        setStatus("success");

        // Automatically close after 1.5 seconds of "Success" glory
        setTimeout(() => {
            setIsModalOpen(false);
            fetchProjects();
            setNewItem({ ...newItem, title: "", url: "", description: "" });
            setStatus("idle");
        }, 1500);

        } catch (error) {
        console.error(error);
        setStatus("error");
        // Reset to idle after 3 seconds so you can try again
        setTimeout(() => setStatus("idle"), 3000);
        }
    };

  // 4. DELETE PROJECT
  const handleDelete = async (id: string) => {
    if(!confirm("Destroy this project record?")) return;
    await deleteDoc(doc(db, "projects", id));
    fetchProjects();
  };

  const handleLogout = () => {
    signOut(auth);
    router.push("/");
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Verifying Clearance...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-12 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
          <p className="text-zinc-500 text-sm font-mono mt-1">
            USER: {user?.email?.toUpperCase()} // STATUS: ONLINE
          </p>
        </div>
        
        <div className="flex gap-4">
          <Link href="/">
             <button className="p-3 bg-zinc-900 rounded-full hover:bg-zinc-800 transition-colors text-zinc-400">
               <LayoutGrid size={20} />
             </button>
          </Link>
          <button onClick={handleLogout} className="p-3 bg-red-900/20 text-red-500 rounded-full hover:bg-red-900/30 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Main Actions */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">Database ({projects.length})</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-bold hover:scale-105 transition-transform"
          >
            <Plus size={18} /> New Project
          </button>
        </div>

        {/* Project List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="p-6 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-600 transition-colors group relative">
              <h3 className="font-bold text-lg">{p.title}</h3>
              <p className="text-zinc-500 text-sm mb-4">{p.category}</p>
              <div className="text-xs text-zinc-600 font-mono bg-zinc-900 p-2 rounded truncate">
                {p.tech}
              </div>
              
              <button 
                onClick={() => handleDelete(p.id)}
                className="absolute top-4 right-4 p-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* THE ADD MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-zinc-900 border border-zinc-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Initialize Project</h3>
                <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <input 
                  placeholder="Project Title"
                  className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none"
                  value={newItem.title}
                  onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                />
                <input 
                  placeholder="Category (e.g. Eco-Tech)"
                  className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none"
                  value={newItem.category}
                  onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                />
                <input 
                  placeholder="URL (https://...)"
                  className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none"
                  value={newItem.url}
                  onChange={(e) => setNewItem({...newItem, url: e.target.value})}
                />
                <input 
                  placeholder="Tech Stack (Next.js • Firebase)"
                  className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none"
                  value={newItem.tech}
                  onChange={(e) => setNewItem({...newItem, tech: e.target.value})}
                />
                <textarea 
                  placeholder="Brief Description"
                  className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none h-24"
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                />
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAdd}
                  disabled={status !== "idle"}
                  className={`
                    relative px-6 py-3 rounded-lg font-bold font-mono text-sm tracking-wider transition-all duration-500 w-48 flex items-center justify-center gap-2 overflow-hidden
                    ${status === "idle" ? "bg-white text-black hover:bg-zinc-200" : ""}
                    ${status === "saving" ? "bg-zinc-800 text-zinc-400 cursor-wait" : ""}
                    ${status === "success" ? "bg-emerald-500 text-black scale-105" : ""}
                    ${status === "error" ? "bg-red-900 text-white" : ""}
                  `}
                >
                  {/* IDLE STATE */}
                  {status === "idle" && (
                    <>
                      <Save size={16} /> SAVE TO CLOUD
                    </>
                  )}

                  {/* SAVING STATE (Pulsing Text) */}
                  {status === "saving" && (
                    <span className="animate-pulse">
                      &gt;&gt; UPLOADING...
                    </span>
                  )}

                  {/* SUCCESS STATE */}
                  {status === "success" && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="flex items-center gap-2"
                    >
                      <Check size={18} /> COMPLETE
                    </motion.div>
                  )}

                  {/* ERROR STATE */}
                  {status === "error" && (
                    <span>ERROR_01</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}