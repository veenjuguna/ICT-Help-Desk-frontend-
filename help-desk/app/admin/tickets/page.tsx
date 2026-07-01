"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search, ChevronDown, Clock, AlertCircle, CheckCircle2, XCircle,
  Eye, RefreshCw, X, Loader2, MessageSquare, Calendar, ChevronUp,
  Wifi, Monitor, HardDrive, Mail, Settings, RotateCw,
} from "lucide-react";

// ── Types — match real backend exactly ───────────────────────────────────────
type TicketStatus =  "open" | "in_progress" | "closed";
type TicketCategory = "hardware" | "software" | "network" | "security_incidents" | "access_permissions" | "other";

interface Ticket {
  id: number;
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  created_at: string;
  closed_at: string | null;
  comment: string | null;       // non-null on CLOSED = "unresolved, needs admin follow-up"
  staff_id: string;             // UUID of the person who raised it
  assigned_to_id: number | null; // numeric ict_personnel id, or null if queued/unassigned
}

interface StaffMember {
  id: string;
  full_name: string;
  email: string;
  department?: { name: string };
}

interface IctPersonnel {
  id: number;
  staff_id: string;
  specialization: string | null;
  phone_extension: string | null;
  availability: "available" | "busy" | "off_duty" | "on_leave";
  is_active: boolean;
  full_name?: string; // enriched client-side from staff lookup
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://ict-help-desk-neon.onrender.com";

// ── Config ────────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  open:        { label: "Open",        color: "#B91C1C", bg: "#FEF2F2", icon: AlertCircle  },
  in_progress: { label: "In Progress", color: "#8B4513", bg: "#FDF6EE", icon: Clock        },
  closed:      { label: "Closed",      color: "#7A5C44", bg: "#FDF8F2", icon: XCircle      },
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  hardware: HardDrive,
  network:  Wifi,
  software: Monitor,
  security_incidents: Mail,
  access_permissions: Settings,
  other:                Settings,
};

const AVAIL_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  available: { label: "Available", color: "#166534", dot: "#16A34A" },
  busy:      { label: "Busy",      color: "#8B4513", dot: "#C8962E" },
  off_duty:  { label: "Off Duty",  color: "#7A5C44", dot: "#C4A882" },
  on_leave:  { label: "On Leave",  color: "#6B21A8", dot: "#A855F7" },
};
const SPEC_TO_CATEGORY: Record<string, TicketCategory> = {
    hardware:             "hardware",
    networking:           "network",
    software_and_systems: "software",
    security:             "security_incidents",
    other:                "other",
   };
