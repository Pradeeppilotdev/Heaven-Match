// src/App.jsx
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import ChurchSection from './components/ChurchSection';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Chatbot from './components/Chat/Chatbot.jsx';
import RegistrationPage from './components/RegistrationPage.jsx';
import ContactPage from './pages/ContactPage.js';
import HelpPage from './pages/HelpPage.js';
import LocationsPage from './pages/LocationsPage.js';
import SupportPage from './pages/SupportPage.js';
import Recommendations from './pages/Recommendations.jsx';
import SubscriptionPage from './pages/SubscriptionPage.jsx';
import Login from './components/Login';
import Signup from './components/Signup';
import QRSetup from './components/QRSetup';
import './App.css';

// Component that contains the main content of the home page (excluding Header/Footer)
const HomeContent = () => {
  return (
    <main>
      <Hero />
      <Features />
      <HowItWorks />
      <ChurchSection />
      <Testimonials />
      <CTA />
    </main>
  );
};

// Home Page Component (render content only; global Footer is already included)
const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* REMOVED Header: <Header /> */}
      <HomeContent />
    </div>
  );
};

// Protected Route Component - redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading-container">
        <div className="auth-spinner"></div>
        <p style={{ color: '#718096' }}>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main App Router Component
const AppRouter = () => {
  const { isAuthenticated, loading } = useAuth();
  const [showQRSetup, setShowQRSetup] = useState(false);

  if (loading) {
    return (
      <div className="auth-loading-container">
        <div className="auth-spinner"></div>
        <p style={{ color: '#718096' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header onOpenQRSetup={() => setShowQRSetup(true)} />
      <div className="flex-1">
        <Routes>
          {/* Public Routes - Signup & Login */}
          <Route
            path="/signup"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Signup />
              )
            }
          />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/" replace />
              ) : (
                <Login />
              )
            }
          />

          {/* Home - Public but shows different content based on auth */}
          <Route path="/" element={<HomePage />} />

          {/* Protected Routes */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chatbot />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <Recommendations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register"
            element={
              <ProtectedRoute>
                <RegistrationPage />
              </ProtectedRoute>
            }
          />

          {/* Public Routes */}
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/subscriptions" element={<SubscriptionPage />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />

      {/* QR Setup Modal */}
      {showQRSetup && (
        <QRSetup
          onClose={() => setShowQRSetup(false)}
          onSuccess={() => setShowQRSetup(false)}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </Router>
  );
}

export default App;
