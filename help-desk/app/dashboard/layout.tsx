export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ flex: 1, minWidth: 0, overflowY: "auto", height: "100vh" }}>
      {children}
    </div>
  );
}