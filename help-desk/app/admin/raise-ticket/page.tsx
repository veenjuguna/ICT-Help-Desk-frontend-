"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Monitor, Network, Send, Shield, Wrench } from "lucide-react";

type Category = "hardware" | "software" | "network" | "security_incidents";

const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

const categories: { id: Category; label: string; icon: React.ElementType; desc: string }[] = [
  { id: "hardware", label: "Hardware", icon: Monitor, desc: "Monitors, printers, devices" },
  { id: "software", label: "Software", icon: Wrench, desc: "Apps and installations" },
  { id: "network", label: "Network", icon: Network, desc: "WiFi, internet, VPN" },
  { id: "security_incidents", label: "Security", icon: Shield, desc: "Logins and permissions" },
];

export default function AdminRaiseTicketPage() {
  const [staffId, setStaffId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/staff/me`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setStaffId(data.id ?? "");
        }
      } catch {}
    })();
  }, []);

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setMessage(null);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (!staffId) {
      setMessage({ type: "error", text: "Unable to identify your account. Please log in again." });
      return;
    }
    if (!category) {
      setMessage({ type: "error", text: "Please select an issue category." });
      return;
    }
    if (title.trim().length < 3 || description.trim().length < 5) {
      setMessage({ type: "error", text: "Add a clear title and at least 5 characters of description." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/tickets/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          staff_id: staffId,
          title: title.trim(),
          description: description.trim(),
          category,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = data?.detail;
        throw new Error(typeof detail === "string" ? detail : `Ticket creation failed (${res.status})`);
      }
      setTitle("");
      setDescription("");
      setCategory("");
      setMessage({ type: "success", text: "Ticket submitted successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .admin-ticket-form-root { min-height: 100vh; background: #FDF8F2; color: #1A0F08; font-family: 'Plus Jakarta Sans', Inter, system-ui, sans-serif; padding: 28px 32px; }
        .admin-ticket-form-wrap { max-width: 980px; }
        .admin-ticket-form-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
        .admin-ticket-form-header h1 { margin: 0; color: #4A1E0A; font-size: 1.45rem; font-weight: 800; }
        .admin-ticket-form-header p { margin: 4px 0 0; color: #7A5C44; font-size: 0.85rem; }
        .admin-ticket-card { background: #fff; border: 1px solid #EDE0D0; border-radius: 12px; box-shadow: 0 2px 8px rgba(107,45,15,0.05); padding: 28px; }
        .admin-ticket-field { margin-bottom: 22px; }
        .admin-ticket-label { display: block; margin-bottom: 8px; color: #1A0F08; font-size: 0.84rem; font-weight: 700; }
        .admin-ticket-input, .admin-ticket-textarea { width: 100%; border: 1.5px solid #E0D0C0; border-radius: 8px; background: #fff; color: #1A0F08; font: inherit; font-size: 0.9rem; outline: none; padding: 11px 13px; transition: border-color 0.15s, box-shadow 0.15s; }
        .admin-ticket-input:focus, .admin-ticket-textarea:focus { border-color: #C8962E; box-shadow: 0 0 0 3px rgba(200,150,46,0.14); }
        .admin-ticket-textarea { min-height: 150px; resize: vertical; }
        .admin-category-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .admin-category-btn { border: 1.5px solid #E0D0C0; background: #fff; border-radius: 10px; min-height: 124px; padding: 16px 12px; cursor: pointer; color: #7A5C44; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px; transition: border-color 0.15s, background 0.15s, color 0.15s; font-family: inherit; }
        .admin-category-btn:hover { border-color: #C8962E; background: #FDFAF6; }
        .admin-category-btn.selected { border-color: #6B2D0F; background: #F5EDE3; color: #6B2D0F; box-shadow: 0 0 0 1px rgba(107,45,15,0.15); }
        .admin-category-title { font-size: 0.85rem; font-weight: 800; color: inherit; }
        .admin-category-desc { font-size: 0.73rem; color: #7A5C44; text-align: center; line-height: 1.35; }
        .admin-ticket-help { margin-top: 7px; color: #7A5C44; font-size: 0.78rem; }
        .admin-ticket-message { margin-bottom: 18px; border-radius: 8px; padding: 11px 13px; font-size: 0.84rem; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .admin-ticket-message.success { background: #F0FDF4; color: #166534; border: 1px solid #BBF7D0; }
        .admin-ticket-message.error { background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; }
        .admin-ticket-actions { display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #F5EDE0; padding-top: 20px; }
        .admin-ticket-btn { border: 1.5px solid #E0D0C0; border-radius: 8px; padding: 10px 18px; font: inherit; font-size: 0.84rem; font-weight: 700; cursor: pointer; transition: background 0.15s, border-color 0.15s; }
        .admin-ticket-btn.secondary { background: #fff; color: #7A5C44; }
        .admin-ticket-btn.secondary:hover { background: #FDFAF6; border-color: #C8962E; }
        .admin-ticket-btn.primary { background: #6B2D0F; border-color: #6B2D0F; color: #fff; display: inline-flex; align-items: center; gap: 8px; }
        .admin-ticket-btn.primary:hover:not(:disabled) { background: #4A1E0A; }
        .admin-ticket-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        @media (max-width: 900px) { .admin-category-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 640px) { .admin-ticket-form-root { padding: 18px; } .admin-ticket-card { padding: 20px; } .admin-category-grid { grid-template-columns: 1fr; } .admin-ticket-actions { flex-direction: column-reverse; } .admin-ticket-btn { width: 100%; justify-content: center; } }
      `}</style>

      <div className="admin-ticket-form-root">
        <div className="admin-ticket-form-wrap">
          <div className="admin-ticket-form-header">
            <div>
              <h1>Raise Ticket</h1>
              <p>Submit an ICT support request from the admin portal.</p>
            </div>
          </div>

          <form className="admin-ticket-card" onSubmit={submit}>
            {message && (
              <div className={`admin-ticket-message ${message.type}`}>
                {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {message.text}
              </div>
            )}

            <div className="admin-ticket-field">
              <label className="admin-ticket-label" htmlFor="ticket-title">Issue Title</label>
              <input id="ticket-title" className="admin-ticket-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Cannot access email" disabled={loading} />
            </div>

            <div className="admin-ticket-field">
              <span className="admin-ticket-label">Issue Category</span>
              <div className="admin-category-grid">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button key={cat.id} type="button" className={`admin-category-btn${category === cat.id ? " selected" : ""}`} onClick={() => setCategory(cat.id)} disabled={loading}>
                      <Icon size={26} />
                      <span className="admin-category-title">{cat.label}</span>
                      <span className="admin-category-desc">{cat.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="admin-ticket-field">
              <label className="admin-ticket-label" htmlFor="ticket-description">Description of Problem</label>
              <textarea id="ticket-description" className="admin-ticket-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue in detail..." disabled={loading} />
              <p className="admin-ticket-help">Minimum 5 characters required.</p>
            </div>

            <div className="admin-ticket-actions">
              <button type="button" className="admin-ticket-btn secondary" onClick={clearForm} disabled={loading}>Clear Form</button>
              <button type="submit" className="admin-ticket-btn primary" disabled={loading}>
                <Send size={15} />
                {loading ? "Submitting..." : "Create Ticket"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
