"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Wrench,
  Network,
  Shield,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

type TicketStatus = "open" | "in_progress" | "closed" | "rejected";
type TicketCategory =
  | "hardware"
  | "software"
  | "network"
  | "security_incidents";

interface StaffTicket {
  id: number;
  staff_id: string;
  assigned_to_id: number | null;
  title: string;
  description: string;
  category: TicketCategory;
  status: TicketStatus;
  comment: string | null;
  created_at: string;
  closed_at: string | null;
}

interface StaffMe {
  id: string;
  full_name: string;
  email: string;
  department: { id: number; name: string } | null;
  role: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function baseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-KE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const CATEGORY_META: Record<
  TicketCategory,
  { label: string; Icon: React.ElementType; color: string; bg: string }
> = {
  hardware: {
    label: "Hardware",
    Icon: Monitor,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
  software: {
    label: "Software",
    Icon: Wrench,
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
  },
  network: {
    label: "Network",
    Icon: Network,
    color: "text-teal-600",
    bg: "bg-teal-50 border-teal-200",
  },
  security_incidents: {
    label: "Security",
    Icon: Shield,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
  },
};

const STATUS_META: Record<
  TicketStatus,
  { label: string; dot: string; badge: string }
> = {
  open: {
    label: "Open",
    dot: "bg-amber-400",
    badge: "bg-amber-50 border-amber-200 text-amber-700",
  },
  in_progress: {
    label: "In Progress",
    dot: "bg-blue-500",
    badge: "bg-blue-50 border-blue-200 text-blue-700",
  },
  closed: {
    label: "Resolved",
    dot: "bg-green-500",
    badge: "bg-green-50 border-green-200 text-green-700",
  },
  rejected: {
    label: "Rejected",
    dot: "bg-red-400",
    badge: "bg-red-50 border-red-200 text-red-700",
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TicketStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.open;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${meta.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function CategoryChip({ category }: { category: TicketCategory }) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META.hardware;
  const { Icon, label, color, bg } = meta;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-medium ${bg} ${color}`}
    >
      <Icon size={11} strokeWidth={2} />
      {label}
    </span>
  );
}

function TicketCard({ ticket }: { ticket: StaffTicket }) {
  const [expanded, setExpanded] = useState(false);
  const isResolved = ticket.status === "closed";

  return (
    <div
      className={`rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
        isResolved ? "border-green-200" : "border-[#e8e0d8]"
      }`}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-4 px-5 py-4">
        <div className="flex items-start gap-3 min-w-0">
          {/* Ticket number pill */}
          <span className="mt-0.5 shrink-0 rounded-md bg-[#f7f3f0] px-2 py-0.5 text-[11px] font-bold text-[#8a6a56] border border-[#e8e0d8]">
            #{ticket.id}
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#1c1410] leading-snug truncate">
              {ticket.title}
            </h3>
            <p className="mt-0.5 text-[11px] text-[#9c8576]">
              Raised {formatDate(ticket.created_at)} ·{" "}
              {formatTime(ticket.created_at)}
            </p>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1.5">
          <StatusBadge status={ticket.status} />
          <CategoryChip category={ticket.category} />
        </div>
      </div>

      {/* Resolved ribbon */}
      {isResolved && (
        <div className="mx-5 mb-3 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3.5 py-2">
          <CheckCircle2 size={14} className="text-green-500 shrink-0" />
          <span className="text-xs text-green-700 font-medium">
            Ticket resolved
            {ticket.closed_at ? ` on ${formatDate(ticket.closed_at)}` : ""}
          </span>
        </div>
      )}

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between border-t border-[#f0ebe6] px-5 py-2.5 text-[11px] font-semibold text-[#9c8576] hover:text-[#6b4c38] transition-colors"
      >
        <span>{expanded ? "Hide details" : "View details"}</span>
        {expanded ? (
          <ChevronUp size={13} strokeWidth={2.5} />
        ) : (
          <ChevronDown size={13} strokeWidth={2.5} />
        )}
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="border-t border-[#f0ebe6] px-5 py-4 space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#9c8576] mb-1.5">
              Description
            </p>
            <p className="text-sm text-[#3a2a1e] leading-relaxed">
              {ticket.description}
            </p>
          </div>

          {ticket.comment && (
            <div className="rounded-lg bg-[#fdfbf9] border border-[#e8e0d8] px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#9c8576] mb-1">
                Technician Note
              </p>
              <p className="text-sm text-[#3a2a1e] leading-relaxed">
                {ticket.comment}
              </p>
            </div>
          )}

          {ticket.assigned_to_id && (
            <p className="text-[11px] text-[#9c8576]">
              Assigned to technician ID:{" "}
              <span className="font-semibold text-[#6b4c38]">
                {ticket.assigned_to_id}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ filter }: { filter: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f7f3f0] border border-[#e8e0d8]">
        <Ticket size={28} className="text-[#c4a882]" />
      </div>
      <p className="text-[15px] font-semibold text-[#3a2a1e]">
        {filter === "all" ? "No tickets raised yet" : `No ${filter} tickets`}
      </p>
      <p className="mt-1 text-xs text-[#9c8576] max-w-xs">
        {filter === "all"
          ? "When you raise a support request, it will appear here so you can track its progress."
          : "Try switching the filter above to see other tickets."}
      </p>
      <Link
        href="/raise-ticket"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#44271a] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#3a2016] transition-colors shadow-sm"
      >
        <Plus size={15} strokeWidth={2.5} />
        Raise a Ticket
      </Link>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

type FilterKey = "all" | "open" | "in_progress" | "closed";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "closed", label: "Resolved" },
];

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<StaffTicket[]>([]);
  const [staff, setStaff] = useState<StaffMe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");

  const loadData = useCallback(async (background = false) => {
    if (!background) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const url = baseUrl();

      // Fetch staff profile + tickets in parallel
      const [staffRes, ticketsRes] = await Promise.all([
        fetch(`${url}/staff/me`, { credentials: "include" }),
        fetch(`${url}/tickets/`, { credentials: "include" }),
      ]);

      if (!staffRes.ok)
        throw new Error(`Staff fetch failed (${staffRes.status})`);
      if (!ticketsRes.ok)
        throw new Error(`Tickets fetch failed (${ticketsRes.status})`);

      const staffData: StaffMe = await staffRes.json();
      const allTickets: StaffTicket[] = await ticketsRes.json();

      setStaff(staffData);
      // Filter to only THIS staff member's tickets
      setTickets(
        allTickets
          .filter((t) => t.staff_id === staffData.id)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          ),
      );
    } catch (err) {
      console.error("Failed to load tickets:", err);
      setError(
        err instanceof Error ? err.message : "Could not load your tickets.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const id = setInterval(() => loadData(true), 30_000);
    return () => clearInterval(id);
  }, [loadData]);

  // Derived counts
  const counts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  const visible =
    filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#f7f3f0] font-sans">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-[#e8e0d8] bg-white px-4 py-4 sm:px-8 shadow-sm z-10">
        <div>
          <h1 className="text-[18px] font-bold text-[#1c1410] flex items-center gap-2">
            My Tickets
            {isRefreshing && (
              <RefreshCw size={14} className="animate-spin text-gray-400" />
            )}
          </h1>
          <p className="text-sm text-[#9c8576]">
            {staff
              ? `Viewing tickets raised by ${staff.full_name}`
              : "Track the status of your support requests"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="flex items-center justify-center p-2.5 rounded-lg border border-[#e8e0d8] text-[#6b4c38] hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              size={18}
              className={isRefreshing ? "animate-spin" : ""}
            />
          </button>
          <Link
            href="/raise-ticket"
            className="flex items-center gap-2 rounded-lg bg-[#44271a] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3a2016] shadow-sm"
          >
            <Plus size={15} strokeWidth={2.5} />
            Raise Ticket
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <RefreshCw size={28} className="animate-spin text-[#8a6a56]" />
            <p className="text-[#8a6a56] font-medium text-sm">
              Loading your tickets...
            </p>
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <AlertCircle size={28} className="text-red-400" />
            <p className="text-red-500 font-medium text-sm">{error}</p>
            <button
              onClick={() => loadData()}
              className="rounded-lg bg-[#44271a] px-4 py-2 text-sm text-white hover:bg-[#3a2016]"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Summary stat cards */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(
                [
                  {
                    key: "all",
                    label: "Total",
                    icon: <Ticket size={18} />,
                    value: counts.all,
                    accent: "text-[#8a6a56]",
                    ring: "bg-[#f7f3f0] border-[#e8e0d8]",
                  },
                  {
                    key: "open",
                    label: "Open",
                    icon: <Clock size={18} />,
                    value: counts.open,
                    accent: "text-amber-600",
                    ring: "bg-amber-50 border-amber-100",
                  },
                  {
                    key: "in_progress",
                    label: "In Progress",
                    icon: <RefreshCw size={18} />,
                    value: counts.in_progress,
                    accent: "text-blue-600",
                    ring: "bg-blue-50 border-blue-100",
                  },
                  {
                    key: "closed",
                    label: "Resolved",
                    icon: <CheckCircle2 size={18} />,
                    value: counts.closed,
                    accent: "text-green-600",
                    ring: "bg-green-50 border-green-100",
                  },
                ] as const
              ).map((s) => (
                <button
                  key={s.key}
                  onClick={() => setFilter(s.key as FilterKey)}
                  className={`flex items-center justify-between rounded-xl border px-4 py-4 shadow-sm transition-all hover:shadow-md text-left ${
                    filter === s.key
                      ? `${s.ring} ring-1 ring-offset-0 ${
                          s.key === "all"
                            ? "ring-[#b34000]"
                            : s.key === "open"
                              ? "ring-amber-400"
                              : s.key === "in_progress"
                                ? "ring-blue-400"
                                : "ring-green-400"
                        }`
                      : "bg-white border-[#e8e0d8]"
                  }`}
                >
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#9c8576]">
                      {s.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-[#1c1410]">
                      {s.value}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border ${s.ring} ${s.accent}`}
                  >
                    {s.icon}
                  </div>
                </button>
              ))}
            </div>

            {/* Filter tabs */}
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors border ${
                    filter === f.key
                      ? "bg-[#44271a] text-white border-[#44271a]"
                      : "bg-white text-[#6b4c38] border-[#e8e0d8] hover:border-[#c4a882]"
                  }`}
                >
                  {f.label}
                  {counts[f.key] > 0 && (
                    <span
                      className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                        filter === f.key
                          ? "bg-white/20 text-white"
                          : "bg-[#f7f3f0] text-[#8a6a56]"
                      }`}
                    >
                      {counts[f.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Ticket list */}
            {visible.length === 0 ? (
              <EmptyState filter={filter} />
            ) : (
              <div className="space-y-3">
                {visible.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
