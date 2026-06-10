"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const noSidebarExact = ["/"];
  const noSidebarPrefix = [
    "/login",
    "/signup",
    "/verify",
    "/auth",
    "/forgot-password",
    "/ict-dashboard",
    "/admin",
  ];

  const hideSidebar =
    noSidebarExact.includes(pathname) ||
    noSidebarPrefix.some((route) => pathname.startsWith(route));

  if (hideSidebar) {
    return (
      <div style={{ width: "100%", minHeight: "100vh", display: "flex" }}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, overflowY: "auto", height: "100vh" }}>
        {children}
      </main>
    </div>
  );
}