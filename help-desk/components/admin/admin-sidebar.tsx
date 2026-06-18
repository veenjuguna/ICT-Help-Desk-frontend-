"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  HardHat,
  Ticket,
  Package,
  GitBranch,
  ScrollText,
  Monitor,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const navLinks = [
  { href: "/admin",     label: "Overview",      icon: LayoutDashboard },
  { href: "/admin/staff",         label: "Staff",         icon: Users },
  { href: "/admin/ict-personnel", label: "ICT Personnel", icon: HardHat },
  { href: "/admin/tickets",       label: "Tickets",       icon: Ticket },
  { href: "/admin/assets",        label: "Assets",        icon: Package },
  { href: "/admin/allocations",   label: "Allocations",   icon: GitBranch },
  { href: "/admin/audit-logs",    label: "Audit Logs",    icon: ScrollText },
  { href: "/admin/sessions",      label: "Sessions",      icon: Monitor },
  { href: "/admin/profile",       label: "Profile",       icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const w = collapsed ? 72 : 240;

  return (
    <>
      <style>{`
        .admin-sidebar {
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: width 0.25s ease, min-width 0.25s ease;
          z-index: 100;
          flex-shrink: 0;
        }
        .admin-sidebar-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .admin-sidebar-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(74,30,10,0.97) 0%, rgba(26,10,4,0.99) 100%);
          z-index: 1;
        }
        .admin-sidebar-inner {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .admin-sidebar-header {
          padding: 1rem 0.85rem;
          border-bottom: 1px solid rgba(200,150,46,0.3);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          min-height: 72px;
          flex-shrink: 0;
        }
        .admin-logo-wrap {
          display: flex;
          align-items: center;
          overflow: hidden;
          flex: 1;
          min-width: 0;
        }
        .admin-collapse-btn {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: rgba(200,150,46,0.2);
          border: 1.5px solid rgba(200,150,46,0.5);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #E8B84B;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .admin-collapse-btn:hover {
          background: rgba(200,150,46,0.4);
          color: #fff;
        }
        .admin-badge {
          background: rgba(200,150,46,0.2);
          border: 1px solid rgba(200,150,46,0.4);
          color: #E8B84B;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: 20px;
          white-space: nowrap;
          overflow: hidden;
          transition: opacity 0.2s, max-width 0.25s;
        }
        .admin-nav {
          flex: 1;
          padding: 0.75rem 0;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .admin-nav::-webkit-scrollbar { width: 0; }
        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.85rem;
          text-decoration: none;
          color: rgba(255,255,255,0.65);
          font-size: 0.85rem;
          font-weight: 500;
          transition: background 0.15s, color 0.15s;
          position: relative;
          white-space: nowrap;
          border-left: 3px solid transparent;
        }
        .admin-nav-link:hover {
          background: rgba(200,150,46,0.1);
          color: #fff;
        }
        .admin-nav-link.active {
          background: rgba(200,150,46,0.15);
          color: #E8B84B;
          border-left-color: #C8962E;
        }
        .admin-nav-link .nav-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
        }
        .admin-nav-label {
          overflow: hidden;
          transition: opacity 0.2s, max-width 0.25s;
        }
        .admin-nav-tooltip {
          position: absolute;
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          background: #2C1810;
          color: #E8B84B;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid rgba(200,150,46,0.3);
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          margin-left: 8px;
          z-index: 999;
          transition: opacity 0.15s;
        }
        .admin-nav-link:hover .admin-nav-tooltip { opacity: 1; }
        .admin-sidebar-footer {
          padding: 1rem 0.85rem;
          border-top: 1px solid rgba(200,150,46,0.2);
          flex-shrink: 0;
        }
        .admin-logout-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          background: none;
          border: none;
          color: rgba(255,255,255,0.55);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0.5rem 0;
          white-space: nowrap;
          transition: color 0.15s;
          font-family: inherit;
        }
        .admin-logout-btn:hover { color: #e74c3c; }
        .admin-logout-label {
          overflow: hidden;
          transition: opacity 0.2s, max-width 0.25s;
        }
      `}</style>

      <aside
        className="admin-sidebar"
        style={{ width: w, minWidth: w }}
      >
        <div className="admin-sidebar-bg">
          <Image
            src="/treasury-building.jpeg"
            alt=""
            fill
            style={{ objectFit: "cover" }}
            quality={75}
            aria-hidden="true"
          />
          <div className="admin-sidebar-overlay" />
        </div>

        <div className="admin-sidebar-inner">
          {/* Header */}
          <div className="admin-sidebar-header">
            <div className="admin-logo-wrap">
              {!collapsed ? (
                <Image
                  src="/tnt-logo.jpeg"
                  alt="National Treasury"
                  width={130}
                  height={36}
                  style={{ objectFit: "contain", height: "36px", width: "auto" }}
                  priority
                />
              ) : (
                <Image
                  src="/tnt-logo-1.png"
                  alt="NT"
                  width={36}
                  height={36}
                  style={{
                    objectFit: "contain",
                    height: "36px",
                    width: "36px",
                    borderRadius: "50%",
                    border: "1.5px solid rgba(200,150,46,0.5)",
                  }}
                />
              )}
            </div>
            <button
              className="admin-collapse-btn"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>

          {/* Admin badge */}
          <div style={{ padding: "0.5rem 0.85rem 0", overflow: "hidden" }}>
            <div
              className="admin-badge"
              style={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 120 }}
            >
              Admin Portal
            </div>
          </div>

          {/* Nav */}
          <nav className="admin-nav">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`admin-nav-link${isActive ? " active" : ""}`}
                >
                  <Icon size={20} className="nav-icon" />
                  <span
                    className="admin-nav-label"
                    style={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 200 }}
                  >
                    {link.label}
                  </span>
                  {collapsed && (
                    <span className="admin-nav-tooltip">{link.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="admin-sidebar-footer">
            <button
              className="admin-logout-btn"
              onClick={async () => {
                try {
                  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                    method: "POST",
                    credentials: "include",
                  });
                } catch {}
                document.cookie = "user_role=; path=/; max-age=0";
                window.location.href = "/login";
              }}
            >
              <LogOut size={20} style={{ flexShrink: 0 }} />
              <span
                className="admin-logout-label"
                style={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 200 }}
              >
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}