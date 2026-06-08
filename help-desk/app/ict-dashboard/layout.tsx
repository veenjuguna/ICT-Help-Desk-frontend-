import IctSidebar from "@/components/ICT/ict-sidebar";

export default function IctDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        width: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <IctSidebar />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          width: "100%",
          overflowY: "auto",
          height: "100vh",
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
        }}
        className="ict-main-content"
      >
        <style>{`
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            overflow-x: hidden;
          }
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
