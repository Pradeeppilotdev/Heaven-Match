import React, { useState, useEffect } from 'react';
import { Heart, Menu, X } from 'lucide-react';
import Button from './ui/Button'; 

<<<<<<< HEAD
export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
=======
/**
 * Renders the sticky application header. Features dynamic styling on scroll and responsive navigation.
 */
export const Header = () => {
  // State for toggling the mobile navigation menu visibility.
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // State to track if the page has been scrolled past a threshold.
  const [scrolled, setScrolled] = useState(false);

  // Effect to manage header styling based on scroll position.
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    // Cleanup function to remove the event listener.
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = ['Home', 'Find Matches', 'Success Stories', 'About Us'];

  return (
<<<<<<< HEAD
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/80 backdrop-blur-md'} border-b border-pink-100`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
=======
    // Sticky header with conditional classes for scroll effect (backdrop blur, shadow).
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white/80 backdrop-blur-md'} border-b border-pink-100`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Branding */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
              <Heart className="w-6 h-6 text-pink-600 fill-pink-600" />
            </div>
            <span className="text-xl font-bold text-pink-600">Heaven Match</span>
          </div>
          
<<<<<<< HEAD
=======
          {/* Desktop Navigation */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <a 
                key={item} 
<<<<<<< HEAD
=======
                // Dynamically creates anchor links (e.g., #find-matches).
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
                href={`#${item.toLowerCase().replace(' ', '-')}`} 
                className="text-gray-700 hover:text-pink-600 transition-colors font-medium relative group"
              >
                {item}
<<<<<<< HEAD
=======
                {/* Underline hover effect */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-600 transition-all group-hover:w-full"></span>
              </a>
            ))}
          </nav>
          
<<<<<<< HEAD
=======
          {/* Action Buttons and Mobile Toggler */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden md:inline-flex">
              Sign In
            </Button>
            <Button className="hidden sm:flex">
              Register Free
            </Button>
<<<<<<< HEAD
=======
            {/* Mobile menu toggle button */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-pink-50 rounded-lg transition-colors"
            >
<<<<<<< HEAD
=======
              {/* Conditional icon based on menu state */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
      
<<<<<<< HEAD
=======
      {/* Mobile Menu Content: Conditionally rendered below the main header */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-pink-100 bg-white">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
            {menuItems.map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`} 
                className="text-gray-700 hover:text-pink-600 py-2 font-medium"
              >
                {item}
              </a>
            ))}
            <Button className="w-full mt-2">Register Free</Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;