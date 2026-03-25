import React from 'react'
import SoftAurora from './SoftAurora.jsx'

export default function SoftAuroraWrapper() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <SoftAurora
            speed={0.033}
          scale={0.9}
          brightness={1.46}
          color1="#ef6c01"
          color2="#195b9a"
          noiseFrequency={1.5}
          noiseAmplitude={6}
          bandHeight={0.5}
          bandSpread={0.8}
          octaveDecay={0.15}
          layerOffset={0.55}
          colorSpeed={3.7}
          enableMouseInteraction
          mouseInfluence={0.15}
        />
      </div>
    </div>
  )
}
