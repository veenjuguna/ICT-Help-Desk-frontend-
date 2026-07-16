//pending tickets page
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Eye, Loader2 } from "lucide-react";
import { Inter, Playfair_Display } from "next/font/google";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"] });

const API = process.env.NEXT_PUBLIC_API_URL;

const COLORS = {
  primary: "#C8962E",
  primaryDark: "#b08326",
  open: { bg: "#E3F2FD", color: "#1976D2" },
  in_progress: { bg: "#FFF8E0", color: "#C8962E" },
  closed: { bg: "#E8F5E9", color: "#2D6B0F" },
  unresolved: { bg: "#FCE4EC", color: "#C62828" },
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  open: COLORS.open,
  in_progress: COLORS.in_progress,
  closed: COLORS.closed,
};

const STATUS_LABEL: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  closed: "Resolved",
};

type Ticket = {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  staff_id: string;
  assigned_to_id: number | null;
  created_at: string;
  closed_at: string | null;
  comment: string | null;
};

function StatusBadge({ status, comment }: { status: string; comment: string | null }) {
  // closed + comment present means the tech marked it unresolved
  const isUnresolved = status === "closed" && !!comment;
  const s = isUnresolved
    ? COLORS.unresolved
    : STATUS_COLORS[status] ?? { bg: "#eee", color: "#333" };
  const label = isUnresolved ? "Unresolved" : STATUS_LABEL[status] ?? status;

  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 600,
        display: "inline-block",
      }}
    >
      {label}
    </span>
  );
}

async function fetchTickets(): Promise<Ticket[]> {
  const res = await fetch(`${API}/tickets/`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        `Authentication error (${res.status}) — session may not be set or cookie is blocked cross-origin`,
      );
    }
    throw new Error(`Failed to load tickets (${res.status})`);
  }
  return res.json();
}

export default function PendingTicketsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const {
    data: tickets = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["ict-tickets"],
    queryFn: fetchTickets,
    refetchInterval: 30_000,
  });

  const error =
    queryError instanceof Error
      ? queryError.message
      : queryError
        ? "Something went wrong"
        : null;

 // True pending queue: assigned to a technician, but that technician
