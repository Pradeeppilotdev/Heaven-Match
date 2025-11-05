import React from 'react';
import { UserPlus, Brain, Sparkles, HeartHandshake, MessageSquare } from 'lucide-react'; 

const HowItWorks = () => {
  const steps = [
    { 
      icon: UserPlus, 
      title: "Create Your Deep Profile", 
      description: "Go beyond surface-level traits. Our intelligent onboarding captures your unique personality, values, and life goals." 
    },
    { 
      icon: Brain, 
      title: "AI Compatibility Analysis", 
      description: "Our advanced AI analyzes your profile, seeking genuine compatibility on a psychological, emotional, and social level." 
    },
    { 
      icon: Sparkles, 
      title: "Receive AI-Curated Matches", 
      description: "No more endless swiping. We deliver a focused list of highly compatible partners, complete with AI-generated compatibility reports." 
    },
    { 
      icon: HeartHandshake, 
      title: "Connect & Build", 
      description: "Engage in meaningful conversations, confident that you're starting on a foundation of true, data-driven understanding." 
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 to-white relative overflow-hidden font-sans">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900">How Our AI Finds Your Match</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Finding your life partner is simple with our 4-step AI-powered process.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="relative">
             
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-pink-300 to-transparent -z-10"></div>
              )}
              
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <div className="p-6 bg-white rounded-full shadow-lg border-4 border-pink-200 relative z-10 group hover:border-pink-400 transition-colors">
                    <step.icon className="w-10 h-10 text-pink-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center z-20 font-bold border-2 border-white">
                    {index + 1}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;