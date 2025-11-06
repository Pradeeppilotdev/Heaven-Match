/**
 * ContactForm Component
 * Purpose: Displays a contact form for users to submit inquiries with validation
 * Pre-fills form fields from chat-extracted data if available
 * @param {Object} initialData - Optional initial form data extracted from chat (name, email, phone, subject)
 */
import React, { useState } from 'react';
import './ContactForm.css';

const ContactForm = ({ initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    subject: initialData?.subject || '',
    message: '',
    file: null
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  /**
   * Effect: Update form fields when initialData changes (from chat widget)
   * Purpose: Automatically fills form fields when user info is extracted from chat conversation
   */
  React.useEffect(() => {
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

  /**
   * handleChange - Handles input field changes
   * Purpose: Updates form state when user types in any input field and clears validation errors
   * @param {Event} e - The change event from the input element
   */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  /**
   * validateForm - Validates all form fields before submission
   * Purpose: Checks that all required fields are filled and formatted correctly
   * Validates: name (required), email (required, valid format), phone (required, 10 digits), 
   * subject (required), message (required)
   * @returns {boolean} True if all validations pass, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * handleSubmit - Handles form submission
   * Purpose: Validates form, simulates submission, shows success message, and resets form
   * Generates a ticket reference number for the user
   * @param {Event} e - The form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Simulate form submission
      // Form data would be sent to server here
      
      // Show success message
      setSubmitted(true);
      
      // Auto acknowledgment
      setTimeout(() => {
        alert('Thank you for contacting us! We have received your message and will respond within 24 hours. Your ticket reference number is: HM-' + Date.now().toString().slice(-6));
      }, 100);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          file: null
        });
        setSubmitted(false);
      }, 3000);
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
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
          placeholder="Enter your 10-digit phone number"
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
        ></textarea>
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

      {submitted && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i> Form submitted successfully!
        </div>
      )}

      <button type="submit" className="submit-btn">
        <i className="fas fa-paper-plane"></i> Send Message
      </button>
    </form>
  );
};

export default ContactForm;

