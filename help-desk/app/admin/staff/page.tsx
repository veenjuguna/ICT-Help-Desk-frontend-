"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Plus, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Staff {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  personal_number?: string;
  role: string;
  department?: { id: number; name: string };
  directorate?: { id: number; name: string };
  office_number?: string;
  office_location?: string;
  is_active: boolean;
  created_at: string;
}

interface Directorate {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://ict-help-desk-neon.onrender.com";

const ROLES = ["staff", "ict_personnel", "admin"];

const EMPTY_FORM = {
  full_name: "",
  email: "",
  phone: "",
  personal_number: "",
  role: "staff",
  directorate_id: "",
  department_id: "",
  office_number: "",
  office_location: "",
  password: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    admin:         { bg: "#FFF3E0", color: "#6B2D0F", label: "Admin" },
    ict_personnel: { bg: "#FFF8E0", color: "#C8962E", label: "ICT Personnel" },
    staff:         { bg: "#F0FFF0", color: "#2D6B0F", label: "Staff" },
  };
  const s = map[role] ?? { bg: "#F3F3F3", color: "#555", label: role };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: "20px",
      fontSize: "11.5px", fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%",
        background: active ? "#2D6B0F" : "#BB0000",
        display: "inline-block", flexShrink: 0,
      }} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function StaffPage() {
  const [staff, setStaff]               = useState<Staff[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [search, setSearch]             = useState("");
  const [roleFilter, setRoleFilter]     = useState("all");
  const [showModal, setShowModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState<Staff | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [form, setForm]                 = useState({ ...EMPTY_FORM });
  const [formError, setFormError]       = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [showPw, setShowPw]             = useState(false);
  const [directorates, setDirectorates] = useState<Directorate[]>([]);
  const [departments, setDepartments]   = useState<Department[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [toast, setToast]               = useState("");

  // ── Fetch staff ──────────────────────────────────────────────────────────────
  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/staff/`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load staff.");
      const data = await res.json();
      if (Array.isArray(data)) setStaff(data);
      else if (Array.isArray(data?.results)) setStaff(data.results);
      else if (Array.isArray(data?.data)) setStaff(data.data);
      else if (Array.isArray(data?.staff)) setStaff(data.staff);
      else setStaff([]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load staff.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch directorates ───────────────────────────────────────────────────────
  useEffect(() => {
    void Promise.resolve().then(() => fetchStaff());
    fetch(`${API}/directorates/`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setDirectorates(data);
        else if (Array.isArray(data?.results)) setDirectorates(data.results);
        else if (Array.isArray(data?.data)) setDirectorates(data.data);
        else if (Array.isArray(data?.directorates)) setDirectorates(data.directorates);
        else setDirectorates([]);
      })
      .catch(() => setDirectorates([]));
  }, [fetchStaff]);

  // ── Fetch departments when directorate changes ───────────────────────────────
  useEffect(() => {
    if (!form.directorate_id) {
      void Promise.resolve().then(() => setDepartments([]));
      return;
    }
    void Promise.resolve().then(() => setLoadingDepts(true));
    fetch(`${API}/directorates/${form.directorate_id}/departments/`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setDepartments(data);
        else if (Array.isArray(data?.results)) setDepartments(data.results);
        else if (Array.isArray(data?.data)) setDepartments(data.data);
        else if (Array.isArray(data?.departments)) setDepartments(data.departments);
        else setDepartments([]);
      })
      .catch(() => setDepartments([]))
      .finally(() => setLoadingDepts(false));
  }, [form.directorate_id]);

  // ── Show toast ───────────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ── Open create modal ────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setShowPw(false);
    setShowModal(true);
  };

  // ── Open edit modal ──────────────────────────────────────────────────────────
  const openEdit = (s: Staff) => {
    setEditTarget(s);
    setForm({
      full_name:       s.full_name,
      email:           s.email,
      phone:           s.phone ?? "",
      personal_number: s.personal_number ?? "",
      role:            s.role,
      directorate_id:  s.directorate?.id?.toString() ?? "",
      department_id:   s.department?.id?.toString() ?? "",
      office_number:   s.office_number ?? "",
      office_location: s.office_location ?? "",
      password:        "",
    });
    setFormError("");
    setShowPw(false);
    setShowModal(true);
  };

  // ── Submit create / edit ─────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.full_name || !form.email) {
      setFormError("Full name and email are required.");
      return;
    }
    if (!editTarget && !form.password) {
      setFormError("Password is required for new staff.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const body: Record<string, unknown> = {
        full_name:       form.full_name,
        email:           form.email,
        phone:           form.phone || undefined,
        personal_number: form.personal_number || undefined,
        role:            form.role,
        directorate_id:  form.directorate_id ? Number(form.directorate_id) : undefined,
        department_id:   form.department_id ? Number(form.department_id) : undefined,
        office_number:   form.office_number || undefined,
        office_location: form.office_location || undefined,
      };
      if (form.password) body.password = form.password;

      const url    = editTarget ? `${API}/staff/${editTarget.id}` : `${API}/staff`;
      const method = editTarget ? "PATCH" : "POST";
      const res    = await fetch(url, {
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
      await fetchStaff();
      showToast(editTarget ? "Staff member updated." : "Staff member created.");
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
      const res = await fetch(`${API}/staff/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed.");
      setDeleteTarget(null);
      await fetchStaff();
      showToast("Staff member deleted.");
    } catch {
      showToast("Delete failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Filtered list ────────────────────────────────────────────────────────────
  const filtered = staff.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.full_name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.department?.name ?? "").toLowerCase().includes(q) ||
      (s.directorate?.name ?? "").toLowerCase().includes(q);
    const matchRole = roleFilter === "all" || s.role === roleFilter;
    return matchSearch && matchRole;
  });

  // ── Render ───────────────────────────────────────────────────────────────────
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

        .sp-root {
          width: 100%;
          min-height: 100vh;
          background: var(--cream);
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text);
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* ── PAGE HEADER ── */
        .sp-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .sp-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text);
        }
        .sp-subtitle { font-size: 13px; color: var(--text-sub); margin-top: 3px; }

        .sp-btn-primary {
          display: flex; align-items: center; gap: 7px;
          background: var(--brown); color: #fff;
          padding: 0.6rem 1.2rem; border-radius: 8px;
          font-size: 13px; font-weight: 700;
          border: none; cursor: pointer; font-family: inherit;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .sp-btn-primary:hover { background: var(--brown-dark); }

        /* ── FILTERS ── */
        .sp-filters {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .sp-search {
          display: flex; align-items: center; gap: 8px;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 0 12px;
          height: 38px;
          flex: 1;
          min-width: 220px;
          max-width: 380px;
          transition: border-color 0.15s;
        }
        .sp-search:focus-within { border-color: var(--gold); }
        .sp-search input {
          border: none; outline: none; background: transparent;
          font-size: 13px; color: var(--text); font-family: inherit; width: 100%;
        }
        .sp-search input::placeholder { color: var(--text-sub); }
        .sp-search svg { color: var(--text-sub); flex-shrink: 0; }

        .sp-select {
          height: 38px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: #fff;
          padding: 0 12px;
          font-size: 13px;
          color: var(--text);
          font-family: inherit;
          outline: none;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .sp-select:focus { border-color: var(--gold); }

        /* ── SUMMARY PILLS ── */
        .sp-summary {
          display: flex; gap: 0.75rem; flex-wrap: wrap;
        }
        .sp-pill {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0.6rem 1rem;
          font-size: 12px;
          color: var(--text-sub);
          display: flex; align-items: center; gap: 6px;
        }
        .sp-pill strong {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          color: var(--text);
        }

        /* ── TABLE CARD ── */
        .sp-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(107,45,15,0.04);
        }

        .sp-table-wrap { overflow-x: auto; }

        .sp-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          min-width: 700px;
        }
        .sp-table th {
          padding: 0.75rem 1.25rem;
          text-align: left;
          font-size: 11px; font-weight: 700;
          color: var(--text-sub);
          letter-spacing: 0.5px; text-transform: uppercase;
          background: #FDFAF6;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        .sp-table td {
          padding: 0.85rem 1.25rem;
          border-bottom: 1px solid #F5EDE0;
          color: var(--text); vertical-align: middle;
        }
        .sp-table tr:last-child td { border-bottom: none; }
        .sp-table tr:hover td { background: #FDFAF6; }

        .sp-name { font-weight: 600; color: var(--text); }
        .sp-email { font-size: 12px; color: var(--text-sub); margin-top: 2px; }
        .sp-dept { font-size: 12px; color: var(--text-sub); }

        .sp-action-btn {
          width: 30px; height: 30px;
          border-radius: 7px;
          border: 1px solid var(--border);
          background: var(--cream);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.15s, border-color 0.15s;
          color: var(--text-sub);
        }
        .sp-action-btn:hover { background: var(--border); color: var(--brown); border-color: var(--brown); }
        .sp-action-btn.danger:hover { background: #FFEBEE; color: #BB0000; border-color: #BB0000; }

        /* ── EMPTY / LOADING ── */
        .sp-empty {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-sub);
          font-size: 14px;
        }
        .sp-empty strong { display: block; color: var(--text); font-size: 15px; margin-bottom: 6px; }

        /* ── MODAL OVERLAY ── */
        .sp-overlay {
          position: fixed; inset: 0;
          background: rgba(26,15,8,0.5);
          backdrop-filter: blur(2px);
          z-index: 200;
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
        }

        .sp-modal {
          background: #fff;
          border-radius: 16px;
          border: 1px solid var(--border);
          width: 100%;
          max-width: 540px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(107,45,15,0.2);
        }

        .sp-modal-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
        }
        .sp-modal-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem; font-weight: 700; color: var(--text);
        }
        .sp-modal-close {
          width: 32px; height: 32px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--cream);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-sub);
          transition: background 0.15s;
        }
        .sp-modal-close:hover { background: var(--border); }

        .sp-modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }

        .sp-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .sp-form-group { display: flex; flex-direction: column; gap: 5px; }
        .sp-form-group.full { grid-column: 1 / -1; }

        .sp-label {
          font-size: 12px; font-weight: 600; color: var(--text-sub);
          text-transform: uppercase; letter-spacing: 0.5px;
        }

        .sp-input, .sp-form-select {
          height: 40px;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 0 12px;
          font-size: 13px;
          color: var(--text);
          font-family: inherit;
          outline: none;
          background: #fff;
          transition: border-color 0.15s;
          width: 100%;
        }
        .sp-input:focus, .sp-form-select:focus { border-color: var(--gold); }
        .sp-input::placeholder { color: var(--text-sub); }
        .sp-form-select { cursor: pointer; }
        .sp-form-select:disabled { background: #FDFAF6; color: var(--text-sub); cursor: not-allowed; }

        .sp-pw-wrap {
          position: relative;
        }
        .sp-pw-wrap .sp-input { padding-right: 40px; }
        .sp-pw-toggle {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: var(--text-sub);
          padding: 0; display: flex; align-items: center;
        }
        .sp-pw-toggle:hover { color: var(--brown); }

        .sp-divider {
          font-size: 11px; font-weight: 700;
          color: var(--text-sub); letter-spacing: 1px;
          text-transform: uppercase;
          display: flex; align-items: center; gap: 8px;
        }
        .sp-divider::before, .sp-divider::after {
          content: ''; flex: 1; height: 1px; background: var(--border);
        }

        .sp-form-error {
          background: #FFEBEE;
          border: 1px solid #FFCDD2;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: #BB0000;
        }

        .sp-modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--border);
          display: flex; justify-content: flex-end; gap: 0.75rem;
        }

        .sp-btn-ghost {
          padding: 0.55rem 1.1rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--cream);
          font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: inherit;
          color: var(--text-sub);
          transition: background 0.15s;
        }
        .sp-btn-ghost:hover { background: var(--border); }

        .sp-btn-submit {
          padding: 0.55rem 1.4rem;
          border-radius: 8px;
          border: none;
          background: var(--brown);
          color: #fff;
          font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          transition: background 0.15s;
          display: flex; align-items: center; gap: 7px;
        }
        .sp-btn-submit:hover:not(:disabled) { background: var(--brown-dark); }
        .sp-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .sp-btn-danger {
          padding: 0.55rem 1.4rem;
          border-radius: 8px;
          border: none;
          background: #BB0000;
          color: #fff;
          font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          transition: background 0.15s;
        }
        .sp-btn-danger:hover:not(:disabled) { background: #990000; }
        .sp-btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── TOAST ── */
        .sp-toast {
          position: fixed;
          bottom: 2rem; right: 2rem;
          background: var(--brown);
          color: #fff;
          padding: 0.75rem 1.25rem;
          border-radius: 10px;
          font-size: 13px; font-weight: 600;
          z-index: 300;
          box-shadow: 0 8px 24px rgba(107,45,15,0.25);
          animation: slideUp 0.2s ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── DELETE CONFIRM ── */
        .sp-delete-body {
          padding: 1.5rem;
          text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 1rem;
        }
        .sp-delete-icon {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: #FFEBEE;
          display: flex; align-items: center; justify-content: center;
          color: #BB0000;
        }
        .sp-delete-name { font-weight: 700; color: var(--brown); }

        @media (max-width: 600px) {
          .sp-root { padding: 1rem; }
          .sp-form-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="sp-root">

        {/* PAGE HEADER */}
        <div className="sp-header">
          <div>
            <h1 className="sp-title">Staff Management</h1>
            <p className="sp-subtitle">Register, manage, and search all National Treasury staff accounts.</p>
          </div>
          <button className="sp-btn-primary" onClick={openCreate}>
            <Plus size={15} /> Add Staff
          </button>
        </div>

        {/* SUMMARY PILLS */}
        <div className="sp-summary">
          <div className="sp-pill"><strong>{staff.length}</strong> Total Staff</div>
          <div className="sp-pill"><strong>{staff.filter(s => s.is_active).length}</strong> Active</div>
          <div className="sp-pill"><strong>{staff.filter(s => !s.is_active).length}</strong> Inactive</div>
          <div className="sp-pill"><strong>{staff.filter(s => s.role === "ict_personnel").length}</strong> ICT Personnel</div>
          <div className="sp-pill"><strong>{staff.filter(s => s.role === "admin").length}</strong> Admins</div>
        </div>

        {/* FILTERS */}
        <div className="sp-filters">
          <div className="sp-search">
            <Search size={14} />
            <input
              placeholder="Search by name, email or department…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="sp-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="staff">Staff</option>
            <option value="ict_personnel">ICT Personnel</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="sp-card">
          {loading ? (
            <div className="sp-empty"><strong>Loading staff…</strong>Please wait.</div>
          ) : error ? (
            <div className="sp-empty"><strong>Could not load staff.</strong>{error}</div>
          ) : filtered.length === 0 ? (
            <div className="sp-empty">
              <strong>No staff found.</strong>
              {search ? "Try a different search term." : "Add the first staff member to get started."}
            </div>
          ) : (
            <div className="sp-table-wrap">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Personal No.</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="sp-name">{s.full_name}</div>
                        <div className="sp-email">{s.email}</div>
                      </td>
                      <td style={{ color: "var(--text-sub)", fontSize: 12.5 }}>
                        {s.personal_number ?? "—"}
                      </td>
                      <td>
                        <div style={{ fontSize: 13 }}>{s.department?.name ?? "—"}</div>
                        <div className="sp-dept">{s.directorate?.name ?? ""}</div>
                      </td>
                      <td><RoleBadge role={s.role} /></td>
                      <td><StatusDot active={s.is_active} /></td>
                      <td style={{ fontSize: 12, color: "var(--text-sub)", whiteSpace: "nowrap" }}>
                        {new Date(s.created_at).toLocaleDateString("en-KE", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                          <button
                            className="sp-action-btn"
                            title="Edit"
                            onClick={() => openEdit(s)}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            className="sp-action-btn danger"
                            title="Delete"
                            onClick={() => setDeleteTarget(s)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── CREATE / EDIT MODAL ── */}
      {showModal && (
        <div className="sp-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="sp-modal">
            <div className="sp-modal-header">
              <p className="sp-modal-title">{editTarget ? "Edit Staff Member" : "Add Staff Member"}</p>
              <button className="sp-modal-close" onClick={() => setShowModal(false)}><X size={14} /></button>
            </div>

            <div className="sp-modal-body">
              {formError && <div className="sp-form-error">{formError}</div>}

              <div className="sp-divider">Personal Information</div>

              <div className="sp-form-row">
                <div className="sp-form-group">
                  <label className="sp-label">Full Name *</label>
                  <input className="sp-input" placeholder="Jane Doe"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="sp-form-group">
                  <label className="sp-label">Personal Number</label>
                  <input className="sp-input" placeholder="e.g. 12345"
                    value={form.personal_number}
                    onChange={(e) => setForm({ ...form, personal_number: e.target.value })} />
                </div>
                <div className="sp-form-group">
                  <label className="sp-label">Work Email *</label>
                  <input className="sp-input" type="email" placeholder="jane@treasury.go.ke"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="sp-form-group">
                  <label className="sp-label">Phone</label>
                  <input className="sp-input" placeholder="+254 7xx xxx xxx"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>

              <div className="sp-divider">Office Information</div>

              <div className="sp-form-row">
                <div className="sp-form-group">
                  <label className="sp-label">Directorate</label>
                  <select className="sp-form-select"
                    value={form.directorate_id}
                    onChange={(e) => setForm({ ...form, directorate_id: e.target.value, department_id: "" })}>
                    <option value="">Select directorate</option>
                    {directorates.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sp-form-group">
                  <label className="sp-label">Department</label>
                  <select className="sp-form-select"
                    value={form.department_id}
                    disabled={!form.directorate_id || loadingDepts}
                    onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
                    <option value="">
                      {loadingDepts ? "Loading…" : form.directorate_id ? "Select department" : "Select directorate first"}
                    </option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sp-form-group">
                  <label className="sp-label">Office Number</label>
                  <input className="sp-input" placeholder="e.g. A202"
                    value={form.office_number}
                    onChange={(e) => setForm({ ...form, office_number: e.target.value })} />
                </div>
                <div className="sp-form-group">
                  <label className="sp-label">Office Location</label>
                  <input className="sp-input" placeholder="e.g. Treasury Building, 4th Floor"
                    value={form.office_location}
                    onChange={(e) => setForm({ ...form, office_location: e.target.value })} />
                </div>
              </div>

              <div className="sp-divider">Access & Security</div>

              <div className="sp-form-row">
                <div className="sp-form-group">
                  <label className="sp-label">Role *</label>
                  <select className="sp-form-select"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r === "ict_personnel" ? "ICT Personnel" : r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sp-form-group">
                  <label className="sp-label">{editTarget ? "New Password (leave blank to keep)" : "Password *"}</label>
                  <div className="sp-pw-wrap">
                    <input
                      className="sp-input"
                      type={showPw ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    <button className="sp-pw-toggle" type="button" onClick={() => setShowPw(!showPw)}>
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="sp-modal-footer">
              <button className="sp-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="sp-btn-submit" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Saving…" : editTarget ? "Save Changes" : "Create Staff"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteTarget && (
        <div className="sp-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div className="sp-modal" style={{ maxWidth: 420 }}>
            <div className="sp-modal-header">
              <p className="sp-modal-title">Delete Staff Member</p>
              <button className="sp-modal-close" onClick={() => setDeleteTarget(null)}><X size={14} /></button>
            </div>
            <div className="sp-delete-body">
              <div className="sp-delete-icon"><Trash2 size={24} /></div>
              <div>
                <p style={{ fontSize: 14, color: "var(--text-sub)", marginBottom: 6 }}>
                  You are about to permanently delete
                </p>
                <p className="sp-delete-name">{deleteTarget.full_name}</p>
                <p style={{ fontSize: 12, color: "var(--text-sub)", marginTop: 4 }}>{deleteTarget.email}</p>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--text-sub)", textAlign: "center", lineHeight: 1.6 }}>
                This action cannot be undone. All tickets and data associated with this account will be affected.
              </p>
            </div>
            <div className="sp-modal-footer">
              <button className="sp-btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="sp-btn-danger" onClick={handleDelete} disabled={submitting}>
                {submitting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && <div className="sp-toast">{toast}</div>}
    </>
  );
}