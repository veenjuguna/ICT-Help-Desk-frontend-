"use client";

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
  OPEN:        "bg-amber-100 text-amber-800",
  CLOSED:      "bg-gray-100 text-gray-600",
  RESOLVED:    "bg-green-100 text-green-800",
};

interface Props {
  tickets: Ticket[];
  fifoTicketId?: number;
}

export default function AssignedTicketTable({ tickets, fifoTicketId }: Props) {
  return (
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
            {["Ticket ID", "Employee", "Issue", "Category", "Status", "Action"].map((h) => (
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
          {tickets.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-gray-400">
                No tickets found.
              </td>
            </tr>
          ) : (
            tickets.map((t) => {
              const isFifo = t.id === fifoTicketId;
              const statusClass =
                statusStyles[t.status] ?? "bg-gray-100 text-gray-600";

              return (
                <tr
                  key={t.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  style={isFifo ? { backgroundColor: "#fffbeb" } : {}}
                >
                  <td className="px-3 py-3.5 font-medium text-gray-700">
                    <span>TKT-{String(t.id).padStart(3, "0")}</span>
                    {isFifo && (
                      <span
                        className="ml-1.5 text-xs font-semibold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: "#C8962E", color: "#fff" }}
                      >
                        Next
                      </span>
                    )}
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
                      className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusClass}`}
                    >
                      {t.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <button className="text-[#7A3100] font-semibold hover:underline text-sm">
                      View
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}