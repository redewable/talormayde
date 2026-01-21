"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, LayoutGrid, LogOut, X, Trash2, Check, Image as ImageIcon, Edit2, List, 
  Inbox, MessageSquare, Paperclip, Send, ExternalLink, Globe, ArrowUp, ArrowDown,
  Briefcase, Users, FileText, Smartphone, Monitor, Square
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "../../lib/firebase"; 
import { onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "firebase/auth";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import LivingCanvas from "@/components/LivingCanvas";

// --- INITIAL STATE ---
const initialFormState = {
  type: "project",
  title: "", category: "", url: "", tech: "", description: "", imageUrl: "", 
  order: 99, views: 0, date: new Date().toISOString(),
  orientation: "square", // <--- NEW FIELD
  // Client Specific
  email: "", status: "", progress: 0, nextMilestone: "", dueDate: "", previewUrl: "", paymentUrl: "",
  messages: [], assets: []
};

export default function Admin() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"projects" | "inbox" | "blog" | "clients">("projects");
  const [projects, setProjects] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list"); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [newItem, setNewItem] = useState<any>(initialFormState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newMessage, setNewMessage] = useState(""); 
  const scrollRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(console.error);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push("/login");
      else if (!currentUser.email?.toLowerCase().includes("talor")) router.push("/dashboard");
      else {
        setUser(currentUser);
        fetchProjects(); fetchLeads(); fetchBlogPosts(); fetchClients();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchProjects = async () => {
    const q = await getDocs(collection(db, "projects"));
    const data = q.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    data.sort((a: any, b: any) => (a.order || 99) - (b.order || 99));
    setProjects(data);
  };
  const fetchLeads = async () => {
    const q = await getDocs(collection(db, "leads"));
    setLeads(q.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };
  const fetchBlogPosts = async () => {
    const q = await getDocs(collection(db, "posts"));
    setBlogPosts(q.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };
  const fetchClients = () => {
    const unsub = onSnapshot(collection(db, "clients"), (snapshot) => {
        const liveClients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClients(liveClients);
        if (selectedClient) {
            const updated = liveClients.find(c => c.id === selectedClient.id);
            if(updated) setSelectedClient(updated);
        }
    });
    return unsub;
  };

  const moveProject = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === projects.length - 1)) return;
    const newProjects = [...projects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newProjects[index], newProjects[targetIndex]] = [newProjects[targetIndex], newProjects[index]];
    newProjects[index].order = index + 1; 
    newProjects[targetIndex].order = targetIndex + 1;
    setProjects(newProjects);
    try {
        await updateDoc(doc(db, "projects", newProjects[index].id), { order: newProjects[index].order });
        await updateDoc(doc(db, "projects", newProjects[targetIndex].id), { order: newProjects[targetIndex].order });
    } catch(err) { console.error("Order update failed", err); }
  };

  const handleSave = async () => {
    if (!newItem.title && newItem.type !== 'client') return;
    if (newItem.type === 'client' && !newItem.email) return;

    setStatus("saving");

    try {
      let finalImageUrl = newItem.imageUrl;
      if (imageFile) {
        const folder = newItem.type === "post" ? "posts" : "projects";
        const imageRef = ref(storage, `${folder}/${Date.now()}-${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        finalImageUrl = await getDownloadURL(imageRef);
      }

      let finalData: any = {};
      let collectionName = "";

      if (newItem.type === "post") {
        collectionName = "posts";
        finalData = { title: newItem.title, category: newItem.category, imageUrl: finalImageUrl, content: newItem.description, date: newItem.date };
      } else if (newItem.type === "client") {
        collectionName = "clients";
        finalData = {
            email: newItem.email, projectName: newItem.title, status: newItem.status,
            progress: Number(newItem.progress), nextMilestone: newItem.nextMilestone,
            dueDate: newItem.dueDate, previewUrl: newItem.previewUrl, paymentUrl: newItem.paymentUrl,
            messages: newItem.messages || [], assets: newItem.assets || []
        };
      } else {
        collectionName = "projects";
        finalData = { 
            title: newItem.title, category: newItem.category, imageUrl: finalImageUrl, 
            url: newItem.url, tech: newItem.tech, description: newItem.description, 
            order: newItem.order, views: newItem.views || 0,
            orientation: newItem.orientation || "square" // <--- SAVING ORIENTATION
        };
      }

      if (editMode && currentId) await updateDoc(doc(db, collectionName, currentId), finalData);
      else await addDoc(collection(db, collectionName), finalData);
      
      setStatus("success");
      setTimeout(() => { setIsModalOpen(false); resetForm(); setStatus("idle"); fetchProjects(); }, 1000);
    } catch (error) { console.error(error); setStatus("error"); setTimeout(() => setStatus("idle"), 3000); }
  };

  const updateClientField = async (field: string, value: any) => {
      if(!selectedClient) return;
      const updated = { ...selectedClient, [field]: value };
      setSelectedClient(updated);
      await updateDoc(doc(db, "clients", selectedClient.id), { [field]: value });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedClient) return;
    const msg = { sender: "admin", text: newMessage, timestamp: new Date().toISOString() };
    const updatedMessages = [...(selectedClient.messages || []), msg];
    setSelectedClient({ ...selectedClient, messages: updatedMessages });
    setNewMessage("");
    await updateDoc(doc(db, "clients", selectedClient.id), { messages: updatedMessages });
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const uploadAsset = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedClient) return;
    const file = e.target.files[0];
    const assetRef = ref(storage, `clients/${selectedClient.id}/${file.name}`);
    setStatus("saving");
    await uploadBytes(assetRef, file);
    const url = await getDownloadURL(assetRef);
    const newAsset = { name: file.name, url, uploader: "admin", date: new Date().toISOString() };
    const updatedAssets = [...(selectedClient.assets || []), newAsset];
    setSelectedClient({ ...selectedClient, assets: updatedAssets });
    await updateDoc(doc(db, "clients", selectedClient.id), { assets: updatedAssets });
    setStatus("idle");
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if(!confirm("Destroy this record?")) return;
    await deleteDoc(doc(db, collectionName, id));
    if(collectionName === "clients") setSelectedClient(null); 
    else { fetchProjects(); fetchLeads(); fetchBlogPosts(); } 
  };

  const openEdit = (item: any, type: string) => {
    let formData = { ...item, type };
    if (type === 'client') formData.title = item.projectName;
    if (type === 'post') formData.description = item.content;
    setNewItem(formData);
    setCurrentId(item.id);
    setEditMode(true);
    setIsModalOpen(true);
    setImageFile(null);
  };

  const resetForm = () => {
    setNewItem(initialFormState);
    setImageFile(null); setEditMode(false); setCurrentId("");
  };

  const openNewModal = (type: string) => {
    resetForm();
    setNewItem({ ...initialFormState, type: type });
    setIsModalOpen(true);
  };

  if (loading) return <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-mono">:: VERIFYING ::</div>;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 pb-32 relative overflow-hidden">
      <div className="opacity-30 fixed inset-0 pointer-events-none"><LivingCanvas /></div>
      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-border-subtle pb-6 gap-6">
            <div>
            <h1 className="text-3xl font-light tracking-tight flex items-center gap-3">STUDIO DIRECTOR <span className="text-[10px] bg-white/10 px-2 py-1 rounded font-mono uppercase tracking-widest text-zinc-400">Online</span></h1>
            <p className="text-muted-foreground text-sm font-mono mt-1 uppercase tracking-widest">Director: {user?.email}</p>
            </div>
            <div className="flex gap-4">
            <Link href="/"><button className="p-3 bg-white/5 rounded-full text-zinc-400 hover:bg-white/10 hover:text-foreground transition-colors"><LogOut size={18} className="rotate-180" /></button></Link>
            <button onClick={() => { signOut(auth); router.push("/"); }} className="p-3 bg-red-900/10 text-red-500 rounded-full hover:bg-red-900/20 transition-colors"><LogOut size={18} /></button>
            </div>
        </div>

        {/* TABS */}
        <div className="flex gap-8 mb-8 border-b border-border-subtle overflow-x-auto">
            {[{id: "projects", label: "Work", icon: Briefcase}, {id: "clients", label: "Clients", icon: Users}, {id: "inbox", label: "Inquiries", icon: Inbox}, {id: "blog", label: "Journal", icon: FileText}].map(t => (
                <button key={t.id} onClick={() => { setTab(t.id as any); setSelectedClient(null); }} className={`pb-4 text-xs font-mono font-bold tracking-widest uppercase border-b-2 whitespace-nowrap flex items-center gap-2 ${tab === t.id ? "border-white text-foreground" : "border-transparent text-zinc-600 hover:text-zinc-400"}`}>
                    <t.icon size={14} /> {t.label}
                </button>
            ))}
        </div>

        {/* --- PROJECTS TAB --- */}
        {tab === "projects" && (
            <>
                <div className="flex justify-between items-center mb-8">
                    <div className="flex bg-white/5 rounded-lg p-1 border border-border-subtle">
                        <button onClick={() => setViewMode("grid")} className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}><LayoutGrid size={16} /></button>
                        <button onClick={() => setViewMode("list")} className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}><List size={16} /></button>
                    </div>
                    <button onClick={() => openNewModal("project")} className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-zinc-200 transition-colors"><Plus size={14} /> Add Work</button>
                </div>
                
                <div className="min-h-[400px]">
                    {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((p) => (
                        <div key={p.id} className="group relative bg-background/20 border border-border-subtle rounded-2xl overflow-hidden hover:border-white/20 transition-all">
                            <div className="h-48 bg-background w-full relative">
                                {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" /> : <div className="w-full h-full flex items-center justify-center text-zinc-800"><ImageIcon size={32} /></div>}
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(p, "project")} className="p-2 bg-background/50 rounded-lg hover:bg-white hover:text-black transition-colors"><Edit2 size={14} /></button>
                                    <button onClick={() => handleDelete("projects", p.id)} className="p-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-600 hover:text-foreground transition-colors"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-foreground">{p.title}</h3>
                                    <span className="text-[10px] font-mono bg-white/5 text-zinc-400 px-2 py-1 rounded">#{p.order}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-muted-foreground uppercase tracking-widest">{p.category}</p>
                                    <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest border border-zinc-800 px-1 rounded">{p.orientation || "square"}</p>
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                    ) : (
                    <div className="bg-background/20 border border-border-subtle rounded-2xl overflow-hidden">
                        <table className="w-full text-left text-sm text-zinc-400">
                        <thead className="bg-white/5 text-muted-foreground font-mono uppercase text-xs"><tr><th className="p-4">Order</th><th className="p-4">Project</th><th className="p-4 hidden md:table-cell">Details</th><th className="p-4 text-right">Actions</th></tr></thead>
                        <tbody className="divide-y divide-white/5">
                            {projects.map((p, index) => (
                            <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-4 flex gap-2 items-center"><div className="flex flex-col gap-1"><button onClick={() => moveProject(index, 'up')} className="hover:text-foreground"><ArrowUp size={12}/></button><button onClick={() => moveProject(index, 'down')} className="hover:text-foreground"><ArrowDown size={12}/></button></div><span className="font-mono text-muted-foreground text-xs ml-2">#{p.order}</span></td>
                                <td className="p-4"><div className="flex items-center gap-4">{p.imageUrl ? <img src={p.imageUrl} className="w-10 h-10 rounded-lg object-cover border border-white/10" /> : <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center"><ImageIcon size={14}/></div>}<p className="font-bold text-foreground text-base">{p.title}</p></div></td>
                                <td className="p-4 hidden md:table-cell"><p className="text-zinc-300 text-xs uppercase tracking-wide">{p.category} <span className="text-zinc-600">• {p.orientation || "Square"}</span></p></td>
                                <td className="p-4 text-right space-x-4"><button onClick={() => openEdit(p, "project")} className="text-muted-foreground hover:text-foreground transition-colors text-xs uppercase tracking-widest font-bold">Edit</button><button onClick={() => handleDelete("projects", p.id)} className="text-muted-foreground hover:text-red-500 transition-colors text-xs uppercase tracking-widest font-bold">Delete</button></td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    )}
                </div>
            </>
        )}

        {/* --- OTHER TABS (Clients, Inbox, Blog) Omitted for brevity, logic remains same as previous --- */}
        {tab === "clients" && (
            <div className="max-w-6xl mx-auto">
                {!selectedClient ? (
                    <>
                        <div className="flex justify-end mb-8"><button onClick={() => openNewModal("client")} className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-zinc-200 transition-colors"><Plus size={14} /> New Client</button></div>
                        <div className="grid gap-4">{clients.map((client) => (<div key={client.id} onClick={() => setSelectedClient(client)} className="bg-background/20 border border-border-subtle p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-white/20 transition-all cursor-pointer"><div className="flex items-center gap-4 w-full md:w-auto"><div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-foreground font-mono text-xs border border-white/10">{client.progress}%</div><div><h3 className="text-xl font-light text-foreground group-hover:text-zinc-300 transition-colors">{client.projectName}</h3><p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">{client.email}</p></div></div><div className="flex-grow w-full md:px-12"><div className="flex justify-between text-[10px] text-muted-foreground mb-2 uppercase tracking-widest font-mono"><span>{client.status}</span><span>Due: {client.dueDate}</span></div><div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-white" style={{ width: `${client.progress}%` }} /></div></div><div className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest group-hover:text-foreground">Open File &rarr;</div></div>))}</div>
                    </>
                ) : (
                    <div className="min-h-[500px]">
                        {/* Detail view logic is same as previous, just rendering checks */}
                        <div className="flex items-center gap-6 mb-8 border-b border-border-subtle pb-8"><button onClick={() => setSelectedClient(null)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><ArrowUp size={18} className="-rotate-90" /></button><div><h2 className="text-3xl font-light">{selectedClient.projectName}</h2><p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">{selectedClient.email}</p></div><div className="ml-auto flex gap-3"><button onClick={() => handleDelete("clients", selectedClient.id)} className="px-4 py-2 border border-red-900/30 text-red-500/50 rounded-lg hover:bg-red-900/10 hover:text-red-500 transition-all font-mono text-[10px] uppercase tracking-widest">Terminate Project</button></div></div>
                        <div className="grid grid-cols-3 gap-6 mb-8"><div className="p-6 bg-background/20 border border-border-subtle rounded-2xl"><label className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest mb-2 block">Status Phase</label><input className="w-full bg-transparent border-b border-zinc-800 focus:border-white outline-none pb-2 text-lg font-light" value={selectedClient.status} onChange={(e) => updateClientField("status", e.target.value)} /></div><div className="p-6 bg-background/20 border border-border-subtle rounded-2xl"><label className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest mb-2 block">Progress ({selectedClient.progress}%)</label><input type="range" min="0" max="100" className="w-full accent-white" value={selectedClient.progress} onChange={(e) => updateClientField("progress", Number(e.target.value))} /></div><div className="p-6 bg-background/20 border border-border-subtle rounded-2xl"><label className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest mb-2 block">Next Milestone</label><input className="w-full bg-transparent border-b border-zinc-800 focus:border-white outline-none pb-2 text-lg font-light" value={selectedClient.nextMilestone} onChange={(e) => updateClientField("nextMilestone", e.target.value)} /></div></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]"><div className="bg-background/20 border border-border-subtle rounded-2xl p-6 flex flex-col h-full"><h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2"><MessageSquare size={14}/> Correspondence Log</h3><div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">{selectedClient.messages?.length === 0 && <p className="text-zinc-700 text-center py-20 italic font-serif">Begin the conversation.</p>}{selectedClient.messages?.map((msg: any, i: number) => (<div key={i} className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}><div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${msg.sender === 'admin' ? 'bg-white/10 text-foreground border border-white/10' : 'bg-background/40 text-zinc-300'}`}>{msg.text}</div><span className="text-[10px] text-zinc-600 mt-2 uppercase tracking-widest">{msg.sender === 'admin' ? 'Director' : 'Client'} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>))}<div ref={scrollRef} /></div><div className="flex gap-2"><input className="flex-grow bg-transparent border-b border-zinc-700 py-3 text-foreground outline-none focus:border-white transition-colors font-light" placeholder="Type message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} /><button onClick={sendMessage} className="p-3 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors"><Send size={18} /></button></div></div><div className="bg-background/20 border border-border-subtle rounded-2xl p-6 flex flex-col h-full overflow-y-auto"><div className="mb-8 space-y-6"><div><h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2"><Globe size={14}/> Staging URL</h3><div className="flex gap-2"><input className="flex-grow bg-transparent border-b border-zinc-800 py-2 text-zinc-300 text-sm font-light outline-none focus:border-white" value={selectedClient.previewUrl || ""} onChange={(e) => updateClientField("previewUrl", e.target.value)} placeholder="https://staging.talormayde.com" />{selectedClient.previewUrl && <a href={selectedClient.previewUrl} target="_blank" className="p-2 bg-white/5 rounded hover:bg-white hover:text-black transition-colors"><ExternalLink size={16} /></a>}</div></div><div><h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2"><Briefcase size={14}/> Invoice URL (Stripe)</h3><input className="w-full bg-transparent border-b border-zinc-800 py-2 text-zinc-300 text-sm font-light outline-none focus:border-white" value={selectedClient.paymentUrl || ""} onChange={(e) => updateClientField("paymentUrl", e.target.value)} placeholder="https://buy.stripe.com/..." /></div></div><h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2"><Paperclip size={14}/> Deliverables</h3><div className="flex-grow space-y-2 mb-4">{selectedClient.assets?.map((asset: any, i: number) => (<div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-border-subtle hover:border-white/20 transition-colors group"><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded flex items-center justify-center ${asset.uploader === 'admin' ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'}`}><Paperclip size={14} /></div><div><p className="text-sm font-bold text-zinc-300 group-hover:text-foreground">{asset.name}</p><p className="text-[10px] text-zinc-600 uppercase tracking-widest">{asset.uploader}</p></div></div><a href={asset.url} target="_blank" className="text-muted-foreground hover:text-foreground transition-colors"><ExternalLink size={14} /></a></div>))}</div><div className="border border-dashed border-zinc-800 rounded-xl p-4 text-center hover:border-white/30 transition-all relative cursor-pointer"><input type="file" onChange={uploadAsset} className="absolute inset-0 opacity-0 cursor-pointer" /><div className="flex flex-col items-center gap-2 text-muted-foreground"><Paperclip size={18} /><span className="text-[10px] uppercase font-bold tracking-widest">{status === 'saving' ? "Uploading..." : "Upload Deliverable"}</span></div></div></div></div>
                    </div>
                )}
            </div>
        )}
        {tab === "inbox" && <div className="max-w-4xl mx-auto space-y-4">{leads.map(l => <div key={l.id} className="bg-background/20 p-6 rounded-xl border border-border-subtle"><h3 className="font-bold text-lg">{l.name}</h3><p className="text-muted-foreground font-mono text-xs uppercase tracking-widest mb-4">{l.email}</p><p className="text-zinc-300 font-light leading-relaxed mb-6">"{l.message}"</p><div className="flex justify-end gap-4"><button onClick={() => handleDelete("leads", l.id)} className="text-red-500/50 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-colors">Archive</button></div></div>)}</div>}
        {tab === "blog" && (
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-end mb-8"><button onClick={() => openNewModal("post")} className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-zinc-200 transition-colors"><Plus size={14} /> New Entry</button></div>
                    <div className="space-y-4">{blogPosts.map(p => <div key={p.id} className="bg-background/20 p-6 rounded-xl border border-border-subtle flex justify-between items-center"><h3 className="font-bold">{p.title}</h3><button onClick={() => handleDelete("posts", p.id)}><Trash2 size={16} className="text-zinc-600 hover:text-red-500 transition-colors"/></button></div>)}</div>
                </div>
        )}  

        {/* --- INBOX / INQUIRIES TAB --- */}
        {tab === "inbox" && (
        <div className="max-w-4xl mx-auto space-y-6">
            {leads.length === 0 && (
            <p className="text-zinc-600 text-center py-20 italic font-serif">No new inquiries.</p>
            )}
            {leads.map((l) => (
            <div key={l.id} className="bg-background/20 p-8 rounded-2xl border border-border-subtle group hover:border-white/10 transition-all">
                <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-2xl font-light text-foreground">{l.name}</h3>
                    <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest mt-1">{l.email}</p>
                </div>
                <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest border border-zinc-800 px-2 py-1 rounded">
                    Incoming Inquiry
                </span>
                </div>

                <p className="text-zinc-300 font-light leading-relaxed mb-8 italic">
                "{l.message}"
                </p>

                <div className="flex justify-end gap-6 pt-6 border-t border-border-subtle">
                {/* THE CONVERT BUTTON */}
                <button 
                    onClick={async () => {
                    if(!confirm(`Promote ${l.name} to Client?`)) return;
                    
                    // 1. Create the Client Record
                    await addDoc(collection(db, "clients"), {
                        email: l.email,
                        projectName: `${l.name} Project`,
                        status: "Initial Consultation",
                        progress: 0,
                        nextMilestone: "Onboarding Call",
                        dueDate: "TBD",
                        messages: [{
                        sender: "admin",
                        text: `Welcome, ${l.name}. This is your private project space. We will begin the work shortly.`,
                        timestamp: new Date().toISOString()
                        }],
                        assets: []
                    });

                    // 2. Remove the Lead
                    await deleteDoc(doc(db, "leads", l.id));
                    
                    // 3. Refresh & Switch Tabs
                    fetchLeads();
                    fetchClients();
                    setTab("clients");
                    }}
                    className="text-emerald-500 hover:text-foreground text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                    <Users size={14} /> Promote to Client
                </button>

                <button 
                    onClick={() => handleDelete("leads", l.id)} 
                    className="text-zinc-600 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                    <Trash2 size={14} /> Archive
                </button>
                </div>
            </div>
            ))}
        </div>
        )}

        {/* --- UNIVERSAL MODAL --- */}
        <AnimatePresence>
            {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-background border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                
                <div className="p-6 border-b border-border-subtle flex justify-between items-center bg-white/5">
                    <h3 className="text-xl font-light">{editMode ? "Edit Record" : "New Entry"}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
                </div>

                <div className="p-8 overflow-y-auto space-y-8">
                    
                    {/* --- CLIENT CREATE FIELDS --- */}
                    {newItem.type === "client" && (
                        <>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2"><label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Client Email</label><input className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-foreground focus:border-white outline-none" value={newItem.email} onChange={(e) => setNewItem({...newItem, email: e.target.value})} /></div>
                                <div className="space-y-2"><label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Project Name</label><input className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-foreground focus:border-white outline-none" value={newItem.title} onChange={(e) => setNewItem({...newItem, title: e.target.value})} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2"><label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Current Status</label><input className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-foreground focus:border-white outline-none" value={newItem.status} onChange={(e) => setNewItem({...newItem, status: e.target.value})} /></div>
                                <div className="space-y-2"><label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Due Date</label><input className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-foreground focus:border-white outline-none" value={newItem.dueDate} onChange={(e) => setNewItem({...newItem, dueDate: e.target.value})} /></div>
                            </div>
                        </>
                    )}

                    {/* --- PROJECT / POST CREATE FIELDS --- */}
                    {newItem.type !== "client" && (
                        <>
                            {/* --- NEW ORIENTATION SELECTOR (Projects Only) --- */}
                            {newItem.type === "project" && (
                                <div className="grid grid-cols-3 gap-4 p-4 bg-zinc-900/50 rounded-xl border border-border-subtle">
                                    <label className={`cursor-pointer border p-4 rounded-lg flex flex-col items-center gap-2 hover:bg-white/5 transition-all ${newItem.orientation === 'square' ? 'border-white bg-white/5' : 'border-zinc-800 text-muted-foreground'}`} onClick={() => setNewItem({...newItem, orientation: 'square'})}>
                                        <Square size={24} />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Square</span>
                                    </label>
                                    <label className={`cursor-pointer border p-4 rounded-lg flex flex-col items-center gap-2 hover:bg-white/5 transition-all ${newItem.orientation === 'landscape' ? 'border-white bg-white/5' : 'border-zinc-800 text-muted-foreground'}`} onClick={() => setNewItem({...newItem, orientation: 'landscape'})}>
                                        <Monitor size={24} />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Landscape</span>
                                    </label>
                                    <label className={`cursor-pointer border p-4 rounded-lg flex flex-col items-center gap-2 hover:bg-white/5 transition-all ${newItem.orientation === 'portrait' ? 'border-white bg-white/5' : 'border-zinc-800 text-muted-foreground'}`} onClick={() => setNewItem({...newItem, orientation: 'portrait'})}>
                                        <Smartphone size={24} />
                                        <span className="text-[10px] uppercase font-bold tracking-widest">Portrait</span>
                                    </label>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2"><label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Title</label><input className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-foreground focus:border-white outline-none" value={newItem.title} onChange={(e) => setNewItem({...newItem, title: e.target.value})} /></div>
                                <div className="space-y-2"><label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Category</label><input className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-foreground focus:border-white outline-none" value={newItem.category} onChange={(e) => setNewItem({...newItem, category: e.target.value})} /></div>
                            </div>

                            {newItem.type === "project" && (
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2"><label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Order Priority</label><input type="number" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-foreground focus:border-white outline-none" value={newItem.order} onChange={(e) => setNewItem({...newItem, order: Number(e.target.value)})} /></div>
                                    <div className="space-y-2"><label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Live URL</label><input className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-foreground focus:border-white outline-none" value={newItem.url} onChange={(e) => setNewItem({...newItem, url: e.target.value})} /></div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Cover Visual</label>
                                <div className="border border-dashed border-zinc-800 rounded-xl p-6 text-center hover:border-zinc-600 relative bg-zinc-900/50">
                                    <input type="file" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground"><ImageIcon size={24} /><span className="text-xs uppercase tracking-widest">Select Image</span></div>
                                </div>
                                {newItem.imageUrl && !imageFile && <div className="text-[10px] text-green-500 flex items-center gap-1 mt-2 tracking-widest uppercase"><Check size={10}/> Image Linked</div>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{newItem.type === "post" ? "Body Content" : "Description"}</label>
                                <textarea className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-foreground focus:border-white outline-none h-32 resize-none" value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} />
                            </div>
                        </>
                    )}

                </div>

                <div className="p-6 border-t border-border-subtle bg-white/5 flex justify-end gap-3">
                    <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-muted-foreground hover:text-foreground text-xs font-bold tracking-widest uppercase">Cancel</button>
                    <button onClick={handleSave} disabled={status !== "idle"} className={`px-8 py-3 rounded-full font-bold text-xs tracking-widest uppercase transition-all min-w-[140px] flex justify-center items-center ${status === "idle" ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-700 text-zinc-400"}`}>
                    {status === "idle" ? (editMode ? "Update" : "Save") : status}
                    </button>
                </div>

                </motion.div>
            </div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
}