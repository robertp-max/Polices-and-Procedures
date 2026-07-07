import React, { useState, useEffect } from 'react';

interface GAO001Scene01WelcomeDeskProps {
  onComplete?: () => void;
}

const brandStyles = `
  @keyframes mailBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.25; }
  }
  .mail-blink {
    animation: mailBlink 1.2s ease-in-out infinite;
  }

  @keyframes gentlePulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.015); }
  }
  .gentle-pulse {
    animation: gentlePulse 2.2s ease-in-out infinite;
  }

  @keyframes subtleBob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-1.5px); }
  }
  .subtle-bob {
    animation: subtleBob 3.5s ease-in-out infinite;
  }

  .desk-clickable {
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .desk-clickable:hover {
    filter: brightness(1.08) drop-shadow(0 2px 6px rgba(15, 91, 84, 0.25));
  }
  .desk-clickable:focus-visible {
    outline: 3px solid #0F5B54;
    outline-offset: 3px;
  }

  .hotspot-label {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.5px;
    fill: #1E3A3A;
  }

  .section-highlight {
    transition: all 0.15s ease;
    cursor: pointer;
  }
  .section-highlight:hover {
    background-color: #E8F5F3;
  }
  .section-highlight.viewed {
    background-color: #EEF4F3;
    border-color: #0F5B54;
  }

  /* A11y: respect reduced motion preference (premium calm, per spec) */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      animation-name: none !important;
    }
    .mail-blink, .gentle-pulse, .subtle-bob { animation: none !important; }
  }
`;

class SoftAudio {
  private ctx: AudioContext | null = null;
  private muted = false;

  private getCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setMuted(m: boolean) { this.muted = m; }

  play(type: 'mail' | 'click' | 'open' | 'chime' | 'complete') {
    if (this.muted) return;
    const ctx = this.getCtx();
    const now = ctx.currentTime;

    if (type === 'mail') {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.value = 0.03;
      g.gain.linearRampToValueAtTime(0.001, now + 0.6);
      o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.7);
    }

    if (type === 'click') {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 1200;
      g.gain.value = 0.02;
      g.gain.linearRampToValueAtTime(0.0001, now + 0.08);
      o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.1);
    }

    if (type === 'open') {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 660;
      g.gain.value = 0.025;
      g.gain.linearRampToValueAtTime(0.0001, now + 0.35);
      o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.4);
    }

    if (type === 'chime') {
      const notes = [523, 659, 784];
      notes.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.value = 0.015;
        g.gain.linearRampToValueAtTime(0.0001, now + 0.6 + i * 0.05);
        o.connect(g); g.connect(ctx.destination);
        o.start(now + i * 0.05); o.stop(now + 0.7 + i * 0.05);
      });
    }

    if (type === 'complete') {
      const notes = [523, 659, 784, 1046];
      notes.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.value = 0.02;
        g.gain.linearRampToValueAtTime(0.0001, now + 0.9 + i * 0.08);
        o.connect(g); g.connect(ctx.destination);
        o.start(now + i * 0.08); o.stop(now + 1.0 + i * 0.08);
      });
    }
  }
}

const audio = new SoftAudio();

