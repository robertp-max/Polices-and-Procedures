import { useState } from 'react';
import { Download, Printer } from 'lucide-react';

const LOGO_DARK = 'https://dovdry3t4njek.cloudfront.net/assets/ci-logo-gray-Dju7zS6k.png';
const SIGNATURE_SRC = 'image_be8721.png'; // Vanessa Valerio's Signature

export default function ACHCArchivalCertificate() {
  const [recipientName, setRecipientName] = useState('James Bond');
  const [completionDate] = useState(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));

  const handleSigError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).style.display = 'none';
    const sibling = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
    if (sibling) sibling.style.display = 'block';
  };

  // The 12 ACHC Mandatory Topics extracted from your uploaded context document
  const achcTopics = [
    "Cultural Awareness",
    "Emergency / Disaster",
    "Complaints & Grievances",
    "HIPAA Compliance",
    "Infection Control",
    "Communication Barriers",
    "Workplace / Patient Safety (OSHA)",
    "Patient Rights & Responsibilities",
    "Corporate Compliance",
    "Ethics",
    "TB / Blood Borne Pathogens",
    "Medical Device Act"
  ];

  return (
    <div className="min-h-screen bg-[#D9D6D5] text-[#524D4B] font-sans selection:bg-[#E5F0EF] selection:text-[#00797D] flex flex-col items-center py-10">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700;900&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        
        .cert-container { 
            aspect-ratio: 11 / 8.5; /* US Letter Landscape */
            max-width: 1100px;
            width: 100%;
        } 
        
        /* Clean Dark Signature Filter for Light Backgrounds */
        .clean-sig-dark { 
            filter: grayscale(100%) contrast(160%) brightness(115%);
            mix-blend-mode: multiply; 
        }

        /* Seamless Geometric Star Lattice (Inspired by uploaded image) */
        .bg-geometric-arabesque {
            background-color: #002a2b; /* Deep Premium Teal */
            background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23C74601' stroke-width='1.5' stroke-opacity='0.4'%3E%3Crect x='15' y='15' width='30' height='30' transform='rotate(45 30 30)' /%3E%3Crect x='15' y='15' width='30' height='30' /%3E%3Cpath d='M0 30 h15 M45 30 h15 M30 0 v15 M30 45 v15' /%3E%3Crect x='-15' y='-15' width='30' height='30' transform='rotate(45 0 0)' /%3E%3Crect x='-15' y='-15' width='30' height='30' /%3E%3Crect x='45' y='-15' width='30' height='30' transform='rotate(45 60 0)' /%3E%3Crect x='45' y='-15' width='30' height='30' /%3E%3Crect x='-15' y='45' width='30' height='30' transform='rotate(45 0 60)' /%3E%3Crect x='-15' y='45' width='30' height='30' /%3E%3Crect x='45' y='45' width='30' height='30' transform='rotate(45 60 60)' /%3E%3Crect x='45' y='45' width='30' height='30' /%3E%3C/g%3E%3C/svg%3E");
        }
      `}} />

      {/* Control Toolbar */}
      <div className="w-full max-w-5xl bg-white border border-[#D9D6D5] rounded-xl px-6 py-4 mb-8 flex flex-col md:flex-row items-center justify-between shadow-sm gap-4">
        <div>
          <h1 className="text-[#004142] font-bold text-lg">ACHC Training Module Certificate</h1>
          <p className="text-[#7A7470] text-xs font-medium uppercase tracking-wider">The Archival Layout &bull; Geometric Gold Pattern</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <label className="text-[9px] uppercase tracking-widest font-bold text-[#7A7470]">Recipient Name</label>
            <input 
              type="text" 
              value={recipientName} 
              onChange={(e) => setRecipientName(e.target.value)}
              className="border-b border-[#D9D6D5] bg-transparent text-sm focus:outline-none focus:border-[#00797D] text-[#004142] font-semibold w-48"
            />
          </div>
          <div className="h-8 w-px bg-[#D9D6D5]"></div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#FAF8F8] border border-[#E9E5E3] text-[#00797D] font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#E5F0EF] transition">
            <Printer size={14} /> Print
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#00797D] text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#004142] transition shadow-md">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* The Certificate: Archival Layout */}
      <div className="cert-container shadow-[0_30px_60px_-15px_rgba(0,65,66,0.6)] bg-geometric-arabesque p-10 md:p-14 relative flex items-center justify-center">
        
        {/* Outer White Matting Frame */}
        <div className="w-full h-full bg-[#FAF8F8] border-[3px] border-[#C74601]/50 p-2 md:p-3 shadow-2xl relative">
          
          {/* Layered Ornate Corner Accents */}
          {/* Top Left */}
          <div className="absolute top-3 left-3 md:top-4 md:left-4 w-8 h-8 md:w-12 md:h-12 border-t-[3px] border-l-[3px] border-[#004142]"></div>
          <div className="absolute top-5 left-5 md:top-6 md:left-6 w-5 h-5 md:w-8 md:h-8 border-t-[1px] border-l-[1px] border-[#E56E2E]"></div>
          
          {/* Top Right */}
          <div className="absolute top-3 right-3 md:top-4 md:right-4 w-8 h-8 md:w-12 md:h-12 border-t-[3px] border-r-[3px] border-[#004142]"></div>
          <div className="absolute top-5 right-5 md:top-6 md:right-6 w-5 h-5 md:w-8 md:h-8 border-t-[1px] border-r-[1px] border-[#E56E2E]"></div>

          {/* Bottom Left */}
          <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 w-8 h-8 md:w-12 md:h-12 border-b-[3px] border-l-[3px] border-[#004142]"></div>
          <div className="absolute bottom-5 left-5 md:bottom-6 md:left-6 w-5 h-5 md:w-8 md:h-8 border-b-[1px] border-l-[1px] border-[#E56E2E]"></div>

          {/* Bottom Right */}
          <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 w-8 h-8 md:w-12 md:h-12 border-b-[3px] border-r-[3px] border-[#004142]"></div>
          <div className="absolute bottom-5 right-5 md:bottom-6 md:right-6 w-5 h-5 md:w-8 md:h-8 border-b-[1px] border-r-[1px] border-[#E56E2E]"></div>

          {/* Inner Content Boundary */}
          <div className="w-full h-full border border-[#E9E5E3] flex flex-col items-center justify-between py-8 px-10 md:py-10 md:px-14 text-center relative z-10">
            
            {/* Header / Logo */}
            <img src={LOGO_DARK} alt="CareIndeed" className="h-8 md:h-10 opacity-90" />

            {/* Core Certificate Copy */}
            <div className="flex-1 flex flex-col justify-center items-center w-full mt-2">
              <h1 className="text-[#004142] font-serif text-4xl md:text-[3.5rem] leading-tight font-semibold tracking-wide">
                Certificate of Completion
              </h1>
              
              <p className="text-[#E56E2E] font-serif italic text-xl md:text-2xl mt-2 mb-4 md:mb-6">
                This verifies that the requirements have been met by
              </p>
              
              <h3 className="text-[#00797D] font-serif text-4xl md:text-5xl w-full max-w-2xl border-b-2 border-[#7A7470] pb-2 mb-4 md:mb-6 font-bold">
                {recipientName}
              </h3>
              
              {/* Context / Curriculum Integration */}
              <div className="flex flex-col items-center w-full max-w-4xl">
                <p className="text-[#7A7470] font-sans text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold mb-1">
                  For successfully completing the yearly
                </p>
                <h4 className="text-[#004142] font-serif text-2xl md:text-3xl font-bold uppercase tracking-widest mb-4">
                  ACHC Mandatory In-Services
                </h4>

                {/* ACHC Topics Matrix */}
                <div className="w-full bg-[#F3F0EF]/50 border border-[#E9E5E3] p-4 md:p-5 rounded-sm">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-2 md:gap-y-3 text-left">
                    {achcTopics.map((topic, i) => (
                      <div key={i} className="flex items-start gap-2">
                         <span className="text-[#E56E2E] font-serif font-bold text-base md:text-lg leading-none mt-[-2px]">&bull;</span>
                         <span className="text-[#524D4B] font-sans text-[10px] md:text-[11px] uppercase tracking-wider font-semibold leading-tight">
                           {topic}
                         </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Signatures */}
            <div className="w-full flex justify-between items-end mt-4 md:mt-8 px-4 md:px-8">
              
              {/* Left Side Details */}
              <div className="text-left font-sans text-[9px] md:text-[10px] text-[#7A7470] uppercase tracking-widest leading-loose mb-1">
                <p className="border-b border-[#D9D6D5] pb-1 mb-2 w-48 md:w-56 flex justify-between">
                  <span className="font-bold text-[#004142]">Date Issued:</span> 
                  <span>{completionDate}</span>
                </p>
                <p className="border-b border-[#D9D6D5] pb-1 w-48 md:w-56 flex justify-between">
                  <span className="font-bold text-[#004142]">Certificate ID:</span> 
                  <span>ACHC-{new Date().getFullYear()}-001</span>
                </p>
              </div>

              {/* Right Side Signature */}
              <div className="flex flex-col items-center">
                <div className="h-12 md:h-14 relative w-48 md:w-64 flex justify-center items-end mb-1">
                  <img 
                    src={SIGNATURE_SRC} 
                    alt="Vanessa Valerio Signature" 
                    className="max-h-[140%] max-w-full object-contain z-10 -mb-2 clean-sig-dark"
                    onError={handleSigError}
                  />
                  {/* Fallback signature if image fails to load */}
                  <span className="hidden font-serif italic text-2xl md:text-3xl z-0 absolute bottom-1 text-[#004142]">
                    Vanessa Valerio
                  </span>
                </div>
                <div className="w-56 md:w-72 border-t-2 border-[#004142] pt-2 text-center">
                  <p className="font-serif font-bold text-base md:text-lg tracking-wide text-[#004142]">Vanessa Valerio</p>
                  <p className="text-[9px] md:text-[10px] font-sans font-bold tracking-[0.2em] uppercase mt-0.5 text-[#E56E2E]">Program Director</p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}