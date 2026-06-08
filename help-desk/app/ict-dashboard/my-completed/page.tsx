"use client"; // This is required in Next.js to allow interactivity like onClick

import React, { useState } from 'react';
import Link from 'next/link'; // 1. Added the Next.js Link import here
import { CheckCircle2, Calendar, Search } from 'lucide-react';

// 1. Data Models
type FilterOption = 'Today' | 'Yesterday' | 'All';

interface Ticket {
  id: string;
  employeeName: string;
  department: string;
  issueTitle: string;
  issueCategory: string;
  priority: 'High' | 'Medium' | 'Low';
  resolutionTime: string;
  resolvedAgo: string;
  rating: string;
  dayGroup: FilterOption; // We added this to help us filter easily
}

// 2. Mock Data (Updated with tickets from your new screenshots)
const mockTickets: Ticket[] = [
  {
    id: 'TKT-005',
    employeeName: 'Ann Wanjiru',
    department: 'Planning',
    issueTitle: 'WiFi connectivity issue resolved',
    issueCategory: 'Network',
    priority: 'High',
    resolutionTime: '45 min',
    resolvedAgo: '10 min ago',
    rating: '5/5',
    dayGroup: 'Today',
  },
  {
    id: 'TKT-009',
    employeeName: 'Kevin Mutua',
    department: 'Procurement',
    issueTitle: 'Ordered replacement keyboard',
    issueCategory: 'Hardware',
    priority: 'Low',
    resolutionTime: '15 min',
    resolvedAgo: '25 min ago',
    rating: '5/5',
    dayGroup: 'Today',
  },
  {
    id: 'TKT-002',
    employeeName: 'Jane Kimani',
    department: 'ICT',
    issueTitle: 'MS Office activation completed',
    issueCategory: 'Software',
    priority: 'Medium',
    resolutionTime: '1.5 hours',
    resolvedAgo: 'Yesterday 16:30',
    rating: '5/5',
    dayGroup: 'Yesterday',
  },
  {
    id: 'TKT-004',
    employeeName: 'Paul Wekesa',
    department: 'Economic Affairs',
    issueTitle: 'Printer color printing restored',
    issueCategory: 'Hardware',
    priority: 'Low',
    resolutionTime: '40 min',
    resolvedAgo: 'Yesterday 14:20',
    rating: '4/5',
    dayGroup: 'Yesterday',
  },
];

// An array of our filter options to keep our code DRY
const filterOptions: FilterOption[] = ['Today', 'Yesterday', 'All'];

export default function MyCompletedPage() {
  // 3. State Management
  // activeFilter holds the current value, setActiveFilter is the function to change it
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');

  // 4. Data Derivation (Filtering)
  // This runs every time the state changes. Time complexity: O(n)
  const displayedTickets = mockTickets.filter((ticket) => {
    if (activeFilter === 'All') return true;
    return ticket.dayGroup === activeFilter;
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-800">
      
      {/* HEADER */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Completed Tickets</h1>
        <p className="text-gray-500 text-sm mt-1">View your resolved support tickets</p>
      </header>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          {/* Changed text-gray-600 to text-[#7a4f31] */}
          <div className="p-3 bg-gray-50 rounded-full text-[#7a4f31]">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">5</p>
            <p className="text-sm text-gray-500">Completed Today</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          {/* Changed text-gray-600 to text-[#7a4f31] */}
          <div className="p-3 bg-gray-50 rounded-full text-[#7a4f31]">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">45</p>
            <p className="text-sm text-gray-500">This Month</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div>
            <p className="text-2xl font-bold text-gray-900">96%</p>
            <p className="text-sm text-gray-500 font-medium">Satisfaction Rate</p>
            <p className="text-xs text-gray-400 mt-1">Average rating</p>
          </div>
        </div>
      </div>

      {/* CONTROLS (Search & Filters) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1 w-full ml-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search completed tickets..." 
            className="w-full pl-10 pr-4 py-2 bg-transparent outline-none text-sm"
          />
        </div>
        
        {/* Dynamic Buttons */}
        <div className="flex gap-2 mr-2">
          {filterOptions.map((option) => (
            <button
              key={option}
              onClick={() => setActiveFilter(option)}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                activeFilter === option
                  ? 'bg-[#7a4f31] text-white' // Updated Active style to brand brown
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50' // Inactive style
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
          <h2 className="text-lg font-semibold text-gray-900">Resolved Tickets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Issue</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Resolution Time</th>
                <th className="px-6 py-4">Resolved</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedTickets.length > 0 ? (
                displayedTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-gray-400" />
                      <span className="font-medium">{ticket.id}</span>
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
                      {/* Updated Priority Colors */}
                      <span className={`text-xs font-medium ${
                        ticket.priority === 'High' ? 'text-[#b91c1c]' : 
                        ticket.priority === 'Medium' ? 'text-[#c2410c]' : 'text-gray-500'
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{ticket.resolutionTime}</td>
                    <td className="px-6 py-4 text-gray-600">{ticket.resolvedAgo}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{ticket.rating}</td>
                    <td className="px-6 py-4">
                      
                      {/* 2. Updated View button to a Dynamic Link */}
                      <Link 
                        href={`/tickets/${ticket.id}`} 
                        className="text-[#7a4f31] font-bold hover:underline"
                      >
                        View
                      </Link>

                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No tickets found for this period.
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