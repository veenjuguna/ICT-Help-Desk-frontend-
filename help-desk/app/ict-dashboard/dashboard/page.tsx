"use client";

import { useState } from "react";

const tickets = [
  { id: "TKT-001", employee: "John Kamau", department: "ICT Services", issue: "Laptop not connecting to WiFi network", category: "Network", priority: "High", time: "2h 15m", status: "In Progress" },
  { id: "TKT-008", employee: "Mary Wanjiku", department: "Accounting", issue: "Desktop computer won't boot up", category: "Hardware", priority: "High", time: "45m", status: "Open" },
  { id: "TKT-012", employee: "Peter Maina", department: "HR", issue: "Network printer offline error", category: "Network", priority: "Medium", time: "1h 30m", status: "In Progress" },
  { id: "TKT-015", employee: "Grace Akinyi", department: "Procurement", issue: "Cannot access network shared drive", category: "Network", priority: "High", time: "30m", status: "Open" },
  { id: "TKT-018", employee: "James Njoroge", department: "Budget & Finance", issue: "Keyboard keys not working properly", category: "Hardware", priority: "Low", time: "3h", status: "Pending Parts" },
  { id: "TKT-020", employee: "Sarah Mutua", department: "Planning", issue: "Monitor display flickering", category: "Hardware", priority: "Medium", time: "2h 30m", status: "In Progress" },
];

const recentActivity = [
  { id: "TKT-005", action: "Resolved", description: "WiFi connectivity issue", time: "10 min ago" },
  { id: "TKT-009", action: "Updated", description: "Ordered replacement keyboard", time: "25 min ago" },
  { id: "TKT-011", action: "Resolved", description: "Printer paper jam fixed", time: "1 hour ago" },
  { id: "TKT-014", action: "Resolved", description: "Network cable replaced", time: "2 hours ago" },
];

const specializations = [
  "Network Infrastructure",
  "Hardware Repair",
  "WiFi & Connectivity",
  "Printer Setup",
];

const statusStyles: Record<string, string> = {
  "In Progress": "bg-blue-100 text-blue-800",
  "Open": "bg-amber-100 text-amber-800",
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

  const filtered =
    activeFilter === "All"
      ? tickets
      : tickets.filter((t) =>
          activeFilter === "In Progress"
            ? t.status === "In Progress"
            : t.status === "Open"
        );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* ── Top Bar ── */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Good Morning, David Ochieng</h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1">✦ Network &amp; Hardware Specialist</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm sm:text-base text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            Available
          </div>
          <div className="relative cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="white" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 px-4 sm:px-6 py-5 flex flex-col gap-5">

        {/* ── Stats Grid: 1 col mobile, 2 col sm, 4 col lg ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Assigned to Me", value: "8", icon: "" },
            { label: "Completed Today", value: "5", icon: "" },
            { label: "Pending Review", value: "3", icon: "" },
            { label: "Avg Response Time", value: "15 min", icon: "↑" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm sm:text-base text-gray-500">{s.label}</span>
                <span className="text-gray-400 text-base">{s.icon}</span>
              </div>
              <p className="text-3xl sm:text-4xl font-semibold text-gray-800 leading-none">{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Body: Tickets + Right Panel ── */}
        <div className="flex flex-col xl:flex-row gap-4">

          {/* Tickets Table */}
          <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
            <div className="flex flex-wrap items-center justify-between px-5 py-4 border-b border-gray-100 gap-2">
              <span className="font-semibold text-base sm:text-lg text-gray-800">My Assigned Tickets</span>
              <div className="flex gap-1">
                {(["All", "Open", "In Progress"] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1.5 rounded-md text-sm sm:text-base font-medium transition-colors ${
                      activeFilter === f
                        ? "bg-[#5C2D0A] text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
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
                  <tr className="border-b border-gray-100">
                    {["Ticket ID", "Employee", "Issue", "Priority", "Time", "Status", "Action"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-3 py-3 text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3.5 font-medium text-gray-700 text-sm sm:text-base">{t.id}</td>
                      <td className="px-3 py-3.5">
                        <p className="font-medium text-gray-800 text-sm sm:text-base">{t.employee}</p>
                        <p className="text-gray-400 text-xs sm:text-sm mt-0.5">{t.department}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="text-gray-700 text-sm sm:text-base">{t.issue}</p>
                        <p className="text-gray-400 text-xs sm:text-sm mt-0.5">{t.category}</p>
                      </td>
                      <td className={`px-3 py-3.5 text-sm sm:text-base ${priorityStyles[t.priority]}`}>{t.priority}</td>
                      <td className="px-3 py-3.5 text-gray-500 text-sm sm:text-base">{t.time}</td>
                      <td className="px-3 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${
                            statusStyles[t.status] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <button className="text-[#5C2D0A] font-semibold hover:underline text-sm sm:text-base">
                          View
                        </button>
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
            <div className="flex-1 xl:flex-none bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-4">Recent Activity</h3>
              <div className="flex flex-col gap-4">
                {recentActivity.map((a) => (
                  <div key={a.id} className="flex gap-3 items-start">
                    <div className="mt-0.5 w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                      <span className="w-2 h-2 rounded-full bg-gray-300 block" />
                    </div>
                    <div>
                      <p className="font-medium text-sm sm:text-base text-gray-700">
                        {a.action} {a.id}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">{a.description}</p>
                      <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specializations */}
            <div className="flex-1 xl:flex-none bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-4">My Specializations</h3>
              <ul className="flex flex-col gap-2.5">
                {specializations.map((s) => (
                  <li key={s} className="flex items-center gap-2.5 text-sm sm:text-base text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-gray-500 flex-shrink-0" />
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