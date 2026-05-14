import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play, Pause, ChevronLeft, ChevronRight,
  Award, BookOpen, ArrowLeft, Volume2,
} from 'lucide-react';
import {
  M01_SLIDES,
  FINAL_TEST_Q_INDICES,
  PASS_THRESHOLD,
  type M01Slide,
} from '@/policy/journey/data/stagingM01Slides';

const BRAND = '#C74601';
const DOCK_H = 56;
const PLACEHOLDER_COUNT = 47;

function imgUrl(seed: number) {
  // Seeds 200+ map sequentially to placeholders 1-47, wrapping.
  // Seeds below 200 (splash, objectives) get a consistent low-index image.
  const idx = seed >= 200
    ? ((seed - 200) % PLACEHOLDER_COUNT) + 1
    : ((Math.abs(seed) % PLACEHOLDER_COUNT) || PLACEHOLDER_COUNT);
  return `/journey/m01/p${String(idx).padStart(2, '0')}.png`;
}

function extractDebriefTakeaways(text: string) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const pick = (n: string) => lines.find(l => l.toLowerCase().startsWith(n.toLowerCase()));
  return {
    safety: pick('4)') ?? 'Patient safety risk rises when communication or findings are not verified in sequence.',
    workflow: pick('5)') ?? 'Workflow discipline matters: right steps in wrong order can still create harm.',
    escalation: pick('7)') ?? 'Escalate unresolved clinical, communication, or conduct risk through supervisor pathways.',
    takeaway: pick('10)') ?? 'Defensible practice depends on objective documentation, closed-loop escalation, and verified understanding.',
  };
}

/* Slot style for each carousel offset (-2 … +2) */
function slotStyle(offset: number): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    borderRadius: '1.25rem',
    overflow: 'hidden',
    transition: 'left 0.45s ease-out, width 0.45s ease-out, height 0.45s ease-out, opacity 0.45s ease-out, filter 0.45s ease-out, border-color 0.45s ease-out, box-shadow 0.45s ease-out, transform 0.45s ease-out',
  };
  switch (offset) {
    case -2:
      return { ...base, left: '-72vw', width: '44vw', height: '76vh', transform: 'translateY(-50%) scale(0.9)', opacity: 0, zIndex: 1, filter: 'brightness(0.2) saturate(0.3)', border: '2px solid transparent', boxShadow: 'none' };
    case -1:
      return { ...base, left: '-24vw', width: '44vw', height: '76vh', transform: 'translateY(-50%)', opacity: 0.5, zIndex: 5, filter: 'brightness(0.45) saturate(0.7)', border: '2px solid rgba(239,68,68,0.78)', boxShadow: '0 18px 48px rgba(0,0,0,0.56), 0 0 0 1px rgba(239,68,68,0.4)' };
    case 0:
      return { ...base, left: '8vw', width: '84vw', height: '93vh', transform: 'translateY(-50%)', opacity: 1, zIndex: 20, filter: 'brightness(1) saturate(1)', borderRadius: '1.5rem', border: '2px solid rgba(251,191,36,0.96)', boxShadow: '0 30px 80px rgba(0,0,0,0.85), 0 0 0 1px rgba(251,191,36,0.45)' };
    case 1:
      return { ...base, left: '80vw', width: '44vw', height: '76vh', transform: 'translateY(-50%)', opacity: 0.5, zIndex: 5, filter: 'brightness(0.45) saturate(0.7)', border: '2px solid rgba(59,130,246,0.82)', boxShadow: '0 18px 48px rgba(0,0,0,0.56), 0 0 0 1px rgba(59,130,246,0.42)' };
    case 2:
      return { ...base, left: '128vw', width: '44vw', height: '76vh', transform: 'translateY(-50%) scale(0.9)', opacity: 0, zIndex: 1, filter: 'brightness(0.2) saturate(0.3)', border: '2px solid transparent', boxShadow: 'none' };
    default:
      return { ...base, left: offset < 0 ? '-100vw' : '150vw', width: '44vw', height: '76vh', transform: 'translateY(-50%)', opacity: 0, zIndex: 0 };
  }
}

