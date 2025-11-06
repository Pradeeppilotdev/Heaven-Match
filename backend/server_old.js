// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// import controllers (local)
const { login, verifyOtp } = require('./controllers/authControllers');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Optional: serve a friendly root message
app.get('/', (req, res) => {
  res.send(
    `<h2>MFA Backend — running</h2>
     <p>Available endpoints:</p>
     <ul>
       <li>POST /api/login</li>
       <li>POST /api/verify-otp</li>
     </ul>`
  );
});

// API routes
app.post('/api/login', login);
app.post('/api/verify-otp', verifyOtp);

/* ---------------------------
   Optional: serve frontend build (uncomment if you have frontend/dist)
   ---------------------------
const staticPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(staticPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(staticPath, 'index.html'));
});
*/

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ MFA backend running on http://localhost:${PORT}`));
