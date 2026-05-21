import "./globals.css";
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";

export const metadata = {
  title: "IT Helpdesk Dashboard",
  description: "National Treasury IT Helpdesk",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-black">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Topbar */}
            <Topbar />

            {/* Page Content */}
            <main className="p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
