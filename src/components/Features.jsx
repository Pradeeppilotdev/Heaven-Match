import React, { useState } from 'react';
import {
  Wand2,
  HeartHandshake,
  Sparkles,
  ShieldCheck,
  SlidersHorizontal,
  Lock,
  X
} from 'lucide-react';

// Import your interactive demo components
import  AIIcebreakerDemo  from './ui/AIIceBreakerDemo';
import  DeepCompatibiltyDemo  from './ui/DeepCompatibiltyDemo';
import  AIPersonalCoach  from './ui/AIPersonalCoach';
import  AIVerification  from './ui/AIVerification';

/**
 * A reusable, consistent card component for displaying a feature.
 */
const FeatureCard = ({ icon, title, description, onClick }) => {
  const isClickable = !!onClick;
  
  return (
    <div
      onClick={onClick}
      className={`
        flex flex-col bg-white p-6 rounded-2xl border border-gray-200 shadow-sm transition-all duration-300
        ${isClickable ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : ''}
      `}
    >
      <div className="inline-block p-3 bg-pink-50 rounded-full mb-4 w-max">
        {React.cloneElement(icon, { className: "w-7 h-7 text-pink-600" })}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-base text-gray-600">
        {description}
      </p>
      {isClickable && (
        <span className="mt-4 text-sm font-medium text-pink-600">
          Try the demo →
        </span>
      )}
    </div>
  );
};

// --- THIS IS THE NEW, REDESIGNED MODAL ---
/**
 * A reusable Modal component with animations and branding.
 */
const Modal = ({ children, onClose }) => {
  return (
    // 1. Animated Overlay
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 animate-fadeIn"
      onClick={onClose}
    >
      {/* 2. Animated Modal Box */}
      <div
        className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto animate-slideInUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 3. "Something Special" - Pink Brand Bar */}
        <div className="h-2 bg-pink-500 rounded-t-lg"></div>

        {/* 4. Close Button (Fixed Overlap) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 z-10 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 5. Content Wrapper (Fixed Overlap) 
               'pt-16' gives plenty of space for the button and title.
        */}
        <div className="p-8 pt-16">
          {children}
        </div>
      </div>
    </div>
  );
};
// --- END OF NEW MODAL ---


/**
 * The main features section.
 * Manages the state for opening and closing the demo modals.
 */
export const Features = () => {
  const [openModal, setOpenModal] = useState(null);

  const renderModalContent = () => {
    switch (openModal) {
      case 'icebreaker':
        return <AIIcebreakerDemo />;
      case 'compatibility':
        return <DeepCompatibiltyDemo />;
      case 'coach':
        return <AIPersonalCoach />;
      case 'verification':
        return <AIVerification />;
      default:
        return null;
    }
  };

  return (
    <section id="features" className="py-20 sm:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Our AI-Powered Features
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            We use intelligent tools to help you find meaningful, lasting connections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <FeatureCard
            icon={<Wand2 />}
            title="AI Icebreaker Demo"
            description="Let our AI suggest unique conversation starters based on shared interests. No more 'hi'."
            onClick={() => setOpenModal('icebreaker')}
          />
          <FeatureCard
            icon={<HeartHandshake />}
            title="Deep Compatibility"
            description="Our AI analyzes shared values and life goals to find matches that truly last."
            onClick={() => setOpenModal('compatibility')}
          />
          <FeatureCard
            icon={<Sparkles />}
            title="AI Personal Coach"
            description="Get private, constructive feedback from our AI on how to improve your profile."
            onClick={() => setOpenModal('coach')}
          />
          <FeatureCard
            icon={<ShieldCheck />}
            title="AI Verification"
            description="We use advanced AI to verify profiles, ensuring you're talking to real, genuine people."
            onClick={() => setOpenModal('verification')}
          />
          <FeatureCard
            icon={<SlidersHorizontal />}
            title="Smart Filters"
            description="Easily find what you're looking for with filters that understand your preferences, from hobbies to education."
          />
          <FeatureCard
            icon={<Lock />}
            title="Privacy First"
            description="You control what you share. Our platform is built with robust privacy controls to protect your data."
          />
        </div>
      </div>

      {/* Modal Rendering */}
      {openModal && (
        <Modal onClose={() => setOpenModal(null)}>
          {renderModalContent()}
        </Modal>
      )}
    </section>
  );
};

export default Features;
