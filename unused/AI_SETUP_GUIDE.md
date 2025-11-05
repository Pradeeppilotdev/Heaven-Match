# 🚀 Single API Key Setup - Real-Time AI

## ✅ YES! You can use ONE API key for ALL AI features!

I've updated the code to use a **single API key** that works in **real-time** for all AI features.

---

## 🎯 Recommended: OpenRouter (Best for Real-Time)

**Why OpenRouter?**
- ✅ Single API key for all models
- ✅ Real-time responses (no cold starts)
- ✅ Pay-per-use (very affordable)
- ✅ Access to multiple models (GPT-4, Claude, Llama, etc.)
- ✅ Free tier available

### Setup Steps:

1. **Get API Key** (Free):
   - Visit: https://openrouter.ai/keys
   - Sign up (free)
   - Create API key
   - Copy your key

2. **Update .env.local**:
   ```bash
   REACT_APP_AI_PROVIDER=openrouter
   REACT_APP_AI_API_KEY=your_openrouter_key_here
   REACT_APP_AI_MODEL=meta-llama/llama-3.1-8b-instruct
   ```

3. **Restart Server**:
   ```powershell
   npm run dev
   ```

**That's it!** All AI features now work in real-time with one key.

---

## 🔄 Alternative Options

### Option 2: OpenAI (Direct)

```bash
REACT_APP_AI_PROVIDER=openai
REACT_APP_AI_API_KEY=your_openai_key_here
REACT_APP_AI_MODEL=gpt-3.5-turbo
```

### Option 3: Hugging Face (Current)

```bash
REACT_APP_AI_PROVIDER=huggingface
REACT_APP_AI_API_KEY=your_hf_token_here
REACT_APP_AI_MODEL=meta-llama/Meta-Llama-3-8B-Instruct
```

---

## 📊 What Works with Single Key

✅ **AI Chat** - Real-time conversations  
✅ **Intent Detection** - Instant classification  
✅ **Info Extraction** - Extract user details  
✅ **FAQ Answers** - Context-aware responses  
✅ **Smart Routing** - Channel recommendations  
✅ **Ticket Creation** - All AI features  

---

## 💰 Cost Comparison

### OpenRouter (Recommended)
- **Free tier**: $0.01 credit to start
- **Pay-per-use**: Very affordable
- **Example**: 1000 messages ≈ $0.10-0.50
- **Real-time**: ✅ No cold starts

### OpenAI
- **gpt-3.5-turbo**: $0.0015 per 1K tokens
- **Fast & reliable**: ✅
- **Real-time**: ✅

### Hugging Face
- **Free tier**: Limited
- **Cold starts**: ⚠️ First request can be slow
- **Rate limits**: ⚠️ Can be restrictive

---

## 🎯 Quick Start (Recommended)

1. **Get OpenRouter Key**: https://openrouter.ai/keys
2. **Update .env.local**:
   ```
   REACT_APP_AI_PROVIDER=openrouter
   REACT_APP_AI_API_KEY=sk-or-v1-xxxxx
   REACT_APP_AI_MODEL=meta-llama/llama-3.1-8b-instruct
   ```
3. **Restart**: `npm run dev`
4. **Done!** All features work in real-time! 🎉

---

## 🔧 Environment Variables

```bash
# AI Provider (openrouter, openai, or huggingface)
REACT_APP_AI_PROVIDER=openrouter

# Single API Key for ALL features
REACT_APP_AI_API_KEY=your_key_here

# Model to use
REACT_APP_AI_MODEL=meta-llama/llama-3.1-8b-instruct

# Optional: Your site URL (for OpenRouter)
REACT_APP_SITE_URL=http://localhost:3000
```

---

## ✨ Benefits

1. **One Key**: Single API key for everything
2. **Real-Time**: No cold starts, instant responses
3. **Affordable**: Pay only for what you use
4. **Flexible**: Easy to switch providers
5. **Production-Ready**: Reliable and fast

---

**Your Contact Page AI is now real-time with a single API key!** 🚀

