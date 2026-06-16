"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw, LogOut, AlertCircle, Monitor, Shield, Clock } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://ict-help-desk-neon.onrender.com";

// ── TODO: replace with real endpoint once confirmed ──────────────────────────
const SESSIONS_ENDPOINT = `${API}/auth/sessions`; // GET /auth/sessions
const FORCE_LOGOUT_ENDPOINT = (staffId: string | number) =>
  `${API}/auth/sessions/${staffId}`; // DELETE /auth/sessions/{staff_id}
// ─────────────────────────────────────────────────────────────────────────────

interface Session {
  id: string | number;
  staff_id: string | number;
  staff_email: string;
  staff_name?: string;
  role?: string;
  ip_address?: string;
  device?: string;
  created_at: string;
  last_active?: string;
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

function formatTime(ts: string) {
  return new Date(ts).toLocaleString("en-KE", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function RoleBadge({ role }: { role?: string }) {
  const r = role?.toUpperCase() ?? "STAFF";
  const colors: Record<string, { color: string; bg: string }> = {
    ADMIN:   { color: "#6B2D0F", bg: "#fef3e2" },
    ICT:     { color: "#0e7490", bg: "#cffafe" },
    STAFF:   { color: "#374151", bg: "#f3f4f6" },
  };
  const c = colors[r] ?? colors.STAFF;
  return (
    <span style={{
      padding: "0.18rem 0.6rem", borderRadius: "999px",
      backgroundColor: c.bg, color: c.color,
      fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.03em",
    }}>
      {r}
    </span>
  );
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [forceLoggingOut, setForceLoggingOut] = useState<Set<string | number>>(new Set());
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Session | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSessions = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const res = await fetch(SESSIONS_ENDPOINT, { credentials: "include" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `Error ${res.status}`);
      }
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : data.sessions ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load sessions.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      fetchSessions();
    }, 0);
    return () => window.clearTimeout(id);
  }, [fetchSessions]);

  const handleForceLogout = async (session: Session) => {
    setConfirmTarget(null);
    setForceLoggingOut((prev) => new Set(prev).add(session.staff_id));
    try {
      const res = await fetch(FORCE_LOGOUT_ENDPOINT(session.staff_id), {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `Error ${res.status}`);
      }
      setSessions((prev) => prev.filter((s) => s.staff_id !== session.staff_id));
      showToast(`${session.staff_email} has been logged out.`, "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Force logout failed.", "error");
    } finally {
      setForceLoggingOut((prev) => {
        const next = new Set(prev);
        next.delete(session.staff_id);
        return next;
      });
    }
  };

  const filtered = sessions.filter((s) => {
    const q = search.toLowerCase();
    return (
      !q ||
      s.staff_email?.toLowerCase().includes(q) ||
      s.staff_name?.toLowerCase().includes(q) ||
      s.role?.toLowerCase().includes(q) ||
      s.ip_address?.includes(q)
    );
  });

  return (
    <>
      <style>{`
        :root {
          --brown: #6B2D0F;
          --brown-dark: #4A1E0A;
          --gold: #C8962E;
          --gold-light: #e8b84b;
          --cream: #FDF8F2;
          --text: #1a1a1a;
          --text-muted: #6b7280;
          --border: #e5e0d8;
          --white: #ffffff;
          --red: #b91c1c;
          --red-bg: #fee2e2;
        }

        .ss-root {
          flex: 1;
          width: 100%;
          min-height: 100vh;
          background: var(--cream);
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
          color: var(--text);
          overflow-y: auto;
        }

        /* Toast */
        .ss-toast {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 9999;
          padding: 0.75rem 1.25rem;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: slideUp 0.2s ease;
        }
        .ss-toast.success { background: #166534; color: #fff; }
        .ss-toast.error   { background: var(--red); color: #fff; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

        /* Confirm modal */
        .ss-overlay {
          position: fixed; inset: 0; z-index: 9000;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
        }
        .ss-modal {
          background: var(--white);
          border-radius: 14px;
          padding: 2rem;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
        .ss-modal h3 { font-size: 1.1rem; font-weight: 700; color: var(--brown-dark); margin: 0 0 0.5rem; }
        .ss-modal p  { font-size: 0.85rem; color: var(--text-muted); margin: 0 0 1.5rem; line-height: 1.5; }
        .ss-modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
        .ss-modal-cancel {
          padding: 0.55rem 1.1rem; border: 1px solid var(--border);
          border-radius: 8px; background: var(--white);
          font-size: 0.83rem; font-weight: 600; cursor: pointer; color: var(--text);
        }
        .ss-modal-cancel:hover { background: var(--cream); }
        .ss-modal-confirm {
          padding: 0.55rem 1.1rem; border: none;
          border-radius: 8px; background: var(--red);
          font-size: 0.83rem; font-weight: 600; cursor: pointer; color: #fff;
        }
        .ss-modal-confirm:hover { background: #991b1b; }

        /* Header */
        .ss-header {
          background: var(--white);
          border-bottom: 1px solid var(--border);
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .ss-header-left h1 { font-size: 1.3rem; font-weight: 700; color: var(--brown-dark); margin: 0 0 0.2rem; }
        .ss-header-left p  { font-size: 0.82rem; color: var(--text-muted); margin: 0; }

        .ss-refresh-btn {
          display: flex; align-items: center; gap: 0.4rem;
          padding: 0.5rem 1rem; border: 1px solid var(--gold);
          border-radius: 8px; background: transparent;
          color: var(--brown); font-size: 0.82rem; font-weight: 600;
          cursor: pointer; transition: background 0.15s;
        }
        .ss-refresh-btn:hover { background: #fef3e2; }
        .ss-refresh-btn.spinning svg { animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Body */
        .ss-body { padding: 1.5rem 2rem; display: flex; flex-direction: column; gap: 1.25rem; }

        /* Summary cards */
        .ss-cards { display: flex; gap: 1rem; flex-wrap: wrap; }
        .ss-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 1rem 1.4rem;
          display: flex; flex-direction: column; gap: 0.2rem;
          min-width: 140px; flex: 1;
          border-top: 3px solid var(--gold);
        }
        .ss-card-num   { font-size: 1.5rem; font-weight: 700; color: var(--brown-dark); }
        .ss-card-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }

        /* Warning banner */
        .ss-warning {
          background: #fffbeb;
          border: 1px solid #fcd34d;
          border-radius: 8px;
          padding: 0.75rem 1rem;
          font-size: 0.83rem;
          color: #92400e;
          display: flex; align-items: center; gap: 0.5rem;
        }

        /* Filters */
        .ss-filters {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 1rem 1.25rem;
          display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;
        }
        .ss-search-wrap { position: relative; flex: 1; min-width: 200px; }
        .ss-search-wrap svg { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
        .ss-search-wrap input {
          width: 100%; padding: 0.55rem 0.75rem 0.55rem 2.25rem;
          border: 1px solid var(--border); border-radius: 8px;
          font-size: 0.85rem; color: var(--text); background: var(--cream);
          box-sizing: border-box; outline: none; transition: border-color 0.15s;
        }
        .ss-search-wrap input:focus { border-color: var(--gold); }
        .ss-count {
          font-size: 0.8rem; color: var(--text-muted);
          padding: 0.4rem 0.6rem; background: #f3f4f6; border-radius: 6px;
          white-space: nowrap;
        }

        /* Table */
        .ss-table-wrap {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }
        .ss-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        .ss-table thead th {
          background: var(--brown-dark);
          color: rgba(255,255,255,0.85);
          font-size: 0.72rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.04em;
          padding: 0.85rem 1rem; text-align: left; white-space: nowrap;
          border-bottom: 2px solid var(--gold);
        }
        .ss-table tbody tr { border-bottom: 1px solid var(--border); transition: background 0.1s; }
        .ss-table tbody tr:last-child { border-bottom: none; }
        .ss-table tbody tr:hover { background: #fdf6ee; }
        .ss-table td { padding: 0.85rem 1rem; vertical-align: middle; }

        .ss-staff { display: flex; flex-direction: column; gap: 0.15rem; }
        .ss-staff-name  { font-weight: 600; color: var(--text); font-size: 0.85rem; }
        .ss-staff-email { font-size: 0.75rem; color: var(--text-muted); }

        .ss-meta { display: flex; flex-direction: column; gap: 0.15rem; }
        .ss-meta-ip     { font-size: 0.8rem; font-weight: 500; color: var(--text); font-family: monospace; }
        .ss-meta-device { font-size: 0.72rem; color: var(--text-muted); }

        .ss-time { display: flex; flex-direction: column; gap: 0.1rem; }
        .ss-time-main { font-size: 0.8rem; font-weight: 500; color: var(--text); }
        .ss-time-ago  { font-size: 0.7rem; color: var(--gold); font-weight: 500; }

        .ss-logout-btn {
          display: flex; align-items: center; gap: 0.35rem;
          padding: 0.4rem 0.85rem;
          border: 1px solid var(--red); border-radius: 7px;
          background: transparent; color: var(--red);
          font-size: 0.78rem; font-weight: 600;
          cursor: pointer; transition: all 0.15s; white-space: nowrap;
        }
        .ss-logout-btn:hover:not(:disabled) { background: var(--red-bg); }
        .ss-logout-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Empty / error */
        .ss-empty {
          padding: 3.5rem 1rem; text-align: center; color: var(--text-muted);
        }
        .ss-empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; opacity: 0.3; }
        .ss-empty h3 { font-size: 1rem; font-weight: 600; color: var(--text); margin: 0 0 0.3rem; }
        .ss-empty p  { font-size: 0.83rem; margin: 0; }

        .ss-error-banner {
          background: var(--red-bg); border: 1px solid #fca5a5;
          border-radius: 8px; padding: 0.75rem 1rem;
          color: var(--red); font-size: 0.85rem;
          display: flex; align-items: center; gap: 0.5rem;
        }

        @media (max-width: 768px) {
          .ss-header, .ss-body { padding: 1rem; }
          .ss-table thead th:nth-child(3),
          .ss-table td:nth-child(3) { display: none; }
        }
      `}</style>

      {/* Confirm modal */}
      {confirmTarget && (
        <div className="ss-overlay" onClick={() => setConfirmTarget(null)}>
          <div className="ss-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Force Logout</h3>
            <p>
              You are about to forcefully end the session for{" "}
              <strong>{confirmTarget.staff_email}</strong>. They will be logged out
              immediately and will need to sign in again.
            </p>
            <div className="ss-modal-actions">
              <button className="ss-modal-cancel" onClick={() => setConfirmTarget(null)}>
                Cancel
              </button>
              <button
                className="ss-modal-confirm"
                onClick={() => handleForceLogout(confirmTarget)}
              >
                Yes, Force Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`ss-toast ${toast.type}`}>
          {toast.type === "success" ? <Shield size={14} /> : <AlertCircle size={14} />}
          {toast.msg}
        </div>
      )}

      <div className="ss-root">
        {/* Header */}
        <div className="ss-header">
          <div className="ss-header-left">
            <h1>Active Sessions</h1>
            <p>Manage active staff sessions — Admin only</p>
          </div>
          <button
            className={`ss-refresh-btn${refreshing ? " spinning" : ""}`}
            onClick={() => fetchSessions(true)}
            disabled={refreshing}
          >
            <RefreshCw size={14} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        <div className="ss-body">
          {/* Error */}
          {error && (
            <div className="ss-error-banner">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          {/* Summary cards */}
          {!loading && !error && (
            <>
              <div className="ss-cards">
                <div className="ss-card">
                  <span className="ss-card-num">{sessions.length}</span>
                  <span className="ss-card-label">Active Sessions</span>
                </div>
                <div className="ss-card" style={{ borderTopColor: "#0e7490" }}>
                  <span className="ss-card-num">
                    {sessions.filter((s) => s.role?.toUpperCase() === "ADMIN").length}
                  </span>
                  <span className="ss-card-label">Admin Sessions</span>
                </div>
                <div className="ss-card" style={{ borderTopColor: "#166534" }}>
                  <span className="ss-card-num">
                    {sessions.filter((s) => s.role?.toUpperCase() === "ICT").length}
                  </span>
                  <span className="ss-card-label">ICT Sessions</span>
                </div>
                <div className="ss-card" style={{ borderTopColor: "#6b7280" }}>
                  <span className="ss-card-num">
                    {sessions.filter((s) => !s.role || s.role?.toUpperCase() === "STAFF").length}
                  </span>
                  <span className="ss-card-label">Staff Sessions</span>
                </div>
              </div>

              {sessions.length > 10 && (
                <div className="ss-warning">
                  <AlertCircle size={14} />
                  {sessions.length} active sessions detected. Review for any suspicious activity.
                </div>
              )}
            </>
          )}

          {/* Filters */}
          <div className="ss-filters">
            <div className="ss-search-wrap">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search by name, email, role, or IP…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); }}
              />
            </div>
            <span className="ss-count">
              {filtered.length} {filtered.length === 1 ? "session" : "sessions"}
            </span>
          </div>

          {/* Table */}
          <div className="ss-table-wrap">
            {loading ? (
              <div className="ss-empty">
                <div className="ss-empty-icon">⏳</div>
                <h3>Loading sessions…</h3>
                <p>Fetching active session data.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="ss-empty">
                <div className="ss-empty-icon">
                  <Monitor size={40} strokeWidth={1} />
                </div>
                <h3>{search ? "No sessions match your search" : "No active sessions"}</h3>
                <p>{search ? "Try a different search term." : "All staff are currently logged out."}</p>
              </div>
            ) : (
              <table className="ss-table">
                <thead>
                  <tr>
                    <th>Staff</th>
                    <th>Role</th>
                    <th>IP / Device</th>
                    <th>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <Clock size={12} /> Session Started
                      </span>
                    </th>
                    <th>Last Active</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((session) => (
                    <tr key={session.id}>
                      <td>
                        <div className="ss-staff">
                          {session.staff_name && (
                            <span className="ss-staff-name">{session.staff_name}</span>
                          )}
                          <span className="ss-staff-email">{session.staff_email}</span>
                        </div>
                      </td>
                      <td>
                        <RoleBadge role={session.role} />
                      </td>
                      <td>
                        <div className="ss-meta">
                          <span className="ss-meta-ip">{session.ip_address ?? "—"}</span>
                          {session.device && (
                            <span className="ss-meta-device">{session.device}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="ss-time">
                          <span className="ss-time-main">{formatTime(session.created_at)}</span>
                          <span className="ss-time-ago">{timeAgo(session.created_at)}</span>
                        </div>
                      </td>
                      <td>
                        {session.last_active ? (
                          <div className="ss-time">
                            <span className="ss-time-main">{formatTime(session.last_active)}</span>
                            <span className="ss-time-ago">{timeAgo(session.last_active)}</span>
                          </div>
                        ) : (
                          <span style={{ color: "#d1d5db", fontSize: "0.75rem" }}>—</span>
                        )}
                      </td>
                      <td>
                        <button
                          className="ss-logout-btn"
                          onClick={() => setConfirmTarget(session)}
                          disabled={forceLoggingOut.has(session.staff_id)}
                        >
                          <LogOut size={13} />
                          {forceLoggingOut.has(session.staff_id) ? "Logging out…" : "Force Logout"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}