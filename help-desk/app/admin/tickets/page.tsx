"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, ChevronDown, Clock, AlertCircle, CheckCircle2, XCircle,
  Eye, UserCheck, RefreshCw, X, Loader2, MessageSquare, Paperclip,
  Send, Calendar, ChevronUp, Wifi, Monitor, HardDrive, Mail, Settings,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Ticket {
  id: number;
  ticket_no: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  updated_at: string;
  raised_by: { id: number; first_name: string; last_name: string; department: string };
  assigned_to: { id: number; first_name: string; last_name: string } | null;
  comments_count: number;
  attachments_count: number;
}

interface IctPersonnel {
  id: number;
  first_name: string;
  last_name: string;
  category: string;
  availability_status: string;
  open_tickets_count: number;
}

interface Comment {
  id: number;
  author: string;
  body: string;
  created_at: string;
  is_internal: boolean;
}

// ── API ───────────────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://ict-help-desk-neon.onrender.com";

// ── Config maps — keys cover BOTH cases so API casing doesn't matter ──────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  open:        { label: "Open",        color: "#B91C1C", bg: "#FEF2F2", icon: AlertCircle  },
  OPEN:        { label: "Open",        color: "#B91C1C", bg: "#FEF2F2", icon: AlertCircle  },
  in_progress: { label: "In Progress", color: "#8B4513", bg: "#FDF6EE", icon: Clock        },
  IN_PROGRESS: { label: "In Progress", color: "#8B4513", bg: "#FDF6EE", icon: Clock        },
  resolved:    { label: "Resolved",    color: "#166534", bg: "#F0FDF4", icon: CheckCircle2 },
  RESOLVED:    { label: "Resolved",    color: "#166534", bg: "#F0FDF4", icon: CheckCircle2 },
  closed:      { label: "Closed",      color: "#7A5C44", bg: "#FDF8F2", icon: XCircle      },
  CLOSED:      { label: "Closed",      color: "#7A5C44", bg: "#FDF8F2", icon: XCircle      },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  low:      { label: "Low",      color: "#7A5C44", dot: "#C4A882" },
  LOW:      { label: "Low",      color: "#7A5C44", dot: "#C4A882" },
  medium:   { label: "Medium",   color: "#8B4513", dot: "#C8962E" },
  MEDIUM:   { label: "Medium",   color: "#8B4513", dot: "#C8962E" },
  high:     { label: "High",     color: "#B91C1C", dot: "#DC2626" },
  HIGH:     { label: "High",     color: "#B91C1C", dot: "#DC2626" },
  critical: { label: "Critical", color: "#7F1D1D", dot: "#991B1B" },
  CRITICAL: { label: "Critical", color: "#7F1D1D", dot: "#991B1B" },
};

const AVAIL_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  available:  { label: "Available", color: "#166534", dot: "#16A34A" },
  AVAILABLE:  { label: "Available", color: "#166534", dot: "#16A34A" },
  busy:       { label: "Busy",      color: "#8B4513", dot: "#C8962E" },
  BUSY:       { label: "Busy",      color: "#8B4513", dot: "#C8962E" },
  offline:    { label: "Offline",   color: "#7A5C44", dot: "#C4A882" },
  OFFLINE:    { label: "Offline",   color: "#7A5C44", dot: "#C4A882" },
  off_duty:   { label: "Off Duty",  color: "#7A5C44", dot: "#C4A882" },
  OFF_DUTY:   { label: "Off Duty",  color: "#7A5C44", dot: "#C4A882" },
  on_leave:   { label: "On Leave",  color: "#6D28D9", dot: "#7C3AED" },
  ON_LEAVE:   { label: "On Leave",  color: "#6D28D9", dot: "#7C3AED" },
};

// ── Safe getters — never crash on unknown values ──────────────────────────────

const FALLBACK_STATUS   = { label: "Unknown",   color: "#7A5C44", bg: "#FDF8F2", icon: AlertCircle };
const FALLBACK_PRIORITY = { label: "Unknown",   color: "#7A5C44", dot: "#C4A882" };
const FALLBACK_AVAIL    = { label: "Unknown",   color: "#7A5C44", dot: "#C4A882" };

function getStatus(s: string)   { return STATUS_CONFIG[s]   ?? STATUS_CONFIG[s?.toLowerCase()]   ?? FALLBACK_STATUS;   }
function getPriority(p: string) { return PRIORITY_CONFIG[p] ?? PRIORITY_CONFIG[p?.toLowerCase()] ?? FALLBACK_PRIORITY; }
function getAvail(a: string)    { return AVAIL_CONFIG[a]    ?? AVAIL_CONFIG[a?.toLowerCase()]    ?? FALLBACK_AVAIL;    }

// ── Category icons ────────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Hardware: HardDrive,
  Network:  Wifi,
  Software: Monitor,
  Email:    Mail,
};

// ── Mock fallback data (shown when API is unavailable) ────────────────────────

