import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const trustBadges = [
    { icon: 'fas fa-shield-alt', text: 'ISO Certified', color: '#667eea' },
    { icon: 'fas fa-lock', text: 'Secure & Private', color: '#764ba2' },
    { icon: 'fas fa-users', text: '10M+ Happy Members', color: '#ff6b9d' },
    { icon: 'fas fa-award', text: 'Industry Leader', color: '#f093fb' }
  ];

  const quickLinks = [
    { path: '/contact', icon: 'fas fa-envelope', title: 'Contact Us', desc: 'Get in touch with our team' },
    { path: '/support', icon: 'fas fa-headset', title: '24/7 Support', desc: 'Round the clock assistance' },
    { path: '/locations', icon: 'fas fa-map-marker-alt', title: 'Our Offices', desc: 'Visit us in person' },
    { path: '/help', icon: 'fas fa-question-circle', title: 'Help Center', desc: 'Find answers quickly' }
  ];

  const contactMethods = [
    { icon: 'fas fa-phone', title: 'Call Us', detail: '1800-123-4567', link: 'tel:1800-123-4567', color: '#667eea' },
    { icon: 'fab fa-whatsapp', title: 'WhatsApp', detail: 'Chat instantly', link: 'https://wa.me/919876543210', color: '#25D366' },
    { icon: 'fas fa-envelope', title: 'Email', detail: 'support@heavenmatch.com', link: 'mailto:support@heavenmatch.com', color: '#764ba2' },
    { icon: 'fas fa-comments', title: 'Live Chat', detail: 'Available 24/7', link: '/support', color: '#ff6b9d' }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="brand-highlight">HeavenMatch</span>
          </h1>
          <p className="hero-subtitle">
            Your Trusted Partner in Finding Your Perfect Match
          </p>
          <p className="hero-description">
            We're here to help you every step of the way. Get in touch with our dedicated support team.
          </p>
          <div className="hero-buttons">
            <Link to="/contact" className="btn btn-primary">
              <i className="fas fa-paper-plane"></i> Contact Us
            </Link>
            <Link to="/support" className="btn btn-secondary">
              <i className="fas fa-headset"></i> Get Support
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="floating-card card-1">
            <i className="fas fa-heart"></i>
            <span>Find Love</span>
          </div>
          <div className="floating-card card-2">
            <i className="fas fa-users"></i>
            <span>10M+ Members</span>
          </div>
          <div className="floating-card card-3">
            <i className="fas fa-shield-alt"></i>
            <span>Secure</span>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-badges">
            {trustBadges.map((badge, index) => (
              <div key={index} className="trust-badge">
                <div className="badge-icon" style={{ color: badge.color }}>
                  <i className={badge.icon}></i>
                </div>
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="contact-methods-section">
        <div className="container">
          <h2 className="section-title">How Can We Help You?</h2>
          <p className="section-subtitle">Choose your preferred way to reach us</p>
          <div className="contact-methods-grid">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.link}
                className="contact-method-card"
                target={method.link.startsWith('http') ? '_blank' : undefined}
                rel={method.link.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                <div className="method-icon" style={{ background: `linear-gradient(135deg, ${method.color} 0%, ${method.color}dd 100%)` }}>
                  <i className={method.icon}></i>
                </div>
                <h3>{method.title}</h3>
                <p>{method.detail}</p>
                <span className="method-link">
                  Get Started <i className="fas fa-arrow-right"></i>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="quick-links-section">
        <div className="container">
          <h2 className="section-title">Quick Access</h2>
          <div className="quick-links-grid">
            {quickLinks.map((link, index) => (
              <Link key={index} to={link.path} className="quick-link-card">
                <div className="link-icon">
                  <i className={link.icon}></i>
                </div>
                <h3>{link.title}</h3>
                <p>{link.desc}</p>
                <div className="link-arrow">
                  <i className="fas fa-arrow-right"></i>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Support Hours */}
      <section className="support-hours-section">
        <div className="container">
          <div className="hours-card">
            <div className="hours-header">
              <i className="fas fa-clock"></i>
              <h2>Support Hours</h2>
            </div>
            <div className="hours-content">
              <div className="hours-item">
                <span className="days">Monday - Friday</span>
                <span className="time">9:00 AM - 9:00 PM IST</span>
              </div>
              <div className="hours-item">
                <span className="days">Saturday & Sunday</span>
                <span className="time">10:00 AM - 6:00 PM IST</span>
              </div>
              <div className="hours-item highlight">
                <span className="days">24/7 Emergency Support</span>
                <span className="time">Safety Hotline: 1800-999-8888</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

