"use client";
import StatusBadge from "./status-badge";
import { useEffect, useState } from "react";

type Ticket = {
  id: string;
  ticket_number: string;
  issue_description: string;
  category: { name: string };
  priority: string;
  status: string;
  created_at: string;
};

export default function TicketTable() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

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
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold">Ticket History</h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-4">Date/Time</th>
              <th className="p-4">Ticket ID</th>
              <th className="p-4">Issue</th>
              <th className="p-4">Category/Priority</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  Loading tickets...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  No tickets found.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="border-t border-gray-200">
                  <td className="p-4">
                    <div>
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(ticket.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="p-4 text-green-700 font-medium">
                    {ticket.ticket_number}
                  </td>
                  <td className="p-4">{ticket.issue_description}</td>
                  <td className="p-4">
                    <div>{ticket.category?.name}</div>
                    <div className="text-sm text-gray-500">
                      {ticket.priority}
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={ticket.status as any} />
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
