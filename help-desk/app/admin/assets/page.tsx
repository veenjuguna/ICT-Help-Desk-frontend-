"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, ChevronDown, Plus, Edit2, Trash2, Package,
  Monitor, Printer, Cpu, RefreshCw, X, Loader2,
  CheckCircle2, AlertCircle, ChevronUp, UserCheck,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Asset {
  id: number;
  asset_tag: string;
  name: string;
  device_type: "Laptop" | "Desktop" | "Printer" | "Monitor" | "Other";
  serial_number: string;
  status: "available" | "allocated" | "maintenance" | "retired";
  condition: "new" | "good" | "fair" | "poor";
  purchased_at: string | null;
  notes: string | null;
  allocated_to: { id: number; first_name: string; last_name: string; department: string } | null;
}

interface StaffMember {
  id: number;
  first_name: string;
  last_name: string;
  department: string;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://ict-help-desk-neon.onrender.com";

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_ASSETS: Asset[] = [
  { id: 1,  asset_tag: "TNT-LAP-001", name: "Dell Latitude 5520",        device_type: "Laptop",  serial_number: "SN-DL5520-001", status: "allocated",   condition: "good", purchased_at: "2023-01-15", notes: null,                    allocated_to: { id: 10, first_name: "Grace",  last_name: "Mwangi",  department: "Budget"      } },
  { id: 2,  asset_tag: "TNT-LAP-002", name: "HP EliteBook 840",          device_type: "Laptop",  serial_number: "SN-HP840-002",  status: "available",   condition: "good", purchased_at: "2023-03-10", notes: null,                    allocated_to: null },
  { id: 3,  asset_tag: "TNT-DES-001", name: "Dell OptiPlex 7090",        device_type: "Desktop", serial_number: "SN-OP7090-001", status: "allocated",   condition: "good", purchased_at: "2022-11-20", notes: null,                    allocated_to: { id: 11, first_name: "James",  last_name: "Kariuki", department: "Procurement" } },
  { id: 4,  asset_tag: "TNT-DES-002", name: "HP ProDesk 600",            device_type: "Desktop", serial_number: "SN-PD600-002",  status: "maintenance", condition: "fair", purchased_at: "2022-06-05", notes: "Screen flickering",      allocated_to: null },
  { id: 5,  asset_tag: "TNT-PRT-001", name: "HP LaserJet Pro M404",      device_type: "Printer", serial_number: "SN-LJ404-001",  status: "allocated",   condition: "good", purchased_at: "2023-05-22", notes: null,                    allocated_to: { id: 12, first_name: "Faith",  last_name: "Njoroge", department: "Debt Mgmt"   } },
  { id: 6,  asset_tag: "TNT-PRT-002", name: "Canon imageRUNNER 2625",    device_type: "Printer", serial_number: "SN-IR2625-001", status: "available",   condition: "new",  purchased_at: "2024-01-08", notes: null,                    allocated_to: null },
  { id: 7,  asset_tag: "TNT-MON-001", name: "Dell 24\" P2422H",          device_type: "Monitor", serial_number: "SN-P2422-001",  status: "allocated",   condition: "good", purchased_at: "2023-02-14", notes: null,                    allocated_to: { id: 13, first_name: "Peter",  last_name: "Kamau",   department: "HR"          } },
  { id: 8,  asset_tag: "TNT-MON-002", name: "LG 27\" 27BN65Q",          device_type: "Monitor", serial_number: "SN-27BN65-001", status: "available",   condition: "good", purchased_at: "2023-07-19", notes: null,                    allocated_to: null },
  { id: 9,  asset_tag: "TNT-LAP-003", name: "Lenovo ThinkPad E15",       device_type: "Laptop",  serial_number: "SN-TPE15-003",  status: "retired",     condition: "poor", purchased_at: "2020-03-01", notes: "Battery dead, keyboard", allocated_to: null },
  { id: 10, asset_tag: "TNT-DES-003", name: "Dell OptiPlex 3080",        device_type: "Desktop", serial_number: "SN-OP3080-003", status: "available",   condition: "new",  purchased_at: "2024-02-28", notes: null,                    allocated_to: null },
];

const MOCK_STAFF: StaffMember[] = [
  { id: 10, first_name: "Grace",  last_name: "Mwangi",  department: "Budget"      },
  { id: 11, first_name: "James",  last_name: "Kariuki", department: "Procurement" },
  { id: 12, first_name: "Faith",  last_name: "Njoroge", department: "Debt Mgmt"   },
  { id: 13, first_name: "Peter",  last_name: "Kamau",   department: "HR"          },
  { id: 14, first_name: "Susan",  last_name: "Achieng", department: "Accounts"    },
  { id: 15, first_name: "David",  last_name: "Otieno",  department: "Legal"       },
];

// ── Config ────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  available:   { label: "Available",   color: "#166534", bg: "#F0FDF4" },
  allocated:   { label: "Allocated",   color: "#8B4513", bg: "#FDF6EE" },
  maintenance: { label: "Maintenance", color: "#B45309", bg: "#FFFBEB" },
  retired:     { label: "Retired",     color: "#7A5C44", bg: "#FDF8F2" },
};