export default function GAO001Scene01WelcomeDesk({ onComplete }: GAO001Scene01WelcomeDeskProps) {
  const [styleInjected, setStyleInjected] = useState(false);
  const [explored, setExplored] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'desk' | 'emailOnMonitor'>('desk');
  const [emailStep, setEmailStep] = useState(0);
  const [badgeZoomOpen, setBadgeZoomOpen] = useState(false);
  const [orientationZoomOpen, setOrientationZoomOpen] = useState(false);
  const [badgePhoto, setBadgePhoto] = useState<string | null>(null);
  const [orientationChecks, setOrientationChecks] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  // Camera for badge
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      setCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera error', err);
      alert('Camera access denied or not available. Using placeholder photo.');
      // Fallback placeholder (neutral, no personal names per audit)
      setBadgePhoto('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI0VFRjRGMzIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzBGNUI1NCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SEg8L3RleHQ+PC9zdmc+');
    }
  };

  const captureToBadge = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 120, 120);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setBadgePhoto(dataUrl);
      console.info('[GAO-001 Scene 1] badge_photo_captured');
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const closeBadgeZoom = () => {
    stopCamera();
    setBadgeZoomOpen(false);
  };

  useEffect(() => {
    if (styleInjected) return;
    const style = document.createElement('style');
    style.innerHTML = brandStyles;
    document.head.appendChild(style);
    setStyleInjected(true);
  }, [styleInjected]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audio.setMuted(next);
  };

  const markExplored = (id: string) => {
    if (!explored.includes(id)) {
      const next = [...explored, id];
      setExplored(next);
      console.info('[GAO-001 Scene 1] visual_object_explored', { object: id });
      audio.play('click');
    }
  };

  // Email now appears on the monitor
  const openEmailOnMonitor = () => {
    setViewMode('emailOnMonitor');
    setEmailStep(1);
    console.info('[GAO-001 Scene 1] visual_monitor_clicked');
    console.info('[GAO-001 Scene 1] visual_email_opened');
    audio.play('mail');
  };

  const nextEmailStep = () => {
    const nextStep = emailStep + 1;
    setEmailStep(nextStep);
    console.info('[GAO-001 Scene 1] visual_email_section_viewed', { step: nextStep });
    audio.play('chime');

    // Complete after 3 steps (intro + 2 key sections)
    if (nextStep >= 3 && !showComplete) {
      setTimeout(() => {
        setShowComplete(true);
        console.info('[GAO-001 Scene 1] visual_scene_completed');
        audio.play('complete');
        if (onComplete) onComplete();
      }, 500);
    }
  };

  const closeEmailOnMonitor = () => {
    setViewMode('desk');
    setEmailStep(0);
    audio.play('click');
  };

  // Badge zoom + camera
  const openBadgeZoom = () => {
    markExplored('badge');
    setBadgeZoomOpen(true);
    console.info('[GAO-001 Scene 1] visual_object_explored', { object: 'badge' });
    audio.play('click');
  };

  // Orientation checklist zoom
  const openOrientationZoom = () => {
    markExplored('checklist');
    setOrientationZoomOpen(true);
    console.info('[GAO-001 Scene 1] visual_object_explored', { object: 'orientation' });
    audio.play('click');
  };

  const toggleOrientationCheck = (item: string) => {
    setOrientationChecks(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
    audio.play('click');
  };

  const closeOrientationZoom = () => {
    setOrientationZoomOpen(false);
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#FAFBF8] overflow-hidden rounded-[18px] border border-[#E5E4E3] relative font-sans">
      {/* Top bar for this visual only */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#E5E4E3] bg-white z-20 shrink-0">
        <div className="text-xs font-bold text-[#007970] tracking-widest">SCENE 1 — FIRST DAY</div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="text-xs px-3 py-1 rounded border border-[#C4F4F5] hover:bg-[#E5FEFF] text-[#007970]"
            aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {isMuted ? '🔇 Muted' : '🔊 Sound'}
          </button>
          {showComplete && (
            <div className="text-xs font-bold px-3 py-1 bg-[#0F5B54] text-white rounded">Orientation Started</div>
          )}
        </div>
      </div>

      {/* Main SVG Desk Area */}
      <div className="flex-1 relative overflow-hidden bg-[#FDF8F3]" onClick={() => { if (viewMode === 'emailOnMonitor') closeEmailOnMonitor(); }}>
        <svg
          viewBox="0 0 1000 620"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          onClick={e => e.stopPropagation()}
        >
          <defs>
            {/* Richer gradients and shadows matching Scene 4 energy */}
            <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F8F1E9" />
              <stop offset="100%" stopColor="#EDE4D9" />
            </linearGradient>
            <linearGradient id="deskWood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C49A76" />
              <stop offset="50%" stopColor="#A57153" />
              <stop offset="100%" stopColor="#8B5E3C" />
            </linearGradient>
            <linearGradient id="monitorScreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8F0ED" />
              <stop offset="100%" stopColor="#C8D9D4" />
            </linearGradient>
            <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#1E3A3A" floodOpacity="0.18" />
            </filter>
          </defs>

          {/* Rich background - warm off-white with teal accents */}
          <rect width="1000" height="620" fill="#F8F1E9" />
          
          {/* Wall with subtle teal paneling (richer like Scene 4) */}
          <rect x="0" y="0" width="1000" height="260" fill="#EEF4F3" />
          <g opacity="0.12" stroke="#0F5B54" strokeWidth="12">
            <line x1="80" y1="40" x2="80" y2="240" />
            <line x1="220" y1="40" x2="220" y2="240" />
            <line x1="780" y1="40" x2="780" y2="240" />
            <line x1="920" y1="40" x2="920" y2="240" />
          </g>

          {/* Window (left, colorful like Scene 4) */}
          <g transform="translate(50, 35)">
            <rect width="210" height="170" fill="#2D3748" rx="8" />
            <rect x="8" y="8" width="194" height="154" fill="#A9D1E6" rx="4" />
            {/* Warm light */}
            <circle cx="170" cy="50" r="22" fill="#F4A261" opacity="0.7" />
            <path d="M 10 150 Q 60 90 110 150 T 200 150" fill="#4CAF50" opacity="0.6" />
            {/* Frame and panes */}
            <rect width="210" height="170" fill="none" stroke="#0F5B54" strokeWidth="10" rx="8" />
            <line x1="105" y1="8" x2="105" y2="162" stroke="#0F5B54" strokeWidth="4" />
            <line x1="8" y1="85" x2="202" y2="85" stroke="#0F5B54" strokeWidth="4" />
            {/* Curtains */}
            <path d="M -5 5 Q 30 80 5 165" fill="#E07A5F" opacity="0.85" />
            <path d="M 215 5 Q 180 80 205 165" fill="#E07A5F" opacity="0.85" />
          </g>

          {/* Desk - rich colorful wood with teal trim (Scene 4 energy) */}
          <g>
            {/* Main desk top */}
            <rect x="90" y="295" width="820" height="22" fill="url(#deskWood)" rx="4" filter="url(#softShadow)" />
            <rect x="90" y="295" width="820" height="6" fill="#D4A574" rx="2" />
            
            {/* Desk body / front */}
            <rect x="95" y="317" width="810" height="210" fill="#B89D7E" rx="6" />
            
            {/* Teal accent trim */}
            <rect x="95" y="317" width="810" height="8" fill="#0F5B54" rx="2" />

            {/* Desk legs - richer */}
            <rect x="125" y="527" width="18" height="93" fill="#5C4033" rx="3" />
            <rect x="857" y="527" width="18" height="93" fill="#5C4033" rx="3" />
          </g>

          {/* Chair */}
          <g>
            <rect x="230" y="255" width="95" height="135" fill="#0F5B54" rx="10" />
            <rect x="225" y="375" width="105" height="18" fill="#0A4742" rx="4" />
            <rect x="245" y="393" width="65" height="12" fill="#0F5B54" rx="2" />
          </g>

          {/* Clinician character (rich SVG like CoreValues benchmark) */}
          <g>
            {/* Legs / chair integration */}
            <rect x="255" y="400" width="18" height="55" fill="#3B5F5A" rx="4" />
            <rect x="285" y="400" width="18" height="55" fill="#3B5F5A" rx="4" />

            {/* Body - teal scrubs with detail */}
            <rect x="248" y="295" width="62" height="105" fill="#0F5B54" rx="14" />
            {/* Scrub pocket detail */}
            <rect x="265" y="340" width="28" height="22" fill="#0A4742" rx="3" />
            <line x1="279" y1="345" x2="279" y2="357" stroke="#EEF4F3" strokeWidth="1.5" />

            {/* Arms resting on desk */}
            <path d="M 248 310 Q 215 355 232 395" fill="none" stroke="#0F5B54" strokeWidth="16" strokeLinecap="round" />
            <path d="M 310 310 Q 345 355 328 395" fill="none" stroke="#0F5B54" strokeWidth="16" strokeLinecap="round" />

            {/* Hands */}
            <ellipse cx="232" cy="398" rx="7" ry="5" fill="#E8C9A0" />
            <ellipse cx="328" cy="398" rx="7" ry="5" fill="#E8C9A0" />

            {/* Head */}
            <circle cx="279" cy="275" r="20" fill="#E8C9A0" />
            
            {/* Hair - warm dark with style */}
            <path d="M 261 262 Q 279 248 297 262 Q 295 255 279 254 Q 263 255 261 262" fill="#3D2B1F" />
            <path d="M 265 268 Q 279 275 293 268" fill="#2A1F15" />

            {/* Face details - friendly */}
            <circle cx="271" cy="272" r="3" fill="#2D3748" />
            <circle cx="287" cy="272" r="3" fill="#2D3748" />
            <path d="M 273 282 Q 279 286 285 282" fill="none" stroke="#D97757" strokeWidth="1.8" strokeLinecap="round" />

            {/* ID lanyard hint on neck */}
            <rect x="275" y="290" width="8" height="12" fill="#F26D33" rx="1" />
          </g>

          {/* Monitor - prominent, colorful, with strong blinking mail */}
          <g onClick={openEmailOnMonitor} className="desk-clickable" role="button" aria-label="Click monitor to view email on screen">
            {/* Stand */}
            <rect x="415" y="410" width="70" height="14" fill="#0F5B54" rx="2" />
            <rect x="432" y="424" width="36" height="32" fill="#0A4742" rx="3" />

            {/* Bezel - rich navy teal */}
            <rect x="355" y="235" width="190" height="175" fill="#1E3A3A" rx="10" filter="url(#softShadow)" />
            
            {/* Inner bezel */}
            <rect x="365" y="245" width="170" height="155" fill="#0F5B54" rx="6" />

            {/* Screen */}
            <rect x="372" y="252" width="156" height="141" fill="#E8F0ED" rx="4" />

            {/* Screen content - desktop + prominent mail */}
            <rect x="380" y="260" width="140" height="90" fill="#FDF8F3" rx="2" />
            <text x="410" y="280" fontSize="9" fill="#0F5B54" fontWeight="bold">Welcome</text>
            <rect x="385" y="290" width="130" height="18" fill="#EEF4F3" rx="2" />

            {/* Blinking mail notification - strong orange/coral accent */}
            <g onClick={(e) => { e.stopPropagation(); openEmailOnMonitor(); }}>
              <rect x="480" y="265" width="32" height="24" fill="#F26D33" rx="4" className="mail-blink" />
              <text x="496" y="282" fontSize="13" fill="white" textAnchor="middle" fontWeight="bold">✉</text>
              <circle cx="505" cy="270" r="7" fill="#0F5B54" />
              <text x="505" y="273" fontSize="8" fill="#FDF8F3" textAnchor="middle" fontWeight="bold">1</text>
            </g>

            {/* Monitor brand accent */}
            <rect x="420" y="395" width="40" height="6" fill="#F26D33" rx="1" />
          </g>

          {/* Keyboard - richer with teal accents */}
          <g>
            <rect x="280" y="455" width="155" height="42" fill="#2D3748" rx="5" />
            <g fill="#4A5568">
              {Array.from({ length: 6 }).map((_, i) => (
                <rect key={i} x={290 + i * 24} y="462" width="18" height="14" rx="2" />
              ))}
            </g>
            <rect x="290" y="480" width="135" height="8" fill="#0F5B54" rx="1" />
          </g>

          {/* Mouse */}
          <g>
            <ellipse cx="470" cy="478" rx="13" ry="18" fill="#0F5B54" />
            <rect x="463" y="465" width="14" height="7" fill="#2D3748" rx="1" />
          </g>

          {/* Notebook / notes - colorful */}
          <g onClick={() => markExplored('notebook')} className="desk-clickable" role="button" aria-label="Desk notebook">
            <rect x="140" y="340" width="68" height="92" fill="#FDF8F3" rx="4" stroke="#0F5B54" strokeWidth="2" />
            <rect x="148" y="350" width="52" height="16" fill="#E07A5F" rx="2" />
            <text x="174" y="361" fontSize="7" fill="white" textAnchor="middle" fontWeight="bold">DAY 1</text>
            <line x1="150" y1="375" x2="198" y2="375" stroke="#CBD5E1" strokeWidth="1" />
            <line x1="150" y1="388" x2="198" y2="388" stroke="#CBD5E1" strokeWidth="1" />
            <line x1="150" y1="401" x2="198" y2="401" stroke="#CBD5E1" strokeWidth="1" />
            <line x1="150" y1="414" x2="198" y2="414" stroke="#CBD5E1" strokeWidth="1" />
          </g>

          {/* ID Badge - more detailed, supports photo */}
          <g onClick={openBadgeZoom} className="desk-clickable" role="button" aria-label="Employee ID badge - click to zoom and add your photo">
            <rect x="555" y="345" width="58" height="72" fill="#EEF4F3" rx="5" stroke="#0F5B54" strokeWidth="2.5" />
            {/* Photo area */}
            {badgePhoto ? (
              <image x="562" y="352" width="44" height="26" href={badgePhoto} preserveAspectRatio="xMidYMid slice" />
            ) : (
              <rect x="562" y="352" width="44" height="26" fill="#D1D5DB" rx="2" />
            )}
            <text x="584" y="385" fontSize="8" fill="#0F5B54" textAnchor="middle" fontWeight="bold">ALEX</text>
            <text x="584" y="394" fontSize="5" fill="#64748B" textAnchor="middle">RN • NEW HIRE</text>
            <circle cx="584" cy="405" r="6" fill="#F26D33" />
            <text x="584" y="408" fontSize="6" fill="white" textAnchor="middle" fontWeight="bold">CI</text>
          </g>

          {/* Orientation Checklist / Training Folder - coral accent like Scene 4 */}
          <g onClick={openOrientationZoom} className="desk-clickable" role="button" aria-label="Orientation checklist - click to zoom and complete items">
            <rect x="635" y="330" width="92" height="105" fill="#F8F1E9" rx="4" stroke="#0F5B54" strokeWidth="2" />
            <rect x="643" y="340" width="76" height="20" fill="#F26D33" rx="3" />
            <text x="681" y="353" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">ORIENTATION</text>
            <line x1="650" y1="370" x2="712" y2="370" stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1="650" y1="385" x2="712" y2="385" stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1="650" y1="400" x2="712" y2="400" stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1="650" y1="415" x2="712" y2="415" stroke="#CBD5E1" strokeWidth="1.5" />
            <text x="681" y="435" fontSize="7" fill="#0F5B54" textAnchor="middle">Checklist</text>
          </g>

          {/* Coffee mug - warm with steam */}
          <g onClick={() => markExplored('mug')} className="desk-clickable" role="button" aria-label="Coffee mug">
            <rect x="760" y="365" width="30" height="36" fill="#E07A5F" rx="4" />
            <rect x="790" y="372" width="7" height="16" fill="none" stroke="#0F5B54" strokeWidth="2.5" rx="2" />
            <ellipse cx="775" cy="365" rx="15" ry="4" fill="#C49A76" />
            {/* Steam */}
            <path d="M 768 355 Q 765 348 770 342" fill="none" stroke="#0F5B54" strokeWidth="1.5" opacity="0.5" className="subtle-bob" />
            <path d="M 775 355 Q 772 347 778 340" fill="none" stroke="#0F5B54" strokeWidth="1.5" opacity="0.4" className="subtle-bob" />
          </g>

          {/* Phone / small accessory */}
          <g>
            <rect x="830" y="360" width="22" height="38" fill="#2D3748" rx="4" />
            <rect x="833" y="365" width="16" height="22" fill="#E8F0ED" rx="1" />
          </g>

          {/* Hotspot labels (Scene 4 style - navy pills with orange) */}
          <g>
            <g transform="translate(140, 430)">
              <rect width="52" height="15" fill="#1E3A3A" rx="7" />
              <text x="26" y="11" className="hotspot-label" fill="#FDF8F3" textAnchor="middle">NOTES</text>
            </g>
            <g transform="translate(560, 425)">
              <rect width="48" height="15" fill="#1E3A3A" rx="7" />
              <text x="24" y="11" className="hotspot-label" fill="#FDF8F3" textAnchor="middle">BADGE</text>
            </g>
            <g transform="translate(660, 445)">
              <rect width="42" height="15" fill="#1E3A3A" rx="7" />
              <text x="21" y="11" className="hotspot-label" fill="#FDF8F3" textAnchor="middle">LIST</text>
            </g>
          </g>
        </svg>

        {/* Email appears ON THE MONITOR with Next button */}
        {viewMode === 'emailOnMonitor' && (
          <div 
            className="absolute left-[35%] top-[24%] w-[26%] h-[32%] bg-[#FDF8F3] border-2 border-[#0F5B54] rounded-md p-3 text-[8px] leading-tight overflow-auto z-30 shadow-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="font-bold text-[#0F5B54] text-[8px] mb-0.5">Welcome to Care Indeed Home Health Care</div>
            <div className="text-[#2D3748] mb-1">From: hr@careindeed.com</div>
            
            {emailStep >= 1 && (
              <div className="mb-1">
                Welcome to Care Indeed Home Health Care, Inc. You are joining a Medicare-certified, ACHC-accredited home health agency.
              </div>
            )}
            
            {emailStep >= 2 && (
              <div className="mb-1 text-[#0F5B54] font-medium">
                What You Will Learn: mission, values, documentation, escalation, survey readiness.
              </div>
            )}
            
            {emailStep >= 3 && (
              <div>
                Why it matters: Surveyors check understanding of agency mission and responsibilities.
              </div>
            )}

            <div className="mt-2 flex justify-between items-center">
              {emailStep < 3 ? (
                <button 
                  onClick={nextEmailStep}
                  className="text-[7px] bg-[#F26D33] text-white px-2 py-0.5 rounded hover:bg-[#E05922]"
                >
                  Next →
                </button>
              ) : (
                <div className="text-[7px] text-[#0F5B54] font-bold">Email read • Ready</div>
              )}
              <button onClick={closeEmailOnMonitor} className="text-[8px] text-[#64748B] hover:text-[#0F5B54]">✕</button>
            </div>
          </div>
        )}

        {/* Badge Zoom Modal - camera + photo on badge */}
        {badgeZoomOpen && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={closeBadgeZoom}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between mb-4">
                <h3 className="font-bold text-[#0F5B54]">Clinician ID Badge</h3>
                <button onClick={closeBadgeZoom} className="text-xl">×</button>
              </div>

              {/* Zoomed badge visual */}
              <div className="mx-auto w-48 h-60 border-2 border-[#0F5B54] rounded-xl p-3 bg-[#EEF4F3] mb-4 relative">
                <div className="text-center text-xs font-bold text-[#0F5B54] mb-1">CARE INDEED</div>
                <div className="w-full h-24 bg-gray-200 rounded mb-2 overflow-hidden relative">
                  {badgePhoto ? (
                    <img src={badgePhoto} alt="Your photo on badge" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#64748B] text-xs">Photo Area</div>
                  )}
                </div>
                <div className="text-center">
                  <div className="font-bold">HH</div>
                  <div className="text-xs">RN • NEW HIRE</div>
                </div>
                <div className="absolute bottom-2 right-2 text-[8px] bg-[#F26D33] text-white px-1 rounded">CI</div>
              </div>

              {/* Camera controls */}
              <div className="space-y-2">
                {!badgePhoto && (
                  <button 
                    onClick={startCamera}
                    className="w-full py-2 bg-[#0F5B54] text-white rounded font-bold text-sm"
                  >
                    Turn Camera On
                  </button>
                )}

                {cameraActive && (
                  <div>
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded border" />
                    <button 
                      onClick={captureToBadge}
                      className="mt-2 w-full py-2 bg-[#F26D33] text-white rounded font-bold text-sm"
                    >
                      Capture & Put on Badge
                    </button>
                  </div>
                )}

                {badgePhoto && (
                  <div className="text-center text-sm text-[#0F5B54]">Photo added to your badge! ✓</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Orientation Zoom - checklist */}
        {orientationZoomOpen && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={closeOrientationZoom}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-[#0F5B54] text-lg mb-1">Orientation Checklist</h3>
              <div className="text-xs text-[#64748B] mb-4">Day 1 • GAO-001</div>

              <div className="space-y-2 text-sm">
                {[
                  "Agency Mission & Values",
                  "Medicare-certified & ACHC-accredited standards",
                  "Documentation requirements",
                  "Escalation & reporting protocols",
                  "Survey readiness basics"
                ].map((item, idx) => {
                  const key = `item-${idx}`;
                  const checked = !!orientationChecks[key];
                  return (
                    <div 
                      key={key}
                      onClick={() => toggleOrientationCheck(key)}
                      className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-[#EEF4F3]"
                    >
                      <div className={`w-4 h-4 border rounded flex items-center justify-center text-xs ${checked ? 'bg-[#0F5B54] text-white border-[#0F5B54]' : 'border-[#64748B]'}`}>
                        {checked ? '✓' : ''}
                      </div>
                      <span>{item}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 text-xs text-center text-[#64748B]">Complete the checklist items above</div>
            </div>
          </div>
        )}

        {/* Completion Banner */}
        {showComplete && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#0F5B54] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg z-50 flex items-center gap-2">
            Scene Practice Complete — Ready for Next Scene
          </div>
        )}
      </div>

      {/* Right panel support cards - richer styling */}
      <div className="border-t border-[#E5E4E3] bg-white p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs z-10 shrink-0">
        <div className="rounded-xl border border-[#0F5B54]/20 bg-[#FDF8F3] p-3">
          <div className="font-bold text-[#0F5B54] mb-1 tracking-wide">Key Takeaway</div>
          <div className="text-[#2D3748]">Orientation is the first step in safe, compliant home health practice.</div>
        </div>
        <div className="rounded-xl border border-[#0F5B54]/20 bg-[#FDF8F3] p-3">
          <div className="font-bold text-[#0F5B54] mb-1 tracking-wide">Why It Matters</div>
          <div className="text-[#2D3748]">Surveyors and reviewers may ask whether staff understand the agency’s mission, role expectations, reporting duties, and patient-centered responsibilities.</div>
        </div>
        <div className="rounded-xl border border-[#0F5B54]/20 bg-[#FDF8F3] p-3">
          <div className="font-bold text-[#0F5B54] mb-1 tracking-wide">Completion Evidence</div>
          <div className="text-[#2D3748]">This page contributes to GAO-001 module progress. Full module completion and post-test are required for training completion.</div>
        </div>
        <div className="rounded-xl border border-[#0F5B54]/20 bg-[#FDF8F3] p-3">
          <div className="font-bold text-[#0F5B54] mb-1 tracking-wide">Reminder</div>
          <div className="text-[#2D3748]">P&amp;P acknowledgment is a separate assigned activity and is not completed by this scene.</div>
        </div>
      </div>
    </div>
  );
}
