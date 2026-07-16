import AdminSidebar from "@/components/admin/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh", margin: 0, padding: 0, background: "#FDF8F2" }}>
      <AdminSidebar />
      <main style={{ flex: 1, minWidth: 0, overflowY: "auto", height: "100vh", background: "#FDF8F2" }}>
        {children}
      </main>
    </div>
  );
}