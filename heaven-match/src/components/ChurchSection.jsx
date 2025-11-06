import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';

// --- Data for different religious traditions with image URLs ---
const RELIGIONS = [
  {
    name: 'Hindu Dharma',
    // Using a placeholder image URL for Mandap theme
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQF4XyF2EIUEbeNIgs6CwanDvags6oX0qtVig&s',
    color: 'orange',
    title: 'The Pavitra Bandhan (Sacred Bond)',
    description: "The journey begins with Dharma (righteous duty). We honor the sanctity of traditional Hindu unions, ensuring alignment not just between individuals, but between their families and values.",
    features: ['Matchmaking based on shared Dharma', 'Family and cultural alignment prioritized', 'Solemnizing vows under the Mandap'],
  },
  {
    name: 'Christianity',
    // Using a placeholder image URL for Church theme
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1W92K9QESiB7dZiPw7edSBYq64A1Ftrk74w&s',
    color: 'blue',
    title: 'The Holy Covenant of Eternal Love',
    description: "Marriage is a sacred covenant. We help you find a partner dedicated to building a home founded on faith, mutual respect, and the promise of everlasting companionship.",
    features: ['Partners committed to shared faith', 'Community and church alignment', 'Building a foundation of Christian values'],
  },
  {
    name: 'Islam',
    // Using a placeholder image URL for Nikaah theme
    imageUrl: 'https://www.brides.com/thmb/NeCEaD8cpw9yi5GMPD0ApHh4xWw=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/nikah-wedding-getty-images-08308e0e82d14cf2895235cf3da993c3.jpg',
    color: 'green',
    title: 'The Solemn Contract of Nikaah',
    description: "We respect the sanctity of Nikaah, the solemn contract between a man and a woman. Our matches prioritize piety, shared spiritual goals, and family consensus.",
    features: ['Focus on spiritual compatibility', 'Respect for Sharia and Islamic law', 'Facilitating contact with Wali (guardian)'],
  },
  {
    name: 'Sikhism',
    // Using a placeholder image URL for Anand Karaj theme
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZlIhtfYfxFVX1fDVHPKVTH1I_bYfrfvDgbw&s',
    color: 'yellow',
    title: 'Anand Karaj (Blissful Union)',
    description: "The Anand Karaj is a ceremony of bliss. We connect souls seeking a partnership rooted in service (Seva), equality, and devotion to the Guru Granth Sahib.",
    features: ['Partners dedicated to Seva and equality', 'Respect for Anand Karaj traditions', 'Matches based on shared Punjabi heritage'],
  },
];

/**
 * Renders a carded carousel showcasing the platform's commitment to supporting 
 * traditional and religious values across multiple faiths.
 */
const MandapSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentReligion = RELIGIONS[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % RELIGIONS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + RELIGIONS.length) % RELIGIONS.length);
  };

  // Utility classes for dynamic colors
  const bgColor = `bg-${currentReligion.color}-50`;
  const iconColor = `text-${currentReligion.color}-600`;
  const featureBg = `bg-${currentReligion.color}-100`;

  return (
    <section className="py-20 bg-gray-50 relative overflow-hidden font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            A Partnership Rooted in Faith, Honoring All Traditions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our commitment goes beyond compatibility—we match you with partners who share your deepest spiritual and cultural foundations, regardless of denomination.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Card View */}
          <div 
            className={`transition-all duration-700 ease-in-out p-6 md:p-12 rounded-3xl shadow-2xl ${bgColor} border-4 border-${currentReligion.color}-200`}
          >
            <div className="grid md:grid-cols-12 gap-8 items-center">
              
              {/* Image/Symbol Column (Left) */}
              <div className="md:col-span-4 flex flex-col items-center justify-start text-center bg-white rounded-xl shadow-lg overflow-hidden h-full">
                {/* 👇 Swapped emoji for image */}
                <img
                  src={currentReligion.imageUrl}
                  alt={`${currentReligion.name} ceremony representation`}
                  className="w-full h-auto object-cover transition-transform duration-500 transform hover:scale-105"
                  // Fallback for image loading error
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/300x200/CCCCCC/000000?text=Image+Error"; }}
                />
                <div className="p-4 w-full">
                  <h3 className={`text-2xl font-bold ${iconColor}`}>{currentReligion.name}</h3>
                </div>
              </div>
              
              {/* Content Column (Right) */}
              <div className="md:col-span-8 space-y-6">
                
                {/* Feature Callout / Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${featureBg} ${iconColor} self-start`}>
                  <Heart className="w-4 h-4 fill-current" />
                  <span className="font-semibold">{currentReligion.title}</span>
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900">
                  {currentReligion.name}: {currentReligion.title}
                </h2>
                
                <p className="text-gray-700 text-lg">
                  {currentReligion.description}
                </p>
                
                {/* Key Feature List */}
                <div className="space-y-3">
                  {currentReligion.features.map((text, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full ${featureBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <div className={`w-2 h-2 rounded-full ${iconColor} bg-current`}></div>
                      </div>
                      <p className="text-gray-700">{text}</p>
                    </div>
                  ))}
                </div>
                
                {/* Call to Action Button */}
                <button 
                  className={`mt-6 w-full sm:w-auto px-8 py-3 text-lg font-semibold rounded-lg bg-pink-600 text-white shadow-xl hover:bg-pink-700 transition duration-300 transform hover:-translate-y-0.5`}
                >
                  Find Matches in {currentReligion.name}
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button 
            onClick={handlePrev}
            className="absolute top-1/2 left-0 md:-left-12 transform -translate-y-1/2 p-3 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors z-10"
            aria-label="Previous Tradition"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button 
            onClick={handleNext}
            className="absolute top-1/2 right-0 md:-right-12 transform -translate-y-1/2 p-3 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors z-10"
            aria-label="Next Tradition"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </div>
        
        {/* Navigation Dots */}
        <div className="flex justify-center mt-8 space-x-2">
          {RELIGIONS.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentIndex === index ? 'bg-pink-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to ${RELIGIONS[index].name}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MandapSection;