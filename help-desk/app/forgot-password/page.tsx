"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type Stage = "idle" | "loading" | "sent" | "error";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStage("loading");
    setErrorMsg("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      if (res.ok) {
        setStage("sent");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(
          data?.detail ??
            data?.message ??
            "Something went wrong. Please try again.",
        );
        setStage("error");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStage("error");
    }
  };

  const handleRetry = () => {
    setStage("idle");
    setErrorMsg("");
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

        .fp-root {
          display: flex;
          min-height: 100vh;
          width: 100%;
          font-family: 'Plus Jakarta Sans', sans-serif;
          overflow: hidden;
        }

        /* ── LEFT PANEL ── */
        .fp-left {
          width: 55%;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .fp-overlay {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(
            to bottom,
            rgba(74,30,10,0.3) 0%,
            rgba(74,30,10,0.6) 50%,
            rgba(74,30,10,0.92) 100%
          );
        }

        .fp-left-content {
          position: relative; z-index: 2;
          padding: 3rem;
          display: flex; flex-direction: column; gap: 1rem;
        }

        .fp-logo-wrap {
          display: inline-flex; align-items: center;
          background: rgba(255,255,255,0.95);
          padding: 8px 16px; border-radius: 10px;
          border-left: 4px solid var(--gold);
          width: fit-content; margin-bottom: 0.5rem;
        }

        .fp-tagline {
          font-size: 11px; font-weight: 600;
          letter-spacing: 2.5px; text-transform: uppercase;
          color: var(--gold-light);
        }

        .fp-left-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.2rem; font-weight: 700;
          color: #fff; line-height: 1.25;
        }

        .fp-left-title span { color: var(--gold-light); }

        .fp-divider {
          width: 48px; height: 3px;
          background: var(--gold); border-radius: 2px;
        }

        .fp-left-desc {
          font-size: 13.5px; color: rgba(255,255,255,0.6);
          line-height: 1.75; max-width: 340px;
        }

        /* steps */
        .fp-steps {
          display: flex; flex-direction: column; gap: 0.8rem;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255,255,255,0.14);
        }

        .fp-step { display: flex; align-items: center; gap: 0.65rem; }

        .fp-step-dot {
          width: 22px; height: 22px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 11px; font-weight: 700;
        }

        .fp-step-dot.active  { background: var(--gold); border: 1.5px solid var(--gold-light); color: #fff; }
        .fp-step-dot.pending { background: rgba(255,255,255,0.08); border: 1.5px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.3); }
        .fp-step-dot.done    { background: rgba(200,150,46,0.3); border: 1.5px solid var(--gold); color: var(--gold-light); }

        .fp-step-label { font-size: 12.5px; color: rgba(255,255,255,0.6); line-height: 1.5; }
        .fp-step-label.active  { color: #fff; font-weight: 600; }
        .fp-step-label.done    { color: rgba(255,255,255,0.4); text-decoration: line-through; }

        /* ── RIGHT PANEL ── */
        .fp-right {
          flex: 1; min-width: 0; background: var(--cream);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 3rem 2rem;
        }

        .fp-card {
          background: #fff; border-radius: 18px;
          border: 1px solid var(--border);
          padding: 2.5rem 2.25rem;
          width: 100%; max-width: 400px;
          box-shadow: 0 8px 32px rgba(107,45,15,0.08);
          display: flex; flex-direction: column; gap: 0;
        }

        /* ── ICON CIRCLE ── */
        .fp-icon-circle {
          width: 64px; height: 64px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.25rem; flex-shrink: 0;
        }

        .fp-icon-circle.key     { background: rgba(200,150,46,0.1);  border: 2px solid rgba(200,150,46,0.3); }
        .fp-icon-circle.success { background: rgba(30,107,51,0.1);   border: 2px solid rgba(30,107,51,0.3); }
        .fp-icon-circle.error   { background: rgba(187,0,0,0.08);    border: 2px solid rgba(187,0,0,0.2); }

        .fp-eyebrow {
          font-size: 11px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          color: var(--gold); margin-bottom: 0.4rem;
        }

        .fp-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.75rem; font-weight: 700;
          color: var(--text-main); line-height: 1.3;
          margin-bottom: 0.4rem;
        }

        .fp-desc {
          font-size: 13.5px; color: var(--text-sub);
          line-height: 1.7; margin-bottom: 1.75rem;
        }

        /* ── FIELD ── */
        .fp-field-label {
          display: block; font-size: 12px; font-weight: 600;
          color: var(--text-main); margin-bottom: 6px;
        }

        .fp-field-wrap { position: relative; display: flex; align-items: center; margin-bottom: 1.5rem; }

        .fp-field-icon {
          position: absolute; left: 13px;
          color: var(--text-sub); display: flex; align-items: center; pointer-events: none;
        }

        .fp-field-input {
          width: 100%; height: 46px;
          padding: 0 16px 0 40px;
          border: 1.5px solid var(--border); border-radius: 10px;
          font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
          background: var(--cream); color: var(--text-main);
          outline: none; transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        }

        .fp-field-input::placeholder { color: #C0A882; font-size: 13px; }

        .fp-field-input:focus {
          border-color: var(--brown-mid); background: #fff;
          box-shadow: 0 0 0 3px rgba(139,69,19,0.1);
        }

        .fp-field-input:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── ERROR BOX ── */
        .fp-error-msg {
          display: flex; align-items: center; gap: 7px;
          background: #fff5f0; border: 1px solid #f5c8a8;
          border-radius: 8px; padding: 10px 12px;
          font-size: 12.5px; color: var(--brown-main);
          margin-bottom: 1rem;
        }

        /* ── BUTTONS ── */
        .fp-btn-primary {
          width: 100%; height: 48px;
          background: var(--brown-main); color: #fff;
          border: none; border-radius: 10px;
          font-size: 14px; font-weight: 600; font-family: inherit;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s, transform 0.1s;
          position: relative; overflow: hidden;
          text-decoration: none;
        }

        .fp-btn-primary::before {
          content: ''; position: absolute;
          top: 0; left: 0; right: 0; height: 2px;
          background: var(--gold);
        }

        .fp-btn-primary:hover:not(:disabled) { background: var(--brown-dark); }
        .fp-btn-primary:active:not(:disabled) { transform: scale(0.99); }
        .fp-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

        .fp-btn-ghost {
          width: 100%; height: 44px;
          background: none; border: 1.5px solid var(--border);
          border-radius: 10px; margin-top: 0.75rem;
          font-size: 13px; font-weight: 600; font-family: inherit;
          color: var(--text-sub); cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          text-decoration: none;
        }

        .fp-btn-ghost:hover { border-color: var(--brown-mid); color: var(--brown-main); }

        /* ── SPINNER ── */
        .fp-spinner {
          width: 16px; height: 16px; flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff; border-radius: 50%;
          animation: fp-spin 0.7s linear infinite;
        }

        @keyframes fp-spin { to { transform: rotate(360deg); } }

        /* ── SUCCESS EMAIL PILL ── */
        .fp-email-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: #FDF4E7; border: 1px solid #E8D4A8;
          border-radius: 99px; padding: 5px 14px;
          font-size: 13px; font-weight: 600; color: var(--brown-main);
          margin-bottom: 1rem; max-width: 100%;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }

        /* ── HINT BOX ── */
        .fp-hint {
          width: 100%; background: #FDF4E7;
          border: 1px solid #E8D4A8; border-radius: 10px;
          padding: 0.9rem 1rem;
          font-size: 13px; color: #7A5C44;
          line-height: 1.6; margin-bottom: 1.5rem;
        }

        /* ── BACK LINK ── */
        .fp-back-row {
          margin-top: 1.25rem; text-align: center;
          font-size: 13px; color: var(--text-sub);
        }

        .fp-back-row a {
          color: var(--brown-main); font-weight: 600;
          text-decoration: none;
          border-bottom: 1px solid var(--gold); padding-bottom: 1px;
        }

        .fp-back-row a:hover { color: var(--gold); }

        /* ── FOOTER ── */
        .fp-footer {
          margin-top: 1.5rem; font-size: 11px;
          color: #C0A882; text-align: center; max-width: 400px;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .fp-root { flex-direction: column; }
          .fp-left { width: 100%; min-height: 240px; }
          .fp-steps { display: none; }
          .fp-left-title { font-size: 1.6rem; }
          .fp-left-content { padding: 2rem; }
          .fp-right { padding: 2rem 1rem; }
          .fp-card { padding: 1.75rem 1.25rem; }
        }
      `}</style>

      <div className="fp-root">
        {/* LEFT */}
        <div className="fp-left">
          <Image
            src="/treasury-building.jpeg"
            alt="National Treasury Building"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
            quality={85}
            sizes="55vw"
          />
          <div className="fp-overlay" />
          <div className="fp-left-content">
            <div className="fp-logo-wrap">
              <Image
                src="/tnt-logo-1.png"
                alt="The National Treasury"
                width={200}
                height={48}
                style={{ objectFit: "contain", height: "38px", width: "auto" }}
                priority
              />
            </div>
            <p className="fp-tagline">ICT Helpdesk Portal</p>
            <h1 className="fp-left-title">
              Reset your <span>password</span>
            </h1>
            <div className="fp-divider" />
            <p className="fp-left-desc">
              Enter your work email and we&apos;ll send you a secure link to
              reset your password.
            </p>
            <div className="fp-steps">
              {[
                {
                  label: "Enter your work email",
                  status: stage === "sent" ? "done" : "active",
                },
                {
                  label: "Check your inbox for the reset link",
                  status: stage === "sent" ? "active" : "pending",
                },
                { label: "Set a new password and sign in", status: "pending" },
              ].map((s, i) => (
                <div className="fp-step" key={i}>
                  <div className={`fp-step-dot ${s.status}`}>
                    {s.status === "done" ? "✓" : i + 1}
                  </div>
                  <span className={`fp-step-label ${s.status}`}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="fp-right">
          <div className="fp-card">
            {/* ── IDLE / ERROR FORM ── */}
            {(stage === "idle" || stage === "loading" || stage === "error") && (
              <>
                <div className="fp-icon-circle key">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C8962E"
                    strokeWidth="1.8"
                  >
                    <circle cx="7.5" cy="15.5" r="4.5" />
                    <path d="M10.85 12.15 19 4" />
                    <path d="M18 5l1.5 1.5" />
                    <path d="M16 7l1.5 1.5" />
                  </svg>
                </div>

                <p className="fp-eyebrow">Account Recovery</p>
                <h2 className="fp-title">Forgot your password?</h2>
                <p className="fp-desc">
                  No worries. Enter your official work email and we&apos;ll send
                  you a link to reset it.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                  <label htmlFor="fp-email" className="fp-field-label">
                    Work Email
                  </label>
                  <div className="fp-field-wrap">
                    <span className="fp-field-icon">
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
                      id="fp-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@treasury.go.ke"
                      className="fp-field-input"
                      autoComplete="email"
                      disabled={stage === "loading"}
                      required
                    />
                  </div>

                  {stage === "error" && (
                    <div className="fp-error-msg" role="alert">
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
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="fp-btn-primary"
                    disabled={stage === "loading" || !email}
                  >
                    {stage === "loading" ? (
                      <>
                        <span className="fp-spinner" />
                        Sending reset link...
                      </>
                    ) : (
                      <>
                        Send reset link
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
                </form>

                <div className="fp-back-row">
                  Remembered it?&nbsp;<Link href="/login">Back to sign in</Link>
                </div>
              </>
            )}

            {/* ── SENT ── */}
            {stage === "sent" && (
              <>
                <div className="fp-icon-circle success">
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1E6B33"
                    strokeWidth="1.8"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m2 7 10 7 10-7" />
                    <polyline
                      points="7 13 10 16 17 9"
                      strokeWidth="2"
                      stroke="#1E6B33"
                    />
                  </svg>
                </div>

                <p className="fp-eyebrow" style={{ color: "#1E6B33" }}>
                  Email sent
                </p>
                <h2 className="fp-title">Check your inbox</h2>

                <div className="fp-email-pill">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m2 7 10 7 10-7" />
                  </svg>
                  {email}
                </div>

                <p className="fp-desc">
                  We&apos;ve sent a password reset link to your work email. The
                  link expires in 30 minutes.
                </p>

                <div className="fp-hint">
                  <strong style={{ color: "#6B2D0F" }}>
                    Didn&apos;t receive it?
                  </strong>{" "}
                  Check your spam or junk folder. If it still doesn&apos;t
                  arrive, you can request a new link.
                </div>

                <button className="fp-btn-primary" onClick={handleRetry}>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 .49-4.5" />
                  </svg>
                  Send another link
                </button>

                <Link href="/login" className="fp-btn-ghost">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back to sign in
                </Link>
              </>
            )}
          </div>

          <p className="fp-footer">
            © {new Date().getFullYear()} National Treasury &amp; Economic
            Planning · Government of Kenya
          </p>
        </div>
      </div>
    </>
  );
}
