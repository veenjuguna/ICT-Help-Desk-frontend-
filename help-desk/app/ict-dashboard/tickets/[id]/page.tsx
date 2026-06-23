"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Inter, Playfair_Display } from "next/font/google";
import { ArrowLeft, Send, User, Clock, Check, Loader2 } from "lucide-react";
import { ticketStatusStore } from "../ticketStore";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"] });

const API = process.env.NEXT_PUBLIC_API_URL;

const COLORS = {
  primary: "#C8962E",
  primaryDark: "#b08326",
};

// ── Status colour + label maps ────────────────────────────────────────────────
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  open:        { bg: "#E3F2FD", color: "#1976D2" },
  in_progress: { bg: "#FFF8E0", color: "#C8962E" },
  resolved:    { bg: "#E8F5E9", color: "#2D6B0F" },
  unresolved:  { bg: "#FCE4EC", color: "#C62828" },
};

const STATUS_LABEL: Record<string, string> = {
  open:        "Open",
  in_progress: "In Progress",
  resolved:    "Resolved",
  unresolved:  "Unresolved",
};

// ── Types ─────────────────────────────────────────────────────────────────────
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

// Used to resolve staff_id → human-readable profile via GET /staff/{id}/basic.
// The /basic endpoint is accessible by any authenticated staff member,
// unlike the full GET /{staff_id} which is admin-only.
type StaffBasic = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;    // FIX: was personal_number — this is the contact number
  office_number: string | null;
  office_location: string | null;
};

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? { bg: "#eee", color: "#333" };
  return (
    <span style={{
      background: s.bg, color: s.color, padding: "5px 14px",
      borderRadius: "20px", fontSize: "13px", fontWeight: 600,
    }}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TicketDetailPage() {
  const params   = useParams();
  const router   = useRouter();
  const ticketId = Number(params.id);

  const [ticket, setTicket]       = useState<Ticket | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  // Resolved staff profile of whoever raised this ticket.
  // Fetched via GET /staff/{staff_id}/basic after the ticket loads.
  const [raisedBy, setRaisedBy]   = useState<StaffBasic | null>(null);

  const [currentStatus, setCurrentStatus] = useState("");
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Fetch the ticket
        const res = await fetch(`${API}/tickets/${ticketId}`, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setError(
              `Session error (${res.status}) — your login session may have expired. Please log out and log in again.`
            );
            return;
          }
          if (res.status === 404) throw new Error("Ticket not found");
          throw new Error(`Error loading ticket (${res.status})`);
        }

        const data: Ticket = await res.json();
        setTicket(data);

        const liveStatus = ticketStatusStore[data.id] ?? data.status;
        setCurrentStatus(liveStatus);

        // Step 2: Resolve staff_id → full profile using the /basic endpoint.
        // Accessible by any authenticated staff member (not admin-only).
        // Falls back gracefully to "Unknown Staff" if the fetch fails.
        if (data.staff_id) {
          const staffRes = await fetch(`${API}/staff/${data.staff_id}/basic`, {
            credentials: "include",
          });
          if (staffRes.ok) {
            setRaisedBy(await staffRes.json());
          }
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (!isNaN(ticketId)) fetchTicket();
  }, [ticketId]);

  // FIX: ICT personnel can only mark a ticket resolved or unresolved.
  // They cannot change status freely between open/in_progress — that is
  // controlled by the ticket lifecycle (assignment, escalation, etc).
  // Each button fires immediately as a direct action, no pending/confirm flow.
  const handleMarkResolution = async (resolution: "resolved" | "unresolved") => {
    if (!ticket) return;
    try {
      setSaving(true);
      setSaveError(null);

      const res = await fetch(`${API}/tickets/${ticket.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: resolution }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `Failed to update (${res.status})`);
      }

      const updated: Ticket = await res.json();
      setTicket(updated);
      setCurrentStatus(updated.status);
      ticketStatusStore[ticket.id] = updated.status;
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const assignedAgo = (() => {
    if (!ticket) return "";
    const diff = Date.now() - new Date(ticket.created_at).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  })();

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "#FDF8F2", flexDirection: "column", gap: "16px",
      }}>
        <style>{`@keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }`}</style>
        <Loader2 size={32} color={COLORS.primary} style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ color: "#666", fontSize: "14px" }}>Loading ticket...</p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error || !ticket) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "100vh", background: "#FDF8F2",
        gap: "16px", padding: "2rem", textAlign: "center",
      }}>
        <div style={{ fontSize: "48px" }}>⚠️</div>
        <h2 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
          {error ?? "Ticket not found"}
        </h2>
        <div style={{ display: "flex", gap: "12px" }}>
          <button onClick={() => router.back()} style={{
            background: COLORS.primary, color: "#fff", border: "none",
            padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 500,
          }}>
            Go Back
          </button>
          <button onClick={() => router.push("/login")} style={{
            background: "#fff", color: "#444", border: "1px solid #ddd",
            padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 500,
          }}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={inter.className} style={{
      padding: "2rem", background: "#FDF8F2", minHeight: "100vh",
    }}>
      <style>{`@keyframes spin { from{transform:rotate(0deg)}to{transform:rotate(360deg)} }`}</style>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "28px", flexWrap: "wrap", gap: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button onClick={() => router.back()} style={{
              background: "#fff", border: "1px solid #e0e0e0", borderRadius: "8px",
              padding: "8px", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <ArrowLeft size={18} color="#444" />
            </button>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <h1 style={{
                  fontFamily: "Playfair Display, serif", fontSize: "26px",
                  fontWeight: 700, margin: 0, color: "#1a1a1a",
                }}>
                  Ticket #{ticket.id}
                </h1>
                <StatusBadge status={currentStatus} />
              </div>
              <p style={{ color: "#888", fontSize: "13px", margin: "4px 0 0 0", display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={12} /> Opened {assignedAgo}
              </p>
            </div>
          </div>

          <button style={{
            background: "#fff", color: "#444", border: "1px solid #ddd",
            padding: "10px 18px", borderRadius: "8px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "8px",
            fontSize: "13px", fontWeight: 500, boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <Send size={14} /> Transfer Ticket
          </button>
        </div>

        {/* ── Main Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px", alignItems: "start" }}>

          {/* ── LEFT ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Issue Details */}
            <div style={{
              background: "#fff", borderRadius: "12px", border: "1px solid #eee",
              padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 20px 0", color: "#1a1a1a" }}>
                Issue Details
              </h2>

              <div style={{ marginBottom: "16px" }}>
                <p style={labelStyle}>Title</p>
                <p style={valueStyle}>{ticket.title}</p>
              </div>

              <div style={{ borderTop: "1px solid #f5f5f5", paddingTop: "16px", marginBottom: "16px" }}>
                <p style={labelStyle}>Category</p>
                <p style={{ ...valueStyle, textTransform: "capitalize" }}>
                  {ticket.category.replace(/_/g, " ")}
                </p>
              </div>

              <div style={{ borderTop: "1px solid #f5f5f5", paddingTop: "16px", marginBottom: "16px" }}>
                <p style={labelStyle}>Description</p>
                <p style={{ fontSize: "14px", color: "#444", margin: 0, lineHeight: "1.7" }}>
                  {ticket.description}
                </p>
              </div>

              <div style={{ borderTop: "1px solid #f5f5f5", paddingTop: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <p style={labelStyle}>Created</p>
                  <p style={valueStyle}>
                    {new Date(ticket.created_at).toLocaleString("en-KE", {
                      day: "numeric", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                {ticket.closed_at && (
                  <div>
                    <p style={labelStyle}>Closed</p>
                    <p style={valueStyle}>
                      {new Date(ticket.closed_at).toLocaleString("en-KE", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                )}
              </div>

              {ticket.comment && (
                <div style={{ borderTop: "1px solid #f5f5f5", paddingTop: "16px", marginTop: "4px" }}>
                  <p style={labelStyle}>Technician Comment</p>
                  <p style={{ fontSize: "14px", color: "#444", margin: 0, lineHeight: "1.7" }}>
                    {ticket.comment}
                  </p>
                </div>
              )}
            </div>

            {/* FIX: Renamed from "Update Ticket Status" to "Mark Ticket Resolution".
                ICT personnel can only mark resolved or unresolved — they cannot
                freely change status between open/in_progress. Each button fires
                immediately as a direct action with no pending/confirm flow. */}
            <div style={{
              background: "#fff", borderRadius: "12px", border: "1px solid #eee",
              padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 8px 0", color: "#1a1a1a" }}>
                Mark Ticket Resolution
              </h2>
              <p style={{ fontSize: "13px", color: "#888", margin: "0 0 16px 0" }}>
                Mark this ticket as resolved once the issue is fixed, or unresolved if it could not be completed.
              </p>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>

                {/* Resolved button — green accent when already resolved */}
                <button
                  onClick={() => handleMarkResolution("resolved")}
                  disabled={saving || currentStatus === "resolved"}
                  style={{
                    background: currentStatus === "resolved" ? "#E8F5E9" : "#fff",
                    color: currentStatus === "resolved" ? "#2D6B0F" : "#444",
                    border: `1px solid ${currentStatus === "resolved" ? "#2D6B0F" : "#ddd"}`,
                    padding: "9px 18px", borderRadius: "8px",
                    cursor: saving || currentStatus === "resolved" ? "not-allowed" : "pointer",
                    fontSize: "13px", fontWeight: 600, transition: "all 0.15s ease",
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  {saving ? (
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Saving...
                    </span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Check size={14} /> Mark Resolved
                    </span>
                  )}
                </button>

                {/* Unresolved button — red accent when already unresolved */}
                <button
                  onClick={() => handleMarkResolution("unresolved")}
                  disabled={saving || currentStatus === "unresolved"}
                  style={{
                    background: currentStatus === "unresolved" ? "#FCE4EC" : "#fff",
                    color: currentStatus === "unresolved" ? "#C62828" : "#444",
                    border: `1px solid ${currentStatus === "unresolved" ? "#C62828" : "#ddd"}`,
                    padding: "9px 18px", borderRadius: "8px",
                    cursor: saving || currentStatus === "unresolved" ? "not-allowed" : "pointer",
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

                {/* Error message */}
                {saveError && (
                  <span style={{ fontSize: "13px", color: "#C62828", fontWeight: 500 }}>
                    ⚠️ {saveError}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Raised By — resolved from GET /staff/{staff_id}/basic */}
            <div style={{
              background: "#fff", borderRadius: "12px", border: "1px solid #eee",
              padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 20px 0", color: "#1a1a1a" }}>
                Raised By
              </h2>

              {/* Avatar + name + email */}
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

              {/* Labelled contact + location fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>

                {/* FIX: Replaced personal_number with phone_number — actual contact field */}
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
                Contact Employee
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
                    {ticket.assigned_to_id ? `Technician #${ticket.assigned_to_id}` : "Unassigned (Queued)"}
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

          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared label/value styles ─────────────────────────────────────────────────
const labelStyle = {
  fontSize: "12px", color: "#888", textTransform: "uppercase" as const,
  letterSpacing: "0.5px", margin: "0 0 4px 0", fontWeight: 600,
};

const valueStyle = { fontSize: "14px", color: "#1a1a1a", margin: 0 };