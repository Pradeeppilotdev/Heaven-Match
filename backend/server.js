const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ---------------- CONFIG ----------------
const PORT = process.env.PORT || 4000;
const API_KEY = process.env.HEAVEN_API_KEY || "heavenmatch123"; // change for production
const JWT_SECRET = process.env.JWT_SECRET || "secretkey"; // change in production
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// In-memory OTP store: { [email]: { otp: "123456", expires: 1234567890 } }
let otpStore = {};

// ---------------- Nodemailer helper (Ethereal preview) ----------------
async function sendEmailPreview(to, otp) {
  // create test account automatically
  const testAccount = await nodemailer.createTestAccount();

  // Create SMTP transporter with the Ethereal test account
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  // Send the OTP email
  const info = await transporter.sendMail({
    from: '"HeavenMatch" <no-reply@heavenmatch.com>',
    to,
    subject: "Your OTP Code",
    html: `<h3>Your OTP Code</h3>
           <p>Your OTP is <b>${otp}</b>. It expires in 5 minutes.</p>`,
  });

  // Log for dev and return preview URL
  console.log(`✅ OTP for ${to}: ${otp}`);
  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log("Preview URL:", previewUrl);
  return previewUrl;
}

// ---------------- Helpers ----------------
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

function createOtpRecord(email) {
  const otp = generateOtp();
  const expires = Date.now() + OTP_EXPIRY_MS;
  otpStore[email] = { otp, expires };
  // schedule cleanup after expiry (defensive)
  setTimeout(() => {
    const rec = otpStore[email];
    if (rec && rec.expires <= Date.now()) {
      delete otpStore[email];
    }
  }, OTP_EXPIRY_MS + 1000);
  return { otp, expires };
}

// middleware: check API key
function requireApiKey(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(403).json({ ok: false, error: "Invalid or missing API key" });
  }
  next();
}

// ---------------- Routes ----------------

// Root
app.get("/", (req, res) => {
  res.send("<h2>OTP Backend Running 🚀</h2><p>POST /api/request-otp | POST /api/verify-otp</p>");
});

/*
  Request OTP
  - Requires header: x-api-key
  - Body: { email }
  - Response (dev): { ok: true, previewUrl, otp, expires }
*/
app.post("/api/request-otp", requireApiKey, async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ ok: false, error: "Email is required" });

  // create OTP record (in-memory)
  const { otp, expires } = createOtpRecord(email);

  try {
    // send preview email (Ethereal)
    const previewUrl = await sendEmailPreview(email, otp);

    // For development convenience we return the OTP (remove in production)
    return res.json({
      ok: true,
      message: "OTP generated and preview email sent (dev).",
      previewUrl,
      otp,
      expires,
    });
  } catch (err) {
    console.error("Failed to send OTP email:", err);
    return res.status(500).json({ ok: false, error: "Failed to send OTP email" });
  }
});

/*
  Verify OTP
  - Requires header: x-api-key
  - Body: { email, otp }
  - Response on success: { ok: true, token }
*/
app.post("/api/verify-otp", requireApiKey, (req, res) => {
  const { email, otp } = req.body || {};
  if (!email || !otp) return res.status(400).json({ ok: false, error: "Email and OTP are required" });

  const record = otpStore[email];
  if (!record) return res.status(400).json({ ok: false, error: "No OTP requested or OTP expired" });

  if (Date.now() > record.expires) {
    delete otpStore[email];
    return res.status(400).json({ ok: false, error: "OTP expired" });
  }

  if (String(otp).trim() !== String(record.otp).trim()) {
    return res.status(400).json({ ok: false, error: "Invalid OTP" });
  }

  // success: consume OTP and return JWT (or whatever you need)
  delete otpStore[email];
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1h" });
  return res.json({ ok: true, token });
});

// ---------------- Dev helper: view active OTPs (ONLY for local testing) ----------------
app.get("/admin/otps", (req, res) => {
  let rows = "";
  for (const [email, rec] of Object.entries(otpStore)) {
    rows += `<tr><td style="padding:8px;border:1px solid #eee">${email}</td><td style="padding:8px;border:1px solid #eee">${rec.otp}</td><td style="padding:8px;border:1px solid #eee">${new Date(rec.expires).toLocaleString()}</td></tr>`;
  }
  const html = `
    <html>
      <head><title>DEV OTPs</title></head>
      <body style="font-family:Inter,Arial,Helvetica,sans-serif;padding:24px">
        <h2>DEV: Active OTPs</h2>
        <p style="color:#a00">This page is for development only. Do not expose in production.</p>
        <table style="border-collapse:collapse;width:100%;max-width:800px">
          <thead><tr><th style="padding:8px;border:1px solid #eee;text-align:left">Email</th><th style="padding:8px;border:1px solid #eee">OTP</th><th style="padding:8px;border:1px solid #eee">Expires At</th></tr></thead>
          <tbody>${rows || `<tr><td colspan="3" style="padding:8px;border:1px solid #eee">No active OTPs</td></tr>`}</tbody>
        </table>
      </body>
    </html>
  `;
  res.send(html);
});

// ---------------- Start ----------------
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT} (API key required on /api/*)`));
