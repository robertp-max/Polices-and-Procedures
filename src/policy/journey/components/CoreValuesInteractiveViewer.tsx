import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Heart,
  Scale,
  Award,
  Users,
  CheckCircle2,
  XCircle,
  CheckSquare,
  Check,
  MessageCircle,
  Eye,
  AlertCircle,
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  } from 'lucide-react';
import GAO001SharedOverlay from './GAO001SharedOverlay';
import { gao001SceneArt } from '../data/gao001SceneArt';

// Web Audio API Synthesizer for self-contained interaction sounds
class InteractiveAudioSynth {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playError() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.setValueAtTime(180, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  playChime() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // Pentatonic Arpeggio
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.05, now + idx * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.9);
    });
  }
}

const synth = new InteractiveAudioSynth();

const CORE_VALUES = [
  { id: 'integrity', icon: Scale, name: 'Integrity', desc: 'Do the right thing even when no one is watching. Document truthfully. Report honestly.' },
  { id: 'compassion', icon: Heart, name: 'Compassion', desc: 'Treat every patient as you would your own family member. Respect their dignity always.' },
  { id: 'excellence', icon: Award, name: 'Excellence', desc: 'Never settle for "good enough". Pursue continuous improvement in every task.' },
  { id: 'teamwork', icon: Users, name: 'Teamwork', desc: 'Home health is interdisciplinary. Communicate, coordinate, collaborate.' },
  { id: 'accountability', icon: CheckSquare, name: 'Accountability', desc: 'Own your responsibilities. Follow through on commitments. Accept feedback.' },
  { id: 'compliance', icon: ShieldCheck, name: 'Compliance', desc: 'Regulatory adherence protects patients. Never cut corners on safety or documentation.' }
];

const SCENE_HOTSPOTS = [
  {
    id: 'chart',
    title: "The Coffee Table",
    icon: AlertCircle,
    position: { top: '65%', left: '42%' },
    dialogue: "Insurance won't cover her physical therapy unless you write down that you were here for 60 minutes. You were only here 45, but can you just round up? It's for her own good.",
    actor: "Family Member",
    targetValueId: 'integrity',
    question2: "What is your immediate response?",
    options: [
      { id: 'a', text: "Document the 60 minutes to ensure the patient gets the coverage they need.", isCorrect: false },
      { id: 'b', text: "Politely decline and document truthfully only the time actually spent providing care.", isCorrect: true },
    ],
    feedback: "Integrity means documenting truthfully, regardless of external pressure. Falsifying clinical records violates 42 CFR §484.110 and constitutes fraud."
  },
  {
    id: 'patient',
    title: "Patient on Couch",
    icon: Heart,
    position: { top: '46%', left: '28%' },
    dialogue: "(Whispering nervously) I'm just clumsy lately. (Son interrupts aggressively) She fell. Why are you snooping?",
    actor: "Patient with unexplained bruising",
    targetValueId: 'compliance',
    question2: "Which protocol must you immediately follow?",
    options: [
      { id: 'a', text: "Confront the son to find out exactly what happened before calling the office.", isCorrect: false },
      { id: 'b', text: "Follow agency mandatory reporting protocol immediately; do not investigate or confront; supervisor/Compliance assists with required external reporting, but required reporting must not be delayed.", isCorrect: true },
    ],
    feedback: "Compliance and Patient Rights (42 CFR §484.50) demand immediate action for suspected abuse. You must NEVER investigate independently or delay report submission."
  },
  {
    id: 'tablet',
    title: "Kitchen Tablet",
    icon: ShieldCheck,
    position: { top: '42%', left: '86%' },
    dialogue: "Observation: The PT note from yesterday states the patient is completely bedbound. However, the patient is currently walking to the bathroom with a walker.",
    actor: "Your Clinical Chart",
    targetValueId: 'teamwork',
    question2: "What is the expected behavior?",
    options: [
      { id: 'a', text: "Ignore the PT note, as you are only responsible for your own discipline.", isCorrect: false },
      { id: 'b', text: "Communicate and coordinate with the PT and interdisciplinary team to clarify the discrepancy and ensure safe care.", isCorrect: true },
    ],
    feedback: "Teamwork requires interdisciplinary coordination. Home health relies on the entire team communicating effectively to ensure patient safety and care alignment."
  },
  {
    id: 'med_bag',
    title: "Supply Bag",
    icon: CheckSquare,
    position: { top: '72%', left: '61%' },
    dialogue: "You are setting up for a dressing change and realize you forgot the specific antimicrobial alginate dressing ordered by the physician. You only have standard gauze in your bag.",
    actor: "Internal Monologue",
    targetValueId: 'accountability',
    question2: "How do you proceed?",
    options: [
      { id: 'a', text: "Use the standard gauze today since it's better than nothing, and remember the correct dressing for next time.", isCorrect: false },
      { id: 'b', text: "Own the mistake, explain the delay to the patient, and immediately contact the office to get the correct supplies delivered.", isCorrect: true },
    ],
    feedback: "Accountability means owning your mistakes and never compromising patient care to cover them up. Using incorrect supplies violates the physician's orders."
  }
];

