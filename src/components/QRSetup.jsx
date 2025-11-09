import React, { useState, useEffect } from 'react';
import { withBackendURL } from '../utils/backend';
import './QRSetup.css';

const QRSetup = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState('generate'); // 'generate' or 'verify'
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate QR Code on mount
  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('hm_token');
      const response = await fetch(withBackendURL('/api/auth/setup-qr'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        setQrCode(data.qrCode);
        setSecret(data.secret || '');
        setStep('verify');
      } else {
        setError(data.message || 'Failed to generate QR code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('hm_token');
      const response = await fetch(withBackendURL('/api/auth/verify-qr-setup'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ code: verificationCode })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('QR authentication activated successfully!');
        setTimeout(() => {
          onSuccess && onSuccess();
        }, 1500);
      } else {
        setError(data.message || 'Invalid code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="qr-setup-overlay" onClick={onClose}>
      <div className="qr-setup-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>

        <div className="qr-setup-header">
          <h2>Setup Two-Factor Authentication</h2>
          <p>Scan the QR code with your authenticator app</p>
        </div>

        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}

        {loading && step === 'generate' ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Generating QR code...</p>
          </div>
        ) : (
          <>
            {step === 'verify' && qrCode && (
              <div className="qr-setup-content">
                {/* Step 1: Scan QR Code */}
                <div className="setup-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Scan QR Code</h3>
                    <div className="qr-code-container">
                      <img src={qrCode} alt="QR Code" className="qr-code-image" />
                    </div>
                    <p className="step-description">
                      Use Google Authenticator, Authy, or Microsoft Authenticator
                    </p>
                  </div>
                </div>

                {/* Step 2: Manual Entry (Optional) */}
                {secret && (
                  <div className="setup-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h3>Or Enter Manually</h3>
                      <div className="secret-box">
                        <code>{secret}</code>
                        <button
                          type="button"
                          className="copy-btn"
                          onClick={copySecret}
                          disabled={copied}
                        >
                          {copied ? '✓ Copied!' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Verify Code */}
                <div className="setup-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>Verify Setup</h3>
                    <form onSubmit={handleVerify} className="verify-form">
                      <div className="form-group">
                        <label htmlFor="verification-code">
                          Enter the 6-digit code from your app
                        </label>
                        <input
                          type="text"
                          id="verification-code"
                          value={verificationCode}
                          onChange={(e) =>
                            setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                          }
                          placeholder="000000"
                          maxLength="6"
                          required
                          disabled={loading}
                          className="code-input"
                        />
                      </div>

                      <div className="button-group">
                        <button
                          type="submit"
                          className="btn-primary"
                          disabled={loading || verificationCode.length !== 6}
                        >
                          {loading ? 'Verifying...' : 'Verify & Activate'}
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={onClose}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Instructions */}
                <div className="qr-instructions">
                  <h4>How to set up:</h4>
                  <ol>
                    <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                    <li>Open the app and tap "Add account" or "Scan QR code"</li>
                    <li>Scan the QR code above or enter the secret manually</li>
                    <li>Enter the 6-digit code shown in your app to verify</li>
                  </ol>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QRSetup;
