/**
 * LocationsPage Component
 * Purpose: Displays office locations including corporate headquarters, regional offices in India, and global offices
 * Shows contact information, addresses, and map for each location
 */
import React from 'react';
import './LocationsPage.css';

const LocationsPage = () => {
  const corporateOffice = {
    name: 'HeavenMatch Matrimony Services Pvt. Ltd.',
    address: 'Plot No. 123, Sector 18, Gurugram, Haryana - 122015, India',
    phone: '+91-124-1234-5678',
    email: 'corporate@heavenmatch.com',
    coordinates: { lat: 28.4089, lng: 77.0378 }
  };

  const regionalOffices = [
    {
      city: 'Mumbai',
      phone: '+91-22-1234-5678',
      address: '123, Business Tower, Andheri East, Mumbai - 400069',
      email: 'mumbai@heavenmatch.com',
      hours: 'Mon-Fri: 9 AM - 9 PM'
    },
    {
      city: 'Delhi',
      phone: '+91-11-2345-6789',
      address: '456, Connaught Place, New Delhi - 110001',
      email: 'delhi@heavenmatch.com',
      hours: 'Mon-Fri: 9 AM - 9 PM'
    },
    {
      city: 'Bangalore',
      phone: '+91-80-3456-7890',
      address: '789, MG Road, Bangalore - 560001',
      email: 'bangalore@heavenmatch.com',
      hours: 'Mon-Fri: 9 AM - 9 PM'
    },
    {
      city: 'Chennai',
      phone: '+91-44-4567-8901',
      address: '321, Anna Salai, Chennai - 600002',
      email: 'chennai@heavenmatch.com',
      hours: 'Mon-Fri: 9 AM - 9 PM'
    },
    {
      city: 'Kolkata',
      phone: '+91-33-5678-9012',
      address: '654, Park Street, Kolkata - 700016',
      email: 'kolkata@heavenmatch.com',
      hours: 'Mon-Fri: 9 AM - 9 PM'
    },
    {
      city: 'Hyderabad',
      phone: '+91-40-6789-0123',
      address: '987, Hitech City, Hyderabad - 500081',
      email: 'hyderabad@heavenmatch.com',
      hours: 'Mon-Fri: 9 AM - 9 PM'
    }
  ];

  const globalOffices = [
    { country: 'USA', phone: '+1-800-123-4567', city: 'New York' },
    { country: 'UK', phone: '+44-20-1234-5678', city: 'London' },
    { country: 'UAE', phone: '+971-4-123-4567', city: 'Dubai' },
    { country: 'Australia', phone: '+61-2-1234-5678', city: 'Sydney' }
  ];

  return (
    <div className="locations-page">
      <div className="locations-header">
        <div className="container">
          <h1>Our Office Locations</h1>
          <p>Visit us in person or reach out to our regional offices</p>
        </div>
      </div>

      <div className="container">
        {/* Corporate Office */}
        <section className="corporate-office-section">
          <div className="office-card featured">
            <div className="office-header">
              <div>
                <h2><i className="fas fa-building"></i> Corporate Headquarters</h2>
                <p className="office-name">{corporateOffice.name}</p>
              </div>
            </div>
            <div className="office-details">
              <div className="detail-item">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <strong>Address</strong>
                  <p>{corporateOffice.address}</p>
                </div>
              </div>
              <div className="detail-item">
                <i className="fas fa-phone"></i>
                <div>
                  <strong>Phone</strong>
                  <p><a href={`tel:${corporateOffice.phone}`}>{corporateOffice.phone}</a></p>
                </div>
              </div>
              <div className="detail-item">
                <i className="fas fa-envelope"></i>
                <div>
                  <strong>Email</strong>
                  <p><a href={`mailto:${corporateOffice.email}`}>{corporateOffice.email}</a></p>
                </div>
              </div>
            </div>
          </div>
        </section>

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

        {/* Regional Offices */}
        <section className="regional-offices-section">
          <h2 className="section-title">Regional Offices in India</h2>
          <div className="offices-grid">
            {regionalOffices.map((office, index) => (
              <div key={index} className="office-card">
                <div className="office-header">
                  <h3>
                    <i className="fas fa-map-marker-alt"></i> {office.city}
                  </h3>
                </div>
                <div className="office-details">
                  <div className="detail-item">
                    <i className="fas fa-phone"></i>
                    <div>
                      <strong>Phone</strong>
                      <p><a href={`tel:${office.phone}`}>{office.phone}</a></p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-map-pin"></i>
                    <div>
                      <strong>Address</strong>
                      <p>{office.address}</p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-envelope"></i>
                    <div>
                      <strong>Email</strong>
                      <p><a href={`mailto:${office.email}`}>{office.email}</a></p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-clock"></i>
                    <div>
                      <strong>Hours</strong>
                      <p>{office.hours}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Global Offices */}
        <section className="global-offices-section">
          <h2 className="section-title">Global Support</h2>
          <p className="section-subtitle">We serve customers across the globe</p>
          <div className="global-offices-grid">
            {globalOffices.map((office, index) => (
              <div key={index} className="global-office-card">
                <div className="flag-icon">
                  <i className="fas fa-globe-americas"></i>
                </div>
                <h3>{office.country}</h3>
                <p className="city">{office.city}</p>
                <a href={`tel:${office.phone}`} className="phone-link">
                  <i className="fas fa-phone"></i> {office.phone}
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LocationsPage;

