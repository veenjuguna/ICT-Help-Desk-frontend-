"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const noSidebarRoutes = [
    "/",
    "/login",
    "/signup",
    "/verify",
    "/forgot-password",
    "/ict-dashboard",
  ];

  const hideSidebar =
    noSidebarRoutes.some((route) => pathname.startsWith(route));

  if (hideSidebar) {
    return <>{children}</>;
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