function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
}
function timeAgo(iso: string | null) {
  if (!iso) return "—";
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, background: type === "success" ? "#166534" : "#B91C1C", color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: "0.86rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.2)", maxWidth: 360 }}>
      {type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {msg}
      <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0 }}><X size={14} /></button>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminTicketsPage() {
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("all");
  const [collapsed, setCollapsed]   = useState<Record<string, boolean>>({});
  const [toast, setToast]           = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [selected, setSelected]     = useState<Ticket | null>(null);

  const [changingStatus, setChangingStatus] = useState<Ticket | null>(null);
  const [newStatus, setNewStatus]           = useState<TicketStatus | "">("");
  const [statusComment, setStatusComment]   = useState("");
  const [savingStatus, setSavingS]          = useState(false);

  const [reassigning, setReassigning] = useState<Ticket | null>(null);
  const [savingReassign, setSavingR]  = useState(false);

  const showToast = (msg: string, type: "success" | "error") => setToast({ msg, type });

  // ── Fetch ──────────────────────────────────────────────────────────────────
   const queryClient = useQueryClient();

  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ["admin-tickets-page"],
    queryFn: async () => {
      const [tRes, sRes, pRes] = await Promise.all([
        fetch(`${API}/tickets/`,       { credentials: "include" }),
        fetch(`${API}/staff/`,         { credentials: "include" }),
        fetch(`${API}/ict-personnel/`, { credentials: "include" }),
      ]);
      if (!tRes.ok) {
        const err = await tRes.json().catch(() => ({}));
        throw new Error(err.detail ?? `Tickets error ${tRes.status}`);
      }
      const ticketData = await tRes.json();
      const tickets: Ticket[] = Array.isArray(ticketData) ? ticketData : ticketData.tickets ?? [];

      const staffMap: Record<string, StaffMember> = {};
      if (sRes.ok) {
        const staffData = await sRes.json();
        const list: StaffMember[] = Array.isArray(staffData) ? staffData : staffData.staff ?? [];
        list.forEach(s => { staffMap[s.id] = s; });
      }

      const personnelData = pRes.ok ? await pRes.json() : [];
      const personnel: IctPersonnel[] = Array.isArray(personnelData) ? personnelData : personnelData.personnel ?? [];

      return { tickets, staffMap, personnel };
    },
    staleTime: 60 * 1000,
  });

  const tickets: Ticket[]                        = data?.tickets   ?? [];
  const staffMap: Record<string, StaffMember>    = data?.staffMap  ?? {};
  const personnel: IctPersonnel[]                = data?.personnel ?? [];
  const error = queryError instanceof Error ? queryError.message : queryError ? "Failed to load tickets." : null;

  // ── Derived ────────────────────────────────────────────────────────────────
  const allCategories = Array.from(new Set([
    ...Object.values(SPEC_TO_CATEGORY),
    ...tickets.map(t => t.category),
  ])).sort();

  const filteredTickets = tickets.filter(t => {
    const staff = staffMap[t.staff_id];
    const q = search.toLowerCase();
    const matchQ = !q
      || String(t.id).includes(q)
      || t.title.toLowerCase().includes(q)
      || (staff?.full_name ?? "").toLowerCase().includes(q);
    return matchQ && (statusFilter === "all" || t.status === statusFilter);
  });

  
  const ticketsByCategory = (cat: string) => filteredTickets.filter(t => t.category === cat);
  const personnelByCategory = (cat: string) =>
    personnel.filter(p => p.specialization && SPEC_TO_CATEGORY[p.specialization] === cat);

  const totalOpen       = tickets.filter(t => t.status === "open").length;
  const totalInProgress = tickets.filter(t => t.status === "in_progress").length;
  const totalClosed     = tickets.filter(t => t.status === "closed").length;
  const totalUnassigned = tickets.filter(t => !t.assigned_to_id && t.status !== "closed").length;
  const totalUnresolved = tickets.filter(t => t.status === "closed" && !!t.comment).length;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const toggleCollapse = (cat: string) => setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));
  const openDetail     = (t: Ticket)   => setSelected(t);

  const handleStatusChange = async () => {
    if (!changingStatus || !newStatus) return;
    setSavingS(true);
    try {
      const body: Record<string, unknown> = { status: newStatus };
      if (newStatus === "closed" && statusComment.trim()) body.comment = statusComment.trim();
      const res = await fetch(`${API}/tickets/${changingStatus.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `Error ${res.status}`);
      }
      const updated: Ticket = await res.json();
      if (selected?.id === changingStatus.id) setSelected(updated);
      await queryClient.invalidateQueries({ queryKey: ["admin-tickets-page"] });
      showToast("Ticket status updated.", "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to update status.", "error");
    } finally {
      setSavingS(false);
      setChangingStatus(null);
      setNewStatus("");
      setStatusComment("");
    }
  };

  const handleReassign = async () => {
    if (!reassigning) return;
    setSavingR(true);
    try {
      const res = await fetch(`${API}/tickets/${reassigning.id}/reassign`, {
        method: "POST",
        credentials: "include",
      });
      if (res.status === 503) {
        throw new Error("No specialist is currently available for this category.");
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `Error ${res.status}`);
      }
      const updated: Ticket = await res.json();
      if (selected?.id === reassigning.id) setSelected(updated);
      await queryClient.invalidateQueries({ queryKey: ["admin-tickets-page"] });
      showToast("Ticket reassigned.", "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Reassignment failed.", "error");
    } finally {
      setSavingR(false);
      setReassigning(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        :root {
          --brown-dark: #4A1E0A;
          --brown-main: #6B2D0F;
          --brown-mid:  #8B4513;
          --gold:       #C8962E;
          --gold-light: #E8B84B;
          --cream:      #FDF8F2;
          --border:     #E0D0C0;
          --text-main:  #1A0F08;
          --text-sub:   #7A5C44;
        }

        .tkt-root { padding: 28px 32px; min-height: 100vh; background: var(--cream); font-family: 'Inter', system-ui, sans-serif; }

        .tkt-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
        .tkt-header h1 { font-size: 1.35rem; font-weight: 700; color: var(--brown-dark); margin: 0 0 2px; }
        .tkt-header p  { font-size: 0.82rem; color: var(--text-sub); margin: 0; }
        .tkt-refresh-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: #fff; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.82rem; font-weight: 600; color: var(--brown-main); cursor: pointer; transition: all 0.15s; }
        .tkt-refresh-btn:hover { border-color: var(--gold); color: var(--gold); }

        .tkt-error-banner { background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 8px; padding: 10px 14px; color: #B91C1C; font-size: 0.84rem; display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }

        .tkt-strip { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .tkt-chip { background: #fff; border: 1.5px solid var(--border); border-radius: 8px; padding: 10px 18px; display: flex; flex-direction: column; min-width: 110px; }
        .tkt-chip-val { font-size: 1.4rem; font-weight: 800; color: var(--brown-dark); }
        .tkt-chip-label { font-size: 0.72rem; color: var(--text-sub); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
        .tkt-chip.red .tkt-chip-val  { color: #B91C1C; }
        .tkt-chip.gold .tkt-chip-val { color: var(--brown-mid); }

        .tkt-filters { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
        .tkt-search-wrap { position: relative; flex: 1; min-width: 220px; }
        .tkt-search-wrap svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-sub); }
        .tkt-search { width: 100%; padding: 9px 12px 9px 34px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.84rem; color: var(--text-main); background: #fff; outline: none; }
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
        .tkt-cat-name { font-size: 1rem; font-weight: 700; color: var(--brown-dark); text-transform: capitalize; }
        .tkt-cat-counts { display: flex; gap: 6px; margin-top: 2px; }
        .tkt-cat-count { font-size: 0.73rem; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
        .tkt-section-right { display: flex; align-items: center; gap: 12px; }

        .tkt-divider { height: 1px; background: var(--border); }

        .tkt-tech-row { display: flex; gap: 8px; padding: 10px 20px; background: var(--cream); flex-wrap: wrap; align-items: center; }
        .tkt-tech-label { font-size: 0.72rem; font-weight: 700; color: var(--text-sub); text-transform: uppercase; letter-spacing: 0.5px; margin-right: 4px; }
        .tkt-tech-chip { display: flex; align-items: center; gap: 6px; padding: 5px 11px; background: #fff; border: 1.5px solid var(--border); border-radius: 20px; }
        .tkt-tech-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .tkt-tech-name { font-size: 0.79rem; font-weight: 600; color: var(--brown-dark); }
        .tkt-no-tech { font-size: 0.79rem; color: var(--text-sub); font-style: italic; }

        .tkt-table { width: 100%; border-collapse: collapse; }
        .tkt-table th { padding: 10px 16px; text-align: left; font-size: 0.71rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--text-sub); background: var(--cream); border-bottom: 1px solid var(--border); white-space: nowrap; }
        .tkt-table td { padding: 12px 16px; font-size: 0.84rem; color: var(--text-main); border-bottom: 1px solid var(--border); vertical-align: middle; }
        .tkt-table tr:last-child td { border-bottom: none; }
        .tkt-table tr:hover td { background: #FDF4EB; cursor: pointer; }
        .tkt-ticket-no { font-weight: 700; color: var(--brown-main); font-size: 0.78rem; }
        .tkt-subject { font-weight: 500; max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tkt-meta { font-size: 0.73rem; color: var(--text-sub); margin-top: 2px; }
        .tkt-badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 9px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
        .tkt-assignee { font-size: 0.8rem; font-weight: 500; color: var(--text-main); }
        .tkt-unassigned { font-size: 0.78rem; color: #B91C1C; font-style: italic; }
        .tkt-actions { display: flex; gap: 5px; }
        .tkt-btn-icon { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: 1.5px solid var(--border); background: #fff; cursor: pointer; color: var(--text-sub); transition: all 0.15s; }
        .tkt-btn-icon:hover { border-color: var(--gold); color: var(--brown-mid); background: #FDF6EE; }
        .tkt-empty { padding: 32px; text-align: center; color: var(--text-sub); font-size: 0.86rem; }
        .tkt-loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 60px; color: var(--text-sub); }

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
        .tkt-desc-box { background: #fff; border: 1px solid var(--border); border-left: 3px solid var(--brown-mid); border-radius: 8px; padding: 12px; font-size: 0.84rem; color: var(--text-main); line-height: 1.6; }
        .tkt-section-lbl { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--brown-mid); margin-bottom: 8px; border-left: 3px solid var(--gold); padding-left: 8px; }

        .tkt-comingsoon { background: #FFFBEB; border: 1px dashed #FCD34D; border-radius: 8px; padding: 12px 14px; font-size: 0.8rem; color: #92400E; display: flex; align-items: center; gap: 8px; }

        .tkt-drawer-actions { display: flex; gap: 8px; }
        .tkt-action-btn { flex: 1; padding: 10px 14px; border: none; border-radius: 8px; font-size: 0.84rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.15s; color: #fff; }
        .tkt-action-btn.primary { background: var(--brown-dark); }
        .tkt-action-btn.primary:hover:not(:disabled) { background: var(--brown-main); }
        .tkt-action-btn.secondary { background: var(--gold); }
        .tkt-action-btn.secondary:hover:not(:disabled) { background: var(--gold-light); color: var(--brown-dark); }
        .tkt-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .tkt-modal-overlay { position: fixed; inset: 0; background: rgba(74,30,10,0.45); z-index: 200; display: flex; align-items: center; justify-content: center; }
        .tkt-modal { background: #fff; border-radius: 14px; width: 420px; max-width: 95vw; padding: 24px; animation: fadeUp 0.2s ease; border-top: 4px solid var(--brown-main); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .tkt-modal h3 { font-size: 1rem; font-weight: 700; color: var(--brown-dark); margin: 0 0 4px; }
        .tkt-modal p  { font-size: 0.81rem; color: var(--text-sub); margin: 0 0 16px; }
        .tkt-status-options { display: flex; flex-direction: column; gap: 7px; margin-bottom: 14px; }
        .tkt-status-opt { display: flex; align-items: center; justify-content: space-between; padding: 10px 13px; border: 1.5px solid var(--border); border-radius: 8px; cursor: pointer; transition: all 0.15s; }
        .tkt-status-opt:hover { border-color: var(--gold); background: #FDF6EE; }
        .tkt-status-opt.selected { border-color: var(--brown-main); background: #F5EDE3; }
        .tkt-modal-textarea { width: 100%; padding: 9px 12px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.84rem; color: var(--text-main); background: #fff; outline: none; font-family: inherit; resize: none; margin-bottom: 16px; box-sizing: border-box; }
        .tkt-modal-textarea:focus { border-color: var(--gold); }
        .tkt-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
        .tkt-modal-cancel { padding: 8px 18px; border: 1.5px solid var(--border); background: #fff; border-radius: 8px; font-size: 0.84rem; font-weight: 600; color: var(--text-sub); cursor: pointer; }
        .tkt-modal-confirm { padding: 8px 18px; background: var(--brown-dark); color: #fff; border: none; border-radius: 8px; font-size: 0.84rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .tkt-modal-confirm:hover:not(:disabled) { background: var(--gold); }
        .tkt-modal-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 768px) {
          .tkt-root { padding: 16px; }
          .tkt-strip { flex-wrap: wrap; }
          .tkt-drawer { width: 100%; }
        }
      `}</style>

      <div className="tkt-root">
        <div className="tkt-header">
          <div>
            <h1>Tickets by Category</h1>
            <p>Auto-assigned by specialization — reassign if no one is available</p>
          </div>
          <button className="tkt-refresh-btn" onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-tickets-page"] })}><RefreshCw size={14} /> Refresh</button>
        </div>

        {error && (
          <div className="tkt-error-banner"><AlertCircle size={15} /> {error} — showing fallback data.</div>
        )}

        <div className="tkt-strip">
          <div className="tkt-chip"><span className="tkt-chip-val">{tickets.length}</span><span className="tkt-chip-label">Total</span></div>
          <div className="tkt-chip red"><span className="tkt-chip-val">{totalOpen}</span><span className="tkt-chip-label">Open</span></div>
          <div className="tkt-chip gold"><span className="tkt-chip-val">{totalInProgress}</span><span className="tkt-chip-label">In Progress</span></div>
          <div className="tkt-chip"><span className="tkt-chip-val">{totalClosed}</span><span className="tkt-chip-label">Closed</span></div>
          <div className="tkt-chip red"><span className="tkt-chip-val">{totalUnassigned}</span><span className="tkt-chip-label">Unassigned</span></div>
          <div className="tkt-chip red"><span className="tkt-chip-val">{totalUnresolved}</span><span className="tkt-chip-label">Unresolved</span></div>
        </div>

        <div className="tkt-filters">
          <div className="tkt-search-wrap">
            <Search size={14} />
            <input className="tkt-search" placeholder="Search by ID, title, or staff…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="tkt-select-wrap">
            <select className="tkt-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
            <ChevronDown size={13} />
          </div>
        </div>

        {loading && <div className="tkt-loading"><Loader2 size={18} /> Loading…</div>}

        {!loading && allCategories.map(cat => {
          const catTickets   = ticketsByCategory(cat);
          const catPersonnel = personnelByCategory(cat);
          const openCount    = catTickets.filter(t => t.status === "open").length;
          const inProgCount  = catTickets.filter(t => t.status === "in_progress").length;
          const isCollapsed  = collapsed[cat] ?? false;
          const CatIcon      = CATEGORY_ICONS[cat] ?? Settings;

          return (
            <div className="tkt-section" key={cat}>
              <div className="tkt-section-header" onClick={() => toggleCollapse(cat)}>
                <div className="tkt-section-title-row">
                  <div className="tkt-cat-icon"><CatIcon size={16} /></div>
                  <div>
                    <div className="tkt-cat-name">{cat.toLowerCase()}</div>
                    <div className="tkt-cat-counts">
                      {openCount > 0    && <span className="tkt-cat-count" style={{ color: "#B91C1C", background: "#FEF2F2" }}>{openCount} open</span>}
                      {inProgCount > 0  && <span className="tkt-cat-count" style={{ color: "#8B4513", background: "#FDF6EE" }}>{inProgCount} in progress</span>}
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
                      ? <span className="tkt-no-tech">No technician with this specialization</span>
                      : catPersonnel.map(p => {
                          const av = AVAIL_CONFIG[p.availability] ?? AVAIL_CONFIG.off_duty;
                          return (
                            <div className="tkt-tech-chip" key={p.id}>
                              <span className="tkt-tech-dot" style={{ background: av.dot }} />
                              <span className="tkt-tech-name">{p.full_name ?? staffMap[p.staff_id]?.full_name ?? `ICT #${p.id}`}</span>
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
                            <th>Ticket</th><th>Title</th><th>Status</th>
                            <th>Raised By</th><th>Assigned To</th><th>Date</th><th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {catTickets.map(t => {
                            const sc = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.open;
                            const StatusIcon = sc.icon;
                            const staff = staffMap[t.staff_id];
                            const assignedTech = personnel.find(p => p.id === t.assigned_to_id);
                            const isUnresolved = t.status === "closed" && !!t.comment;
                            return (
                              <tr key={t.id} onClick={() => openDetail(t)}>
                                <td><div className="tkt-ticket-no">#{t.id}</div></td>
                                <td>
                                  <div className="tkt-subject">{t.title}</div>
                                  {isUnresolved && (
                                    <div className="tkt-meta" style={{ color: "#B91C1C" }}>
                                      <MessageSquare size={10} style={{ display: "inline", marginRight: 3 }} />
                                      Unresolved
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <span className="tkt-badge" style={{ color: sc.color, background: sc.bg }}>
                                    <StatusIcon size={11} /> {sc.label}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ fontSize: "0.82rem", fontWeight: 500 }}>{staff?.full_name ?? "Unknown"}</div>
                                  <div className="tkt-meta">{staff?.department?.name ?? "—"}</div>
                                </td>
                                <td>
                                  {assignedTech
                                    ? <div className="tkt-assignee">{assignedTech.full_name ?? `ICT #${assignedTech.id}`}</div>
                                    : <div className="tkt-unassigned">Unassigned</div>}
                                </td>
                                <td style={{ fontSize: "0.78rem", color: "#7A5C44", whiteSpace: "nowrap" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}><Calendar size={11} /> {fmt(t.created_at)}</div>
                                  <div className="tkt-meta">{timeAgo(t.created_at)}</div>
                                </td>
                                <td onClick={e => e.stopPropagation()}>
                                  <div className="tkt-actions">
                                    <button className="tkt-btn-icon" title="View" onClick={() => openDetail(t)}><Eye size={13} /></button>
                                    {!t.assigned_to_id && t.status !== "closed" && (
                                      <button className="tkt-btn-icon" title="Reassign" onClick={() => setReassigning(t)}><RotateCw size={13} /></button>
                                    )}
                                    <button className="tkt-btn-icon" title="Change Status" onClick={() => { setChangingStatus(t); setNewStatus(t.status); setStatusComment(t.comment ?? ""); }}><RefreshCw size={13} /></button>
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
        const staff = staffMap[selected.staff_id];
        const assignedTech = personnel.find(p => p.id === selected.assigned_to_id);
        const sc = STATUS_CONFIG[selected.status] ?? STATUS_CONFIG.open;
        const SI = sc.icon;
        return (
          <div className="tkt-overlay" onClick={() => setSelected(null)}>
            <div className="tkt-drawer" onClick={e => e.stopPropagation()}>
              <div className="tkt-drawer-header">
                <div>
                  <h2>#{selected.id} — {selected.title}</h2>
                  <p>{staff?.full_name ?? "Unknown"} · {staff?.department?.name ?? "—"} · {fmt(selected.created_at)}</p>
                </div>
                <button className="tkt-close-btn" onClick={() => setSelected(null)}><X size={15} /></button>
              </div>
              <div className="tkt-drawer-body">
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  <span className="tkt-badge" style={{ color: sc.color, background: sc.bg }}><SI size={11} /> {sc.label}</span>
                  <span className="tkt-badge" style={{ color: "#6B2D0F", background: "#F5EDE3" }}>{selected.category}</span>
                  {selected.status === "closed" && selected.comment && (
                    <span className="tkt-badge" style={{ color: "#B91C1C", background: "#FEF2F2" }}><MessageSquare size={11} /> Unresolved</span>
                  )}
                </div>

                <div className="tkt-detail-card">
                  <div className="tkt-detail-grid">
                    <div className="tkt-detail-item"><label>Ticket ID</label><span>#{selected.id}</span></div>
                    <div className="tkt-detail-item"><label>Date Raised</label><span>{fmt(selected.created_at)}</span></div>
                    <div className="tkt-detail-item"><label>Raised By</label><span>{staff?.full_name ?? "Unknown"}</span></div>
                    <div className="tkt-detail-item"><label>Department</label><span>{staff?.department?.name ?? "—"}</span></div>
                    <div className="tkt-detail-item"><label>Assigned To</label><span>{assignedTech ? (assignedTech.full_name ?? `ICT #${assignedTech.id}`) : "Unassigned"}</span></div>
                    <div className="tkt-detail-item"><label>Closed On</label><span>{fmt(selected.closed_at)}</span></div>
                  </div>
                </div>

                <div>
                  <div className="tkt-section-lbl">Description</div>
                  <div className="tkt-desc-box">{selected.description}</div>
                </div>

                {selected.comment && (
                  <div>
                    <div className="tkt-section-lbl">Technician Comment</div>
                    <div className="tkt-desc-box" style={{ borderLeftColor: "#B91C1C" }}>{selected.comment}</div>
                  </div>
                )}

                <div className="tkt-drawer-actions">
                  <button
                    className="tkt-action-btn primary"
                    disabled={!!selected.assigned_to_id || selected.status === "closed"}
                    onClick={() => setReassigning(selected)}
                  >
                    <RotateCw size={13} /> Reassign
                  </button>
                  <button className="tkt-action-btn secondary" onClick={() => { setChangingStatus(selected); setNewStatus(selected.status); setStatusComment(selected.comment ?? ""); }}>
                    <RefreshCw size={13} /> Change Status
                  </button>
                </div>

                <div className="tkt-comingsoon">
                  <MessageSquare size={14} /> Comments thread — coming soon, pending backend endpoint.
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Status modal */}
      {changingStatus && (
        <div className="tkt-modal-overlay" onClick={() => setChangingStatus(null)}>
          <div className="tkt-modal" onClick={e => e.stopPropagation()}>
            <h3>Change Status</h3>
            <p>#{changingStatus.id} — {changingStatus.title}</p>
            <div className="tkt-status-options">
              {(["open", "in_progress", "closed"] as TicketStatus[]).map(s => {
                const sc = STATUS_CONFIG[s]; const I = sc.icon;
                return (
                  <div key={s} className={`tkt-status-opt${newStatus === s ? " selected" : ""}`} onClick={() => setNewStatus(s)}>
                    <span className="tkt-badge" style={{ color: sc.color, background: sc.bg, margin: 0 }}><I size={11} /> {sc.label}</span>
                    {newStatus === s && <CheckCircle2 size={15} color="#6B2D0F" />}
                  </div>
                );
              })}
            </div>
            {newStatus === "closed" && (
              <textarea
                className="tkt-modal-textarea"
                rows={3}
                placeholder="Optional comment (leave blank if resolved; add a note if unresolved)…"
                value={statusComment}
                onChange={e => setStatusComment(e.target.value)}
              />
            )}
            <div className="tkt-modal-actions">
              <button className="tkt-modal-cancel" onClick={() => { setChangingStatus(null); setNewStatus(""); setStatusComment(""); }}>Cancel</button>
              <button className="tkt-modal-confirm" disabled={!newStatus || savingStatus} onClick={handleStatusChange}>
                {savingStatus ? <Loader2 size={13} /> : <RefreshCw size={13} />} Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign confirm modal */}
      {reassigning && (
        <div className="tkt-modal-overlay" onClick={() => setReassigning(null)}>
          <div className="tkt-modal" onClick={e => e.stopPropagation()}>
            <h3>Reassign Ticket</h3>
            <p>#{reassigning.id} — {reassigning.title}. The system will automatically find an available specialist for this category. Returns an error if none are free.</p>
            <div className="tkt-modal-actions">
              <button className="tkt-modal-cancel" onClick={() => setReassigning(null)}>Cancel</button>
              <button className="tkt-modal-confirm" disabled={savingReassign} onClick={handleReassign}>
                {savingReassign ? <Loader2 size={13} /> : <RotateCw size={13} />} Reassign
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}