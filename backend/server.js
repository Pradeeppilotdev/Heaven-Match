const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let otpStore = {}; // temporary storage for OTPs

// Function to send email using Ethereal (no signup)
async function sendEmailPreview(to, otp) {
  // Create a test account automatically
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

  console.log(`✅ OTP for ${to}: ${otp}`);
  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));

  return nodemailer.getTestMessageUrl(info);
}

// Route 1: Request OTP
app.post("/api/request-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ ok: false, error: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

  try {
    const previewUrl = await sendEmailPreview(email, otp);
    res.json({ ok: true, previewUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "Failed to send OTP" });
  }
});

// Route 2: Verify OTP
app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];
  if (!record) return res.json({ ok: false, error: "No OTP requested" });
  if (Date.now() > record.expires) return res.json({ ok: false, error: "OTP expired" });
  if (otp !== record.otp) return res.json({ ok: false, error: "Invalid OTP" });

  delete otpStore[email]; // clear OTP once verified
  const token = jwt.sign({ email }, "secretkey", { expiresIn: "1h" });
  res.json({ ok: true, token });
});

// Root page
app.get("/", (req, res) => {
  res.send("<h2>OTP Backend Running 🚀</h2><p>POST /api/request-otp | POST /api/verify-otp</p>");
});

const PORT = 4000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
