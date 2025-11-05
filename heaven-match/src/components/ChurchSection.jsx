import React from 'react';
import { Heart } from 'lucide-react'; 

const MandapSection = () => {
  const features = [
   
    'Pavitra Bandhan (Sacred Bond) based on shared Dharma',
    'Family-focused connections honoring cultural traditions',
    'Vows of commitment witnessed by Agni (sacred fire)',
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white via-orange-50 to-white relative overflow-hidden font-sans">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-amber-200">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-auto">
                <img
                  src="https://www.mconventions.com/wp-content/uploads/2023/03/Excellent-Mandap-Decor-by-Sumyog-Wedding-Chennai-weddingnet-wedding-india-indian-indian%E2%80%A6-_-Traditional-wedding-decor-Used-wedding-decor-Wedding-decor-photos.jpg"
                  alt="Traditional Indian wedding Mandap"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-8 md:p-12 flex flex-col justify-center space-y-6">
               
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-600 self-start">
                  <Heart className="w-4 h-4 fill-orange-500" />
                  <span className="font-medium">Pavitra Bandhan (Sacred Bond)</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Find Your Soulmate Under the Auspicious Mandap
                </h2>
                
                <p className="text-gray-600 text-lg">
                  The Mandap is the heart of a Hindu wedding, symbolizing the sacred space where two families unite in duty and love. Our platform upholds these eternal values in every match.
                </p>
                
                <div className="space-y-3">
                  {features.map((text, i) => (
                    <div key={i} className="flex items-start gap-3">
                      
                      <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                      </div>
                      <p className="text-gray-700">{text}</p>
                    </div>
                  ))}
                </div>
                 <button className="mt-6 w-full md:w-auto px-6 py-3 text-lg font-semibold rounded-lg bg-pink-600 text-white shadow-md hover:bg-pink-700 transition duration-300">
                    Discover Matches by Dharma
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MandapSection;