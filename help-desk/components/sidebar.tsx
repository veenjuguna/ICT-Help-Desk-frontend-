import {
  LayoutDashboard,
  LifeBuoy,
  History,
  Bell,
  User,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-green-800 text-white flex flex-col justify-between min-h-screen">
      {/* Top Section */}
      <div>
        {/* Logo */}
        <div className="p-6 border-b border-green-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white text-green-800 flex items-center justify-center font-bold">
              NT
            </div>

            <div>
              <h2 className="font-bold">National Treasury</h2>

              <p className="text-sm text-green-100">IT Helpdesk</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex flex-col">
          <a
            href="/"
            className="flex items-center gap-3 px-6 py-4 bg-green-900 border-l-4 border-red-500"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </a>

          <a
            href="#"
            className="flex items-center gap-3 px-6 py-4 hover:bg-green-700"
          >
            <LifeBuoy size={20} />
            Request Assistance
          </a>

          <a
            href="#"
            className="flex items-center gap-3 px-6 py-4 hover:bg-green-700"
          >
            <History size={20} />
            Ticket History
          </a>

          <a
            href="#"
            className="flex items-center gap-3 px-6 py-4 hover:bg-green-700"
          >
            <Bell size={20} />
            Notifications
          </a>

          <a
            href="#"
            className="flex items-center gap-3 px-6 py-4 hover:bg-green-700"
          >
            <User size={20} />
            Profile
          </a>
        </nav>
      </div>

      {/* Logout */}
      <div className="p-6 border-t border-green-700">
        <button className="flex items-center gap-3">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
