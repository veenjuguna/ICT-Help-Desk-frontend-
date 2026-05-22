import Link from "next/link";

import {
  LayoutDashboard,
  LifeBuoy,
  History,
  Bell,
  User,
  LogOut,
} from "lucide-react";
export default function Sidebar() {
  const navLinks = [
    {
      href: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/request",
      label: "Request Assistance",
      icon: LifeBuoy,
    },
    {
      href: "/tickets",
      label: "Ticket History",
      icon: History,
    },
    {
      href: "/notifications",
      label: "Notifications",
      icon: Bell,
    },
    {
      href: "/profile",
      label: "Profile",
      icon: User,
    },
  ];

  return (
    <aside className="w-64 h-screen sticky top-0  bg-amber-800 text-white flex flex-col justify-between overflow-hidden">
      <div>
        {/* Logo */}
        <div className="p-6 border-b bg-green-700 ">
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
          {navLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-3 px-6 py-4 transition-colors
                 hover:bg-green-700
                `}
              >
                <Icon size={20} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="p-6 border-t border-green-700">
        <button className="flex items-center gap-3 hover:text-green-200 transition">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
