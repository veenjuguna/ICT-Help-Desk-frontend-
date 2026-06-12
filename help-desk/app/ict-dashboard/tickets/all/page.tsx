"use client";

import { useState } from "react";
import {
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  X,
  MessageSquare,
} from "lucide-react";
import TicketTable from "@/components/ticket-table";

type TicketStatus = "open" | "in_progress" | "resolved" | "escalated";
type TicketPriority = "High" | "Medium" | "Low";

interface Note {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

interface Ticket {
  id: string;
  employee: string;
  dept: string;
  issue: string;
  category: string;
  priority: TicketPriority;
  created: string;
  status: TicketStatus;
  assignedReason: string;
  notes: Note[];
}

const MOCK_TECHNICIAN = {
  name: "Brian Mutuku",
  specialization: ["Hardware", "Network"],
};

const INITIAL_TICKETS: Ticket[] = [
  {
    id: "TKT-031",
    employee: "Ann Mwangi",
    dept: "Revenue",
    issue: "Desktop screen flickering continuously",
    category: "Hardware",
    priority: "High",
    created: "Today, 08:12 AM",
    status: "open",
    assignedReason: "Matched your Hardware specialization",
    notes: [],
  },
  {
    id: "TKT-032",
    employee: "Patrick Ouma",
    dept: "Procurement",
    issue: "USB ports not working on workstation",
    category: "Hardware",
    priority: "Medium",
    created: "Today, 09:30 AM",
    status: "in_progress",
    assignedReason: "Matched your Hardware specialization",
    notes: [
      {
        id: "n1",
        author: "Brian Mutuku",
        content:
          "Checked device manager — USB controller showing error code 43. Running driver update.",
        timestamp: "Today, 10:00 AM",
      },
    ],
  },
  {
    id: "TKT-033",
    employee: "Linda Chebet",
    dept: "Planning",
    issue: "Cannot access shared printer on floor 3",
    category: "Network",
    priority: "Medium",
    created: "Today, 10:05 AM",
    status: "open",
    assignedReason: "Matched your Network specialization",
    notes: [],
  },
  {
    id: "TKT-034",
    employee: "James Kariuki",
    dept: "Finance",
    issue: "Laptop not connecting to VPN",
    category: "Network",
    priority: "High",
    created: "Yesterday, 04:45 PM",
    status: "escalated",
    assignedReason: "Matched your Network specialization",
    notes: [
      {
        id: "n2",
        author: "Brian Mutuku",
        content:
          "Escalated to CIRT — possible VPN policy issue affecting entire Finance subnet.",
        timestamp: "Yesterday, 05:10 PM",
      },
    ],
  },
  {
    id: "TKT-028",
    employee: "Grace Wanjiku",
    dept: "ICT",
    issue: "Keyboard keys sticking and unresponsive",
    category: "Hardware",
    priority: "Low",
    created: "Yesterday, 02:00 PM",
    status: "resolved",
    assignedReason: "Matched your Hardware specialization",
    notes: [
      {
        id: "n3",
        author: "Brian Mutuku",
        content: "Replaced keyboard. Issue resolved.",
        timestamp: "Yesterday, 03:30 PM",
      },
    ],
  },
];

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; bg: string; color: string }
> = {
  open: { label: "Open", bg: "#FEF2F2", color: "#BB0000" },
  in_progress: { label: "In Progress", bg: "#FFF8E0", color: "#C8962E" },
  resolved: { label: "Resolved", bg: "#F0FFF4", color: "#1E6B33" },
  escalated: { label: "Escalated", bg: "#F5F0FF", color: "#6B35B5" },
};

const PRIORITY_COLORS: Record<TicketPriority, { bg: string; color: string }> = {
  High: { bg: "#FFF0F0", color: "#BB0000" },
  Medium: { bg: "#FFF8E0", color: "#C8962E" },
  Low: { bg: "#F0FFF4", color: "#1E6B33" },
};

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

