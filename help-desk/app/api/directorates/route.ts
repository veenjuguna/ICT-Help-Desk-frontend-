import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([
    { id: 1, name: "Directorate of Budget, Fiscal and Economic Affairs" },
    { id: 2, name: "Directorate of Public Debt Management" },
    { id: 3, name: "Directorate of Accounting Services & Quality Assurance" },
    { id: 4, name: "Directorate of Public Investment & Portfolio Management" },
    { id: 5, name: "Public Private Partnerships (PPP) Directorate" },
    { id: 6, name: "Directorate of Administrative and Support Services" },
  ]);
}