const CONDITION_CONFIG = {
  new:  { label: "New",  color: "#166534" },
  good: { label: "Good", color: "#8B4513" },
  fair: { label: "Fair", color: "#B45309" },
  poor: { label: "Poor", color: "#B91C1C" },
};

const DEVICE_ICONS: Record<string, React.ElementType> = {
  Laptop:  Cpu,
  Desktop: Monitor,
  Printer: Printer,
  Monitor: Monitor,
  Other:   Package,
};

const DEVICE_TYPES = ["Laptop", "Desktop", "Printer", "Monitor", "Other"] as const;

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
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
  const [assets, setAssets]       = useState<Asset[]>(MOCK_ASSETS);
  const [staff, setStaff]         = useState<StaffMember[]>(MOCK_STAFF);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState("");
  const [typeFilter, setType]     = useState("all");
  const [statusFilter, setStatus] = useState("all");
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast]         = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Add/Edit modal
  const [editing, setEditing]     = useState<Asset | null>(null);
  const [adding, setAdding]       = useState(false);
  const [saving, setSaving]       = useState(false);
  const [form, setForm]           = useState<Partial<Asset>>({});

  // Delete modal
  const [deleting, setDeleting]   = useState<Asset | null>(null);
  const [savingDel, setSavingDel] = useState(false);

  // Allocate modal
  const [allocating, setAllocating]   = useState<Asset | null>(null);
  const [allocTarget, setAllocTarget] = useState<number | null>(null);
  const [savingAlloc, setSavingAlloc] = useState(false);

  const showToast = (msg: string, type: "success" | "error") => setToast({ msg, type });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, sRes] = await Promise.all([
        fetch(`${API}/assets/`,  { credentials: "include" }),
        fetch(`${API}/staff/`,   { credentials: "include" }),
      ]);
      if (aRes.ok) setAssets(await aRes.json());
      if (sRes.ok) setStaff(await sRes.json());
    } catch { /* keep mock */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { const load = async () => { await fetchAll(); }; load(); }, [fetchAll]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = assets.filter(a => {
    const q = search.toLowerCase();
    const matchQ = !q || a.asset_tag.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || (a.allocated_to ? `${a.allocated_to.first_name} ${a.allocated_to.last_name}`.toLowerCase().includes(q) : false);
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
    setForm({ device_type: "Laptop", status: "available", condition: "good" });
    setAdding(true);
  };

  const openEdit = (a: Asset) => { setForm({ ...a }); setEditing(a); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const isEdit = !!editing;
      const res = await fetch(isEdit ? `${API}/assets/${editing!.id}` : `${API}/assets/`, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).detail ?? "Failed to save");
      const saved: Asset = await res.json();
      if (isEdit) setAssets(prev => prev.map(a => a.id === saved.id ? saved : a));
      else setAssets(prev => [...prev, saved]);
      showToast(isEdit ? "Asset updated." : "Asset created.", "success");
    } catch (e: unknown) {
      // fallback for demo
      if (editing) {
        setAssets(prev => prev.map(a => a.id === editing.id ? { ...a, ...form } as Asset : a));
      } else {
        const mock: Asset = { id: Date.now(), asset_tag: form.asset_tag ?? "TNT-NEW", name: form.name ?? "New Asset", device_type: form.device_type ?? "Laptop", serial_number: form.serial_number ?? "", status: form.status ?? "available", condition: form.condition ?? "good", purchased_at: form.purchased_at ?? null, notes: form.notes ?? null, allocated_to: null };
        setAssets(prev => [...prev, mock]);
      }
      showToast(editing ? "Asset updated (offline)." : "Asset created (offline).", "success");
      if (e) { /* suppress */ }
    } finally {
      setSaving(false);
      setEditing(null);
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSavingDel(true);
    try {
      const res = await fetch(`${API}/assets/${deleting.id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error();
      setAssets(prev => prev.filter(a => a.id !== deleting.id));
      showToast("Asset deleted.", "success");
    } catch {
      setAssets(prev => prev.filter(a => a.id !== deleting.id));
      showToast("Asset deleted (offline).", "success");
    } finally {
      setSavingDel(false);
      setDeleting(null);
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
        body: JSON.stringify({ asset_id: allocating.id, staff_id: allocTarget }),
      });
      if (!res.ok) throw new Error((await res.json()).detail ?? "Allocation failed");
      const updated: Asset = await res.json();
      setAssets(prev => prev.map(a => a.id === allocating.id ? updated : a));
      showToast("Asset allocated successfully.", "success");
    } catch {
      const s = staff.find(x => x.id === allocTarget);
      setAssets(prev => prev.map(a => a.id === allocating.id ? { ...a, status: "allocated", allocated_to: s ? { id: s.id, first_name: s.first_name, last_name: s.last_name, department: s.department } : a.allocated_to } : a));
      showToast("Asset allocated (offline).", "success");
    } finally {
      setSavingAlloc(false);
      setAllocating(null);
      setAllocTarget(null);
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
            <button className="ast-refresh-btn" onClick={() => fetchAll()}><RefreshCw size={14} /> Refresh</button>
            <button className="ast-add-btn" onClick={openAdd}><Plus size={14} /> Add Asset</button>
          </div>
        </div>

        {/* Stats */}
        <div className="ast-stats">
          <div className="ast-stat"><div className="ast-stat-val">{assets.length}</div><div className="ast-stat-label">Total Assets</div></div>
          <div className="ast-stat gold"><div className="ast-stat-val">{assets.filter(a => a.status === "allocated").length}</div><div className="ast-stat-label">Allocated</div></div>
          <div className="ast-stat"><div className="ast-stat-val">{assets.filter(a => a.status === "available").length}</div><div className="ast-stat-label">Available</div></div>
          <div className="ast-stat red"><div className="ast-stat-val">{assets.filter(a => a.status === "maintenance").length}</div><div className="ast-stat-label">Maintenance</div></div>
          <div className="ast-stat"><div className="ast-stat-val">{assets.filter(a => a.status === "retired").length}</div><div className="ast-stat-label">Retired</div></div>
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
                      <span className="ast-util-label">{u.type}</span>
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
              {DEVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={13} />
          </div>
          <div className="ast-select-wrap">
            <select className="ast-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="allocated">Allocated</option>
              <option value="maintenance">Maintenance</option>
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
                            <span style={{ fontSize: "0.82rem" }}>{a.device_type}</span>
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
                                <div style={{ fontSize: "0.82rem", fontWeight: 500 }}>{a.allocated_to.first_name} {a.allocated_to.last_name}</div>
                                <div className="ast-sub">{a.allocated_to.department}</div>
                              </div>
                            : <span style={{ fontSize: "0.78rem", color: "#B91C1C", fontStyle: "italic" }}>Unallocated</span>
                          }
                        </td>
                        <td style={{ fontSize: "0.78rem", color: "var(--text-sub)" }}>{fmt(a.purchased_at)}</td>
                        <td>
                          <div className="ast-actions">
                            <button className="ast-btn-icon" title="Edit" onClick={() => openEdit(a)}><Edit2 size={13} /></button>
                            {a.status === "available" && (
                              <button className="ast-btn-icon" title="Allocate" onClick={() => { setAllocating(a); setAllocTarget(null); }}><UserCheck size={13} /></button>
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
                <input className="ast-form-input" placeholder="TNT-LAP-001" value={form.asset_tag ?? ""} onChange={e => setForm(f => ({ ...f, asset_tag: e.target.value }))} />
              </div>
              <div className="ast-form-field">
                <label>Serial Number</label>
                <input className="ast-form-input" placeholder="SN-XXXXX" value={form.serial_number ?? ""} onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))} />
              </div>
              <div className="ast-form-field full">
                <label>Name / Model *</label>
                <input className="ast-form-input" placeholder="Dell Latitude 5520" value={form.name ?? ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="ast-form-field">
                <label>Device Type</label>
                <select className="ast-form-input" value={form.device_type ?? "Laptop"} onChange={e => setForm(f => ({ ...f, device_type: e.target.value as Asset["device_type"] }))}>
                  {DEVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="ast-form-field">
                <label>Condition</label>
                <select className="ast-form-input" value={form.condition ?? "good"} onChange={e => setForm(f => ({ ...f, condition: e.target.value as Asset["condition"] }))}>
                  <option value="new">New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
              <div className="ast-form-field">
                <label>Status</label>
                <select className="ast-form-input" value={form.status ?? "available"} onChange={e => setForm(f => ({ ...f, status: e.target.value as Asset["status"] }))}>
                  <option value="available">Available</option>
                  <option value="allocated">Allocated</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              <div className="ast-form-field">
                <label>Purchase Date</label>
                <input className="ast-form-input" type="date" value={form.purchased_at ?? ""} onChange={e => setForm(f => ({ ...f, purchased_at: e.target.value }))} />
              </div>
              <div className="ast-form-field full">
                <label>Notes</label>
                <textarea className="ast-form-input" rows={2} placeholder="Any notes about this asset…" value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ resize: "none" }} />
              </div>
            </div>
            <div className="ast-modal-actions">
              <button className="ast-modal-cancel" onClick={() => { setAdding(false); setEditing(null); }}>Cancel</button>
              <button className="ast-modal-confirm" disabled={!form.asset_tag || !form.name || saving} onClick={handleSave}>
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
                    <div className="ast-staff-name">{s.first_name} {s.last_name}</div>
                    <div className="ast-staff-dept">{s.department}</div>
                  </div>
                  {allocTarget === s.id && <CheckCircle2 size={15} color="#6B2D0F" />}
                </div>
              ))}
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

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}