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
        <div className="flex h-screen overflow-hidden">
          <Sidebar />

          <div className="flex-1 flex flex-col overflow-y-auto">
            <Topbar />

            <main className="p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