/* Color tint overlay for prev / next cards */
function tintOverlay(offset: number): React.CSSProperties | null {
  if (offset === -1) return { background: 'linear-gradient(to top, rgba(220,38,38,0.24) 0%, rgba(220,38,38,0.12) 55%, rgba(220,38,38,0.05) 100%)' };
  if (offset === 0) return { background: 'linear-gradient(to top, rgba(250,204,21,0.10) 0%, rgba(250,204,21,0.02) 100%)' };
  if (offset === 1) return { background: 'linear-gradient(to top, rgba(37,99,235,0.24) 0%, rgba(37,99,235,0.12) 55%, rgba(37,99,235,0.05) 100%)' };
  return null;
}

/* ═══════════════════════════════════════════════════════════════════════ */
export function StagingM01Page() {
  const nav = useNavigate();

  const idToIndex = useMemo(() => {
    const map = new Map<string, number>();
    M01_SLIDES.forEach((s, i) => map.set(s.id, i));
    return map;
  }, []);

  const orderedIndices = useMemo(() => {
    const prologueIds = ['M01-S01', 'M01-S02', 'M01-S03', 'M01-S04'];
    const preHookIds = ['M01-PA-INTRO', 'M01-PA-Q1', 'M01-PA-D1', 'M01-PA-Q2', 'M01-PA-D2', 'M01-PA-Q3', 'M01-PA-D3'];
    const pinned = ['M01-SPLASH', 'M01-OBJ', ...prologueIds, ...preHookIds];
    const used = new Set<string>();
    const result: number[] = [];
    for (const id of pinned) {
      const idx = idToIndex.get(id);
      if (idx == null || used.has(id)) continue;
      used.add(id);
      result.push(idx);
    }
    M01_SLIDES.forEach((s, idx) => { if (!used.has(s.id)) result.push(idx); });
    return result;
  }, [idToIndex]);

  const [pos, setPos] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showNarration, setShowNarration] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [certName, setCertName] = useState('');

  const total = orderedIndices.length;
  const activeIdx = orderedIndices[pos] ?? 0;
  const slide = M01_SLIDES[activeIdx];

  const firstFinalTestIdx = FINAL_TEST_Q_INDICES[0] ?? M01_SLIDES.length - 3;
  const firstFinalPos = Math.max(0, orderedIndices.findIndex(i => M01_SLIDES[i].id === M01_SLIDES[firstFinalTestIdx]?.id));

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getContinuitySeed = useCallback((p: number, fallback?: number) => {
    const s = M01_SLIDES[orderedIndices[p]];
    if (!s) return fallback ?? 100;
    if (!['challenge', 'debrief', 'final-test'].includes(s.type)) return s.imgSeed ?? fallback ?? 100;
    for (let i = p - 1; i >= 0; i--) {
      const prior = M01_SLIDES[orderedIndices[i]];
      if (prior && (prior.type === 'content' || prior.type === 'educator-commentary' || prior.type === 'pre-assessment-intro'))
        return prior.imgSeed ?? fallback ?? 100;
    }
    return s.imgSeed ?? fallback ?? 100;
  }, [orderedIndices]);

  /* nav */
  const goNext = useCallback(() => {
    if (pos < total - 1) setPos(p => p + 1);
  }, [pos, total]);
  const goPrev = useCallback(() => {
    if (pos > 0) setPos(p => p - 1);
  }, [pos]);

  /* autoplay */
  useEffect(() => {
    if (!isPlaying) { if (timerRef.current) clearInterval(timerRef.current); return; }
    if ((slide.type === 'challenge' || slide.type === 'final-test') && !submitted.has(slide.id)) { setIsPlaying(false); return; }
    timerRef.current = setInterval(() => {
      setPos(p => { if (p >= total - 1) { setIsPlaying(false); return p; } return p + 1; });
    }, slide.type === 'content' ? 12000 : 8000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, slide.id, slide.type, submitted, total]);

  /* keyboard */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === ' ') { e.preventDefault(); setIsPlaying(p => !p); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [goNext, goPrev]);

  /* challenge */
  const selectAnswer = (id: string, idx: number) => { if (!submitted.has(id)) setAnswers(p => ({ ...p, [id]: idx })); };
  const submitAnswer = (s: M01Slide) => { if (answers[s.id] != null) setSubmitted(prev => new Set(prev).add(s.id)); };

  /* final score */
  useEffect(() => {
    if (slide.type !== 'summary' || finalScore !== null) return;
    let c = 0;
    FINAL_TEST_Q_INDICES.forEach(i => { if (answers[M01_SLIDES[i].id] === M01_SLIDES[i].correctAnswer) c++; });
    setFinalScore(c / FINAL_TEST_Q_INDICES.length);
  }, [slide.type, finalScore, answers]);

  const passed = finalScore !== null && finalScore >= PASS_THRESHOLD;
  const retakeTest = () => {
    setAnswers(prev => { const n = { ...prev }; FINAL_TEST_Q_INDICES.forEach(i => delete n[M01_SLIDES[i].id]); return n; });
    setSubmitted(prev => { const n = new Set(prev); FINAL_TEST_Q_INDICES.forEach(i => n.delete(M01_SLIDES[i].id)); return n; });
    setFinalScore(null);
    setPos(firstFinalPos);
  };

  const pct = Math.round(((pos + 1) / total) * 100);

  /* Build the 5-slot card window: [pos-2 … pos+2] */
  const cardWindow = useMemo(() => {
    const cards: { slidePos: number; offset: number }[] = [];
    for (let off = -2; off <= 2; off++) {
      const sp = pos + off;
      if (sp >= 0 && sp < total) cards.push({ slidePos: sp, offset: off });
    }
    return cards;
  }, [pos, total]);

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden select-none text-slate-100"
      style={{
        background: 'radial-gradient(ellipse at 28% 62%, #2b1106 0%, #160703 45%, #0d0401 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* ambient glow */}
      <div className="absolute top-[10%] left-[10%] w-[60vw] h-[60vw] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${BRAND}22 0%, transparent 65%)`, filter: 'blur(140px)' }} />
      <div className="absolute bottom-0 right-[8%] w-[45vw] h-[45vw] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3d1200 0%, transparent 70%)', filter: 'blur(110px)' }} />

      {/* progress bar */}
      <div className="absolute top-0 inset-x-0 h-[2px] z-[60]" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="h-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${BRAND}70, ${BRAND})`, transition: 'width 0.7s ease-out' }} />
      </div>

      {/* ── TOP HUD ── */}
      <header className="absolute top-0 inset-x-0 z-[60] flex items-start justify-between px-8 pt-5 bg-gradient-to-b from-black/55 via-black/15 to-transparent pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <button onClick={() => nav('/journey')} className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold uppercase tracking-[0.22em] w-fit">
            <ArrowLeft size={12} strokeWidth={2.5} /> Journey
          </button>
          {slide.topic && (
            <div className="pointer-events-none">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] mb-0.5" style={{ color: `${BRAND}cc` }}>{slide.topic}</p>
              <p className="text-[9px] text-white/25 border-l pl-1.5 py-px leading-tight" style={{ borderColor: `${BRAND}40` }}>{slide.policy}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 pointer-events-auto">
          <p className="text-[10px] font-medium text-white/25 tracking-[0.25em] font-mono tabular-nums">
            {String(pos + 1).padStart(2, '0')}&nbsp;/&nbsp;{String(total).padStart(2, '0')}
          </p>
          {slide.narration && (slide.type === 'content' || slide.type === 'educator-commentary') && (
            <button onClick={() => setShowNarration(p => !p)}
              className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border"
              style={{ color: showNarration ? BRAND : 'rgba(255,255,255,0.3)', borderColor: showNarration ? `${BRAND}60` : 'rgba(255,255,255,0.07)', background: showNarration ? `${BRAND}15` : 'rgba(0,0,0,0.25)' }}>
              <Volume2 size={9} /> Narration
            </button>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          5-SLOT CAROUSEL — CSS transitions drive smooth sliding.
          Cards keep their React key (= slidePos) so the DOM element
          persists across navigations; only the style changes.
      ══════════════════════════════════════════════════════════════ */}
      <main className="absolute inset-x-0 top-0 overflow-hidden z-10" style={{ bottom: DOCK_H }}>
        {cardWindow.map(({ slidePos, offset }) => {
          const si = orderedIndices[slidePos];
          const cardSlide = M01_SLIDES[si];
          if (!cardSlide) return null;
          const seed = getContinuitySeed(slidePos, cardSlide.imgSeed);
          const style = slotStyle(offset);
          const tint = tintOverlay(offset);
          const isActive = offset === 0;

          const isSplash = cardSlide.type === 'splash';
          return (
            <div key={slidePos} style={style}>
              {isSplash ? (
                <video
                  autoPlay loop muted playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  style={isActive ? { transform: 'scale(1.03)', filter: 'brightness(0.88) saturate(1.05)' } : undefined}
                >
                  <source src="/journey/m01/overview.mp4" type="video/mp4" />
                </video>
              ) : (
                <img
                  src={imgUrl(seed)}
                  alt={isActive ? cardSlide.title : ''}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={isActive ? { transform: 'scale(1.03)', filter: 'brightness(0.88) saturate(1.05)' } : undefined}
                />
              )}
              {tint && <div className="absolute inset-0" style={tint} />}
              {isActive && (
                <>
                  <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.56) 0%, rgba(0,0,0,0.05) 34%, transparent 54%)' }} />
                  <SlideContent
                    slide={cardSlide} answers={answers} submitted={submitted} showNarration={showNarration}
                    onSelect={selectAnswer} onSubmit={submitAnswer} passed={passed} finalScore={finalScore}
                    certName={certName} onSetCertName={setCertName} onRetakeTest={retakeTest} onEnterModule={goNext}
                  />
                </>
              )}
            </div>
          );
        })}
      </main>

      {/* ══════════════════════════════════════════════════════════════
          FIXED NAV DOCK — absolute bottom, z-9999, NEVER MOVES.
          Height is constant. Position is absolute. Content-independent.
      ══════════════════════════════════════════════════════════════ */}
      <nav
        className="absolute inset-x-0 bottom-0 z-[9999] flex items-center justify-center gap-4"
        style={{ height: DOCK_H, background: 'linear-gradient(to top, rgba(8,3,1,0.92) 0%, rgba(8,3,1,0.0) 100%)' }}
      >
        <button onClick={goPrev} disabled={pos === 0}
          className="flex items-center justify-center text-white/65 disabled:text-white/15"
          style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.50)', border: '1px solid rgba(255,255,255,0.10)' }}>
          <ChevronLeft size={16} strokeWidth={2} />
        </button>
        <button onClick={() => setIsPlaying(p => !p)}
          className="flex items-center justify-center text-white"
          style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.12)' }}>
          {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" style={{ marginLeft: 2 }} />}
        </button>
        <button onClick={goNext} disabled={pos === total - 1}
          className="flex items-center justify-center text-white/65 disabled:text-white/15"
          style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.50)', border: '1px solid rgba(255,255,255,0.10)' }}>
          <ChevronRight size={16} strokeWidth={2} />
        </button>
        <span className="text-[8px] uppercase tracking-[0.25em] text-white/20 ml-1 hidden md:block select-none">← → keys</span>
      </nav>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   SlideContent — overlays inside the active card ONLY.
   All content pinned to bottom of card. Image always dominant above.
   ZERO hover effects. ZERO transitions on buttons.
