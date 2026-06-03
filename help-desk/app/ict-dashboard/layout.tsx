import IctSidebar from "@/components/ICT/ict-sidebar";

export default function IctDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", margin: 0, padding: 0 }}>
      <IctSidebar />
      <main
        style={{ flex: 1, minWidth: 0, overflowY: "auto", height: "100vh" }}
        className="ict-main-content"
      >
        <style>{`
          @media (max-width: 768px) {
            .ict-main-content {
              padding-top: 54px;
            }
          }
        `}</style>
        {children}
      </main>
    </div>
  );
}