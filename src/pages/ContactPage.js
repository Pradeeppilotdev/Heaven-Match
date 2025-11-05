import React, { useState } from 'react';
import ContactForm from '../components/ContactForm';
import LiveChatWidget from '../components/LiveChatWidget';
import './ContactPage.css';

const ContactPage = () => {
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [formData, setFormData] = useState(null);

  // Handle auto-fill from chat
  const handleFormFill = (info) => {
    setFormData(info);
  };

  const contactInfo = {
    corporate: {
      name: 'HeavenMatch Matrimony Services Pvt. Ltd.',
      address: [
        'Plot No. 123, Sector 18,',
        'Gurugram, Haryana - 122015',
        'India'
      ]
    },
    phones: [
      { label: 'India Support (Toll-Free)', number: '1800-123-4567', link: 'tel:1800-123-4567' },
      { label: 'Mumbai Secondary Phone', number: '+91-22-9876-5432', link: 'tel:+91-22-9876-5432' },
      { label: 'Safety Hotline (24/7)', number: '1800-999-8888', link: 'tel:1800-999-8888', urgent: true }
    ],
    email: 'support@heavenmatch.com',
    whatsapp: 'https://wa.me/919876543210'
  };

  const socialLinks = [
    { icon: 'fab fa-facebook', url: 'https://facebook.com/heavenmatch', name: 'Facebook' },
    { icon: 'fab fa-twitter', url: 'https://twitter.com/heavenmatch', name: 'Twitter' },
    { icon: 'fab fa-instagram', url: 'https://instagram.com/heavenmatch', name: 'Instagram' },
    { icon: 'fab fa-linkedin', url: 'https://linkedin.com/company/heavenmatch', name: 'LinkedIn' },
    { icon: 'fab fa-youtube', url: 'https://youtube.com/heavenmatch', name: 'YouTube' }
  ];

  return (
    <div className="contact-page-wrapper">
      <div className="contact-page-header">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We're here to help! Reach out to us through any of the channels below.</p>
        </div>
      </div>

      <div className="container">
        <div className="contact-page-layout">
          {/* Left Sidebar - Contact Information */}
          <aside className="contact-sidebar">
            {/* Corporate Address */}
            <div className="info-card">
              <div className="card-header">
                <i className="fas fa-building"></i>
                <h2>Corporate Address</h2>
              </div>
              <div className="card-content">
                <p className="company-name">{contactInfo.corporate.name}</p>
                {contactInfo.corporate.address.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>

            {/* Phone Numbers */}
            <div className="info-card">
              <div className="card-header">
                <i className="fas fa-phone"></i>
                <h2>Phone Support</h2>
              </div>
              <div className="card-content">
                {contactInfo.phones.map((phone, index) => (
                  <div key={index} className={`phone-item ${phone.urgent ? 'urgent' : ''}`}>
                    <p className="phone-label">{phone.label}</p>
                    <a href={phone.link} className="phone-link">
                      {phone.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Email */}
            <div className="info-card">
              <div className="card-header">
                <i className="fas fa-envelope"></i>
                <h2>Email Support</h2>
              </div>
              <div className="card-content">
                <a href={`mailto:${contactInfo.email}`} className="email-link">
                  {contactInfo.email}
                </a>
                <p className="email-note">We respond within 24 hours</p>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="info-card">
              <div className="card-header">
                <i className="fab fa-whatsapp"></i>
                <h2>WhatsApp Support</h2>
              </div>
              <div className="card-content">
                <p>Get instant support via WhatsApp</p>
                <a href={contactInfo.whatsapp} className="whatsapp-btn" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-whatsapp"></i> Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Social Media */}
            <div className="info-card">
              <div className="card-header">
                <i className="fas fa-share-alt"></i>
                <h2>Follow Us</h2>
              </div>
              <div className="card-content">
                <div className="social-links">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                      title={social.name}
                      aria-label={social.name}
                      style={{
                        background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <i 
                        className={social.icon} 
                        aria-hidden="true"
                      ></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content - Contact Form */}
          <main className="contact-main-content">
            <div className="form-container">
              <div className="form-header">
                <h2>Send Us a Message</h2>
                <p>Fill out the form below and we'll get back to you as soon as possible.</p>
              </div>
              <ContactForm initialData={formData} />
            </div>
          </main>
        </div>
      </div>
      <LiveChatWidget 
        isOpen={showLiveChat} 
        onToggle={() => setShowLiveChat(!showLiveChat)}
        onFormFill={handleFormFill}
      />
    </div>
  );
};

export default ContactPage;

