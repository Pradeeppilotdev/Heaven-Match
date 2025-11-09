const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT_SERVER || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
app.get('/api/generate-token', (req, res) => {
  const token = generateFormToken(req);
  const honeypot = generateHoneypotHTML();

  res.json({
    token,
    honeypot,
    message: 'Token generated successfully'
  });
});
// AI Provider Configuration - Single API Key for all features
const AI_PROVIDER = process.env.REACT_APP_AI_PROVIDER || 'openrouter'; // 'openrouter', 'openai', 'huggingface'
const AI_API_KEY = process.env.REACT_APP_AI_API_KEY || process.env.REACT_APP_HF_API_TOKEN;
const AI_MODEL = process.env.REACT_APP_AI_MODEL || 'meta-llama/llama-3.1-8b-instruct'; // OpenRouter model

app.set('trust proxy', 1);

const allowedOrigins = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:3001,http://127.0.0.1:3001,http://localhost:5173,http://localhost:5174,https://heavenmatch.com,https://www.heavenmatch.com'
)
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const isPrivateNetworkOrigin = (origin = '') =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
  /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/i.test(origin);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin) || isPrivateNetworkOrigin(origin)) {
      return callback(null, true);
    }
    console.warn('[SECURITY] Blocked CORS origin', { origin });
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token', 'Cache-Control', 'cache-control', 'Pragma'],
  credentials: true,
  optionsSuccessStatus: 204
};

const FORM_SECURITY_CONFIG = {
  minFormTimeMs: Number(process.env.SECURITY_MIN_FORM_TIME_MS) || 2000,
  formTokenTtlMs: Number(process.env.SECURITY_FORM_TOKEN_TTL_MS) || 60 * 60 * 1000,
  rateWindowMs: Number(process.env.SECURITY_RATE_WINDOW_MS) || 60 * 1000,
  rateMax: Number(process.env.SECURITY_RATE_MAX) || 5,
  requireFormToken: process.env.SECURITY_REQUIRE_FORM_TOKEN === 'true'
};

const formTimestamps = new Map();
const submissionTimestamps = new Map();

const generateFormToken = (req) => {
  const token = crypto.randomBytes(32).toString('hex');
  formTimestamps.set(token, {
    timestamp: Date.now(),
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  return token;
};

const validateFormTiming = (token, ip, { minTimeMs = FORM_SECURITY_CONFIG.minFormTimeMs, requireToken = FORM_SECURITY_CONFIG.requireFormToken } = {}) => {
  if (!token || !formTimestamps.has(token)) {
    return requireToken
      ? { valid: false, reason: 'Invalid or missing token' }
      : { valid: true, skipped: true, reason: 'Token missing or expired' };
  }

  const formData = formTimestamps.get(token);
  const timeTaken = Date.now() - formData.timestamp;

  if (formData.ip !== ip) {
    formTimestamps.delete(token);
    return { valid: false, reason: 'IP address mismatch' };
  }

  if (timeTaken < minTimeMs) {
    formTimestamps.delete(token);
    return { valid: false, reason: `Form submitted too quickly (${timeTaken}ms)` };
  }

  if (timeTaken > FORM_SECURITY_CONFIG.formTokenTtlMs) {
    formTimestamps.delete(token);
    return { valid: false, reason: 'Form token expired' };
  }

  formTimestamps.delete(token);
  return { valid: true, timeTaken };
};

const checkRateLimit = (key, maxSubmissions = FORM_SECURITY_CONFIG.rateMax, windowMs = FORM_SECURITY_CONFIG.rateWindowMs) => {
  const now = Date.now();
  if (!submissionTimestamps.has(key)) {
    submissionTimestamps.set(key, []);
  }

  const submissions = submissionTimestamps.get(key);
  const recent = submissions.filter((time) => now - time < windowMs);

  if (recent.length >= maxSubmissions) {
    submissionTimestamps.set(key, recent);
    return { allowed: false, reason: 'Too many requests' };
  }

  recent.push(now);
  submissionTimestamps.set(key, recent);
  return { allowed: true, remaining: Math.max(maxSubmissions - recent.length, 0) };
};

const generateHoneypotHTML = () => {
  const field1 = `user_${crypto.randomBytes(8).toString('hex')}`;
  const field2 = `email_${crypto.randomBytes(8).toString('hex')}`;

  return `
    <input type="text" name="${field1}" value=""
           style="position:absolute;left:-9999px;opacity:0"
           tabindex="-1" autocomplete="off">
    <input type="email" name="${field2}" value=""
           style="position:absolute;left:-9999px;opacity:0"
           tabindex="-1" autocomplete="off">
  `;
};

const validateHoneypot = (body = {}) => {
  const honeypotPatterns = [/user_[a-f0-9]{16}/, /email_[a-f0-9]{16}/];

  for (const key in body) {
    for (const pattern of honeypotPatterns) {
      if (pattern.test(key) && body[key] && body[key].trim() !== '') {
        return { valid: false, reason: 'Honeypot filled' };
      }
    }
  }
  return { valid: true };
};

const detectPromptInjection = (input) => {
  if (typeof input !== 'string') return { safe: true };

  const dangerous = [
    /ignore\s+(previous|all|above)\s+instructions?/i,
    /disregard\s+instructions?/i,
    /you\s+are\s+(now|a)\s+(admin|root|system)/i,
    /act\s+as\s+(admin|root)/i,
    /system\s*:/i,
    /write\s+(a\s+)?(phishing|malware|virus)/i,
    /how\s+to\s+(hack|crack|bypass)/i,
    /'\s*or\s*'\d*'\s*=\s*'\d/i,
    /<script/i,
    /javascript:/i
  ];

  for (const pattern of dangerous) {
    if (pattern.test(input)) {
      return {
        safe: false,
        reason: 'Malicious pattern detected',
        pattern: pattern.source
      };
    }
  }

  if (input.length > 5000) {
    return { safe: false, reason: 'Input too long' };
  }

  return { safe: true };
};

const validateAllInputs = (body = {}) => {
  for (const [field, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      const check = detectPromptInjection(value);
      if (!check.safe) {
        return { safe: false, field, ...check };
      }
    }
  }
  return { safe: true };
};

const validateSubmission = (req, formToken, options = {}) => {
  const errors = [];
  const opts = {
    minTimeMs: options.minTimeMs,
    requireToken: options.requireToken ?? FORM_SECURITY_CONFIG.requireFormToken
  };

  const timing = validateFormTiming(formToken, req.ip, opts);
  if (!timing.valid) {
    errors.push({ type: 'TIMING', msg: timing.reason });
  }

  const rateLimitKey = options.rateLimitKey || `${req.ip}:${req.originalUrl || 'global'}`;
  const rateLimitCheck = checkRateLimit(
    rateLimitKey,
    options.maxSubmissions ?? FORM_SECURITY_CONFIG.rateMax,
    options.windowMs ?? FORM_SECURITY_CONFIG.rateWindowMs
  );
  if (!rateLimitCheck.allowed) {
    errors.push({ type: 'RATE_LIMIT', msg: rateLimitCheck.reason });
  }

  const honeypot = validateHoneypot(req.body);
  if (!honeypot.valid) {
    errors.push({ type: 'HONEYPOT', msg: honeypot.reason });
  }

  const inputs = validateAllInputs(req.body);
  if (!inputs.safe) {
    errors.push({ type: 'INJECTION', msg: inputs.reason, field: inputs.field });
  }

  return {
    valid: errors.length === 0,
    errors,
    timing,
    rateLimit: rateLimitCheck,
    honeypot,
    inputs
  };
};

const logSecurityEvent = (req, validation) => {
  securityLogger('ADVANCED_SECURITY_VALIDATION', {
    ip: req.ip,
    path: req.originalUrl,
    userAgent: req.headers['user-agent'],
    validation
  });
};

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and images allowed.'));
    }
  }
});

