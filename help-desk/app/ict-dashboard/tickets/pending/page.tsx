"use client";

import { useState, useEffect } from "react";
import { ticketStatusStore } from "../ticketStore";
import { Search, Eye, Loader2 } from "lucide-react";
import { Inter, Playfair_Display } from "next/font/google";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"] });

const API = process.env.NEXT_PUBLIC_API_URL;

const COLORS = {
  primary: "#C8962E",
  primaryDark: "#b08326",
};

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

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? { bg: "#eee", color: "#333" };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "4px 10px", borderRadius: "20px",
      fontSize: "11px", fontWeight: 600, display: "inline-block",
    }}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function timeAgo(dateStr: string): { text: string; urgent: boolean } {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  if (days === 0) return { text: hours <= 1 ? "Just now" : `${hours}h ago`, urgent: false };
  if (days === 1) return { text: "Yesterday", urgent: false };
  return { text: `${days} days ago`, urgent: days >= 3 };
}

export default function PendingTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [, forceUpdate] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API}/tickets/`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            setError(`Authentication error (${res.status}) — session may not be set or cookie is blocked cross-origin`);
            return;
          }
          throw new Error(`Failed to load tickets (${res.status})`);
        }
        const data: Ticket[] = await res.json();
        setTickets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
        forceUpdate((n) => n + 1);
      }
    };
    fetchTickets();
  }, [router]);

  const getStatus = (ticket: Ticket) =>
    ticketStatusStore[ticket.id] ?? ticket.status;

  const filteredTickets = tickets.filter((ticket) => {
    const term = searchTerm.toLowerCase();
    const liveStatus = getStatus(ticket);
    return (
      String(ticket.id).includes(term) ||
      ticket.title.toLowerCase().includes(term) ||
      ticket.category.toLowerCase().includes(term) ||
      (STATUS_LABEL[liveStatus] ?? liveStatus).toLowerCase().includes(term)
    );
  });

  const handleView = (ticketId: number) => {
    router.push(`/ict-dashboard/tickets/${ticketId}`);
  };

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "#FDF8F2",
        flexDirection: "column", gap: "16px",
      }}>
        <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        <Loader2 size={32} color={COLORS.primary} style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ color: "#666", fontSize: "14px" }}>Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "#FDF8F2",
        flexDirection: "column", gap: "16px",
        padding: "1rem", textAlign: "center",
      }}>
        <div style={{ fontSize: "48px" }}>⚠️</div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>Failed to load tickets</h2>
        <p style={{ color: "#666", margin: 0, fontSize: "14px", maxWidth: "400px" }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: COLORS.primary, color: "#fff", border: "none",
            padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: 500,
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .stats-strip::-webkit-scrollbar { display: none; }

        @media (max-width: 640px) {
          .pending-wrapper { padding: 1rem 1rem 2rem !important; }
          .desktop-table   { display: none !important; }
          .mobile-cards    { display: flex !important; }
          .stats-row-desktop { display: none !important; }
          .stats-row-mobile  { display: flex !important; }
        }
        @media (min-width: 641px) {
          .mobile-cards      { display: none !important; }
          .desktop-table     { display: block !important; }
          .stats-row-desktop { display: grid !important; }
          .stats-row-mobile  { display: none !important; }
        }
      `}</style>

      <div
        className={`${inter.className} pending-wrapper`}
        style={{
          padding: "2rem",
          background: "#FDF8F2",
          minHeight: "100vh",
        }}
      >
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

          {/* ── HEADER ── */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{
              display: "flex", alignItems: "center",
              gap: "10px", marginBottom: "4px",
            }}>
              <h1
                className={playfair.className}
                style={{ fontSize: "28px", fontWeight: 700, color: "#1a1a1a", margin: 0 }}
              >
                Pending Tickets
              </h1>
              {tickets.length > 0 && (
                <span style={{
                  background: COLORS.primary, color: "#fff",
                  borderRadius: "20px", padding: "2px 10px",
                  fontSize: "13px", fontWeight: 700, lineHeight: "1.6",
                }}>
                  {tickets.length}
                </span>
              )}
            </div>
            <p style={{ color: "#666", margin: 0, fontSize: "13px" }}>
              Technician work queue — Manage active and blocked issues
            </p>
          </div>

          {/* ── STATS: desktop grid ── */}
          <div
            className="stats-row-desktop"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            {[
              { label: "Total Tickets", value: tickets.length },
              { label: "Open", value: tickets.filter(t => t.status === "open").length },
              { label: "In Progress", value: tickets.filter(t => t.status === "in_progress").length },
              { label: "Resolved", value: tickets.filter(t => t.status === "resolved").length },
            ].map((s) => (
              <div key={s.label} style={{
                background: "#fff", padding: "20px", borderRadius: "12px",
                border: "1px solid #eee", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}>
                <p style={{ fontSize: "13px", color: "#666", margin: "0 0 8px 0" }}>{s.label}</p>
                <h2 style={{ fontSize: "28px", fontWeight: 700, margin: 0, color: "#1a1a1a" }}>
                  {s.value}
                </h2>
              </div>
            ))}
          </div>

          {/* ── STATS: mobile horizontal scroll strip ── */}
          <div
            className="stats-row-mobile stats-strip"
            style={{
              gap: "10px",
              overflowX: "auto",
              paddingBottom: "4px",
              marginBottom: "16px",
              scrollbarWidth: "none",
            }}
          >
            {[
              { label: "Total",       value: tickets.length,                                                   color: "#6B2D0F", bg: "#FDF5EC" },
              { label: "Open",        value: tickets.filter(t => t.status === "open").length,                  color: "#1976D2", bg: "#E3F2FD" },
              { label: "In Progress", value: tickets.filter(t => t.status === "in_progress").length,           color: "#C8962E", bg: "#FFF8E0" },
              { label: "Resolved",    value: tickets.filter(t => t.status === "resolved").length,              color: "#2D6B0F", bg: "#E8F5E9" },
            ].map((s) => (
              <div key={s.label} className="stats-strip" style={{
                background: s.bg, borderRadius: "10px",
                padding: "10px 18px", flexShrink: 0,
                textAlign: "center", minWidth: "76px",
              }}>
                <p style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: s.color }}>{s.value}</p>
                <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#666" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── SEARCH ── */}
          <div style={{
            background: "#fff",
            padding: "0 14px",
            borderRadius: "12px",
            border: "1.5px solid #e8e0d5",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            height: "48px",
          }}>
            <Search size={18} color={COLORS.primary} style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by ID, title, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: "none", outline: "none", width: "100%",
                fontSize: "14px", background: "transparent", color: "#1a1a1a",
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#999", padding: "4px", display: "flex",
                  alignItems: "center", flexShrink: 0, fontSize: "14px",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* ── DESKTOP TABLE ── */}
          <div className="desktop-table" style={{
            background: "#fff", borderRadius: "12px",
            border: "1px solid #eee", overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            {filteredTickets.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center", color: "#666" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 600 }}>No tickets found</h3>
                <p style={{ margin: 0, fontSize: "14px" }}>Try adjusting your search terms</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
                  <thead>
                    <tr style={{ background: "#faf6f0" }}>
                      <th style={th}>Ticket ID</th>
                      <th style={th}>Title</th>
                      <th style={th}>Category</th>
                      <th style={th}>Status</th>
                      <th style={th}>Created</th>
                      <th style={th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((t) => {
                      const liveStatus = getStatus(t);
                      return (
                        <tr key={t.id}
                          style={{ transition: "background 0.15s ease", borderBottom: "1px solid #f5f5f5" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#fffaf3"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                        >
                          <td style={td}>
                            <span style={{ fontWeight: 600, color: "#6B2D0F", fontSize: "13px" }}>#{t.id}</span>
                          </td>
                          <td style={{ ...td, maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <span title={t.title} style={{ fontSize: "13px", color: "#1a1a1a", fontWeight: 500 }}>{t.title}</span>
                          </td>
                          <td style={td}>
                            <span style={{ fontSize: "13px", color: "#444", textTransform: "capitalize" }}>
                              {t.category.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td style={td}><StatusBadge status={liveStatus} /></td>
                          <td style={td}>
                            <span style={{ fontSize: "12px", color: "#888" }}>
                              {new Date(t.created_at).toLocaleDateString("en-KE", {
                                day: "numeric", month: "short", year: "numeric",
                              })}
                            </span>
                          </td>
                          <td style={td}>
                            <button
                              onClick={() => handleView(t.id)}
                              style={{
                                background: COLORS.primary, color: "#fff", border: "none",
                                padding: "8px 16px", borderRadius: "6px", cursor: "pointer",
                                display: "flex", alignItems: "center", gap: "6px",
                                fontSize: "13px", fontWeight: 500,
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.primaryDark; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.primary; }}
                            >
                              <Eye size={14} /> View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── MOBILE CARD LIST ── */}
          <div className="mobile-cards" style={{ flexDirection: "column", gap: "12px" }}>
            {filteredTickets.length === 0 ? (
              <div style={{
                background: "#fff", borderRadius: "12px",
                border: "1px solid #eee", padding: "40px 20px",
                textAlign: "center", color: "#666",
              }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
                <h3 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: 600 }}>No tickets found</h3>
                <p style={{ margin: 0, fontSize: "13px" }}>Try adjusting your search</p>
              </div>
            ) : (
              filteredTickets.map((t) => {
                const liveStatus = getStatus(t);
                const age = timeAgo(t.created_at);
                return (
                  <div key={t.id} style={{
                    background: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #eee",
                    // ← colored left border by status
                    borderLeft: `4px solid ${STATUS_COLORS[liveStatus]?.color ?? "#ccc"}`,
                    padding: "16px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}>
                    {/* Top row: ticket ID + status badge */}
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "center", marginBottom: "8px",
                    }}>
                      <span style={{ fontWeight: 700, color: "#6B2D0F", fontSize: "13px" }}>
                        #{t.id}
                      </span>
                      <StatusBadge status={liveStatus} />
                    </div>

                    {/* Title */}
                    <p style={{
                      fontSize: "15px", fontWeight: 600, color: "#1a1a1a",
                      margin: "0 0 8px 0",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {t.title}
                    </p>

                    {/* Category + age row */}
                    <div style={{
                      display: "flex", justifyContent: "space-between",
                      alignItems: "center", marginBottom: "14px",
                    }}>
                      <span style={{
                        fontSize: "12px", color: "#666",
                        textTransform: "capitalize",
                        background: "#f5f5f5",
                        padding: "3px 9px", borderRadius: "6px",
                      }}>
                        {t.category.replace(/_/g, " ")}
                      </span>
                      <span style={{
                        fontSize: "11px",
                        color: age.urgent ? "#C62828" : "#aaa",
                        fontWeight: age.urgent ? 600 : 400,
                      }}>
                        {age.urgent ? "⚠ " : ""}{age.text}
                      </span>
                    </div>

                    {/* Full-width View button */}
                    <button
                      onClick={() => handleView(t.id)}
                      style={{
                        width: "100%",
                        background: COLORS.primary,
                        color: "#fff", border: "none",
                        padding: "11px", borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex", alignItems: "center",
                        justifyContent: "center", gap: "6px",
                        fontSize: "13px", fontWeight: 600,
                      }}
                    >
                      <Eye size={14} /> View Ticket
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer count */}
          <div style={{
            marginTop: "16px", fontSize: "13px",
            color: "#666", textAlign: "right",
          }}>
            Showing {filteredTickets.length} of {tickets.length} tickets
          </div>
        </div>
      </div>
    </>
  );
}

const th = {
  textAlign: "left" as const,
  padding: "16px 14px", fontSize: "12px", fontWeight: 600,
  color: "#666", textTransform: "uppercase" as const,
  letterSpacing: "0.5px", borderBottom: "2px solid #f0f0f0",
};

const td = {
  padding: "14px", fontSize: "13px", verticalAlign: "middle" as const,
};