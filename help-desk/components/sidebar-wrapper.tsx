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

// Routes with their own dedicated layout/sidebar — hide the default sidebar,
// but they still need the auth check below.
const ownLayoutPrefix = ["/admin", "/ict-dashboard"];

// Fully public routes — no sidebar, no auth check.
const publicPrefix = [
  "/login",
  "/signup",
  "/verify",
  "/auth",
  "/forgot-password",
  "/policy"
];

const hideSidebar =
  noSidebarExact.includes(pathname) ||
  ownLayoutPrefix.some((route) => pathname.startsWith(route)) ||
  publicPrefix.some((route) => pathname.startsWith(route));

const isPublic =
  noSidebarExact.includes(pathname) ||
  publicPrefix.some((route) => pathname.startsWith(route));

useEffect(() => {
  if (isPublic) return; // only skip the check on truly public pages
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
}, [pathname, isPublic, router]); 

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
      <main
        style={{ flex: 1, minWidth: 0, overflowY: "auto", height: "100vh" }}
      >
        {children}
      </main>
    </div>
  );
}