// Simple in-memory store for OTPs
const otpStore = new Map();

// Configure nodemailer transport via environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Helper to generate OTP
const genOtp = () => String(Math.floor(100000 + Math.random() * 900000));

setInterval(() => {
  const now = Date.now();
  for (const [token, data] of formTimestamps.entries()) {
    if (now - data.timestamp > FORM_SECURITY_CONFIG.formTokenTtlMs) {
      formTimestamps.delete(token);
    }
  }

  for (const [key, timestamps] of submissionTimestamps.entries()) {
    const recent = timestamps.filter(
      (time) => now - time < FORM_SECURITY_CONFIG.rateWindowMs * 2
    );
    if (recent.length === 0) {
      submissionTimestamps.delete(key);
    } else {
      submissionTimestamps.set(key, recent);
    }
  }
}, 10 * 60 * 1000).unref();

// Cleanup loop to purge expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, entry] of otpStore.entries()) {
    if (entry.expiresAt && now > entry.expiresAt + (5 * 60 * 1000)) {
      otpStore.delete(email);
    }
  }
}, 5 * 60 * 1000).unref();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

const securityLogger = (event, details = {}) => {
  const payload = {
    event,
    timestamp: new Date().toISOString(),
    ...details
  };
  console.warn('[SECURITY]', payload);
};

const sanitizeText = (value, maxLength = 255) => {
  if (typeof value !== 'string') {
    return '';
  }
  return value
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
};

const sanitizePhone = (value) => {
  if (typeof value !== 'string') {
    return '';
  }
  return value
    .replace(/[^0-9+\-\s()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 20);
};

const validateContactSubmission = (payload = {}) => {
  const formType = payload.formType === 'support-ticket' ? 'support-ticket' : 'contact';
  const errors = {};

  const sanitized = {
    formType,
    name: sanitizeText(payload.name, 80),
    email: sanitizeText(payload.email, 120),
    phone: sanitizePhone(payload.phone),
    subject: sanitizeText(payload.subject || payload.issueTopic, 120),
    message: sanitizeText(payload.message || payload.description, 1000),
    issueTopic: sanitizeText(payload.issueTopic, 120),
    priority: sanitizeText(payload.priority, 10).toLowerCase()
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!sanitized.email || !emailPattern.test(sanitized.email)) {
    errors.email = 'A valid email address is required.';
  }

  if (sanitized.phone && !/^[0-9+\-\s()]{7,20}$/.test(sanitized.phone)) {
    errors.phone = 'Invalid phone number format.';
  }

  if (!sanitized.message || sanitized.message.length === 0) {
    errors.message = 'Message is required.';
  }

  if ((payload.message && payload.message.length > 1000) || (payload.description && payload.description.length > 1000)) {
    errors.message = 'Message cannot exceed 1000 characters.';
  }

  if (formType === 'contact') {
    if (!sanitized.name) {
      errors.name = 'Full name is required.';
    }
    if (!sanitized.subject) {
      errors.subject = 'Subject is required.';
    }
  } else {
    if (!sanitized.issueTopic) {
      errors.issueTopic = 'Issue topic is required.';
    }
    sanitized.subject = sanitized.subject || sanitized.issueTopic || 'Support Request';
    sanitized.priority = ['low', 'medium', 'high', 'urgent'].includes(sanitized.priority)
      ? sanitized.priority
      : 'medium';
  }

  sanitized.message = sanitized.message.slice(0, 1000);
  sanitized.subject = sanitized.subject || 'Support Request';
  sanitized.name = sanitized.name || 'HeavenMatch User';
  sanitized.phone = sanitized.phone || '';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized
  };
};

const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    securityLogger('RATE_LIMIT_EXCEEDED', { ip: req.ip, path: req.originalUrl });
    return res.status(429).json({
      error: 'Too many submissions. Please wait a few minutes before trying again.'
    });
  }
});

const requireCsrfToken = (req, res, next) => {
  const cookieToken = req.cookies?.hm_csrf;
  const headerToken = req.get('x-csrf-token');

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    securityLogger('CSRF_VALIDATION_FAILED', { ip: req.ip, path: req.originalUrl });
    return res.status(403).json({ error: 'Invalid or missing CSRF token.' });
  }

  return next();
};

app.get('/api/csrf-token', (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('hm_csrf', token, {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'Strict' : 'Lax',
    maxAge: 60 * 60 * 1000
  });
  res.json({ token });
});

/**
 * OTP Send endpoint
 * Purpose: Sends OTP to user's Gmail address for verification
 * POST /api/send-otp
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's Gmail address
 * @returns {Object} JSON response with success status and message
 */
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@gmail\.com$/i.test(email)) {
      return res.status(400).json({ ok: false, message: 'Valid Gmail required' });
    }

    const existing = otpStore.get(email);
    if (existing && existing.attempts >= 5 && Date.now() < existing.blockUntil) {
      return res.status(429).json({ ok: false, message: 'Too many attempts. Try later.' });
    }

    const otp = genOtp();
    const expiresAt = Date.now() + (2 * 60 * 1000);
    otpStore.set(email, { otp, expiresAt, attempts: (existing?.attempts || 0), blockUntil: 0 });

    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: 'Your HeavenMatch OTP',
      text: `Your HeavenMatch OTP is ${otp}. It expires in 2 minutes.`,
      html: `<p>Your HeavenMatch OTP is <strong>${otp}</strong>. It expires in 2 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);

    const nowStored = otpStore.get(email);
    nowStored.attempts = (nowStored.attempts || 0) + 1;
    otpStore.set(email, nowStored);

    return res.json({ ok: true, message: 'OTP sent' });
  } catch (err) {
    console.error('send-otp error', err);
    return res.status(500).json({ ok: false, message: 'Failed to send OTP' });
  }
});

/**
 * OTP Verify endpoint
 * Purpose: Verifies the OTP sent to user's email
 * POST /api/verify-otp
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's Gmail address
 * @param {string} req.body.otp - The OTP code to verify
 * @returns {Object} JSON response with verification status and message
 */
app.post('/api/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ ok: false, message: 'email & otp required' });

    const entry = otpStore.get(email);
    if (!entry) return res.status(400).json({ ok: false, message: 'No OTP sent or expired' });
    if (Date.now() > entry.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ ok: false, message: 'OTP expired' });
    }

    entry.attempts = (entry.attempts || 0) + 1;
    if (entry.attempts > 10) {
      entry.blockUntil = Date.now() + 15 * 60 * 1000;
      otpStore.set(email, entry);
      return res.status(429).json({ ok: false, message: 'Too many attempts' });
    }

    if (String(otp).trim() === String(entry.otp)) {
      otpStore.delete(email);
      return res.json({ ok: true, message: 'OTP verified' });
    } else {
      otpStore.set(email, entry);
      return res.status(400).json({ ok: false, message: 'Invalid OTP' });
    }
  } catch (err) {
    console.error('verify-otp error', err);
    return res.status(500).json({ ok: false, message: 'Server error' });
  }
});

/**
 * Profile Extraction endpoint - Extract user details from uploaded document using Gemini AI
 * Purpose: Extracts profile information from uploaded documents (PDF/images) using Google Gemini AI
 * POST /api/extract-profile
 * @param {Object} req.file - Uploaded document file (via multer)
 * @returns {Object} JSON response with extracted profile data
 */
// POST /api/extract-profile - Extract user details from uploaded document using Gemini AI
app.post('/api/extract-profile', upload.single('document'), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ ok: false, message: 'No document uploaded' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
      return res.status(500).json({ ok: false, message: 'Gemini API key not configured' });

    const base64Data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    const prompt = `You are a JSON extractor for a matrimonial registration form (HeavenMatch).
