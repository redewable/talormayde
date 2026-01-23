"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, LayoutGrid, LogOut, X, Trash2, Check, Image as ImageIcon, Edit2, List, 
  Inbox, MessageSquare, Paperclip, Send, ExternalLink, Globe, ArrowUp, ArrowDown,
  Briefcase, Users, FileText, Bell, Search, ChevronDown, Activity, DollarSign, 
  Clock, CheckCircle, AlertCircle, Calendar, TrendingUp, Zap, Archive, RefreshCw, 
  Mail, Phone, Building, Eye, EyeOff, Copy, Home, Volume2, VolumeX, Wifi, WifiOff,
  Star, Keyboard, Menu, ChevronRight, Sun, Moon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { auth, db, storage, getFirebaseMessaging, getToken, onMessage, isSupported } from "@/lib/firebase"; 
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot, setDoc, getDoc, query, orderBy, limit } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useTheme } from "next-themes";

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
  clientId?: string;
  leadId?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CATEGORIES = [
  "Brand Identity", "Web Design", "Web Development", "E-Commerce",
  "SEO / GEO", "Full Service", "Consultation"
];

const DEFAULT_TAGS = [
  "Next.js", "React", "TypeScript", "TailwindCSS", "Firebase", "Vercel",
  "Framer Motion", "SEO", "GEO", "Branding", "Logo Design", "UI/UX",
  "Responsive", "CMS", "E-Commerce", "Stripe", "Analytics"
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

const initialFormState = {
  type: "project",
  title: "", category: "", url: "", tech: "", description: "", 
  imageUrl: "", order: 99, views: 0, date: new Date().toISOString(),
  orientation: "square", tags: [] as string[], hidden: false, featured: false,
  email: "", phone: "", company: "", status: "discovery", progress: 0, 
  nextMilestone: "proposal", dueDate: "", previewUrl: "", paymentUrl: "",
  invoiceStatus: "not_sent", clientTier: "standard", internalNotes: "",
  messages: [] as any[], assets: [] as any[], activityLog: [] as ActivityItem[]
};

// ============================================================================
// UTILITY FUNCTIONS
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

const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

const isSafari = () => {
  if (typeof window === 'undefined') return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

// ============================================================================
// COMPONENTS
// ============================================================================

function ToastNotification({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const styles = {
    success: { icon: <CheckCircle size={18} />, bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
    error: { icon: <AlertCircle size={18} />, bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
    info: { icon: <Bell size={18} />, bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
    warning: { icon: <AlertCircle size={18} />, bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" }
  };

  const style = styles[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`${style.bg} ${style.border} border rounded-xl p-4 flex items-center gap-3 shadow-xl backdrop-blur-sm`}
    >
      <span className={style.text}>{style.icon}</span>
      <p className="text-sm text-zinc-900 dark:text-white flex-grow">{toast.message}</p>
      <button onClick={onDismiss} className="text-zinc-900 dark:text-white/50 hover:text-zinc-900 dark:text-white">
        <X size={16} />
      </button>
    </motion.div>
  );
}

function StatCard({ 
  icon: Icon, label, value, color = "white", subtext, onClick 
}: { 
  icon: any; label: string; value: number | string; color?: string; subtext?: string; onClick?: () => void 
}) {
  const colors: Record<string, string> = {
    white: "text-zinc-900 dark:text-white",
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    blue: "text-blue-400",
    red: "text-red-400"
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-zinc-100 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 rounded-2xl p-5 ${onClick ? "cursor-pointer hover:border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900/80" : ""} transition-all`}
    >
      <Icon size={20} className="text-zinc-500 mb-3" />
      <p className={`text-3xl font-light ${colors[color]}`}>{value}</p>
      <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">{label}</p>
      {subtext && <p className="text-[10px] text-zinc-600 mt-1">{subtext}</p>}
    </div>
  );
}

function SmartDropdown({
  value, options, onChange, onAddNew, placeholder, label
}: {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  onAddNew?: (val: string) => void;
  placeholder?: string;
  label?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const showAddNew = onAddNew && search && !options.some(o => o.toLowerCase() === search.toLowerCase());

  return (
    <div ref={ref} className="relative">
      {label && <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">{label}</label>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-left text-zinc-900 dark:text-white flex justify-between items-center hover:border-zinc-600 transition-colors"
      >
        <span className={value ? "text-zinc-900 dark:text-white" : "text-zinc-500"}>{value || placeholder || "Select..."}</span>
        <ChevronDown size={16} className={`text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-zinc-300 dark:border-zinc-800">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-zinc-200 dark:bg-zinc-800 border-none rounded-lg p-2 text-sm text-zinc-900 dark:text-white outline-none placeholder:text-zinc-500"
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.map(option => (
                <button
                  key={option}
                  onClick={() => { onChange(option); setIsOpen(false); setSearch(""); }}
                  className={`w-full px-4 py-2.5 text-left text-sm hover:bg-zinc-200 dark:bg-zinc-800 transition-colors ${
                    option === value ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white" : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {option}
                </button>
              ))}
              {showAddNew && (
                <button
                  onClick={() => { onAddNew(search); onChange(search); setIsOpen(false); setSearch(""); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-emerald-400 hover:bg-zinc-200 dark:bg-zinc-800 flex items-center gap-2"
                >
                  <Plus size={14} /> Add &quot;{search}&quot;
                </button>
              )}
              {filtered.length === 0 && !showAddNew && (
                <p className="px-4 py-3 text-sm text-zinc-500 text-center">No results</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TagSelector({
  selected, options, onChange, onAddNew
}: {
  selected: string[];
  options: string[];
  onChange: (tags: string[]) => void;
  onAddNew?: (tag: string) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  
  const addTag = (tag: string) => {
    if (tag && !selected.includes(tag)) {
      onChange([...selected, tag]);
      if (!options.includes(tag) && onAddNew) onAddNew(tag);
    }
    setInputValue("");
  };

  const removeTag = (tag: string) => {
    onChange(selected.filter(t => t !== tag));
  };

  const filtered = options.filter(o => 
    o.toLowerCase().includes(inputValue.toLowerCase()) && !selected.includes(o)
  );

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Tags</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {selected.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs px-2.5 py-1.5 rounded-lg">
            {tag}
            <button onClick={() => removeTag(tag)} className="text-zinc-500 hover:text-zinc-900 dark:text-white">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(inputValue); } }}
          placeholder="Add tags..."
          className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-sm text-zinc-900 dark:text-white outline-none placeholder:text-zinc-500 focus:border-zinc-600"
        />
        {inputValue && (
          <div className="absolute z-40 w-full mt-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl shadow-xl max-h-32 overflow-y-auto">
            {filtered.slice(0, 5).map(tag => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="w-full px-3 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-800"
              >
                {tag}
              </button>
            ))}
            {!options.includes(inputValue) && inputValue && (
              <button
                onClick={() => addTag(inputValue)}
                className="w-full px-3 py-2 text-left text-sm text-emerald-400 hover:bg-zinc-200 dark:bg-zinc-800 flex items-center gap-2"
              >
                <Plus size={12} /> Add &quot;{inputValue}&quot;
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityLog({ activities }: { activities: ActivityItem[] }) {
  if (!activities || activities.length === 0) {
    return <p className="text-zinc-500 text-sm italic text-center py-4">No activity yet</p>;
  }

  const icons: Record<string, any> = {
    message: MessageSquare,
    file: Paperclip,
    phase: Activity,
    invoice: DollarSign,
    update: RefreshCw
  };

  return (
    <div className="space-y-2 max-h-48 overflow-y-auto">
      {activities.slice(0, 10).map((activity, i) => {
        const Icon = icons[activity.type] || Activity;
        return (
          <div key={i} className="flex items-start gap-3 text-sm p-2 rounded-lg hover:bg-zinc-200 dark:bg-zinc-800/30">
            <Icon size={14} className="text-zinc-500 mt-0.5 flex-shrink-0" />
            <div className="flex-grow min-w-0">
              <p className="text-zinc-700 dark:text-zinc-300 text-xs">{activity.message}</p>
              <p className="text-[10px] text-zinc-600">{new Date(activity.timestamp).toLocaleDateString()}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminPage() {
  const router = useRouter();
const { resolvedTheme, setTheme } = useTheme();

const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);


  
  // Auth & UI State
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "projects" | "clients" | "inbox" | "blog">("overview");
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [phases, setPhases] = useState<Phase[]>(DEFAULT_PHASES);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [tags, setTags] = useState<string[]>(DEFAULT_TAGS);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<any>(initialFormState);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  
  // View State
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Notification State
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("default");
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistoryItem[]>([]);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  
  // Message Input
  const [newMessage, setNewMessage] = useState("");

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
  // COMPUTED VALUES
  // ============================================================================
  
  const activeClients = clients.filter(c => c.status !== "live" && c.status !== "maintenance");
  const completedProjects = clients.filter(c => c.status === "live");
  const pendingInvoices = clients.filter(c => c.invoiceStatus === "pending" || c.invoiceStatus === "overdue");
  const visibleProjects = projects.filter(p => !p.hidden);
  const featuredProjects = projects.filter(p => p.featured);
  const unreadNotifications = notificationHistory.filter(n => !n.read).length;
  
  const filteredProjects = projects
    .filter(p => !searchQuery || 
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // ============================================================================
  // AUTH & DATA FETCHING
  // ============================================================================

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const allowed = ["talormayde@gmail.com", "bttbmgmt@gmail.com"];
        if (allowed.includes(currentUser.email || "")) {
          setUser(currentUser);
          fetchData();
          loadNotificationSettings(currentUser.uid);
        } else {
          router.push("/");
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    } else {
      setNotificationPermission("unsupported");
    }
  }, []);

  // Real-time clients listener
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, "clients"), (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClients(clientsData);
    });
    return () => unsubscribe();
  }, [user]);

  const fetchData = async () => {
    try {
      const [projectsSnap, leadsSnap, postsSnap] = await Promise.all([
        getDocs(collection(db, "projects")),
        getDocs(collection(db, "leads")),
        getDocs(collection(db, "posts"))
      ]);
      
      setProjects(projectsSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
      setLeads(leadsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setBlogPosts(postsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error fetching data:", error);
      addToast("error", "Failed to load data");
    }
  };

  const fetchLeads = async () => {
    const snap = await getDocs(collection(db, "leads"));
    setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  // ============================================================================
  // NOTIFICATION FUNCTIONS
  // ============================================================================

  const loadNotificationSettings = async (uid: string) => {
    try {
      const settingsDoc = await getDoc(doc(db, "settings", `notifications_${uid}`));
      if (settingsDoc.exists()) {
        setNotificationSettings(settingsDoc.data() as NotificationSettings);
      }
      
      const historyDoc = await getDoc(doc(db, "notificationHistory", uid));
      if (historyDoc.exists()) {
        setNotificationHistory(historyDoc.data().items || []);
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    }
  };

  const saveNotificationSettings = async (settings: NotificationSettings) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "settings", `notifications_${user.uid}`), settings);
    } catch (error) {
      console.error("Error saving notification settings:", error);
    }
  };

  const requestNotificationPermission = async () => {
    // Check for iOS/Safari limitations
    if (isIOS() && !window.matchMedia('(display-mode: standalone)').matches) {
      addToast("warning", "On iOS, add this site to your Home Screen first to enable notifications");
      return;
    }

    if (isSafari() && !('serviceWorker' in navigator)) {
      addToast("warning", "Push notifications require a newer browser version");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        const messaging = await getFirebaseMessaging();
        if (!messaging) {
          addToast("error", "Push notifications not supported in this browser");
          return;
        }

        // Register service worker
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        
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
            userAgent: navigator.userAgent.substring(0, 100)
          });

          // Update settings
          const newSettings = { ...notificationSettings, enabled: true };
          setNotificationSettings(newSettings);
          await saveNotificationSettings(newSettings);

          // Setup foreground handler
          onMessage(messaging, (payload) => {
            if (notificationSettings.soundEnabled) playNotificationSound();
            
            const newNotification: NotificationHistoryItem = {
              id: Date.now().toString(),
              title: payload.notification?.title || "New Notification",
              body: payload.notification?.body || "",
              timestamp: new Date().toISOString(),
              read: false,
              type: payload.data?.type || "general",
              clientId: payload.data?.clientId,
              leadId: payload.data?.leadId
            };
            
            setNotificationHistory(prev => [newNotification, ...prev].slice(0, 50));
            addToast("info", newNotification.body);
          });

          addToast("success", "Notifications enabled!");
        }
      } else if (permission === "denied") {
        addToast("error", "Notifications blocked. Enable in browser settings.");
      }
    } catch (error) {
      console.error("Notification setup error:", error);
      addToast("error", "Failed to enable notifications");
    }
  };

  const disableNotifications = async () => {
    const newSettings = { ...notificationSettings, enabled: false };
    setNotificationSettings(newSettings);
    await saveNotificationSettings(newSettings);
    setFcmToken(null);
    addToast("info", "Notifications disabled");
  };

  const handleNotificationClick = (notification: NotificationHistoryItem) => {
    // Mark as read
    const updated = notificationHistory.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    );
    setNotificationHistory(updated);
    
    // Save to Firestore
    if (user) {
      setDoc(doc(db, "notificationHistory", user.uid), { items: updated });
    }

    // Route based on type
    if (notification.type === "newLead" || notification.type === "lead") {
      setTab("inbox");
      setShowNotificationPanel(false);
      setSidebarOpen(false);
    } else if (notification.type === "clientMessage" || notification.type === "phaseChange" || notification.type === "invoiceUpdate" || notification.type === "fileUpload") {
      setTab("clients");
      setShowNotificationPanel(false);
      setSidebarOpen(false);
      
      // Find and select the client if we have the ID
      if (notification.clientId) {
        const client = clients.find(c => c.id === notification.clientId);
        if (client) setSelectedClient(client);
      }
    }
  };

  const markAllNotificationsRead = async () => {
    const updated = notificationHistory.map(n => ({ ...n, read: true }));
    setNotificationHistory(updated);
    if (user) {
      await setDoc(doc(db, "notificationHistory", user.uid), { items: updated });
    }
  };

  const clearNotificationHistory = async () => {
    setNotificationHistory([]);
    if (user) {
      await setDoc(doc(db, "notificationHistory", user.uid), { items: [] });
    }
  };

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  const getPhaseLabel = (phaseId: string) => phases.find(p => p.id === phaseId)?.label || phaseId;
  const getNextPhase = (currentPhaseId: string) => {
    const currentPhase = phases.find(p => p.id === currentPhaseId);
    if (!currentPhase) return null;
    return phases.find(p => p.order === currentPhase.order + 1);
  };

  const openNewModal = (type: "project" | "client" | "post") => {
    setNewItem({ ...initialFormState, type });
    setEditMode(false);
    setEditId(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: any, type: "project" | "client" | "post") => {
    if (type === "client") {
        setNewItem({ 
        ...item, 
        type,
        title: item.projectName || "",  // Map projectName to title for the form
        });
    } else {
        setNewItem({ ...item, type });
    }
    setEditMode(true);
    setEditId(item.id);
    setIsModalOpen(true);
    };

  const handleSave = async () => {
    setStatus("saving");
    try {
      const collectionName = newItem.type === "client" ? "clients" : newItem.type === "post" ? "posts" : "projects";
      
      const data = newItem.type === "project" ? {
        title: newItem.title,
        category: newItem.category,
        url: newItem.url,
        tech: newItem.tech,
        description: newItem.description,
        imageUrl: newItem.imageUrl,
        order: newItem.order,
        views: newItem.views || 0,
        date: newItem.date,
        orientation: newItem.orientation,
        tags: newItem.tags || [],
        hidden: newItem.hidden || false,
        featured: newItem.featured || false
      } : newItem.type === "client" ? {
        email: newItem.email || "",
        projectName: newItem.title || newItem.projectName || "",
        phone: newItem.phone || "",
        company: newItem.company || "",
        status: newItem.status || "discovery",
        progress: newItem.progress || 0,
        nextMilestone: newItem.nextMilestone || "proposal",
        dueDate: newItem.dueDate || "",
        previewUrl: newItem.previewUrl || "",
        paymentUrl: newItem.paymentUrl || "",
        invoiceStatus: newItem.invoiceStatus || "not_sent",
        clientTier: newItem.clientTier || "standard",
        internalNotes: newItem.internalNotes || "",
        messages: newItem.messages || [],
        assets: newItem.assets || [],
        activityLog: newItem.activityLog || []
        } : {
        title: newItem.title,
        category: newItem.category,
        content: newItem.description,
        date: newItem.date
      };

      if (editMode && editId) {
        await updateDoc(doc(db, collectionName, editId), data);
        addToast("success", "Updated successfully");
        
        // Update selectedClient if we just edited it
        if (newItem.type === "client" && selectedClient?.id === editId) {
            setSelectedClient({ ...selectedClient, ...data });
        }
        } else {
        await addDoc(collection(db, collectionName), data);
        addToast("success", "Created successfully");
      }

      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving:", error);
      addToast("error", "Failed to save");
    }
    setStatus("idle");
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      await deleteDoc(doc(db, collectionName, id));
      addToast("success", "Deleted successfully");
      fetchData();
      if (selectedClient?.id === id) setSelectedClient(null);
    } catch (error) {
      addToast("error", "Failed to delete");
    }
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setStatus("saving");
    try {
      const storageRef = ref(storage, `projects/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setNewItem({ ...newItem, imageUrl: url });
      addToast("success", "Image uploaded");
    } catch (error) {
      addToast("error", "Upload failed");
    }
    setStatus("idle");
  };

  const moveProject = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= projects.length) return;

    const reordered = [...projects];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];

    const updates = reordered.map((p, i) => updateDoc(doc(db, "projects", p.id), { order: i }));
    await Promise.all(updates);
    
    setProjects(reordered.map((p, i) => ({ ...p, order: i })));
  };

  const toggleVisibility = async (project: any) => {
    await updateDoc(doc(db, "projects", project.id), { hidden: !project.hidden });
    setProjects(projects.map(p => p.id === project.id ? { ...p, hidden: !p.hidden } : p));
  };

  const toggleFeatured = async (project: any) => {
    await updateDoc(doc(db, "projects", project.id), { featured: !project.featured });
    setProjects(projects.map(p => p.id === project.id ? { ...p, featured: !p.featured } : p));
  };

  // Client-specific functions
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedClient) return;
    
    const message = {
      sender: "admin",
      text: newMessage,
      timestamp: new Date().toISOString()
    };
    
    const updatedMessages = [...(selectedClient.messages || []), message];
    await updateDoc(doc(db, "clients", selectedClient.id), { messages: updatedMessages });
    
    setSelectedClient({ ...selectedClient, messages: updatedMessages });
    setNewMessage("");
  };

  const updateClientPhase = async (clientId: string, newPhase: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const phaseObj = phases.find(p => p.id === newPhase);
    const progress = phaseObj ? Math.round((phaseObj.order / phases.length) * 100) : client.progress;
    const nextPhase = getNextPhase(newPhase);

    const activityLog = [
      ...(client.activityLog || []),
      {
        type: "phase",
        message: `Phase changed to ${getPhaseLabel(newPhase)}`,
        timestamp: new Date().toISOString(),
        by: "admin"
      }
    ];

    await updateDoc(doc(db, "clients", clientId), {
      status: newPhase,
      progress,
      nextMilestone: nextPhase?.id || client.nextMilestone,
      activityLog
    });

    if (selectedClient?.id === clientId) {
      setSelectedClient({ ...selectedClient, status: newPhase, progress, activityLog });
    }
  };

  const uploadAsset = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedClient || !e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    setStatus("saving");
    
    try {
      const storageRef = ref(storage, `clients/${selectedClient.id}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      const newAsset = {
        name: file.name,
        url,
        uploadedAt: new Date().toISOString(),
        uploader: "admin"
      };
      
      const updatedAssets = [...(selectedClient.assets || []), newAsset];
      await updateDoc(doc(db, "clients", selectedClient.id), { assets: updatedAssets });
      
      setSelectedClient({ ...selectedClient, assets: updatedAssets });
      addToast("success", "File uploaded");
    } catch (error) {
      addToast("error", "Upload failed");
    }
    setStatus("idle");
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-zinc-300 dark:border-white/20 border-t-zinc-900 dark:border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastNotification key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 flex items-center justify-center gap-2">
          <WifiOff size={14} className="text-amber-400" />
          <span className="text-xs text-amber-400">You&apos;re offline - changes may not save</span>
        </div>
      )}

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white">
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-sm font-light tracking-tight">TALORMAYDE</h1>
          <p className="text-[8px] font-mono text-zinc-600 uppercase tracking-widest text-center">Command Center</p>
        </div>
        <button 
          onClick={() => setShowNotificationPanel(true)} 
          className="p-2 -mr-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white relative"
        >
          <Bell size={20} />
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full text-[10px] flex items-center justify-center">
              {unreadNotifications}
            </span>
          )}
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 z-50 flex flex-col"
            >
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-light tracking-tight">TALORMAYDE</h1>
                  <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Command Center</p>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <nav className="flex-1 p-4 space-y-1">
                {[
                  { id: "overview", label: "Overview", icon: Home },
                  { id: "projects", label: "Work", icon: Briefcase },
                  { id: "clients", label: "Clients", icon: Users },
                  { id: "inbox", label: "Inquiries", icon: Inbox, badge: leads.length },
                  { id: "blog", label: "Journal", icon: FileText },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setTab(item.id as any); setSelectedClient(null); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                      tab === item.id 
                        ? "bg-zinc-900/10 dark:bg-zinc-900/10 dark:bg-white/10 text-zinc-900 dark:text-white" 
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-zinc-900/5 dark:bg-zinc-900/5 dark:bg-white/5"
                    }`}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto w-5 h-5 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              <div className="p-4 border-t border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-900/10 dark:bg-zinc-900/10 dark:bg-white/10 flex items-center justify-center text-xs font-mono">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <p className="text-xs text-zinc-900 dark:text-white truncate">{user?.email}</p>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Director</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                <button 
                    onClick={() => { signOut(auth); router.push("/"); }} 
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:text-red-400 text-xs transition-colors rounded-lg hover:bg-zinc-900/5 dark:bg-zinc-900/5 dark:bg-white/5"
                >
                    <LogOut size={14} /> Sign Out
                </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-white dark:bg-zinc-950/80 backdrop-blur-sm border-r border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 flex-col z-30">
        <div className="p-6">
          <h1 className="text-lg font-light tracking-tight">TALORMAYDE</h1>
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Command Center</p>
        </div>

        <div className="px-4 mb-4">
          <button
            onClick={() => {}}
            className="w-full flex items-center gap-3 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-800 rounded-xl text-sm text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 hover:text-zinc-600 dark:text-zinc-400 transition-all"
          >
            <Search size={16} />
            <span className="flex-grow text-left">Search...</span>
            <kbd className="text-[10px] bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded">⌘K</kbd>
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1">
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
                  ? "bg-zinc-900/10 dark:bg-zinc-900/10 dark:bg-white/10 text-zinc-900 dark:text-white" 
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-zinc-900/5 dark:bg-zinc-900/5 dark:bg-white/5"
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-emerald-500 text-black text-[10px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50">
          <button
            onClick={() => setShowNotificationPanel(!showNotificationPanel)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
              showNotificationPanel 
                ? "bg-zinc-900/10 dark:bg-zinc-900/10 dark:bg-white/10 text-zinc-900 dark:text-white" 
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white hover:bg-zinc-900/5 dark:bg-zinc-900/5 dark:bg-white/5"
            }`}
          >
            <Bell size={18} />
            <span>Notifications</span>
            {unreadNotifications > 0 && (
              <span className="ml-auto w-5 h-5 rounded-full bg-blue-500 text-zinc-900 dark:text-white text-[10px] font-bold flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
            {notificationSettings.enabled && unreadNotifications === 0 && (
              <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>
        </div>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-zinc-900/10 dark:bg-zinc-900/10 dark:bg-white/10 flex items-center justify-center text-xs font-mono">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-grow overflow-hidden">
              <p className="text-xs text-zinc-900 dark:text-white truncate">{user?.email}</p>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Director</p>
            </div>
            {isOnline ? <Wifi size={12} className="text-emerald-500" /> : <WifiOff size={12} className="text-amber-400" />}
          </div>
          <div className="flex items-center gap-2">
        <button 
            onClick={() => { signOut(auth); router.push("/"); }} 
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-zinc-600 dark:text-zinc-400 hover:text-red-400 text-xs transition-colors rounded-lg hover:bg-zinc-900/5 dark:bg-zinc-900/5 dark:bg-white/5"
        >
            <LogOut size={14} /> Sign Out
        </button>
        </div>
        </div>
      </aside>

      {/* Notification Panel */}
      <AnimatePresence>
        {showNotificationPanel && (
          <>
            {/* Mobile overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotificationPanel(false)}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
            />
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 z-50 flex flex-col lg:left-64 lg:right-auto lg:w-80"
            >
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 flex items-center justify-between">
                <h3 className="text-lg font-light">Notifications</h3>
                <button onClick={() => setShowNotificationPanel(false)} className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Permission Status */}
                <div className="p-4 bg-zinc-100 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Push Notifications</span>
                    <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded ${
                      notificationPermission === "granted" && notificationSettings.enabled
                        ? "bg-emerald-500/20 text-emerald-400"
                        : notificationPermission === "denied"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                    }`}>
                      {notificationPermission === "granted" && notificationSettings.enabled ? "Active" : notificationPermission === "denied" ? "Blocked" : "Inactive"}
                    </span>
                  </div>

                  {notificationPermission === "unsupported" ? (
                    <p className="text-xs text-zinc-500">Push notifications are not supported in this browser.</p>
                  ) : notificationPermission === "denied" ? (
                    <p className="text-xs text-zinc-500">Notifications are blocked. Enable them in your browser settings.</p>
                  ) : notificationPermission === "granted" && notificationSettings.enabled ? (
                    <button
                      onClick={disableNotifications}
                      className="w-full py-2.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors"
                    >
                      Disable Notifications
                    </button>
                  ) : (
                    <button
                      onClick={requestNotificationPermission}
                      className="w-full py-2.5 bg-white text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                    >
                      Enable Notifications
                    </button>
                  )}

                  {isIOS() && !window.matchMedia('(display-mode: standalone)').matches && (
                    <p className="text-[10px] text-amber-400 mt-2">
                      📱 For iOS: Add to Home Screen first
                    </p>
                  )}
                </div>

                {/* Preferences */}
                {notificationSettings.enabled && (
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-1">Preferences</h4>
                    {[
                      { key: "newLeads", label: "New Inquiries", icon: Mail },
                      { key: "clientMessages", label: "Client Messages", icon: MessageSquare },
                      { key: "phaseChanges", label: "Phase Updates", icon: Activity },
                      { key: "invoiceUpdates", label: "Invoice Activity", icon: DollarSign },
                      { key: "soundEnabled", label: "Sound Effects", icon: Volume2 }
                    ].map(item => (
                      <div key={item.key} className="flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50">
                        <item.icon size={14} className="text-zinc-500" />
                        <span className="flex-grow text-sm text-zinc-700 dark:text-zinc-300">{item.label}</span>
                        <button
                          onClick={() => {
                            const newSettings = { ...notificationSettings, [item.key]: !notificationSettings[item.key as keyof NotificationSettings] };
                            setNotificationSettings(newSettings);
                            saveNotificationSettings(newSettings);
                          }}
                          className={`w-10 h-5 rounded-full transition-colors relative ${
                            notificationSettings[item.key as keyof NotificationSettings] ? 'bg-emerald-600' : 'bg-zinc-700'
                          }`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${
                            notificationSettings[item.key as keyof NotificationSettings] ? 'left-5' : 'left-0.5'
                          }`} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Test Button */}
                {notificationSettings.enabled && (
                  <button
                    onClick={() => {
                      if (Notification.permission === "granted") {
                        new Notification("TALORMAYDE", { body: "Push notifications are working!", icon: "/icon-192.png" });
                        if (notificationSettings.soundEnabled) playNotificationSound();
                        addToast("success", "Test notification sent!");
                      }
                    }}
                    className="w-full py-2.5 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-zinc-100 dark:bg-zinc-900 hover:text-zinc-900 dark:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap size={14} /> Test Notification
                  </button>
                )}

                {/* History */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h4 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">History</h4>
                    {notificationHistory.length > 0 && (
                      <div className="flex gap-3">
                        <button onClick={markAllNotificationsRead} className="text-[10px] text-blue-400 hover:text-blue-300">Mark read</button>
                        <button onClick={clearNotificationHistory} className="text-[10px] text-zinc-500 hover:text-zinc-600 dark:text-zinc-400">Clear</button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {notificationHistory.length === 0 ? (
                      <p className="text-center text-zinc-600 py-8 text-sm italic">No notifications yet</p>
                    ) : (
                      notificationHistory.slice(0, 20).map(n => (
                        <button
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`w-full text-left p-3 rounded-xl border transition-all hover:bg-zinc-200 dark:bg-zinc-800/50 ${
                            n.read ? "bg-zinc-900/30 border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/30" : "bg-zinc-100 dark:bg-zinc-900/60 border-zinc-300 dark:border-zinc-700/50"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                            <div className="flex-grow min-w-0">
                              <p className="text-sm text-zinc-900 dark:text-white truncate">{n.title}</p>
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5 line-clamp-2">{n.body}</p>
                              <p className="text-[10px] text-zinc-600 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                            </div>
                            <ChevronRight size={14} className="text-zinc-600 flex-shrink-0 mt-1" />
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* FCM Token */}
                {fcmToken && (
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50">
                    <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mb-2 px-1">Device Token</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={fcmToken.substring(0, 20) + "..."}
                        readOnly
                        className="flex-grow bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg p-2 text-[10px] text-zinc-500 font-mono"
                      />
                      <button
                        onClick={() => { navigator.clipboard.writeText(fcmToken); addToast("success", "Token copied!"); }}
                        className="p-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-white transition-colors"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className={`pt-16 lg:pt-0 lg:ml-64 min-h-screen transition-all ${showNotificationPanel ? "lg:ml-[544px]" : ""}`}>
        <div className="p-4 lg:p-8">
          
          {/* ============ OVERVIEW TAB ============ */}
          {tab === "overview" && (
            <div className="max-w-6xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl lg:text-3xl font-light mb-2">Welcome back</h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">Here&apos;s what&apos;s happening with your studio.</p>
              </div>

              {/* Stats Grid - Responsive */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
                <StatCard icon={Users} label="Active Clients" value={activeClients.length} color="white" onClick={() => setTab("clients")} />
                <StatCard icon={CheckCircle} label="Completed" value={completedProjects.length} color="emerald" />
                <StatCard icon={DollarSign} label="Pending Invoices" value={pendingInvoices.length} color={pendingInvoices.length > 0 ? "amber" : "white"} subtext={pendingInvoices.length > 0 ? "Needs attention" : "All clear"} />
                <StatCard icon={Inbox} label="New Inquiries" value={leads.length} color={leads.length > 0 ? "blue" : "white"} onClick={() => setTab("inbox")} />
              </div>

              {/* Quick Actions - Responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-4 mb-8">
                <button 
                  onClick={() => { setTab("clients"); openNewModal("client"); }}
                  className="p-5 lg:p-6 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 rounded-2xl hover:border-zinc-300 dark:border-zinc-700 transition-all text-left group"
                >
                  <Plus size={20} className="mb-3 text-emerald-400" />
                  <h3 className="font-light mb-1 group-hover:text-zinc-900 dark:text-white transition-colors">New Client</h3>
                  <p className="text-xs text-zinc-500">Start a new project</p>
                </button>
                <button 
                  onClick={() => { setTab("projects"); openNewModal("project"); }}
                  className="p-5 lg:p-6 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 rounded-2xl hover:border-zinc-300 dark:border-zinc-700 transition-all text-left group"
                >
                  <Briefcase size={20} className="mb-3 text-blue-400" />
                  <h3 className="font-light mb-1 group-hover:text-zinc-900 dark:text-white transition-colors">Add Work</h3>
                  <p className="text-xs text-zinc-500">Showcase a project</p>
                </button>
                <button 
                  onClick={() => { setTab("blog"); openNewModal("post"); }}
                  className="p-5 lg:p-6 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 rounded-2xl hover:border-zinc-300 dark:border-zinc-700 transition-all text-left group"
                >
                  <FileText size={20} className="mb-3 text-purple-400" />
                  <h3 className="font-light mb-1 group-hover:text-zinc-900 dark:text-white transition-colors">Write Post</h3>
                  <p className="text-xs text-zinc-500">Share your thoughts</p>
                </button>
              </div>

              {/* Recent Activity - Responsive */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                <div className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 rounded-2xl p-5 lg:p-6">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4">Active Projects</h3>
                  <div className="space-y-2">
                    {activeClients.slice(0, 5).map(client => (
                      <button 
                        key={client.id}
                        onClick={() => { setTab("clients"); setSelectedClient(client); }}
                        className="w-full flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl hover:bg-zinc-200 dark:bg-zinc-800/50 transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-zinc-900/5 dark:bg-zinc-900/5 dark:bg-white/5 flex items-center justify-center text-xs font-mono text-zinc-600 dark:text-zinc-400">
                          {client.progress || 0}%
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-sm text-zinc-900 dark:text-white truncate">{client.projectName}</p>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{getPhaseLabel(client.status)}</p>
                        </div>
                        <ChevronRight size={16} className="text-zinc-600 flex-shrink-0" />
                      </button>
                    ))}
                    {activeClients.length === 0 && (
                      <p className="text-zinc-500 text-sm text-center py-8 italic">No active projects</p>
                    )}
                  </div>
                </div>

                <div className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 rounded-2xl p-5 lg:p-6">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-4">Recent Inquiries</h3>
                  <div className="space-y-2">
                    {leads.slice(0, 5).map(lead => (
                      <button 
                        key={lead.id}
                        onClick={() => setTab("inbox")}
                        className="w-full flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-900/50 rounded-xl hover:bg-zinc-200 dark:bg-zinc-800/50 transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <Mail size={16} className="text-emerald-400" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-sm text-zinc-900 dark:text-white truncate">{lead.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{lead.email}</p>
                        </div>
                      </button>
                    ))}
                    {leads.length === 0 && (
                      <p className="text-zinc-500 text-sm text-center py-8 italic">No new inquiries</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ PROJECTS TAB ============ */}
          {tab === "projects" && (
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-light">Work</h2>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm">{projects.length} total • {visibleProjects.length} visible</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-grow sm:flex-grow-0">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-40 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-zinc-600"
                    />
                  </div>
                  <div className="hidden sm:flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1">
                    <button onClick={() => setViewMode("list")} className={`p-2 rounded ${viewMode === "list" ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white" : "text-zinc-500"}`}>
                      <List size={16} />
                    </button>
                    <button onClick={() => setViewMode("grid")} className={`p-2 rounded ${viewMode === "grid" ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white" : "text-zinc-500"}`}>
                      <LayoutGrid size={16} />
                    </button>
                  </div>
                  <button 
                    onClick={() => openNewModal("project")} 
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-zinc-200 transition-colors whitespace-nowrap"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>

              <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
                {filteredProjects.map((project, index) => (
                  <div 
                    key={project.id} 
                    className={`bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 rounded-xl p-4 hover:border-zinc-300 dark:border-zinc-700 transition-all group ${
                      viewMode === "grid" ? "" : "flex items-center gap-4"
                    } ${project.hidden ? "opacity-50" : ""}`}
                  >
                    {viewMode === "list" && (
                      <div className="hidden sm:flex gap-1">
                        <button onClick={() => moveProject(index, 'up')} disabled={index === 0} className="p-1.5 text-zinc-600 hover:text-zinc-900 dark:text-white disabled:opacity-30">
                          <ArrowUp size={14} />
                        </button>
                        <button onClick={() => moveProject(index, 'down')} disabled={index === projects.length - 1} className="p-1.5 text-zinc-600 hover:text-zinc-900 dark:text-white disabled:opacity-30">
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    )}
                    
                    {project.imageUrl && viewMode === "grid" && (
                      <div className="aspect-video bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-3 overflow-hidden relative">
                        <img src={project.imageUrl} alt="" className="w-full h-full object-cover" />
                        {project.hidden && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <EyeOff size={24} className="text-zinc-600 dark:text-zinc-400" />
                          </div>
                        )}
                        {project.featured && (
                          <div className="absolute top-2 right-2">
                            <Star size={16} className="text-amber-400 fill-amber-400" />
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-light text-zinc-900 dark:text-white truncate">{project.title}</h3>
                        {project.featured && viewMode === "list" && <Star size={14} className="text-amber-400 fill-amber-400 flex-shrink-0" />}
                      </div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">{project.category}</p>
                    </div>
                    
                    <div className="flex items-center gap-1 mt-3 lg:mt-0">
                      <button onClick={() => toggleFeatured(project)} className={`p-2 transition-colors ${project.featured ? "text-amber-400" : "text-zinc-600 hover:text-amber-400"}`}>
                        <Star size={14} className={project.featured ? "fill-current" : ""} />
                      </button>
                      <button onClick={() => toggleVisibility(project)} className={`p-2 transition-colors ${project.hidden ? "text-zinc-600" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white"}`}>
                        {project.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => openEdit(project, "project")} className="p-2 text-zinc-600 hover:text-zinc-900 dark:text-white transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete("projects", project.id)} className="p-2 text-zinc-600 hover:text-red-400 transition-colors">
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-light">Clients</h2>
                      <p className="text-zinc-600 dark:text-zinc-400 text-sm">{clients.length} total • {activeClients.length} active</p>
                    </div>
                    <button 
                      onClick={() => openNewModal("client")} 
                      className="flex items-center justify-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-zinc-200 transition-colors"
                    >
                      <Plus size={14} /> New Client
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {clients.map(client => (
                      <button
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 rounded-2xl p-5 hover:border-zinc-300 dark:border-zinc-700 transition-all text-left group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-grow min-w-0">
                            <h3 className="font-light text-zinc-900 dark:text-white truncate group-hover:text-zinc-900 dark:text-white">{client.projectName}</h3>
                            <p className="text-xs text-zinc-500 truncate">{client.email}</p>
                          </div>
                          <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded flex-shrink-0 ml-2 ${
                            client.clientTier === "vip" ? "bg-amber-500/20 text-amber-400" :
                            client.clientTier === "priority" ? "bg-blue-500/20 text-blue-400" :
                            "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                          }`}>
                            {client.clientTier}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                              <span>{getPhaseLabel(client.status)}</span>
                              <span>{client.progress || 0}%</span>
                            </div>
                            <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                                style={{ width: `${client.progress || 0}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded ${
                              client.invoiceStatus === "paid" ? "bg-emerald-500/20 text-emerald-400" :
                              client.invoiceStatus === "overdue" ? "bg-red-500/20 text-red-400" :
                              client.invoiceStatus === "pending" ? "bg-amber-500/20 text-amber-400" :
                              "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"
                            }`}>
                              {INVOICE_STATUSES.find(s => s.id === client.invoiceStatus)?.label || "Not Set"}
                            </span>
                            {client.messages?.length > 0 && (
                              <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                <MessageSquare size={10} /> {client.messages.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                /* Client Detail View */
                <div>
                  <button 
                    onClick={() => setSelectedClient(null)}
                    className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white mb-6 text-sm"
                  >
                    <ChevronDown className="rotate-90" size={16} /> Back to Clients
                  </button>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 rounded-2xl p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                          <div>
                            <h2 className="text-2xl font-light text-zinc-900 dark:text-white">{selectedClient.projectName}</h2>
                            <p className="text-zinc-600 dark:text-zinc-400 text-sm">{selectedClient.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(selectedClient, "client")} className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-zinc-700 transition-colors">
                              Edit
                            </button>
                            <button onClick={() => handleDelete("clients", selectedClient.id)} className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-colors">
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="mb-6">
                          <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                            <span>{getPhaseLabel(selectedClient.status)}</span>
                            <span>{selectedClient.progress || 0}%</span>
                          </div>
                          <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                              style={{ width: `${selectedClient.progress || 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Phase Selector */}
                        <div className="mb-6">
                          <label className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-2">Current Phase</label>
                          <div className="flex flex-wrap gap-2">
                            {phases.map(phase => (
                              <button
                                key={phase.id}
                                onClick={() => updateClientPhase(selectedClient.id, phase.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                                  selectedClient.status === phase.id
                                    ? "bg-white text-black font-bold"
                                    : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-700"
                                }`}
                              >
                                {phase.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-zinc-200 dark:bg-zinc-800/50 rounded-xl p-3">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Tier</p>
                            <p className="text-sm text-zinc-900 dark:text-white capitalize">{selectedClient.clientTier}</p>
                          </div>
                          <div className="bg-zinc-200 dark:bg-zinc-800/50 rounded-xl p-3">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Invoice</p>
                            <p className={`text-sm capitalize ${
                              selectedClient.invoiceStatus === "paid" ? "text-emerald-400" :
                              selectedClient.invoiceStatus === "overdue" ? "text-red-400" :
                              "text-zinc-900 dark:text-white"
                            }`}>
                              {INVOICE_STATUSES.find(s => s.id === selectedClient.invoiceStatus)?.label || "Not Set"}
                            </p>
                          </div>
                          <div className="bg-zinc-200 dark:bg-zinc-800/50 rounded-xl p-3">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Due Date</p>
                            <p className="text-sm text-zinc-900 dark:text-white">{selectedClient.dueDate || "Not set"}</p>
                          </div>
                          <div className="bg-zinc-200 dark:bg-zinc-800/50 rounded-xl p-3">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Messages</p>
                            <p className="text-sm text-zinc-900 dark:text-white">{selectedClient.messages?.length || 0}</p>
                          </div>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 rounded-2xl p-6">
                        <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <MessageSquare size={14} /> Messages
                        </h3>
                        
                        <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                          {(!selectedClient.messages || selectedClient.messages.length === 0) ? (
                            <p className="text-zinc-500 text-sm text-center py-8 italic">No messages yet</p>
                          ) : (
                            selectedClient.messages.map((msg: any, i: number) => (
                              <div key={i} className={`p-3 rounded-xl max-w-[85%] ${
                                msg.sender === "admin" 
                                  ? "bg-zinc-900/10 dark:bg-zinc-900/10 dark:bg-white/10 ml-auto text-zinc-900 dark:text-white" 
                                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                              }`}>
                                <p className="text-sm">{msg.text}</p>
                                <p className="text-[10px] text-zinc-500 mt-1">
                                  {new Date(msg.timestamp).toLocaleString()}
                                </p>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Type a message..."
                            className="flex-grow bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl p-3 text-sm text-zinc-900 dark:text-white outline-none focus:border-zinc-600 placeholder:text-zinc-500"
                          />
                          <button 
                            onClick={sendMessage}
                            disabled={!newMessage.trim()}
                            className="px-4 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <Send size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                      {/* Links */}
                      <div className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 rounded-2xl p-5">
                        <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <ExternalLink size={14} /> Links
                        </h3>
                        <div className="space-y-2">
                          {selectedClient.previewUrl && (
                            <a href={selectedClient.previewUrl} target="_blank" className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:text-white p-2 rounded-lg hover:bg-zinc-200 dark:bg-zinc-800/50 transition-all">
                              <Globe size={14} /> Preview Site
                            </a>
                          )}
                          {selectedClient.paymentUrl && (
                            <a href={selectedClient.paymentUrl} target="_blank" className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:text-white p-2 rounded-lg hover:bg-zinc-200 dark:bg-zinc-800/50 transition-all">
                              <DollarSign size={14} /> Payment Link
                            </a>
                          )}
                          {!selectedClient.previewUrl && !selectedClient.paymentUrl && (
                            <p className="text-zinc-500 text-sm italic">No links added</p>
                          )}
                        </div>
                      </div>

                      {/* Deliverables */}
                      <div className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 rounded-2xl p-5">
                        <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Paperclip size={14} /> Deliverables
                        </h3>
                        <div className="space-y-2 max-h-32 overflow-y-auto mb-3">
                          {selectedClient.assets?.map((asset: any, i: number) => (
                            <div key={i} className="flex justify-between items-center bg-zinc-200 dark:bg-zinc-800/50 p-2.5 rounded-lg text-sm">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <Paperclip size={12} className={asset.uploader === 'admin' ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'} />
                                <span className="truncate text-zinc-700 dark:text-zinc-300 text-xs">{asset.name}</span>
                              </div>
                              <a href={asset.url} target="_blank" className="text-zinc-500 hover:text-zinc-900 dark:text-white">
                                <ExternalLink size={12} />
                              </a>
                            </div>
                          ))}
                        </div>
                        <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-center hover:border-zinc-600 transition-all relative cursor-pointer">
                          <input type="file" onChange={uploadAsset} className="absolute inset-0 opacity-0 cursor-pointer" />
                          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                            {status === 'saving' ? "Uploading..." : "+ Upload File"}
                          </span>
                        </div>
                      </div>

                      {/* Activity Log */}
                      <div className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 rounded-2xl p-5">
                        <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Activity size={14} /> Activity Log
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
              <div className="mb-6">
                <h2 className="text-2xl font-light">Inquiries</h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">{leads.length} total</p>
              </div>

              {leads.length === 0 ? (
                <div className="text-center py-16 bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 rounded-2xl">
                  <Inbox size={40} className="mx-auto mb-4 text-zinc-700" />
                  <p className="text-zinc-500 italic">No new inquiries.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leads.map((l) => (
                    <div key={l.id} className="bg-zinc-100 dark:bg-zinc-900/40 p-5 lg:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 group hover:border-zinc-300 dark:border-zinc-700 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                        <div>
                          <h3 className="text-xl font-light text-zinc-900 dark:text-white">{l.name}</h3>
                          <p className="text-zinc-600 dark:text-zinc-400 font-mono text-xs uppercase tracking-widest mt-1">{l.email}</p>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest border border-zinc-300 dark:border-zinc-700 px-2 py-1 rounded self-start">
                          New
                        </span>
                      </div>

                      <p className="text-zinc-700 dark:text-zinc-300 font-light leading-relaxed mb-6 italic border-l-2 border-zinc-300 dark:border-zinc-700 pl-4">
                        &ldquo;{l.message}&rdquo;
                      </p>

                      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50">
                        <button 
                          onClick={async () => {
                            if (!confirm(`Promote ${l.name} to Client?`)) return;
                            
                            await addDoc(collection(db, "clients"), {
                              email: l.email,
                              projectName: `${l.name} Project`,
                              status: "discovery",
                              progress: 0,
                              nextMilestone: "proposal",
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
                          className="text-emerald-400 hover:text-zinc-900 dark:text-white text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-emerald-500/10"
                        >
                          <Users size={14} /> Promote to Client
                        </button>

                        <button 
                          onClick={() => handleDelete("leads", l.id)} 
                          className="text-zinc-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 px-4 py-2 rounded-lg hover:bg-red-500/10"
                        >
                          <Archive size={14} /> Archive
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============ BLOG TAB ============ */}
          {tab === "blog" && (
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-light">Journal</h2>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm">{blogPosts.length} entries</p>
                </div>
                <button 
                  onClick={() => openNewModal("post")} 
                  className="flex items-center justify-center gap-2 bg-white text-black px-5 py-2.5 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-zinc-200 transition-colors"
                >
                  <Plus size={14} /> New Entry
                </button>
              </div>

              <div className="space-y-3">
                {blogPosts.map(p => (
                  <div key={p.id} className="bg-zinc-100 dark:bg-zinc-900/40 p-5 rounded-xl border border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-300 dark:border-zinc-700 transition-all">
                    <div>
                      <h3 className="font-light text-zinc-900 dark:text-white">{p.title}</h3>
                      <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mt-1">{p.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p, "post")} className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-white transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete("posts", p.id)} className="p-2 text-zinc-500 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Minimal Footer */}
        <footer className="fixed bottom-0 left-0 right-0 lg:left-64 py-3 px-6 bg-white dark:bg-zinc-950/80 backdrop-blur-sm border-t border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/30 z-20">
          <p className="text-center text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
            TALORMAYDE © {new Date().getFullYear()}
          </p>
        </footer>
      </main>

      {/* ============ UNIVERSAL MODAL ============ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 flex justify-between items-center">
                <h3 className="text-xl font-light">
                  {editMode ? "Edit" : "New"} {newItem.type === "client" ? "Client" : newItem.type === "post" ? "Journal Entry" : "Project"}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-zinc-900 dark:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-5">
                
                {/* CLIENT FIELDS */}
                {newItem.type === "client" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Client Email *</label>
                        <input 
                          className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:border-zinc-600 outline-none" 
                          value={newItem.email} 
                          onChange={(e) => setNewItem({...newItem, email: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Project Name</label>
                        <input 
                          className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:border-zinc-600 outline-none" 
                          value={newItem.title} 
                          onChange={(e) => setNewItem({...newItem, title: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SmartDropdown
                        label="Phase"
                        value={getPhaseLabel(newItem.status)}
                        options={phases.map(p => p.label)}
                        onChange={(label) => {
                          const phase = phases.find(p => p.label === label);
                          if (phase) {
                            const nextPhase = getNextPhase(phase.id);
                            setNewItem({
                              ...newItem, 
                              status: phase.id,
                              nextMilestone: nextPhase?.id || newItem.nextMilestone
                            });
                          }
                        }}
                      />
                      <SmartDropdown
                        label="Client Tier"
                        value={CLIENT_TIERS.find(t => t.id === newItem.clientTier)?.label || "Standard"}
                        options={CLIENT_TIERS.map(t => t.label)}
                        onChange={(label) => {
                          const tier = CLIENT_TIERS.find(t => t.label === label);
                          if (tier) setNewItem({...newItem, clientTier: tier.id});
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <SmartDropdown
                        label="Invoice Status"
                        value={INVOICE_STATUSES.find(s => s.id === newItem.invoiceStatus)?.label || "Not Sent"}
                        options={INVOICE_STATUSES.map(s => s.label)}
                        onChange={(label) => {
                          const status = INVOICE_STATUSES.find(s => s.label === label);
                          if (status) setNewItem({...newItem, invoiceStatus: status.id});
                        }}
                      />
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Due Date</label>
                        <input 
                          type="date"
                          className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:border-zinc-600 outline-none" 
                          value={newItem.dueDate} 
                          onChange={(e) => setNewItem({...newItem, dueDate: e.target.value})} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Preview URL</label>
                        <input 
                          className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:border-zinc-600 outline-none" 
                          value={newItem.previewUrl} 
                          onChange={(e) => setNewItem({...newItem, previewUrl: e.target.value})} 
                          placeholder="https://"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Payment URL</label>
                        <input 
                          className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:border-zinc-600 outline-none" 
                          value={newItem.paymentUrl} 
                          onChange={(e) => setNewItem({...newItem, paymentUrl: e.target.value})} 
                          placeholder="https://"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Internal Notes</label>
                      <textarea 
                        className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:border-zinc-600 outline-none min-h-[100px] resize-none" 
                        value={newItem.internalNotes} 
                        onChange={(e) => setNewItem({...newItem, internalNotes: e.target.value})}
                        placeholder="Private notes about this client..."
                      />
                    </div>
                  </>
                )}

                {/* PROJECT FIELDS */}
                {newItem.type === "project" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Title *</label>
                        <input 
                          className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:border-zinc-600 outline-none" 
                          value={newItem.title} 
                          onChange={(e) => setNewItem({...newItem, title: e.target.value})} 
                        />
                      </div>
                      <SmartDropdown
                        label="Category"
                        value={newItem.category}
                        options={categories}
                        onChange={(val) => setNewItem({...newItem, category: val})}
                        onAddNew={(val) => setCategories([...categories, val])}
                        placeholder="Select category..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">URL</label>
                      <input 
                        className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:border-zinc-600 outline-none" 
                        value={newItem.url} 
                        onChange={(e) => setNewItem({...newItem, url: e.target.value})} 
                        placeholder="https://"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Description</label>
                      <textarea 
                        className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:border-zinc-600 outline-none min-h-[100px] resize-none" 
                        value={newItem.description} 
                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                      />
                    </div>

                    <TagSelector
                      selected={newItem.tags || []}
                      options={tags}
                      onChange={(t) => setNewItem({...newItem, tags: t})}
                      onAddNew={(t) => setTags([...tags, t])}
                    />

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Cover Image</label>
                      <div className="flex gap-3">
                        {newItem.imageUrl && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-800">
                            <img src={newItem.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <label className="flex-grow border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-4 text-center hover:border-zinc-600 transition-all cursor-pointer">
                          <input type="file" accept="image/*" onChange={uploadImage} className="hidden" />
                          <ImageIcon size={20} className="mx-auto mb-2 text-zinc-500" />
                          <span className="text-xs text-zinc-500">{status === "saving" ? "Uploading..." : "Upload image"}</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newItem.hidden} 
                          onChange={(e) => setNewItem({...newItem, hidden: e.target.checked})}
                          className="w-4 h-4 rounded bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                        />
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Hidden</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={newItem.featured} 
                          onChange={(e) => setNewItem({...newItem, featured: e.target.checked})}
                          className="w-4 h-4 rounded bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                        />
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">Featured</span>
                      </label>
                    </div>
                  </>
                )}

                {/* POST FIELDS */}
                {newItem.type === "post" && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Title *</label>
                      <input 
                        className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:border-zinc-600 outline-none" 
                        value={newItem.title} 
                        onChange={(e) => setNewItem({...newItem, title: e.target.value})} 
                      />
                    </div>

                    <SmartDropdown
                      label="Category"
                      value={newItem.category}
                      options={["Design", "Development", "Business", "Industry", "Personal"]}
                      onChange={(val) => setNewItem({...newItem, category: val})}
                      placeholder="Select category..."
                    />

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Content</label>
                      <textarea 
                        className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg p-3 text-zinc-900 dark:text-white focus:border-zinc-600 outline-none min-h-[200px] resize-none" 
                        value={newItem.description} 
                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                        placeholder="Write your thoughts..."
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="p-5 border-t border-zinc-200 dark:border-zinc-300 dark:border-zinc-800/50 flex justify-end gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-5 py-2.5 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={status === "saving"}
                  className="px-6 py-2.5 bg-white text-black rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 disabled:opacity-50 transition-all"
                >
                  {status === "saving" ? "Saving..." : editMode ? "Update" : "Create"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}