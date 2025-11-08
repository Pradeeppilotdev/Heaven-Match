import React from 'react';
import { Link } from 'react-router-dom';
import './SubscriptionPage.css';

const plans = [
  {
    name: 'Essentials',
    price: '₹0',
    billing: 'Free forever',
    description: 'Discover profiles and save your favourites while you get to know Heaven Match.',
    features: [
      'Browse complete member profiles',
      'Shortlist favourites and receive smart recommendations',
      'AI powered conversation starters',
      'Access to public success stories',
      'Community events newsletter'
    ]
  },
  {
    name: 'Premium Match',
    price: '₹1,499',
    billing: 'per month',
    description: 'Everything you need to actively connect with compatible matches guided by our experts.',
    highlight: true,
    badge: 'Most popular',
    features: [
      'Unlimited direct messages & video requests',
      'Compatibility insights with detailed AI reports',
      'Priority listing in daily match feed',
      'Dedicated relationship advisor (email & chat)',
      'Verified badge & profile boost twice every week'
    ]
  },
  {
    name: 'Elite Concierge',
    price: '₹3,499',
    billing: 'per month',
    description: 'A bespoke experience for families looking for curated introductions and premium support.',
    features: [
      'Personal matchmaking concierge with weekly consultations',
      'Private, invitation-only virtual meets',
      'Legal & financial readiness checklist',
      'Family onboarding & background verification support',
      'Priority assistance over phone, WhatsApp & email'
    ]
  }
];

const SubscriptionPage = () => {
  return (
    <div className="subscription-page">
      <section className="plan-section">
        <div className="subscription-container">
          <h1 className="section-heading">Flexible plans crafted for families & individuals</h1>
          <p className="section-subheading">Every membership includes 24/7 AI support, strict profile moderation and access to our mobile apps.</p>

          <div className="plans-grid">
            {plans.map((plan) => (
              <article key={plan.name} className={`plan-card ${plan.highlight ? 'plan-card--highlight' : ''}`}>
                {plan.badge && <span className="plan-badge">{plan.badge}</span>}
                <header className="plan-card__header">
                  <h2>{plan.name}</h2>
                  <div className="plan-card__price">
                    <span>{plan.price}</span>
                    <small>{plan.billing}</small>
                  </div>
                  <p className="plan-card__description">{plan.description}</p>
                </header>
                <ul className="plan-card__features">
                  {plan.features.map((feature) => (
                    <li key={feature}>
                      <i className="fas fa-heart"></i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`plan-card__cta ${plan.highlight ? 'plan-card__cta--primary' : ''}`}>
                  {plan.name === 'Essentials' ? 'Create free profile' : 'Choose this plan'}
                </Link>
              </article>
            ))}
          </div>

          <p className="plan-note">Need quarterly or yearly pricing? <Link to="/support">Contact support</Link> for bespoke packages.</p>
        </div>
      </section>
    </div>
  );
};

export default SubscriptionPage;
