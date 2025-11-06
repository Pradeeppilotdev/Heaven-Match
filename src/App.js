/**
 * Main App Component
 * Purpose: Root component that sets up routing and application structure
 * Manages global state for live chat widget visibility and renders all page routes
 */
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import LiveChatWidget from './components/LiveChatWidget';
import HomePage from './pages/HomePage';
import ContactPage from './pages/ContactPage';
import SupportPage from './pages/SupportPage';
import LocationsPage from './pages/LocationsPage';
import HelpPage from './pages/HelpPage';
import './App.css';

/**
 * App Component
 * Purpose: Main application component that provides routing and layout structure
 * @returns {JSX.Element} The rendered application with navigation, routes, footer, and live chat
 */
function App() {
  // State to control live chat widget visibility
  const [showLiveChat, setShowLiveChat] = useState(false);

  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Routes>
        </main>
        <Footer />
        <LiveChatWidget isOpen={showLiveChat} onToggle={() => setShowLiveChat(!showLiveChat)} />
      </div>
    </Router>
  );
}

export default App;

