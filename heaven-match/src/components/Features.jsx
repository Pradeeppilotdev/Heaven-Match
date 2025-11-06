<<<<<<< HEAD
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
=======
// Features component module: The main container for displaying all AI features and demos.
// This component acts as a central dispatcher, rendering either static feature cards or interactive AI demos.
import React from 'react';
// Import necessary icons from lucide-react.
import { Brain, Shield, Lock, Users, MessageCircle } from 'lucide-react'; 
// Import the generic Card component for consistent UI wrapping.
import Card from './ui/Card';
// Import the individual AI demo components.
import { AIIcebreakerDemo } from './ui/AIIceBreakerDemo';
import { AICoachDemo } from './ui/AIPersonalCoach';
import { DeepCompatibilityDemo } from './ui/DeepCompatibiltyDemo';
import { AIVerificationDemo } from './ui/AIVerification';

/**
 * Renders the main Features section, showcasing both interactive AI demos and static feature descriptions.
 * The layout is a dynamic grid based on the 'features' array configuration.
 * @returns {JSX.Element} The Features section component.
 */
export const Features = () => {
  // Configuration array defining all features and specifying which ones are interactive demos.
  const features = [
    { 
      title: "Deep Compatibility AI",
      isDemo: true,
      demoType: "compatibility" // Key to trigger the DeepCompatibilityDemo component.
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
    },
    { 
      icon: Users, 
      title: "Behavioral Matchmaking", 
      description: "The system learns from your interactions, refining your potential matches based on who you show interest in." 
    },
    { 
<<<<<<< HEAD
      icon: Shield, 
      title: "AI-Assisted Verification", 
      description: "We use advanced AI to verify profiles, ensuring a safe and authentic community free from fakes and scammers." 
    },
    
    { 
      title: "Smart Icebreakers",
      isDemo: true,
      demoType: "icebreaker" 
=======
      title: "AI-Assisted Verification",
      isDemo: true,
      demoType: "verification" // Key to trigger the AIVerificationDemo component.
    },
    { 
      title: "Smart Icebreakers",
      isDemo: true,
      demoType: "icebreaker" // Key to trigger the AIIcebreakerDemo component.
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
    },
    { 
      title: "AI Relationship Coach", 
      isDemo: true,
<<<<<<< HEAD
      demoType: "coach"  
=======
      demoType: "coach"  // Key to trigger the AICoachDemo component.
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
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
<<<<<<< HEAD
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
            Our Intelligent AI Does the Work
=======
        
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900">
            Our **Intelligent AI** Does the Work
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            We've built a world-class AI to take the guesswork out of finding love. Focus on the connection, we'll handle the matching.
          </p>
        </div>
        
<<<<<<< HEAD
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
=======
        {/* Feature Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            // Conditional rendering logic based on whether the feature is a demo or a static card.
            feature.isDemo ? (
              // If it's a demo, dispatch the rendering based on the demoType property.
              feature.demoType === "compatibility" ? (
                <DeepCompatibilityDemo key={feature.title} />
              ) : feature.demoType === "verification" ? (
                <AIVerificationDemo key={feature.title} />
              ) : feature.demoType === "icebreaker" ? (
                <AIIcebreakerDemo key={feature.title} />
              ) : (
                // Fallback for demoType "coach"
                <AICoachDemo key={feature.title} />
              )
            ) : (
              // If it's not a demo, render a standard static Card component.
              <Card key={feature.title}>
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Icon container */}
                  <div className="p-4 bg-pink-100 rounded-full group-hover:bg-pink-200 transition-colors">
                    {/* Render the dynamically passed icon component */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
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

<<<<<<< HEAD
export default Features;
=======
export default Features;
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
