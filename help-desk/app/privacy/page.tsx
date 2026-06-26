"use client";

import Image from "next/image";
import Link from "next/link";

const SECTIONS = [
  {
    number: "1.0",
    title: "Purpose and Legal Basis",
    content: `This Privacy Notice explains how the National Treasury and Economic Planning ("the Organization") collects, uses, stores, and protects your personal data when you register for and use the ICT Helpdesk Management System ("the System").

This notice is issued in compliance with the Kenya Data Protection Act No. 24 of 2019 ("the Act") and the Data Protection (General) Regulations, 2021, which give effect to Articles 31(c) and (d) of the Constitution of Kenya 2010, guaranteeing the right to privacy.

The Organization processes your personal data on the following lawful bases under Section 30 of the Act:
- Performance of a contract — to provide you with ICT helpdesk support services
- Compliance with a legal obligation — to fulfil obligations under GoK ICT Standards and the Public Finance Management Act, 2012
- Legitimate interests — to maintain the security, integrity and availability of government ICT systems
- Your consent — where you have expressly consented at the point of registration`,
  },
  {
    number: "2.0",
    title: "What Personal Data We Collect",
    content: `When you register for and use the ICT Helpdesk System, we collect and process the following categories of personal data:

Identity and Contact Data:
- Full name
- Personal number (staff ID)
- Work email address
- Phone number

Office and Employment Data:
- Directorate and department
- Office number and location
- Job role within the System (staff, ICT personnel, or administrator)

Account and Security Data:
- Password (stored as a one-way hash — never in plain text)
- Account creation date and time
- Login session records including timestamps and IP addresses
- Failed login attempts and account lockout events

Activity Data:
- Tickets raised, their content, category and status
- Audit log records of actions taken within the System
- Policy acknowledgement timestamp

We do not collect sensitive personal data as defined under Section 2 of the Act (such as health data, biometric data, ethnic or racial origin, or political opinions) through the System.`,
  },
  {
    number: "3.0",
    title: "How We Use Your Personal Data",
    content: `Your personal data is used solely for the following purposes:

Service Delivery:
- To create and manage your account on the ICT Helpdesk System
- To receive, assign, track and resolve your ICT support requests
- To communicate with you regarding your tickets and account

Security and Compliance:
- To authenticate your identity and control access to the System
- To maintain audit logs of system activity as required by ICTA.3.002:2019
- To detect, investigate and prevent unauthorized access or security incidents
- To enforce the Information Security Policy and Acceptable Use Policy

Legal and Regulatory Obligations:
- To comply with GoK ICT Standards and the Public Finance Management Act, 2012
- To respond to lawful requests from regulatory or law enforcement authorities
- To record your acknowledgement of the Information Security Policy as required under section 12.1 of the Help Desk Information Security Policy

We will not use your personal data for commercial purposes, direct marketing, or share it with third parties for their own use.`,
  },
  {
    number: "4.0",
    title: "Data Protection Principles",
    content: `In accordance with Section 25 of the Data Protection Act 2019, the Organization processes your personal data in compliance with the following principles:

- Lawfulness, fairness and transparency — your data is processed on a lawful basis and you are informed of how it is used
- Purpose limitation — data is collected for specified, explicit and legitimate purposes and not processed in a manner incompatible with those purposes
- Data minimisation — only data that is adequate, relevant and limited to what is necessary for the stated purposes is collected
- Accuracy — reasonable steps are taken to ensure personal data is accurate and kept up to date
- Storage limitation — personal data is not kept longer than necessary for the purposes for which it was collected
- Integrity and confidentiality — personal data is processed with appropriate security measures to protect against unauthorized or unlawful processing, accidental loss, destruction or damage`,
  },
  {
    number: "5.0",
    title: "Your Rights as a Data Subject",
    content: `Under Part IV of the Kenya Data Protection Act 2019, you have the following rights regarding your personal data:

Right to be Informed (Section 26)
You have the right to know what personal data is held about you and how it is processed. This Privacy Notice fulfils that obligation.

Right of Access (Section 26)
You may request a copy of the personal data held about you. Requests will be responded to within seven (7) days in accordance with the Data Protection (General) Regulations, 2021.

Right to Rectification (Section 26)
You have the right to request correction of personal data that is untrue, inaccurate, outdated, incomplete or misleading. Corrections will be made within fourteen (14) days of receiving a valid request.

Right to Erasure (Section 26)
You may request deletion of your personal data where it is no longer necessary for the purpose for which it was collected, subject to the Organization's legal retention obligations.

Right to Restriction of Processing (Section 26)
You may request that processing of your data be restricted in certain circumstances, such as while accuracy is being verified.

Right to Object (Section 36)
You have the right to object to the processing of your personal data unless the Organization can demonstrate compelling legitimate interests for processing which override your interests.

Right to Data Portability (Section 35)
Where technically feasible, you may request your personal data in a structured, commonly used format.

To exercise any of these rights, contact the system administrator. Where your request is refused, you will be informed of the reasons and your right to complain to the Office of the Data Protection Commissioner (ODPC).`,
  },
  {
    number: "6.0",
    title: "Data Retention",
    content: `Your personal data is retained for as long as your account is active and for such additional period as is required by law or GoK records management guidelines.

Specifically:
- Account and profile data — retained for the duration of your employment plus a minimum of five (5) years after departure, or as required by the Public Archives and Documentation Service Act
- Ticket records — retained for a minimum of five (5) years in accordance with GoK records management requirements
- Audit logs — retained for a minimum of twelve (12) months as required by ICTA.3.002:2019 section 11.18, and longer where required for ongoing investigations
- Session records — retained for ninety (90) days for security monitoring purposes
- Policy acknowledgement records — retained permanently as evidence of consent

Upon expiry of the applicable retention period, personal data will be securely disposed of in accordance with the Data Protection Act 2019 and GoK ICT Standards.`,
  },
  {
    number: "7.0",
    title: "Data Security",
    content: `The Organization applies technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction, in accordance with ICTA.3.002:2019 and the Help Desk Information Security Policy.

These measures include:
- Passwords stored using industry-standard one-way hashing (bcrypt) — never in plain text
- Role-based access control ensuring you can only access data necessary for your role
- Session management with automatic expiry after a period of inactivity
- Account lockout after repeated failed login attempts
- Comprehensive audit logging of all system activity
- Encrypted data transmission using HTTPS
- Regular security audits and vulnerability assessments

Where a personal data breach occurs that is likely to result in a risk to your rights and freedoms, the Organization will notify the Office of the Data Protection Commissioner without undue delay and will inform you where the breach poses a significant risk, in accordance with Section 43 of the Act.`,
  },
  {
    number: "8.0",
    title: "Sharing of Personal Data",
    content: `Your personal data is not sold, rented or shared with third parties for commercial purposes.

Your data may be disclosed in the following limited circumstances:

Within the Organization:
- To ICT personnel assigned to resolve your support tickets
- To system administrators for account management and security monitoring
- To authorized auditors for compliance and security audits

To External Parties:
- To the Office of the Data Protection Commissioner in response to lawful investigation or enforcement action
- To law enforcement or regulatory authorities where required by law, including under the Computer Misuse and Cybercrimes Act 2018
- To hosting and infrastructure providers (currently Render and Neon) under written data processing agreements that bind them to appropriate security and confidentiality obligations

Cross-border transfers are made only where adequate protection is confirmed or appropriate safeguards are in place, in accordance with Part VI of the Data Protection Act 2019.`,
  },
  {
    number: "9.0",
    title: "Cookies and Session Data",
    content: `The System uses session cookies to maintain your authenticated session after login. These cookies:

- Are strictly necessary for the System to function and cannot be disabled
- Do not track your activity across other websites
- Contain only a session identifier — no personal data is stored in the cookie itself
- Expire automatically when you log out or after a defined period of inactivity
- Are transmitted only over HTTPS encrypted connections

No advertising, analytics or third-party tracking cookies are used on the System.`,
  },
  {
    number: "10.0",
    title: "Changes to This Privacy Notice",
    content: `This Privacy Notice may be updated from time to time to reflect changes in the law, our data processing activities, or the System's functionality. You will be notified of material changes when you next log in to the System.

The effective date of this notice is June 2026. It will be reviewed at minimum every two years in line with the review cycle of the Help Desk Information Security Policy.`,
  },
  {
    number: "11.0",
    title: "Contact and Complaints",
    content: `For any queries regarding this Privacy Notice or to exercise your data subject rights, contact:

System Administrator
ICT Department
National Treasury and Economic Planning
Treasury Building, Harambee Avenue
Nairobi, Kenya

If you are not satisfied with the Organization's response to your request, you have the right to lodge a complaint with the Office of the Data Protection Commissioner (ODPC):

Office of the Data Protection Commissioner
Website: www.odpc.go.ke
Email: info@odpc.go.ke
Phone: +254 (0)20 2628 000`,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --brown-dark: #4A1E0A;
          --brown-main: #6B2D0F;
          --gold:       #C8962E;
          --gold-light: #E8B84B;
          --cream:      #FDF8F2;
          --border:     #E0D0C0;
          --text-main:  #1A0F08;
          --text-sub:   #7A5C44;
        }

        .priv-root {
          min-height: 100vh;
          background: var(--cream);
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text-main);
        }

        .priv-header {
          background: var(--brown-main);
          padding: 2rem 2.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          position: sticky;
          top: 0;
          z-index: 10;
          box-shadow: 0 2px 12px rgba(0,0,0,0.18);
        }

        .priv-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .priv-logo-wrap {
          background: rgba(255,255,255,0.95);
          padding: 6px 12px;
          border-radius: 8px;
          border-left: 3px solid var(--gold);
          display: flex;
          align-items: center;
        }

        .priv-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.3;
        }

        .priv-header-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.6);
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-top: 2px;
        }

        .priv-back {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--gold-light);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border: 1px solid rgba(200,150,46,0.4);
          border-radius: 8px;
          transition: background 0.15s;
          white-space: nowrap;
        }

        .priv-back:hover { background: rgba(200,150,46,0.12); }

        .priv-hero {
          background: linear-gradient(135deg, #4A1E0A 0%, #6B2D0F 60%, #8B4513 100%);
          padding: 3rem 2.5rem;
          text-align: center;
        }

        .priv-hero-tag {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--gold-light);
          margin-bottom: 0.75rem;
        }

        .priv-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }

        .priv-hero-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          margin-bottom: 1.25rem;
        }

        .priv-hero-meta {
          display: inline-flex;
          gap: 2rem;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(200,150,46,0.3);
          border-radius: 10px;
          padding: 0.75rem 1.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .priv-meta-item {
          font-size: 12px;
          color: rgba(255,255,255,0.7);
        }

        .priv-meta-item strong {
          color: var(--gold-light);
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        .priv-body {
          max-width: 860px;
          margin: 0 auto;
          padding: 2.5rem 2rem 4rem;
        }

        .priv-notice {
          background: #FFF8EC;
          border: 1px solid #E8B84B;
          border-left: 4px solid var(--gold);
          border-radius: 10px;
          padding: 1rem 1.25rem;
          font-size: 13px;
          color: var(--brown-main);
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .priv-section {
          margin-bottom: 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: #fff;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(107,45,15,0.05);
        }

        .priv-section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background: #FDFAF6;
          border-bottom: 1px solid var(--border);
        }

        .priv-section-num {
          font-size: 11px;
          font-weight: 700;
          color: var(--gold);
          background: rgba(200,150,46,0.12);
          border: 1px solid rgba(200,150,46,0.3);
          padding: 2px 8px;
          border-radius: 6px;
          white-space: nowrap;
        }

        .priv-section-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--brown-main);
        }

        .priv-section-body {
          padding: 1.25rem;
          font-size: 13.5px;
          color: #3D2010;
          line-height: 1.8;
          white-space: pre-line;
        }

        .priv-ack {
          background: #fff;
          border: 1px solid var(--border);
          border-left: 4px solid var(--brown-main);
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 2rem;
        }

        .priv-ack-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--brown-main);
          margin-bottom: 0.75rem;
        }

        .priv-ack-body {
          font-size: 13px;
          color: #3D2010;
          line-height: 1.8;
          margin-bottom: 1rem;
        }

        .priv-ack-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 1.25rem;
          background: var(--brown-main);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          padding: 0.65rem 1.25rem;
          border-radius: 8px;
          transition: background 0.15s;
        }

        .priv-ack-cta:hover { background: var(--brown-dark); }

        .priv-footer {
          background: var(--brown-main);
          padding: 1.5rem 2.5rem;
          text-align: center;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
        }

        .priv-footer strong { color: rgba(255,255,255,0.8); }

        @media (max-width: 600px) {
          .priv-hero { padding: 2rem 1.25rem; }
          .priv-body { padding: 1.5rem 1rem 3rem; }
          .priv-header { padding: 1.25rem; }
          .priv-hero-title { font-size: 1.5rem; }
        }
      `}</style>

      <div className="priv-root">

        {/* Header */}
        <div className="priv-header">
          <div className="priv-header-left">
            <div className="priv-logo-wrap">
              <Image
                src="/tnt-logo-1.png"
                alt="National Treasury"
                width={140}
                height={34}
                style={{ objectFit: "contain", height: "28px", width: "auto" }}
                priority
              />
            </div>
            <div>
              <div className="priv-header-title">ICT Helpdesk Portal</div>
              <div className="priv-header-sub">
                National Treasury &amp; Economic Planning
              </div>
            </div>
          </div>
          <Link href="/auth/signup" className="priv-back">
            ← Back to Registration
          </Link>
        </div>

        {/* Hero */}
        <div className="priv-hero">
          <p className="priv-hero-tag">Republic of Kenya</p>
          <h1 className="priv-hero-title">
            Privacy Notice
            <br />
            and Data Protection Policy
          </h1>
          <p className="priv-hero-sub">
            National Treasury and Economic Planning — ICT Helpdesk Management System
          </p>
          <div className="priv-hero-meta">
            <div className="priv-meta-item">
              <strong>Legal Basis</strong>
              Data Protection Act, 2019
            </div>
            <div className="priv-meta-item">
              <strong>Effective Date</strong>
              June 2026
            </div>
            <div className="priv-meta-item">
              <strong>Review Cycle</strong>
              Every 2 Years
            </div>
            <div className="priv-meta-item">
              <strong>Classification</strong>
              Internal
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="priv-body">

          <div className="priv-notice">
            This Privacy Notice explains how the National Treasury and Economic
            Planning collects, uses and protects your personal data when you use
            the ICT Helpdesk Management System, in compliance with the Kenya
            Data Protection Act No. 24 of 2019. Please read it carefully before
            registering. By ticking the Data Consent checkbox on the
            registration form you confirm you have read and understood this
            notice.
          </div>

          {SECTIONS.map((s) => (
            <div key={s.number} className="priv-section">
              <div className="priv-section-header">
                <span className="priv-section-num">{s.number}</span>
                <span className="priv-section-title">{s.title}</span>
              </div>
              <div className="priv-section-body">{s.content}</div>
            </div>
          ))}

          {/* Acknowledgement */}
          <div className="priv-ack">
            <p className="priv-ack-title">Your Consent</p>
            <p className="priv-ack-body">
              By ticking the Data Consent checkbox during registration, you
              confirm that you have read and understood this Privacy Notice and
              you consent to the processing of your personal data by the
              National Treasury and Economic Planning for the purposes described
              in this notice, in accordance with the Kenya Data Protection Act
              No. 24 of 2019.
            </p>
            <p className="priv-ack-body">
              You understand that you may withdraw consent or exercise your data
              subject rights at any time by contacting the system administrator,
              and that you have the right to lodge a complaint with the Office
              of the Data Protection Commissioner (ODPC) at www.odpc.go.ke if
              you believe your rights have been infringed.
            </p>
            <Link href="/auth/signup" className="priv-ack-cta">
              ← Return to Registration
            </Link>
          </div>

        </div>

        {/* Footer */}
        <div className="priv-footer">
          <strong>National Treasury and Economic Planning</strong> · Government
          of Kenya · ICT Helpdesk Management System · Privacy Notice · June
          2026
        </div>
      </div>
    </>
  );
}