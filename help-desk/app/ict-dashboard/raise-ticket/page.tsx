"use client";

import React, { useState } from "react";
import { Monitor, Wrench, Network, AlertCircle, Send, CheckCircle2 } from "lucide-react";

type Category = "Hardware" | "Software" | "Network" | "Access" | null;

export default function StandaloneRaiseTicketPage() {
  
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>(null);
  const [description, setDescription] = useState("");
  const [showCategoryError, setShowCategoryError] = useState(false);

 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Explicit Validation Check
    if (!category) {
      setShowCategoryError(true);
      return;
    }

    // Reset layout alerts and engage loading spinner state
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    // 1. Get the URL and safely remove any accidental trailing slashes from the .env file
    const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const cleanBaseUrl = rawBaseUrl.replace(/\/$/, ""); 

    // Normalizing payload format to match backend expected casing specifications
    const payload = {
      title: title.trim(),
      description: description.trim(),
      category: category.toLowerCase(), // Maps "Hardware" -> "hardware"
    };

    try {
      // 2. Safely construct the exact URL (no double slashes!)
      const targetUrl = `${cleanBaseUrl}/tickets/`;
      
      // ⏳ THIS IS WHERE IT WAITS FOR THE BACKEND TO RECEIVE IT ⏳
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensures session cookies propagate correctly
        body: JSON.stringify(payload),
      });

      // If the backend rejects it, throw an error
      if (!response.ok) {
        throw new Error(`Server returned HTTP status code ${response.status}`);
      }

      // ✅ IF WE REACH THIS LINE, THE BACKEND HAS SUCCESSFULLY SAVED IT ✅
      setSubmitStatus({
        type: "success",
        message: "Ticket created successfully!",
      });
      
      // Flash purge standard form parameters upon completion
      handleClear(false); 
      
      // Auto-hide the flash message after 5 seconds
      setTimeout(() => {
        setSubmitStatus({ type: null, message: "" });
      }, 5000);

    } catch (error) {
      console.error("Network write exception occurred:", error);
      setSubmitStatus({
        type: "error",
        message: error instanceof Error ? error.message : "An unexpected network error occurred.",
      });
      
      // Auto-hide the error message after 5 seconds too
      setTimeout(() => {
        setSubmitStatus({ type: null, message: "" });
      }, 5000);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = (resetAlerts = true) => {
    setTitle("");
    setCategory(null);
    setDescription("");
    setShowCategoryError(false);
    if (resetAlerts) {
      setSubmitStatus({ type: null, message: "" });
    }
  };

  const categories = [
    { id: "Hardware", icon: Monitor, label: "Hardware", sub: "Monitors, Printers, etc." },
    { id: "Software", icon: Wrench, label: "Software", sub: "Apps, Installations" },
    { id: "Network", icon: Network, label: "Network", sub: "WiFi, Internet, VPN" },
    { id: "Access", icon: AlertCircle, label: "Access", sub: "Logins, Permissions" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] font-sans p-6 sm:p-12 flex flex-col items-center overflow-y-auto selection:bg-orange-100 relative">
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
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none text-sm placeholder:text-gray-400 focus:border-[#b34000] focus:ring-1 focus:ring-[#b34000] transition-colors disabled:bg-gray-50 disabled:text-gray-400"
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
                      disabled={isSubmitting}
                      onClick={() => {
                        setCategory(cat.id as Category);
                        setShowCategoryError(false);
                      }}
                      className={`flex flex-col items-center justify-center p-6 rounded-lg border transition-all duration-150 ${
                        isSelected
                          ? "border-[#b34000] bg-orange-50/20 ring-1 ring-[#b34000]"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                      } disabled:opacity-60 disabled:hover:bg-white`}
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
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none text-sm placeholder:text-gray-400 focus:border-[#b34000] focus:ring-1 focus:ring-[#b34000] transition-colors resize-y disabled:bg-gray-50 disabled:text-gray-400"
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
                disabled={isSubmitting}
                onClick={() => handleClear(true)}
                className="px-6 py-2.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Clear Form
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#b34000] rounded-lg hover:bg-[#963500] active:bg-[#782b00] transition-colors shadow-sm disabled:bg-orange-800/50 disabled:cursor-not-allowed"
              >
                <Send size={13} strokeWidth={2.5} />
                {isSubmitting ? "Submitting..." : "Create Ticket"}
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

      {/* ── Floating Bottom Flash Message ── */}
      {submitStatus.type && (
        <div 
          className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300"
        >
          <div 
            className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${
              submitStatus.type === "success" 
                ? "bg-white border-green-200 text-green-800" 
                : "bg-white border-red-200 text-red-800"
            }`}
          >
            {submitStatus.type === "success" ? (
              <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-500 shrink-0" />
            )}
            <div className="text-sm font-bold tracking-wide">{submitStatus.message}</div>
          </div>
        </div>
      )}

    </div>
  );
}