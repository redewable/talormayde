"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, LayoutGrid, LogOut, X, Trash2, Check, Image as ImageIcon, Edit2, List, 
  Inbox, MessageSquare, Paperclip, Send, ExternalLink, Globe, ArrowUp, ArrowDown,
  Briefcase, Users, FileText, Smartphone, Monitor, Square, Bell, Search,
  ChevronDown, Activity, DollarSign, Clock, CheckCircle, AlertCircle,
  Calendar, TrendingUp, Zap, Archive, RefreshCw, Mail, Phone, Building,
  Eye, EyeOff, Settings, Copy, Home, Volume2, VolumeX, Wifi, WifiOff,
  Download, Filter, MoreHorizontal, Star, Pin, Keyboard
} from "lucide-react";
import { useRouter } from "next/navigation";
import { auth, db, storage, getFirebaseMessaging, getToken, onMessage, isSupported } from "../../lib/firebase"; 
import { onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "firebase/auth";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot, setDoc, getDoc, query, orderBy, limit } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import LivingCanvas from "@/components/LivingCanvas";

// ============================================================================
// TYPES
// ============================================================================

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

interface Phase {
  id: string;
  label: string;
  order: number;
}

interface ActivityItem {
  type: "message" | "file" | "phase" | "invoice" | "update";
  message: string;
  timestamp: string;
  by?: string;
}

interface NotificationSettings {
  enabled: boolean;
  newLeads: boolean;
  clientMessages: boolean;
  phaseChanges: boolean;
  invoiceUpdates: boolean;
  soundEnabled: boolean;
}

interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  type: string;
  url?: string;
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

const DEFAULT_CATEGORIES = [
  "Brand Identity",
  "Web Design", 
  "Web Development",
  "E-Commerce",
  "SEO / GEO",
  "Full Service",
  "Consultation"
];

const DEFAULT_TAGS = [
  "Next.js", "React", "TypeScript", "TailwindCSS", "Firebase", "Vercel",
  "Framer Motion", "SEO", "GEO", "Google Ads", "Meta Ads", "Branding",
  "Logo Design", "UI/UX", "Responsive", "CMS", "E-Commerce", "Stripe",
  "Analytics", "Performance", "Accessibility", "Custom Build", "Node.js",
  "API Integration", "Database Design", "Authentication", "Hosting"
];

const DEFAULT_PHASES: Phase[] = [
  { id: "discovery", label: "Discovery", order: 1 },
  { id: "proposal", label: "Proposal Sent", order: 2 },
  { id: "contract", label: "Contract & Deposit", order: 3 },
  { id: "strategy", label: "Strategy & Planning", order: 4 },
  { id: "design", label: "Design Phase", order: 5 },
  { id: "development", label: "Development", order: 6 },
  { id: "review", label: "Client Review", order: 7 },
  { id: "revisions", label: "Revisions", order: 8 },
  { id: "launch", label: "Launch Prep", order: 9 },
  { id: "live", label: "Live & Delivered", order: 10 },
  { id: "maintenance", label: "Ongoing Support", order: 11 }
];

const INVOICE_STATUSES = [
  { id: "not_sent", label: "Not Sent", color: "zinc" },
  { id: "pending", label: "Pending", color: "amber" },
  { id: "partial", label: "Partial", color: "blue" },
  { id: "paid", label: "Paid", color: "emerald" },
  { id: "overdue", label: "Overdue", color: "red" }
];

const CLIENT_TIERS = [
  { id: "standard", label: "Standard", color: "zinc" },
  { id: "priority", label: "Priority", color: "blue" },
  { id: "vip", label: "VIP", color: "amber" }
];

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  newLeads: true,
  clientMessages: true,
  phaseChanges: true,
  invoiceUpdates: true,
  soundEnabled: true
};

// Replace with your VAPID key from Firebase Console
const VAPID_KEY = "BK87tMUTvdvsEv3UY8Lx5OJ6_MvH6GhYdbwdcC70sXkEP3dNDEYJRnXfdBzWMBRRSboLijndKFxcnW0-2tMAq_M";

// ============================================================================
// INITIAL FORM STATE
// ============================================================================

const initialFormState = {
  type: "project",
  title: "", 
  category: "", 
  url: "", 
  tech: "", 
  description: "", 
  imageUrl: "", 
  order: 99, 
  views: 0, 
  date: new Date().toISOString(),
  orientation: "square",
  tags: [] as string[],
  hidden: false,
  featured: false,
  // Client Specific
  email: "", 
  phone: "",
  company: "",
  status: "discovery", 
  progress: 0, 
  nextMilestone: "proposal", 
  dueDate: "", 
  previewUrl: "", 
  paymentUrl: "",
  invoiceStatus: "not_sent",
  clientTier: "standard",
  internalNotes: "",
  messages: [] as any[], 
  assets: [] as any[],
  activityLog: [] as ActivityItem[]
};

// ============================================================================
// NOTIFICATION SOUND
// ============================================================================

const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.log("Audio not supported");
  }
};

// ============================================================================
// TOAST COMPONENT
// ============================================================================

function ToastNotification({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const styles = {
    success: { icon: <CheckCircle size={18} />, border: "border-emerald-500/30", text: "text-emerald-500" },
    error: { icon: <AlertCircle size={18} />, border: "border-red-500/30", text: "text-red-500" },
    info: { icon: <Bell size={18} />, border: "border-blue-500/30", text: "text-blue-500" },
    warning: { icon: <AlertCircle size={18} />, border: "border-amber-500/30", text: "text-amber-500" }
  };

  const style = styles[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={`flex items-center gap-3 bg-zinc-900 border ${style.border} px-4 py-3 rounded-xl shadow-2xl backdrop-blur-sm`}
    >
      <span className={style.text}>{style.icon}</span>
      <p className="text-sm text-foreground">{toast.message}</p>
      <button onClick={onDismiss} className="ml-2 text-zinc-500 hover:text-foreground transition-colors">
        <X size={14} />
      </button>
    </motion.div>
  );
}

// ============================================================================
// SMART DROPDOWN COMPONENT
// ============================================================================

interface DropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onAddNew?: (value: string) => void;
  allowAdd?: boolean;
  placeholder?: string;
}

