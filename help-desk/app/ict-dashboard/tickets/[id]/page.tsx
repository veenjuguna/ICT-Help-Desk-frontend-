"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Inter, Playfair_Display } from "next/font/google";
import { ArrowLeft, Send, Mail, Phone, MapPin, User, Clock, Check } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"] });

const COLORS = {
  primary: "#C8962E",
  primaryDark: "#b08326",
  open: { bg: "#E3F2FD", color: "#1976D2" },
  inProgress: { bg: "#FFF8E0", color: "#C8962E" },
  resolved: { bg: "#E8F5E9", color: "#2D6B0F" },
};

const ticketData: Record<string, {
  id: string;
  status: string;
  assignedAgo: string;
  category: string;
  description: string;
  location: string;
  city: string;
  department: string;
  employee: {
    name: string;
    department: string;
    email: string;
    phone: string;
    location: string;
    city: string;
  };
  assignment: {
    assignedTo: string;
    assignedTime: string;
    timeElapsed: string;
  };
}> = {
  "TKT-021": {
    id: "TKT-021",
    status: "Open",
    assignedAgo: "30m ago",
    category: "Hardware",
    description: "Employee reports that the monitor is not powering on. The power cable is connected and the power button shows no response. No indicator lights are visible on the monitor.",
    location: "Room 101, 1st Floor",
    city: "Nairobi",
    department: "Finance",
    employee: {
      name: "Alice Nyambura",
      department: "Finance",
      email: "alice.nyambura@treasury.go.ke",
      phone: "+254 700 111 222",
      location: "Room 101, 1st Floor",
      city: "Nairobi",
    },
    assignment: {
      assignedTo: "David Ochieng",
      assignedTime: "2026-06-10 09:00",
      timeElapsed: "30m",
    },
  },
  "TKT-022": {
    id: "TKT-022",
    status: "In Progress",
    assignedAgo: "2h ago",
    category: "Network",
    description: "Employee is unable to connect their laptop to the office WiFi network. They have tried restarting the laptop and the issue persists. The error message shows \"Cannot connect to network\" and no available networks are shown in the WiFi list.",
    location: "Room 204, 3rd Floor",
    city: "Nairobi",
    department: "ICT Services",
    employee: {
      name: "John Otieno",
      department: "ICT Services",
      email: "john.otieno@treasury.go.ke",
      phone: "+254 700 123 456",
      location: "Room 204, 3rd Floor",
      city: "Nairobi",
    },
    assignment: {
      assignedTo: "David Ochieng",
      assignedTime: "2026-06-10 08:00",
      timeElapsed: "2h",
    },
  },
  "TKT-023": {
    id: "TKT-023",
    status: "Open",
    assignedAgo: "1h ago",
    category: "Software",
    description: "Employee's email client is not syncing new messages. Outlook shows 'Disconnected' in the status bar. Other employees on the same floor are not experiencing the issue.",
    location: "Room 305, 2nd Floor",
    city: "Nairobi",
    department: "HR",
    employee: {
      name: "Mary Wanjiku",
      department: "HR",
      email: "mary.wanjiku@treasury.go.ke",
      phone: "+254 700 333 444",
      location: "Room 305, 2nd Floor",
      city: "Nairobi",
    },
    assignment: {
      assignedTo: "David Ochieng",
      assignedTime: "2026-06-10 09:30",
      timeElapsed: "1h",
    },
  },
  "TKT-024": {
    id: "TKT-024",
    status: "Resolved",
    assignedAgo: "3h ago",
    category: "Hardware",
    description: "Printer on floor 2 is showing a paper jam error. The jam indicator light is on and the printer is unresponsive. Multiple employees reported the issue.",
    location: "Floor 2, Print Room",
    city: "Nairobi",
    department: "Administration",
    employee: {
      name: "Peter Kamau",
      department: "Administration",
      email: "peter.kamau@treasury.go.ke",
      phone: "+254 700 555 666",
      location: "Floor 2, Print Room",
      city: "Nairobi",
    },
    assignment: {
      assignedTo: "David Ochieng",
      assignedTime: "2026-06-10 07:30",
      timeElapsed: "3h",
    },
  },
};

