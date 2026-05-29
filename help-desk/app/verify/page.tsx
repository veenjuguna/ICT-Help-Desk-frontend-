"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://ict-help-desk-backend.onrender.com";

type Status = "verifying" | "success" | "error" | "waiting";

export default function VerifyPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus]   = useState<Status>("waiting");
  const [message, setMessage] = useState("");
  const [email, setEmail]     = useState("");

  const verifyToken = useCallback(async (token: string) => {
    setStatus("verifying");
    try {
      const res = await fetch(`${API}/auth/verify?token=${token}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data?.message ?? "Verification failed. The link may have expired.");
        return;
      }

      // Store session if returned
      if (data?.access_token) localStorage.setItem("token", data.access_token);
      if (data?.user)         localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.removeItem("pending_verify_email");

      setStatus("success");
      setTimeout(() => router.push("/dashboard"), 2500);
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Token in URL — auto-verify
      verifyToken(token);
    } else {
      // No token — show "check your email" screen
      const stored = localStorage.getItem("pending_verify_email") ?? "";
      setEmail(stored);
    }
  }, [searchParams, verifyToken]);


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

        .verify-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          font-family: 'Plus Jakarta Sans', 'Segoe UI', sans-serif;
        }

        .verify-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .verify-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(74,30,10,0.9) 0%, rgba(30,8,2,0.92) 100%);
          z-index: 1;
        }

        .verify-card {
          position: relative;
          z-index: 2;
          background: var(--cream);
          border-radius: 16px;
          padding: 3rem 2.5rem;
          width: 100%;
          max-width: 460px;
          margin: 1.5rem;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5);
          text-align: center;
        }

        .verify-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .verify-icon {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin: 0 auto 1.2rem;
        }

        .icon-waiting  { background: rgba(200,150,46,0.15); border: 2px solid var(--gold); }
        .icon-verifying{ background: rgba(107,45,15,0.1);   border: 2px solid var(--brown); animation: pulse 1.2s ease-in-out infinite; }
        .icon-success  { background: rgba(39,174,96,0.12);  border: 2px solid #27ae60; }
        .icon-error    { background: rgba(192,57,43,0.12);  border: 2px solid #c0392b; }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(0.97); }
        }

        .verify-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 0.6rem;
        }

        .verify-subtitle {
          font-size: 0.875rem;
          color: #777;
          line-height: 1.6;
          max-width: 340px;
          margin: 0 auto 1.5rem;
        }

        .verify-email-badge {
          display: inline-block;
          background: rgba(107,45,15,0.08);
          border: 1px solid rgba(107,45,15,0.2);
          border-radius: 6px;
          padding: 6px 14px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--brown);
          margin-bottom: 1.5rem;
        }

        .verify-divider {
          height: 1px;
          background: #e8ddd5;
          margin: 1.5rem 0;
        }

        .verify-steps {
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .verify-step {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.83rem;
          color: #666;
          line-height: 1.5;
        }

        .step-num {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--brown);
          color: #fff;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .verify-btn {
          width: 100%;
          padding: 0.85rem;
          background: var(--brown);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s;
          position: relative;
          overflow: hidden;
        }

        .verify-btn::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
        }

        .verify-btn:hover { background: var(--brown-dark); }

        .verify-link {
          display: block;
          margin-top: 1rem;
          font-size: 0.82rem;
          color: var(--brown);
          text-decoration: none;
          font-weight: 600;
        }

        .verify-link:hover { text-decoration: underline; }

        .success-bar {
          width: 100%;
          height: 4px;
          background: #e8ddd5;
          border-radius: 2px;
          overflow: hidden;
          margin-top: 1.2rem;
        }

        .success-bar-fill {
          height: 100%;
          background: #27ae60;
          border-radius: 2px;
          animation: fillBar 2.5s linear forwards;
        }

        @keyframes fillBar {
          from { width: 0%; }
          to   { width: 100%; }
        }

        .error-msg {
          background: #fdf0ee;
          border: 1px solid #f5c6c0;
          border-radius: 6px;
          padding: 0.75rem 1rem;
          font-size: 0.82rem;
          color: #c0392b;
          font-weight: 500;
          margin-bottom: 1rem;
        }
      `}</style>

      <div className="verify-root">
        <div className="verify-bg">
          <Image
            src="/treasury-building.jpeg"
            alt=""
            fill
            style={{ objectFit: "cover" }}
            quality={60}
            aria-hidden="true"
          />
          <div className="verify-bg-overlay" />
        </div>

        <div className="verify-card">
          <div className="verify-logo">
            <Image
              src="/tnt-logo-1.png"
              alt="National Treasury"
              width={140}
              height={44}
              style={{ objectFit: "contain", height: "44px", width: "auto" }}
            />
          </div>

          {/* ── WAITING — check your email ── */}
          {status === "waiting" && (
            <>
              {/* <div className="verify-icon icon-waiting"></div> */}
              <h1 className="verify-title">Check Your Email</h1>
              <p className="verify-subtitle">
                We&apos;ve sent a verification link to your work email address.
                Click the link to activate your account.
              </p>
              {email && <div className="verify-email-badge">{email}</div>}
              <div className="verify-divider" />
              <div className="verify-steps">
                <div className="verify-step">
                  <div className="step-num">1</div>
                  <span>Open your work email inbox at <strong>@treasury.go.ke</strong></span>
                </div>
                <div className="verify-step">
                  <div className="step-num">2</div>
                  <span>Find the email from the National Treasury ICT Helpdesk</span>
                </div>
                <div className="verify-step">
                  <div className="step-num">3</div>
                  <span>Click <strong>&quot;Verify my account&quot;</strong> in the email</span>
                </div>
              </div>
              <Link href="/login" className="verify-link">← Back to Sign In</Link>
            </>
          )}

          {/* ── VERIFYING ── */}
          {status === "verifying" && (
            <>
              {/* <div className="verify-icon icon-verifying">🔐</div> */}
              <h1 className="verify-title">Verifying...</h1>
              <p className="verify-subtitle">
                Please wait while we verify your account. This will only take a moment.
              </p>
            </>
          )}

          {/* ── SUCCESS ── */}
          {status === "success" && (
            <>
              {/* <div className="verify-icon icon-success">✅</div> */}
              <h1 className="verify-title">Email Verified!</h1>
              <p className="verify-subtitle">
                Your account has been activated. Redirecting you to the dashboard...
              </p>
              <div className="success-bar">
                <div className="success-bar-fill" />
              </div>
            </>
          )}

          {/* ── ERROR ── */}
          {status === "error" && (
            <>
              {/* <div className="verify-icon icon-error">❌</div> */}
              <h1 className="verify-title">Verification Failed</h1>
              {message && <div className="error-msg">{message}</div>}
              <p className="verify-subtitle">
                The verification link may have expired or already been used.
                Please sign up again or contact ICT support.
              </p>
              <Link href="/signup">
                <button className="verify-btn">Try Again</button>
              </Link>
              <Link href="/login" className="verify-link">← Back to Sign In</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}