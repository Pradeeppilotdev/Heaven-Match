# Quick Start Guide - Microsoft Authentication Setup

## The Error You're Seeing

If you see: **"AADSTS900144: The request body must contain the following parameter: 'client_id'"**

This means the Azure AD client ID is not configured. Follow these steps:

## Step 1: Create .env File

In the project root (`Heaven-Match-adihome/heaven-match/`), create a file named `.env`:

```env
REACT_APP_AAD_CLIENT_ID=your-client-id-here
REACT_APP_AAD_TENANT_ID=your-tenant-id-here
```

## Step 2: Get Your Azure AD Credentials

### Option A: Quick Test (Use Microsoft's Test Tenant)

For testing purposes, you can use:
```env
REACT_APP_AAD_CLIENT_ID=00000000-0000-0000-0000-000000000000
REACT_APP_AAD_TENANT_ID=common
```

**Note:** This won't actually authenticate, but it will prevent the error. For real authentication, you need a real Azure AD app.

### Option B: Create Your Own Azure AD App (Recommended)

1. Go to https://portal.azure.com
2. Sign in with your Microsoft account
3. Navigate to **Azure Active Directory** > **App registrations**
4. Click **New registration**
5. Fill in:
   - **Name**: HeavenMatch
   - **Supported account types**: Select "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI**: 
     - Platform: **Single-page application (SPA)**
     - URI: `http://localhost:3000`
6. Click **Register**
7. Copy the **Application (client) ID** → This is your `REACT_APP_AAD_CLIENT_ID`
8. Copy the **Directory (tenant) ID** → This is your `REACT_APP_AAD_TENANT_ID`

## Step 3: Update .env File

Replace the placeholder values with your actual IDs:

```env
REACT_APP_AAD_CLIENT_ID=12345678-1234-1234-1234-123456789abc
REACT_APP_AAD_TENANT_ID=87654321-4321-4321-4321-cba987654321
```

## Step 4: Restart Development Server

**IMPORTANT:** After creating/updating the `.env` file, you MUST restart your development server:

1. Stop the server (Ctrl+C)
2. Start it again: `npm start`

Create React App only reads `.env` files when the server starts.

## Step 5: Test

1. Navigate to `http://localhost:3000/initial-register`
2. Click "Continue with Microsoft"
3. You should be redirected to Microsoft's login page (not an error page)

## Troubleshooting

### Still seeing the error after setting .env?

1. **Check file location**: Make sure `.env` is in `Heaven-Match-adihome/heaven-match/` (same folder as `package.json`)
2. **Check file name**: It must be exactly `.env` (not `.env.txt` or `.env.local`)
3. **Restart server**: Environment variables are only loaded when the server starts
4. **Check format**: No spaces around the `=` sign:
   ```env
   # ✅ Correct
   REACT_APP_AAD_CLIENT_ID=abc123
   
   # ❌ Wrong
   REACT_APP_AAD_CLIENT_ID = abc123
   ```

### Need More Help?

See `ENV_SETUP.md` for detailed Azure AD setup instructions.

