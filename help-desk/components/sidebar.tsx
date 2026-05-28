"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LifeBuoy,
  History,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/request", label: "Request Assistance", icon: LifeBuoy },
    { href: "/tickets", label: "Ticket History", icon: History },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <>
      <style>{`
        :root {
          --gold:        #C8962E;
          --gold-light:  #E8B84B;
          --brown-dark:  #4A1E0A;
          --sidebar-w:   260px;
          --sidebar-collapsed: 72px;
        }

        .sidebar {
          width: var(--sidebar-w);
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          transition: width 0.25s cubic-bezier(.4,0,.2,1);
          flex-shrink: 0;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
        }

        .sidebar.collapsed { width: var(--sidebar-collapsed); }

        /* background image + dark overlay */
        .sidebar-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .sidebar-bg-img {
          object-fit: cover;
          object-position: center;
        }

        .sidebar-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(74,30,10,0.82) 0%,
            rgba(50,15,5,0.90) 40%,
            rgba(30,8,2,0.95) 100%
          );
        }

        .sidebar-inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
        }

        /* ── HEADER: full TNT logo ── */
        .sidebar-header {
          padding: 1rem 0.85rem 1rem;
          border-bottom: 1px solid rgba(200,150,46,0.35);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          min-height: 72px;
          position: relative;
        }

        .header-logo-full {
          overflow: hidden;
          transition: opacity 0.2s, width 0.25s;
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
        }

        /* white pill background like the actual TNT logo */
        .logo-pill {
          background: rgba(255,255,255,0.95);
          border-radius: 8px;
          padding: 5px 10px;
          display: flex;
          align-items: center;
          border-left: 3px solid var(--gold);
          min-width: 0;
          overflow: hidden;
        }

        .sidebar.collapsed .header-logo-full {
          opacity: 0;
          width: 0;
          pointer-events: none;
        }

        /* small coat of arms icon when collapsed */
        .logo-icon-only {
          display: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255,255,255,0.95);
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 2px solid var(--gold);
          overflow: hidden;
          padding: 2px;
        }

        .sidebar.collapsed .logo-icon-only { display: flex; }

        /* ── COLLAPSE BUTTON ── */
        .collapse-btn {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--gold);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--brown-dark);
          flex-shrink: 0;
          transition: background 0.15s;
          position: absolute;
          right: -12px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 20;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        }

        .collapse-btn:hover { background: var(--gold-light); }

        /* ── SUB LABEL ── */
        .sidebar-sublabel {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          color: var(--gold-light);
          padding: 0.6rem 1rem 0.2rem;
          opacity: 0.8;
          white-space: nowrap;
          overflow: hidden;
          transition: opacity 0.2s;
        }

        .sidebar.collapsed .sidebar-sublabel { opacity: 0; }

        /* ── NAV ── */
        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0.25rem 0.5rem;
          flex: 1;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0.7rem 0.85rem;
          border-radius: 8px;
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 500;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
          overflow: hidden;
          position: relative;
        }

        .nav-link:hover {
          background: rgba(200,150,46,0.15);
          color: #fff;
        }

        .nav-link.active {
          background: rgba(200,150,46,0.2);
          color: #fff;
          border-left: 3px solid var(--gold);
          padding-left: calc(0.85rem - 3px);
        }

        .nav-icon { flex-shrink: 0; }

        .nav-label {
          transition: opacity 0.2s;
          overflow: hidden;
        }

        .sidebar.collapsed .nav-label {
          opacity: 0;
          width: 0;
        }

        .nav-link .tooltip {
          display: none;
          position: absolute;
          left: 60px;
          background: rgba(30,8,2,0.97);
          color: #fff;
          font-size: 12px;
          padding: 5px 10px;
          border-radius: 6px;
          white-space: nowrap;
          border: 1px solid var(--gold);
          pointer-events: none;
          z-index: 100;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }

        .sidebar.collapsed .nav-link:hover .tooltip { display: block; }

        /* ── FOOTER ── */
        .sidebar-footer {
          padding: 0.5rem;
          border-top: 1px solid rgba(200,150,46,0.2);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0.7rem 0.85rem;
          border-radius: 8px;
          color: rgba(255,255,255,0.55);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 13.5px;
          font-weight: 500;
          font-family: inherit;
          width: 100%;
          transition: background 0.15s, color 0.15s;
          white-space: nowrap;
          overflow: hidden;
          position: relative;
        }

        .logout-btn:hover {
          background: rgba(187,0,0,0.2);
          color: #ffaaaa;
        }

        .logout-label { transition: opacity 0.2s; }
        .sidebar.collapsed .logout-label { opacity: 0; width: 0; }

        .logout-btn .tooltip {
          display: none;
          position: absolute;
          left: 60px;
          background: rgba(30,8,2,0.97);
          color: #fff;
          font-size: 12px;
          padding: 5px 10px;
          border-radius: 6px;
          white-space: nowrap;
          border: 1px solid var(--gold);
          pointer-events: none;
          z-index: 100;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }

        .sidebar.collapsed .logout-btn:hover .tooltip { display: block; }
      `}</style>

      <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>

        {/* BACKGROUND IMAGE */}
        <div className="sidebar-bg">
          <Image
            src="/treasury-building.jpeg"
            alt=""
            fill
            className="sidebar-bg-img"
            priority
            quality={70}
            aria-hidden="true"
          />
          <div className="sidebar-bg-overlay" />
        </div>

        <div className="sidebar-inner">
          <div>
            {/* HEADER */}
            <div className="sidebar-header">

              {/* Full TNT logo on white pill — visible when expanded */}
              <div className="header-logo-full">
                <div className="logo-pill">
                  <Image
                    src="/tnt-logo-1.png"
                    alt="The National Treasury — Republic of Kenya"
                    width={180}
                    height={44}
                    style={{ objectFit: "contain", height: "34px", width: "auto" }}
                    priority
                  />
                </div>
              </div>

              {/* Just the coat of arms when collapsed */}
              <div className="logo-icon-only">
                <Image
                  src="/tnt-logo-1.png"
                  alt="NT"
                  width={36}
                  height={36}
                  style={{ objectFit: "cover", objectPosition: "left center", width: "100%", height: "100%" }}
                />
              </div>

              <button
                className="collapse-btn"
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
              </button>
            </div>

            {/* SUBLABEL */}
            <p className="sidebar-sublabel">IT Helpdesk</p>

            {/* NAV */}
            <nav className="sidebar-nav">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-link${isActive ? " active" : ""}`}
                  >
                    <Icon size={19} className="nav-icon" />
                    <span className="nav-label">{link.label}</span>
                    <span className="tooltip">{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* LOGOUT */}
          <div className="sidebar-footer">
            <button className="logout-btn">
              <LogOut size={19} />
              <span className="logout-label">Logout</span>
              <span className="tooltip">Logout</span>
            </button>
          </div>
        </div>

      </aside>
    </>
  );
}