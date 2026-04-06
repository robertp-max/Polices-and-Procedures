/**
 * GVGBAppendixPrint.tsx
 * Standalone per-appendix print page for GV-GB-001.
 * Opens in a new tab via /print/GV-GB-001/appendix/:appendixId
 * Auto-triggers the device print dialog after content renders.
 * All form input values entered on this page are included in the printout.
 */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const TEAL   = '#007970';
const RUST   = '#C74600';
const DARK   = '#1F1C1B';
const MID    = '#524048';
const PALE   = '#FAFBF8';
const BORDER = '#E5E4E3';
const LOGO   = 'https://cdn.jsdelivr.net/gh/robertp-max/CSM-485-Form@main/src/assets/CI%20Home%20Health%20Logo_Gray.png';

const TITLES: Record<string, string> = {
  A: 'Governing Body Membership Roster',
  B: 'Conflict of Interest Disclosure Form',
  C: 'Policy Acknowledgment Form',
  D: 'Governing Body Meeting Minutes Template',
  E: 'Quarterly Governance Oversight Checklist',
  F: 'Annual Governance Calendar',
  G: 'Agency Organizational Chart',
};

// ─── SHARED PRIMITIVES ────────────────────────────────────────────────────────

const AppHeader = ({ title }: { title: string }) => (
  <div style={{ textAlign: 'center', marginBottom: 32, paddingBottom: 20, borderBottom: `2px solid ${TEAL}` }}>
    <img
      src={LOGO}
      alt="Care Indeed Home Health Care"
      style={{ height: 56, margin: '0 auto 16px', display: 'block', opacity: 0.7 }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
    <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: 22, color: DARK, margin: '0 0 8px' }}>{title}</h1>
    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, color: '#999', fontStyle: 'italic', margin: 0 }}>
      Care Indeed Home Health Care, Inc. · Policy GV-GB-001 · Version 6.0 · 2025-07-10
    </p>
    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: '#bbb', margin: '4px 0 0' }}>
      Printed: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </p>
  </div>
);

const TH = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <th style={{ backgroundColor: TEAL, color: '#fff', padding: '6px 8px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 10, textAlign: 'left', border: `1px solid #004d47`, ...style }}>
    {children}
  </th>
);

const TD = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <td style={{ border: `1px solid ${BORDER}`, padding: '5px 7px', verticalAlign: 'top', fontFamily: 'Roboto, sans-serif', fontSize: 10, lineHeight: 1.45, color: DARK, wordBreak: 'break-word', ...style }}>
    {children}
  </td>
);

const LineInput = ({ w = '100%', label = '', type = 'text', placeholder = '' }: { w?: number | string; label?: string; type?: string; placeholder?: string }) => (
  <input
    type={type}
    placeholder={placeholder}
    aria-label={label}
    style={{ border: 'none', borderBottom: `1px solid ${DARK}`, background: 'transparent', outline: 'none', width: w, fontSize: 11, fontFamily: 'Roboto, sans-serif', padding: '1px 2px', verticalAlign: 'bottom' }}
  />
);

const InfoBox = ({ children, color = '#EFF6FF', border = '#BFDBFE', textColor = '#1E40AF' }: { children: React.ReactNode; color?: string; border?: string; textColor?: string }) => (
  <div style={{ backgroundColor: color, border: `1px solid ${border}`, borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 11, fontFamily: 'Roboto, sans-serif', lineHeight: 1.6, color: textColor }}>
    {children}
  </div>
);

// ─── APPENDIX A ───────────────────────────────────────────────────────────────