═══════════════════════════════════════════════════════════════════════ */
interface SlideContentProps {
  slide: M01Slide; answers: Record<string, number>; submitted: Set<string>;
  showNarration: boolean; onSelect: (id: string, idx: number) => void;
  onSubmit: (s: M01Slide) => void; passed: boolean; finalScore: number | null;
  certName: string; onSetCertName: (v: string) => void;
  onRetakeTest: () => void; onEnterModule: () => void;
}

function SlideContent({
  slide, answers, submitted, showNarration,
  onSelect, onSubmit, passed, finalScore, certName, onSetCertName, onRetakeTest, onEnterModule,
}: SlideContentProps) {
  const isSubmitted = submitted.has(slide.id);
  const selected = answers[slide.id] ?? null;

  /* ── SPLASH ── */
  if (slide.type === 'splash') {
    return (
      <div className="absolute inset-0">
        <div className="absolute inset-x-0 bottom-0 h-[50%]" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)' }} />
        <div className="absolute top-6 left-8">
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] px-3 py-1 rounded-full"
            style={{ color: BRAND, background: 'rgba(0,0,0,0.5)', border: `1px solid ${BRAND}40` }}>
            ACHC Annual Training · Module 01
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-6 px-12 text-left">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/40 mb-3 font-medium">
            Before she was a caregiver in America, Marites was a daughter leaving home.
          </p>
          <h1 className="text-5xl md:text-7xl font-thin text-white tracking-wide leading-tight drop-shadow-2xl mb-2">
            Marites' Journey
          </h1>
          <p className="text-base text-slate-300/60 font-light mb-5">Cultural Awareness &amp; CLAS Standards</p>
          <button onClick={onEnterModule} className="px-10 py-3 rounded-full text-white font-semibold text-sm tracking-widest"
            style={{ background: BRAND }}>
            Begin
          </button>
        </div>
      </div>
    );
  }

  /* ── OBJECTIVES ── */
  if (slide.type === 'objectives') {
    return (
      <BottomStrip>
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/35 mb-1">{slide.location ?? ''}</p>
        <h2 className="text-lg md:text-xl font-light text-white mb-2 leading-snug">{slide.title}</h2>
        <p className="text-[13px] text-slate-300/75 font-light leading-relaxed mb-4 max-w-2xl line-clamp-3">{slide.narration}</p>
        <button onClick={onEnterModule} className="px-8 py-2.5 rounded-full text-sm font-bold tracking-widest"
          style={{ background: BRAND, color: '#fff' }}>
          Enter Marites' Story
        </button>
      </BottomStrip>
    );
  }

  /* ── PRE-ASSESSMENT INTRO ── */
  if (slide.type === 'pre-assessment-intro') {
    return (
      <BottomStrip>
        <p className="text-[10px] uppercase tracking-[0.22em] text-blue-300/55 mb-1">{slide.location}</p>
        <p className="text-[13px] text-slate-200/80 font-light leading-relaxed mb-4 max-w-2xl line-clamp-3">{slide.narration}</p>
        <button onClick={onEnterModule} className="px-8 py-2.5 rounded-full text-sm font-bold tracking-widest"
          style={{ background: 'rgba(30,60,180,0.7)', color: '#93c5fd' }}>
          Continue with Marites
        </button>
      </BottomStrip>
    );
  }

  /* ── CONTENT ── */
  if (slide.type === 'content') {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {showNarration && slide.narration && (
          <div className="absolute left-8 right-8 md:left-12 md:right-[42%] bottom-20 z-30">
            <p className="text-left text-[12px] text-white/82 font-light leading-relaxed" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
              {slide.narration.split('.')[0]}.
            </p>
          </div>
        )}
        <div className="absolute left-8 right-8 md:left-12 md:right-[40%] bottom-4 z-20 flex flex-col items-start text-left">
          {slide.location && (
            <span className="inline-block px-3 py-0.5 mb-1.5 rounded-full text-[8px] uppercase tracking-[0.18em] font-medium text-white/45"
              style={{ background: 'rgba(0,0,0,0.35)' }}>
              {slide.location}
            </span>
          )}
          <h2 className="text-base md:text-lg font-light text-white drop-shadow-2xl max-w-2xl tracking-wide leading-snug">{slide.title}</h2>
          {slide.topic && <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] opacity-65" style={{ color: BRAND }}>{slide.topic}</p>}
        </div>
      </div>
    );
  }

  /* ── EDUCATOR COMMENTARY ── */
  if (slide.type === 'educator-commentary') {
    const brief = slide.narration.split('.').filter(s => s.trim().length > 0).slice(0, 2).join('. ') + '.';
    return (
      <BottomStrip h={28}>
        <div className="flex items-start gap-3 max-w-3xl mx-auto">
          <div className="flex-shrink-0 w-1 self-stretch rounded-full mt-0.5" style={{ background: '#F59E0B' }} />
          <div>
            <p className="text-[8px] uppercase tracking-[0.22em] text-amber-300/65 mb-1 font-bold">Operational Note</p>
            <p className="text-[13px] text-white/85 font-light leading-relaxed" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>{brief}</p>
            <button onClick={onEnterModule} className="mt-2 text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: '#F59E0B' }}>
              Continue →
            </button>
          </div>
        </div>
      </BottomStrip>
    );
  }

  /* ── CHALLENGE + FINAL-TEST ── */
  if (slide.type === 'challenge' || slide.type === 'final-test') {
    const isFinal = slide.type === 'final-test';
    const accent = isFinal ? '#A78BFA' : '#FCD34D';
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 bottom-0 h-[42%]" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%)' }} />
        <div className="absolute left-8 right-8 md:left-12 md:right-[24%] bottom-4 z-20 pointer-events-auto">
          <div className="max-w-[760px] rounded-xl border border-white/10 bg-black/52 backdrop-blur-[2px] px-3 py-2">
            <p className="text-[8px] uppercase tracking-[0.2em] font-bold mb-1" style={{ color: accent }}>
              {isFinal ? 'Final Shift — What does Marites do?' : "What does Marites do?"}
            </p>
            <h4 className="text-[12px] font-medium text-white mb-2 leading-snug">{slide.challengeQuestion}</h4>
            <div className="grid grid-cols-2 gap-1">
              {slide.options?.map((opt, idx) => {
                const sel = selected === idx;
                const cor = idx === slide.correctAnswer;
                let bg = 'rgba(0,0,0,0.45)';
                let bdr = 'rgba(255,255,255,0.10)';
                let col = 'rgba(255,255,255,0.82)';
                if (sel && !isSubmitted) { bg = 'rgba(0,0,0,0.65)'; bdr = accent; }
                else if (isSubmitted && cor) { bg = 'rgba(16,185,129,0.22)'; bdr = '#10B981'; col = '#d1fae5'; }
                else if (isSubmitted && sel) { bg = 'rgba(239,68,68,0.22)'; bdr = '#EF4444'; col = '#fecaca'; }
                else if (isSubmitted) { col = 'rgba(255,255,255,0.25)'; }
                return (
                  <button key={idx} onClick={() => onSelect(slide.id, idx)} disabled={isSubmitted}
                    className="text-left px-2 py-1.5 rounded-lg text-[10px] font-light leading-snug flex items-start gap-2 min-h-[42px]"
                    style={{ background: bg, border: `1px solid ${bdr}`, color: col }}>
                    <span className="flex-shrink-0 w-3.5 h-3.5 mt-0.5 rounded-full border flex items-center justify-center text-[8px] font-bold"
                      style={{ borderColor: sel && !isSubmitted ? accent : 'rgba(255,255,255,0.20)', color: sel && !isSubmitted ? accent : 'rgba(255,255,255,0.30)' }}>
                      {isSubmitted && cor ? '✓' : String.fromCharCode(65 + idx)}
                    </span>
                    <span className="line-clamp-2">{opt}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center justify-between">
              {isSubmitted
                ? <p className={`text-[10px] font-semibold ${selected === slide.correctAnswer ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selected === slide.correctAnswer ? 'Correct.' : 'Risk identified.'}
                  </p>
                : <span />}
              <button
                onClick={!isSubmitted ? () => onSubmit(slide) : onEnterModule}
                disabled={!isSubmitted && selected == null}
                className="w-[112px] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase ml-auto text-center"
                style={
                  !isSubmitted
                    ? (selected != null
                        ? { background: accent, color: '#111' }
                        : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.25)', cursor: 'not-allowed' })
                    : { background: '#fff', color: '#111' }
                }
              >
                {!isSubmitted ? 'Confirm' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── DEBRIEF ── */
  if (slide.type === 'debrief') {
    const { safety, takeaway } = extractDebriefTakeaways(slide.debriefText ?? slide.narration ?? '');
    return (
      <BottomStrip h={28}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-1 h-1 rounded-full bg-emerald-400" />
            <p className="text-[8px] uppercase tracking-[0.22em] text-emerald-300/70 font-bold">Why it matters</p>
          </div>
          <p className="text-[13px] text-white/90 font-light leading-relaxed mb-1" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.9)' }}>
            {safety.replace(/^4\)\s*/i, '').split('.')[0]}.
          </p>
          <p className="text-[11px] text-emerald-200/70 font-light leading-relaxed mb-2.5" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            {takeaway.replace(/^10\)\s*/i, '').split('.')[0]}.
          </p>
          <button onClick={onEnterModule} className="px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-white text-black">
            Continue
          </button>
        </div>
      </BottomStrip>
    );
  }

  /* ── SUMMARY ── */
  if (slide.type === 'summary') {
    const scorePct = finalScore != null ? Math.round(finalScore * 100) : 0;
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-8">
        <div className="max-w-2xl w-full p-10 rounded-3xl bg-black/60 border border-white/10 text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl font-bold"
            style={{ background: passed ? 'rgba(16,185,129,0.2)' : 'rgba(220,38,38,0.2)', border: `2px solid ${passed ? '#10B981' : '#DC2626'}`, color: passed ? '#34D399' : '#F87171' }}>
            {scorePct}%
          </div>
          <h2 className="text-3xl font-light text-white mb-2">{passed ? 'Module Complete' : 'Assessment Not Passed'}</h2>
          <p className={`text-lg font-bold mb-2 ${passed ? 'text-emerald-400' : 'text-red-400'}`}>
            {passed ? 'PASS' : 'FAIL'} — {scorePct}%
          </p>
          <p className="text-slate-400 text-sm mb-6">
            {passed ? 'Your certificate is ready.' : 'You need 80% to pass. Retake the final assessment.'}
          </p>
          <div className="grid grid-cols-5 gap-2 mb-6">
            {FINAL_TEST_Q_INDICES.map((idx, i) => {
              const s = M01_SLIDES[idx];
              const c = answers[s.id] === s.correctAnswer;
              return <div key={idx} className={`rounded-xl p-2 text-xs font-bold border ${c ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-red-500/15 border-red-500/30 text-red-400'}`}>Q{i + 1} {c ? '✓' : '✗'}</div>;
            })}
          </div>
          {passed
            ? <button onClick={onEnterModule} className="px-10 py-3.5 rounded-full font-bold text-white" style={{ background: BRAND }}>Get Certificate</button>
            : <button onClick={onRetakeTest} className="px-10 py-3.5 rounded-full font-bold bg-white text-black">Retake Final Assessment</button>}
        </div>
      </div>
    );
  }

  /* ── CERTIFICATE ── */
  if (slide.type === 'certificate') {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 p-6 overflow-y-auto">
        <div className="relative max-w-3xl w-full rounded-[2rem] overflow-hidden shadow-2xl border border-[#C74601]/30 my-4"
          style={{ background: 'linear-gradient(135deg, #0a0505 0%, #1a0c05 50%, #0a0505 100%)' }}>
          <div className="absolute top-0 left-0 w-24 h-24 opacity-20" style={{ background: `radial-gradient(circle at 0 0, ${BRAND}, transparent 70%)` }} />
          <div className="absolute bottom-0 right-0 w-24 h-24 opacity-20" style={{ background: `radial-gradient(circle at 100% 100%, ${BRAND}, transparent 70%)` }} />
          <div className="relative z-10 p-10 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 mb-1">Care Indeed Home Health Care</p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-5">Learning & Compliance Division</p>
            <div className="border-t border-b border-[#C74601]/20 py-5 mb-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-slate-400 mb-2">Certificate of Completion</p>
              <h2 className="text-4xl font-thin text-white tracking-wide mb-1">Marites' Journey</h2>
              <p className="text-lg text-[#C74601] font-light">Cultural Awareness & CLAS Standards</p>
              <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest">ACHC-ART-M01</p>
            </div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500 mb-3">This certifies that</p>
            {certName.trim()
              ? <p className="text-3xl font-light text-white mb-2 border-b border-[#C74601]/30 pb-3 mx-8">{certName}</p>
              : <input type="text" placeholder="Enter your full name"
                  className="w-full max-w-sm mx-auto block text-center text-2xl font-light bg-transparent border-b border-[#C74601]/50 text-white placeholder:text-slate-500 outline-none pb-2 mb-2"
                  value={certName} onChange={e => onSetCertName(e.target.value)} />}
            <p className="text-slate-400 text-sm mt-3">has demonstrated competency in culturally and linguistically appropriate care delivery.</p>
            <div className="flex justify-center gap-8 my-5 text-center">
              <div><p className="text-[#C74601] text-2xl font-bold">{finalScore != null ? Math.round(finalScore * 100) : 80}%</p><p className="text-[9px] uppercase tracking-widest text-slate-500">Score</p></div>
              <div><p className="text-[#C74601] text-2xl font-bold">PASS</p><p className="text-[9px] uppercase tracking-widest text-slate-500">Status</p></div>
              <div><p className="text-[#C74601] text-2xl font-bold">35 min</p><p className="text-[9px] uppercase tracking-widest text-slate-500">Duration</p></div>
            </div>
            <div className="border-t border-white/5 pt-5 grid grid-cols-3 gap-4 text-center">
              <div><div className="border-b border-slate-700 pb-1 mb-1"><p className="text-[10px] text-slate-500">{today}</p></div><p className="text-[9px] uppercase tracking-widest text-slate-600">Date</p></div>
              <div><div className="border-b border-slate-700 pb-1 mb-1"><p className="text-[10px] text-slate-500">ACHC-ART-M01</p></div><p className="text-[9px] uppercase tracking-widest text-slate-600">Module</p></div>
              <div><div className="border-b border-slate-700 pb-1 mb-1"><p className="text-[10px] text-slate-500">Care Indeed LMS</p></div><p className="text-[9px] uppercase tracking-widest text-slate-600">Issued By</p></div>
            </div>
            <div className="mt-5 flex justify-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center border-2"
                style={{ borderColor: `${BRAND}60`, background: `${BRAND}15`, color: BRAND }}><Award size={22} /></div>
            </div>
          </div>
        </div>
        <button onClick={() => window.print()} className="mt-3 flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/10 text-slate-300 text-sm font-bold uppercase tracking-widest">
          <BookOpen size={14} /> Save / Print
        </button>
      </div>
    );
  }

  return null;
}

/* Reusable bottom-strip wrapper — gradient only covers bottom portion */
function BottomStrip({ children, h = 32 }: { children: React.ReactNode; h?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{ height: `${h}%`, background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)' }} />
      <div className="absolute left-8 right-8 md:left-12 md:right-[34%] bottom-4 z-20 pointer-events-auto">{children}</div>
    </div>
  );
}
