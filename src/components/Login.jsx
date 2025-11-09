import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChurchArch } from './ui/ChurchArch';
import './Login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('otp'); // 'otp' or 'qr'
  const [step, setStep] = useState('email'); // 'email' or 'verify'
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.message || '');
  // eslint-disable-next-line no-unused-vars
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [stars, setStars] = useState([]);

  // Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setStep('verify');
        setOtpExpiry(Date.now() + (data.expiresIn * 1000));
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (response.ok) {
        // Use AuthContext login
        login({ email: data.email }, data.token);

        setSuccess('Login successful!');
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Login with QR Code
  const handleQRLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/login-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code: qrCode })
      });

      const data = await response.json();

      if (response.ok) {
        // Use AuthContext login
        login({ email: data.email }, data.token);

        setSuccess('Login successful!');
        setTimeout(() => {
          navigate('/');
        }, 500);
      } else {
        setError(data.message || 'Invalid code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setError('');
    setSuccess('');
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
    <div className="login-container">
      <div className="login-background"></div>

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

      <div className="login-card">
        {/* Church Arch Decorations */}
        <ChurchArch className="login-arch-decoration" variant="inverse" />
        <ChurchArch className="login-arch-left" variant="inverse" />
        <ChurchArch className="login-arch-right" variant="inverse" />
        <div className="login-header">
          <h1>Welcome to HeavenMatch</h1>
          <p>Sign in to continue</p>
        </div>

        {/* Mode Toggle */}
        <div className="login-tabs">
          <button
            className={`tab ${mode === 'otp' ? 'active' : ''}`}
            onClick={() => {
              setMode('otp');
              setStep('email');
              setError('');
              setSuccess('');
            }}
          >
            Email OTP
          </button>
          <button
            className={`tab ${mode === 'qr' ? 'active' : ''}`}
            onClick={() => {
              setMode('qr');
              setStep('email');
              setError('');
              setSuccess('');
            }}
          >
            QR Code Login
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}

        {/* OTP Login Flow */}
        {mode === 'otp' && (
          <>
            {step === 'email' ? (
              <form onSubmit={handleRequestOTP} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="login-form">
                <div className="form-group">
                  <label htmlFor="otp">Enter 6-Digit Code</label>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength="6"
                    required
                    disabled={loading}
                    className="otp-input"
                  />
                  <p className="help-text">
                    Check your email for the verification code
                  </p>
                </div>

                <button type="submit" className="btn-primary" disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleBackToEmail}
                  disabled={loading}
                >
                  Back to Email
                </button>
              </form>
            )}
          </>
        )}

        {/* QR Code Login Flow */}
        {mode === 'qr' && (
          <form onSubmit={handleQRLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="qr-email">Email Address</label>
              <input
                type="email"
                id="qr-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="qr-code">Authenticator Code</label>
              <input
                type="text"
                id="qr-code"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                required
                disabled={loading}
                className="otp-input"
              />
              <p className="help-text">
                Enter the code from your authenticator app
              </p>
            </div>

            <button type="submit" className="btn-primary" disabled={loading || qrCode.length !== 6}>
              {loading ? 'Logging in...' : 'Login with QR Code'}
            </button>
          </form>
        )}

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="link">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
