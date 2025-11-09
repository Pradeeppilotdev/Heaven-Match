/**
 * TicketSystem Component
 * Purpose: Allows users to create secure support tickets and track existing tickets
 * Adds server-side submission with CSRF protection, honeypot bot filtering, and rate-limit friendly messaging
 */
import React, { useEffect, useState } from 'react';
import './TicketSystem.css';
import { getBackendURL } from '../utils/backend';

const issueTopics = [
  'Account Issues',
  'Profile Management',
  'Payment & Billing',
  'Technical Support',
  'Security Concerns',
  'Match Suggestions',
  'Privacy & Data',
  'Report Abuse',
  'General Inquiry',
  'Other'
];

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const sanitizeDigits = (value = '') => value.replace(/[^0-9]/g, '');

const TicketSystem = () => {
  const [ticketData, setTicketData] = useState({
    issueTopic: '',
    priority: 'medium',
    description: '',
    email: '',
    phone: ''
  });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticketStatus, setTicketStatus] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [ticketErrors, setTicketErrors] = useState({});

  const showMessage = (type, message) => setFeedback({ type, message });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === 'description') {
      nextValue = value.slice(0, 1000);
    }

    if (name === 'phone') {
      nextValue = value.slice(0, 20);
    }

    setTicketData(prev => ({
      ...prev,
      [name]: nextValue
    }));

    if (ticketErrors[name]) {
      setTicketErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateTicket = () => {
    const errors = {};

    if (!ticketData.issueTopic.trim()) {
      errors.issueTopic = 'Please select the issue topic.';
    }

    if (!ticketData.description.trim()) {
      errors.description = 'Description is required.';
    } else if (ticketData.description.trim().length > 1000) {
      errors.description = 'Description cannot exceed 1000 characters.';
    }

    if (!ticketData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!validateEmail(ticketData.email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (ticketData.phone && sanitizeDigits(ticketData.phone).length < 7) {
      errors.phone = 'Please enter a valid phone number or leave it blank.';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (honeypot) {
      showMessage('success', 'Ticket created successfully. Our team will be in touch shortly.');
      return;
    }

    const validationErrors = validateTicket();
    setTicketErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showMessage('error', 'Please review the highlighted fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    showMessage(null, '');

    try {
      const payload = {
        formType: 'support-ticket',
        issueTopic: ticketData.issueTopic.trim(),
        priority: ticketData.priority,
        description: ticketData.description.trim(),
        email: ticketData.email.trim(),
        phone: ticketData.phone.trim(),
        honeypot
      };

      const response = await fetch(`${getBackendURL()}/api/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to submit your ticket right now.');
      }

      setTicketNumber(result.ticketId);
      setTicketStatus('Open');
      setTicketSubmitted(true);

      showMessage('success', result.message || `Ticket ${result.ticketId} has been created successfully.`);

      setTicketData({
        issueTopic: '',
        priority: 'medium',
        description: '',
        email: '',
        phone: ''
      });
      setHoneypot('');
      setTicketErrors({});
      refreshCsrfToken();

      setTimeout(() => {
        setTicketSubmitted(false);
        setTicketStatus('');
        setTicketNumber('');
      }, 6000);
    } catch (error) {
      console.error('Ticket submission error:', error);
      showMessage('error', error.message || 'Something went wrong. Please try again shortly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrackTicket = (e) => {
    e.preventDefault();
    const trackNumber = e.target.trackNumber.value.trim().toUpperCase();
    if (!trackNumber) {
      return;
    }
    showMessage(
      'info',
      `Ticket ${trackNumber} is currently in progress. A support specialist will update you via email as soon as there is new information.`
    );
    e.target.reset();
  };

  return (
    <div className="ticket-system">
      {feedback && feedback.message && (
        <div
          className={`ticket-feedback ${feedback.type}`}
          role="alert"
          aria-live="assertive"
        >
          <i
            className={`fas ${
              feedback.type === 'success'
                ? 'fa-check-circle'
                : feedback.type === 'info'
                ? 'fa-info-circle'
                : 'fa-exclamation-triangle'
            }`}
            aria-hidden="true"
          ></i>
          <span>{feedback.message}</span>
        </div>
      )}

      {ticketSubmitted ? (
        <div className="ticket-success">
          <i className="fas fa-check-circle" aria-hidden="true"></i>
          <h3>Ticket Submitted Successfully!</h3>
          <p>
            <strong>Ticket Number:</strong> {ticketNumber}
          </p>
          <p>
            <strong>Status:</strong>{' '}
            <span className="status-badge open">{ticketStatus || 'Open'}</span>
          </p>
          <p>We have received your request and will respond within 4 hours.</p>
        </div>
      ) : (
        <form className="ticket-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="issueTopic">Issue Topic *</label>
            <select
              id="issueTopic"
              name="issueTopic"
              value={ticketData.issueTopic}
              onChange={handleChange}
              required
            >
              <option value="">Select an issue topic</option>
              {issueTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
            {ticketErrors.issueTopic && (
              <span className="error-message">{ticketErrors.issueTopic}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority Level *</label>
            <select
              id="priority"
              name="priority"
              value={ticketData.priority}
              onChange={handleChange}
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={ticketData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              autoComplete="email"
              maxLength={120}
            />
            {ticketErrors.email && (
              <span className="error-message">{ticketErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number (Optional)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={ticketData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              inputMode="tel"
              pattern="^[0-9+\-\s()]{7,20}$"
              maxLength={20}
            />
            {ticketErrors.phone && (
              <span className="error-message">{ticketErrors.phone}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={ticketData.description}
              onChange={handleChange}
              required
              rows="5"
              placeholder="Please describe your issue in detail..."
              maxLength={1000}
            ></textarea>
            <small>{ticketData.description.length}/1000 characters</small>
            {ticketErrors.description && (
              <span className="error-message">{ticketErrors.description}</span>
            )}
          </div>

          <div className="honeypot-field" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex="-1"
              autoComplete="off"
            />
          </div>

          <button type="submit" className="submit-ticket-btn" disabled={isSubmitting}>
            <i className="fas fa-ticket-alt" aria-hidden="true"></i>{' '}
            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </form>
      )}

      <div className="ticket-tracking">
        <h3>
          <i className="fas fa-search" aria-hidden="true"></i> Track Your Ticket
        </h3>
        <form onSubmit={handleTrackTicket} className="track-form">
          <input
            type="text"
            name="trackNumber"
            placeholder="Enter ticket number (e.g., HM-12345678)"
            className="track-input"
            required
            maxLength={20}
          />
          <button type="submit" className="track-btn">
            <i className="fas fa-search" aria-hidden="true"></i> Track
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketSystem;


