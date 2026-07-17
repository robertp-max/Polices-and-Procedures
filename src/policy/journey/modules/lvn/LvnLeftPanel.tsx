import React from 'react';

export interface KeyPoint {
  icon: string;
  title: string;
  detail: string;
}

export interface SourceLabel {
  kind: string;
  text: string;
}

export interface LvnLeftPanelProps {
  pageNumber: number;
  totalPages: number;
  title: string;
  subtitle: string;
  narration: string[];
  keyPoints: KeyPoint[];
  clinicalTip: string;
  sourceLabels?: SourceLabel[];
  authorityNote?: string;
}

export function LvnLeftPanel({
  pageNumber,
  totalPages,
  title,
  subtitle,
  narration,
  keyPoints,
  clinicalTip,
  sourceLabels,
  authorityNote,
}: LvnLeftPanelProps) {
  // Styles based on Care Indeed brand guidelines
  const primaryColor = '#007970';
  const secondaryTextColor = '#524C4B';
  const labelColor = '#747470';
  
  // Format narration text: first paragraph is always shown as the primary intro,
  // subsequent paragraphs are placed in a details disclosure element.
  const hasMoreNarration = narration.length > 1;
  const introParagraph = narration[0] || '';
  const remainingParagraphs = narration.slice(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Eyebrow context */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color: primaryColor,
          background: '#E5FEFF',
          padding: '4px 10px',
          borderRadius: 999,
          border: '1px solid #C4F4F5'
        }}>
          Lesson {pageNumber} of {totalPages}
        </span>
      </div>

      {/* Lesson Heading */}
      <div>
        <h1 style={{
          margin: '0 0 8px',
          fontSize: 24,
          fontWeight: 700,
          lineHeight: 1.25,
          color: '#1F1C1B',
          fontFamily: "'Montserrat', sans-serif"
        }}>
          {title}
        </h1>
        <p style={{
          margin: 0,
          color: '#F06923',
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "'Roboto', sans-serif"
        }}>
          {subtitle}
        </p>
      </div>

      {/* Narrative Section */}
      <div style={{ fontSize: 15, lineHeight: 1.6, color: secondaryTextColor, fontFamily: "'Roboto', sans-serif" }}>
        <p style={{ margin: 0, marginBottom: hasMoreNarration ? 12 : 0 }}>
          {introParagraph}
        </p>

        {hasMoreNarration && (
          <details className="lvn-details" style={detailsStyle}>
            <summary className="lvn-summary" style={summaryStyle}>
              View Full Lesson Details
            </summary>
            <div style={detailsContentStyle}>
              {remainingParagraphs.map((para, idx) => (
                <p key={idx} style={{ margin: '0 0 12px' }}>
                  {para}
                </p>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* Key Points Grid */}
      {keyPoints.length > 0 && (
        <div>
          <h3 style={{
            margin: '10px 0 10px',
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: labelColor,
            fontFamily: "'Montserrat', sans-serif"
          }}>
            Key Clinical Actions
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12
          }}>
            {keyPoints.map((kp, idx) => (
              <div key={idx} style={keyPointCardStyle}>
                <span style={{ fontSize: 20, flexShrink: 0 }} role="img" aria-hidden="true">
                  {kp.icon}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1F1C1B', marginBottom: 2 }}>
                    {kp.title}
                  </div>
                  <div style={{ fontSize: 12, color: labelColor, lineHeight: 1.4 }}>
                    {kp.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Tip */}
      {clinicalTip && (
        <div style={clinicalTipStyle}>
          <div style={{
            fontSize: 10,
            fontWeight: 800,
            color: '#C74601',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 6,
            fontFamily: "'Montserrat', sans-serif"
          }}>
            Clinical Tip
          </div>
          <div style={{
            fontSize: 13,
            color: secondaryTextColor,
            lineHeight: 1.5,
            fontFamily: "'Roboto', sans-serif"
          }}>
            {clinicalTip}
          </div>
        </div>
      )}

      {/* Source References / Regulatory Rail */}
      {(authorityNote || (sourceLabels && sourceLabels.length > 0)) && (
        <div style={{
          marginTop: 8,
          paddingTop: 16,
          borderTop: '1px solid #E5E4E3',
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        }}>
          {authorityNote && (
            <div style={{ fontSize: 12, color: labelColor, lineHeight: 1.4 }}>
              <strong style={{ color: primaryColor }}>Authority map:</strong> {authorityNote}
            </div>
          )}
          
          {sourceLabels && sourceLabels.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {sourceLabels.map((s, idx) => (
                <span key={idx} style={sourceLabelStyle}>
                  {s.kind}: {s.text}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Collapsible Details Styles
const detailsStyle: React.CSSProperties = {
  border: '1px solid #E5E4E3',
  borderRadius: 12,
  background: '#FAFBF8',
  marginTop: 12,
  overflow: 'hidden',
  transition: 'background-color 0.2s',
};

const summaryStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontWeight: 700,
  fontSize: 13,
  color: '#007970',
  cursor: 'pointer',
  outline: 'none',
  userSelect: 'none',
};

const detailsContentStyle: React.CSSProperties = {
  padding: '16px',
  borderTop: '1px solid #E5E4E3',
  fontSize: 14,
  lineHeight: 1.6,
  color: '#524C4B',
  background: '#FFFFFF',
};

// Key Points Card Styles
const keyPointCardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #E5E4E3',
  borderRadius: 12,
  padding: 12,
  display: 'flex',
  gap: 10,
  alignItems: 'flex-start',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
};

// Clinical Tip Callout Box Styles
const clinicalTipStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 12,
  background: '#FAFBF8',
  border: '1px solid #E5E4E3',
  borderLeft: '4px solid #C74601',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
};

// Source Label Tags Styles
const sourceLabelStyle: React.CSSProperties = {
  fontSize: 10,
  padding: '4px 8px',
  borderRadius: 6,
  background: '#FAFBF8',
  border: '1px solid #E5E4E3',
  color: '#747470',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  display: 'inline-block',
};
