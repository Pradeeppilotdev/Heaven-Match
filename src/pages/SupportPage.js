import React from 'react';
import { Link } from 'react-router-dom';
import TicketSystem from '../components/TicketSystem';
import './SupportPage.css';

const SupportPage = () => {

  const supportOptions = [
    {
      icon: 'fas fa-ticket-alt',
      title: 'Submit a Ticket',
      description: 'Create a support ticket for your issue',
      action: null
    },
    {
      icon: 'fas fa-comments',
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      action: null
    },
    {
      icon: 'fas fa-phone',
      title: 'Call Us',
      description: 'Speak directly with our support team',
      link: 'tel:1800-123-4567'
    },
    {
      icon: 'fab fa-whatsapp',
      title: 'WhatsApp',
      description: 'Get instant support via WhatsApp',
      link: 'https://wa.me/919876543210'
    }
  ];

  const supportHours = {
    weekdays: 'Monday to Friday: 9:00 AM - 9:00 PM IST',
    weekends: 'Saturday & Sunday: 10:00 AM - 6:00 PM IST',
    holidays: 'Holidays: 10:00 AM - 4:00 PM IST'
  };

  const slaInfo = [
    { type: 'Email', time: 'Response within 24 hours', icon: 'fas fa-envelope' },
    { type: 'Phone', time: 'Immediate response during business hours', icon: 'fas fa-phone' },
    { type: 'Ticket', time: 'First response within 4 hours', icon: 'fas fa-ticket-alt' },
    { type: 'Urgent', time: 'Priority response within 1 hour', icon: 'fas fa-exclamation-circle' }
  ];

  const quickLinks = [
    { path: '/help', icon: 'fas fa-question-circle', text: 'Help Center' },
    { path: '/contact', icon: 'fas fa-envelope', text: 'Contact Us' },
    { path: '/locations', icon: 'fas fa-map-marker-alt', text: 'Office Locations' },
    { icon: 'fas fa-shield-virus', text: 'Report Spam/Fraud', link: '/spam-report' }
  ];

  return (
    <div className="support-page">
      <div className="support-header">
        <div className="container">
          <h1>Support Center</h1>
          <p>We're here to help you 24/7. Choose your preferred support method.</p>
        </div>
      </div>

      <div className="container">
        {/* Support Options */}
        <section className="support-options-section">
          <div className="support-options-grid">
            {supportOptions.map((option, index) => (
              <div
                key={index}
                className="support-option-card"
                onClick={option.action}
                style={{ cursor: option.action ? 'pointer' : 'default' }}
              >
                {option.link ? (
                  <a href={option.link} className="option-link" target={option.link.startsWith('http') ? '_blank' : undefined} rel={option.link.startsWith('http') ? 'noopener noreferrer' : undefined}>
                    <div className="option-icon">
                      <i className={option.icon}></i>
                    </div>
                    <h3>{option.title}</h3>
                    <p>{option.description}</p>
                  </a>
                ) : (
                  <>
                    <div className="option-icon">
                      <i className={option.icon}></i>
                    </div>
                    <h3>{option.title}</h3>
                    <p>{option.description}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Support Hours & SLA */}
        <div className="support-info-grid">
          <section className="support-hours-card">
            <div className="card-header">
              <i className="fas fa-clock"></i>
              <h2>Support Hours</h2>
            </div>
            <div className="hours-list">
              <div className="hours-item">
                <i className="fas fa-calendar-week"></i>
                <div>
                  <strong>Weekdays</strong>
                  <p>{supportHours.weekdays}</p>
                </div>
              </div>
              <div className="hours-item">
                <i className="fas fa-calendar-alt"></i>
                <div>
                  <strong>Weekends</strong>
                  <p>{supportHours.weekends}</p>
                </div>
              </div>
              <div className="hours-item highlight">
                <i className="fas fa-exclamation-triangle"></i>
                <div>
                  <strong>24/7 Emergency</strong>
                  <p>Safety Hotline: 1800-999-8888</p>
                </div>
              </div>
            </div>
          </section>

          <section className="sla-card">
            <div className="card-header">
              <i className="fas fa-stopwatch"></i>
              <h2>Response Times (SLA)</h2>
            </div>
            <div className="sla-list">
              {slaInfo.map((sla, index) => (
                <div key={index} className="sla-item">
                  <i className={sla.icon}></i>
                  <div>
                    <strong>{sla.type}</strong>
                    <p>{sla.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Ticket System */}
        <section className="ticket-section">
          <div className="section-header">
            <h2>Submit a Support Request</h2>
            <p>Create a ticket and track your issue status</p>
          </div>
          <TicketSystem />
        </section>

        {/* Quick Links */}
        <section className="quick-links-section">
          <h2>Quick Links</h2>
          <div className="quick-links-grid">
            {quickLinks.map((link, index) => (
              link.path ? (
                <Link
                  key={index}
                  to={link.path}
                  className="quick-link-item"
                >
                  <i className={link.icon}></i>
                  <span>{link.text}</span>
                </Link>
              ) : (
                <a
                  key={index}
                  href={link.link || '#'}
                  className="quick-link-item"
                >
                  <i className={link.icon}></i>
                  <span>{link.text}</span>
                </a>
              )
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SupportPage;

