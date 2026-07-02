"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Clock, Monitor, Network, Plus, RefreshCw, Shield, Ticket, Wrench } from "lucide-react";

type TicketStatus = "open" | "in_progress" | "closed";
type TicketCategory = "hardware" | "software" | "network" | "security_incidents" | "access_permissions" | "other";
type FilterKey = "all" | "open" | "in_progress" | "closed";

interface StaffTicket {
  id: number;
  staff_id: string;
  assigned_to_id: number | null;
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  comment: string | null;
  created_at: string;
  closed_at: string | null;
}

interface StaffMe {
  id: string;
  full_name: string;
  email: string;
  department: { id: number; name: string } | null;
}

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "closed", label: "Resolved" },
];

const CATEGORY_META: Record<string, { label: string; Icon: React.ElementType; color: string; bg: string }> = {
  hardware: { label: "Hardware", Icon: Monitor, color: "#2563EB", bg: "#EFF6FF" },
  software: { label: "Software", Icon: Wrench, color: "#7C3AED", bg: "#F5F3FF" },
  network: { label: "Network", Icon: Network, color: "#0F766E", bg: "#F0FDFA" },
  security_incidents: { label: "Security", Icon: Shield, color: "#B91C1C", bg: "#FEF2F2" },
  access_permissions: { label: "Access", Icon: Shield, color: "#8B4513", bg: "#FDF6EE" },
  other: { label: "Other", Icon: Ticket, color: "#7A5C44", bg: "#FDF8F2" },
};

const STATUS_META: Record<TicketStatus, { label: string; color: string; bg: string; dot: string }> = {
  open: { label: "Open", color: "#B45309", bg: "#FFFBEB", dot: "#F59E0B" },
  in_progress: { label: "In Progress", color: "#6B2D0F", bg: "#FDF6EE", dot: "#C8962E" },
  closed: { label: "Resolved", color: "#166534", bg: "#F0FDF4", dot: "#22C55E" },
};

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
}

function StatusBadge({ status }: { status: TicketStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.open;
  return (
    <span className="admin-my-status" style={{ color: meta.color, background: meta.bg }}>
      <span style={{ background: meta.dot }} />
      {meta.label}
    </span>
  );
}

function CategoryChip({ category }: { category: TicketCategory }) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META.other;
  const Icon = meta.Icon;
  return (
    <span className="admin-my-category" style={{ color: meta.color, background: meta.bg }}>
      <Icon size={11} />
      {meta.label}
    </span>
  );
}