const brandStyles = `
  @keyframes subtleShake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }
  .animate-shake {
    animation: subtleShake 0.4s ease-in-out;
  }

  @keyframes popIn {
    0% { transform: scale(0.96); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  .animate-pop-in {
    animation: popIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes slideUp {
    0% { transform: translateY(16px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  .animate-slide-up {
    animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes ping-slow {
    75%, 100% { transform: scale(1.6); opacity: 0; }
  }
  .animate-ping-slow {
    animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  /* SVG Character Breathing Animations */
  @keyframes characterBreathe {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(1.025) translateY(-0.8px); }
  }
  .animate-breathe {
    animation: characterBreathe 4s ease-in-out infinite;
  }

  @keyframes characterNod {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(3deg) translateY(0.2px); }
  }
  .animate-nod {
    animation: characterNod 5s ease-in-out infinite;
  }

  @keyframes characterArm {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(-3deg); }
  }
  .animate-arm {
    animation: characterArm 3s ease-in-out infinite;
  }

  /* Curtains Ambient sway */
  @keyframes curtainSwayL {
    0%, 100% { transform: skewX(0deg) rotate(0deg); }
    50% { transform: skewX(2deg) rotate(0.5deg); }
  }
  @keyframes curtainSwayR {
    0%, 100% { transform: skewX(0deg) rotate(0deg); }
    50% { transform: skewX(-2deg) rotate(-0.5deg); }
  }
  .animate-curtain-l {
    animation: curtainSwayL 6s ease-in-out infinite;
    transform-origin: top left;
  }
  .animate-curtain-r {
    animation: curtainSwayR 6s ease-in-out infinite;
    transform-origin: top right;
  }

  /* Plant sway */
  @keyframes plantWave {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(1.5deg); }
  }
  .animate-plant-sway {
    animation: plantWave 7s ease-in-out infinite;
    transform-origin: bottom center;
  }

  /* Coffee steam rising */
  @keyframes steamAscend {
    0% { transform: translateY(0) scaleX(0.8); opacity: 0; }
    20% { opacity: 0.5; }
    50% { transform: translateY(-15px) scaleX(1.1); opacity: 0.3; }
    100% { transform: translateY(-30px) scaleX(0.6); opacity: 0; }
  }
  .animate-steam-1 {
    animation: steamAscend 2.5s ease-in-out infinite;
  }
  .animate-steam-2 {
    animation: steamAscend 2.5s ease-in-out infinite;
    animation-delay: 1.25s;
  }

  /* Angry Son pacing back and forth */
  @keyframes sonPace {
    0% { transform: translateX(0px) scaleX(1); }
    45% { transform: translateX(130px) scaleX(1); }
    50% { transform: translateX(130px) scaleX(-1); }
    95% { transform: translateX(0px) scaleX(-1); }
    100% { transform: translateX(0px) scaleX(1); }
  }
  .animate-son-pace {
    animation: sonPace 6s linear infinite;
  }

  @keyframes sonYell {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-2px) rotate(-1.5deg); }
    75% { transform: translateY(1.5px) rotate(1.5deg); }
  }
  .animate-son-yell {
    animation: sonYell 0.35s ease-in-out infinite;
  }

  @keyframes angryFists {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(24deg) translateY(-2px); }
  }
  .animate-fists {
    animation: angryFists 0.28s ease-in-out infinite;
  }

  /* Sleeping cat Zzz animation */
  @keyframes zzzFloat {
    0%, 100% { opacity: 0; transform: translateY(0); }
    10% { opacity: 1; }
    80% { opacity: 1; }
    100% { opacity: 0; transform: translateY(-28px); }
  }
  .animate-zzz {
    animation: zzzFloat 2.8s ease-in-out infinite;
  }
  .animate-zzz2 {
    animation: zzzFloat 2.8s ease-in-out infinite;
    animation-delay: 0.7s;
  }
  .animate-zzz3 {
    animation: zzzFloat 2.8s ease-in-out infinite;
    animation-delay: 1.4s;
  }

  /* A11y: respect reduced motion preference (premium calm) */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      animation-name: none !important;
    }
    .animate-ping-slow { animation: none !important; }
  }
`;

