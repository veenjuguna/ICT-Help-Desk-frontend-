"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Ticket,
  Package,
  Monitor,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface AdminUser {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  department?: { name: string };
}

// ── Mock data ─────────────────────────────────────────────────────────────────
const STATS = [
  { label: "Total Staff",    value: 312, icon: Users,   trend: "+4",  up: true,  color: "#C8962E" },
  { label: "Open Tickets",   value: 47,  icon: Ticket,  trend: "+12", up: true,  color: "#6B2D0F" },
  { label: "Assets in Use",  value: 284, icon: Package, trend: "-3",  up: false, color: "#C8962E" },
  { label: "ICT Available",  value: 8,   icon: Monitor, trend: "+1",  up: true,  color: "#2D6B0F" },
];

const RECENT_TICKETS = [
  { id: "TKT-0091", subject: "Laptop won't boot after update",   user: "James Mwangi",    priority: "High",   status: "Open",        dept: "Finance" },
  { id: "TKT-0090", subject: "Cannot access email remotely",     user: "Aisha Odhiambo",  priority: "Medium", status: "In Progress", dept: "ICT" },
  { id: "TKT-0089", subject: "Printer offline on 4th floor",     user: "Samuel Kibet",    priority: "Low",    status: "Open",        dept: "Admin" },
  { id: "TKT-0088", subject: "VPN connection keeps dropping",    user: "Grace Wanjiku",   priority: "High",   status: "In Progress", dept: "Procurement" },
  { id: "TKT-0087", subject: "Request for new monitor",          user: "David Otieno",    priority: "Low",    status: "Resolved",    dept: "Budget" },
];

const ICT_STAFF = [
  { name: "Brian Kamau",    status: "active", tickets: 5 },
  { name: "Lilian Njeri",   status: "active", tickets: 3 },
  { name: "Kevin Ochieng",  status: "away",   tickets: 1 },
  { name: "Mercy Wambua",   status: "active", tickets: 7 },
];

const ASSETS = [
  { name: "Laptops",    total: 180, inUse: 162 },
  { name: "Desktops",   total: 90,  inUse: 76  },
  { name: "Printers",   total: 40,  inUse: 30  },
  { name: "Projectors", total: 18,  inUse: 16  },
];

