"use client";

import Image from "next/image";
import Link from "next/link";

const PARTS = [
  {
    number: "Part 1",
    title: "IT Security Policy",
    sections: [
      {
        number: "1.1",
        title: "Purpose",
        content: `This IT Security Policy sets out ICTHelpdesk's overall framework for protecting the confidentiality, integrity, and availability of its information and ICT assets. It establishes the principles, governance structures, and baseline controls that the more detailed policies in this document operate under.`,
      },
      {
        number: "1.2",
        title: "Scope",
        content: `This Policy applies to all directorates, departments, and staff of the Organization, to all information systems and ICT assets owned, leased, or operated by the Organization, and to all third parties who access or process the Organization's information on its behalf.`,
      },
      {
        number: "1.3",
        title: "Information Security Principles",
        content: `The Organization manages information security around five principles.

Confidentiality means ensuring information is accessible only to those authorized to see it. Integrity means ensuring information remains accurate and complete. Availability means ensuring authorized Users can access information when they need it. Compliant use means ensuring all legal and contractual obligations relating to information are met. Responsible use means ensuring Users can access the information they need without compromising other Users or systems.`,
      },
      {
        number: "1.4",
        title: "Governance and Responsibilities",
        content: `Senior Management: the ICT director holds overall accountability for information security within the Organization.

ICT Department: responsible for implementing, maintaining, and monitoring compliance with this Policy and its supporting policies.

Information Security Focal Point: a designated officer who coordinates security initiatives, advises management, and reviews incidents and risks.

All Users: responsible for complying with this Policy and the Acceptable Use Policy set out in Part 2 of this document.`,
      },
      {
        number: "1.5",
        title: "Access Control",
        content: `Access to the Organization's systems and information shall be granted on a need-to-know and least-privilege basis, formally authorized before being activated, and reviewed periodically. Access shall be revoked or adjusted promptly when a User's role changes or their engagement with the Organization ends. Detailed User obligations relating to credentials and access are set out in the Acceptable Use Policy in Part 2.`,
      },
      {
        number: "1.6",
        title: "Backup and Business Continuity",
        content: `The Organization shall maintain regular, tested backups of critical information and systems, stored in a manner that protects them from the risks affecting the primary systems. The Organization shall develop and periodically test business continuity and disaster recovery arrangements proportionate to the criticality of its systems.`,
      },
      {
        number: "1.7",
        title: "Third-Party and Supplier Relationships",
        content: `Where third parties are granted access to the Organization's information or systems, that access shall be governed by a written agreement specifying the third party's security obligations, the type of access permitted, and the Organization's right to monitor and audit compliance. Supplier performance and security compliance shall be reviewed periodically.`,
      },
      {
        number: "1.8",
        title: "Vulnerability and Patch Management",
        content: `The Organization shall maintain a process for identifying, assessing, and remediating technical vulnerabilities in its systems, including the timely application of security patches and updates. Only authorized software shall be installed on Organization systems, in accordance with the Acceptable Use Policy.`,
      },
      {
        number: "1.9",
        title: "Incident Management",
        content: `The Organization shall maintain a documented process for identifying, reporting, escalating, and resolving information security incidents, and for learning from incidents to reduce the likelihood of recurrence. All Users must report suspected incidents in accordance with the reporting procedures set out in Part 2 of this document.`,
      },
      {
        number: "1.10",
        title: "Exceptions and Deviations",
        content: `Any request to deviate from this Policy or its supporting policies must be submitted in writing to the ICT Director for assessment and, where appropriate, time-limited approval, taking into account the associated risk.`,
      },
      {
        number: "1.11",
        title: "Policy Review",
        content: `This Policy shall be reviewed at least every two years, or sooner if there is a material change in the Organization's operating environment, technology, or applicable law.`,
      },
    ],
  },
  {
    number: "Part 2",
    title: "Acceptable Use Policy — Terms and Conditions of System Use",
    sections: [
      {
        number: "2.1",
        title: "Purpose",
        content: `This Acceptable Use Policy governs access to and use of ICTHelpdesk by employees, contractors, interns, and other authorized personnel of The National Treasury. It exists to protect the Organization's information assets, ensure the System is used appropriately and securely, and set clear expectations for acceptable conduct, in support of the IT Security Policy.`,
      },
      {
        number: "2.2",
        title: "Scope and Applicability",
        content: `This Policy applies to every individual granted access credentials to the System, regardless of role, seniority or duration of engagement with the Organization. It applies whether the System is accessed from Organization premises, remotely or via personal or Organization-issued devices. Use of the System constitutes acceptance of this Policy.`,
      },
      {
        number: "2.3",
        title: "Definitions",
        content: `"System" means ICTHelpdesk, including its applications, databases, interfaces, and any associated tools or modules.

"User" means any staff, employee or other individual authorized to access the System.

"Credentials" means usernames, passwords, tokens or any other means used to authenticate access to the System.

"Organization Data" means any data, records, or information created, processed, stored, or transmitted through the System in the course of work.

"Organization Assets" means devices, access cards, documents, and other physical or electronic property belonging to the Organization that are issued to or accessed by a User in connection with the System.`,
      },
      {
        number: "2.4",
        title: "Acceptance of Terms",
        content: `Access to the System is conditional on acceptance of this Policy. By logging in, using or otherwise accessing the System, a User confirms they have read, understood, and agree to comply with this Policy and the other policies in this document. Continued use of the System after any update to this Policy constitutes acceptance of the revised Policy.`,
      },
      {
        number: "2.5",
        title: "Acceptable Use",
        content: `Users must use the System solely for purposes related to their official duties at the Organization. The System is a resource provided to support work activities and must not be used in any way that could harm the Organization, its staff, clients, partners or reputation.

Users may only access the modules, records and functions of the System that are necessary for their role. Users must not attempt to access areas of the System for which they have not been granted explicit authorization, including by using another person's credentials or by exploiting system vulnerabilities.

Users are responsible for safeguarding their Credentials and must not share, lend, or disclose them to any other person, including colleagues, supervisors or external parties. Users must log out or lock their session when leaving a device unattended, and must promptly report any suspected unauthorized access to their account or any compromise of Credentials to the system administrator.

Each User undertakes to keep any password or other authentication credential strictly confidential, to avoid recording it insecurely such as written down or stored in plain text, and to change it immediately if compromise is suspected or known. Where temporary credentials are issued, the User must change them on first use.

While using the System, Users must not access, copy, alter or delete Organization Data outside the scope of their assigned duties, use the System to harass or discriminate against any person, install unauthorized software or hardware, attempt to bypass security controls, use the System for personal commercial activity or unlawful purposes, introduce malicious code or viruses, share confidential data with unauthorized parties, impersonate another person, send unsolicited chain messages, or configure automatic forwarding of Organization communications to a personal or external address without prior written approval.

Users must handle Organization Data accessed through the System with care, using it strictly for legitimate work purposes and ensuring it is not exposed, exported or disclosed beyond what their role requires.

Users must not install, download or connect any software to a device used to access the System unless it has been approved by the system administrator. Organization Data must not be transmitted or stored using personal messaging apps, social media or cloud services that have not been approved for work use.

Where a User is permitted to access the System from a personal device, that access is conditional on the device maintaining up-to-date security software and the User permitting the Organization to remotely disable or wipe Organization Data from the device in the event of loss, theft or cessation of authorized access.`,
      },
      {
        number: "2.6",
        title: "Security Awareness and Training",
        content: `Users agree to complete any information security awareness training assigned by the Organization, including periodic refresher sessions, and to apply the practices covered in such training when using the System.`,
      },
      {
        number: "2.7",
        title: "Monitoring and Compliance",
        content: `The Organization reserves the right to monitor System usage, including login activity, access logs and actions taken within the System, to ensure compliance with this Policy and applicable security standards. Monitoring will be conducted in a manner consistent with the Organization's internal policies and applicable law, and is intended to protect the integrity, security, and availability of the System.`,
      },
      {
        number: "2.8",
        title: "Return of Access and Organization Assets",
        content: `Upon termination of employment or contract, change of role, or at the Organization's request, Users must immediately return all Organization Assets in their possession and must not retain copies of Organization Data. System access will be disabled or removed as part of the Organization's standard offboarding process.`,
      },
      {
        number: "2.9",
        title: "Consequences of Violation",
        content: `Violation of this Policy will be addressed in accordance with the Disciplinary Policy set out in Part 4 of this document, and may result in suspension of System access, disciplinary action up to and including termination of employment or contract, and, where applicable, referral to relevant authorities for legal action.`,
      },
      {
        number: "2.10",
        title: "Reporting Concerns",
        content: `Users who become aware of a violation of this Policy, a security incident or any misuse of the System should report it promptly to the system administrator.`,
      },
      {
        number: "2.11",
        title: "Amendments",
        content: `The Organization may revise this Policy from time to time to reflect changes in operational needs, security requirements, or applicable regulations. Users will be notified of material changes, and continued use of the System following such notice constitutes acceptance of the updated Policy.`,
      },
    ],
  },
  {
    number: "Part 3",
    title: "Data Protection Policy",
    sections: [
      {
        number: "3.1",
        title: "Purpose",
        content: `This Data Protection Policy sets out how The National Treasury collects, processes, stores, shares and protects personal data, in compliance with Kenya's Data Protection Act 2019, its subsidiary regulations, and other applicable law.`,
      },
      {
        number: "3.2",
        title: "Scope",
        content: `This Policy applies to all personal data processed by the Organization in any format, including personal data relating to employees, clients, suppliers, and members of the public, whether processed manually or through the System or other Organization systems.`,
      },
      {
        number: "3.3",
        title: "Definitions",
        content: `Personal data means any information relating to an identified or identifiable natural person.

Sensitive personal data means personal data revealing matters such as health, ethnic or social origin, religious or political beliefs, sex life, or biometric data, among other categories defined by law.

Data subject means the individual to whom personal data relates.

Data controller means the Organization, or any unit of it, that determines the purpose and means of processing personal data.

Data processor means any party that processes personal data on behalf of the Organization.

Processing means any operation performed on personal data, including collection, storage, use, disclosure or destruction.

Personal data breach means a security incident leading to the unauthorized access, loss, alteration or disclosure of personal data.`,
      },
      {
        number: "3.4",
        title: "Data Protection Principles",
        content: `The Organization shall process personal data lawfully, fairly and transparently, only for specified and legitimate purposes, limited to what is necessary for those purposes, kept accurate and up to date, retained no longer than necessary, protected against unauthorized or unlawful processing, loss or damage, and in a manner for which the Organization can demonstrate accountability.`,
      },
      {
        number: "3.5",
        title: "Lawful Basis for Processing",
        content: `Personal data shall only be processed where the Organization can rely on a lawful basis recognized under the Data Protection Act 2019, such as the data subject's consent, performance of a contract, compliance with a legal obligation, protection of vital interests, performance of a task carried out in the public interest, or the Organization's legitimate interests balanced against the data subject's rights.`,
      },
      {
        number: "3.6",
        title: "Data Subject Rights",
        content: `Data subjects have the right to be informed about how their personal data is processed, to access personal data held about them, to request correction of inaccurate data, to request erasure or restriction of processing in certain circumstances, to object to processing including for direct marketing, and to request data portability where applicable. Requests should be directed to the system administrator and will be handled within the timeframes required by law.`,
      },
      {
        number: "3.7",
        title: "Roles and Responsibilities",
        content: `The Organization shall designate a Data Protection Officer or focal point where required by law or as a matter of good practice. This officer will oversee compliance with this Policy, serve as a point of contact for the Office of the Data Protection Commissioner, and advise the Organization on data protection matters. All staff who process personal data are responsible for doing so only for legitimate work purposes and for reporting any suspected breach immediately.`,
      },
      {
        number: "3.8",
        title: "Registration with the Office of the Data Protection Commissioner",
        content: `Where the Organization meets the applicable thresholds set by the Data Protection Commissioner, it shall register as a data controller and/or data processor with the ODPC, and shall renew this registration before it lapses.`,
      },
      {
        number: "3.9",
        title: "Security of Personal Data",
        content: `The Organization shall apply technical and organizational measures proportionate to the risk to protect personal data against unauthorized access, alteration, disclosure, or destruction, consistent with the IT Security Policy set out in Part 1 of this document.`,
      },
      {
        number: "3.10",
        title: "Personal Data Breach Notification",
        content: `Any User who becomes aware of a suspected personal data breach must report it immediately, and in any event within 24 hours, to IT Support. This internal timeline exists to allow the Organization to assess the breach and, where required, notify the ODPC without undue delay and within the timeframe required by law, and to notify affected data subjects where the breach poses a significant risk to their rights.`,
      },
      {
        number: "3.11",
        title: "Data Protection Impact Assessments",
        content: `The Organization shall carry out a Data Protection Impact Assessment before undertaking any processing activity likely to result in high risk to data subjects, such as large-scale processing of sensitive personal data or the use of new technologies involving personal data.`,
      },
      {
        number: "3.12",
        title: "Cross-Border Data Transfers",
        content: `Personal data shall not be transferred outside Kenya unless the receiving jurisdiction provides an adequate level of protection, or appropriate safeguards such as contractual clauses or the data subject's consent have been put in place, in accordance with the Data Protection Act 2019.`,
      },
      {
        number: "3.13",
        title: "Data Retention and Disposal",
        content: `Personal data shall be retained only for as long as necessary for the purpose for which it was collected, in accordance with the Organization's retention schedule, and securely disposed of thereafter.`,
      },
      {
        number: "3.14",
        title: "Training and Awareness",
        content: `All staff who process personal data shall complete data protection training, including refresher training at appropriate intervals.`,
      },
      {
        number: "3.15",
        title: "Policy Review",
        content: `This Policy shall be reviewed at least every two years, or sooner if there is a material change in applicable law or the Organization's data processing activities.`,
      },
    ],
  },
  {
    number: "Part 4",
    title: "Disciplinary Policy",
    sections: [
      {
        number: "4.1",
        title: "Purpose",
        content: `This Disciplinary Policy sets out the procedure the Organization will follow when addressing suspected violations of the IT Security Policy, Acceptable Use Policy, or Data Protection Policy set out in this document, in a manner that is fair, consistent, and compliant with Kenya's employment law.`,
      },
      {
        number: "4.2",
        title: "Scope",
        content: `This Policy applies to all employees, contractors, interns, and other individuals covered by the Acceptable Use Policy in Part 2 of this document.`,
      },
      {
        number: "4.3",
        title: "Principles of Fairness",
        content: `Any disciplinary process under this Policy will give the affected individual clear notice of the allegation against them, a reasonable opportunity to respond before any decision is made, the right to be accompanied by a colleague or employee representative at any disciplinary hearing, and a proportionate response based on the nature and impact of the conduct, consistent with the requirements of Kenya's Employment Act 2007.`,
      },
      {
        number: "4.4",
        title: "Categories of Misconduct",
        content: `Minor breaches, such as a first-time unintentional failure to follow a procedural requirement, will typically be addressed informally or with a verbal or written warning.

Serious breaches, such as repeated unauthorized access attempts, sharing of credentials, or unauthorized installation of software, may result in a final written warning or suspension of System access pending investigation.

Gross misconduct, such as deliberate data theft, intentional sabotage of systems, or a serious data breach caused by reckless or willful conduct, may result in summary dismissal and, where the conduct may constitute an offense under applicable law including the Computer Misuse and Cybercrimes Act 2018 or the Data Protection Act 2019, referral to the relevant authorities.`,
      },
      {
        number: "4.5",
        title: "Disciplinary Procedure",
        content: `The matter is investigated to establish the facts, including where relevant system and access logs. The individual is given written notice of the allegation and invited to a disciplinary hearing. At the hearing, the individual is given the opportunity to respond and may be accompanied by a representative. A decision is made and communicated to the individual in writing, together with the reasons for it. The individual may appeal the decision in accordance with section 4.9 below.`,
      },
      {
        number: "4.6",
        title: "Possible Sanctions",
        content: `Sanctions available under this Policy include a verbal warning, a written warning, a final written warning, temporary suspension of System access, suspension from duty, termination of employment or contract, and referral to law enforcement or regulatory authorities for conduct that may constitute a criminal offense.`,
      },
      {
        number: "4.7",
        title: "Confidentiality of Proceedings",
        content: `Disciplinary proceedings under this Policy will be handled confidentially, with information shared only with those who need it to investigate or decide the matter.`,
      },
      {
        number: "4.8",
        title: "Record-Keeping",
        content: `Records of disciplinary actions taken under this Policy shall be retained in accordance with the Organization's record retention schedule and applicable law.`,
      },
      {
        number: "4.9",
        title: "Right of Appeal",
        content: `An individual subject to disciplinary action under this Policy has the right to appeal the decision to a more senior manager or the Human Resources Appeals Committee within seven days of being notified of the outcome.`,
      },
      {
        number: "4.10",
        title: "Policy Review",
        content: `This Policy shall be reviewed at least every two years, or sooner if there is a material change in applicable employment law.`,
      },
    ],
  },
];