const SceneArtwork = ({ eyesClosed }: { eyesClosed: boolean }) => (
  <svg
    viewBox="0 0 1000 600"
    className="absolute inset-0 w-full h-full object-cover"
    preserveAspectRatio="xMidYMid slice"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="windowGlow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFE0B2" />
        <stop offset="50%" stopColor="#FFF9C4" />
        <stop offset="100%" stopColor="#FFF176" />
      </linearGradient>
      <linearGradient id="lampLightCone" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFE082" stopOpacity="0.75" />
        <stop offset="50%" stopColor="#FFE082" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#FFF9C4" stopOpacity="0" />
      </linearGradient>
      <radialGradient id="sofaUnderShadow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#0F172A" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Background Wall */}
    <rect width="1000" height="600" fill="#FDF8F3" />

    {/* Clean Wallpaper Stripe details */}
    <g opacity="0.05" stroke="#1E293B" strokeWidth="15" strokeDasharray="15, 20">
      <line x1="50" y1="0" x2="50" y2="400" />
      <line x1="150" y1="0" x2="150" y2="400" />
      <line x1="250" y1="0" x2="250" y2="400" />
      <line x1="350" y1="0" x2="350" y2="400" />
      <line x1="450" y1="0" x2="450" y2="400" />
      <line x1="550" y1="0" x2="550" y2="400" />
      <line x1="650" y1="0" x2="650" y2="400" />
      <line x1="750" y1="0" x2="750" y2="400" />
      <line x1="850" y1="0" x2="850" y2="400" />
    </g>

    {/* Baseboard & Textured Wooden Floor */}
    <rect y="400" width="1000" height="15" fill="#E6DCCF" />
    <rect y="415" width="1000" height="185" fill="#D2BBA0" />

    {/* Elegant floor panel lines */}
    <g stroke="#BAA58E" strokeWidth="1.5" opacity="0.8">
      <line x1="0" y1="435" x2="1000" y2="435" />
      <line x1="0" y1="470" x2="1000" y2="470" />
      <line x1="0" y1="510" x2="1000" y2="510" />
      <line x1="0" y1="555" x2="1000" y2="555" />
      <line x1="100" y1="415" x2="60" y2="600" />
      <line x1="300" y1="415" x2="260" y2="600" />
      <line x1="500" y1="415" x2="460" y2="600" />
      <line x1="700" y1="415" x2="660" y2="600" />
      <line x1="900" y1="415" x2="860" y2="600" />
    </g>

    {/* Floor Rug */}
    <ellipse cx="450" cy="510" rx="350" ry="60" fill="#7A9CA3" opacity="0.8" />
    <path d="M 120 510 Q 450 600 780 510" fill="none" stroke="#688990" strokeWidth="2" strokeDasharray="10, 10" opacity="0.5"/>

    {/* Window Area */}
    <g transform="translate(60, 50)">
      <rect width="260" height="300" fill="#FFFFFF" rx="8" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }} />
      <rect x="10" y="10" width="240" height="280" fill="url(#windowGlow)" rx="4" />
      <circle cx="180" cy="90" r="26" fill="#FFA726" opacity="0.9" />
      <path d="M 10 290 Q 70 200 130 290 T 250 290 Z" fill="#81C784" />
      <path d="M 80 290 Q 150 210 250 290 Z" fill="#4CAF50" opacity="0.85" />
      <rect x="126" y="10" width="8" height="280" fill="#FFFFFF" opacity="0.9" />
      <rect x="10" y="146" width="240" height="8" fill="#FFFFFF" opacity="0.9" />
      <path d="M -10 -10 Q 50 150 10 320 L -20 320 Z" fill="#E39B75" className="animate-curtain-l" />
      <path d="M 270 -10 Q 210 150 250 320 L 280 320 Z" fill="#E39B75" className="animate-curtain-r" />
      <rect x="-30" y="-15" width="320" height="10" fill="#7D523A" rx="5" />
      <circle cx="-30" cy="-10" r="10" fill="#5C3A21" />
      <circle cx="290" cy="-10" r="10" fill="#5C3A21" />
    </g>

    {/* Kitchen Area */}
    <g transform="translate(710, 90)">
      <rect x="20" y="20" width="140" height="310" fill="#D9E2E8" rx="8" />
      <rect x="20" y="20" width="10" height="310" fill="#FFFFFF" rx="8" opacity="0.3" />
      <line x1="20" y1="130" x2="160" y2="130" stroke="#B8C9D3" strokeWidth="4" />
      <rect x="40" y="55" width="8" height="50" fill="#90A4AE" rx="4" />
      <rect x="40" y="150" width="8" height="80" fill="#90A4AE" rx="4" />
      <rect x="75" y="45" width="55" height="45" fill="#FFEB3B" rx="2" transform="rotate(-3 75 45)" />
      <line x1="80" y1="55" x2="120" y2="55" stroke="#F57F17" strokeWidth="2" opacity="0.5" transform="rotate(-3 75 45)"/>
      <line x1="80" y1="65" x2="115" y2="65" stroke="#F57F17" strokeWidth="2" opacity="0.5" transform="rotate(-3 75 45)"/>
      <circle cx="102" cy="38" r="4" fill="#F44336" transform="rotate(-3 75 45)"/>
      <rect x="170" y="170" width="130" height="160" fill="#D0C0A5" />
      <rect x="165" y="160" width="135" height="15" fill="#EFEBE9" rx="2" />
      <rect x="175" y="180" width="55" height="140" fill="#C3B094" rx="2" />
      <rect x="235" y="180" width="55" height="140" fill="#C3B094" rx="2" />
      <rect x="220" y="195" width="4" height="20" fill="#8D6E63" rx="2" />
      <rect x="240" y="195" width="4" height="20" fill="#8D6E63" rx="2" />
      <path d="M 230 160 Q 230 120 250 120 Q 270 120 270 150" fill="none" stroke="#90A4AE" strokeWidth="5.5" strokeLinecap="round" />
      <rect x="265" y="150" width="10" height="10" fill="#B0BEC5" rx="2" />
    </g>

    {/* ANGRY SON (Walking and shouting back and forth behind the sofa) */}
    <g transform="translate(100, 160)">
      <g className="animate-son-pace" style={{ transformOrigin: '40px 140px' }}>
        <g className="animate-son-yell" style={{ transformOrigin: '40px 100px' }}>
          {/* Jeans */}
          <rect x="28" y="110" width="11" height="50" fill="#2E4053" rx="3" />
          <rect x="41" y="110" width="11" height="50" fill="#2E4053" rx="3" />
          {/* Sneakers */}
          <ellipse cx="33" cy="160" rx="9" ry="5" fill="#1C2833" />
          <ellipse cx="46" cy="160" rx="9" ry="5" fill="#1C2833" />

          {/* Crimson polo shirt */}
          <rect x="20" y="55" width="40" height="60" fill="#C0392B" rx="8" />
          <path d="M 28 55 L 40 68 L 52 55" fill="none" stroke="#962D22" strokeWidth="3" />

          {/* Angry waving fists */}
          <g className="animate-fists" style={{ transformOrigin: '20px 65px' }}>
            <path d="M 22 65 Q 4 72 10 92" fill="none" stroke="#C0392B" strokeWidth="10" strokeLinecap="round" />
            <circle cx="10" cy="92" r="6" fill="#F3C6A5" />
          </g>
          <g className="animate-fists" style={{ transformOrigin: '60px 65px', animationDelay: '0.14s' }}>
            <path d="M 58 65 Q 76 72 70 92" fill="none" stroke="#C0392B" strokeWidth="10" strokeLinecap="round" />
            <circle cx="70" cy="92" r="6" fill="#F3C6A5" />
          </g>

          {/* Angry Face & Head */}
          <g>
            <rect x="36" y="45" width="8" height="15" fill="#F3C6A5" />
            <circle cx="40" cy="30" r="18" fill="#F3C6A5" />
            <path d="M 20 22 Q 40 -8 60 22 Q 52 10 40 12 Q 28 10 20 22 Z" fill="#2C3E50" />
            <line x1="27" y1="20" x2="36" y2="23" stroke="#2C3E50" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="53" y1="20" x2="44" y2="23" stroke="#2C3E50" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="31" cy="27" r="3.5" fill="#FFFFFF" />
            <circle cx="31" cy="27" r="1.5" fill="#000000" />
            <circle cx="49" cy="27" r="3.5" fill="#FFFFFF" />
            <circle cx="49" cy="27" r="1.5" fill="#000000" />
            <ellipse cx="40" cy="38" rx="6" ry="4" fill="#581845" />
            <line x1="35" y1="36" x2="45" y2="36" stroke="#FFFFFF" strokeWidth="1.5" />
          </g>

          {/* Floating red anger marks above his head */}
          <g transform="translate(40, -12)">
            <path d="M -6 -4 L -13 -11 M -6 -11 L -13 -4" stroke="#E74C3C" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
            <path d="M 6 -4 L 13 -11 M 6 -11 L 13 -4" stroke="#E74C3C" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
          </g>
        </g>
      </g>
    </g>

    {/* Couch Ambient Casting Shadow */}
    <ellipse cx="300" cy="405" rx="170" ry="12" fill="url(#sofaUnderShadow)" />

    {/* Sofa Area */}
    <g transform="translate(150, 260)">
      <rect x="20" y="0" width="300" height="120" fill="#3B7D7F" rx="16" />
      <rect x="40" y="90" width="130" height="40" fill="#4B8E90" rx="8" />
      <rect x="175" y="90" width="130" height="40" fill="#4B8E90" rx="8" />
      <rect x="0" y="50" width="50" height="90" fill="#326F71" rx="12" />
      <rect x="290" y="50" width="50" height="90" fill="#326F71" rx="12" />
      <rect x="45" y="40" width="50" height="50" fill="#F4D03F" rx="8" transform="rotate(15 45 40)" />
      <rect x="260" y="60" width="40" height="40" fill="#FDF8F3" rx="6" transform="rotate(-20 260 60)" />
    </g>

    {/* Medical Supply Bag */}
    <g transform="translate(580, 400)">
      <rect x="0" y="20" width="65" height="42" fill="#2C3E50" rx="8" style={{ filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.15))' }} />
      <path d="M 22 20 Q 32.5 2 43 20" fill="none" stroke="#34495E" strokeWidth="5.5" strokeLinecap="round" />
      <rect x="24" y="32" width="17" height="17" fill="#ECF0F1" rx="3" />
      <path d="M 32.5 35 L 32.5 46 M 27 40.5 L 38 40.5" stroke="#E74C3C" strokeWidth="3" strokeLinecap="round" />
    </g>

    {/* Patient (Sitting on Couch) */}
    <g transform="translate(240, 210)">
      <rect x="30" y="140" width="25" height="100" fill="#7F8C8D" rx="10" />
      <rect x="55" y="140" width="25" height="100" fill="#7F8C8D" rx="10" />
      <ellipse cx="40" cy="245" rx="18" ry="10" fill="#E67E22" />
      <ellipse cx="70" cy="245" rx="18" ry="10" fill="#E67E22" />

      <g className="animate-breathe" style={{ transformOrigin: '55px 140px' }}>
        <rect x="20" y="60" width="70" height="100" fill="#9B59B6" rx="25" />

        <g className="animate-nod" style={{ transformOrigin: '55px 58px', animationDelay: '0.5s' }}>
          <circle cx="55" cy="30" r="28" fill="#F3C6A5" />
          <path d="M 25 35 Q 55 -10 85 35 Q 90 60 75 60 Q 55 50 35 60 Q 20 60 25 35 Z" fill="#E2E8F0" />
          <circle cx="55" cy="-6" r="14" fill="#CBD5E1" />

          {eyesClosed ? (
            <g stroke="#334155" strokeWidth="2.5" strokeLinecap="round">
              <line x1="43" y1="28" x2="51" y2="29" />
              <line x1="59" y1="29" x2="67" y2="28" />
            </g>
          ) : (
            <g fill="#334155">
              <circle cx="47" cy="28" r="3.5" />
              <circle cx="63" cy="28" r="3.5" />
              <circle cx="48.5" cy="26.5" r="1" fill="#FFFFFF" />
              <circle cx="64.5" cy="26.5" r="1" fill="#FFFFFF" />
            </g>
          )}

          <path d="M 49 42 Q 55 46 61 42" fill="none" stroke="#E07A5F" strokeWidth="2.5" strokeLinecap="round" />

          <rect x="38" y="23" width="13" height="10" fill="none" stroke="#D35400" strokeWidth="1.5" rx="2" />
          <rect x="57" y="23" width="13" height="10" fill="none" stroke="#D35400" strokeWidth="1.5" rx="2" />
          <line x1="51" y1="28" x2="57" y2="28" stroke="#D35400" strokeWidth="1.5" />
        </g>

        <g className="animate-arm" style={{ transformOrigin: '25px 70px' }}>
          <path d="M 25 70 Q 10 120 40 140" fill="none" stroke="#9B59B6" strokeWidth="18" strokeLinecap="round" />
          <circle cx="45" cy="140" r="10" fill="#F3C6A5" />
        </g>
      </g>
    </g>

    {/* Nurse (Standing, interacting) */}
    <g transform="translate(430, 150)">
      <rect x="35" y="150" width="22" height="165" fill="#094B45" rx="10" />
      <rect x="65" y="150" width="22" height="165" fill="#094B45" rx="10" />
      <ellipse cx="45" cy="315" rx="16" ry="10" fill="#FFFFFF" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))' }} />
      <ellipse cx="75" cy="315" rx="16" ry="10" fill="#FFFFFF" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))' }} />

      <g className="animate-breathe" style={{ transformOrigin: '60px 150px', animationDelay: '0.7s' }}>
        <path d="M 25 70 L 95 70 L 105 160 L 15 160 Z" fill="#0F5B54" />
        <path d="M 45 70 Q 60 105 75 70" fill="none" stroke="#ECEFF1" strokeWidth="3" />
        <circle cx="60" cy="107" r="5" fill="#90A4AE" />

        <rect x="80" y="90" width="13" height="17" fill="#FFFFFF" rx="2" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' }} />
        <rect x="82" y="93" width="9" height="4" fill="#3498DB" rx="1" />
        <line x1="83" y1="101" x2="90" y2="101" stroke="#90A4AE" strokeWidth="1" />
        <line x1="83" y1="104" x2="88" y2="104" stroke="#90A4AE" strokeWidth="1" />

        <g className="animate-nod" style={{ transformOrigin: '60px 55px', animationDelay: '1s' }}>
          <circle cx="60" cy="-10" r="12" fill="#2C3E50" />
          <circle cx="60" cy="22" r="27" fill="#2C3E50" />
          <circle cx="60" cy="32" r="23" fill="#8D5524" />
          <path d="M 37 32 Q 60 12 83 32 Q 80 18 60 18 Q 40 18 37 32 Z" fill="#2C3E50" />

          {eyesClosed ? (
            <g stroke="#1A0A00" strokeWidth="2.5" strokeLinecap="round">
              <line x1="50" y1="30" x2="56" y2="31" />
              <line x1="64" y1="31" x2="70" y2="30" />
            </g>
          ) : (
            <g fill="#1A0A00">
              <circle cx="53" cy="30" r="3.2" />
              <circle cx="67" cy="30" r="3.2" />
              <circle cx="54.2" cy="28.7" r="0.8" fill="#FFFFFF" />
              <circle cx="68.2" cy="28.7" r="0.8" fill="#FFFFFF" />
            </g>
          )}

          <path d="M 56 42 Q 60 46 64 42" fill="none" stroke="#4E2B12" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        <g className="animate-arm" style={{ transformOrigin: '30px 80px', animationDelay: '1.2s' }}>
          <path d="M 30 80 Q 0 150 -60 160" fill="none" stroke="#0F5B54" strokeWidth="16" strokeLinecap="round" />
          <circle cx="-65" cy="160" r="9" fill="#8D5524" />
        </g>
        <g className="animate-arm" style={{ transformOrigin: '90px 80px', animationDelay: '0.2s' }}>
          <path d="M 90 80 Q 120 150 60 180" fill="none" stroke="#0F5B54" strokeWidth="16" strokeLinecap="round" />
        </g>
      </g>
    </g>

    {/* Coffee Table & Steaming Mug */}
    <g transform="translate(320, 390)">
      <rect x="40" y="20" width="12" height="70" fill="#5C3A21" rx="4" />
      <rect x="180" y="20" width="12" height="70" fill="#5C3A21" rx="4" />
      <rect x="10" y="15" width="210" height="20" fill="#A57153" rx="8" style={{ filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.1))' }} />
      <rect x="10" y="15" width="210" height="5" fill="#C49A76" rx="2" />

      <g transform="translate(130, -5) rotate(10)">
        <rect width="60" height="40" fill="#8D6E63" rx="4" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.15))' }} />
        <rect x="5" y="5" width="50" height="30" fill="#FFFFFF" rx="2" />
        <line x1="15" y1="12" x2="45" y2="12" stroke="#B0BEC5" strokeWidth="2" />
        <line x1="15" y1="20" x2="40" y2="20" stroke="#B0BEC5" strokeWidth="2" />
        <line x1="15" y1="28" x2="45" y2="28" stroke="#B0BEC5" strokeWidth="2" />
        <rect x="20" y="15" width="30" height="4" fill="#34495E" rx="2" transform="rotate(-25 20 15)"/>
      </g>

      <g transform="translate(35, -5)">
        <path d="M 10 -5 Q 5 -15 12 -25 Q 19 -35 12 -45" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.65" className="animate-steam-1" />
        <path d="M 18 -5 Q 13 -15 20 -25 Q 27 -35 20 -45" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" className="animate-steam-2" />
        <rect x="3" y="0" width="24" height="24" fill="#00ACC1" rx="3" />
        <path d="M 27 6 Q 32 10 27 15" fill="none" stroke="#00ACC1" strokeWidth="3" strokeLinecap="round" />
      </g>
    </g>

    {/* Small side table under the potted plant */}
    <g transform="translate(35, 380)">
      {/* Table top */}
      <rect x="0" y="0" width="130" height="14" fill="#8B5E3C" rx="3" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
      {/* Table edge highlight */}
      <rect x="0" y="0" width="130" height="4" fill="#A67C52" rx="2" />
      {/* Left leg */}
      <rect x="12" y="14" width="10" height="38" fill="#5C4033" rx="2" />
      {/* Right leg */}
      <rect x="108" y="14" width="10" height="38" fill="#5C4033" rx="2" />
      {/* Leg braces */}
      <rect x="18" y="42" width="94" height="4" fill="#5C4033" rx="1" />
    </g>

    {/* Cozy Potted Plant (on the table) */}
    <g transform="translate(40, 140)" className="animate-plant-sway">
      <path d="M 30 150 L 50 240 L 90 240 L 110 150 Z" fill="#E67E22" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }} />
      <rect x="25" y="140" width="90" height="15" fill="#D35400" rx="4" />
      <path d="M 70 140 Q 20 50 10 90 Q 40 120 70 140 Z" fill="#4CAF50" />
      <path d="M 70 140 Q 70 10 100 40 Q 90 100 70 140 Z" fill="#2E7D32" />
      <path d="M 70 140 Q 140 60 130 110 Q 90 130 70 140 Z" fill="#81C784" />
      <path d="M 70 140 Q 30 110 50 135 Z" fill="#66BB6A" />
    </g>

    {/* Tablet on Kitchen Counter */}
    <g transform="translate(850, 240)">
       <rect width="50" height="70" fill="#34495E" rx="6" transform="rotate(15)" style={{ filter: 'drop-shadow(2px 3px 4px rgba(0,0,0,0.2))' }} />
       <rect x="4" y="4" width="42" height="62" fill="#ECF0F1" rx="4" transform="rotate(15)" />
       <rect x="10" y="15" width="20" height="30" fill="#3498DB" rx="2" transform="rotate(15)" />
       <line x1="35" y1="15" x2="40" y2="15" stroke="#95A5A6" strokeWidth="3" transform="rotate(15)" />
       <line x1="10" y1="52" x2="40" y2="52" stroke="#95A5A6" strokeWidth="3" transform="rotate(15)" />
    </g>

    {/* MODERN FLOOR LAMP */}
    <g transform="translate(680, 180)">
      <line x1="30" y1="20" x2="30" y2="300" stroke="#CFD8DC" strokeWidth="8" />
      <ellipse cx="30" cy="300" rx="40" ry="12" fill="#90A4AE" />
      <path d="M 5 50 L 55 50 L 45 10 L 15 10 Z" fill="#37474F" />
      <ellipse cx="30" cy="50" rx="25" ry="8" fill="#FFF59D" />
      <polygon points="30,50 -20,300 130,300" fill="url(#lampLightCone)" opacity="0.45" />
    </g>

    {/* Sleeping cat bottom right with animated ZzzZ */}
    <g transform="translate(870, 495)">
      {/* Cat body (curled sleeping) */}
      <ellipse cx="45" cy="35" rx="38" ry="22" fill="#4A3728" />
      {/* Head */}
      <circle cx="72" cy="32" r="18" fill="#4A3728" />
      {/* Ear left */}
      <path d="M 58 18 L 52 6 L 66 16 Z" fill="#3A2A20" />
      {/* Ear right */}
      <path d="M 78 20 L 88 8 L 82 18 Z" fill="#3A2A20" />
      {/* Closed eyes */}
      <path d="M 65 28 Q 68 26 71 28" fill="none" stroke="#2A1F18" strokeWidth="2" strokeLinecap="round" />
      <path d="M 77 28 Q 80 26 83 28" fill="none" stroke="#2A1F18" strokeWidth="2" strokeLinecap="round" />
      {/* Nose */}
      <ellipse cx="74" cy="35" rx="3" ry="2" fill="#2A1F18" />
      {/* Paws / front */}
      <ellipse cx="55" cy="52" rx="7" ry="5" fill="#3A2A20" />
      <ellipse cx="38" cy="50" rx="8" ry="5" fill="#3A2A20" />
      {/* Tail curled */}
      <path d="M 12 42 Q 5 28 18 18" fill="none" stroke="#4A3728" strokeWidth="11" strokeLinecap="round" />
      <path d="M 12 42 Q 5 28 18 18" fill="none" stroke="#3A2A20" strokeWidth="7" strokeLinecap="round" />

      {/* Animated ZzzZ */}
      <g>
        <text x="85" y="8" fontSize="16" fill="#6B7280" className="animate-zzz" fontFamily="serif" fontWeight="bold">Z</text>
        <text x="100" y="0" fontSize="13" fill="#9CA3AF" className="animate-zzz2" fontFamily="serif">z</text>
        <text x="112" y="-10" fontSize="11" fill="#D1D5DB" className="animate-zzz3" fontFamily="serif">Z</text>
      </g>
      {/* Subtle floor shadow under cat */}
      <ellipse cx="48" cy="62" rx="32" ry="6" fill="#000000" opacity="0.12" />
    </g>
  </svg>
);

