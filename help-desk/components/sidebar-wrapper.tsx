"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/sidebar";

export default function SidebarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const noSidebarExact = ["/"];
  const noSidebarPrefix = [
    "/login",
    "/signup",
    "/verify",
    "/auth",
    "/forgot-password",
    "/ict-dashboard",
  ];

  const hideSidebar =
    noSidebarExact.includes(pathname) ||
    noSidebarPrefix.some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (hideSidebar) return; // don't check on public pages
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/me`, {
          credentials: "include",
        });
        if (res.status === 401) router.push("/login");
      } catch {
        router.push("/login");
      }
    })();
  }, [pathname]); // re-check on every page navigation

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", width: "100%" }}>
      <Sidebar />
      <main
        style={{ flex: 1, minWidth: 0, overflowY: "auto", height: "100vh" }}
      >
        {children}
      </main>
    </div>
  );
}
