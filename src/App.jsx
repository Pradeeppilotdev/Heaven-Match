// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Home Page Component (Now only renders the content and Footer)
const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* REMOVED Header: <Header /> */}
      <HomeContent />
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={<Chatbot />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;