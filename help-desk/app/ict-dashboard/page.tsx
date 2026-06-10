//ict dashboard
"use client";

import AssignedTicketTable from "@/components/ICT/assigned-ticket-table";
import { useState, useEffect } from "react";
const tickets = [
  {
    id: "TKT-001",
    employee: "John Kamau",
    department: "ICT Services",
    issue: "Laptop not connecting to WiFi network",
    category: "Network",
    priority: "High",
    time: "2h 15m",
    status: "In Progress",
  },
  {
    id: "TKT-008",
    employee: "Mary Wanjiku",
    department: "Accounting",
    issue: "Desktop computer won't boot up",
    category: "Hardware",
    priority: "High",
    time: "45m",
    status: "Open",
  },
  {
    id: "TKT-012",
    employee: "Peter Maina",
    department: "HR",
    issue: "Network printer offline error",
    category: "Network",
    priority: "Medium",
    time: "1h 30m",
    status: "In Progress",
  },
  {
    id: "TKT-015",
    employee: "Grace Akinyi",
    department: "Procurement",
    issue: "Cannot access network shared drive",
    category: "Network",
    priority: "High",
    time: "30m",
    status: "Open",
  },
  {
    id: "TKT-018",
    employee: "James Njoroge",
    department: "Budget & Finance",
    issue: "Keyboard keys not working properly",
    category: "Hardware",
    priority: "Low",
    time: "3h",
    status: "Pending Parts",
  },
  {
    id: "TKT-020",
    employee: "Sarah Mutua",
    department: "Planning",
    issue: "Monitor display flickering",
    category: "Hardware",
    priority: "Medium",
    time: "2h 30m",
    status: "In Progress",
  },
];

const recentActivity = [
  {
    id: "TKT-005",
    action: "Resolved",
    description: "WiFi connectivity issue",
    time: "10 min ago",
  },
  {
    id: "TKT-009",
    action: "Updated",
    description: "Ordered replacement keyboard",
    time: "25 min ago",
  },
  {
    id: "TKT-011",
    action: "Resolved",
    description: "Printer paper jam fixed",
    time: "1 hour ago",
  },
  {
    id: "TKT-014",
    action: "Resolved",
    description: "Network cable replaced",
    time: "2 hours ago",
  },
];

const specializations = [
  "Network Infrastructure",
  "Hardware Repair",
  "WiFi & Connectivity",
  "Printer Setup",
];

const statusStyles: Record<string, string> = {
<<<<<<< HEAD
  "In Progress": "bg-amber-100 text-amber-800",
  "Open": "bg-orange-100 text-orange-800",
=======
  "In Progress": "bg-blue-100 text-blue-800",
  Open: "bg-amber-100 text-amber-800",
>>>>>>> 826944835cf46feb0cfa3fe804dbf4e64eb36fc7
  "Pending Parts": "bg-yellow-100 text-yellow-800",
};

const priorityStyles: Record<string, string> = {
  High: "text-red-700 font-medium",
  Medium: "text-amber-700 font-medium",
  Low: "text-green-700 font-medium",
};

type Filter = "All" | "Open" | "In Progress";

