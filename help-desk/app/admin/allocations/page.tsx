"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, ChevronDown, RefreshCw, Loader2, CheckCircle2,
  AlertCircle, X, UserCheck, RotateCcw, Plus,
} from "lucide-react";

// ── Types (matching backend schemas exactly) ───────────────────────────────────

type DeviceType = "laptop" | "desktop" | "printer" | "monitor" | "other";

interface AssetDetail {
  id: number;
  asset_tag: string;
  serial_number: string;
  device_type: DeviceType;
  brand: string;
  model: string;
}

interface StaffDetail {
  id: string; // UUID
  full_name: string;
  email: string;
  department: { id: number; name: string } | null;
}

// Raw shape from GET /assets/allocations (AssetAllocationResponse)
interface AllocationRaw {
  id: number;
  asset_id: number;
  staff_id: string; // UUID
  allocation_date: string; // date, "YYYY-MM-DD"
  return_date: string | null;
  notes: string | null;
}

// Enriched shape used by the UI after joining asset + staff
interface Allocation extends AllocationRaw {
  status: "active" | "returned";
  asset?: AssetDetail;
  staff?: StaffDetail;
}

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://ict-help-desk-neon.onrender.com";

const DEVICE_LABEL: Record<DeviceType, string> = {
  laptop: "Laptop",
  desktop: "Desktop",
  printer: "Printer",
  monitor: "Monitor",
  other: "Other",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(iso: string | null) {
  if (!iso) return "—";
  // handles both "YYYY-MM-DD" and full ISO datetimes
  return new Date(iso).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
}

function daysSince(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "1 day ago";
  return `${d} days ago`;
}

function toDateOnly(d: Date) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD for the `date` columns
}

