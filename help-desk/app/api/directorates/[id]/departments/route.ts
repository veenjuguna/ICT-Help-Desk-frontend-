import { NextResponse } from "next/server";

const DEPARTMENTS: Record<number, { id: number; name: string }[]> = {
  1: [
    { id: 101, name: "Macro and Fiscal Affairs Department" },
    { id: 102, name: "Budget Department" },
    { id: 103, name: "Financial and Sectoral Affairs Department" },
    { id: 104, name: "Inter-Governmental Fiscal Relations Department" },
    { id: 105, name: "Public Procurement Department" },
  ],
  2: [
    { id: 201, name: "Resource Mobilization Department" },
    { id: 202, name: "Debt Policy, Strategy and Risk Management Department" },
    { id: 203, name: "Debt Recording and Settlement Department" },
  ],
  3: [
    { id: 301, name: "Government Accounting Services Department" },
    { id: 302, name: "Internal Audit Department" },
    { id: 303, name: "Financial Management Information Services (IFMIS) Department" },
    { id: 304, name: "National Sub-County Treasuries Department" },
    { id: 305, name: "Government Digital Payment Unit" },
  ],
  4: [
    { id: 401, name: "Government Investment and Public Enterprises Department" },
    { id: 402, name: "Public Investment Management (PIM) Unit" },
    { id: 403, name: "Pensions Department" },
    { id: 404, name: "National Assets and Liabilities Management Department" },
  ],
  5: [],
  6: [
    { id: 601, name: "Human Resource Management & Development Department" },
    { id: 602, name: "Legal Department" },
    { id: 603, name: "Supply Chain Management Department" },
    { id: 604, name: "ICT Department" },
    { id: 605, name: "Central Planning Department" },
    { id: 606, name: "Public Communications Department" },
  ],
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = Number(params.id);
  const depts = DEPARTMENTS[id] ?? [];
  return NextResponse.json(depts);
}
