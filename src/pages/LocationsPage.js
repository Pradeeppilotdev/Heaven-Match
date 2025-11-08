/**
 * LocationsPage Component
 * Purpose: Displays office locations including corporate headquarters, regional offices in India, and global offices
 * Shows contact information, addresses, and map for each location
 */
import React from 'react';
import './LocationsPage.css';

const complianceCommitments = [
  {
    title: 'Operational Jurisdiction',
    description:
      'HeavenMatch Matrimony Services Pvt. Ltd. operates under the Information Technology Act, 2000 and aligns with the forthcoming Digital Personal Data Protection (DPDP) Act. All investigations, logging, and retention practices adhere to Indian legal standards.'
  },
  {
    title: 'Data Residency & Encryption',
    description:
      'Member profiles, chat transcripts, and payment records are stored exclusively in ISO 27001 certified data centres located in Mumbai and Hyderabad, India. Data is encrypted with AES-256 at rest and secured with TLS 1.3 in transit.'
  },
  {
    title: 'Secure Connections',
    description:
      'The HeavenMatch platform enforces HTTPS with a six-month HTTP Strict Transport Security (HSTS) policy, ensuring browsers only communicate over encrypted channels. Please access the site via https:// for a secure experience.'
  }
];

const LocationsPage = () => {
  return (
    <div className="locations-page">
      <div className="locations-header">
        <div className="container">
          <h1>Our Office Locations</h1>
          <p>Visit us in person or reach out to our regional offices</p>
        </div>
      </div>

      <div className="container">
        {/* Map Section */}
        <section className="map-section">
          <h2 className="section-title">Find Us on Map</h2>
          <div className="map-container">
            <iframe
              title="HeavenMatch Office Locations"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.1234567890!2d77.1234567890!3d28.1234567890!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDA3JzI0LjQiTiA3N8KwMDcnMjQuNCJF!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
              width="100%"
              height="500"
              style={{ border: 0, borderRadius: '20px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>

        {/* Compliance & Trust */}
        <section className="compliance-section">
          <h2 className="section-title">Trust, Compliance & Data Protection</h2>
          <div className="compliance-grid">
            {complianceCommitments.map((item, index) => (
              <article key={index} className="compliance-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LocationsPage;
