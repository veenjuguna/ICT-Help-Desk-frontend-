"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Stage = "verifying" | "success" | "error" | "waiting";

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [stage, setStage] = useState<Stage>(token ? "verifying" : "waiting");
  const [progress, setProgress] = useState(0);
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Read pending email from localStorage — all inside async IIFE
  useEffect(() => {
    (async () => {
      const pending = localStorage.getItem("pending_verify_email");
      if (pending) setEmail(pending);
    })();
  }, []);

  // Verify token if present — all setState inside async IIFE
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    const progressInterval = setInterval(() => {
      if (cancelled) return;
      setProgress((p) => {
        if (p >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return p + Math.random() * 12;
      });
    }, 200);

    (async () => {
      setStage("verifying");
      setProgress(0);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/verify?token=${token}`,
          { method: "GET" },
        );
        if (cancelled) return;
        clearInterval(progressInterval);
        if (res.ok) {
          setProgress(100);
          setTimeout(() => {
            if (!cancelled) {
              setStage("success");
              // localStorage.removeItem("pending_verify_email");
            }
          }, 400);
        } else {
          const data = await res.json().catch(() => ({}));
          setProgress(100);
          const msg =
            data?.detail ??
            data?.message ??
            "Verification failed. The link may have expired.";
          setTimeout(() => {
            if (!cancelled) {
              setErrorMsg(msg);
              setStage("error");
            }
          }, 400);
        }
      } catch {
        if (cancelled) return;
        clearInterval(progressInterval);
        setProgress(100);
        setTimeout(() => {
          if (!cancelled) {
            setErrorMsg(
              "Network error. Please check your connection and try again.",
            );
            setStage("error");
          }
        }, 400);
      }
    })();

    return () => {
      cancelled = true;
      clearInterval(progressInterval);
    };
  }, [token]);

  // Countdown after success then redirect — all inside callback
  useEffect(() => {
    if (stage !== "success") return;
    if (countdown <= 0) {
      router.push("/login");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [stage, countdown, router]);

  const handleResend = async () => {
    if (!email || resending) return;
    setResending(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        },
      );
    } catch {
      // silent
    } finally {
      setResending(false);
      setResent(true);
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

        .vp-root {
          display: flex; width: 100%; height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif; overflow: hidden;
        }

        .vp-left {
          width: 42%; flex-shrink: 0; position: relative;
          height: 100vh; display: flex; flex-direction: column;
          justify-content: center; overflow: hidden;
        }

        .vp-left-overlay {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(160deg, rgba(74,30,10,0.55) 0%, rgba(50,15,5,0.82) 60%, rgba(30,8,2,0.94) 100%);
        }

        .vp-left-content {
          position: relative; z-index: 2; padding: 3rem 2.75rem;
          display: flex; flex-direction: column; gap: 1.1rem;
        }

        .vp-logo-wrap {
          display: inline-flex; align-items: center;
          background: rgba(255,255,255,0.95);
          padding: 7px 14px; border-radius: 9px;
          border-left: 4px solid var(--gold); width: fit-content;
        }

        .vp-tagline {
          font-size: 10.5px; font-weight: 700;
          letter-spacing: 2.5px; text-transform: uppercase; color: var(--gold-light);
        }

        .vp-left-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.1rem; font-weight: 700; color: #fff; line-height: 1.25;
        }

        .vp-left-title span { color: var(--gold-light); }

        .vp-divider { width: 48px; height: 3px; background: var(--gold); border-radius: 2px; }

        .vp-steps {
          display: flex; flex-direction: column; gap: 0.8rem;
          padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.14);
        }

        .vp-step { display: flex; align-items: center; gap: 0.65rem; font-size: 12.5px; line-height: 1.5; }

        .vp-step-dot {
          width: 22px; height: 22px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 11px; font-weight: 700;
        }

        .vp-step-dot.done { background: rgba(200,150,46,0.3); border: 1.5px solid var(--gold); color: var(--gold-light); }
        .vp-step-dot.active { background: var(--gold); border: 1.5px solid var(--gold-light); color: #fff; }
        .vp-step-dot.pending { background: rgba(255,255,255,0.08); border: 1.5px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.3); }

        .vp-step-label { color: rgba(255,255,255,0.65); }
        .vp-step-label.active { color: #fff; font-weight: 600; }
        .vp-step-label.done { color: rgba(255,255,255,0.45); text-decoration: line-through; }

        .vp-right {
          flex: 1; min-width: 0; height: 100vh;
          background: var(--cream);
          display: flex; flex-direction: column;
          align-items: center; justify-content: center; padding: 2.5rem 2rem;
        }

        .vp-card {
          background: #fff; border-radius: 18px;
          border: 1px solid var(--border);
          padding: 2.5rem 2.25rem;
          width: 100%; max-width: 440px;
          box-shadow: 0 8px 32px rgba(107,45,15,0.08);
          display: flex; flex-direction: column;
          align-items: center; text-align: center; gap: 1.25rem;
        }

        .vp-icon-circle {
          width: 72px; height: 72px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        .vp-icon-circle.verifying { background: rgba(200,150,46,0.12); border: 2px solid rgba(200,150,46,0.3); }
        .vp-icon-circle.waiting   { background: rgba(107,45,15,0.08);  border: 2px solid rgba(107,45,15,0.2);  }
        .vp-icon-circle.success   { background: rgba(30,107,51,0.1);   border: 2px solid rgba(30,107,51,0.3);  }
        .vp-icon-circle.error     { background: rgba(187,0,0,0.08);    border: 2px solid rgba(187,0,0,0.2);    }

        .vp-spinner {
          width: 32px; height: 32px;
          border: 3px solid rgba(200,150,46,0.2);
          border-top-color: var(--gold); border-radius: 50%;
          animation: vp-spin 0.8s linear infinite;
        }

        @keyframes vp-spin { to { transform: rotate(360deg); } }

        .vp-progress-wrap {
          width: 100%; background: #F0E8DC;
          border-radius: 99px; height: 6px; overflow: hidden;
        }

        .vp-progress-bar {
          height: 100%; border-radius: 99px;
          background: linear-gradient(90deg, var(--brown-main), var(--gold));
          transition: width 0.3s ease;
        }

        .vp-progress-label { font-size: 11px; color: var(--text-sub); font-weight: 600; letter-spacing: 0.5px; }

        .vp-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); }

        .vp-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem; font-weight: 700; color: var(--text-main); line-height: 1.3;
        }

        .vp-desc { font-size: 13.5px; color: var(--text-sub); line-height: 1.7; max-width: 340px; }

        .vp-email-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: #FDF4E7; border: 1px solid #E8D4A8;
          border-radius: 99px; padding: 5px 14px;
          font-size: 13px; font-weight: 600; color: var(--brown-main);
        }

        .vp-countdown-label { font-size: 11px; color: var(--text-sub); }

        .vp-btn-primary {
          width: 100%; height: 46px;
          background: var(--brown-main); color: #fff;
          border: none; border-radius: 10px;
          font-size: 14px; font-weight: 600; font-family: inherit;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s; position: relative; overflow: hidden;
          text-decoration: none;
        }

        .vp-btn-primary::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0;
          height: 2px; background: var(--gold);
        }

        .vp-btn-primary:hover { background: var(--brown-dark); }

        .vp-btn-ghost {
          background: none; border: 1.5px solid var(--border);
          border-radius: 10px; height: 42px; padding: 0 1.25rem;
          font-size: 13px; font-weight: 600; font-family: inherit;
          color: var(--text-sub); cursor: pointer;
          transition: border-color 0.15s, color 0.15s; width: 100%;
        }

        .vp-btn-ghost:hover:not(:disabled) { border-color: var(--brown-mid); color: var(--brown-main); }
        .vp-btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

        .vp-resent { font-size: 12px; color: #1E6B33; font-weight: 600; display: flex; align-items: center; gap: 5px; }

        .vp-footer { margin-top: 1.5rem; font-size: 11px; color: #C0A882; text-align: center; }

        @media (max-width: 860px) {
          .vp-left { display: none; }
          .vp-right { padding: 2rem 1rem; }
        }
      `}</style>

      <div className="vp-root">
        {/* LEFT */}
        <div className="vp-left">
          <Image
            src="/treasury-building.jpeg"
            alt="National Treasury Building"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
            quality={85}
            sizes="42vw"
          />
          <div className="vp-left-overlay" />
          <div className="vp-left-content">
            <div className="vp-logo-wrap">
              <Image
                src="/tnt-logo-1.png"
                alt="The National Treasury"
                width={200}
                height={48}
                style={{ objectFit: "contain", height: "36px", width: "auto" }}
                priority
              />
            </div>
            <p className="vp-tagline">ICT Helpdesk Portal</p>
            <h1 className="vp-left-title">
              Almost <span>there!</span>
            </h1>
            <div className="vp-divider" />
            <div className="vp-steps">
              {[
                { label: "Fill in your details", status: "done" },
                {
                  label: "Verify your email",
                  status: stage === "success" ? "done" : "active",
                },
                {
                  label: "Log in and raise tickets",
                  status: stage === "success" ? "active" : "pending",
                },
              ].map((s, i) => (
                <div className="vp-step" key={i}>
                  <div className={`vp-step-dot ${s.status}`}>
                    {s.status === "done" ? "✓" : i + 1}
                  </div>
                  <span className={`vp-step-label ${s.status}`}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="vp-right">
          <div className="vp-card">
            {/* VERIFYING */}
            {stage === "verifying" && (
              <>
                <div className="vp-icon-circle verifying">
                  <div className="vp-spinner" />
                </div>
                <p className="vp-eyebrow">Please wait</p>
                <h2 className="vp-title">Verifying your email</h2>
                <p className="vp-desc">
                  We&apos;re confirming your account. This only takes a moment.
                </p>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div className="vp-progress-wrap">
                    <div
                      className="vp-progress-bar"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="vp-progress-label">
                    {Math.round(Math.min(progress, 100))}% complete
                  </p>
                </div>
              </>
            )}

            {/* WAITING */}
            {stage === "waiting" && (
              <>
                <div className="vp-icon-circle waiting">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6B2D0F"
                    strokeWidth="1.8"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m2 7 10 7 10-7" />
                  </svg>
                </div>
                <p className="vp-eyebrow">Check your inbox</p>
                <h2 className="vp-title">Verify your email address</h2>
                {email && (
                  <div className="vp-email-pill">
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
                )}
                <p className="vp-desc">
                  We&apos;ve sent a verification link to your work email. Click
                  the link to activate your account.
                </p>
                <div
                  style={{
                    width: "100%",
                    background: "#FDF4E7",
                    border: "1px solid #E8D4A8",
                    borderRadius: 10,
                    padding: "0.9rem 1rem",
                    fontSize: 13,
                    color: "#7A5C44",
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: "#6B2D0F" }}>
                    Didn&apos;t receive it?
                  </strong>{" "}
                  Check your spam folder or request a new link below.
                </div>
                {resent ? (
                  <p className="vp-resent">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Verification email resent!
                  </p>
                ) : (
                  <button
                    className="vp-btn-ghost"
                    onClick={handleResend}
                    disabled={resending || !email}
                  >
                    {resending ? "Sending..." : "Resend verification email"}
                  </button>
                )}
              </>
            )}

            {/* SUCCESS */}
            {stage === "success" && (
              <>
                <div className="vp-icon-circle success">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#1E6B33"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="9 12 11 14 15 10" />
                  </svg>
                </div>
                <p className="vp-eyebrow">Verified!</p>
                <h2 className="vp-title">Email confirmed 🎉</h2>
                <p className="vp-desc">
                  Your account has been verified. You can now sign in to the
                  National Treasury ICT Helpdesk.
                </p>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div className="vp-progress-wrap">
                    <div
                      className="vp-progress-bar"
                      style={{
                        width: "100%",
                        background: "linear-gradient(90deg, #1E6B33, #27ae60)",
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <svg viewBox="0 0 48 48" width="56" height="56">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="#F0E8DC"
                      strokeWidth="4"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      fill="none"
                      stroke="#6B2D0F"
                      strokeWidth="4"
                      strokeDasharray={`${(countdown / 5) * 125.6} 125.6`}
                      strokeLinecap="round"
                      transform="rotate(-90 24 24)"
                      style={{ transition: "stroke-dasharray 0.9s linear" }}
                    />
                    <text
                      x="24"
                      y="29"
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="700"
                      fill="#6B2D0F"
                    >
                      {countdown}
                    </text>
                  </svg>
                  <p className="vp-countdown-label">
                    Redirecting to login in {countdown}s
                  </p>
                </div>
                <Link href="/login" className="vp-btn-primary">
                  Sign in now
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
                </Link>
              </>
            )}

            {/* ERROR */}
            {stage === "error" && (
              <>
                <div className="vp-icon-circle error">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#BB0000"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p className="vp-eyebrow" style={{ color: "#BB0000" }}>
                  Verification failed
                </p>
                <h2 className="vp-title">Something went wrong</h2>
                <p className="vp-desc">{errorMsg}</p>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {resent ? (
                    <p className="vp-resent">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      New verification email sent!
                    </p>
                  ) : (
                    <button
                      className="vp-btn-ghost"
                      onClick={handleResend}
                      disabled={resending || !email}
                    >
                      {resending
                        ? "Sending..."
                        : "Request new verification link"}
                    </button>
                  )}
                  <Link href="/login" className="vp-btn-primary">
                    Back to login
                  </Link>
                </div>
              </>
            )}
          </div>

          <p className="vp-footer">
            © {new Date().getFullYear()} National Treasury &amp; Economic
            Planning · Government of Kenya
          </p>
        </div>
      </div>
    </>
  );
}
