import React, { useState, useEffect } from 'react';
import { Heart, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Button from './UI/Button'; 

/**
 * Renders the sticky application header. Features dynamic styling on scroll and responsive navigation.
 */
export const Header = () => {
  const location = useLocation();
  // State for toggling the mobile navigation menu visibility.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // State to track if the page has been scrolled past a threshold.
  const [scrolled, setScrolled] = useState(false);

  // Effect to manage header styling based on scroll position.
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    // Cleanup function to remove the event listener.
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Home', to: '/' },
    { label: 'Recommendations', to: '/recommendations' },
    { label: 'Chat', to: '/chat' },
    { label: 'Subscriptions', to: '/subscriptions' },
    { label: 'Contact', to: '/contact' }
  ];

  return (
    // Sticky header with conditional classes for scroll effect (backdrop blur, shadow).
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/80 backdrop-blur-md'} border-b border-pink-100`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Branding */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer group">
            <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
              <Heart className="w-6 h-6 text-pink-600 fill-pink-600" />
            </div>
            <span className="text-xl font-bold text-pink-600">Heaven Match</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-gray-700 hover:text-pink-600 transition-colors font-medium relative group ${location.pathname === item.to ? 'text-pink-600' : ''}`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-pink-600 transition-all ${location.pathname === item.to ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
            ))}
          </nav>
          
          {/* Action Buttons and Mobile Toggler */}
          <div className="flex items-center gap-4">
            <Link to="/register" className="hidden sm:flex">
              <Button>
                Register
              </Button>
            </Link>
            {/* Mobile menu toggle button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-pink-50 rounded-lg transition-colors"
            >
              {/* Conditional icon based on menu state */}
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Content: Conditionally rendered below the main header */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-pink-100 bg-white">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {menuItems.map((item) => (
              <Link 
                key={item.to}
                to={item.to}
                className="text-gray-700 hover:text-pink-600 py-2 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full mt-2">
              <Button className="w-full">Register Free</Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;