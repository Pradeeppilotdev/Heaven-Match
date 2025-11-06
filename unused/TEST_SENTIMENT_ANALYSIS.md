# 🎭 How to Test Sentiment Analysis

## ✅ Quick Test Guide

### **Step 1: Start Your Server**
```bash
npm run dev
```

### **Step 2: Open Contact Page**
1. Go to `http://localhost:3000/contact`
2. Click the "Live Chat" button (bottom right)

### **Step 3: Test Different Sentiments**

Try these messages to see sentiment analysis in action:

---

## 🧪 Test Messages by Sentiment

### **1. Frustrated/Negative Sentiment** 😠
Type these messages:
```
"I'm really frustrated with this!"
"This is so annoying!"
"I'm very upset about this issue"
"Nothing is working!"
```

**Expected Result:**
- 🟡 Yellow sentiment indicator appears
- Shows: "User seems frustrated - offering extra help"
- AI response starts with: "I understand this is frustrating..."
- AI tone is more empathetic

---

### **2. Urgent Sentiment** ⚡
Type these messages:
```
"This is urgent! I need help NOW!"
"Please help me immediately!"
"This is an emergency!"
"I need this fixed right away!"
```

**Expected Result:**
- 🔴 Red sentiment indicator appears
- Shows: "Urgent issue detected - prioritizing response"
- AI response starts with: "I see this is urgent..."
- Escalation offer may appear

---

### **3. Positive Sentiment** 😊
Type these messages:
```
"Thank you so much!"
"Great service!"
"I'm really happy with this"
"This is perfect!"
```

**Expected Result:**
- 🟢 Blue sentiment indicator (if visible)
- Shows: "User seems satisfied"
- AI response is warm and positive

---

### **4. Neutral Sentiment** 😐
Type these messages:
```
"Hello"
"What are your services?"
"Can you help me?"
"I have a question"
```

**Expected Result:**
- No sentiment indicator (neutral sentiment)
- Normal AI response
- Standard tone

---

## 📍 Where to See Sentiment Indicators

### **Visual Indicators:**

1. **Sentiment Badge** (Below chat messages)
   - Appears between messages and input box
   - Yellow = Frustrated/Negative
   - Red = Urgent
   - Blue = Positive
   - Shows icon + message

2. **AI Response Adjustments**
   - Frustrated: AI adds "I understand this is frustrating..."
   - Urgent: AI adds "I see this is urgent..."
   - Normal: Standard response

3. **Console Logs** (Developer Tools)
   - Open browser console (F12)
   - Look for sentiment data in network requests

---

## 🔍 How to Verify It's Working

### **Method 1: Visual Check**
1. Send a frustrated message
2. Look for yellow badge below chat
3. Check if AI response starts with empathetic phrase

### **Method 2: Browser Console**
1. Open Developer Tools (F12)
2. Go to Network tab
3. Send a message
4. Look for `/api/analyze-sentiment` request
5. Click on it → Preview tab
6. See sentiment JSON response:
   ```json
   {
     "sentiment": "frustrated",
     "emotion": "frustrated",
     "urgency": "high",
     "tone": "demanding"
   }
   ```

### **Method 3: Check Backend Logs**
1. Look at terminal where server is running
2. You'll see sentiment analysis requests
3. Check for any errors

---

## 🎯 Complete Test Flow

1. **Start chat** → AI greets you
2. **Send frustrated message**: "I'm really frustrated!"
3. **Check for:**
   - ⏱️ Typing indicator appears
   - 🟡 Yellow sentiment badge appears
   - 💬 AI response includes empathetic phrase
   - ✅ Response is tailored to sentiment

4. **Send urgent message**: "This is urgent!"
5. **Check for:**
   - 🔴 Red sentiment badge
   - ⚡ Urgency indicator
   - 🚨 Escalation offer (if needed)

6. **Send happy message**: "Thank you!"
7. **Check for:**
   - Positive sentiment detected
   - Warm AI response

---

## 🐛 Troubleshooting

### **No Sentiment Indicator Showing?**
- Check if backend is running: `npm run dev`
- Check browser console for errors
- Verify API key is set in `.env.local`

### **Sentiment Not Detected?**
- Try more explicit language ("frustrated", "angry", "urgent")
- Check network tab for `/api/analyze-sentiment` request
- Verify backend is responding

### **Wrong Sentiment?**
- AI may interpret differently
- Try more explicit emotional words
- Check console for actual sentiment value

---

## 📊 Expected Sentiment Values

The sentiment analysis returns:
- **sentiment**: "positive" | "neutral" | "negative" | "frustrated" | "urgent"
- **emotion**: "happy" | "calm" | "confused" | "frustrated" | "angry" | "worried"
- **urgency**: "low" | "medium" | "high"
- **tone**: "polite" | "neutral" | "informal" | "demanding"

---

## ✅ Quick Test Checklist

- [ ] Backend server running
- [ ] Chat widget open
- [ ] Sent frustrated message
- [ ] Yellow badge appeared
- [ ] AI response was empathetic
- [ ] Sent urgent message
- [ ] Red badge appeared
- [ ] Sentiment working correctly

---

## 🎉 **Test It Now!**

1. Open chat: `http://localhost:3000/contact`
2. Click "Live Chat" button
3. Type: **"I'm really frustrated with this!"**
4. Watch for the yellow sentiment badge! 🟡

**That's it!** The sentiment analysis is working in real-time! 🚀

