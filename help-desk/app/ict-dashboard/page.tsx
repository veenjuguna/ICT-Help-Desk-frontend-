"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AssignedTicketTable from "@/components/ICT/assigned-ticket-table";

type TicketStatus = "open" | "in_progress" | "closed";

interface Ticket {
  id: number;
  title: string;
  description: string;
  category: string;
  status: TicketStatus;
  created_at: string;
  closed_at: string | null;
  comment: string | null;
  staff_id: string;
  assigned_to_id: number;
  raised_by?: string;
}

interface AuditLog {
  id: number;
  action: string;
  table_name: string;
  record_id: string | null;
  created_at: string;
}

interface StaffProfile {
  id: string;
  full_name: string;
  role: string;
}

interface IctProfile {
  id: number;
  staff_id: string;
  specialization: string | null;
  phone_extension: string | null;
  availability: string;
  is_active: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "GOOD MORNING";
  if (hour < 18) return "GOOD AFTERNOON";
  return "GOOD EVENING";
}

const specializationLabel: Record<string, string> = {
  hardware:             "Hardware",
  networking:           "Networking",
  software_and_systems: "Software & Systems",
  security:             "Security",
  other:                "Other",
};

type Filter = "All" | "open" | "in_progress";

// ── Setup Modal — first time only, no edit mode ───────────────
// Once specialization is set the modal never shows again.
// Changes to specialization must go through admin via PATCH /ict-personnel/{id}.
function SetupModal({
  onComplete,
}: {
  onComplete: (profile: IctProfile) => void;
}) {
  const [specialization, setSpecialization] = useState("");
  const [phoneExtension, setPhoneExtension] = useState("");
  const [submitting, setSubmitting]         = useState(false);
  const [error, setError]                   = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL;

  const SPECIALIZATIONS = [
    { value: "hardware",             label: "Hardware" },
    { value: "networking",           label: "Networking" },
    { value: "software_and_systems", label: "Software & Systems" },
    { value: "security",             label: "Security" },
    { value: "other",                label: "Other" },
  ];

  async function handleSubmit() {
    if (!specialization) {
      setError("Please select a specialization.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API}/ict-personnel/me/setup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          specialization,
          phone_extension: phoneExtension || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail ?? "Setup failed.");
      }
      const profile: IctProfile = await res.json();
      onComplete(profile);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-8">

        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
          style={{ background: "linear-gradient(135deg, #7A3100, #C8922A)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"
               viewBox="0 0 24 24" fill="none" stroke="white"
               strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-1">
          Complete Your Profile
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Select your specialization so the system can assign you the right
          tickets. This can only be set once — contact admin to change it.
        </p>

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Specialization <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 gap-2 mb-5">
          {SPECIALIZATIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSpecialization(s.value)}
              className={`px-4 py-2.5 rounded-lg border text-sm font-medium text-left transition-all ${
                specialization === s.value
                  ? "text-white border-transparent"
                  : "bg-white border-gray-200 text-gray-700 hover:border-amber-300"
              }`}
              style={
                specialization === s.value
                  ? { backgroundColor: "#7A3100", borderColor: "#7A3100" }
                  : {}
              }
            >
              {s.label}
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Extension <span className="text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          value={phoneExtension}
          onChange={(e) => setPhoneExtension(e.target.value)}
          placeholder="e.g. 4201"
          maxLength={10}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm
                     focus:outline-none focus:ring-2 mb-5"
          style={{ focusRingColor: "#7A3100" } as any}
        />

        {error && (
          <p className="text-sm text-red-600 mb-4">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 rounded-lg text-white font-semibold text-sm
                     transition-opacity disabled:opacity-60"
          style={{ backgroundColor: "#7A3100" }}
        >
          {submitting ? "Saving..." : "Complete Setup"}
        </button>
      </div>
    </div>
  );
}

export default function TechnicianDashboard() {
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [staff, setStaff]               = useState<StaffProfile | null>(null);
  const [ictProfile, setIctProfile]     = useState<IctProfile | null>(null);
  const [tickets, setTickets]           = useState<Ticket[]>([]);
  const [audit, setAudit]               = useState<AuditLog[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showSetup, setShowSetup]       = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    (async () => {
      try {
        const [staffRes, ticketRes, auditRes, ictRes] = await Promise.all([
          fetch(`${API}/staff/me`,         { credentials: "include" }),
          fetch(`${API}/tickets/`,         { credentials: "include" }),
          fetch(`${API}/audit?limit=5`,    { credentials: "include" }),
          fetch(`${API}/ict-personnel/me`, { credentials: "include" }),
        ]);

        if (staffRes.ok) setStaff(await staffRes.json());
        if (auditRes.ok) setAudit(await auditRes.json());

        if (ticketRes.ok) {
          const rawTickets: Ticket[] = await ticketRes.json();
          const enriched = await Promise.all(
            rawTickets.map(async (t) => {
              try {
                const sRes = await fetch(`${API}/staff/${t.staff_id}/basic`, {
                  credentials: "include",
                });
                const raised_by = sRes.ok
                  ? (await sRes.json()).full_name
                  : "—";
                return { ...t, raised_by };
              } catch {
                return { ...t, raised_by: "—" };
              }
            })
          );
          setTickets(enriched);
        }

        if (ictRes.ok) {
          const myProfile: IctProfile = await ictRes.json();
          setIctProfile(myProfile);
          // Only show setup if specialization has never been set
          if (!myProfile.specialization) setShowSetup(true);
        } else {
          // 404 — no profile exists yet, show setup
          setShowSetup(true);
        }
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [API]);

  // Called by SetupModal on successful completion.
  // Updates local state and permanently dismisses the modal.
  function handleSetupComplete(profile: IctProfile) {
    setIctProfile(profile);
    setShowSetup(false);
    // showSetup will never be set to true again for this session
    // since profile.specialization is now set and the useEffect guard won't re-trigger
  }

  const fullName = staff?.full_name ?? "Loading...";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const specialization = ictProfile?.specialization
    ? specializationLabel[ictProfile.specialization] ?? ictProfile.specialization
    : null;

  const assignedCount   = tickets.length;
  const completedToday  = tickets.filter((t) => {
    if (t.status !== "closed" || !t.closed_at) return false;
    return new Date(t.closed_at).toDateString() === new Date().toDateString();
  }).length;
  const openCount       = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;

  const fifoTicket = tickets
    .filter((t) => t.status === "open" || t.status === "in_progress")
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];

  const filtered =
    activeFilter === "All"
      ? tickets
      : tickets.filter((t) => t.status === activeFilter);

  return (
    <>
      {/* Setup modal — only renders when showSetup is true */}
      {showSetup && (
        <SetupModal onComplete={handleSetupComplete} />
      )}

      <div className={`min-h-screen bg-gray-100 flex flex-col ${showSetup ? "pointer-events-none select-none" : ""}`}>

        {/* ── Top Bar ── */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 ml-auto">
            <div
              className="relative cursor-pointer w-10 h-10 flex items-center justify-center rounded-full"
              style={{ backgroundColor: "#fff", border: "1px solid #E8DDD0", boxShadow: "0 1px 3px rgba(90,30,0,0.08)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                   viewBox="0 0 24 24" fill="none" stroke="#7A3100"
                   strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400" />
            </div>

            <div
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "#7A3100", color: "#fff",
                display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 13,
                fontWeight: 700, border: "2px solid #C8962E",
              }}
            >
              {initials}
            </div>
          </div>
        </div>

        {/* ── Hero Card ── */}
        <div className="px-4 sm:px-6 pt-3">
          <div
            className="px-6 sm:px-10 py-8 sm:py-10 rounded-2xl"
            style={{ background: "linear-gradient(135deg, #5C1E00 0%, #7A3100 50%, #8B4513 100%)" }}
          >
            <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase mb-1"
               style={{ color: "#C8922A" }}>
              {getGreeting()}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{fullName}</h1>
            <p className="text-sm sm:text-base mt-1" style={{ color: "#D4A96A" }}>
              {specialization ?? "Complete your profile to get started"}
            </p>

            {ictProfile?.availability && (
              <span
                className="mt-3 inline-block px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor:
                    ictProfile.availability === "available" ? "rgba(34,197,94,0.2)"  :
                    ictProfile.availability === "busy"      ? "rgba(249,115,22,0.2)" :
                    "rgba(107,114,128,0.2)",
                  color:
                    ictProfile.availability === "available" ? "#86efac" :
                    ictProfile.availability === "busy"      ? "#fdba74" :
                    "#d1d5db",
                }}
              >
                {ictProfile.availability}
              </span>
            )}

            {fifoTicket && (
              <div
                className="mt-4 px-4 py-2 rounded-lg inline-flex items-center gap-2"
                style={{ backgroundColor: "rgba(200,146,42,0.18)", border: "1px solid #C8922A" }}
              >
                <span style={{ color: "#C8922A", fontSize: 13, fontWeight: 600 }}>
                  ↑ Next up: #{fifoTicket.id} — {fifoTicket.title}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Main Content ── */}
        <main className="flex-1 px-4 sm:px-6 py-5 flex flex-col gap-5">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Assigned to Me",  value: loading ? "—" : String(assignedCount)   },
              { label: "Completed Today", value: loading ? "—" : String(completedToday)  },
              { label: "Open",            value: loading ? "—" : String(openCount)        },
              { label: "In Progress",     value: loading ? "—" : String(inProgressCount) },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl px-5 py-4"
                style={{ backgroundColor: "#fff", border: "1px solid #E8DDD0", boxShadow: "0 1px 4px rgba(90,30,0,0.07)" }}
              >
                <p className="text-sm sm:text-base text-gray-500">{s.label}</p>
                <p className="text-3xl sm:text-4xl font-semibold text-gray-800 leading-none">
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Body */}
          <div className="flex flex-col xl:flex-row gap-4">

            {/* Tickets Table */}
            <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
              <div className="flex gap-2 px-4 pt-4 pb-2 border-b border-gray-100">
                {(["All", "open", "in_progress"] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      activeFilter === f
                        ? "text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                    style={activeFilter === f ? { backgroundColor: "#7A3100" } : {}}
                  >
                    {f === "All" ? "All" : f === "open" ? "Open" : "In Progress"}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="p-8 text-center text-gray-400 text-sm">Loading tickets...</div>
              ) : !ictProfile?.is_active ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  Complete your profile setup to start receiving tickets.
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No tickets found.</div>
              ) : (
                <AssignedTicketTable
                  tickets={filtered}
                  fifoTicketId={fifoTicket?.id}
                />
              )}
            </div>

            {/* Right Panel */}
            <div className="xl:w-[240px] flex-shrink-0 flex flex-row xl:flex-col gap-3">

              {/* Recent Activity */}
              <div className="flex-1 xl:flex-none bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
                <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-4">
                  Recent Activity
                </h3>
                {loading ? (
                  <p className="text-sm text-gray-400">Loading...</p>
                ) : audit.length === 0 ? (
                  <p className="text-sm text-gray-400">No recent activity.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {audit.map((a) => (
                      <div key={a.id} className="flex gap-3 items-start">
                        <div
                          className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ border: "2px solid #C8922A" }}
                        >
                          <span className="w-2 h-2 rounded-full block"
                                style={{ backgroundColor: "#C8922A" }} />
                        </div>
                        <div>
                          <p className="font-medium text-sm" style={{ color: "#3D1000" }}>
                            {a.action.replace(/_/g, " ")}
                            {a.record_id ? ` #${a.record_id}` : ""}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {timeAgo(a.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* My Specialization — read only, no edit button */}
              <div className="flex-1 xl:flex-none bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
                <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-4">
                  My Specialization
                </h3>
                {specialization ? (
                  <>
                    <span
                      className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: "#7A3100" }}
                    >
                      {specialization}
                    </span>
                    <p className="text-xs text-gray-400 mt-3">
                      You only receive tickets matching your specialization.
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                      Contact admin to change your specialization.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-400 mb-3">Not set yet.</p>
                    <button
                      onClick={() => setShowSetup(true)}
                      className="text-xs font-medium underline"
                      style={{ color: "#7A3100" }}
                    >
                      Complete setup
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}