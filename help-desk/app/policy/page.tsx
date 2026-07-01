"use client";

import Image from "next/image";
import Link from "next/link";

const SECTIONS = [
  {
    number: "1.0",
    title: "Introduction and Background",
    content: `Government Ministries and Departments operate Help Desk Management Systems to provide timely ICT support to end users. These systems record, track and resolve user requests and incidents relating to hardware, software, network access, and application usage.

The Help Desk Management System stores and processes sensitive information including user identities, system configurations, passwords, network details and incident records. Without adequate information security controls, this data could be exploited to facilitate unauthorized access, fraud, or disruption of government services.

This policy is developed in alignment with the Information Security Policy for PFM ICT Systems (November 2023) issued by the National Treasury and Economic Planning, and applies the relevant thematic areas of that policy specifically to the Help Desk Management System context.`,
  },
  {
    number: "2.0",
    title: "Purpose and Objectives",
    content: `The purpose of this policy is to establish the information security requirements for the Help Desk Management System to ensure that end user support services are delivered securely, efficiently and in compliance with applicable GoK laws, regulations and ICT standards.

The objectives of this policy are to protect the confidentiality, integrity and availability of all data held and processed by the system, establish clear roles and responsibilities for information security, define controls for secure access and user account management, provide guidelines for the secure handling and sharing of help desk data, establish procedures for identifying and resolving security incidents, ensure business continuity and disaster recovery planning, promote security awareness among all help desk personnel, and ensure compliance with relevant legal and GoK ICT frameworks.`,
  },
  {
    number: "3.0",
    title: "Scope and Application",
    content: `This policy applies to all personnel operating, administering or using the Help Desk Management System, including permanent staff, contract staff and interns. It also covers all ICT resources used to support the Help Desk function such as hardware, software, networks and communication channels, all data created, processed, stored or transmitted through the system, third-party vendors and service providers with access to the system or its data, and all end users who log requests or incidents through the Help Desk.`,
  },
  {
    number: "4.0",
    title: "Normative References",
    content: `This policy is governed by and should be read alongside the following legal and regulatory frameworks: the Constitution of Kenya 2010, the Public Finance Management Act 2012, the Computer Misuse and Cyber Crimes Act 2018, the Data Protection Act 2019, the National ICT Policy 2019, the Government ICT Standards: Information Security Standard 2019, the Information Security Policy for PFM ICT Systems November 2023, the Public Service Commission Discipline Manual 2022, and the Public Procurement and Asset Disposal Act 2015.`,
  },
  {
    number: "5.0",
    title: "Policy Statement",
    content: `The Ministry/Department shall ensure the preservation of confidentiality, integrity and availability of all information assets within the Help Desk Management System operational environment, in order to maintain effective and efficient end user support services, legal and contractual compliance, and organizational reputation. The Help Desk Management System shall be protected against all internal, external, deliberate or accidental threats.

Information security governance shall be integrated into the overall Help Desk management structure. Internal metrics shall be deployed and continuous monitoring of security conditions shall be ensured. Security audits shall be conducted in accordance with Government regulations and best practice. Responsibilities related to information security within the Help Desk shall be clearly assigned. There shall be no exceptions to this policy.`,
  },
  {
    number: "6.0",
    title: "Information Security Governance",
    content: `The Accounting Officer shall maintain oversight of information security for the Help Desk Management System. An Information Security Focal Point shall be designated within the Help Desk team to coordinate security implementation.

The Accounting Officer holds overall accountability for information security compliance within the Ministry or Department. The Head of ICT provides technical oversight of the system security controls. The Help Desk Manager handles day-to-day management of help desk security procedures and staff compliance. The Information Security Focal Point coordinates security implementation, monitoring and reporting. Help Desk Agents are responsible for adhering to this policy in all operations and reporting security incidents. End Users are responsible for using the system responsibly and reporting suspected security issues.`,
  },
  {
    number: "7.0",
    title: "Help Desk Access Control",
    content: `Access to the Help Desk Management System and its data shall be granted based on the principle of least privilege and need-to-know basis.

Access rights and privileges shall be assigned based on the user's role. All access shall require individual, unique user accounts and shared accounts are prohibited. Audit logs shall be maintained to track all user activity and reviewed regularly. Remote access shall be permitted only through an authorized secure connection. Periodic audits of access controls shall be conducted at minimum quarterly. Inactive user IDs shall be identified and disabled after thirty days of inactivity. Access to system configurations and administrative functions shall be restricted to authorized ICT personnel only. Help Desk Agents shall not access ticket data beyond what is required for their assigned tasks. Multi-factor authentication shall be implemented for administrative access.`,
  },
  {
    number: "8.0",
    title: "User Account and Password Management",
    content: `All authorized users shall have accounts created in accordance with this policy and the principle of least privilege.

Account creation requests shall be formally submitted and approved prior to provisioning. All user accounts must be uniquely identifiable and linked to an individual officer. User accounts unused for thirty days shall be automatically locked or disabled. Access rights shall be revoked immediately upon termination, transfer or change of responsibilities.

Passwords shall have a minimum length of eight characters and must include uppercase letters, lowercase letters, numbers and special characters. Passwords shall expire every ninety days. An intruder lockout feature shall suspend accounts after three consecutive invalid login attempts. Passwords shall not be dictionary words, character strings or keyboard patterns. All default passwords shall be changed prior to deployment. Systems shall be configured to lock a session after a pre-determined period of inactivity.`,
  },
  {
    number: "9.0",
    title: "Incident and Ticket Management",
    content: `The Help Desk Management System shall implement a structured Security Incident Response Plan to identify, log, escalate, resolve and prevent recurrence of information security incidents.

All help desk requests shall be logged with complete and accurate details. Tickets shall be classified by severity to determine priority and response timelines. Help Desk Agents shall handle only tickets assigned to them. Sensitive information including passwords shall not be stored in plain text within ticket descriptions. Ticket records shall be retained in accordance with GoK records management guidelines. Tickets involving suspected security incidents shall be immediately escalated to the Information Security Focal Point. Resolution of tickets shall be documented with full details of actions taken before closure. Ticket data shall not be shared with unauthorized parties.`,
  },
  {
    number: "10.0",
    title: "Data and Information Classification",
    content: `Help Desk data shall be classified according to its sensitivity.

Public data is information whose disclosure causes no harm, such as general service announcements and FAQs. Internal data is information whose disclosure causes minor embarrassment or inconvenience, such as general ticket status. Confidential data is information whose disclosure has significant short-term operational impact, such as user incident details and system error logs. Restricted data is information whose disclosure has serious long-term strategic impact, such as security incident reports, credentials and vulnerability details.

All Help Desk data shall be classified upon creation. Confidential and Restricted data shall be encrypted when stored and in transit. Access to Confidential and Restricted ticket data shall be limited to authorized personnel. Help Desk personnel shall not share ticket information externally without authorization. Data retention and disposal shall comply with GoK records management policies and the Data Protection Act 2019.`,
  },
  {
    number: "11.0",
    title: "Communication Security",
    content: `All communications containing Confidential or Restricted information shall utilize encryption mechanisms. Help Desk personnel shall use only official government email accounts for help desk communications. Sensitive information including passwords shall never be communicated via plain email or unencrypted channels. Auto-forwarding of official emails to external or personal email accounts is prohibited. Official social media or instant messaging platforms used for help desk support shall be approved by the Head of ICT. Network-based Intrusion Detection and Prevention Systems shall be deployed to protect the Help Desk system.`,
  },
  {
    number: "12.0",
    title: "Human Resources Security",
    content: `Background verification checks shall be conducted on all candidates for Help Desk positions. All Help Desk personnel shall sign a Non-Disclosure Agreement and an Acceptable Use Agreement prior to accessing the system. Security responsibilities shall be incorporated into job descriptions and terms of employment.

All Help Desk staff shall receive information security awareness training at induction and at least annually thereafter. An anonymous reporting channel shall be available for staff to report policy violations. A formal disciplinary process shall be in place for information security breaches.

Access rights shall be revoked immediately upon termination or change of role. All government ICT assets shall be returned prior to separation. Confidentiality obligations shall continue after the end of employment.`,
  },
  {
    number: "13.0",
    title: "Cyber Security Management",
    content: `All devices accessing the Help Desk Management System shall have licensed and up-to-date anti-malware software installed. Mobile devices used to access the system shall have device management applications enabled. Help Desk personnel providing remote support shall use only approved secure connections such as VPN. Remote support sessions shall be authorized, logged and monitored. The Help Desk Management System software shall be regularly patched and updated. Vulnerability assessments shall be conducted periodically. Use of unauthorized software within the Help Desk environment is prohibited.`,
  },
  {
    number: "14.0",
    title: "Physical and Environmental Security",
    content: `Help Desk workstations and servers shall be hosted in physically secured areas. Access to Help Desk ICT infrastructure shall be restricted to authorized personnel. Surveillance and monitoring mechanisms shall be deployed to cover all critical ICT equipment. Removable media used within the Help Desk environment shall be securely stored when not in use. Help Desk personnel shall not remove ICT equipment from the office without an approved gate pass. Installation, disconnection or relocation of ICT resources shall be performed only with authority of the Head of ICT.`,
  },
  {
    number: "15.0",
    title: "Business Continuity Management",
    content: `A Business Continuity Plan shall be developed, implemented and regularly tested. A Business Impact Analysis shall be conducted to identify time-sensitive help desk functions. Regular backups of Help Desk Management System data shall be performed. Backups shall be stored in a remote location at a sufficient physical distance from the primary site. Backup media shall be regularly tested to ensure data can be restored reliably. Confidential backup data shall be encrypted. A Disaster Recovery Plan shall be developed and reviewed at minimum annually.`,
  },
  {
    number: "16.0",
    title: "Acceptable Use Policy",
    content: `The Help Desk Management System shall be used only for legitimate government service delivery purposes. Help Desk personnel shall uphold the highest standards of ethical and professional conduct. Accessing, modifying or deleting ticket records without authorization is prohibited. Visiting websites containing illegal material using Help Desk workstations is prohibited. Downloading or storing unlicensed software on Help Desk systems is prohibited. Intentionally introducing malicious code into the Help Desk system environment is prohibited. Revealing confidential ticket or user information in personal online postings is prohibited. Using Help Desk ICT resources for personal commercial gain is prohibited. Forging or misrepresenting user identity in electronic communications is prohibited.`,
  },
  {
    number: "17.0",
    title: "Enforcement and Compliance",
    content: `The Accounting Officer shall ensure enforcement and compliance with this policy. The Head of ICT shall monitor compliance and report to the Accounting Officer.

Personnel found to have violated this policy may be subject to disciplinary action in line with the Public Service Commission Discipline Manual 2022, up to and including termination of employment, and related civil or criminal penalties.

Any vendor, consultant or contractor found to have violated this policy may be subject to sanctions in line with the Public Procurement and Asset Disposal Act 2015, up to and including termination of contracts and related civil or criminal penalties.

This policy shall be reviewed at planned intervals, or when significant changes to the Help Desk operational environment occur, and at least once every two years.`,
  },
];

