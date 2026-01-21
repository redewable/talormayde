"use client";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { auth, db, storage } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "firebase/auth";
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  CreditCard, Clock, FileText, Download, LogOut, ChevronRight, 
  Send, Paperclip, Globe, Loader2 
} from "lucide-react";
import LivingCanvas from "@/components/LivingCanvas";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Chat State
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let unsubDoc: any = null;
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) { 
        router.push("/login"); 
        return; 
      }
      
      setUser(currentUser);

      try {
        const q = query(collection(db, "clients"), where("email", "==", currentUser.email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const clientDoc = querySnapshot.docs[0];
          unsubDoc = onSnapshot(doc(db, "clients", clientDoc.id), (docSnap) => {
              if (docSnap.exists()) {
                  setClientData({ id: docSnap.id, ...docSnap.data() });
              }
          });
        } else {
          setClientData(null);
        }
      } catch (error) {
        console.error("Error loading project:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubDoc) unsubDoc();
    };
  }, [router]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !clientData) return;
    const msg = { sender: "client", text: newMessage, timestamp: new Date().toISOString() };
    const updatedMessages = [...(clientData.messages || []), msg];
    await updateDoc(doc(db, "clients", clientData.id), { messages: updatedMessages });
    setNewMessage("");
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const uploadAsset = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !clientData) return;
    const file = e.target.files[0];
    const assetRef = ref(storage, `clients/${clientData.id}/${file.name}`);
    setUploading(true);
    await uploadBytes(assetRef, file);
    const url = await getDownloadURL(assetRef);
    const newAsset = { name: file.name, url, uploader: "client", date: new Date().toISOString() };
    const updatedAssets = [...(clientData.assets || []), newAsset];
    await updateDoc(doc(db, "clients", clientData.id), { assets: updatedAssets });
    setUploading(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center font-mono text-muted-foreground gap-4">
        <Loader2 size={24} className="animate-spin text-foreground" />
        <span className="text-xs uppercase tracking-widest">Accessing Private Collection...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-white selection:text-black p-6 md:p-12 pb-32 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="opacity-30 fixed inset-0 pointer-events-none">
        <LivingCanvas />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 border-b border-border-subtle pb-8 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-2 h-2 rounded-full ${clientData ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" : "bg-zinc-700"}`} />
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    {clientData ? "Active Commission" : "No Active Projects"}
                </span>
              </div>
              <h1 className="text-3xl font-light tracking-tight text-foreground">PROJECT SPACE</h1>
              <p className="text-muted-foreground text-sm mt-1 font-mono">CLIENT: {user?.email}</p>
            </div>
            <button onClick={() => { signOut(auth); router.push("/"); }} className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 bg-background/20 text-zinc-400 hover:text-foreground hover:bg-white/5 transition-all text-xs font-bold tracking-widest uppercase">
                <LogOut size={14} /> Sign Out
            </button>
          </div>

          {!clientData ? (
            <div className="max-w-2xl mx-auto text-center py-20 bg-background/20 border border-border-subtle rounded-3xl backdrop-blur-sm">
                <h2 className="text-xl font-light text-foreground mb-4">No Active Commissions</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                    We could not locate an active project file for <span className="text-foreground">{user?.email}</span>. 
                    If you believe this is an error, please contact the studio.
                </p>
                <a href="mailto:talormayde@gmail.com" className="inline-block border-b border-zinc-500 pb-1 text-zinc-400 hover:text-foreground hover:border-white transition-all text-xs tracking-widest uppercase">
                    Contact Studio
                </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* COL 1: PROJECT STATUS */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Status Card */}
                    <div className="p-8 md:p-10 rounded-3xl bg-background/40 border border-border-subtle backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-40 bg-white/5 rounded-full blur-[100px] group-hover:bg-white/10 transition-all duration-1000" />
                        
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <h2 className="text-4xl font-light mb-2">{clientData.projectName}</h2>
                                    <p className="text-zinc-400 font-mono text-xs tracking-widest uppercase flex items-center gap-2">
                                        Phase: <span className="text-foreground">{clientData.status}</span>
                                    </p>
                                </div>
                                <div className="text-right hidden md:block">
                                    <p className="text-muted-foreground text-xs font-mono uppercase mb-1">Projected Delivery</p>
                                    <p className="text-foreground text-lg font-light">{clientData.dueDate}</p>
                                </div>
                            </div>

                            {/* Progress Bar (Minimalist) */}
                            <div className="mb-8">
                                <div className="flex justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
                                    <span>Completion</span>
                                    <span>{clientData.progress}%</span>
                                </div>
                                <div className="w-full h-[2px] bg-zinc-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }} 
                                        animate={{ width: `${clientData.progress}%` }} 
                                        transition={{ duration: 1.5, ease: "easeOut" }} 
                                        className="h-full bg-white relative"
                                    >
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_15px_white]" />
                                    </motion.div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 mt-8 pt-8 border-t border-border-subtle">
                                {clientData.previewUrl && (
                                    <a href={clientData.previewUrl} target="_blank" className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-zinc-200 transition-colors">
                                        <Globe size={14} /> View Staging
                                    </a>
                                )}
                                {clientData.paymentUrl && (
                                    <a href={clientData.paymentUrl} target="_blank" className="flex items-center gap-2 bg-zinc-900 text-foreground border border-zinc-800 px-6 py-3 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-zinc-800 transition-colors">
                                        <CreditCard size={14} /> Process Invoice
                                    </a>
                                )}
                                <div className="ml-auto text-muted-foreground text-xs font-mono uppercase flex items-center gap-2">
                                    Next: <span className="text-zinc-300">{clientData.nextMilestone}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat / Correspondence */}
                    <div className="p-8 rounded-3xl bg-background/20 border border-border-subtle backdrop-blur-sm">
                        <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                            <Clock size={14} /> Studio Correspondence
                        </h3>
                        
                        <div className="h-64 overflow-y-auto space-y-6 mb-6 pr-2 custom-scrollbar">
                            {(!clientData.messages || clientData.messages.length === 0) && (
                                <p className="text-zinc-600 italic text-center py-10 font-serif">The channel is open.</p>
                            )}
                            {clientData.messages?.map((msg: any, i: number) => (
                                <div key={i} className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.sender === 'client' ? 'bg-zinc-800 text-foreground' : 'bg-white/5 text-zinc-200 border border-border-subtle'}`}>
                                        <p>{msg.text}</p>
                                        <p className="text-[10px] opacity-40 mt-2 uppercase tracking-widest">
                                            {msg.sender === 'client' ? 'You' : 'Talormayde'} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={scrollRef} />
                        </div>

                        <div className="flex gap-4">
                            <input 
                                className="flex-grow bg-transparent border-b border-zinc-800 py-3 text-foreground outline-none focus:border-white transition-all placeholder:text-zinc-700 font-light" 
                                placeholder="Type a message..." 
                                value={newMessage} 
                                onChange={(e) => setNewMessage(e.target.value)} 
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
                            />
                            <button onClick={sendMessage} className="p-3 text-zinc-400 hover:text-foreground transition-colors">
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* COL 2: DELIVERABLES */}
                <div className="space-y-8">
                    <div className="p-8 rounded-3xl bg-background/20 border border-border-subtle backdrop-blur-sm h-full flex flex-col">
                        <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                            <Download size={14} /> Deliverables
                        </h3>
                        
                        {/* Upload Zone */}
                        <div className="mb-8 border border-dashed border-zinc-800 rounded-2xl p-6 text-center hover:border-zinc-600 transition-all relative group cursor-pointer">
                            <input type="file" onChange={uploadAsset} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                            <div className="flex flex-col items-center gap-2 text-zinc-600 group-hover:text-zinc-400 transition-colors">
                                <Paperclip size={20} />
                                <span className="text-[10px] uppercase tracking-widest font-bold">
                                    {uploading ? "Uploading..." : "Upload File"}
                                </span>
                            </div>
                        </div>

                        {/* File List */}
                        <div className="space-y-3 flex-grow">
                            {clientData.assets?.map((asset: any, i: number) => (
                                <a key={i} href={asset.url} target="_blank" className="block w-full p-4 rounded-xl bg-white/5 border border-border-subtle hover:bg-white/10 hover:border-white/20 transition-all group">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <FileText size={16} className={`${asset.uploader === 'client' ? 'text-muted-foreground' : 'text-foreground'}`} />
                                            <div>
                                                <p className="text-sm text-zinc-300 group-hover:text-foreground truncate max-w-[140px] font-light">{asset.name}</p>
                                                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">{asset.uploader}</p>
                                            </div>
                                        </div>
                                        <Download size={14} className="text-zinc-600 group-hover:text-foreground opacity-0 group-hover:opacity-100 transition-all" />
                                    </div>
                                </a>
                            ))}
                            {(!clientData.assets || clientData.assets.length === 0) && (
                                <p className="text-zinc-700 text-sm text-center italic py-10">No deliverables uploaded.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          )}
      </div>
    </div>
  );
}