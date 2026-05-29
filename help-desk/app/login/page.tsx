"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://ict-help-desk-backend.onrender.com";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    console.log("🔐 Attempting login for:", email);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("📦 Response status:", res.status);
      console.log("📦 Response data:", data);

      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Save token
      localStorage.setItem("token", data.access_token);
      console.log("✅ Login successful! Token saved:", data.access_token);

      router.push("/dashboard");
    } catch (err: any) {
      console.error("❌ Login error:", err.message);
      setError(err.message || "Something went wrong. Please try again.");

      if (!res.ok) {
        setError(data?.message ?? "Invalid credentials. Please try again.");
        return;
      }

      // Store user data — adjust keys if backend returns differently
      if (data?.access_token) localStorage.setItem("token", data.access_token);
      if (data?.user)         localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard");
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
          --brown-mid:  #8B3E1A;
          --gold:       #C8962E;
          --gold-light: #E8B84B;
          --cream:      #FDF8F2;
          --text:       #2C1810;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
          background: var(--brown-dark);
        }

        .login-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .login-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(74,30,10,0.88) 0%,
            rgba(50,15,5,0.75) 50%,
            rgba(30,8,2,0.90) 100%
          );
          z-index: 1;
        }

        .login-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 900px;
          margin: 1.5rem;
          display: flex;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5);
        }

        /* LEFT PANEL */
        .login-left {
          width: 42%;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 3rem 2rem;
          text-align: center;
          overflow: hidden;
          background: var(--brown);
        }

        .login-left-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .login-left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(107,45,15,0.82) 0%,
            rgba(74,30,10,0.90) 100%
          );
          z-index: 1;
        }

        .login-left-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .login-logo {
          margin-bottom: 0.5rem;
        }

        .login-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: #fff;
          line-height: 1.3;
        }

        .login-subtitle {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--gold-light);
          opacity: 0.9;
        }

        .login-divider {
          width: 40px;
          height: 2px;
          background: var(--gold);
          border-radius: 2px;
          margin: 0.25rem 0;
        }

        .login-tagline {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.7);
          max-width: 200px;
          line-height: 1.6;
        }

        .login-badge {
          margin-top: 1rem;
          padding: 6px 14px;
          background: rgba(200,150,46,0.2);
          border: 1px solid rgba(200,150,46,0.4);
          border-radius: 20px;
          font-size: 0.7rem;
          color: var(--gold-light);
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* RIGHT PANEL */
        .login-right {
          flex: 1;
          background: var(--cream);
          padding: 3rem 2.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .login-welcome {
          margin-bottom: 2rem;
        }

        .login-welcome h2 {
          font-size: 1.7rem;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 0.3rem;
        }

        .login-welcome p {
          font-size: 0.875rem;
          color: #888;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .form-group label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .input-wrap {
          position: relative;
        }

        .input-wrap input {
          width: 100%;
          padding: 0.8rem 1rem;
          padding-right: 2.8rem;
          border: 1.5px solid #e0d5cc;
          border-radius: 8px;
          font-size: 0.9rem;
          font-family: inherit;
          background: #fff;
          color: var(--text);
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
        }

        .input-wrap input:focus {
          border-color: var(--brown);
          box-shadow: 0 0 0 3px rgba(107,45,15,0.1);
        }

        .input-wrap input.error-input {
          border-color: #4A1E0A;;
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
          font-size: 0.75rem;
          font-weight: 600;
          font-family: inherit;
          padding: 0;
        }

        .pw-toggle:hover { color: var(--brown); }

        .error-msg {
          background: #fdf0ee;
          border: 1px solid #f5c6c0;
          border-radius: 6px;
          padding: 0.7rem 1rem;
          font-size: 0.82rem;
          color: #4A1E0A;;
          font-weight: 500;
        }

        .login-btn {
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
          transition: background 0.15s, transform 0.1s;
          position: relative;
          overflow: hidden;
          letter-spacing: 0.3px;
          margin-top: 0.3rem;
        }

        .login-btn::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }

        .login-btn:hover:not(:disabled) { background: var(--brown-dark); }
        .login-btn:active:not(:disabled) { transform: scale(0.99); }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .login-links {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 1rem;
          font-size: 0.82rem;
        }

        .login-links a {
          color: var(--brown);
          text-decoration: none;
          font-weight: 600;
        }

        .login-links a:hover { text-decoration: underline; }

        .login-divider-line {
          height: 1px;
          background: #e8ddd5;
          margin: 1.2rem 0;
        }

        .signup-prompt {
          text-align: center;
          font-size: 0.83rem;
          color: #888;
        }

        .signup-prompt a {
          color: var(--brown);
          font-weight: 700;
          text-decoration: none;
          margin-left: 0.3rem;
        }

        .signup-prompt a:hover { text-decoration: underline; }

        @media (max-width: 640px) {
          .login-left { display: none; }
          .login-card { max-width: 420px; }
          .login-right { padding: 2.5rem 1.5rem; }
        }
      `}</style>

      <div className="login-root">
        {/* LEFT PANEL */}
        <div className="login-left">
        {/* BACKGROUND */}
        <div className="login-bg">
          <Image
            src="/treasury-building.jpeg"
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
            quality={70}
            aria-hidden="true"
          />
          <div className="login-bg-overlay" />
        </div>

        <div className="login-card">
          {/* LEFT */}
          <div className="login-left">
            <div className="login-left-bg">
              <Image
                src="/treasury-building.jpeg"
                alt=""
                fill
                style={{ objectFit: "cover" }}
                quality={60}
                aria-hidden="true"
              />
              <div className="login-left-overlay" />
            </div>
            <p className="left-tagline">ICT Helpdesk Portal</p>
            <h1 className="left-title">
              Supporting Kenya&apos;s
              <br />
              <span>Financial Future</span>
            </h1>
            <div className="left-divider" />
            <p className="left-desc">
              Centralized IT support for all National Treasury &amp; Economic
              Planning staff. Raise tickets, track issues, and get assistance —
              securely and efficiently.
            </p>
            <div className="left-stats">
              <div className="stat-item">
                <p>99.9%</p>
                <p>Uptime SLA</p>
              </div>
              <div className="stat-item">
                <p>&lt;4hr</p>
                <p>Avg. resolution</p>
              </div>
              <div className="stat-item">
                <p>24/7</p>
                <p>Support</p>
              </div>
            <div className="login-left-content">
              <div className="login-logo">
                <Image
                  src="/tnt-logo.jpeg"
                  alt="The National Treasury"
                  width={160}
                  height={50}
                  style={{
                    objectFit: "contain",
                    height: "50px",
                    width: "auto",
                    // filter: "brightness(0) invert(1)",
                  }}
                  priority
                />
              </div>
              <div className="login-divider" />
              <p className="login-subtitle">ICT Helpdesk Portal</p>
              <p className="login-tagline">
                Secure IT support for the National Treasury &amp; Economic Planning
              </p>
              <div className="login-badge">ICT Policy 2025</div>
            </div>
          </div>

        {/* RIGHT PANEL */}
        <div className="login-right">
          <div className="form-card">
            <p className="form-eyebrow">Staff Access</p>
            <h2 className="form-title">Welcome back</h2>
            <p className="form-sub">
              Sign in with your official work credentials
            </p>

            <form onSubmit={handleLogin} noValidate>
              <div className="field-group">
                <label htmlFor="email" className="field-label">
                  Work Email
                </label>
                <div className="field-wrap">
                  <span className="field-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m2 7 10 7 10-7" />
                    </svg>
                  </span>
          {/* RIGHT */}
          <div className="login-right">
            <div className="login-welcome">
              <h2>Welcome Back</h2>
              <p>Sign in to your helpdesk account</p>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Work Email</label>
                <div className="input-wrap">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@treasury.go.ke"
                    className="field-input"
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@treasury.go.ke"
                    className={error ? "error-input" : ""}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="password" className="field-label">
                  Password
                </label>
                <div className="field-wrap">
                  <span className="field-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrap">
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={error ? "error-input" : ""}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                    className="pw-toggle"
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="error-msg" role="alert">
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

              <div className="form-row">
                <Link href="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
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
              {error && <div className="error-msg">{error}</div>}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <div className="login-links">
                <Link href="/forgot-password">Forgot password?</Link>
                <Link href="/support">Need help?</Link>
              </div>
            </form>

            <div className="form-footer">
              <div className="support-row">
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Need help?&nbsp;
                <Link href="/support" className="support-link">
                  Contact ICT Support
                </Link>
              </div>
            </div>
          </div>

          <p className="right-footer">
            © {new Date().getFullYear()} National Treasury &amp; Economic
            Planning · Government of Kenya
          </p>
            <div className="login-divider-line" />

            <p className="signup-prompt">
              Don&apos;t have an account?
              <Link href="/signup">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
