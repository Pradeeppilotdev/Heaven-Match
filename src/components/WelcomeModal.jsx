import React from 'react';
import { UserIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Heart } from 'lucide-react';

const WelcomeModal = ({ onUseMockUser, onStartChatbot, onClose }) => {
  return (
    <div className="mb-8">
      <div className="relative bg-white rounded-2xl shadow-xl border border-pink-100 w-full max-w-2xl mx-auto overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 z-10"
          aria-label="Close"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-pink-100 bg-gradient-to-br from-pink-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
              <Heart className="w-6 h-6 text-pink-600 fill-pink-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-pink-600">Heaven Match</h2>
              <p className="text-xs text-gray-600">Personalized recommendations powered by AI</p>
            </div>
          </div>
          <p className="text-sm text-gray-700">Choose how you'd like to get personalized matchmaking recommendations</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {onUseMockUser ? (
            <button
              onClick={onUseMockUser}
              className="w-full group relative overflow-hidden bg-white border-2 border-gray-200 hover:border-pink-500 text-gray-700 p-4 rounded-xl transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center group-hover:bg-pink-500 transition-colors flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-pink-500 group-hover:text-white transition-colors" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h3 className="text-lg font-semibold mb-0.5 text-gray-900">Use Your User Profile</h3>
                  <p className="text-sm text-gray-600">
                    Get instant recommendations with pre-configured preferences
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-pink-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </button>
          ) : null}

          <button
            onClick={onStartChatbot}
            className="w-full group relative overflow-hidden bg-white border-2 border-gray-200 hover:border-pink-500 text-gray-700 p-4 rounded-xl transition-all duration-200 hover:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center group-hover:bg-pink-500 transition-colors flex-shrink-0">
                <SparklesIcon className="w-5 h-5 text-pink-500 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <h3 className="text-lg font-semibold mb-0.5 text-gray-900">Start AI Chatbot Questionnaire</h3>
                <p className="text-sm text-gray-600">
                  Let our AI ask you questions to understand your preferences
                </p>
              </div>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-pink-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <p className="text-sm text-center text-gray-500">
            Your preferences help us provide the best AI-curated matches from our extensive database
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;

