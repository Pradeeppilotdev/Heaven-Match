import React, { useEffect, useState } from "react";

/*
  Heaven Match — Email OTP only login (single file)
  - Password removed.
  - Only email is requested to send OTP.
  - Uses backend endpoints:
      POST http://localhost:4000/api/request-otp   (requires x-api-key header)
      POST http://localhost:4000/api/verify-otp    (requires x-api-key header)
  - Backend (dev) returns previewUrl and otp for testing; these are logged to console.
  - Sign Up view preserved (unchanged fields from your last request) except the subtitle under the signup title has been removed.
*/

export default function Login() {
  // UI states
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [currentOtp, setCurrentOtp] = useState(null); // dev-only: server returned OTP
  const [showSignup, setShowSignup] = useState(false);

  // Signup state (unchanged minimal fields)
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
    dob: "",
  });
  const [acceptTnC, setAcceptTnC] = useState(false);

  // Backend config (dev). Make sure this matches your server.
  const BACKEND_BASE = "http://localhost:4000";
  const API_KEY = "heavenmatch123";

  // Inject CSS
  useEffect(() => {
    const id = "heaven-login-styles";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.innerText = `
      :root{ --pink:#ff4d8b; --pink-dark:#ff2f78; --muted:#6b6b6b; }
      .hm-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.56);display:flex;align-items:center;justify-content:center;padding:20px;z-index:9999;}
      .hm-modal{width:100%;max-width:640px;background:#fff;border-radius:12px;box-shadow:0 18px 40px rgba(0,0,0,0.45);padding:26px;box-sizing:border-box;font-family:Inter,system-ui,Arial,sans-serif;}
      .hm-logo{width:64px;height:64px;border-radius:10px;background:var(--pink);color:#fff;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-weight:700;font-size:20px;}
      .hm-title{text-align:center;margin:0;font-size:20px;color:#222;font-weight:600;}
      .hm-sub{text-align:center;color:var(--muted);font-size:13px;margin-top:6px;}
      .hm-label{display:block;color:#444;font-size:13px;margin-bottom:6px;}
      .hm-input{width:100%;padding:10px 12px;border-radius:8px;border:1px solid #e6e6e6;font-size:14px;box-sizing:border-box;}
      .hm-row{margin-bottom:12px;}
      .hm-pinkbtn{width:100%;background:linear-gradient(180deg,var(--pink),var(--pink-dark));color:#fff;padding:12px;border:none;border-radius:10px;cursor:pointer;font-weight:600;box-shadow:0 8px 18px rgba(255,77,139,0.18);}
      .hm-ghost{width:100%;background:#ffe7f2;color:var(--pink);padding:12px;border:1px solid #ffd4ea;border-radius:10px;cursor:pointer;font-weight:600;}
      .hm-footer{text-align:center;margin-top:12px;font-size:13px;color:var(--muted);}
      .hm-links{color:var(--pink);text-decoration:none;font-weight:600;cursor:pointer;}
      .hm-otpwrap{display:flex;gap:8px;align-items:center;}
      .signup-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
      .back-link{color:var(--pink);text-decoration:underline;cursor:pointer;}
      @media (max-width:720px){.hm-modal{padding:18px}.hm-logo{width:56px;height:56px}.signup-grid{grid-template-columns:1fr}}
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Helpers: simple email validation
  function isValidEmail(e) {
    return /\S+@\S+\.\S+/.test(e);
  }

  // --- UPDATED: send OTP using backend API (replaces demo random OTP) ---
  async function sendOtpDemo() {
    // Validate
    if (!email) return alert("Please enter your email.");
    if (!isValidEmail(email)) return alert("Enter a valid email address.");

    try {
      const res = await fetch(`${BACKEND_BASE}/api/request-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      console.log("request-otp response:", data);

      if (data.ok) {
        // Show OTP input
        setOtpSent(true);
        // For development convenience the backend returns the otp and previewUrl — log them
        if (data.otp) {
          console.log("DEV OTP (server):", data.otp);
          setCurrentOtp(data.otp); // dev-only: store so you can compare locally
        }
        if (data.previewUrl) console.log("Preview URL:", data.previewUrl);
        alert("OTP generated — check server terminal, /admin/otps, or console (dev).");
      } else {
        alert(data.error || "Failed to generate OTP");
      }
    } catch (err) {
      console.error("Error requesting OTP:", err);
      alert("Network error while requesting OTP");
    }
  }

  // --- UPDATED: verify OTP via backend ---
  async function verifyOtpDemo() {
    const otpToSend = String(otp || "").trim();
    if (!otpToSend) return alert("Please enter OTP.");
    // Optional: if you want to inform user about the server-returned OTP (dev)
    if (currentOtp) console.log("Comparing with last server OTP (dev):", currentOtp);

    try {
      const res = await fetch(`${BACKEND_BASE}/api/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ email, otp: otpToSend }),
      });

      const data = await res.json();
      console.log("verify-otp response:", data);

      if (data.ok) {
        alert("OTP verified — login success (demo)!");
        // store token if provided by backend
        if (data.token) {
          localStorage.setItem("hm_token", data.token);
        }
        // reset local state
        setOtp("");
        setOtpSent(false);
        setCurrentOtp(null);
        // redirect if needed, e.g.: window.location.href = "/dashboard";
      } else {
        // show error from backend
        alert(data.error || "Invalid OTP — try again.");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      alert("Network error while verifying OTP");
    }
  }

  // Signup handlers (same as before, still minimal)
  function handleSignupSubmit(ev) {
    ev.preventDefault();
    const { fullName, email: sEmail, phone, password: pw, confirmPassword } = signupData;
    if (!fullName || !sEmail || !phone || !pw || !confirmPassword)
      return alert("Please fill all required signup fields.");
    if (pw !== confirmPassword) return alert("Passwords do not match.");
    if (!acceptTnC) return alert("Please accept terms & conditions.");
    alert("Signup success (demo). Replace with backend call.");
    console.log("Signup data", signupData);
    setEmail(signupData.email || "");
    setShowSignup(false);
    setSignupData({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      gender: "",
      dob: "",
    });
    setAcceptTnC(false);
  }

  const handleSignupChange = (f, v) => setSignupData((p) => ({ ...p, [f]: v }));

  // Render
  return (
    <div className="hm-overlay" role="dialog" aria-modal="true">
      <div className="hm-modal" role="document">
        <div className="hm-logo">HM</div>

        {!showSignup ? (
          <>
            <h3 className="hm-title">Welcome to Heaven Match</h3>
            <div className="hm-sub">Sign in quickly using email OTP</div>

            <div style={{ marginTop: 16 }}>
              {/* EMAIL INPUT */}
              <div className="hm-row">
                <label className="hm-label">Email ID</label>
                <input
                  className="hm-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  type="email"
                  autoComplete="email"
                />
              </div>

              {/* SEND OTP */}
              {!otpSent ? (
                <div style={{ marginTop: 8 }}>
                  <button className="hm-pinkbtn" onClick={sendOtpDemo}>Send OTP</button>
                </div>
              ) : (
                <>
                  {/* ----------- OTP VERIFICATION BLOCK (modified only) ----------- */}
                  <div className="hm-row" style={{ marginTop: 12 }}>
                    <label className="hm-label">Enter OTP</label>

                    {/* New visual: larger centered OTP input + smaller Verify button */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {/* Large single OTP-style box (visually bigger) */}
                      <input
                        className="hm-input"
                        style={{
                          flex: "0 0 160px",
                          height: 80,
                          fontSize: 32,
                          textAlign: "center",
                          border: `3px solid var(--pink)`,
                          borderRadius: 12,
                          background: "rgba(255,77,139,0.06)",
                          padding: 0,
                        }}
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0,6))}
                        placeholder="######"
                        inputMode="numeric"
                      />

                      {/* Smaller Verify button */}
                      <button
                        className="hm-pinkbtn"
                        style={{
                          minWidth: 160,
                          width: 160,
                          padding: "10px 14px",
                          fontSize: 16,
                        }}
                        onClick={verifyOtpDemo}
                      >
                        Verify
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button className="hm-ghost" style={{ flex: 1 }} onClick={() => { setOtpSent(false); setOtp(""); setCurrentOtp(null); }}>Cancel</button>
                    <button className="hm-ghost" style={{ flex: 1 }} onClick={sendOtpDemo}>Resend</button>
                  </div>
                  {/* ----------- END OTP VERIFICATION BLOCK ----------- */}
                </>
              )}
            </div>

            <div className="hm-footer" style={{ marginTop: 18 }}>
              New to Heaven Match?{" "}
              <span className="hm-links" onClick={() => setShowSignup(true)}>Sign Up Free</span>
            </div>
          </>
        ) : (
          /* SIGNUP VIEW (UNCHANGED except subtitle removed) */
          <>
            <h3 className="hm-title">Create your Heaven Match Account</h3>
            {/* subtitle line removed as requested */}

            <form onSubmit={handleSignupSubmit} style={{ marginTop: 14 }}>
              <div className="signup-grid">
                <div>
                  <label className="hm-label">Full Name</label>
                  <input className="hm-input" value={signupData.fullName} onChange={(e) => handleSignupChange("fullName", e.target.value)} placeholder="Your full name" />
                </div>
                <div>
                  <label className="hm-label">Gender</label>
                  <select className="hm-input" value={signupData.gender} onChange={(e) => handleSignupChange("gender", e.target.value)}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="hm-label">Email</label>
                  <input type="email" className="hm-input" value={signupData.email} onChange={(e) => handleSignupChange("email", e.target.value)} placeholder="Email address" />
                </div>
                <div>
                  <label className="hm-label">Phone</label>
                  <input className="hm-input" value={signupData.phone} onChange={(e) => handleSignupChange("phone", e.target.value)} placeholder="Mobile number" />
                </div>

                <div>
                  <label className="hm-label">Password</label>
                  <input type="password" className="hm-input" value={signupData.password} onChange={(e) => handleSignupChange("password", e.target.value)} placeholder="Create password" />
                </div>
                <div>
                  <label className="hm-label">Confirm Password</label>
                  <input type="password" className="hm-input" value={signupData.confirmPassword} onChange={(e) => handleSignupChange("confirmPassword", e.target.value)} placeholder="Confirm password" />
                </div>

                <div>
                  <label className="hm-label">Date of Birth</label>
                  <input type="date" className="hm-input" value={signupData.dob} onChange={(e) => handleSignupChange("dob", e.target.value)} />
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                <input id="tnc" type="checkbox" checked={acceptTnC} onChange={(e) => setAcceptTnC(e.target.checked)} />
                <label htmlFor="tnc" style={{ fontSize: 13, color: "#666" }}>I accept the <span className="back-link" onClick={() => alert("Show T&Cs (demo)")}>Terms & Conditions</span></label>
              </div>

              <div style={{ marginTop: 6 }}>
                <button className="hm-pinkbtn" type="submit">Create Account</button>
              </div>

              <div style={{ marginTop: 12 }}>
                <button type="button" className="hm-ghost" onClick={() => setShowSignup(false)}>Back to Login</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
