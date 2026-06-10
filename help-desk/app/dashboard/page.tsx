//dashboard
"use client";

import Link from "next/link";
import {
  LifeBuoy,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  ArrowRight,
  Bell,
} from "lucide-react";
import { useEffect, useState } from "react";

interface User {
  full_name: string;
  email: string;
  department?: { name: string };
}
const stats = [
  { label: "Total Raised", value: 12, icon: AlertCircle, color: "#C8962E" },
  { label: "Open", value: 3, icon: Clock, color: "#E8B84B" },
  { label: "In Progress", value: 2, icon: Loader, color: "#6B2D0F" },
  { label: "Resolved", value: 7, icon: CheckCircle, color: "#2D6B0F" },
];

const tickets = [
  {
    id: "TKT-0012",
    date: "27 May 2026",
    time: "09:14",
    issue: "Laptop not connecting to VPN",
    category: "Network",
    priority: "High",
    status: "Open",
  },
  {
    id: "TKT-0011",
    date: "26 May 2026",
    time: "14:32",
    issue: "Cannot access HRMIS portal",
    category: "Software",
    priority: "High",
    status: "In Progress",
  },
  {
    id: "TKT-0010",
    date: "25 May 2026",
    time: "11:05",
    issue: "Printer offline - 3rd floor",
    category: "Hardware",
    priority: "Medium",
    status: "Resolved",
  },
  {
    id: "TKT-0009",
    date: "23 May 2026",
    time: "08:50",
    issue: "Password reset request",
    category: "Access",
    priority: "Low",
    status: "Resolved",
  },
  {
    id: "TKT-0008",
    date: "20 May 2026",
    time: "16:20",
    issue: "Email not syncing on phone",
    category: "Software",
    priority: "Medium",
    status: "Resolved",
  },
];

const notices = [
  {
    title: "Scheduled Maintenance",
    body: "Core systems will be offline Sat 31 May, 11pm–2am.",
    date: "27 May 2026",
    urgent: true,
  },
  {
    title: "New ICT Policy 2025",
    body: "Please review the updated ICT Policy on the portal.",
    date: "20 May 2026",
    urgent: false,
  },
];

