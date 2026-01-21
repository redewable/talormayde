"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LayoutGrid, LogOut, X, Trash2, Check, Image as ImageIcon, Edit2, List, ArrowUp, ArrowDown, Eye, Inbox, Layers } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "../../lib/firebase"; 
import { onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "firebase/auth";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Admin() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // --- TABS STATE ---
  const [tab, setTab] = useState<"projects" | "inbox">("projects");

  // --- DATA STATE ---
  const [projects, setProjects] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);

  // --- UI STATE ---
  const [viewMode, setViewMode] = useState<"grid" | "list">("list"); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  // --- FORM STATE ---
  const [newItem, setNewItem] = useState({
    title: "",
    category: "",
    url: "",
    tech: "",
    description: "",
    imageUrl: "",
    order: 99, 
    views: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // 1. AUTH & INIT
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((error) => console.error(error));

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        fetchProjects();
        fetchLeads(); // <--- NEW: Get Messages
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // 2. FETCH PROJECTS
  const fetchProjects = async () => {
    const querySnapshot = await getDocs(collection(db, "projects"));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sort: Lower 'order' numbers first
    data.sort((a: any, b: any) => (a.order || 99) - (b.order || 99));
    setProjects(data);
  };

  // 3. FETCH LEADS (NEW)
  const fetchLeads = async () => {
    const querySnapshot = await getDocs(collection(db, "leads"));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Ideally sort by timestamp here if available
    setLeads(data);
  };

  // 4. REORDER LOGIC
  const moveProject = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === projects.length - 1)) return;
    
    const newProjects = [...projects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap locally
    [newProjects[index], newProjects[targetIndex]] = [newProjects[targetIndex], newProjects[index]];
    
    // Update order numbers
    newProjects[index].order = index + 1; 
    newProjects[targetIndex].order = targetIndex + 1;
    
    setProjects(newProjects);

    // Save to DB
    try {
        await updateDoc(doc(db, "projects", newProjects[index].id), { order: newProjects[index].order });
        await updateDoc(doc(db, "projects", newProjects[targetIndex].id), { order: newProjects[targetIndex].order });
    } catch(err) {
        console.error("Order update failed", err);
    }
  };

  // 5. SAVE PROJECT
  const handleSave = async () => {
    if (!newItem.title) return;
    setStatus("saving");

    try {
      let finalImageUrl = newItem.imageUrl;
      if (imageFile) {
        const imageRef = ref(storage, `projects/${Date.now()}-${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        finalImageUrl = await getDownloadURL(imageRef);
      }

      const projectData = { ...newItem, imageUrl: finalImageUrl };

      if (editMode && currentId) {
        await updateDoc(doc(db, "projects", currentId), projectData);
      } else {
        await addDoc(collection(db, "projects"), projectData);
      }
      
      setStatus("success");
      setTimeout(() => {
        setIsModalOpen(false);
        fetchProjects();
        resetForm();
        setStatus("idle");
      }, 1000);

    } catch (error) {
      console.error(error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  // 6. DELETE ACTIONS
  const handleDelete = async (id: string) => {
    if(!confirm("Destroy this record?")) return;
    await deleteDoc(doc(db, "projects", id));
    fetchProjects();
  };

  const deleteLead = async (id: string) => {
    if(!confirm("Delete this transmission?")) return;
    await deleteDoc(doc(db, "leads", id));
    fetchLeads();
  };

  // 7. HELPERS
  const openEdit = (project: any) => {
    setNewItem(project);
    setCurrentId(project.id);
    setEditMode(true);
    setIsModalOpen(true);
    setImageFile(null);
  };

  const resetForm = () => {
    setNewItem({ title: "", category: "", url: "", tech: "", description: "", imageUrl: "", order: projects.length + 1, views: 0 });
    setImageFile(null);
    setEditMode(false);
    setCurrentId("");
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">:: VERIFYING CREDENTIALS ::</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 pb-32">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-zinc-800 pb-6 gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            COMMAND CENTER <span className="text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded font-mono">LIVE</span>
          </h1>
          <p className="text-zinc-500 text-sm font-mono mt-1">OPERATOR: {user?.email}</p>
        </div>
        <div className="flex gap-4">
          <Link href="/"><button className="p-3 bg-zinc-900 rounded-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors" title="View Site"><LogOut size={20} className="rotate-180" /></button></Link>
          <button onClick={() => { signOut(auth); router.push("/"); }} className="p-3 bg-red-900/10 text-red-500 rounded-full hover:bg-red-900/20 transition-colors" title="Logout"><LogOut size={20} /></button>
        </div>
      </div>

      {/* NEW: TAB SWITCHER */}
      <div className="flex gap-8 mb-8 border-b border-zinc-800">
        <button onClick={() => setTab("projects")} className={`pb-4 text-sm font-bold tracking-widest uppercase transition-colors border-b-2 ${tab === "projects" ? "border-emerald-500 text-white" : "border-transparent text-zinc-600 hover:text-zinc-400"}`}>
            Projects ({projects.length})
        </button>
        <button onClick={() => setTab("inbox")} className={`pb-4 text-sm font-bold tracking-widest uppercase transition-colors border-b-2 ${tab === "inbox" ? "border-emerald-500 text-white" : "border-transparent text-zinc-600 hover:text-zinc-400"}`}>
            Transmissions ({leads.length})
        </button>
      </div>

      {/* --- TAB 1: PROJECTS (YOUR EXISTING DASHBOARD) --- */}
      {tab === "projects" && (
        <>
            <div className="flex justify-between items-center mb-8">
                <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                    <button onClick={() => setViewMode("grid")} className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-white"}`}><LayoutGrid size={18} /></button>
                    <button onClick={() => setViewMode("list")} className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-white"}`}><List size={18} /></button>
                </div>
                <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-lg font-bold hover:bg-zinc-200 transition-colors shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]">
                    <Plus size={18} /> NEW PROJECT
                </button>
            </div>

            <div className="min-h-[400px]">
                {viewMode === "grid" ? (
                // GRID VIEW
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((p) => (
                    <div key={p.id} className="group relative bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-600 transition-all">
                        <div className="h-48 bg-zinc-950 w-full relative">
                            {p.imageUrl ? (
                                <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-700"><ImageIcon size={32} /></div>
                            )}
                            
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEdit(p)} className="p-2 bg-black/50 backdrop-blur rounded-lg hover:bg-white hover:text-black transition-colors"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-900/50 backdrop-blur text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-colors"><Trash2 size={16} /></button>
                            </div>

                            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur rounded-md flex items-center gap-2 text-xs font-mono text-zinc-300 border border-white/10">
                                <Eye size={12} className="text-emerald-400"/> {p.views || 0}
                            </div>
                        </div>
                        <div className="p-5">
                             <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-white">{p.title}</h3>
                                <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded">#{p.order}</span>
                             </div>
                             <p className="text-sm text-zinc-500 truncate">{p.category}</p>
                        </div>
                    </div>
                    ))}
                </div>
                ) : (
                // LIST VIEW
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="bg-zinc-900 text-zinc-500 font-mono uppercase text-xs">
                        <tr><th className="p-4">Order</th><th className="p-4">Project Entity</th><th className="p-4 hidden md:table-cell">Details</th><th className="p-4 text-right">Controls</th></tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {projects.map((p, index) => (
                        <tr key={p.id} className="hover:bg-zinc-900/50 transition-colors">
                            <td className="p-4 flex gap-1 items-center">
                                <div className="flex flex-col gap-1 mr-3">
                                    <button onClick={() => moveProject(index, 'up')} className="p-1 hover:text-white hover:bg-zinc-700 rounded transition-colors"><ArrowUp size={12}/></button>
                                    <button onClick={() => moveProject(index, 'down')} className="p-1 hover:text-white hover:bg-zinc-700 rounded transition-colors"><ArrowDown size={12}/></button>
                                </div>
                                <span className="font-mono text-zinc-500 text-xs">#{p.order}</span>
                            </td>
                            
                            <td className="p-4">
                                <div className="flex items-center gap-4">
                                    {p.imageUrl ? (
                                        <img src={p.imageUrl} className="w-10 h-10 rounded-lg object-cover border border-zinc-700" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center"><ImageIcon size={16}/></div>
                                    )}
                                    <div>
                                        <p className="font-bold text-white text-base">{p.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-emerald-500 flex items-center gap-1"><Eye size={10}/> {p.views || 0} Views</span>
                                        </div>
                                    </div>
                                </div>
                            </td>

                            <td className="p-4 hidden md:table-cell">
                                <p className="text-zinc-300">{p.category}</p>
                                <p className="text-xs font-mono text-zinc-600 truncate max-w-[200px]">{p.tech}</p>
                            </td>

                            <td className="p-4 text-right space-x-2">
                              <button onClick={() => openEdit(p)} className="text-zinc-400 hover:text-white transition-colors text-xs uppercase font-bold tracking-wider">Edit</button>
                              <button onClick={() => handleDelete(p.id)} className="text-red-900 hover:text-red-500 transition-colors text-xs uppercase font-bold tracking-wider">Delete</button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                )}
            </div>
        </>
      )}

      {/* --- TAB 2: INBOX (NEW FEATURE) --- */}
      {tab === "inbox" && (
        <div className="max-w-4xl mx-auto">
            {leads.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">
                    <Inbox size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No transmissions intercepted yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {leads.map((lead) => (
                        <div key={lead.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">{lead.name}</h3>
                                    <a href={`mailto:${lead.email}`} className="text-emerald-500 hover:underline flex items-center gap-2 mt-1">
                                        {lead.email}
                                    </a>
                                </div>
                                <span className="px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full text-xs font-mono text-zinc-400 uppercase">
                                    {lead.service}
                                </span>
                            </div>
                            <div className="bg-black/50 p-4 rounded-xl text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-light border border-white/5">
                                {lead.message}
                            </div>
                            <div className="mt-4 flex justify-end gap-4">
                                <button onClick={() => deleteLead(lead.id)} className="flex items-center gap-2 text-xs text-red-500 hover:text-red-400 uppercase font-bold tracking-wider">
                                    <Trash2 size={14} /> Delete
                                </button>
                                <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-xs text-white hover:text-emerald-400 uppercase font-bold tracking-wider">
                                    Reply via Terminal
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}

      {/* --- MODAL (PROJECTS) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
              
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <h3 className="text-xl font-bold">{editMode ? "Edit Protocol" : "Initialize Protocol"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-zinc-500 uppercase">Project Title</label>
                    <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none" value={newItem.title} onChange={(e) => setNewItem({...newItem, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-zinc-500 uppercase">Order Priority</label>
                    <input type="number" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none" value={newItem.order} onChange={(e) => setNewItem({...newItem, order: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-zinc-500 uppercase">Category</label>
                    <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none" value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-mono text-zinc-500 uppercase">Destination URL</label>
                    <input className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none" value={newItem.url} onChange={(e) => setNewItem({...newItem, url: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono text-zinc-500 uppercase">Tech Stack</label>
                    <input placeholder="Next.js • Firebase • Tailwind" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none" value={newItem.tech} onChange={(e) => setNewItem({...newItem, tech: e.target.value})} />
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-mono text-zinc-500 uppercase">Cover Visual</label>
                   <div className="border-2 border-dashed border-zinc-800 rounded-xl p-8 text-center hover:border-zinc-600 transition-colors cursor-pointer relative bg-zinc-900/50">
                        <input type="file" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <div className="flex flex-col items-center gap-2 text-zinc-500">
                            <ImageIcon size={24} />
                            <span className="text-sm font-mono">{imageFile ? imageFile.name : "DRAG & DROP OR CLICK"}</span>
                        </div>
                    </div>
                    {newItem.imageUrl && !imageFile && <div className="text-xs text-emerald-500 flex items-center gap-1 mt-1"><Check size={10}/> Image Linked</div>}
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-mono text-zinc-500 uppercase">Briefing</label>
                    <textarea className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none h-32 resize-none" value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} />
                </div>
              </div>

              <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-zinc-500 hover:text-white text-sm font-bold tracking-wide">CANCEL</button>
                <button onClick={handleSave} disabled={status !== "idle"} className={`px-6 py-2 rounded-lg font-bold text-sm tracking-wide transition-all min-w-[140px] flex justify-center items-center ${status === "idle" ? "bg-white text-black hover:bg-zinc-200" : status === "success" ? "bg-emerald-500 text-black" : "bg-zinc-700 text-zinc-400"}`}>
                  {status === "idle" ? (editMode ? "UPDATE SYSTEM" : "SAVE DATA") : status.toUpperCase()}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}