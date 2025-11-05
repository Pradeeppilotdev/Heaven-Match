import React from 'react';
import { UserIcon, SparklesIcon, XMarkIcon } from '@heroicons/react/24/outline';

const WelcomeModal = ({ onUseMockUser, onStartChatbot, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Get Started with Heaven Match
          </h2>
          <p className="text-xs text-gray-600">
            Choose how you'd like to get personalized matchmaking recommendations
          </p>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <button
            onClick={onUseMockUser}
            className="w-full group relative overflow-hidden bg-white border-2 border-gray-300 hover:border-pink-500 text-gray-700 p-3 rounded-xl transition-all duration-200 hover:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center group-hover:bg-pink-500 transition-colors flex-shrink-0">
                <UserIcon className="w-5 h-5 text-pink-500 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <h3 className="text-base font-semibold mb-0.5 text-gray-900">Use Mock User Profile</h3>
                <p className="text-xs text-gray-600">
                  Get instant recommendations with pre-configured preferences
                </p>
              </div>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-pink-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </button>

          <button
            onClick={onStartChatbot}
            className="w-full group relative overflow-hidden bg-white border-2 border-gray-300 hover:border-pink-500 text-gray-700 p-3 rounded-xl transition-all duration-200 hover:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center group-hover:bg-pink-500 transition-colors flex-shrink-0">
                <SparklesIcon className="w-5 h-5 text-pink-500 group-hover:text-white transition-colors" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <h3 className="text-base font-semibold mb-0.5 text-gray-900">Start AI Chatbot Questionnaire</h3>
                <p className="text-xs text-gray-600">
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
        <div className="p-4 pt-0">
          <p className="text-xs text-center text-gray-500">
            Your preferences help us provide the best AI-curated matches from our extensive database
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;

