import { useState } from 'react';
import type { SceneProps } from './gao001-shared';
import { CheckCircle2, ChevronRight, BookOpen, ClipboardCheck, MessageSquare, BadgeIcon } from 'lucide-react';

export default function Scene01WelcomeDesk({ onComplete, isCompleted }: SceneProps) {
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [itemsViewed, setItemsViewed] = useState<Set<string>>(new Set());

  const handleItemClick = (item: string) => {
    setActiveItem(item);
    const newViewed = new Set(itemsViewed).add(item);
    setItemsViewed(newViewed);
    
    if (newViewed.size === 4 && !isCompleted) {
      onComplete();
    }
  };

  const deskItems = [
    { 
      id: 'badge', 
      title: 'Alex\'s ID Badge', 
      icon: BadgeIcon,
      color: '#0F5B54',
      content: 'Alex Reyes, RN. Always worn visibly in the field. This badge represents trust and Care Indeed\'s standard of excellence.',
      coords: { cx: 190, cy: 370, r: 60 }
    },
    { 
      id: 'checklist', 
      title: 'Orientation Checklist', 
      icon: ClipboardCheck,
      color: '#C74601',
      content: 'Today\'s focus: Mission, vision, core values, and home health conduct. Completion here is a training milestone, separate from generic policy workflows.',
      coords: { cx: 590, cy: 320, r: 80 }
    },
    { 
      id: 'notebook', 
      title: 'Field Notebook', 
      icon: BookOpen,
      color: '#1E3A3A',
      content: 'This module is about practical field expectations, not just corporate slogans. Alex starts as a skilled clinician learning how Care Indeed judgment shows up in real homes.',
      coords: { cx: 380, cy: 430, r: 80 }
    },
    { 
      id: 'message', 
      title: 'First Message', 
      icon: MessageSquare,
      color: '#D89E39',
      content: '"Welcome to GAO-001. The goal is simple: know what this module is about and how the week will build. Take a moment to review your desk before we begin."',
      coords: { cx: 400, cy: 140, r: 100 }
    }
  ];

  return (
    <div className="w-full h-[680px] bg-[#FDF8F3] p-4 md:p-6 flex flex-col items-center justify-start overflow-hidden font-sans">
      
      {/* Top Banner / Instructions */}
      <div className="w-full max-w-[1000px] mb-4 bg-white p-4 rounded-xl shadow-sm border border-[#E5E4E3] flex justify-between items-center z-10">
        <div>
          <h2 className="text-xl font-bold text-[#0F5B54]">Welcome Desk</h2>
          <p className="text-sm text-[#475569] mt-1">
            Tap each item on Alex's desk to prepare for the field ({itemsViewed.size}/4 items reviewed).
          </p>
        </div>
        {itemsViewed.size === 4 && (
          <div className="flex items-center text-[#0F5B54] font-semibold animate-pulse">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Desk Organized
          </div>
        )}
      </div>

      <div className="flex-1 w-full max-w-[1000px] flex gap-6 z-10">
        
        {/* Interactive Desk Surface */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-[#E5E4E3] relative overflow-hidden group">
          <svg viewBox="0 0 800 600" className="w-full h-full object-cover">
            <defs>
              <pattern id="wood" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect width="100" height="100" fill="#EADCC7" />
                <path d="M 0 20 Q 50 10 100 30 M 0 60 Q 50 50 100 70 M 0 90 Q 50 80 100 90" fill="none" stroke="#DFCFB7" strokeWidth="2" opacity="0.6"/>
              </pattern>
              <filter id="shadow">
                <feDropShadow dx="2" dy="4" stdDeviation="4" floodOpacity="0.15" />
              </filter>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Desk Surface */}
            <rect x="0" y="0" width="800" height="600" fill="url(#wood)" />

            {/* Laptop / Screen */}
            <g transform="translate(250, 40)" filter="url(#shadow)">
              <rect x="0" y="0" width="300" height="200" fill="#B0BEC5" rx="8" />
              <rect x="10" y="10" width="280" height="160" fill="#1C2833" rx="4" />
              <rect x="120" y="180" width="60" height="15" fill="#90A4AE" rx="2" />
              <rect x="20" y="20" width="260" height="40" fill="#0F5B54" opacity="0.8" rx="2" />
              <circle cx="40" cy="40" r="10" fill="#FFFFFF" opacity="0.5" />
              <rect x="60" y="35" width="100" height="10" fill="#FFFFFF" opacity="0.8" rx="2" />
              <rect x="20" y="70" width="200" height="8" fill="#FFFFFF" opacity="0.4" rx="2" />
              <rect x="20" y="90" width="240" height="8" fill="#FFFFFF" opacity="0.4" rx="2" />
            </g>

            {/* Clipboard / Checklist */}
            <g transform="translate(520, 220) rotate(15)" filter="url(#shadow)">
              <rect x="0" y="0" width="140" height="200" fill="#A1887F" rx="4" />
              <rect x="5" y="25" width="130" height="170" fill="#FDF8F3" rx="2" />
              <rect x="40" y="5" width="60" height="15" fill="#CFD8DC" rx="2" />
              <circle cx="20" cy="50" r="4" fill="#0F5B54" />
              <rect x="35" y="47" width="80" height="6" fill="#B0BEC5" rx="2" />
              <circle cx="20" cy="70" r="4" fill="#E0E0E0" />
              <rect x="35" y="67" width="70" height="6" fill="#B0BEC5" rx="2" />
              <circle cx="20" cy="90" r="4" fill="#E0E0E0" />
              <rect x="35" y="87" width="85" height="6" fill="#B0BEC5" rx="2" />
            </g>

            {/* Field Notebook */}
            <g transform="translate(300, 320) rotate(-5)" filter="url(#shadow)">
              <rect x="0" y="0" width="160" height="220" fill="#1E3A3A" rx="4" />
              <rect x="20" y="0" width="2" height="220" fill="#0A1818" />
              <rect x="40" y="30" width="80" height="40" fill="#FDF8F3" rx="2" />
              <text x="80" y="55" fontSize="16" fill="#1E3A3A" textAnchor="middle" fontWeight="bold">NOTES</text>
            </g>

            {/* ID Badge */}
            <g transform="translate(150, 320) rotate(-20)" filter="url(#shadow)">
              <rect x="0" y="0" width="80" height="120" fill="#FFFFFF" rx="4" />
              <rect x="10" y="15" width="60" height="30" fill="#0F5B54" rx="2" />
              <circle cx="40" cy="70" r="15" fill="#CFD8DC" />
              <rect x="20" y="95" width="40" height="6" fill="#475569" rx="2" />
              <path d="M 30 -40 Q 40 -80 50 -40 L 45 5 L 35 5 Z" fill="none" stroke="#34495E" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Interactive Hitboxes */}
            {deskItems.map(item => {
              const isViewed = itemsViewed.has(item.id);
              const isActive = activeItem === item.id;
              
              return (
                <g key={item.id} className="cursor-pointer" onClick={() => handleItemClick(item.id)}>
                  <circle 
                    cx={item.coords.cx} 
                    cy={item.coords.cy} 
                    r={item.coords.r} 
                    fill={isViewed ? "rgba(15, 91, 84, 0.2)" : "rgba(255, 255, 255, 0.3)"}
                    className="transition-all duration-300 hover:fill-white/40"
                  />
                  {isActive && (
                    <circle 
                      cx={item.coords.cx} 
                      cy={item.coords.cy} 
                      r={item.coords.r + 5} 
                      fill="none"
                      stroke={item.color}
                      strokeWidth="3"
                      strokeDasharray="8 4"
                      className="animate-spin-slow"
                    />
                  )}
                  {!isViewed && (
                    <circle 
                      cx={item.coords.cx} 
                      cy={item.coords.cy} 
                      r={item.coords.r} 
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      opacity="0.8"
                      className="animate-pulse"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Info Panel */}
        <div className="w-[320px] bg-white rounded-xl shadow-sm border border-[#E5E4E3] p-6 flex flex-col relative overflow-hidden">
          {activeItem ? (
            <div className="h-full flex flex-col animate-in slide-in-from-right-4 fade-in duration-300">
              {(() => {
                const item = deskItems.find(i => i.id === activeItem);
                if (!item) return null;
                const Icon = item.icon;
                return (
                  <>
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                      style={{ backgroundColor: `${item.color}15`, color: item.color }}
                    >
                      <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-[#1E3A3A] mb-3">{item.title}</h3>
                    <p className="text-[#475569] leading-relaxed flex-1">
                      {item.content}
                    </p>
                    {itemsViewed.has(item.id) && (
                      <div className="mt-4 flex items-center text-xs font-semibold text-[#64748B]">
                        <CheckCircle2 size={14} className="mr-1" /> Reviewed
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#94A3B8]">
              <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-4">
                <ChevronRight size={32} className="text-[#CBD5E1]" />
              </div>
              <p>Select an item on the desk to review it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
