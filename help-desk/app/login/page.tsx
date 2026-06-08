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
    console.log("Attempting login for:", email);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log(" Response status:", res.status);
      console.log(" Response data:", data);

      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Save token
      localStorage.setItem("token", data.access_token);
      console.log(" Login successful! Token saved:", data.access_token);

      router.push("/dashboard");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      console.error(" Login error:", errorMessage);
      setError(errorMessage);
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

        .login-root {
         display: flex;
         min-height: 100vh;
         width: 100%;
         font-family: 'Plus Jakarta Sans', sans-serif;
         overflow: hidden;
         }

        .login-left {
          width: 55%;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(74,30,10,0.3) 0%,
            rgba(74,30,10,0.6) 50%,
            rgba(74,30,10,0.92) 100%
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
          padding: 8px 16px;
          border-radius: 10px;
          border-left: 4px solid var(--gold);
        }

        .left-tagline {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: var(--gold-light);
          margin-bottom: 0.6rem;
        }

        .left-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.4rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 0.75rem;
        }

        .left-title span { color: var(--gold-light); }

        .left-divider {
          width: 52px;
          height: 3px;
          background: var(--gold);
          border-radius: 2px;
          margin-bottom: 1rem;
        }

        .left-desc {
          font-size: 14px;
          color: rgba(255,255,255,0.65);
          line-height: 1.75;
          max-width: 340px;
          margin-bottom: 2rem;
        }

        .left-stats {
          display: flex;
          gap: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.15);
        }

        .stat-item p:first-child {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--gold-light);
        }

        .stat-item p:last-child {
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          margin-top: 2px;
        }

        .login-right {
         flex: 1;
         min-width: 0;
         background: var(--cream);
         display: flex;
         flex-direction: column;
         align-items: center;
         justify-content: center;
         padding: 3rem 2rem;
         }

        .form-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid var(--border);
          padding: 2.5rem;
          width: 100%;
          max-width: 400px;
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
          font-size: 1.8rem;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 0.3rem;
        }

        .form-sub {
          font-size: 13px;
          color: var(--text-sub);
          margin-bottom: 2rem;
        }

        .field-group { margin-bottom: 1.25rem; }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 6px;
        }

        .field-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 13px;
          color: var(--text-sub);
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .field-input {
          width: 100%;
          height: 46px;
          padding: 0 44px 0 40px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          font-size: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: var(--cream);
          color: var(--text-main);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        }

        .field-input::placeholder { color: #C0A882; font-size: 13px; }

        .field-input:focus {
          border-color: var(--brown-mid);
          background: #fff;
          box-shadow: 0 0 0 3px rgba(139,69,19,0.1);
        }

        .eye-btn {
          position: absolute;
          right: 12px;
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

        .error-msg {
          display: flex;
          align-items: center;
          gap: 7px;
          background: #fff5f0;
          border: 1px solid #f5c8a8;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 12.5px;
          color: var(--brown-main);
          margin-bottom: 1rem;
        }

        .form-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1.5rem;
          margin-top: -0.5rem;
        }

        .forgot-link {
          font-size: 12px;
          font-weight: 500;
          color: var(--brown-mid);
          text-decoration: none;
        }

        .forgot-link:hover { text-decoration: underline; }

        .submit-btn {
          width: 100%;
          height: 48px;
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

        .signup-row {
          margin-top: 1.25rem;
          text-align: center;
          font-size: 13px;
          color: var(--text-sub);
        }

        .signup-row a {
          color: var(--brown-main);
          font-weight: 600;
          text-decoration: none;
          border-bottom: 1px solid var(--gold);
          padding-bottom: 1px;
        }

        .signup-row a:hover { color: var(--gold); }

        .form-footer {
          margin-top: 1.5rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--border);
          text-align: center;
        }

        .support-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 12px;
          color: var(--text-sub);
        }

        .support-link {
          color: var(--brown-mid);
          text-decoration: none;
          font-weight: 500;
        }

        .support-link:hover { text-decoration: underline; }

        .right-footer {
          margin-top: 1.5rem;
          font-size: 11px;
          color: #C0A882;
          text-align: center;
          max-width: 400px;
        }

        @media (max-width: 900px) {
          .login-root { flex-direction: column; }
          .login-left { width: 100%; min-height: 260px; }
          .left-stats { display: none; }
          .left-title { font-size: 1.6rem; }
          .left-content { padding: 2rem; }
          .login-right { padding: 2rem 1rem; }
          .form-card { padding: 1.75rem 1.25rem; }
        }
      `}</style>

      <div className="login-root">
        {/* LEFT PANEL */}
        <div className="login-left">
          <Image
            src="/treasury-building.jpeg"
            alt="National Treasury Building Nairobi"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
            quality={85}
            sizes="55vw"
          />
          <div className="bg-overlay" />
          <div className="left-content">
            <div className="left-logo-wrap">
              <Image
                src="/tnt-logo-1.png"
                alt="The National Treasury — Republic of Kenya"
                width={200}
                height={48}
                style={{ objectFit: "contain", height: "38px", width: "auto" }}
                priority
              />
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
            </div>
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
              </button>

              <div className="signup-row">
                Don&apos;t have an account?&nbsp;
                <Link href="/signup">Sign Up</Link>
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
        </div>
      </div>
    </>
  );
}
