"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Directorate {
  id: number;
  name: string;
}
interface Department {
  id: number;
  name: string;
}

interface FormState {
  personalNumber: string;
  fullName: string;
  jobTitle: string;
  phone: string;
  email: string;
  password: string;
  confirmPw: string;
  directorateId: string;
  departmentId: string;
  officeNumber: string;
  officeLocation: string;
  terms: boolean;
  dataConsent: boolean;
}

const EMPTY: FormState = {
  personalNumber: "",
  fullName: "", // ← was "   fullName"
  jobTitle: "", // ← was "   jobTitle"
  phone: "",
  email: "",
  password: "",
  confirmPw: "",
  directorateId: "",
  departmentId: "",
  officeNumber: "",
  officeLocation: "",
  terms: false,
  dataConsent: false,
};

const FALLBACK_DIRS: Directorate[] = [
  { id: 1, name: "Directorate of Budget, Fiscal and Economic Affairs" },
  { id: 2, name: "Directorate of Public Debt Management" },
  { id: 3, name: "Directorate of Accounting Services & Quality Assurance" },
  { id: 4, name: "Directorate of Public Investment & Portfolio Management" },
  { id: 5, name: "Public Private Partnerships (PPP) Directorate" },
  { id: 6, name: "Directorate of Administrative and Support Services" },
];

