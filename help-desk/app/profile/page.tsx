"use client";

import { useEffect, useState } from "react";
import { User, Pencil, Shield, KeyRound } from "lucide-react";
import ProfileInput from "@/components/profile-input";

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState<{
    id: string; // ← add
    full_name: string;
    email: string;
    personal_number?: string;
    phone_number?: string;
    office_location?: string;
    office_number?: string;
    department?: { name: string };
  } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/me`, {
          credentials: "include",
        });
        if (res.ok) setUser(await res.json());
      } catch {}
    })();
  }, []);

  const fullName = user?.full_name ?? "";
  const email = user?.email ?? "";
  const personalNumber = user?.personal_number ?? "";
  const phone = user?.phone_number ?? "";
  const officeLocation = user?.office_location ?? "";
  const officeNumber = user?.office_number ?? "";
  const dept = user?.department?.name ?? "";
  const initials =
    fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2) || "—";

  // REPLACE handleSave
  const handleSave = async () => {
    if (editing && user) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/${user.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          phone_number: phone,
          office_location: officeLocation,
          office_number: officeNumber,
        }),
      });
    }
    setEditing((v) => !v);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --gold: #C8962E; --brown: #6B2D0F; --brown-dark: #4A1E0A;
          --cream: #FDF8F2; --border: #EDE0D0;
          --text: #1A0F08; --text-sub: #7A5C44;
        }
        .profile-root {
          width: 100%;
          min-height: 100vh;
          background: var(--cream);
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text);
        }
        .profile-topbar {
          background: #fff;
          border-bottom: 1px solid var(--border);
          padding: 0 2rem;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 5;
        }
        .profile-topbar-title { font-size: 13px; color: var(--text-sub); }
        .profile-topbar-title span { color: var(--brown); font-weight: 600; }
        .profile-header { padding: 2rem 2rem 0; }
        .profile-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.25rem;
        }
        .profile-sub { font-size: 13px; color: var(--text-sub); }
        .profile-content {
          padding: 1.5rem 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .profile-card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .card-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .card-title-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: #FDF8F2;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--brown);
        }
        .edit-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1.5px solid var(--brown);
          color: var(--brown);
          background: none;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s;
        }
        .edit-btn:hover { background: #FDF8F2; }
        .edit-btn.active { background: var(--brown); color: #fff; }
        .avatar-wrap {
          display: flex;
          justify-content: center;
          padding: 0.5rem 0 0.25rem;
        }
        .avatar-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(200,150,46,0.12);
          border: 2px solid rgba(200,150,46,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--brown);
        }
        .fields-stack { display: flex; flex-direction: column; gap: 1rem; }
        .divider { border: none; border-top: 1px solid var(--border); margin: 0.25rem 0; }
        .section-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-sub);
          margin-bottom: 0.75rem;
        }
        .reset-btn {
          width: 100%;
          height: 42px;
          background: var(--brown);
          color: #fff;
          border: none;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          margin-top: 0.25rem;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .reset-btn:hover { background: var(--brown-dark); }
        @media (max-width: 900px) {
          .profile-content { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="profile-root">
        {/* Topbar */}
        <div className="profile-topbar">
          <p className="profile-topbar-title">
            National Treasury &nbsp;/&nbsp; <span>Profile</span>
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#6B2D0F",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              AM
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#1A0F08" }}>
                {fullName}
              </p>
              <p style={{ fontSize: 10, color: "#7A5C44" }}>{dept}</p>
            </div>
          </div>
        </div>

        {/* Page header */}
        <div className="profile-header">
          <h1 className="profile-title">Profile Settings</h1>
          <p className="profile-sub">
            Manage your account information and security
          </p>
        </div>

        <div className="profile-content">
          {/* ── Left card: Profile Information ── */}
          <div className="profile-card">
            <div className="card-header">
              <p className="card-title">
                <span className="card-title-icon">
                  <User size={15} />
                </span>
                Profile Information
              </p>
              <button
                className={`edit-btn${editing ? " active" : ""}`}
                onClick={handleSave}
              >
                <Pencil size={14} />
                {editing ? "Done" : "Edit"}
              </button>
            </div>
            {/* Avatar */}
            <div className="avatar-wrap">
              <div className="avatar-circle">
                <User size={36} />
              </div>
            </div>
            {/* Fields — no Specialization for employees */}
            {/* REPLACE the entire fields-stack in the left card */}
            <div className="fields-stack">
              <ProfileInput
                label="Personal Number"
                value={personalNumber}
                disabled={!editing}
              />
              <ProfileInput
                label="Full Name"
                value={fullName}
                disabled={!editing}
              />
              <ProfileInput
                label="Email Address"
                value={email}
                disabled={!editing}
              />
              <ProfileInput
                label="Phone Number"
                value={phone}
                disabled={!editing}
              />
              <ProfileInput
                label="Department"
                value={dept}
                disabled={!editing}
              />
              <ProfileInput
                label="Office Location"
                value={officeLocation}
                disabled={!editing}
              />
              <ProfileInput
                label="Office Number"
                value={officeNumber}
                disabled={!editing}
              />
            </div>
          </div>

          {/* ── Right card: Security ── */}
          <div className="profile-card">
            <div className="card-header">
              <p className="card-title">
                <span className="card-title-icon">
                  <Shield size={15} />
                </span>
                Security
              </p>
            </div>

            {/* Account info */}
            <div className="fields-stack">
              <ProfileInput
                label="Personal Number"
                value={personalNumber}
                disabled
              />
              <ProfileInput label="Email" value={email} disabled />
            </div>

            <hr className="divider" />

            {/* Change password */}
            <div>
              <p
                className="section-label"
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <KeyRound size={12} />
                Change Password
              </p>
              <div className="fields-stack">
                <ProfileInput
                  label="Current Password"
                  placeholder="Enter current password"
                  type="password"
                />
                <ProfileInput
                  label="New Password"
                  placeholder="Enter new password"
                  type="password"
                />
                <ProfileInput
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  type="password"
                />
              </div>
              <button className="reset-btn" style={{ marginTop: "1rem" }}>
                <KeyRound size={14} />
                Reset Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
