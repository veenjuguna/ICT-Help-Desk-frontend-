"use client";

import { useEffect, useState } from "react";

type Ticket = {
  id: number;
  title: string;
  category: string;
  status: string;
  created_at: string;
  staff?: { full_name: string; department?: { name: string } };
};

const statusStyles: Record<string, string> = {
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  OPEN: "bg-amber-100 text-amber-800",
  CLOSED: "bg-gray-100 text-gray-600",
  RESOLVED: "bg-green-100 text-green-800",
};

type Filter = "All" | "OPEN" | "IN_PROGRESS";

export default function AssignedTicketTable() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/`, {
          credentials: "include",
        });
        if (res.ok) setTickets(await res.json());
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered =
    activeFilter === "All"
      ? tickets
      : tickets.filter((t) => t.status === activeFilter);

  return (
    <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
      <div className="flex flex-wrap items-center justify-between px-5 py-4 border-b border-gray-100 gap-2">
        <span className="font-semibold text-base sm:text-lg text-gray-800">
          All Tickets
        </span>
        <div className="flex gap-1">
          {(["All", "OPEN", "IN_PROGRESS"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeFilter === f
                  ? "bg-[#7A3100] text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {f === "IN_PROGRESS"
                ? "In Progress"
                : f === "OPEN"
                  ? "Open"
                  : "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table
          className="w-full text-sm sm:text-base"
          style={{ tableLayout: "fixed", minWidth: "600px" }}
        >
          <colgroup>
            <col style={{ width: "90px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "auto" }} />
            <col style={{ width: "90px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "60px" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-100">
              {[
                "Ticket ID",
                "Employee",
                "Issue",
                "Category",
                "Status",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-3 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-400">
                  No tickets found.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-3 py-3.5 font-medium text-gray-700">
                    TKT-{String(t.id).padStart(3, "0")}
                  </td>
                  <td className="px-3 py-3.5">
                    <p className="font-medium text-gray-800">
                      {t.staff?.full_name ?? "—"}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {t.staff?.department?.name ?? "—"}
                    </p>
                  </td>
                  <td className="px-3 py-3.5 text-gray-700">{t.title}</td>
                  <td className="px-3 py-3.5 text-gray-500">{t.category}</td>
                  <td className="px-3 py-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusStyles[t.status] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {t.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <button className="text-[#7A3100] font-semibold hover:underline text-sm">
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
