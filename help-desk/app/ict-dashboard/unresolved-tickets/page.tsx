"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type TicketCategory = "Hardware" | "Software" | "Network" | "Security";

interface UnresolvedTicket {
  id: string;
  ticketNumber: string;
  raisedBy: string;
  category: TicketCategory;
  issue: string; // Updated to match your request
}

// ── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_UNRESOLVED_TICKETS: UnresolvedTicket[] = [
  { id: "1", ticketNumber: "TCK-1042", raisedBy: "Alice Johnson", category: "Hardware", issue: "Monitor on desk 4 isn't turning on. Power cable seems loose but replacing it didn't fix the issue." },
  { id: "2", ticketNumber: "TCK-1045", raisedBy: "Mark Smith", category: "Software", issue: "Adobe Premiere keeps crashing when rendering 4K video. Needs an urgent update or reinstall." },
  { id: "3", ticketNumber: "TCK-1048", raisedBy: "Sarah Lee", category: "Network", issue: "Wi-Fi in the conference room is dropping connections every 5 minutes during presentations." },
  { id: "4", ticketNumber: "TCK-1050", raisedBy: "David Kim", category: "Security", issue: "Received suspicious email from internal address asking for password reset. Flagged as phishing." },
  { id: "5", ticketNumber: "TCK-1051", raisedBy: "Emma Davis", category: "Hardware", issue: "Printer on 2nd floor is jamming repeatedly. Error code 49." },
];

export default function UnresolvedTicketsPage() {
  const [activeTab, setActiveTab] = useState<TicketCategory>("Hardware");

  // Filter tickets based on the currently selected tab
  const displayedTickets = MOCK_UNRESOLVED_TICKETS.filter(t => t.category === activeTab);

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#f7f3f0] font-sans h-screen">
      
      {/* ── Top Header ── */}
      <header className="flex items-center gap-4 border-b border-[#e8e0d8] bg-white px-4 py-4 sm:px-8 shadow-sm z-10">
        <Link 
          href="/ict-dashboard/team" 
          className="flex items-center justify-center p-2.5 rounded-lg border border-[#e8e0d8] text-[#6b5a4e] hover:bg-gray-50 transition-colors"
          title="Back to Team Dashboard"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-[18px] font-bold text-[#1c1410]">Unresolved Tickets</h1>
          <p className="text-sm text-[#9c8576]">Manage and review the current support backlog</p>
        </div>
      </header>

      {/* ── Category Tabs ── */}
      <div className="flex gap-2 px-4 sm:px-8 py-4 border-b border-[#e8e0d8] bg-[#fdfbf9] overflow-x-auto">
        {(["Hardware", "Software", "Network", "Security"] as TicketCategory[]).map((category) => (
          <button
            key={category}
            onClick={() => setActiveTab(category)}
            className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === category 
                ? "bg-[#44271a] text-white shadow-sm" 
                : "bg-white border border-[#e8e0d8] text-[#6b5a4e] hover:bg-[#f7f3f0]"
            }`}
          >
            {category}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === category ? "bg-white/20" : "bg-[#f7f3f0] text-[#8a6a56]"}`}>
              {MOCK_UNRESOLVED_TICKETS.filter(t => t.category === category).length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Ticket List Area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 max-w-4xl w-full mx-auto">
        {displayedTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 rounded-xl border border-dashed border-[#d9cfc7] bg-white/50">
            <p className="text-[#9c8576] font-medium">No unresolved tickets in this category.</p>
            <p className="text-[#b0a09a] text-sm mt-1">All clear for {activeTab}!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {displayedTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-xl border border-[#e8e0d8] overflow-hidden shadow-sm hover:shadow-md transition-shadow p-5">
                
                {/* Top Row: IDs and Categories */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-[#1c1410] text-lg">{ticket.ticketNumber}</span>
                      <span className="px-2.5 py-0.5 rounded-md bg-[#f7f3f0] text-[#6b5a4e] text-[11px] font-bold uppercase tracking-wider">
                        {ticket.category}
                      </span>
                    </div>
                    <p className="text-sm text-[#9c8576]">
                      Raised by: <span className="text-[#4a3728] font-semibold">{ticket.raisedBy}</span>
                    </p>
                  </div>
                </div>

                {/* Middle Row: The Issue (Visible by default) */}
                <div className="mb-5 p-4 rounded-lg bg-[#fcfafa] border border-[#f0ebe6]">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#9c8576] mb-1.5">Issue</p>
                  <p className="text-[14px] text-[#4a3728] leading-relaxed">
                    {ticket.issue}
                  </p>
                </div>

                {/* Bottom Row: View Button */}
                <div className="flex justify-end">
                  {/* 👉 REPLACE THIS HREF WITH YOUR ACTUAL VIEW URL WHEN READY */}
                  <Link 
                    href={`/ict-dashboard/tickets/${ticket.ticketNumber}`}
                    className="px-6 py-2.5 text-sm font-medium rounded-lg bg-[#f7f3f0] text-[#4a3728] border border-[#e8e0d8] hover:bg-[#ede8e3] transition-colors"
                  >
                    View Ticket
                  </Link>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}