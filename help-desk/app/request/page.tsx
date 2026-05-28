"use client"; // Required for Next.js App Router if using hooks

import { useState } from "react";
import { 
  Monitor, 
  Wrench, 
  Network, 
  AlertCircle, 
  Send, 
  Clock 
} from "lucide-react";

export default function RequestPage() {
  // 1. STATE MANAGEMENT
  // County and Urgency removed from the state object
  const [formData, setFormData] = useState({
    fullName: "John Kamau", 
    email: "john.kamau@treasury.go.ke",
    phone: "+254 700 123 456",
    department: "ICT Services",
    // 'county' removed
    officeNumber: "",
    category: "", // Starts empty, user must select
    // 'urgency' removed
    description: "",
  });

  // 2. HANDLE INPUT CHANGES
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 3. HANDLE CATEGORY SELECTION
  const handleCategorySelect = (category: string) => {
    setFormData((prev) => ({ ...prev, category }));
  };

  // 4. HANDLE SUBMIT
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Stop page reload

    // Simple Validation
    if (!formData.category) {
      alert("Please select an issue category.");
      return;
    }
    if (!formData.description || formData.description.length < 5) {
      alert("Please describe the issue in at least 5 characters.");
      return;
    }

    // LOGIC: In a real app, you would send this to Supabase/API here
    console.log("🚀 Submitting Ticket:", formData);
    
    // Updated alert: Removed urgency reference
    alert(`Ticket Submitted! \nCategory: ${formData.category}\nDescription: ${formData.description.substring(0, 20)}...`);
    
    // Optional: Reset form
    // setFormData({ ...initialState });
  };

  // Data for the Category Grid
  const categories = [
    { id: "Hardware", label: "Hardware", icon: Monitor, desc: "Monitors, Printers, etc." },
    { id: "Software", label: "Software", icon: Wrench, desc: "Apps, Installations" },
    { id: "Network", label: "Network", icon: Network, desc: "WiFi, Internet, VPN" },
    { id: "Access", label: "Access", icon: AlertCircle, desc: "Logins, Permissions" },
  ];

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-black">Request Assistance</h1>
        <p className="text-gray-500 mt-1">Submit a new IT support ticket</p>
      </div>

      {/* Form Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* --- Top Info Row (Grid) --- */}
          {/* Adjusted grid: Removed County, kept other fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-amber-700 transition"
              />
            </div>
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-amber-700 transition"
              />
            </div>
            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-amber-700 transition"
              />
            </div>
            {/* Department */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-amber-700 transition"
              />
            </div>
            {/* Office Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Office Number</label>
              <input
                type="text"
                name="officeNumber"
                placeholder="e.g Room 204"
                value={formData.officeNumber}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-amber-700 transition"
              />
            </div>
          </div>

          {/* --- Category Selector (Icons) --- */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Issue Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((cat) => {
                const isSelected = formData.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button" 
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`
                      flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all
                      ${isSelected 
                        ? "border-amber-700 bg-amber-50 text-amber-900 shadow-md transform scale-[1.02]" 
                        : "border-gray-200 hover:border-amber-400 hover:bg-gray-50 text-gray-700"}
                    `}
                  >
                    <cat.icon className={`w-8 h-8 mb-2 ${isSelected ? "text-amber-700" : "text-gray-500"}`} />
                    <span className="font-semibold text-sm">{cat.label}</span>
                    <span className="text-xs text-gray-500 mt-1">{cat.desc}</span>
                  </button>
                );
              })}
            </div>
            {!formData.category && (
              <p className="text-xs text-red-500 mt-1">Please select a category.</p>
            )}
          </div>

          {/* --- Description --- */}
          {/* Moved up to replace where Urgency used to be */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Description of Problem <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              placeholder="Please describe your issue in detail..."
              className="w-full border border-gray-300 rounded-md px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-amber-700 transition"
            />
            <p className="text-sm text-gray-500">
              Minimum 5 characters required.
            </p>
          </div>

          {/* --- Buttons --- */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, description: "", category: "" })}
              className="border border-gray-300 px-6 py-3 rounded-md hover:bg-gray-50 text-gray-700 font-medium transition"
            >
              Clear Form
            </button>
            <button
              type="submit"
              className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 rounded-md font-medium transition flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Send className="w-4 h-4" />
              Create Ticket
            </button>
          </div>
        </form>
      </div>

      {/* Category Guide (Kept for reference) */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-w-5xl">
        <h2 className="text-lg font-bold text-amber-700 mb-4">Need Help Choosing?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <p><strong className="text-black">Hardware:</strong> Physical devices (Monitors, Printers, Keyboards).</p>
          <p><strong className="text-black">Software:</strong> Programs, Apps, Installation issues.</p>
          <p><strong className="text-black">Network:</strong> Internet, WiFi, VPN connectivity.</p>
          <p><strong className="text-black">Access:</strong> Login problems, Password resets, File permissions.</p>
        </div>
      </div>
    </div>
  );
}