function SmartDropdown({ label, value, options, onChange, onAddNew, allowAdd = true, placeholder = "Select..." }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newValue, setNewValue] = useState("");
  const [showAddNew, setShowAddNew] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowAddNew(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

  const handleAddNew = () => {
    if (newValue.trim() && onAddNew) {
      onAddNew(newValue.trim());
      onChange(newValue.trim());
      setNewValue("");
      setShowAddNew(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-left flex justify-between items-center hover:border-zinc-700 transition-colors"
        >
          <span className={value ? "text-foreground" : "text-zinc-600"}>{value || placeholder}</span>
          <ChevronDown size={16} className={`text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-50 w-full mt-2 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-2 border-b border-zinc-800">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-zinc-800 rounded-lg p-2 text-sm text-foreground outline-none placeholder:text-zinc-600"
                />
              </div>

              <div className="max-h-48 overflow-y-auto">
                {filtered.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => { onChange(opt); setIsOpen(false); setSearch(""); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-800 transition-colors flex items-center justify-between ${value === opt ? "bg-zinc-800 text-white" : "text-zinc-300"}`}
                  >
                    {opt}
                    {value === opt && <Check size={14} className="text-emerald-500" />}
                  </button>
                ))}
                {filtered.length === 0 && <p className="px-4 py-3 text-sm text-zinc-600 italic">No matches</p>}
              </div>

              {allowAdd && (
                <div className="border-t border-zinc-800 p-2">
                  {!showAddNew ? (
                    <button
                      type="button"
                      onClick={() => setShowAddNew(true)}
                      className="w-full text-left px-3 py-2 text-xs text-emerald-500 hover:bg-zinc-800 rounded-lg flex items-center gap-2"
                    >
                      <Plus size={14} /> Add New Option
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="New option..."
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddNew()}
                        className="flex-grow bg-zinc-800 rounded-lg p-2 text-sm text-foreground outline-none"
                        autoFocus
                      />
                      <button type="button" onClick={handleAddNew} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold">
                        Add
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// TAG SELECTOR COMPONENT
// ============================================================================

interface TagSelectorProps {
  label: string;
  selected: string[];
  options: string[];
  onChange: (tags: string[]) => void;
  onAddNew?: (tag: string) => void;
}

function TagSelector({ label, selected, options, onChange, onAddNew }: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [newTag, setNewTag] = useState("");
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTag = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  const filtered = options.filter(opt => opt.toLowerCase().includes(search.toLowerCase()));

  const handleAddNew = () => {
    if (newTag.trim() && onAddNew) {
      onAddNew(newTag.trim());
      onChange([...selected, newTag.trim()]);
      setNewTag("");
    }
  };

  return (
    <div className="space-y-2" ref={selectorRef}>
      <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{label}</label>
      
      <div 
        onClick={() => setIsOpen(true)}
        className="min-h-[48px] bg-zinc-900 border border-zinc-800 rounded-lg p-2 flex flex-wrap gap-2 cursor-pointer hover:border-zinc-700 transition-colors"
      >
        {selected.length === 0 && <span className="text-zinc-600 text-sm p-1">Click to add tags...</span>}
        {selected.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-full border border-zinc-700">
            {tag}
            <button type="button" onClick={(e) => { e.stopPropagation(); toggleTag(tag); }} className="hover:text-red-400">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-2 border-b border-zinc-800">
              <input
                type="text"
                placeholder="Search tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-800 rounded-lg p-2 text-sm text-foreground outline-none placeholder:text-zinc-600"
              />
            </div>

            <div className="max-h-48 overflow-y-auto p-2 flex flex-wrap gap-2">
              {filtered.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    selected.includes(tag) 
                      ? "bg-white text-black border-white" 
                      : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-600"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="border-t border-zinc-800 p-2 flex gap-2">
              <input
                type="text"
                placeholder="Add new tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNew()}
                className="flex-grow bg-zinc-800 rounded-lg p-2 text-sm text-foreground outline-none"
              />
              <button type="button" onClick={handleAddNew} disabled={!newTag.trim()} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold disabled:opacity-50">
                <Plus size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// ACTIVITY LOG COMPONENT
// ============================================================================

function ActivityLog({ activities }: { activities: ActivityItem[] }) {
  if (!activities || activities.length === 0) {
    return <p className="text-zinc-600 text-center py-8 italic font-serif text-sm">No activity yet.</p>;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "message": return <MessageSquare size={12} />;
      case "file": return <Paperclip size={12} />;
      case "phase": return <Activity size={12} />;
      case "invoice": return <DollarSign size={12} />;
      default: return <Clock size={12} />;
    }
  };

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
      {activities.slice().reverse().slice(0, 10).map((activity, i) => (
        <div key={i} className="flex items-start gap-2 text-xs">
          <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 flex-shrink-0 mt-0.5">
            {getIcon(activity.type)}
          </div>
          <div>
            <p className="text-zinc-400">{activity.message}</p>
            <p className="text-[9px] text-zinc-600 mt-0.5">
              {new Date(activity.timestamp).toLocaleDateString()} • {new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

function StatCard({ icon: Icon, label, value, subtext, color = "white", onClick }: { 
  icon: any; label: string; value: string | number; subtext?: string; color?: string; onClick?: () => void;
}) {
  const colors: Record<string, string> = {
    white: "text-foreground",
    emerald: "text-emerald-500",
    amber: "text-amber-500",
    blue: "text-blue-500",
    red: "text-red-500"
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-zinc-900/50 border border-border-subtle rounded-2xl p-5 hover:border-zinc-700 transition-all ${onClick ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400">
          <Icon size={18} />
        </div>
      </div>
      <p className={`text-2xl font-light ${colors[color]}`}>{value}</p>
      <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">{label}</p>
      {subtext && <p className="text-xs text-zinc-600 mt-2">{subtext}</p>}
    </div>
  );
}

// ============================================================================
// KEYBOARD SHORTCUTS COMPONENT
// ============================================================================

function KeyboardShortcutsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const shortcuts = [
    { key: "⌘ + K", action: "Global Search" },
    { key: "⌘ + N", action: "New Item" },
    { key: "⌘ + 1", action: "Go to Overview" },
    { key: "⌘ + 2", action: "Go to Work" },
    { key: "⌘ + 3", action: "Go to Clients" },
    { key: "⌘ + 4", action: "Go to Inquiries" },
    { key: "⌘ + 5", action: "Go to Journal" },
    { key: "Esc", action: "Close Modal / Panel" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-950 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-light flex items-center gap-2">
            <Keyboard size={18} /> Keyboard Shortcuts
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-foreground">
            <X size={18} />
          </button>
        </div>
        
        <div className="space-y-3">
          {shortcuts.map(({ key, action }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
              <span className="text-sm text-zinc-400">{action}</span>
              <kbd className="px-2 py-1 bg-zinc-800 rounded text-xs font-mono text-zinc-300">{key}</kbd>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// GLOBAL SEARCH COMPONENT
// ============================================================================

function GlobalSearch({ 
  isOpen, 
  onClose, 
  projects, 
  clients, 
  leads, 
  blogPosts,
  onSelectProject,
  onSelectClient,
  onSelectLead,
  onSelectPost,
  setTab
}: { 
  isOpen: boolean; 
  onClose: () => void;
  projects: any[];
  clients: any[];
  leads: any[];
  blogPosts: any[];
  onSelectProject: (p: any) => void;
  onSelectClient: (c: any) => void;
  onSelectLead: () => void;
  onSelectPost: (p: any) => void;
  setTab: (t: any) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredProjects = projects.filter(p => 
    p.title?.toLowerCase().includes(query.toLowerCase()) ||
    p.category?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredClients = clients.filter(c => 
    c.projectName?.toLowerCase().includes(query.toLowerCase()) ||
    c.email?.toLowerCase().includes(query.toLowerCase()) ||
    c.company?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredLeads = leads.filter(l =>
    l.name?.toLowerCase().includes(query.toLowerCase()) ||
    l.email?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const filteredPosts = blogPosts.filter(p =>
    p.title?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  const hasResults = filteredProjects.length > 0 || filteredClients.length > 0 || filteredLeads.length > 0 || filteredPosts.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: -20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-950 border border-zinc-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 p-4 border-b border-zinc-800">
          <Search size={18} className="text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search projects, clients, inquiries..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-grow bg-transparent text-foreground outline-none text-lg font-light"
          />
          <kbd className="px-2 py-1 bg-zinc-800 rounded text-[10px] font-mono text-zinc-500">ESC</kbd>
        </div>

        {query && (
          <div className="max-h-[50vh] overflow-y-auto">
            {!hasResults && (
              <p className="text-center text-zinc-600 py-8 italic">No results found</p>
            )}

            {filteredProjects.length > 0 && (
              <div className="p-2">
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest px-3 py-2">Projects</p>
                {filteredProjects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { onSelectProject(p); onClose(); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-3"
                  >
                    <Briefcase size={14} className="text-zinc-500" />
                    <span className="text-sm text-foreground">{p.title}</span>
                    <span className="text-[10px] text-zinc-600 ml-auto">{p.category}</span>
                  </button>
                ))}
              </div>
            )}

            {filteredClients.length > 0 && (
              <div className="p-2 border-t border-zinc-800/50">
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest px-3 py-2">Clients</p>
                {filteredClients.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { onSelectClient(c); onClose(); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-3"
                  >
                    <Users size={14} className="text-zinc-500" />
                    <span className="text-sm text-foreground">{c.projectName}</span>
                    <span className="text-[10px] text-zinc-600 ml-auto">{c.email}</span>
                  </button>
                ))}
              </div>
            )}

            {filteredLeads.length > 0 && (
              <div className="p-2 border-t border-zinc-800/50">
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest px-3 py-2">Inquiries</p>
                {filteredLeads.map(l => (
                  <button
                    key={l.id}
                    onClick={() => { setTab("inbox"); onClose(); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-3"
                  >
                    <Mail size={14} className="text-zinc-500" />
                    <span className="text-sm text-foreground">{l.name}</span>
                    <span className="text-[10px] text-zinc-600 ml-auto">{l.email}</span>
                  </button>
                ))}
              </div>
            )}

            {filteredPosts.length > 0 && (
              <div className="p-2 border-t border-zinc-800/50">
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest px-3 py-2">Journal</p>
                {filteredPosts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { onSelectPost(p); onClose(); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-3"
                  >
                    <FileText size={14} className="text-zinc-500" />
                    <span className="text-sm text-foreground">{p.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!query && (
          <div className="p-6 text-center">
            <p className="text-sm text-zinc-600">Start typing to search...</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ============================================================================
// MAIN ADMIN COMPONENT
// ============================================================================

export default function Admin() {
  const router = useRouter();
  
  // Core State
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "projects" | "inbox" | "blog" | "clients">("overview");
  const [projects, setProjects] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  
  // UI State
  const [viewMode, setViewMode] = useState<"grid" | "list">("list"); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [newItem, setNewItem] = useState<any>(initialFormState);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newMessage, setNewMessage] = useState(""); 
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  
  // Global Search & Shortcuts
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  
  // Notification State
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistoryItem[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  
  // Configurable options
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [tags, setTags] = useState<string[]>(DEFAULT_TAGS);
  const [phases, setPhases] = useState<Phase[]>(DEFAULT_PHASES);
  
  // Refs
  const scrollRef = useRef<HTMLDivElement>(null); 

  // ============================================================================
  // TOAST SYSTEM
  // ============================================================================

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // ============================================================================
  // ONLINE/OFFLINE STATUS
  // ============================================================================

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); addToast("success", "Back online"); };
    const handleOffline = () => { setIsOnline(false); addToast("warning", "You're offline"); };
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [addToast]);

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for meta/ctrl key
      const isMod = e.metaKey || e.ctrlKey;
      
      if (isMod && e.key === "k") {
        e.preventDefault();
        setShowGlobalSearch(true);
      }
      
      if (isMod && e.key === "n") {
        e.preventDefault();
        if (tab === "projects") openNewModal("project");
        else if (tab === "clients") openNewModal("client");
        else if (tab === "blog") openNewModal("post");
      }
      
      if (isMod && e.key === "1") { e.preventDefault(); setTab("overview"); }
      if (isMod && e.key === "2") { e.preventDefault(); setTab("projects"); }
      if (isMod && e.key === "3") { e.preventDefault(); setTab("clients"); }
      if (isMod && e.key === "4") { e.preventDefault(); setTab("inbox"); }
      if (isMod && e.key === "5") { e.preventDefault(); setTab("blog"); }
      
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
      
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setShowNotificationPanel(false);
        setShowGlobalSearch(false);
        setShowKeyboardShortcuts(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tab]);

  // ============================================================================
  // AUTH & DATA FETCHING
  // ============================================================================

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(console.error);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) router.push("/login");
      else if (!currentUser.email?.toLowerCase().includes("talor")) router.push("/dashboard");
      else {
        setUser(currentUser);
        fetchProjects(); 
        fetchLeads(); 
        fetchBlogPosts(); 
        fetchClients();
        loadSettings();
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // ============================================================================
  // PUSH NOTIFICATIONS SETUP
  // ============================================================================

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const setupNotifications = async () => {
      try {
        const supported = await isSupported();
        if (!supported) {
          console.log("Push notifications not supported");
          return;
        }

        // Load saved settings
        const settingsDoc = await getDoc(doc(db, "settings", `notifications_${user.uid}`));
        if (settingsDoc.exists()) {
          setNotificationSettings(settingsDoc.data() as NotificationSettings);
        }

        // Load notification history
        const historyDoc = await getDoc(doc(db, "notificationHistory", user.uid));
        if (historyDoc.exists()) {
          const history = historyDoc.data().items || [];
          setNotificationHistory(history);
          setUnreadNotifications(history.filter((n: NotificationHistoryItem) => !n.read).length);
        }

        // Set up foreground message handler
        const messaging = await getFirebaseMessaging();
        if (messaging) {
          onMessage(messaging, (payload) => {
            console.log("Foreground message:", payload);
            
            const title = payload.notification?.title || "Notification";
            const body = payload.notification?.body || "";
            
            // Add to history
            const newNotification: NotificationHistoryItem = {
              id: Date.now().toString(),
              title,
              body,
              timestamp: new Date().toISOString(),
              read: false,
              type: payload.data?.type || "general",
              url: payload.data?.url
            };
            
            setNotificationHistory(prev => [newNotification, ...prev].slice(0, 50));
            setUnreadNotifications(prev => prev + 1);
            
            // Play sound if enabled
            if (notificationSettings.soundEnabled) {
              playNotificationSound();
            }
            
            // Show toast
            addToast("info", `${title}: ${body}`);

            // Show native notification if permitted
            if (Notification.permission === "granted") {
              new Notification(title, {
                body,
                icon: "/icon-192.png",
                tag: payload.data?.tag || "foreground"
              });
            }
          });
        }
      } catch (err) {
        console.error("Notification setup error:", err);
      }
    };

    setupNotifications();
  }, [user, addToast, notificationSettings.soundEnabled]);

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        const messaging = await getFirebaseMessaging();
        if (messaging) {
          // Register service worker
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          
          // Get FCM token
          const token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration
          });

          if (token) {
            setFcmToken(token);
            // Save token to Firestore
            await setDoc(doc(db, "fcmTokens", user.uid), {
              token,
              email: user.email,
              updatedAt: new Date().toISOString(),
              platform: navigator.platform,
              userAgent: navigator.userAgent
            });
            
            // Update settings
            const newSettings = { ...notificationSettings, enabled: true };
            setNotificationSettings(newSettings);
            await saveNotificationSettings(newSettings);
            
            addToast("success", "Push notifications enabled!");
          }
        }
      } else {
        addToast("warning", "Notification permission denied");
      }
    } catch (err) {
      console.error("Permission request error:", err);
      addToast("error", "Failed to enable notifications");
    }
  };

  const saveNotificationSettings = async (settings: NotificationSettings) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "settings", `notifications_${user.uid}`), settings);
    } catch (err) {
      console.error("Failed to save notification settings:", err);
    }
  };

  const disableNotifications = async () => {
    const newSettings = { ...notificationSettings, enabled: false };
    setNotificationSettings(newSettings);
    await saveNotificationSettings(newSettings);
    
    if (user) {
      await deleteDoc(doc(db, "fcmTokens", user.uid));
    }
    setFcmToken(null);
    addToast("info", "Push notifications disabled");
  };

  const markAllNotificationsRead = async () => {
    const updatedHistory = notificationHistory.map(n => ({ ...n, read: true }));
    setNotificationHistory(updatedHistory);
    setUnreadNotifications(0);
    
    if (user) {
      await setDoc(doc(db, "notificationHistory", user.uid), { items: updatedHistory });
    }
  };

  const clearNotificationHistory = async () => {
    setNotificationHistory([]);
    setUnreadNotifications(0);
    
    if (user) {
      await setDoc(doc(db, "notificationHistory", user.uid), { items: [] });
    }
    addToast("success", "Notification history cleared");
  };

  // ============================================================================
  // SETTINGS & DATA LOADING
  // ============================================================================

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, "settings", "admin"));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        if (data.categories) setCategories(data.categories);
        if (data.tags) setTags(data.tags);
        if (data.phases) setPhases(data.phases);
      }
    } catch (err) { console.error("Failed to load settings", err); }
  };

  const saveSettings = async (newCategories?: string[], newTags?: string[], newPhases?: Phase[]) => {
    try {
      await setDoc(doc(db, "settings", "admin"), {
        categories: newCategories || categories,
        tags: newTags || tags,
        phases: newPhases || phases
      }, { merge: true });
    } catch (err) { console.error("Failed to save settings", err); }
  };

  const fetchProjects = async () => {
    const q = await getDocs(collection(db, "projects"));
    const data = q.docs.map(d => ({ id: d.id, ...d.data() }));
    data.sort((a: any, b: any) => (a.order || 99) - (b.order || 99));
    setProjects(data);
  };

  const fetchLeads = async () => {
    const q = await getDocs(collection(db, "leads"));
    setLeads(q.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const fetchBlogPosts = async () => {
    const q = await getDocs(collection(db, "posts"));
    setBlogPosts(q.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const fetchClients = () => {
    const unsub = onSnapshot(collection(db, "clients"), (snapshot) => {
      const liveClients = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setClients(liveClients);
      if (selectedClient) {
        const updated = liveClients.find(c => c.id === selectedClient.id);
        if (updated) setSelectedClient(updated);
      }
    });
    return unsub;
  };

  // ============================================================================
  // PROJECT OPERATIONS
  // ============================================================================

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
      addToast("success", "Project order updated");
    } catch (err) { 
      console.error("Order update failed", err); 
      addToast("error", "Failed to update order");
    }
  };

  const toggleProjectVisibility = async (projectId: string, currentHidden: boolean) => {
    try {
      await updateDoc(doc(db, "projects", projectId), { hidden: !currentHidden });
      fetchProjects();
      addToast("success", currentHidden ? "Project now visible on homepage" : "Project hidden from homepage");
    } catch (err) {
      addToast("error", "Failed to update visibility");
    }
  };

  const toggleProjectFeatured = async (projectId: string, currentFeatured: boolean) => {
    try {
      await updateDoc(doc(db, "projects", projectId), { featured: !currentFeatured });
      fetchProjects();
      addToast("success", currentFeatured ? "Project unfeatured" : "Project featured");
    } catch (err) {
      addToast("error", "Failed to update featured status");
    }
  };

  // ============================================================================
  // SAVE HANDLER
  // ============================================================================

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
        finalData = { 
          title: newItem.title, 
          category: newItem.category, 
          imageUrl: finalImageUrl, 
          content: newItem.description, 
          date: newItem.date 
        };
      } else if (newItem.type === "client") {
        collectionName = "clients";
        finalData = {
          email: newItem.email, 
          phone: newItem.phone || "",
          company: newItem.company || "",
          projectName: newItem.title, 
          status: newItem.status,
          progress: Number(newItem.progress), 
          nextMilestone: newItem.nextMilestone,
          dueDate: newItem.dueDate, 
          previewUrl: newItem.previewUrl, 
          paymentUrl: newItem.paymentUrl,
          invoiceStatus: newItem.invoiceStatus || "not_sent",
          clientTier: newItem.clientTier || "standard",
          internalNotes: newItem.internalNotes || "",
          messages: newItem.messages || [], 
          assets: newItem.assets || [],
          activityLog: newItem.activityLog || []
        };
      } else {
        collectionName = "projects";
        finalData = { 
          title: newItem.title, 
          category: newItem.category, 
          imageUrl: finalImageUrl, 
          url: newItem.url, 
          tech: newItem.tech, 
          description: newItem.description, 
          order: newItem.order, 
          views: newItem.views || 0,
          orientation: newItem.orientation || "square",
          tags: newItem.tags || [],
          hidden: newItem.hidden || false,
          featured: newItem.featured || false
        };
      }

      if (editMode && currentId) {
        await updateDoc(doc(db, collectionName, currentId), finalData);
        addToast("success", `${newItem.type === 'client' ? 'Client' : newItem.type === 'post' ? 'Post' : 'Project'} updated`);
      } else {
        await addDoc(collection(db, collectionName), finalData);
        addToast("success", `New ${newItem.type} created`);
      }
      
      setStatus("success");
      setTimeout(() => { 
        setIsModalOpen(false); 
        resetForm(); 
        setStatus("idle"); 
        fetchProjects();
        fetchBlogPosts();
      }, 500);
    } catch (error) { 
      console.error(error); 
      setStatus("error"); 
      addToast("error", "Failed to save");
      setTimeout(() => setStatus("idle"), 2000); 
    }
  };

  // ============================================================================
  // CLIENT OPERATIONS
  // ============================================================================

  const updateClientField = async (field: string, value: any, logMessage?: string) => {
    if (!selectedClient) return;
    const updated = { ...selectedClient, [field]: value };
    
    if (logMessage) {
      const activity: ActivityItem = {
        type: field === "status" ? "phase" : field === "invoiceStatus" ? "invoice" : "update",
        message: logMessage,
        timestamp: new Date().toISOString(),
        by: "admin"
      };
      updated.activityLog = [...(selectedClient.activityLog || []), activity];
    }
    
    setSelectedClient(updated);
    await updateDoc(doc(db, "clients", selectedClient.id), updated);
    
    if (logMessage) addToast("info", logMessage);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedClient) return;
    const msg = { sender: "admin", text: newMessage, timestamp: new Date().toISOString() };
    const updatedMessages = [...(selectedClient.messages || []), msg];
    
    const activity: ActivityItem = {
      type: "message",
      message: "Message sent to client",
      timestamp: new Date().toISOString(),
      by: "admin"
    };
    const updatedLog = [...(selectedClient.activityLog || []), activity];
    
    setSelectedClient({ ...selectedClient, messages: updatedMessages, activityLog: updatedLog });
    setNewMessage("");
    await updateDoc(doc(db, "clients", selectedClient.id), { messages: updatedMessages, activityLog: updatedLog });
    setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    addToast("success", "Message sent");
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
    
    const activity: ActivityItem = {
      type: "file",
      message: `File uploaded: ${file.name}`,
      timestamp: new Date().toISOString(),
      by: "admin"
    };
    const updatedLog = [...(selectedClient.activityLog || []), activity];
    
    setSelectedClient({ ...selectedClient, assets: updatedAssets, activityLog: updatedLog });
    await updateDoc(doc(db, "clients", selectedClient.id), { assets: updatedAssets, activityLog: updatedLog });
    setStatus("idle");
    addToast("success", `File "${file.name}" uploaded`);
  };

  // ============================================================================
  // DELETE & HELPERS
  // ============================================================================

  const handleDelete = async (collectionName: string, id: string) => {
    if (!confirm("Permanently delete this record?")) return;
    await deleteDoc(doc(db, collectionName, id));
    if (collectionName === "clients") setSelectedClient(null); 
    else { fetchProjects(); fetchLeads(); fetchBlogPosts(); } 
    addToast("success", "Record deleted");
  };

  const openEdit = (item: any, type: string) => {
    let formData = { ...initialFormState, ...item, type };
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
    setImageFile(null); 
    setEditMode(false); 
    setCurrentId("");
  };

  const openNewModal = (type: string) => {
    resetForm();
    setNewItem({ ...initialFormState, type });
    setIsModalOpen(true);
  };

  const addNewCategory = (cat: string) => {
    const updated = [...categories, cat];
    setCategories(updated);
    saveSettings(updated, undefined, undefined);
  };

  const addNewTag = (tag: string) => {
    const updated = [...tags, tag];
    setTags(updated);
    saveSettings(undefined, updated, undefined);
  };

  const addNewPhase = (label: string) => {
    const newPhase: Phase = {
      id: label.toLowerCase().replace(/\s+/g, '_'),
      label,
      order: phases.length + 1
    };
    const updated = [...phases, newPhase];
    setPhases(updated);
    saveSettings(undefined, undefined, updated);
    addToast("success", `Phase "${label}" added`);
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const activeClients = clients.filter(c => c.status !== "live" && c.status !== "maintenance");
  const completedProjects = clients.filter(c => c.status === "live" || c.status === "maintenance");
  const pendingInvoices = clients.filter(c => c.invoiceStatus === "pending" || c.invoiceStatus === "overdue");
  const visibleProjects = projects.filter(p => !p.hidden);
  const featuredProjects = projects.filter(p => p.featured);

  const getPhaseLabel = (id: string) => phases.find(p => p.id === id)?.label || id;
  const getNextPhase = (currentId: string) => {
    const currentIndex = phases.findIndex(p => p.id === currentId);
    return currentIndex < phases.length - 1 ? phases[currentIndex + 1] : null;
  };

  const filteredProjects = projects.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center font-mono text-muted-foreground gap-4">
      <RefreshCw size={24} className="animate-spin text-foreground" />
      <span className="text-xs uppercase tracking-widest">Initializing Command Center...</span>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-white selection:text-black">
      
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastNotification key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>

      {/* Online/Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[90] bg-amber-500/10 border-b border-amber-500/30 py-2 px-4 flex items-center justify-center gap-2">
          <WifiOff size={14} className="text-amber-500" />
          <span className="text-xs text-amber-500 font-mono uppercase tracking-widest">You&apos;re offline - changes may not save</span>
        </div>
      )}

      {/* Global Search */}
      <AnimatePresence>
        {showGlobalSearch && (
          <GlobalSearch
            isOpen={showGlobalSearch}
            onClose={() => setShowGlobalSearch(false)}
            projects={projects}
            clients={clients}
            leads={leads}
            blogPosts={blogPosts}
            onSelectProject={(p) => { setTab("projects"); openEdit(p, "project"); }}
            onSelectClient={(c) => { setTab("clients"); setSelectedClient(c); }}
            onSelectLead={() => setTab("inbox")}
            onSelectPost={(p) => { setTab("blog"); openEdit(p, "post"); }}
            setTab={setTab}
          />
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showKeyboardShortcuts && (
          <KeyboardShortcutsModal 
            isOpen={showKeyboardShortcuts} 
            onClose={() => setShowKeyboardShortcuts(false)} 
          />
        )}
      </AnimatePresence>

      {/* Background */}
      <div className="opacity-20 fixed inset-0 pointer-events-none">
        <LivingCanvas />
      </div>

      <div className="relative z-10 flex min-h-screen">
        
        {/* ============ SIDEBAR ============ */}
        <aside className="w-64 bg-zinc-950/80 border-r border-border-subtle p-6 flex flex-col fixed h-full backdrop-blur-sm">
          <div className="mb-10">
            <h1 className="text-lg font-light tracking-tight">TALORMAYDE</h1>
            <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Command Center</p>
          </div>

          {/* Quick Search Trigger */}
          <button
            onClick={() => setShowGlobalSearch(true)}
            className="w-full mb-6 flex items-center gap-3 px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-500 hover:border-zinc-700 hover:text-zinc-400 transition-all"
          >
            <Search size={16} />
            <span className="flex-grow text-left">Search...</span>
            <kbd className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>

          <nav className="space-y-1 flex-grow">
            {[
              { id: "overview", label: "Overview", icon: Home },
              { id: "projects", label: "Work", icon: Briefcase },
              { id: "clients", label: "Clients", icon: Users },
              { id: "inbox", label: "Inquiries", icon: Inbox, badge: leads.length },
              { id: "blog", label: "Journal", icon: FileText },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setTab(item.id as any); setSelectedClient(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  tab === item.id 
                    ? "bg-white/10 text-foreground" 
                    : "text-zinc-500 hover:text-foreground hover:bg-white/5"
                }`}
              >
                <item.icon size={18} />
                <span className="font-light">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Notification Settings Button */}
          <div className="pt-4 border-t border-border-subtle">
            <button
              onClick={() => setShowNotificationPanel(!showNotificationPanel)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                showNotificationPanel 
                  ? "bg-white/10 text-foreground" 
                  : "text-zinc-500 hover:text-foreground hover:bg-white/5"
              }`}
            >
              <Bell size={18} />
              <span className="font-light">Notifications</span>
              {unreadNotifications > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
              {notificationSettings.enabled && unreadNotifications === 0 && (
                <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
          </div>

          <div className="pt-4 border-t border-border-subtle space-y-3 mt-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-mono">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-grow overflow-hidden">
                <p className="text-xs text-foreground truncate">{user?.email}</p>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Director</p>
              </div>
              {isOnline ? (
                <Wifi size={12} className="text-emerald-500" />
              ) : (
                <WifiOff size={12} className="text-amber-500" />
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowKeyboardShortcuts(true)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-zinc-600 hover:text-foreground text-xs transition-colors rounded-lg hover:bg-white/5"
              >
                <Keyboard size={14} />
              </button>
              <button 
                onClick={() => { signOut(auth); router.push("/"); }} 
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-zinc-600 hover:text-red-400 text-xs transition-colors rounded-lg hover:bg-white/5"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* ============ NOTIFICATION PANEL ============ */}
        <AnimatePresence>
          {showNotificationPanel && (
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="fixed left-64 top-0 h-full w-80 bg-zinc-950 border-r border-border-subtle z-40 flex flex-col"
            >
              <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                <h3 className="text-lg font-light">Notifications</h3>
                <button 
                  onClick={() => setShowNotificationPanel(false)}
                  className="p-2 text-zinc-500 hover:text-foreground transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {/* Permission Status */}
                <div className="p-4 bg-zinc-900/50 rounded-xl border border-border-subtle">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-zinc-400">Push Notifications</span>
                    <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded ${
                      notificationPermission === "granted" && notificationSettings.enabled
                        ? "bg-emerald-500/20 text-emerald-500"
                        : notificationPermission === "denied"
                        ? "bg-red-500/20 text-red-500"
                        : "bg-zinc-800 text-zinc-500"
                    }`}>
                      {notificationPermission === "granted" && notificationSettings.enabled 
                        ? "Active" 
                        : notificationPermission === "denied" 
                        ? "Blocked" 
                        : "Inactive"}
                    </span>
                  </div>

                  {notificationPermission === "denied" ? (
                    <p className="text-xs text-zinc-600">
                      Notifications are blocked. Enable them in your browser settings.
                    </p>
                  ) : notificationPermission === "granted" && notificationSettings.enabled ? (
                    <button
                      onClick={disableNotifications}
                      className="w-full py-2 bg-zinc-800 text-zinc-400 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors"
                    >
                      Disable Notifications
                    </button>
                  ) : (
                    <button
                      onClick={requestNotificationPermission}
                      className="w-full py-2 bg-white text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                    >
                      Enable Notifications
                    </button>
                  )}
                </div>

                {/* Notification Preferences */}
                {notificationSettings.enabled && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Preferences</h4>
                    
                    {[
                      { key: "newLeads", label: "New Inquiries", icon: Mail },
                      { key: "clientMessages", label: "Client Messages", icon: MessageSquare },
                      { key: "phaseChanges", label: "Phase Updates", icon: Activity },
                      { key: "invoiceUpdates", label: "Invoice Activity", icon: DollarSign },
                      { key: "soundEnabled", label: "Sound Effects", icon: Volume2 }
                    ].map(item => (
                      <div 
                        key={item.key}
                        className="flex items-center gap-3 p-3 bg-zinc-900/30 rounded-xl border border-border-subtle"
                      >
                        <item.icon size={14} className="text-zinc-500" />
                        <span className="flex-grow text-sm text-zinc-300">{item.label}</span>
                        <button
                          onClick={() => {
                            const newSettings = {
                              ...notificationSettings,
                              [item.key]: !notificationSettings[item.key as keyof NotificationSettings]
                            };
                            setNotificationSettings(newSettings);
                            saveNotificationSettings(newSettings);
                          }}
                          className={`w-10 h-5 rounded-full transition-colors relative ${
                            notificationSettings[item.key as keyof NotificationSettings] 
                              ? 'bg-emerald-600' 
                              : 'bg-zinc-700'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
                            notificationSettings[item.key as keyof NotificationSettings] 
                              ? 'left-5' 
                              : 'left-0.5'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Test & Actions */}
                {notificationSettings.enabled && (
                  <div className="space-y-2 pt-4 border-t border-border-subtle">
                    <button
                      onClick={() => {
                        if (Notification.permission === "granted") {
                          new Notification("TALORMAYDE", {
                            body: "Push notifications are working!",
                            icon: "/icon-192.png"
                          });
                          if (notificationSettings.soundEnabled) playNotificationSound();
                          addToast("success", "Test notification sent!");
                        }
                      }}
                      className="w-full py-2 border border-zinc-800 text-zinc-400 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-zinc-900 hover:text-foreground transition-colors flex items-center justify-center gap-2"
                    >
                      <Zap size={14} /> Test Notification
                    </button>
                  </div>
                )}

                {/* Notification History */}
                <div className="pt-4 border-t border-border-subtle">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">History</h4>
                    {notificationHistory.length > 0 && (
                      <div className="flex gap-2">
                        <button 
                          onClick={markAllNotificationsRead}
                          className="text-[10px] text-blue-500 hover:text-blue-400"
                        >
                          Mark read
                        </button>
                        <button 
                          onClick={clearNotificationHistory}
                          className="text-[10px] text-zinc-600 hover:text-zinc-400"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notificationHistory.length === 0 ? (
                      <p className="text-center text-zinc-600 py-6 text-sm italic">No notifications yet</p>
                    ) : (
                      notificationHistory.slice(0, 20).map(n => (
                        <div 
                          key={n.id}
                          className={`p-3 rounded-lg border transition-all ${
                            n.read 
                              ? "bg-zinc-900/30 border-zinc-800/50" 
                              : "bg-zinc-900/50 border-zinc-700"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                            <div className="flex-grow">
                              <p className="text-sm text-foreground">{n.title}</p>
                              <p className="text-xs text-zinc-500 mt-0.5">{n.body}</p>
                              <p className="text-[10px] text-zinc-600 mt-1">
                                {new Date(n.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* FCM Token (Debug) */}
                {fcmToken && (
                  <div className="pt-4 border-t border-border-subtle">
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-2">Device Token</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={fcmToken.substring(0, 24) + "..."}
                        readOnly
                        className="flex-grow bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-[10px] text-zinc-500 font-mono"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(fcmToken);
                          addToast("success", "Token copied!");
                        }}
                        className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-foreground transition-colors"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ============ MAIN CONTENT ============ */}
        <main className={`flex-1 ml-64 p-8 transition-all ${showNotificationPanel ? "ml-[544px]" : ""}`}>
          
          {/* ============ OVERVIEW TAB ============ */}
          {tab === "overview" && (
            <div className="max-w-6xl mx-auto">
              <div className="mb-10">
                <h2 className="text-3xl font-light mb-2">Welcome back</h2>
                <p className="text-zinc-500">Here&apos;s what&apos;s happening with your studio.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 mb-10">
                <StatCard 
                  icon={Users} 
                  label="Active Clients" 
                  value={activeClients.length} 
                  color="white"
                  onClick={() => setTab("clients")}
                />
                <StatCard 
                  icon={CheckCircle} 
                  label="Completed" 
                  value={completedProjects.length} 
                  color="emerald" 
                />
                <StatCard 
                  icon={DollarSign} 
                  label="Pending Invoices" 
                  value={pendingInvoices.length} 
                  color={pendingInvoices.length > 0 ? "amber" : "white"} 
                  subtext={pendingInvoices.length > 0 ? "Needs attention" : "All clear"} 
                />
                <StatCard 
                  icon={Inbox} 
                  label="New Inquiries" 
                  value={leads.length} 
                  color={leads.length > 0 ? "blue" : "white"}
                  onClick={() => setTab("inbox")}
                />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-4 mb-10">
                <button 
                  onClick={() => { setTab("clients"); openNewModal("client"); }}
                  className="p-6 bg-zinc-900/50 border border-border-subtle rounded-2xl hover:border-white/20 transition-all text-left group"
                >
                  <Plus size={20} className="mb-3 text-emerald-500" />
                  <h3 className="font-light mb-1 group-hover:text-white transition-colors">New Client</h3>
                  <p className="text-xs text-zinc-600">Start a new project</p>
                </button>
                <button 
                  onClick={() => { setTab("projects"); openNewModal("project"); }}
                  className="p-6 bg-zinc-900/50 border border-border-subtle rounded-2xl hover:border-white/20 transition-all text-left group"
                >
                  <Briefcase size={20} className="mb-3 text-blue-500" />
                  <h3 className="font-light mb-1 group-hover:text-white transition-colors">Add Work</h3>
                  <p className="text-xs text-zinc-600">Showcase a project</p>
                </button>
                <button 
                  onClick={() => { setTab("blog"); openNewModal("post"); }}
                  className="p-6 bg-zinc-900/50 border border-border-subtle rounded-2xl hover:border-white/20 transition-all text-left group"
                >
                  <FileText size={20} className="mb-3 text-purple-500" />
                  <h3 className="font-light mb-1 group-hover:text-white transition-colors">Write Post</h3>
                  <p className="text-xs text-zinc-600">Share your thoughts</p>
                </button>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-zinc-900/30 border border-border-subtle rounded-2xl p-6">
                  <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">Active Projects</h3>
                  <div className="space-y-3">
                    {activeClients.slice(0, 5).map(client => (
                      <div 
                        key={client.id}
                        onClick={() => { setTab("clients"); setSelectedClient(client); }}
                        className="flex items-center gap-4 p-3 bg-zinc-900/50 rounded-xl hover:bg-zinc-800/50 transition-all cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xs font-mono">
                          {client.progress || 0}%
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm text-foreground">{client.projectName}</p>
                          <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                            {getPhaseLabel(client.status)}
                          </p>
                        </div>
                        <ChevronDown size={16} className="text-zinc-600 -rotate-90" />
                      </div>
                    ))}
                    {activeClients.length === 0 && (
                      <p className="text-zinc-600 text-sm text-center py-8 italic">No active projects</p>
                    )}
                  </div>
                </div>

                <div className="bg-zinc-900/30 border border-border-subtle rounded-2xl p-6">
                  <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-500 mb-4">Recent Inquiries</h3>
                  <div className="space-y-3">
                    {leads.slice(0, 5).map(lead => (
                      <div 
                        key={lead.id}
                        onClick={() => setTab("inbox")}
                        className="flex items-center gap-4 p-3 bg-zinc-900/50 rounded-xl hover:bg-zinc-800/50 transition-all cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <Mail size={16} className="text-emerald-500" />
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm text-foreground">{lead.name}</p>
                          <p className="text-[10px] text-zinc-600">{lead.email}</p>
                        </div>
                      </div>
                    ))}
                    {leads.length === 0 && (
                      <p className="text-zinc-600 text-sm text-center py-8 italic">No new inquiries</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ PROJECTS TAB ============ */}
          {tab === "projects" && (
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-light">Work</h2>
                  <p className="text-zinc-500 text-sm">
                    {projects.length} total • {visibleProjects.length} visible
                    {featuredProjects.length > 0 && ` • ${featuredProjects.length} featured`}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-foreground outline-none focus:border-zinc-700 w-48"
                    />
                  </div>
                  
                  {/* View Toggle */}
                  <div className="flex bg-zinc-900 rounded-lg p-1">
                    <button onClick={() => setViewMode("list")} className={`p-2 rounded ${viewMode === "list" ? "bg-zinc-800 text-foreground" : "text-zinc-600"}`}>
                      <List size={16} />
                    </button>
                    <button onClick={() => setViewMode("grid")} className={`p-2 rounded ${viewMode === "grid" ? "bg-zinc-800 text-foreground" : "text-zinc-600"}`}>
                      <LayoutGrid size={16} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => openNewModal("project")} 
                    className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-zinc-200 transition-colors"
                  >
                    <Plus size={14} /> Add Work
                  </button>
                </div>
              </div>

              {/* Project List */}
              <div className={viewMode === "grid" ? "grid grid-cols-3 gap-4" : "space-y-3"}>
                {filteredProjects.map((project, index) => (
                  <div 
                    key={project.id} 
                    className={`bg-zinc-900/30 border border-border-subtle rounded-xl p-4 hover:border-white/20 transition-all group ${
                      viewMode === "grid" ? "" : "flex items-center gap-4"
                    } ${project.hidden ? "opacity-50" : ""}`}
                  >
                    {viewMode === "list" && (
                      <div className="flex gap-1">
                        <button onClick={() => moveProject(index, 'up')} disabled={index === 0} className="p-1.5 text-zinc-600 hover:text-foreground disabled:opacity-30">
                          <ArrowUp size={14} />
                        </button>
                        <button onClick={() => moveProject(index, 'down')} disabled={index === projects.length - 1} className="p-1.5 text-zinc-600 hover:text-foreground disabled:opacity-30">
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    )}
                    
                    {project.imageUrl && viewMode === "grid" && (
                      <div className="aspect-video bg-zinc-800 rounded-lg mb-3 overflow-hidden relative">
                        <img src={project.imageUrl} alt="" className="w-full h-full object-cover" />
                        {project.hidden && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <EyeOff size={24} className="text-zinc-400" />
                          </div>
                        )}
                        {project.featured && (
                          <div className="absolute top-2 right-2">
                            <Star size={16} className="text-amber-500 fill-amber-500" />
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        {project.featured && viewMode === "list" && (
                          <Star size={14} className="text-amber-500 fill-amber-500" />
                        )}
                        <h3 className="font-light text-foreground group-hover:text-white transition-colors">
                          {project.title}
                        </h3>
                        {project.hidden && <EyeOff size={14} className="text-zinc-500" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                          {project.category}
                        </span>
                        {project.tags && project.tags.length > 0 && (
                          <>
                            <span className="text-zinc-700">•</span>
                            <div className="flex gap-1 flex-wrap">
                              {project.tags.slice(0, 3).map((tag: string) => (
                                <span key={tag} className="text-[9px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">
                                  {tag}
                                </span>
                              ))}
                              {project.tags.length > 3 && (
                                <span className="text-[9px] text-zinc-600">+{project.tags.length - 3}</span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Featured Toggle */}
                      <button 
                        onClick={() => toggleProjectFeatured(project.id, project.featured)}
                        className={`p-2 rounded transition-colors ${project.featured ? "text-amber-500 hover:text-zinc-400" : "text-zinc-600 hover:text-amber-500"}`}
                        title={project.featured ? "Unfeature" : "Feature project"}
                      >
                        <Star size={14} className={project.featured ? "fill-current" : ""} />
                      </button>
                      
                      {/* Visibility Toggle */}
                      <button 
                        onClick={() => toggleProjectVisibility(project.id, project.hidden)}
                        className={`p-2 rounded transition-colors ${project.hidden ? "text-zinc-600 hover:text-emerald-500" : "text-emerald-500 hover:text-zinc-400"}`}
                        title={project.hidden ? "Show on homepage" : "Hide from homepage"}
                      >
                        {project.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      
                      {project.url && (
                        <a href={project.url} target="_blank" className="p-2 text-zinc-600 hover:text-foreground transition-colors">
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <button onClick={() => openEdit(project, "project")} className="p-2 text-zinc-600 hover:text-foreground transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete("projects", project.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ CLIENTS TAB ============ */}
          {tab === "clients" && (
            <div className="max-w-6xl mx-auto">
              {!selectedClient ? (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h2 className="text-2xl font-light">Clients</h2>
                      <p className="text-zinc-500 text-sm">{clients.length} total</p>
                    </div>
                    <button 
                      onClick={() => openNewModal("client")} 
                      className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-zinc-200 transition-colors"
                    >
                      <Plus size={14} /> New Client
                    </button>
                  </div>

                  <div className="grid gap-4">
                    {clients.map((client) => (
                      <div 
                        key={client.id} 
                        onClick={() => setSelectedClient(client)} 
                        className="bg-zinc-900/30 border border-border-subtle p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-white/20 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-4 w-full md:w-auto">
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-foreground font-mono text-xs border border-white/10">
                            {client.progress || 0}%
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-light text-foreground group-hover:text-zinc-300 transition-colors">
                                {client.projectName}
                              </h3>
                              {client.clientTier && client.clientTier !== "standard" && (
                                <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded ${
                                  client.clientTier === "vip" ? "bg-amber-500/20 text-amber-500" : "bg-blue-500/20 text-blue-500"
                                }`}>
                                  {client.clientTier}
                                </span>
                              )}
                            </div>
                            <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase">{client.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex-grow w-full md:px-12">
                          <div className="flex justify-between text-[10px] text-muted-foreground mb-2 uppercase tracking-widest font-mono">
                            <span>{getPhaseLabel(client.status)}</span>
                            <span>Due: {client.dueDate || "TBD"}</span>
                          </div>
                          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-white transition-all" style={{ width: `${client.progress || 0}%` }} />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {client.invoiceStatus && (
                            <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-1 rounded ${
                              client.invoiceStatus === "paid" ? "bg-emerald-500/20 text-emerald-500" :
                              client.invoiceStatus === "pending" ? "bg-amber-500/20 text-amber-500" :
                              client.invoiceStatus === "overdue" ? "bg-red-500/20 text-red-500" :
                              "bg-zinc-800 text-zinc-500"
                            }`}>
                              {INVOICE_STATUSES.find(s => s.id === client.invoiceStatus)?.label || "Not Sent"}
                            </span>
                          )}
                          <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest group-hover:text-foreground">
                            Open &rarr;
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* ============ CLIENT DETAIL VIEW ============ */
                <div className="min-h-[500px]">
                  {/* Header */}
                  <div className="flex items-center gap-6 mb-8 border-b border-border-subtle pb-8">
                    <button onClick={() => setSelectedClient(null)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                      <ArrowUp size={18} className="-rotate-90" />
                    </button>
                    <div className="flex-grow">
                      <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-light">{selectedClient.projectName}</h2>
                        {selectedClient.clientTier && selectedClient.clientTier !== "standard" && (
                          <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded ${
                            selectedClient.clientTier === "vip" ? "bg-amber-500/20 text-amber-500" : "bg-blue-500/20 text-blue-500"
                          }`}>
                            {selectedClient.clientTier}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase flex items-center gap-2">
                          <Mail size={12} /> {selectedClient.email}
                        </p>
                        {selectedClient.phone && (
                          <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase flex items-center gap-2">
                            <Phone size={12} /> {selectedClient.phone}
                          </p>
                        )}
                        {selectedClient.company && (
                          <p className="text-muted-foreground font-mono text-xs tracking-widest uppercase flex items-center gap-2">
                            <Building size={12} /> {selectedClient.company}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(selectedClient, "client")} className="px-4 py-2 border border-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-900 hover:text-foreground transition-all font-mono text-[10px] uppercase tracking-widest">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete("clients", selectedClient.id)} className="px-4 py-2 border border-red-900/30 text-red-500/50 rounded-lg hover:bg-red-900/10 hover:text-red-500 transition-all font-mono text-[10px] uppercase tracking-widest">
                        Terminate
                      </button>
                    </div>
                  </div>

                  {/* Status Cards Row */}
                  <div className="grid grid-cols-4 gap-4 mb-8">
                    {/* Phase Selector */}
                    <div className="p-5 bg-zinc-900/30 border border-border-subtle rounded-2xl">
                      <label className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest mb-3 block">Status Phase</label>
                      <select
                        value={selectedClient.status || "discovery"}
                        onChange={(e) => {
                          const newPhase = phases.find(p => p.id === e.target.value);
                          const nextPhase = getNextPhase(e.target.value);
                          updateClientField("status", e.target.value, `Phase updated to: ${newPhase?.label}`);
                          if (nextPhase) updateClientField("nextMilestone", nextPhase.id);
                        }}
                        className="w-full bg-transparent border-b border-zinc-800 focus:border-white outline-none pb-2 text-lg font-light cursor-pointer"
                      >
                        {phases.map(p => (
                          <option key={p.id} value={p.id} className="bg-zinc-900">{p.label}</option>
                        ))}
                      </select>
                      <button 
                        onClick={() => {
                          const label = prompt("Enter new phase name:");
                          if (label) addNewPhase(label);
                        }}
                        className="text-[9px] text-emerald-500 mt-2 flex items-center gap-1 hover:text-emerald-400"
                      >
                        <Plus size={10} /> Add Phase
                      </button>
                    </div>

                    {/* Progress */}
                    <div className="p-5 bg-zinc-900/30 border border-border-subtle rounded-2xl">
                      <label className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest mb-3 block">
                        Progress ({selectedClient.progress || 0}%)
                      </label>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        className="w-full accent-white cursor-pointer" 
                        value={selectedClient.progress || 0} 
                        onChange={(e) => updateClientField("progress", Number(e.target.value))} 
                      />
                    </div>

                    {/* Next Milestone */}
                    <div className="p-5 bg-zinc-900/30 border border-border-subtle rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest">Next Milestone</label>
                        {(() => {
                          const nextPhase = getNextPhase(selectedClient.status);
                          return nextPhase && selectedClient.nextMilestone === nextPhase.id ? (
                            <span className="text-[9px] text-emerald-500 flex items-center gap-1">
                              <Zap size={10} /> Auto
                            </span>
                          ) : null;
                        })()}
                      </div>
                      <select
                        value={selectedClient.nextMilestone || ""}
                        onChange={(e) => updateClientField("nextMilestone", e.target.value)}
                        className="w-full bg-transparent border-b border-zinc-800 focus:border-white outline-none pb-2 text-lg font-light cursor-pointer"
                      >
                        {phases.map(p => (
                          <option key={p.id} value={p.id} className="bg-zinc-900">{p.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Invoice Status */}
                    <div className="p-5 bg-zinc-900/30 border border-border-subtle rounded-2xl">
                      <label className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest mb-3 block">Invoice Status</label>
                      <select
                        value={selectedClient.invoiceStatus || "not_sent"}
                        onChange={(e) => {
                          const status = INVOICE_STATUSES.find(s => s.id === e.target.value);
                          updateClientField("invoiceStatus", e.target.value, `Invoice status: ${status?.label}`);
                        }}
                        className={`w-full bg-transparent border-b border-zinc-800 focus:border-white outline-none pb-2 text-lg font-light cursor-pointer ${
                          selectedClient.invoiceStatus === "paid" ? "text-emerald-500" :
                          selectedClient.invoiceStatus === "pending" ? "text-amber-500" :
                          selectedClient.invoiceStatus === "overdue" ? "text-red-500" : ""
                        }`}
                      >
                        {INVOICE_STATUSES.map(s => (
                          <option key={s.id} value={s.id} className="bg-zinc-900 text-foreground">{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Second Row */}
                  <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="p-5 bg-zinc-900/30 border border-border-subtle rounded-2xl">
                      <label className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest mb-3 block flex items-center gap-2">
                        <Calendar size={12} /> Due Date
                      </label>
                      <input 
                        type="date"
                        className="w-full bg-transparent border-b border-zinc-800 focus:border-white outline-none pb-2 text-lg font-light" 
                        value={selectedClient.dueDate || ""} 
                        onChange={(e) => updateClientField("dueDate", e.target.value)} 
                      />
                    </div>

                    <div className="p-5 bg-zinc-900/30 border border-border-subtle rounded-2xl">
                      <label className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest mb-3 block">Client Tier</label>
                      <select
                        value={selectedClient.clientTier || "standard"}
                        onChange={(e) => updateClientField("clientTier", e.target.value)}
                        className="w-full bg-transparent border-b border-zinc-800 focus:border-white outline-none pb-2 text-lg font-light cursor-pointer"
                      >
                        {CLIENT_TIERS.map(t => (
                          <option key={t.id} value={t.id} className="bg-zinc-900">{t.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="p-5 bg-zinc-900/30 border border-border-subtle rounded-2xl">
                      <label className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest mb-3 block flex items-center gap-2">
                        <Globe size={12} /> Staging URL
                      </label>
                      <div className="flex gap-2">
                        <input 
                          className="flex-grow bg-transparent border-b border-zinc-800 focus:border-white outline-none pb-2 text-sm font-light" 
                          value={selectedClient.previewUrl || ""} 
                          onChange={(e) => updateClientField("previewUrl", e.target.value)} 
                          placeholder="https://..." 
                        />
                        {selectedClient.previewUrl && (
                          <a href={selectedClient.previewUrl} target="_blank" className="p-2 text-zinc-600 hover:text-foreground">
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="p-5 bg-zinc-900/30 border border-border-subtle rounded-2xl">
                      <label className="text-[10px] text-muted-foreground uppercase font-mono tracking-widest mb-3 block flex items-center gap-2">
                        <DollarSign size={12} /> Invoice URL
                      </label>
                      <div className="flex gap-2">
                        <input 
                          className="flex-grow bg-transparent border-b border-zinc-800 focus:border-white outline-none pb-2 text-sm font-light" 
                          value={selectedClient.paymentUrl || ""} 
                          onChange={(e) => updateClientField("paymentUrl", e.target.value)} 
                          placeholder="https://buy.stripe.com/..." 
                        />
                        {selectedClient.paymentUrl && (
                          <a href={selectedClient.paymentUrl} target="_blank" className="p-2 text-zinc-600 hover:text-foreground">
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Correspondence Log */}
                    <div className="lg:col-span-2 bg-zinc-900/30 border border-border-subtle rounded-2xl p-6 flex flex-col h-[500px]">
                      <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MessageSquare size={14}/> Correspondence Log
                      </h3>
                      <div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-2">
                        {(!selectedClient.messages || selectedClient.messages.length === 0) && (
                          <p className="text-zinc-700 text-center py-20 italic font-serif">Begin the conversation.</p>
                        )}
                        {selectedClient.messages?.map((msg: any, i: number) => (
                          <div key={i} className={`flex flex-col ${msg.sender === 'admin' ? 'items-end' : 'items-start'}`}>
                            <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                              msg.sender === 'admin' 
                                ? 'bg-white/10 text-foreground border border-white/10' 
                                : 'bg-zinc-800/50 text-zinc-300'
                            }`}>
                              {msg.text}
                            </div>
                            <span className="text-[10px] text-zinc-600 mt-2 uppercase tracking-widest">
                              {msg.sender === 'admin' ? 'You' : 'Client'} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        ))}
                        <div ref={scrollRef} />
                      </div>
                      <div className="flex gap-2">
                        <input 
                          className="flex-grow bg-transparent border-b border-zinc-700 py-3 text-foreground outline-none focus:border-white transition-colors font-light" 
                          placeholder="Type message..." 
                          value={newMessage} 
                          onChange={(e) => setNewMessage(e.target.value)} 
                          onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
                        />
                        <button onClick={sendMessage} className="p-3 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors">
                          <Send size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Internal Notes */}
                      <div className="bg-zinc-900/30 border border-border-subtle rounded-2xl p-5">
                        <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                          <FileText size={14}/> Internal Notes
                        </h3>
                        <textarea
                          className="w-full bg-transparent border border-zinc-800 rounded-lg p-3 text-sm text-zinc-300 outline-none focus:border-zinc-700 resize-none h-20"
                          placeholder="Private notes..."
                          value={selectedClient.internalNotes || ""}
                          onChange={(e) => updateClientField("internalNotes", e.target.value)}
                        />
                      </div>

                      {/* Deliverables */}
                      <div className="bg-zinc-900/30 border border-border-subtle rounded-2xl p-5">
                        <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Paperclip size={14}/> Deliverables
                        </h3>
                        <div className="space-y-2 max-h-32 overflow-y-auto mb-3">
                          {selectedClient.assets?.map((asset: any, i: number) => (
                            <div key={i} className="flex justify-between items-center bg-zinc-800/50 p-2.5 rounded-lg text-sm">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <Paperclip size={12} className={asset.uploader === 'admin' ? 'text-white' : 'text-zinc-500'} />
                                <span className="truncate text-zinc-300 text-xs">{asset.name}</span>
                              </div>
                              <a href={asset.url} target="_blank" className="text-zinc-500 hover:text-foreground">
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          ))}
                        </div>
                        <div className="border border-dashed border-zinc-800 rounded-lg p-3 text-center hover:border-zinc-700 transition-all relative cursor-pointer">
                          <input type="file" onChange={uploadAsset} className="absolute inset-0 opacity-0 cursor-pointer" />
                          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-600">
                            {status === 'saving' ? "Uploading..." : "+ Upload File"}
                          </span>
                        </div>
                      </div>

                      {/* Activity Log */}
                      <div className="bg-zinc-900/30 border border-border-subtle rounded-2xl p-5">
                        <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Activity size={14}/> Activity Log
                        </h3>
                        <ActivityLog activities={selectedClient.activityLog || []} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============ INBOX TAB ============ */}
          {tab === "inbox" && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-light">Inquiries</h2>
                <p className="text-zinc-500 text-sm">{leads.length} total</p>
              </div>

              {leads.length === 0 && (
                <div className="text-center py-20 bg-zinc-900/30 border border-border-subtle rounded-2xl">
                  <Inbox size={40} className="mx-auto mb-4 text-zinc-700" />
                  <p className="text-zinc-600 italic font-serif">No new inquiries.</p>
                </div>
              )}

              <div className="space-y-4">
                {leads.map((l) => (
                  <div key={l.id} className="bg-zinc-900/30 p-6 rounded-2xl border border-border-subtle group hover:border-white/10 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-light text-foreground">{l.name}</h3>
                        <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest mt-1">{l.email}</p>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest border border-zinc-800 px-2 py-1 rounded">
                        New
                      </span>
                    </div>

                    <p className="text-zinc-400 font-light leading-relaxed mb-6 italic border-l-2 border-zinc-800 pl-4">
                      &ldquo;{l.message}&rdquo;
                    </p>

                    <div className="flex justify-end gap-4 pt-4 border-t border-border-subtle">
                      <button 
                        onClick={async () => {
                          if (!confirm(`Promote ${l.name} to Client?`)) return;
                          
                          await addDoc(collection(db, "clients"), {
                            email: l.email,
                            projectName: `${l.name} Project`,
                            status: "discovery",
                            progress: 0,
                            nextMilestone: "proposal",
                            dueDate: "",
                            invoiceStatus: "not_sent",
                            clientTier: "standard",
                            internalNotes: `Original inquiry: "${l.message}"`,
                            messages: [{
                              sender: "admin",
                              text: `Welcome, ${l.name}. This is your private project space.`,
                              timestamp: new Date().toISOString()
                            }],
                            assets: [],
                            activityLog: [{
                              type: "phase",
                              message: "Client created from inquiry",
                              timestamp: new Date().toISOString(),
                              by: "admin"
                            }]
                          });

                          await deleteDoc(doc(db, "leads", l.id));
                          fetchLeads();
                          setTab("clients");
                          addToast("success", `${l.name} promoted to client`);
                        }}
                        className="text-emerald-500 hover:text-foreground text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                      >
                        <Users size={14} /> Promote to Client
                      </button>

                      <button 
                        onClick={() => handleDelete("leads", l.id)} 
                        className="text-zinc-600 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                      >
                        <Archive size={14} /> Archive
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============ BLOG TAB ============ */}
          {tab === "blog" && (
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-light">Journal</h2>
                  <p className="text-zinc-500 text-sm">{blogPosts.length} entries</p>
                </div>
                <button 
                  onClick={() => openNewModal("post")} 
                  className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-zinc-200 transition-colors"
                >
                  <Plus size={14} /> New Entry
                </button>
              </div>

              <div className="space-y-3">
                {blogPosts.map(p => (
                  <div key={p.id} className="bg-zinc-900/30 p-5 rounded-xl border border-border-subtle flex justify-between items-center hover:border-white/10 transition-all">
                    <div>
                      <h3 className="font-light text-foreground">{p.title}</h3>
                      <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mt-1">{p.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p, "post")} className="p-2 text-zinc-600 hover:text-foreground transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete("posts", p.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ============ UNIVERSAL MODAL ============ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-border-subtle flex justify-between items-center">
                <h3 className="text-xl font-light">
                  {editMode ? "Edit" : "New"} {newItem.type === "client" ? "Client" : newItem.type === "post" ? "Journal Entry" : "Project"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* === CLIENT FIELDS === */}
                {newItem.type === "client" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Client Email *</label>
                        <input className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-foreground focus:border-zinc-700 outline-none" value={newItem.email} onChange={(e) => setNewItem({...newItem, email: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Project Name</label>
                        <input className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-foreground focus:border-zinc-700 outline-none" value={newItem.title} onChange={(e) => setNewItem({...newItem, title: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Phone</label>
                        <input className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-foreground focus:border-zinc-700 outline-none" value={newItem.phone || ""} onChange={(e) => setNewItem({...newItem, phone: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Company</label>
                        <input className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-foreground focus:border-zinc-700 outline-none" value={newItem.company || ""} onChange={(e) => setNewItem({...newItem, company: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <SmartDropdown
                        label="Starting Phase"
                        value={getPhaseLabel(newItem.status || "discovery")}
                        options={phases.map(p => p.label)}
                        onChange={(label) => {
                          const phase = phases.find(p => p.label === label);
                          if (phase) {
                            const nextPhase = getNextPhase(phase.id);
                            setNewItem({
                              ...newItem, 
                              status: phase.id,
                              ...(nextPhase ? { nextMilestone: nextPhase.id } : {})
                            });
                          }
                        }}
                        onAddNew={addNewPhase}
                      />
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Due Date</label>
                        <input type="date" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-foreground focus:border-zinc-700 outline-none" value={newItem.dueDate || ""} onChange={(e) => setNewItem({...newItem, dueDate: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Client Tier</label>
                        <select className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-foreground focus:border-zinc-700 outline-none" value={newItem.clientTier || "standard"} onChange={(e) => setNewItem({...newItem, clientTier: e.target.value})}>
                          {CLIENT_TIERS.map(t => (<option key={t.id} value={t.id}>{t.label}</option>))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Invoice Status</label>
                        <select className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-foreground focus:border-zinc-700 outline-none" value={newItem.invoiceStatus || "not_sent"} onChange={(e) => setNewItem({...newItem, invoiceStatus: e.target.value})}>
                          {INVOICE_STATUSES.map(s => (<option key={s.id} value={s.id}>{s.label}</option>))}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* === PROJECT / POST FIELDS === */}
                {newItem.type !== "client" && (
                  <>
                    {/* Orientation (Projects Only) */}
                    {newItem.type === "project" && (
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "square", icon: Square, label: "Square" },
                          { id: "landscape", icon: Monitor, label: "Landscape" },
                          { id: "portrait", icon: Smartphone, label: "Portrait" }
                        ].map(opt => (
                          <label 
                            key={opt.id}
                            className={`cursor-pointer border p-4 rounded-lg flex flex-col items-center gap-2 hover:bg-white/5 transition-all ${
                              newItem.orientation === opt.id ? 'border-white bg-white/5' : 'border-zinc-800 text-muted-foreground'
                            }`} 
                            onClick={() => setNewItem({...newItem, orientation: opt.id})}
                          >
                            <opt.icon size={24} />
                            <span className="text-[10px] uppercase font-bold tracking-widest">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Title</label>
                        <input className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-foreground focus:border-zinc-700 outline-none" value={newItem.title} onChange={(e) => setNewItem({...newItem, title: e.target.value})} />
                      </div>
                      <SmartDropdown
                        label="Category"
                        value={newItem.category}
                        options={categories}
                        onChange={(val) => setNewItem({...newItem, category: val})}
                        onAddNew={addNewCategory}
                      />
                    </div>

                    {newItem.type === "project" && (
                      <>
                        <TagSelector
                          label="Tags (Technicalities)"
                          selected={newItem.tags || []}
                          options={tags}
                          onChange={(t) => setNewItem({...newItem, tags: t})}
                          onAddNew={addNewTag}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Order Priority</label>
                            <input type="number" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-foreground focus:border-zinc-700 outline-none" value={newItem.order} onChange={(e) => setNewItem({...newItem, order: Number(e.target.value)})} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Live URL</label>
                            <input className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-foreground focus:border-zinc-700 outline-none" value={newItem.url} onChange={(e) => setNewItem({...newItem, url: e.target.value})} />
                          </div>
                        </div>

                        {/* Visibility & Featured Toggles */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-xl border border-border-subtle">
                            <button
                              type="button"
                              onClick={() => setNewItem({...newItem, hidden: !newItem.hidden})}
                              className={`w-12 h-6 rounded-full transition-colors relative ${newItem.hidden ? 'bg-zinc-700' : 'bg-emerald-600'}`}
                            >
                              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${newItem.hidden ? 'left-0.5' : 'left-6'}`} />
                            </button>
                            <div>
                              <p className="text-sm text-foreground">{newItem.hidden ? "Hidden" : "Visible"}</p>
                              <p className="text-xs text-zinc-600">On homepage</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-xl border border-border-subtle">
                            <button
                              type="button"
                              onClick={() => setNewItem({...newItem, featured: !newItem.featured})}
                              className={`w-12 h-6 rounded-full transition-colors relative ${newItem.featured ? 'bg-amber-600' : 'bg-zinc-700'}`}
                            >
                              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${newItem.featured ? 'left-6' : 'left-0.5'}`} />
                            </button>
                            <div>
                              <p className="text-sm text-foreground">{newItem.featured ? "Featured" : "Standard"}</p>
                              <p className="text-xs text-zinc-600">Highlight project</p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Cover Image</label>
                      <div className="border border-dashed border-zinc-800 rounded-xl p-6 text-center hover:border-zinc-600 relative bg-zinc-900/50">
                        <input type="file" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <ImageIcon size={24} />
                          <span className="text-xs uppercase tracking-widest">{imageFile ? imageFile.name : "Select Image"}</span>
                        </div>
                      </div>
                      {newItem.imageUrl && !imageFile && (
                        <div className="text-[10px] text-emerald-500 flex items-center gap-1 mt-2 tracking-widest uppercase">
                          <Check size={10}/> Image Linked
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                        {newItem.type === "post" ? "Body Content" : "Description"}
                      </label>
                      <textarea className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-foreground focus:border-zinc-700 outline-none h-32 resize-none" value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} />
                    </div>
                  </>
                )}
              </div>

              <div className="p-6 border-t border-border-subtle flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-muted-foreground hover:text-foreground text-xs font-bold tracking-widest uppercase">
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={status !== "idle"} 
                  className={`px-8 py-3 rounded-full font-bold text-xs tracking-widest uppercase transition-all min-w-[140px] flex justify-center items-center ${
                    status === "idle" ? "bg-white text-black hover:bg-zinc-200" : 
                    status === "success" ? "bg-emerald-600 text-white" : "bg-zinc-700 text-zinc-400"
                  }`}
                >
                  {status === "idle" ? (editMode ? "Update" : "Save") : status === "success" ? <Check size={16} /> : status}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}