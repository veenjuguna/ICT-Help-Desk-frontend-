import StatCard from "../components/stat-card";
import TicketTable from "../components/ticket-table";

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-black">
          Good Morning, John Kamau
        </h1>

        <p className="text-gray-500 mt-1">
          Welcome to your IT Helpdesk Dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="Open Tickets" value="4" color="red" />

        <StatCard title="Resolved Tickets" value="2" color="green" />
      </div>

      {/* Ticket Table */}
      <TicketTable />
    </div>
  );
}
