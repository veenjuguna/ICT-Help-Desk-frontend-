/// This is a Next.js page component for the "All Tickets" view in an ICT dashboard.
"use client";

import { useEffect, useState } from "react";
import {
  Search,
  CheckCircle,
  ChevronDown,
  X,
} from "lucide-react";

interface StaffProfile {
  id: string;
  full_name: string;
  role: string;
}

interface IctProfile {
  id: number;
  staff_id: string;
  specialization: string | null;
  phone_extension: string | null;
  availability: string;
  is_active: boolean;
}


interface Ticket {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  closed_at: string | null;
  staff_id: string;
  assigned_to_id: number;
}


const CATEGORIES = [
  "All Categories",
  "Hardware",
  "Software",
  "Network",
  "Access",
  "Security",
];

const STATUS_FILTERS = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "escalated", label: "Escalated" },
];




// ─── Ticket Detail Panel ─────────────────────────────────────────────────────
function TicketDetail({
  ticket,
  onClose,
  onStatusChange,
}: {
  ticket: Ticket;
  onClose: () => void;
  onStatusChange: (id: number, status: string) => void;
}) {
  const [statusDropdown, setStatusDropdown] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          height: "100vh",
          background: "#fff",
          borderLeft: "1px solid #EDE0D0",
          display: "flex",
          flexDirection: "column",
          pointerEvents: "all",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid #EDE0D0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 1,
          }}
        >
          <div>
            <p style={{ fontSize: 12, color: "#7A5C44", marginBottom: 4 }}>
              Ticket Details
            </p>
            <p style={{ fontWeight: 700, fontSize: 16, color: "#1A0F08" }}>
              {ticket.id}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#7A5C44",
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          {/* Issue */}
          <div>
            <p
              style={{
                fontSize: 11,
                color: "#7A5C44",
                marginBottom: 8,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Issue
            </p>
            <p
              style={{
                fontSize: 14,
                color: "#1A0F08",
                lineHeight: 1.6,
                background: "#FDF8F2",
                padding: "0.75rem 1rem",
                borderRadius: 8,
                border: "1px solid #EDE0D0",
              }}
            >
              {ticket.description}
            </p>
          </div>

          {/* Info grid */}
          <div
            style={{
              background: "#FDF8F2",
              borderRadius: 10,
              padding: "1rem 1.1rem",
              border: "1px solid #EDE0D0",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                rowGap: "1.1rem",
                columnGap: "1rem",
              }}
            >
              {(
                [
                  ["Category", ticket.category],
                  ["Status", ticket.status],
                  ["Created", new Date(ticket.created_at).toLocaleDateString()],
                  [
                    "Time",
                    new Date(ticket.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  ],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div key={label}>
                  <p
                    style={{ fontSize: 11, color: "#7A5C44", marginBottom: 4 }}
                  >
                    {label}
                  </p>
                  <p
                    style={{ fontSize: 14, color: "#1A0F08", fontWeight: 600 }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Status change */}
          <div>
            <p
              style={{
                fontSize: 11,
                color: "#7A5C44",
                marginBottom: 8,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Update Status
            </p>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setStatusDropdown((v) => !v)}
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#FDF8F2",
                  border: "1px solid #C8962E",
                  borderRadius: 8,
                  padding: "0.65rem 0.9rem",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#1A0F08",
                  fontFamily: "inherit",
                }}
              >
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    background:
                      ticket.status.toLowerCase() === "open"
                        ? "#FEF2F2"
                        : ticket.status.toLowerCase() === "in_progress"
                          ? "#FFF8E0"
                          : "#F0FFF4",
                    color:
                      ticket.status.toLowerCase() === "open"
                        ? "#BB0000"
                        : ticket.status.toLowerCase() === "in_progress"
                          ? "#C8962E"
                          : "#1E6B33",
                  }}
                >
                  {ticket.status.toLowerCase() === "open"
                    ? "Open"
                    : ticket.status.toLowerCase() === "in_progress"
                      ? "In Progress"
                      : "Resolved"}
                </span>
                <ChevronDown size={15} style={{ color: "#7A5C44" }} />
              </button>
              {statusDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "110%",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: "1px solid #EDE0D0",
                    borderRadius: 10,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    zIndex: 10,
                    overflow: "hidden",
                  }}
                >
                  {(["open", "in_progress", "closed"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setStatusDropdown(false);
                        onStatusChange(ticket.id, s);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: "100%",
                        padding: "0.7rem 0.9rem",
                        background:
                          s === ticket.status.toLowerCase()
                            ? "#FDF8F2"
                            : "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 13,
                        color: "#1A0F08",
                        fontFamily: "inherit",
                        textAlign: "left",
                      }}
                    >
                      {s === "open"
                        ? "Open"
                        : s === "in_progress"
                          ? "In Progress"
                          : "Resolved"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mark as resolved */}
          {ticket.status.toLowerCase() !== "closed" && (
            <button
              onClick={() => {
                setStatusDropdown(false);
                onStatusChange(ticket.id, "closed");
              }}
              style={{
                width: "100%",
                height: 42,
                background: "#1E6B33",
                color: "#fff",
                border: "none",
                borderRadius: 9,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontFamily: "inherit",
              }}
            >
              <CheckCircle size={15} />
              Mark as Resolved
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AllTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [ictProfile, setIctProfile] = useState<IctProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    (async () => {
      try {
        const [staffRes, ictRes, ticketsRes] = await Promise.all([
          fetch(`${API}/staff/me`, { credentials: "include" }),
          fetch(`${API}/ict-personnel/me`, { credentials: "include" }),
          fetch(`${API}/tickets/`, { credentials: "include" }),
        ]);
        if (staffRes.ok) setStaff(await staffRes.json());
        if (ictRes.ok) setIctProfile(await ictRes.json());
        if (ticketsRes.ok) setTickets(await ticketsRes.json());
      } catch (e) {
        console.error("AllTickets fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [API]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    // Optimistic UI update
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    );
    setSelectedTicket((prev) =>
      prev?.id === id ? { ...prev, status: newStatus } : prev,
    );

    try {
      const res = await fetch(`${API}/tickets/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        console.error("Failed to update ticket status:", res.status);
      }
    } catch (e) {
      console.error("Status update error:", e);
    }
  };

  const statusMap: Record<string, string> = {
    open: "OPEN",
    in_progress: "IN_PROGRESS",
    resolved: "CLOSED",
    escalated: "ESCALATED",
  };

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    return (
      (!q ||
        String(t.id).toLowerCase().includes(q) ||
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)) &&
      (categoryFilter === "All Categories" ||
        t.category.toLowerCase() === categoryFilter.toLowerCase()) &&
      (statusFilter === "all" ||
        t.status.toLowerCase() === statusMap[statusFilter].toLowerCase())
    );
  });

  const counts = {
    open: tickets.filter((t) => t.status.toLowerCase() === "open").length,
    in_progress: tickets.filter((t) => t.status.toLowerCase() === "in_progress")
      .length,
    resolved: tickets.filter((t) => t.status.toLowerCase() === "closed").length,
    escalated: tickets.filter((t) => t.status.toLowerCase() === "escalated")
      .length,
  };

  const fullName = staff?.full_name ?? "Loading...";
  const techInitials = fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const specializationLabel: Record<string, string> = {
    HARDWARE: "Hardware",
    NETWORKING: "Networking",
    SOFTWARE_AND_SYSTEMS: "Software & Systems",
    SECURITY: "Security",
    OTHER: "Other",
  };
  const specialization = ictProfile?.specialization
    ? (specializationLabel[ictProfile.specialization] ??
      ictProfile.specialization)
    : "—";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --gold: #C8962E; --brown: #6B2D0F; --brown-dark: #4A1E0A;
          --cream: #FDF8F2; --border: #EDE0D0; --text: #1A0F08; --text-sub: #7A5C44;
        }
        .page-root { width: 100%; min-height: 100vh; background: var(--cream); font-family: 'Plus Jakarta Sans', sans-serif; color: var(--text); display: flex; flex-direction: column; }
        .topbar { background: #fff; border-bottom: 1px solid var(--border); padding: 0 2rem; height: 56px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 5; }
        .topbar-title { font-size: 13px; color: var(--text-sub); }
        .topbar-title span { color: var(--brown); font-weight: 600; }
        .page-header { padding: 2rem 2rem 0; }
        .page-title { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 700; color: var(--text); margin-bottom: 0.25rem; }
        .page-sub { font-size: 13px; color: var(--text-sub); }
        .page-content { padding: 1.5rem 2rem; display: flex; flex-direction: column; gap: 1.25rem; flex: 1; }
        .stat-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .stat-card { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 1rem 1.25rem; cursor: pointer; transition: border-color 0.15s; }
        .stat-card:hover { border-color: var(--gold); }
        .stat-card.active { border-color: var(--brown); border-width: 2px; }
        .stat-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .stat-number { font-size: 26px; font-weight: 700; }
        .filter-bar { background: #fff; border: 1px solid var(--border); border-radius: 12px; padding: 1rem 1.25rem; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .search-wrap { flex: 1; min-width: 220px; position: relative; display: flex; align-items: center; }
        .search-icon { position: absolute; left: 11px; color: var(--text-sub); pointer-events: none; display: flex; align-items: center; }
        .search-input { width: 100%; height: 40px; padding: 0 12px 0 36px; border: 1.5px solid var(--border); border-radius: 9px; font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif; background: var(--cream); color: var(--text); outline: none; transition: border-color 0.15s; }
        .search-input::placeholder { color: #C0A882; }
        .search-input:focus { border-color: var(--brown); background: #fff; }
        .filter-select { height: 40px; padding: 0 30px 0 12px; border: 1.5px solid var(--border); border-radius: 9px; font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif; background: var(--cream); color: var(--text); outline: none; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237A5C44' stroke-width='2' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; transition: border-color 0.15s; min-width: 155px; }
        .filter-select:focus { border-color: var(--brown); }
        .section-card { background: #fff; border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
        .table-wrap { overflow-x: auto; }
        .ticket-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 700px; }
        .ticket-table th { padding: 0.7rem 1.25rem; text-align: left; font-size: 11px; font-weight: 700; color: var(--text-sub); letter-spacing: 0.5px; text-transform: uppercase; background: #FDFAF6; border-bottom: 1px solid var(--border); white-space: nowrap; }
        .ticket-table td { padding: 0.9rem 1.25rem; border-bottom: 1px solid #F5EDE0; vertical-align: middle; }
        .ticket-table tr:last-child td { border-bottom: none; }
        .ticket-row { cursor: pointer; transition: background 0.1s; }
        .ticket-row:hover td { background: #FDFAF6; }
        .ticket-id { font-weight: 700; color: var(--brown); }
        .employee-name { font-weight: 600; font-size: 13px; color: var(--text); }
        .employee-dept { font-size: 11px; color: var(--text-sub); margin-top: 2px; }
        .issue-text { font-size: 13px; color: var(--text); max-width: 260px; }
        .issue-cat { font-size: 11px; color: var(--text-sub); margin-top: 2px; }
        .time-cell { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--text-sub); white-space: nowrap; }
        .notes-pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 12px; background: #F5F0FF; color: #6B35B5; font-size: 11px; font-weight: 600; }
        .empty-cell { text-align: center; padding: 2.5rem; color: var(--text-sub); font-size: 13px; }
        @media (max-width: 768px) {
  .topbar { padding: 0 1rem; }
  .page-header { padding: 1.25rem 1rem 0; }
  .page-title { font-size: 1.3rem; }
  .page-content { padding: 0.75rem 1rem; }
  .stat-strip { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .stat-number { font-size: 20px; }
  .filter-bar { padding: 0.75rem; }
  .search-wrap { min-width: 100%; }
  .filter-select { width: 100%; }
}
@media (max-width: 480px) {
  .stat-strip { grid-template-columns: repeat(2, 1fr); }
  .topbar-title { font-size: 11px; }
}
      `}</style>

      <div className="page-root">
        {/* Topbar */}
        <div className="topbar">
          <p className="topbar-title">
            National Treasury &nbsp;/&nbsp; <span>All Tickets</span>
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#6B2D0F",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {techInitials}
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#1A0F08" }}>
                {fullName}
              </p>
              <p style={{ fontSize: 10, color: "#7A5C44" }}>{specialization}</p>
            </div>
          </div>
        </div>

        {/* Page header */}
        <div className="page-header">
          <h1 className="page-title">All Tickets</h1>
          <p className="page-sub">
            Tickets auto-assigned to you based on your specialization —{" "}
            <strong style={{ color: "#6B2D0F" }}>
              {ictProfile?.specialization
                ? specializationLabel[ictProfile.specialization]
                : "—"}
            </strong>
          </p>
        </div>

        <div className="page-content">
          {/* Stat strip */}
          <div className="stat-strip">
            {[
              { key: "open" as const, label: "Open", color: "#BB0000" },
              {
                key: "in_progress" as const,
                label: "In Progress",
                color: "#C8962E",
              },
              { key: "resolved" as const, label: "Resolved", color: "#1E6B33" },
              {
                key: "escalated" as const,
                label: "Escalated",
                color: "#6B35B5",
              },
            ].map((s) => (
              <div
                key={s.key}
                className={`stat-card${statusFilter === s.key ? " active" : ""}`}
                onClick={() =>
                  setStatusFilter(statusFilter === s.key ? "all" : s.key)
                }
              >
                <p className="stat-label" style={{ color: s.color }}>
                  {s.label}
                </p>
                <p className="stat-number" style={{ color: s.color }}>
                  {counts[s.key]}
                </p>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div className="filter-bar">
            <div className="search-wrap">
              <span className="search-icon">
                <Search size={15} />
              </span>
              <input
                type="text"
                className="search-input"
                placeholder="Search by ticket ID, employee, or issue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="section-card">
            <div
              style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid #EDE0D0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <p style={{ fontWeight: 700, fontSize: 14, color: "#1A0F08" }}>
                Assigned Tickets
              </p>
              <span
                style={{
                  fontSize: 12,
                  color: "#7A5C44",
                  background: "#FDF8F2",
                  padding: "3px 10px",
                  borderRadius: 20,
                  border: "1px solid #EDE0D0",
                }}
              >
                {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="table-wrap">
              {loading ? (
                <p
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "#7A5C44",
                    fontSize: 13,
                  }}
                >
                  Loading tickets...
                </p>
              ) : filtered.length === 0 ? (
                <p
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "#7A5C44",
                    fontSize: 13,
                  }}
                >
                  No tickets found.
                </p>
              ) : (
                <table className="ticket-table">
                  <thead>
                    <tr>
                      <th>Date/Time</th>
                      <th>Ticket ID</th>
                      <th>Issue</th>
                      <th>Category</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr
                        key={t.id}
                        className="ticket-row"
                        onClick={() => setSelectedTicket(t)}
                      >
                        <td>
                          <div
                            style={{
                              fontWeight: 600,
                              color: "#1A0F08",
                              fontSize: 13,
                            }}
                          >
                            {new Date(t.created_at).toLocaleDateString()}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#7A5C44",
                              marginTop: 2,
                            }}
                          >
                            {new Date(t.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>
                        <td className="ticket-id">
                          TKT-{String(t.id).padStart(3, "0")}
                        </td>
                        <td>
                          <div className="issue-text">{t.title}</div>
                          <div className="issue-cat">{t.description}</div>
                        </td>
                        <td style={{ color: "#7A5C44", fontSize: 12 }}>
                          {t.category}
                        </td>
                        <td>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "3px 10px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 600,
                              background:
                                t.status.toLowerCase() === "open"
                                  ? "#FEF2F2"
                                  : t.status.toLowerCase() === "in_progress"
                                    ? "#FFF8E0"
                                    : t.status.toLowerCase() === "closed"
                                      ? "#F0FFF4"
                                      : "#F5F0FF",
                              color:
                                t.status.toLowerCase() === "open"
                                  ? "#BB0000"
                                  : t.status.toLowerCase() === "in_progress"
                                    ? "#C8962E"
                                    : t.status.toLowerCase() === "closed"
                                      ? "#1E6B33"
                                      : "#6B35B5",
                            }}
                          >
                            {t.status.toLowerCase() === "open"
                              ? "Open"
                              : t.status.toLowerCase() === "in_progress"
                                ? "In Progress"
                                : t.status.toLowerCase() === "closed"
                                  ? "Resolved"
                                  : t.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}
