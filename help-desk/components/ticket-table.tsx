import StatusBadge from "./status-badge";

const tickets = [
  {
    id: "TKT-001",
    issue: "Laptop not connecting to WiFi network",
    category: "Network",
    priority: "High Priority",
    status: "Open",
    date: "2026-05-13",
    time: "09:30",
  },
  {
    id: "TKT-002",
    issue: "MS Office activation error",
    category: "Software",
    priority: "Medium Priority",
    status: "In Progress",
    date: "2026-05-12",
    time: "14:15",
  },
  {
    id: "TKT-003",
    issue: "Cannot access shared drive folders",
    category: "Access & Permissions",
    priority: "High Priority",
    status: "Open",
    date: "2026-05-11",
    time: "11:00",
  },
];

export default function TicketTable() {
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
            {tickets.map((ticket) => (
              <tr key={ticket.id} className="border-t border-gray-200">
                <td className="p-4">
                  <div>{ticket.date}</div>
                  <div className="text-sm text-gray-500">{ticket.time}</div>
                </td>

                <td className="p-4 text-green-700 font-medium">{ticket.id}</td>

                <td className="p-4">{ticket.issue}</td>

                <td className="p-4">
                  <div>{ticket.category}</div>

                  <div className="text-sm text-gray-500">{ticket.priority}</div>
                </td>

                <td className="p-4">
                  <StatusBadge status={ticket.status as any} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
