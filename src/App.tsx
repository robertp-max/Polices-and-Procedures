import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ScaffoldPage } from './_scaffold/ScaffoldPage'

// Designless clean baseline router.
// Only a neutral scaffold renders. There are intentionally NO legacy routes
// (/library, /forms, /print, /appendix, etc.) — every path falls through to
// the placeholder so no old viewer/shell can resolve. V6 routes are added
// later, fresh.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScaffoldPage />} />
        <Route path="*" element={<ScaffoldPage />} />
      </Routes>
    </BrowserRouter>
  )
}
