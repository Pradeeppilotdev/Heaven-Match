import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

// Replicating the minimal Button component structure for context clarity
const Button = ({ children, variant, className, ...props }) => (
  <button
    className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
      variant === 'outline'
        ? 'border-2 border-white text-white hover:bg-white/10 focus:ring-white'
        : 'bg-white text-pink-600 hover:bg-pink-100 focus:ring-pink-500'
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

// Replicating the minimal ChurchArch SVG component for background decoration
const ChurchArch = ({ className, variant }) => (
  <svg
    className={className}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M50 0C22.3858 0 0 22.3858 0 50V100H10C10 77.9086 27.9086 60 50 60C72.0914 60 90 77.9086 90 100H100V50C100 22.3858 77.6142 0 50 0Z"
      fill={variant === 'inverse' ? 'white' : 'black'}
    />
  </svg>
);


// Array of background image URLs for the slider/carousel effect.
const imageUrls = [
  "https://static.vecteezy.com/system/resources/previews/055/683/541/non_2x/romantic-indian-wedding-couple-in-traditional-attire-with-floral-backdrop-photo.jpg",
  "https://www.manifestmagazine.in/_next/image?url=https%3A%2F%2Fcdn.manifestmagazine.in%2Farticle%2F2025-09-12T12%253A38%253A13.101Z-Tying%2520the%2520knot%2520%25283%2529.jpg&w=3840&q=75",
  "https://images.pexels.com/photos/11384496/pexels-photo-11384496.jpeg",
  "https://www.imperial.wedding/storage/blogs/260923065033-Matrimonialsite.jpg",
  "https://static.vecteezy.com/system/resources/thumbnails/044/316/511/small/indian-bride-and-groom-at-amazing-hindu-wedding-ceremony-photo.jpeg"
];

const IMAGE_SWITCH_INTERVAL = 5000; // Time (ms) between image changes.
const FADE_DURATION = 1000; // CSS transition duration (ms) for the fade effect.

/**
 * Renders the main Hero Section with a dynamic, fading background image carousel.
 * @returns {JSX.Element} The Hero component.
 */
export const Hero = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Ref to hold the interval ID, allowing cleanup on unmount.
  const intervalRef = useRef(null);

  // Hook to manage the automatic image cycling.
  useEffect(() => {
    
    intervalRef.current = setInterval(() => {
      // Cycles to the next image index, wrapping around to the start of the array.
      setCurrentImageIndex(prevIndex =>
        (prevIndex + 1) % imageUrls.length
      );
    }, IMAGE_SWITCH_INTERVAL);
    
    // Cleanup function to clear the interval when the component unmounts.
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    // Sets minimum height and relative positioning for background elements.
    <section className="relative overflow-hidden min-h-[80vh] flex items-center justify-center py-20 font-sans">
      
      {/* Dynamic Background Image Container */}
      <div className="absolute inset-0 z-0">
      
        {imageUrls.map((url, index) => (
          <img
            key={url} 
            src={url}
            alt="Beautiful couple background"
            className="w-full h-full object-cover object-center absolute inset-0 transition-opacity"
            style={{
              // Controls visibility: 1 for current image, 0 for others.
              opacity: index === currentImageIndex ? 1 : 0,
              // Sets the speed of the fade transition.
              transitionDuration: `${FADE_DURATION}ms`
            }}
           
            onError={(e) => {
              e.target.style.display = 'none'; // Hide broken images gracefully.
             // Note: A more robust solution might remove the URL from the list.
            }}
          />
        ))}
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Decorative SVG Arch elements (Low opacity for subtle effect) */}
      <div className="absolute top-0 left-0 w-64 h-64 opacity-10">
        <ChurchArch className="w-full h-full" variant="inverse" />
      </div>
      <div className="absolute bottom-0 right-0 w-72 h-72 opacity-10 transform rotate-180">
        <ChurchArch className="w-full h-full" variant="inverse" />
      </div>
     
      {/* Main Content (Centered and above background layers) */}
      <div className="container mx-auto px-4 relative z-10 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="space-y-8">
            {/* AI Callout Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white">
              <span className="font-medium">The Future of Matchmaking is Here</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              AI-Powered Connections for your Soulmate
            </h1>
            
            {/* Subtext */}
            <p className="text-lg max-w-xl mx-auto">
              Our advanced AI goes beyond surface-level traits. We analyze deep compatibility to find a soulmate who truly understands and complements you.
            </p>
            
            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* Primary Button */}
              <Button>
                Find Your Match <ArrowRight className="w-5 h-5" />
              </Button>
              {/* Secondary/Outline Button */}
              <Button variant="outline">
                How Our AI Works
              </Button>
            </div>
            
            {/* Key Metrics/Trust Indicators */}
            <div className="flex gap-8 justify-center text-center pt-4">
              <div className="group cursor-pointer">
                <div className="text-3xl font-bold group-hover:scale-110 transition-transform">95.4%</div>
                <div className="text-sm">AI Match Accuracy</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-3xl font-bold group-hover:scale-110 transition-transform">1M+</div>
                <div className="text-sm">Members</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-3xl font-bold group-hover:scale-110 transition-transform">50K+</div>
                <div className="text-sm">Happy Couples</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;