const SEVERITY = [
  { level: "Critical P1", desc: "Complete system outage or security breach affecting multiple users or critical government systems.", response: "15 mins", resolution: "4 hours" },
  { level: "High P2",     desc: "Significant system degradation or security incident affecting a department or key function.",        response: "30 mins", resolution: "8 hours" },
  { level: "Medium P3",   desc: "Partial service disruption or suspected security issue affecting individual users.",                response: "2 hours",  resolution: "24 hours" },
  { level: "Low P4",      desc: "Minor issue, service request or security query with no immediate operational impact.",             response: "4 hours",  resolution: "72 hours" },
];

export default function PolicyPage() {
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

        .pol-root {
          min-height: 100vh;
          
          width: 100%; 
          background: var(--cream);
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text-main);
        }

        .pol-header {
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

        .pol-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .pol-logo-wrap {
          background: rgba(255,255,255,0.95);
          padding: 6px 12px;
          border-radius: 8px;
          border-left: 3px solid var(--gold);
          display: flex;
          align-items: center;
        }

        .pol-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.3;
        }

        .pol-header-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.6);
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-top: 2px;
        }

        .pol-back {
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

        .pol-back:hover { background: rgba(200,150,46,0.12); }

        .pol-hero {
          background: linear-gradient(135deg, #4A1E0A 0%, #6B2D0F 60%, #8B4513 100%);
          padding: 3rem 2.5rem;
          text-align: center;
        }

        .pol-hero-tag {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--gold-light);
          margin-bottom: 0.75rem;
        }

        .pol-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }

        .pol-hero-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          margin-bottom: 1.25rem;
        }

        .pol-hero-meta {
          display: inline-flex;
          gap: 2rem;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(200,150,46,0.3);
          border-radius: 10px;
          padding: 0.75rem 1.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .pol-meta-item {
          font-size: 12px;
          color: rgba(255,255,255,0.7);
        }

        .pol-meta-item strong {
          color: var(--gold-light);
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        .pol-body {
          width: 100%;
         
          padding: 2.5rem 2rem 4rem;
          box-sizing : border-box;
        }

        .pol-notice {
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

        .pol-section {
          margin-bottom: 2rem;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: #fff;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(107,45,15,0.05);
        }

        .pol-section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background: #FDFAF6;
          border-bottom: 1px solid var(--border);
        }

        .pol-section-num {
          font-size: 11px;
          font-weight: 700;
          color: var(--gold);
          background: rgba(200,150,46,0.12);
          border: 1px solid rgba(200,150,46,0.3);
          padding: 2px 8px;
          border-radius: 6px;
          white-space: nowrap;
        }

        .pol-section-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--brown-main);
        }

        .pol-section-body {
          padding: 1.25rem;
          font-size: 13.5px;
          color: #3D2010;
          line-height: 1.8;
          white-space: pre-line;
        }

        .pol-table-wrap {
          overflow-x: auto;
          margin-top: 1rem;
        }

        .pol-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12.5px;
          min-width: 500px;
        }

        .pol-table th {
          background: #FDFAF6;
          border-bottom: 1px solid var(--border);
          padding: 0.65rem 0.85rem;
          text-align: left;
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-sub);
        }

        .pol-table td {
          padding: 0.75rem 0.85rem;
          border-bottom: 1px solid #F5EDE0;
          color: var(--text-main);
          vertical-align: top;
        }

        .pol-table tr:last-child td { border-bottom: none; }

        .pol-badge {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .badge-p1 { background: #FFEBEE; color: #BB0000; }
        .badge-p2 { background: #FFF3E0; color: #C8722E; }
        .badge-p3 { background: #FFF8E1; color: #8B6914; }
        .badge-p4 { background: #F1F8E9; color: #336B1F; }

        .pol-footer {
          background: var(--brown-main);
          padding: 1.5rem 2.5rem;
          text-align: center;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
        }

        .pol-footer strong { color: rgba(255,255,255,0.8); }

        @media (max-width: 600px) {
          .pol-hero { padding: 2rem 1.25rem; }
          .pol-body  { padding: 1.5rem 1rem 3rem; }
          .pol-header { padding: 1.25rem; }
          .pol-hero-title { font-size: 1.5rem; }
        }
      `}</style>

      <div className="pol-root">

        <div className="pol-header">
          <div className="pol-header-left">
            <div className="pol-logo-wrap">
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
              <div className="pol-header-title">ICT Helpdesk Portal</div>
              <div className="pol-header-sub">National Treasury &amp; Economic Planning</div>
            </div>
          </div>
          <Link href="/signup" className="pol-back">
            ← Back to Registration
          </Link>
        </div>

        <div className="pol-hero">
          <p className="pol-hero-tag">Republic of Kenya</p>
          <h1 className="pol-hero-title">
            Information Security Policy
            <br />
            for Help Desk Management System
          </h1>
          <p className="pol-hero-sub">
            National Treasury and Economic Planning — Government Ministry / Department End User Support
          </p>
          <div className="pol-hero-meta">
            <div className="pol-meta-item">
              <strong>Effective Date</strong>
              June 2026
            </div>
            <div className="pol-meta-item">
              <strong>Review Cycle</strong>
              Every 2 Years
            </div>
            <div className="pol-meta-item">
              <strong>Reference</strong>
              ICTA.3.002:2019
            </div>
            <div className="pol-meta-item">
              <strong>Classification</strong>
              Internal
            </div>
          </div>
        </div>

        <div className="pol-body">

          <div className="pol-notice">
            You are required to read this policy in full before registering. By ticking the Terms and Conditions checkbox on the registration form you confirm that you have read, understood and agree to comply with this Information Security Policy. Your acknowledgement is recorded with a timestamp in accordance with ICTA.3.002:2019 section 12.1 and the Kenya Data Protection Act 2019.
          </div>

          {SECTIONS.map((s) => (
            <div key={s.number} className="pol-section">
              <div className="pol-section-header">
                <span className="pol-section-num">{s.number}</span>
                <span className="pol-section-title">{s.title}</span>
              </div>
              <div className="pol-section-body">{s.content}</div>
            </div>
          ))}

          <div className="pol-section">
            <div className="pol-section-header">
              <span className="pol-section-num">Annex B</span>
              <span className="pol-section-title">Help Desk Incident Severity Classification</span>
            </div>
            <div style={{ padding: "1.25rem" }}>
              <div className="pol-table-wrap">
                <table className="pol-table">
                  <thead>
                    <tr>
                      <th>Severity</th>
                      <th>Description</th>
                      <th>Response Time</th>
                      <th>Resolution Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SEVERITY.map((row, i) => (
                      <tr key={i}>
                        <td>
                          <span className={`pol-badge ${["badge-p1","badge-p2","badge-p3","badge-p4"][i]}`}>
                            {row.level}
                          </span>
                        </td>
                        <td>{row.desc}</td>
                        <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{row.response}</td>
                        <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{row.resolution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>

        <div className="pol-footer">
          <strong>National Treasury and Economic Planning</strong> · Government of Kenya ·
          ICT Helpdesk Management System · Information Security Policy · June 2026
        </div>
      </div>
    </>
  );
}