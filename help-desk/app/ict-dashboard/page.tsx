"use client";

import { useState, useEffect } from "react";

interface Ticket {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  assigned_to_id: number | null;
  staff_id: string;
}

interface IctUser {
  full_name: string;
  specialization?: string[];
}

const statusStyles: Record<string, string> = {
  IN_PROGRESS: "bg-amber-100 text-amber-800",
  OPEN: "bg-orange-100 text-orange-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-600",
};

type Filter = "All" | "OPEN" | "IN_PROGRESS";

export default function TechnicianDashboard() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [user, setUser] = useState<IctUser | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    (async () => {
      try {
        const [meRes, ticketsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/me`, { headers, credentials: "include" }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/`, { headers, credentials: "include" }),
        ]);
        if (meRes.ok) {
          const me = await meRes.json();
          const updated = {
            ...me,
            full_name: me.full_name || [me.first_name, me.last_name].filter(Boolean).join(" ") || user?.full_name || "ICT Personnel",
          };
          setUser(updated);
          localStorage.setItem("user", JSON.stringify({ ...JSON.parse(localStorage.getItem("user") ?? "{}"), full_name: updated.full_name }));
        }
        if (ticketsRes.ok) {
          const data = await ticketsRes.json();
          setTickets(Array.isArray(data) ? data : data.tickets ?? []);
        }
      } catch {}
    })();
  }, []);

  const fullName = user?.full_name ?? "ICT Personnel";
  const initials = fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const specializations = user?.specialization ?? [];

  const filtered = activeFilter === "All" ? tickets : tickets.filter((t) => t.status === activeFilter);

  const stats = [
    { label: "Assigned to Me", value: tickets.length },
    { label: "Open", value: tickets.filter((t) => t.status === "OPEN").length },
    { label: "In Progress", value: tickets.filter((t) => t.status === "IN_PROGRESS").length },
    { label: "Resolved", value: tickets.filter((t) => t.status === "RESOLVED").length },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F5F0E8" }}>

      {/* ── Top utility bar above brown card ── */}
      <div className="px-4 sm:px-6 pt-4 flex justify-end items-center gap-3">
        {/* Available badge */}
        <div
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
          style={{ backgroundColor: "#fff", color: "#4A2800", border: "1px solid #E8DDD0", boxShadow: "0 1px 3px rgba(90,30,0,0.08)", fontSize: "11px" }}
        >
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Available
        </div>

        {/* Bell */}
        <div
          className="relative cursor-pointer w-10 h-10 flex items-center justify-center rounded-full"
          style={{ backgroundColor: "#fff", border: "1px solid #E8DDD0", boxShadow: "0 1px 3px rgba(90,30,0,0.08)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7A3100" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400" />
        </div>

        {/* Divider */}
        <div style={{ width: "1px", height: "32px", backgroundColor: "#E8DDD0" }} />

        {/* Avatar + Name */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
            style={{
              background: "linear-gradient(135deg, #7A3100 0%, #C8922A 100%)",
              color: "#fff",
              boxShadow: "0 1px 4px rgba(90,30,0,0.18)",
            }}
          >
            {initials}
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-xs font-semibold" style={{ color: "#3D1000" }}>{fullName}</span>
            <span style={{ color: "#A07850", fontSize: "10px" }}>Technician</span>
          </div>
        </div>
      </div>

      {/* ── Brown Hero Card ── */}
      <div className="px-4 sm:px-6 pt-3">
        <div
          className="px-6 sm:px-10 py-8 sm:py-10 rounded-2xl"
          style={{
            background: "linear-gradient(135deg, #5C1E00 0%, #7A3100 50%, #8B4513 100%)",
          }}
        >
          <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase mb-1" style={{ color: "#C8922A" }}>
            Good Morning
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{fullName}</h1>
          <p className="text-sm sm:text-base mt-1" style={{ color: "#D4A96A" }}>
            Network &amp; Hardware Specialist
          </p>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 px-4 sm:px-6 py-5 flex flex-col gap-5">

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl px-5 py-4"
              style={{ backgroundColor: "#fff", border: "1px solid #E8DDD0", boxShadow: "0 1px 4px rgba(90,30,0,0.07)" }}
            >
              <p className="text-sm text-gray-500 mb-3">{s.label}</p>
              <p className="text-3xl sm:text-4xl font-bold leading-none" style={{ color: "#5C1E00" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Body: Tickets + Right Panel ── */}
        <div className="flex flex-col xl:flex-row gap-4">

          {/* Tickets Table */}
          <div
            className="flex-1 rounded-xl overflow-hidden min-w-0"
            style={{ backgroundColor: "#fff", border: "1px solid #E8DDD0", boxShadow: "0 1px 4px rgba(90,30,0,0.07)" }}
          >
            <div
              className="flex flex-wrap items-center justify-between px-5 py-4 gap-2"
              style={{ borderBottom: "1px solid #EDE5D8" }}
            >
              <span className="font-semibold text-base sm:text-lg" style={{ color: "#3D1000" }}>My Assigned Tickets</span>
              <div className="flex gap-1">
                {(["All", "OPEN", "IN_PROGRESS"] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                    style={
                      activeFilter === f
                        ? { backgroundColor: "#7A3100", color: "#fff" }
                        : { color: "#7A5C45", backgroundColor: "transparent" }
                    }
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm sm:text-base" style={{ tableLayout: "fixed", minWidth: "600px" }}>
                <colgroup>
                  <col style={{ width: "84px" }} />
                  <col style={{ width: "145px" }} />
                  <col style={{ width: "auto" }} />
                  <col style={{ width: "80px" }} />
                  <col style={{ width: "66px" }} />
                  <col style={{ width: "120px" }} />
                  <col style={{ width: "58px" }} />
                </colgroup>
                <thead>
                  <tr style={{ borderBottom: "1px solid #EDE5D8" }}>
                    {["Ticket ID", "Issue", "Date", "Status", "Action"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "#A07850" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="px-3 py-8 text-center text-sm" style={{ color: "#A07850" }}>No tickets found.</td></tr>
                  ) : filtered.map((t) => (
                    <tr
                      key={t.id}
                      className="transition-colors"
                      style={{ borderBottom: "1px solid #F5EEE4" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#FDF8F2")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td className="px-3 py-3.5 font-medium text-sm" style={{ color: "#7A3100" }}>TKT-{t.id}</td>
                      <td className="px-3 py-3.5">
                        <p className="text-sm" style={{ color: "#4A2800" }}>{t.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#A07850" }}>{t.category}</p>
                      </td>
                      <td className="px-3 py-3.5 text-xs" style={{ color: "#7A5C45" }}>
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusStyles[t.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {t.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <button className="text-sm font-semibold hover:underline" style={{ color: "#7A3100" }}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Panel */}
          <div className="xl:w-[240px] flex-shrink-0 flex flex-row xl:flex-col gap-3">

            {/* Recent Activity */}
            <div
              className="flex-1 xl:flex-none rounded-xl p-4 sm:p-5"
              style={{ backgroundColor: "#fff", border: "1px solid #E8DDD0", boxShadow: "0 1px 4px rgba(90,30,0,0.07)" }}
            >
              <h3 className="font-semibold text-base mb-4" style={{ color: "#3D1000" }}>Recent Activity</h3>
              <div className="flex flex-col gap-4">
                {tickets.slice(0, 4).map((t) => (
                  <div key={t.id} className="flex gap-3 items-start">
                    <div className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ border: "2px solid #C8922A" }}>
                      <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: "#C8922A" }} />
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: "#3D1000" }}>TKT-{t.id}</p>
                      <p className="text-sm mt-0.5" style={{ color: "#7A5C45" }}>{t.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#A07850" }}>{new Date(t.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specializations */}
            <div
              className="flex-1 xl:flex-none rounded-xl p-4 sm:p-5"
              style={{ backgroundColor: "#fff", border: "1px solid #E8DDD0", boxShadow: "0 1px 4px rgba(90,30,0,0.07)" }}
            >
              <h3 className="font-semibold text-base mb-4" style={{ color: "#3D1000" }}>My Specializations</h3>
              {specializations.length > 0 ? (
                <ul className="flex flex-col gap-2.5">
                  {specializations.map((s) => (
                    <li key={s} className="flex items-center gap-2.5 text-sm" style={{ color: "#4A2800" }}>
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#C8922A" }} />
                      {s}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm" style={{ color: "#A07850" }}>No specializations listed.</p>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}