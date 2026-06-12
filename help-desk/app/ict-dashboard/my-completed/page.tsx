"use client"; 

import React, { useState } from 'react';
import Link from 'next/link'; 
import { Clock, AlertCircle, Search, Timer } from 'lucide-react';

// 1. Data Models
type FilterOption = 'Today' | 'Yesterday' | 'All';

interface Ticket {
  id: string;
  employeeName: string;
  department: string;
  issueTitle: string;
  issueCategory: string;
  status: 'Open' | 'In Progress'; 
  submittedAgo: string;           
  dayGroup: FilterOption; 
}

// 2. Mock Data
const mockTickets: Ticket[] = [
  {
    id: 'TKT-011',
    employeeName: 'Ann Wanjiru',
    department: 'Planning',
    issueTitle: 'Cannot connect to departmental shared drive',
    issueCategory: 'Network',
    status: 'Open',
    submittedAgo: '10 min ago',
    dayGroup: 'Today',
  },
  {
    id: 'TKT-012',
    employeeName: 'Kevin Mutua',
    department: 'Procurement',
    issueTitle: 'Request for secondary monitor',
    issueCategory: 'Hardware',
    status: 'In Progress',
    submittedAgo: '2 hours ago',
    dayGroup: 'Today',
  },
  {
    id: 'TKT-014',
    employeeName: 'Jane Kimani',
    department: 'ICT',
    issueTitle: 'Email sync failing on mobile device',
    issueCategory: 'Software',
    status: 'Open',
    submittedAgo: 'Yesterday 16:30',
    dayGroup: 'Yesterday',
  },
  {
    id: 'TKT-015',
    employeeName: 'Paul Wekesa',
    department: 'Economic Affairs',
    issueTitle: 'Printer paper jam in Sector B',
    issueCategory: 'Hardware',
    status: 'In Progress',
    submittedAgo: 'Yesterday 14:20',
    dayGroup: 'Yesterday',
  },
];

const filterOptions: FilterOption[] = ['Today', 'Yesterday', 'All'];

export default function PendingTicketsPage() {
  // 3. State Management
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');

  // 4. Data Derivation (Filtering)
  const displayedTickets = mockTickets.filter((ticket) => {
    if (activeFilter === 'All') return true;
    return ticket.dayGroup === activeFilter;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-800">
      
      {/* HEADER */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pending Tickets</h1>
        <p className="text-gray-500 text-sm mt-1">Manage and track unresolved support requests</p>
      </header>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-full text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-sm text-gray-500">Total Pending</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-full text-red-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">3</p>
            <p className="text-sm text-gray-500">Urgent Issues</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <Timer size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">2.4h</p>
            <p className="text-sm text-gray-500 font-medium">Avg Wait Time</p>
          </div>
        </div>
      </div>

      {/* CONTROLS (Search & Filters) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 w-full ml-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search pending tickets..." 
            className="w-full pl-10 pr-4 py-2 bg-transparent outline-none text-sm"
          />
        </div>
        
        <div className="flex gap-2 mr-2">
          {filterOptions.map((option) => (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                activeFilter === option
                  ? 'bg-[#7a4f31] text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50' 
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Active Requests</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Issue</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedTickets.length > 0 ? (
                displayedTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 flex items-center gap-2">
                      <span className="font-medium text-gray-900">{ticket.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{ticket.employeeName}</p>
                      <p className="text-gray-500 text-xs">{ticket.department}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{ticket.issueTitle}</p>
                      <p className="text-gray-500 text-xs">{ticket.issueCategory}</p>
                    </td>
                    <td className="px-6 py-4">
                      {/* Status Badge */}
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                        ticket.status === 'Open' ? 'border-amber-200 bg-amber-50 text-amber-700' : 
                        'border-blue-200 bg-blue-50 text-blue-700'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{ticket.submittedAgo}</td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/tickets/${ticket.id}`} 
                        className="text-[#7a4f31] font-bold hover:underline"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No pending tickets found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}