const STATUS_OPTIONS: TicketStatus[] = [
  "open",
  "in_progress",
  "resolved",
  "escalated",
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TicketStatus }) {
  const s = STATUS_CONFIG[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: s.bg,
        color: s.color,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {s.label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const p = PRIORITY_COLORS[priority];
  return (
    <span
      style={{
        background: p.bg,
        color: p.color,
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {priority}
    </span>
  );
}

// ─── Ticket Detail Panel ─────────────────────────────────────────────────────

function TicketDetail({
  ticket,
  onClose,
  onStatusChange,
  onAddNote,
}: {
  ticket: Ticket;
  onClose: () => void;
  onStatusChange: (id: string, status: TicketStatus) => void;
  onAddNote: (id: string, note: string) => void;
}) {
  const [noteText, setNoteText] = useState("");
  const [statusDropdown, setStatusDropdown] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleStatusChange = (newStatus: TicketStatus) => {
    setStatusDropdown(false);
    onStatusChange(ticket.id, newStatus);
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    onAddNote(ticket.id, noteText.trim());
    setNoteText("");
    setSaving(false);
  };

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
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          {/* Issue */}
          <div>
            <p
              style={{
                fontSize: 11,
                color: "#7A5C44",
                marginBottom: 6,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Issue
            </p>
            <p style={{ fontSize: 14, color: "#1A0F08", lineHeight: 1.6 }}>
              {ticket.issue}
            </p>
          </div>

          {/* Info grid */}
          <div
            style={{
              background: "#FDF8F2",
              borderRadius: 10,
              padding: "0.9rem 1rem",
              border: "1px solid #EDE0D0",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
              }}
            >
              {(
                [
                  ["Employee", ticket.employee],
                  ["Department", ticket.dept],
                  ["Category", ticket.category],
                  ["Created", ticket.created],
                ] as [string, string][]
              ).map(([label, value]) => (
                <div key={label}>
                  <p
                    style={{ fontSize: 11, color: "#7A5C44", marginBottom: 2 }}
                  >
                    {label}
                  </p>
                  <p
                    style={{ fontSize: 13, color: "#1A0F08", fontWeight: 600 }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Priority + Status */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, color: "#7A5C44", marginBottom: 6 }}>
                Priority
              </p>
              <PriorityBadge priority={ticket.priority} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: "#7A5C44", marginBottom: 6 }}>
                Status
              </p>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setStatusDropdown((v) => !v)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#FDF8F2",
                    border: "1px solid #C8962E",
                    borderRadius: 8,
                    padding: "5px 10px",
                    cursor: "pointer",
                    fontSize: 13,
                    color: "#1A0F08",
                    fontFamily: "inherit",
                  }}
                >
                  <StatusBadge status={ticket.status} />
                  <ChevronDown size={13} style={{ color: "#7A5C44" }} />
                </button>
                {statusDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "110%",
                      left: 0,
                      background: "#fff",
                      border: "1px solid #EDE0D0",
                      borderRadius: 10,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                      zIndex: 10,
                      minWidth: 180,
                      overflow: "hidden",
                    }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          width: "100%",
                          padding: "10px 14px",
                          background:
                            s === ticket.status ? "#FDF8F2" : "transparent",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 13,
                          color: "#1A0F08",
                          fontFamily: "inherit",
                          textAlign: "left",
                        }}
                      >
                        <StatusBadge status={s} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Assignment reason */}
          <div
            style={{
              background: "#F5F0FF",
              borderRadius: 8,
              padding: "0.7rem 1rem",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <AlertTriangle
              size={13}
              style={{ color: "#6B35B5", flexShrink: 0 }}
            />
            <p style={{ fontSize: 12, color: "#4A1E8A" }}>
              {ticket.assignedReason}
            </p>
          </div>

          {/* Mark as resolved shortcut */}
          {ticket.status !== "resolved" && (
            <button
              onClick={() => handleStatusChange("resolved")}
              style={{
                width: "100%",
                height: 40,
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

          {/* Notes */}
          <div>
            <p
              style={{
                fontSize: 12,
                color: "#7A5C44",
                marginBottom: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <MessageSquare size={13} />
              Notes &amp; Updates
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ticket.notes.length === 0 && (
                <p
                  style={{
                    fontSize: 13,
                    color: "#C0A882",
                    fontStyle: "italic",
                  }}
                >
                  No notes yet.
                </p>
              )}
              {ticket.notes.map((note) => (
                <div
                  key={note.id}
                  style={{
                    background: "#FDF8F2",
                    border: "1px solid #EDE0D0",
                    borderRadius: 9,
                    padding: "0.8rem 1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#6B2D0F",
                      }}
                    >
                      {note.author}
                    </p>
                    <p style={{ fontSize: 11, color: "#7A5C44" }}>
                      {note.timestamp}
                    </p>
                  </div>
                  <p
                    style={{ fontSize: 13, color: "#1A0F08", lineHeight: 1.6 }}
                  >
                    {note.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Add note */}
            <div style={{ marginTop: 12 }}>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note or update..."
                rows={3}
                style={{
                  width: "100%",
                  border: "1.5px solid #EDE0D0",
                  borderRadius: 9,
                  padding: "10px 12px",
                  fontSize: 13,
                  fontFamily: "inherit",
                  color: "#1A0F08",
                  background: "#FDFAF6",
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
              <button
                onClick={handleAddNote}
                disabled={!noteText.trim() || saving}
                style={{
                  marginTop: 8,
                  height: 36,
                  padding: "0 1.25rem",
                  background:
                    saving || !noteText.trim() ? "#C0A882" : "#6B2D0F",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor:
                    saving || !noteText.trim() ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {saving ? "Saving..." : "Add Note"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AllTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleStatusChange = (id: string, newStatus: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    );
    setSelectedTicket((prev) =>
      prev?.id === id ? { ...prev, status: newStatus } : prev,
    );
  };

  const handleAddNote = (id: string, content: string) => {
    const newNote: Note = {
      id: `n${Date.now()}`,
      author: MOCK_TECHNICIAN.name,
      content,
      timestamp: "Just now",
    };
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, notes: [...t.notes, newNote] } : t,
      ),
    );
    setSelectedTicket((prev) =>
      prev?.id === id ? { ...prev, notes: [...prev.notes, newNote] } : prev,
    );
  };

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    return (
      (!q ||
        t.id.toLowerCase().includes(q) ||
        t.employee.toLowerCase().includes(q) ||
        t.issue.toLowerCase().includes(q)) &&
      (categoryFilter === "All Categories" || t.category === categoryFilter) &&
      (statusFilter === "all" || t.status === statusFilter)
    );
  });

  const counts = {
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    escalated: tickets.filter((t) => t.status === "escalated").length,
  };

  const techInitials = MOCK_TECHNICIAN.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
                {MOCK_TECHNICIAN.name}
              </p>
              <p style={{ fontSize: 10, color: "#7A5C44" }}>
                {MOCK_TECHNICIAN.specialization.join(", ")}
              </p>
            </div>
          </div>
        </div>

        {/* Page header */}
        <div className="page-header">
          <h1 className="page-title">All Tickets</h1>
          <p className="page-sub">
            Tickets auto-assigned to you based on your specialization —{" "}
            <strong style={{ color: "#6B2D0F" }}>
              {MOCK_TECHNICIAN.specialization.join(" & ")}
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
              <TicketTable />
            </div>
          </div>
        </div>
      </div>

      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
        />
      )}
    </>
  );
}