export default function TermsPage() {
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

        .tc-root {
          min-height: 100vh;
          background: var(--cream);
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text-main);
        }

        /* Header */
        .tc-header {
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

        .tc-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .tc-logo-wrap {
          background: rgba(255,255,255,0.95);
          padding: 6px 12px;
          border-radius: 8px;
          border-left: 3px solid var(--gold);
          display: flex;
          align-items: center;
        }

        .tc-header-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.3;
        }

        .tc-header-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.6);
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-top: 2px;
        }

        .tc-back {
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

        .tc-back:hover { background: rgba(200,150,46,0.12); }

        /* Hero */
        .tc-hero {
          background: linear-gradient(135deg, #4A1E0A 0%, #6B2D0F 60%, #8B4513 100%);
          padding: 3rem 2.5rem;
          text-align: center;
        }

        .tc-hero-tag {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--gold-light);
          margin-bottom: 0.75rem;
        }

        .tc-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }

        .tc-hero-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          margin-bottom: 1.25rem;
        }

        .tc-hero-meta {
          display: inline-flex;
          gap: 2rem;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(200,150,46,0.3);
          border-radius: 10px;
          padding: 0.75rem 1.5rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .tc-meta-item {
          font-size: 12px;
          color: rgba(255,255,255,0.7);
        }

        .tc-meta-item strong {
          color: var(--gold-light);
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }

        /* Body */
        .tc-body {
          max-width: 860px;
          margin: 0 auto;
          padding: 2.5rem 2rem 4rem;
        }

        /* Notice */
        .tc-notice {
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

        /* Part header */
        .tc-part {
          margin-bottom: 2.5rem;
        }

        .tc-part-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          background: var(--brown-main);
          border-radius: 12px 12px 0 0;
          margin-bottom: 0;
        }

        .tc-part-num {
          font-size: 11px;
          font-weight: 700;
          color: var(--gold-light);
          background: rgba(200,150,46,0.2);
          border: 1px solid rgba(200,150,46,0.4);
          padding: 2px 8px;
          border-radius: 6px;
          white-space: nowrap;
        }

        .tc-part-title {
          font-size: 15px;
          font-weight: 700;
          color: #fff;
        }

        /* Section */
        .tc-section {
          border: 1px solid var(--border);
          border-top: none;
          background: #fff;
          overflow: hidden;
        }

        .tc-section:last-child {
          border-radius: 0 0 12px 12px;
        }

        .tc-section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1.25rem;
          background: #FDFAF6;
          border-bottom: 1px solid var(--border);
        }

        .tc-section-num {
          font-size: 11px;
          font-weight: 700;
          color: var(--gold);
          background: rgba(200,150,46,0.1);
          border: 1px solid rgba(200,150,46,0.25);
          padding: 2px 8px;
          border-radius: 6px;
          white-space: nowrap;
        }

        .tc-section-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--brown-main);
        }

        .tc-section-body {
          padding: 1.25rem;
          font-size: 13.5px;
          color: #3D2010;
          line-height: 1.8;
          white-space: pre-line;
        }

        /* Acknowledgement box */
        .tc-ack {
          background: #fff;
          border: 1px solid var(--border);
          border-left: 4px solid var(--brown-main);
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 2rem;
        }

        .tc-ack-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--brown-main);
          margin-bottom: 0.75rem;
        }

        .tc-ack-body {
          font-size: 13px;
          color: #3D2010;
          line-height: 1.8;
          margin-bottom: 1rem;
        }

        .tc-ack-parts {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          margin-bottom: 1rem;
        }

        .tc-ack-part {
          font-size: 13px;
          color: var(--brown-main);
          font-weight: 600;
        }

        .tc-ack-warning {
          font-size: 12.5px;
          color: #7A5C44;
          font-style: italic;
          margin-top: 0.5rem;
          line-height: 1.6;
        }

        .tc-ack-cta {
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

        .tc-ack-cta:hover { background: var(--brown-dark); }

        /* Footer */
        .tc-footer {
          background: var(--brown-main);
          padding: 1.5rem 2.5rem;
          text-align: center;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
        }

        .tc-footer strong { color: rgba(255,255,255,0.8); }

        @media (max-width: 600px) {
          .tc-hero { padding: 2rem 1.25rem; }
          .tc-body  { padding: 1.5rem 1rem 3rem; }
          .tc-header { padding: 1.25rem; }
          .tc-hero-title { font-size: 1.5rem; }
        }
      `}</style>

      <div className="tc-root">

        {/* Header */}
        <div className="tc-header">
          <div className="tc-header-left">
            <div className="tc-logo-wrap">
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
              <div className="tc-header-title">ICT Helpdesk Portal</div>
              <div className="tc-header-sub">National Treasury &amp; Economic Planning</div>
            </div>
          </div>
          <Link href="/auth/signup" className="tc-back">
            ← Back to Registration
          </Link>
        </div>

        {/* Hero */}
        <div className="tc-hero">
          <p className="tc-hero-tag">Republic of Kenya</p>
          <h1 className="tc-hero-title">
            Terms and Conditions
            <br />
            of System Use
          </h1>
          <p className="tc-hero-sub">
            National Treasury and Economic Planning — ICT Helpdesk Management System
          </p>
          <div className="tc-hero-meta">
            <div className="tc-meta-item">
              <strong>Effective Date</strong>
              June 2026
            </div>
            <div className="tc-meta-item">
              <strong>Review Cycle</strong>
              Every 2 Years
            </div>
            <div className="tc-meta-item">
              <strong>Governing Law</strong>
              Kenya
            </div>
            <div className="tc-meta-item">
              <strong>Classification</strong>
              Internal
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="tc-body">

          <div className="tc-notice">
            Please read these Terms and Conditions carefully before registering. By ticking the Terms and Conditions checkbox on the registration form you confirm that you have read, understood and agree to comply with all four parts of this document. Your acceptance is recorded and applies for the duration of your access to the ICT Helpdesk system.
          </div>

          {/* Parts */}
          {PARTS.map((part) => (
            <div key={part.number} className="tc-part">
              <div className="tc-part-header">
                <span className="tc-part-num">{part.number}</span>
                <span className="tc-part-title">{part.title}</span>
              </div>
              {part.sections.map((section) => (
                <div key={section.number} className="tc-section">
                  <div className="tc-section-header">
                    <span className="tc-section-num">{section.number}</span>
                    <span className="tc-section-title">{section.title}</span>
                  </div>
                  <div className="tc-section-body">{section.content}</div>
                </div>
              ))}
            </div>
          ))}

          {/* Acknowledgement */}
          <div className="tc-ack">
            <p className="tc-ack-title">Acknowledgement of Receipt and Understanding</p>
            <p className="tc-ack-body">
              By ticking the Terms and Conditions checkbox during registration, you confirm that you have read, understood, and agree to comply with all four parts of this document:
            </p>
            <div className="tc-ack-parts">
              <span className="tc-ack-part">Part 1 — IT Security Policy</span>
              <span className="tc-ack-part">Part 2 — Acceptable Use Policy (Terms and Conditions of System Use)</span>
              <span className="tc-ack-part">Part 3 — Data Protection Policy</span>
              <span className="tc-ack-part">Part 4 — Disciplinary Policy</span>
            </div>
            <p className="tc-ack-warning">
              Failure to comply with these policies may result in disciplinary action up to and including termination of your employment or contract, and where applicable, referral to the relevant authorities.
            </p>
            <Link href="/auth/signup" className="tc-ack-cta">
              ← Return to Registration
            </Link>
          </div>

        </div>

        {/* Footer */}
        <div className="tc-footer">
          <strong>National Treasury and Economic Planning</strong> · Government of Kenya ·
          ICT Helpdesk Management System · Terms and Conditions · June 2026
        </div>
      </div>
    </>
  );
}