"use client";

import { useState, useEffect } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
interface TeamMember {
  id: string;
  initials: string;
  name: string;
  role: string;
  status: "Available" | "Busy" | "Offline";
  active: number;
  completed: number;
  rating: number;
  specializations: string[];
  avgResolution: string;
}

// ── API Types ─────────────────────────────────────────────────────────────────
interface IctPersonnelAPI {
  id: number;
  specialization: string | null;
  availability: string;
  is_active: boolean;
  staff: {
    full_name: string;
    office_location: string | null;
  } | null;
}

interface TicketsByPersonnelAPI {
  personnel_id: number;
  tickets: {
    open?: number;
    in_progress?: number;
    closed?: number;
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatSpecialization(spec: string | null): string {
  if (!spec) return "General";
  return spec
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function mapAvailability(availability: string): TeamMember["status"] {
  if (availability === "AVAILABLE") return "Available";
  if (availability === "BUSY") return "Busy";
  return "Offline";
}

// ── Real API Fetch ────────────────────────────────────────────────────────────
async function fetchTeamMembers(): Promise<TeamMember[]> {
  const base = process.env.NEXT_PUBLIC_API_URL;

  const [personnelRes, ticketsRes] = await Promise.all([
    fetch(`${base}/ict-personnel/`, { credentials: "include" }),
    fetch(`${base}/tickets/admin/by-personnel`, { credentials: "include" }),
  ]);

  if (!personnelRes.ok) throw new Error("Failed to fetch ICT personnel.");
  if (!ticketsRes.ok) throw new Error("Failed to fetch ticket data.");

  const personnel: IctPersonnelAPI[] = await personnelRes.json();
  const ticketData: TicketsByPersonnelAPI[] = await ticketsRes.json();

  // Build a lookup map: personnel_id → ticket counts
  const ticketMap = new Map<number, TicketsByPersonnelAPI["tickets"]>();
  for (const entry of ticketData) {
    ticketMap.set(entry.personnel_id, entry.tickets);
  }

  return personnel.map((p) => {
    const tickets = ticketMap.get(p.id) ?? {};
    const active = (tickets.open ?? 0) + (tickets.in_progress ?? 0);
    const completed = tickets.closed ?? 0;
    const name = p.staff?.full_name ?? "Unknown";

    return {
      id: String(p.id),
      initials: getInitials(name),
      name,
      role: formatSpecialization(p.specialization),
      status: mapAvailability(p.availability),
      active,
      completed,
      rating: 0,       // no ratings yet
      specializations: p.specialization ? [formatSpecialization(p.specialization)] : ["General"],
      avgResolution: "—", // no resolution time data yet
    };
  });
}

// ── Icons (Kept exactly as you wrote them) ───────────────────────────────────
function IconTeam() { return <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/></svg>; }
function IconTrend() { return <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"/></svg>; }
function IconUser() { return <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/></svg>; }

// ── Shared UI Components (Kept exactly as you wrote them) ─────────────────────
function StatCard({ icon, value, label, sublabel }: { icon?: React.ReactNode; value: string | number; label: string; sublabel?: string; }) {
  return (
    <div className="rounded-xl border border-[#e8e0d8] bg-white px-6 py-5">
      {icon && <div className="mb-3 text-[#8a6a56]">{icon}</div>}
      <p className="text-[28px] font-bold leading-tight text-[#1c1410]">{value}</p>
      <p className="mt-0.5 text-sm text-[#6b5a4e]">{label}</p>
      {sublabel && <p className="text-xs text-[#9c8576]">{sublabel}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: TeamMember["status"] }) {
  const dotColor = status === "Available" ? "bg-green-500" : status === "Busy" ? "bg-amber-400" : "bg-gray-400";
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-[#e8e0d8] bg-white px-3 py-1 text-xs font-medium text-[#4a3728]">
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="rounded-xl border border-[#e8e0d8] bg-white px-6 py-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8ddd5] text-sm font-semibold text-[#6b4c38]">{member.initials}</div>
          <div>
            <h3 className="text-[15px] font-semibold text-[#1c1410]">{member.name}</h3>
            <p className="text-xs text-[#9c8576]">{member.role}</p>
          </div>
        </div>
        <StatusBadge status={member.status} />
      </div>
      <div className="mb-4 grid grid-cols-3">
        <div><p className="text-[11px] uppercase tracking-wide text-[#9c8576]">Active</p><p className="mt-0.5 text-[22px] font-bold text-[#1c1410]">{member.active}</p></div>
        <div><p className="text-[11px] uppercase tracking-wide text-[#9c8576]">Completed</p><p className="mt-0.5 text-[22px] font-bold text-[#1c1410]">{member.completed}</p></div>
        <div><p className="text-[11px] uppercase tracking-wide text-[#9c8576]">Rating</p><p className="mt-0.5 text-[22px] font-bold text-[#1c1410]">{member.rating}%</p></div>
      </div>
      <div className="mb-4 h-px bg-[#ede8e3]" />
      <div className="mb-3">
        <p className="mb-2 text-[11px] text-[#9c8576]">Specialization</p>
        <div className="flex flex-wrap gap-1.5">
          {member.specializations.map((spec) => (
            <span key={spec} className="rounded-md border border-[#d9cfc7] px-2.5 py-0.5 text-xs text-[#4a3728]">{spec}</span>
          ))}
        </div>
      </div>
      <p className="text-xs text-[#9c8576]">Avg Resolution: <span className="font-semibold text-[#4a3728]">{member.avgResolution}</span></p>
    </div>
  );
}

// ── Dynamic Page Component ────────────────────────────────────────────────────
export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await fetchTeamMembers();
        setMembers(data);
      } catch (error) {
        console.error("Failed to fetch team members", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const totalMembers = members.length;
  const activeTickets = members.reduce((sum, member) => sum + member.active, 0);
  const completedToday = members.reduce((sum, member) => sum + member.completed, 0);
  const avgRating = totalMembers > 0
    ? Math.round(members.reduce((sum, member) => sum + member.rating, 0) / totalMembers)
    : 0;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#f7f3f0]">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-[#e8e0d8] bg-white px-4 py-4 sm:px-8">
        <div>
          <h1 className="text-[18px] font-bold text-[#1c1410]">ICT Support Team</h1>
          <p className="text-sm text-[#9c8576]">Manage team members and raise tickets</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-[#44271a] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#3a2016]">
          <span className="text-base leading-none">+</span> Raise Ticket
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-[#8a6a56]">Loading team data...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={<IconTeam />} value={totalMembers} label="Team Members" />
              <StatCard icon={<IconTrend />} value={activeTickets} label="Active Tickets" />
              <StatCard icon={<IconUser />} value={completedToday} label="Completed Today" />
              <StatCard value={`${avgRating}%`} label="Team Avg" sublabel="Satisfaction Rate" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {members.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}