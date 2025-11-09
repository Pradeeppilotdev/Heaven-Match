/**
 * ContactForm Component
 * Purpose: Displays a contact form for users to submit inquiries with validation and secure submission controls
 * Pre-fills form fields from chat-extracted data if available
 * @param {Object} initialData - Optional initial form data extracted from chat (name, email, phone, subject)
 */
import React, { useEffect, useState } from 'react';
import './ContactForm.css';
import { getBackendURL } from '../utils/backend';

const normalizeDigits = (value = '') => value.replace(/[^0-9]/g, '');

const ContactForm = ({ initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    subject: initialData?.subject || '',
    message: '',
    file: null
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: null, message: '' });
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showMessage = (type, message) => setStatus({ type, message });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        name: initialData.name || prev.name,
        email: initialData.email || prev.email,
        phone: initialData.phone || prev.phone,
        subject: initialData.subject || prev.subject
      }));
    }
  }, [initialData]);


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    let nextValue = value;

    if (name === 'message') {
      nextValue = value.slice(0, 1000);
    }

    if (name === 'subject') {
      nextValue = value.slice(0, 120);
    }

    if (name === 'phone') {
      nextValue = value.slice(0, 20);
    }

    if (name === 'file') {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: nextValue });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (normalizeDigits(formData.phone).length < 7) {
      newErrors.phone = 'Please enter a valid phone number.';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required.';
    } else if (formData.message.trim().length > 1000) {
      newErrors.message = 'Message cannot exceed 1000 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (honeypot) {
      showMessage('success', 'Thank you! Your request has been received.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    showMessage(null, '');

    try {
      const payload = {
        formType: 'contact',
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
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
        throw new Error(result.error || 'Unable to submit your request right now.');
      }

      showMessage('success', result.message || 'Thank you for contacting us. Our team will respond shortly.');

      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        file: null
      });
      setErrors({});
      setHoneypot('');
    } catch (error) {
      console.error('Contact form submission error:', error);
      showMessage('error', error.message || 'Something went wrong. Please try again in a moment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      {status.message && (
        <div
          className={`form-feedback ${status.type || 'neutral'}`}
          role="alert"
          aria-live="assertive"
        >
          <i className={`fas ${status.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
          <span>{status.message}</span>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="name">Full Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? 'error' : ''}
          placeholder="Enter your full name"
          required
          autoComplete="name"
          maxLength={80}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Address *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? 'error' : ''}
          placeholder="Enter your email"
          required
          autoComplete="email"
          maxLength={120}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone Number *</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={errors.phone ? 'error' : ''}
          placeholder="Enter your phone number"
          required
          inputMode="tel"
          pattern="^[0-9+\-\s()]{7,20}$"
          maxLength={20}
        />
        {errors.phone && <span className="error-message">{errors.phone}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="subject">Subject *</label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className={errors.subject ? 'error' : ''}
          placeholder="What is this regarding?"
          required
          maxLength={120}
        />
        {errors.subject && <span className="error-message">{errors.subject}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="message">Message *</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          className={errors.message ? 'error' : ''}
          rows="5"
          placeholder="Please describe your query in detail..."
          required
          maxLength={1000}
        ></textarea>
        <small>{formData.message.length}/1000 characters</small>
        {errors.message && <span className="error-message">{errors.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="file">Attach File (Optional)</label>
        <input
          type="file"
          id="file"
          name="file"
          onChange={handleChange}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
        <small>Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB)</small>
        {formData.file && (
          <div className="file-info">
            <i className="fas fa-file"></i> {formData.file.name}
          </div>
        )}
      </div>

      <div className="honeypot-field" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          type="text"
          id="company"
          name="company"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex="-1"
          autoComplete="off"
        />
      </div>

      <button type="submit" className="submit-btn" disabled={isSubmitting}>
        <i className="fas fa-paper-plane"></i> {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
};

export default ContactForm;


