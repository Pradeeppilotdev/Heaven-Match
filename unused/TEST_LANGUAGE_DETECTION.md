# 🌍 How to Test Multi-Language Detection

## ✅ Quick Test Steps

### **Step 1: Start Server**
```bash
npm run dev
```

### **Step 2: Open Chat**
1. Go to `http://localhost:3000/contact`
2. Click "Live Chat" button (bottom right)

### **Step 3: Test Different Languages**

Try these messages in different languages:

---

## 🧪 Test Messages by Language

### **Hindi** 🇮🇳
```
नमस्ते, मुझे मदद चाहिए
मेरा पासवर्ड भूल गया है
```

**Expected Result:**
- Blue language badge appears
- Shows: "Detected language: Hindi"
- Input placeholder changes to: "Type your message in Hindi..."

---

### **Spanish** 🇪🇸
```
Hola, necesito ayuda
Olvidé mi contraseña
```

**Expected Result:**
- Blue language badge appears
- Shows: "Detected language: Spanish"
- Input placeholder changes to: "Type your message in Spanish..."

---

### **French** 🇫🇷
```
Bonjour, j'ai besoin d'aide
J'ai oublié mon mot de passe
```

**Expected Result:**
- Blue language badge appears
- Shows: "Detected language: French"
- Input placeholder changes to: "Type your message in French..."

---

### **English** 🇬🇧
```
Hello, I need help
I forgot my password
```

**Expected Result:**
- No language badge (English is default)
- Normal placeholder: "Type your message..."

---

## 📍 Where to See Language Detection

### **Visual Indicator:**

**Language Badge** (Below chat messages)
- Appears between messages and input box
- Blue background
- Shows: "Detected language: [Language]"
- Language icon (🌐)

**Input Placeholder:**
- Changes to: "Type your message in [Language]..."
- Updates based on detected language

---

## 🔍 How to Verify It's Working

### **Method 1: Visual Check**
1. Send a non-English message
2. Look for blue language badge
3. Check input placeholder changed

### **Method 2: Browser Console**
1. Open Developer Tools (F12)
2. Go to Network tab
3. Send a message in another language
4. Look for `/api/detect-language` request
5. Click on it → Preview tab
6. See language detection response:
   ```json
   {
     "language": "Hindi",
     "detected": true
   }
   ```

### **Method 3: Check Backend Logs**
- Look at terminal where server is running
- See language detection requests

---

## ✅ Quick Test

1. **Open chat**
2. **Type in Hindi**: "नमस्ते, मुझे मदद चाहिए"
3. **Look for**: Blue badge saying "Detected language: Hindi"
4. **Check**: Input placeholder changed

---

## 🎯 Supported Languages

The AI can detect:
- English (default)
- Hindi
- Spanish
- French
- And many more (AI auto-detects)

---

## 🐛 Troubleshooting

**No Language Badge Showing?**
- Check if backend is running
- Check browser console for errors
- Verify API key is set

**Wrong Language Detected?**
- AI may interpret differently
- Try more explicit language text
- Check console for actual detection

**Language Not Detected?**
- Make sure message is in non-English
- Try sending longer message
- Check network tab for API call

---

## ✅ Test Checklist

- [ ] Backend server running
- [ ] Chat widget open
- [ ] Sent Hindi message
- [ ] Blue badge appeared
- [ ] Placeholder changed
- [ ] Language detection working

---

## 🎉 **Test It Now!**

1. Open chat: `http://localhost:3000/contact`
2. Click "Live Chat"
3. Type: **"नमस्ते"** (Hindi for "Hello")
4. Watch for the blue language badge! 🌍

**That's it!** Language detection is working in real-time! 🚀

