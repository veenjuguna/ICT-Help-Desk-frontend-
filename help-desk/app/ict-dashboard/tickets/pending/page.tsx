"use client";

import { useState } from "react";
import { Search, Eye } from "lucide-react";
import { Inter, Playfair_Display } from "next/font/google";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"] });

// Design tokens
const COLORS = {
  primary: "#C8962E",
  primaryDark: "#b08326",
  
  // Status colors
  open: { bg: "#E3F2FD", color: "#1976D2" },
  inProgress: { bg: "#FFF8E0", color: "#C8962E" },
  resolved: { bg: "#E8F5E9", color: "#2D6B0F" },
};

// Stats
const stats = [
  { label: "Assigned to Me", value: 8 },
  { label: "Open", value: 5 },
  { label: "In Progress", value: 3 },
  { label: "Resolved", value: 12 },
];

const tickets = [
  {
    id: "TKT-021",
    employee: "Alice Nyambura",
    issue: "Monitor not powering on",
    status: "Open",
  },
  {
    id: "TKT-022",
    employee: "John Otieno",
    issue: "No internet",
    status: "In Progress",
  },
  {
    id: "TKT-023",
    employee: "Mary Wanjiku",
    issue: "Email not syncing",
    status: "Open",
  },
  {
    id: "TKT-024",
    employee: "Peter Kamau",
    issue: "Printer jam on floor 2",
    status: "Resolved",
  },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    "Open": COLORS.open,
    "In Progress": COLORS.inProgress,
    "Resolved": COLORS.resolved,
  };

  const s = map[status] ?? { bg: "#eee", color: "#333" };

  return (
    <span style={{
      background: s.bg,
      color: s.color,
      padding: "4px 10px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: 600,
      display: "inline-block",
    }}>
      {status}
    </span>
  );
}

function EmployeeAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  return (
    <div style={{
      width: 32,
      height: 32,
      borderRadius: "50%",
      background: "#f0f0f0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      fontWeight: 600,
      color: "#666",
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function PendingTicketsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const filteredTickets = tickets.filter(ticket => {
    const term = searchTerm.toLowerCase();
    return (
      ticket.id.toLowerCase().includes(term) ||
      ticket.employee.toLowerCase().includes(term) ||
      ticket.issue.toLowerCase().includes(term) ||
      ticket.status.toLowerCase().includes(term)
    );
  });

  const totalTickets = tickets.length;

  const handleView = (ticketId: string) => {
    router.push(`/ict-dashboard/tickets/${ticketId}`);
  };

  return (
    <div className={inter.className} style={{
      padding: "2rem",
      background: "#FDF8F2",
      minHeight: "100vh",
      fontFamily: "Inter, system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "32px",
            fontWeight: 700,
            marginBottom: "6px",
            color: "#1a1a1a",
          }}>
            Pending Tickets
          </h1>
          <p style={{ 
            color: "#666", 
            marginBottom: "0",
            fontSize: "14px",
          }}>
            Technician work queue — Manage active and blocked issues
          </p>
        </div>

        {/* STATS ROW */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}>
          {stats.map((s) => (
            <div 
              key={s.label} 
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #eee",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
              }}
              role="button"
              tabIndex={0}
              aria-label={`${s.label}: ${s.value} tickets`}
            >
              <div>
                <p style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
                  {s.label}
                </p>
                <h2 style={{ 
                  fontSize: "28px", 
                  fontWeight: 700, 
                  margin: 0,
                  color: "#1a1a1a",
                }}>
                  {s.value}
                </h2>
              </div>
            </div>
          ))}
        </div>

        {/* SEARCH */}
        <div style={{
          background: "#fff",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid #eee",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}>
          <Search size={18} color="#666" />
          <input
            type="text"
            placeholder="Search pending tickets by ID, employee, or issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              width: "100%",
              fontSize: "14px",
              background: "transparent",
            }}
            aria-label="Search tickets"
          />
        </div>

        {/* TABLE */}
        <div style={{
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #eee",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}>
          
          {filteredTickets.length === 0 ? (
            <div style={{
              padding: "48px 24px",
              textAlign: "center",
              color: "#666",
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", fontWeight: 600 }}>
                No tickets found
              </h3>
              <p style={{ margin: 0, fontSize: "14px" }}>
                Try adjusting your search terms
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
                <thead>
                  <tr style={{ background: "#faf6f0" }}>
                    <th style={th}>Ticket</th>
                    <th style={th}>Employee</th>
                    <th style={th}>Issue</th>
                    <th style={th}>Status</th>
                    <th style={th}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTickets.map((t) => (
                    <tr 
                      key={t.id} 
                      style={{ 
                        transition: "background 0.15s ease",
                        borderBottom: "1px solid #f5f5f5",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#fffaf3";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <td style={td}>
                        <span style={{ 
                          fontWeight: 600, 
                          color: "#6B2D0F",
                          fontSize: "13px",
                        }}>
                          {t.id}
                        </span>
                      </td>
                      
                      <td style={td}>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "12px",
                          minWidth: 0,
                        }}>
                          <EmployeeAvatar name={t.employee} />
                          <span style={{
                            fontSize: "13px",
                            fontWeight: 500,
                            color: "#1a1a1a",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            display: "block",
                          }}>
                            {t.employee}
                          </span>
                        </div>
                      </td>
                      
                      <td style={{ 
                        ...td, 
                        maxWidth: "300px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        <span 
                          title={t.issue}
                          style={{ fontSize: "13px", color: "#444" }}
                        >
                          {t.issue}
                        </span>
                      </td>
                      
                      <td style={td}>
                        <StatusBadge status={t.status} />
                      </td>

                      <td style={td}>
                        <button 
                          onClick={() => handleView(t.id)}
                          style={{
                            background: COLORS.primary,
                            color: "#fff",
                            border: "none",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "13px",
                            fontWeight: 500,
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = COLORS.primaryDark;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = COLORS.primary;
                          }}
                          aria-label={`View ticket ${t.id}`}
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{
          marginTop: "16px",
          fontSize: "13px",
          color: "#666",
          textAlign: "right",
        }}>
          Showing {filteredTickets.length} of {totalTickets} tickets
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