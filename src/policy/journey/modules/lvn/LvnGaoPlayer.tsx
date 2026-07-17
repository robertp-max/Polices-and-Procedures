import React from 'react';

export interface LvnGaoPage {
  id: string | number;
  title: string;
}

interface LvnGaoPlayerProps<Page extends LvnGaoPage> {
  pages: Page[];
  pageIndex: number;
  onSelectPage: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  nextLabel: string;
  renderLeft: (page: Page) => React.ReactNode;
  renderRight: (page: Page) => React.ReactNode;
}

const theme = {
  primary: '#007970',
  primaryDark: '#004142',
  primaryLight: '#E5FEFF',
  accent: '#C74601',
  border: '#E5E4E3',
  bg: '#FAFBF8',
  text: '#524C4B',
  muted: '#8A8684',
};

export function LvnGaoPlayer<Page extends LvnGaoPage>({
  pages,
  pageIndex,
  onSelectPage,
  onPrevious,
  onNext,
  nextLabel,
  renderLeft,
  renderRight,
}: LvnGaoPlayerProps<Page>) {
  const page = pages[pageIndex];

  return (
    <div style={shellContainer}>
      <header style={shellHeaderStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
            <div style={{ display: 'flex', minWidth: 'max-content', alignItems: 'center', gap: 8 }}>
              {pages.map((p, i) => {
                const active = pageIndex === i;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectPage(i)}
                    title={p.title}
                    style={{
                      display: 'inline-flex',
                      maxWidth: 220,
                      alignItems: 'center',
                      gap: 8,
                      borderRadius: 9999,
                      border: `1px solid ${active ? theme.primary : theme.border}`,
                      background: active ? theme.primary : '#fff',
                      color: active ? '#fff' : '#524C4B',
                      padding: '8px 12px',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: active ? '0 8px 18px rgba(0,121,112,0.18)' : 'none',
                      transition: 'all 0.15s',
                      fontFamily: 'inherit',
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: active ? '#FF6A1A' : '#C9C6C5',
                      }}
                    />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {i + 1}. {p.title.split(' — ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.history.back()}
            style={{
              flexShrink: 0,
              borderRadius: 9999,
              border: `1px solid ${theme.border}`,
              background: '#fff',
              padding: '8px 16px',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: theme.accent,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Save &amp; Exit
          </button>
        </div>
      </header>

      <main className="lvn-gao-workspace" style={{ flex: 1, minHeight: 0, display: 'flex', gap: 20, padding: 0 }}>
        <aside className="lvn-gao-left" style={leftPanelStyle}>
          <div style={{ marginBottom: 12, flexShrink: 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: theme.primary,
              }}
            >
              Content
            </div>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: 4 }}>
            <div style={lessonBadgeStyle}>
              Lesson {pageIndex + 1} of {pages.length}
            </div>
            {renderLeft(page)}
          </div>
        </aside>

        <section className="lvn-gao-right" style={rightPanelStyle}>
          <div className="lvn-gao-right-content" style={rightContentStyle}>
            {renderRight(page)}
          </div>
        </section>
      </main>

      <footer style={shellFooterStyle}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <button
            type="button"
            onClick={onPrevious}
            disabled={pageIndex === 0}
            style={{
              borderRadius: 8,
              border: `1px solid ${theme.border}`,
              background: '#fff',
              padding: '12px 20px',
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: '#524C4B',
              cursor: pageIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: pageIndex === 0 ? 0.4 : 1,
              fontFamily: 'inherit',
            }}
          >
            Previous Lesson
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: theme.primary,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 10px 24px rgba(0,121,112,0.18)',
                border: `1px solid ${theme.primary}`,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 16, marginLeft: 2 }}>▶</span>
            </div>
            <div
              style={{
                borderRadius: 9999,
                border: `1px solid ${theme.border}`,
                background: theme.bg,
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: 700,
                color: '#524C4B',
              }}
            >
              00:00 / 00:00
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: theme.muted }}>
              Lesson {pageIndex + 1} of {pages.length}
            </div>
          </div>

          <button type="button" onClick={onNext} style={nextButtonStyle}>
            {nextLabel}
          </button>
        </div>
      </footer>

      <style>{`
        @media (max-width: 1024px) {
          .lvn-gao-workspace {
            flex-direction: column !important;
            overflow-y: auto !important;
            padding: 16px !important;
          }
          .lvn-gao-left {
            min-width: 0 !important;
            flex: none !important;
          }
          .lvn-gao-right {
            aspect-ratio: 16 / 13 !important;
            width: 100% !important;
            flex: none !important;
            height: auto !important;
            align-self: auto !important;
          }
        }

        .lvn-gao-right-content > svg,
        .lvn-gao-right-content > div:has(svg) {
          flex: 1 1 auto !important;
          min-height: 0 !important;
          height: auto !important;
        }

        .lvn-gao-right-content svg {
          display: block !important;
          width: 100% !important;
          height: 100% !important;
          max-height: none !important;
        }
      `}</style>
    </div>
  );
}

const shellContainer: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 9998,
  display: 'flex',
  flexDirection: 'column',
  background: theme.bg,
  fontFamily: "'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  color: theme.text,
};

const shellHeaderStyle: React.CSSProperties = {
  flexShrink: 0,
  borderBottom: `1px solid ${theme.border}`,
  background: 'rgba(255,255,255,0.96)',
  padding: '12px 16px',
  boxShadow: '0 8px 28px rgba(31,28,27,0.05)',
};

const shellFooterStyle: React.CSSProperties = {
  flexShrink: 0,
  borderTop: `1px solid ${theme.border}`,
  background: '#fff',
  padding: '16px 24px',
  boxShadow: '0 -8px 28px rgba(31,28,27,0.05)',
};

const leftPanelStyle: React.CSSProperties = {
  flex: '1 1 auto',
  minWidth: 'calc(420px * 1.0777)',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 22,
  border: `1px solid ${theme.border}`,
  background: '#fff',
  padding: 20,
  boxShadow: '0 18px 50px rgba(31,28,27,0.08)',
  minHeight: 0,
};

const rightPanelStyle: React.CSSProperties = {
  flex: '0 0 auto',
  alignSelf: 'stretch',
  height: '100%',
  aspectRatio: '16 / 13',
  width: 'auto',
  maxWidth: '100%',
  minWidth: 0,
  borderRadius: 24,
  border: `1px solid ${theme.border}`,
  background: '#fff',
  padding: 20,
  boxShadow: '0 18px 50px rgba(31,28,27,0.08)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const rightContentStyle: React.CSSProperties = {
  flex: 1,
  minHeight: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};

const lessonBadgeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '4px 10px',
  borderRadius: 999,
  background: theme.primaryLight,
  color: theme.primary,
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 16,
  border: '1px solid #C4F4F5',
};

const nextButtonStyle: React.CSSProperties = {
  borderRadius: 8,
  background: theme.accent,
  padding: '12px 24px',
  border: 'none',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  color: '#fff',
  cursor: 'pointer',
  boxShadow: '0 10px 24px rgba(199,70,1,0.20)',
  fontFamily: 'inherit',
};
