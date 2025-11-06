import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, LogOut } from 'lucide-react';

/**
 * Home component - Landing page after successful authentication
 */
const Home = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Clear any authentication data if needed
    console.log('Signing out...');
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-pink-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Heart className="w-6 h-6 text-pink-600 fill-pink-600" />
              </div>
              <span className="text-xl font-bold text-pink-600">HeavenMatch</span>
            </div>
            
            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-xl hover:bg-pink-700 hover:shadow-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Welcome Message */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
              <Heart className="w-5 h-5 fill-pink-600 text-pink-600" />
              <span className="font-medium text-pink-600">Welcome to HeavenMatch</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800">
              Your Perfect Match Awaits
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              You've successfully signed in! Start your journey to find your soulmate. 
              Complete your profile, explore matches, and connect with people who share your values.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Complete Profile</h3>
              <p className="text-gray-600">Add photos and details to get better matches</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200">
              <div className="text-4xl mb-4">💑</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Find Matches</h3>
              <p className="text-gray-600">Discover compatible partners based on your preferences</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-200">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Connect</h3>
              <p className="text-gray-600">Start conversations and build meaningful relationships</p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-8">
            <button className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
              Get Started
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;