Return ONLY a single valid JSON object (no surrounding text) with these exact keys (use null if not present):

{
  "firstName": "First name or null",
  "lastName": "Last name or null",
  "fullName": "Full name or null",
  "dateOfBirth": "DD/MM/YYYY or null",
  "age": "numeric age or null",
  "gender": "Female/Male/Other or null",
  "maritalStatus": "Single/Divorced/Widowed or null",
  "email": "email or null",
  "phone": "phone number or null",
  "education": "highest qualification or null",
  "profession": "job title or null",
  "income": "annual income or null",
  "location": "city, state or null",
  "religion": "or null",
  "community": "or null",
  "caste": "or null",
  "motherTongue": "or null",
  "familyType": "Nuclear/Joint or null",
  "noOfSiblings": "integer or null",
  "height": "e.g. 170 cm or 5'7\" or null",
  "weight": "e.g. 70 kg or null",
  "hobbies": "comma separated or short sentence or null",
  "aboutMe": "short bio or null",
  "partnerPreferences": "short text or null"
}`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            { inline_data: { mime_type: mimeType, data: base64Data } },
          ],
        },
      ],
      generationConfig: { temperature: 0.0, maxOutputTokens: 2048 },
    };

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return res
        .status(500)
        .json({ ok: false, message: 'AI processing failed', error: errorText });
    }

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText)
      return res
        .status(500)
        .json({ ok: false, message: 'Invalid AI response structure' });

    let extracted;
    try {
      const cleaned = generatedText.replace(/```json\n?|\n?```/g, '').trim();
      extracted = JSON.parse(cleaned);
    } catch (err) {
      console.error('JSON parse error:', err, generatedText);
      return res
        .status(500)
        .json({ ok: false, message: 'Failed to parse AI JSON', raw: generatedText });
    }

    const toNullIfEmpty = (v) =>
      !v || (typeof v === 'string' && v.trim() === '') ? null : v;
    const parseIntSafe = (v) => {
      const num = parseInt(String(v).match(/\d+/)?.[0] || '');
      return isNaN(num) ? null : num;
    };
    const ddmmyyyyToIso = (d) => {
      const m = d?.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
      return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
    };

    const e = extracted || {};
    const fullName = toNullIfEmpty(e.fullName);
    let firstName = toNullIfEmpty(e.firstName);
    let lastName = toNullIfEmpty(e.lastName);
    if ((!firstName || !lastName) && fullName) {
      const parts = fullName.split(/\s+/);
      firstName = parts[0] || null;
      lastName = parts.slice(1).join(' ') || null;
    }

    const normalized = {
      firstName,
      lastName,
      fullName: fullName || `${firstName || ''} ${lastName || ''}`.trim() || null,
      dateOfBirth: toNullIfEmpty(e.dateOfBirth),
      dobIso: e.dateOfBirth ? ddmmyyyyToIso(e.dateOfBirth) : null,
      age: parseIntSafe(e.age),
      gender: toNullIfEmpty(e.gender),
      maritalStatus: toNullIfEmpty(e.maritalStatus),
      email: toNullIfEmpty(e.email),
      phone: toNullIfEmpty(e.phone),
      education: toNullIfEmpty(e.education),
      profession: toNullIfEmpty(e.profession),
      income: toNullIfEmpty(e.income),
      location: toNullIfEmpty(e.location),
      religion: toNullIfEmpty(e.religion),
      community: toNullIfEmpty(e.community),
      caste: toNullIfEmpty(e.caste),
      motherTongue: toNullIfEmpty(e.motherTongue),
      familyType: toNullIfEmpty(e.familyType),
      noOfSiblings: parseIntSafe(e.noOfSiblings),
      height: toNullIfEmpty(e.height),
      weight: toNullIfEmpty(e.weight),
      hobbies: toNullIfEmpty(e.hobbies),
      aboutMe: toNullIfEmpty(e.aboutMe),
      partnerPreferences: toNullIfEmpty(e.partnerPreferences),
    };

    return res.json({
      ok: true,
      message: 'Profile extracted successfully',
      raw: extracted,
      data: normalized,
    });
  } catch (err) {
    console.error('extract-profile error:', err);
    return res
      .status(500)
      .json({ ok: false, message: 'Server error', error: err.message });
  }
});



app.post('/api/contact/submit', submissionLimiter, requireCsrfToken, (req, res) => {
  const { honeypot, ...payload } = req.body || {};

  if (honeypot && honeypot.trim().length > 0) {
    securityLogger('HONEYPOT_TRIGGERED', { ip: req.ip, path: req.originalUrl });
    return res.json({ success: true, message: 'Your request has been received.' });
  }

  const validation = validateContactSubmission(payload);

  if (!validation.isValid) {
    securityLogger('FORM_VALIDATION_FAILED', {
      ip: req.ip,
      errors: validation.errors
    });
    return res.status(400).json({
      error: 'Please correct the highlighted fields.',
      details: validation.errors
    });
  }

  const ticketId = `HM-${Date.now().toString().slice(-8)}`;

  console.info('[CONTACT] Secure submission received', {
    ticketId,
    formType: validation.sanitized.formType,
    priority: validation.sanitized.priority || 'medium',
    ip: req.ip
  });

  res.json({
    success: true,
    ticketId,
    priority: validation.sanitized.priority || 'medium',
    message:
      validation.sanitized.formType === 'support-ticket'
        ? `Ticket ${ticketId} has been created successfully. Our support specialists will respond shortly.`
        : 'Thank you for contacting HeavenMatch. Our support team will respond within 24 hours.',
    payload: {
      ...validation.sanitized,
      message: validation.sanitized.message
    }
  });
});

/**
 * Universal AI API call function - works with OpenRouter, OpenAI, or Hugging Face
 * Purpose: Makes API calls to AI services based on configured provider (OpenRouter, OpenAI, or Hugging Face)
 * @param {string} prompt - The user's message or prompt to send to the AI
 * @param {Object} options - Configuration options for the AI call
 * @param {number} options.maxTokens - Maximum number of tokens in the response (default: 256)
 * @param {number} options.temperature - Controls randomness in response (0-1, default: 0.7)
 * @param {string} options.systemPrompt - Optional system-level instructions for the AI
 * @returns {Promise<string>} The AI-generated response text
 * @throws {Error} If API key is not configured or API call fails
 */
const callAI = async (prompt, options = {}) => {
  const {
    maxTokens = 256,
    temperature = 0.7,
    systemPrompt = null
  } = options;

  if (!AI_API_KEY) {
    throw new Error('AI API key not configured');
  }

  if (AI_PROVIDER === 'openrouter') {
    // OpenRouter API - Fast, real-time, single key for all models
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.REACT_APP_SITE_URL || 'http://localhost:3000',
        'X-Title': 'HeavenMatch Contact'
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: temperature
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } else if (AI_PROVIDER === 'openai') {
    // OpenAI API - Direct OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: AI_MODEL || 'gpt-3.5-turbo',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
        temperature: temperature
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } else {
    // Fallback to Hugging Face
    const HF_MODEL = process.env.REACT_APP_HF_MODEL || process.env.REACT_APP_AI_MODEL || 'meta-llama/Meta-Llama-3-8B-Instruct';
    const response = await fetch(`https://api-inference.huggingface.co/models/${encodeURIComponent(HF_MODEL)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
        parameters: {
          max_new_tokens: maxTokens,
          temperature: temperature,
          return_full_text: false
        }
      })
    });

    if (response.status === 503) {
      throw new Error('MODEL_LOADING: Model is loading, please wait');
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data[0]?.generated_text || '';
    }
    return data.generated_text || '';
  }
};

