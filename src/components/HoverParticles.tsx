import React, { useRef, useEffect } from 'react'

const GRID_A = 50
const GRID_B = 120
const DOT_A = 1.0
const DOT_B = 1.5
const HOVER_RADIUS = 10
const STACKED_LAYER_COUNT = 7
const STACKED_LAYER_OPACITIES = [0.77, 0.61, 0.52, 0.43, 0.34, 0.25, 0.16]
// global parallax tuning
const PARALLAX_SCALE = 0.0081
// per-layer increment: 7x 7.7% => 0.077 * 7 = 0.539 (53.9% per layer)
const PER_LAYER_INCR = 0.077 * 7

export default function HoverParticles() {
  const ref = useRef<HTMLCanvasElement | null>(null)
  const mouse = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    let w = window.innerWidth
    let h = window.innerHeight
    const DPR = Math.max(1, window.devicePixelRatio || 1)

    function updateColsRows() {
      return {
        colsA: Math.ceil(w / GRID_A) + 1,
        rowsA: Math.ceil(h / GRID_A) + 1,
        colsB: Math.ceil(w / GRID_B) + 1,
        rowsB: Math.ceil(h / GRID_B) + 1,
      }
    }

    let { colsA, rowsA, colsB, rowsB } = updateColsRows()

    function resize() {
      w = window.innerWidth
      h = window.innerHeight
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      canvas.width = Math.round(w * DPR)
      canvas.height = Math.round(h * DPR)
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
      ;({ colsA, rowsA, colsB, rowsB } = updateColsRows())
    }

    resize()

    let rafId: number

    function draw() {
      ctx.clearRect(0, 0, w, h)

      // draw stacked layers only (no static base grids)
      for (let layer = 0; layer < STACKED_LAYER_COUNT; layer++) {
        const baseOpacity = STACKED_LAYER_OPACITIES[layer] ?? 0.2
        const layerMultiplier = 1 + PER_LAYER_INCR * layer

        // small-grid stacked layer with parallax
        for (let cy = 0; cy < rowsA; cy++) {
          for (let cx = 0; cx < colsA; cx++) {
            const baseX = cx * GRID_A
            const baseY = cy * GRID_A
            let drawX = baseX
            let drawY = baseY
            let d = Infinity
            if (mouse.current) {
              const dx = baseX - mouse.current.x
              const dy = baseY - mouse.current.y
              d = Math.hypot(dx, dy)
              const parallaxFactor = (d / 0.77) * 0.0033 * PARALLAX_SCALE * layerMultiplier
              drawX = baseX + dx * parallaxFactor
              drawY = baseY + dy * parallaxFactor
            }

            if (d < HOVER_RADIUS) {
              const t = (HOVER_RADIUS - d) / HOVER_RADIUS
              const r = DOT_A + t * 2
              ctx.beginPath()
              ctx.fillStyle = 'rgba(255,255,255,' + (baseOpacity * (0.6 + 0.4 * t)) + ')'
              ctx.arc(drawX, drawY, r, 0, Math.PI * 2)
              ctx.fill()
            } else {
              ctx.beginPath()
              ctx.fillStyle = 'rgba(255,255,255,' + (baseOpacity * 0.5) + ')'
              ctx.arc(drawX, drawY, DOT_A, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        }

        // large-grid stacked layer with parallax
        for (let cy = 0; cy < rowsB; cy++) {
          for (let cx = 0; cx < colsB; cx++) {
            const baseX = cx * GRID_B + 20
            const baseY = cy * GRID_B + 20
            let drawX = baseX
            let drawY = baseY
            let d = Infinity
            if (mouse.current) {
              const dx = baseX - mouse.current.x
              const dy = baseY - mouse.current.y
              d = Math.hypot(dx, dy)
              const parallaxFactor = (d / 0.77) * 0.0033 * PARALLAX_SCALE * layerMultiplier
              drawX = baseX + dx * parallaxFactor
              drawY = baseY + dy * parallaxFactor
            }

            if (d < HOVER_RADIUS) {
              const t = (HOVER_RADIUS - d) / HOVER_RADIUS
              const r = DOT_B + t * 2
              ctx.beginPath()
              ctx.fillStyle = 'rgba(255,255,255,' + (baseOpacity * (0.6 + 0.4 * t)) + ')'
              ctx.arc(drawX, drawY, r, 0, Math.PI * 2)
              ctx.fill()
            } else {
              ctx.beginPath()
              ctx.fillStyle = 'rgba(255,255,255,' + (baseOpacity * 0.2) + ')'
              ctx.arc(drawX, drawY, DOT_B, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        }
      }

      rafId = requestAnimationFrame(draw)
    }

    const move = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }
    }
    const leave = () => {
      mouse.current = null
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseleave', leave)
    window.addEventListener('resize', resize)

    draw()

    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseleave', leave)
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none', mixBlendMode: 'screen' }}
      aria-hidden
    />
  )
}
