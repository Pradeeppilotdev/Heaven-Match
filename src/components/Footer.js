/**
 * Footer Component
 * Purpose: Displays site footer with company information, links, contact details, and social media
 * Provides navigation links organized by category (Company, Support, Legal)
 */
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  // Get current year for copyright display
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { path: '/', label: 'Home' },
      { path: '/contact', label: 'Contact Us' },
      { path: '/locations', label: 'Our Offices' },
      { path: '/help', label: 'Help Center' }
    ],
    support: [
      { path: '/support', label: 'Support' },
      { path: '/help', label: 'FAQs' },
      { label: 'Business Enquiry', link: '/business-enquiry' },
      { label: 'Media Queries', link: '/media-queries' }
    ],
    legal: [
      { label: 'Privacy Policy', link: '/privacy-policy' },
      { label: 'Terms of Service', link: '/terms' },
      { label: 'Grievance Policy', link: '/grievance' },
      { label: 'Report Spam/Fraud', link: '/spam-report' }
    ]
  };

  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section">
            <div className="footer-brand">
              <h3>
                <i className="fas fa-heart"></i> HeavenMatch
              </h3>
              <p>Your Trusted Partner in Finding Your Perfect Match</p>
              <div className="social-links">
                <a href="https://facebook.com/heavenmatch" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="https://twitter.com/heavenmatch" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="https://instagram.com/heavenmatch" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://linkedin.com/company/heavenmatch" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="https://youtube.com/heavenmatch" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  {link.path ? (
                    <Link to={link.path}>{link.label}</Link>
                  ) : (
                    <a href={link.link || '#'}>{link.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a href={link.link || '#'}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4>Contact</h4>
            <ul className="contact-info">
              <li>
                <i className="fas fa-phone"></i>
                <a href="tel:1800-123-4567">1800-123-4567</a>
              </li>
              <li>
                <i className="fas fa-envelope"></i>
                <a href="mailto:support@heavenmatch.com">support@heavenmatch.com</a>
              </li>
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <span>Gurugram, Haryana, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} HeavenMatch Matrimony Services Pvt. Ltd. All rights reserved.</p>
            <div className="footer-badges">
              <span><i className="fas fa-shield-alt"></i> ISO 27001 Certified</span>
              <span><i className="fas fa-certificate"></i> Registered with MCA</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

