import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stay, setStay] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      // store session for OTP verify page
      sessionStorage.setItem("mfa_sessionId", data.sessionId);
      sessionStorage.setItem("mfa_previewUrl", data.previewUrl || "");
      navigate("/otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleOtpLogin(e) {
    // reuse login for demo; change if you have an endpoint for contact-only OTP
    handleLogin(e);
  }

  return (
    <div className="page">
      <div className="bg" aria-hidden />
      <div className="overlay" aria-hidden />

      <div className="card" role="dialog" aria-labelledby="login-title">
        <button className="close" aria-label="close">✕</button>

        <div className="logo">HM</div>

        <h2 id="login-title" className="heading">Welcome back! Please Login</h2>

        <form className="form" onSubmit={handleLogin} noValidate>
          {error && <div className="error">{error}</div>}

          <div className="field">
            <label className="label" htmlFor="email">Email ID</label>
            <input
              id="email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="row between small" style={{ marginBottom: 14 }}>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={stay}
                onChange={() => setStay((s) => !s)}
              />
              <span style={{ marginLeft: 8 }}>Stay Logged in</span>
            </label>

            <button
              type="button"
              className="link pink"
              onClick={() => alert("Forgot password flow")}
            >
              Forgot Password?
            </button>
          </div>

          <button className="btn primary pink" type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Login"}
          </button>

          <div className="or"><span>OR</span></div>

          <button className="btn secondary" type="button" onClick={handleOtpLogin}>
            Login with OTP
          </button>

          <p className="footer">New to site? <a href="#">Sign Up Free</a></p>
        </form>
      </div>
    </div>
  );
}