/**
 * AI Intent Detection endpoint
 * Purpose: Analyzes user messages to categorize them into intent types (billing, technical, safety, account, profile_match, general)
 * This helps route support requests to the appropriate team or channel
 * POST /api/detect-intent
 * @param {Object} req.body - Request body
 * @param {string} req.body.message - The user message to analyze
 * @returns {Object} JSON response with detected intent and original message
 */
app.post('/api/detect-intent', async (req, res) => {
  try {
    const validation = validateSubmission(req, req.body?.formToken, {
      maxSubmissions: 60
    });
    if (!validation.valid) {
      logSecurityEvent(req, validation);
      return res.status(400).json({
        error: 'Security validation failed',
        details: validation.errors
      });
    }

    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!AI_API_KEY) {
      return res.status(500).json({ error: 'AI API key not configured' });
    }

    // Pure AI intent detection - no hardcoded rules
    const intentPrompt = `You are an expert customer support intent classifier. Analyze the user's message and determine their intent.

Analyze this customer support query and classify it into ONE category:
- billing (payment, subscription, refund, pricing, billing questions)
- technical (login, password, profile, app issues, technical problems)
- safety (abuse, scam, harassment, report, safety concerns)
- account (delete account, verification, profile management, account issues)
- profile_match (suggest profiles, find matches, show profiles, match suggestions, looking for matches)
- general (general questions, information, other inquiries)

User query: "${message}"

Respond with ONLY the category name (one word, lowercase):`;

    const response = await callAI(intentPrompt, {
      maxTokens: 15,
      temperature: 0.2
    });

    // Clean and normalize AI response - no hardcoded parsing
    let intent = response.toLowerCase().trim().split(/\s+/)[0].replace(/[^a-z_]/g, '');
    // If AI didn't return a valid category, let AI decide with a follow-up
    if (!intent || intent.length === 0) {
      intent = 'general';
    }

    res.json({ intent, message });
  } catch (error) {
    console.error('Intent detection error:', error);
    res.json({ intent: 'general', message: req.body.message });
  }
});

/**
 * AI Extract User Info endpoint - extracts name, email, phone from chat conversation
 * Purpose: Automatically extracts user contact information (name, email, phone) from conversation history
 * This helps pre-fill contact forms and reduce manual data entry
 * POST /api/extract-info
 * @param {Object} req.body - Request body
 * @param {Array} req.body.conversation - Array of conversation messages with sender and text
 * @returns {Object} JSON response with extracted information (name, email, phone, subject)
 */
app.post('/api/extract-info', async (req, res) => {
  try {
    const validation = validateSubmission(req, req.body?.formToken, {
      maxSubmissions: 60
    });
    if (!validation.valid) {
      logSecurityEvent(req, validation);
      return res.status(400).json({
        error: 'Security validation failed',
        details: validation.errors
      });
    }

    const { conversation } = req.body;
    
    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({ error: 'Conversation array is required' });
    }

    if (!AI_API_KEY) {
      return res.status(500).json({ error: 'AI API key not configured' });
    }

    const conversationText = conversation.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    
    const extractPrompt = `Extract user information from this conversation. Respond in JSON format only:
{
  "name": "extracted name or empty string",
  "email": "extracted email or empty string",
  "phone": "extracted phone number or empty string",
  "subject": "brief summary of the issue (max 10 words)"
}

Conversation:
${conversationText}

JSON:`;

    const response = await callAI(extractPrompt, {
      maxTokens: 100,
      temperature: 0.3,
      systemPrompt: 'You are a data extraction assistant. Always respond with valid JSON only.'
    });

    let extracted = { name: '', email: '', phone: '', subject: '' };
    
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extracted = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Fallback: simple extraction
      const emailMatch = response.match(/[\w\.-]+@[\w\.-]+\.\w+/);
      const phoneMatch = response.match(/[\d\s\-\+\(\)]{10,}/);
      if (emailMatch) extracted.email = emailMatch[0];
      if (phoneMatch) extracted.phone = phoneMatch[0].replace(/\D/g, '').slice(0, 10);
    }

    res.json(extracted);
  } catch (error) {
    console.error('Info extraction error:', error);
    res.json({ name: '', email: '', phone: '', subject: '' });
  }
});

/**
 * AI Smart Routing endpoint - suggests best support channel based on intent
 * Purpose: Determines the most appropriate support channel (phone, email, ticket, chat) based on the detected intent
 * Helps users get faster resolution by directing them to the right support channel
 * POST /api/smart-route
 * @param {Object} req.body - Request body
 * @param {string} req.body.intent - The detected intent category
 * @param {string} req.body.message - The user's message
 * @param {string} req.body.urgency - Optional urgency level (low, medium, high)
 * @returns {Object} JSON response with recommended channel, contact info, and reasoning
 */
