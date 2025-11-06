# 🤖 AI Chatbot Testing Guide - HeavenMatch Contact Page

## ✅ How to Test if AI is Working

### Quick Test Steps:

1. **Start the Server**
   ```powershell
   npm run dev
   ```

2. **Open Contact Page**
   - Go to: http://localhost:3000/contact
   - Or: http://localhost:3000 (then click Contact Us)

3. **Open Chat Widget**
   - Click the "Live Chat" button (bottom right corner)
   - Chat window will open

4. **Test Basic Chat**
   - Type: `hi` or `hello`
   - Expected: Short, friendly greeting (under 50 words)
   - Should see: "Hello! How can I help you today?" (or similar)

---

## 🧪 Test Scenarios

### Test 1: Basic Greeting ✅
**Type:** `hi`  
**Expected:** Short greeting, asks how to help  
**Should NOT:** Long explanation, duplicate messages

### Test 2: Intent Detection ✅
**Type:** `I need help with billing`  
**Expected:** 
- Bot responds with billing help
- Shows "Detected: billing issue" badge
- Suggests billing support channel

### Test 3: FAQ Answers ✅
**Type:** `How do I reset my password?`  
**Expected:** Direct answer from FAQ database  
**Should NOT:** Generic AI response

### Test 4: Info Extraction ✅
**Type:** 
```
Hi, my name is John Doe
My email is john@example.com
I need help with my account
```
**Expected:**
- After 2-3 messages, form auto-fills
- Name and email appear in contact form
- Bot offers to create ticket

### Test 5: Ticket Creation ✅
**Type:** `I need to report a fake profile`  
**Expected:**
- Bot detects "safety" intent
- Shows safety hotline suggestion
- Offers to create ticket after 2+ messages

### Test 6: Smart Routing ✅
**Type:** `I want to cancel my subscription`  
**Expected:**
- Shows routing suggestion card
- Suggests billing email channel
- Provides direct action buttons

---

## ✅ What to Check

### ✅ Working Correctly:
- [ ] Chat opens when clicking Live Chat button
- [ ] Bot responds within 2-3 seconds
- [ ] Responses are short (under 50 words)
- [ ] Only ONE response per message (no duplicates)
- [ ] Intent detection shows badge
- [ ] FAQ answers appear for common questions
- [ ] Form auto-fills after 2-3 messages
- [ ] Route suggestions appear for specific issues
- [ ] Ticket creation works

### ❌ Problems to Watch For:
- [ ] Duplicate messages (same response twice)
- [ ] Very long responses (over 100 words)
- [ ] No response (check console for errors)
- [ ] Slow responses (over 10 seconds)
- [ ] Form doesn't auto-fill

---

## 🔧 Troubleshooting

### Problem: No Response
**Check:**
1. Backend server running? (Should see: `🚀 Backend proxy server running`)
2. Check browser console for errors
3. Check terminal for API errors

**Fix:**
```powershell
# Restart server
npm run dev
```

### Problem: Duplicate Messages
**Fixed:** Latest code prevents duplicates
**If still happening:** Clear browser cache and refresh

### Problem: Long Responses
**Fixed:** Responses now limited to 200 characters
**If still long:** Check system prompt in server.js

### Problem: API Errors
**Check:**
1. `.env.local` file has correct API key
2. API key is valid (test at https://openrouter.ai)
3. Check console for specific error message

**Fix:**
```powershell
# Verify API key
node -e "require('dotenv').config({path: '.env.local'}); console.log('Key:', process.env.REACT_APP_AI_API_KEY ? 'Set' : 'Not set');"
```

---

## 📊 All 6 AI Features to Test

### 1. AI Chat ✅
- Test: Send any message
- Expected: Bot responds in real-time

### 2. Intent Detection ✅
- Test: Say "billing issue" or "technical problem"
- Expected: Shows intent badge (billing/technical/safety/etc.)

### 3. Info Extraction ✅
- Test: Share your name and email in chat
- Expected: Form auto-fills after 2-3 messages

### 4. FAQ Answers ✅
- Test: Ask "How do I reset password?"
- Expected: Direct FAQ answer (not generic AI)

### 5. Smart Routing ✅
- Test: Say "safety issue" or "billing problem"
- Expected: Shows route suggestion card with contact info

### 6. Ticket Creation ✅
- Test: After chatting, click "Create Ticket"
- Expected: Ticket created with ID (HM-XXXXXXXX)

---

## 🎯 Expected Behavior

### Normal Flow:
1. User: `hi`
2. Bot: `Hello! How can I help you today?` (short, one message)
3. User: `I need help with billing`
4. Bot: `I can help with billing. What specifically do you need?` (short)
5. Shows: "Detected: billing issue" badge
6. Shows: Route suggestion card (optional)

### Response Time:
- **Normal:** 2-5 seconds
- **Slow:** 5-10 seconds (acceptable)
- **Very Slow:** Over 10 seconds (check connection)

### Response Length:
- **Good:** 10-50 words (2-3 sentences)
- **Acceptable:** 50-100 words
- **Too Long:** Over 100 words (should be fixed)

---

## 📝 Quick Verification

Run this in terminal to verify setup:
```powershell
node -e "require('dotenv').config({path: '.env.local'}); const key = process.env.REACT_APP_AI_API_KEY; console.log('✅ API Key:', key ? 'Configured' : 'Missing'); console.log('✅ Provider:', process.env.REACT_APP_AI_PROVIDER || 'openrouter');"
```

---

## 🎉 Success Indicators

✅ **Everything Working:**
- Chat responds instantly
- Short, helpful responses
- No duplicate messages
- Intent detection works
- Form auto-fills
- Routing suggestions appear

Your AI chatbot is ready! 🚀

