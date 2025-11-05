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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
            <Heart className="w-4 h-4 fill-white" />
            <span className="font-medium">Start Your Journey Today</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold">Your Perfect Match Awaits</h2>
          
          <p className="text-lg text-pink-50">
            Join millions of members who have found love and happiness. Create your profile for free and start your journey to finding your soulmate today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button className="bg-white text-pink-600 hover:bg-pink-50 px-8 py-4 rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
              Register Now - It's Free
            </button>
            <button className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-lg font-bold text-lg transition-all">
              View Success Stories
            </button>
          </div>
          
          <p className="text-sm text-pink-100">
            No credit card required • 100% secure • Join in under 2 minutes
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;