const SESSIONS = [
  { user: "admin@treasury.go.ke",   started: "08:14 AM", status: "live"  },
  { user: "ict1@treasury.go.ke",    started: "09:02 AM", status: "live"  },
  { user: "finance@treasury.go.ke", started: "07:55 AM", status: "ended" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    "Open":        { bg: "#FFF3E0", color: "#C8962E" },
    "In Progress": { bg: "#FFF8E0", color: "#6B2D0F" },
    "Resolved":    { bg: "#E8F5E9", color: "#2D6B0F" },
    "Closed":      { bg: "#F3F3F3", color: "#555"    },
  };
  const s = map[status] ?? { bg: "#eee", color: "#333" };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: "20px",
      fontSize: "11.5px", fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {status}
    </span>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    High: "#BB0000", Medium: "#C8962E", Low: "#2D6B0F",
  };
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13 }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: colors[priority] ?? "#aaa",
        flexShrink: 0, display: "inline-block",
      }} />
      {priority}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/me`, {
          credentials: "include",
        });
        if (res.ok) setUser(await res.json());
      } catch {}
    })();
  }, []);

  const fullName =
    user?.full_name ??
    (user?.first_name || user?.last_name
      ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
      : "Loading...");
  const department = user?.department?.name ?? "National Treasury";
  const email = user?.email ?? "";

  const today = new Date().toLocaleDateString("en-KE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

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

        .adm-root {
          width: 100%;
          min-width: 0;
          background: var(--cream);
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text);
          box-sizing: border-box;
        }

        /* ── CONTENT ── */
        .adm-content {
          padding: 1.5rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        /* ── GREETING CARD ── */
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
          font-size: 11px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          color: var(--gold-light);
          margin-bottom: 0.35rem;
        }

        .greeting-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem; font-weight: 700;
          color: #fff; margin-bottom: 0.3rem;
          line-height: 1.15;
        }

        .greeting-sub { font-size: 13px; color: rgba(255,255,255,0.55); }

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

        /* ── ALERT BANNER ── */
        .adm-alert {
          background: #FFF8F3;
          border: 1px solid #F5C8A8;
          border-left: 4px solid var(--gold);
          border-radius: 10px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--brown);
        }
        .adm-alert svg { color: var(--gold); flex-shrink: 0; }
        .adm-alert strong { color: var(--text); }
        .adm-alert a { color: var(--gold); font-weight: 600; text-decoration: none; }
        .adm-alert a:hover { text-decoration: underline; }

        /* ── STATS ROW ── */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
          width: 100%;
          min-width: 0;
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
        .stat-trend {
          display: flex; align-items: center; gap: 3px;
          font-size: 11px; font-weight: 600;
          padding: 2px 7px; border-radius: 20px;
          margin-top: 4px;
          width: fit-content;
        }
        .stat-trend.up   { background: #E8F5E9; color: #2D6B0F; }
        .stat-trend.down { background: #FFEBEE; color: #BB0000; }

        /* ── TWO COL ── */
        .two-col {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: 1.5rem;
          align-items: start;
          width: 100%;
          min-width: 0;
        }

        /* ── SECTION CARD ── */
        .section-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(107,45,15,0.04);
          width: 100%;
          min-width: 0;
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
          font-weight: 600;
        }
        .section-link:hover { text-decoration: underline; }

        /* ── TABLE ── */
        .ticket-table-wrap { overflow-x: auto; width: 100%; }
        .ticket-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 500px; }
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
        .ticket-id { font-weight: 600; color: var(--brown); font-size: 12.5px; font-family: monospace; }
        .ticket-sub-text { font-size: 12px; color: var(--text-sub); margin-top: 2px; }

        /* ── ICT STAFF ── */
        .staff-list { padding: 4px 0; }
        .staff-row {
          display: flex; align-items: center;
          padding: 11px 1.5rem;
          gap: 12px;
          border-bottom: 1px solid #F5EDE0;
        }
        .staff-row:last-child { border-bottom: none; }
        .staff-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
        .staff-name { flex: 1; font-size: 13px; font-weight: 500; color: var(--text); }
        .staff-tickets {
          font-size: 11.5px; color: var(--text-sub);
          background: var(--cream);
          border: 1px solid var(--border);
          padding: 2px 8px; border-radius: 10px;
        }

        /* ── ASSET BARS ── */
        .asset-list { padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 14px; }
        .asset-meta {
          display: flex; justify-content: space-between;
          margin-bottom: 6px; font-size: 12.5px;
        }
        .asset-name { font-weight: 500; color: var(--text); }
        .asset-count { color: var(--text-sub); }
        .bar-track { height: 6px; background: var(--border); border-radius: 4px; overflow: hidden; }
        .bar-fill {
          height: 100%; border-radius: 4px;
          background: linear-gradient(90deg, var(--brown), var(--gold));
          transition: width 0.6s ease;
        }

        /* ── SESSIONS ── */
        .sessions-list { padding: 4px 0; }
        .session-row {
          display: flex; align-items: center;
          padding: 11px 1.5rem; gap: 10px;
          border-bottom: 1px solid #F5EDE0;
          font-size: 12.5px;
        }
        .session-row:last-child { border-bottom: none; }
        .session-user { flex: 1; color: var(--text); font-weight: 500; }
        .session-time { color: var(--text-sub); font-size: 12px; }
        .session-live {
          display: flex; align-items: center; gap: 4px;
          font-size: 11.5px; font-weight: 700; color: #2D6B0F;
        }
        .session-ended { color: var(--text-sub); font-size: 11.5px; }
        .live-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #2D6B0F;
          animation: pulse 1.6s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.3); }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1100px) { .two-col { grid-template-columns: 1fr; } }
        @media (max-width: 768px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .adm-content { padding: 1rem; }
          .greeting-card { flex-direction: column; align-items: flex-start; gap: 1rem; }
        }
        @media (max-width: 480px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="adm-root">
        <div className="adm-content">

          {/* ── GREETING CARD ── */}
          <div className="greeting-card">
            <div className="greeting-left">
              <p className="greeting-tag">{getGreeting()}</p>
              <h1 className="greeting-name">{fullName}</h1>
              <p className="greeting-sub">
                {department}&nbsp;·&nbsp;{email || today}
              </p>
            </div>
            <div className="greeting-actions">
              <Link href="/admin/tickets" className="btn-primary">
                <Ticket size={15} /> Manage Tickets
              </Link>
              <Link href="/admin/staff" className="btn-ghost">
                <Users size={15} /> ICT Staff
              </Link>
            </div>
          </div>

          {/* ── ALERT BANNER ── */}
          <div className="adm-alert">
            <AlertCircle size={17} />
            <span>
              <strong>6 unassigned tickets</strong> are awaiting ICT personnel assignment.{" "}
              <Link href="/admin/tickets">Assign now →</Link>
            </span>
          </div>

          {/* ── STAT CARDS ── */}
          <div className="stats-row">
            {STATS.map((s) => {
              const Icon = s.icon;
              return (
                <div className="stat-card" key={s.label}>
                  <div className="stat-icon" style={{ background: `${s.color}18` }}>
                    <Icon size={20} color={s.color} />
                  </div>
                  <div>
                    <p className="stat-value">{s.value}</p>
                    <p className="stat-label">{s.label}</p>
                    <p className={`stat-trend ${s.up ? "up" : "down"}`}>
                      {s.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {s.trend}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── TWO COLUMN ── */}
          <div className="two-col">

            {/* RECENT TICKETS */}
            <div className="section-card">
              <div className="section-header">
                <p className="section-title">Recent Tickets</p>
                <Link href="/admin/tickets" className="section-link">View all</Link>
              </div>
              <div className="ticket-table-wrap">
              <table className="ticket-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Subject</th>
                    <th>Department</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_TICKETS.map((t) => (
                    <tr key={t.id}>
                      <td><span className="ticket-id">{t.id}</span></td>
                      <td>
                        <div>{t.subject}</div>
                        <div className="ticket-sub-text">{t.user}</div>
                      </td>
                      <td style={{ color: "var(--text-sub)", fontSize: 12.5 }}>{t.dept}</td>
                      <td><PriorityDot priority={t.priority} /></td>
                      <td><StatusBadge status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* ICT PERSONNEL */}
              <div className="section-card">
                <div className="section-header">
                  <p className="section-title">ICT Personnel</p>
                  <Link href="/admin/staff" className="section-link">Manage</Link>
                </div>
                <div className="staff-list">
                  {ICT_STAFF.map((s) => (
                    <div key={s.name} className="staff-row">
                      <span
                        className="staff-dot"
                        style={{ background: s.status === "active" ? "#2D6B0F" : "#B0906A" }}
                      />
                      <span className="staff-name">{s.name}</span>
                      <span className="staff-tickets">{s.tickets} tickets</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ASSET BREAKDOWN */}
              <div className="section-card">
                <div className="section-header">
                  <p className="section-title">Asset Breakdown</p>
                  <Link href="/admin/assets" className="section-link">View all</Link>
                </div>
                <div className="asset-list">
                  {ASSETS.map((a) => {
                    const pct = Math.round((a.inUse / a.total) * 100);
                    return (
                      <div key={a.name}>
                        <div className="asset-meta">
                          <span className="asset-name">{a.name}</span>
                          <span className="asset-count">{a.inUse}/{a.total}</span>
                        </div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* ── ACTIVE SESSIONS ── */}
          <div className="section-card">
            <div className="section-header">
              <p className="section-title">Active Sessions</p>
            </div>
            <div className="sessions-list">
              {SESSIONS.map((s) => (
                <div key={s.user} className="session-row">
                  {s.status === "live"
                    ? <Wifi size={14} color="#2D6B0F" />
                    : <WifiOff size={14} color="var(--text-sub)" />
                  }
                  <span className="session-user">{s.user}</span>
                  <span className="session-time">Started {s.started}</span>
                  {s.status === "live"
                    ? <span className="session-live"><span className="live-dot" /> Live</span>
                    : <span className="session-ended">Ended</span>
                  }
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}