const AppA = () => (
  <div>
    <InfoBox>
      <strong>Instructions:</strong> The Governing Body Chair (or designee) shall update this roster within 7 calendar days of any membership change. A copy shall be maintained in the agency governance file and provided to the Administrator. This roster must be readily accessible for CMS survey review.
    </InfoBox>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, tableLayout: 'fixed' }}>
      <colgroup>
        <col style={{ width: '3%' }} />
        <col style={{ width: '14%' }} />
        <col style={{ width: '12%' }} />
        <col style={{ width: '9%' }} />
        <col style={{ width: '8%' }} />
        <col style={{ width: '8%' }} />
        <col style={{ width: '15%' }} />
        <col style={{ width: '22%' }} />
        <col style={{ width: '9%' }} />
      </colgroup>
      <thead>
        <tr>
          {['#', 'Full Legal Name', 'Title / Role', 'Voting Status', 'Appt Date', 'Term Exp', 'Competency Area', 'Email Address', 'OIG/SAM?'].map((h, i) => (
            <TH key={i}>{h}</TH>
          ))}
        </tr>
      </thead>
      <tbody>
        {[1, 2, 3, 4, 5, 6, 7].map(n => (
          <tr key={n} style={{ backgroundColor: n % 2 === 0 ? PALE : '#fff' }}>
            <TD style={{ textAlign: 'center', color: MID, fontWeight: 700 }}>{n}</TD>
            <TD><LineInput label="Full Legal Name" /></TD>
            <TD><LineInput label="Title/Role" /></TD>
            <TD>
              <select style={{ border: `1px solid ${BORDER}`, borderRadius: 3, padding: '2px 3px', width: '100%', fontSize: 10, backgroundColor: '#fff', fontFamily: 'Roboto, sans-serif' }}>
                <option>Voting</option><option>Non-Voting</option><option>Advisory</option>
              </select>
            </TD>
            <TD><input type="text" placeholder="mm/dd/yyyy" style={{ border: 'none', borderBottom: `1px solid ${BORDER}`, background: 'transparent', outline: 'none', width: '100%', fontSize: 10, fontFamily: 'Roboto, sans-serif' }} /></TD>
            <TD><input type="text" placeholder="mm/dd/yyyy" style={{ border: 'none', borderBottom: `1px solid ${BORDER}`, background: 'transparent', outline: 'none', width: '100%', fontSize: 10, fontFamily: 'Roboto, sans-serif' }} /></TD>
            <TD><LineInput label="Competency Area" /></TD>
            <TD><LineInput label="Email" type="email" /></TD>
            <TD style={{ textAlign: 'center' }}><input type="checkbox" style={{ width: 14, height: 14 }} /></TD>
          </tr>
        ))}
      </tbody>
    </table>
    <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, backgroundColor: PALE, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '12px 16px', fontSize: 11, fontFamily: 'Roboto, sans-serif', fontWeight: 700, color: MID }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
        Roster Maintained By: <LineInput w={150} label="Roster Maintained By" /> Title: <LineInput w={110} label="Title" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        Date Last Updated: <LineInput w={130} label="Date Last Updated" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
        Quorum Requirement: <LineInput w={36} label="Quorum number" /> of <LineInput w={36} label="Total voting" /> voting members
      </div>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
        Total Voting Members: <LineInput w={36} label="Voting count" /> | Non-Voting / Advisory: <LineInput w={36} label="Non-voting count" />
      </div>
    </div>
  </div>
);

// ─── APPENDIX B ───────────────────────────────────────────────────────────────