export default function TechnicianDashboard() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [user, setUser] = useState<{
    full_name: string;
    specialization?: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/me`, {
          credentials: "include",
        });
        if (res.ok) setUser(await res.json());
      } catch {}
    })();
  }, []);

  const fullName = user?.full_name ?? "Loading...";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  const filtered =
    activeFilter === "All"
      ? tickets
      : tickets.filter((t) =>
          activeFilter === "In Progress"
            ? t.status === "In Progress"
            : t.status === "Open",
        );

  return (
<<<<<<< HEAD
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
=======
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ── Top Bar ── */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Good Morning, {fullName}
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1">
            ✦ Network &amp; Hardware Specialist
          </p>
>>>>>>> 826944835cf46feb0cfa3fe804dbf4e64eb36fc7
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
            DO
          </div>
<<<<<<< HEAD
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-xs font-semibold" style={{ color: "#3D1000" }}>David Ochieng</span>
            <span style={{ color: "#A07850", fontSize: "10px" }}>Technician</span>
=======
          <div className="relative cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="white"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
>>>>>>> 826944835cf46feb0cfa3fe804dbf4e64eb36fc7
          </div>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#7A3100",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 700,
              border: "2px solid #C8962E",
            }}
          >
            {initials}
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
            GOOD MORNING
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">David Ochieng</h1>
          <p className="text-sm sm:text-base mt-1" style={{ color: "#D4A96A" }}>
            Network &amp; Hardware Specialist
          </p>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 px-4 sm:px-6 py-5 flex flex-col gap-5">
<<<<<<< HEAD

        {/* ── Stats Grid ── */}
=======
        {/* ── Stats Grid: 1 col mobile, 2 col sm, 4 col lg ── */}
>>>>>>> 826944835cf46feb0cfa3fe804dbf4e64eb36fc7
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Assigned to Me", value: "8", icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8922A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            )},
            { label: "Completed Today", value: "5", icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8922A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            )},
            { label: "Pending Review", value: "3", icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8922A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            )},
            { label: "Avg Response Time", value: "15 min", icon: (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8922A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
              </svg>
            )},
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl px-5 py-4"
              style={{ backgroundColor: "#fff", border: "1px solid #E8DDD0", boxShadow: "0 1px 4px rgba(90,30,0,0.07)" }}
            >
              <div className="flex items-center justify-between mb-3">
<<<<<<< HEAD
                <span className="text-sm text-gray-500">{s.label}</span>
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "#FDF3E3" }}
                >
                  {s.icon}
                </span>
              </div>
              <p className="text-3xl sm:text-4xl font-bold leading-none" style={{ color: "#5C1E00" }}>{s.value}</p>
=======
                <span className="text-sm sm:text-base text-gray-500">
                  {s.label}
                </span>
                <span className="text-gray-400 text-base">{s.icon}</span>
              </div>
              <p className="text-3xl sm:text-4xl font-semibold text-gray-800 leading-none">
                {s.value}
              </p>
>>>>>>> 826944835cf46feb0cfa3fe804dbf4e64eb36fc7
            </div>
          ))}
        </div>

        {/* ── Body: Tickets + Right Panel ── */}
        <div className="flex flex-col xl:flex-row gap-4">
          {/* Tickets Table */}
<<<<<<< HEAD
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
                {(["All", "Open", "In Progress"] as Filter[]).map((f) => (
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
                    {["Ticket ID", "Employee", "Issue", "Priority", "Time", "Status", "Action"].map((h) => (
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
                  {filtered.map((t) => (
                    <tr
                      key={t.id}
                      className="transition-colors"
                      style={{ borderBottom: "1px solid #F5EEE4" }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#FDF8F2")}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td className="px-3 py-3.5 font-medium text-sm" style={{ color: "#7A3100" }}>{t.id}</td>
                      <td className="px-3 py-3.5">
                        <p className="font-medium text-sm" style={{ color: "#3D1000" }}>{t.employee}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#A07850" }}>{t.department}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="text-sm" style={{ color: "#4A2800" }}>{t.issue}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#A07850" }}>{t.category}</p>
                      </td>
                      <td className={`px-3 py-3.5 text-sm ${priorityStyles[t.priority]}`}>{t.priority}</td>
                      <td className="px-3 py-3.5 text-sm" style={{ color: "#7A5C45" }}>{t.time}</td>
                      <td className="px-3 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            statusStyles[t.status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <button
                          className="text-sm font-semibold hover:underline"
                          style={{ color: "#7A3100" }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
=======
          <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
            <AssignedTicketTable />
>>>>>>> 826944835cf46feb0cfa3fe804dbf4e64eb36fc7
          </div>

          {/* Right Panel */}
          <div className="xl:w-[240px] flex-shrink-0 flex flex-row xl:flex-col gap-3">
            {/* Recent Activity */}
<<<<<<< HEAD
            <div
              className="flex-1 xl:flex-none rounded-xl p-4 sm:p-5"
              style={{ backgroundColor: "#fff", border: "1px solid #E8DDD0", boxShadow: "0 1px 4px rgba(90,30,0,0.07)" }}
            >
              <h3 className="font-semibold text-base mb-4" style={{ color: "#3D1000" }}>Recent Activity</h3>
=======
            <div className="flex-1 xl:flex-none bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-4">
                Recent Activity
              </h3>
>>>>>>> 826944835cf46feb0cfa3fe804dbf4e64eb36fc7
              <div className="flex flex-col gap-4">
                {recentActivity.map((a) => (
                  <div key={a.id} className="flex gap-3 items-start">
                    <div
                      className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ border: "2px solid #C8922A" }}
                    >
                      <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: "#C8922A" }} />
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: "#3D1000" }}>
                        {a.action} {a.id}
                      </p>
<<<<<<< HEAD
                      <p className="text-sm mt-0.5" style={{ color: "#7A5C45" }}>{a.description}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#A07850" }}>{a.time}</p>
=======
                      <p className="text-sm text-gray-500 mt-0.5">
                        {a.description}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                        {a.time}
                      </p>
>>>>>>> 826944835cf46feb0cfa3fe804dbf4e64eb36fc7
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specializations */}
<<<<<<< HEAD
            <div
              className="flex-1 xl:flex-none rounded-xl p-4 sm:p-5"
              style={{ backgroundColor: "#fff", border: "1px solid #E8DDD0", boxShadow: "0 1px 4px rgba(90,30,0,0.07)" }}
            >
              <h3 className="font-semibold text-base mb-4" style={{ color: "#3D1000" }}>My Specializations</h3>
              <ul className="flex flex-col gap-2.5">
                {specializations.map((s) => (
                  <li key={s} className="flex items-center gap-2.5 text-sm" style={{ color: "#4A2800" }}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#C8922A" }} />
=======
            <div className="flex-1 xl:flex-none bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-4">
                My Specializations
              </h3>
              <ul className="flex flex-col gap-2.5">
                {specializations.map((s) => (
                  <li
                    key={s}
                    className="flex items-center gap-2.5 text-sm sm:text-base text-gray-700"
                  >
                    <span className="w-2 h-2 rounded-full bg-gray-500 flex-shrink-0" />
>>>>>>> 826944835cf46feb0cfa3fe804dbf4e64eb36fc7
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
