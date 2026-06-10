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
  "In Progress": "bg-blue-100 text-blue-800",
  Open: "bg-amber-100 text-amber-800",
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
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm sm:text-base text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            Available
          </div>
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
                <span className="text-sm sm:text-base text-gray-500">
                  {s.label}
                </span>
                <span className="text-gray-400 text-base">{s.icon}</span>
              </div>
              <p className="text-3xl sm:text-4xl font-semibold text-gray-800 leading-none">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Body: Tickets + Right Panel ── */}
        <div className="flex flex-col xl:flex-row gap-4">
          {/* Tickets Table */}
          <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
            <AssignedTicketTable />
          </div>

          {/* Right Panel */}
          <div className="xl:w-[240px] flex-shrink-0 flex flex-row xl:flex-col gap-3">
            {/* Recent Activity */}
            <div className="flex-1 xl:flex-none bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-4">
                Recent Activity
              </h3>
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
                      <p className="text-sm text-gray-500 mt-0.5">
                        {a.description}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                        {a.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specializations */}
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
