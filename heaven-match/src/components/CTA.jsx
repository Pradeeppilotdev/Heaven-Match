<<<<<<< HEAD
import React from 'react';
import { Heart } from 'lucide-react';
import  ChurchArch from './ui/ChurchArch';

const CTA = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-pink-500 to-pink-600 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-80 h-80 opacity-20">
        <ChurchArch className="w-full h-full" variant="inverse" />
      </div>
      <div className="absolute bottom-0 right-0 w-96 h-96 opacity-20">
        <ChurchArch className="w-full h-full transform rotate-180" variant="inverse" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8 text-white">
=======
// CTA (Call-to-Action) section component designed for high conversion.
import React from 'react';
import { Heart } from 'lucide-react';
// Assuming ChurchArch is an SVG decorative component for branding consistency.
import ChurchArch from './ui/ChurchArch';

/**
 * Renders a prominent, full-width Call-to-Action section.
 * Uses strong contrast and decorative background elements to draw user attention.
 * @returns {JSX.Element} The CTA section.
 */
const CTA = () => {
  return (
    // Section uses a bold pink gradient background for visual impact.
    <section className="py-20 bg-gradient-to-br from-pink-500 to-pink-600 relative overflow-hidden">
      
      {/* Decorative Background Element (Top-Left) */}
      <div className="absolute top-0 left-0 w-80 h-80 opacity-20">
        <ChurchArch className="w-full h-full" variant="inverse" />
      </div>
      
      {/* Decorative Background Element (Bottom-Right, mirrored) */}
      <div className="absolute bottom-0 right-0 w-96 h-96 opacity-20">
        {/* The SVG is rotated to create a balanced, mirrored look. */}
        <ChurchArch className="w-full h-full transform rotate-180" variant="inverse" />
      </div>
      
      {/* Content Container (Ensure content remains above the decorative SVGs) */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8 text-white">
          
          {/* Tagline/Pre-header with background blur for visual hierarchy */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
            <Heart className="w-4 h-4 fill-white" />
            <span className="font-medium">Start Your Journey Today</span>
          </div>
          
<<<<<<< HEAD
          <h2 className="text-3xl md:text-5xl font-bold">Your Perfect Match Awaits</h2>
          
=======
          {/* Main Headline */}
          <h2 className="text-3xl md:text-5xl font-bold">Your Perfect Match Awaits</h2>
          
          {/* Supporting Text */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
          <p className="text-lg text-pink-50">
            Join millions of members who have found love and happiness. Create your profile for free and start your journey to finding your soulmate today.
          </p>
          
<<<<<<< HEAD
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button className="bg-white text-pink-600 hover:bg-pink-50 px-8 py-4 rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              Register Now - It's Free
            </button>
=======
          {/* Action Buttons: Primary (Registration) and Secondary (Social Proof) */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {/* Primary Button: High contrast, designed to attract immediate clicks. */}
            <button className="bg-white text-pink-600 hover:bg-pink-50 px-8 py-4 rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              Register Now - It's Free
            </button>
            {/* Secondary Button: Outline style for lower priority action. */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
            <button className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg font-bold text-lg transition-all">
              View Success Stories
            </button>
          </div>
          
<<<<<<< HEAD
=======
          {/* Trust/Conversion Reinforcement Text */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
          <p className="text-sm text-pink-100">
            No credit card required • 100% secure • Join in under 2 minutes
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;