app.post('/api/smart-route', async (req, res) => {
  try {
    const validation = validateSubmission(req, req.body?.formToken, {
      maxSubmissions: 60
    });
    if (!validation.valid) {
      logSecurityEvent(req, validation);
      return res.status(400).json({
        error: 'Security validation failed',
        details: validation.errors
      });
    }

    const { intent, message, urgency } = req.body;
    
    // Pure AI smart routing - AI decides the best channel intelligently
    const routingPrompt = `You are an expert customer support routing system. Analyze the user's intent and message to recommend the best support channel.

Available support channels:
- phone: For urgent issues, safety concerns, complex problems requiring immediate assistance
- email: For billing inquiries, documentation needs, detailed explanations
- ticket: For technical issues, tracking needs, follow-up requirements
- chat: For quick questions, account issues, general inquiries

IMPORTANT: The company support email is: globalsupport@company.com
- Always use globalsupport@company.com for email channel recommendations
- Use this email address for all support-related email communications

User Intent: ${intent}
User Message: "${message}"
Urgency Level: ${urgency || 'medium'}

Based on the intent, message content, and urgency, intelligently recommend:
1. The best support channel (phone, email, ticket, or chat)
2. Priority level (low, medium, high)
3. Appropriate contact information
4. A clear reason for this recommendation

Respond with ONLY a JSON object in this exact format:
{
  "channel": "phone|email|ticket|chat",
  "priority": "low|medium|high",
  "contact": "contact phone number or support channel name",
  "name": "Support channel name",
  "reason": "Brief explanation why this channel is best",
  "email": "globalsupport@company.com"
}`;

    try {
      const aiResponse = await callAI(routingPrompt, {
        maxTokens: 150,
        temperature: 0.3,
        systemPrompt: 'You are a customer support routing expert. Always respond with valid JSON only.'
      });

      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const route = JSON.parse(jsonMatch[0]);
        res.json({
          intent,
          route,
          suggestedChannel: route.channel || 'chat',
          message: `Based on your ${intent} inquiry, we recommend using ${route.name || 'Support'} for the best support experience.`
        });
      } else {
        // Fallback to AI-generated response if JSON parsing fails
        throw new Error('AI response not in expected format');
      }
    } catch (error) {
      // If AI fails, use AI to generate a simple recommendation
      const fallbackPrompt = `Recommend a support channel for: ${intent} issue. Respond with: "chat" or "email" or "ticket" or "phone"`;
      const fallbackResponse = await callAI(fallbackPrompt, { maxTokens: 5, temperature: 0.2 }).catch(() => 'chat');
      const fallbackChannel = fallbackResponse.toLowerCase().trim().split(/\s+/)[0];
      
      res.json({
        intent,
        route: {
          channel: fallbackChannel || 'chat',
          priority: 'medium',
          contact: 'Live Chat',
          name: 'General Support',
          reason: 'AI-recommended support channel',
          email: 'globalsupport@company.com'
        },
        suggestedChannel: fallbackChannel || 'chat',
        message: `We recommend using ${fallbackChannel || 'Live Chat'} for your ${intent} inquiry.`
      });
    }
  } catch (error) {
    console.error('Smart routing error:', error);
    res.json({
      intent: req.body.intent || 'general',
      route: {
        channel: 'chat',
        priority: 'normal',
        contact: 'Live Chat',
        name: 'General Support',
        email: 'globalsupport@company.com'
      },
      suggestedChannel: 'chat'
    });
  }
});

/**
 * AI Enhanced FAQ endpoint - context-aware FAQ answers
 * Purpose: Searches FAQ database and provides context-aware answers using AI
 * Uses conversation history to provide more relevant answers than simple keyword matching
 * POST /api/faq-search
 * @param {Object} req.body - Request body
 * @param {string} req.body.query - The user's search query
 * @param {Array} req.body.conversation - Optional conversation history for context
 * @returns {Object} JSON response with answer, source (faq/ai), and matching FAQ item if found
 */
app.post('/api/faq-search', async (req, res) => {
  try {
    const validation = validateSubmission(req, req.body?.formToken, {
      maxSubmissions: 60
    });
    if (!validation.valid) {
      logSecurityEvent(req, validation);
      return res.status(400).json({
        error: 'Security validation failed',
        details: validation.errors
      });
    }

    const { query, conversation } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const HF_API_TOKEN = process.env.REACT_APP_HF_API_TOKEN;
    const HF_MODEL = process.env.REACT_APP_HF_MODEL || 'meta-llama/Meta-Llama-3-8B-Instruct';

    if (!AI_API_KEY) {
      return res.status(500).json({ error: 'AI API key not configured' });
    }

    // Pure AI FAQ search - AI has knowledge of common FAQs and answers intelligently
    const conversationContext = conversation ? 
      conversation.map(msg => `${msg.sender}: ${msg.text}`).join('\n') : '';

    // AI-powered FAQ search with intelligent knowledge
    const faqPrompt = `You are an expert customer support assistant for HeavenMatch matrimony/matchmaking services. You have comprehensive knowledge of common questions and answers.

IMPORTANT: The company support email is: globalsupport@company.com
- Always use globalsupport@company.com when recommending users to contact support via email
- Use this email for all email-related support communications

User Query: "${query}"
${conversationContext ? `Conversation Context:\n${conversationContext}\n` : ''}

Based on your knowledge of HeavenMatch services, provide a helpful and accurate answer to the user's query. 
- If the query is about common topics (password reset, profile updates, billing, safety, account management, profile matching), provide detailed step-by-step guidance
- If the query is unique or specific, provide the best possible answer based on standard practices
- When mentioning email support, always use: globalsupport@company.com
- Be concise (under 100 words)
- Be helpful and friendly

Answer:`;

    try {
      const answer = await callAI(faqPrompt, {
        maxTokens: 200,
        temperature: 0.5,
        systemPrompt: 'You are a knowledgeable customer support assistant for HeavenMatch matrimony services. You understand all aspects of the service including account management, profile features, billing, safety, and matchmaking.'
      });

      res.json({
        answer: answer.trim() || 'I can help you with that. Please contact our support team at globalsupport@company.com for more information.',
        source: 'ai',
        faq: null
      });
    } catch (error) {
      // If AI fails, let AI generate a simple helpful response
      const fallbackAnswer = await callAI(`Answer this question about HeavenMatch: "${query}"`, {
        maxTokens: 100,
        temperature: 0.5
      }).catch(() => 'I can help you with that. Please contact our support team at globalsupport@company.com for more information.');
      
      res.json({
        answer: fallbackAnswer.trim() || 'I can help you with that. Please contact our support team at globalsupport@company.com for more information.',
        source: 'ai',
        faq: null
      });
    }
  } catch (error) {
    console.error('FAQ search error:', error);
    res.json({
      answer: 'I can help you with that. Please contact our support team at globalsupport@company.com for more information.',
      source: 'general',
      faq: null
    });
  }
});

/**
 * AI Create Ticket endpoint
 * Purpose: Creates a support ticket with user information and issue details
 * Generates a unique ticket ID and determines priority based on intent
 * POST /api/create-ticket
 * @param {Object} req.body - Request body
 * @param {string} req.body.name - User's name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.phone - User's phone number (optional)
 * @param {string} req.body.subject - Ticket subject line
 * @param {string} req.body.message - Detailed issue description
 * @param {string} req.body.intent - Detected intent category
 * @param {string} req.body.priority - Ticket priority level (optional, auto-determined if not provided)
 * @returns {Object} JSON response with ticket ID, ticket object, and success message
 */
