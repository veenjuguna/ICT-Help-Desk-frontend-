"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SplashPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + 2;
      });
    }, 50);

    const fadeTimer = setTimeout(() => setFadeOut(true), 2600);
    const redirectTimer = setTimeout(() => router.push("/login"), 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .splash-root {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #4A1E0A;
          position: relative;
          overflow: hidden;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: opacity 0.4s ease;
        }

        .splash-root.fade-out { opacity: 0; }

        .splash-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .splash-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(74,30,10,0.92) 0%, rgba(30,8,2,0.97) 100%);
          z-index: 1;
        }

        .deco-circle-1 {
          position: absolute;
          top: -120px; right: -120px;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: rgba(200,150,46,0.07);
          z-index: 1;
        }

        .deco-circle-2 {
          position: absolute;
          bottom: -80px; left: -80px;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: rgba(200,150,46,0.05);
          z-index: 1;
        }

        .splash-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .logo-wrap {
          background: rgba(255,255,255,0.95);
          border-radius: 14px;
          padding: 12px 24px;
          border-bottom: 3px solid #C8962E;
          margin-bottom: 2.5rem;
          animation: logoIn 0.6s cubic-bezier(.4,0,.2,1) forwards;
          opacity: 0;
          transform: translateY(20px);
        }

        @keyframes logoIn { to { opacity: 1; transform: translateY(0); } }

        .divider {
          width: 48px; height: 2px;
          background: #C8962E;
          border-radius: 2px;
          margin: 1.25rem 0;
          animation: fadeIn 0.5s 0.5s forwards;
          opacity: 0;
        }

        .splash-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #fff;
          text-align: center;
          animation: fadeIn 0.5s 0.6s forwards;
          opacity: 0;
        }

        .splash-sub {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #E8B84B;
          text-align: center;
          margin-top: 0.4rem;
          animation: fadeIn 0.5s 0.7s forwards;
          opacity: 0;
        }

        @keyframes fadeIn { to { opacity: 1; } }

        .progress-wrap {
          width: 220px;
          margin-top: 3rem;
          animation: fadeIn 0.5s 0.8s forwards;
          opacity: 0;
        }

        .progress-track {
          width: 100%;
          height: 3px;
          background: rgba(255,255,255,0.12);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(to right, #C8962E, #E8B84B);
          border-radius: 2px;
          transition: width 0.05s linear;
        }

        .progress-label {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          text-align: center;
          margin-top: 0.75rem;
          letter-spacing: 0.5px;
        }

        .splash-footer {
          position: absolute;
          bottom: 2rem;
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          z-index: 2;
          text-align: center;
          animation: fadeIn 0.5s 1s forwards;
          opacity: 0;
        }
      `}</style>

      <div className={`splash-root${fadeOut ? " fade-out" : ""}`}>
        <div className="splash-bg">
          <Image
            src="/treasury-building.jpeg"
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            quality={60}
            priority
            aria-hidden="true"
            sizes="100vw"
          />
          <div className="splash-bg-overlay" />
        </div>

        <div className="deco-circle-1" />
        <div className="deco-circle-2" />

        <div className="splash-content">
          <div className="logo-wrap">
            <Image
              src="/tnt-logo-1.png"
              alt="The National Treasury — Republic of Kenya"
              width={220}
              height={52}
              style={{ objectFit: "contain", height: "42px", width: "auto" }}
              priority
            />
          </div>
          <div className="divider" />
          <h1 className="splash-title">IT Helpdesk Portal</h1>
          <p className="splash-sub">National Treasury & Economic Planning</p>

          <div className="progress-wrap">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="progress-label">Loading secure portal...</p>
          </div>
        </div>

        <p className="splash-footer">
          Government of Kenya &nbsp;·&nbsp; Treasury Building, Harambee Avenue
        </p>
      </div>
    </>
  );
}