function getHour() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Open: { bg: "#FFF3E0", color: "#C8962E" },
    "In Progress": { bg: "#FFF8E0", color: "#6B2D0F" },
    Resolved: { bg: "#E8F5E9", color: "#2D6B0F" },
    Closed: { bg: "#F3F3F3", color: "#555" },
  };
  const s = map[status] ?? { bg: "#eee", color: "#333" };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "11.5px",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    High: "#BB0000",
    Medium: "#C8962E",
    Low: "#2D6B0F",
  };
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: colors[priority] ?? "#aaa",
          flexShrink: 0,
          display: "inline-block",
        }}
      />
      {priority}
    </span>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<{
    full_name: string;
    email: string;
    department?: { name: string };
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/me`, {
          credentials: "include",
        });
        if (res.ok) setUser(await res.json());
      } catch {}
    })();
  }, []);
  const fullName = user?.full_name ?? "Loading...";
  const department = user?.department?.name ?? "National Treasury";
  const email = user?.email ?? "";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --gold:       #C8962E;
          --gold-light: #E8B84B;
          --brown:      #6B2D0F;
          --brown-dark: #4A1E0A;
          --cream:      #FDF8F2;
          --border:     #EDE0D0;
          --text:       #1A0F08;
          --text-sub:   #7A5C44;
        }

        .dash-root {
          width: 100%;
          min-height: 100vh;
          background: var(--cream);
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        /* ── TOPBAR ── */
        .topbar {
          background: #fff;
          border-bottom: 1px solid var(--border);
          padding: 0 2rem;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
          width: 100%;
        }

        .topbar-left { font-size: 13px; color: var(--text-sub); }
        .topbar-left span { color: var(--brown); font-weight: 600; }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .notif-btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: var(--cream);
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: var(--text-sub);
          position: relative;
          transition: background 0.15s;
        }

        .notif-btn:hover { background: var(--border); }

        .notif-dot {
          position: absolute;
          top: 6px; right: 6px;
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #BB0000;
          border: 1.5px solid #fff;
        }

        .avatar {
          width: 34px; height: 34px;
          border-radius: 50%;
          background: var(--brown);
          color: #fff;
          font-size: 12px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid var(--gold);
          cursor: pointer;
        }

        /* ── CONTENT ── */
        .dash-content {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          width: 100%;
          flex: 1;
        }

        /* ── GREETING ── */
        .greeting-card {
          background: var(--brown);
          border-radius: 16px;
          padding: 1.75rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          width: 100%;
        }

        .greeting-card::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: rgba(200,150,46,0.15);
        }

        .greeting-card::after {
          content: '';
          position: absolute;
          bottom: -40px; right: 100px;
          width: 120px; height: 120px;
          border-radius: 50%;
          background: rgba(200,150,46,0.08);
        }

        .greeting-left { position: relative; z-index: 1; }

        .greeting-tag {
          font-size: 11px; font-weight: 600;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: var(--gold-light); margin-bottom: 0.35rem;
        }

        .greeting-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem; font-weight: 700;
          color: #fff; margin-bottom: 0.3rem;
        }

        .greeting-dept { font-size: 13px; color: rgba(255,255,255,0.6); }

        .greeting-actions {
          display: flex; gap: 0.75rem;
          position: relative; z-index: 1;
          flex-wrap: wrap;
        }

        .btn-primary {
          display: flex; align-items: center; gap: 7px;
          background: var(--gold); color: var(--brown-dark);
          padding: 0.6rem 1.2rem; border-radius: 8px;
          font-size: 13px; font-weight: 700;
          text-decoration: none;
          transition: background 0.15s;
          border: none; cursor: pointer; font-family: inherit;
        }

        .btn-primary:hover { background: var(--gold-light); }

        .btn-ghost {
          display: flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.1); color: #fff;
          padding: 0.6rem 1.2rem; border-radius: 8px;
          font-size: 13px; font-weight: 600;
          text-decoration: none;
          transition: background 0.15s;
          border: 1px solid rgba(255,255,255,0.2);
          cursor: pointer; font-family: inherit;
        }

        .btn-ghost:hover { background: rgba(255,255,255,0.18); }

        /* ── STATS ── */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          width: 100%;
        }

        .stat-card {
          background: #fff;
          border-radius: 12px;
          border: 1px solid var(--border);
          padding: 1.25rem 1.5rem;
          display: flex; align-items: center; gap: 1rem;
          box-shadow: 0 2px 8px rgba(107,45,15,0.05);
        }

        .stat-icon {
          width: 44px; height: 44px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem; font-weight: 700;
          color: var(--text); line-height: 1;
        }

        .stat-label { font-size: 12px; color: var(--text-sub); margin-top: 3px; }

        /* ── TWO COL ── */
        .two-col {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 1.5rem;
          align-items: start;
          width: 100%;
        }

        /* ── SECTION CARD ── */
        .section-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(107,45,15,0.04);
          width: 100%;
        }

        .section-header {
          padding: 1.1rem 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }

        .section-title { font-size: 14px; font-weight: 700; color: var(--text); }

        .section-link {
          font-size: 12px; color: var(--brown);
          text-decoration: none;
          display: flex; align-items: center; gap: 4px;
          font-weight: 500;
        }

        .section-link:hover { text-decoration: underline; }

        /* ── TABLE ── */
        .ticket-table { width: 100%; border-collapse: collapse; font-size: 13px; }

        .ticket-table th {
          padding: 0.75rem 1.5rem;
          text-align: left;
          font-size: 11px; font-weight: 700;
          color: var(--text-sub);
          letter-spacing: 0.5px; text-transform: uppercase;
          background: #FDFAF6;
          border-bottom: 1px solid var(--border);
        }

        .ticket-table td {
          padding: 0.85rem 1.5rem;
          border-bottom: 1px solid #F5EDE0;
          color: var(--text); vertical-align: middle;
        }

        .ticket-table tr:last-child td { border-bottom: none; }
        .ticket-table tr:hover td { background: #FDFAF6; }

        .ticket-id { font-weight: 600; color: var(--brown); font-size: 12.5px; }
        .ticket-date { font-size: 12px; color: var(--text-sub); }
        .ticket-time { font-size: 11px; color: #B0906A; }

        /* ── NOTICES ── */
        .notice-list {
          padding: 0.75rem 1rem;
          display: flex; flex-direction: column; gap: 0.5rem;
        }

        .notice-item {
          padding: 0.85rem 1rem;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--cream);
        }

        .notice-item.urgent { border-color: #F5C8A8; background: #FFF8F3; }

        .notice-urgent-tag {
          font-size: 10px; font-weight: 700;
          letter-spacing: 1px; text-transform: uppercase;
          color: #BB0000; margin-bottom: 4px;
        }

        .notice-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 3px; }
        .notice-body { font-size: 12px; color: var(--text-sub); line-height: 1.5; }
        .notice-date { font-size: 11px; color: #B0906A; margin-top: 5px; }

        /* ── QUICK LINKS ── */
        .quick-links {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          padding: 1rem;
        }

        .quick-link-item {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 6px; padding: 1rem 0.5rem;
          border-radius: 10px;
          background: var(--cream);
          border: 1px solid var(--border);
          text-decoration: none;
          color: var(--text);
          font-size: 12px; font-weight: 600;
          text-align: center;
          transition: background 0.15s, border-color 0.15s;
        }

        .quick-link-item:hover { background: #F5E8D0; border-color: var(--gold); }

        .quick-link-icon {
          width: 36px; height: 36px;
          border-radius: 8px;
          background: var(--brown);
          display: flex; align-items: center; justify-content: center;
          color: #fff;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1100px) {
          .two-col { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .dash-content { padding: 1rem; }
          .greeting-card { flex-direction: column; align-items: flex-start; gap: 1rem; }
        }

        @media (max-width: 480px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .ticket-table th:nth-child(4),
          .ticket-table td:nth-child(4) { display: none; }
        }
      `}</style>

      <div className="dash-root">
        {/* TOPBAR */}
        <div className="topbar">
          <p className="topbar-left">
            National Treasury &nbsp;/&nbsp; <span>Employee Dashboard</span>
          </p>
          <div className="topbar-right">
            <button className="notif-btn" aria-label="Notifications">
              <Bell size={16} />
              <span className="notif-dot" />
            </button>
            <div className="avatar" title={fullName}>
              {initials}
            </div>
          </div>
        </div>

        <div className="dash-content">
          {/* GREETING */}
          <div className="greeting-card">
            <div className="greeting-left">
              <p className="greeting-tag">{getHour()}</p>
              <h1 className="greeting-name">{fullName}</h1>{" "}
              <p className="greeting-dept">
                {department} &nbsp;·&nbsp; {email}
              </p>
            </div>
            <div className="greeting-actions">
              <Link href="/request" className="btn-primary">
                <LifeBuoy size={15} /> Raise a Ticket
              </Link>
              <Link href="/profile" className="btn-ghost">
                <User size={15} /> My Profile
              </Link>
            </div>
          </div>

          {/* STATS */}
          <div className="stats-row">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div className="stat-card" key={s.label}>
                  <div
                    className="stat-icon"
                    style={{ background: `${s.color}18` }}
                  >
                    <Icon size={20} color={s.color} />
                  </div>
                  <div>
                    <p className="stat-value">{s.value}</p>
                    <p className="stat-label">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* TWO COLUMN */}
          <div className="two-col">
            {/* TICKETS */}
            <div className="section-card">
              <div className="section-header">
                <p className="section-title">Recent Tickets</p>
                <Link href="/tickets" className="section-link">
                  View all <ArrowRight size={13} />
                </Link>
              </div>
              <table className="ticket-table">
                <thead>
                  <tr>
                    <th>Date / Time</th>
                    <th>Ticket ID</th>
                    <th>Issue</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <p className="ticket-date">{t.date}</p>
                        <p className="ticket-time">{t.time}</p>
                      </td>
                      <td>
                        <span className="ticket-id">{t.id}</span>
                      </td>
                      <td style={{ maxWidth: 180 }}>{t.issue}</td>
                      <td>{t.category}</td>
                      <td>
                        <PriorityDot priority={t.priority} />
                      </td>
                      <td>
                        <StatusBadge status={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* RIGHT COLUMN */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {/* QUICK ACTIONS */}
              <div className="section-card">
                <div className="section-header">
                  <p className="section-title">Quick Actions</p>
                </div>
                <div className="quick-links">
                  <Link href="/request" className="quick-link-item">
                    <div className="quick-link-icon">
                      <LifeBuoy size={16} />
                    </div>
                    Request Assistance
                  </Link>
                  <Link href="/tickets" className="quick-link-item">
                    <div className="quick-link-icon">
                      <Clock size={16} />
                    </div>
                    Ticket History
                  </Link>
                  <Link href="/profile" className="quick-link-item">
                    <div className="quick-link-icon">
                      <User size={16} />
                    </div>
                    My Profile
                  </Link>
                  <Link href="/support" className="quick-link-item">
                    <div className="quick-link-icon">
                      <Bell size={16} />
                    </div>
                    ICT Support
                  </Link>
                </div>
              </div>

              {/* NOTICES */}
              <div className="section-card">
                <div className="section-header">
                  <p className="section-title">ICT Notices</p>
                </div>
                <div className="notice-list">
                  {notices.map((n, i) => (
                    <div
                      key={i}
                      className={`notice-item${n.urgent ? " urgent" : ""}`}
                    >
                      {n.urgent && (
                        <p className="notice-urgent-tag">⚠ Urgent</p>
                      )}
                      <p className="notice-title">{n.title}</p>
                      <p className="notice-body">{n.body}</p>
                      <p className="notice-date">{n.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
