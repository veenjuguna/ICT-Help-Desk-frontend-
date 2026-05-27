"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const DEPARTMENTS = [
  "Finance & Accounts",
  "ICT Department",
  "Human Resource",
  "Procurement",
  "Legal Services",
  "Internal Audit",
  "Public Debt Management",
  "Budget & Fiscal Policy",
  "Administration",
  "Other",
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    department: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { firstName, lastName, phone, email, department, password, confirmPassword } = form;
    if (!firstName || !lastName || !phone || !email || !department || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!agreed) {
      setError("Please accept the Terms & Conditions to continue.");
      return;
    }
    setLoading(true);
    // 🔁 Replace with your real Supabase signUp logic
    await new Promise((r) => setTimeout(r, 1400));
    setLoading(false);
    router.push("/");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --brown-dark:  #4A1E0A;
          --brown-main:  #6B2D0F;
          --brown-mid:   #8B4513;
          --gold:        #C8962E;
          --gold-light:  #E8B84B;
          --cream:       #FDF8F2;
          --border:      #E0D0C0;
          --text-main:   #1A0F08;
          --text-sub:    #7A5C44;
        }

        .signup-root {
          display: flex;
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        /* ── LEFT PANEL ── */
        .signup-left {
          width: 42%;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .bg-image {
          position: absolute;
          inset: 0;
          object-fit: cover;
          object-position: center;
          z-index: 0;
        }

        .bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(74,30,10,0.3) 0%,
            rgba(74,30,10,0.65) 50%,
            rgba(74,30,10,0.94) 100%
          );
          z-index: 1;
        }

        .left-content {
          position: relative;
          z-index: 2;
          padding: 3rem;
        }

        .left-logo-wrap {
          margin-bottom: 2rem;
          background: rgba(255,255,255,0.95);
          display: inline-flex;
          align-items: center;
          padding: 8px 14px;
          border-radius: 10px;
          border-left: 4px solid var(--gold);
        }

        .left-tagline {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: var(--gold-light);
          margin-bottom: 0.5rem;
        }

        .left-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.25;
          margin-bottom: 0.75rem;
        }

        .left-title span { color: var(--gold-light); }

        .left-divider {
          width: 48px;
          height: 3px;
          background: var(--gold);
          border-radius: 2px;
          margin-bottom: 1rem;
        }

        .left-desc {
          font-size: 13.5px;
          color: rgba(255,255,255,0.62);
          line-height: 1.75;
          max-width: 300px;
          margin-bottom: 2rem;
        }

        .left-steps {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .left-step {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12.5px;
          color: rgba(255,255,255,0.7);
        }

        .step-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--gold);
          color: var(--brown-dark);
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .left-footer {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.1);
          font-size: 11px;
          color: rgba(255,255,255,0.3);
        }

        /* ── RIGHT PANEL ── */
        .signup-right {
          flex: 1;
          background: var(--cream);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 2rem;
          overflow-y: auto;
        }

        .form-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid var(--border);
          padding: 2.25rem;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 8px 32px rgba(107,45,15,0.08);
        }

        .form-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 0.4rem;
        }

        .form-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.65rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 0.25rem;
        }

        .form-sub {
          font-size: 13px;
          color: var(--text-sub);
          margin-bottom: 1.5rem;
        }

        /* two column row */
        .field-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
          margin-bottom: 1rem;
        }

        .field-group { margin-bottom: 1rem; }

        .field-label {
          display: block;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 5px;
          letter-spacing: 0.1px;
        }

        .field-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 12px;
          color: var(--text-sub);
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .field-input {
          width: 100%;
          height: 43px;
          padding: 0 12px 0 38px;
          border: 1.5px solid var(--border);
          border-radius: 9px;
          font-size: 13.5px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: var(--cream);
          color: var(--text-main);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        }

        .field-input.no-icon { padding-left: 12px; }

        .field-input::placeholder { color: #C0A882; font-size: 12.5px; }

        .field-input:focus {
          border-color: var(--brown-mid);
          background: #fff;
          box-shadow: 0 0 0 3px rgba(139,69,19,0.09);
        }

        select.field-input {
          appearance: none;
          cursor: pointer;
          padding-right: 32px;
        }

        .select-arrow {
          position: absolute;
          right: 12px;
          pointer-events: none;
          color: var(--text-sub);
        }

        .eye-btn {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-sub);
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: 4px;
          transition: color 0.15s;
        }

        .eye-btn:hover { color: var(--brown-mid); }

        /* password strength */
        .strength-bar {
          display: flex;
          gap: 3px;
          margin-top: 5px;
        }

        .strength-seg {
          flex: 1;
          height: 3px;
          border-radius: 2px;
          background: var(--border);
          transition: background 0.2s;
        }

        .strength-seg.weak   { background: #BB0000; }
        .strength-seg.medium { background: var(--gold); }
        .strength-seg.strong { background: #2D6B0F; }

        .strength-label {
          font-size: 10.5px;
          color: var(--text-sub);
          margin-top: 3px;
        }

        /* error */
        .error-msg {
          display: flex;
          align-items: center;
          gap: 7px;
          background: #fff5f0;
          border: 1px solid #f5c8a8;
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 12px;
          color: var(--brown-main);
          margin-bottom: 1rem;
        }

        /* checkbox */
        .checkbox-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 1.25rem;
          margin-top: 0.25rem;
        }

        .checkbox-row input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: var(--brown-main);
          cursor: pointer;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .checkbox-label {
          font-size: 12px;
          color: var(--text-sub);
          line-height: 1.5;
        }

        .checkbox-label a {
          color: var(--brown-main);
          font-weight: 600;
          text-decoration: none;
          border-bottom: 1px solid var(--gold);
        }

        .checkbox-label a:hover { color: var(--gold); }

        /* submit */
        .submit-btn {
          width: 100%;
          height: 46px;
          background: var(--brown-main);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.15s, transform 0.1s;
          position: relative;
          overflow: hidden;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--gold);
          border-radius: 10px 10px 0 0;
        }

        .submit-btn:hover:not(:disabled) { background: var(--brown-dark); }
        .submit-btn:active:not(:disabled) { transform: scale(0.99); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .login-row {
          margin-top: 1.1rem;
          text-align: center;
          font-size: 13px;
          color: var(--text-sub);
        }

        .login-row a {
          color: var(--brown-main);
          font-weight: 600;
          text-decoration: none;
          border-bottom: 1px solid var(--gold);
          padding-bottom: 1px;
        }

        .login-row a:hover { color: var(--gold); }

        .right-footer {
          margin-top: 1.5rem;
          font-size: 11px;
          color: #C0A882;
          text-align: center;
          max-width: 440px;
        }

        @media (max-width: 900px) {
          .signup-root { flex-direction: column; }
          .signup-left { width: 100%; min-height: 220px; }
          .left-steps { display: none; }
          .signup-right { padding: 2rem 1rem; }
          .form-card { padding: 1.5rem 1.1rem; }
          .field-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="signup-root">

        {/* LEFT PANEL */}
        <div className="signup-left">
          <Image
            src="/treasury-building.jpeg"
            alt="National Treasury Building"
            fill
            className="bg-image"
            priority
            quality={85}
            sizes="42vw"
          />
          <div className="bg-overlay" />
          <div className="left-content">
            <div className="left-logo-wrap">
              <Image
                src="/tnt-logo-1.png"
                alt="The National Treasury"
                width={190}
                height={46}
                style={{ objectFit: "contain", height: "36px", width: "auto" }}
                priority
              />
            </div>
            <p className="left-tagline">Staff Registration</p>
            <h1 className="left-title">
              Join the<br /><span>IT Helpdesk Portal</span>
            </h1>
            <div className="left-divider" />
            <p className="left-desc">
              Create your account to access IT support, raise tickets, and track issues across the National Treasury.
            </p>
            <div className="left-steps">
              <div className="left-step">
                <span className="step-dot">1</span>
                Fill in your staff details
              </div>
              <div className="left-step">
                <span className="step-dot">2</span>
                Accept the Data Access Policy
              </div>
              <div className="left-step">
                <span className="step-dot">3</span>
                Start raising and tracking tickets
              </div>
            </div>
            <div className="left-footer">
              Treasury Building, Harambee Avenue · Nairobi, Kenya
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="signup-right">
          <div className="form-card">
            <p className="form-eyebrow">New Account</p>
            <h2 className="form-title">Create your account</h2>
            <p className="form-sub">All fields are required</p>

            <form onSubmit={handleSignup} noValidate>

              {/* First + Last name */}
              <div className="field-row">
                <div className="field-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="firstName" className="field-label">First Name</label>
                  <div className="field-wrap">
                    <span className="field-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      id="firstName"
                      type="text"
                      value={form.firstName}
                      onChange={(e) => update("firstName", e.target.value)}
                      placeholder="Jane"
                      className="field-input"
                      autoComplete="given-name"
                    />
                  </div>
                </div>
                <div className="field-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="lastName" className="field-label">Last Name</label>
                  <div className="field-wrap">
                    <span className="field-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      id="lastName"
                      type="text"
                      value={form.lastName}
                      onChange={(e) => update("lastName", e.target.value)}
                      placeholder="Doe"
                      className="field-input"
                      autoComplete="family-name"
                    />
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="field-group">
                <label htmlFor="phone" className="field-label">Phone Number</label>
                <div className="field-wrap">
                  <span className="field-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.86a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" />
                    </svg>
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+254 700 000 000"
                    className="field-input"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="field-group">
                <label htmlFor="email" className="field-label">Work Email</label>
                <div className="field-wrap">
                  <span className="field-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m2 7 10 7 10-7" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="yourname@treasury.go.ke"
                    className="field-input"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="field-group">
                <label htmlFor="department" className="field-label">Department</label>
                <div className="field-wrap">
                  <span className="field-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </span>
                  <select
                    id="department"
                    value={form.department}
                    onChange={(e) => update("department", e.target.value)}
                    className="field-input"
                  >
                    <option value="">Select department...</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <span className="select-arrow">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Password */}
              <div className="field-group">
                <label htmlFor="password" className="field-label">Password</label>
                <div className="field-wrap">
                  <span className="field-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="Min. 8 characters"
                    className="field-input"
                    autoComplete="new-password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password">
                    {showPassword ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {form.password.length > 0 && (
                  <>
                    <div className="strength-bar">
                      <div className={`strength-seg ${form.password.length >= 1 ? (form.password.length < 6 ? "weak" : form.password.length < 10 ? "medium" : "strong") : ""}`} />
                      <div className={`strength-seg ${form.password.length >= 6 ? (form.password.length < 10 ? "medium" : "strong") : ""}`} />
                      <div className={`strength-seg ${form.password.length >= 10 ? "strong" : ""}`} />
                    </div>
                    <p className="strength-label">
                      {form.password.length < 6 ? "Weak" : form.password.length < 10 ? "Medium" : "Strong"}
                    </p>
                  </>
                )}
              </div>

              {/* Confirm Password */}
              <div className="field-group">
                <label htmlFor="confirmPassword" className="field-label">Confirm Password</label>
                <div className="field-wrap">
                  <span className="field-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                    placeholder="Repeat your password"
                    className="field-input"
                    autoComplete="new-password"
                    style={{
                      borderColor: form.confirmPassword.length > 0
                        ? form.confirmPassword === form.password ? "#2D6B0F" : "#BB0000"
                        : undefined
                    }}
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle confirm password">
                    {showConfirm ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="error-msg" role="alert">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Terms checkbox */}
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <label htmlFor="terms" className="checkbox-label">
                  I agree to the{" "}
                  <Link href="/terms">Terms & Conditions</Link>
                  {" "}and{" "}
                  <Link href="/privacy">Data Access Consent Policy</Link>
                  {" "}of the National Treasury ICT Helpdesk.
                </label>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>

              <div className="login-row">
                Already have an account?&nbsp;
                <Link href="/login">Sign in</Link>
              </div>

            </form>
          </div>

          <p className="right-footer">
            © {new Date().getFullYear()} National Treasury &amp; Economic Planning · Government of Kenya
          </p>
        </div>

      </div>
    </>
  );
}