"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LifeBuoy,
  History,
  User,
  LogOut,
  
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Dashboard",          icon: LayoutDashboard },
    { href: "/request",   label: "Request Assistance", icon: LifeBuoy        },
    { href: "/tickets",   label: "Ticket History",     icon: History         },
    { href: "/profile",   label: "Profile",            icon: User            },

  ];

  return (
    <>
      <style>{`
        :root {
          --gold:       #C8962E;
          --gold-light: #E8B84B;
          --brown-dark: #4A1E0A;
        }

        .sidebar {
          width: 260px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          flex-shrink: 0;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
        }

        /* ── BACKGROUND ── */
        .sidebar-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .sidebar-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(74,30,10,0.84) 0%,
            rgba(50,15,5,0.92) 40%,
            rgba(30,8,2,0.96) 100%
          );
        }

        /* ── INNER ── */
        .sidebar-inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
        }

        /* ── HEADER ── */
        .sidebar-header {
          padding: 1.1rem 1rem;
          border-bottom: 1px solid rgba(200,150,46,0.3);
          display: flex;
          align-items: center;
          min-height: 72px;
        }

        /* ── SUBLABEL ── */
        .sublabel {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--gold-light);
          padding: 0.65rem 1rem 0.2rem;
          white-space: nowrap;
          opacity: 0.75;
        }

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
          padding: 0.72rem 0.85rem;
          border-radius: 8px;
          color: rgba(255,255,255,0.62);
          text-decoration: none;
          font-size: 13.5px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          transition: background 0.15s, color 0.15s;
        }

        .nav-link:hover {
          background: rgba(200,150,46,0.14);
          color: #fff;
        }

        .nav-link.active {
          background: rgba(200,150,46,0.22);
          color: #fff;
          border-left: 3px solid var(--gold);
          padding-left: calc(0.85rem - 3px);
        }

        .nav-icon { flex-shrink: 0; }

        /* ── FOOTER ── */
        .sidebar-footer {
          padding: 0.5rem;
          border-top: 1px solid rgba(200,150,46,0.18);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0.72rem 0.85rem;
          border-radius: 8px;
          color: rgba(255,255,255,0.5);
          background: none;
          border: none;
          cursor: pointer;
          font-size: 13.5px;
          font-weight: 500;
          font-family: inherit;
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          transition: background 0.15s, color 0.15s;
        }

        .logout-btn:hover {
          background: rgba(187,0,0,0.18);
          color: #ffaaaa;
        }
      `}</style>

      <aside className="sidebar">

        {/* BACKGROUND */}
        <div className="sidebar-bg">
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
          <div className="sidebar-bg-overlay" />
        </div>

        <div className="sidebar-inner">
          <div>

            {/* HEADER — logo with white filter applied */}
            <div className="sidebar-header">
              <Image
                src="/tnt-logo.jpeg"
                alt="The National Treasury — Republic of Kenya"
                width={190}
                height={48}
                style={{
                  objectFit: "contain",
                  height: "40px",
                  width: "auto",
                  maxWidth: "200px",
                  
                }}
                priority
              />
            </div>

            {/* SUBLABEL */}
            <p className="sublabel">IT Helpdesk</p>

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
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

          </div>

          {/* LOGOUT */}
          <div className="sidebar-footer">
            <button className="logout-btn">
              <LogOut size={19} />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}