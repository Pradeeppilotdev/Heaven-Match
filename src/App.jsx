// src/App.jsx - CORRECTED
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
// FIX 1: Change to default import
import Header from './components/Header'; 
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';
import { ChurchSection } from './components/ChurchSection';
import { Testimonials } from './components/Testimonials';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignUp';
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
      <AuthProvider>
        {/* FIX 2: Render Header *outside* of Routes so it's always in the Router context */}
        <Header />

        <Routes>
          {/* Home Route */}
          <Route path="/" element={<HomePage />} />
          
          {/* Auth Routes - Header will appear above these pages too */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Add more routes as needed */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;