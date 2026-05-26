"use client";
 
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
 
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    // Replace with your real auth logic
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    router.push("/dashboard");
  };
 
  return (
    <div className="login-root">
      {/* Left Panel */}
      <div className="login-left">
        {/* Diagonal stripe overlay */}
        <div className="stripe-overlay" aria-hidden="true" />
 
        <div className="left-content">
          {/* Logo slot */}
          <div className="logo-wrap">
            {/* Replace with your actual logo */}
            <div className="logo-placeholder">
              {/* 
                When you have the logo file, replace this div with:
                <Image
                  src="/kenya-coat-of-arms.png"
                  alt="Republic of Kenya Coat of Arms"
                  width={88}
                  height={88}
                  className="logo-img"
                  priority
                />
              */}
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <circle cx="28" cy="28" r="28" fill="rgba(255,255,255,0.12)" />
                <path d="M28 12 L32 22 L44 22 L34 29 L38 40 L28 33 L18 40 L22 29 L12 22 L24 22 Z" fill="rgba(255,255,255,0.7)" />
              </svg>
            </div>
          </div>
 
          <div className="left-text">
            <p className="left-eyebrow">Republic of Kenya</p>
            <h1 className="left-title">National Treasury<br />& Economic Planning</h1>
            <div className="left-divider" />
            <p className="left-subtitle">ICT Helpdesk Portal</p>
            <p className="left-body">
              Centralized IT support for all National Treasury staff. Raise tickets, track issues, and get assistance — securely and efficiently.
            </p>
          </div>
 
          <div className="left-badges">
            <span className="badge">
              <span className="badge-dot" />
              ICT Policy 2025
            </span>
            <span className="badge">
              <span className="badge-dot red" />
              DPA Compliant
            </span>
          </div>
        </div>
 
        <div className="left-footer">
          Treasury Building, Harambee Avenue · Nairobi, Kenya
        </div>
      </div>
 
      {/* Right Panel */}
      <div className="login-right">
        <div className="form-card">
          <div className="form-header">
            <p className="form-eyebrow">Staff Access</p>
            <h2 className="form-title">Welcome back</h2>
            <p className="form-sub">Sign in with your official work credentials</p>
          </div>
 
          <form onSubmit={handleLogin} className="login-form" noValidate>
            <div className="field-group">
              <label htmlFor="email" className="field-label">Work Email</label>
              <div className="field-wrap">
                <span className="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m2 7 10 7 10-7" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@treasury.go.ke"
                  className="field-input"
                  autoComplete="email"
                />
              </div>
            </div>
 
            <div className="field-group">
              <label htmlFor="password" className="field-label">Password</label>
              <div className="field-wrap">
                <span className="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="field-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}
 
            <div className="forgot-row">
              <Link href="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div>
 
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>
 
          <div className="form-footer">
            <div className="support-row">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Need help? &nbsp;<Link href="/support" className="support-link">Contact ICT Support</Link>
            </div>
          </div>
        </div>
 
        <p className="right-footer">
          © {new Date().getFullYear()} National Treasury & Economic Planning · Government of Kenya
        </p>
      </div>
 
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
 
        .login-root {
          display: flex;
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #f4f6f4;
        }
 
        /* ── LEFT PANEL ── */
        .login-left {
          width: 42%;
          background: #006600;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem 2.5rem;
          position: relative;
          overflow: hidden;
        }
 
        .stripe-overlay {
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            135deg,
            transparent,
            transparent 40px,
            rgba(0,0,0,0.04) 40px,
            rgba(0,0,0,0.04) 80px
          );
          pointer-events: none;
        }
 
        /* Red accent circle bottom right */
        .login-left::after {
          content: '';
          position: absolute;
          bottom: -100px;
          right: -100px;
          width: 320px;
          height: 320px;
          border-radius: 50%;
          background: rgba(187, 0, 0, 0.18);
          pointer-events: none;
        }
 
        .left-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
 
        .logo-wrap {
          display: flex;
          align-items: center;
        }
 
        .logo-placeholder {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 2px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }
 
        .logo-img {
          border-radius: 50%;
          object-fit: contain;
        }
 
        .left-eyebrow {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          margin: 0 0 0.5rem;
        }
 
        .left-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
          margin: 0;
        }
 
        .left-divider {
          width: 48px;
          height: 3px;
          background: #BB0000;
          border-radius: 2px;
          margin: 1rem 0;
        }
 
        .left-subtitle {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          margin: 0 0 0.75rem;
        }
 
        .left-body {
          font-size: 13.5px;
          color: rgba(255,255,255,0.6);
          line-height: 1.7;
          margin: 0;
          max-width: 280px;
        }
 
        .left-text {
          display: flex;
          flex-direction: column;
        }
 
        .left-badges {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
 
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 20px;
          padding: 5px 12px;
          font-size: 11px;
          color: rgba(255,255,255,0.75);
          letter-spacing: 0.3px;
        }
 
        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          flex-shrink: 0;
        }
 
        .badge-dot.red { background: #BB0000; }
 
        .left-footer {
          position: relative;
          z-index: 1;
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 1rem;
        }
 
        /* ── RIGHT PANEL ── */
        .login-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          background: #f4f6f4;
        }
 
        .form-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e4e9e4;
          padding: 2.5rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 4px 24px rgba(0,102,0,0.06);
        }
 
        .form-header {
          margin-bottom: 2rem;
        }
 
        .form-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #006600;
          margin: 0 0 0.4rem;
        }
 
        .form-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 0.35rem;
        }
 
        .form-sub {
          font-size: 13px;
          color: #7a8a7a;
          margin: 0;
        }
 
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
 
        .field-group {
          margin-bottom: 1.25rem;
        }
 
        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #3a4a3a;
          margin-bottom: 6px;
          letter-spacing: 0.2px;
        }
 
        .field-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
 
        .field-icon {
          position: absolute;
          left: 13px;
          color: #9aaa9a;
          display: flex;
          align-items: center;
          pointer-events: none;
        }
 
        .field-input {
          width: 100%;
          height: 46px;
          padding: 0 44px 0 40px;
          border: 1.5px solid #d4ddd4;
          border-radius: 10px;
          font-size: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #fafbfa;
          color: #1a1a1a;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        }
 
        .field-input::placeholder {
          color: #b4c4b4;
          font-size: 13px;
        }
 
        .field-input:focus {
          border-color: #006600;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(0,102,0,0.08);
        }
 
        .eye-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          color: #9aaa9a;
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: 4px;
          transition: color 0.15s;
        }
 
        .eye-btn:hover { color: #006600; }
 
        .error-msg {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #fff0f0;
          border: 1px solid #ffd4d4;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 12.5px;
          color: #BB0000;
          margin-bottom: 1rem;
        }
 
        .forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1.5rem;
          margin-top: -0.5rem;
        }
 
        .forgot-link {
          font-size: 12px;
          font-weight: 500;
          color: #006600;
          text-decoration: none;
          transition: opacity 0.15s;
        }
 
        .forgot-link:hover { opacity: 0.7; }
 
        .submit-btn {
          width: 100%;
          height: 48px;
          background: #006600;
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
          letter-spacing: 0.2px;
        }
 
        .submit-btn:hover:not(:disabled) { background: #005200; }
        .submit-btn:active:not(:disabled) { transform: scale(0.99); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
 
        .btn-loading {
          display: flex;
          align-items: center;
          gap: 10px;
        }
 
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
 
        @keyframes spin { to { transform: rotate(360deg); } }
 
        .form-footer {
          margin-top: 1.5rem;
          padding-top: 1.25rem;
          border-top: 1px solid #eef2ee;
        }
 
        .support-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 12px;
          color: #9aaa9a;
        }
 
        .support-link {
          color: #006600;
          text-decoration: none;
          font-weight: 500;
        }
 
        .support-link:hover { text-decoration: underline; }
 
        .right-footer {
          margin-top: 2rem;
          font-size: 11px;
          color: #b4c4b4;
          text-align: center;
          max-width: 420px;
        }
 
        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .login-root { flex-direction: column; }
          .login-left {
            width: 100%;
            padding: 2rem 1.5rem;
            min-height: auto;
          }
          .left-title { font-size: 1.5rem; }
          .login-right { padding: 2rem 1rem; }
          .form-card { padding: 1.75rem 1.25rem; }
        }
      `}</style>
    </div>
  );
}