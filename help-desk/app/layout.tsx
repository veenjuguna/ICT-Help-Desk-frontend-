import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/sidebar";

export const metadata: Metadata = {
  title: "National Treasury IT Helpdesk",
  description: "ICT Support Portal — National Treasury & Economic Planning",
};

// Pages that should NOT show the sidebar
const NO_SIDEBAR_ROUTES = ["/", "/login", "/signup"];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ display: "flex", minHeight: "100vh", margin: 0, padding: 0, overflow: "hidden" }}>
        <SidebarWrapper>
          {children}
        </SidebarWrapper>
      </body>
    </html>
  );
}

// We use a client component to conditionally show sidebar
import SidebarWrapper from "@/components/sidebar-wrapper";