"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";

type TicketCategory = "Hardware" | "Software" | "Network" | "Security" | string;

// The exact schema from your FastAPI backend screenshot
interface TicketAPI {
  id: number;
  staff_id: string;
  assigned_to_id: number | null;
  title: string;
  description: string;
  category: string;
  status: string;
  comment: string | null;
  resolution_notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  closed_at: string | null;
}

// Our Frontend UI schema
interface UnresolvedTicket {
  id: string;
  ticketNumber: string;
  raisedBy: string;
  category: TicketCategory;
  issue: string;
}

export default function UnresolvedTicketsPage() {
  const [activeTab, setActiveTab] = useState<TicketCategory>("Hardware");
  const [tickets, setTickets] = useState<UnresolvedTicket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ── API Fetch Logic ──
  const fetchUnresolvedTickets = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const cleanBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
      
      // 🔥 UPDATED: Now hitting your specific endpoint from the screenshot
      const res = await fetch(`${cleanBaseUrl}/tickets/team_unresolved`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch tickets. Status: ${res.status}`);
      }

      const data: TicketAPI[] = await res.json();
      console.log("🔥 REAL BACKEND DATA:", data);

      // Transform backend data to match our UI
      const mappedTickets: UnresolvedTicket[] = data
        // Filter out closed tickets just in case the backend sends them
        .filter((t) => t.status === "open" || t.status === "in_progress")
        .map((t) => {
          // Format category to match Tabs (e.g., "hardware" -> "Hardware")
          const formattedCategory = t.category
            ? t.category.charAt(0).toUpperCase() + t.category.slice(1).toLowerCase()
            : "General";

          // Shorten the UUID staff_id so it looks clean in the UI
          const shortStaffId = t.staff_id ? t.staff_id.split("-")[0] : "Unknown";

          return {
            id: String(t.id),
            ticketNumber: `TCK-${t.id}`,
            raisedBy: `Staff-${shortStaffId}`, // Placeholder until you link real names
            category: formattedCategory,
            issue: t.description || t.title || "No description provided.",
          };
        });

      setTickets(mappedTickets);
    } catch (err) {
      console.error("Failed to load unresolved tickets:", err);
      setError("Could not load tickets. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on page load
  useEffect(() => {
    fetchUnresolvedTickets();
  }, [fetchUnresolvedTickets]);

  // Filter tickets based on the currently selected tab
  const displayedTickets = tickets.filter((t) => t.category === activeTab);

  // Calculate counts for the tabs dynamically
  const getCount = (cat: string) => tickets.filter((t) => t.category === cat).length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#f7f3f0] font-sans h-screen">
      
      {/* ── Top Header ── */}
      <header className="flex items-center justify-between border-b border-[#e8e0d8] bg-white px-4 py-4 sm:px-8 shadow-sm z-10">
        <div className="flex items-center gap-4">
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
        </div>
        
        <button
          onClick={fetchUnresolvedTickets}
          disabled={isLoading}
          className="flex items-center justify-center p-2.5 rounded-lg border border-[#e8e0d8] text-[#6b4c38] hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50"
          title="Refresh Data"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
        </button>
      </header>

      {/* ── Category Tabs ── */}
      <div className="flex gap-2 px-4 sm:px-8 py-4 border-b border-[#e8e0d8] bg-[#fdfbf9] overflow-x-auto shrink-0">
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
              {getCount(category)}
            </span>
          </button>
        ))}
      </div>

      {/* ── Ticket List Area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 w-full gap-3">
            <RefreshCw size={28} className="animate-spin text-[#8a6a56]" />
            <p className="text-[#8a6a56] font-medium text-sm">Fetching backlog from server...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48 w-full gap-3">
            <p className="text-red-500 font-medium text-sm">{error}</p>
            <button
              onClick={fetchUnresolvedTickets}
              className="rounded-lg bg-[#44271a] px-4 py-2 text-sm text-white hover:bg-[#3a2016]"
            >
              Retry
            </button>
          </div>
        ) : displayedTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 rounded-xl border border-dashed border-[#d9cfc7] bg-white/50 max-w-4xl mx-auto w-full">
            <p className="text-[#9c8576] font-medium">No unresolved tickets in this category.</p>
            <p className="text-[#b0a09a] text-sm mt-1">All clear for {activeTab}!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            {displayedTickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className="bg-white rounded-xl border border-[#e8e0d8] shadow-sm hover:shadow-md transition-shadow p-4 flex items-center justify-between gap-6 w-full"
              >
                
                {/* Left Side: IDs, Categories, Raised By */}
                <div className="w-56 shrink-0 border-r border-[#e8e0d8] pr-4">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-[#1c1410] text-[16px]">{ticket.ticketNumber}</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#f7f3f0] text-[#6b5a4e] text-[10px] font-bold uppercase tracking-wider">
                      {ticket.category}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#9c8576]">
                    Raised by: <span className="text-[#4a3728] font-semibold">{ticket.raisedBy}</span>
                  </p>
                </div>

                {/* Middle: The Issue */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-[#4a3728] truncate">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#9c8576] mr-3">Issue:</span>
                    {ticket.issue}
                  </p>
                </div>

                {/* Right Side: View Button */}
                <div className="shrink-0 pl-4">
                  <Link 
                    href={`/ict-dashboard/tickets/${ticket.id}`}
                    className="flex items-center justify-center px-6 py-2.5 text-sm font-medium rounded-lg bg-[#44271a] text-white hover:bg-[#3a2016] transition-colors whitespace-nowrap shadow-sm"
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