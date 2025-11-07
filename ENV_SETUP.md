# Environment Variables Setup

This application requires Microsoft Azure AD (Azure Active Directory) configuration for authentication.

## Required Environment Variables

Create a `.env` file in the root directory (`Heaven-Match-adihome/heaven-match/`) with the following variables:

```env
# Microsoft Azure AD Configuration
REACT_APP_AAD_CLIENT_ID=your-azure-ad-client-id
REACT_APP_AAD_TENANT_ID=your-azure-ad-tenant-id
```

## How to Get These Values

### Step 1: Create an Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in:
   - **Name**: HeavenMatch (or your preferred name)
   - **Supported account types**: Choose based on your needs
     - **Accounts in this organizational directory only** (Single tenant)
     - **Accounts in any organizational directory** (Multi-tenant)
     - **Accounts in any organizational directory and personal Microsoft accounts** (Multi-tenant + personal)
   - **Redirect URI**: 
     - Platform: **Single-page application (SPA)**
     - URI: `http://localhost:3000` (for development)
5. Click **Register**

### Step 2: Get Your Client ID and Tenant ID

After registration, you'll see the **Overview** page:

1. **Application (client) ID**: Copy this value → `REACT_APP_AAD_CLIENT_ID`
2. **Directory (tenant) ID**: Copy this value → `REACT_APP_AAD_TENANT_ID`

### Step 3: Configure Redirect URIs

1. Go to **Authentication** in the left menu
2. Under **Single-page application**, add:
   - `http://localhost:3000` (development)
   - `https://your-production-domain.com` (production)
3. Click **Save**

### Step 4: Configure API Permissions (Optional)

1. Go to **API permissions**
2. Click **Add a permission**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Add:
   - `openid`
   - `profile`
   - `email`
   - `User.Read`
6. Click **Add permissions**

### Step 5: Update Your .env File

```env
REACT_APP_AAD_CLIENT_ID=12345678-1234-1234-1234-123456789abc
REACT_APP_AAD_TENANT_ID=87654321-4321-4321-4321-cba987654321
```

## Testing

After setting up your environment variables:

1. Restart your development server (`npm start`)
2. Navigate to `/initial-register`
3. Click "Continue with Microsoft"
4. You should be redirected to Microsoft's login page
5. After successful authentication, you'll be redirected back to the application

## Troubleshooting

### Error: "AADSTS50011: The redirect URI specified in the request does not match the redirect URIs configured"

- Make sure the redirect URI in Azure Portal matches exactly with `window.location.origin`
- For development, it should be `http://localhost:3000` (or your dev port)

### Error: "AADSTS7000215: Invalid client secret is provided"

- This error typically occurs if you're using client secrets (not needed for SPA)
- Make sure your app registration is configured as a **Single-page application (SPA)**

### Error: "AADSTS65001: The user or administrator has not consented"

- Go to Azure Portal > Your App Registration > **API permissions**
- Click **Grant admin consent** (if you're an admin)
- Or ensure the user consents during the login flow

## Production Deployment

For production:

1. Update redirect URIs in Azure Portal to include your production domain
2. Update `.env` file (or use your hosting platform's environment variable settings)
3. Ensure HTTPS is enabled (required for production)