const FALLBACK_DEPTS: Record<string, Department[]> = {
  "1": [
    { id: 101, name: "Macro and Fiscal Affairs Department" },
    { id: 102, name: "Budget Department" },
    { id: 103, name: "Financial and Sectoral Affairs Department" },
    { id: 104, name: "Inter-Governmental Fiscal Relations Department" },
    { id: 105, name: "Public Procurement Department" },
  ],
  "2": [
    { id: 201, name: "Resource Mobilization Department" },
    { id: 202, name: "Debt Policy, Strategy and Risk Management Department" },
    { id: 203, name: "Debt Recording and Settlement Department" },
  ],
  "3": [
    { id: 301, name: "Government Accounting Services Department" },
    { id: 302, name: "Internal Audit Department" },
    {
      id: 303,
      name: "Financial Management Information Services (IFMIS) Department",
    },
    { id: 304, name: "National Sub-County Treasuries Department" },
    { id: 305, name: "Government Digital Payment Unit" },
  ],
  "4": [
    {
      id: 401,
      name: "Government Investment and Public Enterprises Department",
    },
    { id: 402, name: "Public Investment Management (PIM) Unit" },
    { id: 403, name: "Pensions Department" },
    { id: 404, name: "National Assets and Liabilities Management Department" },
  ],
  "5": [],
  "6": [
    { id: 601, name: "Human Resource Management & Development Department" },
    { id: 602, name: "Legal Department" },
    { id: 603, name: "Supply Chain Management Department" },
    { id: 604, name: "ICT Department" },
    { id: 605, name: "Central Planning Department" },
    { id: 606, name: "Public Communications Department" },
  ],
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [directorates, setDirectorates] = useState<Directorate[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDirs, setLoadingDirs] = useState(true);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Load directorates once
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}directorates/`,
        );
        if (!res.ok) throw new Error();
        setDirectorates(await res.json());
      } catch {
        setDirectorates(FALLBACK_DIRS);
      } finally {
        setLoadingDirs(false);
      }
    })();
  }, []);

  // Load departments when directorate changes — all setState inside async
  useEffect(() => {
    (async () => {
      if (!form.directorateId) {
        setDepartments([]);
        setLoadingDepts(false);
        return;
      }
      setLoadingDepts(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}directorates/${form.directorateId}/departments`,
        );
        if (!res.ok) throw new Error();
        setDepartments(await res.json());
      } catch {
        setDepartments(FALLBACK_DEPTS[form.directorateId] ?? []);
      } finally {
        setLoadingDepts(false);
      }
    })();
  }, [form.directorateId]);

  const set = (key: keyof FormState, val: string | boolean) =>
    setForm((f) => ({ ...f, [key]: val }));

  const pwStrength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const pwLabel = ["", "Weak", "Fair", "Good", "Strong"][pwStrength];
  const pwColor = ["", "#e74c3c", "#e67e22", "#f1c40f", "#27ae60"][pwStrength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPw) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!form.terms || !form.dataConsent) {
      setError("Please accept the Terms & Conditions and Data Access Consent.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personal_number: form.personalNumber,
          full_name: form.fullName,
          email: form.email,
          phone_number: form.phone,
          directorate_id: Number(form.directorateId),
          department_id: form.departmentId
            ? Number(form.departmentId)
            : undefined,
          job_title: form.jobTitle,
          office_number: form.officeNumber,
          office_location: form.officeLocation,
          role: "STAFF",
          password: form.password,
          confirm_password: form.confirmPw,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.detail ?? "Registration failed. Please try again.");
        return;
      }
      localStorage.setItem("pending_verify_email", form.email);
      router.push("/verify");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --brown-dark: #4A1E0A;
          --brown-main: #6B2D0F;
          --brown-mid:  #8B4513;
          --gold:       #C8962E;
          --gold-light: #E8B84B;
          --cream:      #FDF8F2;
          --border:     #E0D0C0;
          --text-main:  #1A0F08;
          --text-sub:   #7A5C44;
        }

        .su-root {
          display: flex;
          width: 100%;
          height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
          overflow: hidden;
        }

        /* LEFT — sticky, centered, never scrolls */
        .su-left {
          width: 42%;
          flex-shrink: 0;
          position: relative;
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
        }

        .su-left-overlay {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(160deg, rgba(74,30,10,0.55) 0%, rgba(50,15,5,0.82) 60%, rgba(30,8,2,0.94) 100%);
        }

        .su-left-content {
          position: relative; z-index: 2;
          padding: 3rem 2.75rem;
          display: flex; flex-direction: column; gap: 1.1rem;
        }

        .su-logo-wrap {
          display: inline-flex; align-items: center;
          background: rgba(255,255,255,0.95);
          padding: 7px 14px; border-radius: 9px;
          border-left: 4px solid var(--gold);
          width: fit-content;
        }

        .su-tagline {
          font-size: 10.5px; font-weight: 700;
          letter-spacing: 2.5px; text-transform: uppercase;
          color: var(--gold-light);
        }

        .su-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.1rem; font-weight: 700;
          color: #fff; line-height: 1.25;
        }

        .su-title span { color: var(--gold-light); }

        .su-divider { width: 48px; height: 3px; background: var(--gold); border-radius: 2px; }

        .su-desc {
          font-size: 13px; color: rgba(255,255,255,0.62);
          line-height: 1.75; max-width: 290px;
        }

        .su-steps {
          display: flex; flex-direction: column; gap: 0.8rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255,255,255,0.14);
        }

        .su-step {
          display: flex; align-items: flex-start; gap: 0.65rem;
          font-size: 12.5px; color: rgba(255,255,255,0.65); line-height: 1.5;
        }

        .su-step-dot {
          width: 22px; height: 22px; border-radius: 50%;
          background: rgba(200,150,46,0.22); border: 1.5px solid var(--gold);
          color: var(--gold-light); font-size: 11px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; margin-top: 1px;
        }

        /* RIGHT — only this scrolls */
        .su-right {
          flex: 1; min-width: 0;
          height: 100vh;
          overflow-y: auto;
          background: var(--cream);
          display: flex; flex-direction: column;
          align-items: center;
          padding: 2.5rem 2rem 3rem;
        }

        .su-card {
          background: #fff; border-radius: 18px;
          border: 1px solid var(--border);
          padding: 2.25rem 2.25rem 2rem;
          width: 100%; max-width: 500px;
          box-shadow: 0 8px 32px rgba(107,45,15,0.08);
        }

        .su-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: var(--gold); margin-bottom: 0.35rem;
        }

        .su-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.7rem; font-weight: 600;
          color: var(--text-main); margin-bottom: 0.3rem;
        }

        .su-card-sub { font-size: 13px; color: var(--text-sub); margin-bottom: 1.5rem; }

        .su-section {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 1.5px; color: var(--brown-main);
          padding-bottom: 0.5rem; border-bottom: 1px solid #e8ddd4;
          margin-bottom: 1rem; margin-top: 1.5rem;
        }

        .su-section:first-of-type { margin-top: 0; }

        .su-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; }

        .su-field { display: flex; flex-direction: column; gap: 0.3rem; }
        .su-field.full { grid-column: 1 / -1; }

        .su-field label {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.4px; color: var(--text-main);
        }

        .su-field label span { color: #c0392b; margin-left: 2px; }

        .su-input-wrap { position: relative; }

        .su-input-wrap input,
        .su-input-wrap select {
          width: 100%; padding: 0.68rem 0.9rem;
          border: 1.5px solid var(--border); border-radius: 9px;
          font-size: 13.5px; font-family: inherit;
          background: var(--cream); color: var(--text-main);
          outline: none; appearance: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        }

        .su-input-wrap input:focus,
        .su-input-wrap select:focus {
          border-color: var(--brown-mid); background: #fff;
          box-shadow: 0 0 0 3px rgba(139,69,19,0.09);
        }

        .su-input-wrap input::placeholder { color: #C0A882; font-size: 13px; }
        .su-input-wrap select:disabled { background: #f5ede6; color: #aaa; cursor: not-allowed; }

        .su-arrow {
          position: absolute; right: 0.9rem; top: 50%;
          transform: translateY(-50%);
          pointer-events: none; color: #aaa; font-size: 0.65rem;
        }

        .su-pw-toggle {
          position: absolute; right: 0.9rem; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: var(--text-sub); font-size: 11px; font-weight: 700;
          font-family: inherit; transition: color 0.15s;
        }

        .su-pw-toggle:hover { color: var(--brown-main); }

        .su-strength { display: flex; gap: 4px; margin-top: 0.3rem; align-items: center; }
        .su-bar { height: 3px; flex: 1; border-radius: 2px; background: #e0d5cc; transition: background 0.2s; }
        .su-strength-label { font-size: 11px; font-weight: 600; min-width: 36px; text-align: right; }
        .su-match { font-size: 11px; font-weight: 600; margin-top: 0.25rem; }

        .su-checks { display: flex; flex-direction: column; gap: 0.65rem; margin-top: 1.1rem; }

        .su-check {
          display: flex; align-items: flex-start; gap: 0.6rem;
          font-size: 12px; color: #666; cursor: pointer; line-height: 1.55;
        }

        .su-check input[type="checkbox"] {
          width: 15px; height: 15px; flex-shrink: 0;
          margin-top: 2px; accent-color: var(--brown-main); cursor: pointer;
        }

        .su-check a { color: var(--brown-main); font-weight: 600; text-decoration: none; }
        .su-check a:hover { text-decoration: underline; }

        .su-error {
          background: #fff5f0; border: 1px solid #f5c8a8;
          border-radius: 8px; padding: 10px 13px;
          font-size: 12.5px; color: var(--brown-main); margin-top: 1rem;
          display: flex; align-items: center; gap: 7px;
        }

        .su-btn {
          width: 100%; height: 48px;
          background: var(--brown-main); color: #fff;
          border: none; border-radius: 10px;
          font-size: 14px; font-weight: 600; font-family: inherit;
          cursor: pointer; margin-top: 1.25rem;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s, transform 0.1s;
          position: relative; overflow: hidden;
        }

        .su-btn::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0;
          height: 2px; background: var(--gold); border-radius: 10px 10px 0 0;
        }

        .su-btn:hover:not(:disabled) { background: var(--brown-dark); }
        .su-btn:active:not(:disabled) { transform: scale(0.99); }
        .su-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .su-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: su-spin 0.7s linear infinite; flex-shrink: 0;
        }

        @keyframes su-spin { to { transform: rotate(360deg); } }

        .su-signin { text-align: center; font-size: 13px; color: var(--text-sub); margin-top: 1rem; }
        .su-signin a {
          color: var(--brown-main); font-weight: 600; text-decoration: none;
          border-bottom: 1px solid var(--gold); padding-bottom: 1px;
        }
        .su-signin a:hover { color: var(--gold); }

        .su-footer { margin-top: 1.5rem; font-size: 11px; color: #C0A882; text-align: center; max-width: 500px; }

        @media (max-width: 860px) {
          .su-left { display: none; }
          .su-root { height: auto; overflow: visible; }
          .su-right { height: auto; }
        }

        @media (max-width: 480px) {
          .su-grid { grid-template-columns: 1fr; }
          .su-right { padding: 1.5rem 1rem 2rem; }
          .su-card { padding: 1.75rem 1.25rem; }
        }
      `}</style>

      <div className="su-root">
        {/* LEFT */}
        <div className="su-left">
          <Image
            src="/treasury-building.jpeg"
            alt="National Treasury Building"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
            quality={85}
            sizes="42vw"
          />
          <div className="su-left-overlay" />
          <div className="su-left-content">
            <div className="su-logo-wrap">
              <Image
                src="/tnt-logo-1.png"
                alt="The National Treasury"
                width={200}
                height={48}
                style={{ objectFit: "contain", height: "36px", width: "auto" }}
                priority
              />
            </div>
            <p className="su-tagline">ICT Helpdesk Portal</p>
            <h1 className="su-title">
              Join the National
              <br />
              <span>Treasury Portal</span>
            </h1>
            <div className="su-divider" />
            <p className="su-desc">
              Register for IT support access. For National Treasury &amp;
              Economic Planning staff only — your account will be verified by
              ICT.
            </p>
            <div className="su-steps">
              {[
                "Fill in your personal and office details",
                "Verify your work email via the link we'll send",
                "Log in and raise your first IT support ticket",
              ].map((s, i) => (
                <div className="su-step" key={i}>
                  <div className="su-step-dot">{i + 1}</div>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="su-right">
          <div className="su-card">
            <p className="su-eyebrow">Staff Registration</p>
            <h2 className="su-card-title">Create Account</h2>
            <p className="su-card-sub">
              All fields marked <span style={{ color: "#c0392b" }}>*</span> are
              required
            </p>

            <form onSubmit={handleSubmit}>
              {/* PERSONAL */}
              <div className="su-section">Personal Information</div>
              <div className="su-grid">
                <div className="su-field">
                  <label>
                    Personal Number <span>*</span>
                  </label>
                  <div className="su-input-wrap">
                    <input
                      type="text"
                      placeholder="e.g. TNT/001234"
                      value={form.personalNumber}
                      onChange={(e) => set("personalNumber", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="su-field">
                  <label>
                    Phone Number <span>*</span>
                  </label>
                  <div className="su-input-wrap">
                    <input
                      type="tel"
                      placeholder="+254 7XX XXX XXX"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="su-field full">
                  <label>
                    Full Name <span>*</span>
                  </label>
                  <div className="su-input-wrap">
                    <input
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={form.fullName}
                      onChange={(e) => set("fullName", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="su-field full">
                  <label>
                    Job Title <span>*</span>
                  </label>
                  <div className="su-input-wrap">
                    <input
                      type="text"
                      placeholder="e.g. Senior ICT Officer"
                      value={form.jobTitle}
                      onChange={(e) => set("jobTitle", e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="su-field full">
                  <label>
                    Work Email <span>*</span>
                  </label>
                  <div className="su-input-wrap">
                    <input
                      type="email"
                      placeholder="you@treasury.go.ke"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* OFFICE */}
              <div className="su-section">Office Information</div>
              <div className="su-grid">
                <div className="su-field full">
                  <label>
                    Directorate <span>*</span>
                  </label>
                  <div className="su-input-wrap">
                    <select
                      value={form.directorateId}
                      onChange={(e) => {
                        set("directorateId", e.target.value);
                        set("departmentId", "");
                      }}
                      required
                      disabled={loadingDirs}
                    >
                      <option value="">
                        {loadingDirs ? "Loading..." : "— Select Directorate —"}
                      </option>
                      {directorates.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <span className="su-arrow">▼</span>
                  </div>
                </div>
                <div className="su-field full">
                  <label>Department</label>
                  <div className="su-input-wrap">
                    <select
                      value={form.departmentId}
                      onChange={(e) => set("departmentId", e.target.value)}
                      disabled={!form.directorateId || loadingDepts}
                    >
                      <option value="">
                        {!form.directorateId
                          ? "Select directorate first"
                          : loadingDepts
                            ? "Loading departments..."
                            : departments.length === 0
                              ? "No departments"
                              : "— Select Department —"}
                      </option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <span className="su-arrow">▼</span>
                  </div>
                </div>
                <div className="su-field">
                  <label>Office Number</label>
                  <div className="su-input-wrap">
                    <input
                      type="text"
                      placeholder="e.g. Room 4B"
                      value={form.officeNumber}
                      onChange={(e) => set("officeNumber", e.target.value)}
                    />
                  </div>
                </div>
                <div className="su-field">
                  <label>Office Location</label>
                  <div className="su-input-wrap">
                    <input
                      type="text"
                      placeholder="e.g. 4th Floor"
                      value={form.officeLocation}
                      onChange={(e) => set("officeLocation", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* SECURITY */}
              <div className="su-section">Security</div>
              <div className="su-grid">
                <div className="su-field">
                  <label>
                    Password <span>*</span>
                  </label>
                  <div className="su-input-wrap">
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      required
                      style={{ paddingRight: "3rem" }}
                    />
                    <button
                      type="button"
                      className="su-pw-toggle"
                      onClick={() => setShowPw(!showPw)}
                    >
                      {showPw ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  {form.password && (
                    <div className="su-strength">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className="su-bar"
                          style={{
                            background: n <= pwStrength ? pwColor : undefined,
                          }}
                        />
                      ))}
                      <span
                        className="su-strength-label"
                        style={{ color: pwColor }}
                      >
                        {pwLabel}
                      </span>
                    </div>
                  )}
                </div>
                <div className="su-field">
                  <label>
                    Confirm Password <span>*</span>
                  </label>
                  <div className="su-input-wrap">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={form.confirmPw}
                      onChange={(e) => set("confirmPw", e.target.value)}
                      required
                      style={{ paddingRight: "3rem" }}
                    />
                    <button
                      type="button"
                      className="su-pw-toggle"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  {form.confirmPw && (
                    <p
                      className="su-match"
                      style={{
                        color:
                          form.password === form.confirmPw
                            ? "#27ae60"
                            : "#c0392b",
                      }}
                    >
                      {form.password === form.confirmPw
                        ? "✓ Passwords match"
                        : "✗ Passwords don't match"}
                    </p>
                  )}
                </div>
              </div>

              {/* CHECKBOXES */}
              <div className="su-checks">
                <label className="su-check">
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={(e) => set("terms", e.target.checked)}
                  />
                  I agree to the{" "}
                  <a href="/terms" target="_blank">
                    Terms &amp; Conditions
                  </a>{" "}
                  of the National Treasury ICT Helpdesk
                </label>
                <label className="su-check">
                  <input
                    type="checkbox"
                    checked={form.dataConsent}
                    onChange={(e) => set("dataConsent", e.target.checked)}
                  />
                  I consent to processing of my personal data in accordance with
                  the{" "}
                  <a href="/privacy" target="_blank">
                    Kenya Data Protection Act 2019
                  </a>
                </label>
              </div>

              {error && (
                <div className="su-error">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <button type="submit" className="su-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="su-spinner" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>

              <div className="su-signin">
                Already have an account?&nbsp;<Link href="/login">Sign in</Link>
              </div>
            </form>
          </div>

          <p className="su-footer">
            © {new Date().getFullYear()} National Treasury &amp; Economic
            Planning · Government of Kenya
          </p>
        </div>
      </div>
    </>
  );
}
