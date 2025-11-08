/**
 * HelpPage Component
 * Purpose: Provides help center with searchable FAQs, categorized by topic (Account, Profile, Payment, Technical, Safety)
 * Allows users to search for answers and browse help resources
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './HelpPage.css';

const HelpPage = () => {
  // State for search query input
  const [searchQuery, setSearchQuery] = useState('');
  // State for selected FAQ category filter
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics', icon: 'fas fa-th' },
    { id: 'account', name: 'Account', icon: 'fas fa-user' },
    { id: 'profile', name: 'Profile', icon: 'fas fa-id-card' },
    { id: 'payment', name: 'Payment', icon: 'fas fa-credit-card' },
    { id: 'technical', name: 'Technical', icon: 'fas fa-cog' },
    { id: 'safety', name: 'Safety', icon: 'fas fa-shield-alt' }
  ];

  const faqs = [
    {
      id: 1,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'To create an account, click on the "Sign Up" button on our homepage. Fill in your basic details including name, email, phone number, and create a secure password. Verify your email and phone number to complete the registration process.'
    },
    {
      id: 2,
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page. Enter your registered email address. You will receive a password reset link in your email. Click the link and follow the instructions to create a new password.'
    },
    {
      id: 3,
      category: 'profile',
      question: 'How do I update my profile?',
      answer: 'Log in to your account and go to "My Profile". Click on "Edit Profile" to update your information, photos, preferences, and other details. Make sure to save your changes before leaving the page.'
    },
    {
      id: 4,
      category: 'profile',
      question: 'How many photos can I upload?',
      answer: 'You can upload up to 10 photos in your profile. We recommend using clear, recent photos that represent you well. Photos are reviewed by our team to ensure they meet our community guidelines.'
    },
    {
      id: 5,
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, net banking, UPI, and digital wallets. All transactions are secured with SSL encryption to ensure your payment information is safe.'
    },
    {
      id: 6,
      category: 'payment',
      question: 'Can I get a refund?',
      answer: 'Yes, we offer a 7-day money-back guarantee for new premium memberships. If you are not satisfied with our services within 7 days of purchase, contact our support team for a full refund.'
    },
    {
      id: 7,
      category: 'technical',
      question: 'The website is not loading properly. What should I do?',
      answer: 'Try clearing your browser cache and cookies. Make sure you are using the latest version of your browser. If the problem persists, try using a different browser or contact our technical support team.'
    },
    {
      id: 8,
      category: 'technical',
      question: 'I am not receiving emails. What can I do?',
      answer: 'Check your spam/junk folder. Add support@heavenmatch.com to your contacts. Make sure your email address is correct in your account settings. If issues persist, contact our support team.'
    },
    {
      id: 9,
      category: 'safety',
      question: 'How do I report suspicious activity?',
      answer: 'If you encounter any suspicious profiles or behavior, click on the "Report" button on the profile or message. You can also contact our safety team directly at safety@heavenmatch.com or call our 24/7 safety hotline: 1800-999-8888.'
    },
    {
      id: 10,
      category: 'safety',
      question: 'How do you verify profiles?',
      answer: 'We verify profiles through multiple methods including phone verification, email verification, and photo verification. Premium members can request additional verification badges to increase their profile credibility.'
    },
    {
      id: 11,
      category: 'safety',
      question: 'Where is my data stored and how is it secured?',
      answer: 'All member profiles, conversations, and payment data are encrypted with AES-256 and hosted in Tier IV data centers located in Mumbai and Hyderabad, India. Information is transmitted over TLS 1.3 and managed under ISO 27001 controls in compliance with the Information Technology Act, 2000.'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // State to track which FAQ item is currently expanded
  const [openFAQ, setOpenFAQ] = useState(null);

  /**
   * toggleFAQ - Toggles FAQ item expand/collapse state
   * Purpose: Opens or closes an FAQ item when clicked, closing others if needed
   * @param {number} id - The ID of the FAQ item to toggle
   */
  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  const helpResources = [
    {
      icon: 'fas fa-book',
      title: 'User Guide',
      description: 'Complete guide to using HeavenMatch',
      link: '/guide'
    },
    {
      icon: 'fas fa-video',
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides',
      link: '/videos'
    },
    {
      icon: 'fas fa-file-pdf',
      title: 'Download PDF',
      description: 'Download our help documentation',
      link: '/download'
    },
    {
      icon: 'fas fa-comments',
      title: 'Contact Support',
      description: 'Get help from our support team',
      link: '/support'
    }
  ];

  const securityHighlights = [
    {
      icon: 'fas fa-shield-alt',
      title: 'Enable Multi-Factor Authentication',
      details: [
        'Open Account Settings → Security.',
        'Select "Enable MFA" and choose SMS OTP or authenticator app.',
        'Verify using the code on your trusted device to lock future logins.'
      ]
    },
    {
      icon: 'fas fa-exclamation-triangle',
      title: 'Report Suspicious Profiles',
      description:
        'Tap the "Report" button on any profile or chat, or email safety@heavenmatch.com with screenshots. Urgent flags alert our 24/7 safety team within 15 minutes.',
      cta: {
        href: 'mailto:safety@heavenmatch.com',
        label: 'Email safety@heavenmatch.com'
      }
    },
    {
      icon: 'fas fa-database',
      title: 'Data Residency & Protection',
      description:
        'Member information stays within ISO 27001 certified data centres in Mumbai and Hyderabad, protected with AES-256 encryption at rest and TLS 1.3 in transit, fully aligned with Indian data residency requirements.'
    }
  ];

  return (
    <div className="help-page">
      <div className="help-header">
        <div className="container">
          <h1>Help Center</h1>
          <p>Find answers to common questions and get the help you need</p>
        </div>
      </div>

      <div className="container">
        {/* Search Bar */}
        <section className="search-section">
          <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              placeholder="Search for help articles, FAQs, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </section>

        {/* Categories */}
        <section className="categories-section">
          <div className="categories-grid">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <i className={category.icon}></i>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Help Resources */}
        <section className="resources-section">
          <h2 className="section-title">Help Resources</h2>
          <div className="resources-grid">
            {helpResources.map((resource, index) => (
              <a key={index} href={resource.link} className="resource-card">
                <div className="resource-icon">
                  <i className={resource.icon}></i>
                </div>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <span className="resource-link">
                  Learn More <i className="fas fa-arrow-right"></i>
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* Security & Trust */}
        <section className="security-section">
          <h2 className="section-title">Security & Trust Essentials</h2>
          <div className="security-grid">
            {securityHighlights.map((item, index) => (
              <article key={index} className="security-card">
                <div className="security-icon">
                  <i className={item.icon}></i>
                </div>
                <h3>{item.title}</h3>
                {item.details && (
                  <ul className="security-list">
                    {item.details.map((detail, idx) => (
                      <li key={idx}>{detail}</li>
                    ))}
                  </ul>
                )}
                {item.description && <p>{item.description}</p>}
                {item.cta && (
                  <a href={item.cta.href} className="security-link">
                    {item.cta.label} <i className="fas fa-arrow-right"></i>
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="faqs-section">
          <h2 className="section-title">
            Frequently Asked Questions
            {searchQuery && <span className="results-count"> ({filteredFAQs.length} results)</span>}
          </h2>
          <div className="faqs-list">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className={`faq-item ${openFAQ === faq.id ? 'open' : ''}`}
                >
                  <button
                    className="faq-question"
                    onClick={() => toggleFAQ(faq.id)}
                  >
                    <span>{faq.question}</span>
                    <i className={`fas fa-chevron-${openFAQ === faq.id ? 'up' : 'down'}`}></i>
                  </button>
                  {openFAQ === faq.id && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <p>No results found. Try a different search term or category.</p>
              </div>
            )}
          </div>
        </section>

        {/* Still Need Help */}
        <section className="still-need-help">
          <div className="help-card">
            <h2>Still Need Help?</h2>
            <p>Can't find what you're looking for? Our support team is here to help you 24/7.</p>
            <div className="help-buttons">
              <Link to="/contact" className="btn btn-primary">
                <i className="fas fa-envelope"></i> Contact Us
              </Link>
              <Link to="/support" className="btn btn-secondary">
                <i className="fas fa-headset"></i> Live Chat
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpPage;

