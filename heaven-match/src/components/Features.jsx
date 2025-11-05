import React from 'react';
import { Brain, Shield, Lock, Users, MessageCircle } from 'lucide-react'; 
import Card from './ui/Card';
import { AIIcebreakerDemo } from './ui/AIIceBreakerDemo';
import { AICoachDemo } from './ui/AIPersonalCoach'; 

export const Features = () => {
  const features = [
    { 
      icon: Brain, 
      title: "Deep Compatibility AI", 
      description: "Our AI algorithm analyzes personality, values, and life goals to find matches with true, deep-rooted compatibility." 
    },
    { 
      icon: Users, 
      title: "Behavioral Matchmaking", 
      description: "The system learns from your interactions, refining your potential matches based on who you show interest in." 
    },
    { 
      icon: Shield, 
      title: "AI-Assisted Verification", 
      description: "We use advanced AI to verify profiles, ensuring a safe and authentic community free from fakes and scammers." 
    },
    
    { 
      title: "Smart Icebreakers",
      isDemo: true,
      demoType: "icebreaker" 
    },
    { 
      title: "AI Relationship Coach", 
      isDemo: true,
      demoType: "coach"  
    },
    { 
      icon: Lock, 
      title: "Total Privacy Control", 
      description: "Your data trains our AI anonymously, but you always have full control over who sees your profile and photos." 
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
            Our Intelligent AI Does the Work
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            We've built a world-class AI to take the guesswork out of finding love. Focus on the connection, we'll handle the matching.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            feature.isDemo ? (
              feature.demoType === "icebreaker" ? (
                <AIIcebreakerDemo key={feature.title} />
              ) : (
                <AICoachDemo key={feature.title} />
              )
            ) : (
              <Card key={feature.title}>
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 bg-pink-100 rounded-full group-hover:bg-pink-200 transition-colors">
                    <feature.icon className="w-8 h-8 text-pink-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </Card>
            )
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