// Shared status store — persists across navigation within the same session
import { ticketStatusStore } from "../ticketStore";

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
      padding: "5px 14px",
      borderRadius: "20px",
      fontSize: "13px",
      fontWeight: 600,
    }}>
      {status}
    </span>
  );
}

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const ticket = ticketData[ticketId];

  const initialStatus = ticketStatusStore[ticketId] ?? ticket?.status ?? "Open";
  const [currentStatus, setCurrentStatus] = useState(initialStatus);
  const [pendingStatus, setPendingStatus] = useState(initialStatus);
  const [saved, setSaved] = useState(false);

  if (!ticket) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#FDF8F2",
        gap: "16px",
      }}>
        <div style={{ fontSize: "48px" }}>🎫</div>
        <h2 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>Ticket not found</h2>
        <p style={{ color: "#666", margin: 0 }}>Ticket <strong>{ticketId}</strong> does not exist.</p>
        <button
          onClick={() => router.back()}
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
          Go Back
        </button>
      </div>
    );
  }

  const statusOptions = ["Open", "In Progress", "Resolved"];

  const handleDone = () => {
    setCurrentStatus(pendingStatus);
    ticketStatusStore[ticketId] = pendingStatus;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={inter.className} style={{
      padding: "2rem",
      background: "#FDF8F2",
      minHeight: "100vh",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* HEADER */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => router.back()}
              style={{
                background: "#fff",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                padding: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
              aria-label="Go back"
            >
              <ArrowLeft size={18} color="#444" />
            </button>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <h1 style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: "26px",
                  fontWeight: 700,
                  margin: 0,
                  color: "#1a1a1a",
                }}>
                  Ticket {ticket.id}
                </h1>
                <StatusBadge status={currentStatus} />
              </div>
              <p style={{ color: "#888", fontSize: "13px", margin: "4px 0 0 0", display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={12} />
                Assigned {ticket.assignedAgo}
              </p>
            </div>
          </div>

          <button style={{
            background: "#fff",
            color: "#444",
            border: "1px solid #ddd",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            fontWeight: 500,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <Send size={14} />
            Transfer Ticket
          </button>
        </div>

        {/* MAIN GRID */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: "20px",
          alignItems: "start",
        }}>

          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Issue Details */}
            <div style={{
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #eee",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 20px 0", color: "#1a1a1a" }}>
                Issue Details
              </h2>

              <div style={{ marginBottom: "16px" }}>
                <p style={{ fontSize: "12px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px 0", fontWeight: 600 }}>Category</p>
                <p style={{ fontSize: "14px", color: "#1a1a1a", margin: 0 }}>{ticket.category}</p>
              </div>

              <div style={{ borderTop: "1px solid #f5f5f5", paddingTop: "16px", marginBottom: "16px" }}>
                <p style={{ fontSize: "12px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 8px 0", fontWeight: 600 }}>Description</p>
                <p style={{ fontSize: "14px", color: "#444", margin: 0, lineHeight: "1.7" }}>{ticket.description}</p>
              </div>

              <div style={{ borderTop: "1px solid #f5f5f5", paddingTop: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "12px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px 0", fontWeight: 600 }}>Location</p>
                  <p style={{ fontSize: "14px", color: "#1a1a1a", margin: 0 }}>{ticket.location}</p>
                  <p style={{ fontSize: "13px", color: "#888", margin: "2px 0 0 0" }}>{ticket.city}</p>
                </div>
                <div>
                  <p style={{ fontSize: "12px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 4px 0", fontWeight: 600 }}>Department</p>
                  <p style={{ fontSize: "14px", color: "#1a1a1a", margin: 0 }}>{ticket.department}</p>
                </div>
              </div>
            </div>

            {/* Update Status */}
            <div style={{
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #eee",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 16px 0", color: "#1a1a1a" }}>
                Update Ticket Status
              </h2>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                {statusOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setPendingStatus(option);
                      setSaved(false);
                    }}
                    style={{
                      background: pendingStatus === option ? COLORS.primary : "#fff",
                      color: pendingStatus === option ? "#fff" : "#444",
                      border: `1px solid ${pendingStatus === option ? COLORS.primary : "#ddd"}`,
                      padding: "9px 18px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 500,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {option}
                  </button>
                ))}

                {/* Done button — only show if selection differs from saved status */}
                {pendingStatus !== currentStatus && (
                  <button
                    onClick={handleDone}
                    style={{
                      background: "#1a1a1a",
                      color: "#fff",
                      border: "none",
                      padding: "9px 18px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Check size={14} />
                    Done
                  </button>
                )}

                {/* Saved confirmation */}
                {saved && (
                  <span style={{
                    fontSize: "13px",
                    color: "#2D6B0F",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}>
                    <Check size={13} />
                    Status updated
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Employee Info */}
            <div style={{
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #eee",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 20px 0", color: "#1a1a1a" }}>
                Employee Information
              </h2>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <User size={20} color="#888" />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "14px", color: "#1a1a1a" }}>{ticket.employee.name}</p>
                  <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>{ticket.employee.department}</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <Mail size={14} color="#888" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: "11px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.4px" }}>Email</p>
                    <p style={{ margin: 0, fontSize: "13px", color: "#444" }}>{ticket.employee.email}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <Phone size={14} color="#888" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: "11px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.4px" }}>Phone</p>
                    <p style={{ margin: 0, fontSize: "13px", color: "#444" }}>{ticket.employee.phone}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <MapPin size={14} color="#888" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: "11px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.4px" }}>Location</p>
                    <p style={{ margin: 0, fontSize: "13px", color: "#444" }}>{ticket.employee.location}</p>
                    <p style={{ margin: 0, fontSize: "12px", color: "#aaa" }}>{ticket.employee.city}</p>
                  </div>
                </div>
              </div>

              <button style={{
                width: "100%",
                background: COLORS.primaryDark,
                color: "#fff",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
              }}>
                Contact Employee
              </button>
            </div>

            {/* Assignment Details */}
            <div style={{
              background: "#fff",
              borderRadius: "12px",
              border: "1px solid #eee",
              padding: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <h2 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 20px 0", color: "#1a1a1a" }}>
                Assignment Details
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <p style={{ margin: "0 0 2px 0", fontSize: "12px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.4px" }}>Assigned To</p>
                  <p style={{ margin: 0, fontSize: "14px", color: "#1a1a1a", fontWeight: 500 }}>{ticket.assignment.assignedTo}</p>
                </div>
                <div>
                  <p style={{ margin: "0 0 2px 0", fontSize: "12px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.4px" }}>Assigned Time</p>
                  <p style={{ margin: 0, fontSize: "14px", color: "#1a1a1a" }}>{ticket.assignment.assignedTime}</p>
                </div>
                <div>
                  <p style={{ margin: "0 0 2px 0", fontSize: "12px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.4px" }}>Time Elapsed</p>
                  <p style={{ margin: 0, fontSize: "14px", color: "#1a1a1a" }}>{ticket.assignment.timeElapsed}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}