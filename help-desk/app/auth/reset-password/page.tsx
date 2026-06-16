"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Stage = "idle" | "loading" | "success" | "error" | "invalid";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}

const EyeIcon = ({ open }: { open: boolean }) =>
    open ? (
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
    );

const LockIcon = () => (
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
);

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [stage, setStage] = useState<Stage>(token ? "idle" : "invalid");


  const [errorMsg, setErrorMsg] = useState("");

  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
  const strength = Object.values(checks).filter(Boolean).length;
  const strengthMeta = [
    { label: "", color: "" },
    { label: "Weak", color: "text-red-700" },
    { label: "Fair", color: "text-[#C8962E]" },
    { label: "Good", color: "text-[#E8B84B]" },
    { label: "Strong", color: "text-green-700" },
  ][strength];
  const barColor = [
    "",
    "bg-red-700",
    "bg-[#C8962E]",
    "bg-[#E8B84B]",
    "bg-green-700",
  ][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      setStage("error");
      return;
    }
    if (!checks.length || !checks.upper || !checks.number || !checks.special) {
      setErrorMsg("Password must have 8+ characters, an uppercase letter, a number, and a symbol.");
      setStage("error");
      return;
    }

    setStage("loading");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, new_password: password, confirm_new_password: confirm }),
        },
      );
      if (res.ok) {
        setStage("success");
        setTimeout(() => router.push("/login"), 4000);
     } else {
        let message = "Reset failed. The link may have expired.";
        try {
          const data = await res.json();
          message = data?.detail ?? data?.message ?? message;
        } catch {
          // response wasn't JSON, keep default
        }
        setErrorMsg(message);
        setStage("error");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setStage("error");
    }
  };

  const steps = [
    { label: "Requested a reset link", done: true, active: false },
    {
      label: "Set your new password",
      done: stage === "success",
      active: stage !== "success",
    },
    {
      label: "Sign in with new password",
      done: false,
      active: stage === "success",
    },
  ];


  return (
    <div className="flex min-h-screen w-full font-sans overflow-hidden">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex w-[55%] relative flex-col justify-end flex-shrink-0 overflow-hidden">
        <Image
          src="/treasury-building.jpeg"
          alt="National Treasury Building"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
          quality={85}
          sizes="55vw"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(74,30,10,0.3) 0%, rgba(74,30,10,0.6) 50%, rgba(74,30,10,0.92) 100%)",
          }}
        />

        <div className="relative z-20 p-12 flex flex-col gap-4">
          {/* Logo */}
          <div className="inline-flex items-center bg-white/95 px-4 py-2 rounded-[10px] border-l-4 border-[#C8962E] w-fit mb-1">
            <Image
              src="/tnt-logo-1.png"
              alt="The National Treasury"
              width={200}
              height={48}
              style={{ objectFit: "contain", height: "38px", width: "auto" }}
              priority
            />
          </div>

          <p className="text-[11px] font-semibold tracking-[2.5px] uppercase text-[#E8B84B]">
            ICT Helpdesk Portal
          </p>

          <h1 className="font-serif text-[2.2rem] font-bold text-white leading-tight">
            Set a new <span className="text-[#E8B84B]">password</span>
          </h1>

          <div className="w-12 h-[3px] bg-[#C8962E] rounded-full" />

          <p className="text-[13.5px] text-white/60 leading-relaxed max-w-[340px]">
            Choose a strong password to keep your account secure.
          </p>

          {/* Steps */}
          <div className="flex flex-col gap-3 pt-5 border-t border-white/[0.14]">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-[10px]">
                <div
                  className={`w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold border
                  ${s.done ? "bg-[#C8962E]/30 border-[#C8962E] text-[#E8B84B]" : ""}
                  ${s.active ? "bg-[#C8962E] border-[#E8B84B] text-white" : ""}
                  ${!s.done && !s.active ? "bg-white/[0.08] border-white/20 text-white/30" : ""}
                `}
                >
                  {s.done ? "✓" : i + 1}
                </div>
                <span
                  className={`text-[12.5px] leading-relaxed
                  ${s.done ? "text-white/40 line-through" : ""}
                  ${s.active ? "text-white font-semibold" : ""}
                  ${!s.done && !s.active ? "text-white/60" : ""}
                `}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 min-w-0 bg-[#FDF8F2] flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="bg-white rounded-[18px] border border-[#E0D0C0] p-8 w-full max-w-[420px] shadow-[0_8px_32px_rgba(107,45,15,0.08)] flex flex-col">
          {/* ── INVALID / NO TOKEN ── */}
          {stage === "invalid" && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-700/[0.08] border-2 border-red-700/20 flex items-center justify-center mb-5">
                <svg
                  width="28"
                  height="28"
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
              <p className="text-[11px] font-bold tracking-[2px] uppercase text-red-700 mb-1">
                Invalid link
              </p>
              <h2 className="font-serif text-[1.75rem] font-bold text-[#1A0F08] leading-snug mb-1">
                Link missing or expired
              </h2>
              <p className="text-[13.5px] text-[#7A5C44] leading-relaxed mb-6">
                This password reset link is invalid or has already been used.
                Please request a new one.
              </p>
              <Link
                href="/forgot-password"
                className="relative overflow-hidden w-full h-12 bg-[#6B2D0F] hover:bg-[#4A1E0A] text-white rounded-[10px] text-sm font-semibold flex items-center justify-center gap-2 transition-colors before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-[#C8962E]"
              >
                Request new link
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
              <Link
                href="/login"
                className="mt-3 w-full h-11 border border-[#E0D0C0] hover:border-[#8B4513] hover:text-[#6B2D0F] text-[#7A5C44] rounded-[10px] text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
              >
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

          {/* ── FORM ── */}
          {(stage === "idle" || stage === "loading" || stage === "error") && (
            <>
              <div className="w-16 h-16 rounded-full bg-[#C8962E]/10 border-2 border-[#C8962E]/30 flex items-center justify-center mb-5">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#C8962E"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>

              <p className="text-[11px] font-bold tracking-[2px] uppercase text-[#C8962E] mb-1">
                New Password
              </p>
              <h2 className="font-serif text-[1.75rem] font-bold text-[#1A0F08] leading-snug mb-1">
                Reset your password
              </h2>
              <p className="text-[13.5px] text-[#7A5C44] leading-relaxed mb-6">
                Choose a strong password you haven&apos;t used before.
              </p>

              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-0"
              >
                {/* New password */}
                <div className="mb-4">
                  <label
                    htmlFor="rp-password"
                    className="block text-xs font-semibold text-[#1A0F08] mb-1.5"
                  >
                    New Password
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-[13px] text-[#7A5C44] flex items-center pointer-events-none">
                      <LockIcon />
                    </span>
                    <input
                      id="rp-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      autoComplete="new-password"
                      disabled={stage === "loading"}
                      required
                      className="w-full h-[46px] pl-10 pr-11 border border-[#E0D0C0] rounded-[10px] text-sm bg-[#FDF8F2] text-[#1A0F08] placeholder-[#C0A882] outline-none focus:border-[#8B4513] focus:bg-white focus:ring-2 focus:ring-[#8B4513]/10 transition-all disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-[#7A5C44] hover:text-[#8B4513] p-1 rounded transition-colors"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>

                  {/* Strength meter */}
                  {password.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`flex-1 h-1 rounded-full transition-colors ${i < strength ? barColor : "bg-[#F0E4D0]"}`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {(
                            [
                              { key: "length", label: "8+ chars" },
                              { key: "upper", label: "Uppercase" },
                              { key: "number", label: "Number" },
                              { key: "special", label: "Symbol" },
                            ] as const
                          ).map(({ key, label }) => (
                            <span
                              key={key}
                              className={`flex items-center gap-1 text-[11px] transition-colors ${checks[key] ? "text-green-700" : "text-[#B0906A]"}`}
                            >
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                              >
                                {checks[key] ? (
                                  <polyline points="20 6 9 17 4 12" />
                                ) : (
                                  <circle
                                    cx="12"
                                    cy="12"
                                    r="9"
                                    strokeWidth="2"
                                  />
                                )}
                              </svg>
                              {label}
                            </span>
                          ))}
                        </div>
                        <span
                          className={`text-[11px] font-bold ${strengthMeta.color}`}
                        >
                          {strengthMeta.label}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="mb-2">
                  <label
                    htmlFor="rp-confirm"
                    className="block text-xs font-semibold text-[#1A0F08] mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-[13px] text-[#7A5C44] flex items-center pointer-events-none">
                      <LockIcon />
                    </span>
                    <input
                      id="rp-confirm"
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••••"
                      autoComplete="new-password"
                      disabled={stage === "loading"}
                      required
                      style={{
                        borderColor:
                          confirm.length > 0
                            ? confirm === password
                              ? "#1E6B33"
                              : "#BB0000"
                            : undefined,
                      }}
                      className="w-full h-[46px] pl-10 pr-11 border border-[#E0D0C0] rounded-[10px] text-sm bg-[#FDF8F2] text-[#1A0F08] placeholder-[#C0A882] outline-none focus:bg-white focus:ring-2 focus:ring-[#8B4513]/10 transition-all disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 text-[#7A5C44] hover:text-[#8B4513] p-1 rounded transition-colors"
                    >
                      <EyeIcon open={showConfirm} />
                    </button>
                  </div>
                  {confirm.length > 0 && (
                    <p
                      className={`text-[11.5px] mt-1.5 ${confirm === password ? "text-green-700" : "text-red-700"}`}
                    >
                      {confirm === password
                        ? "✓ Passwords match"
                        : "Passwords do not match"}
                    </p>
                  )}
                </div>

                {/* Error */}
                {(stage === "error" || errorMsg) && (
                  <div
                    className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2.5 text-[12.5px] text-[#6B2D0F] mt-2"
                    role="alert"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="flex-shrink-0"
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
                  disabled={stage === "loading" || !password || !confirm}
                  className="relative overflow-hidden mt-5 w-full h-12 bg-[#6B2D0F] hover:bg-[#4A1E0A] disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-[10px] text-sm font-semibold flex items-center justify-center gap-2 transition-colors before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-[#C8962E]"
                >
                  {stage === "loading" ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
                      Resetting password...
                    </>
                  ) : (
                    <>
                      Reset password
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

              <Link
                href="/login"
                className="mt-3 w-full h-11 border border-[#E0D0C0] hover:border-[#8B4513] hover:text-[#6B2D0F] text-[#7A5C44] rounded-[10px] text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors"
              >
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

          {/* ── SUCCESS ── */}
          {stage === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-700/10 border-2 border-green-700/30 flex items-center justify-center mb-5">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1E6B33"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <p className="text-[11px] font-bold tracking-[2px] uppercase text-green-700 mb-1">
                All done!
              </p>
              <h2 className="font-serif text-[1.75rem] font-bold text-[#1A0F08] leading-snug mb-1">
                Password updated 🎉
              </h2>
              <p className="text-[13.5px] text-[#7A5C44] leading-relaxed mb-6">
                Your password has been reset. You can now sign in with your new
                password.
              </p>

              <div className="flex flex-col items-center gap-2 mb-6">
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
                    strokeDasharray="125.6 125.6"
                    strokeLinecap="round"
                    transform="rotate(-90 24 24)"
                    style={{ transition: "stroke-dasharray 3.9s linear" }}
                  />
                  <text
                    x="24"
                    y="29"
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="700"
                    fill="#6B2D0F"
                  >
                    ✓
                  </text>
                </svg>
                <p className="text-[11px] text-[#7A5C44]">
                  Redirecting to sign in…
                </p>
              </div>

              <Link
                href="/login"
                className="relative overflow-hidden w-full h-12 bg-[#6B2D0F] hover:bg-[#4A1E0A] text-white rounded-[10px] text-sm font-semibold flex items-center justify-center gap-2 transition-colors before:absolute before:top-0 before:left-0 before:right-0 before:h-[2px] before:bg-[#C8962E]"
              >
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
        </div>

        <p className="mt-6 text-[11px] text-[#C0A882] text-center max-w-[420px]">
          © {new Date().getFullYear()} National Treasury &amp; Economic Planning
          · Government of Kenya
        </p>
      </div>
    </div>
  );
}