function TicketCard({ ticket }: { ticket: StaffTicket }) {
  const [expanded, setExpanded] = useState(false);
  const resolved = ticket.status === "closed";

  return (
    <div className={`admin-my-card${resolved ? " resolved" : ""}`}>
      <div className="admin-my-card-head">
        <div className="admin-my-title-row">
          <span className="admin-my-id">#{ticket.id}</span>
          <div className="admin-my-title-block">
            <h3>{ticket.title}</h3>
            <p>Raised {formatDate(ticket.created_at)} at {formatTime(ticket.created_at)}</p>
          </div>
        </div>
        <div className="admin-my-badges">
          <StatusBadge status={ticket.status} />
          <CategoryChip category={ticket.category} />
        </div>
      </div>

      {resolved && (
        <div className="admin-my-resolved">
          <CheckCircle2 size={14} />
          Ticket resolved{ticket.closed_at ? ` on ${formatDate(ticket.closed_at)}` : ""}
        </div>
      )}

      <button className="admin-my-expand" onClick={() => setExpanded((value) => !value)}>
        <span>{expanded ? "Hide details" : "View details"}</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="admin-my-detail">
          <div>
            <p className="admin-my-detail-label">Description</p>
            <p className="admin-my-detail-text">{ticket.description}</p>
          </div>
          {ticket.comment && (
            <div className="admin-my-note">
              <p className="admin-my-detail-label">Technician Note</p>
              <p className="admin-my-detail-text">{ticket.comment}</p>
            </div>
          )}
          <p className="admin-my-assigned">
            Assigned technician: <strong>{ticket.assigned_to_id ? `ICT #${ticket.assigned_to_id}` : "Unassigned"}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

export default function AdminMyTicketsPage() {
  const [tickets, setTickets] = useState<StaffTicket[]>([]);
  const [staff, setStaff] = useState<StaffMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");

  const loadData = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [staffRes, ticketsRes] = await Promise.all([
        fetch(`${API}/staff/me`, { credentials: "include" }),
        fetch(`${API}/tickets/?mine_only=true`, { credentials: "include" }),
      ]);
      if (!staffRes.ok) throw new Error(`Staff fetch failed (${staffRes.status})`);
      if (!ticketsRes.ok) throw new Error(`Tickets fetch failed (${ticketsRes.status})`);

      const staffData: StaffMe = await staffRes.json();
      const raw = await ticketsRes.json();
      const list: StaffTicket[] = Array.isArray(raw) ? raw : raw.tickets ?? [];

      setStaff(staffData);
      setTickets(list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your tickets.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const id = window.setInterval(() => loadData(true), 30_000);
    return () => window.clearInterval(id);
  }, [loadData]);

  const counts = {
    all: tickets.length,
    open: tickets.filter((ticket) => ticket.status === "open").length,
    in_progress: tickets.filter((ticket) => ticket.status === "in_progress").length,
    closed: tickets.filter((ticket) => ticket.status === "closed").length,
  };
  const visible = filter === "all" ? tickets : tickets.filter((ticket) => ticket.status === filter);

  return (
    <>
      <style>{`
        .admin-my-root { min-height: 100vh; background: #FDF8F2; color: #1A0F08; font-family: 'Plus Jakarta Sans', Inter, system-ui, sans-serif; }
        .admin-my-header { background: #fff; border-bottom: 1px solid #EDE0D0; padding: 20px 32px; display: flex; align-items: center; justify-content: space-between; gap: 16px; box-shadow: 0 2px 8px rgba(107,45,15,0.04); }
        .admin-my-header h1 { margin: 0; color: #4A1E0A; font-size: 1.35rem; font-weight: 800; display: flex; align-items: center; gap: 8px; }
        .admin-my-header p { margin: 4px 0 0; color: #7A5C44; font-size: 0.84rem; }
        .admin-my-actions { display: flex; align-items: center; gap: 10px; }
        .admin-my-icon-btn, .admin-my-primary { border-radius: 8px; border: 1.5px solid #E0D0C0; cursor: pointer; font: inherit; transition: background 0.15s, border-color 0.15s; }
        .admin-my-icon-btn { width: 40px; height: 40px; background: #fff; color: #6B2D0F; display: flex; align-items: center; justify-content: center; }
        .admin-my-icon-btn:hover { background: #FDFAF6; border-color: #C8962E; }
        .admin-my-primary { display: inline-flex; align-items: center; gap: 8px; background: #6B2D0F; border-color: #6B2D0F; color: #fff; padding: 10px 16px; text-decoration: none; font-size: 0.84rem; font-weight: 700; }
        .admin-my-primary:hover { background: #4A1E0A; }
        .admin-my-content { padding: 28px 32px; }
        .admin-my-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 18px; }
        .admin-my-stat { background: #fff; border: 1px solid #EDE0D0; border-radius: 12px; padding: 16px; text-align: left; cursor: pointer; box-shadow: 0 2px 8px rgba(107,45,15,0.04); }
        .admin-my-stat.active { border-color: #C8962E; box-shadow: 0 0 0 1px rgba(200,150,46,0.22); }
        .admin-my-stat-label { color: #7A5C44; text-transform: uppercase; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.6px; }
        .admin-my-stat-value { color: #1A0F08; font-size: 1.6rem; font-weight: 800; margin-top: 4px; }
        .admin-my-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
        .admin-my-tab { border: 1px solid #E0D0C0; background: #fff; color: #6B2D0F; border-radius: 8px; padding: 7px 13px; font-size: 0.78rem; font-weight: 700; cursor: pointer; }
        .admin-my-tab.active { background: #6B2D0F; border-color: #6B2D0F; color: #fff; }
        .admin-my-list { display: flex; flex-direction: column; gap: 12px; }
        .admin-my-card { background: #fff; border: 1px solid #EDE0D0; border-radius: 12px; box-shadow: 0 2px 8px rgba(107,45,15,0.04); overflow: hidden; }
        .admin-my-card.resolved { border-color: #BBF7D0; }
        .admin-my-card-head { padding: 16px 18px; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
        .admin-my-title-row { display: flex; align-items: flex-start; gap: 12px; min-width: 0; }
        .admin-my-id { background: #F5EDE3; border: 1px solid #E0D0C0; color: #6B2D0F; border-radius: 6px; padding: 3px 8px; font-size: 0.72rem; font-weight: 800; flex-shrink: 0; }
        .admin-my-title-block { min-width: 0; }
        .admin-my-title-block h3 { margin: 0; color: #1A0F08; font-size: 0.95rem; font-weight: 800; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .admin-my-title-block p { margin: 4px 0 0; color: #7A5C44; font-size: 0.75rem; }
        .admin-my-badges { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
        .admin-my-status, .admin-my-category { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; padding: 5px 9px; font-size: 0.73rem; font-weight: 800; white-space: nowrap; }
        .admin-my-status span { width: 7px; height: 7px; border-radius: 999px; }
        .admin-my-category { border-radius: 7px; }
        .admin-my-resolved { margin: 0 18px 12px; background: #F0FDF4; border: 1px solid #BBF7D0; color: #166534; border-radius: 8px; padding: 9px 11px; display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: 700; }
        .admin-my-expand { width: 100%; border: 0; border-top: 1px solid #F5EDE0; background: #fff; color: #7A5C44; padding: 10px 18px; display: flex; align-items: center; justify-content: space-between; font: inherit; font-size: 0.78rem; font-weight: 800; cursor: pointer; }
        .admin-my-expand:hover { background: #FDFAF6; color: #6B2D0F; }
        .admin-my-detail { border-top: 1px solid #F5EDE0; padding: 16px 18px; display: flex; flex-direction: column; gap: 14px; }
        .admin-my-detail-label { margin: 0 0 5px; color: #8B4513; text-transform: uppercase; font-size: 0.68rem; font-weight: 800; letter-spacing: 0.6px; }
        .admin-my-detail-text { margin: 0; color: #1A0F08; font-size: 0.88rem; line-height: 1.55; }
        .admin-my-note { background: #FDFAF6; border: 1px solid #EDE0D0; border-radius: 8px; padding: 12px; }
        .admin-my-assigned { margin: 0; color: #7A5C44; font-size: 0.78rem; }
        .admin-my-empty, .admin-my-loading, .admin-my-error { min-height: 260px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #7A5C44; gap: 10px; }
        .admin-my-empty-icon { width: 64px; height: 64px; border-radius: 999px; background: #F5EDE3; border: 1px solid #E0D0C0; color: #C4A882; display: flex; align-items: center; justify-content: center; }
        .admin-my-empty strong { color: #1A0F08; font-size: 0.95rem; }
        .admin-my-spin { animation: adminMySpin 0.8s linear infinite; }
        @keyframes adminMySpin { to { transform: rotate(360deg); } }
        @media (max-width: 850px) { .admin-my-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } .admin-my-header { align-items: flex-start; flex-direction: column; } }
        @media (max-width: 620px) { .admin-my-header, .admin-my-content { padding: 18px; } .admin-my-stats { grid-template-columns: 1fr; } .admin-my-card-head { flex-direction: column; } .admin-my-badges { flex-direction: row; align-items: flex-start; } .admin-my-primary { width: 100%; justify-content: center; } .admin-my-actions { width: 100%; } }
      `}</style>

      <div className="admin-my-root">
        <header className="admin-my-header">
          <div>
            <h1>
              My Tickets
              {refreshing && <RefreshCw size={14} className="admin-my-spin" />}
            </h1>
            <p>{staff ? `Viewing tickets raised by ${staff.full_name}` : "Track support requests you have raised as an admin."}</p>
          </div>
          <div className="admin-my-actions">
            <button className="admin-my-icon-btn" onClick={() => loadData(true)} disabled={refreshing} title="Refresh">
              <RefreshCw size={17} className={refreshing ? "admin-my-spin" : ""} />
            </button>
            <Link className="admin-my-primary" href="/admin/raise-ticket">
              <Plus size={15} />
              Raise Ticket
            </Link>
          </div>
        </header>

        <main className="admin-my-content">
          {loading ? (
            <div className="admin-my-loading">
              <RefreshCw size={28} className="admin-my-spin" />
              <span>Loading your tickets...</span>
            </div>
          ) : error ? (
            <div className="admin-my-error">
              <AlertCircle size={28} />
              <span>{error}</span>
              <button className="admin-my-primary" onClick={() => loadData()}>Retry</button>
            </div>
          ) : (
            <>
              <div className="admin-my-stats">
                {[
                  { key: "all", label: "Total", value: counts.all },
                  { key: "open", label: "Open", value: counts.open },
                  { key: "in_progress", label: "In Progress", value: counts.in_progress },
                  { key: "closed", label: "Resolved", value: counts.closed },
                ].map((stat) => (
                  <button key={stat.key} className={`admin-my-stat${filter === stat.key ? " active" : ""}`} onClick={() => setFilter(stat.key as FilterKey)}>
                    <div className="admin-my-stat-label">{stat.label}</div>
                    <div className="admin-my-stat-value">{stat.value}</div>
                  </button>
                ))}
              </div>

              <div className="admin-my-tabs">
                {FILTERS.map((item) => (
                  <button key={item.key} className={`admin-my-tab${filter === item.key ? " active" : ""}`} onClick={() => setFilter(item.key)}>
                    {item.label} {counts[item.key] > 0 ? `(${counts[item.key]})` : ""}
                  </button>
                ))}
              </div>

              {visible.length === 0 ? (
                <div className="admin-my-empty">
                  <div className="admin-my-empty-icon"><Ticket size={28} /></div>
                  <strong>{filter === "all" ? "No tickets raised yet" : `No ${filter.replace("_", " ")} tickets`}</strong>
                  <span>{filter === "all" ? "Tickets you create from the admin portal will appear here." : "Switch filters to view other tickets."}</span>
                  <Link className="admin-my-primary" href="/admin/raise-ticket">
                    <Plus size={15} />
                    Raise a Ticket
                  </Link>
                </div>
              ) : (
                <div className="admin-my-list">
                  {visible.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
