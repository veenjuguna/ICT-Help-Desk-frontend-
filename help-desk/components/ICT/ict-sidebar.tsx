//ict-sidebar
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Ticket,
  CheckCircle,
  Clock,
  Users,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";

function getUserFromStorage(): { name: string; dept: string } {
  try {
    const raw = localStorage.getItem("user");
    if (raw) {
      const user = JSON.parse(raw);
      const first = user.first_name || user.firstName || "";
      const last = user.last_name || user.lastName || "";
      const name = `${first} ${last}`.trim();
      return { name: name || "Technician", dept: user.department || "" };
    }
  } catch {}
  return { name: "Technician", dept: "" };
}

const NAV_LINKS = [
  {
    href: "/ict-dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },

  {
    href: "/ict-dashboard/tickets/pending",
    label: "Pending Tickets",
    icon: Clock,
  },
  {
    href: "/ict-dashboard/my-completed",
    label: "My Completed ",
    icon: CheckCircle,
  },
  { href: "/ict-dashboard/tickets/all", label: "All Tickets", icon: Ticket },
  { href: "/ict-dashboard/my-tickets", label: "My Tickets", icon: Ticket },
  { href: "/ict-dashboard/team", label: "Team", icon: Users },
  { href: "/ict-dashboard/profile", label: "Profile", icon: User },
];

export default function IctSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const [userName] = useState<string>(() => getUserFromStorage().name);
  const [userDept] = useState<string>(() => getUserFromStorage().dept);

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {}
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    document.cookie = "user_role=; path=/; max-age=0";
    window.location.href = "/login";
  };

  const handleNavClick = () => setOpen(false);

  return (
    <>
      <style>{`
        /* ── Mobile topbar (hamburger) ── */
        .ict-mobile-bar {
          display: none;
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 54px;
          background: #2A0E04;
          z-index: 100;
          align-items: center;
          justify-content: space-between;
          padding: 0 1rem;
          border-bottom: 1px solid rgba(200,150,46,0.3);
        }
        .ict-hamburger {
          background: none; border: none; cursor: pointer;
          color: #E8B84B; display: flex; align-items: center;
          padding: 6px;
        }
        .ict-mobile-logo {
          position: absolute; left: 50%; transform: translateX(-50%);
        }

        /* ── Overlay (mobile) ── */
        .ict-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 110;
        }
        .ict-overlay.visible { display: block; }

        /* ── Sidebar ── */
        .ict-sidebar {
          width: 260px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          flex-shrink: 0;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .ict-sidebar-bg { position: absolute; inset: 0; z-index: 0; }
        .ict-sidebar-bg-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(74,30,10,0.84) 0%,
            rgba(50,15,5,0.92) 40%,
            rgba(30,8,2,0.96) 100%
          );
        }
        .ict-sidebar-inner {
          position: relative; z-index: 1;
          display: flex; flex-direction: column;
          justify-content: space-between; height: 100%;
        }
        .ict-sidebar-header {
          padding: 1.1rem 1rem;
          border-bottom: 1px solid rgba(200,150,46,0.3);
          display: flex; align-items: center; min-height: 72px;
        }
        .ict-sublabel {
          font-size: 9.5px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: #E8B84B;
          padding: 0.65rem 1rem 0.2rem; white-space: nowrap; opacity: 0.75;
        }
        .ict-sidebar-nav {
          display: flex; flex-direction: column;
          gap: 2px; padding: 0.25rem 0.5rem; flex: 1;
        }
        .ict-nav-link {
          display: flex; align-items: center; gap: 12px;
          padding: 0.72rem 0.85rem; border-radius: 8px;
          color: rgba(255,255,255,0.62); text-decoration: none;
          font-size: 13.5px; font-weight: 500;
          white-space: nowrap; overflow: hidden;
          transition: background 0.15s, color 0.15s;
          border-left: 3px solid transparent;
        }
        .ict-nav-link:hover { background: rgba(200,150,46,0.14); color: #fff; }
        .ict-nav-link.active {
          background: rgba(200,150,46,0.22);
          color: #fff; border-left: 3px solid #C8962E;
        }
        .ict-sidebar-user {
          display: flex; align-items: center; gap: 10px;
          padding: 0.75rem 1rem;
          border-top: 1px solid rgba(200,150,46,0.18);
          border-bottom: 1px solid rgba(200,150,46,0.18);
        }
        .ict-user-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(200,150,46,0.3);
          border: 1px solid rgba(200,150,46,0.5);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #E8B84B; flex-shrink: 0;
        }
        .ict-user-name {
          font-size: 13px; font-weight: 600; color: #fff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ict-user-dept {
          font-size: 10.5px; color: rgba(255,255,255,0.45);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ict-sidebar-footer { padding: 0.5rem; }
        .ict-logout-btn {
          display: flex; align-items: center; gap: 12px;
          padding: 0.72rem 0.85rem; border-radius: 8px;
          color: rgba(255,255,255,0.5); background: none; border: none;
          cursor: pointer; font-size: 13.5px; font-weight: 500;
          font-family: inherit; width: 100%;
          transition: background 0.15s, color 0.15s;
        }
        .ict-logout-btn:hover { background: rgba(187,0,0,0.18); color: #ffaaaa; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .ict-mobile-bar { display: flex; }
          .ict-sidebar {
            position: fixed;
            top: 0; left: 0;
            height: 100vh;
            z-index: 120;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            width: 260px;
          }
          .ict-sidebar.open { transform: translateX(0); }
        }
      `}</style>

      {/* Mobile topbar */}
      <div className="ict-mobile-bar">
        <button className="ict-hamburger" onClick={() => setOpen(true)}>
          <Menu size={22} />
        </button>
        <div className="ict-mobile-logo">
          <Image
            src="/tnt-logo.jpeg"
            alt="National Treasury"
            width={100}
            height={28}
            style={{ objectFit: "contain", height: "28px", width: "auto" }}
            priority
          />
        </div>
        <div style={{ width: 34 }} />
      </div>

      {/* Overlay */}
      <div
        className={`ict-overlay${open ? " visible" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`ict-sidebar${open ? " open" : ""}`}>
        <div className="ict-sidebar-bg">
          <Image
            src="/treasury-building.jpeg"
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
            quality={70}
            aria-hidden="true"
            sizes="260px"
          />
          <div className="ict-sidebar-bg-overlay" />
        </div>

        <div className="ict-sidebar-inner">
          <div>
            {/* Header with close button on mobile */}
            <div
              className="ict-sidebar-header"
              style={{ justifyContent: "space-between" }}
            >
              <Image
                src="/tnt-logo.jpeg"
                alt="The National Treasury"
                width={190}
                height={48}
                style={{
                  objectFit: "contain",
                  height: "40px",
                  width: "auto",
                  maxWidth: "180px",
                }}
                priority
              />
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.5)",
                  padding: 4,
                  display: "none",
                }}
                className="ict-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <p className="ict-sublabel">ICT Helpdesk — Technician</p>

            <nav className="ict-sidebar-nav">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const isActive =
                  pathname === href ||
                  (href !== "/ict-dashboard" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`ict-nav-link${isActive ? " active" : ""}`}
                    onClick={handleNavClick}
                  >
                    <Icon size={19} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="ict-sidebar-user">
              <div className="ict-user-avatar">{initials}</div>
              <div style={{ minWidth: 0 }}>
                <p className="ict-user-name">{userName}</p>
                {userDept && <p className="ict-user-dept">{userDept}</p>}
              </div>
            </div>
            <div className="ict-sidebar-footer">
              <button className="ict-logout-btn" onClick={handleLogout}>
                <LogOut size={19} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
