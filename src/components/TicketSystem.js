/**
 * TicketSystem Component
 * Purpose: Allows users to create support tickets and track existing tickets
 * Handles ticket creation, validation, and displays ticket status in a friendly UI
 */
import React, { useState } from 'react';
import './TicketSystem.css';

const TicketSystem = () => {
  const [ticketData, setTicketData] = useState({
    issueTopic: '',
    priority: 'medium',
    description: '',
    email: '',
    phone: '',
  });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticketStatus, setTicketStatus] = useState('');

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
    'Other',
  ];

  /**
   * handleChange - Handles input field changes in ticket form
   * Purpose: Updates ticket form state when user modifies any field
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTicketData({ ...ticketData, [name]: value });
  };

  /**
   * handleSubmit - Handles ticket form submission
   * Purpose: Creates a new support ticket with unique ID, sets status, and shows confirmation
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Generate ticket number
    const newTicketNumber = 'HM-' + Date.now().toString().slice(-8);
    setTicketNumber(newTicketNumber);
    setTicketStatus('Open');
    setTicketSubmitted(true);

    // Simulate acknowledgement
    setTimeout(() => {
      alert(
        `Ticket Created Successfully!\n\nTicket Number: ${newTicketNumber}\nStatus: Open\n\nWe will respond within 4 hours. You can track your ticket status using the ticket number.`,
      );
    }, 100);

    // Reset form after a brief delay so the user can see success state
    setTimeout(() => {
      setTicketData({
        issueTopic: '',
        priority: 'medium',
        description: '',
        email: '',
        phone: '',
      });
      setTicketSubmitted(false);
    }, 5000);
  };

  /**
   * handleTrackTicket - Handles ticket tracking form submission
   * Purpose: Allows users to check status of an existing ticket by ticket number
   */
  const handleTrackTicket = (e) => {
    e.preventDefault();
    const trackNumber = e.target.trackNumber.value.trim();
    if (trackNumber) {
      alert(
        `Ticket Status for ${trackNumber}:\n\nStatus: In Progress\nAssigned to: Support Team\nLast Updated: ${new Date().toLocaleString()}\n\nWe are working on your request and will update you soon.`,
      );
    }
  };

  return (
    <div className="ticket-system">
      {ticketSubmitted ? (
        <div className="ticket-success">
          <i className="fas fa-check-circle" aria-hidden="true"></i>
          <h3>Ticket Submitted Successfully!</h3>
          <p>
            <strong>Ticket Number:</strong> {ticketNumber}
          </p>
          <p>
            <strong>Status:</strong>{' '}
            <span className="status-badge open">{ticketStatus}</span>
          </p>
          <p>We have received your request and will respond within 4 hours.</p>
        </div>
      ) : (
        <form className="ticket-form" onSubmit={handleSubmit}>
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
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={ticketData.phone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
            />
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
            ></textarea>
          </div>

          <button type="submit" className="submit-ticket-btn">
            <i className="fas fa-ticket-alt" aria-hidden="true"></i> Submit Ticket
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