const MOCK_PERSONNEL: IctPersonnel[] = [
  { id: 1, first_name: "Brian",  last_name: "Odhiambo", category: "Hardware", availability_status: "BUSY",      open_tickets_count: 3 },
  { id: 2, first_name: "Ann",    last_name: "Wanjiku",   category: "Network",  availability_status: "AVAILABLE", open_tickets_count: 2 },
  { id: 3, first_name: "Ivy",    last_name: "Njuguna",   category: "Software", availability_status: "AVAILABLE", open_tickets_count: 1 },
  { id: 4, first_name: "Kevin",  last_name: "Mutua",     category: "Email",    availability_status: "OFFLINE",   open_tickets_count: 0 },
  { id: 5, first_name: "Stella", last_name: "Kimani",    category: "Hardware", availability_status: "AVAILABLE", open_tickets_count: 1 },
];

const MOCK_TICKETS: Ticket[] = [
  { id: 1,  ticket_no: "TKT-0041", subject: "Cannot access email",        description: "Outlook freezes on startup.",              status: "OPEN",        priority: "HIGH",     category: "Email",    created_at: "2025-06-09T08:14:00Z", updated_at: "2025-06-09T08:14:00Z", raised_by: { id: 10, first_name: "Grace", last_name: "Mwangi",  department: "Budget"      }, assigned_to: null,                                               comments_count: 0, attachments_count: 1 },
  { id: 2,  ticket_no: "TKT-0040", subject: "Printer on 4th floor offline", description: "HP LaserJet shows offline.",             status: "IN_PROGRESS", priority: "MEDIUM",   category: "Hardware", created_at: "2025-06-08T11:30:00Z", updated_at: "2025-06-09T07:00:00Z", raised_by: { id: 11, first_name: "James", last_name: "Kariuki", department: "Procurement" }, assigned_to: { id: 1, first_name: "Brian", last_name: "Odhiambo" }, comments_count: 3, attachments_count: 0 },
  { id: 3,  ticket_no: "TKT-0039", subject: "VPN disconnecting frequently", description: "VPN drops every 20–30 minutes.",         status: "OPEN",        priority: "CRITICAL", category: "Network",  created_at: "2025-06-08T09:05:00Z", updated_at: "2025-06-08T09:05:00Z", raised_by: { id: 12, first_name: "Faith", last_name: "Njoroge", department: "Debt Mgmt"   }, assigned_to: null,                                               comments_count: 1, attachments_count: 0 },
  { id: 4,  ticket_no: "TKT-0038", subject: "New staff laptop setup",       description: "New hire starting Monday.",              status: "IN_PROGRESS", priority: "MEDIUM",   category: "Hardware", created_at: "2025-06-07T14:20:00Z", updated_at: "2025-06-08T10:00:00Z", raised_by: { id: 13, first_name: "Peter", last_name: "Kamau",   department: "HR"          }, assigned_to: { id: 5, first_name: "Stella", last_name: "Kimani" }, comments_count: 2, attachments_count: 2 },
  { id: 5,  ticket_no: "TKT-0037", subject: "IFMIS login error",            description: "Getting account locked error.",          status: "CLOSED",      priority: "HIGH",     category: "Software", created_at: "2025-06-06T16:00:00Z", updated_at: "2025-06-07T11:45:00Z", raised_by: { id: 14, first_name: "Susan", last_name: "Achieng", department: "Accounts"    }, assigned_to: { id: 3, first_name: "Ivy",   last_name: "Njuguna" }, comments_count: 4, attachments_count: 0 },
];