const AppB = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <InfoBox color="#FFF7ED" border="#FDBA74" textColor="#9A3412">
      <strong>Instructions:</strong> Each Governing Body member shall complete this form: (1) at the time of initial appointment; (2) annually, at the first quarterly meeting of each calendar year; and (3) within 7 calendar days of any change in circumstances that could create a new actual or potential conflict. Submit to Compliance Officer.
    </InfoBox>

    {/* Section 1 */}
    <section>
      <div style={{ backgroundColor: '#F3F4F6', padding: '6px 10px', borderRadius: 4, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 11, marginBottom: 10 }}>
        SECTION 1 — MEMBER INFORMATION
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, backgroundColor: PALE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 16 }}>
        {[['Full Legal Name', 'text'], ['Title / Role on Governing Body', 'text'], ['Date of Appointment', 'text']].map(([label, type], i) => (
          <div key={i}>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', color: MID, marginBottom: 4 }}>{label}</div>
            <input type={type} placeholder={type === 'text' && label.includes('Date') ? 'mm/dd/yyyy' : ''} style={{ border: 'none', borderBottom: `1px solid ${DARK}`, background: 'transparent', outline: 'none', width: '100%', fontSize: 11, fontFamily: 'Roboto, sans-serif', padding: '2px 0', boxSizing: 'border-box' }} />
          </div>
        ))}
        <div style={{ gridColumn: '1 / -1', borderTop: `1px solid ${BORDER}`, paddingTop: 12, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 700, color: DARK }}>Type of Disclosure:</span>
          {['Initial', 'Annual Renewal', 'Change in Circumstances'].map(opt => (
            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Roboto, sans-serif', fontSize: 11, color: DARK }}>
              <input type="radio" name="disclosureType" style={{ width: 13, height: 13 }} /> {opt}
            </label>
          ))}
        </div>
      </div>
    </section>

    {/* Section 2 */}
    <section>
      <div style={{ backgroundColor: '#F3F4F6', padding: '6px 10px', borderRadius: 4, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 11, marginBottom: 8 }}>
        SECTION 2 — FINANCIAL INTERESTS
      </div>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, fontStyle: 'italic', color: MID, marginBottom: 8 }}>
        Do you, or any member of your immediate family (spouse, domestic partner, parent, child, sibling), hold any of the following interests?
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ backgroundColor: PALE, borderBottom: `1px solid ${BORDER}` }}>
            <TH>Question</TH>
            <TH style={{ width: 50, textAlign: 'center' }}>Yes</TH>
            <TH style={{ width: 50, textAlign: 'center' }}>No</TH>
            <TH style={{ width: 200 }}>If Yes, Describe</TH>
          </tr>
        </thead>
        <tbody>
          {[
            '2.1 Ownership interest (equity, stock, partnership) in any entity that does business with, competes with, or provides referrals to Care Indeed Home Health Care, Inc.?',
            '2.2 Employment, consulting, or advisory relationship with any entity that does business with, competes with, or provides referrals to this agency?',
            '2.3 Financial interest in any vendor, supplier, or contractor used by the agency?',
            '2.4 Receipt of compensation, gifts, gratuities, or other benefits (exceeding $50 in aggregate annually) from any entity that does business with or seeks to do business with the agency?',
          ].map((q, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
              <TD style={{ fontWeight: 500 }}>{q}</TD>
              <TD style={{ textAlign: 'center' }}><input type="radio" name={`q2${i}`} style={{ width: 13, height: 13 }} /></TD>
              <TD style={{ textAlign: 'center' }}><input type="radio" name={`q2${i}`} style={{ width: 13, height: 13 }} /></TD>
              <TD><input type="text" style={{ border: 'none', borderBottom: `1px solid ${BORDER}`, background: 'transparent', outline: 'none', width: '100%', fontSize: 10 }} /></TD>
            </tr>
          ))}
        </tbody>
      </table>
    </section>

    {/* Section 3 */}
    <section>
      <div style={{ backgroundColor: '#F3F4F6', padding: '6px 10px', borderRadius: 4, fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 11, marginBottom: 8 }}>
        SECTION 3 — PROFESSIONAL &amp; ORGANIZATIONAL RELATIONSHIPS
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr style={{ backgroundColor: PALE, borderBottom: `1px solid ${BORDER}` }}>
            <TH>Question</TH>
            <TH style={{ width: 50, textAlign: 'center' }}>Yes</TH>
            <TH style={{ width: 50, textAlign: 'center' }}>No</TH>
            <TH style={{ width: 200 }}>If Yes, Describe</TH>
          </tr>
        </thead>
        <tbody>
          {[
            '3.1 Do you serve on the board of directors, governing body, or advisory board of any other healthcare entity, referral source, or competitor?',
            '3.2 Do you have any professional relationship with any physician, physician group, hospital, skilled nursing facility, or other provider that refers patients to or receives referrals from Care Indeed Home Health Care, Inc.?',
            '3.3 Do you have any other relationship or interest that could reasonably be perceived as creating a conflict of interest with your duties as a Governing Body member?',
          ].map((q, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
              <TD style={{ fontWeight: 500 }}>{q}</TD>
              <TD style={{ textAlign: 'center' }}><input type="radio" name={`q3${i}`} style={{ width: 13, height: 13 }} /></TD>
              <TD style={{ textAlign: 'center' }}><input type="radio" name={`q3${i}`} style={{ width: 13, height: 13 }} /></TD>
              <TD><input type="text" style={{ border: 'none', borderBottom: `1px solid ${BORDER}`, background: 'transparent', outline: 'none', width: '100%', fontSize: 10 }} /></TD>
            </tr>
          ))}
        </tbody>
      </table>
    </section>

    {/* Section 4 */}
    <section style={{ backgroundColor: `${TEAL}0D`, border: `1px solid ${TEAL}33`, borderRadius: 8, padding: 16 }}>
      <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 12, color: TEAL, marginBottom: 10 }}>SECTION 4 — ATTESTATION</div>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, lineHeight: 1.6, color: DARK, marginBottom: 16 }}>
        I hereby certify that the information provided above is true, complete, and accurate to the best of my knowledge. I understand that I have an ongoing obligation to disclose any new conflict within 7 calendar days, I must recuse myself from voting on conflicted matters, and failure to disclose a known conflict may result in removal from the Governing Body of Care Indeed Home Health Care, Inc.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', color: MID, marginBottom: 6 }}>Signature</div>
          <div style={{ borderBottom: '2px dashed #999', height: 40 }} />
        </div>
        <div>
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', color: MID, marginBottom: 6 }}>Date Signed</div>
          <input type="text" placeholder="mm/dd/yyyy" style={{ border: 'none', borderBottom: `2px solid #999`, background: 'transparent', outline: 'none', width: '100%', fontSize: 11, fontFamily: 'Roboto, sans-serif', paddingBottom: 4 }} />
        </div>
      </div>
    </section>
  </div>
);