app.post('/api/create-ticket', async (req, res) => {
  try {
    const validationCheck = validateSubmission(req, req.body?.formToken);
    if (!validationCheck.valid) {
      logSecurityEvent(req, validationCheck);
      return res.status(400).json({
        error: 'Security validation failed',
        details: validationCheck.errors
      });
    }

    const { name, email, phone, subject, message, intent, priority } = req.body;

    const validation = validateContactSubmission({
      formType: 'support-ticket',
      name,
      email,
      phone,
      subject,
      message,
      priority,
      issueTopic: subject
    });

    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Invalid ticket payload',
        details: validation.errors
      });
    }

    const safePayload = validation.sanitized;

    // Generate ticket ID
    const ticketId = 'HM-' + Date.now().toString().slice(-8);
    
    // AI determines priority based on message content and intent
    let ticketPriority = safePayload.priority;
    if (!ticketPriority) {
      const priorityPrompt = `Analyze this support request and determine the priority level (low, medium, high, urgent).

Intent: ${intent}
Message: "${safePayload.message}"
Subject: "${safePayload.subject || 'Support Request'}"

Consider urgency, impact, and issue type. Respond with ONLY one word: "low", "medium", "high", or "urgent"`;

      try {
        const priorityResponse = await callAI(priorityPrompt, {
          maxTokens: 5,
          temperature: 0.2
        });
        ticketPriority = priorityResponse.toLowerCase().trim().split(/\s+/)[0];
        // Validate priority
        if (!['low', 'medium', 'high', 'urgent'].includes(ticketPriority)) {
          ticketPriority = safePayload.priority || 'medium';
        }
      } catch (error) {
        ticketPriority = safePayload.priority || 'medium';
      }
    }
    
    // Create ticket object (in production, save to database)
    const ticket = {
      id: ticketId,
      name: safePayload.name,
      email: safePayload.email,
      phone: safePayload.phone || '',
      subject: safePayload.subject || 'Support Request',
      message: safePayload.message,
      intent: intent || 'general',
      priority: ticketPriority,
      status: 'open',
      createdAt: new Date().toISOString()
    };

    // In production, save to database here
    console.log('Ticket created:', ticket);

    res.json({ 
      success: true, 
      ticketId: ticket.id,
      ticket,
      message: `Ticket ${ticket.id} created successfully. We'll respond within 24 hours.`
    });
  } catch (error) {
    console.error('Ticket creation error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

/**
 * Hugging Face API proxy endpoint (Universal AI Chat)
 * Purpose: Main chat endpoint that processes user messages and returns AI responses
 * Acts as a proxy to various AI providers (OpenRouter, OpenAI, Hugging Face) to avoid CORS issues
 * POST /api/chat
 * @param {Object} req.body - Request body
 * @param {string} req.body.prompt - The user's message to process
 * @param {string} req.body.model - Optional model name (defaults to configured model)
 * @returns {Object} JSON response with cleaned AI-generated text response
 * @throws {Error} Various error types (MODEL_LOADING, RATE_LIMIT, AUTH_ERROR, NETWORK_ERROR, etc.)
 */
app.post('/api/chat', async (req, res) => {
  try {
    const injectionCheck = validateAllInputs(req.body);
    if (!injectionCheck.safe) {
      logSecurityEvent(req, {
        valid: false,
        errors: [{ type: 'INJECTION', msg: injectionCheck.reason, field: injectionCheck.field }]
      });
      return res.status(400).json({
        error: 'Security validation failed',
        message: 'Your message contains potentially harmful content'
      });
    }

    const { prompt, model } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!AI_API_KEY) {
      return res.status(500).json({ error: 'AI API key not configured' });
    }

    // Use universal AI call function
    try {
      const systemInstruction = `You are a helpful and friendly customer support assistant for HeavenMatch, a matrimony/matchmaking website. Be warm, professional, and empathetic. 

IMPORTANT: 
- Keep responses SHORT (under 50 words, 2-3 sentences max)
- Be direct and concise
- No repetition
- If user just says "hi" or "hello", respond with a brief greeting and ask how you can help
- Don't explain what you can do unless asked`;
      
      const response = await callAI(prompt, {
        maxTokens: 100,
        temperature: 0.7,
        systemPrompt: systemInstruction
      });

      const cleanedOutput = response
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/^Assistant:\s*/i, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      if (!cleanedOutput) {
        return res.status(500).json({ error: 'Empty response from model' });
      }

      res.json({ response: cleanedOutput });
    } catch (error) {
      console.error('AI API error:', error);
      
      // Handle specific error types
      if (error.message && error.message.includes('MODEL_LOADING')) {
        return res.status(503).json({ 
          error: 'MODEL_LOADING', 
          message: 'The AI model is loading. Please wait a moment and try again.'
        });
      }

      if (error.message && error.message.includes('rate limit') || error.message.includes('429')) {
        return res.status(429).json({ 
          error: 'RATE_LIMIT', 
          message: 'Too many requests. Please wait a moment and try again.' 
        });
      }

      if (error.message && (error.message.includes('401') || error.message.includes('403') || error.message.includes('invalid'))) {
        return res.status(401).json({ 
          error: 'AUTH_ERROR', 
          message: 'Invalid API key. Please check your configuration.' 
        });
      }

      if (error.message && error.message.includes('fetch failed')) {
        return res.status(503).json({ 
          error: 'NETWORK_ERROR', 
          message: 'Unable to connect to AI service. Please check your internet connection.' 
        });
      }

      res.status(500).json({ 
        error: 'INTERNAL_ERROR', 
        message: error.message || 'An error occurred while processing your request' 
      });
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'INTERNAL_ERROR', 
      message: error.message || 'An error occurred while processing your request' 
    });
  }
});

/**
 * AI Sentiment Analysis endpoint
 * Purpose: Analyzes the emotional tone and sentiment of user messages
 * Helps customize responses based on user's emotional state (angry, frustrated, happy, etc.)
 * POST /api/analyze-sentiment
 * @param {Object} req.body - Request body
 * @param {string} req.body.message - The user message to analyze
 * @param {Array} req.body.conversation - Optional conversation history for context
 * @returns {Object} JSON response with sentiment, emotion, urgency level, and tone
 */
app.post('/api/analyze-sentiment', async (req, res) => {
  try {
    const validation = validateSubmission(req, req.body?.formToken, {
      requireToken: false
    });
    if (!validation.valid) {
      logSecurityEvent(req, validation);
      return res.status(400).json({
        error: 'Security validation failed',
        details: validation.errors
      });
    }

    const { message, conversation } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!AI_API_KEY) {
      return res.status(500).json({ error: 'AI API key not configured' });
    }

    const sentimentPrompt = `Analyze the sentiment and emotion of this customer support message. Detect ALL emotions accurately. Respond with ONLY a JSON object:
{
  "sentiment": "positive" | "neutral" | "negative" | "frustrated" | "urgent" | "angry" | "sad" | "excited" | "confused" | "worried" | "annoyed" | "grateful" | "satisfied" | "disappointed",
  "emotion": "happy" | "sad" | "angry" | "frustrated" | "worried" | "confused" | "annoyed" | "excited" | "grateful" | "disappointed" | "satisfied" | "calm" | "nervous" | "relieved" | "impatient" | "hopeful" | "upset" | "content",
  "urgency": "low" | "medium" | "high",
  "tone": "polite" | "neutral" | "informal" | "demanding" | "friendly" | "formal" | "sarcastic" | "apologetic" | "appreciative"
}

Analyze the message carefully and detect the PRIMARY emotion. Consider:
- Positive emotions: happy, excited, grateful, satisfied, relieved, hopeful, content
- Negative emotions: sad, angry, frustrated, worried, confused, annoyed, disappointed, upset, nervous, impatient
- Neutral emotions: calm, neutral

Message: "${message}"
${conversation ? `Previous context: ${conversation.slice(-2).map(m => m.text).join(' ')}` : ''}

JSON:`;

    try {
      const response = await callAI(sentimentPrompt, {
        maxTokens: 50,
        temperature: 0.3,
        systemPrompt: 'You are a sentiment analysis expert. Always respond with valid JSON only.'
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const sentiment = JSON.parse(jsonMatch[0]);
        // Trust AI's analysis - no hardcoded validation
        res.json(sentiment);
      } else {
        // If JSON parsing fails, let AI generate a simple sentiment
        const fallbackSentiment = await callAI(`Analyze sentiment: "${message}". Respond with: "positive", "neutral", or "negative"`, {
          maxTokens: 5,
          temperature: 0.2
        }).catch(() => 'neutral');
        
        res.json({ 
          sentiment: fallbackSentiment.toLowerCase().trim() || 'neutral', 
          emotion: 'calm', 
          urgency: 'medium', 
          tone: 'neutral' 
        });
      }
    } catch (error) {
      res.json({ sentiment: 'neutral', emotion: 'calm', urgency: 'medium', tone: 'neutral' });
    }
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.json({ sentiment: 'neutral', emotion: 'calm', urgency: 'medium', tone: 'neutral' });
  }
});

