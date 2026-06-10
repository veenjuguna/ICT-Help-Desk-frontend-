"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Pencil, Trash2, X, RefreshCw } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface IctPersonnel {
  id: number;
  staff: {
    id: number;
    full_name: string;
    email: string;
    phone?: string;
  };
  specialization?: string;
  availability_status: "AVAILABLE" | "BUSY" | "OFF_DUTY" | "ON_LEAVE";
  active_tickets?: number;
  is_active: boolean;
  created_at: string;
}

interface Staff {
  id: number;
  full_name: string;
  email: string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://ict-help-desk-neon.onrender.com";

const SPECIALIZATIONS = [
  "Hardware Support",
  "Software Support",
  "Network & Connectivity",
  "Systems Administration",
  "Cybersecurity",
  "Database Administration",
  "User Support & Training",
  "Asset Management",
];

const EMPTY_FORM = {
  staff_id: "",
  specialization: "",
  password: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function AvailabilityBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; dot: string }> = {
    AVAILABLE: { bg: "#E8F5E9", color: "#2D6B0F", dot: "#2D6B0F" },
    BUSY:      { bg: "#FFF3E0", color: "#C8962E", dot: "#C8962E" },
    OFF_DUTY:  { bg: "#F3F3F3", color: "#7A5C44", dot: "#B0906A" },
    ON_LEAVE:  { bg: "#F3E8FF", color: "#6B2D8B", dot: "#9B59B6" },
  };
  const labels: Record<string, string> = {
    AVAILABLE: "Available",
    BUSY:      "Busy",
    OFF_DUTY:  "Off Duty",
    ON_LEAVE:  "On Leave",
  };
  const s = map[status] ?? { bg: "#F3F3F3", color: "#555", dot: "#aaa" };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: "20px",
      fontSize: "11.5px", fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 5,
      whiteSpace: "nowrap",
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: s.dot, flexShrink: 0,
      }} />
      {labels[status] ?? status}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function IctPersonnelPage() {
  const [personnel, setPersonnel]       = useState<IctPersonnel[]>([]);
  const [staffList, setStaffList]       = useState<Staff[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState<IctPersonnel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IctPersonnel | null>(null);
  const [form, setForm]                 = useState({ ...EMPTY_FORM });
  const [formError, setFormError]       = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [syncingId, setSyncingId]       = useState<number | null>(null);
  const [toast, setToast]               = useState("");

  // ── Fetch personnel ──────────────────────────────────────────────────────────
  const fetchPersonnel = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/ict-personnel/`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load ICT personnel.");
      const data = await res.json();
      if (Array.isArray(data)) setPersonnel(data);
      else if (Array.isArray(data?.results)) setPersonnel(data.results);
      else if (Array.isArray(data?.data)) setPersonnel(data.data);
      else setPersonnel([]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load ICT personnel.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch staff list for the create form ────────────────────────────────────
  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch(`${API}/staff/`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data
        : Array.isArray(data?.results) ? data.results
        : Array.isArray(data?.data) ? data.data
        : [];
      setStaffList(list);
    } catch {}
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchPersonnel();
      await fetchStaff();
    };
    void loadData();
  }, [fetchPersonnel, fetchStaff]);

  // ── Toast ────────────────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── Open create ──────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setShowModal(true);
  };

  // ── Open edit ────────────────────────────────────────────────────────────────
  const openEdit = (p: IctPersonnel) => {
    setEditTarget(p);
    setForm({
      staff_id:       p.staff.id.toString(),
      specialization: p.specialization ?? "",
      password:       "",
    });
    setFormError("");
    setShowModal(true);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!editTarget && !form.staff_id) {
      setFormError("Please select a staff member.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const body: Record<string, unknown> = {
        specialization: form.specialization || undefined,
      };
      if (!editTarget) body.staff_id = Number(form.staff_id);

      const url    = editTarget ? `${API}/ict-personnel/${editTarget.id}/` : `${API}/ict-personnel/`;
      const method = editTarget ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? err.message ?? "Something went wrong.");
      }
      setShowModal(false);
      await fetchPersonnel();
      showToast(editTarget ? "Profile updated." : "ICT personnel profile created.");
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/ict-personnel/${deleteTarget.id}/`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed.");
      setDeleteTarget(null);
      await fetchPersonnel();
      showToast("ICT personnel profile deleted.");
    } catch {
      showToast("Delete failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Sync availability ────────────────────────────────────────────────────────
  const handleSync = async (p: IctPersonnel) => {
    setSyncingId(p.id);
    try {
      const res = await fetch(`${API}/ict-personnel/${p.id}/sync-availability/`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      await fetchPersonnel();
      showToast(`Availability synced for ${p.staff.full_name}.`);
    } catch {
      showToast("Sync failed. Try again.");
    } finally {
      setSyncingId(null);
    }
  };

  // ── Filtered list ────────────────────────────────────────────────────────────
  const filtered = personnel.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.staff.full_name.toLowerCase().includes(q) ||
      p.staff.email.toLowerCase().includes(q) ||
      (p.specialization ?? "").toLowerCase().includes(q);
    const matchStatus =
      statusFilter === "all" || p.availability_status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --gold: #C8962E; --gold-light: #E8B84B;
          --brown: #6B2D0F; --brown-dark: #4A1E0A;
          --cream: #FDF8F2; --border: #EDE0D0;
          --text: #1A0F08; --text-sub: #7A5C44;
        }

        .ip-root {
          width: 100%; min-height: 100vh;
          background: var(--cream);
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text);
          padding: 2rem;
          display: flex; flex-direction: column; gap: 1.5rem;
        }

        .ip-header {
          display: flex; align-items: flex-end;
          justify-content: space-between; flex-wrap: wrap; gap: 1rem;
        }
        .ip-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem; font-weight: 700; color: var(--text);
        }
        .ip-subtitle { font-size: 13px; color: var(--text-sub); margin-top: 3px; }

        .ip-btn-primary {
          display: flex; align-items: center; gap: 7px;
          background: var(--brown); color: #fff;
          padding: 0.6rem 1.2rem; border-radius: 8px;
          font-size: 13px; font-weight: 700;
          border: none; cursor: pointer; font-family: inherit;
          transition: background 0.15s; white-space: nowrap;
        }
        .ip-btn-primary:hover { background: var(--brown-dark); }

        .ip-summary { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .ip-pill {
          background: #fff; border: 1px solid var(--border);
          border-radius: 10px; padding: 0.6rem 1rem;
          font-size: 12px; color: var(--text-sub);
          display: flex; align-items: center; gap: 6px;
        }
        .ip-pill strong {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem; color: var(--text);
        }

        .ip-filters { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
        .ip-search {
          display: flex; align-items: center; gap: 8px;
          background: #fff; border: 1px solid var(--border);
          border-radius: 8px; padding: 0 12px; height: 38px;
          flex: 1; min-width: 220px; max-width: 380px;
          transition: border-color 0.15s;
        }
        .ip-search:focus-within { border-color: var(--gold); }
        .ip-search input {
          border: none; outline: none; background: transparent;
          font-size: 13px; color: var(--text); font-family: inherit; width: 100%;
        }
        .ip-search input::placeholder { color: var(--text-sub); }
        .ip-search svg { color: var(--text-sub); flex-shrink: 0; }

        .ip-select {
          height: 38px; border: 1px solid var(--border); border-radius: 8px;
          background: #fff; padding: 0 12px; font-size: 13px;
          color: var(--text); font-family: inherit; outline: none; cursor: pointer;
          transition: border-color 0.15s;
        }
        .ip-select:focus { border-color: var(--gold); }

        /* ── CARDS GRID ── */
        .ip-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .ip-card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(107,45,15,0.04);
          display: flex; flex-direction: column;
        }

        .ip-card-header {
          padding: 1.1rem 1.25rem 0.75rem;
          display: flex; align-items: flex-start; gap: 12px;
          border-bottom: 1px solid #F5EDE0;
        }

        .ip-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: var(--brown); color: #fff;
          font-size: 14px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid var(--gold); flex-shrink: 0;
        }

        .ip-card-name { font-weight: 700; font-size: 14px; color: var(--text); }
        .ip-card-email { font-size: 12px; color: var(--text-sub); margin-top: 2px; }

        .ip-card-body {
          padding: 0.85rem 1.25rem;
          display: flex; flex-direction: column; gap: 8px;
          flex: 1;
        }

        .ip-card-row {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 12.5px;
        }
        .ip-card-label { color: var(--text-sub); }
        .ip-card-value { font-weight: 600; color: var(--text); text-align: right; max-width: 60%; }

        .ip-card-footer {
          padding: 0.75rem 1.25rem;
          border-top: 1px solid #F5EDE0;
          display: flex; gap: 6px; justify-content: flex-end;
        }

        .ip-action-btn {
          height: 32px; padding: 0 10px;
          border-radius: 7px; border: 1px solid var(--border);
          background: var(--cream); display: flex; align-items: center; gap: 5px;
          cursor: pointer; transition: background 0.15s, border-color 0.15s;
          color: var(--text-sub); font-size: 12px; font-weight: 600;
          font-family: inherit;
        }
        .ip-action-btn:hover { background: var(--border); color: var(--brown); border-color: var(--brown); }
        .ip-action-btn.danger:hover { background: #FFEBEE; color: #BB0000; border-color: #BB0000; }
        .ip-action-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .ip-empty {
          text-align: center; padding: 4rem 2rem;
          color: var(--text-sub); font-size: 14px;
          grid-column: 1 / -1;
          background: #fff; border-radius: 14px; border: 1px solid var(--border);
        }
        .ip-empty strong { display: block; color: var(--text); font-size: 15px; margin-bottom: 6px; }

        /* ── MODAL ── */
        .ip-overlay {
          position: fixed; inset: 0;
          background: rgba(26,15,8,0.5); backdrop-filter: blur(2px);
          z-index: 200; display: flex; align-items: center; justify-content: center; padding: 1rem;
        }
        .ip-modal {
          background: #fff; border-radius: 16px; border: 1px solid var(--border);
          width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto;
          box-shadow: 0 20px 60px rgba(107,45,15,0.2);
        }
        .ip-modal-header {
          padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .ip-modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem; font-weight: 700; color: var(--text);
        }
        .ip-modal-close {
          width: 32px; height: 32px; border-radius: 50%;
          border: 1px solid var(--border); background: var(--cream);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-sub); transition: background 0.15s;
        }
        .ip-modal-close:hover { background: var(--border); }
        .ip-modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .ip-modal-footer {
          padding: 1rem 1.5rem; border-top: 1px solid var(--border);
          display: flex; justify-content: flex-end; gap: 0.75rem;
        }

        .ip-form-group { display: flex; flex-direction: column; gap: 5px; }
        .ip-label {
          font-size: 12px; font-weight: 600; color: var(--text-sub);
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .ip-input, .ip-form-select {
          height: 40px; border: 1px solid var(--border); border-radius: 8px;
          padding: 0 12px; font-size: 13px; color: var(--text);
          font-family: inherit; outline: none; background: #fff;
          transition: border-color 0.15s; width: 100%;
        }
        .ip-input:focus, .ip-form-select:focus { border-color: var(--gold); }
        .ip-form-select { cursor: pointer; }

        .ip-pw-wrap { position: relative; }
        .ip-pw-wrap .ip-input { padding-right: 40px; }
        .ip-pw-toggle {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: var(--text-sub);
          padding: 0; display: flex; align-items: center;
        }
        .ip-pw-toggle:hover { color: var(--brown); }

        .ip-form-error {
          background: #FFEBEE; border: 1px solid #FFCDD2;
          border-radius: 8px; padding: 10px 14px;
          font-size: 13px; color: #BB0000;
        }
        .ip-form-hint {
          font-size: 11.5px; color: var(--text-sub);
          background: #FDFAF6; border: 1px solid var(--border);
          border-radius: 8px; padding: 10px 14px; line-height: 1.5;
        }

        .ip-btn-ghost {
          padding: 0.55rem 1.1rem; border-radius: 8px;
          border: 1px solid var(--border); background: var(--cream);
          font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: inherit; color: var(--text-sub);
          transition: background 0.15s;
        }
        .ip-btn-ghost:hover { background: var(--border); }
        .ip-btn-submit {
          padding: 0.55rem 1.4rem; border-radius: 8px; border: none;
          background: var(--brown); color: #fff;
          font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: inherit; transition: background 0.15s;
          display: flex; align-items: center; gap: 7px;
        }
        .ip-btn-submit:hover:not(:disabled) { background: var(--brown-dark); }
        .ip-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .ip-btn-danger {
          padding: 0.55rem 1.4rem; border-radius: 8px; border: none;
          background: #BB0000; color: #fff;
          font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: inherit; transition: background 0.15s;
        }
        .ip-btn-danger:hover:not(:disabled) { background: #990000; }
        .ip-btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

        .ip-delete-body {
          padding: 1.5rem; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 1rem;
        }
        .ip-delete-icon {
          width: 56px; height: 56px; border-radius: 50%;
          background: #FFEBEE; display: flex; align-items: center; justify-content: center; color: #BB0000;
        }

        .ip-toast {
          position: fixed; bottom: 2rem; right: 2rem;
          background: var(--brown); color: #fff;
          padding: 0.75rem 1.25rem; border-radius: 10px;
          font-size: 13px; font-weight: 600; z-index: 300;
          box-shadow: 0 8px 24px rgba(107,45,15,0.25);
          animation: ipSlide 0.2s ease;
        }
        @keyframes ipSlide {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .spin { animation: spinning 1s linear infinite; }
        @keyframes spinning { to { transform: rotate(360deg); } }

        @media (max-width: 600px) { .ip-root { padding: 1rem; } }
      `}</style>

      <div className="ip-root">

        {/* PAGE HEADER */}
        <div className="ip-header">
          <div>
            <h1 className="ip-title">ICT Personnel</h1>
            <p className="ip-subtitle">Manage ICT helpdesk team profiles, specializations, and availability.</p>
          </div>
          <button className="ip-btn-primary" onClick={openCreate}>
            <Plus size={15} /> Add Personnel
          </button>
        </div>

        {/* SUMMARY PILLS */}
        <div className="ip-summary">
          <div className="ip-pill"><strong>{personnel.length}</strong> Total</div>
          <div className="ip-pill"><strong>{personnel.filter(p => p.availability_status === "AVAILABLE").length}</strong> Available</div>
          <div className="ip-pill"><strong>{personnel.filter(p => p.availability_status === "BUSY").length}</strong> Busy</div>
          <div className="ip-pill"><strong>{personnel.filter(p => p.availability_status === "OFF_DUTY").length}</strong> Off Duty</div>
          <div className="ip-pill"><strong>{personnel.filter(p => p.availability_status === "ON_LEAVE").length}</strong> On Leave</div>
        </div>

        {/* FILTERS */}
        <div className="ip-filters">
          <div className="ip-search">
            <Search size={14} />
            <input
              placeholder="Search by name, email or specialization…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="ip-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="BUSY">Busy</option>
            <option value="OFF_DUTY">Off Duty</option>
            <option value="ON_LEAVE">On Leave</option>
          </select>
        </div>

        {/* CARDS GRID */}
        <div className="ip-grid">
          {loading ? (
            <div className="ip-empty"><strong>Loading personnel…</strong>Please wait.</div>
          ) : error ? (
            <div className="ip-empty"><strong>Could not load personnel.</strong>{error}</div>
          ) : filtered.length === 0 ? (
            <div className="ip-empty">
              <strong>No ICT personnel found.</strong>
              {search ? "Try a different search term." : "Add the first ICT personnel profile to get started."}
            </div>
          ) : (
            filtered.map((p) => {
              const initials = p.staff.full_name
                .split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
              return (
                <div key={p.id} className="ip-card">
                  <div className="ip-card-header">
                    <div className="ip-avatar">{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ip-card-name">{p.staff.full_name}</div>
                      <div className="ip-card-email">{p.staff.email}</div>
                    </div>
                    <AvailabilityBadge status={p.availability_status} />
                  </div>

                  <div className="ip-card-body">
                    <div className="ip-card-row">
                      <span className="ip-card-label">Specialization</span>
                      <span className="ip-card-value">{p.specialization ?? "—"}</span>
                    </div>
                    <div className="ip-card-row">
                      <span className="ip-card-label">Active Tickets</span>
                      <span className="ip-card-value"
                        style={{ color: (p.active_tickets ?? 0) > 5 ? "#BB0000" : "var(--text)" }}>
                        {p.active_tickets ?? 0}
                      </span>
                    </div>
                    <div className="ip-card-row">
                      <span className="ip-card-label">Profile Status</span>
                      <span className="ip-card-value">
                        <span style={{
                          color: p.is_active ? "#2D6B0F" : "#BB0000",
                          fontSize: 12,
                        }}>
                          {p.is_active ? "Active" : "Deactivated"}
                        </span>
                      </span>
                    </div>
                    <div className="ip-card-row">
                      <span className="ip-card-label">Added</span>
                      <span className="ip-card-value" style={{ fontWeight: 400, fontSize: 12 }}>
                        {new Date(p.created_at).toLocaleDateString("en-KE", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="ip-card-footer">
                    <button
                      className="ip-action-btn"
                      title="Sync availability"
                      disabled={syncingId === p.id}
                      onClick={() => handleSync(p)}
                    >
                      <RefreshCw size={12} className={syncingId === p.id ? "spin" : ""} />
                      Sync
                    </button>
                    <button className="ip-action-btn" title="Edit" onClick={() => openEdit(p)}>
                      <Pencil size={12} /> Edit
                    </button>
                    <button className="ip-action-btn danger" title="Delete" onClick={() => setDeleteTarget(p)}>
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      {showModal && (
        <div className="ip-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="ip-modal">
            <div className="ip-modal-header">
              <p className="ip-modal-title">
                {editTarget ? "Edit ICT Personnel Profile" : "Add ICT Personnel"}
              </p>
              <button className="ip-modal-close" onClick={() => setShowModal(false)}><X size={14} /></button>
            </div>

            <div className="ip-modal-body">
              {formError && <div className="ip-form-error">{formError}</div>}

              {!editTarget && (
                <div className="ip-form-group">
                  <label className="ip-label">Staff Member *</label>
                  <select
                    className="ip-form-select"
                    value={form.staff_id}
                    onChange={(e) => setForm({ ...form, staff_id: e.target.value })}
                  >
                    <option value="">Select a staff member</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name} — {s.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {editTarget && (
                <div className="ip-form-group">
                  <label className="ip-label">Staff Member</label>
                  <input
                    className="ip-input"
                    value={editTarget.staff.full_name}
                    disabled
                    style={{ background: "#FDFAF6", color: "var(--text-sub)" }}
                  />
                </div>
              )}

              <div className="ip-form-group">
                <label className="ip-label">Specialization</label>
                <select
                  className="ip-form-select"
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                >
                  <option value="">Select specialization</option>
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="ip-form-hint">
                <strong>Note:</strong> Availability status is managed automatically by the triage system.
                Use the <em>Sync</em> button on the profile card to refresh it after any manual intervention.
              </div>
            </div>

            <div className="ip-modal-footer">
              <button className="ip-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="ip-btn-submit" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Saving…" : editTarget ? "Save Changes" : "Create Profile"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteTarget && (
        <div className="ip-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="ip-modal" style={{ maxWidth: 420 }}>
            <div className="ip-modal-header">
              <p className="ip-modal-title">Delete ICT Personnel Profile</p>
              <button className="ip-modal-close" onClick={() => setDeleteTarget(null)}><X size={14} /></button>
            </div>
            <div className="ip-delete-body">
              <div className="ip-delete-icon"><Trash2 size={24} /></div>
              <div>
                <p style={{ fontSize: 14, color: "var(--text-sub)", marginBottom: 6 }}>
                  You are about to permanently delete the ICT profile for
                </p>
                <p style={{ fontWeight: 700, color: "var(--brown)", fontSize: 15 }}>
                  {deleteTarget.staff.full_name}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-sub)", marginTop: 4 }}>
                  {deleteTarget.staff.email}
                </p>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--text-sub)", textAlign: "center", lineHeight: 1.6 }}>
                This removes their ICT personnel profile only. Their staff account will remain active.
              </p>
            </div>
            <div className="ip-modal-footer">
              <button className="ip-btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="ip-btn-danger" onClick={handleDelete} disabled={submitting}>
                {submitting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && <div className="ip-toast">{toast}</div>}
    </>
  );
}