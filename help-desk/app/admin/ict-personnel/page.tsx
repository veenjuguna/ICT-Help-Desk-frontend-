"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Plus, X, Check, UserX } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Availability = "available" | "busy" | "off_duty" | "on_leave";

type Specialization =
  | "hardware"
  | "networking"
  | "software_and_systems"
  | "security"
  | "other";

interface IctPersonnel {
  id: number;
  staff_id: number;
  specialization: Specialization;
  availability: Availability;
  phone_extension?: string;
  is_active: boolean;
  created_at?: string;
}

interface Staff {
  id: number;
  full_name: string;
  email: string;
}

interface AdminUser {
  role?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://ict-help-desk-neon.onrender.com";

const SPECIALIZATIONS: { value: Specialization; label: string }[] = [
  { value: "hardware", label: "Hardware" },
  { value: "networking", label: "Networking" },
  { value: "software_and_systems", label: "Software & Systems" },
  { value: "security", label: "Security" },
  { value: "other", label: "Other" },
];

const POLL_INTERVAL_MS = 30_000;

const EMPTY_FORM = {
  staff_id: "",
  specialization: "" as Specialization | "",
  phone_extension: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.results)) return obj.results as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
  }
  return [];
}

function normalizeAvailability(p: Record<string, unknown>): Availability {
  const raw = (p.availability ?? p.availability_status ?? "AVAILABLE") as string;
  return raw.toLowerCase() as Availability;
}

function formatShortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() ?? "";
  return `${first} ${lastInitial}.`;
}