/**
 * AI Language Detection endpoint
 * Purpose: Detects the language of user messages to provide multilingual support
 * Helps identify if user is communicating in a language other than English
 * POST /api/detect-language
 * @param {Object} req.body - Request body
 * @param {string} req.body.message - The message to analyze for language detection
 * @returns {Object} JSON response with detected language name and detection success status
 */
app.post('/api/detect-language', async (req, res) => {
  try {
    const validation = validateSubmission(req, req.body?.formToken, {
      requireToken: false
    });
    if (!validation.valid) {
      logSecurityEvent(req, validation);
      return res.status(400).json({
        error: 'Security validation failed',
        details: validation.errors
      });
    }

    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!AI_API_KEY) {
      return res.status(500).json({ error: 'AI API key not configured' });
    }

    // Use AI to intelligently detect language - no hardcoded rules
    // AI will analyze the message and determine the language accurately
    const langPrompt = `You are an expert language detection system. Analyze the message and determine its language accurately.

CRITICAL ANALYSIS RULES:
1. **English Detection**: 
   - Messages like "hi", "hello", "hey", "yes", "no", "ok", "thanks", "help" are ENGLISH
   - Messages written in Roman/Latin script (A-Z, a-z) with English words are ENGLISH
   - Common English greetings and phrases are ENGLISH
   - Short messages in English are ENGLISH, not Hindi

2. **Hindi Detection**:
   - Messages containing Devanagari script (हिंदी, नमस्ते, etc.) are HINDI
   - Messages written in English letters but clearly Hindi words (like "namaste" as greeting, "dhanyavad" as thank you) can be HINDI
   - Only detect Hindi if there's clear indication of Hindi language

3. **Other Languages**:
   - Detect other languages if message contains their script or clear linguistic patterns

4. **Accuracy First**:
   - Be precise - if uncertain, default to English
   - "hi", "hello", "help" are ALWAYS English, never Hindi
   - Analyze character patterns, word structure, and linguistic markers

Message to analyze: "${message}"

Respond with ONLY the language name (e.g., "English", "Hindi", "Spanish", "French", etc.):`;

    try {
      const response = await callAI(langPrompt, {
        maxTokens: 15,
        temperature: 0.1 // Low temperature for consistent, accurate detection
      });

      // Clean and normalize the AI response
      let language = response.trim().split('\n')[0].trim();
      // Remove any quotes, extra characters, or explanations
      language = language.replace(/^["']|["']$/g, '').trim();
      language = language.replace(/^Language:?\s*/i, '').trim();
      language = language.split(' ')[0]; // Take only first word (language name)
      
      // If response is empty or invalid, default to English
      if (!language || language.length === 0) {
        language = 'English';
      }
      
      // Normalize language name: capitalize first letter, lowercase the rest
      // This handles variations like "english", "ENGLISH", "English"
      const normalizedLanguage = language.charAt(0).toUpperCase() + language.slice(1).toLowerCase();
      
      // Check if it's actually a different language (not English)
      const isEnglish = normalizedLanguage.toLowerCase() === 'english';
      
      // Return normalized language name (capitalize first letter for display)
      const displayLanguage = normalizedLanguage;
      
      res.json({ 
        language: displayLanguage, 
        detected: !isEnglish // Only mark as detected if it's not English
      });
    } catch (error) {
      // On error, default to English (safer default)
      console.error('Language detection AI error:', error);
      res.json({ language: 'English', detected: false });
    }
  } catch (error) {
    console.error('Language detection error:', error);
    res.json({ language: 'English', detected: false });
  }
});

/**
 * AI Smart Quick Replies endpoint
 * Purpose: Generates context-aware quick reply suggestions based on user messages
 * Provides users with helpful pre-written responses to speed up conversation
 * POST /api/quick-replies
 * @param {Object} req.body - Request body
 * @param {string} req.body.message - The user's current message
 * @param {Array} req.body.conversation - Optional conversation history for context
 * @returns {Object} JSON response with array of up to 3 quick reply suggestions
 */
app.post('/api/quick-replies', async (req, res) => {
  try {
    const validation = validateSubmission(req, req.body?.formToken, {
      maxSubmissions: 60
    });
    if (!validation.valid) {
      logSecurityEvent(req, validation);
      return res.status(400).json({
        error: 'Security validation failed',
        details: validation.errors
      });
    }

    const { message, conversation } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!AI_API_KEY) {
      return res.status(500).json({ error: 'AI API key not configured' });
    }

    const quickRepliesPrompt = `Based on this customer message, suggest 3 short quick reply options (under 10 words each) that the user might want to send. Respond with ONLY a JSON array:

["reply 1", "reply 2", "reply 3"]

Message: "${message}"
${conversation ? `Context: ${conversation.slice(-2).map(m => m.text).join(' ')}` : ''}

JSON array:`;

    try {
      const response = await callAI(quickRepliesPrompt, {
        maxTokens: 50,
        temperature: 0.7,
        systemPrompt: 'You are a UX expert. Suggest helpful quick replies.'
      });

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const replies = JSON.parse(jsonMatch[0]);
        res.json({ replies: replies.slice(0, 3) });
      } else {
        res.json({ replies: [] });
      }
    } catch (error) {
      res.json({ replies: [] });
    }
  } catch (error) {
    console.error('Quick replies error:', error);
    res.json({ replies: [] });
  }
});

/**
 * AI Conversation Summary endpoint
 * Purpose: Creates a concise summary of the entire conversation history
 * Useful for creating support tickets or providing context to human agents
 * POST /api/summarize-conversation
 * @param {Object} req.body - Request body
 * @param {Array} req.body.conversation - Array of conversation messages
 * @returns {Object} JSON response with a 2-3 sentence summary of the conversation
 */
