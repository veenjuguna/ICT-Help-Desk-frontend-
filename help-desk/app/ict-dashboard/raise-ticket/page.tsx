"use client";

import React, { useState } from "react";
import { Monitor, Wrench, Network, AlertCircle, Send } from "lucide-react";

type Category = "Hardware" | "Software" | "Network" | "Access" | null;

export default function StandaloneRaiseTicketPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>(null);
  const [description, setDescription] = useState("");
  const [showCategoryError, setShowCategoryError] = useState(true); // Default to true to match screenshot state

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      setShowCategoryError(true);
      return;
    }
    console.log({ title, category, description });
    alert("Ticket created successfully!");
    handleClear();
  };

  const handleClear = () => {
    setTitle("");
    setCategory(null);
    setDescription("");
    setShowCategoryError(true);
  };

  const categories = [
    { id: "Hardware", icon: Monitor, label: "Hardware", sub: "Monitors, Printers, etc." },
    { id: "Software", icon: Wrench, label: "Software", sub: "Apps, Installations" },
    { id: "Network", icon: Network, label: "Network", sub: "WiFi, Internet, VPN" },
    { id: "Access", icon: AlertCircle, label: "Access", sub: "Logins, Permissions" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] font-sans p-6 sm:p-12 flex flex-col items-center overflow-y-auto selection:bg-orange-100">
      <div className="w-full max-w-5xl">
        
        {/* ── Header Area ── */}
        <div className="mb-8 w-full flex flex-col items-start pl-1">
          <h1 className="text-[34px] font-bold text-gray-950 tracking-tight">Request Assistance</h1>
          <p className="text-sm text-gray-500 mt-1.5">Submit a new IT support ticket</p>
        </div>

        {/* ── Main Form Card ── */}
        <div className="bg-white w-full rounded-xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] border border-gray-200 overflow-hidden mb-6">
          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-7">
            
            {/* Issue Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2.5">
                Issue Title <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cannot connect to VPN"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none text-sm placeholder:text-gray-400 focus:border-[#b34000] focus:ring-1 focus:ring-[#b34000] transition-colors"
                required
              />
            </div>

            {/* Issue Category Grid */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2.5">
                Issue Category <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategory(cat.id as Category);
                        setShowCategoryError(false);
                      }}
                      className={`flex flex-col items-center justify-center p-6 rounded-lg border transition-all duration-150 ${
                        isSelected
                          ? "border-[#b34000] bg-orange-50/20 ring-1 ring-[#b34000]"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                      }`}
                    >
                      <Icon 
                        size={26} 
                        strokeWidth={1.25}
                        className={`mb-3 ${isSelected ? "text-[#b34000]" : "text-gray-400"}`} 
                      />
                      <span className={`text-sm font-bold tracking-tight ${isSelected ? "text-[#b34000]" : "text-gray-800"}`}>
                        {cat.label}
                      </span>
                      <span className="text-[11px] text-gray-400 mt-1.5 text-center leading-normal">
                        {cat.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
              {showCategoryError && !category && (
                <p className="text-[11px] text-red-500 mt-3 font-medium tracking-wide pl-0.5">
                  Please select a category.
                </p>
              )}
            </div>

            {/* Description Area */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2.5">
                Description of Problem <span className="text-red-500 font-bold">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe your issue in detail..."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none text-sm placeholder:text-gray-400 focus:border-[#b34000] focus:ring-1 focus:ring-[#b34000] transition-colors resize-y"
                required
                minLength={5}
              />
              <p className="text-[11px] text-gray-400 mt-2.5 pl-0.5">
                Minimum 5 characters required.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-5 border-t border-gray-100 flex items-center justify-end gap-3.5">
              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-2.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                Clear Form
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#b34000] rounded-lg hover:bg-[#963500] active:bg-[#782b00] transition-colors shadow-sm"
              >
                <Send size={13} strokeWidth={2.5} />
                Create Ticket
              </button>
            </div>
          </form>
        </div>

        {/* ── Descriptive Help Footer ── */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-[0_1px_6px_rgba(0,0,0,0.02)] w-full">
          <h3 className="text-sm font-bold text-[#b34000] mb-5 tracking-tight">Need Help Choosing?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3.5 text-xs text-gray-500 leading-relaxed">
            <p>
              <strong className="text-gray-900 font-bold">Hardware:</strong> Physical devices (Monitors, Printers, Keyboards).
            </p>
            <p>
              <strong className="text-gray-900 font-bold">Software:</strong> Programs, Apps, Installation issues.
            </p>
            <p>
              <strong className="text-gray-900 font-bold">Network:</strong> Internet, WiFi, VPN connectivity.
            </p>
            <p>
              <strong className="text-gray-900 font-bold">Access:</strong> Login problems, Password resets, File permissions.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}