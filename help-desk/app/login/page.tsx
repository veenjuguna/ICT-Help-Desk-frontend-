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
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

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
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@treasury.go.ke"
                    className={error ? "error-input" : ""}
                    autoComplete="email"
                  />
                </div>
              </div>

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
                    className="pw-toggle"
                    onClick={() => setShowPw(!showPw)}
                  >
                    {showPw ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>

              {error && <div className="error-msg">{error}</div>}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </button>

              <div className="login-links">
                <Link href="/forgot-password">Forgot password?</Link>
                <Link href="/support">Need help?</Link>
              </div>
            </form>

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