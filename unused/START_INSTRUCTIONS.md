# 🚀 HeavenMatch AI Contact Page - Quick Start

## ✅ CORS Issue Fixed!

The CORS error has been fixed by creating a backend proxy server. The AI chat now works through a secure backend connection.

## 📋 How to Run

### Option 1: Run Both Frontend & Backend Together (Recommended)
```powershell
npm run dev
```
This will start:
- Backend server on `http://localhost:3001`
- Frontend React app on `http://localhost:3000` (or next available port)

### Option 2: Run Separately (Two Terminals)

**Terminal 1 - Backend:**
```powershell
npm run server
```

**Terminal 2 - Frontend:**
```powershell
npm start
```

## 🔧 What Changed

1. **Backend Proxy Server** (`server.js`)
   - Handles Hugging Face API calls
   - Avoids CORS issues
   - Runs on port 3001

2. **Frontend Updated**
   - Now calls backend proxy instead of Hugging Face directly
   - Better error messages
   - Automatic backend health check

3. **Environment Variables**
   - `.env.local` contains your Hugging Face token
   - Backend reads from `.env.local`
   - Frontend no longer needs the token (more secure!)

## ✅ Testing

1. Start the servers (`npm run dev`)
2. Open your browser to the React app
3. Open the Live Chat widget
4. Send a message - it should work now! 🎉

## 🐛 Troubleshooting

**If backend is not running:**
- Check console for "Backend proxy server not found" warning
- Make sure to run `npm run server` or `npm run dev`

**If you see CORS errors:**
- Make sure backend is running on port 3001
- Check that frontend can reach `http://localhost:3001/api/health`

**If model is loading (503 error):**
- This is normal for Hugging Face models
- Wait 10-20 seconds and try again
- The model stays loaded after first use

## 📝 Notes

- Backend must be running for AI chat to work
- Token is stored securely in `.env.local` (not in frontend code)
- All API calls go through the backend proxy
- Model stays loaded after first use, so subsequent requests are faster

