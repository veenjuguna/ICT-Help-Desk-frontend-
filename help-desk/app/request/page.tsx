"use client"; // Required for Next.js App Router if using hooks

import { useState, useEffect } from "react";
import {
  Monitor,
  Wrench,
  Network,
  AlertCircle,
  Send,
  Clock,
} from "lucide-react";

export default function RequestPage() {
  const [staffId, setStaffId] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Fetch current user to get staff_id
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setStaffId(data.id);
        }
      } catch {}
    })();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (category: string) => {
    setFormData((prev) => ({ ...prev, category }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.category) {
      setError("Please select an issue category.");
      return;
    }
    if (!formData.title || formData.title.length < 3) {
      setError("Please enter a title for your issue.");
      return;
    }
    if (!formData.description || formData.description.length < 5) {
      setError("Please describe the issue in at least 5 characters.");
      return;
    }
    if (!staffId) {
      setError(
        "Unable to identify your account. Please log out and log back in.",
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tickets/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          staff_id: staffId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = data?.detail;
        const msg =
          typeof detail === "string"
            ? detail
            : Array.isArray(detail)
              ? detail.map((d: { msg?: string }) => d.msg).join(", ")
              : "Failed to submit ticket. Please try again.";
        setError(msg);
        return;
      }
      setSuccess(true);
      setFormData({ title: "", description: "", category: "" });
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Data for the Category Grid
  const categories = [
    {
      id: "hardware",
      label: "Hardware",
      icon: Monitor,
      desc: "Monitors, Printers, etc.",
    },
    {
      id: "software",
      label: "Software",
      icon: Wrench,
      desc: "Apps, Installations",
    },
    {
      id: "network",
      label: "Network",
      icon: Network,
      desc: "WiFi, Internet, VPN",
    },
    {
      id: "access_permissions",
      label: "Access",
      icon: AlertCircle,
      desc: "Logins, Permissions",
    },
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
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Cannot connect to VPN"
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-amber-700 transition"
            />
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
                      ${
                        isSelected
                          ? "border-amber-700 bg-amber-50 text-amber-900 shadow-md transform scale-[1.02]"
                          : "border-gray-200 hover:border-amber-400 hover:bg-gray-50 text-gray-700"
                      }
                    `}
                  >
                    <cat.icon
                      className={`w-8 h-8 mb-2 ${isSelected ? "text-amber-700" : "text-gray-500"}`}
                    />
                    <span className="font-semibold text-sm">{cat.label}</span>
                    <span className="text-xs text-gray-500 mt-1">
                      {cat.desc}
                    </span>
                  </button>
                );
              })}
            </div>
            {!formData.category && (
              <p className="text-xs text-red-500 mt-1">
                Please select a category.
              </p>
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
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-4 py-3">
              ✓ Ticket submitted successfully! Our ICT team will respond
              shortly.
            </p>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setFormData({ title: "", description: "", category: "" });
                setError("");
                setSuccess(false);
              }}
              className="border border-gray-300 px-6 py-3 rounded-md hover:bg-gray-50 text-gray-700 font-medium transition"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 rounded-md font-medium transition flex items-center gap-2 shadow-lg disabled:opacity-70"
            >
              <Send className="w-4 h-4" />
              {loading ? "Submitting..." : "Create Ticket"}
            </button>
          </div>
        </form>
      </div>

      {/* Category Guide (Kept for reference) */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-w-5xl">
        <h2 className="text-lg font-bold text-amber-700 mb-4">
          Need Help Choosing?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <p>
            <strong className="text-black">Hardware:</strong> Physical devices
            (Monitors, Printers, Keyboards).
          </p>
          <p>
            <strong className="text-black">Software:</strong> Programs, Apps,
            Installation issues.
          </p>
          <p>
            <strong className="text-black">Network:</strong> Internet, WiFi, VPN
            connectivity.
          </p>
          <p>
            <strong className="text-black">Access:</strong> Login problems,
            Password resets, File permissions.
          </p>
        </div>
      </div>
    </div>
  );
}
