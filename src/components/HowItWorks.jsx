import React, { useState, useEffect } from 'react';
import { UserPlus, Sparkles, Send } from 'lucide-react';

// --- THIS IS THE UPDATED PART ---
// We've rewritten the text to focus on AI compatibility.
const stepsData = [
  {
    step: 1,
    title: 'Build Your Smart Profile',
    description: 'Go beyond photos. Add your interests, core values, and life goals to provide the data our compatibility AI needs to learn who you are.',
    icon: UserPlus,
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=800&w=600'
  },
  {
    step: 2,
    title: 'Deep Compatibility Analysis',
    description: 'This is our magic. The AI analyzes hundreds of data points to find matches based on deep-rooted compatibility, personality, and shared long-term goals.',
    icon: Sparkles,
    imageUrl: 'https://dishadeepan.com/wp-content/uploads/2020/10/Blog-5.jpg'
  },
  {
    step: 3,
    title: 'Connect with Confidence',
    description: 'Receive a curated list of your most compatible matches. Skip the guesswork and start meaningful conversations with people you *know* you\'ll click with.',
    icon: Send,
    imageUrl: 'https://images.unsplash.com/photo-1554177255-61502b352de3?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=800&w=600'
  }
];
// --- END OF UPDATED PART ---

export const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-carousel logic
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prevStep) => (prevStep + 1) % stepsData.length);
    }, 5000); // Change step every 5 seconds
    
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-white text-gray-900">
      <div className="container mx-auto px-4">

        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            How Our AI Finds Your Match
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Our process is built on deep compatibility, not just swipes.
          </p>
        </div>

        {/* The "One Box" layout (split into two columns) */}
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          
          {/* --- LEFT SIDE: Phasing Text Content --- */}
          <div className="flex flex-col space-y-8">
            {/* Tab/Button for each step */}
            <div className="flex space-x-4">
              {stepsData.map((step, index) => (
                <button
                  key={step.step}
                  onClick={() => setActiveStep(index)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                    activeStep === index
                      ? 'bg-pink-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <span className="text-sm font-semibold opacity-80">STEP {step.step}</span>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                </button>
              ))}
            </div>

            {/* Phasing Description Area */}
            <div className="relative h-40">
              {stepsData.map((step, index) => (
                <div
                  key={step.step}
                  className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                    activeStep === index
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-5 pointer-events-none'
                  }`}
                >
                  <step.icon className="w-10 h-10 text-pink-500 mb-4" />
                  <p className="text-lg text-gray-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* --- RIGHT SIDE: Phasing Image Content --- */}
          <div className="relative h-[500px] rounded-2xl shadow-xl overflow-hidden">
            {stepsData.map((step, index) => (
              <img
                key={step.step}
                src={step.imageUrl}
                alt={step.title}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                  activeStep === index ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;