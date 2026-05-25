·
11:52 AM
amazing work :D begin batch 2

12:14 PM

Batch 2 — the remaining pages that currently fall through to the default case. Let's build them all out with full V3 skins.

PAGE 16: DOMAIN LIBRARY
case 'domain-library':
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Network size={16} color={V3.orangeLight} style={{ filter: 'drop-shadow(0 0 4px rgba(255, 160, 89, 0.65))' }} />
          <span style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
            color: V3.orangeLight,
            textShadow: '0 0 10px rgba(255, 160, 89, 0.95), 0 0 20px rgba(255, 160, 89, 0.45)'
          }}>
            REGULATORY FRAMEWORK
          </span>
        </div>
        <h1 style={{
          fontSize: '28px', fontWeight: 600, margin: 0, letterSpacing: '-0.5px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #A8B0C0 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Domain Library
        </h1>
        <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>
          Comprehensive registry of all compliance domains, sub-domains, and regulatory cross-references.
        </p>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: '20px', padding: '10px 16px', maxWidth: '400px' }}>
        <Search size={16} color={V3.textTertiary} />
        <input placeholder="Search domains, sub-domains, CMS references..." style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', width: '100%', fontSize: '13px' }} />
      </div>

      {/* Domain Cards with Expandable Sub-domains */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[
          {
            code: 'CL', name: 'Clinical Operations', desc: 'Patient care delivery, assessments, plans of care, clinical documentation, and outcome tracking.',
            cmsRefs: ['§484.50', '§484.55', '§484.60', '§484.80'],
            controls: 89, compliant: 34, critical: 15,
            subdomains: ['Patient Rights', 'Plan of Care', 'Drug Regimen Review', 'Comprehensive Assessment', 'Clinical Records', 'Aide Services', 'Discharge Planning']
          },
          {
            code: 'QA', name: 'Quality Assurance & QAPI', desc: 'Quality Assessment and Performance Improvement program governance, data aggregation, and PIP execution.',
            cmsRefs: ['§484.65'],
            controls: 72, compliant: 22, critical: 15,
            subdomains: ['QAPI Committee', 'KPI Monitoring', 'Performance Indicators', 'Trend Analysis', 'Plan for Improvement', 'Governing Body Reports']
          },
          {
            code: 'SA', name: 'Safety & Emergency Preparedness', desc: 'Emergency response protocols, fire safety, disaster preparedness, and incident management.',
            cmsRefs: ['§484.102'],
            controls: 55, compliant: 18, critical: 12,
            subdomains: ['Emergency Plan', 'Fire Drills', 'Incident Reporting', 'Risk Assessment', 'Safety Training', 'Evacuation Procedures']
          },
          {
            code: 'HR', name: 'Human Resources & Workforce', desc: 'Personnel qualifications, competency validation, training compliance, and workforce management.',
            cmsRefs: ['§484.115'],
            controls: 68, compliant: 15, critical: 23,
            subdomains: ['Personnel Records', 'Competency Evaluation', 'Background Checks', 'Continuing Education', 'Code of Conduct', 'Credentialing']
          },
          {
            code: 'GV', name: 'Governance & Leadership', desc: 'Governing body oversight, organizational structure, strategic compliance direction, and accountability.',
            cmsRefs: ['§484.105'],
            controls: 42, compliant: 8, critical: 20,
            subdomains: ['Governing Body', 'Administrator Duties', 'Committee Structure', 'Compliance Officer', 'Bylaws & Charters']
          },
          {
            code: 'IT', name: 'Information Technology & Security', desc: 'ePHI protection, HIPAA security rule compliance, access controls, and cybersecurity protocols.',
            cmsRefs: ['§164.308', '§164.310', '§164.312'],
            controls: 38, compliant: 10, critical: 10,
            subdomains: ['Access Controls', 'Encryption Standards', 'Audit Logs', 'Backup & Recovery', 'Risk Analysis', 'Workforce Security']
          },
          {
            code: 'IC', name: 'Infection Prevention & Control', desc: 'Standard precautions, transmission-based precautions, surveillance, and environmental safety.',
            cmsRefs: ['§484.70'],
            controls: 36, compliant: 9, critical: 15,
            subdomains: ['Standard Precautions', 'Hand Hygiene', 'PPE Compliance', 'Environmental Cleaning', 'Surveillance Reporting', 'Outbreak Response']
          },
          {
            code: 'DM', name: 'Data Management & Records', desc: 'Clinical records management, data integrity, retention policies, and information governance.',
            cmsRefs: ['§484.110'],
            controls: 45, compliant: 12, critical: 11,
            subdomains: ['Records Retention', 'Data Entry Standards', 'Chart Audits', 'Release of Information', 'Archival Procedures']
          },
        ].map((domain) => (
          <div key={domain.code} className="v3-invisible-glare" style={{
            padding: '24px', border: `1px solid rgba(255,255,255,0.15)`,
            display: 'flex', flexDirection: 'column', gap: '16px',
          }}>
            {/* Domain Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  fontSize: '14px', fontWeight: 700, color: V3.tealLight,
                  padding: '6px 12px', background: 'rgba(0,209,193,0.08)', borderRadius: '6px',
                  fontFamily: 'monospace',
                }}>
                  {domain.code}
                </span>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: V3.textPrimary, margin: 0 }}>{domain.name}</h3>
                  <p style={{ fontSize: '13px', color: V3.textSecondary, margin: '4px 0 0 0', lineHeight: 1.4 }}>{domain.desc}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: V3.textPrimary }}>{domain.controls}</div>
                  <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: V3.textTertiary }}>Controls</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: V3.tealLight }}>{domain.compliant}</div>
                  <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: V3.textTertiary }}>Compliant</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: V3.tealLight }}>{domain.critical}</div>
                  <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', color: V3.textTertiary }}>Critical</div>
                </div>
              </div>
            </div>

            {/* CMS References */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: V3.textTertiary, textTransform: 'uppercase', letterSpacing: '0.4px' }}>CMS:</span>
              {domain.cmsRefs.map((ref) => (
                <span key={ref} style={{ fontSize: '11px', fontFamily: 'monospace', color: V3.textSecondary, padding: '2px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }}>{ref}</span>
              ))}
            </div>

            {/* Sub-domains */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingTop: '8px', borderTop: `1px solid rgba(255,255,255,0.06)` }}>
              {domain.subdomains.map((sub) => (
                <span key={sub} className="btn-smooth-hover" style={{
                  fontSize: '12px', fontWeight: 500, color: V3.textSecondary,
                  padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
                  border: `1px solid rgba(255,255,255,0.08)`, background: 'transparent',
                }}>
                  {sub}
                </span>
              ))}
            </div>

            {/* Progress Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.round((domain.compliant / domain.controls) * 100)}%`, height: '100%', background: V3.tealLight, borderRadius: '2px' }} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: V3.tealLight, minWidth: '40px' }}>{Math.round((domain.compliant / domain.controls) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

PAGE 17: REFERRING PHYSICIANS
case 'referring-physicians':
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Users size={16} color={V3.orangeLight} style={{ filter: 'drop-shadow(0 0 4px rgba(255, 160, 89, 0.65))' }} />
          <span style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
            color: V3.orangeLight,
            textShadow: '0 0 10px rgba(255, 160, 89, 0.95), 0 0 20px rgba(255, 160, 89, 0.45)'
          }}>
            PHYSICIAN NETWORK
          </span>
        </div>
        <h1 style={{
          fontSize: '28px', fontWeight: 600, margin: 0, letterSpacing: '-0.5px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #A8B0C0 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Referring Physicians
        </h1>
        <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>
          Physician referral network registry with order tracking and credentialing status.
        </p>
      </div>

      {/* Search + Add */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: '20px', padding: '10px 16px', width: '360px' }}>
          <Search size={16} color={V3.textTertiary} />
          <input placeholder="Search by name, NPI, or specialty..." style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', width: '100%', fontSize: '13px' }} />
        </div>
        <button className="btn-smooth-hover" style={{ padding: '10px 20px', background: V3.tealLight, border: 'none', color: '#000', fontSize: '12px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }}>
          + Add Physician
        </button>
      </div>

      {/* Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '16px' }}>
          <span style={{ flex: 2, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Physician</span>
          <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>NPI</span>
          <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Specialty</span>
          <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Active Orders</span>
          <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Credential Status</span>
          <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Last Referral</span>
        </div>
        {[
          { name: 'Dr. Michael Roberts, MD', npi: '1234567890', specialty: 'Internal Medicine', orders: 14, credential: 'Verified', lastRef: 'May 18, 2026' },
          { name: 'Dr. Patricia Chen, DO', npi: '2345678901', specialty: 'Family Medicine', orders: 9, credential: 'Verified', lastRef: 'May 15, 2026' },
          { name: 'Dr. James Williams, MD', npi: '3456789012', specialty: 'Cardiology', orders: 6, credential: 'Pending', lastRef: 'May 10, 2026' },
          { name: 'Dr. Angela Davis, MD', npi: '4567890123', specialty: 'Pulmonology', orders: 4, credential: 'Verified', lastRef: 'May 8, 2026' },
          { name: 'Dr. Robert Kim, DO', npi: '5678901234', specialty: 'Geriatrics', orders: 11, credential: 'Verified', lastRef: 'May 19, 2026' },
          { name: 'Dr. Susan Martinez, MD', npi: '6789012345', specialty: 'Neurology', orders: 3, credential: 'Expired', lastRef: 'Apr 22, 2026' },
          { name: 'Dr. David Johnson, MD', npi: '7890123456', specialty: 'Orthopedics', orders: 8, credential: 'Verified', lastRef: 'May 12, 2026' },
          { name: 'Dr. Emily Watson, DO', npi: '8901234567', specialty: 'Endocrinology', orders: 2, credential: 'Pending', lastRef: 'May 5, 2026' },
        ].map((doc, idx) => (
          <div key={idx} className="v3-invisible-glare" style={{
            display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '16px',
            borderBottom: `1px solid rgba(255,255,255,0.06)`, cursor: 'pointer',
          }}>
            <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, background: 'rgba(0,0,0,0.2)', color: V3.textSecondary, flexShrink: 0 }}>
                {doc.name.split(' ').filter(w => w.length > 1 && !w.includes('.')).slice(0, 2).map(w => w[0]).join('')}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: V3.textPrimary }}>{doc.name}</span>
            </div>
            <span style={{ flex: 1, fontSize: '12px', fontFamily: 'monospace', color: V3.textTertiary }}>{doc.npi}</span>
            <span style={{ flex: 1, fontSize: '12px', color: V3.textSecondary }}>{doc.specialty}</span>
            <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: V3.textPrimary }}>{doc.orders}</span>
            <span style={{
              flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
              color: doc.credential === 'Verified' ? V3.tealLight : doc.credential === 'Expired' ? V3.tealLight : V3.textSecondary,
            }}>
              {doc.credential}
            </span>
            <span style={{ flex: 1, fontSize: '12px', color: V3.textTertiary }}>{doc.lastRef}</span>
          </div>
        ))}
      </div>
    </div>
  );

PAGE 18: VISIT SCHEDULE
case 'visit-schedule':
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Calendar size={16} color={V3.orangeLight} style={{ filter: 'drop-shadow(0 0 4px rgba(255, 160, 89, 0.65))' }} />
          <span style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
            color: V3.orangeLight,
            textShadow: '0 0 10px rgba(255, 160, 89, 0.95), 0 0 20px rgba(255, 160, 89, 0.45)'
          }}>
            SCHEDULING & VISITS
          </span>
        </div>
        <h1 style={{
          fontSize: '28px', fontWeight: 600, margin: 0, letterSpacing: '-0.5px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #A8B0C0 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Visit Schedule
        </h1>
        <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>
          Daily and weekly home health visit assignments across all zones and disciplines.
        </p>
      </div>

      {/* Date Selector + Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['Today', 'Tomorrow', 'This Week', 'Next Week'].map((tab, idx) => (
            <button key={tab} className="btn-smooth-hover" style={{
              padding: '8px 16px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer',
              background: idx === 0 ? 'rgba(0, 209, 193, 0.1)' : 'transparent',
              border: idx === 0 ? `1px solid ${V3.tealLight}` : '1px solid transparent',
              color: idx === 0 ? V3.textPrimary : V3.textSecondary,
            }}>
              {tab}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All Zones', 'Zone A', 'Zone B', 'Zone C'].map((zone, idx) => (
            <button key={zone} className="btn-smooth-hover" style={{
              padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer',
              background: idx === 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
              border: `1px solid ${idx === 0 ? V3.borderHighlight : 'transparent'}`,
              color: idx === 0 ? V3.textPrimary : V3.textSecondary,
            }}>
              {zone}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: '16px' }}>
        {[
          { label: 'TOTAL VISITS', value: '24' },
          { label: 'COMPLETED', value: '8', color: V3.tealLight },
          { label: 'IN PROGRESS', value: '3', color: V3.tealLight },
          { label: 'UPCOMING', value: '11' },
          { label: 'MISSED/CANCELLED', value: '2', color: V3.tealLight },
        ].map((kpi) => (
          <div key={kpi.label} className="v3-invisible-glare" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.4px' }}>{kpi.label}</span>
            <span style={{ fontSize: '22px', fontWeight: 600, color: kpi.color || V3.textPrimary }}>{kpi.value}</span>
          </div>
        ))}
      </div>

      {/* Timeline-Style Visit List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: V3.tealLight, margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          Today — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>
        {[
          { time: '7:00 AM', patient: 'Margaret Wilson', clinician: 'Dr. Vance', type: 'RN Assessment', zone: 'A', status: 'Completed', duration: '45 min' },
          { time: '8:30 AM', patient: 'Robert Thompson', clinician: 'S. Caldwell', type: 'PT Session', zone: 'B', status: 'Completed', duration: '60 min' },
          { time: '9:15 AM', patient: 'Helen Garcia', clinician: 'S. Jenkins', type: 'OT Evaluation', zone: 'A', status: 'Completed', duration: '50 min' },
          { time: '10:00 AM', patient: 'James Lee', clinician: 'M. Sterling', type: 'RN Follow-up', zone: 'C', status: 'In Progress', duration: '30 min' },
          { time: '11:00 AM', patient: 'Dorothy Adams', clinician: 'Dr. Vance', type: 'RN Assessment', zone: 'B', status: 'Upcoming', duration: '45 min' },
          { time: '12:30 PM', patient: 'William Brown', clinician: 'S. Caldwell', type: 'PT Session', zone: 'A', status: 'Upcoming', duration: '60 min' },
          { time: '1:00 PM', patient: 'Barbara Miller', clinician: 'D. Cho', type: 'Telehealth Check', zone: 'C', status: 'Upcoming', duration: '20 min' },
          { time: '2:00 PM', patient: 'Charles Davis', clinician: 'S. Jenkins', type: 'OT Session', zone: 'B', status: 'Upcoming', duration: '50 min' },
          { time: '3:00 PM', patient: 'Nancy Taylor', clinician: 'M. Sterling', type: 'Wound Care', zone: 'A', status: 'Cancelled', duration: '40 min' },
          { time: '3:30 PM', patient: 'Richard Anderson', clinician: 'Dr. Vance', type: 'RN Discharge', zone: 'C', status: 'Upcoming', duration: '45 min' },
        ].map((visit, idx) => (
          <div key={idx} className="v3-invisible-glare" style={{
            display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '16px',
            borderBottom: `1px solid rgba(255,255,255,0.06)`,
            opacity: visit.status === 'Cancelled' ? 0.5 : 1,
          }}>
            {/* Time */}
            <span style={{ fontSize: '13px', fontWeight: 600, color: V3.textPrimary, minWidth: '72px', fontFamily: 'monospace' }}>{visit.time}</span>

            {/* Timeline Dot */}
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
              background: visit.status === 'Completed' ? V3.tealLight : visit.status === 'In Progress' ? V3.orangeLight : visit.status === 'Cancelled' ? V3.textTertiary : 'rgba(255,255,255,0.15)',
              boxShadow: visit.status === 'In Progress' ? '0 0 8px rgba(255, 160, 89, 0.5)' : 'none',
            }} />

            {/* Visit Info */}
            <div style={{ flex: 2 }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: V3.textPrimary, display: 'block', textDecoration: visit.status === 'Cancelled' ? 'line-through' : 'none' }}>{visit.patient}</span>
              <span style={{ fontSize: '12px', color: V3.textSecondary }}>{visit.type} · {visit.duration}</span>
            </div>

            {/* Clinician */}
            <span style={{ flex: 1, fontSize: '12px', color: V3.textSecondary }}>{visit.clinician}</span>

            {/* Zone */}
            <span style={{ fontSize: '11px', color: V3.textSecondary, padding: '3px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }}>Zone {visit.zone}</span>

            {/* Status */}
            <span style={{
              fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', minWidth: '80px', textAlign: 'center',
              padding: '4px 10px', borderRadius: '6px',
              background: visit.status === 'Completed' ? 'rgba(0,209,193,0.1)' : visit.status === 'In Progress' ? 'rgba(255,160,89,0.1)' : 'rgba(255,255,255,0.04)',
              color: visit.status === 'Completed' ? V3.tealLight : visit.status === 'In Progress' ? V3.orangeLight : visit.status === 'Cancelled' ? V3.textTertiary : V3.textSecondary,
            }}>
              {visit.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

PAGE 19: MISSED VISITS
case 'missed-visits':
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <AlertTriangle size={16} color={V3.orangeLight} style={{ filter: 'drop-shadow(0 0 4px rgba(255, 160, 89, 0.65))' }} />
          <span style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
            color: V3.orangeLight,
            textShadow: '0 0 10px rgba(255, 160, 89, 0.95), 0 0 20px rgba(255, 160, 89, 0.45)'
          }}>
            VISIT COMPLIANCE
          </span>
        </div>
        <h1 style={{
          fontSize: '28px', fontWeight: 600, margin: 0, letterSpacing: '-0.5px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #A8B0C0 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Missed Visits
        </h1>
        <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>
          Missed and cancelled visit tracking with reason codes and follow-up documentation status.
        </p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'THIS MONTH', value: '18' },
          { label: 'DOCUMENTED', value: '12', color: V3.tealLight },
          { label: 'PENDING DOC', value: '4', color: V3.tealLight },
          { label: 'ESCALATED', value: '2', color: V3.tealLight },
        ].map((kpi) => (
          <div key={kpi.label} className="v3-invisible-glare" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.4px' }}>{kpi.label}</span>
            <span style={{ fontSize: '22px', fontWeight: 600, color: kpi.color || V3.textPrimary }}>{kpi.value}</span>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['All', 'Patient Refused', 'Clinician Unavailable', 'Weather/Safety', 'Hospitalization', 'Other'].map((reason, idx) => (
          <button key={reason} className="btn-smooth-hover" style={{
            padding: '8px 16px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer',
            background: idx === 0 ? 'rgba(0, 209, 193, 0.1)' : 'transparent',
            border: idx === 0 ? `1px solid ${V3.tealLight}` : '1px solid transparent',
            color: idx === 0 ? V3.textPrimary : V3.textSecondary,
          }}>
            {reason}
          </button>
        ))}
      </div>

      {/* Missed Visit Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[
          { date: 'May 19', time: '10:00 AM', patient: 'Nancy Taylor', clinician: 'M. Sterling', reason: 'Patient Refused', documented: true, followUp: 'Rescheduled May 21', severity: 'Low' },
          { date: 'May 18', time: '2:00 PM', patient: 'James Lee', clinician: 'Dr. Vance', reason: 'Clinician Unavailable', documented: true, followUp: 'Covered by S. Caldwell', severity: 'Medium' },
          { date: 'May 17', time: '9:00 AM', patient: 'Helen Garcia', clinician: 'S. Jenkins', reason: 'Hospitalization', documented: true, followUp: 'Care plan on hold', severity: 'High' },
          { date: 'May 16', time: '3:30 PM', patient: 'Dorothy Adams', clinician: 'M. Sterling', reason: 'Weather/Safety', documented: false, followUp: 'Pending reschedule', severity: 'Low' },
          { date: 'May 15', time: '11:00 AM', patient: 'William Brown', clinician: 'S. Caldwell', reason: 'Patient Refused', documented: false, followUp: 'Needs supervisor follow-up', severity: 'Medium' },
          { date: 'May 14', time: '8:00 AM', patient: 'Barbara Miller', clinician: 'Dr. Vance', reason: 'Clinician Unavailable', documented: true, followUp: 'Rescheduled May 15', severity: 'Low' },
          { date: 'May 13', time: '1:00 PM', patient: 'Charles Davis', clinician: 'D. Cho', reason: 'Other', documented: false, followUp: 'Escalated to Clinical Manager', severity: 'High' },
          { date: 'May 12', time: '4:00 PM', patient: 'Richard Anderson', clinician: 'S. Jenkins', reason: 'Patient Refused', documented: true, followUp: 'Patient education completed', severity: 'Low' },
        ].map((visit, idx) => (
          <div key={idx} className="v3-invisible-glare" style={{
            padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px',
            border: !visit.documented ? `1px solid rgba(0, 209, 193, 0.33)` : `1px solid rgba(255,255,255,0.08)`,
            background: !visit.documented ? 'rgba(0, 209, 193, 0.02)' : 'transparent',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
          }}>
            {/* Date/Time */}
            <div style={{ minWidth: '80px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: V3.textPrimary, display: 'block' }}>{visit.date}</span>
              <span style={{ fontSize: '11px', color: V3.textTertiary }}>{visit.time}</span>
            </div>

            {/* Patient + Clinician */}
            <div style={{ flex: 2, minWidth: '160px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: V3.textPrimary, display: 'block' }}>{visit.patient}</span>
              <span style={{ fontSize: '12px', color: V3.textSecondary }}>Clinician: {visit.clinician}</span>
            </div>

            {/* Reason */}
            <span style={{
              flex: 1, fontSize: '11px', fontWeight: 600, color: V3.textSecondary,
              padding: '4px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', textAlign: 'center',
            }}>
              {visit.reason}
            </span>

            {/* Follow-up */}
            <span style={{ flex: 1.5, fontSize: '12px', color: V3.textSecondary }}>{visit.followUp}</span>

            {/* Documentation Status */}
            <span style={{
              fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: '6px', minWidth: '90px', textAlign: 'center',
              background: visit.documented ? 'rgba(0,209,193,0.1)' : 'rgba(255,255,255,0.04)',
              color: visit.documented ? V3.tealLight : V3.textTertiary,
            }}>
              {visit.documented ? 'Documented' : 'Pending'}
            </span>

            {/* Action */}
            {!visit.documented && (
              <button className="btn-smooth-hover" style={{
                padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer',
                background: 'rgba(0,209,193,0.1)', border: `1px solid ${V3.tealLight}`, color: V3.tealLight,
              }}>
                Document
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

PAGE 20: HUBSTAFF
case 'hubstaff':
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <ArrowUpCircle size={16} color={V3.orangeLight} style={{ filter: 'drop-shadow(0 0 4px rgba(255, 160, 89, 0.65))' }} />
          <span style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
            color: V3.orangeLight,
            textShadow: '0 0 10px rgba(255, 160, 89, 0.95), 0 0 20px rgba(255, 160, 89, 0.45)'
          }}>
            WORKFORCE ANALYTICS
          </span>
        </div>
        <h1 style={{
          fontSize: '28px', fontWeight: 600, margin: 0, letterSpacing: '-0.5px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #A8B0C0 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Hubstaff Integration
        </h1>
        <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>
          Time tracking, productivity metrics, and workforce utilization insights.
        </p>
      </div>

      {/* Weekly Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)', gap: '16px' }}>
        {[
          { label: 'TOTAL HOURS', value: '342.5' },
          { label: 'ACTIVE USERS', value: '12', color: V3.tealLight },
          { label: 'AVG PRODUCTIVITY', value: '87%', color: V3.tealLight },
          { label: 'FIELD HOURS', value: '280' },
          { label: 'ADMIN HOURS', value: '62.5' },
          { label: 'OVERTIME', value: '18.5', color: V3.tealLight },
        ].map((kpi) => (
          <div key={kpi.label} className="v3-invisible-glare" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.4px' }}>{kpi.label}</span>
            <span style={{ fontSize: '22px', fontWeight: 600, color: kpi.color || V3.textPrimary }}>{kpi.value}</span>
          </div>
        ))}
      </div>

      {/* Staff Time Table */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: V3.tealLight, margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>This Week — Staff Breakdown</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', gap: '16px' }}>
            <span style={{ flex: 2, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Staff Member</span>
            <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px', textAlign: 'center' }}>Hours</span>
            <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px', textAlign: 'center' }}>Productivity</span>
            <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px', textAlign: 'center' }}>Visits</span>
            <span style={{ flex: 1.5, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Utilization</span>
          </div>
          {[
            { name: 'Dr. Evelyn Vance', role: 'Clinical Lead', hours: 42.0, productivity: 92, visits: 18 },
            { name: 'Marcus Sterling', role: 'RN', hours: 38.5, productivity: 88, visits: 15 },
            { name: 'Sophia Caldwell', role: 'PT', hours: 40.0, productivity: 91, visits: 16 },
            { name: 'Sarah Jenkins', role: 'OT', hours: 36.0, productivity: 85, visits: 14 },
            { name: 'David Cho', role: 'Clinical Informatics', hours: 44.5, productivity: 78, visits: 8 },
            { name: 'Maria Gonzales', role: 'QA Lead', hours: 40.0, productivity: 82, visits: 0 },
            { name: 'Admin User', role: 'System Admin', hours: 45.0, productivity: 90, visits: 0 },
            { name: 'Training Staff', role: 'Per Diem RN', hours: 24.0, productivity: 76, visits: 10 },
          ].map((staff, idx) => (
            <div key={idx} className="v3-invisible-glare" style={{
              display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '16px',
              borderBottom: `1px solid rgba(255,255,255,0.06)`,
            }}>
              <div style={{ flex: 2 }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: V3.textPrimary, display: 'block' }}>{staff.name}</span>
                <span style={{ fontSize: '11px', color: V3.textTertiary }}>{staff.role}</span>
              </div>
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: staff.hours > 40 ? V3.tealLight : V3.textPrimary, textAlign: 'center' }}>{staff.hours}h</span>
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: staff.productivity >= 85 ? V3.tealLight : V3.textSecondary, textAlign: 'center' }}>{staff.productivity}%</span>
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: V3.textPrimary, textAlign: 'center' }}>{staff.visits}</span>
              <div style={{ flex: 1.5, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${staff.productivity}%`, height: '100%', background: staff.productivity >= 85 ? V3.tealLight : 'rgba(255,255,255,0.2)', borderRadius: '3px' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

PAGE 21: USER GUIDES
case 'user-guides':
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Folder size={16} color={V3.orangeLight} style={{ filter: 'drop-shadow(0 0 4px rgba(255, 160, 89, 0.65))' }} />
          <span style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
            color: V3.orangeLight,
            textShadow: '0 0 10px rgba(255, 160, 89, 0.95), 0 0 20px rgba(255, 160, 89, 0.45)'
          }}>
            SYSTEM DOCUMENTATION
          </span>
        </div>
        <h1 style={{
          fontSize: '28px', fontWeight: 600, margin: 0, letterSpacing: '-0.5px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #A8B0C0 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          User Guides
        </h1>
        <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>
          Comprehensive system documentation and operational guides for all modules.
        </p>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: '20px', padding: '10px 16px', maxWidth: '400px' }}>
        <Search size={16} color={V3.textTertiary} />
        <input placeholder="Search documentation..." style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', width: '100%', fontSize: '13px' }} />
      </div>

      {/* Guide Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {[
          { title: 'Getting Started Guide', desc: 'Initial setup, navigation overview, and first-time user walkthrough for the CareIndeed platform.', pages: 24, updated: 'May 10, 2026', category: 'Onboarding' },
          { title: 'Dashboard & Agency View', desc: 'Understanding KPIs, readiness status, kanban boards, and the agency-wide compliance overview.', pages: 18, updated: 'May 15, 2026', category: 'Operations' },
          { title: 'CES Board Operations', desc: 'Sprint execution, task management, kanban workflow, and evidence attachment procedures.', pages: 32, updated: 'May 12, 2026', category: 'CES' },
          { title: 'Policy Library Management', desc: 'Creating, reviewing, approving, and publishing enterprise policies through the full lifecycle.', pages: 28, updated: 'May 8, 2026', category: 'Policy' },
          { title: 'eCIgn Forms & Signing', desc: 'Digital form creation, electronic signatures, packet assembly, and evidence vault integration.', pages: 22, updated: 'May 14, 2026', category: 'eCIgn' },
          { title: 'Evidence Center Guide', desc: 'Uploading, categorizing, and linking evidence artifacts to CES obligations and audit trails.', pages: 20, updated: 'May 11, 2026', category: 'Evidence' },
          { title: 'Calendar & Visit Scheduling', desc: 'Shift management, visit scheduling, missed visit documentation, and zone assignments.', pages: 16, updated: 'May 9, 2026', category: 'Scheduling' },
          { title: 'Brad AI Copilot Reference', desc: 'Using the AI assistant for compliance queries, taxonomy lookups, and operational guidance.', pages: 12, updated: 'May 16, 2026', category: 'AI' },
          { title: 'Administration & Settings', desc: 'User management, role configuration, permissions, audit logs, and system settings.', pages: 26, updated: 'May 7, 2026', category: 'Admin' },
        ].map((guide) => (
          <div key={guide.title} className="v3-invisible-glare" style={{
            padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px',
            border: `1px solid rgba(255,255,255,0.15)`, cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{
                fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px',
                padding: '4px 10px', borderRadius: '6px',
                background: 'rgba(0,209,193,0.1)', color: V3.tealLight,
              }}>
                {guide.category}
              </span>
              <FileText size={16} color={V3.textTertiary} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: V3.textPrimary, margin: 0, lineHeight: 1.3 }}>{guide.title}</h4>
            <p style={{ fontSize: '13px', color: V3.textSecondary, margin: 0, lineHeight: 1.4, flex: 1 }}>{guide.desc}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${V3.borderDefault}`, paddingTop: '12px' }}>
              <span style={{ fontSize: '12px', color: V3.textTertiary }}>{guide.pages} pages · Updated {guide.updated}</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: V3.tealLight }}>Read →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

PAGE 22: SOP LIBRARY
case 'sop-library':
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <FileText size={16} color={V3.orangeLight} style={{ filter: 'drop-shadow(0 0 4px rgba(255, 160, 89, 0.65))' }} />
          <span style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
            color: V3.orangeLight,
            textShadow: '0 0 10px rgba(255, 160, 89, 0.95), 0 0 20px rgba(255, 160, 89, 0.45)'
          }}>
            OPERATIONAL PROCEDURES
          </span>
        </div>
        <h1 style={{
          fontSize: '28px', fontWeight: 600, margin: 0, letterSpacing: '-0.5px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #A8B0C0 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          SOP Library
        </h1>
        <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>
          Standard Operating Procedures for all clinical, administrative, and compliance workflows.
        </p>
      </div>

      {/* Filter + Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All SOPs', 'Clinical', 'Administrative', 'IT', 'Compliance'].map((tab, idx) => (
            <button key={tab} className="btn-smooth-hover" style={{
              padding: '8px 16px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer',
              background: idx === 0 ? 'rgba(0, 209, 193, 0.1)' : 'transparent',
              border: idx === 0 ? `1px solid ${V3.tealLight}` : '1px solid transparent',
              color: idx === 0 ? V3.textPrimary : V3.textSecondary,
            }}>
              {tab}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: '20px', padding: '6px 14px', width: '260px' }}>
          <Search size={14} color={V3.textTertiary} />
          <input placeholder="Search SOPs..." style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', fontSize: '12px', width: '100%' }} />
        </div>
      </div>

      {/* SOP Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '16px' }}>
          <span style={{ flex: 0.5, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>ID</span>
          <span style={{ flex: 2, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Procedure Title</span>
          <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Category</span>
          <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Version</span>
          <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Last Reviewed</span>
          <span style={{ flex: 1, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.6px' }}>Owner</span>
        </div>
        {[
          { id: 'SOP-CL-001', title: 'New Patient Intake & Assessment Protocol', cat: 'Clinical', version: 'v3.1', reviewed: 'May 2026', owner: 'Dr. Vance' },
          { id: 'SOP-CL-002', title: 'Medication Administration & Documentation', cat: 'Clinical', version: 'v2.4', reviewed: 'Apr 2026', owner: 'M. Sterling' },
          { id: 'SOP-CL-003', title: 'Wound Care & Treatment Procedures', cat: 'Clinical', version: 'v1.8', reviewed: 'Mar 2026', owner: 'S. Caldwell' },
          { id: 'SOP-AD-001', title: 'Referral Processing & Authorization', cat: 'Administrative', version: 'v2.0', reviewed: 'May 2026', owner: 'Admin Team' },
          { id: 'SOP-AD-002', title: 'Insurance Verification Workflow', cat: 'Administrative', version: 'v1.5', reviewed: 'Apr 2026', owner: 'Billing Dept' },
          { id: 'SOP-IT-001', title: 'System Access Request & Provisioning', cat: 'IT', version: 'v2.2', reviewed: 'May 2026', owner: 'IT Security' },
          { id: 'SOP-IT-002', title: 'Incident Response & Breach Notification', cat: 'IT', version: 'v1.3', reviewed: 'Mar 2026', owner: 'IT Security' },
          { id: 'SOP-CO-001', title: 'Evidence Collection & Chain of Custody', cat: 'Compliance', version: 'v2.1', reviewed: 'May 2026', owner: 'QA Lead' },
          { id: 'SOP-CO-002', title: 'Internal Audit Execution Procedures', cat: 'Compliance', version: 'v1.7', reviewed: 'Apr 2026', owner: 'QA Lead' },
          { id: 'SOP-CL-004', title: 'Discharge Planning & Transition of Care', cat: 'Clinical', version: 'v2.0', reviewed: 'May 2026', owner: 'S. Jenkins' },
        ].map((sop) => (
          <div key={sop.id} className="v3-invisible-glare" style={{
            display: 'flex', alignItems: 'center', padding: '14px 16px', gap: '16px',
            borderBottom: `1px solid rgba(255,255,255,0.06)`, cursor: 'pointer',
          }}>
            <span style={{ flex: 0.5, fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', color: V3.tealLight }}>{sop.id}</span>
            <span style={{ flex: 2, fontSize: '14px', fontWeight: 500, color: V3.textPrimary }}>{sop.title}</span>
            <span style={{ flex: 1, fontSize: '12px', color: V3.textSecondary }}>{sop.cat}</span>
            <span style={{ flex: 1, fontSize: '12px', fontFamily: 'monospace', color: V3.textTertiary }}>{sop.version}</span>
            <span style={{ flex: 1, fontSize: '12px', color: V3.textTertiary }}>{sop.reviewed}</span>
            <span style={{ flex: 1, fontSize: '12px', color: V3.textSecondary }}>{sop.owner}</span>
          </div>
        ))}
      </div>
    </div>
  );

PAGE 23: TRAINING MATERIALS
case 'training-materials':
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <PlayCircle size={16} color={V3.orangeLight} style={{ filter: 'drop-shadow(0 0 4px rgba(255, 160, 89, 0.65))' }} />
          <span style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
            color: V3.orangeLight,
            textShadow: '0 0 10px rgba(255, 160, 89, 0.95), 0 0 20px rgba(255, 160, 89, 0.45)'
          }}>
            LEARNING & DEVELOPMENT
          </span>
        </div>
        <h1 style={{
          fontSize: '28px', fontWeight: 600, margin: 0, letterSpacing: '-0.5px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #A8B0C0 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Training Materials
        </h1>
        <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>
          Courses, modules, and certifications for clinical and administrative staff.
        </p>
      </div>

      {/* Progress Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'TOTAL COURSES', value: '18' },
          { label: 'COMPLETED', value: '6', color: V3.tealLight },
          { label: 'IN PROGRESS', value: '4' },
          { label: 'MANDATORY DUE', value: '3', color: V3.tealLight },
        ].map((kpi) => (
          <div key={kpi.label} className="v3-invisible-glare" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: V3.textTertiary, letterSpacing: '0.4px' }}>{kpi.label}</span>
            <span style={{ fontSize: '22px', fontWeight: 600, color: kpi.color || V3.textPrimary }}>{kpi.value}</span>
          </div>
        ))}
      </div>

      {/* Course Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {[
          { title: 'HIPAA Privacy & Security Fundamentals', type: 'Mandatory', duration: '2h 30m', modules: 8, completed: 8, status: 'Complete' },
          { title: 'Infection Control in Home Health', type: 'Mandatory', duration: '1h 45m', modules: 6, completed: 6, status: 'Complete' },
          { title: 'Patient Rights & Informed Consent', type: 'Mandatory', duration: '1h 15m', modules: 5, completed: 3, status: 'In Progress' },
          { title: 'CES Board Operations Training', type: 'Recommended', duration: '2h 00m', modules: 7, completed: 4, status: 'In Progress' },
          { title: 'eCIgn Digital Signatures Workflow', type: 'Recommended', duration: '45m', modules: 4, completed: 0, status: 'Not Started' },
          { title: 'Emergency Preparedness Procedures', type: 'Mandatory', duration: '1h 30m', modules: 6, completed: 6, status: 'Complete' },
          { title: 'Clinical Documentation Best Practices', type: 'Recommended', duration: '1h 00m', modules: 5, completed: 2, status: 'In Progress' },
          { title: 'Workplace Safety & Ergonomics', type: 'Optional', duration: '45m', modules: 3, completed: 0, status: 'Not Started' },
          { title: 'Brad AI Copilot — Advanced Queries', type: 'Optional', duration: '30m', modules: 3, completed: 3, status: 'Complete' },
        ].map((course) => (
          <div key={course.title} className="v3-invisible-glare" style={{
            padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px',
            border: `1px solid rgba(255,255,255,0.15)`, cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{
                fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px',
                padding: '4px 10px', borderRadius: '6px',
                background: course.type === 'Mandatory' ? 'rgba(0,209,193,0.1)' : 'rgba(255,255,255,0.04)',
                color: course.type === 'Mandatory' ? V3.tealLight : V3.textTertiary,
              }}>
                {course.type}
              </span>
              <span style={{
                fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                color: course.status === 'Complete' ? V3.tealLight : course.status === 'In Progress' ? V3.textSecondary : V3.textTertiary,
              }}>
                {course.status}
              </span>
            </div>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: V3.textPrimary, margin: 0, lineHeight: 1.3 }}>{course.title}</h4>
            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: V3.textTertiary }}>
              <span>{course.duration}</span>
              <span>{course.modules} modules</span>
            </div>
            {/* Progress Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', color: V3.textTertiary }}>{course.completed}/{course.modules} modules</span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: V3.tealLight }}>{Math.round((course.completed / course.modules) * 100)}%</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${(course.completed / course.modules) * 100}%`, height: '100%', background: V3.tealLight, borderRadius: '2px' }} />
              </div>
            </div>
            <button className="btn-smooth-hover" style={{
              padding: '8px 16px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', alignSelf: 'flex-start',
              background: course.status === 'Complete' ? 'transparent' : 'rgba(0,209,193,0.1)',
              border: `1px solid ${course.status === 'Complete' ? V3.borderHighlight : V3.tealLight}`,
              color: course.status === 'Complete' ? V3.textSecondary : V3.tealLight,
            }}>
              {course.status === 'Complete' ? 'Review' : course.status === 'In Progress' ? 'Continue' : 'Start'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

PAGE 24: HELP CENTER
case 'help-center':
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <HelpCircle size={16} color={V3.orangeLight} style={{ filter: 'drop-shadow(0 0 4px rgba(255, 160, 89, 0.65))' }} />
          <span style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
            color: V3.orangeLight,
            textShadow: '0 0 10px rgba(255, 160, 89, 0.95), 0 0 20px rgba(255, 160, 89, 0.45)'
          }}>
            SUPPORT
          </span>
        </div>
        <h1 style={{
          fontSize: '28px', fontWeight: 600, margin: 0, letterSpacing: '-0.5px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #A8B0C0 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Help Center
        </h1>
        <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>
          Frequently asked questions, support resources, and contact information.
        </p>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: '20px', padding: '14px 20px', maxWidth: '500px' }}>
        <Search size={18} color={V3.textTertiary} />
        <input placeholder="How can we help you?" style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', width: '100%', fontSize: '14px' }} />
      </div>

      {/* Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { icon: LayoutDashboard, title: 'Dashboard Guide', desc: 'Learn how to navigate the agency view and My Planner workspace.' },
          { icon: ShieldCheck, title: 'CES Operations', desc: 'Understanding sprint execution, task workflows, and evidence linking.' },
          { icon: FileText, title: 'Policy Management', desc: 'Creating, reviewing, and publishing enterprise compliance policies.' },
          { icon: FolderOpen, title: 'Evidence Locker', desc: 'Uploading artifacts, chain of custody, and audit trail management.' },
          { icon: Bot, title: 'Brad AI Assistant', desc: 'Getting the most out of your compliance AI copilot.' },
          { icon: Settings, title: 'System Settings', desc: 'Account configuration, roles, permissions, and integrations.' },
        ].map((item) => (
          <div key={item.title} className="v3-invisible-glare" style={{
            padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px',
            border: `1px solid rgba(255,255,255,0.15)`, cursor: 'pointer',
          }}>
            <item.icon size={24} color={V3.tealLight} />
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: V3.textPrimary, margin: 0 }}>{item.title}</h4>
            <p style={{ fontSize: '13px', color: V3.textSecondary, margin: 0, lineHeight: 1.4 }}>{item.desc}</p>
            <span style={{ fontSize: '11px', fontWeight: 600, color: V3.tealLight, marginTop: 'auto' }}>Learn More →</span>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: V3.tealLight, margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Frequently Asked Questions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { q: 'How do I reset my password?', a: 'Navigate to the login page and click "Forgot Password". Enter your email address to receive a reset link.' },
            { q: 'How do I attach evidence to a CES task?', a: 'Open the task from the CES Board, click "Attach Evidence", and select files from your device or the Evidence Locker.' },
            { q: 'Can I export reports to PDF?', a: 'Yes. Most data views include an "Export" button in the top-right corner. Select PDF format and your desired date range.' },
            { q: 'How do I create a new policy?', a: 'Navigate to Policy Library → click "+ New Policy" → select a domain → fill in the policy template → save as draft.' },
            { q: 'What browsers are supported?', a: 'CareIndeed is optimized for Chrome 90+, Firefox 88+, Safari 15+, and Edge 90+. Internet Explorer is not supported.' },
          ].map((faq, idx) => (
            <div key={idx} className="v3-invisible-glare" style={{
              padding: '16px 20px', border: `1px solid rgba(255,255,255,0.08)`, cursor: 'pointer',
            }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: V3.textPrimary, margin: 0 }}>{faq.q}</h4>
              <p style={{ fontSize: '13px', color: V3.textSecondary, margin: '8px 0 0 0', lineHeight: 1.5 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Support */}
      <div style={{
        padding: '20px 24px', background: 'rgba(0, 209, 193, 0.08)',
        border: `1px solid rgba(0, 209, 193, 0.33)`, borderRadius: '12px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
      }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: V3.textPrimary }}>Need more help?</div>
          <div style={{ fontSize: '12px', color: V3.textSecondary, marginTop: '2px' }}>Contact our support team for personalized assistance.</div>
        </div>
        <button className="btn-smooth-hover" style={{ padding: '10px 24px', background: V3.tealLight, border: 'none', color: '#000', fontSize: '12px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }}>
          Contact Support
        </button>
      </div>
    </div>
  );

PAGE 25: DEMO ENVIRONMENT
case 'demo':
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <PlayCircle size={16} color={V3.orangeLight} style={{ filter: 'drop-shadow(0 0 4px rgba(255, 160, 89, 0.65))' }} />
          <span style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
            color: V3.orangeLight,
            textShadow: '0 0 10px rgba(255, 160, 89, 0.95), 0 0 20px rgba(255, 160, 89, 0.45)'
          }}>
            SANDBOX
          </span>
        </div>
        <h1 style={{
          fontSize: '28px', fontWeight: 600, margin: 0, letterSpacing: '-0.5px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #A8B0C0 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Demo Environment
        </h1>
        <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>
          Interactive sandbox with synthetic data. Explore all system features without affecting production.
        </p>
      </div>

      {/* Demo Status Banner */}
      <div style={{
        padding: '20px 24px', background: 'rgba(0, 209, 193, 0.08)',
        border: `1px solid rgba(0, 209, 193, 0.33)`, borderRadius: '12px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <ShieldCheck size={20} color={V3.tealLight} />
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: V3.textPrimary }}>Demo Mode Active</div>
          <div style={{ fontSize: '12px', color: V3.textSecondary }}>All data is synthetic. Changes will not persist between sessions. HIPAA-safe environment.</div>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: V3.tealLight, margin: '0 0 16px 0', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Quick Launch Scenarios</h3>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { title: 'Full Compliance Audit', desc: 'Simulate a CMS survey preparation workflow with 445 controls, evidence gaps, and remediation sprints.', duration: '~15 min', modules: ['Dashboard', 'CES Board', 'Evidence Center'] },
            { title: 'Policy Lifecycle Walk-Through', desc: 'Create a new policy, route through review, gain approval, publish, and link evidence.', duration: '~10 min', modules: ['Policy Library', 'Forms', 'Evidence Center'] },
            { title: 'Clinician Onboarding Flow', desc: 'Experience the full 4-gate onboarding pipeline from documentation through final clearance.', duration: '~8 min', modules: ['Onboarding', 'Training', 'Forms'] },
            { title: 'Incident Response Drill', desc: 'Report a safety incident, document findings, attach evidence, and route through QAPI review.', duration: '~12 min', modules: ['Forms', 'Evidence Center', 'CES Board'] },
            { title: 'Sprint Execution Cycle', desc: 'Execute a full CES sprint: assign tasks, mark progress, attach evidence, close obligations.', duration: '~20 min', modules: ['CES Board', 'My Planner', 'Evidence Center'] },
            { title: 'Brad AI Compliance Query', desc: 'Ask Brad about CMS regulations, taxonomy structures, and get AI-powered compliance guidance.', duration: '~5 min', modules: ['Brad AI Copilot'] },
          ].map((scenario) => (
            <div key={scenario.title} className="v3-invisible-glare" style={{
              padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px',
              border: `1px solid rgba(255,255,255,0.15)`, cursor: 'pointer',
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: V3.textPrimary, margin: 0 }}>{scenario.title}</h4>
              <p style={{ fontSize: '13px', color: V3.textSecondary, margin: 0, lineHeight: 1.4, flex: 1 }}>{scenario.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {scenario.modules.map((mod) => (
                  <span key={mod} style={{ fontSize: '10px', fontWeight: 600, color: V3.textSecondary, padding: '3px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }}>{mod}</span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${V3.borderDefault}`, paddingTop: '12px' }}>
                <span style={{ fontSize: '12px', color: V3.textTertiary }}>{scenario.duration}</span>
                <button className="btn-smooth-hover" style={{
                  padding: '8px 16px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer',
                  background: 'rgba(0,209,193,0.1)', border: `1px solid ${V3.tealLight}`, color: V3.tealLight,
                }}>
                  Launch →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

PAGE 26: AUDIT TRAIL (under Evidence)
case 'audit-trail':
  return (
    <div className="animate-butter-shift" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ borderBottom: `1px solid ${V3.borderDefault}`, paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <FileSearch size={16} color={V3.orangeLight} style={{ filter: 'drop-shadow(0 0 4px rgba(255, 160, 89, 0.65))' }} />
          <span style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
            color: V3.orangeLight,
            textShadow: '0 0 10px rgba(255, 160, 89, 0.95), 0 0 20px rgba(255, 160, 89, 0.45)'
          }}>
            CHAIN OF CUSTODY
          </span>
        </div>
        <h1 style={{
          fontSize: '28px', fontWeight: 600, margin: 0, letterSpacing: '-0.5px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #A8B0C0 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Audit Trail
        </h1>
        <p style={{ fontSize: '13px', color: V3.textSecondary, marginTop: '4px' }}>
          Immutable chronological record of all evidence actions, access events, and chain-of-custody transfers.
        </p>
      </div>

      {/* Filter + Export */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All Events', 'Upload', 'Access', 'Modify', 'Delete', 'Transfer', 'Signature'].map((tab, idx) => (
            <button key={tab} className="btn-smooth-hover" style={{
              padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '6px', cursor: 'pointer',
              background: idx === 0 ? 'rgba(0, 209, 193, 0.1)' : 'transparent',
              border: idx === 0 ? `1px solid ${V3.tealLight}` : '1px solid transparent',
              color: idx === 0 ? V3.textPrimary : V3.textSecondary,
            }}>
              {tab}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: V3.glass3, border: `1px solid ${V3.borderDefault}`, borderRadius: '20px', padding: '6px 14px', width: '220px' }}>
            <Search size={14} color={V3.textTertiary} />
            <input placeholder="Search audit log..." style={{ background: 'transparent', border: 'none', color: V3.textPrimary, outline: 'none', fontSize: '12px', width: '100%' }} />
          </div>
          <button className="btn-smooth-hover" style={{ padding: '8px 16px', background: 'transparent', border: `1px solid ${V3.borderHighlight}`, color: V3.textSecondary, fontSize: '12px', fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Audit Trail Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {[
          { timestamp: 'May 20, 2026 11:32 AM', action: 'Evidence Uploaded', user: 'Admin User', target: 'Fire Drill Log — Zone A (SA-WP-06)', type: 'Upload', hash: 'sha256:a1b2c3...f7e8' },
          { timestamp: 'May 20, 2026 11:15 AM', action: 'Document Signed', user: 'Dr. Evelyn Vance', target: 'Patient Admission Consent — M. Wilson', type: 'Signature', hash: 'sha256:d4e5f6...b9c0' },
          { timestamp: 'May 20, 2026 10:48 AM', action: 'Evidence Accessed', user: 'Maria Gonzales', target: 'Q1 QAPI Committee Minutes (QA-WP-01)', type: 'Access', hash: null },
          { timestamp: 'May 20, 2026 10:22 AM', action: 'Evidence Modified', user: 'David Cho', target: 'HIPAA Security Risk Assessment (IT-WP-21)', type: 'Modify', hash: 'sha256:g7h8i9...k1l2' },
          { timestamp: 'May 19, 2026 4:45 PM', action: 'Evidence Transferred', user: 'Admin User', target: 'Governing Body Minutes → Board Secretary', type: 'Transfer', hash: 'sha256:m3n4o5...p6q7' },
          { timestamp: 'May 19, 2026 3:20 PM', action: 'Evidence Uploaded', user: 'Sophia Caldwell', target: 'Clinician Competency Report — Q1', type: 'Upload', hash: 'sha256:r8s9t0...u1v2' },
          { timestamp: 'May 19, 2026 2:10 PM', action: 'Document Signed', user: 'Marcus Sterling', target: 'Missed Visit Form — J. Lee', type: 'Signature', hash: 'sha256:w3x4y5...z6a7' },
          { timestamp: 'May 18, 2026 5:00 PM', action: 'Evidence Deleted', user: 'Admin User', target: 'Duplicate Upload — Training Cert (HR-WP-15)', type: 'Delete', hash: 'sha256:b8c9d0...e1f2' },
          { timestamp: 'May 18, 2026 11:30 AM', action: 'Evidence Accessed', user: 'Sarah Jenkins', target: 'Patient Satisfaction Survey Q1', type: 'Access', hash: null },
          { timestamp: 'May 17, 2026 9:15 AM', action: 'Evidence Uploaded', user: 'M. Sterling', target: 'Incident Report — Slip & Fall (SA-IR-024)', type: 'Upload', hash: 'sha256:g3h4i5...j6k7' },
        ].map((entry, idx) => (
          <div key={idx} className="v3-invisible-glare" style={{
            display: 'flex', alignItems: 'flex-start', padding: '14px 16px', gap: '16px',
            borderBottom: `1px solid rgba(255,255,255,0.06)`,
          }}>
            {/* Timestamp */}
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: V3.textTertiary, minWidth: '160px', flexShrink: 0 }}>{entry.timestamp}</span>

            {/* Type Badge */}
            <span style={{
              fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
              padding: '3px 8px', borderRadius: '4px', minWidth: '72px', textAlign: 'center', flexShrink: 0,
              background: entry.type === 'Delete' ? 'rgba(0,209,193,0.05)' : entry.type === 'Signature' ? 'rgba(0,209,193,0.1)' : 'rgba(255,255,255,0.04)',
              color: (entry.type === 'Delete' || entry.type === 'Signature') ? V3.tealLight : V3.textSecondary,
            }}>
              {entry.type}
            </span>

            {/* Details */}
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: V3.textPrimary, display: 'block' }}>{entry.action}</span>
              <span style={{ fontSize: '12px', color: V3.textSecondary, display: 'block', marginTop: '2px' }}>{entry.target}</span>
              {entry.hash && (
                <span style={{ fontSize: '10px', fontFamily: 'monospace', color: V3.textTertiary, display: 'block', marginTop: '4px' }}>{entry.hash}</span>
              )}
            </div>

            {/* User */}
            <span style={{ fontSize: '12px', color: V3.textSecondary, minWidth: '120px', flexShrink: 0 }}>{entry.user}</span>
          </div>
        ))}
      </div>
    </div>
  );


That's Batch 2 complete. Every remaining route in the sidebar now has a full V3 Veil Glass page view:

#	Route	Status
16	domain-library	✅
17	referring-physicians	✅
18	visit-schedule	✅
19	missed-visits	✅
20	hubstaff	✅
21	user-guides	✅
22	sop-library	✅
23	training-materials	✅
24	help-center	✅
25	demo	✅
26	audit-trail	✅

Zero routes hit the default fallback anymore. Every single sidebar link renders a fully skinned, data-rich V3 Veil Glass page. All tokens locked, all transitions mapped, all hover physics applied. 🎯

Want me to do a Batch 3 for the login page (standalone, outside shell) and the form viewer/signing workspace?

4m 32s
·
12:18 PM




A
Claude Opus 4.6