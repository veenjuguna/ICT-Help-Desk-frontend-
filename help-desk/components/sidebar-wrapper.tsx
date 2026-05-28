"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/sidebar";

const NO_SIDEBAR = ["/", "/login", "/signup"];

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = !NO_SIDEBAR.includes(pathname);

  return (
    <>
      {showSidebar && <Sidebar />}
      <main style={{
        flex: 1,
        minWidth: 0,
        overflowY: "auto",
        height: "100vh",
        width: showSidebar ? undefined : "100%",
      }}>
        {children}
      </main>
    </>
  );
}