// controllers/authController.js
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

// Simple in-memory OTP store (for demo only)
const otps = new Map();

// Demo user (replace this with database logic later)
const DEMO_USER = {
  email: 'user@example.com',
  password: 'password123',
  name: 'Demo User'
};

// Create a test SMTP transporter using Ethereal
async function createTestTransporter() {
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
  return { transporter };
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  if (email !== DEMO_USER.email || password !== DEMO_USER.password)
    return res.status(401).json({ error: 'Invalid email or password.' });

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const sessionId = uuidv4();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min
  otps.set(sessionId, { otp, expiresAt, email });

  try {
    const { transporter } = await createTestTransporter();
    const info = await transporter.sendMail({
      from: '"No Reply" <no-reply@example.com>',
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
      html: `<p>Your OTP is <b>${otp}</b>. It expires in 5 minutes.</p>`
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    return res.json({
      sessionId,
      previewUrl,
      message: 'OTP sent successfully (use preview URL to view the email).'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send OTP email.' });
  }
}

function verifyOtp(req, res) {
  const { sessionId, otp } = req.body;
  if (!sessionId || !otp)
    return res.status(400).json({ error: 'Session ID and OTP are required.' });

  const entry = otps.get(sessionId);
  if (!entry) return res.status(400).json({ error: 'Session expired or invalid.' });
  if (Date.now() > entry.expiresAt) {
    otps.delete(sessionId);
    return res.status(400).json({ error: 'OTP expired.' });
  }
  if (entry.otp !== otp)
    return res.status(401).json({ error: 'Incorrect OTP.' });

  otps.delete(sessionId);
  return res.json({ success: true, token: 'demo-token', email: entry.email });
}

module.exports = { login, verifyOtp };
