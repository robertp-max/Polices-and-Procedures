import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Designless clean baseline bootstrap.
// No AuthProvider / ModalProvider / theme bootstrap — those belong to the
// future V6 implementation. This renders a neutral scaffold only.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
