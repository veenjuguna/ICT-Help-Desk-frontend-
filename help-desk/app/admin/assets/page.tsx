"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, ChevronDown, Plus, Edit2, Trash2, Package,
  Monitor, Printer, Cpu, RefreshCw, X, Loader2,
  CheckCircle2, AlertCircle, ChevronUp, UserCheck, Undo2,
} from "lucide-react";

// ── Backend types (mirror app/assets/schemas.py exactly) ───────────────────────
type BackendDeviceType = "laptop" | "desktop" | "printer" | "monitor" | "other";
type BackendClassification = "confidential" | "internal" | "public";
type BackendCondition = "good" | "fair" | "poor" | "decommissioned";

interface BackendAsset {
  id: number;
  asset_tag: string;
  serial_number: string;
  device_type: BackendDeviceType;
  brand: string;
  model: string;
  classification: BackendClassification;
  condition: BackendCondition;
  purchase_date: string | null;
  warranty_expiry: string | null;
  created_at: string;
}

interface BackendAllocation {
  id: number;
  asset_id: number;
  staff_id: string; // UUID
  allocation_date: string;
  return_date: string | null;
  notes: string | null;
}

interface BackendStaff {
  id: string; // UUID
  full_name: string;
  email: string;
  department: { id: number; name: string } | null; // StaffResponse.department -> DepartmentBasic
}

// ── UI-facing types ─────────────────────────────────────────────────────────────
// The backend has no "status" column — it's derived here from whether an asset
// has a live allocation (return_date == null) and from its condition.
type UiStatus = "available" | "allocated" | "retired";

interface UiAsset {
  id: number;
  asset_tag: string;
  serial_number: string;
  name: string; // brand + model, for display/search only
  brand: string;
  model: string;
  device_type: BackendDeviceType;
  classification: BackendClassification;
  condition: BackendCondition;
  status: UiStatus;
  purchase_date: string | null;
  warranty_expiry: string | null;
  allocation_id: number | null;
  allocated_to: { id: string; full_name: string; department: string } | null;
}

interface AssetFormState {
  asset_tag?: string;
  serial_number?: string;
  brand?: string;
  model?: string;
  device_type?: BackendDeviceType;
  classification?: BackendClassification;
  condition?: BackendCondition;
  purchase_date?: string | null;
  warranty_expiry?: string | null;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://ict-help-desk-neon.onrender.com";

// ── Config ────────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<UiStatus, { label: string; color: string; bg: string }> = {
  available: { label: "Available", color: "#166534", bg: "#F0FDF4" },
  allocated: { label: "Allocated", color: "#8B4513", bg: "#FDF6EE" },
  retired:   { label: "Retired",   color: "#7A5C44", bg: "#FDF8F2" },
};

const CONDITION_CONFIG: Record<BackendCondition, { label: string; color: string }> = {
  good:           { label: "Good",           color: "#166534" },
  fair:           { label: "Fair",           color: "#B45309" },
  poor:           { label: "Poor",           color: "#B91C1C" },
  decommissioned: { label: "Decommissioned", color: "#7A5C44" },
};

const DEVICE_LABELS: Record<BackendDeviceType, string> = {
  laptop: "Laptop", desktop: "Desktop", printer: "Printer", monitor: "Monitor", other: "Other",
};

const DEVICE_ICONS: Record<BackendDeviceType, React.ElementType> = {
  laptop: Cpu, desktop: Monitor, printer: Printer, monitor: Monitor, other: Package,
};

const DEVICE_TYPES: BackendDeviceType[] = ["laptop", "desktop", "printer", "monitor", "other"];
const CLASSIFICATIONS: BackendClassification[] = ["confidential", "internal", "public"];
const CONDITIONS: BackendCondition[] = ["good", "fair", "poor", "decommissioned"];

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function deriveStatus(asset: BackendAsset, hasActiveAllocation: boolean): UiStatus {
  if (asset.condition === "decommissioned") return "retired";
  return hasActiveAllocation ? "allocated" : "available";
}

function staffDeptLabel(s: BackendStaff): string {
  return s.department?.name ?? "—";
}

