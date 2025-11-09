import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChurchArch } from './ui/ChurchArch';
import { withBackendURL } from '../utils/backend';
import './Signup.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stars, setStars] = useState([]);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(withBackendURL('/api/auth/signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });

      const data = await response.json();

      if (response.ok) {
        // Success - redirect to login with message
        navigate('/login', {
          state: {
            message: data.message || 'Account created! Please login.',
            email: email
          }
        });
      } else {
        setError(data.error || data.message || 'Failed to create account');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate floating stars
  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 20; i++) {
        newStars.push({
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          delay: Math.random() * 4,
          duration: 3 + Math.random() * 3
        });
      }
      setStars(newStars);
    };

    generateStars();
    const interval = setInterval(generateStars, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="signup-container">
      <div className="signup-background"></div>

      {/* Floating Stars */}
      <div className="star-constellation">
        {stars.map(star => (
          <div
            key={star.id}
            className="floating-star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`
            }}
          />
        ))}
      </div>

      <div className="signup-card">
        {/* Church Arch Decorations */}
        <ChurchArch className="signup-arch-decoration" variant="inverse" />
        <ChurchArch className="signup-arch-left" variant="inverse" />
        <ChurchArch className="signup-arch-right" variant="inverse" />
        <div className="signup-header">
          <h1>Create Your Account</h1>
          <p>Join HeavenMatch and find your perfect match</p>
        </div>

        {error && <div className="message error">{error}</div>}

        <form onSubmit={handleSignup} className="signup-form">
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name (Optional)</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your Name"
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
