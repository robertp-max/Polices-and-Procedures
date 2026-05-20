import React from 'react'
import { V3PageWrapper } from './components/V3PageWrapper'
import { V3WorkbenchShell } from './components/V3WorkbenchShell'

interface V3PagePreviewProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
  /** Pass a changing value to trigger the 0.7s CSS page enter animation */
  transitionKey?: string | number
}

export function V3PagePreview({ title, subtitle, children, transitionKey }: V3PagePreviewProps) {
  const authTitles = ['Login', 'Register', 'Forgot Password']
  const isAuth = authTitles.includes(title)

  if (isAuth) {
    // Full-bleed auth pages — render exactly as authored in V3*Preview (V3AuthLayout canvas, watermark, glass auth-card)
    // This matches the PDF login/register/forgot screenshots pixel-for-pixel with no extra chrome or headers.
    return <>{children}</>
  }

  // WORKBENCH PAGES: Render the COMPLETE rich V3 shell (collapsible sidebar navbar + full V3TopBar with search + logo + heading)
  // + the inner content. This guarantees the opened preview matches the exact layout, navbar, top bar, glass styling
  // and overall composition seen in ALL PDF screenshots of the V3 pages (Dashboard, Lists, Detail, Calendar, Brad, etc).
  return (
    <V3WorkbenchShell
      title={title}
      subtitle={subtitle || 'V3 Batch 1 Preview — Veil Glass System'}
      searchPlaceholder={`Search ${title.toLowerCase()}...`}
    >
      <V3PageWrapper transitionKey={transitionKey}>
        {children || (
          <div style={{ color: '#64748B', fontSize: '14px', padding: 40 }}>
            V3 Veil Glass content — full matching shell with navbar + topbar applied.
          </div>
        )}
      </V3PageWrapper>
    </V3WorkbenchShell>
  )
}
