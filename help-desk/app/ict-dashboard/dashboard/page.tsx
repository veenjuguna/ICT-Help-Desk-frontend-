"use client";

import { useState } from "react";

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

const navItems = [
  { icon: "layout-dashboard", label: "Dashboard" },
  { icon: "ticket", label: "All Tickets" },
  { icon: "clock", label: "Pending Tickets" },
  { icon: "circle-check", label: "My Completed" },
  { icon: "chart-bar", label: "Performance" },
  { icon: "users", label: "Team" },
  { icon: "user", label: "Profile" },
];

const statusStyles: Record<string, string> = {
  "In Progress": "bg-blue-100 text-blue-700",
  "Open": "bg-orange-100 text-orange-600",
  "Pending Parts": "bg-yellow-100 text-yellow-700",
};

const priorityStyles: Record<string, string> = {
  High: "text-red-600 font-medium",
  Medium: "text-orange-500 font-medium",
  Low: "text-green-600 font-medium",
};

type Filter = "All" | "Open" | "In Progress";

export default function TechnicianDashboard() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [activeNav, setActiveNav] = useState("Dashboard");

  const filtered =
    activeFilter === "All"
      ? tickets
      : tickets.filter((t) =>
          activeFilter === "In Progress"
            ? t.status === "In Progress"
            : t.status === "Open"
        );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden text-sm">
      {/* ── Sidebar ── */}
      

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top bar */}
        <div className="flex items-start justify-between px-6 pt-5 pb-3">
          <div>
            <h1 className="text-[18px] font-semibold text-gray-800">Good Morning, David Ochieng</h1>
            <p className="text-[12px] text-gray-400 mt-0.5">✦ Network &amp; Hardware Specialist</p>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-700">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Available
            </div>
            <div className="relative cursor-pointer">
              <span className="text-gray-500 text-lg">🔔</span>
              <span className="absolute -top-1 -right-1 w-[14px] h-[14px] bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-semibold">
                3
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-4 flex-1">
          {/* ── Stats ── */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Assigned to Me", value: "8" },
              { label: "Completed Today", value: "5" },
              { label: "Pending Review", value: "3" },
              { label: "Avg Response Time", value: "15 min", up: true },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3.5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-gray-500">{s.label}</span>
                  <span className="text-gray-400 text-xs">{s.up ? "↑" : "🕐"}</span>
                </div>
                <p className="text-[26px] font-semibold text-gray-800 leading-none">{s.value}</p>
              </div>
            ))}
          </div>

          {/* ── Body ── */}
          <div className="flex gap-3 flex-1 min-h-0">
            {/* Tickets Table */}
            <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
              {/* Table header */}
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
                <span className="font-semibold text-[13.5px] text-gray-800">My Assigned Tickets</span>
                <div className="flex gap-1">
                  {(["All", "Open", "In Progress"] as Filter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
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
                <table className="w-full text-xs" style={{ tableLayout: "fixed" }}>
                  <colgroup>
                    <col style={{ width: "70px" }} />
                    <col style={{ width: "110px" }} />
                    <col style={{ width: "auto" }} />
                    <col style={{ width: "65px" }} />
                    <col style={{ width: "55px" }} />
                    <col style={{ width: "100px" }} />
                    <col style={{ width: "50px" }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-gray-100">
                      {["Ticket ID", "Employee", "Issue", "Priority", "Time", "Status", "Action"].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left px-3 py-2.5 text-[11px] font-medium text-gray-400 uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t) => (
                      <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2.5 font-medium text-gray-700">{t.id}</td>
                        <td className="px-3 py-2.5">
                          <p className="font-medium text-gray-700 text-[12px]">{t.employee}</p>
                          <p className="text-[11px] text-gray-400">{t.department}</p>
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="text-gray-700 text-[12px]">{t.issue}</p>
                          <p className="text-[11px] text-gray-400">{t.category}</p>
                        </td>
                        <td className={`px-3 py-2.5 ${priorityStyles[t.priority]}`}>{t.priority}</td>
                        <td className="px-3 py-2.5 text-gray-500">{t.time}</td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${
                              statusStyles[t.status] ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <button className="text-[#5C2D0A] font-semibold hover:underline text-[12px]">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right panel */}
            <div className="w-[220px] flex-shrink-0 flex flex-col gap-3">
              {/* Recent Activity */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-semibold text-[13px] text-gray-800 mb-3">Recent Activity</h3>
                <div className="flex flex-col gap-3">
                  {recentActivity.map((a) => (
                    <div key={a.id} className="flex gap-2.5 items-start">
                      <div className="mt-0.5 w-[18px] h-[18px] rounded-full border-[1.5px] border-gray-300 flex items-center justify-center flex-shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 block" />
                      </div>
                      <div>
                        <p className="font-medium text-[12px] text-gray-700">
                          {a.action} {a.id}
                        </p>
                        <p className="text-[11.5px] text-gray-500">{a.description}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specializations */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-semibold text-[13px] text-gray-800 mb-3">My Specializations</h3>
                <ul className="flex flex-col gap-2">
                  {specializations.map((s) => (
                    <li key={s} className="flex items-center gap-2 text-[12.5px] text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}