function enrich(raw: AllocationRaw, assetMap: Map<number, AssetDetail>, staffMap: Map<string, StaffDetail>): Allocation {
  return {
    ...raw,
    status: raw.return_date === null ? "active" : "returned",
    asset: assetMap.get(raw.asset_id),
    staff: staffMap.get(raw.staff_id),
  };
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
export default function AdminAllocationsPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [assets, setAssets]           = useState<AssetDetail[]>([]);
  const [staffList, setStaffList]     = useState<StaffDetail[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatus]     = useState("all");
  const [typeFilter, setType]         = useState("all");
  const [toast, setToast]             = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [returning, setReturning]   = useState<Allocation | null>(null);
  const [returnNote, setReturnNote] = useState("");
  const [savingRet, setSavingRet]   = useState(false);

  const [selected, setSelected] = useState<Allocation | null>(null);

  // New allocation modal
  const [creating, setCreating]           = useState(false);
  const [createAssetId, setCreateAssetId] = useState<number | null>(null);
  const [createStaffId, setCreateStaffId] = useState<string | null>(null);
  const [createDate, setCreateDate]       = useState(toDateOnly(new Date()));
  const [createNotes, setCreateNotes]     = useState("");
  const [savingCreate, setSavingCreate]   = useState(false);

  const showToast = (msg: string, type: "success" | "error") => setToast({ msg, type });

  // ── Fetch (allocations + assets + staff, then join client-side) ────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allocRes, assetRes, staffRes] = await Promise.all([
        fetch(`${API}/assets/allocations`, { credentials: "include" }),
        fetch(`${API}/assets/`, { credentials: "include" }),
        fetch(`${API}/staff/`, { credentials: "include" }),
      ]);

      for (const [label, res] of [["allocations", allocRes], ["assets", assetRes], ["staff", staffRes]] as const) {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail ?? `Failed to load ${label} (${res.status})`);
        }
      }

      const allocData: AllocationRaw[] = await allocRes.json();
      const assetData: AssetDetail[] = await assetRes.json();
      const staffData: StaffDetail[] = await staffRes.json();

      setAssets(assetData);
      setStaffList(staffData);

      const assetMap = new Map(assetData.map(a => [a.id, a]));
      const staffMap = new Map(staffData.map(s => [s.id, s]));

      setAllocations(allocData.map(a => enrich(a, assetMap, staffMap)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load allocations.");
      setAllocations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional fetch-on-mount; setLoading/setError run before the await in fetchAll
    fetchAll();
  }, [fetchAll]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const deviceTypes = Array.from(new Set(allocations.map(a => a.asset?.device_type).filter(Boolean))) as DeviceType[];

  const filtered = allocations.filter(a => {
    const q = search.toLowerCase();
    const staffName = (a.staff?.full_name ?? "").toLowerCase();
    const matchQ = !q
      || (a.asset?.asset_tag ?? "").toLowerCase().includes(q)
      || (a.asset?.model ?? "").toLowerCase().includes(q)
      || staffName.includes(q)
      || (a.staff?.department?.name ?? "").toLowerCase().includes(q);
    const matchS = statusFilter === "all" || a.status === statusFilter;
    const matchT = typeFilter === "all" || a.asset?.device_type === typeFilter;
    return matchQ && matchS && matchT;
  });

  const activeCount   = allocations.filter(a => a.status === "active").length;
  const returnedCount = allocations.filter(a => a.status === "returned").length;

  const allocatedAssetIds = new Set(allocations.filter(a => a.status === "active").map(a => a.asset_id));
  const availableAssets = assets.filter(a => !allocatedAssetIds.has(a.id));

  // ── Return handler ─────────────────────────────────────────────────────────
  const handleReturn = async () => {
    if (!returning) return;
    setSavingRet(true);
    try {
      const res = await fetch(`${API}/assets/allocations/${returning.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          return_date: toDateOnly(new Date()),
          notes: returnNote || returning.notes,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `Error ${res.status}`);
      }
      const updatedRaw: AllocationRaw = await res.json();
      setAllocations(prev => prev.map(a =>
        a.id === returning.id
          ? { ...updatedRaw, status: updatedRaw.return_date === null ? "active" : "returned", asset: a.asset, staff: a.staff }
          : a
      ));
      showToast("Asset marked as returned.", "success");
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Failed to mark as returned.", "error");
    } finally {
      setSavingRet(false);
      setReturning(null);
      setReturnNote("");
      if (selected?.id === returning.id) setSelected(null);
    }
  };

  // ── Create (new allocation) handler ─────────────────────────────────────────
  const openCreate = () => {
    setCreateAssetId(null);
    setCreateStaffId(null);
    setCreateDate(toDateOnly(new Date()));
    setCreateNotes("");
    setCreating(true);
  };

  const handleCreate = async () => {
    if (!createAssetId || !createStaffId) return;
    setSavingCreate(true);
    try {
      const res = await fetch(`${API}/assets/allocate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          asset_id: createAssetId,
          staff_id: createStaffId,
          allocation_date: createDate,
          notes: createNotes || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `Error ${res.status}`);
      }
      showToast("Asset allocated successfully.", "success");
      setCreating(false);
      await fetchAll();
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Allocation failed.", "error");
    } finally {
      setSavingCreate(false);
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

        .alc-root { padding: 28px 32px; min-height: 100vh; background: var(--cream); font-family: 'Inter', system-ui, sans-serif; }

        .alc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
        .alc-header h1 { font-size: 1.35rem; font-weight: 700; color: var(--brown-dark); margin: 0 0 2px; }
        .alc-header p  { font-size: 0.82rem; color: var(--text-sub); margin: 0; }
        .alc-header-btns { display: flex; gap: 8px; }
        .alc-refresh-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: #fff; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.82rem; font-weight: 600; color: var(--brown-main); cursor: pointer; transition: all 0.15s; }
        .alc-refresh-btn:hover { border-color: var(--gold); color: var(--gold); }
        .alc-add-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: var(--brown-dark); border: none; border-radius: 8px; font-size: 0.84rem; font-weight: 600; color: #fff; cursor: pointer; transition: background 0.15s; }
        .alc-add-btn:hover { background: var(--brown-main); }

        .alc-error-banner { background: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 8px; padding: 10px 14px; color: #B91C1C; font-size: 0.84rem; display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }

        .alc-stats { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .alc-stat { background: #fff; border: 1.5px solid var(--border); border-radius: 8px; padding: 10px 18px; flex: 1; min-width: 110px; }
        .alc-stat-val { font-size: 1.4rem; font-weight: 800; color: var(--brown-dark); }
        .alc-stat-label { font-size: 0.72rem; color: var(--text-sub); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
        .alc-stat.gold .alc-stat-val { color: var(--brown-mid); }
        .alc-stat.green .alc-stat-val { color: #166534; }

        .alc-filters { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
        .alc-search-wrap { position: relative; flex: 1; min-width: 220px; }
        .alc-search-wrap svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--text-sub); }
        .alc-search { width: 100%; padding: 9px 12px 9px 34px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.84rem; color: var(--text-main); background: #fff; outline: none; }
        .alc-search:focus { border-color: var(--gold); }
        .alc-select-wrap { position: relative; }
        .alc-select-wrap svg { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-sub); }
        .alc-select { appearance: none; padding: 9px 30px 9px 12px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.84rem; color: var(--text-main); background: #fff; cursor: pointer; outline: none; }
        .alc-select:focus { border-color: var(--gold); }

        .alc-table-wrap { background: #fff; border: 1.5px solid var(--border); border-radius: 12px; overflow: hidden; }
        .alc-table { width: 100%; border-collapse: collapse; }
        .alc-table th { padding: 10px 16px; text-align: left; font-size: 0.71rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--text-sub); background: var(--cream); border-bottom: 1px solid var(--border); white-space: nowrap; }
        .alc-table td { padding: 12px 16px; font-size: 0.84rem; color: var(--text-main); border-bottom: 1px solid var(--border); vertical-align: middle; }
        .alc-table tr:last-child td { border-bottom: none; }
        .alc-table tr:hover td { background: #FDF4EB; cursor: pointer; }
        .alc-tag { font-weight: 700; color: var(--brown-main); font-size: 0.78rem; }
        .alc-sub { font-size: 0.73rem; color: var(--text-sub); margin-top: 2px; }
        .alc-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; white-space: nowrap; }
        .alc-actions { display: flex; gap: 5px; }
        .alc-btn-icon { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: 1.5px solid var(--border); background: #fff; cursor: pointer; color: var(--text-sub); transition: all 0.15s; }
        .alc-btn-icon:hover { border-color: var(--gold); color: var(--brown-mid); background: #FDF6EE; }
        .alc-empty { padding: 40px; text-align: center; color: var(--text-sub); font-size: 0.86rem; }
        .alc-loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 60px; color: var(--text-sub); }

        .alc-overlay { position: fixed; inset: 0; background: rgba(74,30,10,0.35); z-index: 100; display: flex; justify-content: flex-end; }
        .alc-drawer { width: 440px; max-width: 95vw; height: 100%; background: #fff; display: flex; flex-direction: column; overflow: hidden; animation: slideIn 0.2s ease; }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .alc-drawer-header { padding: 20px 24px; display: flex; align-items: flex-start; justify-content: space-between; background: var(--brown-dark); border-bottom: 3px solid var(--gold); }
        .alc-drawer-header h2 { font-size: 0.98rem; font-weight: 700; color: #fff; margin: 0 0 3px; }
        .alc-drawer-header p  { font-size: 0.76rem; color: rgba(255,255,255,0.65); margin: 0; }
        .alc-close-btn { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 6px; border: 1.5px solid rgba(255,255,255,0.25); background: transparent; cursor: pointer; color: #fff; flex-shrink: 0; }
        .alc-close-btn:hover { background: rgba(255,255,255,0.15); }
        .alc-drawer-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; background: var(--cream); }
        .alc-detail-card { background: #fff; border: 1.5px solid var(--border); border-radius: 10px; padding: 14px; }
        .alc-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .alc-detail-item label { font-size: 0.71rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--gold); display: block; margin-bottom: 3px; }
        .alc-detail-item span  { font-size: 0.85rem; color: var(--brown-dark); font-weight: 600; }
        .alc-section-lbl { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--brown-mid); margin-bottom: 6px; border-left: 3px solid var(--gold); padding-left: 8px; }

        .alc-modal-overlay { position: fixed; inset: 0; background: rgba(74,30,10,0.4); z-index: 200; display: flex; align-items: center; justify-content: center; }
        .alc-modal { background: #fff; border-radius: 14px; width: 400px; max-width: 95vw; max-height: 90vh; overflow-y: auto; padding: 24px; animation: fadeUp 0.2s ease; border-top: 4px solid var(--brown-main); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .alc-modal h3 { font-size: 1rem; font-weight: 700; color: var(--brown-dark); margin: 0 0 4px; }
        .alc-modal p  { font-size: 0.81rem; color: var(--text-sub); margin: 0 0 14px; }
        .alc-modal-input { width: 100%; padding: 9px 12px; border: 1.5px solid var(--border); border-radius: 8px; font-size: 0.84rem; color: var(--text-main); background: #fff; outline: none; font-family: inherit; resize: none; margin-bottom: 16px; box-sizing: border-box; }
        .alc-modal-input:focus { border-color: var(--gold); }
        .alc-modal-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
        .alc-modal-field label { font-size: 0.71rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--gold); }
        .alc-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
        .alc-modal-cancel { padding: 8px 18px; border: 1.5px solid var(--border); background: #fff; border-radius: 8px; font-size: 0.84rem; font-weight: 600; color: var(--text-sub); cursor: pointer; }
        .alc-modal-confirm { padding: 8px 18px; background: var(--brown-dark); color: #fff; border: none; border-radius: 8px; font-size: 0.84rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .alc-modal-confirm:hover:not(:disabled) { background: var(--gold); }
        .alc-modal-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 768px) {
          .alc-root { padding: 16px; }
          .alc-drawer { width: 100%; }
        }
      `}</style>

      <div className="alc-root">
        <div className="alc-header">
          <div>
            <h1>Allocations</h1>
            <p>Track device assignments and returns</p>
          </div>
          <div className="alc-header-btns">
            <button className="alc-refresh-btn" onClick={() => fetchAll()}><RefreshCw size={14} /> Refresh</button>
            <button className="alc-add-btn" onClick={openCreate}><Plus size={14} /> New Allocation</button>
          </div>
        </div>

        {error && (
          <div className="alc-error-banner">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <div className="alc-stats">
          <div className="alc-stat"><div className="alc-stat-val">{allocations.length}</div><div className="alc-stat-label">Total</div></div>
          <div className="alc-stat gold"><div className="alc-stat-val">{activeCount}</div><div className="alc-stat-label">Active</div></div>
          <div className="alc-stat green"><div className="alc-stat-val">{returnedCount}</div><div className="alc-stat-label">Returned</div></div>
        </div>

        <div className="alc-filters">
          <div className="alc-search-wrap">
            <Search size={14} />
            <input className="alc-search" placeholder="Search by tag, model, staff or department…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="alc-select-wrap">
            <select className="alc-select" value={statusFilter} onChange={e => setStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="returned">Returned</option>
            </select>
            <ChevronDown size={13} />
          </div>
          <div className="alc-select-wrap">
            <select className="alc-select" value={typeFilter} onChange={e => setType(e.target.value)}>
              <option value="all">All Types</option>
              {deviceTypes.map(t => <option key={t} value={t}>{DEVICE_LABEL[t]}</option>)}
            </select>
            <ChevronDown size={13} />
          </div>
        </div>

        <div className="alc-table-wrap">
          {loading
            ? <div className="alc-loading"><Loader2 size={18} /> Loading…</div>
            : filtered.length === 0
            ? <div className="alc-empty">No allocations match your filters.</div>
            : (
              <table className="alc-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Type</th>
                    <th>Allocated To</th>
                    <th>Department</th>
                    <th>Allocated On</th>
                    <th>Returned On</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id} onClick={() => setSelected(a)}>
                      <td>
                        <div className="alc-tag">{a.asset?.asset_tag ?? `#${a.asset_id}`}</div>
                        <div className="alc-sub">{a.asset ? `${a.asset.brand} ${a.asset.model}` : "Unknown Asset"}</div>
                      </td>
                      <td style={{ fontSize: "0.82rem" }}>{a.asset ? DEVICE_LABEL[a.asset.device_type] : "—"}</td>
                      <td>
                        <div style={{ fontSize: "0.83rem", fontWeight: 500 }}>{a.staff?.full_name ?? "Unknown Staff"}</div>
                        <div className="alc-sub">{a.staff?.email ?? "—"}</div>
                      </td>
                      <td style={{ fontSize: "0.82rem" }}>{a.staff?.department?.name ?? "—"}</td>
                      <td>
                        <div style={{ fontSize: "0.82rem" }}>{fmt(a.allocation_date)}</div>
                        <div className="alc-sub">{daysSince(a.allocation_date)}</div>
                      </td>
                      <td style={{ fontSize: "0.82rem", color: a.return_date ? "#166534" : "var(--text-sub)" }}>
                        {fmt(a.return_date)}
                      </td>
                      <td>
                        <span className="alc-badge" style={{
                          color: a.status === "active" ? "#8B4513" : "#166534",
                          background: a.status === "active" ? "#FDF6EE" : "#F0FDF4",
                        }}>
                          {a.status === "active" ? <UserCheck size={11} /> : <CheckCircle2 size={11} />}
                          {a.status === "active" ? "Active" : "Returned"}
                        </span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="alc-actions">
                          {a.status === "active" && (
                            <button className="alc-btn-icon" title="Mark as returned" onClick={() => { setReturning(a); setReturnNote(""); }}>
                              <RotateCcw size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      </div>

      {selected && (
        <div className="alc-overlay" onClick={() => setSelected(null)}>
          <div className="alc-drawer" onClick={e => e.stopPropagation()}>
            <div className="alc-drawer-header">
              <div>
                <h2>{selected.asset?.asset_tag ?? `#${selected.asset_id}`} — {selected.asset ? `${selected.asset.brand} ${selected.asset.model}` : "Unknown Asset"}</h2>
                <p>Allocated to {selected.staff?.full_name ?? "Unknown Staff"}</p>
              </div>
              <button className="alc-close-btn" onClick={() => setSelected(null)}><X size={15} /></button>
            </div>
            <div className="alc-drawer-body">
              <div>
                <div className="alc-section-lbl">Asset</div>
                <div className="alc-detail-card">
                  <div className="alc-detail-grid">
                    <div className="alc-detail-item"><label>Tag</label><span>{selected.asset?.asset_tag ?? "—"}</span></div>
                    <div className="alc-detail-item"><label>Type</label><span>{selected.asset ? DEVICE_LABEL[selected.asset.device_type] : "—"}</span></div>
                    <div className="alc-detail-item" style={{ gridColumn: "1/-1" }}><label>Model</label><span>{selected.asset ? `${selected.asset.brand} ${selected.asset.model}` : "—"}</span></div>
                  </div>
                </div>
              </div>

              <div>
                <div className="alc-section-lbl">Staff Member</div>
                <div className="alc-detail-card">
                  <div className="alc-detail-grid">
                    <div className="alc-detail-item"><label>Name</label><span>{selected.staff?.full_name ?? "—"}</span></div>
                    <div className="alc-detail-item"><label>Department</label><span>{selected.staff?.department?.name ?? "—"}</span></div>
                    <div className="alc-detail-item" style={{ gridColumn: "1/-1" }}><label>Email</label><span>{selected.staff?.email ?? "—"}</span></div>
                  </div>
                </div>
              </div>

              <div>
                <div className="alc-section-lbl">Allocation Details</div>
                <div className="alc-detail-card">
                  <div className="alc-detail-grid">
                    <div className="alc-detail-item"><label>Allocated On</label><span>{fmt(selected.allocation_date)}</span></div>
                    <div className="alc-detail-item"><label>Returned On</label><span>{fmt(selected.return_date)}</span></div>
                    <div className="alc-detail-item"><label>Status</label>
                      <span className="alc-badge" style={{ color: selected.status === "active" ? "#8B4513" : "#166534", background: selected.status === "active" ? "#FDF6EE" : "#F0FDF4" }}>
                        {selected.status === "active" ? "Active" : "Returned"}
                      </span>
                    </div>
                    {selected.notes && (
                      <div className="alc-detail-item" style={{ gridColumn: "1/-1" }}><label>Notes</label><span>{selected.notes}</span></div>
                    )}
                  </div>
                </div>
              </div>

              {selected.status === "active" && (
                <button
                  style={{ padding: "10px 14px", background: "var(--brown-dark)", color: "#fff", border: "none", borderRadius: 8, fontSize: "0.84rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, width: "100%", justifyContent: "center" }}
                  onClick={() => { setReturning(selected); setReturnNote(""); }}
                >
                  <RotateCcw size={14} /> Mark as Returned
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {returning && (
        <div className="alc-modal-overlay" onClick={() => setReturning(null)}>
          <div className="alc-modal" onClick={e => e.stopPropagation()}>
            <h3>Mark as Returned</h3>
            <p><strong>{returning.asset?.asset_tag ?? `#${returning.asset_id}`}</strong> from {returning.staff?.full_name ?? "Unknown Staff"}</p>
            <textarea
              className="alc-modal-input"
              rows={3}
              placeholder="Optional note (e.g. condition on return, reason)…"
              value={returnNote}
              onChange={e => setReturnNote(e.target.value)}
            />
            <div className="alc-modal-actions">
              <button className="alc-modal-cancel" onClick={() => setReturning(null)}>Cancel</button>
              <button className="alc-modal-confirm" disabled={savingRet} onClick={handleReturn}>
                {savingRet ? <Loader2 size={13} /> : <RotateCcw size={13} />} Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}

      {creating && (
        <div className="alc-modal-overlay" onClick={() => setCreating(false)}>
          <div className="alc-modal" onClick={e => e.stopPropagation()}>
            <h3>New Allocation</h3>
            <p>Assign a device to a staff member</p>

            <div className="alc-modal-field">
              <label>Asset</label>
              <select className="alc-modal-input" style={{ marginBottom: 0 }} value={createAssetId ?? ""} onChange={e => setCreateAssetId(e.target.value ? Number(e.target.value) : null)}>
                <option value="">Select an available asset…</option>
                {availableAssets.map(a => (
                  <option key={a.id} value={a.id}>{a.asset_tag} — {a.brand} {a.model}</option>
                ))}
              </select>
            </div>

            <div className="alc-modal-field">
              <label>Staff Member</label>
              <select className="alc-modal-input" style={{ marginBottom: 0 }} value={createStaffId ?? ""} onChange={e => setCreateStaffId(e.target.value || null)}>
                <option value="">Select staff…</option>
                {staffList.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name} — {s.department?.name ?? "No dept"}</option>
                ))}
              </select>
            </div>

            <div className="alc-modal-field">
              <label>Allocation Date</label>
              <input className="alc-modal-input" style={{ marginBottom: 0 }} type="date" value={createDate} onChange={e => setCreateDate(e.target.value)} />
            </div>

            <textarea
              className="alc-modal-input"
              rows={2}
              placeholder="Optional note…"
              value={createNotes}
              onChange={e => setCreateNotes(e.target.value)}
            />

            <div className="alc-modal-actions">
              <button className="alc-modal-cancel" onClick={() => setCreating(false)}>Cancel</button>
              <button className="alc-modal-confirm" disabled={!createAssetId || !createStaffId || savingCreate} onClick={handleCreate}>
                {savingCreate ? <Loader2 size={13} /> : <UserCheck size={13} />} Allocate
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}