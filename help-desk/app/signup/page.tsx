"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://ict-help-desk-backend.onrender.com";

interface Directorate { id: number; name: string; }
interface Department  { id: number; name: string; }

interface FormState {
  personalNumber: string;
  firstName:      string;
  lastName:       string;
  phone:          string;
  email:          string;
  password:       string;
  confirmPw:      string;
  directorateId:  string;
  departmentId:   string;
  officeNumber:   string;
  officeLocation: string;
  terms:          boolean;
  dataConsent:    boolean;
}

const EMPTY: FormState = {
  personalNumber: "", firstName: "", lastName: "", phone: "",
  email: "", password: "", confirmPw: "", directorateId: "",
  departmentId: "", officeNumber: "", officeLocation: "",
  terms: false, dataConsent: false,
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm]               = useState<FormState>(EMPTY);
  const [directorates, setDirectorates] = useState<Directorate[]>([]);
  const [departments, setDepartments]   = useState<Department[]>([]);
  const [loadingDirs, setLoadingDirs]   = useState(true);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [showPw, setShowPw]             = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  // Load directorates on mount
  useEffect(() => {
    const fetchDirectorates = async () => {
      try {
        const res = await fetch(`${API}/directorates`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setDirectorates(data);
      } catch {
        setDirectorates([
          { id: 1, name: "Directorate of Budget, Fiscal and Economic Affairs" },
          { id: 2, name: "Directorate of Public Debt Management" },
          { id: 3, name: "Directorate of Accounting Services & Quality Assurance" },
          { id: 4, name: "Directorate of Public Investment & Portfolio Management" },
          { id: 5, name: "Public Private Partnerships (PPP) Directorate" },
          { id: 6, name: "Directorate of Administrative and Support Services" },
        ]);
      } finally {
        setLoadingDirs(false);
      }
    };
    fetchDirectorates();
  }, []);

  // Load departments when directorate changes
  useEffect(() => {
    const fetchDepts = async () => {
      if (!form.directorateId) {
        setDepartments([]);
        setLoadingDepts(false);
        return;
      }

      setLoadingDepts(true);
      try {
        const res = await fetch(`${API}/directorates/${form.directorateId}/departments`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setDepartments(data);
      } catch {
        // fallback departments per directorate
        const fallback: Record<string, Department[]> = {
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
            { id: 303, name: "Financial Management Information Services (IFMIS) Department" },
            { id: 304, name: "National Sub-County Treasuries Department" },
            { id: 305, name: "Government Digital Payment Unit" },
          ],
          "4": [
            { id: 401, name: "Government Investment and Public Enterprises Department" },
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
        setDepartments(fallback[form.directorateId] ?? []);
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchDepts();
  }, [form.directorateId]);

  const set = (key: keyof FormState, val: string | boolean) =>
    setForm(f => ({ ...f, [key]: val }));

  // Password strength
  const pwStrength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)           s++;
    if (/[A-Z]/.test(p))         s++;
    if (/[0-9]/.test(p))         s++;
    if (/[^A-Za-z0-9]/.test(p))  s++;
    return s;
  })();

  const pwLabel  = ["", "Weak", "Fair", "Good", "Strong"][pwStrength];
  const pwColor  = ["", "#e74c3c", "#e67e22", "#f1c40f", "#27ae60"][pwStrength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPw) {
      setError("Passwords do not match."); return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters."); return;
    }
    if (!form.terms || !form.dataConsent) {
      setError("Please accept the Terms & Conditions and Data Access Consent."); return;
    }

    setLoading(true);
    try {
      const payload = {
        personal_no:  form.personalNumber,
        first_name:       form.firstName,
        last_name:        form.lastName,
        phone:            form.phone,
        email:            form.email,
        password:         form.password,
        directorate_id:   form.directorateId ? Number(form.directorateId) : undefined,
        department_id:    form.departmentId  ? Number(form.departmentId)  : undefined,
        office_number:    form.officeNumber,
        office_location:  form.officeLocation,
      };

      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message ?? "Registration failed. Please try again.");
        return;
      }

      // Store email for verify page
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
        :root {
          --brown:      #6B2D0F;
          --brown-dark: #4A1E0A;
          --gold:       #C8962E;
          --gold-light: #E8B84B;
          --cream:      #FDF8F2;
          --text:       #2C1810;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .signup-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
          padding: 2rem 0;
        }

        .signup-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .signup-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(74,30,10,0.88) 0%, rgba(30,8,2,0.90) 100%);
          z-index: 1;
        }

        .signup-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 940px;
          margin: 0 1.5rem;
          display: flex;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5);
        }

        /* LEFT */
        .signup-left {
          width: 38%;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 3rem 1.75rem;
          text-align: center;
          overflow: hidden;
        }

        .signup-left-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .signup-left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(107,45,15,0.85) 0%, rgba(74,30,10,0.93) 100%);
          z-index: 1;
        }

        .signup-left-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .signup-left-divider {
          width: 40px;
          height: 2px;
          background: var(--gold);
          border-radius: 2px;
        }

        .signup-left-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: #fff;
          line-height: 1.3;
        }

        .signup-left-sub {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--gold-light);
        }

        .signup-left-note {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.65);
          line-height: 1.7;
          max-width: 180px;
        }

        .signup-steps {
          margin-top: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          text-align: left;
          width: 100%;
        }

        .signup-step {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          font-size: 0.78rem;
          color: rgba(255,255,255,0.7);
          line-height: 1.5;
        }

        .signup-step-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(200,150,46,0.25);
          border: 1.5px solid var(--gold);
          color: var(--gold-light);
          font-size: 0.65rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* RIGHT */
        .signup-right {
          flex: 1;
          background: var(--cream);
          padding: 2.5rem 2.25rem;
          overflow-y: auto;
        }

        .signup-header {
          margin-bottom: 1.75rem;
        }

        .signup-header h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 0.25rem;
        }

        .signup-header p {
          font-size: 0.82rem;
          color: #888;
        }

        .form-section-label {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: var(--brown);
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e0d5cc;
          margin-bottom: 1rem;
          margin-top: 1.5rem;
        }

        .form-section-label:first-of-type { margin-top: 0; }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .form-group.full { grid-column: 1 / -1; }

        .form-group label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text);
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .form-group label span {
          color: #c0392b;
          margin-left: 2px;
        }

        .input-wrap { position: relative; }

        .input-wrap input,
        .input-wrap select {
          width: 100%;
          padding: 0.72rem 0.9rem;
          border: 1.5px solid #e0d5cc;
          border-radius: 7px;
          font-size: 0.875rem;
          font-family: inherit;
          background: #fff;
          color: var(--text);
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
          appearance: none;
        }

        .input-wrap input:focus,
        .input-wrap select:focus {
          border-color: var(--brown);
          box-shadow: 0 0 0 3px rgba(107,45,15,0.08);
        }

        .input-wrap select:disabled {
          background: #f5ede6;
          color: #aaa;
          cursor: not-allowed;
        }

        .select-arrow {
          position: absolute;
          right: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #aaa;
          font-size: 0.7rem;
        }

        .pw-toggle {
          position: absolute;
          right: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #aaa;
          font-size: 0.7rem;
          font-weight: 700;
          font-family: inherit;
        }

        .pw-toggle:hover { color: var(--brown); }

        /* password strength */
        .pw-strength {
          display: flex;
          gap: 4px;
          margin-top: 0.35rem;
          align-items: center;
        }

        .pw-bar {
          height: 3px;
          flex: 1;
          border-radius: 2px;
          background: #e0d5cc;
          transition: background 0.2s;
        }

        .pw-label {
          font-size: 0.7rem;
          font-weight: 600;
          min-width: 42px;
          text-align: right;
        }

        /* pw match */
        .pw-match {
          font-size: 0.72rem;
          font-weight: 600;
          margin-top: 0.3rem;
        }

        /* checkboxes */
        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          font-size: 0.8rem;
          color: #666;
          cursor: pointer;
          line-height: 1.5;
        }

        .checkbox-label input[type="checkbox"] {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
          margin-top: 2px;
          accent-color: var(--brown);
          cursor: pointer;
        }

        .checkbox-label a {
          color: var(--brown);
          font-weight: 600;
          text-decoration: none;
        }

        .checkbox-label a:hover { text-decoration: underline; }

        .error-msg {
          background: #fdf0ee;
          border: 1px solid #f5c6c0;
          border-radius: 6px;
          padding: 0.7rem 1rem;
          font-size: 0.82rem;
          color: #c0392b;
          font-weight: 500;
          margin-top: 1rem;
        }

        .signup-btn {
          width: 100%;
          padding: 0.9rem;
          background: var(--brown);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          margin-top: 1.25rem;
          transition: background 0.15s, transform 0.1s;
          position: relative;
          overflow: hidden;
        }

        .signup-btn::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }

        .signup-btn:hover:not(:disabled) { background: var(--brown-dark); }
        .signup-btn:active:not(:disabled) { transform: scale(0.99); }
        .signup-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .signin-prompt {
          text-align: center;
          font-size: 0.82rem;
          color: #888;
          margin-top: 1rem;
        }

        .signin-prompt a {
          color: var(--brown);
          font-weight: 700;
          text-decoration: none;
          margin-left: 0.3rem;
        }

        .signin-prompt a:hover { text-decoration: underline; }

        @media (max-width: 680px) {
          .signup-left { display: none; }
          .signup-card { max-width: 480px; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="signup-root">
        <div className="signup-bg">
          <Image
            src="/treasury-building.jpeg"
            alt=""
            fill
            style={{ objectFit: "cover" }}
            priority
            quality={65}
            aria-hidden="true"
          />
          <div className="signup-bg-overlay" />
        </div>

        <div className="signup-card">
          {/* LEFT */}
          <div className="signup-left">
            <div className="signup-left-bg">
              <Image src="/treasury-building.jpeg" alt="" fill style={{ objectFit: "cover" }} quality={50} aria-hidden="true" />
              <div className="signup-left-overlay" />
            </div>
            <div className="signup-left-content">
              <Image
                src="/tnt-logo.jpeg"
                alt="National Treasury"
                width={150}
                height={46}
                  style={{ objectFit: "contain", height: "46px", width: "auto",  }}
                priority
              />
              <div className="signup-left-divider" />
              <p className="signup-left-sub">ICT Helpdesk Portal</p>
              <p className="signup-left-title">Request Account Access</p>
              <p className="signup-left-note">
                For National Treasury staff only. Your account will be verified by ICT.
              </p>
              <div className="signup-steps">
                <div className="signup-step">
                  <div className="signup-step-dot">1</div>
                  <span>Fill in your personal and office details</span>
                </div>
                <div className="signup-step">
                  <div className="signup-step-dot">2</div>
                  <span>Verify your work email via the link we&apos;ll send</span>
                </div>
                <div className="signup-step">
                  <div className="signup-step-dot">3</div>
                  <span>Log in and raise your first IT support ticket</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="signup-right">
            <div className="signup-header">
              <h2>Create Account</h2>
              <p>All fields marked <span style={{ color: "#c0392b" }}>*</span> are required</p>
            </div>

            <form onSubmit={handleSubmit}>

              {/* ── PERSONAL INFO ── */}
              <div className="form-section-label">Personal Information</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Personal Number <span>*</span></label>
                  <div className="input-wrap">
                    <input
                      type="text"
                      placeholder="e.g. TNT/001234"
                      value={form.personalNumber}
                      onChange={e => set("personalNumber", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number <span>*</span></label>
                  <div className="input-wrap">
                    <input
                      type="tel"
                      placeholder="+254 7XX XXX XXX"
                      value={form.phone}
                      onChange={e => set("phone", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>First Name <span>*</span></label>
                  <div className="input-wrap">
                    <input
                      type="text"
                      placeholder="Jane"
                      value={form.firstName}
                      onChange={e => set("firstName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Last Name <span>*</span></label>
                  <div className="input-wrap">
                    <input
                      type="text"
                      placeholder="Doe"
                      value={form.lastName}
                      onChange={e => set("lastName", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group full">
                  <label>Work Email <span>*</span></label>
                  <div className="input-wrap">
                    <input
                      type="email"
                      placeholder="you@treasury.go.ke"
                      value={form.email}
                      onChange={e => set("email", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* ── OFFICE INFO ── */}
              <div className="form-section-label">Office Information</div>
              <div className="form-row">
                <div className="form-group full">
                  <label>Directorate <span>*</span></label>
                  <div className="input-wrap">
                    <select
                      value={form.directorateId}
                      onChange={e => { set("directorateId", e.target.value); set("departmentId", ""); }}
                      required
                      disabled={loadingDirs}
                    >
                      <option value="">{loadingDirs ? "Loading..." : "— Select Directorate —"}</option>
                      {directorates.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    <span className="select-arrow">▼</span>
                  </div>
                </div>

                <div className="form-group full">
                  <label>Department</label>
                  <div className="input-wrap">
                    <select
                      value={form.departmentId}
                      onChange={e => set("departmentId", e.target.value)}
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
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    <span className="select-arrow">▼</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Office Number</label>
                  <div className="input-wrap">
                    <input
                      type="text"
                      placeholder="e.g. Room 4B"
                      value={form.officeNumber}
                      onChange={e => set("officeNumber", e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Office Location</label>
                  <div className="input-wrap">
                    <input
                      type="text"
                      placeholder="e.g. Treasury Building, 4th Floor"
                      value={form.officeLocation}
                      onChange={e => set("officeLocation", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* ── SECURITY ── */}
              <div className="form-section-label">Security</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Password <span>*</span></label>
                  <div className="input-wrap">
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={e => set("password", e.target.value)}
                      required
                    />
                    <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                      {showPw ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  {form.password && (
                    <div className="pw-strength">
                      {[1,2,3,4].map(n => (
                        <div
                          key={n}
                          className="pw-bar"
                          style={{ background: n <= pwStrength ? pwColor : undefined }}
                        />
                      ))}
                      <span className="pw-label" style={{ color: pwColor }}>{pwLabel}</span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Confirm Password <span>*</span></label>
                  <div className="input-wrap">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter password"
                      value={form.confirmPw}
                      onChange={e => set("confirmPw", e.target.value)}
                      required
                    />
                    <button type="button" className="pw-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                  {form.confirmPw && (
                    <p
                      className="pw-match"
                      style={{ color: form.password === form.confirmPw ? "#27ae60" : "#c0392b" }}
                    >
                      {form.password === form.confirmPw ? "✓ Passwords match" : "✗ Passwords don't match"}
                    </p>
                  )}
                </div>
              </div>

              {/* CHECKBOXES */}
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.terms}
                    onChange={e => set("terms", e.target.checked)}
                  />
                  I agree to the <a href="/terms" target="_blank">Terms &amp; Conditions</a> of the National Treasury ICT Helpdesk
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.dataConsent}
                    onChange={e => set("dataConsent", e.target.checked)}
                  />
                  I consent to the processing of my personal data in accordance with the{" "}
                  <a href="/privacy" target="_blank">Kenya Data Protection Act 2019</a>
                </label>
              </div>

              {error && <div className="error-msg">{error}</div>}

              <button type="submit" className="signup-btn" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </button>

              <p className="signin-prompt">
                Already have an account?
                <Link href="/login">Sign in</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}