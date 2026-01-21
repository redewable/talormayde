"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LayoutGrid, LogOut, X, Trash2, Check, Image as ImageIcon, Edit2, List, ArrowUp, ArrowDown } from "lucide-react";
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
  const [projects, setProjects] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list"); // Default to list for easier sorting
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const [newItem, setNewItem] = useState({
    title: "",
    category: "",
    url: "",
    tech: "",
    description: "",
    imageUrl: "",
    order: 99, 
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // 1. AUTH & PERSISTENCE
  useEffect(() => {
    // Ensure session stays alive
    setPersistence(auth, browserLocalPersistence).catch((error) => console.error(error));

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        // Only redirect if explicitly not logged in
        router.push("/login");
      } else {
        setUser(currentUser);
        fetchProjects();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // 2. FETCH & SORT (Fixes "Missing Projects" Bug)
  const fetchProjects = async () => {
    const querySnapshot = await getDocs(collection(db, "projects"));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort in memory: Lower numbers first. Missing numbers go to end.
    data.sort((a: any, b: any) => (a.order || 99) - (b.order || 99));
    
    setProjects(data);
  };

  // 3. QUICK REORDER (The "Drag" alternative)
  const moveProject = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === projects.length - 1)) return;
    
    const newProjects = [...projects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap in local state for instant feedback
    [newProjects[index], newProjects[targetIndex]] = [newProjects[targetIndex], newProjects[index]];
    
    // Update order numbers
    newProjects[index].order = index + 1; // 1-based index
    newProjects[targetIndex].order = targetIndex + 1;
    
    setProjects(newProjects);

    // Save to DB silently
    try {
        await updateDoc(doc(db, "projects", newProjects[index].id), { order: newProjects[index].order });
        await updateDoc(doc(db, "projects", newProjects[targetIndex].id), { order: newProjects[targetIndex].order });
    } catch(err) {
        console.error("Order update failed", err);
    }
  };

  // 4. SAVE
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

  const openEdit = (project: any) => {
    setNewItem(project);
    setCurrentId(project.id);
    setEditMode(true);
    setIsModalOpen(true);
    setImageFile(null);
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Destroy this record?")) return;
    await deleteDoc(doc(db, "projects", id));
    fetchProjects();
  };

  const resetForm = () => {
    setNewItem({ title: "", category: "", url: "", tech: "", description: "", imageUrl: "", order: projects.length + 1 });
    setImageFile(null);
    setEditMode(false);
    setCurrentId("");
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">:: AUTHENTICATING ::</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-zinc-800 pb-6 gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">COMMAND CENTER</h1>
          <p className="text-zinc-500 text-sm font-mono mt-1">LOGGED IN: {user?.email}</p>
        </div>
        <div className="flex gap-4">
          <Link href="/"><button className="p-3 bg-zinc-900 rounded-full text-zinc-400 hover:bg-zinc-800"><LogOut size={20} className="rotate-180" /></button></Link>
          <button onClick={() => { signOut(auth); router.push("/"); }} className="p-3 bg-red-900/20 text-red-500 rounded-full hover:bg-red-900/30"><LogOut size={20} /></button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
         <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-md ${viewMode === "grid" ? "bg-zinc-700 text-white" : "text-zinc-500"}`}><LayoutGrid size={18} /></button>
            <button onClick={() => setViewMode("list")} className={`p-2 rounded-md ${viewMode === "list" ? "bg-zinc-700 text-white" : "text-zinc-500"}`}><List size={18} /></button>
         </div>
         <button onClick={() => { resetForm(); setIsModalOpen(true); }} className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-lg font-bold hover:bg-zinc-200">
            <Plus size={18} /> NEW PROJECT
          </button>
      </div>

      <div className="min-h-[400px]">
        {viewMode === "grid" ? (
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
                    <button onClick={() => openEdit(p)} className="p-2 bg-black/50 backdrop-blur rounded-lg hover:bg-white hover:text-black"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-900/50 backdrop-blur text-red-400 rounded-lg hover:bg-red-600 hover:text-white"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="p-5">
                   <h3 className="font-bold text-lg text-white">{p.title}</h3>
                   <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded">Order: {p.order}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="bg-zinc-900 text-zinc-500 font-mono uppercase text-xs">
                <tr><th className="p-4">Sort</th><th className="p-4">Project</th><th className="p-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {projects.map((p, index) => (
                  <tr key={p.id} className="hover:bg-zinc-900/50">
                    <td className="p-4 flex gap-1">
                        <button onClick={() => moveProject(index, 'up')} className="p-1 hover:text-white hover:bg-zinc-700 rounded"><ArrowUp size={14}/></button>
                        <button onClick={() => moveProject(index, 'down')} className="p-1 hover:text-white hover:bg-zinc-700 rounded"><ArrowDown size={14}/></button>
                    </td>
                    <td className="p-4 font-bold text-white flex items-center gap-3">
                        {p.imageUrl && <img src={p.imageUrl} className="w-8 h-8 rounded object-cover" />}
                        {p.title}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => openEdit(p)} className="text-blue-400 hover:text-blue-300">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-400">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <h3 className="text-xl font-bold">{editMode ? "Edit Project" : "Initialize Project"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Title" className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none" value={newItem.title} onChange={(e) => setNewItem({...newItem, title: e.target.value})} />
                  <input type="number" placeholder="Order" className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none" value={newItem.order} onChange={(e) => setNewItem({...newItem, order: Number(e.target.value)})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input placeholder="Category" className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none" value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} />
                  <input placeholder="URL" className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none" value={newItem.url} onChange={(e) => setNewItem({...newItem, url: e.target.value})} />
                </div>
                <input placeholder="Tech Stack" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none" value={newItem.tech} onChange={(e) => setNewItem({...newItem, tech: e.target.value})} />
                <div className="border-2 border-dashed border-zinc-800 rounded-xl p-6 text-center hover:border-zinc-600 transition-colors cursor-pointer relative">
                    <input type="file" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center gap-2 text-zinc-500"><ImageIcon size={24} /><span className="text-sm">{imageFile ? imageFile.name : "Upload Image"}</span></div>
                </div>
                <textarea placeholder="Description" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white focus:border-white outline-none h-24" value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} />
              </div>
              <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
                <button onClick={handleSave} disabled={status !== "idle"} className={`px-6 py-2 rounded-lg font-bold text-sm transition-all min-w-[140px] ${status === "idle" ? "bg-white text-black" : status === "success" ? "bg-emerald-500" : "bg-zinc-700"}`}>
                  {status === "idle" ? (editMode ? "UPDATE" : "SAVE") : status.toUpperCase()}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}