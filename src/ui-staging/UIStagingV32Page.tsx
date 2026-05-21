import { useEffect } from 'react'
import './ui-staging.css'
import V3_2StagingApp from './V3_2StagingApp'

export function UIStagingV32Page() {
  useEffect(() => {
    const prevHtmlBg    = document.documentElement.style.backgroundColor
    const prevBodyBg    = document.body.style.backgroundColor
    const prevBodyColor = document.body.style.color
    const prevHtmlColor = document.documentElement.style.color
    const hadAttr       = document.documentElement.hasAttribute('data-v3-ui-staging-root')
    const prevTheme     = document.documentElement.getAttribute('data-theme')

    document.documentElement.removeAttribute('data-theme')
    document.documentElement.style.backgroundColor = '#05060A'
    document.documentElement.style.color = '#FFFFFF'
    document.body.style.backgroundColor = '#05060A'
    document.body.style.color = '#FFFFFF'
    document.documentElement.setAttribute('data-v3-ui-staging-root', 'true')

    return () => {
      document.documentElement.style.backgroundColor = prevHtmlBg
      document.documentElement.style.color = prevHtmlColor
      document.body.style.backgroundColor = prevBodyBg
      document.body.style.color = prevBodyColor
      if (!hadAttr) document.documentElement.removeAttribute('data-v3-ui-staging-root')
      if (prevTheme !== null) document.documentElement.setAttribute('data-theme', prevTheme)
    }
  }, [])

  return <V3_2StagingApp />
}