function formatSpecializationLabel(spec: string): string {
  const found = SPECIALIZATIONS.find((s) => s.value === spec);
  if (found) return found.label;
  return spec.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function isAdminRole(role?: string): boolean {
  if (!role) return false;
  const r = role.toLowerCase();
  return r === "admin" || r === "administrator";
}

// ── Badge components ──────────────────────────────────────────────────────────

function AvailabilityBadge({ status }: { status: Availability }) {
  const map: Record<Availability, { bg: string; color: string; dot: string; label: string }> = {
    available: { bg: "#E8F5E9", color: "#2D6B0F", dot: "#2D6B0F", label: "Available" },
    busy:      { bg: "#FFF3E0", color: "#E65100", dot: "#FF9800", label: "Busy" },
    off_duty:  { bg: "#F3F3F3", color: "#7A5C44", dot: "#B0906A", label: "Off Duty" },
    on_leave:  { bg: "#F3E8FF", color: "#6B2D8B", dot: "#9B59B6", label: "On Leave" },
  };
  const s = map[status] ?? map.available;
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: "20px",
      fontSize: "11.5px", fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 5,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

function SpecializationBadge({ spec }: { spec: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    hardware:              { bg: "#E3F2FD", color: "#1565C0" },
    networking:            { bg: "#E0F2F1", color: "#00695C" },
    software_and_systems:  { bg: "#F3E5F5", color: "#7B1FA2" },
    security:              { bg: "#FFEBEE", color: "#C62828" },
    other:                 { bg: "#F5F5F5", color: "#616161" },
  };
  const s = map[spec] ?? map.other;
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: "20px",
      fontSize: "11.5px", fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {formatSpecializationLabel(spec)}
    </span>
  );
}

function ActiveIndicator({ active }: { active: boolean }) {
  return active ? (
    <span title="Active" style={{ color: "#2D6B0F", display: "inline-flex" }}>
      <Check size={18} strokeWidth={2.5} />
    </span>
  ) : (
    <span title="Inactive" style={{ color: "#BB0000", display: "inline-flex" }}>
      <X size={18} strokeWidth={2.5} />
    </span>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function IctPersonnelPage() {
  const [personnel, setPersonnel] = useState<IctPersonnel[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [dutyTarget, setDutyTarget] = useState<IctPersonnel | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<IctPersonnel | null>(null);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [staffSearch, setStaffSearch] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const staffById = useMemo(() => {
    const map = new Map<number, Staff>();
    for (const s of staffList) map.set(s.id, s);
    return map;
  }, [staffList]);

  const existingStaffIds = useMemo(
    () => new Set(personnel.map((p) => p.staff_id)),
    [personnel],
  );

  const availableStaff = useMemo(() => {
    const q = staffSearch.toLowerCase();
    return staffList.filter((s) => {
      if (existingStaffIds.has(s.id)) return false;
      if (!q) return true;
      return (
        s.full_name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
      );
    });
  }, [staffList, existingStaffIds, staffSearch]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }, []);

  const fetchPersonnel = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError("");
    }
    try {
      const res = await fetch(`${API}/ict-personnel`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load ICT personnel.");
      const data = await res.json();
      const list = parseArray<Record<string, unknown>>(data).map((p) => ({
        id: p.id as number,
        staff_id: (p.staff_id ?? (p.staff as { id?: number })?.id) as number,
        specialization: (p.specialization ?? "OTHER") as Specialization,
        availability: normalizeAvailability(p),
        phone_extension: p.phone_extension as string | undefined,
        is_active: p.is_active !== false,
        created_at: p.created_at as string | undefined,
      }));
      setPersonnel(list);
    } catch (e: unknown) {
      if (!silent) {
        setError(e instanceof Error ? e.message : "Failed to load ICT personnel.");
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch(`${API}/staff`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setStaffList(parseArray<Staff>(data));
    } catch {}
  }, []);

  const fetchUserRole = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admin/me`, { credentials: "include" });
      if (res.ok) {
        const user: AdminUser = await res.json();
        setIsAdmin(isAdminRole(user.role));
        return;
      }
    } catch {}
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw) as AdminUser;
        setIsAdmin(isAdminRole(user.role));
      }
    } catch {}
  }, []);

  useEffect(() => {
    const initialize = async () => {
      await fetchPersonnel();
      await fetchStaff();
      await fetchUserRole();
    };
    void initialize();
  }, [fetchPersonnel, fetchStaff, fetchUserRole]);

  useEffect(() => {
    const id = setInterval(() => void fetchPersonnel(true), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchPersonnel]);

  const getStaffName = (staffId: number) =>
    staffById.get(staffId)?.full_name ?? `Staff #${staffId}`;

  const filtered = personnel.filter((p) => {
    const q = search.toLowerCase();
    if (!q) return true;
    const name = getStaffName(p.staff_id).toLowerCase();
    const email = staffById.get(p.staff_id)?.email?.toLowerCase() ?? "";
    return (
      name.includes(q) ||
      email.includes(q) ||
      p.specialization.toLowerCase().includes(q)
    );
  });

  const openAdd = () => {
    setForm({ ...EMPTY_FORM });
    setStaffSearch("");
    setFormError("");
    setShowAddModal(true);
  };

  const handleAdd = async () => {
    if (!form.staff_id) {
      setFormError("Please select a staff member.");
      return;
    }
    if (!form.specialization) {
      setFormError("Please select a specialization.");
      return;
    }
    if (form.phone_extension && form.phone_extension.length > 10) {
      setFormError("Phone extension must be 10 characters or fewer.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const body: Record<string, unknown> = {
        staff_id: Number(form.staff_id),
        specialization: form.specialization,
      };
      if (form.phone_extension) body.phone_extension = form.phone_extension;

      const res = await fetch(`${API}/ict-personnel`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { detail?: string }).detail ??
            (err as { message?: string }).message ??
            "Failed to create profile.",
        );
      }
      setShowAddModal(false);
      await fetchPersonnel();
      showToast("ICT personnel profile created.");
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDutyStatus = async (availability: Availability) => {
    if (!dutyTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/ict-personnel/${dutyTarget.id}/duty-status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg =
          (err as { detail?: string }).detail ??
          (err as { message?: string }).message ??
          "Failed to update duty status.";
        showToast(msg);
        if (res.status === 409) await fetchPersonnel(true);
        return;
      }
      setDutyTarget(null);
      await fetchPersonnel(true);
      showToast("Duty status updated.");
    } catch {
      showToast("Failed to update duty status.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/ict-personnel/${deactivateTarget.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: false }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          (err as { detail?: string }).detail ??
            (err as { message?: string }).message ??
            "Deactivation failed.",
        );
      }
      setDeactivateTarget(null);
      await fetchPersonnel();
      showToast("Technician deactivated.");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Deactivation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const dutyOptions: { value: Availability; label: string; desc: string }[] =
    dutyTarget?.availability === "available" || dutyTarget?.availability === "busy"
      ? [
          { value: "off_duty", label: "Off Duty", desc: "Not on shift — excluded from triage" },
          { value: "on_leave", label: "On Leave", desc: "Approved leave — excluded from triage" },
        ]
      : dutyTarget && (dutyTarget.availability === "off_duty" || dutyTarget.availability === "on_leave")
        ? [{ value: "available", label: "Available", desc: "Return to duty and resume ticket assignment" }]
        : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --gold: #C8962E; --brown: #6B2D0F; --brown-dark: #4A1E0A;
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
        .ip-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
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
        .ip-card {
          background: #fff; border-radius: 14px;
          border: 1px solid var(--border);
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(107,45,15,0.04);
        }
        .ip-table-wrap { overflow-x: auto; }
        .ip-table {
          width: 100%; border-collapse: collapse;
          font-size: 13px; min-width: 720px;
        }
        .ip-table th {
          padding: 0.75rem 1.25rem; text-align: left;
          font-size: 11px; font-weight: 700; color: var(--text-sub);
          letter-spacing: 0.5px; text-transform: uppercase;
          background: #FDFAF6; border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        .ip-table td {
          padding: 0.85rem 1.25rem;
          border-bottom: 1px solid #F5EDE0;
          color: var(--text); vertical-align: middle;
        }
        .ip-table tr:last-child td { border-bottom: none; }
        .ip-table tr:hover td { background: #FDFAF6; }
        .ip-table tr.inactive td { opacity: 0.55; }
        .ip-name { font-weight: 600; color: var(--text); }
        .ip-actions { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }
        .ip-action-link {
          font-size: 12.5px; font-weight: 600; color: var(--brown);
          background: none; border: none; cursor: pointer;
          font-family: inherit; padding: 4px 0;
          text-decoration: none; white-space: nowrap;
        }
        .ip-action-link:hover { text-decoration: underline; }
        .ip-action-link:disabled {
          color: #B0906A; cursor: not-allowed; text-decoration: none;
        }
        .ip-action-sep { color: var(--border); font-size: 12px; user-select: none; }
        .ip-empty {
          text-align: center; padding: 4rem 2rem;
          color: var(--text-sub); font-size: 14px;
        }
        .ip-empty strong { display: block; color: var(--text); font-size: 15px; margin-bottom: 6px; }
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
        .ip-staff-list {
          border: 1px solid var(--border); border-radius: 8px;
          max-height: 180px; overflow-y: auto; background: #fff;
        }
        .ip-staff-option {
          padding: 10px 12px; cursor: pointer; font-size: 13px;
          border-bottom: 1px solid #F5EDE0; transition: background 0.1s;
        }
        .ip-staff-option:last-child { border-bottom: none; }
        .ip-staff-option:hover { background: #FDFAF6; }
        .ip-staff-option.selected { background: #FFF8E0; }
        .ip-staff-option-email { font-size: 11.5px; color: var(--text-sub); margin-top: 2px; }
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
        .ip-duty-option {
          border: 1px solid var(--border); border-radius: 10px;
          padding: 12px 14px; cursor: pointer; transition: border-color 0.15s, background 0.15s;
          text-align: left; background: #fff; width: 100%;
          font-family: inherit;
        }
        .ip-duty-option:hover { border-color: var(--gold); background: #FDFAF6; }
        .ip-duty-option-title { font-weight: 700; font-size: 13px; color: var(--text); }
        .ip-duty-option-desc { font-size: 12px; color: var(--text-sub); margin-top: 3px; }
        .ip-warn-box {
          background: #FFF8E0; border: 1px solid #F5D78E;
          border-radius: 8px; padding: 12px 14px;
          font-size: 13px; color: var(--brown); line-height: 1.5;
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
        .ip-toast {
          position: fixed; bottom: 2rem; right: 2rem;
          background: var(--brown); color: #fff;
          padding: 0.75rem 1.25rem; border-radius: 10px;
          font-size: 13px; font-weight: 600; z-index: 300;
          box-shadow: 0 8px 24px rgba(107,45,15,0.25);
          max-width: 360px;
        }
        .ip-view-only {
          font-size: 12px; color: var(--text-sub);
          background: #FDFAF6; border: 1px solid var(--border);
          border-radius: 8px; padding: 8px 12px;
        }
        @media (max-width: 600px) { .ip-root { padding: 1rem; } }
      `}</style>

      <div className="ip-root">
        <div className="ip-header">
          <div>
            <h1 className="ip-title">ICT Personnel</h1>
            <p className="ip-subtitle">
              View technician profiles, specializations, and availability status.
            </p>
          </div>
          {isAdmin && (
            <button className="ip-btn-primary" onClick={openAdd}>
              <Plus size={15} /> Add Personnel
            </button>
          )}
        </div>

        <div className="ip-summary">
          <div className="ip-pill"><strong>{personnel.length}</strong> Total</div>
          <div className="ip-pill">
            <strong>{personnel.filter((p) => p.availability === "available" && p.is_active).length}</strong> Available
          </div>
          <div className="ip-pill">
            <strong>{personnel.filter((p) => p.availability === "busy").length}</strong> Busy
          </div>
          <div className="ip-pill">
            <strong>{personnel.filter((p) => p.availability === "off_duty").length}</strong> Off Duty
          </div>
          <div className="ip-pill">
            <strong>{personnel.filter((p) => p.availability === "on_leave").length}</strong> On Leave
          </div>
        </div>

        {!isAdmin && (
          <p className="ip-view-only">
            You have read-only access. Contact an administrator to manage personnel profiles.
          </p>
        )}

        <div className="ip-filters">
          <div className="ip-search">
            <Search size={14} />
            <input
              placeholder="Search by name, email or specialization…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="ip-card">
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
            <div className="ip-table-wrap">
              <table className="ip-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Specialization</th>
                    <th>Availability</th>
                    <th>Active</th>
                    {isAdmin && <th style={{ textAlign: "right" }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const fullName = getStaffName(p.staff_id);
                    const isBusy = p.availability === "busy";
                    return (
                      <tr key={p.id} className={!p.is_active ? "inactive" : undefined}>
                        <td>
                          <span className="ip-name">{formatShortName(fullName)}</span>
                        </td>
                        <td><SpecializationBadge spec={p.specialization} /></td>
                        <td><AvailabilityBadge status={p.availability} /></td>
                        <td><ActiveIndicator active={p.is_active} /></td>
                        {isAdmin && (
                          <td>
                            <div className="ip-actions">
                              <button
                                className="ip-action-link"
                                disabled={isBusy || !p.is_active}
                                title={
                                  isBusy
                                    ? "Technician has an active ticket. Released automatically on ticket close."
                                    : !p.is_active
                                      ? "Profile is deactivated"
                                      : "Set duty status"
                                }
                                onClick={() => setDutyTarget(p)}
                              >
                                Set Duty
                              </button>
                              {p.is_active && (
                                <>
                                  <span className="ip-action-sep">|</span>
                                  <button
                                    className="ip-action-link"
                                    onClick={() => setDeactivateTarget(p)}
                                  >
                                    Deactivate
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Personnel Modal */}
      {showAddModal && (
        <div className="ip-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="ip-modal">
            <div className="ip-modal-header">
              <p className="ip-modal-title">Add ICT Personnel</p>
              <button className="ip-modal-close" onClick={() => setShowAddModal(false)}><X size={14} /></button>
            </div>
            <div className="ip-modal-body">
              {formError && <div className="ip-form-error">{formError}</div>}

              <div className="ip-form-group">
                <label className="ip-label">Staff Member *</label>
                <div className="ip-search" style={{ maxWidth: "none", width: "100%" }}>
                  <Search size={14} />
                  <input
                    placeholder="Search by name or email…"
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                  />
                </div>
                <div className="ip-staff-list">
                  {availableStaff.length === 0 ? (
                    <div style={{ padding: "12px", fontSize: 13, color: "var(--text-sub)" }}>
                      {staffSearch ? "No matching staff without an ICT profile." : "No eligible staff found."}
                    </div>
                  ) : (
                    availableStaff.map((s) => (
                      <div
                        key={s.id}
                        className={`ip-staff-option${form.staff_id === String(s.id) ? " selected" : ""}`}
                        onClick={() => setForm({ ...form, staff_id: String(s.id) })}
                      >
                        <div>{s.full_name}</div>
                        <div className="ip-staff-option-email">{s.email}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="ip-form-group">
                <label className="ip-label">Specialization *</label>
                <select
                  className="ip-form-select"
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value as Specialization })}
                >
                  <option value="">Select specialization</option>
                  {SPECIALIZATIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="ip-form-group">
                <label className="ip-label">Phone Extension</label>
                <input
                  className="ip-input"
                  placeholder="e.g. 4521"
                  maxLength={10}
                  value={form.phone_extension}
                  onChange={(e) => setForm({ ...form, phone_extension: e.target.value })}
                />
              </div>

              <div className="ip-form-hint">
                Initial availability is set to <strong>Available</strong> automatically by the system.
                <strong> Busy</strong> status is managed exclusively by the ticket triage system.
              </div>
            </div>
            <div className="ip-modal-footer">
              <button className="ip-btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="ip-btn-submit" onClick={handleAdd} disabled={submitting}>
                {submitting ? "Creating…" : "Create Profile"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set Duty Status Modal */}
      {dutyTarget && (
        <div className="ip-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDutyTarget(null); }}>
          <div className="ip-modal">
            <div className="ip-modal-header">
              <p className="ip-modal-title">Set Duty Status</p>
              <button className="ip-modal-close" onClick={() => setDutyTarget(null)}><X size={14} /></button>
            </div>
            <div className="ip-modal-body">
              <p style={{ fontSize: 13, color: "var(--text-sub)" }}>
                Update availability for{" "}
                <strong style={{ color: "var(--text)" }}>
                  {formatShortName(getStaffName(dutyTarget.staff_id))}
                </strong>
              </p>
              <p style={{ fontSize: 12, color: "var(--text-sub)" }}>
                Current status: <AvailabilityBadge status={dutyTarget.availability} />
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dutyOptions.map((opt) => (
                  <button
                    key={opt.value}
                    className="ip-duty-option"
                    disabled={submitting}
                    onClick={() => handleDutyStatus(opt.value)}
                  >
                    <div className="ip-duty-option-title">{opt.label}</div>
                    <div className="ip-duty-option-desc">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="ip-modal-footer">
              <button className="ip-btn-ghost" onClick={() => setDutyTarget(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation */}
      {deactivateTarget && (
        <div className="ip-overlay" onClick={(e) => { if (e.target === e.currentTarget) setDeactivateTarget(null); }}>
          <div className="ip-modal" style={{ maxWidth: 420 }}>
            <div className="ip-modal-header">
              <p className="ip-modal-title">Deactivate Technician</p>
              <button className="ip-modal-close" onClick={() => setDeactivateTarget(null)}><X size={14} /></button>
            </div>
            <div className="ip-modal-body" style={{ textAlign: "center" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "#FFEBEE", display: "flex",
                alignItems: "center", justifyContent: "center",
                color: "#BB0000", margin: "0 auto",
              }}>
                <UserX size={24} />
              </div>
              <p style={{ fontSize: 14, color: "var(--text-sub)" }}>
                Deactivate ICT profile for
              </p>
              <p style={{ fontWeight: 700, color: "var(--brown)", fontSize: 15 }}>
                {getStaffName(deactivateTarget.staff_id)}
              </p>
              {deactivateTarget.availability === "busy" && (
                <div className="ip-warn-box" style={{ textAlign: "left" }}>
                  <strong>Warning:</strong> This technician has an active ticket.
                  Resolve or reassign the ticket before deactivating.
                </div>
              )}
              <p style={{ fontSize: 12.5, color: "var(--text-sub)", lineHeight: 1.6 }}>
                Deactivated technicians are excluded from ticket assignment triage.
                Use only for personnel who have left the ICT team.
              </p>
            </div>
            <div className="ip-modal-footer">
              <button className="ip-btn-ghost" onClick={() => setDeactivateTarget(null)}>Cancel</button>
              <button className="ip-btn-danger" onClick={handleDeactivate} disabled={submitting}>
                {submitting ? "Deactivating…" : "Yes, Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="ip-toast">{toast}</div>}
    </>
  );
}
