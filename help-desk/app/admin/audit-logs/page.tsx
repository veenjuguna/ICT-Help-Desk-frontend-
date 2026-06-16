"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw, Shield, LogIn, LogOut, Ticket, UserPlus, Package, AlertCircle } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://ict-help-desk-neon.onrender.com";

type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "TICKET_CREATED"
  | "TICKET_ASSIGNED"
  | "TICKET_CLOSED"
  | "ASSET_ALLOCATED"
  | "USER_CREATED"
  | "LOGOUT";

interface AuditLog {
  id: string | number;
  action: AuditAction;
  staff_email: string;
  timestamp: string;
  detail?: string;
}

const ACTION_META: Record<AuditAction, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  LOGIN_SUCCESS:    { label: "Login Success",    color: "#1e6db5", bg: "#dbeafe", Icon: LogIn },
  LOGIN_FAILED:     { label: "Login Failed",     color: "#b91c1c", bg: "#fee2e2", Icon: AlertCircle },
  TICKET_CREATED:   { label: "Ticket Created",   color: "#166534", bg: "#dcfce7", Icon: Ticket },
  TICKET_ASSIGNED:  { label: "Ticket Assigned",  color: "#0e7490", bg: "#cffafe", Icon: Ticket },
  TICKET_CLOSED:    { label: "Ticket Closed",    color: "#4b5563", bg: "#f3f4f6", Icon: Ticket },
  ASSET_ALLOCATED:  { label: "Asset Allocated",  color: "#92400e", bg: "#fef3c7", Icon: Package },
  USER_CREATED:     { label: "User Created",     color: "#0e7490", bg: "#cffafe", Icon: UserPlus },
  LOGOUT:           { label: "Logout",           color: "#4b5563", bg: "#f3f4f6", Icon: LogOut },
};

const ALL_ACTIONS = Object.keys(ACTION_META) as AuditAction[];