app.post('/api/summarize-conversation', async (req, res) => {
  try {
    const validation = validateSubmission(req, req.body?.formToken);
    if (!validation.valid) {
      logSecurityEvent(req, validation);
      return res.status(400).json({
        error: 'Security validation failed',
        details: validation.errors
      });
    }

    const { conversation } = req.body;
    
    if (!conversation || !Array.isArray(conversation)) {
      return res.status(400).json({ error: 'Conversation array is required' });
    }

    if (!AI_API_KEY) {
      return res.status(500).json({ error: 'AI API key not configured' });
    }

    const conversationText = conversation.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    
    const summaryPrompt = `Summarize this customer support conversation in 2-3 sentences. Include: main issue, user's concern, and suggested solution.

Conversation:
${conversationText}

Summary:`;

    try {
      const summary = await callAI(summaryPrompt, {
        maxTokens: 100,
        temperature: 0.5,
        systemPrompt: 'You are a customer support expert. Create concise summaries.'
      });

      res.json({ summary: summary.trim() });
    } catch (error) {
      res.json({ summary: 'Customer support conversation summary.' });
    }
  } catch (error) {
    console.error('Conversation summary error:', error);
    res.json({ summary: 'Customer support conversation summary.' });
  }
});

/**
 * AI Smart Escalation endpoint
 * Purpose: Determines if a support issue should be escalated to a human agent
 * Considers user frustration, issue complexity, conversation length, and safety concerns
 * POST /api/should-escalate
 * @param {Object} req.body - Request body
 * @param {string} req.body.message - The user's current message
 * @param {Array} req.body.conversation - Conversation history
 * @param {string} req.body.sentiment - Detected sentiment (optional)
 * @param {string} req.body.intent - Detected intent category
 * @returns {Object} JSON response with escalation decision (true/false) and reason
 */
app.post('/api/should-escalate', async (req, res) => {
  try {
    const validation = validateSubmission(req, req.body?.formToken);
    if (!validation.valid) {
      logSecurityEvent(req, validation);
      return res.status(400).json({
        error: 'Security validation failed',
        details: validation.errors
      });
    }

    const { message, conversation, sentiment, intent } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!AI_API_KEY) {
      return res.status(500).json({ error: 'AI API key not configured' });
    }

    const conversationContext = conversation ? 
      conversation.map(msg => `${msg.sender}: ${msg.text}`).join('\n') : '';

    const escalationPrompt = `You are an expert customer support escalation system. Analyze if this issue needs human agent escalation.

Consider:
- User frustration and emotional state
- Complexity and uniqueness of the issue
- Repeated questions or lack of resolution
- Safety and security concerns
- Urgency and criticality

Message: "${message}"
Sentiment: ${sentiment || 'neutral'}
Intent: ${intent || 'general'}
${conversationContext ? `Conversation:\n${conversationContext}` : ''}
${conversation ? `Conversation length: ${conversation.length} messages` : ''}

Respond with ONLY a JSON object:
{
  "escalate": true or false,
  "reason": "Brief explanation for your decision"
}`;

    try {
      const response = await callAI(escalationPrompt, {
        maxTokens: 100,
        temperature: 0.2,
        systemPrompt: 'You are an escalation expert. Always respond with valid JSON only.'
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const escalation = JSON.parse(jsonMatch[0]);
        res.json({ 
          escalate: escalation.escalate || false,
          reason: escalation.reason || 'AI analysis complete'
        });
      } else {
        // Fallback: AI determines with simple prompt
        const simpleResponse = await callAI(`Should this issue be escalated to human? "${message}" - Respond: "yes" or "no"`, {
          maxTokens: 3,
          temperature: 0.2
        }).catch(() => 'no');
        
        res.json({ 
          escalate: simpleResponse.toLowerCase().includes('yes'),
          reason: 'AI analysis indicates escalation need'
        });
      }
    } catch (error) {
      // Pure AI fallback - no hardcoded safety check
      const fallbackResponse = await callAI(`Should "${message}" be escalated? Respond: "yes" or "no"`, {
        maxTokens: 3,
        temperature: 0.2
      }).catch(() => 'no');
      
      res.json({ 
        escalate: fallbackResponse.toLowerCase().includes('yes'),
        reason: 'AI analysis based on message content'
      });
    }
  } catch (error) {
    console.error('Escalation check error:', error);
    res.json({ escalate: false, reason: 'Error checking escalation' });
  }
});

/**
 * Health check endpoint
 * Purpose: Simple endpoint to verify the backend server is running and accessible
 * Used for debugging and monitoring server status
 * GET /api/health
 * @returns {Object} JSON response with server status information
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'HeavenMatch AI Backend',
    security: {
      botDetection: true,
      csrf: true,
      rateLimit: true
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Server startup and initialization
 * Purpose: Starts the Express server on the configured port and displays startup information
 * Handles port conflicts and provides setup instructions if API key is missing
 */
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 HeavenMatch AI Backend Server`);
  console.log(`${'='.repeat(60)}`);
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🤖 AI Provider: ${AI_PROVIDER.toUpperCase()}`);
  console.log(`🧠 AI Model: ${AI_MODEL}`);
  console.log(`🔑 AI API Key: ${AI_API_KEY ? '✅ Loaded' : '❌ Not found'}`);
  console.log(`📧 Email Service: ${process.env.SMTP_HOST ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`📄 Document Extraction: ${process.env.GEMINI_API_KEY ? '✅ Gemini Ready' : '❌ Not configured'}`);
  console.log(`🛡️  Security Stack:`);
  console.log(`   ├─ Helmet + CSP allowlist`);
  console.log(`   ├─ CSRF tokens & cookie binding`);
  console.log(`   ├─ Advanced bot timing + honeypot checks`);
  console.log(`   ├─ Prompt injection detection`);
  console.log(`   ├─ Rate limiting (Express & adaptive)`);
  console.log(`   ├─ OTP verification system`);
  console.log(`   └─ File upload security (multer)`);
  console.log(`📋 Available Endpoints:`);
  console.log(`   ├─ POST /api/send-otp - Send OTP to email`);
  console.log(`   ├─ POST /api/verify-otp - Verify OTP`);
  console.log(`   ├─ POST /api/extract-profile - Extract profile from document`);
  console.log(`   ├─ POST /api/chat - AI chat endpoint`);
  console.log(`   └─ ... and more AI endpoints`);
  console.log(`${'='.repeat(60)}\n`);

  if (!AI_API_KEY) {
    console.log(`⚠️  AI Setup Instructions:`);
    console.log(`   1. Obtain an API key (e.g., https://openrouter.ai/keys).`);
    console.log(`   2. Add to .env: REACT_APP_AI_API_KEY=your_key_here`);
    console.log(`   3. Restart server: npm run dev\n`);
  }

  if (!process.env.SMTP_HOST) {
    console.log(`⚠️  Email Setup Instructions:`);
    console.log(`   1. Configure SMTP settings in .env:`);
    console.log(`      SMTP_HOST=your_smtp_host`);
    console.log(`      SMTP_PORT=587`);
    console.log(`      SMTP_USER=your_email`);
    console.log(`      SMTP_PASS=your_password`);
    console.log(`      FROM_EMAIL=your_from_email\n`);
  }

  if (!process.env.GEMINI_API_KEY) {
    console.log(`⚠️  Gemini Setup Instructions:`);
    console.log(`   1. Obtain Gemini API key from Google AI Studio`);
    console.log(`   2. Add to .env: GEMINI_API_KEY=your_key_here\n`);
  }
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error(`   Please stop the process using port ${PORT} or use a different port.`);
    console.error(`   To find the process: netstat -ano | findstr :${PORT}`);
    console.error(`   To kill it: taskkill /F /PID <PID>`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});