interface CoreValuesInteractiveViewerProps {
  onComplete?: () => void;
}

export default function CoreValuesInteractiveViewer({ onComplete }: CoreValuesInteractiveViewerProps) {
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [completedHotspots, setCompletedHotspots] = useState<string[]>([]);
  const [interactionPhase, setInteractionPhase] = useState(1);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [eyesClosed, setEyesClosed] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = brandStyles;
    document.head.appendChild(styleSheet);
    return () => { document.head.removeChild(styleSheet); };
  }, []);

  const showLegacyArt = false;
  if (!showLegacyArt) {
    return (
      <GAO001SharedOverlay
        imageSrc={gao001SceneArt['scene-04'].src}
        altText={gao001SceneArt['scene-04'].alt}
        objective="Learn what makes home health different."
        onComplete={onComplete}
        hotspots={[
          {
            id: 'observe', x: 25, y: 40, label: 'Observe the home',
            fieldNotes: {
              title: 'Observe the Home',
              content: 'In home health, the patient\'s environment provides critical context for their care and recovery.'
            }
          },
          {
            id: 'routines', x: 75, y: 40, label: 'Respect routines',
            fieldNotes: {
              title: 'Respect Routines',
              content: 'We are guests in their home. Adapt your care delivery to respect their established routines when safe.'
            }
          },
          {
            id: 'safety', x: 25, y: 60, label: 'Notice safety context',
            fieldNotes: {
              title: 'Safety Context',
              content: 'Identify fall risks, medication storage issues, or environmental hazards that might not be visible in a facility.'
            }
          },
          {
            id: 'person', x: 75, y: 60, label: 'See the whole person',
            fieldNotes: {
              title: 'See the Whole Person',
              content: 'Home care allows us to understand the patient holistically—their family dynamics, resources, and daily life.'
            }
          }
        ]}
      />
    );
  }

  // Auto Blinking Logic for characters
  useEffect(() => {
    let blinkTimeout: number;
    const triggerBlink = () => {
      const delay = Math.random() * 4000 + 1500;
      blinkTimeout = window.setTimeout(() => {
        setEyesClosed(true);
        setTimeout(() => {
          setEyesClosed(false);
          triggerBlink();
        }, 120);
      }, delay);
    };
    triggerBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  const activeHotspot = SCENE_HOTSPOTS.find(h => h.id === activeHotspotId);
  const isFullyComplete = completedHotspots.length === SCENE_HOTSPOTS.length;

  useEffect(() => {
    if (isFullyComplete && onComplete) {
      onComplete();
    }
  }, [isFullyComplete, onComplete]);

  const handleHotspotClick = (id: string) => {
    if (completedHotspots.includes(id)) return;
    synth.playClick();
    setActiveHotspotId(id);
    setInteractionPhase(1);
    setSelectedValue(null);
    setSelectedAction(null);
  };

  const closeInteraction = () => {
    synth.playClick();
    setActiveHotspotId(null);
  };

  const triggerShake = (id: string) => {
    synth.playError();
    setShakeId(id);
    setTimeout(() => setShakeId(null), 400);
  };

  const handleValueSelect = (valueId: string) => {
    if (interactionPhase !== 1) return;
    setSelectedValue(valueId);

    if (valueId === activeHotspot?.targetValueId) {
      synth.playClick();
      setTimeout(() => setInteractionPhase(2), 550);
    } else {
      triggerShake(valueId);
      setTimeout(() => setSelectedValue(null), 850);
    }
  };

  const handleActionSelect = (action: any) => {
    if (interactionPhase !== 2) return;
    setSelectedAction(action.id);

    if (action.isCorrect) {
      synth.playChime();
      setTimeout(() => {
        setInteractionPhase(3);
        if (activeHotspotId && !completedHotspots.includes(activeHotspotId)) {
          setCompletedHotspots(prev => [...prev, activeHotspotId]);
        }
      }, 550);
    } else {
      triggerShake(action.id);
      setTimeout(() => setSelectedAction(null), 850);
    }
  };

  const toggleMute = () => {
    synth.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const resetProgress = () => {
    synth.playChime();
    setCompletedHotspots([]);
    setActiveHotspotId(null);
    setInteractionPhase(1);
    setSelectedValue(null);
    setSelectedAction(null);
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden relative rounded-2xl border border-[#E5E4E3] font-sans">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#E5E4E3] bg-white flex justify-between items-center z-10 shrink-0">
        <div>
          <h2 className="text-lg font-semibold text-[#007970]">Virtual Field Visit</h2>
          <p className="text-xs text-[#747470] mt-0.5">Explore the scene. Identify the correct Core Values in action.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#007970] bg-[#E5FEFF] px-3 py-1 rounded-lg border border-[#C4F4F5]">
            <Eye className="w-3.5 h-3.5" />
            {completedHotspots.length} / {SCENE_HOTSPOTS.length} Solved
          </div>

          {/* Controls */}
          <button
            onClick={toggleMute}
            className={`p-1.5 rounded-lg border transition-all text-[#007970] ${isMuted ? 'bg-rose-100 border-rose-200' : 'bg-white hover:bg-[#E5FEFF] border-[#C4F4F5]'}`}
            title={isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={resetProgress}
            className="p-1.5 rounded-lg border border-[#C4F4F5] bg-white hover:bg-[#E5FEFF] text-[#007970]"
            title="Reset scene"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className="flex-1 relative bg-[#FDF8F3] overflow-hidden">
        <SceneArtwork eyesClosed={eyesClosed} />

        {/* Hotspots - using top/left as in the new file */}
        {SCENE_HOTSPOTS.map((spot) => {
          const isComplete = completedHotspots.includes(spot.id);
          return (
            <div
              key={spot.id}
              className="absolute z-10 flex flex-col items-center gap-1.5 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-105"
              style={spot.position as React.CSSProperties}
            >
              <button
                onClick={() => handleHotspotClick(spot.id)}
                className={`relative group ${isComplete ? '' : 'animate-ping-slow'}`}
                aria-label={`Investigate ${spot.title}`}
              >
                {!isComplete && (
                  <div className="absolute inset-0 bg-[#C74601] rounded-full animate-ping-slow opacity-60" />
                )}
                <div className={`relative w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-colors border-4 border-white
                  ${isComplete ? 'bg-[#007970]' : 'bg-[#C74601] group-hover:bg-[#A63A01]'}`}>
                  {isComplete ? (
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  ) : (
                    <span className="text-white font-bold text-base">?</span>
                  )}
                </div>
              </button>
              <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-bold text-[#007970] shadow border border-[#E5FEFF] whitespace-nowrap uppercase tracking-wider">
                {spot.title}
              </div>
            </div>
          );
        })}

        {/* Interaction Overlay */}
        {activeHotspot && (
          <div className="absolute inset-0 bg-[#0F5B54]/60 backdrop-blur-sm z-20 flex items-center justify-center p-6 animate-pop-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-full overflow-y-auto flex flex-col border-2 border-[#EEF4F3]">

              <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-[#EEF4F3] p-2 rounded-lg text-[#0F5B54]">
                    <activeHotspot.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0F5B54] text-[15px] leading-tight">{activeHotspot.title}</h3>
                    <span className="text-[#64748B] text-xs font-medium uppercase tracking-wider">Field Observation</span>
                  </div>
                </div>
                {interactionPhase === 3 && (
                  <button onClick={closeInteraction} className="p-2 text-[#94A3B8] hover:text-[#0F5B54] hover:bg-[#EEF4F3] rounded-full transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>

              <div className="p-6 flex flex-col gap-6">
                <div className="bg-[#F8FAFC] p-5 rounded-xl border border-[#E2E8F0] relative">
                  <div className="absolute -top-3 left-4 bg-white px-3 py-0.5 text-[10px] font-bold text-[#C74601] uppercase tracking-widest border border-[#C74601]/30 rounded-full flex items-center gap-1.5 shadow-sm">
                    <MessageCircle className="w-3 h-3 text-[#C74601]" /> {activeHotspot.actor}
                  </div>
                  <p className="text-[#2D3748] text-[14px] leading-relaxed mt-2">
                    "{activeHotspot.dialogue}"
                  </p>
                </div>

                <div className={`transition-all duration-500 ${interactionPhase >= 1 ? 'opacity-100' : 'opacity-0 hidden'}`}>
                  <h4 className="font-bold text-xs text-[#2D3748] mb-3 uppercase tracking-wider flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${interactionPhase > 1 ? 'bg-[#007970]' : 'bg-[#C74601]'}`}>
                      {interactionPhase > 1 ? <Check className="w-3 h-3" /> : '1'}
                    </span>
                    Which Core Value applies here?
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {CORE_VALUES.map((cv) => {
                      const isSelected = selectedValue === cv.id;
                      const isCorrect = isSelected && cv.id === activeHotspot.targetValueId;
                      const isWrong = isSelected && !isCorrect;
                      const isShaking = shakeId === cv.id;
                      const disabled = interactionPhase > 1;

                      let btnClass = "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#007970]/30 hover:bg-[#E5FEFF]";
                      if (isCorrect || (disabled && cv.id === activeHotspot.targetValueId)) {
                        btnClass = "bg-[#E5FEFF] border-[#007970] text-[#007970] shadow-sm ring-1 ring-[#007970]";
                      } else if (isWrong) {
                        btnClass = "bg-[#FEF2F2] border-[#EF4444] text-[#EF4444]";
                      } else if (disabled) {
                        btnClass += " opacity-40 grayscale";
                      }

                      return (
                        <button
                          key={cv.id}
                          onClick={() => handleValueSelect(cv.id)}
                          disabled={disabled}
                          className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all duration-200 text-left ${btnClass} ${isShaking ? 'animate-shake' : ''}`}
                        >
                          <cv.icon className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
                          <span className="text-[13px] font-semibold">{cv.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {interactionPhase >= 2 && (
                  <div className="animate-slide-up border-t border-[#E2E8F0] pt-6">
                    <h4 className="font-bold text-xs text-[#2D3748] mb-3 uppercase tracking-wider flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${interactionPhase > 2 ? 'bg-[#007970]' : 'bg-[#C74601]'}`}>
                        {interactionPhase > 2 ? <Check className="w-3 h-3" /> : '2'}
                      </span>
                      {activeHotspot.question2}
                    </h4>
                    <div className="space-y-3">
                      {activeHotspot.options.map((opt: any) => {
                        const isSelected = selectedAction === opt.id;
                        const isCorrect = isSelected && opt.isCorrect;
                        const isWrong = isSelected && !isCorrect;
                        const isShaking = shakeId === opt.id;
                        const disabled = interactionPhase > 2;

                        let btnClass = "bg-white border-[#E2E8F0] text-[#4A5568] hover:border-[#007970]/30 hover:bg-[#E5FEFF]";
                        let iconColor = "text-[#A0AEC0]";

                        if (isCorrect) {
                          btnClass = "bg-[#E5FEFF] border-[#007970] text-[#007970] shadow-sm ring-1 ring-[#007970]";
                          iconColor = "text-[#007970]";
                        } else if (isWrong) {
                          btnClass = "bg-[#FEF2F2] border-[#EF4444] text-[#EF4444]";
                          iconColor = "text-[#EF4444]";
                        } else if (disabled) {
                          btnClass += " opacity-40";
                        }

                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleActionSelect(opt)}
                            disabled={disabled}
                            className={`w-full p-4 rounded-xl border-2 flex items-start gap-3 transition-all duration-200 text-left ${btnClass} ${isShaking ? 'animate-shake' : ''}`}
                          >
                            <div className={`mt-0.5 flex-shrink-0 ${iconColor}`}>
                              {isCorrect ? <CheckCircle2 className="w-5 h-5" /> :
                              isWrong ? <XCircle className="w-5 h-5" /> :
                              <div className="w-5 h-5 rounded-full border-2 border-current opacity-30" />}
                            </div>
                            <span className="text-[13px] leading-relaxed">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {interactionPhase === 3 && (
                  <div className="animate-slide-up bg-[#007970] text-white p-5 rounded-xl flex flex-col gap-4 shadow-lg border border-[#004142]">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="w-6 h-6 text-[#E5FEFF] flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-[14px] mb-1 text-white">Behavior Aligned</h4>
                        <p className="text-[13px] leading-relaxed text-[#E5FEFF] opacity-90">{activeHotspot.feedback}</p>
                      </div>
                    </div>
                    <button
                      onClick={closeInteraction}
                      className="w-full py-3 bg-[#C74601] hover:bg-[#A63A01] text-white rounded-lg font-bold text-[13px] uppercase tracking-widest transition-colors shadow-sm"
                    >
                      RETURN TO SCENE
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Full Completion Overlay */}
        {isFullyComplete && !activeHotspotId && (
          <div className="absolute inset-0 bg-[#007970]/85 backdrop-blur-md z-30 flex items-center justify-center p-6 animate-pop-in">
            <div className="bg-white p-8 rounded-2xl shadow-2xl border-4 border-[#E5FEFF] text-center max-w-md">
              <div className="w-20 h-20 bg-[#E5FEFF] rounded-full flex items-center justify-center mb-5 mx-auto">
                <ShieldCheck className="w-10 h-10 text-[#007970]" />
              </div>
              <h3 className="text-xl font-bold text-[#007970] mb-2">Scene Complete</h3>
              <p className="text-sm text-[#524C4B] leading-relaxed mb-6">
                You have successfully identified and applied Care Indeed's Core Values to all observations.
              </p>
              <div className="inline-flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest bg-[#C74601] px-5 py-2.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4" /> Core Values Practice Complete
              </div>
              <button onClick={resetProgress} className="mt-4 text-xs text-[#007970] underline">Restart</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
