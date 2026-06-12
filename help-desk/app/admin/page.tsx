"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, Ticket, Package, Monitor,
  AlertCircle, Wifi, WifiOff,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────

interface AdminUser {
  full_name?: string;
  email?: string;
  role?: string;
  department?: { name: string };
}

interface IctPersonnel {
  id: number;
  staff_id: string;
  availability: string;
  specialization: string | null;
  is_active: boolean;
}

interface StaffItem {
  id: string;
  full_name: string;
  email: string;
}

interface TicketItem {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  staff_id: string;
  assigned_to_id: number | null;
  comment: string | null;
  created_at: string;
  closed_at: string | null;
}

interface TicketSummary {
  OPEN?: number;
  IN_PROGRESS?: number;
  CLOSED?: number;
}

interface AssetItem {
  id: number;
  asset_tag: string;
  device_type: string;
  brand: string;
  model: string;
  condition: string;
}

interface SessionItem {
  id: number;
  staff_id: string;
  ip_address?: string;
  login_at: string;
  is_active: boolean;
}

// ── Helpers ───────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-KE", {
    hour: "2-digit", minute: "2-digit",
  });
}

function StatusBadge({ status, comment }: { status: string; comment?: string | null }) {
  // RESOLVED and UNRESOLVED are transient — never stored in DB
  // CLOSED with a comment = was marked unresolved by ICT
  const isUnresolved = status === "CLOSED" && !!comment;

  const map: Record<string, { bg: string; color: string }> = {
    "OPEN":        { bg: "#FFF3E0", color: "#C8962E" },
    "IN_PROGRESS": { bg: "#FFF8E0", color: "#6B2D0F" },
    "CLOSED":      { bg: "#F3F3F3", color: "#555"    },
  };

  const s = map[status] ?? { bg: "#eee", color: "#333" };
  const label = isUnresolved
    ? "Closed — Unresolved"
    : status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <span style={{
      background: isUnresolved ? "#FFEBEE" : s.bg,
      color: isUnresolved ? "#BB0000" : s.color,
      padding: "3px 10px", borderRadius: "20px",
      fontSize: "11.5px", fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

const specializationLabel: Record<string, string> = {
  HARDWARE:             "Hardware",
  NETWORKING:           "Networking",
  SOFTWARE_AND_SYSTEMS: "Software & Systems",
  SECURITY:             "Security",
  OTHER:                "Other",
};

const categoryLabel: Record<string, string> = {
  hardware:            "Hardware",
  software:            "Software",
  network:             "Network",
  access_permissions:  "Access & Permissions",
  security_incidents:  "Security",
  other:               "Other",
};

// ── Component ─────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [user, setUser]               = useState<AdminUser | null>(null);
  const [summary, setSummary]         = useState<TicketSummary>({});
  const [personnel, setPersonnel]     = useState<IctPersonnel[]>([]);
  const [staffMap, setStaffMap]       = useState<Record<string, StaffItem>>({});
  const [recentTickets, setRecentTickets] = useState<TicketItem[]>([]);
  const [queuedCount, setQueuedCount] = useState(0);
  const [totalStaff, setTotalStaff]   = useState(0);
  const [assets, setAssets]           = useState<AssetItem[]>([]);
  const [sessions, setSessions]       = useState<SessionItem[]>([]);
  const [loading, setLoading]         = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    (async () => {
      try {
        const [
          meRes, summaryRes, personnelRes,
          ticketsRes, queuedRes, assetsRes,
          sessionsRes, staffRes,
        ] = await Promise.all([
          fetch(`${API}/staff/me`,                              { credentials: "include" }),
          fetch(`${API}/tickets/admin/summary`,                 { credentials: "include" }),
          fetch(`${API}/ict-personnel/`,                        { credentials: "include" }),
          fetch(`${API}/tickets/?limit=5`,                      { credentials: "include" }),
          fetch(`${API}/tickets/admin/queued`,                  { credentials: "include" }),
          fetch(`${API}/assets/`,                               { credentials: "include" }),
          fetch(`${API}/auth/sessions?active_only=true&limit=10`, { credentials: "include" }),
          fetch(`${API}/staff/?limit=200`,                      { credentials: "include" }),
        ]);

        if (meRes.ok)       setUser(await meRes.json());
        if (summaryRes.ok)  setSummary(await summaryRes.json());
        if (assetsRes.ok)   setAssets(await assetsRes.json());
        if (sessionsRes.ok) setSessions(await sessionsRes.json());

        if (personnelRes.ok) setPersonnel(await personnelRes.json());

        if (ticketsRes.ok)  setRecentTickets(await ticketsRes.json());

        if (queuedRes.ok) {
          const queued: TicketItem[] = await queuedRes.json();
          setQueuedCount(queued.length);
        }

        // Build staff lookup map for resolving names from IDs
        if (staffRes.ok) {
          const allStaff: StaffItem[] = await staffRes.json();
          setTotalStaff(allStaff.length);
          const map: Record<string, StaffItem> = {};
          allStaff.forEach(s => { map[s.id] = s; });
          setStaffMap(map);
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [API]);

  const fullName   = user?.full_name ?? "Loading...";
  const department = user?.department?.name ?? "National Treasury";
  const email      = user?.email ?? "";

  const availableCount = personnel.filter(
    p => p.availability === "AVAILABLE" && p.is_active
  ).length;

  const today = new Date().toLocaleDateString("en-KE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const STATS = [
    {
      label: "Total Staff",
      value: loading ? "—" : String(totalStaff),
      icon: Users,
      color: "#C8962E",
    },
    {
      label: "Open Tickets",
      value: loading ? "—" : String(summary.OPEN ?? 0),
      icon: Ticket,
      color: "#6B2D0F",
    },
    {
      label: "Total Assets",
      value: loading ? "—" : String(assets.length),
      icon: Package,
      color: "#C8962E",
    },
    {
      label: "ICT Available",
      value: loading ? "—" : String(availableCount),
      icon: Monitor,
      color: "#2D6B0F",
    },
  ];

  // Asset breakdown by device type
  const assetGroups = assets.reduce<Record<string, number>>((acc, a) => {
    const key = a.device_type
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

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
          width: 100%; min-width: 0;
          background: var(--cream);
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text); box-sizing: border-box;
        }
        .adm-content {
          padding: 1.5rem 2rem;
          display: flex; flex-direction: column; gap: 1.5rem;
          width: 100%; min-width: 0; box-sizing: border-box;
        }

        .greeting-card {
          background: var(--brown); border-radius: 16px;
          padding: 1.75rem 2rem;
          display: flex; align-items: center; justify-content: space-between;
          position: relative; overflow: hidden; width: 100%;
        }
        .greeting-card::before {
          content: ''; position: absolute; top: -60px; right: -60px;
          width: 200px; height: 200px; border-radius: 50%;
          background: rgba(200,150,46,0.15);
        }
        .greeting-card::after {
          content: ''; position: absolute; bottom: -40px; right: 100px;
          width: 120px; height: 120px; border-radius: 50%;
          background: rgba(200,150,46,0.08);
        }
        .greeting-left { position: relative; z-index: 1; }
        .greeting-tag {
          font-size: 11px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: var(--gold-light); margin-bottom: 0.35rem;
        }
        .greeting-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem; font-weight: 700; color: #fff;
          margin-bottom: 0.3rem; line-height: 1.15;
        }
        .greeting-sub { font-size: 13px; color: rgba(255,255,255,0.55); }
        .greeting-actions {
          display: flex; gap: 0.75rem; position: relative; z-index: 1; flex-wrap: wrap;
        }
        .btn-primary {
          display: flex; align-items: center; gap: 7px;
          background: var(--gold); color: var(--brown-dark);
          padding: 0.6rem 1.2rem; border-radius: 8px;
          font-size: 13px; font-weight: 700; text-decoration: none;
          transition: background 0.15s; border: none; cursor: pointer;
          font-family: inherit;
        }
        .btn-primary:hover { background: var(--gold-light); }
        .btn-ghost {
          display: flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.1); color: #fff;
          padding: 0.6rem 1.2rem; border-radius: 8px;
          font-size: 13px; font-weight: 600; text-decoration: none;
          transition: background 0.15s; border: 1px solid rgba(255,255,255,0.2);
          cursor: pointer; font-family: inherit;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.18); }

        .adm-alert {
          background: #FFF8F3; border: 1px solid #F5C8A8;
          border-left: 4px solid var(--gold); border-radius: 10px;
          padding: 12px 16px; display: flex; align-items: center;
          gap: 10px; font-size: 13px; color: var(--brown);
        }
        .adm-alert svg { color: var(--gold); flex-shrink: 0; }
        .adm-alert strong { color: var(--text); }
        .adm-alert a {
          color: var(--gold); font-weight: 600; text-decoration: none;
        }
        .adm-alert a:hover { text-decoration: underline; }

        .stats-row {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem; width: 100%; min-width: 0;
        }
        .stat-card {
          background: #fff; border-radius: 12px; border: 1px solid var(--border);
          padding: 1.25rem 1.5rem; display: flex; align-items: center; gap: 1rem;
          box-shadow: 0 2px 8px rgba(107,45,15,0.05);
        }
        .stat-icon {
          width: 44px; height: 44px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .stat-value {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem; font-weight: 700; color: var(--text);
          line-height: 1;
        }
        .stat-label { font-size: 12px; color: var(--text-sub); margin-top: 3px; }

        .two-col {
          display: grid; grid-template-columns: minmax(0, 1fr) 300px;
          gap: 1.5rem; align-items: start; width: 100%; min-width: 0;
        }
        .section-card {
          background: #fff; border-radius: 14px; border: 1px solid var(--border);
          overflow: hidden; box-shadow: 0 2px 8px rgba(107,45,15,0.04);
          width: 100%; min-width: 0;
        }
        .section-header {
          padding: 1.1rem 1.5rem; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .section-title { font-size: 14px; font-weight: 700; color: var(--text); }
        .section-link {
          font-size: 12px; color: var(--brown);
          text-decoration: none; font-weight: 600;
        }
        .section-link:hover { text-decoration: underline; }

        .ticket-table-wrap { overflow-x: auto; width: 100%; }
        .ticket-table {
          width: 100%; border-collapse: collapse;
          font-size: 13px; min-width: 500px;
        }
        .ticket-table th {
          padding: 0.75rem 1.5rem; text-align: left;
          font-size: 11px; font-weight: 700; color: var(--text-sub);
          letter-spacing: 0.5px; text-transform: uppercase;
          background: #FDFAF6; border-bottom: 1px solid var(--border);
        }
        .ticket-table td {
          padding: 0.85rem 1.5rem; border-bottom: 1px solid #F5EDE0;
          color: var(--text); vertical-align: middle;
        }
        .ticket-table tr:last-child td { border-bottom: none; }
        .ticket-table tr:hover td { background: #FDFAF6; }
        .ticket-id {
          font-weight: 600; color: var(--brown);
          font-size: 12.5px; font-family: monospace;
        }
        .ticket-sub-text {
          font-size: 12px; color: var(--text-sub); margin-top: 2px;
        }
        .queued-badge {
          font-size: 11px; font-weight: 600;
          background: #FFF3E0; color: #C8962E;
          padding: 2px 8px; border-radius: 10px;
        }

        .staff-list { padding: 4px 0; }
        .staff-row {
          display: flex; align-items: center;
          padding: 11px 1.5rem; gap: 12px;
          border-bottom: 1px solid #F5EDE0;
        }
        .staff-row:last-child { border-bottom: none; }
        .staff-dot {
          width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0;
        }
        .staff-name {
          flex: 1; font-size: 13px; font-weight: 500; color: var(--text);
        }
        .staff-spec {
          font-size: 11.5px; color: var(--text-sub);
          background: var(--cream); border: 1px solid var(--border);
          padding: 2px 8px; border-radius: 10px;
        }
        .staff-badge {
          font-size: 11.5px; color: var(--text-sub);
          background: var(--cream); border: 1px solid var(--border);
          padding: 2px 8px; border-radius: 10px;
        }
        .setup-badge {
          font-size: 11px; font-weight: 600;
          background: #FFEBEE; color: #BB0000;
          padding: 2px 8px; border-radius: 10px;
        }

        .asset-list {
          padding: 1rem 1.5rem;
          display: flex; flex-direction: column; gap: 14px;
        }
        .asset-meta {
          display: flex; justify-content: space-between;
          margin-bottom: 6px; font-size: 12.5px;
        }
        .asset-name { font-weight: 500; color: var(--text); }
        .asset-count { color: var(--text-sub); }
        .bar-track {
          height: 6px; background: var(--border);
          border-radius: 4px; overflow: hidden;
        }
        .bar-fill {
          height: 100%; border-radius: 4px;
          background: linear-gradient(90deg, var(--brown), var(--gold));
          transition: width 0.6s ease;
        }

        .sessions-list { padding: 4px 0; }
        .session-row {
          display: flex; align-items: center;
          padding: 11px 1.5rem; gap: 10px;
          border-bottom: 1px solid #F5EDE0; font-size: 12.5px;
        }
        .session-row:last-child { border-bottom: none; }
        .session-user {
          flex: 1; color: var(--text); font-weight: 500;
        }
        .session-time { color: var(--text-sub); font-size: 12px; }
        .session-live {
          display: flex; align-items: center; gap: 4px;
          font-size: 11.5px; font-weight: 700; color: #2D6B0F;
        }
        .session-ended { color: var(--text-sub); font-size: 11.5px; }
        .live-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #2D6B0F; animation: pulse 1.6s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.3); }
        }

        .empty-state {
          font-size: 13px; color: var(--text-sub);
          text-align: center; padding: 1rem 0;
        }

        @media (max-width: 1100px) { .two-col { grid-template-columns: 1fr; } }
        @media (max-width: 768px) {
          .stats-row { grid-template-columns: repeat(2, 1fr); }
          .adm-content { padding: 1rem; }
          .greeting-card { flex-direction: column; align-items: flex-start; gap: 1rem; }
        }
        @media (max-width: 480px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
      `}</style>

      <div className="adm-root">
        <div className="adm-content">

          {/* GREETING */}
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

          {/* QUEUED TICKETS ALERT — only show when there are queued tickets */}
          {queuedCount > 0 && (
            <div className="adm-alert">
              <AlertCircle size={17} />
              <span>
                <strong>
                  {queuedCount} unassigned ticket{queuedCount !== 1 ? "s" : ""}
                </strong>{" "}
                awaiting ICT specialist assignment.{" "}
                <Link href="/admin/tickets?view=queued">Assign now →</Link>
              </span>
            </div>
          )}

          {/* STATS */}
          <div className="stats-row">
            {STATS.map((s) => {
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

            {/* RECENT TICKETS */}
            <div className="section-card">
              <div className="section-header">
                <p className="section-title">Recent Tickets</p>
                <Link href="/admin/tickets" className="section-link">
                  View all
                </Link>
              </div>
              <div className="ticket-table-wrap">
                <table className="ticket-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Assigned To</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTickets.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            textAlign: "center",
                            color: "var(--text-sub)",
                            padding: "1.5rem",
                          }}
                        >
                          No tickets yet.
                        </td>
                      </tr>
                    ) : recentTickets.map((t) => {
                      const assignedStaff = t.assigned_to_id
                        ? Object.values(staffMap).find(
                            s => s.id === String(t.assigned_to_id)
                          )
                        : null;
                      const raisedBy = staffMap[t.staff_id];

                      return (
                        <tr key={t.id}>
                          <td>
                            <span className="ticket-id">
                              TKT-{String(t.id).padStart(4, "0")}
                            </span>
                          </td>
                          <td>
                            <div>{t.title}</div>
                            <div className="ticket-sub-text">
                              {raisedBy?.full_name ?? "—"}
                            </div>
                          </td>
                          <td style={{ color: "var(--text-sub)", fontSize: 12.5 }}>
                            {categoryLabel[t.category] ?? t.category}
                          </td>
                          <td style={{ fontSize: 12.5 }}>
                            {t.assigned_to_id === null ? (
                              <span className="queued-badge">Unassigned</span>
                            ) : assignedStaff ? (
                              assignedStaff.full_name
                                .split(" ")
                                .map((n, i, arr) =>
                                  i === arr.length - 1
                                    ? n[0] + "."
                                    : n
                                )
                                .join(" ")
                            ) : (
                              `Tech #${t.assigned_to_id}`
                            )}
                          </td>
                          <td>
                            <StatusBadge
                              status={t.status}
                              comment={t.comment}
                            />
                          </td>
                        </tr>
                      );
                    })}
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
                  <Link href="/admin/ict-personnel" className="section-link">
                    Manage
                  </Link>
                </div>
                <div className="staff-list">
                  {personnel.length === 0 ? (
                    <p className="empty-state">No ICT personnel yet.</p>
                  ) : personnel.slice(0, 6).map((p) => {
                    const s = staffMap[p.staff_id];
                    const name = s?.full_name ?? `Staff ${p.staff_id.slice(0, 6)}`;
                    const availDot =
                      p.availability === "AVAILABLE" && p.is_active ? "#2D6B0F" :
                      p.availability === "BUSY"                      ? "#C8962E" :
                      "#B0906A";

                    return (
                      <div key={p.id} className="staff-row">
                        <span
                          className="staff-dot"
                          style={{ background: availDot }}
                        />
                        <span className="staff-name">{name}</span>
                        {!p.is_active && !p.specialization ? (
                          <span className="setup-badge">Setup pending</span>
                        ) : p.specialization ? (
                          <span className="staff-spec">
                            {specializationLabel[p.specialization] ?? p.specialization}
                          </span>
                        ) : (
                          <span className="staff-badge">
                            {p.availability.toLowerCase().replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ASSET BREAKDOWN */}
              <div className="section-card">
                <div className="section-header">
                  <p className="section-title">Asset Breakdown</p>
                  <Link href="/admin/assets" className="section-link">
                    View all
                  </Link>
                </div>
                <div className="asset-list">
                  {assets.length === 0 ? (
                    <p className="empty-state">No assets recorded yet.</p>
                  ) : (
                    Object.entries(assetGroups).slice(0, 5).map(([type, count]) => {
                      const pct = Math.round((count / assets.length) * 100);
                      return (
                        <div key={type}>
                          <div className="asset-meta">
                            <span className="asset-name">{type}</span>
                            <span className="asset-count">
                              {count} of {assets.length}
                            </span>
                          </div>
                          <div className="bar-track">
                            <div
                              className="bar-fill"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ACTIVE SESSIONS */}
          <div className="section-card">
            <div className="section-header">
              <p className="section-title">Active Sessions</p>
            </div>
            <div className="sessions-list">
              {sessions.length === 0 ? (
                <p className="empty-state">No active sessions.</p>
              ) : sessions.slice(0, 10).map((s) => {
                const staffMember = staffMap[s.staff_id];
                return (
                  <div key={s.id} className="session-row">
                    {s.is_active
                      ? <Wifi size={14} color="#2D6B0F" />
                      : <WifiOff size={14} color="var(--text-sub)" />
                    }
                    <span className="session-user">
                      {staffMember?.full_name ?? staffMember?.email ?? s.ip_address ?? s.staff_id}
                    </span>
                    <span className="session-time">
                      Started {formatTime(s.login_at)}
                    </span>
                    {s.is_active ? (
                      <span className="session-live">
                        <span className="live-dot" /> Live
                      </span>
                    ) : (
                      <span className="session-ended">Ended</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}