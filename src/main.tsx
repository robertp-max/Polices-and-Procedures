import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/roboto/latin-300.css'
import '@fontsource/roboto/latin-500.css'
import '@fontsource/montserrat/latin-400.css'
import '@fontsource/montserrat/latin-500.css'
import '@fontsource/montserrat/latin-600.css'
import '@fontsource/montserrat/latin-700.css'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthProvider'
import { initTheme } from './v6/theme/timeOfDayTheme'

// Restore the saved Brad time-of-day theme (default: noon).
initTheme()

// Phase COG-1: AuthProvider supplies the real Cognito-backed session context
// (with the local-dev demo bypass preserved by ./auth/bypass.ts policy).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