// hasn't opened it yet (still "open", not "in_progress" or "closed").
  const pendingTickets = tickets.filter(
  (t) => t.status === "open" && t.assigned_to_id !== null
);

  const stats = [
    { label: "Total Tickets", value: tickets.length },
    { label: "Open", value: tickets.filter((t) => t.status === "open").length },
    {
      label: "In Progress",
      value: tickets.filter((t) => t.status === "in_progress").length,
    },
    {
      label: "Closed",
      value: tickets.filter((t) => t.status === "closed").length,
    },
  ];

  const filteredTickets = pendingTickets.filter((ticket) => {
    const term = searchTerm.toLowerCase();
    return (
      String(ticket.id).includes(term) ||
      ticket.title.toLowerCase().includes(term) ||
      ticket.category.toLowerCase().includes(term) ||
      (STATUS_LABEL[ticket.status] ?? ticket.status).toLowerCase().includes(term)
    );
  });

  const handleView = (ticketId: number) => {
    router.push(`/ict-dashboard/tickets/${ticketId}`);
  };

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#FDF8F2",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <Loader2
          size={32}
          color={COLORS.primary}
          style={{ animation: "spin 1s linear infinite" }}
        />
        <p style={{ color: "#666", fontSize: "14px" }}>Loading tickets...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────
  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#FDF8F2",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ fontSize: "48px" }}>⚠️</div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
          Failed to load tickets
        </h2>
        <p
          style={{
            color: "#666",
            margin: 0,
            fontSize: "14px",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          {error}
        </p>
        <button
          onClick={() => refetch()}
          style={{
            background: COLORS.primary,
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      className={inter.className}
      style={{
        padding: "2rem",
        background: "#FDF8F2",
        minHeight: "100vh",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* HEADER */}
        <div style={{ marginBottom: "24px" }}>
          <h1
            className={playfair.className}
            style={{
              fontSize: "32px",
              fontWeight: 700,
              marginBottom: "6px",
              color: "#1a1a1a",
            }}
          >
            Pending Tickets
          </h1>
          <p style={{ color: "#666", marginBottom: "0", fontSize: "14px" }}>
            Technician work queue —Assigned tickets awaiting pickup
          </p>
        </div>

        {/* STATS ROW */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #eee",
                transition: "all 0.2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
              }}
            >
              <p
                style={{ fontSize: "13px", color: "#666", margin: "0 0 8px 0" }}
              >
                {s.label}
              </p>
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  margin: 0,
                  color: "#1a1a1a",
                }}
              >
                {s.value}
              </h2>
            </div>
          ))}
        </div>

        {/* SEARCH */}
        <div
          style={{
            background: "#fff",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid #eee",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <Search size={18} color="#666" />
          <input
            type="text"
            placeholder="Search pending tickets by ID, title, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              width: "100%",
              fontSize: "14px",
              background: "transparent",
            }}
          />
        </div>

            {/* FIX: Renamed from "Update Ticket Status" to "Mark Ticket Resolution".
                ICT personnel can only mark resolved or unresolved — they cannot
                freely change status between open/in_progress. Each button fires
                immediately as a direct action with no pending/confirm flow. */}
              {canMarkResolution &&
            <div style={{
              background: "#fff", borderRadius: "12px", border: "1px solid #eee",
              padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 8px 0", color: "#1a1a1a" }}>
                Mark Ticket Resolution
              </h2>
              <p style={{ fontSize: "13px", color: "#888", margin: "0 0 16px 0" }}>
                Mark this ticket as resolved once the issue is fixed, or add a note if it needs admin follow-up.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "700px",
                }}
              />

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>

                {/* Resolved button — green accent when already resolved */}
                <button
                  onClick={() => handleMarkResolution("resolved")}
                  disabled={saving || currentStatus === "closed"}
                  style={{
                    background: currentStatus === "closed" && !ticket.comment ? "#E8F5E9" : "#fff",
                    color: currentStatus === "closed" && !ticket.comment ? "#2D6B0F" : "#444",
                    border: `1px solid ${currentStatus === "closed" && !ticket.comment ? "#2D6B0F" : "#ddd"}`,
                    padding: "9px 18px", borderRadius: "8px",
                    cursor: saving || currentStatus === "closed" ? "not-allowed" : "pointer",
                    fontSize: "13px", fontWeight: 600, transition: "all 0.15s ease",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving && (
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Saving...
                    </span>
                  )}

                  {saveError && (
                    <span style={{ fontSize: "13px", color: "#C62828", fontWeight: 500 }}>
                      ⚠️ {saveError}
                    </span>
                  )}
                </button>

                {/* Unresolved button — red accent when already unresolved */}
                <button
                  onClick={() => handleMarkResolution("unresolved")}
                  disabled={saving || currentStatus === "closed"}
                  style={{
                    background: currentStatus === "closed" && ticket.comment ? "#FCE4EC" : "#fff",
                    color: currentStatus === "closed" && ticket.comment ? "#C62828" : "#444",
                    border: `1px solid ${currentStatus === "closed" && ticket.comment ? "#C62828" : "#ddd"}`,
                    padding: "9px 18px", borderRadius: "8px",
                    cursor: saving || currentStatus === "closed" ? "not-allowed" : "pointer",
                    fontSize: "13px", fontWeight: 600, transition: "all 0.15s ease",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  Mark Unresolved
                </button>

                {/* Success confirmation */}
                {saved && (
                  <span style={{ fontSize: "13px", color: "#2D6B0F", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
                    <Check size={13} /> Ticket updated
                  </span>
                )}

                {/* Contextual hints */}
                <div style={{ marginTop: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>
                    ✓ <strong>Mark Resolved</strong> — staff will be asked to confirm the fix. You are released immediately.
                  </p>
                  <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>
                    ⚠ <strong>Mark Unresolved</strong> — ticket moves to team view for another technician to pick up. You are released immediately.
                  </p>
                </div>
              </div>
              </div>
              }

            {/* Status info panel — shown when ticket is not actionable */}
            {!canMarkResolution && (
              <div style={{
                background: "#fff", borderRadius: "12px", border: "1px solid #eee",
                padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}>
                <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 8px 0", color: "#1a1a1a" }}>
                  Ticket Status
                </h2>
                <div style={{
                  padding: "14px", borderRadius: "8px",
                  background: (STATUS_COLORS[currentStatus] ?? { bg: "#f5f5f5" }).bg,
                  border: `1px solid ${(STATUS_COLORS[currentStatus] ?? { color: "#ccc" }).color}30`,
                }}>
                  <p style={{ margin: 0, fontSize: "14px", color: (STATUS_COLORS[currentStatus] ?? { color: "#333" }).color, fontWeight: 600 }}>
                    {currentStatus === "pending_confirmation" &&
                      "Awaiting staff confirmation — the staff member has been notified to confirm the resolution."}
                    {currentStatus === "unresolved" &&
                      "This ticket is in the team view — any available technician can pick it up."}
                    {currentStatus === "closed" &&
                      "This ticket has been closed and confirmed by the staff member."}
                    {currentStatus === "reopened" &&
                      "Staff rejected the resolution — this ticket is back in the triage queue."}
                    {!["pending_confirmation", "unresolved", "closed", "reopened"].includes(currentStatus) &&
                      (STATUS_LABEL[currentStatus] ?? currentStatus)}
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Raised By */}
            <div style={{
              background: "#fff", borderRadius: "12px", border: "1px solid #eee",
              padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 20px 0", color: "#1a1a1a" }}>
                Raised By
              </h2>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: raisedBy ? "#7A3100" : "#f0f0f0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {raisedBy ? (
                    <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
                      {getInitials(raisedBy.full_name)}
                    </span>
                  ) : (
                    <User size={20} color="#888" />
                  )}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "15px", color: "#1a1a1a" }}>
                    {raisedBy?.full_name ?? "Unknown Staff"}
                  </p>
                  {raisedBy?.email && (
                    <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#888" }}>
                      {raisedBy.email}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <p style={labelStyle}>Phone Number</p>
                  <p style={valueStyle}>{raisedBy?.phone_number ?? "—"}</p>
                </div>
                <div>
                  <p style={labelStyle}>Office Number</p>
                  <p style={valueStyle}>{raisedBy?.office_number ?? "—"}</p>
                </div>
                <div>
                  <p style={labelStyle}>Office Location</p>
                  <p style={valueStyle}>{raisedBy?.office_location ?? "—"}</p>
                </div>
              </div>

              <button style={{
                width: "100%", background: COLORS.primaryDark, color: "#fff",
                border: "none", padding: "12px", borderRadius: "8px",
                cursor: "pointer", fontSize: "14px", fontWeight: 600,
              }}>
               Employee's Profile
              </button>
            </div>

            {/* Assignment Details */}
            <div style={{
              background: "#fff", borderRadius: "12px", border: "1px solid #eee",
              padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 20px 0", color: "#1a1a1a" }}>
                Assignment Details
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <p style={labelStyle}>Assigned To</p>
                  <p style={valueStyle}>
                    {ticket.assigned_to_id
                      ? `Technician #${ticket.assigned_to_id}`
                      : "Unassigned (Queued)"}
                  </p>
                </div>
                <div>
                  <p style={labelStyle}>Opened</p>
                  <p style={valueStyle}>
                    {new Date(ticket.created_at).toLocaleString("en-KE", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <p style={labelStyle}>Time Elapsed</p>
                  <p style={valueStyle}>{assignedAgo}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: "16px",
            fontSize: "13px",
            color: "#666",
            textAlign: "right",
          }}
        >
          Showing {filteredTickets.length} of {pendingTickets.length} pending tickets
        </div>
      </div>
    </div>
  );
}

const th = {
  textAlign: "left" as const,
  padding: "16px 14px",
  fontSize: "12px",
  fontWeight: 600,
  color: "#666",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  borderBottom: "2px solid #f0f0f0",
};

const td = {
  padding: "14px",
  fontSize: "13px",
  verticalAlign: "middle" as const,
};