import { useEffect, useRef } from 'react'

type StreakPoint = { x: number; y: number; time: number }
type Streak = {
  x: number
  y: number
  dir: number
  speed: number
  opacity: number
  history: StreakPoint[]
  isHeadActive: boolean
  deathTime: number | null
}

/* ═══════════════════════════════════════════════════════════════
   TravelightBG — premium app backdrop
   - Dark theme  : CI-ION (maroon + gold "travelling light" canvas)
   - Light theme : Care Indeed — flat #FAFBF8 canvas matching the
     Workflow Library one-card aesthetic.
   ═══════════════════════════════════════════════════════════════ */

function TravelightCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streaksRef = useRef<Streak[]>([])
  const nextSpawnRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number

    const G = 40, STAY = 7000, FADE = 500, FADE_OUT = 1500, MAX = 2

    const gen = (forceDir: string | null = null): Streak => {
      const w = window.innerWidth, h = window.innerHeight
      let dir: number
      if (forceDir === 'v') dir = Math.random() < .5 ? 0 : 2
      else if (forceDir === 'h') dir = Math.random() < .5 ? 1 : 3
      else dir = Math.floor(Math.random() * 4)
      let x: number, y: number
      if (dir === 0) { x = Math.floor(Math.random() * (w / G)) * G; y = h + 150 }
      else if (dir === 1) { x = -150; y = Math.floor(Math.random() * (h / G)) * G }
      else if (dir === 2) { x = Math.floor(Math.random() * (w / G)) * G; y = -150 }
      else { x = w + 150; y = Math.floor(Math.random() * (h / G)) * G }
      return { x, y, dir, speed: (1.5 + Math.random() * 2) * 2.1613, opacity: 0.077, history: [] as StreakPoint[], isHeadActive: true, deathTime: null }
    }

    const resize = () => {
      canvas.width = window.innerWidth; canvas.height = window.innerHeight
      streaksRef.current = [gen('v'), gen('h')]
    }
    window.addEventListener('resize', resize); resize()

    const draw = () => {
      const now = Date.now(), w = canvas.width, h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const active = streaksRef.current.filter(s => s.isHeadActive)
      const hasV = active.some(s => s.dir === 0 || s.dir === 2)
      const hasH = active.some(s => s.dir === 1 || s.dir === 3)
      if (active.length < MAX && now >= nextSpawnRef.current) {
        if (!hasV) streaksRef.current.push(gen('v'))
        else if (!hasH) streaksRef.current.push(gen('h'))
        nextSpawnRef.current = now
      }

      ctx.save()
      for (let i = streaksRef.current.length - 1; i >= 0; i--) {
        const s = streaksRef.current[i]
        if (s.isHeadActive) {
          s.history.push({ x: s.x, y: s.y, time: now })
          if (s.dir === 0) s.y -= s.speed
          if (s.dir === 1) s.x += s.speed
          if (s.dir === 2) s.y += s.speed
          if (s.dir === 3) s.x -= s.speed
          const off = (s.dir === 0 && s.y < -400) || (s.dir === 1 && s.x > w + 400) || (s.dir === 2 && s.y > h + 400) || (s.dir === 3 && s.x < -400)
          if (off) { s.isHeadActive = false; s.deathTime = now }
        }
        s.history = s.history.filter((p: StreakPoint) => now - p.time < STAY + FADE)
        const gf = s.deathTime ? Math.max(0, 1 - (now - s.deathTime) / FADE_OUT) : 1
        if (!s.isHeadActive && (s.history.length === 0 || gf <= 0)) { streaksRef.current.splice(i, 1); continue }
        if (s.history.length > 1) {
          ctx.lineWidth = 0.77; ctx.lineCap = 'round'
          for (let j = 1; j < s.history.length; j++) {
            const p = s.history[j], age = now - p.time
            let a = s.opacity
            if (age > STAY) a = Math.max(0, s.opacity * (1 - (age - STAY) / FADE))
            ctx.strokeStyle = `rgba(255,193,7,${a * gf})`
            ctx.beginPath(); ctx.moveTo(s.history[j - 1].x, s.history[j - 1].y); ctx.lineTo(p.x, p.y); ctx.stroke()
          }
        }
      }
      ctx.restore()
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf) }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

interface TravelightBGProps {
  isLight?: boolean
}

export default function TravelightBG({ isLight = false }: TravelightBGProps) {
  const reduceMotion = prefersReducedMotion()
  if (isLight) {
    // ── Care Indeed light-mode background — flat canvas ──────────────
    // Clean #FAFBF8 canvas matching the Workflow Library one-card
    // aesthetic. No WebGL smoke, no orange gradient, no animation —
    // the shell card reads as a crisp enterprise content surface.
    return (
      <div
        data-shell-bg=""
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
          background: '#FAFBF8',
        }}
      />
    )
  }

  return (
    <div data-shell-bg="" aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden', transform: 'scale(1.0777)', transformOrigin: 'center center', filter: 'brightness(0.9223)' }}>
      <style>{`
        @keyframes tlRotate { from { transform: rotate(0deg) } to { transform: rotate(-360deg) } }
        @keyframes tlFloat { 0%,100%{transform:translate3d(0,0,0);opacity:.08} 25%{transform:translate3d(30px,-50px,0) scale(1.1);opacity:.14} 50%{transform:translate3d(-15px,-80px,0);opacity:.1} 75%{transform:translate3d(-40px,-30px,0) scale(1.05);opacity:.16} }
      `}</style>

      <div style={{ position: 'absolute', inset: 0, background: '#0A0202' }} />
      <div style={{ position: 'absolute', inset: 0, opacity: 0.98, background: 'radial-gradient(ellipse at top, #5D0E0E 0%, #310707 40%, #0A0202 100%)' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 800, borderRadius: '50%', background: '#007970', opacity: 0.04, filter: 'blur(180px)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to right, rgba(255,193,7,0.018) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,193,7,0.018) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      {!reduceMotion && <TravelightCanvas />}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: '75%', top: '75%', transform: 'translate(-50%,-50%)', width: 0, height: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.03, mixBlendMode: 'screen' as const }}>
          <img src={`${import.meta.env.BASE_URL}logomark-white.svg`} alt="" style={{ maxWidth: 'none', width: '104.75vw', height: '104.75vw', animation: reduceMotion ? 'none' : 'tlRotate 350s linear infinite', willChange: reduceMotion ? 'auto' : 'transform' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        </div>
      </div>
      {Array.from({ length: 18 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute', borderRadius: '50%', mixBlendMode: 'screen', pointerEvents: 'none',
          width: 1 + Math.random() * 2.5, height: 1 + Math.random() * 2.5,
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          background: Math.random() > .6 ? 'rgba(255,193,7,0.12)' : 'rgba(255,255,255,0.08)',
          boxShadow: `0 0 ${4 + Math.random() * 6}px ${Math.random() > .6 ? 'rgba(255,193,7,0.25)' : 'rgba(255,255,255,0.15)'}`,
          animation: reduceMotion ? 'none' : `tlFloat ${20 + Math.random() * 20}s infinite cubic-bezier(0.45,0,0.55,1) ${Math.random() * -30}s`,
        }} />
      ))}
    </div>
  )
}
