# Chatbot Setup Guide

## ✅ API Key Configuration

The API key is stored in `.env.local` file:
```
REACT_APP_GOOGLE_AI_API_KEY=AIzaSyBKFwvrVC83n341aHTYSidf227zjl_9oBo
```

## ⚠️ Important: Restart Required

**You MUST restart your development server** for the environment variable to load:

1. Stop the current server (Press `Ctrl+C` in the terminal)
2. Start it again:
   ```powershell
   npm.cmd start
   ```

## 🔍 Troubleshooting

### If chatbot shows fallback messages:

1. **Check browser console** (F12) for error messages
2. **Verify API key** is loaded:
   - Open browser console (F12)
   - Look for: `✅ API Key loaded successfully`
   - If you see: `⚠️ API Key not found!` - restart the server

3. **Check API key validity**:
   - Make sure the API key is correct
   - Verify it has Gemini API access enabled in Google Cloud Console

4. **Check network tab**:
   - Open DevTools → Network tab
   - Send a message in chatbot
   - Look for API requests to Google's servers
   - Check if there are any 401/403 errors

## 🛠️ How It Works

- Uses Google Gemini Pro AI model
- Maintains conversation context
- Responds as HeavenMatch support assistant
- Falls back to helpful messages if API fails

## 📝 Notes

- The API key is in `.env.local` (already in `.gitignore`)
- All responses are contextual and helpful
- Error handling is built-in with fallback messages

