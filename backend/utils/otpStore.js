// Simple in-memory OTP store for demo purposes
const otps = new Map(); // sessionId -> { otp, expiresAt, email }


function setOtp(sessionId, otp, email, ttlSeconds = 300) {
const expiresAt = Date.now() + ttlSeconds * 1000;
otps.set(sessionId, { otp, expiresAt, email });
}


function getOtp(sessionId) {
const data = otps.get(sessionId);
if (!data) return null;
if (Date.now() > data.expiresAt) {
otps.delete(sessionId);
return null;
}
return data;
}


function deleteOtp(sessionId) {
otps.delete(sessionId);
}


module.exports = { setOtp, getOtp, deleteOtp };