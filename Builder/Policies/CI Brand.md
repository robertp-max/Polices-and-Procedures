import React from 'react';
import { ArrowRight, Quote, HeartPulse, Phone, Clock, ShieldCheck } from 'lucide-react';

export default function App() {
  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Roboto:wght@400;500&display=swap');
          
          .font-montserrat {
            font-family: 'Montserrat', sans-serif;
          }
          .font-roboto {
            font-family: 'Roboto', sans-serif;
          }
        `}
      </style>

      <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center justify-center gap-12 font-roboto">
        
        <div className="text-center max-w-2xl mb-4">
          <h1 className="font-montserrat text-3xl font-bold text-[#007970] mb-4">CareIndeed Branded Cards</h1>
          <p className="text-gray-600">Redesigned adhering strictly to the brand guidelines, utilizing bold contrast and absolutely no pastel shades.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          
          {/* 1. Service Card (Light Theme, Bold Accents) */}
          <div className="bg-white rounded-[16px] overflow-hidden shadow-lg border-b-4 border-[#C74600] transition-transform hover:-translate-y-1 duration-300 flex flex-col">
            <div className="h-48 relative bg-gray-900">
              <img 
                src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=800&auto=format&fit=crop" 
                alt="Skilled Nursing" 
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute top-4 right-4 bg-[#007970] text-white p-2 rounded-full shadow-md">
                <HeartPulse size={24} />
              </div>
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <h3 className="font-montserrat text-2xl font-bold text-[#007970] mb-3">
                Skilled Nursing
              </h3>
              <p className="text-gray-700 leading-relaxed mb-8 flex-grow">
                Advanced nursing care tailored to individual needs. Personalized care plans and expert staffing solutions to improve the lives of seniors.
              </p>
              <button className="w-full bg-[#C74600] hover:bg-[#A83B00] text-white font-montserrat font-bold py-3 px-6 rounded-[8px] flex items-center justify-center transition-colors shadow-md">
                Inquire Now <ArrowRight className="ml-2" size={20} />
              </button>
            </div>
          </div>

          {/* 2. Testimonial Card (Teal Monotone - High Contrast) */}
          <div className="bg-[#007970] rounded-[16px] overflow-hidden shadow-xl text-white p-8 flex flex-col transition-transform hover:-translate-y-1 duration-300 relative">
            <Quote className="text-[#C74600] opacity-80 absolute top-6 right-6" size={48} />
            
            <div className="mb-6 mt-4">
              <div className="flex text-[#C74600] mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <h3 className="font-montserrat text-xl font-bold mb-4 leading-tight">
                "Transforming Care, Uplifting Lives."
              </h3>
              <p className="text-gray-100 leading-relaxed font-roboto">
                I can't say enough good things about the staff and caretakers at Care Indeed. They are easy to deal with and I highly recommend them to any family in need.
              </p>
            </div>
            
            <div className="mt-auto pt-6 border-t border-teal-600 flex items-center">
              <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden mr-4 border-2 border-white">
                 <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" alt="Reviewer" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-montserrat font-bold">Sarah Jenkins</p>
                <p className="text-teal-200 text-sm">Family Member</p>
              </div>
            </div>
          </div>

          {/* 3. Action/Feature Card (Orange Highlight Theme) */}
          <div className="bg-white rounded-[16px] overflow-hidden shadow-lg border border-gray-200 p-8 flex flex-col transition-transform hover:-translate-y-1 duration-300">
            <div className="bg-[#C74600] w-14 h-14 rounded-[12px] flex items-center justify-center mb-6 shadow-md">
              <ShieldCheck className="text-white" size={32} />
            </div>
            
            <h3 className="font-montserrat text-2xl font-bold text-gray-900 mb-3">
              24/7 Premium Support
            </h3>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              Our dedicated team is available around the clock to provide immediate medical staffing and in-home care solutions.
            </p>
            
            <ul className="mb-8 space-y-3 flex-grow">
              <li className="flex items-center text-gray-800 font-medium">
                <Clock className="text-[#007970] mr-3" size={20} /> Round-the-clock availability
              </li>
              <li className="flex items-center text-gray-800 font-medium">
                <HeartPulse className="text-[#007970] mr-3" size={20} /> Certified professionals
              </li>
            </ul>

            <button className="w-full border-2 border-[#007970] text-[#007970] hover:bg-[#007970] hover:text-white font-montserrat font-bold py-3 px-6 rounded-[8px] flex items-center justify-center transition-colors">
              <Phone className="mr-2" size={20} /> Contact Us
            </button>
          </div>

        </div>
      </div>
    </>
  );
}