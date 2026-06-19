//my-completed
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Calendar,
  Search,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterOption = "Today" | "Yesterday" | "All";

type Ticket = {
  id: number;
  description: string;
  category: string;
  priority?: string;
  status: string;
  created_at: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtId = (id: number) => `TKT-${String(id).padStart(3, "0")}`;

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString())
    return `Yesterday ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function dayGroup(created_at: string): FilterOption {
  const date = new Date(created_at);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return "All";
}

function isResolved(status: string): boolean {
  const s = status.toUpperCase();
  return s === "RESOLVED" || s === "COMPLETED" || s === "CLOSED";
}

const titleCase = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const filterOptions: FilterOption[] = ["Today", "Yesterday", "All"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function MyCompletedPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterOption>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: Ticket[] = await res.json();
      setTickets(data.filter((t) => isResolved(t.status)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const now = new Date();
  const completedToday = tickets.filter(
    (t) => new Date(t.created_at).toDateString() === now.toDateString(),
  ).length;
  const completedThisMonth = tickets.filter((t) => {
    const d = new Date(t.created_at);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }).length;

  const displayed = tickets.filter((ticket) => {
    const matchesFilter =
      activeFilter === "All" || dayGroup(ticket.created_at) === activeFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      fmtId(ticket.id).toLowerCase().includes(q) ||
      ticket.description.toLowerCase().includes(q) ||
      ticket.category.toLowerCase().includes(q) ||
      (ticket.priority ?? "").toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-800">
      {/* HEADER */}
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Completed Tickets
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View your resolved support tickets
          </p>
        </div>
        <button
          onClick={fetchTickets}
          disabled={loading}
          title="Refresh"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </header>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<CheckCircle2 size={24} />}
          value={loading ? "…" : String(completedToday)}
          label="Completed Today"
        />
        <StatCard
          icon={<Calendar size={24} />}
          value={loading ? "…" : String(completedThisMonth)}
          label="This Month"
        />
        <StatCard
          icon={<CheckCircle2 size={24} />}
          value={loading ? "…" : String(tickets.length)}
          label="Total Resolved"
        />
      </div>

      {/* CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 w-full ml-2">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, description, category…"
            className="w-full pl-10 pr-4 py-2 bg-transparent outline-none text-sm"
          />
        </div>
        <div className="flex gap-2 mr-2">
          {filterOptions.map((option) => (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                activeFilter === option
                  ? "bg-[#7a4f31] text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Resolved Tickets
          </h2>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <Loader2 size={32} className="animate-spin text-[#7a4f31]" />
            <p className="text-sm">Loading tickets…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-red-500">
            <AlertCircle size={32} />
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={fetchTickets}
              className="mt-2 px-4 py-2 text-sm bg-[#7a4f31] text-white rounded-lg hover:bg-[#6b4429] transition"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && displayed.length === 0 && (
          <div className="py-16 text-center text-gray-400 text-sm">
            No resolved tickets found for this period.
          </div>
        )}

        {!loading && !error && displayed.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4">Ticket ID</th>
                  <th className="px-6 py-4">Issue</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Resolved</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayed.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          size={15}
                          className="text-green-500 shrink-0"
                        />
                        <span className="font-medium text-green-700">
                          {fmtId(ticket.id)}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 max-w-xs">
                      <p className="font-medium text-gray-900 truncate">
                        {ticket.description}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {titleCase(ticket.category)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {ticket.priority ? (
                        <span
                          className={`text-xs font-semibold ${
                            ticket.priority.toUpperCase() === "HIGH"
                              ? "text-[#b91c1c]"
                              : ticket.priority.toUpperCase() === "MEDIUM"
                                ? "text-[#c2410c]"
                                : "text-gray-500"
                          }`}
                        >
                          {titleCase(ticket.priority)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-gray-600 text-xs whitespace-nowrap">
                      <div>
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-gray-400">
                        {formatRelative(ticket.created_at)}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle2 size={11} />
                        {titleCase(ticket.status)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        href={`/ict-dashboard/tickets/${ticket.id}`}
                        className="text-[#7a4f31] font-bold hover:underline text-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && !error && (
        <p className="text-xs text-gray-400 mt-4 text-right">
          Showing {displayed.length} of {tickets.length} resolved tickets
        </p>
      )}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
      <div className="p-3 bg-gray-50 rounded-full text-[#7a4f31]">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