function toUiAssets(assets: BackendAsset[], allocations: BackendAllocation[], staff: BackendStaff[]): UiAsset[] {
  const staffMap = new Map(staff.map(s => [s.id, s]));
  const activeAllocByAsset = new Map<number, BackendAllocation>();
  for (const alloc of allocations) {
    if (alloc.return_date == null) activeAllocByAsset.set(alloc.asset_id, alloc);
  }
  return assets.map(a => {
    const alloc = activeAllocByAsset.get(a.id);
    const s = alloc ? staffMap.get(alloc.staff_id) : undefined;
    return {
      id: a.id,
      asset_tag: a.asset_tag,
      serial_number: a.serial_number,
      name: `${a.brand} ${a.model}`.trim(),
      brand: a.brand,
      model: a.model,
      device_type: a.device_type,
      classification: a.classification,
      condition: a.condition,
      status: deriveStatus(a, !!alloc),
      purchase_date: a.purchase_date,
      warranty_expiry: a.warranty_expiry,
      allocation_id: alloc?.id ?? null,
      allocated_to: s ? { id: s.id, full_name: s.full_name, department: staffDeptLabel(s) } : null,
    };
  });
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, background: type === "success" ? "#166534" : "#B91C1C", color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: "0.86rem", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.2)", maxWidth: 340 }}>
      {type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {msg}
      <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0 }}><X size={14} /></button>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function AdminAssetsPage() {
  const [assets, setAssets]       = useState<UiAsset[]>([]);
  const [staff, setStaff]         = useState<BackendStaff[]>([]);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const [typeFilter, setType]     = useState("all");
  const [statusFilter, setStatus] = useState("all");
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast]         = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Add/Edit modal
  const [editing, setEditing]     = useState<UiAsset | null>(null);
  const [adding, setAdding]       = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState<AssetFormState>({});

  // Delete modal
  const [deleting, setDeleting]   = useState<UiAsset | null>(null);
  const [savingDel, setSavingDel] = useState(false);

  // Allocate modal
  const [allocating, setAllocating]   = useState<UiAsset | null>(null);
  const [allocTarget, setAllocTarget] = useState<string | null>(null);
  const [allocDate, setAllocDate]     = useState(todayIso());
  const [allocNotes, setAllocNotes]   = useState("");
  const [savingAlloc, setSavingAlloc] = useState(false);

  // Return modal
  const [returning, setReturning]     = useState<UiAsset | null>(null);
  const [savingReturn, setSavingReturn] = useState(false);

  const showToast = (msg: string, type: "success" | "error") => setToast({ msg, type });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [assetsRes, allocRes, staffRes] = await Promise.all([
        fetch(`${API}/assets/`, { credentials: "include" }),
        fetch(`${API}/assets/allocations`, { credentials: "include" }),
        fetch(`${API}/staff/`, { credentials: "include" }),
      ]);
      if (!assetsRes.ok) throw new Error(`Failed to load assets (${assetsRes.status})`);

      const rawAssets: BackendAsset[] = await assetsRes.json();
      const rawAllocations: BackendAllocation[] = allocRes.ok ? await allocRes.json() : [];
      const rawStaff: BackendStaff[] = staffRes.ok ? await staffRes.json() : [];

      setStaff(rawStaff);
      setAssets(toUiAssets(rawAssets, rawAllocations, rawStaff));
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load data from the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Manual re-fetch (Refresh button, error banner retry). This runs from an
  // event handler, not an effect, so flipping `loading`/`loadError` here
  // synchronously is fine — the lint rule only targets effects.
  const handleRefresh = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    fetchAll();
  }, [fetchAll]);

  // This is the standard "fetch data in an effect" pattern from React's own
  // docs (react.dev/learn/synchronizing-with-effects#fetching-data). The
  // react-hooks/set-state-in-effect rule has a known false positive here: it
  // statically flags any setState reachable from a function called in an
  // effect, regardless of whether that call actually happens after an
  // internal `await` — see facebook/react#34743, acknowledged by the React
  // Compiler team as overly strict and not yet resolved upstream.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = assets.filter(a => {
    const q = search.toLowerCase();
    const matchQ = !q || a.asset_tag.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || (a.allocated_to ? a.allocated_to.full_name.toLowerCase().includes(q) : false);
    const matchT = typeFilter === "all" || a.device_type === typeFilter;
    const matchS = statusFilter === "all" || a.status === statusFilter;
    return matchQ && matchT && matchS;
  });

  const utilization = DEVICE_TYPES.map(type => {
    const total     = assets.filter(a => a.device_type === type).length;
    const allocated = assets.filter(a => a.device_type === type && a.status === "allocated").length;
    return { type, total, allocated, pct: total > 0 ? Math.round((allocated / total) * 100) : 0 };
  }).filter(u => u.total > 0);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const openAdd = () => {
    setForm({ device_type: "laptop", classification: "internal", condition: "good" });
    setAdding(true);
  };

  const openEdit = (a: UiAsset) => {
    setForm({
      asset_tag: a.asset_tag,
      serial_number: a.serial_number,
      brand: a.brand,
      model: a.model,
      device_type: a.device_type,
      classification: a.classification,
      condition: a.condition,
      purchase_date: a.purchase_date,
      warranty_expiry: a.warranty_expiry,
    });
    setEditing(a);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const isEdit = !!editing;
      // AssetUpdate only accepts brand/model/classification/condition/warranty_expiry —
      // asset_tag, serial_number, device_type and purchase_date are immutable after creation.
      const payload = isEdit
        ? {
            brand: form.brand,
            model: form.model,
            classification: form.classification,
            condition: form.condition,
            warranty_expiry: form.warranty_expiry || null,
          }
        : {
            asset_tag: form.asset_tag,
            serial_number: form.serial_number,
            device_type: form.device_type,
            brand: form.brand,
            model: form.model,
            classification: form.classification,
            condition: form.condition ?? "good",
            purchase_date: form.purchase_date || null,
            warranty_expiry: form.warranty_expiry || null,
          };

      const res = await fetch(isEdit ? `${API}/assets/${editing!.id}` : `${API}/assets/`, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail ?? "Failed to save asset.");
      }
      showToast(isEdit ? "Asset updated." : "Asset created.", "success");
      setAdding(false);
      setEditing(null);
      await fetchAll();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to save asset.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSavingDel(true);
    try {
      const res = await fetch(`${API}/assets/${deleting.id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail ?? "Failed to delete asset.");
      }
      setAssets(prev => prev.filter(a => a.id !== deleting.id));
      showToast("Asset deleted.", "success");
      setDeleting(null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to delete asset.", "error");
    } finally {
      setSavingDel(false);
    }
  };

  const handleAllocate = async () => {
    if (!allocating || !allocTarget) return;
    setSavingAlloc(true);
    try {
      const res = await fetch(`${API}/assets/allocate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          asset_id: allocating.id,
          staff_id: allocTarget,
          allocation_date: allocDate,
          notes: allocNotes || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail ?? "Allocation failed.");
      }
      showToast("Asset allocated successfully.", "success");
      setAllocating(null);
      setAllocTarget(null);
      setAllocNotes("");
      setAllocDate(todayIso());
      await fetchAll();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Allocation failed.", "error");
    } finally {
      setSavingAlloc(false);
    }
  };

  const handleReturn = async () => {
    if (!returning || returning.allocation_id == null) return;
    setSavingReturn(true);
    try {
      const res = await fetch(`${API}/assets/allocations/${returning.allocation_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ return_date: todayIso() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail ?? "Failed to return asset.");
      }
      showToast("Asset returned.", "success");
      setReturning(null);
      await fetchAll();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to return asset.", "error");
    } finally {
      setSavingReturn(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        :root {
          --brown-dark: #4A1E0A;
          --brown-main: #6B2D0F;
          --brown-mid:  #8B4513;
          --gold:       #C8962E;
          --gold-light: #E8B84B;
          --cream:      #FDF8F2;
          --border:     #E0D0C0;
          --text-main:  #1A0F08;
          --text-sub:   #7A5C44;
        }

        .ast-root { padding: 28px 32px; min-height: 100vh; background: var(--cream); font-family: 'Inter', system-ui, sans-serif; }

        .ast-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .ast-header h1 { font-size: 1.35rem; font-weight: 700; color: var(--brown-dark); margin: 0 0 2px; }
        .ast-header p  { font-size: 0.82rem; color: var(--text-sub); margin: 0; }
        .ast-header-btns { display: flex; gap: 8px; }
        .ast-refresh-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #fff; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.82rem; font-weight: 600; color: var(--brown-main); cursor: pointer; transition: all 0.15s; }
        .ast-refresh-btn:hover { border-color: var(--gold); color: var(--gold); }
        .ast-add-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: var(--brown-dark); border: none; border-radius: 8px; font-size: 0.84rem; font-weight: 600; color: #fff; cursor: pointer; transition: background 0.15s; }
        .ast-add-btn:hover { background: var(--brown-main); }

        /* Error banner */
        .ast-error-banner { display: flex; align-items: center; gap: 10px; background: #FEF2F2; border: 1.5px solid #FECACA; color: #991B1B; padding: 12px 16px; border-radius: 10px; font-size: 0.84rem; margin-bottom: 18px; }
        .ast-error-banner button { margin-left: auto; background: #fff; border: 1.5px solid #FECACA; color: #991B1B; border-radius: 6px; padding: 6px 12px; font-size: 0.78rem; font-weight: 600; cursor: pointer; }

        /* Stats */
        .ast-stats { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .ast-stat { background: #fff; border: 1.5px solid var(--border); border-radius: 8px; padding: 10px 18px; flex: 1; min-width: 110px; }
        .ast-stat-val { font-size: 1.4rem; font-weight: 800; color: var(--brown-dark); }
        .ast-stat-label { font-size: 0.72rem; color: var(--text-sub); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
        .ast-stat.gold .ast-stat-val { color: var(--brown-mid); }
        .ast-stat.red .ast-stat-val  { color: #B91C1C; }

        /* Utilization */
        .ast-util-card { background: #fff; border: 1.5px solid var(--border); border-radius: 12px; padding: 16px 20px; margin-bottom: 20px; }
        .ast-util-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; cursor: pointer; }
        .ast-util-title { font-size: 0.85rem; font-weight: 700; color: var(--brown-dark); }
        .ast-util-rows { display: flex; flex-direction: column; gap: 10px; }
        .ast-util-row { display: flex; align-items: center; gap: 12px; }
        .ast-util-label { font-size: 0.8rem; font-weight: 600; color: var(--text-main); min-width: 80px; }
        .ast-util-bar-wrap { flex: 1; background: #F0E8DC; border-radius: 99px; height: 8px; overflow: hidden; }
        .ast-util-bar { height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--brown-main), var(--gold)); transition: width 0.4s ease; }
        .ast-util-count { font-size: 0.76rem; color: var(--text-sub); min-width: 60px; text-align: right; }

        /* Filters */
        .ast-filters { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
        .ast-search-wrap { position: relative; flex: 1; min-width: 220px; }
        .ast-search-wrap svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-sub); }
        .ast-search { width: 100%; padding: 9px 12px 9px 34px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.84rem; color: var(--text-main); background: #fff; outline: none; }
        .ast-search:focus { border-color: var(--gold); }
        .ast-select-wrap { position: relative; }
        .ast-select-wrap svg { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-sub); }
        .ast-select { appearance: none; padding: 9px 30px 9px 12px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.84rem; color: var(--text-main); background: #fff; cursor: pointer; outline: none; }
        .ast-select:focus { border-color: var(--gold); }

        /* Table */
        .ast-table-wrap { background: #fff; border: 1.5px solid var(--border); border-radius: 12px; overflow: hidden; }
        .ast-table { width: 100%; border-collapse: collapse; }
        .ast-table th { padding: 10px 16px; text-align: left; font-size: 0.71rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--text-sub); background: var(--cream); border-bottom: 1px solid var(--border); white-space: nowrap; }
        .ast-table td { padding: 12px 16px; font-size: 0.84rem; color: var(--text-main); border-bottom: 1px solid var(--border); vertical-align: middle; }
        .ast-table tr:last-child td { border-bottom: none; }
        .ast-table tr:hover td { background: #FDF4EB; }
        .ast-tag { font-weight: 700; color: var(--brown-main); font-size: 0.78rem; }
        .ast-name { font-weight: 500; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ast-sub { font-size: 0.73rem; color: var(--text-sub); margin-top: 2px; }
        .ast-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
        .ast-type-icon { width: 28px; height: 28px; border-radius: 6px; background: #F5EDE3; display: flex; align-items: center; justify-content: center; color: var(--brown-main); flex-shrink: 0; }
        .ast-actions { display: flex; gap: 5px; }
        .ast-btn-icon { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: 1.5px solid var(--border); background: #fff; cursor: pointer; color: var(--text-sub); transition: all 0.15s; }
        .ast-btn-icon:hover { border-color: var(--gold); color: var(--brown-mid); background: #FDF6EE; }
        .ast-btn-icon.danger:hover { border-color: #B91C1C; color: #B91C1C; background: #FEF2F2; }
        .ast-empty { padding: 40px; text-align: center; color: var(--text-sub); font-size: 0.86rem; }
        .ast-loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 60px; color: var(--text-sub); font-size: 0.88rem; }

        /* Modal */
        .ast-modal-overlay { position: fixed; inset: 0; background: rgba(74,30,10,0.4); z-index: 200; display: flex; align-items: center; justify-content: center; }
        .ast-modal { background: #fff; border-radius: 14px; width: 480px; max-width: 95vw; max-height: 90vh; overflow-y: auto; padding: 24px; animation: fadeUp 0.2s ease; border-top: 4px solid var(--brown-main); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .ast-modal h3 { font-size: 1rem; font-weight: 700; color: var(--brown-dark); margin: 0 0 4px; }
        .ast-modal p  { font-size: 0.81rem; color: var(--text-sub); margin: 0 0 18px; }
        .ast-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }
        .ast-form-field { display: flex; flex-direction: column; gap: 5px; }
        .ast-form-field.full { grid-column: 1 / -1; }
        .ast-form-field label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-sub); }
        .ast-form-input { padding: 9px 12px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.84rem; color: var(--text-main); background: #fff; outline: none; font-family: inherit; }
        .ast-form-input:focus { border-color: var(--gold); }
        .ast-form-input:disabled { background: var(--cream); color: var(--text-sub); cursor: not-allowed; }
        .ast-form-hint { font-size: 0.7rem; color: var(--text-sub); margin-top: -2px; }
        .ast-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
        .ast-modal-cancel { padding: 8px 18px; border: 1.5px solid var(--border); background: #fff; border-radius: 8px; font-size: 0.84rem; font-weight: 600; color: var(--text-sub); cursor: pointer; }
        .ast-modal-cancel:hover { border-color: var(--brown-mid); color: var(--brown-dark); }
        .ast-modal-confirm { padding: 8px 18px; background: var(--brown-dark); color: #fff; border: none; border-radius: 8px; font-size: 0.84rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .ast-modal-confirm:hover:not(:disabled) { background: var(--gold); }
        .ast-modal-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
        .ast-modal-confirm.danger { background: #B91C1C; }
        .ast-modal-confirm.danger:hover:not(:disabled) { background: #991B1B; }

        /* Staff list in allocate modal */
        .ast-staff-list { display: flex; flex-direction: column; gap: 7px; margin-bottom: 18px; max-height: 240px; overflow-y: auto; }
        .ast-staff-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 13px; border: 1.5px solid var(--border); border-radius: 8px; cursor: pointer; transition: all 0.15s; }
        .ast-staff-item:hover { border-color: var(--gold); background: #FDF6EE; }
        .ast-staff-item.selected { border-color: var(--brown-main); background: #F5EDE3; }
        .ast-staff-name { font-size: 0.85rem; font-weight: 600; color: var(--brown-dark); }
        .ast-staff-dept { font-size: 0.75rem; color: var(--text-sub); }

        @media (max-width: 768px) {
          .ast-root { padding: 16px; }
          .ast-stats { flex-wrap: wrap; }
          .ast-form-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ast-root">
        {/* Header */}
        <div className="ast-header">
          <div>
            <h1>Assets</h1>
            <p>Device registry, tracking and allocation</p>
          </div>
          <div className="ast-header-btns">
            <button className="ast-refresh-btn" onClick={handleRefresh}><RefreshCw size={14} /> Refresh</button>
            <button className="ast-add-btn" onClick={openAdd}><Plus size={14} /> Add Asset</button>
          </div>
        </div>

        {loadError && (
          <div className="ast-error-banner">
            <AlertCircle size={16} />
            {loadError}
            <button onClick={handleRefresh}>Retry</button>
          </div>
        )}

        {/* Stats */}
        <div className="ast-stats">
          <div className="ast-stat"><div className="ast-stat-val">{assets.length}</div><div className="ast-stat-label">Total Assets</div></div>
          <div className="ast-stat gold"><div className="ast-stat-val">{assets.filter(a => a.status === "allocated").length}</div><div className="ast-stat-label">Allocated</div></div>
          <div className="ast-stat"><div className="ast-stat-val">{assets.filter(a => a.status === "available").length}</div><div className="ast-stat-label">Available</div></div>
          <div className="ast-stat red"><div className="ast-stat-val">{assets.filter(a => a.status === "retired").length}</div><div className="ast-stat-label">Retired</div></div>
        </div>

        {/* Utilization */}
        <div className="ast-util-card">
          <div className="ast-util-header" onClick={() => setCollapsed(c => !c)}>
            <span className="ast-util-title">Asset Utilization by Type</span>
            {collapsed ? <ChevronDown size={16} color="#7A5C44" /> : <ChevronUp size={16} color="#7A5C44" />}
          </div>
          {!collapsed && (
            <div className="ast-util-rows">
              {utilization.map(u => {
                const Icon = DEVICE_ICONS[u.type] ?? Package;
                return (
                  <div className="ast-util-row" key={u.type}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 100 }}>
                      <div className="ast-type-icon" style={{ width: 22, height: 22 }}><Icon size={12} /></div>
                      <span className="ast-util-label">{DEVICE_LABELS[u.type]}</span>
                    </div>
                    <div className="ast-util-bar-wrap">
                      <div className="ast-util-bar" style={{ width: `${u.pct}%` }} />
                    </div>
                    <span className="ast-util-count">{u.allocated}/{u.total} ({u.pct}%)</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="ast-filters">
          <div className="ast-search-wrap">
            <Search size={14} />
            <input className="ast-search" placeholder="Search by tag, name, or staff…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="ast-select-wrap">
            <select className="ast-select" value={typeFilter} onChange={e => setType(e.target.value)}>
              <option value="all">All Types</option>
              {DEVICE_TYPES.map(t => <option key={t} value={t}>{DEVICE_LABELS[t]}</option>)}
            </select>
            <ChevronDown size={13} />
          </div>
          <div className="ast-select-wrap">
            <select className="ast-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="allocated">Allocated</option>
              <option value="retired">Retired</option>
            </select>
            <ChevronDown size={13} />
          </div>
        </div>

        {/* Table */}
        <div className="ast-table-wrap">
          {loading
            ? <div className="ast-loading"><Loader2 size={18} /> Loading…</div>
            : filtered.length === 0
            ? <div className="ast-empty">No assets match your filters.</div>
            : (
              <table className="ast-table">
                <thead>
                  <tr>
                    <th>Asset Tag</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Condition</th>
                    <th>Allocated To</th>
                    <th>Purchased</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => {
                    const sc = STATUS_CONFIG[a.status];
                    const cc = CONDITION_CONFIG[a.condition];
                    const Icon = DEVICE_ICONS[a.device_type] ?? Package;
                    return (
                      <tr key={a.id}>
                        <td><div className="ast-tag">{a.asset_tag}</div></td>
                        <td>
                          <div className="ast-name">{a.name}</div>
                          <div className="ast-sub">{a.serial_number}</div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div className="ast-type-icon"><Icon size={13} /></div>
                            <span style={{ fontSize: "0.82rem" }}>{DEVICE_LABELS[a.device_type]}</span>
                          </div>
                        </td>
                        <td>
                          <span className="ast-badge" style={{ color: sc.color, background: sc.bg }}>{sc.label}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: cc.color }}>{cc.label}</span>
                        </td>
                        <td>
                          {a.allocated_to
                            ? <div>
                                <div style={{ fontSize: "0.82rem", fontWeight: 500 }}>{a.allocated_to.full_name}</div>
                                <div className="ast-sub">{a.allocated_to.department}</div>
                              </div>
                            : <span style={{ fontSize: "0.78rem", color: "#B91C1C", fontStyle: "italic" }}>Unallocated</span>
                          }
                        </td>
                        <td style={{ fontSize: "0.78rem", color: "var(--text-sub)" }}>{fmt(a.purchase_date)}</td>
                        <td>
                          <div className="ast-actions">
                            <button className="ast-btn-icon" title="Edit" onClick={() => openEdit(a)}><Edit2 size={13} /></button>
                            {a.status === "available" && (
                              <button className="ast-btn-icon" title="Allocate" onClick={() => { setAllocating(a); setAllocTarget(null); setAllocDate(todayIso()); setAllocNotes(""); }}><UserCheck size={13} /></button>
                            )}
                            {a.status === "allocated" && (
                              <button className="ast-btn-icon" title="Return" onClick={() => setReturning(a)}><Undo2 size={13} /></button>
                            )}
                            <button className="ast-btn-icon danger" title="Delete" onClick={() => setDeleting(a)}><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          }
        </div>
      </div>

      {/* Add / Edit modal */}
      {(adding || editing) && (
        <div className="ast-modal-overlay" onClick={() => { setAdding(false); setEditing(null); }}>
          <div className="ast-modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? "Edit Asset" : "Add New Asset"}</h3>
            <p>{editing ? `Editing ${editing.asset_tag}` : "Register a new device in the system"}</p>
            <div className="ast-form-grid">
              <div className="ast-form-field">
                <label>Asset Tag *</label>
                <input className="ast-form-input" placeholder="TNT-LAP-001" value={form.asset_tag ?? ""} disabled={!!editing} onChange={e => setForm(f => ({ ...f, asset_tag: e.target.value }))} />
              </div>
              <div className="ast-form-field">
                <label>Serial Number *</label>
                <input className="ast-form-input" placeholder="SN-XXXXX" value={form.serial_number ?? ""} disabled={!!editing} onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))} />
              </div>
              <div className="ast-form-field">
                <label>Brand *</label>
                <input className="ast-form-input" placeholder="Dell" value={form.brand ?? ""} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
              </div>
              <div className="ast-form-field">
                <label>Model *</label>
                <input className="ast-form-input" placeholder="Latitude 5520" value={form.model ?? ""} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} />
              </div>
              <div className="ast-form-field">
                <label>Device Type</label>
                <select className="ast-form-input" value={form.device_type ?? "laptop"} disabled={!!editing} onChange={e => setForm(f => ({ ...f, device_type: e.target.value as BackendDeviceType }))}>
                  {DEVICE_TYPES.map(t => <option key={t} value={t}>{DEVICE_LABELS[t]}</option>)}
                </select>
              </div>
              <div className="ast-form-field">
                <label>Classification *</label>
                <select className="ast-form-input" value={form.classification ?? "internal"} onChange={e => setForm(f => ({ ...f, classification: e.target.value as BackendClassification }))}>
                  {CLASSIFICATIONS.map(c => <option key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div className="ast-form-field">
                <label>Condition</label>
                <select className="ast-form-input" value={form.condition ?? "good"} onChange={e => setForm(f => ({ ...f, condition: e.target.value as BackendCondition }))}>
                  {CONDITIONS.map(c => <option key={c} value={c}>{CONDITION_CONFIG[c].label}</option>)}
                </select>
              </div>
              <div className="ast-form-field">
                <label>Purchase Date</label>
                <input className="ast-form-input" type="date" value={form.purchase_date ?? ""} disabled={!!editing} onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))} />
              </div>
              <div className="ast-form-field full">
                <label>Warranty Expiry</label>
                <input className="ast-form-input" type="date" value={form.warranty_expiry ?? ""} onChange={e => setForm(f => ({ ...f, warranty_expiry: e.target.value }))} />
              </div>
              {editing && <div className="ast-form-field full"><div className="ast-form-hint">Tag, serial number, device type and purchase date are locked after creation.</div></div>}
            </div>
            <div className="ast-modal-actions">
              <button className="ast-modal-cancel" onClick={() => { setAdding(false); setEditing(null); }}>Cancel</button>
              <button
                className="ast-modal-confirm"
                disabled={saving || !form.brand || !form.model || !form.classification || (!editing && (!form.asset_tag || !form.serial_number))}
                onClick={handleSave}
              >
                {saving ? <Loader2 size={13} /> : <CheckCircle2 size={13} />} {editing ? "Save Changes" : "Create Asset"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleting && (
        <div className="ast-modal-overlay" onClick={() => setDeleting(null)}>
          <div className="ast-modal" style={{ width: 380 }} onClick={e => e.stopPropagation()}>
            <h3>Delete Asset</h3>
            <p>Are you sure you want to delete <strong>{deleting.asset_tag} — {deleting.name}</strong>? This cannot be undone.</p>
            <div className="ast-modal-actions">
              <button className="ast-modal-cancel" onClick={() => setDeleting(null)}>Cancel</button>
              <button className="ast-modal-confirm danger" disabled={savingDel} onClick={handleDelete}>
                {savingDel ? <Loader2 size={13} /> : <Trash2 size={13} />} Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Allocate modal */}
      {allocating && (
        <div className="ast-modal-overlay" onClick={() => setAllocating(null)}>
          <div className="ast-modal" onClick={e => e.stopPropagation()}>
            <h3>Allocate Asset</h3>
            <p>Assigning <strong>{allocating.asset_tag} — {allocating.name}</strong> to a staff member</p>
            <div className="ast-staff-list">
              {staff.map(s => (
                <div key={s.id} className={`ast-staff-item${allocTarget === s.id ? " selected" : ""}`} onClick={() => setAllocTarget(s.id)}>
                  <div>
                    <div className="ast-staff-name">{s.full_name}</div>
                    <div className="ast-staff-dept">{staffDeptLabel(s)}</div>
                  </div>
                  {allocTarget === s.id && <CheckCircle2 size={15} color="#6B2D0F" />}
                </div>
              ))}
            </div>
            <div className="ast-form-grid">
              <div className="ast-form-field">
                <label>Allocation Date</label>
                <input className="ast-form-input" type="date" value={allocDate} onChange={e => setAllocDate(e.target.value)} />
              </div>
              <div className="ast-form-field full">
                <label>Notes</label>
                <input className="ast-form-input" placeholder="Optional note" value={allocNotes} onChange={e => setAllocNotes(e.target.value)} />
              </div>
            </div>
            <div className="ast-modal-actions">
              <button className="ast-modal-cancel" onClick={() => { setAllocating(null); setAllocTarget(null); }}>Cancel</button>
              <button className="ast-modal-confirm" disabled={!allocTarget || savingAlloc} onClick={handleAllocate}>
                {savingAlloc ? <Loader2 size={13} /> : <UserCheck size={13} />} Allocate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return modal */}
      {returning && (
        <div className="ast-modal-overlay" onClick={() => setReturning(null)}>
          <div className="ast-modal" style={{ width: 380 }} onClick={e => e.stopPropagation()}>
            <h3>Return Asset</h3>
            <p>
              Mark <strong>{returning.asset_tag} — {returning.name}</strong> as returned by{" "}
              {returning.allocated_to ? returning.allocated_to.full_name : "the current holder"}?
              It will become available again.
            </p>
            <div className="ast-modal-actions">
              <button className="ast-modal-cancel" onClick={() => setReturning(null)}>Cancel</button>
              <button className="ast-modal-confirm" disabled={savingReturn} onClick={handleReturn}>
                {savingReturn ? <Loader2 size={13} /> : <Undo2 size={13} />} Return
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}