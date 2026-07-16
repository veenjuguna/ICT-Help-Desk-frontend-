import type { Metadata } from "next";
import "./globals.css";
import SidebarWrapper from "@/components/sidebar-wrapper";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "National Treasury IT Helpdesk",
  description: "ICT Support Portal – National Treasury & Economic Planning",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ display: "flex", minHeight: "100vh", margin: 0, padding: 0 }}>
        <Providers>
          <SidebarWrapper>
            {children}
          </SidebarWrapper>
        </Providers>
      </body>
    </html>
  );
}