// ─── APPENDIX C ───────────────────────────────────────────────────────────────

const AppC = () => (
  <div>
    <div style={{ backgroundColor: PALE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '16px 20px', marginBottom: 24 }}>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: 12, color: DARK, marginBottom: 12 }}>I, the undersigned, acknowledge that:</p>
      <ol style={{ paddingLeft: 20, margin: 0 }}>
        {[
          'I have received and read Policy GV-GB-001 — Governing Body Authority & Responsibilities, Version 6.0, effective 2025-07-10.',
          'I understand the responsibilities, requirements, and expectations described in this policy as they apply to my role at Care Indeed Home Health Care, Inc.',
          'I understand that I am accountable for complying with this policy and that non-compliance may result in corrective action.',
          'I have had the opportunity to ask questions and receive clarification regarding any aspect of this policy.',
        ].map((item, i) => (
          <li key={i} style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, lineHeight: 1.7, color: DARK, marginBottom: 6 }}>{item}</li>
        ))}
      </ol>
    </div>
    <div style={{ backgroundColor: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: '24px 32px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {['Full Name (Printed)', 'Title / Role'].map((label, i) => (
          <div key={i}>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', color: MID, marginBottom: 6 }}>{label}</div>
            <input type="text" style={{ border: 'none', borderBottom: `2px solid #999`, background: 'transparent', outline: 'none', width: '100%', fontSize: 12, fontFamily: 'Roboto, sans-serif', paddingBottom: 4 }} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', color: MID, marginBottom: 6 }}>Signature</div>
        <div style={{ borderBottom: '2px dashed #999', height: 56 }} />
      </div>
      <div style={{ marginTop: 20 }}>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', color: MID, marginBottom: 6 }}>Date Signed</div>
        <input type="text" placeholder="mm/dd/yyyy" style={{ border: 'none', borderBottom: `2px solid #999`, background: 'transparent', outline: 'none', width: 240, fontSize: 12, fontFamily: 'Roboto, sans-serif', paddingBottom: 4 }} />
      </div>
    </div>
  </div>
);

// ─── APPENDIX D ───────────────────────────────────────────────────────────────

const AppD = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <InfoBox color="#F3F4F6" border={BORDER} textColor={DARK}>
      <strong>Instructions:</strong> Use this template for all regular and special Governing Body meetings. Draft minutes shall be completed within 14 calendar days of the meeting and retained for a minimum of 7 years.
    </InfoBox>

    {/* Meeting info */}
    <div style={{ backgroundColor: '#fff', border: `1px solid ${BORDER}`, borderRadius: 8, padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { label: 'Meeting Type', placeholder: 'Regular Quarterly / Special / Annual' },
          { label: 'Date', placeholder: 'mm/dd/yyyy' },
          { label: 'Time (Start / End)', placeholder: '00:00 – 00:00' },
          { label: 'Location', placeholder: 'In-Person / Remote' },
        ].map(({ label, placeholder }, i) => (
          <div key={i}>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', color: MID, marginBottom: 4 }}>{label}</div>
            <input type="text" placeholder={placeholder} style={{ border: 'none', borderBottom: `1px solid ${BORDER}`, background: 'transparent', outline: 'none', width: '100%', fontSize: 11, fontFamily: 'Roboto, sans-serif', paddingBottom: 2 }} />
          </div>
        ))}
      </div>
    </div>

    {/* Attendance */}
    <div>
      <div style={{ backgroundColor: TEAL, color: '#fff', padding: '8px 12px', borderRadius: '8px 8px 0 0', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        ATTENDANCE &amp; QUORUM
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, backgroundColor: '#fff', border: `1px solid ${BORDER}`, borderTop: 'none' }}>
        <thead>
          <tr style={{ backgroundColor: PALE, borderBottom: `1px solid ${BORDER}` }}>
            <TH>Member Name</TH>
            <TH style={{ width: 80, textAlign: 'center' }}>Present?</TH>
            <TH>Attendance Method</TH>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map(n => (
            <tr key={n} style={{ borderBottom: `1px solid ${BORDER}` }}>
              <TD><input type="text" style={{ border: 'none', borderBottom: `1px solid ${BORDER}`, background: 'transparent', outline: 'none', width: '100%', fontSize: 10 }} /></TD>
              <TD style={{ textAlign: 'center' }}><input type="checkbox" style={{ width: 14, height: 14 }} /></TD>
              <TD><input type="text" placeholder="In-person / Video" style={{ border: 'none', borderBottom: `1px solid ${BORDER}`, background: 'transparent', outline: 'none', width: '100%', fontSize: 10 }} /></TD>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 20, fontSize: 11, fontFamily: 'Roboto, sans-serif', fontWeight: 700, color: DARK }}>
        <span>Quorum Required: <LineInput w={40} /></span>
        <span>Members Present: <LineInput w={40} /></span>
        <span>Quorum Achieved?
          <label style={{ fontWeight: 400, marginLeft: 8 }}><input type="radio" name="quorumD" style={{ marginRight: 4 }} />Yes</label>
          <label style={{ fontWeight: 400, marginLeft: 8 }}><input type="radio" name="quorumD" style={{ marginRight: 4 }} />No</label>
        </span>
      </div>
    </div>

    {/* Standing items */}
    <div>
      <div style={{ backgroundColor: TEAL, color: '#fff', padding: '8px 12px', borderRadius: '8px 8px 0 0', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        STANDING AGENDA ITEMS (Summary)
      </div>
      <div style={{ border: `1px solid ${BORDER}`, borderTop: 'none', borderRadius: '0 0 8px 8px', backgroundColor: '#fff', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {['3. Administrator Report', '4. Compliance Report', '5. QAPI Report', '6. Financial Report'].map((item, i) => (
          <div key={i} style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: '10px 12px', backgroundColor: PALE }}>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 700, color: DARK, marginBottom: 6 }}>{item}:</div>
            <textarea
              style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: 4, padding: 8, minHeight: 64, fontSize: 10, fontFamily: 'Roboto, sans-serif', resize: 'vertical', backgroundColor: '#fff', boxSizing: 'border-box' }}
              placeholder="Document summary of report, discussion/questions, action required, responsible party, and deadline..."
            />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── APPENDIX E ───────────────────────────────────────────────────────────────

const CHECKLIST = [
  'Governing Body meeting convened this quarter with quorum?',
  'Meeting agenda distributed at least 7 days prior?',
  'Prior meeting minutes approved?',
  'Administrator report presented?',
  'Compliance Officer report presented?',
  'QAPI report presented?',
  'Financial report presented?',
  'All Governing Body member OIG/SAM screenings current (monthly)?',
  'All Conflict of Interest disclosures current?',
  'All key leadership positions filled (Administrator, Clinical Manager, Compliance Officer)?',
  'Governing Body membership roster current?',
  'Policy acknowledgments current for all members/leaders in scope?',
  'Q1 Only: Annual QAPI plan reviewed and approved?',
  'Q1 Only: Annual refresher training on governance responsibilities conducted?',
  'Q1 Only: Governing Body composition reviewed for competency coverage?',
  'Q2 Only: Succession plan reviewed and approved?',
  'Q3 Only: Emergency preparedness plan reviewed and approved?',
  'Pre-Fiscal Year: Annual operating budget reviewed and approved?',
  'All directives from prior meeting assigned, tracked, and status reported?',
  'Any Condition-level survey findings requiring Governing Body action?',
];

const AppE = () => {
  const [quarter, setQuarter] = useState('');
  return (
    <div>
      <InfoBox color={`${TEAL}0D`} border={`${TEAL}33`} textColor={DARK}>
        <strong>Purpose:</strong> To provide the Governing Body Chair and Administrator with a structured checklist to verify that all required oversight activities are completed each quarter, supporting continuous survey readiness and compliance with 42 CFR § 484.105.
      </InfoBox>
      <div style={{ backgroundColor: PALE, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', fontSize: 11, fontFamily: 'Roboto, sans-serif', fontWeight: 700, color: DARK }}>
        <span>
          Quarter:&nbsp;
          {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map(q => (
            <label key={q} style={{ fontWeight: 400, marginLeft: 10 }}>
              <input type="radio" name="quarter" value={q} checked={quarter === q} onChange={() => setQuarter(q)} style={{ marginRight: 4 }} />{q}
            </label>
          ))}
        </span>
        <span style={{ marginLeft: 16 }}>Calendar Year: <LineInput w={80} /></span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
        <thead>
          <tr>
            <TH style={{ width: 28, textAlign: 'center' }}>#</TH>
            <TH>Oversight Item</TH>
            <TH style={{ width: 80, textAlign: 'center' }}>Y / N / N-A</TH>
            <TH style={{ width: 180 }}>Notes / Corrective Action</TH>
          </tr>
        </thead>
        <tbody>
          {CHECKLIST.map((item, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : PALE }}>
              <TD style={{ textAlign: 'center', fontWeight: 700, color: MID }}>{i + 1}</TD>
              <TD style={{ fontWeight: 500 }}>{item}</TD>
              <TD style={{ textAlign: 'center' }}>
                <select style={{ border: `1px solid ${BORDER}`, borderRadius: 3, padding: '2px 4px', width: '100%', fontSize: 10, backgroundColor: '#fff' }}>
                  <option value="" /><option value="Y">Y</option><option value="N">N</option><option value="NA">N/A</option>
                </select>
              </TD>
              <TD><input type="text" style={{ border: 'none', borderBottom: `1px solid ${BORDER}`, background: 'transparent', outline: 'none', width: '100%', fontSize: 9 }} /></TD>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, backgroundColor: PALE, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '12px 14px', fontSize: 11, fontFamily: 'Roboto, sans-serif', fontWeight: 700, color: MID }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Completed By: <LineInput w={160} label="Completed By" /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Title: <LineInput w={160} label="Title" /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Date: <LineInput w={120} label="Date" /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          Presented to Chair?
          <label style={{ fontWeight: 400, marginLeft: 8 }}><input type="checkbox" style={{ marginRight: 4 }} />Yes</label>
          — Date: <LineInput w={80} label="Presented date" />
        </div>
      </div>
    </div>
  );
};

// ─── APPENDIX F ───────────────────────────────────────────────────────────────

const CAL_ROWS = [
  ['Q1', '• Convene regular quarterly meeting.\n• Review and approve the annual QAPI plan.\n• Conduct annual Governing Body composition review.\n• Collect annual Conflict of Interest disclosures.\n• Conduct annual refresher training on governance responsibilities.\n• Conduct annual Governance Self-Assessment (if adopted).', 'GV-GB-001 §6.3\nQA-PG-002\nGV-GB-001 §6.1.3\nGV-GB-003\nGV-GB-001 §10.4\nGV-GB-005', 'Governing Body Chair\nGoverning Body\nGoverning Body Chair\nCompliance Officer\nAdministrator\nGoverning Body Chair'],
  ['Q2', '• Convene regular quarterly meeting.\n• Review and approve succession plan for key leadership.\n• Review scope of services (if fiscal year begins Q3).', 'GV-GB-001 §6.3\nGV-GB-004\nGV-OG-003', 'Governing Body Chair\nGoverning Body\nGoverning Body'],
  ['Q3', '• Convene regular quarterly meeting.\n• Review and approve Emergency Preparedness Plan.\n• Review emergency drill results.', 'GV-GB-001 §6.3\nOP-FM-005\nGV-GB-001 §6.2.6.2', 'Governing Body Chair\nGoverning Body\nAdministrator'],
  ['Q4', '• Convene regular quarterly meeting.\n• Review and approve annual operating budget.\n• Complete annual Administrator performance evaluation.\n• Establish next year\'s meeting schedule by December 15.\n• Review and approve scope of services for upcoming year.', 'GV-GB-001 §6.3\nFN-FP-005\nGV-GB-001 §6.2.2.4\nGV-GB-001 §6.3.1\nGV-OG-003', 'Governing Body Chair\nGoverning Body\nGoverning Body\nGoverning Body Chair\nGoverning Body'],
  ['Ongoing\n(Every Meeting)', '• Review Administrator report.\n• Review Compliance Officer report.\n• Review QAPI report.\n• Review financial report.\n• Review status of prior meeting directives.\n• Verify OIG/SAM screening currency for all members.', 'GV-GB-001 §6.2.5.2\nGV-GB-001 §6.2.3.2\nGV-GB-001 §6.2.4.2\nGV-GB-001 §6.2.5.2\nGV-GB-001 §6.3.4\nHR-TA-003', 'Administrator\nCompliance Officer\nClinical Manager\nAdministrator\nDesignated Secretary\nCompliance Officer'],
  ['Ongoing\n(Monthly)', '• OIG/SAM exclusion screening of all Governing Body members.', 'GV-GB-001 §6.1.4; HR-TA-003', 'Compliance Officer'],
];

const AppF = () => (
  <div>
    <InfoBox color="#F3F4F6" border={BORDER} textColor={DARK}>
      <strong>Purpose:</strong> To provide a consolidated annual calendar of all Governing Body actions required by this policy and cross-referenced policies, ensuring no required action is missed.
    </InfoBox>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
      <thead>
        <tr>
          <TH style={{ width: '9%' }}>Quarter</TH>
          <TH style={{ width: '40%' }}>Required Actions</TH>
          <TH style={{ width: '28%' }}>Policy Reference</TH>
          <TH style={{ width: '23%' }}>Responsible Party</TH>
        </tr>
      </thead>
      <tbody>
        {CAL_ROWS.map((row, i) => (
          <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : PALE }}>
            {row.map((cell, j) => (
              <TD key={j} style={{ whiteSpace: 'pre-line', fontWeight: j === 0 ? 700 : 400 }}>{cell}</TD>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── APPENDIX G ───────────────────────────────────────────────────────────────

const AppG = () => (
  <div>
    <InfoBox color={`${TEAL}0A`} border={`${TEAL}20`} textColor={DARK}>
      <strong>Agency Organizational Structure:</strong> This chart illustrates the reporting relationships and accountability framework from the Governing Body through the senior administrative and clinical leadership, as required by 42 CFR § 484.105.
    </InfoBox>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 760, overflowX: 'auto' }}>
      {/* Level 1 */}
      <div style={{ backgroundColor: TEAL, border: `2px solid #004d47`, borderRadius: 14, padding: '14px 24px', width: 240, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,119,112,0.25)' }}>
        <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#fff', marginBottom: 6 }}>Governing Body</div>
        <span style={{ backgroundColor: '#fff', color: TEAL, padding: '3px 12px', borderRadius: 999, fontSize: 9, fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>Ultimate Legal Authority</span>
      </div>
      {/* Connector */}
      <div style={{ width: 2, height: 28, backgroundColor: '#CCC' }} />
      <div style={{ width: 440, height: 2, backgroundColor: '#CCC' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', width: 440 }}>
        <div style={{ width: 2, height: 28, backgroundColor: '#CCC' }} />
        <div style={{ width: 2, height: 28, backgroundColor: '#CCC' }} />
      </div>
      {/* Level 2 */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginBottom: 0 }}>
        {/* Compliance Officer */}
        <div style={{ backgroundColor: DARK, border: `2px solid #333`, borderRadius: 12, padding: '12px 16px', width: 180, textAlign: 'center' }}>
          <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', color: '#fff', marginBottom: 8 }}>Compliance Officer</div>
          <input type="text" placeholder="Enter Name…" style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, padding: '4px 8px', fontSize: 10, color: '#fff', width: '100%', textAlign: 'center', outline: 'none', fontFamily: 'Roboto, sans-serif' }} />
        </div>
        {/* Administrator branch */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ backgroundColor: RUST, border: `2px solid #943400`, borderRadius: 12, padding: '12px 16px', width: 200, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', color: '#fff', marginBottom: 8 }}>Administrator</div>
            <input type="text" placeholder="Enter Name…" style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 6, padding: '4px 8px', fontSize: 10, color: '#fff', width: '100%', textAlign: 'center', outline: 'none', fontFamily: 'Roboto, sans-serif' }} />
          </div>
          <div style={{ width: 2, height: 24, backgroundColor: '#CCC' }} />
          <div style={{ width: 400, height: 2, backgroundColor: '#CCC' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', width: 400 }}>
            <div style={{ width: 2, height: 24, backgroundColor: '#CCC' }} />
            <div style={{ width: 2, height: 24, backgroundColor: '#CCC' }} />
            <div style={{ width: 2, height: 24, backgroundColor: '#CCC' }} />
          </div>
          {/* Level 3 */}
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { label: 'Clinical Manager', border: TEAL, textColor: TEAL, sub: 'Clinical Staff\n(RN, PT, OT, ST, MSW, CHHA)' },
              { label: 'Medical Director', border: '#AAA', textColor: '#555', sub: null },
              { label: 'Business Operations', border: '#AAA', textColor: '#555', sub: 'HR, Finance, Intake\n& Scheduling' },
            ].map((role, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ backgroundColor: '#fff', border: `2px solid ${role.border}`, borderRadius: 10, padding: '10px 12px', width: 124, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 9, textTransform: 'uppercase', color: role.textColor, marginBottom: 6 }}>{role.label}</div>
                  <input type="text" placeholder="Enter Name…" style={{ border: 'none', borderBottom: `1px solid ${BORDER}`, background: 'transparent', outline: 'none', width: '100%', fontSize: 9, textAlign: 'center', fontFamily: 'Roboto, sans-serif' }} />
                </div>
                {role.sub && (
                  <>
                    <div style={{ width: 2, height: 18, backgroundColor: '#CCC' }} />
                    <div style={{ backgroundColor: PALE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '6px 8px', width: 118, textAlign: 'center', fontSize: 9, fontFamily: 'Roboto, sans-serif', color: MID, whiteSpace: 'pre-line', lineHeight: 1.4 }}>{role.sub}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── COMPONENTS MAP ───────────────────────────────────────────────────────────

const COMPONENTS: Record<string, React.FC> = {
  A: AppA, B: AppB, C: AppC, D: AppD, E: AppE, F: AppF, G: AppG,
};

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export function GVGBAppendixPrint() {
  const { appendixId = 'A' } = useParams<{ appendixId: string }>();
  const title   = TITLES[appendixId]     ?? 'Appendix';
  const Component = COMPONENTS[appendixId] ?? AppA;
  const isLandscape = appendixId === 'G';

  useEffect(() => {
    const t = setTimeout(() => window.print(), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: DARK, background: '#fff', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Roboto:wght@300;400;500;700&display=swap');
        @page {
          size: ${isLandscape ? 'letter landscape' : 'letter'};
          margin: 0.65in 0.75in;
        }
        @media print {
          body { background: white !important; margin: 0; }
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          /* Ensure all typed input values are visible in print */
          input[type="text"],
          input[type="email"],
          input[type="date"],
          input[type="number"] {
            color: #1F1C1B !important;
            opacity: 1 !important;
            -webkit-text-fill-color: #1F1C1B !important;
          }
          input::placeholder { color: transparent !important; opacity: 0 !important; }
          select { color: #1F1C1B !important; opacity: 1 !important; }
          textarea { color: #1F1C1B !important; opacity: 1 !important; }
        }
        body { margin: 0; padding: 0; }
      `}</style>

      {/* Screen-only sticky toolbar */}
      <div
        className="no-print"
        style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: TEAL, color: '#fff', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '8px solid #fff' }}
      >
        <div>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 12 }}>
            GV-GB-001 — {title}
          </span>
          <span style={{ marginLeft: 12, fontSize: 10, opacity: 0.7 }}>Fill in the form below, then print.</span>
        </div>
        <button
          onClick={() => window.print()}
          style={{ backgroundColor: '#fff', color: TEAL, border: 'none', borderRadius: 6, padding: '6px 16px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
        >
          🖨 Print / Save PDF
        </button>
      </div>

      {/* Document */}
      <div style={{ maxWidth: isLandscape ? 1000 : 800, margin: '0 auto', padding: '32px 40px' }}>
        <AppHeader title={title} />
        <Component />
      </div>
    </div>
  );
}