function ActionBadge({ action }: { action: AuditAction }) {
  const meta = ACTION_META[action] ?? { label: action, color: "#4b5563", bg: "#f3f4f6", Icon: Shield };
  const { label, color, bg, Icon } = meta;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.3rem",
      padding: "0.2rem 0.65rem", borderRadius: "999px",
      backgroundColor: bg, color, fontSize: "0.72rem", fontWeight: 600,
      whiteSpace: "nowrap",
    }}>
      <Icon size={11} />
      {label}
    </span>
  );
}

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  return {
    date: d.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  };
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditAction | "">("");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const PAGE_SIZE = 20;

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await fetch(`${API}/audit`, { credentials: "include" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `Error ${res.status}`);
      }
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : data.logs ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load audit logs.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchLogs(); }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchLogs]);

  // Filter
  const filtered = logs.filter((l) => {
    const matchSearch =
      !search ||
      l.staff_email?.toLowerCase().includes(search.toLowerCase()) ||
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.detail?.toLowerCase().includes(search.toLowerCase());
    const matchAction = !actionFilter || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFilterChange = (val: AuditAction | "") => {
    setActionFilter(val);
    setPage(1);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <>
      <style>{`
        :root {
          --brown: #6B2D0F;
          --brown-dark: #4A1E0A;
          --brown-mid: #8B3A12;
          --gold: #C8962E;
          --gold-light: #e8b84b;
          --cream: #FDF8F2;
          --text: #1a1a1a;
          --text-muted: #6b7280;
          --border: #e5e0d8;
          --white: #ffffff;
        }

        .al-root {
          flex: 1;
          width: 100%;
          min-height: 100vh;
          background: var(--cream);
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
          color: var(--text);
          overflow-y: auto;
        }

        .al-header {
          background: var(--white);
          border-bottom: 1px solid var(--border);
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .al-header-left h1 {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--brown-dark);
          margin: 0 0 0.2rem;
        }

        .al-header-left p {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin: 0;
        }

        .al-refresh-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          border: 1px solid var(--gold);
          border-radius: 8px;
          background: transparent;
          color: var(--brown);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .al-refresh-btn:hover { background: #fef3e2; }
        .al-refresh-btn.spinning svg { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .al-body { padding: 1.5rem 2rem; display: flex; flex-direction: column; gap: 1.25rem; }

        /* Stats strip */
        .al-stats {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .al-stat {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0.85rem 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          min-width: 130px;
        }
        .al-stat-num { font-size: 1.4rem; font-weight: 700; color: var(--brown-dark); }
        .al-stat-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }

        /* Filters */
        .al-filters {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 1rem 1.25rem;
          display: flex;
          gap: 0.75rem;
          align-items: center;
          flex-wrap: wrap;
        }

        .al-search-wrap {
          position: relative;
          flex: 1;
          min-width: 200px;
        }
        .al-search-wrap svg {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }
        .al-search-wrap input {
          width: 100%;
          padding: 0.55rem 0.75rem 0.55rem 2.25rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.85rem;
          color: var(--text);
          background: var(--cream);
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s;
        }
        .al-search-wrap input:focus { border-color: var(--gold); }

        .al-select {
          padding: 0.55rem 0.85rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 0.83rem;
          color: var(--text);
          background: var(--cream);
          outline: none;
          cursor: pointer;
          min-width: 160px;
        }
        .al-select:focus { border-color: var(--gold); }

        .al-count {
          font-size: 0.8rem;
          color: var(--text-muted);
          white-space: nowrap;
          padding: 0.4rem 0.6rem;
          background: #f3f4f6;
          border-radius: 6px;
        }

        /* Table */
        .al-table-wrap {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .al-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }

        .al-table thead th {
          background: var(--brown-dark);
          color: rgba(255,255,255,0.85);
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 0.85rem 1rem;
          text-align: left;
          white-space: nowrap;
          border-bottom: 2px solid var(--gold);
        }

        .al-table tbody tr {
          border-bottom: 1px solid var(--border);
          transition: background 0.1s;
        }
        .al-table tbody tr:last-child { border-bottom: none; }
        .al-table tbody tr:hover { background: #fdf6ee; }

        .al-table td {
          padding: 0.85rem 1rem;
          vertical-align: middle;
          color: var(--text);
        }

        .al-ts { display: flex; flex-direction: column; gap: 0.1rem; }
        .al-ts-date { font-size: 0.8rem; font-weight: 600; color: var(--text); }
        .al-ts-time { font-size: 0.72rem; color: var(--text-muted); }
        .al-ts-ago { font-size: 0.68rem; color: var(--gold); font-weight: 500; }

        .al-email { font-weight: 500; color: var(--brown); }
        .al-email-domain { color: var(--text-muted); font-weight: 400; }

        .al-detail { font-size: 0.78rem; color: var(--text-muted); max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        /* Empty / loading / error */
        .al-empty {
          padding: 3.5rem 1rem;
          text-align: center;
          color: var(--text-muted);
        }
        .al-empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; opacity: 0.3; }
        .al-empty h3 { font-size: 1rem; font-weight: 600; color: var(--text); margin: 0 0 0.3rem; }
        .al-empty p { font-size: 0.83rem; margin: 0; }

        .al-error-banner {
          background: #fee2e2;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: #b91c1c;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Pagination */
        .al-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          padding: 1rem 0 0;
        }
        .al-pagination-info { font-size: 0.8rem; color: var(--text-muted); }
        .al-pagination-btns { display: flex; gap: 0.4rem; }
        .al-pg-btn {
          padding: 0.4rem 0.8rem;
          border: 1px solid var(--border);
          border-radius: 6px;
          background: var(--white);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          color: var(--text);
          transition: all 0.15s;
        }
        .al-pg-btn:hover:not(:disabled) { border-color: var(--gold); color: var(--brown); }
        .al-pg-btn.active { background: var(--brown); color: white; border-color: var(--brown); }
        .al-pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        @media (max-width: 768px) {
          .al-header, .al-body { padding: 1rem; }
          .al-table thead th:nth-child(4), .al-table td:nth-child(4) { display: none; }
        }
      `}</style>

      <div className="al-root">
        {/* Header */}
        <div className="al-header">
          <div className="al-header-left">
            <h1>Audit Logs</h1>
            <p>System-wide activity log — read only</p>
          </div>
          <button
            className={`al-refresh-btn${refreshing ? " spinning" : ""}`}
            onClick={() => fetchLogs(true)}
            disabled={refreshing}
          >
            <RefreshCw size={14} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        <div className="al-body">
          {/* Error */}
          {error && (
            <div className="al-error-banner">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {/* Quick stats */}
          {!loading && !error && (
            <div className="al-stats">
              {ALL_ACTIONS.map((action) => {
                const count = logs.filter((l) => l.action === action).length;
                if (count === 0) return null;
                const meta = ACTION_META[action];
                return (
                  <div key={action} className="al-stat" style={{ borderTop: `3px solid ${meta.color}` }}>
                    <span className="al-stat-num">{count}</span>
                    <span className="al-stat-label">{meta.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Filters */}
          <div className="al-filters">
            <div className="al-search-wrap">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search by email, action, or detail…"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <select
              className="al-select"
              value={actionFilter}
              onChange={(e) => handleFilterChange(e.target.value as AuditAction | "")}
            >
              <option value="">All Actions</option>
              {ALL_ACTIONS.map((a) => (
                <option key={a} value={a}>{ACTION_META[a].label}</option>
              ))}
            </select>
            <span className="al-count">
              {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {/* Table */}
          <div className="al-table-wrap">
            {loading ? (
              <div className="al-empty">
                <div className="al-empty-icon">⏳</div>
                <h3>Loading audit logs…</h3>
                <p>Fetching activity records from the system.</p>
              </div>
            ) : paginated.length === 0 ? (
              <div className="al-empty">
                <div className="al-empty-icon">🔍</div>
                <h3>No entries found</h3>
                <p>{search || actionFilter ? "Try adjusting your filters." : "No audit activity recorded yet."}</p>
              </div>
            ) : (
              <table className="al-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Staff</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((log) => {
                    const { date, time } = formatTimestamp(log.timestamp);
                    const ago = timeAgo(log.timestamp);
                    const [user, domain] = (log.staff_email ?? "").split("@");
                    return (
                      <tr key={log.id}>
                        <td>
                          <div className="al-ts">
                            <span className="al-ts-date">{date}</span>
                            <span className="al-ts-time">{time}</span>
                            <span className="al-ts-ago">{ago}</span>
                          </div>
                        </td>
                        <td>
                          <ActionBadge action={log.action} />
                        </td>
                        <td>
                          <span className="al-email">
                            {user}
                            {domain && <span className="al-email-domain">@{domain}</span>}
                          </span>
                        </td>
                        <td>
                          {log.detail ? (
                            <span className="al-detail" title={log.detail}>{log.detail}</span>
                          ) : (
                            <span style={{ color: "#d1d5db", fontSize: "0.75rem" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && filtered.length > PAGE_SIZE && (
            <div className="al-pagination">
              <span className="al-pagination-info">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="al-pagination-btns">
                <button className="al-pg-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                  ← Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      className={`al-pg-btn${page === p ? " active" : ""}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  );
                })}
                {totalPages > 5 && page < totalPages && (
                  <button className="al-pg-btn active" disabled>{page > 5 ? page : "…"}</button>
                )}
                <button className="al-pg-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}