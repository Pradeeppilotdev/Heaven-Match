import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OtpPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  const sessionId = sessionStorage.getItem("mfa_sessionId");
  const previewUrl = sessionStorage.getItem("mfa_previewUrl");

  async function handleVerify(e) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (!sessionId) return setErr("Session missing. Go back and request OTP again.");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setMsg("Login successful!");
      // Example: save token then redirect home
      // localStorage.setItem('token', data.token)
      setTimeout(() => navigate("/"), 1000);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="page-bg" aria-hidden />
      <div className="overlay" aria-hidden />
      <div className="modal small" role="dialog">
        <div className="modal-top">
          <div className="brand">S</div>
          <h1>Enter OTP</h1>
        </div>

        {previewUrl && (
          <p className="info">For demo: <a href={previewUrl} target="_blank" rel="noreferrer">Open preview email</a></p>
        )}

        <form className="form" onSubmit={handleVerify}>
          {err && <div className="alert error">{err}</div>}
          {msg && <div className="alert">{msg}</div>}

          <label className="lbl">OTP</label>
          <input className="input" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" required />

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="row between small">
            <button type="button" className="link" onClick={() => { sessionStorage.removeItem("mfa_sessionId"); sessionStorage.removeItem("mfa_previewUrl"); navigate("/"); }}>Back to login</button>
            <button type="button" className="link" onClick={() => setMsg("Resent OTP (demo)")}>Resend</button>
          </div>
        </form>
      </div>
    </div>
  );
}
