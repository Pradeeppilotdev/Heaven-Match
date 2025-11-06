import React from 'react';
<<<<<<< HEAD
import { Heart, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
=======
// Import necessary icons for branding and social media links.
import { Heart, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

/**
 * Renders the application footer, including branding, navigation, and legal links.
 * It uses a multi-column grid layout for clarity and professionalism.
 * @returns {JSX.Element} The application footer component.
 */
const Footer = () => {
  // Navigation arrays for structured linking.
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
  const quickLinks = ['About Us', 'How It Works', 'Success Stories', 'Blog'];
  const support = ['Help Center', 'Safety Tips', 'Contact Us', 'FAQs'];
  const legal = ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Refund Policy'];

  return (
<<<<<<< HEAD
    <footer className="bg-gray-50 border-t border-pink-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
=======
    // Base footer styling: light background, separator border.
    <footer className="bg-gray-50 border-t border-pink-100">
      <div className="container mx-auto px-4 py-12">
        {/* Main Grid: Adapts from 2 to 4 columns based on screen size (md/lg). */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          
          {/* Column 1: Branding, Mission Statement, and Social Links */}
          <div className="space-y-4">
            {/* Branding Logo and Name */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
            <div className="flex items-center gap-2">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Heart className="w-6 h-6 text-pink-600 fill-pink-600" />
              </div>
              <span className="text-xl font-bold text-pink-600">Heaven Match</span>
            </div>
<<<<<<< HEAD
            <p className="text-gray-600">
              Helping people find their perfect life partner since 2020. Your journey to happiness starts here.
            </p>
=======
            {/* Mission/Tagline */}
            <p className="text-gray-600">
              Helping people find their perfect life partner since 2020. Your journey to happiness starts here.
            </p>
            {/* Social Media Links */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="p-2 bg-pink-100 rounded-full hover:bg-pink-200 transition-colors"
<<<<<<< HEAD
                  aria-label={`Social media link ${i + 1}`}
=======
                  // Essential for accessibility (screen readers).
                  aria-label={`Social media link ${i + 1}`} 
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
                >
                  <Icon className="w-5 h-5 text-pink-600" />
                </a>
              ))}
            </div>
          </div>
          
<<<<<<< HEAD
=======
          {/* Columns 2, 3, 4: Navigational Link Sections */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
          {[
            { title: 'Quick Links', items: quickLinks },
            { title: 'Support', items: support },
            { title: 'Legal', items: legal }
          ].map((section, i) => (
            <div key={i}>
              <h3 className="mb-4 font-bold text-pink-600">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-600 hover:text-pink-600 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
<<<<<<< HEAD
        <div className="mt-12 pt-8 border-t border-pink-100 text-center text-gray-600">
          <p className="flex items-center justify-center gap-2">
            © 2025 Heaven Match. All rights reserved. Made with 
=======
        {/* Copyright and Bottom Text */}
        <div className="mt-12 pt-8 border-t border-pink-100 text-center text-gray-600">
          <p className="flex items-center justify-center gap-2">
            © 2025 Heaven Match. All rights reserved. Made with 
            {/* Inline heart icon for visual flair */}
>>>>>>> cf099d7ff69699236db4e8a307b4b4fd65bc7f29
            <Heart className="w-4 h-4 fill-pink-500 text-pink-500" /> 
            for people in love.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;