const MOCK_COMMENTS: Comment[] = [
  { id: 1, author: "Brian Odhiambo", body: "Checked the printer driver — will update.", created_at: "2025-06-08T12:00:00Z", is_internal: false },
  { id: 2, author: "Brian Odhiambo", body: "Driver updated. Printer back online.",       created_at: "2025-06-09T07:00:00Z", is_internal: false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
}
function timeAgo(iso: string) {
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminTicketsPage() {
  const [tickets, setTickets]     = useState<Ticket[]>(MOCK_TICKETS);
  const [personnel, setPersonnel] = useState<IctPersonnel[]>(MOCK_PERSONNEL);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("all");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const [selected, setSelected]       = useState<Ticket | null>(null);
  const [comments, setComments]       = useState<Comment[]>([]);
  const [newComment, setNewComment]   = useState("");
  const [sendingComment, setSending]  = useState(false);

  const [assigning, setAssigning]   = useState<Ticket | null>(null);
  const [assignTarget, setTarget]   = useState<number | null>(null);
  const [savingAssign, setSavingA]  = useState(false);

  const [changingStatus, setChangingStatus] = useState<Ticket | null>(null);
  const [newStatus, setNewStatus]           = useState("");
  const [savingStatus, setSavingS]          = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, pRes] = await Promise.all([
        fetch(`${API}/tickets/`,        { credentials: "include" }),
        fetch(`${API}/ict-personnel/`,  { credentials: "include" }),
      ]);
      if (tRes.ok) { const d = await tRes.json(); setTickets(Array.isArray(d) ? d : d.tickets ?? MOCK_TICKETS); }
      if (pRes.ok) { const d = await pRes.json(); setPersonnel(Array.isArray(d) ? d : d.personnel ?? MOCK_PERSONNEL); }
    } catch { /* keep mock */ } finally { setLoading(false); }
  }, []);

  const fetchComments = useCallback(async (ticketId: number) => {
    try {
      const res = await fetch(`${API}/tickets/${ticketId}/comments`, { credentials: "include" });
      if (!res.ok) throw new Error();
      setComments(await res.json());
    } catch { setComments(MOCK_COMMENTS); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { void fetchAll(); }, 0);
    return () => clearTimeout(timer);
  }, [fetchAll]);

  const allCategories = Array.from(new Set([
    ...personnel.map(p => p.category),
    ...tickets.map(t => t.category),
  ])).filter(Boolean).sort();

  const filteredTickets = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchQ = !q ||
      (t.ticket_no ?? "").toLowerCase().includes(q) ||
      (t.subject ?? "").toLowerCase().includes(q) ||
      `${t.raised_by?.first_name ?? ""} ${t.raised_by?.last_name ?? ""}`.toLowerCase().includes(q);
    const matchS = statusFilter === "all" ||
      t.status === statusFilter ||
      t.status?.toLowerCase() === statusFilter;
    return matchQ && matchS;
  });

  const ticketsByCategory   = (cat: string) => filteredTickets.filter(t => t.category === cat);
  const personnelByCategory = (cat: string) => personnel.filter(p => p.category === cat);

  const totalOpen       = tickets.filter(t => ["open","OPEN"].includes(t.status)).length;
  const totalInProgress = tickets.filter(t => ["in_progress","IN_PROGRESS"].includes(t.status)).length;
  const totalResolved   = tickets.filter(t => ["resolved","RESOLVED"].includes(t.status)).length;
  const totalUnassigned = tickets.filter(t => !t.assigned_to && !["closed","CLOSED","resolved","RESOLVED"].includes(t.status)).length;

  const toggleCollapse = (cat: string) => setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));
  const openDetail = (t: Ticket) => { setSelected(t); fetchComments(t.id); };

  const handleAssign = async () => {
    if (!assigning || !assignTarget) return;
    setSavingA(true);
    try {
      const res = await fetch(`${API}/tickets/${assigning.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ assigned_to: assignTarget }),
      });
      const p = personnel.find(s => s.id === assignTarget);
      if (res.ok) {
        const updated: Ticket = await res.json();
        setTickets(prev => prev.map(t => t.id === assigning.id ? updated : t));
      } else {
        setTickets(prev => prev.map(t => t.id === assigning.id
          ? { ...t, assigned_to: p ? { id: p.id, first_name: p.first_name, last_name: p.last_name } : t.assigned_to }
          : t));
      }
    } catch {
      const p = personnel.find(s => s.id === assignTarget);
      setTickets(prev => prev.map(t => t.id === assigning.id
        ? { ...t, assigned_to: p ? { id: p.id, first_name: p.first_name, last_name: p.last_name } : t.assigned_to }
        : t));
    } finally { setSavingA(false); setAssigning(null); setTarget(null); }
  };

  const handleStatusChange = async () => {
    if (!changingStatus || !newStatus) return;
    setSavingS(true);
    try {
      await fetch(`${API}/tickets/${changingStatus.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
    } finally {
      setTickets(prev => prev.map(t => t.id === changingStatus.id ? { ...t, status: newStatus } : t));
      if (selected?.id === changingStatus.id) setSelected(prev => prev ? { ...prev, status: newStatus } : null);
      setSavingS(false); setChangingStatus(null); setNewStatus("");
    }
  };

  const handleComment = async () => {
    if (!selected || !newComment.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`${API}/tickets/${selected.id}/comments`, {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ body: newComment }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments(prev => [...prev, comment]);
      } else throw new Error();
    } catch {
      setComments(prev => [...prev, { id: Date.now(), author: "Admin", body: newComment, created_at: new Date().toISOString(), is_internal: false }]);
    } finally { setSending(false); setNewComment(""); }
  };

  // ── Status options for the change-status modal (uppercase to match API) ─────
  const STATUS_OPTIONS = [
    { value: "OPEN",        label: "Open"        },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "CLOSED",      label: "Closed"      },
  ];

  return (
    <>
      <style>{`
        :root {
          --brown-dark: #4A1E0A; --brown-main: #6B2D0F; --brown-mid: #8B4513;
          --gold: #C8962E; --gold-light: #E8B84B; --cream: #FDF8F2;
          --border: #E0D0C0; --text-main: #1A0F08; --text-sub: #7A5C44;
        }
        .tkt-root { padding: 28px 32px; min-height: 100vh; background: var(--cream); font-family: 'Inter', system-ui, sans-serif; }
        .tkt-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .tkt-header h1 { font-size: 1.35rem; font-weight: 700; color: var(--brown-dark); margin: 0 0 2px; }
        .tkt-header p  { font-size: 0.82rem; color: var(--text-sub); margin: 0; }
        .tkt-refresh-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #fff; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.82rem; font-weight: 600; color: var(--brown-main); cursor: pointer; transition: all 0.15s; }
        .tkt-refresh-btn:hover { border-color: var(--gold); color: var(--gold); }
        .tkt-strip { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .tkt-chip { background: #fff; border: 1.5px solid var(--border); border-radius: 8px; padding: 10px 18px; display: flex; flex-direction: column; min-width: 110px; }
        .tkt-chip-val { font-size: 1.4rem; font-weight: 800; color: var(--brown-dark); }
        .tkt-chip-label { font-size: 0.72rem; color: var(--text-sub); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
        .tkt-chip.red .tkt-chip-val  { color: #B91C1C; }
        .tkt-chip.gold .tkt-chip-val { color: var(--brown-mid); }
        .tkt-filters { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
        .tkt-search-wrap { position: relative; flex: 1; min-width: 220px; }
        .tkt-search-wrap svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-sub); }
        .tkt-search { width: 100%; padding: 9px 12px 9px 34px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.84rem; color: var(--text-main); background: #fff; outline: none; box-sizing: border-box; }
        .tkt-search:focus { border-color: var(--gold); }
        .tkt-select-wrap { position: relative; }
        .tkt-select-wrap svg { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-sub); }
        .tkt-select { appearance: none; padding: 9px 30px 9px 12px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.84rem; color: var(--text-main); background: #fff; cursor: pointer; outline: none; }
        .tkt-select:focus { border-color: var(--gold); }
        .tkt-section { background: #fff; border: 1.5px solid var(--border); border-radius: 12px; margin-bottom: 20px; overflow: hidden; }
        .tkt-section-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; cursor: pointer; user-select: none; border-bottom: 1.5px solid var(--border); }
        .tkt-section-header:hover { background: var(--cream); }
        .tkt-section-title-row { display: flex; align-items: center; gap: 10px; }
        .tkt-cat-icon { width: 34px; height: 34px; border-radius: 8px; background: #F5EDE3; display: flex; align-items: center; justify-content: center; color: var(--brown-main); flex-shrink: 0; }
        .tkt-cat-name { font-size: 1rem; font-weight: 700; color: var(--brown-dark); }
        .tkt-cat-counts { display: flex; gap: 6px; margin-top: 2px; }
        .tkt-cat-count { font-size: 0.73rem; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
        .tkt-section-right { display: flex; align-items: center; gap: 12px; }
        .tkt-divider { height: 1px; background: var(--border); }
        .tkt-tech-row { display: flex; gap: 8px; padding: 10px 20px; background: var(--cream); flex-wrap: wrap; align-items: center; }
        .tkt-tech-label { font-size: 0.72rem; font-weight: 700; color: var(--text-sub); text-transform: uppercase; letter-spacing: 0.5px; margin-right: 4px; }
        .tkt-tech-chip { display: flex; align-items: center; gap: 6px; padding: 5px 11px; background: #fff; border: 1.5px solid var(--border); border-radius: 20px; }
        .tkt-tech-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .tkt-tech-name { font-size: 0.79rem; font-weight: 600; color: var(--brown-dark); }
        .tkt-tech-load { font-size: 0.73rem; color: var(--text-sub); }
        .tkt-no-tech { font-size: 0.79rem; color: var(--text-sub); font-style: italic; }
        .tkt-table { width: 100%; border-collapse: collapse; }
        .tkt-table th { padding: 10px 16px; text-align: left; font-size: 0.71rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--text-sub); background: var(--cream); border-bottom: 1px solid var(--border); white-space: nowrap; }
        .tkt-table td { padding: 12px 16px; font-size: 0.84rem; color: var(--text-main); border-bottom: 1px solid var(--border); vertical-align: middle; }
        .tkt-table tr:last-child td { border-bottom: none; }
        .tkt-table tr:hover td { background: #FDF4EB; cursor: pointer; }
        .tkt-ticket-no { font-weight: 700; color: var(--brown-main); font-size: 0.78rem; }
        .tkt-subject { font-weight: 500; max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-main); }
        .tkt-meta { font-size: 0.73rem; color: var(--text-sub); margin-top: 2px; }
        .tkt-priority { display: flex; align-items: center; gap: 5px; font-size: 0.79rem; font-weight: 600; }
        .tkt-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .tkt-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
        .tkt-assignee { font-size: 0.8rem; font-weight: 500; color: var(--text-main); }
        .tkt-unassigned { font-size: 0.78rem; color: #B91C1C; font-style: italic; }
        .tkt-actions { display: flex; gap: 5px; }
        .tkt-btn-icon { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: 1.5px solid var(--border); background: #fff; cursor: pointer; color: var(--text-sub); transition: all 0.15s; }
        .tkt-btn-icon:hover { border-color: var(--gold); color: var(--brown-mid); }
        .tkt-empty { padding: 32px; text-align: center; color: var(--text-sub); font-size: 0.86rem; }
        .tkt-loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 60px; color: var(--text-sub); font-size: 0.88rem; }
        .tkt-overlay { position: fixed; inset: 0; background: rgba(74,30,10,0.4); z-index: 100; display: flex; justify-content: flex-end; }
        .tkt-drawer { width: 520px; max-width: 95vw; height: 100%; background: #fff; display: flex; flex-direction: column; overflow: hidden; animation: slideIn 0.2s ease; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .tkt-drawer-header { padding: 20px 24px; display: flex; align-items: flex-start; justify-content: space-between; background: var(--brown-dark); border-bottom: 3px solid var(--gold); }
        .tkt-drawer-header h2 { font-size: 0.98rem; font-weight: 700; color: #fff; margin: 0 0 4px; }
        .tkt-drawer-header p { font-size: 0.76rem; color: rgba(255,255,255,0.65); margin: 0; }
        .tkt-close-btn { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: 1.5px solid rgba(255,255,255,0.25); background: transparent; cursor: pointer; color: #fff; flex-shrink: 0; }
        .tkt-close-btn:hover { background: rgba(255,255,255,0.15); }
        .tkt-drawer-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 18px; background: var(--cream); }
        .tkt-detail-card { background: #fff; border: 1.5px solid var(--border); border-radius: 10px; padding: 16px; }
        .tkt-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .tkt-detail-item label { font-size: 0.71rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--gold); display: block; margin-bottom: 3px; }
        .tkt-detail-item span { font-size: 0.85rem; color: var(--brown-dark); font-weight: 600; }
        .tkt-desc-box { background: var(--cream); border: 1px solid var(--border); border-left: 3px solid var(--brown-mid); border-radius: 8px; padding: 12px; font-size: 0.84rem; color: var(--text-main); line-height: 1.6; }
        .tkt-section-lbl { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--brown-mid); margin-bottom: 8px; border-left: 3px solid var(--gold); padding-left: 8px; }
        .tkt-comment { padding: 10px 12px; background: #fff; border-radius: 8px; border: 1px solid var(--border); border-left: 3px solid var(--brown-main); }
        .tkt-comment-author { font-size: 0.77rem; font-weight: 700; color: var(--brown-dark); }
        .tkt-comment-time { font-size: 0.71rem; color: var(--text-sub); }
        .tkt-comment-body { font-size: 0.83rem; color: var(--text-main); margin-top: 4px; }
        .tkt-comment-input-row { display: flex; gap: 8px; }
        .tkt-comment-input { flex: 1; padding: 9px 12px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.84rem; resize: none; font-family: inherit; outline: none; color: var(--text-main); background: #fff; }
        .tkt-comment-input:focus { border-color: var(--gold); }
        .tkt-send-btn { padding: 9px 14px; background: var(--brown-dark); color: #fff; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 5px; font-size: 0.82rem; font-weight: 600; }
        .tkt-send-btn:hover { background: var(--gold); }
        .tkt-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .tkt-drawer-actions { display: flex; gap: 8px; }
        .tkt-action-btn { flex: 1; padding: 9px 14px; border: none; border-radius: 8px; font-size: 0.84rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .tkt-action-btn.primary   { background: var(--brown-dark); color: #fff; }
        .tkt-action-btn.primary:hover   { background: var(--brown-main); }
        .tkt-action-btn.secondary { background: var(--gold); color: #fff; }
        .tkt-action-btn.secondary:hover { background: var(--gold-light); }
        .tkt-modal-overlay { position: fixed; inset: 0; background: rgba(74,30,10,0.45); z-index: 200; display: flex; align-items: center; justify-content: center; }
        .tkt-modal { background: #fff; border-radius: 14px; width: 420px; max-width: 95vw; padding: 24px; animation: fadeUp 0.2s ease; border-top: 4px solid var(--brown-main); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .tkt-modal h3 { font-size: 1rem; font-weight: 700; color: var(--brown-dark); margin: 0 0 4px; }
        .tkt-modal p  { font-size: 0.81rem; color: var(--text-sub); margin: 0 0 16px; }
        .tkt-staff-list { display: flex; flex-direction: column; gap: 7px; margin-bottom: 18px; max-height: 260px; overflow-y: auto; }
        .tkt-staff-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 13px; border: 1.5px solid var(--border); border-radius: 8px; cursor: pointer; transition: all 0.15s; }
        .tkt-staff-item:hover { border-color: var(--gold); background: #FDF6EE; }
        .tkt-staff-item.selected { border-color: var(--brown-main); background: #F5EDE3; }
        .tkt-staff-name { font-size: 0.85rem; font-weight: 600; color: var(--brown-dark); }
        .tkt-staff-load { font-size: 0.75rem; }
        .tkt-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
        .tkt-modal-cancel  { padding: 8px 18px; border: 1.5px solid var(--border); background: #fff; border-radius: 8px; font-size: 0.84rem; font-weight: 600; color: var(--text-sub); cursor: pointer; }
        .tkt-modal-confirm { padding: 8px 18px; background: var(--brown-dark); color: #fff; border: none; border-radius: 8px; font-size: 0.84rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .tkt-modal-confirm:hover:not(:disabled) { background: var(--gold); }
        .tkt-modal-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
        .tkt-status-options { display: flex; flex-direction: column; gap: 7px; margin-bottom: 18px; }
        .tkt-status-opt { display: flex; align-items: center; justify-content: space-between; padding: 10px 13px; border: 1.5px solid var(--border); border-radius: 8px; cursor: pointer; transition: all 0.15s; }
        .tkt-status-opt:hover { border-color: var(--gold); background: #FDF6EE; }
        .tkt-status-opt.selected { border-color: var(--brown-main); background: #F5EDE3; }
        @media (max-width: 768px) { .tkt-root { padding: 16px; } .tkt-drawer { width: 100%; } }
      `}</style>

      <div className="tkt-root">
        {/* Header */}
        <div className="tkt-header">
          <div>
            <h1>Tickets by Category</h1>
            <p>Each section shows the responsible technician and their tickets</p>
          </div>
          <button className="tkt-refresh-btn" onClick={() => fetchAll()}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Strip */}
        <div className="tkt-strip">
          <div className="tkt-chip"><span className="tkt-chip-val">{tickets.length}</span><span className="tkt-chip-label">Total</span></div>
          <div className="tkt-chip red"><span className="tkt-chip-val">{totalOpen}</span><span className="tkt-chip-label">Open</span></div>
          <div className="tkt-chip gold"><span className="tkt-chip-val">{totalInProgress}</span><span className="tkt-chip-label">In Progress</span></div>
          <div className="tkt-chip"><span className="tkt-chip-val">{totalResolved}</span><span className="tkt-chip-label">Resolved</span></div>
          <div className="tkt-chip red"><span className="tkt-chip-val">{totalUnassigned}</span><span className="tkt-chip-label">Unassigned</span></div>
        </div>

        {/* Filters */}
        <div className="tkt-filters">
          <div className="tkt-search-wrap">
            <Search size={14} />
            <input className="tkt-search" placeholder="Search ticket no., subject, staff…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="tkt-select-wrap">
            <select className="tkt-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="CLOSED">Closed</option>
            </select>
            <ChevronDown size={13} />
          </div>
        </div>

        {loading && <div className="tkt-loading"><Loader2 size={18} /> Loading…</div>}

        {/* Category sections */}
        {!loading && allCategories.map(cat => {
          const catTickets   = ticketsByCategory(cat);
          const catPersonnel = personnelByCategory(cat);
          const openCount    = catTickets.filter(t => ["open","OPEN"].includes(t.status)).length;
          const inProgCount  = catTickets.filter(t => ["in_progress","IN_PROGRESS"].includes(t.status)).length;
          const isCollapsed  = collapsed[cat] ?? false;
          const CatIcon      = CATEGORY_ICONS[cat] ?? Settings;

          return (
            <div className="tkt-section" key={cat}>
              <div className="tkt-section-header" onClick={() => toggleCollapse(cat)}>
                <div className="tkt-section-title-row">
                  <div className="tkt-cat-icon"><CatIcon size={16} /></div>
                  <div>
                    <div className="tkt-cat-name">{cat}</div>
                    <div className="tkt-cat-counts">
                      {openCount > 0   && <span className="tkt-cat-count" style={{ color: "#B91C1C", background: "#FEF2F2" }}>{openCount} open</span>}
                      {inProgCount > 0 && <span className="tkt-cat-count" style={{ color: "#8B4513", background: "#FDF6EE" }}>{inProgCount} in progress</span>}
                      {catTickets.length === 0 && <span className="tkt-cat-count" style={{ color: "#7A5C44", background: "#FDF8F2" }}>No tickets</span>}
                    </div>
                  </div>
                </div>
                <div className="tkt-section-right">
                  <span style={{ fontSize: "0.78rem", color: "#7A5C44" }}>{catTickets.length} ticket{catTickets.length !== 1 ? "s" : ""}</span>
                  {isCollapsed ? <ChevronDown size={16} color="#7A5C44" /> : <ChevronUp size={16} color="#7A5C44" />}
                </div>
              </div>

              {!isCollapsed && (
                <>
                  <div className="tkt-tech-row">
                    <span className="tkt-tech-label">Technician{catPersonnel.length !== 1 ? "s" : ""}:</span>
                    {catPersonnel.length === 0
                      ? <span className="tkt-no-tech">No technician assigned to this category</span>
                      : catPersonnel.map(p => {
                          const av = getAvail(p.availability_status);
                          return (
                            <div className="tkt-tech-chip" key={p.id}>
                              <span className="tkt-tech-dot" style={{ background: av.dot }} />
                              <span className="tkt-tech-name">{p.first_name} {p.last_name}</span>
                              <span className="tkt-tech-load">· {p.open_tickets_count} open</span>
                            </div>
                          );
                        })
                    }
                  </div>
                  <div className="tkt-divider" />

                  {catTickets.length === 0
                    ? <div className="tkt-empty">No tickets in this category{search || statusFilter !== "all" ? " matching your filters" : ""}.</div>
                    : (
                      <table className="tkt-table">
                        <thead>
                          <tr>
                            <th>Ticket</th><th>Subject</th><th>Priority</th><th>Status</th>
                            <th>Raised By</th><th>Assigned To</th><th>Date</th><th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {catTickets.map(t => {
                            const sc = getStatus(t.status);
                            const pc = getPriority(t.priority);
                            const StatusIcon = sc.icon;
                            return (
                              <tr key={t.id} onClick={() => openDetail(t)}>
                                <td><div className="tkt-ticket-no">{t.ticket_no ?? `TKT-${String(t.id).padStart(4,"0")}`}</div></td>
                                <td>
                                  <div className="tkt-subject">{t.subject}</div>
                                  <div className="tkt-meta"><MessageSquare size={10} style={{ display: "inline", marginRight: 3 }} />{t.comments_count ?? 0}</div>
                                </td>
                                <td>
                                  <div className="tkt-priority" style={{ color: pc.color }}>
                                    <span className="tkt-dot" style={{ background: pc.dot }} />{pc.label}
                                  </div>
                                </td>
                                <td>
                                  <span className="tkt-badge" style={{ color: sc.color, background: sc.bg }}>
                                    <StatusIcon size={11} /> {sc.label}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ fontSize: "0.82rem", fontWeight: 500 }}>{t.raised_by?.first_name} {t.raised_by?.last_name}</div>
                                  <div className="tkt-meta">{t.raised_by?.department}</div>
                                </td>
                                <td>
                                  {t.assigned_to
                                    ? <div className="tkt-assignee">{t.assigned_to.first_name} {t.assigned_to.last_name}</div>
                                    : <div className="tkt-unassigned">Unassigned</div>}
                                </td>
                                <td style={{ fontSize: "0.78rem", color: "#7A5C44", whiteSpace: "nowrap" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}><Calendar size={11} /> {fmt(t.created_at)}</div>
                                  <div className="tkt-meta">{timeAgo(t.updated_at)}</div>
                                </td>
                                <td onClick={e => e.stopPropagation()}>
                                  <div className="tkt-actions">
                                    <button className="tkt-btn-icon" title="View"          onClick={() => openDetail(t)}><Eye size={13} /></button>
                                    <button className="tkt-btn-icon" title="Assign"        onClick={() => { setAssigning(t); setTarget(t.assigned_to?.id ?? null); }}><UserCheck size={13} /></button>
                                    <button className="tkt-btn-icon" title="Change Status" onClick={() => { setChangingStatus(t); setNewStatus(t.status); }}><RefreshCw size={13} /></button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )
                  }
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail drawer */}
      {selected && (() => {
        const sc = getStatus(selected.status);
        const pc = getPriority(selected.priority);
        const StatusIcon = sc.icon;
        return (
          <div className="tkt-overlay" onClick={() => setSelected(null)}>
            <div className="tkt-drawer" onClick={e => e.stopPropagation()}>
              <div className="tkt-drawer-header">
                <div>
                  <h2>{selected.ticket_no ?? `TKT-${String(selected.id).padStart(4,"0")}`} — {selected.subject}</h2>
                  <p>{selected.raised_by?.first_name} {selected.raised_by?.last_name} · {selected.raised_by?.department} · {fmt(selected.created_at)}</p>
                </div>
                <button className="tkt-close-btn" onClick={() => setSelected(null)}><X size={15} /></button>
              </div>
              <div className="tkt-drawer-body">
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  <span className="tkt-badge" style={{ color: sc.color, background: sc.bg }}><StatusIcon size={11} /> {sc.label}</span>
                  <span className="tkt-badge" style={{ color: pc.color, background: "#FDF8F2", border: `1px solid ${pc.dot}` }}><span className="tkt-dot" style={{ background: pc.dot }} />{pc.label}</span>
                  <span className="tkt-badge" style={{ color: "#6B2D0F", background: "#F5EDE3" }}>{selected.category}</span>
                </div>
                <div className="tkt-detail-card">
                  <div className="tkt-detail-grid">
                    <div className="tkt-detail-item"><label>Ticket No.</label><span>{selected.ticket_no ?? `TKT-${String(selected.id).padStart(4,"0")}`}</span></div>
                    <div className="tkt-detail-item"><label>Date Raised</label><span>{fmt(selected.created_at)}</span></div>
                    <div className="tkt-detail-item"><label>Raised By</label><span>{selected.raised_by?.first_name} {selected.raised_by?.last_name}</span></div>
                    <div className="tkt-detail-item"><label>Department</label><span>{selected.raised_by?.department}</span></div>
                    <div className="tkt-detail-item"><label>Assigned To</label><span>{selected.assigned_to ? `${selected.assigned_to.first_name} ${selected.assigned_to.last_name}` : "—"}</span></div>
                    <div className="tkt-detail-item"><label>Last Updated</label><span>{timeAgo(selected.updated_at)}</span></div>
                    <div className="tkt-detail-item"><label>Attachments</label><span style={{ display: "flex", alignItems: "center", gap: 3 }}><Paperclip size={12} /> {selected.attachments_count ?? 0}</span></div>
                    <div className="tkt-detail-item"><label>Comments</label><span style={{ display: "flex", alignItems: "center", gap: 3 }}><MessageSquare size={12} /> {selected.comments_count ?? 0}</span></div>
                  </div>
                </div>
                <div>
                  <div className="tkt-section-lbl">Description</div>
                  <div className="tkt-desc-box">{selected.description}</div>
                </div>
                <div className="tkt-drawer-actions">
                  <button className="tkt-action-btn primary" onClick={() => { setAssigning(selected); setTarget(selected.assigned_to?.id ?? null); }}>
                    <UserCheck size={13} /> Assign
                  </button>
                  <button className="tkt-action-btn secondary" onClick={() => { setChangingStatus(selected); setNewStatus(selected.status); }}>
                    <RefreshCw size={13} /> Change Status
                  </button>
                </div>
                <div>
                  <div className="tkt-section-lbl">Comments</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 10 }}>
                    {comments.length === 0 && <div style={{ fontSize: "0.81rem", color: "#7A5C44" }}>No comments yet.</div>}
                    {comments.map(c => (
                      <div key={c.id} className="tkt-comment">
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span className="tkt-comment-author">{c.author}</span>
                          <span className="tkt-comment-time">{timeAgo(c.created_at)}</span>
                        </div>
                        <div className="tkt-comment-body">{c.body}</div>
                      </div>
                    ))}
                  </div>
                  <div className="tkt-comment-input-row">
                    <textarea className="tkt-comment-input" rows={2} placeholder="Add a comment…" value={newComment} onChange={e => setNewComment(e.target.value)} />
                    <button className="tkt-send-btn" disabled={!newComment.trim() || sendingComment} onClick={handleComment}>
                      {sendingComment ? <Loader2 size={13} /> : <Send size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Assign modal */}
      {assigning && (
        <div className="tkt-modal-overlay" onClick={() => setAssigning(null)}>
          <div className="tkt-modal" onClick={e => e.stopPropagation()}>
            <h3>Assign Ticket</h3>
            <p>{assigning.ticket_no} — {assigning.subject}</p>
            <div className="tkt-staff-list">
              {personnel.filter(p => p.category === assigning.category).length === 0 && (
                <div style={{ fontSize: "0.82rem", color: "#7A5C44", textAlign: "center", padding: "12px 0" }}>
                  No technicians in the {assigning.category} category.
                </div>
              )}
              {personnel.filter(p => p.category === assigning.category).map(p => {
                const av = getAvail(p.availability_status);
                return (
                  <div key={p.id} className={`tkt-staff-item${assignTarget === p.id ? " selected" : ""}`} onClick={() => setTarget(p.id)}>
                    <div>
                      <div className="tkt-staff-name">{p.first_name} {p.last_name}</div>
                      <div className="tkt-staff-load" style={{ color: av.color }}>{av.label} · {p.open_tickets_count} open</div>
                    </div>
                    {assignTarget === p.id && <CheckCircle2 size={15} color="#6B2D0F" />}
                  </div>
                );
              })}
            </div>
            <div className="tkt-modal-actions">
              <button className="tkt-modal-cancel" onClick={() => { setAssigning(null); setTarget(null); }}>Cancel</button>
              <button className="tkt-modal-confirm" disabled={!assignTarget || savingAssign} onClick={handleAssign}>
                {savingAssign ? <Loader2 size={13} /> : <UserCheck size={13} />} Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status modal */}
      {changingStatus && (
        <div className="tkt-modal-overlay" onClick={() => setChangingStatus(null)}>
          <div className="tkt-modal" onClick={e => e.stopPropagation()}>
            <h3>Change Status</h3>
            <p>{changingStatus.ticket_no} — {changingStatus.subject}</p>
            <div className="tkt-status-options">
              {STATUS_OPTIONS.map(opt => {
                const sc = getStatus(opt.value);
                const I  = sc.icon;
                return (
                  <div key={opt.value} className={`tkt-status-opt${newStatus === opt.value ? " selected" : ""}`} onClick={() => setNewStatus(opt.value)}>
                    <span className="tkt-badge" style={{ color: sc.color, background: sc.bg, margin: 0 }}><I size={11} /> {sc.label}</span>
                    {newStatus === opt.value && <CheckCircle2 size={15} color="#6B2D0F" />}
                  </div>
                );
              })}
            </div>
            <div className="tkt-modal-actions">
              <button className="tkt-modal-cancel" onClick={() => { setChangingStatus(null); setNewStatus(""); }}>Cancel</button>
              <button className="tkt-modal-confirm" disabled={!newStatus || savingStatus} onClick={handleStatusChange}>
                {savingStatus ? <Loader2 size={13} /> : <RefreshCw size={13} />} Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}